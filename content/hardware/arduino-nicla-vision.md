---
publish: true
title: "Arduino Nicla Vision"
date: 2026-03-18
---
> Camera-equipped board for visual plant health monitoring in [[Garden Monitor]].

---

## Specs

- **MCU:** STM32H747AII6 (dual-core Cortex-M7 + M4)
- **Camera:** 2 MP (GC2145)
- **Connectivity:** WiFi, Bluetooth LE
- **Sensors:** 6-axis IMU, microphone
- **ML:** Compatible with Edge Impulse / TensorFlow Lite

## Role in Project

- Capture images of plants on a schedule
- Run on-device ML models to detect leaf issues, pests, wilting
- Stream images or alerts to [[Raspberry Pi 5]] over WiFi
- Timelapse growth tracking

## ML Model Ideas

- Leaf health classifier (healthy / yellowing / brown spots / wilting)
- Pest detection (aphids, whiteflies)
- Growth tracking (bounding box area over time)

## Notes

-

---

**Links:** [[Hardware Inventory]] · [[Arduino Nicla Sense Env]] · [[System Architecture]]

#garden-monitor #hardware #microcontroller #camera #ml
