#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>     // HTTPS
#include <ArduinoJson.h>
// link do editável do json: https://www.npoint.io/docs/331b63edb4ef3ad99b38

// ------ config do wifi -----
const char* ssid = "VENDO CRACK";     // <-- Nome da rede
const char* password = "jonasmama10bolas"; // <-- Senha da rede

// ----- config do sensor -----
const int sensorPin = A0;     // Sensor de luz no A0
const int ledPin = D7;        // LED no D7
int limiteLuminosidade = 500; // Valor padrão caso não consiga baixar o JSON

// ----- url do backend (API Gateway) -----
const char* GATEWAY_IP = "192.168.15.5"; // IP do seu Mac
const int GATEWAY_PORT = 5001;
String configUrl = String("http://") + GATEWAY_IP + ":" + String(GATEWAY_PORT) + "/controle/config";
String logUrl    = String("http://") + GATEWAY_IP + ":" + String(GATEWAY_PORT) + "/logging/log";

void setup() {
  Serial.begin(115200); // Inicia a comunicação serial com o computador e estabelece a taxa de transmissão
  pinMode(ledPin, OUTPUT); // Saída
  digitalWrite(ledPin, LOW); // Led desligado

  Serial.println("Conectando ao Wi-Fi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWi-Fi conectado!");

  // Mostra o IP do ESP8266
  Serial.print("IP do ESP8266: ");
  Serial.println(WiFi.localIP());

  // Teste de resolução de IP
  Serial.print("Pingando o gateway... ");
  IPAddress gatewayIp;
  if (WiFi.hostByName(GATEWAY_IP, gatewayIp)) {
    Serial.print("Resolveu o IP: ");
    Serial.println(gatewayIp);
  } else {
    Serial.println("Não resolveu o IP!");
  }

  // Teste de conexão TCP
  WiFiClient testClient;
  Serial.print("Testando conexão com o gateway... ");
  if (testClient.connect(GATEWAY_IP, GATEWAY_PORT)) {
    Serial.println("Conexão OK!");
    testClient.stop();
  } else {
    Serial.println("Falha na conexão!");
  }

  fetchConfig(); // Busca o limite de luz do JSON
}

unsigned long ultimaAtualizacao = 0;
const unsigned long intervaloAtualizacao = 5000; // 5.000 ms = 5 segundos

void loop() {
  int valorLuz = analogRead(sensorPin); // Lê o valor do sensor
  Serial.print("Luminosidade atual: ");
  Serial.println(valorLuz);
  Serial.print("Limite configurado: ");
  Serial.println(limiteLuminosidade);

  if (valorLuz < limiteLuminosidade) {
    digitalWrite(ledPin, HIGH);
    Serial.println("Luz FRACA → LED LIGADO");
  } else {
    digitalWrite(ledPin, LOW);
    Serial.println("Luz FORTE → LED DESLIGADO");
  }

  // Envia o log a cada leitura
  sendLog(valorLuz);

  // Atualiza o valor do limite a cada 5 segundos
  if (millis() - ultimaAtualizacao >= intervaloAtualizacao) {
    fetchConfig();
    ultimaAtualizacao = millis();
  }

  delay(2000); // Delay para leitura do sensor
}

void fetchConfig() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    WiFiClient client;

    http.begin(client, configUrl);
    int httpCode = http.GET();

    if (httpCode == 200) {
      String payload = http.getString();
      Serial.println("JSON recebido:");
      Serial.println(payload);

      StaticJsonDocument<200> doc;
      DeserializationError error = deserializeJson(doc, payload);

      if (!error && doc.containsKey("limite_luz")) {
        limiteLuminosidade = doc["limite_luz"];
        Serial.print("Novo limite configurado: ");
        Serial.println(limiteLuminosidade);
      } else {
        Serial.println("Erro ao interpretar JSON.");
      }
    } else {
      Serial.print("Erro HTTP: ");
      Serial.println(httpCode);
    }
    http.end();
  } else {
    Serial.println("Wi-Fi não conectado.");
  }
}

void sendLog(int valorLuz) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    WiFiClient client;

    http.begin(client, logUrl);
    http.addHeader("Content-Type", "application/json");

    String timestamp = String(millis());
    String payload = "{\"valor_luz\":" + String(valorLuz) + ",\"timestamp\":\"" + timestamp + "\"}";

    int httpCode = http.POST(payload);
    if (httpCode > 0) {
      String response = http.getString();
      Serial.println("Log enviado: " + response);
    } else {
      Serial.println("Erro ao enviar log: " + String(httpCode));
    }
    http.end();
  }
}