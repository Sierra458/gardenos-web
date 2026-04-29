---
publish: true
title: Patio Orientation
date: '2026-04-26'
---
> The patio house wall faces **230° (southwest)**. This is the toughest orientation for Houston gardening. Implications and mitigations for [[Outdoor Garden Layout]] and [[Garden Monitor]].

## What 230° Means

- **No morning sun** — the house blocks east light from the patio.
- **Full-blast afternoon sun** — from roughly noon through sunset. The hottest, most intense window of the day in Houston.
- **Wall radiates absorbed heat** — the house wall acts as a thermal mass, soaking sun all afternoon and re-emitting heat onto the plants long after the sun moves off.
- **Microclimate is hotter than ambient** — soil surface in the raised bed could hit **130°F+** in July/August without mulch. Even ambient air against the wall sits 5–10°F above the local forecast.

## Per-Crop Heat Tolerance

| Crop | Tolerance | What happens at this orientation |
|---|---|---|
| 🍅 **Tomato (Beefsteak)** | Drops flowers and stops setting fruit above 95°F. | Spring harvest May–June, then **production pause June–September** until nights cool. Fall production resumes late September. |
| 🌶️ **Bell Pepper, Jalapeño** | More heat-tolerant than tomato. | Produce through summer with watering discipline. Jalapeños actually thrive. |
| 🍉 **Watermelon** | Loves heat IF watered consistently. | Will keep producing all summer; needs daily watering. |
| 🌽 **Corn** | Moderate. | Has the wind/grass area; gets more balanced sun than the wall plants. |
| 💜 **Lavender** | Mediterranean — wants heat + dry. | Thrives. The hot wall actually suits it. |
| 🌿 **Spearmint** | Wilts in afternoon sun. | Already showing stress — needs partial shade or relocation. |
| 🍋 **Lime tree** | Heat-loving. | Thrives. |
| 🥗 **Lettuce / Cilantro** | Bolts above 80°F. | Don't even try outdoors here past April. Indoor / hydroponic only. |

## Mitigations

### 1. Straw mulch everywhere (already applied)

Already in place across raised bed, corn containers, herbs. Drops surface soil temp 15–20°F. Single highest-impact thing in Houston gardening. Pull mulch ~1" away from each stem to prevent rot.

### 2. Morning watering only

Plants need to be hydrated **before** the afternoon assault hits. Evening watering = wet foliage overnight + Houston humidity → fungal pressure (powdery mildew, black spot). Water at the base, never on leaves. See [[Watering Guide]] for per-plant schedules.

### 3. Shade cloth (deploy late May)

Get **40–50% shade cloth** (white or aluminet/reflective silver). Drape over the raised bed during peak afternoon hours (~1 PM to 5 PM). Drops effective temp 10–15°F — the difference between tomatoes producing and shutting down.

> Don't go higher than 50% shade — plants still need light to fruit. Don't deploy before late May either — early-season plants want all the sun they can get to establish strong root systems.

See [[Shade Strategy]] for the PVC frame design.

### 4. Plant placement within the bed

- **Tomatoes at the east end** of the raised bed — they catch the least direct wall-radiated heat (the east end is furthest from peak afternoon sun angle on a 230° wall).
- **Peppers/jalapeños in the middle** — they handle the hottest zone best.
- **Onions tucked between** — short, doesn't compete for vertical space, cool roots from neighbor shade.

### 5. Spearmint relocation

Mint is the plant most stressed by this orientation. Options:
- Move to a partial-shade spot if any exists (e.g., east side of the house if accessible).
- Upsize the pot and water more frequently.
- Accept the seasonal hit — mint often goes "summer dormant" in Houston and rebounds in fall.

### 6. Container-level heat management

Dark plastic containers (corn, watermelon) absorb a lot of solar. Mulch on top of the soil drops surface temps; consider also wrapping the outside of the container in light-colored fabric or shade cloth for the worst heat weeks if leaves start curling.

### 7. Future: temperature-driven automation

Once [[Garden Monitor]] is wired up, [[Arduino Nicla Sense Env]] + DHT22 sensors at each zone log to InfluxDB on the [[Raspberry Pi 5]]. Rules to deploy:
- **Delay watering past 6 PM** if ambient > 100°F (avoid evening leaf-wetness).
- **Auto-trigger shade cloth retraction** (stretch goal — motorized via stepper) during overcast or post-3 PM.
- **Increase watering frequency** when soil surface temp probe reads >100°F under straw.
- **Push notification** when potato tower soil temp crosses 75°F (tubers stop forming above this — see [[Outdoor Watering System#The 4 Zones]]).

## Comparison to Other Orientations

| Orientation | Difficulty | Why |
|---|---|---|
| ⬆️ North-facing | Easy in Houston | Plants get less heat; usually means too little sun for fruit. |
| ⬅️ East-facing | Best | Morning sun + afternoon shade — perfect for tomatoes. |
| ➡️ West-facing | Hard | Afternoon sun only, but cooler than SW because the angle drops earlier. |
| ↘️ Southwest (230°) | **Hardest** | Late, intense afternoon sun + wall heat radiation late into evening. |
| ⬇️ South-facing | Hard | Most sun overall but balanced AM/PM. |

The 230° orientation is what we have, so the strategy is mitigation, not relocation. The mitigations above are designed to keep most of the bed productive through Houston's worst months.

---

**Links:** [[Outdoor Garden Layout]] · [[Watering Guide]] · [[Shade Strategy]] · [[Outdoor Watering System]] · [[Garden Monitor]]

#garden-monitor #outdoor #houston #orientation #heat-management
