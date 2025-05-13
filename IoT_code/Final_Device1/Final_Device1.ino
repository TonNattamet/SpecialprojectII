// Final device1
#include <WiFi.h>
#include <PubSubClient.h>
#include <LiquidCrystal_I2C.h>
#include <Wire.h>

// Device 1
const char *ssid = "TTTT";
const char *password = "123456Aa";
const char *mqttServer = "broker.netpie.io";
const int mqttPort = 1883;
const char *mqttClientID = "0e01f7ba-ce71-4f50-ba2c-88004562dea5";
const char *mqttUsername = "915y5BmnrCoP5kNn7M16TpxGxSneWyB2";
const char *mqttPassword = "MiRT8kVcWvHLbvbH2rRnX8wxf1ZE6yVS";

const char *pubTopic = "@msg/toDevice2"; 

const char *subTopic_step = "@msg/toDevice1/step";
const char *subTopic_far = "@msg/toDevice1/far";
const char *subTopic_fall = "@msg/toDevice1/fall";
const char *subTopic_heartrate = "@msg/toDevice1/heartrate";

const char *subtopic_webcontrol = "@msg/webcontrol";
const char *subtopic_websetting = "@msg/websetting";

const char *shadow_topic = "@shadow/data/update";

WiFiClient espClient;
PubSubClient client(espClient);
LiquidCrystal_I2C lcd(0x27, 20, 4);

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

float Total_step_m = 0;
int BPM = 0;
String farStatus = "";
String fallStatus = "";
String currentCommand = "";
bool WebCommandReceived = false;
int setupStage = 0;

int Collision_count1 = 0;

int speedValue[] = {200, 210, 220, 230, 240, 255};
int delayValue[] = {1, 2, 3, 4, 5};
int distanceValue[] = {10, 20, 30, 40, 50};

int speedIndex = 0, delayIndex = 0;
int distanceIndex = 0;

void callback(char *topic, byte *payload, unsigned int length)
{
    String message;
    for (int i = 0; i < length; i++)
    {
        message += (char)payload[i];
    }
    Serial.print("Received message on topic: ");
    Serial.println(topic);
    Serial.print("Message: ");
    Serial.println(message);

    if (String(topic) == subTopic_step)
    {
        Total_step_m = message.toFloat(); // Convert string to float
    }
    else if (String(topic) == subTopic_far)
    {
        {
            if (message == "NORMAL" || message == "FAR")
            {
                farStatus = message;
            }
        }
    }
    else if (String(topic) == subTopic_fall)
    {

        {
            if (message == "Stable" || message == "Fall Forward" || message == "Fall Backward" || message == "Fall Right" || message == "Fall Left")
            {
                fallStatus = message;
            }
        }
    }
    else if (String(topic) == subTopic_heartrate)
    {
        BPM = message.toInt();
    }
    else if (String(topic) == subtopic_webcontrol)
    {
        currentCommand = message;
    }
    else if (String(topic) == subtopic_websetting)
    {
        Serial.println("รับค่าตั้งค่าจากเว็บ");

        if (message.startsWith("SETUP|"))
        {
            WebSetting(message); // ส่ง message เข้าไป
        }
    }
}

void WebSetting(String message)
{
    int speedIndexTemp = speedIndex;
    int delayIndexTemp = delayIndex;
    int distanceIndexTemp = distanceIndex;

    int speed = 255;
    int delay = 1;
    int distance = 30;

    // ตัวอย่าง message: SETUP|SPEED:255|DELAY:1|DISTANCE:30
    int speedPos = message.indexOf("SPEED:");
    int delayPos = message.indexOf("DELAY:");
    int distPos = message.indexOf("DISTANCE:");

    if (speedPos != -1)
    {
        int nextDelim = message.indexOf("|", speedPos);
        String spd = message.substring(speedPos + 6, nextDelim == -1 ? message.length() : nextDelim);
        speed = spd.toInt();
    }
    if (delayPos != -1)
    {
        int nextDelim = message.indexOf("|", delayPos);
        String dly = message.substring(delayPos + 6, nextDelim == -1 ? message.length() : nextDelim);
        delay = dly.toInt();
    }
    if (distPos != -1)
    {
        String dst = message.substring(distPos + 9);
        distance = dst.toInt();
    }

    // Map ค่าที่ได้มาเป็น index ของ array
    for (int i = 0; i < 6; i++)
    {
        if (speedValue[i] == speed)
        {
            speedIndexTemp = i;
            break;
        }
    }

    for (int i = 0; i < 5; i++)
    {
        if (delayValue[i] == delay)
        {
            delayIndexTemp = i;
            break;
        }
    }

    for (int i = 0; i < 5; i++)
    {
        if (distanceValue[i] == distance)
        {
            distanceIndexTemp = i;
            break;
        }
    }

    // ถ้าค่าตรง ให้ตั้งค่าจริง
    speedIndex = speedIndexTemp;
    delayIndex = delayIndexTemp;
    distanceIndex = distanceIndexTemp;

    Serial.println("อัปเดตค่าจากเว็บไซต์แล้ว:");
    Serial.print("SpeedIndex: ");
    Serial.println(speedIndex);
    Serial.print("DelayIndex: ");
    Serial.println(delayIndex);
    Serial.print("DistanceIndex: ");
    Serial.println(distanceIndex);

    client.publish(pubTopic, String(distanceIndex).c_str());
    Serial.println("Sent Web:");
    Serial.println(pubTopic);

    setupStage = 2; // เริ่มเดินทันที
}

void reconnect()
{
    while (!client.connected())
    {
        lcd.setCursor(0, 0);
        lcd.print("Welcome To Walker");
        lcd.setCursor(0, 1);
        lcd.print("Connecting Wifi...");
        Serial.print("Attempting MQTT connection...");
        if (client.connect(mqttClientID, mqttUsername, mqttPassword))
        {
            lcd.setCursor(0, 2);
            lcd.print("WiFi Connected!");
            Serial.println("Connected to MQTT!");
            // subTopic
            client.subscribe(subTopic_step);
            client.subscribe(subTopic_far);
            client.subscribe(subTopic_fall);
            client.subscribe(subTopic_heartrate);
            client.subscribe(subtopic_webcontrol);
            client.subscribe(subtopic_websetting);
        }
        else
        {
            lcd.setCursor(0, 2);
            lcd.print("WiFi Failed!      ");
            lcd.setCursor(0, 3);
            lcd.print("Try again ...");
            Serial.print("Failed, rc=");
            Serial.print(client.state());
            Serial.println(" try again in 1 seconds...");
            delay(1000);
        }
    }
}

void setup()
{
    Serial.begin(115200);
    lcd.init();
    lcd.backlight();
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        lcd.setCursor(0, 0);
        lcd.print("WiFi Failed!");
        lcd.setCursor(0, 1);
        lcd.print("Try again ...");
        Serial.print(".");
    }
    Serial.println("WiFi Connected!");

    client.setServer(mqttServer, mqttPort);
    client.setCallback(callback);
    reconnect();

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

void stage_lcd_end()
{
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("FINISHED WALK!!");
    lcd.setCursor(0, 1);
    lcd.print("Press any BUTTON!!");
    lcd.setCursor(0, 2);
    lcd.print("(RED YELLOW GREEN)");
    if (digitalRead(btnGreen) == LOW || digitalRead(btnYellow) == LOW || digitalRead(btnRed) == LOW)
    {
        setupStage = 0;
    }
}

void WebDisplay()
{
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Control by Website!");
    if (currentCommand == "FORWARD")
    {
        lcd.setCursor(0, 1);
        lcd.print("GO FORWARD!");
    }
    else if (currentCommand == "BACKWARD")
    {
        lcd.setCursor(0, 1);
        lcd.print("GO BACKWARD!");
    }
    else if (currentCommand == "LEFT")
    {
        lcd.setCursor(0, 1);
        lcd.print("GO LEFT!");
    }
    else if (currentCommand == "RIGHT")
    {
        lcd.setCursor(0, 1);
        lcd.print("GO RIGHT!");
    }
    else if (currentCommand == "STOP")
    {
        lcd.setCursor(0, 1);
        lcd.print("STOP!!!");
    }
}

void Webcommand()
{
    if (currentCommand == "FORWARD")
    {
        digitalWrite(IN1, LOW);
        digitalWrite(IN2, HIGH);
        digitalWrite(IN3, HIGH);
        digitalWrite(IN4, LOW);
        analogWrite(ENA, 255);
        analogWrite(ENB, 255);
        WebCommandReceived = false;
        setupStage = 4;
    }
    else if (currentCommand == "BACKWARD")
    {
        digitalWrite(IN1, HIGH);
        digitalWrite(IN2, LOW);
        digitalWrite(IN3, LOW);
        digitalWrite(IN4, HIGH);
        analogWrite(ENA, 255);
        analogWrite(ENB, 255);
        WebCommandReceived = false;
        setupStage = 4;
    }
    else if (currentCommand == "LEFT")
    {
        digitalWrite(IN1, LOW);
        digitalWrite(IN2, HIGH);
        digitalWrite(IN3, LOW);
        digitalWrite(IN4, LOW);
        analogWrite(ENA, 255);
        analogWrite(ENB, 255);
        WebCommandReceived = false;
        setupStage = 4;
    }
    else if (currentCommand == "RIGHT")
    {
        digitalWrite(IN1, LOW);
        digitalWrite(IN2, LOW);
        digitalWrite(IN3, HIGH);
        digitalWrite(IN4, LOW);
        analogWrite(ENA, 255);
        analogWrite(ENB, 255);
        WebCommandReceived = false;
        setupStage = 4;
    }
    else if (currentCommand == "STOP")
    {
        if (!WebCommandReceived)
        {
            digitalWrite(IN1, LOW);
            digitalWrite(IN2, LOW);
            digitalWrite(IN3, LOW);
            digitalWrite(IN4, LOW);
            currentCommand = "";
            setupStage = 0;
            WebCommandReceived = true;
        }
    }
}

void check_safety()
{

    long duration, distance;

    digitalWrite(trigPin, LOW);
    delayMicroseconds(2);
    digitalWrite(trigPin, HIGH);
    delayMicroseconds(10);
    digitalWrite(trigPin, LOW);

    duration = pulseIn(echoPin, HIGH);
    distance = duration * 0.034 / 2;
    Serial.print("distance:");
    Serial.println(distance);

    if (farStatus == "NORMAL" && distance > 40 && fallStatus == "Stable")
    {
        lcd.setCursor(0, 2);
        lcd.print("E18_FAR:");
        lcd.print(farStatus);
        lcd.setCursor(0, 3);
        lcd.print("DT:");
        lcd.print(distance);
        lcd.print("|FALL:");
        lcd.print(fallStatus);
        mortor_ongoing();
    }
    else if (farStatus == "FAR" || distance < 40 || fallStatus == "Fall Forward" || fallStatus == "Fall Backward" || fallStatus == "Fall Right" || fallStatus == "Fall Left")
    {
        stopMotors();
        Collision_count1++;
        lcd.setCursor(0, 2);
        lcd.print("E18_FAR:");
        lcd.print(farStatus);
        lcd.setCursor(0, 3);
        lcd.print("DT:");
        lcd.print(distance);
        lcd.print("|FALL:");
        lcd.print(fallStatus);
    }

    if (digitalRead(btnGreen) == LOW || digitalRead(btnYellow) == LOW || digitalRead(btnRed) == LOW)
    {
        lcd.setCursor(0, 3);
        lcd.print("Emergency Stop!!       ");
        stopMotors();
        setupStage = 0;
    }

    lcd.setCursor(0, 1);
    lcd.print("Total_step_m: ");
    lcd.print(Total_step_m);
}

bool anyButtonPressed()
{
    return digitalRead(btnGreen) == LOW || digitalRead(btnYellow) == LOW || digitalRead(btnRed) == LOW;
}

void stage_lcd_welcome()
{
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Welcome to Walker");
    lcd.setCursor(0, 1);
    lcd.print("Press any BUTTON!!");
    lcd.setCursor(0, 2);
    lcd.print("(RED YELLOW GREEN)");
    lcd.setCursor(0, 3);
    lcd.print("BPM:");
    lcd.print(BPM);
    stopMotors();
}

void stage_lcd_setup()
{
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("SetUP");

    lcd.setCursor(0, 1);
    lcd.print("Speed:");
    lcd.print(speedValue[speedIndex]);
    lcd.print("(Red)");

    lcd.setCursor(0, 2);
    lcd.print("Delay:");
    lcd.print(delayValue[delayIndex]);
    lcd.print(" s (Yellow)");

    lcd.setCursor(0, 3);
    lcd.print("Distance:");
    lcd.print(distanceValue[distanceIndex]);
    lcd.print(" m(Green)");
}

void settingButtonInput()
{
    if (digitalRead(btnRed) == LOW)
        speedIndex = (speedIndex + 1) % 6;
    if (digitalRead(btnYellow) == LOW)
        delayIndex = (delayIndex + 1) % 5;
    if (digitalRead(btnGreen) == LOW)
        distanceIndex = (distanceIndex + 1) % 5;

    if (digitalRead(btnLeft) == LOW)
    {
        // msg
        client.publish(pubTopic, String(distanceValue[distanceIndex]).c_str());
        Serial.println("Sent local:");
        Serial.println(pubTopic);
        setupStage = 2;
    }
    if (digitalRead(btnRight) == LOW)
    {
        setupStage = 0;
    }
}

void stage_lcd_ongoing()
{
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Sp:");
    lcd.print(speedValue[speedIndex]);
    lcd.print("|De:");
    lcd.print(delayValue[delayIndex]);
    lcd.print("|Dis:");
    lcd.print(distanceValue[distanceIndex]);
}

bool isMotorRunning = false;
unsigned long lastActionTime = 0;

void mortor_ongoing()
{
    // ตรวจจับการกดปุ่มเลี้ยว
    if (digitalRead(btnLeft) == LOW)
    {
        turnLeft();
        return;
    }
    if (digitalRead(btnRight) == LOW)
    {
        turnRight();
        return;
    }

    unsigned long currentTime = millis();

    if (isMotorRunning)
    {
        // ถ้าเดินมาครบเวลาที่กำหนด -> หยุด
        if (currentTime - lastActionTime >= delayValue[delayIndex] * 1000)
        {
            stopMotors();
            isMotorRunning = false;
            lastActionTime = currentTime;
        }
        else
        {
            forwardMotors();
        }
    }
    else
    {
        // ถ้าหยุดมาครบเวลาที่กำหนด -> เดินต่อ
        if (currentTime - lastActionTime >= delayValue[delayIndex] * 1000)
        {
            forwardMotors();
            isMotorRunning = true;
            lastActionTime = currentTime;
        }
    }
    Serial.print("Total_step_m");
    Serial.println(Total_step_m);
    Serial.print("distanceValue[distanceIndex]");
    Serial.println(distanceValue[distanceIndex]);

    if (Total_step_m > distanceValue[distanceIndex])
    {
        stopMotors();
        lcd.setCursor(0, 3);
        lcd.print("FINISHED WALK!      ");
        Total_step_m = 0;
        setupStage = 3;
    }
}

void forwardMotors()
{
    digitalWrite(IN1, LOW);
    digitalWrite(IN2, HIGH);
    digitalWrite(IN3, HIGH);
    digitalWrite(IN4, LOW);
    analogWrite(ENA, speedValue[speedIndex]);
    analogWrite(ENB, speedValue[speedIndex]);
}
void stopMotors()
{
    digitalWrite(IN1, LOW);
    digitalWrite(IN2, LOW);
    digitalWrite(IN3, LOW);
    digitalWrite(IN4, LOW);
}
void turnLeft()
{
    digitalWrite(IN1, LOW);
    digitalWrite(IN2, HIGH);
    digitalWrite(IN3, LOW);
    digitalWrite(IN4, LOW);
    analogWrite(ENA, 200);
    analogWrite(ENB, 200);
    lcd.setCursor(0, 0);
    lcd.print("TURN LEFT!           ");
}
void turnRight()
{
    digitalWrite(IN1, LOW);
    digitalWrite(IN2, LOW);
    digitalWrite(IN3, HIGH);
    digitalWrite(IN4, LOW);
    analogWrite(ENA, 200);
    analogWrite(ENB, 200);
    lcd.setCursor(0, 0);
    lcd.print("TURN RIGHT!           ");
}



void loop()
{
    if (!client.connected())
    {
        reconnect();
    }
    client.loop();

    Webcommand();
    if (setupStage == 0)
    {
        stage_lcd_welcome();
        if (anyButtonPressed())
            setupStage = 1;
    }
    else if (setupStage == 1)
    {
        stage_lcd_setup();
        settingButtonInput();
    }
    else if (setupStage == 2)
    {
        stage_lcd_ongoing();
        check_safety();
    }
    else if (setupStage == 3)
    {
        stage_lcd_end();
    }
    else if (setupStage == 4)
    {
        WebDisplay();
    }

    // shadow
    String data = "{\"SpeedValue1\":" + String(speedValue[speedIndex]) + ",\"DelayValue1\":" + String(delayValue[delayIndex]) + ",\"DistanceValue1\":" + String(distanceValue[distanceIndex]) + ",\"Collision_count1\":" + String(Collision_count1) + ",\"Stage_now1\":" + String(setupStage) + "}";
    String payload = "{\"data\":" + data + "}";
    char msg_fb[256];
    payload.toCharArray(msg_fb, sizeof(msg_fb));
    client.publish(shadow_topic, msg_fb);

    delay(500);
}