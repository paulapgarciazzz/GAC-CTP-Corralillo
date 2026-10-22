# Contador UNO + HC-SR04 + ESP8266 (WiFi directo, sin Python)

Demostración del conteo con el hardware disponible: el Arduino UNO mide con
el HC-SR04 y envía cada detección **directamente a Laravel por WiFi**
mediante el módulo OPEN-SMART Serial WiFi (ESP8266 con firmware AT).

```
HC-SR04 ── Arduino UNO ──SoftwareSerial 9600── ESP8266 ──WiFi── PC (Docker :8000) ── Laravel ── panel React
```

El hardware definitivo sigue siendo ESP32 + sensores IR (`../esp32-conteo`).
La API es la misma: código estable del sensor + token.

## 1. Lo que espera la API

```
POST /api/conteo/dispositivo/movimientos HTTP/1.1
Host: 192.168.100.172:8000
Content-Type: application/json
Accept: application/json
X-Sensor-Codigo: ENTRADA-01
Authorization: Bearer <token del sensor>
Content-Length: <n>
Connection: close

{"identificador_evento":"ENTRADA-01-<arranque>-<aleatorio>-<secuencia>"}
```

| Respuesta | Significado | El sketch |
|---|---|---|
| `201` | Movimiento nuevo registrado | Lo saca de la cola |
| `200` | Ese identificador ya estaba (reintento de un envío que sí llegó) | Lo saca de la cola, **no** cuenta dos veces |
| `401` | Falta el token, es incorrecto o el código no existe | Reintenta cada 30 s; revisar `config.h` |
| `403` | Sensor inactivo | Igual que 401 |
| `409` / `422` | Identificador de otro sensor / formato inválido | Lo descarta |
| `429` / `5xx` / sin respuesta | Límite de peticiones, error o red caída | Reintenta con el mismo identificador (2 s … 30 s) |

`POST /api/conteo/dispositivo/latido` (cuerpo `{}`) comprueba red y token sin
registrar movimientos.

## 2. Laravel y Docker para que el ESP8266 llegue a la API

Datos de esta PC (revisados el 22/10): IP **192.168.100.172/24** por
Ethernet, misma subred que el ESP8266 (192.168.100.147).

**Laravel no necesita cambios de configuración** para el dispositivo:
- Las rutas del dispositivo no usan sesión ni CSRF. Sanctum solo trata como
  "frontend" las peticiones con `Origin`/`Referer` de `SANCTUM_STATEFUL_DOMAINS`,
  y el ESP8266 no envía esas cabeceras.
- nginx no filtra por `Host` (no hay `server_name`) y pasa `Authorization` a PHP.
- `APP_URL` no interviene.

**Pasos (en orden):**

1. **Levantar el stack** (hoy solo corre la base de datos):
   `docker compose up -d`. nginx publica el puerto 8000 en todas las
   interfaces (`8000:80`). Comprobación desde el celular en la misma red:
   `http://192.168.100.172:8000/api/ping`.
2. **Base de datos (requiere autorización, escribe en `proyecto_db`)**:
   migración, `PermisosSeeder`, `SensorConteoSeeder` y token de `ENTRADA-01`.
   Comandos en `../esp32-conteo/README.md` §5.1 a §5.3. El token se muestra una
   sola vez: cópialo a `config.h`.
3. **Firewall**: Docker Desktop ya creó reglas que permiten
   `com.docker.backend.exe` en **todos los puertos TCP desde cualquier
   dirección** del perfil **Público** (el de esta red). El 8000 ya es
   alcanzable sin crear reglas, pero también lo son el 5173 y el **3306 de
   MariaDB**. Ver §6, Seguridad.

## 3. Cableado

| De | A | Nota |
|---|---|---|
| HC-SR04 VCC | UNO **5V** | |
| HC-SR04 GND | UNO **GND** | |
| HC-SR04 TRIG | UNO **D9** | |
| HC-SR04 ECHO | UNO **D10** | Señal de 5 V: correcta para el UNO |
| Módulo WiFi **TXD** | UNO **D2** (RX de SoftwareSerial) | El UNO lee 3.3 V como ALTO (umbral ≈ 3 V) |
| Módulo WiFi **RXD** | UNO **D3** (TX de SoftwareSerial) | **Ver 3.1 antes de dejarlo fijo** |
| Módulo WiFi **VCC** | UNO **5V** | Solo si el módulo trae regulador de 3.3 V (ver 3.1) |
| Módulo WiFi **GND** | UNO **GND** | Tierra común obligatoria |

D2 y D3 coinciden con lo que ya probaron. No usar D0/D1 (los usa el USB del
Monitor Serie).

### 3.1 Comprobar los niveles lógicos del módulo OPEN-SMART

El chip ESP8266 funciona a **3.3 V** y su pin RX **no tolera 5 V**. Los
adaptadores de este tipo suelen traer un regulador de 3.3 V y un adaptador de
niveles para usarse con placas de 5 V, pero no encontré el esquema publicado
de esta revisión (OPEN-SMART Serial WiFi v1.0). Hay que verificarlo en la placa:

1. **Mirar la placa**: un regulador (componente de 3 patas, p. ej.
   `AMS1117-3.3`, o SOT-23 marcado `662K`) y, junto a RXD, transistores
   pequeños (SOT-23 marcados `702`, `J1Y` o `BSS138`) con resistencias indican
   que tiene regulador y adaptador de niveles.
2. **Medir con el multímetro**, con el módulo alimentado a 5 V y **sin**
   conectar TXD/RXD al Arduino:
   - Salida del regulador / VCC del ESP8266: **≈ 3.3 V**. Si mide 5 V, el
     módulo no tiene regulador: no alimentarlo con 5 V.
   - Pin **RXD** del módulo respecto a GND:
     - **≈ 5 V** → la entrada está adaptada a 5 V: **D3 directo** es correcto.
     - **≈ 3.3 V o 0 V** → probablemente va directo al ESP8266: usar divisor.
3. **Divisor en D3** (si el paso 2 no es concluyente, úsalo igual: funciona
   en los dos casos):

   ```
   UNO D3 ──[1 kΩ]──┬── RXD del módulo
                    └──[2 kΩ]── GND        (≈ 3.3 V en RXD)
   ```

   Con 1 kΩ + 2 kΩ el flanco sigue siendo rápido para 9600 baudios.

Que la comunicación AT ya funcione no prueba que el nivel sea seguro: un
ESP8266 puede responder un tiempo con 5 V en RX y dañarse después.

**Alimentación**: el ESP8266 consume picos de ~300 mA al transmitir. El pin
5V del UNO alimentado por USB lo soporta; el pin **3.3V del UNO no**
(~50 mA): si el módulo se reinicia o responde `busy`/basura al transmitir,
es falta de corriente.

## 4. Configuración e instalación

1. Copia `conteo_uno_esp8266/config.example.h` como
   `conteo_uno_esp8266/config.h` (está en `.gitignore`) y completa:
   - `API_HOST "192.168.100.172"` y `API_PORT 8000`.
   - `SENSOR_CODIGO "ENTRADA-01"` y `SENSOR_TOKEN` con el token generado.
   - `WIFI_SSID` / `WIFI_PASSWORD`: déjalos vacíos para usar la red que el
     ESP8266 ya tiene guardada.
2. **El ESP8266 debe estar a 9600 baudios** (ya lo está). Si alguna vez vuelve
   a 115200: `AT+UART_DEF=9600,8,1,0,0`.
3. Arduino IDE → placa **Arduino Uno** → Subir. No se necesitan librerías
   externas (`SoftwareSerial` y `EEPROM` vienen con el núcleo AVR).
4. Monitor Serie a **115200** baudios, final de línea **Nueva línea**.

Uso de memoria (compilado): 10,7 KB de 32 KB de flash y 421 bytes de 2 KB de
RAM. Los textos fijos y el token van en flash (`PROGMEM`); la petición HTTP no
se guarda entera en RAM: se genera dos veces, una para medir su largo
(`AT+CIPSEND`) y otra para enviarla.

## 5. Pruebas paso a paso

Comandos del Monitor Serie: `p` envío manual · `l` latido · `?` estado ·
`d` distancias · `e` eco del ESP8266 · cualquier línea que empiece con `AT`
se reenvía al módulo.

| # | Prueba | Cómo | Resultado esperado |
|---|---|---|---|
| 1 | Arranque | Abrir el Monitor Serie | `=== Contador CTP Corralillo ...` y `[ESP8266] listo` |
| 2 | WiFi | `?` (o `AT+CIFSR`) | `CIPSTATUS=2` o `3` (con IP). `AT+CIFSR` muestra `192.168.100.147` |
| 3 | Llegar a la API | `l` | `[LATIDO] OK`. Con `401`: la API responde, pero el token o el código no; con `-1`: no llega (IP, Docker o firewall) |
| 4 | **Envío manual** | `p` | `[DETECCION] (manual) ENTRADA-01-...` y luego `[REGISTRADO] ...`. En el panel *Entradas hoy* sube en 1 |
| 5 | Calibrar | `d` y acercar/alejar la mano | Ver la distancia en cm; ajustar `UMBRAL_CM` (por defecto 50) |
| 6 | **Detección real** | `d` para apagar distancias; pasar frente al sensor | **Un** `[DETECCION] (sensor)` y **un** `[REGISTRADO]` por paso |
| 7 | Sin duplicar | Quedarse quieto frente al sensor varios segundos | Un solo evento hasta alejarse |
| 8 | Reintentos | Detener nginx (`docker compose stop webserver`), hacer `p`, volver a levantarlo | `[REINTENTO] ...`; al volver, `[REGISTRADO]` con **el mismo** identificador |
| 9 | Sin credenciales | Ver §6 de `../README.md` (paso 1) | `401` y ningún movimiento nuevo |

Si un resultado no coincide, `e` muestra todo lo que responde el ESP8266.

## 6. Seguridad (pendiente de decisión)

- **MariaDB está publicada en `0.0.0.0:3306`** y la regla de Docker permite
  cualquier puerto desde la red Pública: cualquier equipo de la red puede
  intentar conectarse a `proyecto_db` con las credenciales de
  `docker-compose.yml`. Propuesta: publicar la base solo en la PC
  (`"127.0.0.1:3306:3306"`). Requiere recrear el contenedor `db`; los datos
  se conservan en el volumen `db_data`.
- Marcar la red de la PC como **Privada** y limitar la regla de Docker a
  `Private` + `LocalSubnet`, o bloquear explícitamente 3306 y 5173 desde la
  red.
- El tráfico va por HTTP en texto plano dentro de la red local: el token
  viaja sin cifrar. Aceptable para la demostración en una red de confianza;
  **no** exponer el puerto 8000 a internet. En producción: HTTPS (ESP32).
- Tras la demostración, regenerar el token de `ENTRADA-01` si la red no era de
  confianza.
