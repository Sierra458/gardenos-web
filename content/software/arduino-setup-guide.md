---
publish: true
title: Arduino Setup Guide
date: '2026-03-19'
---
> Step-by-step guide to install the Arduino IDE, upload code, and read soil moisture sensors.
> Part of the [[Garden Monitor]] project.

---

## Overview — What We're Building

By the end of this guide, your Arduino Mega will:
1. Read 2 soil moisture sensors every 5 seconds
2. Print the readings to the Serial Monitor (so you can see them on your PC)
3. Send JSON-formatted data over USB serial (so the Pi 5 can read them later)
4. Blink the onboard LED when it takes a reading (so you know it's working)

---

## Part 1: Install Arduino IDE

### Step 1 — Download

1. Go to **https://www.arduino.cc/en/software**
2. Download **Arduino IDE 2.x** for Windows
3. Run the installer, accept defaults, click through

### Step 2 — First Launch

1. Open Arduino IDE
2. It will download some initial packages — let it finish
3. You should see a blank sketch with `setup()` and `loop()`

### Step 3 — Connect Your Arduino Mega

1. Plug the USB-B cable into the Mega and into your PC
2. In Arduino IDE, look at the **top toolbar** — you should see a dropdown that says something like:
   - `Arduino Mega or Mega 2560` on `COM3` (the COM number may vary)
3. If it says "No board selected":
   - Click the dropdown → Select board → Search for "Mega"
   - Select **Arduino Mega or Mega 2560**
   - Select the COM port that appeared when you plugged in

> 💡 **Not seeing a COM port?** You may need the CH340 USB driver if your Mega is a clone. Search "CH340 driver download" and install it.

---

## Part 2: Upload the Sensor Reading Code

### Step 4 — Create a New Sketch

1. In Arduino IDE: **File → New Sketch**
2. Delete everything in the editor
3. Copy and paste the **entire code** below (also saved at `Software/Arduino/garden_monitor_sensors.ino` in this vault)

Here is the complete code:

```cpp
// =============================================
// Garden Monitor — Soil Moisture Sensor Reader
// Arduino Mega 2560
// =============================================
// Reads 2 capacitive soil moisture sensors on A0 and A1
// Sends JSON data over serial to the Raspberry Pi 5
// =============================================

// --- PIN DEFINITIONS ---
const int SENSOR_LAVENDER = A0;   // Sensor 1: Lavender zone
const int SENSOR_POTATO   = A1;   // Sensor 2: Potato tower zone
const int LED_PIN         = 13;   // Onboard LED (blinks on each reading)

// --- TIMING ---
const unsigned long READ_INTERVAL = 5000;  // Read sensors every 5 seconds (5000ms)
unsigned long lastReadTime = 0;

// --- CALIBRATION VALUES ---
// You'll update these after running the calibration steps below.
// These are starting estimates for the Gikfun capacitive sensor v1.2 at 5V.
const int DRY_AIR_VALUE   = 580;  // Sensor reading in open air (bone dry)
const int WATER_VALUE     = 230;  // Sensor reading fully submerged in water

// --- SETUP (runs once when Mega powers on) ---
void setup() {
  // Start serial communication at 9600 baud
  Serial.begin(9600);
  
  // Set LED pin as output
  pinMode(LED_PIN, OUTPUT);
  
  // Wait for serial connection to be ready
  while (!Serial) {
    ; // Wait (needed for some boards)
  }
  
  // Startup message
  Serial.println("================================");
  Serial.println("Garden Monitor v1.0");
  Serial.println("Sensors: A0 (Lavender), A1 (Potato)");
  Serial.println("Reading every 5 seconds...");
  Serial.println("================================");
  
  // Blink LED 3 times to show we're alive
  for (int i = 0; i < 3; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(200);
    digitalWrite(LED_PIN, LOW);
    delay(200);
  }
}

// --- MAIN LOOP (runs forever) ---
void loop() {
  unsigned long currentTime = millis();
  
  // Only read sensors when the interval has passed
  if (currentTime - lastReadTime >= READ_INTERVAL) {
    lastReadTime = currentTime;
    
    // Blink LED to show a reading is happening
    digitalWrite(LED_PIN, HIGH);
    
    // --- READ SENSORS ---
    // Take multiple readings and average them for stability
    int lavenderRaw = readSensorAverage(SENSOR_LAVENDER, 10);
    int potatoRaw   = readSensorAverage(SENSOR_POTATO, 10);
    
    // --- CONVERT TO PERCENTAGE ---
    // 0% = bone dry (air value), 100% = soaking wet (water value)
    int lavenderPct = map(lavenderRaw, DRY_AIR_VALUE, WATER_VALUE, 0, 100);
    int potatoPct   = map(potatoRaw,   DRY_AIR_VALUE, WATER_VALUE, 0, 100);
    
    // Clamp to 0-100 range
    lavenderPct = constrain(lavenderPct, 0, 100);
    potatoPct   = constrain(potatoPct,   0, 100);
    
    // --- SEND DATA AS JSON ---
    // This is what the Raspberry Pi 5 will read over USB serial
    Serial.print("{");
    Serial.print("\"lavender_raw\":");
    Serial.print(lavenderRaw);
    Serial.print(",\"lavender_pct\":");
    Serial.print(lavenderPct);
    Serial.print(",\"potato_raw\":");
    Serial.print(potatoRaw);
    Serial.print(",\"potato_pct\":");
    Serial.print(potatoPct);
    Serial.print(",\"uptime_sec\":");
    Serial.print(currentTime / 1000);
    Serial.println("}");
    
    // Turn LED off
    digitalWrite(LED_PIN, LOW);
  }
}

// --- HELPER: Read a sensor pin multiple times and return the average ---
// This smooths out electrical noise for more stable readings.
int readSensorAverage(int pin, int numReadings) {
  long total = 0;
  for (int i = 0; i < numReadings; i++) {
    total += analogRead(pin);
    delay(10);  // Short delay between reads for ADC to settle
  }
  return total / numReadings;
}
```

### Step 5 — Upload the Code

1. Make sure your Mega is selected in the board dropdown (top toolbar)
2. Click the **→ (Upload)** button (right arrow icon in the top-left)
3. You'll see:
   - "Compiling sketch..." (wait 10–20 seconds)
   - "Uploading..." (a few seconds)
   - "Done uploading." ← success!

> ⚠️ If you get an error, check: Is the correct board selected? Is the correct COM port selected? Is the USB cable a data cable (not charge-only)?

### Step 6 — Open the Serial Monitor

1. Click **Tools → Serial Monitor** (or the magnifying glass icon top-right)
2. Make sure the baud rate dropdown at the bottom says **9600**
3. You should see output like:

```
================================
Garden Monitor v1.0
Sensors: A0 (Lavender), A1 (Potato)
Reading every 5 seconds...
================================
{"lavender_raw":562,"lavender_pct":5,"potato_raw":558,"potato_pct":6,"uptime_sec":5}
{"lavender_raw":560,"lavender_pct":5,"potato_raw":555,"potato_pct":7,"uptime_sec":10}
```

> 🎉 **If you see JSON lines appearing every 5 seconds, your wiring is correct and the code is working!**

---

## Part 3: Calibrate Your Sensors

The raw readings will only mean something useful after you calibrate them with YOUR soil.

### Step 7 — Dry Air Baseline

1. Hold both sensors in the open air (not touching anything)
2. Note the raw values — they should be around 550–600
3. Write down the number: `DRY_AIR_VALUE = ___`

### Step 8 — Water Baseline

1. Put both sensors in a cup of water (only the black PCB part — keep the connector and wires DRY)
2. Note the raw values — they should drop to around 200–280
3. Write down the number: `WATER_VALUE = ___`

### Step 9 — Update Calibration in Code

1. In the Arduino code, find these lines near the top:
   ```cpp
   const int DRY_AIR_VALUE   = 580;
   const int WATER_VALUE     = 230;
   ```
2. Replace the numbers with YOUR measured values
3. Re-upload the code (click Upload again)

### Step 10 — Soil Test

1. Stick Sensor 1 into the lavender pot soil
2. Stick Sensor 2 into the potato tower soil
3. Watch the readings — the percentage should now show a meaningful 0–100% moisture level
4. Water the soil a bit and watch the numbers change — they should go UP toward 100%
5. Let it dry and watch them go DOWN toward 0%

---

## Part 4: Understanding the Output

Each line the Mega sends looks like this:

```json
{"lavender_raw":385,"lavender_pct":55,"potato_raw":310,"potato_pct":77,"uptime_sec":60}
```

| Field | Meaning |
|-------|---------|
| `lavender_raw` | Raw analog reading (0–1023) from the lavender sensor |
| `lavender_pct` | Moisture percentage (0% dry → 100% wet) |
| `potato_raw` | Raw analog reading from the potato sensor |
| `potato_pct` | Moisture percentage |
| `uptime_sec` | How many seconds the Mega has been running |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| All readings are 0 | Check wires — yellow wire probably not connected to A0/A1 |
| All readings are 1023 | Sensor VCC not connected to 5V, or sensor is dead |
| Readings don't change in water | Make sure only the flat PCB part is submerged, not the connector |
| Readings jump around wildly | Bad connection — check jumper wires are firmly seated |
| Serial Monitor shows garbage text | Wrong baud rate — set it to 9600 at the bottom of Serial Monitor |
| "avrdude: stk500v2_ReceiveMessage(): timeout" | Wrong board or COM port selected. Try a different USB port. |

---

## Next Step

→ Go to [[Pi 5 Setup Guide]] to set up the Raspberry Pi 5 to receive this data.

---

**Links:** [[Garden Monitor]] · [[Wiring Guide]] · [[Pi 5 Setup Guide]] · [[Outdoor Watering System]]

#garden-monitor #software #arduino #beginner
