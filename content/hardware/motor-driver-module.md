---
publish: true
title: Motor Driver Module
date: '2026-03-18'
---
> Controls water pump for automated irrigation in [[Garden Monitor]].

---

## Specs

- **Type:** H-bridge motor driver (with heatsink)
- **Likely model:** L298N or similar dual H-bridge
- **Channels:** 2 DC motors or 1 stepper
- **Voltage:** 5–35 V motor supply
- **Logic:** 5 V

## Role in Project

- Drives a 12 V water pump based on soil moisture thresholds
- Controlled by [[Arduino Mega]] digital output pins
- Watering logic: if [[Capacitive Soil Moisture Sensor]] reads below threshold → activate pump for N seconds

## Wiring (Typical L298N)

| Pin | Connection | Notes |
|-----|-----------|-------|
| IN1 | Arduino D7 | Direction control |
| IN2 | Arduino D8 | Direction control |
| ENA | Arduino PWM pin | Speed control (optional) |
| OUT1 | Pump + | Motor terminal |
| OUT2 | Pump − | Motor terminal |
| 12V | External PSU | Motor power supply |
| GND | Common GND | Shared with Arduino |

## Safety

- [ ] Add a flyback diode across pump terminals
- [ ] Ensure common ground between driver and Arduino
- [ ] Add a manual override switch
- [ ] Set max watering duration + cooldown period in firmware

## Notes

-

---

**Links:** [[Hardware Inventory]] · [[Arduino Mega]] · [[Capacitive Soil Moisture Sensor]]

#garden-monitor #hardware #actuator #pump
