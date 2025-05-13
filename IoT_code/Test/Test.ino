#include <LiquidCrystal_I2C.h>
#include <Wire.h>
#include <WiFi.h>
#include <PubSubClient.h>

// NetPie Credentials
const char *ssid = "TTTT";
const char *password = "123456Aa";
const char *mqttServer = "broker.netpie.io";
const int mqttPort = 1883;
const char *mqttClientID = "0e01f7ba-ce71-4f50-ba2c-88004562dea5";
const char *mqttUsername = "915y5BmnrCoP5kNn7M16TpxGxSneWyB2";
const char *mqttPassword = "MiRT8kVcWvHLbvbH2rRnX8wxf1ZE6yVS";
const char *topic = "@msg/control";
const char *shadow_topic = "@shadow/data/update";

WiFiClient espClient;
PubSubClient client(espClient);
LiquidCrystal_I2C lcd(0x27, 20, 4);

// Motor pin definitions
const int ENA = 15;
const int IN1 = 2;
const int IN2 = 4;
const int IN3 = 5;
const int IN4 = 18;
const int ENB = 19;

const int trigPin = 33;
const int echoPin = 12;

const int btnGreen = 25;
const int btnYellow = 26;
const int btnRed = 27;

const int btnLeft = 13;
const int btnRight = 23; 

String currentCommand = "STOP"; // Default

int ID_distance = 0; // Global variable

void setup()
{
  Serial.begin(115200);
  delay(1000);

  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Connecting WiFi...");
  Serial.print("Connecting to WiFi");

  WiFi.begin(ssid, password);
  int retry = 0;
  while (WiFi.status() != WL_CONNECTED && retry < 20)
  {
    delay(500);
    Serial.print(".");
    lcd.setCursor(0, 1);
    lcd.print("Trying... ");
    retry++;
  }

  if (WiFi.status() == WL_CONNECTED)
  {
    Serial.println("\nWiFi Connected!");
    lcd.setCursor(0, 1);
    lcd.print("WiFi Connected!   ");
  }
  else
  {
    Serial.println("\nWiFi Failed!");
    lcd.setCursor(0, 1);
    lcd.print("WiFi Failed!      ");
  }

  client.setServer(mqttServer, mqttPort);
  client.setCallback(callback);
  reconnect();

  // Setup motor pins
  pinMode(ENA, OUTPUT);
  pinMode(ENB, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);

  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  pinMode(btnGreen, INPUT);
  pinMode(btnYellow, INPUT);
  pinMode(btnRed, INPUT);

  pinMode(btnLeft, INPUT);
  pinMode(btnRight, INPUT);
}

void loop()
{
  if (!client.connected())
  {
    reconnect();
  }
  client.loop();

  lcd.setCursor(0, 0);
  lcd.print("ESP32 Ready!       ");

  sentDistance();
  testbtn();
  applyCommand();
  delay(1000);
}

void callback(char *topic, byte *payload, unsigned int length)
{
  String message;
  for (int i = 0; i < length; i++)
  {
    message += (char)payload[i];
  }

  Serial.print("Message from NETPIE: ");
  Serial.println(message);

  currentCommand = message;
}

void reconnect()
{
  while (!client.connected())
  {
    Serial.print("Attempting MQTT connection...");
    if (client.connect(mqttClientID, mqttUsername, mqttPassword))
    {
      Serial.println("Connected to MQTT!");
      client.subscribe(topic);
    }
    else
    {
      Serial.print("Failed, rc=");
      Serial.print(client.state());
      Serial.println(" Retrying in 1 seconds...");
      delay(1000);
    }
  }
}

void sentDistance()
{
  long duration, distance;

  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  duration = pulseIn(echoPin, HIGH);
  distance = duration * 0.034 / 2;

  ID_distance++;
  Serial.println("Distance: " + String(distance) + " cm, ID: " +        String(ID_distance));

  lcd.setCursor(0, 3);
  lcd.print("Distance: ");
  lcd.print(distance);
  lcd.print(" cm   ");

  String data = "{\"Distance1\":" + String(distance) + ",\"ID_Distance1\":" + String(ID_distance) + "}";
  String payload = "{\"data\":" + data + "}";
  char msg_fb[256];
  payload.toCharArray(msg_fb, sizeof(msg_fb));

  client.publish(shadow_topic, msg_fb);
}

void testbtn()
{
  if (digitalRead(btnGreen) == LOW)
  {
    currentCommand = "FORWARD";
    lcd.setCursor(0, 0);
    lcd.print("btnGreen Pressed   ");
  }
  else if (digitalRead(btnYellow) == LOW)
  {
    currentCommand = "BACKWARD";
    lcd.setCursor(0, 0);
    lcd.print("btnYellow Pressed  ");
  }
  else if (digitalRead(btnRed) == LOW)
  {
    currentCommand = "STOP";
    lcd.setCursor(0, 0);
    lcd.print("btnRed Pressed     ");
  }
  else if (digitalRead(btnLeft) == LOW)
  {
    currentCommand = "LEFT";
    lcd.setCursor(0, 0);
    lcd.print("btnLeft Pressed     ");
    turnLeft();
  }
  else if (digitalRead(btnRight) == HIGH)
  {
    currentCommand = "RIGHT";
    lcd.setCursor(0, 0);
    lcd.print("btnRight Pressed     ");
    turnRight();
  }
}

void forward()
{
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);
  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);
  analogWrite(ENA, 255);
  analogWrite(ENB, 255);
  lcd.setCursor(0, 1);
  lcd.print("FORWARD!           ");
} 

void backward()
{
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, HIGH);
  analogWrite(ENA, 200);
  analogWrite(ENB, 200);
  lcd.setCursor(0, 1);
  lcd.print("BACKWARD!           ");
}

void turnLeft()
{
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);
  analogWrite(ENA, 200);
  analogWrite(ENB, 200);
  lcd.setCursor(0, 1);
  lcd.print("TURN LEFT!           ");
}

void turnRight()
{
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, LOW);
  analogWrite(ENA, 200);
  analogWrite(ENB, 200);
  lcd.setCursor(0, 1);
  lcd.print("TURN RIGHT!           ");
}

void stopMotors()
{
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, LOW);
  analogWrite(ENA, 0);
  analogWrite(ENB, 0);
  lcd.setCursor(0, 1);
  lcd.print("STOPPP!           ");
}


void applyCommand() {
  if (currentCommand == "FORWARD") {
    digitalWrite(IN1, LOW);
    digitalWrite(IN2, HIGH);
    digitalWrite(IN3, HIGH);
    digitalWrite(IN4, LOW);
    analogWrite(ENA, 255);
    analogWrite(ENB, 255);
    lcd.setCursor(0, 1);
    lcd.print("Web_FORWARD!           ");
  } else if (currentCommand == "BACKWARD") {
    digitalWrite(IN1, HIGH);
    digitalWrite(IN2, LOW);
    digitalWrite(IN3, LOW);
    digitalWrite(IN4, HIGH);
    analogWrite(ENA, 200);
    analogWrite(ENB, 200);
    lcd.setCursor(0, 1);
    lcd.print("Web_BACKWARD!           ");
  } else if (currentCommand == "LEFT") {
    digitalWrite(IN1, LOW);
    digitalWrite(IN2, LOW);
    digitalWrite(IN3, HIGH);
    digitalWrite(IN4, LOW);
    analogWrite(ENA, 200);
    analogWrite(ENB, 200);
    lcd.setCursor(0, 1);
    lcd.print("Web_TURN LEFT!           ");
  } else if (currentCommand == "RIGHT") {
    digitalWrite(IN1, LOW);
    digitalWrite(IN2, HIGH);
    digitalWrite(IN3, LOW);
    digitalWrite(IN4, LOW);
    analogWrite(ENA, 200);
    analogWrite(ENB, 200);
    lcd.setCursor(0, 1);
    lcd.print("Web_TURN RIGHT!           ");
  } else if (currentCommand == "STOP") {
    digitalWrite(IN1, LOW);
    digitalWrite(IN2, LOW);
    digitalWrite(IN3, LOW);
    digitalWrite(IN4, LOW);
    analogWrite(ENA, 0);
    analogWrite(ENB, 0);
    lcd.setCursor(0, 1);
    lcd.print("Web_STOPPP!           ");
  }
}