#pragma once

#include <stdint.h>

// Un sensor IR físico conectado a este ESP32. Cada sensor tiene sus propias
// credenciales en la API: el código estable (p. ej. ENTRADA-01) y su token.
// El tipo (entrada o salida) lo define la API según el código, no el firmware.
struct SensorConfig {
  uint8_t pin;
  const char* codigo;
  const char* token;
};
