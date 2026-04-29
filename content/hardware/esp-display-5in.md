---
publish: true
title: ESP Display 5in
date: '2026-03-18'
---
> 5″ ESP-based touchscreen display for [[Garden Monitor]].

---

## Specs

- **Screen:** 5″ touch display
- **Controller:** ESP32-based (WiFi + Bluetooth built-in)
- **Details:** TBD — confirm exact model

## Role in Project

- **Strong candidate for primary dashboard display** — no extra host board needed
- ESP32 can connect directly to [[Raspberry Pi 5]] over WiFi
- Can pull sensor data via MQTT or REST API and render locally
- Touch input for manual overrides (pump on/off, view history)

## Advantages Over [[GIGA Display Shield]]

- Self-contained (doesn't require a separate GIGA R1 WiFi board)
- Built-in WiFi — can be placed anywhere in range
- Larger screen (5″ vs 3.97″)
- ESP32 ecosystem has great display libraries (LVGL, TFT_eSPI, SquareLine Studio)

## UI Framework Options

- **LVGL** — feature-rich embedded GUI library, runs on ESP32
- **SquareLine Studio** — visual LVGL designer (drag-and-drop)
- **TFT_eSPI** — lighter weight, good for simple dashboards

## Notes

- Confirm exact model and resolution
- Check if it's a capacitive or resistive touchscreen

---

**Links:** [[Hardware Inventory]] · [[GIGA Display Shield]] · [[System Architecture]]

#garden-monitor #hardware #display #esp32
