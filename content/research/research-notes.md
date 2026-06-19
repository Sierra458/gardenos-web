---
publish: true
title: Research Notes
date: '2026-04-29'
tags:
  - garden-monitor
  - research
---
# Research Notes

> Reference material and links for [[Garden Monitor]].

---

## Soil Moisture Sensing

- Capacitive vs resistive sensors — capacitive chosen (no corrosion)
- Calibration approach: dry air → dry soil → moist soil → water
- Consider temperature compensation for accurate readings

## Plant Health with ML

- Edge Impulse + [[Arduino Nicla Vision]] for on-device inference
- Datasets: PlantVillage (38 classes of diseased/healthy leaves)
- Alternative: send images to Pi 5 and run model there

## Communication Protocols

- **Serial (UART):** Mega ↔ Pi 5 — simple, reliable, wired
- **I2C:** Nicla Sense Env ↔ Mega — short distance, multi-device bus
- **MQTT:** Lightweight pub/sub for WiFi devices → Pi 5 (Mosquitto broker)
- **REST API:** Web dashboard ↔ Pi 5 backend

## Dashboard & Visualization

- Grafana + InfluxDB — battle-tested for time-series sensor data
- Custom web UI with Flask + Chart.js — more control, lighter weight
- [[ESP Display 5in]] — LVGL library for embedded touch UI
- SquareLine Studio for drag-and-drop LVGL UI design

## Automated Watering

- Peristaltic pump (12 V) recommended for precision dosing
- Submersible pump cheaper but harder to control volume
- Safety: max watering duration, cooldown period, manual override

---

#garden-monitor #research
