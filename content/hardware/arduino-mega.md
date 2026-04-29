---
publish: true
title: Arduino Mega
date: '2026-03-18'
---
> Primary sensor controller for the [[Garden Monitor]] project.

---

## Specs

- **MCU:** ATmega2560
- **Digital I/O:** 54 pins (15 PWM)
- **Analog Inputs:** 16
- **Flash:** 256 KB · **SRAM:** 8 KB
- **Clock:** 16 MHz

## Role in Project

- Reads [[Capacitive Soil Moisture Sensor]] values (analog)
- Interfaces with [[Motor Driver Module]] for pump control
- Connects to [[Arduino Nicla Sense Env]] via I2C
- Sends data to [[Raspberry Pi 5]] via USB serial

## Pin Assignments

| Pin | Connected To | Notes |
|-----|-------------|-------|
| A0 | Soil Moisture Sensor 1 | Analog read |
| A1 | Soil Moisture Sensor 2 | Analog read |
| D7 | Motor Driver IN1 | TBD |
| D8 | Motor Driver IN2 | TBD |
| SDA/SCL | Nicla Sense Env | I2C bus |

## Notes

-

---

**Links:** [[Hardware Inventory]] · [[System Architecture]]

#garden-monitor #hardware #microcontroller
