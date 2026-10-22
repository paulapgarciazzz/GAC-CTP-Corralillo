# Puente Arduino → API de Conteo (solo prototipo)

Script en Python que lee el puerto serial del **Arduino UNO + HC-SR04** y
envía cada detección a la API con las mismas credenciales que usará el ESP32.
Sirve para probar el flujo completo (sensor → Laravel → panel React) antes de
tener el ESP32 instalado. **No es el hardware definitivo** (ver
`../esp32-conteo`).

```
HC-SR04 ── Arduino UNO ──USB/serial── puente_conteo.py ──HTTP── API ── panel React
```

## 1. Arduino

- Cableado HC-SR04: `VCC → 5V`, `GND → GND`, `TRIG → D9`, `ECHO → D10`.
- Sketch de referencia: `../arduino-uno-prototipo/conteo_hcsr04/conteo_hcsr04.ino`.
  Imprime `ENTRADA_DETECTADA` **una vez por paso**, con histéresis para no
  contar dos veces a la misma persona. Si usas tu propio sketch, debe imprimir
  exactamente esa línea (o la que indiques con `--linea`).
- Cierra el monitor serie del IDE antes de correr el puente: solo un programa
  a la vez puede abrir el puerto COM.

## 2. Instalación (PowerShell)

```powershell
cd hardware\puente-arduino
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## 3. Credenciales (nunca en el repositorio)

El puente se identifica como un sensor de la API: código estable
(`--codigo`, por defecto `ENTRADA-01`) y su token, que se lee **solo** de la
variable de entorno `CONTEO_SENSOR_TOKEN` de esa consola:

```powershell
$env:CONTEO_SENSOR_TOKEN = "<token de php artisan conteo:token-sensor ENTRADA-01>"
```

El token se genera en el servidor (ver `../esp32-conteo/README.md`, paso 5).
Si el ESP32 va a usar el mismo código de sensor, usa el mismo token, o genera
uno nuevo al pasar al ESP32 (el anterior deja de funcionar).

## 4. Uso

```powershell
# 4.1 Probar conexión y credenciales, sin Arduino y sin registrar movimientos
python puente_conteo.py --solo-latido

# 4.2 Simulación: lee el Arduino pero NO envía nada
python puente_conteo.py --puerto COM3 --eco

# 4.3 Envío real (registra movimientos en la base de datos)
python puente_conteo.py --puerto COM3 --enviar
```

| Parámetro | Por defecto | Descripción |
|---|---|---|
| `--puerto` | `COM3` | Puerto serial (ver *Herramientas → Puerto* en el IDE de Arduino) |
| `--baudios` | `9600` | Velocidad serial |
| `--url` | `http://localhost:8000/api` | URL base de la API |
| `--codigo` | `ENTRADA-01` | Código estable del sensor (p. ej. `SALIDA-01`) |
| `--linea` | `ENTRADA_DETECTADA` | Línea serial que cuenta como detección |
| `--intervalo-minimo` | `0.8` | Segundos mínimos entre dos detecciones (debounce) |
| `--eco` | — | Muestra todo lo que imprime el Arduino |
| `--enviar` | — | Activa el envío real (sin esto: simulación) |
| `--solo-latido` | — | Solo comprueba conexión y token |

Para probar la **salida** con un segundo Arduino, abre otra consola con el
token de `SALIDA-01`:
`python puente_conteo.py --puerto COM4 --codigo SALIDA-01 --enviar`
(la línea serial puede seguir siendo `ENTRADA_DETECTADA`: el tipo lo decide la
API según el código del sensor, no el texto).

## 5. Comportamiento ante errores

- **Arduino desconectado**: reintenta abrir el puerto cada 3 s.
- **Detecciones muy seguidas**: se descartan las que llegan antes de
  `--intervalo-minimo` (`[DEBOUNCE]`).
- **API caída o sin red**: 3 intentos con el mismo `identificador_evento`. Si
  fallan, el evento se guarda en `pendientes.jsonl` (ignorado por git) y se
  reenvía con su mismo identificador al siguiente envío exitoso o al
  reiniciar el puente.
- **Respuesta 200 "duplicado"**: un intento anterior sí llegó; se trata como
  éxito y no se cuenta dos veces.
- **401/403**: token o código incorrectos, o sensor inactivo. No se reintenta.
