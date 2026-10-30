/*
 * PROTOTIPO — Arduino UNO + HC-SR04 (CTP Corralillo).
 *
 * Solo para probar el flujo de extremo a extremo con el puente Python
 * (hardware/puente-arduino). El hardware definitivo es ESP32 + sensores IR.
 *
 * Imprime "ENTRADA_DETECTADA" (o "SALIDA_DETECTADA", ver LINEA_DETECCION)
 * UNA vez por cada persona u objeto que pasa frente al sensor:
 *  - Cuenta cuando la distancia baja de UMBRAL_CM en LECTURAS_PARA_DETECTAR
 *    lecturas seguidas (filtra ecos sueltos).
 *  - No vuelve a contar hasta que la distancia supera UMBRAL_CM + HISTERESIS_CM
 *    en LECTURAS_PARA_LIBERAR lecturas seguidas (una persona = un evento).
 *
 * Cableado: VCC -> 5V, GND -> GND, TRIG -> D9, ECHO -> D10.
 * Monitor serie: 9600 baudios (el puente usa la misma velocidad).
 */

const uint8_t PIN_TRIG = 9;
const uint8_t PIN_ECHO = 10;

const char* LINEA_DETECCION = "ENTRADA_DETECTADA";

const unsigned int UMBRAL_CM = 50;
const unsigned int HISTERESIS_CM = 5;
const uint8_t LECTURAS_PARA_DETECTAR = 2;
const uint8_t LECTURAS_PARA_LIBERAR = 4;
const unsigned long PERIODO_MS = 60;  // el HC-SR04 necesita >= 60 ms entre medidas

// true: imprime cada distancia (útil para calibrar; el puente la ignora).
const bool DEPURAR = false;

bool ocupado = false;
uint8_t lecturasCerca = 0;
uint8_t lecturasLejos = 0;
unsigned long totalDetecciones = 0;

// Distancia en cm, o 0 si no hubo eco (nada delante dentro del alcance).
unsigned int medirDistanciaCm() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);

  const unsigned long duracionUs = pulseIn(PIN_ECHO, HIGH, 25000UL);  // ~4 m máx.
  return duracionUs == 0 ? 0 : (unsigned int)(duracionUs / 58UL);
}

void setup() {
  Serial.begin(9600);
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  Serial.println("Prototipo de conteo listo");
}

void loop() {
  const unsigned int distancia = medirDistanciaCm();
  const bool cerca = distancia > 0 && distancia < UMBRAL_CM;
  const bool lejos = distancia == 0 || distancia > UMBRAL_CM + HISTERESIS_CM;

  if (DEPURAR) {
    Serial.print("Distancia: ");
    Serial.print(distancia);
    Serial.println(" cm");
  }

  if (!ocupado) {
    lecturasCerca = cerca ? lecturasCerca + 1 : 0;
    if (lecturasCerca >= LECTURAS_PARA_DETECTAR) {
      ocupado = true;
      lecturasLejos = 0;
      totalDetecciones++;
      Serial.println(LINEA_DETECCION);
      Serial.print("Total de detecciones: ");
      Serial.println(totalDetecciones);
    }
  } else {
    lecturasLejos = lejos ? lecturasLejos + 1 : 0;
    if (lecturasLejos >= LECTURAS_PARA_LIBERAR) {
      ocupado = false;
      lecturasCerca = 0;
    }
  }

  delay(PERIODO_MS);
}
