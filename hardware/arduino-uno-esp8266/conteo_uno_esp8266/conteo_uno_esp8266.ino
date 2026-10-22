/*
 * Contador de personas — CTP Corralillo
 * Arduino UNO R3 + HC-SR04 + módulo WiFi ESP8266 (firmware AT) por SoftwareSerial.
 *
 * Envía cada detección DIRECTAMENTE a Laravel por WiFi (sin puente Python):
 *
 *   POST /api/conteo/dispositivo/movimientos HTTP/1.1
 *   X-Sensor-Codigo: ENTRADA-01
 *   Authorization: Bearer <token del sensor>
 *   Content-Type: application/json
 *
 *   {"identificador_evento":"ENTRADA-01-<arranque>-<aleatorio>-<secuencia>"}
 *
 * - Una persona = un evento: umbral con histéresis + intervalo mínimo.
 * - Sin duplicados: el identificador se crea una vez por detección y se repite
 *   en todos sus reintentos; la API responde 200 si ya lo tenía.
 * - Reinicios: el identificador lleva un contador de arranques guardado en la
 *   EEPROM y un número aleatorio, así nunca se repite.
 * - Sin red: hasta 8 eventos esperan en cola (RAM) y se reintentan con espera
 *   creciente (2 s ... 30 s).
 *
 * Limitación (UNO + AT): mientras se envía una petición (~1-2 s) no se mide la
 * distancia. Si alguien pasa completo en ese lapso no se cuenta; si sigue
 * delante del sensor al terminar, sí. Suficiente para una persona a la vez.
 *
 * Monitor serie: 115200 baudios, final de línea "Nueva línea".
 *   p      envío MANUAL de una entrada (prueba sin pasar frente al sensor)
 *   l      latido: prueba red + token sin registrar movimientos
 *   ?      estado (red, cola, distancia actual)
 *   d      activa/desactiva la impresión de distancias (calibrar UMBRAL_CM)
 *   e      activa/desactiva el eco de las respuestas del ESP8266
 *   AT...  se reenvía tal cual al ESP8266 (p. ej. AT+CIFSR)
 */

#include <SoftwareSerial.h>
#include <EEPROM.h>

#if __has_include("config.h")
#include "config.h"
#else
#error "Falta config.h: copia config.example.h como config.h y completa IP, codigo y token."
#endif

SoftwareSerial esp(PIN_ESP_RX, PIN_ESP_TX);

// --- Textos en flash (la RAM del UNO es de 2 KB) ------------------------------
static const char P_HOST[] PROGMEM = API_HOST;
static const char P_CODIGO[] PROGMEM = SENSOR_CODIGO;
static const char P_TOKEN[] PROGMEM = SENSOR_TOKEN;
static const char P_SSID[] PROGMEM = WIFI_SSID;
static const char P_PASS[] PROGMEM = WIFI_PASSWORD;

static const char RUTA_MOVIMIENTOS[] PROGMEM = "/api/conteo/dispositivo/movimientos";
static const char RUTA_LATIDO[] PROGMEM = "/api/conteo/dispositivo/latido";

static const char H_POST[] PROGMEM = "POST ";
static const char H_VERSION[] PROGMEM = " HTTP/1.1\r\nHost: ";
static const char H_TIPOS[] PROGMEM = "\r\nContent-Type: application/json\r\nAccept: application/json\r\nX-Sensor-Codigo: ";
static const char H_AUTH[] PROGMEM = "\r\nAuthorization: Bearer ";
static const char H_LARGO[] PROGMEM = "\r\nContent-Length: ";
static const char H_FIN[] PROGMEM = "\r\nConnection: close\r\n\r\n";
static const char B_INICIO[] PROGMEM = "{\"identificador_evento\":\"";
static const char B_FIN[] PROGMEM = "\"}";
static const char B_VACIO[] PROGMEM = "{}";
static const char SEPARADOR[] PROGMEM = "-";
static const char DOS_PUNTOS[] PROGMEM = ":";

static const char T_OK[] PROGMEM = "OK";
static const char T_ERROR[] PROGMEM = "ERROR";
static const char T_FAIL[] PROGMEM = "FAIL";
static const char T_PROMPT[] PROGMEM = ">";
static const char T_SEND_OK[] PROGMEM = "SEND OK";
static const char T_HTTP[] PROGMEM = "HTTP/1.1 ";
static const char T_CLOSED[] PROGMEM = "CLOSED";
static const char T_STATUS[] PROGMEM = "STATUS:";

// --- Estado ------------------------------------------------------------------
const uint8_t TAM_COLA = 8;
uint16_t cola[TAM_COLA];          // solo la secuencia: el identificador se reconstruye
uint8_t colaInicio = 0;
uint8_t colaCantidad = 0;
uint16_t secuencia = 0;
uint16_t arranque = 0;
uint16_t aleatorio = 0;
unsigned long perdidos = 0;

unsigned long proximoIntentoMs = 0;
unsigned long esperaReintentoMs = 0;
unsigned long ultimoLatidoMs = 0;
bool latidoEnviado = false;
int ultimoCodigoHttp = 0;

bool ocupado = false;
uint8_t lecturasCerca = 0;
uint8_t lecturasLejos = 0;
bool hayEventoPrevio = false;
unsigned long ultimoEventoMs = 0;
unsigned long ultimaMedicionMs = 0;
unsigned int ultimaDistancia = 0;

bool imprimirDistancias = false;
bool ecoEsp = false;

char linea[48];
uint8_t largoLinea = 0;

// =============================================================================
// Salida de texto: cuenta bytes y, si hay destino, los escribe. La petición se
// genera dos veces (medir el largo para AT+CIPSEND y luego enviarla) sin
// guardarla entera en RAM.
// =============================================================================

struct Salida {
  Print* destino;   // nullptr = solo contar
  uint16_t total;
};

void escribirP(Salida& s, PGM_P texto) {
  char c;
  while ((c = pgm_read_byte(texto++)) != 0) {
    s.total++;
    if (s.destino) s.destino->write(c);
  }
}

void escribirR(Salida& s, const char* texto) {
  while (*texto) {
    s.total++;
    if (s.destino) s.destino->write(*texto);
    texto++;
  }
}

void escribirNumero(Salida& s, unsigned long valor, uint8_t base) {
  char bufer[12];
  ultoa(valor, bufer, base);
  escribirR(s, bufer);
}

void escribirIdentificador(Salida& s, uint16_t sec) {
  escribirP(s, P_CODIGO);
  escribirP(s, SEPARADOR);
  escribirNumero(s, arranque, 10);
  escribirP(s, SEPARADOR);
  escribirNumero(s, aleatorio, 16);
  escribirP(s, SEPARADOR);
  escribirNumero(s, sec, 10);
}

// sec == 0 => latido (cuerpo vacío).
void escribirCuerpo(Salida& s, uint16_t sec) {
  if (sec == 0) {
    escribirP(s, B_VACIO);
    return;
  }
  escribirP(s, B_INICIO);
  escribirIdentificador(s, sec);
  escribirP(s, B_FIN);
}

void escribirPeticion(Salida& s, PGM_P ruta, uint16_t sec) {
  Salida cuerpo = { nullptr, 0 };
  escribirCuerpo(cuerpo, sec);

  escribirP(s, H_POST);
  escribirP(s, ruta);
  escribirP(s, H_VERSION);
  escribirP(s, P_HOST);
  escribirP(s, DOS_PUNTOS);
  escribirNumero(s, API_PORT, 10);
  escribirP(s, H_TIPOS);
  escribirP(s, P_CODIGO);
  escribirP(s, H_AUTH);
  escribirP(s, P_TOKEN);
  escribirP(s, H_LARGO);
  escribirNumero(s, cuerpo.total, 10);
  escribirP(s, H_FIN);
  escribirCuerpo(s, sec);
}

void imprimirIdentificador(uint16_t sec) {
  Salida s = { &Serial, 0 };
  escribirIdentificador(s, sec);
}

// =============================================================================
// ESP8266 (comandos AT)
// =============================================================================

void vaciarEsp() {
  while (esp.available()) {
    char c = esp.read();
    if (ecoEsp) Serial.write(c);
  }
}

void enviarP(PGM_P texto) {
  char c;
  while ((c = pgm_read_byte(texto++)) != 0) esp.write(c);
}

// Lee del ESP8266 hasta encontrar uno de los textos (o nullptr) o agotar el
// tiempo. Devuelve 0, 1 o 2 según cuál apareció, o -1 si se agotó el tiempo.
int8_t esperar(unsigned long timeoutMs, PGM_P a, PGM_P b, PGM_P c) {
  PGM_P textos[3] = { a, b, c };
  uint8_t pos[3] = { 0, 0, 0 };
  const unsigned long inicio = millis();

  while (millis() - inicio < timeoutMs) {
    while (esp.available()) {
      const char ch = esp.read();
      if (ecoEsp) Serial.write(ch);

      for (uint8_t i = 0; i < 3; i++) {
        if (!textos[i]) continue;
        if (ch == (char)pgm_read_byte(textos[i] + pos[i])) {
          pos[i]++;
          if (pgm_read_byte(textos[i] + pos[i]) == 0) return i;
        } else {
          pos[i] = (ch == (char)pgm_read_byte(textos[i])) ? 1 : 0;
        }
      }
    }
  }
  return -1;
}

// Lee un número decimal del ESP8266 (salta lo que no sea dígito al inicio).
int leerNumero(unsigned long timeoutMs) {
  const unsigned long inicio = millis();
  int valor = -1;
  while (millis() - inicio < timeoutMs) {
    if (!esp.available()) continue;
    const char ch = esp.read();
    if (ecoEsp) Serial.write(ch);
    if (ch >= '0' && ch <= '9') {
      valor = (valor < 0 ? 0 : valor * 10) + (ch - '0');
    } else if (valor >= 0) {
      break;
    }
  }
  return valor;
}

bool comandoOk(const __FlashStringHelper* comando, unsigned long timeoutMs) {
  vaciarEsp();
  esp.print(comando);
  esp.print(F("\r\n"));
  return esperar(timeoutMs, T_OK, T_ERROR, T_FAIL) == 0;
}

void cerrarConexion() {
  vaciarEsp();
  esp.print(F("AT+CIPCLOSE\r\n"));
  esperar(1000, T_OK, T_ERROR, nullptr);
}

bool iniciarEsp() {
  esp.begin(ESP_BAUDIOS);
  delay(500);

  bool responde = false;
  for (uint8_t intento = 0; intento < 3 && !responde; intento++) {
    responde = comandoOk(F("AT"), 1000);
  }
  if (!responde) {
    Serial.println(F("[ESP8266] no responde a AT. Revisa cableado (D2<-TX, D3->RX), alimentacion y que este a 9600 baudios."));
    return false;
  }

  comandoOk(F("ATE0"), 1000);         // sin eco: menos bytes por SoftwareSerial
  comandoOk(F("AT+CWMODE=1"), 2000);  // estacion
  comandoOk(F("AT+CIPMUX=0"), 1000);  // una conexion
  comandoOk(F("AT+CIPMODE=0"), 1000); // modo normal (no transparente)
  Serial.println(F("[ESP8266] listo"));
  return true;
}

// 2 = con IP, 3 = conectado, 4 = desconectado, 5 = sin WiFi; -1 = sin respuesta.
int estadoWifi() {
  vaciarEsp();
  esp.print(F("AT+CIPSTATUS\r\n"));
  if (esperar(2000, T_STATUS, T_ERROR, nullptr) != 0) return -1;
  const int estado = leerNumero(500);
  esperar(500, T_OK, nullptr, nullptr);
  return estado;
}

bool wifiConectado() {
  const int estado = estadoWifi();
  return estado >= 2 && estado <= 4;
}

void conectarWifiSiHaceFalta() {
  if (wifiConectado()) return;

  if (strlen_P(P_SSID) == 0) {
    Serial.println(F("[WIFI] sin IP y WIFI_SSID vacio: conecta el modulo con AT+CWJAP desde este monitor."));
    return;
  }

  Serial.println(F("[WIFI] conectando..."));
  vaciarEsp();
  esp.print(F("AT+CWJAP=\""));
  enviarP(P_SSID);
  esp.print(F("\",\""));
  enviarP(P_PASS);
  esp.print(F("\"\r\n"));
  Serial.println(esperar(20000, T_OK, T_FAIL, T_ERROR) == 0 ? F("[WIFI] conectado") : F("[WIFI] no se pudo conectar"));
}

// POST a la API. Devuelve el código HTTP, o negativo si falló antes:
// -1 sin conexión TCP, -2 sin prompt, -3 envío fallido, -4 sin respuesta HTTP.
int enviarHttp(PGM_P ruta, uint16_t sec) {
  cerrarConexion();

  vaciarEsp();
  esp.print(F("AT+CIPSTART=\"TCP\",\""));
  enviarP(P_HOST);
  esp.print(F("\","));
  esp.print(API_PORT);
  esp.print(F("\r\n"));
  if (esperar(10000, T_OK, T_ERROR, T_FAIL) != 0) {
    cerrarConexion();
    return -1;
  }

  Salida medida = { nullptr, 0 };
  escribirPeticion(medida, ruta, sec);

  esp.print(F("AT+CIPSEND="));
  esp.print(medida.total);
  esp.print(F("\r\n"));
  if (esperar(5000, T_PROMPT, T_ERROR, nullptr) != 0) {
    cerrarConexion();
    return -2;
  }

  Salida envio = { &esp, 0 };
  escribirPeticion(envio, ruta, sec);

  if (esperar(10000, T_SEND_OK, T_ERROR, T_FAIL) != 0) {
    cerrarConexion();
    return -3;
  }

  if (esperar(10000, T_HTTP, T_CLOSED, nullptr) != 0) {
    cerrarConexion();
    return -4;
  }

  const int codigo = leerNumero(2000);
  esperar(3000, T_CLOSED, nullptr, nullptr);  // descarta el resto de la respuesta
  cerrarConexion();
  return codigo;
}

// =============================================================================
// Cola de eventos y envío
// =============================================================================

void registrarDeteccion(const __FlashStringHelper* origen) {
  if (colaCantidad >= TAM_COLA) {
    perdidos++;
    Serial.print(F("[COLA LLENA] evento perdido; total perdidos: "));
    Serial.println(perdidos);
    return;
  }

  secuencia++;
  cola[(colaInicio + colaCantidad) % TAM_COLA] = secuencia;
  colaCantidad++;

  Serial.print(F("[DETECCION] ("));
  Serial.print(origen);
  Serial.print(F(") "));
  imprimirIdentificador(secuencia);
  Serial.print(F(" en cola: "));
  Serial.println(colaCantidad);

  proximoIntentoMs = millis();  // intentar ya
  esperaReintentoMs = 0;
}

void quitarDeCola() {
  colaInicio = (colaInicio + 1) % TAM_COLA;
  colaCantidad--;
}

void programarReintento(unsigned long minimoMs) {
  esperaReintentoMs = esperaReintentoMs == 0 ? 2000UL : min(esperaReintentoMs * 2UL, 30000UL);
  if (esperaReintentoMs < minimoMs) esperaReintentoMs = minimoMs;
  proximoIntentoMs = millis() + esperaReintentoMs;
}

void procesarCola() {
  if (colaCantidad == 0 || (long)(millis() - proximoIntentoMs) < 0) return;

  const uint16_t sec = cola[colaInicio];
  const int codigo = enviarHttp(RUTA_MOVIMIENTOS, sec);
  ultimoCodigoHttp = codigo;

  if (codigo == 201 || codigo == 200) {
    quitarDeCola();
    esperaReintentoMs = 0;
    ultimoLatidoMs = millis();  // la API ya registró la señal
    Serial.print(codigo == 201 ? F("[REGISTRADO] ") : F("[YA REGISTRADO] "));
    imprimirIdentificador(sec);
    Serial.print(F(" (quedan "));
    Serial.print(colaCantidad);
    Serial.println(F(")"));
    return;
  }

  if (codigo == 409 || codigo == 422) {
    quitarDeCola();
    Serial.print(F("[DESCARTADO] HTTP "));
    Serial.print(codigo);
    Serial.print(F(" "));
    imprimirIdentificador(sec);
    Serial.println();
    return;
  }

  if (codigo == 401 || codigo == 403) {
    Serial.print(F("[CREDENCIALES] HTTP "));
    Serial.print(codigo);
    Serial.println(F(": revisa SENSOR_CODIGO y SENSOR_TOKEN en config.h y que el sensor este activo."));
    programarReintento(30000UL);
    return;
  }

  programarReintento(0);
  Serial.print(F("[REINTENTO] "));
  imprimirIdentificador(sec);
  Serial.print(F(" resultado "));
  Serial.print(codigo);
  Serial.print(F(", nuevo intento en "));
  Serial.print(esperaReintentoMs / 1000);
  Serial.println(F(" s"));

  if (codigo == -1) conectarWifiSiHaceFalta();
}

void enviarLatido() {
  const int codigo = enviarHttp(RUTA_LATIDO, 0);
  ultimoCodigoHttp = codigo;
  ultimoLatidoMs = millis();
  latidoEnviado = true;

  if (codigo == 200) {
    Serial.println(F("[LATIDO] OK: API alcanzable y token valido"));
  } else {
    Serial.print(F("[LATIDO] fallo, resultado "));
    Serial.print(codigo);
    Serial.println(codigo == 401 ? F(" (token o codigo incorrectos)") : codigo < 0 ? F(" (sin respuesta: IP, puerto, firewall o Docker)") : F(""));
    if (codigo == -1) conectarWifiSiHaceFalta();
  }
}

// =============================================================================
// HC-SR04
// =============================================================================

// Distancia en cm, o 0 si no hubo eco (nada dentro del alcance).
unsigned int medirDistanciaCm() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);
  const unsigned long duracionUs = pulseIn(PIN_ECHO, HIGH, 25000UL);
  return duracionUs == 0 ? 0 : (unsigned int)(duracionUs / 58UL);
}

void actualizarSensor() {
  if (millis() - ultimaMedicionMs < 60) return;  // el HC-SR04 necesita >= 60 ms
  ultimaMedicionMs = millis();

  const unsigned int distancia = medirDistanciaCm();
  ultimaDistancia = distancia;
  const bool cerca = distancia > 0 && distancia < UMBRAL_CM;
  const bool lejos = distancia == 0 || distancia > UMBRAL_CM + HISTERESIS_CM;

  if (imprimirDistancias) {
    Serial.print(F("Distancia: "));
    Serial.print(distancia);
    Serial.println(F(" cm"));
  }

  if (!ocupado) {
    lecturasCerca = cerca ? lecturasCerca + 1 : 0;
    if (lecturasCerca >= LECTURAS_PARA_DETECTAR) {
      ocupado = true;
      lecturasLejos = 0;
      const unsigned long ahora = millis();
      if (hayEventoPrevio && ahora - ultimoEventoMs < INTERVALO_MINIMO_MS) {
        Serial.println(F("[DEBOUNCE] deteccion descartada por intervalo minimo"));
      } else {
        hayEventoPrevio = true;
        ultimoEventoMs = ahora;
        registrarDeteccion(F("sensor"));
      }
    }
  } else {
    lecturasLejos = lejos ? lecturasLejos + 1 : 0;
    if (lecturasLejos >= LECTURAS_PARA_LIBERAR) {
      ocupado = false;
      lecturasCerca = 0;
    }
  }
}

// =============================================================================
// Monitor serie
// =============================================================================

void imprimirEstado() {
  Serial.print(F("[ESTADO] sensor "));
  Salida s = { &Serial, 0 };
  escribirP(s, P_CODIGO);
  Serial.print(F(", API "));
  escribirP(s, P_HOST);
  Serial.print(':');
  Serial.print(API_PORT);
  Serial.print(F(", arranque "));
  Serial.print(arranque);
  Serial.print(F(", en cola "));
  Serial.print(colaCantidad);
  Serial.print(F(", perdidos "));
  Serial.print(perdidos);
  Serial.print(F(", ultimo HTTP "));
  Serial.print(ultimoCodigoHttp);
  Serial.print(F(", distancia "));
  Serial.print(ultimaDistancia);
  Serial.print(F(" cm, RAM libre "));
  extern int __heap_start, *__brkval;
  int v;
  Serial.println((int)&v - (__brkval == 0 ? (int)&__heap_start : (int)__brkval));

  const int estado = estadoWifi();
  Serial.print(F("[ESTADO] WiFi CIPSTATUS="));
  Serial.print(estado);
  Serial.println(estado >= 2 && estado <= 4 ? F(" (con IP)") : F(" (SIN conexion)"));
}

void reenviarAlEsp(const char* comando) {
  vaciarEsp();
  esp.print(comando);
  esp.print(F("\r\n"));
  const bool ecoAnterior = ecoEsp;
  ecoEsp = true;
  esperar(5000, T_OK, T_ERROR, T_FAIL);
  ecoEsp = ecoAnterior;
  Serial.println();
}

void procesarLinea() {
  if (largoLinea == 0) return;

  if (largoLinea >= 2 && (linea[0] == 'A' || linea[0] == 'a') && (linea[1] == 'T' || linea[1] == 't')) {
    reenviarAlEsp(linea);
  } else if (linea[0] == 'p') {
    registrarDeteccion(F("manual"));
  } else if (linea[0] == 'l') {
    enviarLatido();
  } else if (linea[0] == '?') {
    imprimirEstado();
  } else if (linea[0] == 'd') {
    imprimirDistancias = !imprimirDistancias;
    Serial.println(imprimirDistancias ? F("Distancias: SI") : F("Distancias: NO"));
  } else if (linea[0] == 'e') {
    ecoEsp = !ecoEsp;
    Serial.println(ecoEsp ? F("Eco ESP8266: SI") : F("Eco ESP8266: NO"));
  } else {
    Serial.println(F("Comandos: p manual | l latido | ? estado | d distancias | e eco | AT..."));
  }
}

void atenderMonitor() {
  while (Serial.available()) {
    const char ch = Serial.read();
    if (ch == '\r' || ch == '\n') {
      linea[largoLinea] = 0;
      procesarLinea();
      largoLinea = 0;
    } else if (largoLinea < sizeof(linea) - 1) {
      linea[largoLinea++] = ch;
    }
  }
}

// =============================================================================

void setup() {
  Serial.begin(115200);
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);

  // Contador de arranques en EEPROM (con marca para detectar EEPROM vacía).
  const uint16_t MARCA = 0xC7A1;
  uint16_t marca;
  EEPROM.get(0, marca);
  if (marca != MARCA) {
    EEPROM.put(0, MARCA);
    arranque = 0;
  } else {
    EEPROM.get(2, arranque);
  }
  arranque++;
  EEPROM.put(2, arranque);

  randomSeed(((unsigned long)analogRead(A0) << 10) ^ analogRead(A1) ^ micros());
  aleatorio = (uint16_t)random(1, 0xFFFF);

  Serial.println(F("\n=== Contador CTP Corralillo (UNO + HC-SR04 + ESP8266) ==="));
  Serial.print(F("Arranque "));
  Serial.print(arranque);
  Serial.println(F(". Comandos: p manual | l latido | ? estado | d distancias | e eco | AT..."));

  if (iniciarEsp()) {
    conectarWifiSiHaceFalta();
  }
}

void loop() {
  atenderMonitor();
  actualizarSensor();
  procesarCola();

  if (LATIDO_CADA_MS > 0 && colaCantidad == 0
      && (!latidoEnviado || millis() - ultimoLatidoMs >= LATIDO_CADA_MS)) {
    enviarLatido();
  }
}
