// Final_Device2
#include <WiFi.h>
#include <PubSubClient.h>
#include <MPU6050.h>
#include <HTTPClient.h>
// WiFi & MQTT
const char *ssid = "TTTT";
const char *password = "123456Aa";
const char *mqttServer = "broker.netpie.io";
const int mqttPort = 1883;
const char *mqttClientID = "2aa9bed5-8390-48f8-ae74-ce8e298a45d7";
const char *mqttUsername = "eUssr683Dsh6R9YeBs8XE4TbZ2jBwWVC";
const char *mqttPassword = "xtFPJmMFBCcskdJTHQ8qTXNc3stmBjsz";
const char *pubTopic_step = "@msg/toDevice1/step";
const char *pubTopic_far = "@msg/toDevice1/far";
const char *pubTopic_fall = "@msg/toDevice1/fall";
const char *pubTopic_heartrate = "@msg/toDevice1/heartrate";
const char *subTopic = "@msg/toDevice2";

const char *shadow_topic = "@shadow/data/update";

const char *GAS_URL = "https://script.google.com/macros/s/AKfycbxGEVEzDJf5hwUIO_WaB41Q4FkuSuil8Y8vqoXNKIRZVO3Z0YOCNZis_XpAuWfLDPsN/exec"; // 👈 URL จาก GAS Web App

WiFiClient espClient;
PubSubClient client(espClient);

#define E18_PIN_STEP 33
#define E18_PIN_FAR 32
#define PulsePin 35

int stepCount = 0;
int distanceTarget = 0;

MPU6050 mpu;
int valx, valy, valz;

void callback(char *topic, byte *payload, unsigned int length)
{
    String msg;
    for (int i = 0; i < length; i++){
        msg += (char)payload[i];
    }
    Serial.print("Distance received: ");
    Serial.println(msg);
    distanceTarget = msg.toInt();
    stepCount = 0; 
}

void reconnect()
{
    while (!client.connected()){
        if (client.connect(mqttClientID, mqttUsername, mqttPassword)){
            client.subscribe(subTopic);
            Serial.println("MQTT connected");
        }
        else{
            Serial.print("MQTT failed, rc=");
            Serial.print(client.state());
            delay(3000);
        }
    }
}

String farStatus = "NORMAL";
void send_far()
{
    if (digitalRead(E18_PIN_FAR) == LOW){
        client.publish(pubTopic_far, "NORMAL");
        Serial.println("NORMAL");
        farStatus = "NORMAL";
    }
    else if (digitalRead(E18_PIN_FAR) == HIGH){
        client.publish(pubTopic_far, "FAR");
        Serial.println("FAR");
        farStatus = "FAR";
    }
    delay(2000);
}

float metersPerStep = 0.762;
float Total_step_m = 0;
void send_step()
{
    if (digitalRead(E18_PIN_STEP) == LOW)
    {
        stepCount++;
        Total_step_m = stepCount * metersPerStep;

        if (Total_step_m > distanceTarget)
        {
            stepCount = 0;
        }
        client.publish(pubTopic_step, String(Total_step_m).c_str());
        Serial.print("Total_step_m");
        Serial.println(Total_step_m);
    }
}

String fallStatus = "Stable";
String previousFallStatus = "Stable";
void mpu6050()
{
    int16_t ax, ay, az, gx, gy, gz;
    mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);
    valx = map(ax, -17000, 17000, 0, 180);
    valy = map(ay, -17000, 17000, 0, 180);
    valz = map(az, -17000, 17000, 0, 180);
    String detectedFallStatus = "Stable";
    if (valz < 85)
        detectedFallStatus = "Fall Forward";
    else if (valz > 135)
        detectedFallStatus = "Fall Backward";
    else if (valy < 60)
        detectedFallStatus = "Fall Right";
    else if (valy > 110)
        detectedFallStatus = "Fall Left";
    fallStatus = detectedFallStatus;
    if (detectedFallStatus != "Stable"){
        Serial.println("🚨 " + detectedFallStatus);
        if (detectedFallStatus != previousFallStatus){
            linemessage(); // เรียกส่งเฉพาะเมื่อเปลี่ยนสถานะจากอย่างอื่นมาเป็น "ล้ม"
            previousFallStatus = detectedFallStatus;
        }
        client.publish(pubTopic_fall, detectedFallStatus.c_str());
    }
    else{
        Serial.println("✅ ปกติ");
        client.publish(pubTopic_fall, "Stable");
        fallStatus = "Stable";
        previousFallStatus = "Stable";
    }
}

#define threshold 1800
#define max_valid_signal 3200
#define min_valid_signal 200
#define min_bpm 45
#define max_bpm 180
unsigned long lastBeat = 0;
int bpm = 0;
void heart_rate()
{
    int signal = analogRead(PulsePin);
    static bool pulseDetected = false;
    static unsigned long lastSignalTime = 0;
    if (signal < min_valid_signal){
        if (millis() - lastSignalTime > 2000){
            Serial.println("finger detected");
            client.publish(pubTopic_heartrate, "Wait 10sec");
            lastSignalTime = millis();
        }
        return;
    }
    if (signal > max_valid_signal){
        return;
    }
    static unsigned long sumSignal = 0;
    static int count = 0;
    sumSignal += signal;
    count++;
    if (count >= 10)
    {
        float averageSignal = sumSignal / 3.0;
        float bpmCalculated = sumSignal / 300.0;
        if (bpmCalculated >= min_bpm && bpmCalculated <= max_bpm){
            bpm = bpmCalculated;
            Serial.print("❤️ BPM: ");
            Serial.println(bpm);
            client.publish(pubTopic_heartrate, String(bpm).c_str());
        }
        sumSignal = 0;
        count = 0;
    }
}

String urlEncode(const char *msg)
{
    String encodedMsg = "";
    char c;
    char code[4];
    while ((c = *msg++))
    {
        if (isalnum(c))
        {
            encodedMsg += c;
        }
        else
        {
            sprintf(code, "%%%02X", (unsigned char)c);
            encodedMsg += code;
        }
    }
    return encodedMsg;
}

void linemessage()
{
    if (WiFi.status() == WL_CONNECTED){
        HTTPClient http;
        String message = "แจ้งเตือนจากอุปกรณ์: " + fallStatus;
        String encodedMessage = urlEncode(message.c_str());
        String fullUrl = String(GAS_URL) + "?msg=" + encodedMessage;
        http.begin(fullUrl);
        int httpCode = http.GET();
        if (httpCode > 0){
            String payload = http.getString();
            Serial.println("📲 LINE Response: " + payload);
        }
        else{
            Serial.print("❌ Failed to send LINE msg. Code: ");
            Serial.println(httpCode);
        }
        http.end();
    }
}

void setup(){
    Serial.begin(115200);
    pinMode(E18_PIN_STEP, INPUT);
    pinMode(E18_PIN_FAR, INPUT);
    pinMode(PulsePin, INPUT);
    Wire.begin(21, 22);
    mpu.initialize();
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED){
        Serial.print(".");
        delay(500);
    }
    Serial.println("WiFi Connected");
    client.setServer(mqttServer, mqttPort);
    client.setCallback(callback);
    reconnect();
}

void loop()
{
    if (!client.connected())
        reconnect();
    client.loop();
    if (distanceTarget > 0){
        send_step();
    }
    send_far();
    mpu6050();
    heart_rate();

    String data = "{\"Heart_RateValue2\":" + String(bpm) + ",\"StepValue2\":" + String(Total_step_m) + ",\"FallStatusValue2\":\"" + fallStatus + "\",\"FarStatusValue2\":\"" + farStatus + "\"}";
    String payload = "{\"data\":" + data + "}";
    char msg_fb[256];
    payload.toCharArray(msg_fb, sizeof(msg_fb));
    client.publish(shadow_topic, msg_fb);
    delay(2000);
}
