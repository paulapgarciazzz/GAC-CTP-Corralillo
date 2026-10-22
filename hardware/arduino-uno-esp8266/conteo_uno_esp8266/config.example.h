#pragma once

// =============================================================================
// PLANTILLA — copiar como config.h y completar.
//   config.h está en .gitignore: nunca subir el token ni la contraseña WiFi.
// =============================================================================

// --- WiFi --------------------------------------------------------------------
// Vacío = usar la red que el ESP8266 ya tiene guardada (AT+CWJAP ya hecho).
// Si se completa, el sketch se conecta a esta red cuando el módulo no tiene IP.
#define WIFI_SSID     ""
#define WIFI_PASSWORD ""

// --- API ---------------------------------------------------------------------
// IP de la PC que corre Docker (ipconfig -> Dirección IPv4), en la misma red
// que el ESP8266. Nunca "localhost".
#define API_HOST "192.168.100.172"
#define API_PORT 8000

// --- Sensor ------------------------------------------------------------------
// Código estable registrado en la API y su token:
//   php artisan conteo:token-sensor ENTRADA-01
#define SENSOR_CODIGO "ENTRADA-01"
#define SENSOR_TOKEN  "PEGAR_AQUI_EL_TOKEN_DE_ENTRADA-01"

// --- Pines -------------------------------------------------------------------
#define PIN_ESP_RX 2      // el Arduino RECIBE por D2  <- TX del módulo WiFi
#define PIN_ESP_TX 3      // el Arduino ENVÍA por D3   -> RX del módulo WiFi
#define ESP_BAUDIOS 9600  // SoftwareSerial no es fiable por encima de 9600 en el UNO

#define PIN_TRIG 9
#define PIN_ECHO 10

// --- Detección (HC-SR04) -----------------------------------------------------
// Cuenta cuando hay algo a menos de UMBRAL_CM durante LECTURAS_PARA_DETECTAR
// lecturas seguidas; no vuelve a contar hasta que la distancia supere
// UMBRAL_CM + HISTERESIS_CM durante LECTURAS_PARA_LIBERAR lecturas.
#define UMBRAL_CM              50
#define HISTERESIS_CM          15
#define LECTURAS_PARA_DETECTAR 2
#define LECTURAS_PARA_LIBERAR  4
#define INTERVALO_MINIMO_MS    800UL   // nunca dos eventos a menos de esto

// --- Red ---------------------------------------------------------------------
// Latido para que el panel muestre el sensor "En línea" (marca "Sin señal"
// tras 3 min). 0 = desactivado. Cada latido pausa el sensor ~1-2 s.
#define LATIDO_CADA_MS 60000UL
