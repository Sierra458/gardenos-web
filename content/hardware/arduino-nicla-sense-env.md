---
publish: true
title: "Arduino Nicla Sense Env"
date: 2026-03-18
---
> Environmental sensor board for air quality and climate monitoring in [[Garden Monitor]].

---

## Specs

- **Sensors:**
  - Temperature & humidity (HS4001)
  - Indoor air quality / gas (ZMOD4410)
  - Outdoor air quality (ZMOD4510)
- **Interface:** I2C (acts as sensor shield for host board)
- **Power:** Ultra-low power
- **Purchased:** Dec 11, 2025 · $39.00

## Role in Project

- Monitor ambient temperature and humidity near plants
- Track air quality (VOCs, CO₂ equivalent) in greenhouse or indoor grow area
- Pair with [[Arduino Mega]] as host via I2C
- Data feeds into the central dashboard on [[Raspberry Pi 5]]

## Wiring

| Pin | Connection | Notes |
|-----|-----------|-------|
| SDA | Host SDA | I2C data |
| SCL | Host SCL | I2C clock |
| VCC | 3.3 V | |
| GND | GND | |

## Notes

-

---

**Links:** [[Hardware Inventory]] · [[Arduino Nicla Vision]] · [[Capacitive Soil Moisture Sensor]]

#garden-monitor #hardware #sensor #environment
