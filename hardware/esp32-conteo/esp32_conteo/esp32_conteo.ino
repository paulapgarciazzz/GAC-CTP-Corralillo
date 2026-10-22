/*
 * Conteo de personas — CTP Corralillo
 * ESP32 + sensores infrarrojos (uno en la entrada, otro en la salida).
 *
 * Cada detección física se envía por WiFi a la API de Laravel:
 *   POST {API_BASE_URL}/conteo/dispositivo/movimientos
 *   X-Sensor-Codigo: ENTRADA-01
 *   Authorization: Bearer <token del sensor>
 *   {"identificador_evento": "ENTRADA-01-<arranque>-<aleatorio>-<secuencia>"}
 *
 * Diseño:
 *  - Los sensores se leen en una tarea propia cada 5 ms. Una petición HTTP
 *    lenta o una caída del WiFi nunca hace perder una detección.
 *  - Debounce por sensor (ver config.h): una persona = un evento.
 *  - Cada evento recibe un identificador único y estable desde que se detecta.
 *    Queda en una cola y se reintenta con el MISMO identificador hasta que la
 *    API responde 201 (nuevo) o 200 (ya lo tenía). El backend no cuenta dos
 *    veces el mismo identificador.
 *  - El identificador incluye un contador de arranques guardado en flash y un
 *    número aleatorio, así no se repite aunque el ESP32 se reinicie.
 *  - Latido cada minuto por sensor: el panel muestra si está en línea.
 *
 * Limitación conocida: la cola vive en RAM. Si el ESP32 pierde la
 * alimentación con eventos sin enviar, esos eventos se pierden (se avisa
 * por el monitor serie mientras la cola no esté vacía).
 *
 * Monitor serie (115200 baudios), comandos de prueba:
 *   ?   estado: WiFi, lectura actual de cada pin y eventos en cola
 *   0   simula una detección en el sensor 0 (sin sensor físico)
 *   1   simula una detección en el sensor 1
 *   l   envía un latido ahora
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <Preferences.h>
#include <esp_random.h>

#if __has_include("config.h")
#include "config.h"
#else
#error "Falta config.h: copia config.example.h como config.h y completa WiFi, URL y tokens."
#endif

static const size_t NUM_SENSORES = sizeof(SENSORES) / sizeof(SENSORES[0]);
static_assert(NUM_SENSORES >= 1 && NUM_SENSORES <= 4, "Configura entre 1 y 4 sensores en config.h");

static const char* RUTA_MOVIMIENTOS = "/conteo/dispositivo/movimientos";
static const char* RUTA_LATIDO = "/conteo/dispositivo/latido";

struct Evento {
  char id[64];
};

struct EstadoSensor {
  // Solo la tarea de sensores modifica estos campos.
  bool lecturaAnterior = false;
  uint32_t lecturaDesdeMs = 0;
  bool ocupado = false;
  bool hayEventoPrevio = false;
  uint32_t ultimoEventoMs = 0;
  uint32_t secuencia = 0;
  uint32_t perdidosColaLlena = 0;

  // Solo loop() (red) modifica estos.
  QueueHandle_t cola = nullptr;
  uint32_t proximoIntentoMs = 0;
  uint32_t esperaActualMs = 0;
  uint32_t ultimoLatidoMs = 0;
  bool latidoConfirmado = false;  // solo para no repetir el log de OK
};

static EstadoSensor estados[NUM_SENSORES];
static uint32_t arranque = 0;
static uint32_t aleatorioArranque = 0;
static volatile uint32_t ledApagarEnMs = 0;
static portMUX_TYPE muxSecuencia = portMUX_INITIALIZER_UNLOCKED;

static WiFiClient clientePlano;
static WiFiClientSecure clienteSeguro;
static uint32_t ultimoIntentoWiFiMs = 0;
static bool wifiConectadoAntes = false;

// -----------------------------------------------------------------------------
// Eventos
// -----------------------------------------------------------------------------

// Crea un evento con identificador único y lo pone en la cola del sensor.
// Se llama desde la tarea de sensores y desde los comandos de prueba.
static void registrarDeteccion(size_t indice, const char* origen) {
  EstadoSensor& estado = estados[indice];

  uint32_t secuencia;
  portENTER_CRITICAL(&muxSecuencia);
  secuencia = ++estado.secuencia;
  portEXIT_CRITICAL(&muxSecuencia);

  Evento evento;
  snprintf(evento.id, sizeof(evento.id), "%s-%lu-%08lx-%lu",
           SENSORES[indice].codigo,
           (unsigned long)arranque,
           (unsigned long)aleatorioArranque,
           (unsigned long)secuencia);

  if (xQueueSend(estado.cola, &evento, 0) != pdTRUE) {
    estado.perdidosColaLlena++;
    Serial.printf("[COLA LLENA] %s: evento perdido (%lu en total). ¿API caída mucho tiempo?\n",
                  SENSORES[indice].codigo, (unsigned long)estado.perdidosColaLlena);
    return;
  }

  ledApagarEnMs = millis() + 80;
  Serial.printf("[DETECCION] %s (%s) -> %s, en cola: %u\n",
                SENSORES[indice].codigo, origen, evento.id,
                (unsigned)uxQueueMessagesWaiting(estado.cola));
}

// Lee los sensores cada 5 ms y aplica el debounce.
static void tareaSensores(void*) {
  for (;;) {
    const uint32_t ahora = millis();

    for (size_t i = 0; i < NUM_SENSORES; i++) {
      EstadoSensor& estado = estados[i];
      const bool detectando = digitalRead(SENSORES[i].pin) == NIVEL_DETECCION;

      if (detectando != estado.lecturaAnterior) {
        estado.lecturaAnterior = detectando;
        estado.lecturaDesdeMs = ahora;
      }
      const uint32_t estableMs = ahora - estado.lecturaDesdeMs;

      if (!estado.ocupado && detectando && estableMs >= DEBOUNCE_ACTIVO_MS) {
        // Flanco "libre -> ocupado" estable: una persona empieza a pasar.
        estado.ocupado = true;

        if (estado.hayEventoPrevio && ahora - estado.ultimoEventoMs < INTERVALO_MINIMO_MS) {
          Serial.printf("[DEBOUNCE] %s: detección descartada (< %d ms desde la anterior)\n",
                        SENSORES[i].codigo, INTERVALO_MINIMO_MS);
        } else {
          estado.hayEventoPrevio = true;
          estado.ultimoEventoMs = ahora;
          registrarDeteccion(i, "sensor");
        }
      } else if (estado.ocupado && !detectando && estableMs >= DEBOUNCE_LIBRE_MS) {
        // La persona terminó de pasar: se puede volver a contar.
        estado.ocupado = false;
      }
    }

#if LED_PIN >= 0
    digitalWrite(LED_PIN, (int32_t)(ledApagarEnMs - ahora) > 0 ? HIGH : LOW);
#endif

    vTaskDelay(pdMS_TO_TICKS(5));
  }
}

// -----------------------------------------------------------------------------
// HTTP
// -----------------------------------------------------------------------------

// Devuelve el código HTTP, o un valor <= 0 si no hubo respuesta.
static int enviarPost(size_t indice, const char* ruta, const String& cuerpo, String* respuesta) {
  const String url = String(API_BASE_URL) + ruta;
  HTTPClient http;
  bool iniciado;

  if (url.startsWith("https://")) {
    if (strlen(API_CA_CERT) == 0) {
      Serial.println("[CONFIG] API_BASE_URL usa https pero API_CA_CERT está vacío: no se envía nada.");
      return -100;
    }
    clienteSeguro.setCACert(API_CA_CERT);
    iniciado = http.begin(clienteSeguro, url);
  } else {
    iniciado = http.begin(clientePlano, url);
  }

  if (!iniciado) {
    return -101;
  }

  http.setConnectTimeout(HTTP_TIMEOUT_MS);
  http.setTimeout(HTTP_TIMEOUT_MS);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Accept", "application/json");
  http.addHeader("X-Sensor-Codigo", SENSORES[indice].codigo);
  http.addHeader("Authorization", String("Bearer ") + SENSORES[indice].token);

  const int codigo = http.POST(cuerpo);
  if (respuesta && codigo > 0) {
    *respuesta = http.getString();
  }
  http.end();
  return codigo;
}

static void programarReintento(EstadoSensor& estado, uint32_t esperaMinimaMs) {
  estado.esperaActualMs = estado.esperaActualMs == 0 ? 1000 : min<uint32_t>(estado.esperaActualMs * 2, REINTENTO_MAXIMO_MS);
  const uint32_t espera = max<uint32_t>(estado.esperaActualMs, esperaMinimaMs);
  estado.proximoIntentoMs = millis() + espera;
}

// Intenta enviar el evento más antiguo de la cola de un sensor. Solo lo saca
// de la cola cuando la API confirma (o cuando reintentar no tiene sentido).
static void procesarCola(size_t indice) {
  EstadoSensor& estado = estados[indice];

  if ((int32_t)(millis() - estado.proximoIntentoMs) < 0) {
    return;
  }

  Evento evento;
  if (xQueuePeek(estado.cola, &evento, 0) != pdTRUE) {
    return;
  }

  const String cuerpo = String("{\"identificador_evento\":\"") + evento.id + "\"}";
  String respuesta;
  const int codigo = enviarPost(indice, RUTA_MOVIMIENTOS, cuerpo, &respuesta);

  if (codigo == 201 || codigo == 200) {
    xQueueReceive(estado.cola, &evento, 0);
    estado.esperaActualMs = 0;
    estado.proximoIntentoMs = 0;
    estado.ultimoLatidoMs = millis();  // la API ya registró la señal
    Serial.printf("[%s] %s %s (quedan %u)\n",
                  codigo == 201 ? "REGISTRADO" : "YA REGISTRADO",
                  SENSORES[indice].codigo, evento.id,
                  (unsigned)uxQueueMessagesWaiting(estado.cola));
    return;
  }

  if (codigo == 409 || codigo == 422) {
    // Reintentar no lo arregla: se descarta para no bloquear la cola.
    xQueueReceive(estado.cola, &evento, 0);
    Serial.printf("[DESCARTADO] %s %s: HTTP %d %s\n", SENSORES[indice].codigo, evento.id, codigo, respuesta.c_str());
    return;
  }

  if (codigo == 401 || codigo == 403) {
    // Credenciales o sensor inactivo: se conservan los eventos por si se
    // corrige en la API, y se reintenta despacio.
    Serial.printf("[CREDENCIALES] %s: HTTP %d. Revisa código y token en config.h y que el sensor esté activo. %s\n",
                  SENSORES[indice].codigo, codigo, respuesta.c_str());
    programarReintento(estado, REINTENTO_MAXIMO_MS);
    return;
  }

  programarReintento(estado, 0);
  Serial.printf("[REINTENTO] %s %s: %s %d, nuevo intento en %lu ms\n",
                SENSORES[indice].codigo, evento.id,
                codigo > 0 ? "HTTP" : "sin respuesta", codigo,
                (unsigned long)estado.esperaActualMs);
}

static void enviarLatido(size_t indice) {
  EstadoSensor& estado = estados[indice];
  String respuesta;
  const int codigo = enviarPost(indice, RUTA_LATIDO, "{}", &respuesta);
  estado.ultimoLatidoMs = millis();

  if (codigo == 200) {
    if (!estado.latidoConfirmado) {
      Serial.printf("[LATIDO] %s OK: %s\n", SENSORES[indice].codigo, respuesta.c_str());
    }
    estado.latidoConfirmado = true;
  } else {
    estado.latidoConfirmado = false;
    Serial.printf("[LATIDO] %s falló: %d %s\n", SENSORES[indice].codigo, codigo, respuesta.c_str());
  }
}

// -----------------------------------------------------------------------------
// WiFi y comandos
// -----------------------------------------------------------------------------

static bool asegurarWiFi() {
  if (WiFi.status() == WL_CONNECTED) {
    if (!wifiConectadoAntes) {
      wifiConectadoAntes = true;
      Serial.printf("[WIFI] conectado a %s, IP %s, señal %d dBm\n",
                    WIFI_SSID, WiFi.localIP().toString().c_str(), WiFi.RSSI());
    }
    return true;
  }

  if (wifiConectadoAntes) {
    wifiConectadoAntes = false;
    Serial.println("[WIFI] conexión perdida; los eventos quedan en cola.");
  }

  if (ultimoIntentoWiFiMs == 0 || millis() - ultimoIntentoWiFiMs > 10000) {
    ultimoIntentoWiFiMs = millis();
    Serial.printf("[WIFI] conectando a %s...\n", WIFI_SSID);
    WiFi.disconnect();
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  }
  return false;
}

static void imprimirEstado() {
  Serial.printf("[ESTADO] arranque %lu, WiFi %s", (unsigned long)arranque,
                WiFi.status() == WL_CONNECTED ? "conectado" : "desconectado");
  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf(" (IP %s, %d dBm)", WiFi.localIP().toString().c_str(), WiFi.RSSI());
  }
  Serial.printf(", API %s\n", API_BASE_URL);

  for (size_t i = 0; i < NUM_SENSORES; i++) {
    const bool detectando = digitalRead(SENSORES[i].pin) == NIVEL_DETECCION;
    Serial.printf("  [%u] %s GPIO%u: %s, en cola %u, perdidos %lu\n",
                  (unsigned)i, SENSORES[i].codigo, SENSORES[i].pin,
                  detectando ? "DETECTANDO" : "libre",
                  (unsigned)uxQueueMessagesWaiting(estados[i].cola),
                  (unsigned long)estados[i].perdidosColaLlena);
  }
}

static void atenderComandos() {
  while (Serial.available()) {
    const char comando = Serial.read();
    if (comando == '?') {
      imprimirEstado();
    } else if (comando == 'l') {
      for (size_t i = 0; i < NUM_SENSORES; i++) {
        estados[i].latidoConfirmado = false;
        enviarLatido(i);
      }
    } else if (comando >= '0' && comando <= '9') {
      const size_t indice = comando - '0';
      if (indice < NUM_SENSORES) {
        registrarDeteccion(indice, "simulada");
      } else {
        Serial.printf("No existe el sensor %u.\n", (unsigned)indice);
      }
    }
  }
}

// -----------------------------------------------------------------------------

void setup() {
  Serial.begin(115200);
  delay(300);
  Serial.println("\n=== Conteo de personas CTP Corralillo (ESP32) ===");

  Preferences preferencias;
  preferencias.begin("conteo", false);
  arranque = preferencias.getUInt("arranques", 0) + 1;
  preferencias.putUInt("arranques", arranque);
  preferencias.end();
  aleatorioArranque = esp_random();

#if LED_PIN >= 0
  pinMode(LED_PIN, OUTPUT);
#endif

  for (size_t i = 0; i < NUM_SENSORES; i++) {
    pinMode(SENSORES[i].pin, INPUT_PULLUP);
    estados[i].cola = xQueueCreate(TAMANO_COLA, sizeof(Evento));
    estados[i].lecturaAnterior = digitalRead(SENSORES[i].pin) == NIVEL_DETECCION;
    estados[i].lecturaDesdeMs = millis();
    // Si arranca con el haz ya cortado, no cuenta hasta que se libere.
    estados[i].ocupado = estados[i].lecturaAnterior;
    Serial.printf("Sensor %u: %s en GPIO%u\n", (unsigned)i, SENSORES[i].codigo, SENSORES[i].pin);
  }

  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  asegurarWiFi();

  // Núcleo 1, prioridad mayor que loop(): el muestreo no espera a la red.
  xTaskCreatePinnedToCore(tareaSensores, "sensores", 4096, nullptr, 2, nullptr, 1);

  Serial.println("Comandos: ? estado | 0/1 simular detección | l latido");
}

void loop() {
  atenderComandos();

  if (asegurarWiFi()) {
    for (size_t i = 0; i < NUM_SENSORES; i++) {
      procesarCola(i);

      // Primer latido al conectar y luego cada LATIDO_CADA_MS, también si
      // falla: así un token incorrecto no satura la API.
      if (estados[i].ultimoLatidoMs == 0 || millis() - estados[i].ultimoLatidoMs >= LATIDO_CADA_MS) {
        enviarLatido(i);
      }
    }
  }

  delay(10);
}
