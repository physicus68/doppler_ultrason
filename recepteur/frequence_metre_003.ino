#include "analogComp.h"

volatile unsigned long count = 0;
volatile unsigned long  t, t0;
unsigned long  buffer;
unsigned int N = 2000;

const unsigned long DT = 100;

void setup() {
  Serial.begin(9600);
  analogComparator.setOn(AIN0, AIN1);
  analogComparator.enableInterrupt(compteur, RISING);
  t0 = micros();  
}


void loop() {
  buffer = t;  
  float F = 1 / ( buffer * 0.000001) * N ;  
  Serial.println(F);  
  delay(DT);  
}


void compteur() {
  count++;
  if (count > N){
    count = 0;
    t = micros() - t0;
    t0 = micros();
  }
}
