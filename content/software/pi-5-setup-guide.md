---
publish: true
title: "Pi 5 Setup Guide"
date: 2026-03-19
---
> Step-by-step guide to set up the Raspberry Pi 5 to receive sensor data from the Arduino Mega.
> Part of the [[Garden Monitor]] project.
> **Prerequisite:** Complete the [[Wiring Guide]] and [[Arduino Setup Guide]] first.

---

## Overview — What We're Building

By the end of this guide, your Raspberry Pi 5 will:
1. Read JSON sensor data from the Arduino Mega over USB serial
2. Display live moisture readings in the terminal
3. Log all readings to a CSV file with timestamps
4. (Future) Store data in a database and serve a web dashboard

---

## Part 1: Set Up the Raspberry Pi 5

### Step 1 — Flash the SD Card

1. On your PC, download **Raspberry Pi Imager** from https://www.raspberrypi.com/software/
2. Insert the 128GB SD card into your PC
3. Open Raspberry Pi Imager:
   - **Device:** Raspberry Pi 5
   - **OS:** Raspberry Pi OS (64-bit) — the default recommended one
   - **Storage:** Your 128GB SD card
4. Click the **gear icon** (⚙️) to edit settings BEFORE writing:
   - **Set hostname:** `gardenpi`
   - **Enable SSH:** ✅ Yes (use password authentication)
   - **Set username:** `matt` (or whatever you prefer)
   - **Set password:** (pick something you'll remember)
   - **Configure WiFi:** Enter your home WiFi name and password
   - **Set locale:** US, Central time
5. Click **Write** and wait for it to finish (~5–10 minutes)

### Step 2 — First Boot

1. Put the SD card into the Pi 5
2. Connect a monitor (HDMI), keyboard, and mouse
3. Plug in the Pi 5 power supply — it will boot up
4. Follow any first-boot setup prompts
5. Once at the desktop, open a **Terminal** (black icon in the taskbar)

### Step 3 — Update Everything

Type these commands one at a time in the terminal:

```bash
sudo apt update
sudo apt upgrade -y
```

This will take a few minutes. Let it finish.

### Step 4 — Install Python Packages

```bash
sudo apt install -y python3-pip python3-serial
pip3 install pyserial --break-system-packages
```

> `pyserial` is the library that lets Python talk to the Arduino over USB.

---

## Part 2: Connect the Arduino Mega

### Step 5 — Plug In the Mega

1. Unplug the Mega from your PC
2. Plug the USB-B cable from the Mega into one of the Pi 5's USB ports
3. The Mega should power on (you'll see its LEDs light up)

### Step 6 — Find the Serial Port

In the Pi 5 terminal:

```bash
ls /dev/ttyACM* /dev/ttyUSB*
```

You should see something like:
```
/dev/ttyACM0
```

That's your Arduino Mega. If you see `/dev/ttyUSB0` instead, that's fine too — just use that path in the code.

> 💡 If nothing shows up, try: `ls /dev/tty*` and look for `ACM` or `USB`. Also try unplugging and replugging the USB cable.

### Step 7 — Quick Test

Let's make sure we can see the Arduino's data:

```bash
cat /dev/ttyACM0
```

You should see JSON lines scrolling every 5 seconds:
```
{"lavender_raw":385,"lavender_pct":55,"potato_raw":310,"potato_pct":77,"uptime_sec":60}
```

Press **Ctrl+C** to stop.

> 🎉 **If you see JSON data, the Pi 5 and Arduino are talking!**

---

## Part 3: Run the Python Serial Listener

### Step 8 — Create the Project Folder

```bash
mkdir -p ~/garden-monitor
cd ~/garden-monitor
```

### Step 9 — Create the Python Script

```bash
nano serial_reader.py
```

Paste the following code (also saved at `Software/Pi5/serial_reader.py` in this vault):

```python
#!/usr/bin/env python3
"""
Garden Monitor — Serial Reader
Reads JSON sensor data from Arduino Mega over USB serial.
Displays live readings and logs to CSV.
"""

import serial
import json
import csv
import os
from datetime import datetime
from time import sleep

# ============================================
# CONFIGURATION — Update these if needed
# ============================================
SERIAL_PORT = "/dev/ttyACM0"   # Change to /dev/ttyUSB0 if needed
BAUD_RATE = 9600
LOG_FILE = "sensor_log.csv"

# Moisture thresholds for alerts
LAVENDER_DRY_THRESHOLD = 30    # Alert if lavender > 30% (too wet!)
POTATO_DRY_THRESHOLD = 40      # Alert if potato < 40% (too dry!)


def setup_csv(filename):
    """Create CSV file with headers if it doesn't exist."""
    if not os.path.exists(filename):
        with open(filename, "w", newline="") as f:
            writer = csv.writer(f)
            writer.writerow([
                "timestamp",
                "lavender_raw", "lavender_pct",
                "potato_raw", "potato_pct",
                "uptime_sec"
            ])
        print(f"  Created log file: {filename}")
    else:
        print(f"  Appending to existing log: {filename}")


def log_to_csv(filename, data):
    """Append one row of sensor data to the CSV file."""
    with open(filename, "a", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([
            datetime.now().isoformat(),
            data.get("lavender_raw", ""),
            data.get("lavender_pct", ""),
            data.get("potato_raw", ""),
            data.get("potato_pct", ""),
            data.get("uptime_sec", ""),
        ])


def check_alerts(data):
    """Check moisture levels and print warnings."""
    alerts = []
    
    lav_pct = data.get("lavender_pct", 0)
    pot_pct = data.get("potato_pct", 0)
    
    # Lavender: warn if TOO WET (overwatering kills lavender)
    if lav_pct > LAVENDER_DRY_THRESHOLD:
        alerts.append(
            f"  ⚠️  LAVENDER TOO WET: {lav_pct}% "
            f"(threshold: {LAVENDER_DRY_THRESHOLD}%)"
        )
    
    # Potato: warn if TOO DRY (potatoes need consistent moisture)
    if pot_pct < POTATO_DRY_THRESHOLD:
        alerts.append(
            f"  ⚠️  POTATO TOO DRY: {pot_pct}% "
            f"(threshold: {POTATO_DRY_THRESHOLD}%)"
        )
    
    return alerts


def display_reading(data, alerts):
    """Print a nicely formatted reading to the terminal."""
    now = datetime.now().strftime("%H:%M:%S")
    lav = data.get("lavender_pct", "?")
    pot = data.get("potato_pct", "?")
    lav_raw = data.get("lavender_raw", "?")
    pot_raw = data.get("potato_raw", "?")
    
    # Build moisture bar (simple ASCII visualization)
    lav_bar = "█" * (lav // 5) + "░" * (20 - lav // 5) if isinstance(lav, int) else ""
    pot_bar = "█" * (pot // 5) + "░" * (20 - pot // 5) if isinstance(pot, int) else ""
    
    print(f"\n  [{now}]")
    print(f"  Lavender : {lav_bar} {lav}% (raw: {lav_raw})")
    print(f"  Potato   : {pot_bar} {pot}% (raw: {pot_raw})")
    
    for alert in alerts:
        print(alert)


def main():
    """Main loop: connect to Arduino, read data, log it."""
    print("=" * 50)
    print("  🌱 Garden Monitor — Serial Reader")
    print("=" * 50)
    print(f"  Port: {SERIAL_PORT}")
    print(f"  Baud: {BAUD_RATE}")
    print()
    
    # Set up CSV logging
    setup_csv(LOG_FILE)
    
    # Connect to Arduino
    print(f"  Connecting to Arduino on {SERIAL_PORT}...")
    try:
        ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=10)
    except serial.SerialException as e:
        print(f"  ❌ Could not open {SERIAL_PORT}: {e}")
        print()
        print("  Troubleshooting:")
        print("  - Is the Arduino plugged into a USB port?")
        print("  - Try: ls /dev/ttyACM* /dev/ttyUSB*")
        print("  - You may need: sudo chmod 666 /dev/ttyACM0")
        return
    
    # Wait for Arduino to reset (it resets when serial connects)
    print("  Waiting for Arduino to initialize...")
    sleep(3)
    
    # Clear any startup messages from Arduino
    while ser.in_waiting:
        ser.readline()
    
    print("  ✅ Connected! Listening for sensor data...")
    print("  Press Ctrl+C to stop.")
    
    reading_count = 0
    
    try:
        while True:
            # Read one line from Arduino
            line = ser.readline().decode("utf-8", errors="ignore").strip()
            
            # Skip empty lines and non-JSON lines
            if not line or not line.startswith("{"):
                continue
            
            # Parse JSON
            try:
                data = json.loads(line)
            except json.JSONDecodeError:
                print(f"  (Skipping bad JSON: {line[:60]})")
                continue
            
            reading_count += 1
            
            # Check for alerts
            alerts = check_alerts(data)
            
            # Display in terminal
            display_reading(data, alerts)
            
            # Log to CSV
            log_to_csv(LOG_FILE, data)
            
            # Every 100 readings, show a summary
            if reading_count % 100 == 0:
                print(f"\n  --- {reading_count} readings logged to {LOG_FILE} ---")
    
    except KeyboardInterrupt:
        print(f"\n\n  Stopped. Total readings logged: {reading_count}")
        print(f"  Log file: {os.path.abspath(LOG_FILE)}")
    
    finally:
        ser.close()
        print("  Serial connection closed.")


if __name__ == "__main__":
    main()
```

Save with **Ctrl+X**, then **Y**, then **Enter**.

### Step 10 — Run It

```bash
python3 serial_reader.py
```

You should see:

```
==================================================
  🌱 Garden Monitor — Serial Reader
==================================================
  Port: /dev/ttyACM0
  Baud: 9600

  Created log file: sensor_log.csv
  Connecting to Arduino on /dev/ttyACM0...
  Waiting for Arduino to initialize...
  ✅ Connected! Listening for sensor data...
  Press Ctrl+C to stop.

  [14:32:05]
  Lavender : ███████████░░░░░░░░░ 55% (raw: 385)
  Potato   : ███████████████░░░░░ 77% (raw: 310)
```

> 🎉 **You now have a working data pipeline: Sensors → Arduino → Pi 5!**

Press **Ctrl+C** to stop. Your readings are saved in `~/garden-monitor/sensor_log.csv`.

---

## Part 4: Permission Fix (If Needed)

If you get a "Permission denied" error when accessing the serial port:

```bash
sudo usermod -aG dialout matt
```

(Replace `matt` with your username.) Then **reboot**:

```bash
sudo reboot
```

---

## Part 5: Run on Startup (Optional)

To make the serial reader start automatically when the Pi boots:

### Step 11 — Create a systemd Service

```bash
sudo nano /etc/systemd/system/garden-monitor.service
```

Paste:

```ini
[Unit]
Description=Garden Monitor Serial Reader
After=multi-user.target

[Service]
Type=simple
User=matt
WorkingDirectory=/home/matt/garden-monitor
ExecStart=/usr/bin/python3 /home/matt/garden-monitor/serial_reader.py
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Save with Ctrl+X, Y, Enter.

### Step 12 — Enable and Start

```bash
sudo systemctl daemon-reload
sudo systemctl enable garden-monitor.service
sudo systemctl start garden-monitor.service
```

Check that it's running:
```bash
sudo systemctl status garden-monitor.service
```

Now the sensor reader will start automatically on every boot and log data 24/7.

---

## What's in Your CSV Log?

Open it with:
```bash
head -20 ~/garden-monitor/sensor_log.csv
```

```csv
timestamp,lavender_raw,lavender_pct,potato_raw,potato_pct,uptime_sec
2026-03-19T14:32:05.123456,385,55,310,77,60
2026-03-19T14:32:10.234567,388,54,308,77,65
...
```

You can later open this in Excel, Google Sheets, or feed it into Grafana/InfluxDB for beautiful charts.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Permission denied" on serial port | Run: `sudo chmod 666 /dev/ttyACM0` (temporary) or add user to dialout group (permanent, see Part 4) |
| "No such file or directory" for /dev/ttyACM0 | Arduino not detected. Try different USB port. Check with `ls /dev/tty*` |
| Script connects but no data appears | Arduino might not be running the sketch. Re-upload via Arduino IDE. |
| Data appears but JSON parse errors | Close Arduino IDE's Serial Monitor — only one program can read the serial port at a time |
| systemd service won't start | Check logs: `journalctl -u garden-monitor.service -f` |

---

## Next Steps

- [ ] **Phase 2 — Adding Watering Control** — Wire up the motor driver and solenoid valves
- [ ] **Phase 3 — Web Dashboard** — Build a Grafana dashboard or custom web UI
- [ ] **Phase 3 — ESP Display** — Show live data on the 5" ESP display

---

**Links:** [[Garden Monitor]] · [[Arduino Setup Guide]] · [[Wiring Guide]] · [[Outdoor Watering System]]

#garden-monitor #software #pi5 #beginner
