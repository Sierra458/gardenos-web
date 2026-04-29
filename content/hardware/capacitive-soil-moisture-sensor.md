---
publish: true
title: Capacitive Soil Moisture Sensor
date: '2026-03-18'
---
> Corrosion-resistant soil moisture sensing for [[Garden Monitor]].

---

## Specs

- **Brand:** Gikfun (EK1940)
- **Type:** Capacitive (no exposed metal — resists corrosion)
- **Output:** Analog voltage (0–3 V typical)
- **Operating Voltage:** 3.3–5 V
- **Quantity:** 2 units
- **Purchased:** Dec 2, 2025

## Calibration

Capacitive sensors need calibration per soil type:

| Condition | Expected Reading | Actual (TBD) |
|-----------|-----------------|---------------|
| Dry air | ~520–600 | |
| Dry soil | ~400–500 | |
| Moist soil | ~250–400 | |
| Water | ~200–250 | |

> ⚠️ Calibrate in your actual soil before trusting thresholds.

## Wiring

| Wire Color | Pin | Connection |
|-----------|-----|-----------|
| Red | VCC | 3.3 V or 5 V |
| Black | GND | GND |
| Yellow | AOUT | Arduino analog pin (A0, A1) |

## Role in Project

- One per garden zone / planter
- Read by [[Arduino Mega]] on analog inputs
- Values forwarded to [[Raspberry Pi 5]] for logging
- Thresholds trigger [[Motor Driver Module]] for watering

## Notes

-

---

**Links:** [[Hardware Inventory]] · [[Arduino Mega]] · [[Motor Driver Module]]

#garden-monitor #hardware #sensor #soil
