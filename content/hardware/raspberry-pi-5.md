---
publish: true
title: Raspberry Pi 5
date: '2026-03-18'
---
> Central hub for the [[Garden Monitor]] project.

---

## Specs

- **Kit:** Seeed Studio Starter Kit
- **RAM:** 16 GB
- **Storage:** 128 GB SD card
- **Connectivity:** WiFi, Bluetooth 5.0, Gigabit Ethernet
- **GPIO:** 40-pin header
- **Price:** ~$145.90

## Role in Project

- Runs the backend server (data collection, storage, API)
- Hosts web-based dashboard
- Communicates with Arduino controllers via USB serial or WiFi
- Stores historical sensor data (SQLite / InfluxDB)
- Runs watering logic and alert scheduling

## Software Plan

- OS: Raspberry Pi OS (64-bit)
- Backend: Python (Flask/FastAPI) or Node.js
- Database: SQLite / InfluxDB
- Visualization: Grafana or custom web UI

## Notes

-

---

**Links:** [[Hardware Inventory]] · [[System Architecture]] · [[Arduino Mega]]

#garden-monitor #hardware #compute
