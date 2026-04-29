---
publish: true
title: Hardware Inventory
date: '2026-03-18'
---
> Complete list of components for the [[Garden Monitor]] project.

---

## Compute Boards

| Board | Specs | Role | Purchased |
|-------|-------|------|-----------|
| [[Raspberry Pi 5]] | 16 GB RAM · 128 GB SD | Central hub & data server | Dec 2025 |
| [[Raspberry Pi 1B]] × 2 | 512 MB RAM | Satellite nodes (TBD) | Legacy |

## Microcontrollers

| Board | Key Feature | Role | Purchased |
|-------|-------------|------|-----------|
| [[Arduino Mega]] | 54 digital I/O pins | Primary sensor controller | — |
| [[Arduino Nano]] | Compact ATmega328P | Secondary node | Dec 2, 2025 |
| [[Arduino Nicla Vision]] | 2 MP camera + WiFi/BLE | Plant health imaging | — |
| [[Arduino Nicla Sense Env]] | Temp/humidity/gas sensors | Air quality monitoring | Dec 11, 2025 |

## Displays

| Module | Specs | Role | Purchased |
|--------|-------|------|-----------|
| [[GIGA Display Shield]] | 3.97″ touch, IMU, mic | Dashboard (needs GIGA R1) | Dec 12, 2025 |
| [[ESP Display 5in]] | 5″ ESP-based touchscreen | Standalone dashboard option | — |

## Sensors & Modules

| Component | Type | Qty | Purchased |
|-----------|------|-----|-----------|
| [[Capacitive Soil Moisture Sensor]] | Analog soil moisture | 2 | Dec 2, 2025 |
| [[Motor Driver Module]] | H-bridge motor driver | 1 | — |

---

## 🛒 Still Needed

- [ ] Water pump (12 V peristaltic or submersible)
- [ ] Tubing and connectors
- [ ] Weatherproof enclosure(s)
- [ ] Power supply / solar panel for outdoor nodes
- [ ] Jumper wires, breadboard, PCB for permanent wiring
- [ ] Relay module (if not using motor driver for pump)
- [ ] Arduino GIGA R1 WiFi (if using GIGA Display Shield)

#garden-monitor #hardware
