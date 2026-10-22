# Hardware del conteo de personas

| Carpeta | Qué es | Estado |
|---|---|---|
| `esp32-conteo/` | Firmware **definitivo**: ESP32 + sensores IR de entrada y salida, envío directo por WiFi | Hardware final |
| `arduino-uno-esp8266/` | UNO + HC-SR04 + módulo ESP8266 (AT): envío directo por WiFi, sin PC intermedia | Demostración |
| `arduino-uno-prototipo/` | Sketch del UNO + HC-SR04 que solo imprime por USB | Solo pruebas |
| `puente-arduino/` | Puente Python serial → API para el sketch anterior | Solo pruebas |

Ambos caminos usan la misma API autenticada:

| Ruta | Acceso | Uso |
|---|---|---|
| `POST /api/conteo/dispositivo/movimientos` | `X-Sensor-Codigo` + `Authorization: Bearer <token del sensor>` | Registrar una detección (`201` nueva, `200` reintento ya registrado) |
| `POST /api/conteo/dispositivo/latido` | Igual | Comprobar conexión y credenciales sin registrar nada |
| `GET /api/conteo/{ocupacion-actual,movimientos,sensores,reporte}` | Sesión del panel + permiso `conteo.ver` | Panel React |
| `GET /api/public/conteo/ocupacion` | Público, solo lectura | Contador de la landing (solo la ocupación) |

## Validación de extremo a extremo

Requisitos previos: los pasos del servidor de `esp32-conteo/README.md` §5
(migración, seeders, tokens, firewall), que **escriben en `proyecto_db`** y
requieren autorización.

1. **Sin credenciales no se registra nada** (desde PowerShell en la PC):

   ```powershell
   # Debe responder 401 "Credenciales de dispositivo inválidas."
   Invoke-WebRequest -Method Post -Uri http://localhost:8000/api/conteo/dispositivo/movimientos `
     -ContentType application/json -Body '{"identificador_evento":"prueba-sin-token"}' -SkipHttpErrorCheck
   ```

   (En Windows PowerShell 5.1 no existe `-SkipHttpErrorCheck`: el comando
   lanza un error que muestra el `401`; eso también es el resultado correcto.)

2. **Una detección produce exactamente un movimiento**: anota en el panel
   (*Conteo → Panel de conteo*) las entradas de hoy, haz **una** detección
   física y comprueba que suben exactamente en 1, con su hora, y que en el
   monitor serie aparece un solo `[REGISTRADO]`.
3. **Laravel lo almacena**: el movimiento aparece en *Últimos movimientos* con
   el sensor correcto (`Entrada principal` o `Salida principal`).
4. **React actualiza la ocupación**: sin recargar la página, en ≤ 5 s cambian
   las tarjetas; en la landing el contador cambia en ≤ 15 s.
5. **Entrada y salida independientes**: una detección en la salida aumenta
   *Salidas hoy* y baja la ocupación en 1.
6. **Reintentos sin duplicar**: prueba 8 de `esp32-conteo/README.md` (cortar
   la red, detectar, restablecer). Cada detección aparece una sola vez.
