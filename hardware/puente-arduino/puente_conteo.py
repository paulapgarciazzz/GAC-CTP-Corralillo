"""
Puente USB/Serial -> API de Conteo (CTP Corralillo).

Lleva las detecciones del Arduino UNO + HC-SR04 (conectado por USB) a la API
de Laravel, incluida la publicada en Render por HTTPS. Existe porque el
ESP8266 con firmware AT 1.1 no puede negociar TLS con Render (sin SNI, sin
cifrados modernos ni validación de certificados).

    HC-SR04 -> Arduino (conteo_hcsr04.ino) -> USB -> este puente -> HTTPS -> API

Por cada línea igual a --linea (por defecto ENTRADA_DETECTADA) envía
POST /api/conteo/dispositivo/movimientos con X-Sensor-Codigo y el token
del sensor (Authorization: Bearer).

Seguridad:
- El token se lee SOLO de la variable de entorno CONTEO_SENSOR_TOKEN (la
  define iniciar_puente.ps1). Nunca por argumento, nunca en archivos del
  repositorio y nunca se imprime.
- Solo HTTPS con validación del certificado (lista de CA de certifi). HTTP sin
  cifrar se acepta únicamente hacia localhost (Docker de desarrollo).

Garantías:
- Cada detección recibe su identificador_evento al leerse del puerto y se
  guarda en pendientes.jsonl ANTES de enviarse. Se reintenta con el mismo
  identificador hasta que la API confirme (201 nuevo, 200 ya registrado), así
  que nunca se cuenta dos veces ni se pierde al cerrar el puente o perder red.
- La lectura del puerto y el envío van en hilos separados: un arranque en
  frío de Render (30-60 s) no frena la lectura ni hace descartar detecciones.
- Latido cada minuto: el panel muestra el sensor "En línea" y Render no se
  duerme.

Por defecto corre en MODO SIMULACIÓN (no envía nada). --enviar para el envío real.
"""

import argparse
import json
import os
import sys
import threading
import time
import uuid
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse

try:
    import serial
    from serial.tools import list_ports
except ImportError:
    print("Falta el paquete 'pyserial'. Instálalo con: pip install -r requirements.txt")
    sys.exit(1)

try:
    import requests
except ImportError:
    print("Falta el paquete 'requests'. Instálalo con: pip install -r requirements.txt")
    sys.exit(1)


VARIABLE_TOKEN = "CONTEO_SENSOR_TOKEN"
RUTA_MOVIMIENTOS = "/conteo/dispositivo/movimientos"
RUTA_LATIDO = "/conteo/dispositivo/latido"
RUTA_PING = "/ping"

# (conexión, respuesta): Render tarda 30-60 s en responder si estaba dormido.
TIMEOUT_HTTP = (10, 60)
ESPERA_MINIMA_REINTENTO_SEG = 2
ESPERA_MAXIMA_REINTENTO_SEG = 60
ESPERA_CREDENCIALES_SEG = 60
LATIDO_CADA_SEG = 60
ESPERA_RECONEXION_SERIAL_SEG = 3
ARCHIVO_PENDIENTES = Path(__file__).with_name("pendientes.jsonl")

# Fabricantes USB habituales de placas Arduino UNO y clones.
VID_ARDUINO = {0x2341, 0x2A03, 0x1A86, 0x0403, 0x10C4}

# Resultados de un envío.
EXITO = "exito"                # 201 nuevo o 200 duplicado
DESCARTAR = "descartar"        # 409/422: reintentar no lo arregla
CREDENCIALES = "credenciales"  # 401/403: se conserva hasta corregir el token
REINTENTAR = "reintentar"      # red, TLS, 429, 5xx o Render despertando

HOSTS_LOCALES = {"localhost", "127.0.0.1", "::1"}

# Errores de red/TLS que no deben cortar el puente. OSError cubre, por
# ejemplo, una lista de CA ilegible (requests no la envuelve).
ERRORES_RED = (requests.exceptions.RequestException, OSError)


def marca_tiempo() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def log(etiqueta: str, mensaje: str) -> None:
    print(f"[{marca_tiempo()}] [{etiqueta}] {mensaje}", flush=True)


def describir_error(error: Exception) -> str:
    """Mensaje corto de un error de requests (nunca incluye cabeceras ni token)."""
    if isinstance(error, requests.exceptions.SSLError):
        return "certificado TLS no válido o no verificable (la conexión se rechazó por seguridad)"
    if isinstance(error, requests.exceptions.ConnectTimeout):
        return "tiempo agotado al conectar (¿sin internet?)"
    if isinstance(error, requests.exceptions.ReadTimeout):
        return "el servidor no respondió a tiempo (¿Render despertando?)"
    if isinstance(error, requests.exceptions.ConnectionError):
        return "sin conexión con el servidor (red caída o DNS)"
    if isinstance(error, OSError) and not isinstance(error, requests.exceptions.RequestException):
        return "no se pudo cargar la lista de certificados de confianza (no se conecta sin validar)"
    return type(error).__name__


# =============================================================================
# Cliente HTTP
# =============================================================================

class ClienteConteo:
    def __init__(self, url_base: str, codigo: str, token: str):
        self.url_base = url_base.rstrip("/")
        self.sesion = requests.Session()
        # Validación explícita del certificado. requests usa la lista de CA de
        # certifi (o la de REQUESTS_CA_BUNDLE si está definida).
        self.sesion.verify = True
        self.sesion.headers.update({
            "Accept": "application/json",
            "X-Sensor-Codigo": codigo,
            "Authorization": f"Bearer {token}",
        })

    def latido(self) -> bool:
        try:
            respuesta = self.sesion.post(self.url_base + RUTA_LATIDO, timeout=TIMEOUT_HTTP)
        except ERRORES_RED as error:
            log("LATIDO", f"falló: {describir_error(error)}")
            return False

        if respuesta.status_code == 200:
            datos = respuesta.json().get("data", {})
            log("LATIDO", f"OK: {datos.get('codigo')} ({datos.get('tipo')}), hora del servidor {datos.get('hora_servidor')}")
            return True

        detalle = " (token o código incorrectos)" if respuesta.status_code == 401 else ""
        log("LATIDO", f"rechazado HTTP {respuesta.status_code}{detalle}")
        return False

    def enviar(self, identificador: str) -> str:
        try:
            respuesta = self.sesion.post(
                self.url_base + RUTA_MOVIMIENTOS,
                json={"identificador_evento": identificador},
                timeout=TIMEOUT_HTTP,
            )
        except ERRORES_RED as error:
            log("ERROR", f"{identificador}: {describir_error(error)}")
            return REINTENTAR

        codigo = respuesta.status_code

        if codigo == 201:
            datos = respuesta.json().get("data", {})
            log("REGISTRADO", f"{identificador} -> {datos.get('tipo')} a las {datos.get('ocurrido_en')}")
            return EXITO

        if codigo == 200:
            log("YA REGISTRADO", f"{identificador} ya estaba en la API (un envío anterior sí llegó); no se duplica.")
            return EXITO

        if codigo in (401, 403):
            log("CREDENCIALES", f"HTTP {codigo}: revisa el token y que el sensor esté activo. "
                                "El evento se conserva y se reintentará.")
            return CREDENCIALES

        if codigo in (409, 422):
            log("DESCARTADO", f"{identificador}: HTTP {codigo} {respuesta.text[:200]}")
            return DESCARTAR

        log("ERROR", f"{identificador}: HTTP {codigo}")
        return REINTENTAR


def probar_conexion(url_base: str) -> bool:
    """GET /ping sin token: comprueba DNS, TLS validado y que la API responda."""
    url = url_base.rstrip("/") + RUTA_PING
    inicio = time.monotonic()
    try:
        respuesta = requests.get(url, timeout=TIMEOUT_HTTP, verify=True)
    except ERRORES_RED as error:
        log("CONEXION", f"FALLÓ: {describir_error(error)}")
        return False
    segundos = time.monotonic() - inicio
    tls = "HTTPS con certificado válido" if url.startswith("https://") else "HTTP local"
    log("CONEXION", f"{tls}: HTTP {respuesta.status_code} en {segundos:.1f} s")
    return respuesta.status_code == 200


# =============================================================================
# Cola persistente
# =============================================================================

class ColaPersistente:
    """Eventos pendientes, en memoria y en pendientes.jsonl (sin secretos)."""

    def __init__(self, archivo: Path):
        self.archivo = archivo
        self.bloqueo = threading.Lock()
        self.eventos = self._leer()

    def _leer(self) -> list:
        if not self.archivo.exists():
            return []
        with self.archivo.open(encoding="utf-8") as archivo:
            return [json.loads(linea)["identificador_evento"] for linea in archivo if linea.strip()]

    def _guardar(self) -> None:
        if not self.eventos:
            self.archivo.unlink(missing_ok=True)
            return
        temporal = self.archivo.with_suffix(".tmp")
        with temporal.open("w", encoding="utf-8") as archivo:
            for identificador in self.eventos:
                archivo.write(json.dumps({"identificador_evento": identificador}) + "\n")
        os.replace(temporal, self.archivo)

    def agregar(self, identificador: str) -> int:
        with self.bloqueo:
            self.eventos.append(identificador)
            self._guardar()
            return len(self.eventos)

    def primero(self):
        with self.bloqueo:
            return self.eventos[0] if self.eventos else None

    def quitar(self, identificador: str) -> int:
        with self.bloqueo:
            if identificador in self.eventos:
                self.eventos.remove(identificador)
                self._guardar()
            return len(self.eventos)

    def cantidad(self) -> int:
        with self.bloqueo:
            return len(self.eventos)


# =============================================================================
# Envío (hilo de red)
# =============================================================================

class Enviador:
    def __init__(self, cliente: ClienteConteo, cola: ColaPersistente, detener: threading.Event):
        self.cliente = cliente
        self.cola = cola
        self.detener = detener
        self.espera_actual = 0.0
        self.ultimo_contacto = 0.0

    def _programar_reintento(self, minimo: float = 0) -> float:
        self.espera_actual = (ESPERA_MINIMA_REINTENTO_SEG if self.espera_actual == 0
                              else min(self.espera_actual * 2, ESPERA_MAXIMA_REINTENTO_SEG))
        return max(self.espera_actual, minimo)

    def ejecutar(self) -> None:
        while not self.detener.is_set():
            try:
                self._una_vuelta()
            except Exception as error:  # el hilo de envío nunca debe morir
                log("ERROR", f"inesperado en el envío ({type(error).__name__}); se reintenta en "
                             f"{ESPERA_MAXIMA_REINTENTO_SEG} s. Los eventos siguen guardados.")
                self.detener.wait(ESPERA_MAXIMA_REINTENTO_SEG)

    def _una_vuelta(self) -> None:
        identificador = self.cola.primero()

        if identificador is None:
            if time.monotonic() - self.ultimo_contacto >= LATIDO_CADA_SEG:
                self.ultimo_contacto = time.monotonic()
                self.cliente.latido()
            self.detener.wait(0.5)
            return

        resultado = self.cliente.enviar(identificador)

        if resultado in (EXITO, DESCARTAR):
            restantes = self.cola.quitar(identificador)
            self.espera_actual = 0
            self.ultimo_contacto = time.monotonic()
            if restantes:
                log("PENDIENTES", f"quedan {restantes} por enviar")
            return

        espera = self._programar_reintento(ESPERA_CREDENCIALES_SEG if resultado == CREDENCIALES else 0)
        log("REINTENTO", f"{self.cola.cantidad()} evento(s) en cola; próximo intento en {espera:.0f} s "
                         "(con el mismo identificador)")
        self.detener.wait(espera)


# =============================================================================
# Lectura del Arduino (hilo principal)
# =============================================================================

class LectorSerial:
    def __init__(self, args: argparse.Namespace, cola):
        self.args = args
        self.cola = cola  # None en modo simulación
        self.ultima_deteccion = 0.0
        self.secuencia = 0
        # Único por ejecución: los identificadores no se repiten al reiniciar.
        self.sesion = uuid.uuid4().hex[:8]

    def nuevo_identificador(self) -> str:
        self.secuencia += 1
        return f"{self.args.codigo}-{self.sesion}-{self.secuencia}"

    def procesar_linea(self, linea: str) -> None:
        if linea != self.args.linea:
            return

        ahora = time.monotonic()
        if ahora - self.ultima_deteccion < self.args.intervalo_minimo:
            log("DEBOUNCE", f"detección descartada (< {self.args.intervalo_minimo} s desde la anterior)")
            return
        self.ultima_deteccion = ahora

        identificador = self.nuevo_identificador()

        if self.cola is None:
            log("SIMULACION", f"detección -> {identificador} (no se envía)")
            return

        en_cola = self.cola.agregar(identificador)
        log("DETECCION", f"{identificador} (en cola: {en_cola})")

    def ejecutar(self) -> None:
        while True:
            try:
                with serial.Serial(self.args.puerto, self.args.baudios, timeout=1) as puerto_serial:
                    log("SERIAL", f"conectado a {self.args.puerto} ({self.args.baudios} baudios)")
                    while True:
                        bruto = puerto_serial.readline()
                        if not bruto:
                            continue
                        linea = bruto.decode("utf-8", errors="ignore").strip()
                        if linea:
                            if self.args.eco:
                                log("ARDUINO", linea)
                            self.procesar_linea(linea)
            except serial.SerialException as error:
                log("SERIAL", f"puerto no disponible: {error}")
                log("SERIAL", "¿Arduino desconectado o Monitor Serie del IDE abierto? "
                              f"Reintentando en {ESPERA_RECONEXION_SERIAL_SEG} s...")
                time.sleep(ESPERA_RECONEXION_SERIAL_SEG)


# =============================================================================

def detectar_puerto() -> str:
    candidatos = [p for p in list_ports.comports()
                  if (p.vid in VID_ARDUINO) or "arduino" in (p.description or "").lower()]
    if len(candidatos) == 1:
        return candidatos[0].device

    disponibles = ", ".join(f"{p.device} ({p.description})" for p in list_ports.comports()) or "ninguno"
    if not candidatos:
        print(f"No se encontró un Arduino conectado. Puertos disponibles: {disponibles}")
    else:
        print(f"Hay varios posibles Arduino: {disponibles}")
    print("Indica el puerto con --puerto COMx")
    sys.exit(1)


def validar_url(url: str) -> None:
    partes = urlparse(url)
    if partes.scheme == "https":
        return
    if partes.scheme == "http" and partes.hostname in HOSTS_LOCALES:
        return
    print(f"URL rechazada: {url}")
    print("El token solo se envía por HTTPS (o por HTTP a localhost, para el Docker de desarrollo).")
    sys.exit(1)


def analizar_argumentos() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Puente USB/Serial Arduino -> API de Conteo CTP Corralillo")
    parser.add_argument("--puerto", default="auto", help="Puerto serial, p. ej. COM3 (por defecto: detectar)")
    parser.add_argument("--baudios", type=int, default=9600, help="Velocidad en baudios (por defecto 9600)")
    parser.add_argument("--url", default="http://localhost:8000/api", help="URL base de la API")
    parser.add_argument("--codigo", default="ENTRADA-01", help="Código estable del sensor (por defecto ENTRADA-01)")
    parser.add_argument("--linea", default="ENTRADA_DETECTADA", help="Línea serial que cuenta como detección")
    parser.add_argument(
        "--intervalo-minimo", type=float, default=0.8, dest="intervalo_minimo",
        help="Segundos mínimos entre dos detecciones (por defecto 0.8)",
    )
    parser.add_argument("--eco", action="store_true", help="Muestra todas las líneas que imprime el Arduino")
    parser.add_argument("--enviar", action="store_true", help="Activa el envío real. Sin esto, modo simulación.")
    parser.add_argument(
        "--solo-latido", action="store_true", dest="solo_latido",
        help="Solo comprueba conexión y token (no abre el puerto serial ni registra movimientos)",
    )
    parser.add_argument(
        "--probar-conexion", action="store_true", dest="probar_conexion",
        help="Solo comprueba la API y el certificado TLS, SIN token (GET /ping)",
    )
    return parser.parse_args()


def main() -> None:
    args = analizar_argumentos()
    validar_url(args.url)

    if args.probar_conexion:
        sys.exit(0 if probar_conexion(args.url) else 1)

    token = os.environ.get(VARIABLE_TOKEN, "").strip()
    necesita_api = args.enviar or args.solo_latido
    if necesita_api and not token:
        print(f"Falta el token del sensor en la variable de entorno {VARIABLE_TOKEN}.")
        print("Usa iniciar_puente.cmd / iniciar_puente.ps1, que lo pide sin mostrarlo.")
        sys.exit(1)

    cliente = ClienteConteo(args.url, args.codigo, token) if necesita_api else None

    if args.solo_latido:
        sys.exit(0 if cliente.latido() else 1)

    if args.puerto == "auto":
        args.puerto = detectar_puerto()

    print("=== Puente de conteo CTP Corralillo ===")
    print(f"Puerto: {args.puerto}  Baudios: {args.baudios}  Sensor: {args.codigo}  Línea: {args.linea}")
    print(f"Modo: {'ENVÍO REAL (registra movimientos)' if cliente else 'SIMULACIÓN (no se envía nada)'}")
    print(f"API: {args.url}")
    print("Presiona Ctrl+C para detener. Los eventos sin enviar quedan guardados.\n")

    detener = threading.Event()
    cola = None

    if cliente:
        cola = ColaPersistente(ARCHIVO_PENDIENTES)
        if cola.cantidad():
            log("PENDIENTES", f"{cola.cantidad()} evento(s) de una ejecución anterior; se enviarán primero")
        log("LATIDO", "comprobando conexión y token (si Render estaba dormido puede tardar hasta 60 s)...")
        cliente.latido()
        enviador = Enviador(cliente, cola, detener)
        enviador.ultimo_contacto = time.monotonic()
        threading.Thread(target=enviador.ejecutar, name="enviador", daemon=True).start()

    try:
        LectorSerial(args, cola).ejecutar()
    except KeyboardInterrupt:
        detener.set()
        pendientes = cola.cantidad() if cola else 0
        log("FIN", f"detenido por el usuario. Pendientes guardados: {pendientes}")


if __name__ == "__main__":
    main()
