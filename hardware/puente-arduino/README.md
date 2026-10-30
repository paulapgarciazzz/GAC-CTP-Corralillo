# Puente USB → API de Conteo (Render)

Lleva las detecciones del **Arduino UNO + HC-SR04**, conectado por USB a la
laptop, al backend publicado en Render por **HTTPS con validación del
certificado**:

```
HC-SR04 → Arduino UNO (conteo_hcsr04.ino) ──USB── puente_conteo.py ──HTTPS── Render (Laravel) → panel de conteo
```

Existe porque el ESP8266 con firmware AT 1.1 no puede conectarse a Render:
no envía SNI, no soporta los cifrados que Render exige ni valida
certificados. Es una solución **de desarrollo**; el ESP8266 no se usa en este
modo.

## Qué garantiza

- **Token seguro**: se pide sin mostrarlo, va solo como variable de entorno
  del proceso y nunca se imprime ni se escribe en el repositorio.
- **Solo HTTPS validado**: el puente rechaza `http://` (salvo `localhost`) y
  no tiene ninguna opción para desactivar la verificación del certificado.
- **Sin duplicados**: cada detección recibe un `identificador_evento` único al
  leerse (`ENTRADA-01-<sesión>-<n>`) y se reintenta siempre con el mismo. La
  API responde `200` si ya lo tenía y no lo cuenta dos veces.
- **Sin pérdidas**: cada detección se guarda en `pendientes.jsonl` antes de
  enviarse y se borra solo cuando Render confirma. Si se cierra el puente o se
  cae internet, se envía al volver.
- **Arranque en frío de Render**: espera hasta 60 s por respuesta y reintenta
  (2 s, 4 s … hasta 60 s). La lectura del Arduino sigue mientras tanto.
- **Latido cada minuto**: el panel muestra `ENTRADA-01` "En línea" y Render no
  se duerme.

## Preparación (una sola vez)

1. **Python 3.10+** instalado (python.org, marcando *Add python.exe to PATH*).
   El script crea el entorno `.venv` e instala las dependencias solo.
2. **Cargar el sketch USB en el UNO** con el IDE de Arduino:
   `hardware/arduino-uno-prototipo/conteo_hcsr04/conteo_hcsr04.ino`.
   - Detección: cuenta por debajo de 50 cm y libera por encima de 55 cm
     (histéresis de 5 cm, ajustada en las pruebas con el sensor), con 2/4
     lecturas seguidas y una medición cada 60 ms. El intervalo mínimo de
     0,8 s entre eventos lo aplica el puente.
   - Cableado del HC-SR04: `VCC → 5V`, `GND → GND`, `TRIG → D9`, `ECHO → D10`.
   - El módulo ESP8266 puede quedar conectado: este sketch no usa D2/D3.
   - Para volver al modo WiFi local, cargar de nuevo
     `hardware/arduino-uno-esp8266/conteo_uno_esp8266/conteo_uno_esp8266.ino`.
3. **Cerrar el Monitor Serie del IDE**: solo un programa puede usar el puerto.

## Uso diario

Desde el Explorador de Windows, doble clic en **`iniciar_puente.cmd`**, o en
PowerShell:

```powershell
cd hardware\puente-arduino
.\iniciar_puente.cmd
```

1. Pega el token de producción de `ENTRADA-01` cuando lo pida (no se muestra).
2. Si respondes `s`, se guarda en `%USERPROFILE%\.gac-conteo\ENTRADA-01.token`,
   **fuera del repositorio y de OneDrive**, solo legible por tu usuario. La
   próxima vez no lo pide.
3. Verás `[LATIDO] OK: ENTRADA-01 (entrada)` (la primera vez del día puede
   tardar hasta 60 s mientras Render despierta).
4. Cada paso frente al sensor muestra `[DETECCION]` y luego `[REGISTRADO]`.
5. **Ctrl+C** para detener. Lo que no se haya enviado queda guardado.

### Comandos útiles

| Comando | Para qué |
|---|---|
| `.\iniciar_puente.cmd -ProbarConexion` | Comprueba internet, Render y el certificado **sin token** |
| `.\iniciar_puente.cmd -SoloLatido` | Comprueba el token sin registrar movimientos |
| `.\iniciar_puente.cmd -Simulacion -Eco` | Lee el Arduino y muestra todo, sin enviar nada |
| `.\iniciar_puente.cmd -Puerto COM4` | Si no detecta el Arduino solo |
| `.\iniciar_puente.cmd -OlvidarToken` | Borra el token guardado (p. ej. si se regenera) |

## Mensajes

| Mensaje | Significado |
|---|---|
| `[CONEXION] HTTPS con certificado válido: HTTP 200` | Internet, Render y TLS correctos |
| `[LATIDO] OK` | Token válido; el panel muestra el sensor en línea |
| `[DETECCION] ENTRADA-01-...` | El Arduino detectó a alguien; quedó en cola |
| `[REGISTRADO]` | Render guardó el movimiento |
| `[YA REGISTRADO]` | Era un reintento de algo que ya había llegado; no se duplica |
| `[ERROR] ... ¿Render despertando?` / `[REINTENTO]` | Render dormido o sin internet; reintenta solo |
| `[CREDENCIALES] HTTP 401` | Token incorrecto o regenerado: `-OlvidarToken` y volver a pegarlo. Los eventos se conservan |
| `[CONEXION] FALLÓ: certificado TLS no válido` | La conexión no es segura (red que intercepta HTTPS, hora del PC muy desfasada): no se envía nada |
| `[SERIAL] puerto no disponible` | Arduino desconectado o Monitor Serie abierto; reintenta cada 3 s |
| `[DEBOUNCE]` | Dos detecciones a menos de 0,8 s: se cuenta una |

## Desarrollo local (Docker)

Para la API local en vez de Render:
`.\iniciar_puente.cmd -Url http://localhost:8000/api` con el token del
`proyecto_db` local. HTTP sin cifrar solo se acepta hacia `localhost`.
