"""
Puente serial -> API de Conteo (CTP Corralillo). SOLO PARA EL PROTOTIPO.

El hardware definitivo es un ESP32 que envia los movimientos directamente
por WiFi (ver hardware/esp32-conteo). Este script sirve para probar el
flujo de extremo a extremo con el Arduino UNO + HC-SR04 conectado por USB.

Lee lineas del Arduino y, por cada linea igual a --linea (por defecto
ENTRADA_DETECTADA), envia un POST autenticado a
/api/conteo/dispositivo/movimientos.

Autenticacion: el sensor se identifica con su codigo estable (--codigo,
p. ej. ENTRADA-01) y su token, que se lee de la variable de entorno
CONTEO_SENSOR_TOKEN. El token nunca se pasa por argumento (quedaria en el
historial de la consola) ni se guarda en el repositorio.

Por defecto corre en MODO SIMULACION: imprime lo que enviaria sin llamar a
la API. Pasa --enviar para el envio real.

Garantias:
- Un identificador_evento por deteccion fisica, reutilizado en todos los
  reintentos. El backend responde 200 (duplicado) si ya lo tenia: se trata
  como exito, nunca como un movimiento nuevo.
- Debounce: detecciones a menos de --intervalo-minimo segundos de la
  anterior se descartan (el Arduino ya filtra, esto es una segunda red).
- Si la API no responde tras los reintentos, el evento se guarda en
  pendientes.jsonl y se reenvia (con el mismo identificador) en cuanto un
  envio vuelva a funcionar o al reiniciar el puente.
"""

import argparse
import json
import os
import sys
import time
import uuid
from datetime import datetime
from pathlib import Path

try:
    import serial
except ImportError:
    print("Falta el paquete 'pyserial'. Instalalo con: pip install -r requirements.txt")
    sys.exit(1)

try:
    import requests
except ImportError:
    print("Falta el paquete 'requests'. Instalalo con: pip install -r requirements.txt")
    sys.exit(1)


VARIABLE_TOKEN = "CONTEO_SENSOR_TOKEN"
RUTA_MOVIMIENTOS = "/conteo/dispositivo/movimientos"
RUTA_LATIDO = "/conteo/dispositivo/latido"
REINTENTOS_HTTP = 3
ESPERA_ENTRE_REINTENTOS_SEG = 1.5
TIMEOUT_HTTP_SEG = 5
ESPERA_RECONEXION_SEG = 3
ARCHIVO_PENDIENTES = Path(__file__).with_name("pendientes.jsonl")

# Resultados de un envio.
EXITO = "exito"            # 201 nuevo o 200 duplicado: no reintentar
DEFINITIVO = "definitivo"  # 401/403/409/422: reintentar no lo arregla
REINTENTAR = "reintentar"  # red caida, 429 o 5xx


def marca_tiempo() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def log(etiqueta: str, mensaje: str) -> None:
    print(f"[{marca_tiempo()}] [{etiqueta}] {mensaje}", flush=True)


class ClienteConteo:
    def __init__(self, url_base: str, codigo: str, token: str):
        self.url_base = url_base.rstrip("/")
        self.cabeceras = {
            "Accept": "application/json",
            "X-Sensor-Codigo": codigo,
            "Authorization": f"Bearer {token}",
        }

    def latido(self) -> bool:
        try:
            respuesta = requests.post(
                self.url_base + RUTA_LATIDO, headers=self.cabeceras, timeout=TIMEOUT_HTTP_SEG
            )
        except requests.exceptions.RequestException as error:
            log("LATIDO", f"sin conexion con la API: {error}")
            return False

        if respuesta.status_code == 200:
            datos = respuesta.json().get("data", {})
            log("LATIDO", f"OK: {datos.get('codigo')} ({datos.get('tipo')}), hora del servidor {datos.get('hora_servidor')}")
            return True

        log("LATIDO", f"rechazado {respuesta.status_code}: {respuesta.text[:200]}")
        return False

    def enviar_una_vez(self, identificador: str) -> str:
        try:
            respuesta = requests.post(
                self.url_base + RUTA_MOVIMIENTOS,
                headers=self.cabeceras,
                json={"identificador_evento": identificador},
                timeout=TIMEOUT_HTTP_SEG,
            )
        except requests.exceptions.RequestException as error:
            log("ERROR HTTP", f"{identificador}: {error}")
            return REINTENTAR

        if respuesta.status_code == 201:
            datos = respuesta.json().get("data", {})
            log("REGISTRADO", f"{identificador} -> {datos.get('tipo')} a las {datos.get('ocurrido_en')}")
            return EXITO

        if respuesta.status_code == 200:
            log("YA REGISTRADO", f"{identificador} ya estaba en la API (reintento de un envio que si llego); no se duplica.")
            return EXITO

        if respuesta.status_code in (401, 403, 409, 422):
            log("RECHAZADO", f"{identificador} {respuesta.status_code}: {respuesta.text[:300]}")
            return DEFINITIVO

        log("ERROR HTTP", f"{identificador} status {respuesta.status_code}: {respuesta.text[:300]}")
        return REINTENTAR

    def enviar(self, identificador: str) -> str:
        for intento in range(1, REINTENTOS_HTTP + 1):
            resultado = self.enviar_una_vez(identificador)
            if resultado != REINTENTAR:
                return resultado
            if intento < REINTENTOS_HTTP:
                time.sleep(ESPERA_ENTRE_REINTENTOS_SEG * intento)
        return REINTENTAR


def leer_pendientes() -> list:
    if not ARCHIVO_PENDIENTES.exists():
        return []
    with ARCHIVO_PENDIENTES.open(encoding="utf-8") as archivo:
        return [json.loads(linea)["identificador_evento"] for linea in archivo if linea.strip()]


def guardar_pendientes(identificadores: list) -> None:
    if not identificadores:
        ARCHIVO_PENDIENTES.unlink(missing_ok=True)
        return
    with ARCHIVO_PENDIENTES.open("w", encoding="utf-8") as archivo:
        for identificador in identificadores:
            archivo.write(json.dumps({"identificador_evento": identificador}) + "\n")


def reenviar_pendientes(cliente: ClienteConteo) -> None:
    pendientes = leer_pendientes()
    if not pendientes:
        return

    log("PENDIENTES", f"reenviando {len(pendientes)} evento(s) guardado(s)")
    restantes = []
    for indice, identificador in enumerate(pendientes):
        if cliente.enviar_una_vez(identificador) == REINTENTAR:
            restantes = pendientes[indice:]
            break
    guardar_pendientes(restantes)


class Puente:
    def __init__(self, args: argparse.Namespace, cliente):
        self.args = args
        self.cliente = cliente
        self.ultima_deteccion = 0.0
        self.secuencia = 0
        # Identificador de esta ejecucion: unico aunque se reinicie el puente.
        self.sesion = uuid.uuid4().hex[:8]

    def nuevo_identificador(self) -> str:
        self.secuencia += 1
        return f"{self.args.codigo}-{self.sesion}-{self.secuencia}"

    def procesar_linea(self, linea: str) -> None:
        if linea != self.args.linea:
            return

        ahora = time.monotonic()
        if ahora - self.ultima_deteccion < self.args.intervalo_minimo:
            log("DEBOUNCE", f"deteccion descartada (< {self.args.intervalo_minimo}s desde la anterior)")
            return
        self.ultima_deteccion = ahora

        identificador = self.nuevo_identificador()

        if self.cliente is None:
            log("SIMULACION", f"POST {self.args.url}{RUTA_MOVIMIENTOS} {{identificador_evento: {identificador}}}")
            return

        resultado = self.cliente.enviar(identificador)

        if resultado == REINTENTAR:
            guardar_pendientes(leer_pendientes() + [identificador])
            log("PENDIENTES", f"{identificador} guardado en {ARCHIVO_PENDIENTES.name}; se reenviara al recuperar la conexion")
        elif resultado == EXITO:
            reenviar_pendientes(self.cliente)

    def ejecutar(self) -> None:
        while True:
            try:
                with serial.Serial(self.args.puerto, self.args.baudios, timeout=1) as puerto_serial:
                    log("SERIAL", f"conectado a {self.args.puerto}")
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
                log("SERIAL", f"desconexion o puerto no disponible: {error}")
                log("SERIAL", f"reintentando abrir {self.args.puerto} en {ESPERA_RECONEXION_SEG}s...")
                time.sleep(ESPERA_RECONEXION_SEG)


def analizar_argumentos() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Puente serial Arduino -> API de Conteo CTP Corralillo (prototipo)")
    parser.add_argument("--puerto", default="COM3", help="Puerto serial (por defecto COM3)")
    parser.add_argument("--baudios", type=int, default=9600, help="Velocidad en baudios (por defecto 9600)")
    parser.add_argument("--url", default="http://localhost:8000/api", help="URL base de la API")
    parser.add_argument("--codigo", default="ENTRADA-01", help="Codigo estable del sensor (por defecto ENTRADA-01)")
    parser.add_argument("--linea", default="ENTRADA_DETECTADA", help="Linea serial que cuenta como deteccion")
    parser.add_argument(
        "--intervalo-minimo", type=float, default=0.8, dest="intervalo_minimo",
        help="Segundos minimos entre dos detecciones (por defecto 0.8)",
    )
    parser.add_argument("--eco", action="store_true", help="Muestra todas las lineas que imprime el Arduino")
    parser.add_argument("--enviar", action="store_true", help="Activa el envio real. Sin esto, modo simulacion.")
    parser.add_argument(
        "--solo-latido", action="store_true", dest="solo_latido",
        help="Solo comprueba conexion y credenciales (no abre el puerto serial ni registra movimientos)",
    )
    return parser.parse_args()


def main() -> None:
    args = analizar_argumentos()
    token = os.environ.get(VARIABLE_TOKEN, "").strip()

    necesita_api = args.enviar or args.solo_latido
    if necesita_api and not token:
        print(f"Falta el token del sensor. Definelo en la variable de entorno {VARIABLE_TOKEN}, p. ej. en PowerShell:")
        print(f'  $env:{VARIABLE_TOKEN} = "<token generado con php artisan conteo:token-sensor {args.codigo}>"')
        sys.exit(1)

    cliente = ClienteConteo(args.url, args.codigo, token) if necesita_api else None

    if args.solo_latido:
        sys.exit(0 if cliente.latido() else 1)

    print("=== Puente de conteo CTP Corralillo (prototipo) ===")
    print(f"Puerto: {args.puerto}  Baudios: {args.baudios}  Sensor: {args.codigo}  Linea: {args.linea}")
    print(f"Modo: {'ENVIO REAL (registra movimientos en la base de datos)' if cliente else 'SIMULACION (no se envia nada)'}")
    print(f"API: {args.url}")
    print("Presiona Ctrl+C para detener.\n")

    if cliente:
        if not cliente.latido():
            print("Aviso: el latido fallo. Revisa la URL, el token y que el backend este corriendo.")
        reenviar_pendientes(cliente)

    try:
        Puente(args, cliente).ejecutar()
    except KeyboardInterrupt:
        log("FIN", "detenido por el usuario")


if __name__ == "__main__":
    main()
