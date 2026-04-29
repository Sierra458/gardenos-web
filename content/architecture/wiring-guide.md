---
publish: true
title: "Wiring Guide"
date: 2026-03-19
---
> Step-by-step beginner wiring guide for the [[Garden Monitor]] project.
> ⚠️ Always wire with the Arduino **unplugged from USB/power**.

---

## What You Need for This Step

| Item | Qty | Notes |
|------|-----|-------|
| Arduino Mega 2560 | 1 | The big blue board |
| Gikfun Capacitive Soil Moisture Sensor v1.2 | 2 | The black PCB sticks |
| Jumper wires (female-to-male) | 6 | 3 wires per sensor |
| USB Type-B cable | 1 | To connect Mega to your PC (and later to Pi 5) |
| A cup of water + dry soil | — | For calibration testing |

---

## Understanding the Sensor

Your Gikfun capacitive soil moisture sensor v1.2 has **3 wires** coming from a connector:

| Wire Color | Label on PCB | What It Does |
|-----------|-------------|-------------|
| **Red** | VCC | Power (3.3V or 5V) |
| **Black** | GND | Ground |
| **Yellow** | AOUT | Analog signal output (the moisture reading) |

The sensor outputs a **voltage** on the yellow wire that changes based on moisture:
- **Dry air/soil** → higher number (around 500–600)
- **Wet soil/water** → lower number (around 200–300)

> 💡 Capacitive sensors are better than the cheap metal-prong ones because they don't corrode over time in wet soil.

---

## Understanding the Arduino Mega Pins

Looking at the Arduino Mega with the USB port facing LEFT:

```
                    USB PORT
                    ┌──────┐
                    │      │
    ┌───────────────┴──────┴───────────────┐
    │                                       │
    │  DIGITAL PINS (top edge)              │
    │  0  1  2  3  4  5  6  7  8 ... 53    │
    │                                       │
    │         ┌──────────────┐              │
    │         │  ATmega2560  │              │
    │         │    chip      │              │
    │         └──────────────┘              │
    │                                       │
    │  ANALOG PINS (bottom edge)            │
    │  A0 A1 A2 A3 A4 A5 ... A15           │
    │                                       │
    │  POWER PINS (bottom-left cluster)     │
    │  5V  3.3V  GND  GND  VIN             │
    │                                       │
    └───────────────────────────────────────┘
```

**We need:**
- **A0** — Analog pin for Sensor 1 (Lavender zone)
- **A1** — Analog pin for Sensor 2 (Potato tower zone)
- **5V** — Power for both sensors
- **GND** — Ground for both sensors

---

## Step-by-Step Wiring

### Sensor 1 — Lavender Zone (Zone 2)

| Sensor Wire | → | Arduino Mega Pin | How to Find It |
|------------|---|-----------------|----------------|
| **Red** (VCC) | → | **5V** | Bottom-left power cluster, labeled "5V" |
| **Black** (GND) | → | **GND** | Right next to 5V, labeled "GND" |
| **Yellow** (AOUT) | → | **A0** | Bottom edge, first analog pin, labeled "A0" |

### Sensor 2 — Potato Tower (Zone 4)

| Sensor Wire | → | Arduino Mega Pin | How to Find It |
|------------|---|-----------------|----------------|
| **Red** (VCC) | → | **5V** | Same 5V pin (can share with Sensor 1) |
| **Black** (GND) | → | **GND** | Same GND pin (can share with Sensor 1) |
| **Yellow** (AOUT) | → | **A1** | Bottom edge, second analog pin, labeled "A1" |

> 💡 **Sharing power pins is fine.** Both sensors draw very little current. You can plug both red wires into the same 5V pin and both black wires into the same GND pin. If it's physically difficult, the Mega has multiple GND pins — use any of them.

---

## Wiring Diagram (Visual)

![Soil moisture sensor wiring to Arduino Mega 2560](/_assets/wiring-soil-sensors.svg)

## Wiring Diagram (Text Version)

```
ARDUINO MEGA 2560
┌─────────────────────────────────────────────┐
│                                             │
│                                             │
│   5V  ─────────┬──────────── Red (Sensor 1) │
│                 │                            │
│                 └──────────── Red (Sensor 2) │
│                                             │
│   GND ─────────┬──────────── Blk (Sensor 1) │
│                 │                            │
│                 └──────────── Blk (Sensor 2) │
│                                             │
│   A0  ─────────────────────── Yel (Sensor 1)│
│                                             │
│   A1  ─────────────────────── Yel (Sensor 2)│
│                                             │
└─────────────────────────────────────────────┘

              SENSOR 1              SENSOR 2
            (Lavender)          (Potato Tower)
         ┌──────────────┐     ┌──────────────┐
         │ Capacitive   │     │ Capacitive   │
         │ Soil Moisture│     │ Soil Moisture│
         │ Sensor v1.2  │     │ Sensor v1.2  │
         │              │     │              │
         │  VCC GND AOUT│     │  VCC GND AOUT│
         │  (R) (B) (Y) │     │  (R) (B) (Y) │
         └──────────────┘     └──────────────┘
              │              │
              ▼              ▼
         Stick into        Stick into
         lavender pot      potato tower
```

---

## After Wiring — Quick Checklist

- [ ] Red wires go to 5V (NOT 3.3V — these sensors work better at 5V with the Mega)
- [ ] Black wires go to GND
- [ ] Yellow wire from Sensor 1 goes to A0
- [ ] Yellow wire from Sensor 2 goes to A1
- [ ] No wires are touching each other where they shouldn't
- [ ] USB cable is plugged into the Mega's USB-B port
- [ ] The other end of the USB cable goes to your PC (for now) or Pi 5 (later)

---

## Next Step

→ Go to [[Arduino Setup Guide]] to install the Arduino IDE and upload the sensor reading code.

---

**Links:** [[Garden Monitor]] · [[Outdoor Watering System]] · [[Capacitive Soil Moisture Sensor]] · [[Arduino Mega]] · [[Arduino Setup Guide]]

#garden-monitor #wiring #beginner
