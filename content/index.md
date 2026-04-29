---
publish: true
title: Garden Monitor
date: '2026-03-18'
zones:
  - name: Lavender
    status: thriving
    note: First bloom seen 2026-04-26
  - name: Spearmint
    status: stressed
    note: 'Yellowing leaves, wilting tall stems — needs partial shade or larger pot'
  - name: Citronella
    status: watch
    note: Some lower-leaf yellowing; mulch pulled back from stem
  - name: Potato Tower
    status: thriving
    note: Top growth + side-hole sprouts; add another soil/hay layer soon
  - name: Lime Tree
    status: thriving
    note: Flower buds forming — fruit possible this season
  - name: Indoor Nursery
    status: watch
    note: Shelf 3 thriving; Shelf 4 (top) lost to heat — replant or repurpose
  - name: Raised Bed
    status: ready
    note: >-
      Mulched and waiting for tomato/pepper/jalapeño/onion transplants
      ~2026-05-08
  - name: Corn Containers
    status: healthy
    note: 'Transplanted 2026-04-26 (5 stalks each, two pots side-by-side)'
  - name: Watermelon
    status: healthy
    note: Transplanted 2026-04-26; trellis ready for vertical training
---
> Automated garden & plant monitoring system using Raspberry Pi and Arduino hardware.

---

## Quick Links

- [[Hardware Inventory]] — All boards, sensors, and modules
- [[System Architecture]] — How everything connects
- **Garden Monitor Log Index** — Day-by-day progress (browse via the `/log` index on the site)

---

## 🚦 Project Status

| Area | Status | Notes |
|------|--------|-------|
| Hardware inventory | ✅ Complete | All parts catalogued |
| System architecture | 🟡 Planning | Needs finalization |
| Sensor wiring | ⬜ Not started | |
| Firmware (Arduino) | ⬜ Not started | |
| Backend (Pi 5) | ⬜ Not started | |
| Display UI | ⬜ Not started | |
| Deployment | ⬜ Not started | |

---

## 🔧 Hardware at a Glance

**Compute**
- [[Raspberry Pi 5]] — Main hub (16 GB RAM, 128 GB SD)
- [[Raspberry Pi 1B]] × 2 — Legacy boards (potential satellite nodes)

**Microcontrollers**
- [[Arduino Mega]] — Primary sensor controller
- [[Arduino Nano]] — Compact secondary node
- [[Arduino Nicla Vision]] — Camera-based plant health
- [[Arduino Nicla Sense Env]] — Air quality & environment

**Displays**
- [[GIGA Display Shield]] — 3.97″ touchscreen (needs GIGA R1 host)
- [[ESP Display 5in]] — 5″ ESP-based display (standalone option)

**Peripherals**
- [[Capacitive Soil Moisture Sensor]] × 2 — Soil readings
- [[Motor Driver Module]] — Pump / actuator control

---

## 🎯 Goals

1. Monitor soil moisture, temperature, humidity, and air quality across garden zones
2. Visual dashboard on display + web UI
3. Camera-based plant health checks via Nicla Vision
4. Automated watering trigger via motor driver + pump
5. Data logging and historical trends on the Pi 5

---

## 🏷️ Tags

`#garden-monitor` `#hardware` `#firmware` `#software` `#architecture` #mars-designs 
