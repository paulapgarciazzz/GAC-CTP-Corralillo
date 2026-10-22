#pragma once

// =============================================================================
// PLANTILLA DE CONFIGURACIÓN — copiar como config.h y completar.
//
//   config.h está en .gitignore: NUNCA subir la contraseña WiFi ni los tokens.
//   Este archivo (config.example.h) sí se sube y solo lleva valores de ejemplo.
// =============================================================================

#include "tipos.h"

// --- WiFi --------------------------------------------------------------------
#define WIFI_SSID     "NOMBRE_DE_LA_RED"
#define WIFI_PASSWORD "CONTRASENA_DE_LA_RED"

// --- API ---------------------------------------------------------------------
// URL base de la API, sin barra final.
//  - Prueba en red local: IP de la PC que corre Docker, puerto 8000.
//    (en la PC: ipconfig -> "Dirección IPv4"). Nunca "localhost": para el
//    ESP32, localhost es el propio ESP32.
//  - Producción: https://<dominio>/api y API_CA_CERT con el certificado raíz.
#define API_BASE_URL "http://192.168.1.50:8000/api"

// Certificado raíz (PEM) del servidor, solo si API_BASE_URL usa https://.
// Vacío + https = el firmware se niega a enviar (no se desactiva la
// verificación TLS en silencio).
static const char API_CA_CERT[] = "";
// static const char API_CA_CERT[] = R"PEM(
// -----BEGIN CERTIFICATE-----
// ...
// -----END CERTIFICATE-----
// )PEM";

// --- Sensores ----------------------------------------------------------------
// Uno o dos sensores por ESP32. Cada uno con el código registrado en la API y
// el token que imprime: php artisan conteo:token-sensor <CODIGO>
//
// Pines recomendados: GPIO 25, 26, 27, 32, 33 (entrada con pull-up interno y
// sin función de arranque). No usar 34-39 (sin pull-up) ni 0, 2, 12, 15.
//
//  - Un ESP32 por puerta: dejar solo la línea de ese sensor.
//  - Un ESP32 para ambas puertas: dejar las dos líneas.
static const SensorConfig SENSORES[] = {
  { 25, "ENTRADA-01", "PEGAR_AQUI_EL_TOKEN_DE_ENTRADA-01" },
  { 26, "SALIDA-01",  "PEGAR_AQUI_EL_TOKEN_DE_SALIDA-01" },
};

// Nivel que entrega el sensor cuando DETECTA (haz cortado u objeto delante).
// E18-D80NK, FC-51 y la mayoría de barreras IR con salida de colector abierto:
// LOW. Comprobar con el monitor serie (comando "?") antes de instalar.
#define NIVEL_DETECCION LOW

// --- Debounce (milisegundos) -------------------------------------------------
// Una persona cuenta una sola vez: la detección debe durar al menos
// DEBOUNCE_ACTIVO_MS; para volver a contar, el sensor debe quedar libre al
// menos DEBOUNCE_LIBRE_MS; y nunca se cuentan dos eventos del mismo sensor a
// menos de INTERVALO_MINIMO_MS.
#define DEBOUNCE_ACTIVO_MS   40
#define DEBOUNCE_LIBRE_MS    250
#define INTERVALO_MINIMO_MS  700

// --- Red ---------------------------------------------------------------------
#define LATIDO_CADA_MS       60000   // el panel marca "Sin señal" tras 3 min
#define HTTP_TIMEOUT_MS      5000
#define REINTENTO_MAXIMO_MS  30000   // espera máxima entre reintentos
#define TAMANO_COLA          100     // eventos pendientes por sensor (en RAM)

// LED que parpadea en cada detección (GPIO 2 = LED integrado en la mayoría de
// placas DevKit). -1 para desactivarlo.
#define LED_PIN 2
