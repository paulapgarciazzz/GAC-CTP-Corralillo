# Firmware ESP32 — Conteo de personas

Firmware definitivo del conteo institucional: un ESP32 lee los sensores
infrarrojos de la **entrada** y de la **salida**, y envía cada detección por
WiFi a la API de Laravel con credenciales propias de cada sensor.

```
Sensor IR (entrada) ─┐                         POST /api/conteo/dispositivo/movimientos
                     ├─ ESP32 ── WiFi ── API ── X-Sensor-Codigo + Authorization: Bearer
Sensor IR (salida) ──┘                         → movimiento_conteo → panel React (cada 5 s)
```

- **Identificación**: cada sensor usa su código estable (`ENTRADA-01`,
  `SALIDA-01`), nunca el id autoincremental de la base de datos.
- **Una persona = un evento**: debounce por sensor (ver más abajo).
- **Sin duplicados**: cada detección tiene un `identificador_evento` único que
  se repite en todos sus reintentos; la API responde `200` si ya lo tenía y no
  lo cuenta de nuevo.
- **Sin pérdidas por red**: los eventos esperan en una cola (100 por sensor)
  y se reintentan con espera creciente (1 s, 2 s, 4 s … hasta 30 s).
- **Reinicios**: el identificador incluye un contador de arranques guardado
  en flash y un número aleatorio, así nunca se repite tras un reinicio.
- **Estado en el panel**: latido cada minuto por sensor; el panel muestra
  "En línea" o "Sin señal".

> **Limitación conocida:** la cola vive en RAM. Si el ESP32 se queda sin
> alimentación con eventos sin enviar, esos eventos se pierden. Mientras haya
> eventos pendientes se ven en el monitor serie (comando `?`).

## 1. Hardware necesario

| Cantidad | Componente | Notas |
|---|---|---|
| 1 o 2 | ESP32 DevKit (ESP32-WROOM-32, "ESP32 Dev Module") | Uno por puerta es lo recomendado si las puertas están separadas: cables cortos, menos ruido. Con las puertas juntas basta uno para ambas. |
| 2 | Sensor infrarrojo de salida digital | Ver "Elegir el sensor". |
| 1 por ESP32 | Fuente USB 5 V ≥ 1 A + cable USB **de datos** | Muchos cables de carga no transmiten datos y la PC no detecta la placa. |
| — | Cables dupont; resistencias 10 kΩ y 20 kΩ (o 1 kΩ y 2 kΩ) | Solo si la salida del sensor es de 5 V (ver 2.2). |
| — | Multímetro | Para medir la salida del sensor **antes** de conectarlo al ESP32. |

### Elegir el sensor

| Sensor | Alcance | Alimentación | Comentario |
|---|---|---|---|
| Barrera IR emisor/receptor (break-beam) | Ancho de la puerta | 3.3–5 V | **La mejor opción para puertas**: cuenta cuando alguien corta el haz, sin depender del color de la ropa. |
| E18-D80NK (reflexivo, ajustable) | 3–80 cm | 5 V | Bueno si la puerta es estrecha o se monta a un lado del paso. Salida NPN: revisar 2.2. |
| FC-51 / módulos IR de obstáculo | 2–30 cm | 3.3–5 V | Solo para pruebas en mesa; muy poco alcance para una puerta. |

El firmware espera una **salida digital** que cambie de nivel al detectar.
Para la mayoría de estos módulos ese nivel es `LOW` (`NIVEL_DETECCION` en
`config.h`); el comando `?` del monitor serie lo confirma.

## 2. Cableado

### 2.1 Conexión

| Sensor | ESP32 |
|---|---|
| Sensor de ENTRADA – señal (OUT) | **GPIO 25** |
| Sensor de SALIDA – señal (OUT) | **GPIO 26** |
| VCC de los sensores | **3V3** si el sensor funciona a 3.3 V; **VIN/5V** si necesita 5 V (E18-D80NK) |
| GND de los sensores | **GND** (tierra común con el ESP32, obligatorio) |

- Pines válidos para sensores: 25, 26, 27, 32, 33. **No usar** 34–39 (no
  tienen pull-up interno) ni 0, 2, 12, 15 (afectan el arranque).
- El firmware activa el pull-up interno (`INPUT_PULLUP`). Con cables de más de
  ~2 m agrega una resistencia de 10 kΩ entre la señal y **3V3**.
- GPIO 2 (LED integrado) parpadea en cada detección.

### 2.2 ⚠️ Los pines del ESP32 aceptan como máximo 3.3 V

Antes de conectar la señal del sensor al ESP32:

1. Alimenta solo el sensor y mide con el multímetro el voltaje entre **OUT** y
   **GND**, con y sin un objeto delante.
2. Si en algún estado marca **más de 3.6 V** (típico: 5 V con sensores
   alimentados a 5 V que traen pull-up interno), usa un divisor de voltaje:

   ```
   OUT del sensor ──[10 kΩ]──┬── GPIO del ESP32
                             └──[20 kΩ]── GND
   ```

3. Si marca 0 V con un objeto delante y queda "al aire" (≈0 V o flotante) sin
   él, es colector abierto: puede ir directo al GPIO (el pull-up interno lo
   lleva a 3.3 V).

Conectar 5 V directo a un GPIO puede dañar el ESP32.

### 2.3 Montaje en la puerta

- Altura recomendada: ~1 m (cintura). Así cuenta torsos y no piernas: una
  persona caminando no genera dos cortes.
- Para barreras: emisor y receptor enfrentados y alineados a ambos lados del
  marco.
- La entrada y la salida son puertas distintas; cada sensor solo ve su puerta.

## 3. Instalación del software (Windows)

1. Instala **Arduino IDE 2** (arduino.cc).
2. *Archivo → Preferencias → URLs adicionales del gestor de placas*:
   `https://espressif.github.io/arduino-esp32/package_esp32_index.json`
3. *Herramientas → Placa → Gestor de placas*: busca **esp32** (Espressif
   Systems) e instala la versión 3.x.
4. Conecta el ESP32 por USB. Si Windows no muestra un puerto COM nuevo
   (*Administrador de dispositivos → Puertos*), instala el driver del chip USB
   de tu placa: **CP210x** (Silicon Labs) o **CH340** (WCH).
5. **No se necesitan librerías externas**: `WiFi`, `HTTPClient`,
   `WiFiClientSecure` y `Preferences` vienen con el núcleo ESP32.

## 4. Configuración (sin secretos en el repositorio)

1. Copia `esp32_conteo/config.example.h` como `esp32_conteo/config.h`.
   `config.h` está en `.gitignore` y **nunca** debe subirse.
2. Completa en `config.h`:
   - `WIFI_SSID` y `WIFI_PASSWORD`. El ESP32 solo usa **WiFi de 2.4 GHz** con
     WPA/WPA2 personal. No funciona con redes de 5 GHz, con portal cautivo
     (página de inicio de sesión) ni con WPA2-Enterprise (usuario +
     contraseña). Para la prueba de hoy sirve un hotspot del celular en 2.4 GHz.
   - `API_BASE_URL`: `http://<IP de la PC con Docker>:8000/api`. La IP sale de
     `ipconfig` → "Dirección IPv4". La PC y el ESP32 deben estar en la misma red.
   - En `SENSORES`, el token de cada sensor (paso 5.3). Si el ESP32 maneja una
     sola puerta, deja solo la línea de ese sensor.
3. Abre `esp32_conteo/esp32_conteo.ino` en el IDE, elige la placa
   **ESP32 Dev Module** y el puerto COM, y presiona **Subir**. Si se queda en
   `Connecting....`, mantén presionado el botón **BOOT** de la placa hasta que
   empiece a escribir.

## 5. Preparar el servidor (requiere autorización: escribe en `proyecto_db`)

Estos pasos modifican la base de datos real. Ejecútalos solo con autorización,
desde la raíz del repositorio, con Docker levantado (`docker compose up -d`).

```powershell
# 5.1 Columnas de credenciales y última señal (solo agrega columnas e índice)
docker compose run --rm --no-deps --entrypoint "" app php artisan migrate --force

# 5.2 Permisos conteo.* y sensores ENTRADA-01 / SALIDA-01 (idempotentes)
docker compose run --rm --no-deps --entrypoint "" app php artisan db:seed --class=PermisosSeeder --force
docker compose run --rm --no-deps --entrypoint "" app php artisan db:seed --class=SensorConteoSeeder --force

# 5.3 Un token por sensor. Se muestra UNA sola vez: cópialo a config.h
docker compose run --rm --no-deps --entrypoint "" app php artisan conteo:token-sensor ENTRADA-01
docker compose run --rm --no-deps --entrypoint "" app php artisan conteo:token-sensor SALIDA-01
```

### 5.4 Permitir que el ESP32 llegue a la PC (solo red local)

El ESP32 entra por el puerto 8000 de la PC. En PowerShell **como administrador**,
abre el puerto solo para redes privadas y solo para la subred local:

```powershell
New-NetFirewallRule -DisplayName "GAC conteo (LAN) 8000" -Direction Inbound -Protocol TCP -LocalPort 8000 -Profile Private -RemoteAddress LocalSubnet -Action Allow
```

- La red WiFi debe estar marcada como **Privada** en Windows.
- **No** configures redirección de puertos en el router ni expongas el puerto
  8000 a internet. Para producción: servidor con HTTPS y `API_CA_CERT`.
- Para quitar la regla después: `Remove-NetFirewallRule -DisplayName "GAC conteo (LAN) 8000"`.

## 6. Pruebas por componente

Monitor serie a **115200** baudios. Comandos: `?` estado, `0`/`1` simular
detección del sensor 0/1, `l` latido inmediato.

| # | Qué se prueba | Cómo | Resultado esperado |
|---|---|---|---|
| 1 | Placa y firmware | Subir el sketch, abrir el monitor serie | `=== Conteo de personas CTP Corralillo (ESP32) ===` y un `Sensor N: ...` por sensor |
| 2 | WiFi | Esperar unos segundos | `[WIFI] conectado a <red>, IP ...` |
| 3 | Llegada a la API y credenciales | Automático al conectar, o comando `l` | `[LATIDO] ENTRADA-01 OK: {...}`. En el panel el sensor pasa a **En línea** |
| 4 | Lectura del pin | `?` con y sin objeto delante del sensor | El pin pasa de `libre` a `DETECTANDO`. Si está al revés, cambia `NIVEL_DETECCION` |
| 5 | Envío sin sensor físico | Comando `0` | `[DETECCION] ... (simulada)` y luego `[REGISTRADO] ENTRADA-01 ...` |
| 6 | Detección física | Pasar la mano o caminar frente al sensor | **Un** `[DETECCION]` y **un** `[REGISTRADO]` por paso |
| 7 | Debounce | Agitar la mano rápido frente al sensor | Aparecen `[DEBOUNCE] ... descartada`; no se registra un evento por cada movimiento |
| 8 | Corte de red | Apagar el WiFi o detener Docker, hacer 3 detecciones, restablecer | `[REINTENTO]` mientras no hay red; al volver, `[REGISTRADO]` de los 3 con sus mismos identificadores |
| 9 | Credenciales malas | Cambiar un carácter del token en `config.h` y subir | `[CREDENCIALES] ... HTTP 401`; no aparece ningún movimiento en el panel |

Diagnóstico de `[LATIDO] ... falló: -1` (sin respuesta): la IP de
`API_BASE_URL` es incorrecta, Docker no está corriendo, la regla del firewall
falta o la PC y el ESP32 están en redes distintas. Desde otro dispositivo en la
misma red, `http://<IP>:8000/api/ping` debe responder.
