---
publish: true
title: System Architecture
date: '2026-03-18'
---
> How all the hardware and software connects in [[Garden Monitor]].

---

## Architecture Documents

- **[[Outdoor Watering System]]** — Detailed 4-zone irrigation design with per-plant watering profiles, sensor allocation, firmware logic, physical layout, and Houston-specific considerations
- **This page** — Overall system connectivity and communication

---

## High-Level Overview

```mermaid
flowchart TD
  subgraph SOUTH["South side — 4 watering zones"]
    Z1["Z1: Spearmint"]
    Z2["Z2: Lavender (×3)"]
    Z3["Z3: Citronella"]
    Z4["Z4: Potato Tower"]
  end

  Sensors["Soil moisture<br/>sensors (×2+)"]
  NSE["Nicla Sense Env<br/>temp · humidity · gas"]
  NV["Nicla Vision<br/>camera + ML"]

  Mega["Arduino Mega<br/>sensor controller"]
  Valves["Solenoid valves ×4"]
  Pump["Motor driver → pump"]
  Pi5["Raspberry Pi 5<br/>central hub<br/>storage · scheduler · API"]
  ESP["ESP 5″ display<br/>local UI"]
  Web["Phone / Web UI"]

  Sensors -->|analog| Mega
  NSE -->|I²C| Mega
  Mega --> Valves
  Mega --> Pump
  Valves --> SOUTH
  Pump --> SOUTH
  Mega -->|USB serial| Pi5
  NV -->|WiFi| Pi5
  Pi5 -->|MQTT| ESP
  Pi5 -->|HTTP| Web
```

---

## Communication Protocols

| From | To | Protocol | Data |
|------|----|----------|------|
| Soil Moisture Sensors | [[Arduino Mega]] | Analog wire | Voltage (moisture) |
| [[Arduino Nicla Sense Env]] | [[Arduino Mega]] | I2C | Temp, humidity, gas |
| [[Arduino Mega]] | [[Raspberry Pi 5]] | USB Serial (UART) | JSON sensor packets |
| [[Arduino Nicla Vision]] | [[Raspberry Pi 5]] | WiFi (HTTP/MQTT) | Images, health alerts |
| [[Raspberry Pi 5]] | [[Arduino Mega]] | USB Serial | Watering commands per zone |
| [[Raspberry Pi 5]] | [[ESP Display 5in]] | WiFi (MQTT) | Dashboard data |
| [[Raspberry Pi 5]] | Phone/PC | WiFi (HTTP) | Web dashboard |

---

## Data Flow

1. **Sense** — Soil moisture per zone (analog), temp/humidity/gas (I2C), soil temp (future DS18B20)
2. **Collect** — Arduino Mega polls sensors every 5 min, packages as JSON, sends over serial
3. **Process** — Pi 5 receives data, stores in DB, evaluates per-zone thresholds
4. **Act** — Per-zone watering decisions: open correct solenoid valve + run pump for zone-specific duration
5. **Display** — Dashboard updates on [[ESP Display 5in]] and/or web UI with per-zone status
6. **Alert** — Push notification if: pump failure, sensor offline, potato soil temp too high, reservoir low

---

## Resolved Questions

- [x] ~~MQTT vs REST for ESP Display~~ → MQTT (lightweight, real-time push updates)
- [x] ~~Where do Pi 1B boards fit~~ → Shelved for now, Pi 5 handles everything
- [x] ~~Keep GIGA Display Shield~~ → Shelved, [[ESP Display 5in]] is primary display (self-contained WiFi)
- [ ] Power plan for outdoor components → See [[Outdoor Watering System#Power Plan]]
- [ ] Weatherproofing strategy → IP65 junction box, cable glands, covered reservoir

---

**Links:** [[Garden Monitor]] · [[Outdoor Watering System]] · [[Hardware Inventory]]

#garden-monitor #architecture #planning
