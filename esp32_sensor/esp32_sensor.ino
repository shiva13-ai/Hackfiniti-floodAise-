/*
 * FloodGuard AI — ESP32 Ground-Truth Sensor Firmware
 * ====================================================
 * Reads rain intensity (analog) and water level (ultrasonic)
 * and POSTs to the FloodGuard server every 10 seconds.
 *
 * Hardware:
 *   - Rain sensor: Analog pin (A0 / GPIO36)
 *   - Ultrasonic sensor: HC-SR04 (TRIG=GPIO5, ECHO=GPIO18)
 *
 * Configuration:
 *   - Set WiFi credentials below
 *   - Set server IP/port
 *   - Set your device's sensor ID and API key
 *     (obtained from the FloodGuard "Add Device" dialog)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ============ CONFIGURATION ============
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* SERVER_IP     = "192.168.1.100";   // Your FloodGuard server IP
const int   SERVER_PORT   = 5000;
const char* SENSOR_ID     = "ESP-001";          // Must match registered sensor ID
const char* API_KEY       = "fgk_your_api_key_here";  // From device registration
// =======================================

// Hardware pins
#define RAIN_SENSOR_PIN  36   // Analog input (VP)
#define TRIG_PIN         5
#define ECHO_PIN         18

// Calibration
#define RAIN_MAX_ADC     4095.0
#define RAIN_MAX_MMHR    100.0    // Max mm/hr at full ADC

// Timing
#define SEND_INTERVAL_MS 10000   // 10 seconds

unsigned long lastSendTime = 0;

void setup() {
    Serial.begin(115200);
    Serial.println("\n=== FloodGuard ESP32 Sensor ===");

    // Hardware setup
    pinMode(RAIN_SENSOR_PIN, INPUT);
    pinMode(TRIG_PIN, OUTPUT);
    pinMode(ECHO_PIN, INPUT);

    // WiFi connection
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    Serial.print("Connecting to WiFi");
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 30) {
        delay(500);
        Serial.print(".");
        attempts++;
    }

    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\nWiFi connected!");
        Serial.print("IP: ");
        Serial.println(WiFi.localIP());
    } else {
        Serial.println("\nWiFi connection FAILED. Restarting...");
        ESP.restart();
    }
}

float readRainIntensity() {
    int raw = analogRead(RAIN_SENSOR_PIN);
    // Convert ADC to mm/hr (linear mapping, adjust for your sensor)
    float mmhr = (raw / RAIN_MAX_ADC) * RAIN_MAX_MMHR;
    return mmhr;
}

float readWaterLevel() {
    // HC-SR04 ultrasonic distance measurement
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);

    long duration = pulseIn(ECHO_PIN, HIGH, 30000);  // 30ms timeout
    if (duration == 0) return 0;

    // Convert to cm (speed of sound = 343 m/s)
    float distance_cm = (duration * 0.0343) / 2.0;

    // Water level = sensor height - distance to water surface
    // Assumes sensor is mounted 300cm above ground
    float waterLevel = 300.0 - distance_cm;
    if (waterLevel < 0) waterLevel = 0;

    return waterLevel;
}

void sendReading(float rainIntensity, float waterLevel) {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi disconnected. Reconnecting...");
        WiFi.reconnect();
        delay(2000);
        return;
    }

    HTTPClient http;
    String url = String("http://") + SERVER_IP + ":" + SERVER_PORT + "/api/sensors/data";
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-api-key", API_KEY);

    // Build JSON payload
    StaticJsonDocument<256> doc;
    doc["sensorId"] = SENSOR_ID;
    doc["rainIntensity"] = round(rainIntensity * 10) / 10.0;   // 1 decimal
    doc["waterLevel"] = round(waterLevel * 10) / 10.0;

    String payload;
    serializeJson(doc, payload);

    Serial.print("POST → ");
    Serial.println(payload);

    int httpCode = http.POST(payload);

    if (httpCode == 201) {
        Serial.println("✅ Data sent successfully");
    } else {
        Serial.print("❌ HTTP Error: ");
        Serial.println(httpCode);
        String response = http.getString();
        Serial.println(response);
    }

    http.end();
}

void loop() {
    unsigned long now = millis();

    if (now - lastSendTime >= SEND_INTERVAL_MS) {
        lastSendTime = now;

        float rain = readRainIntensity();
        float water = readWaterLevel();

        Serial.printf("Rain: %.1f mm/hr | Water: %.1f cm\n", rain, water);

        sendReading(rain, water);
    }
}
