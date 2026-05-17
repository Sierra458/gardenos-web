---
publish: true
title: Garden Monitor
date: '2026-05-17'
zones:
  - name: Tomatoes
    status: watch
    note: >-
      3 plants transplanted ~2026-05-12; recovering from shock, smaller than
      ideal
  - name: Bell Peppers
    status: thriving
    note: BP1 excellent; BP2 lagging but alive
  - name: Onions
    status: stressed
    note: '4 weak shoots — harvest as scallions, replant proper sets in October'
  - name: Potato Tower
    status: thriving
    note: Multiple plants from top + side holes; add next layer soon
  - name: Lime Tree
    status: thriving
    note: Vigorous new flush; treating citrus leaf miner + slug slime
  - name: Watermelon
    status: watch
    note: Single seedling in oversized pot; install trellis within 2 weeks
  - name: Corn
    status: thriving
    note: '4 stalks ~12–18" tall, vibrant green; pollination window 2–4 weeks out'
  - name: Lavender
    status: stressed
    note: 'Half flowering, half dying back; aggressive prune needed'
  - name: Citronella
    status: watch
    note: New top growth strong; prune dead lower stems
  - name: Carrots
    status: dead
    note: Total germination failure — bucket repurposed for okra or bush beans
  - name: Raised Bed
    status: thriving
    note: 50% shade cloth installed; all transplants in
  - name: Indoor Nursery
    status: watch
    note: Shelf 3 still production winner; top shelf abandoned for season
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
| System architecture | ✅ Complete | Hub-and-spoke MQTT design finalized |
| Outdoor transplants | ✅ Complete | All warm-season crops in ground/containers |
| Sensor wiring | ⬜ Not started | Phase 1 hardware purchase pending |
| Firmware (Arduino) | ⬜ Not started | |
| Backend (Pi 5) | ⬜ Not started | Pi 3+B will be central hub first |
| Display UI | ⬜ Not started | Tablet + Grafana likely path |
| Deployment | ⬜ Not started | |

---

## 🔧 Hardware at a Glance

**Compute**
- [[Raspberry Pi 5]] — Reserved for Phase 2 expansion (16 GB RAM, 128 GB SD)
- Raspberry Pi 3+B — Central hub (MQTT broker, InfluxDB 1.8, Grafana, Python automation)
- [[Raspberry Pi 1B]] × 2 — Subsystem nodes (outdoor bridge, nursery, hydroponics)

**Microcontrollers**
- [[Arduino Mega]] — Outdoor container sensor hub
- [[Arduino Nano]] — Potato tower multi-depth sensing
- [[Arduino Nicla Vision]] — Roaming ML plant health camera
- [[Arduino Nicla Sense Env]] — Hydroponics air quality

**Displays**
- [[GIGA Display Shield]] — 3.97″ touchscreen (needs GIGA R1 host, not yet purchased)
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
