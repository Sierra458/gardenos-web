---
publish: true
title: "Shade Strategy"
date: 2026-04-26
---
> Shade cloth design for the raised bed in [[Outdoor Garden Layout]] — protection from late-May through mid-September Houston afternoon heat. Critical given the [[Patio Orientation|230° SW orientation]].

## Why You Need It

Tomatoes drop flowers + stop setting fruit above 95°F. The southwest-facing patio wall pushes the raised bed's effective temperature 5–15°F above ambient most afternoons June–September. Shade cloth restores tomato production through summer.

Without shade cloth on a 230°-facing bed, expect:
- **Tomato production pause:** June through September.
- **Pepper / jalapeño:** still produce but stressed.
- **Soil surface temps** at the bed: 130°F+ in peak afternoon (mulch keeps the root zone livable, but leaves get cooked).

With 40–50% shade cloth deployed afternoon hours (1–5 PM):
- Effective temp drops 10–15°F.
- Tomato production continues into July.
- Less leaf burn across all crops.

## Specs

| Item | Spec | Why |
|---|---|---|
| **Shade rating** | 40–50% | Balance — enough shade to drop temp, enough light to fruit. >50% blocks too much light; <40% doesn't drop temp enough. |
| **Color** | White or aluminet (reflective silver) | Reflects heat instead of absorbing. Avoid black — gets hot itself. |
| **Frame material** | 1" PVC pipe + tee fittings | Cheap, lightweight, reusable, no glue (so it disassembles seasonally). |
| **Vertical pipe height** | ~5 ft | Above the bed wall, allows 6 ft tomato growth underneath. |
| **Crossbar length** | ~8 ft (matches bed length) | Spans the long edge of the raised bed. |

## Frame Design

```
          HOUSE WALL (faces SW, 230°)
          ┌──────────────────────────────┐
          │                              │
          │  SHADE CLOTH                 │  Cloth attaches at top
          │  drapes from wall            │   to wall (eye hooks
          │  over crossbar               │   above window)
          │  to front of bed             │
          │  (awning style)              │
          │  ╱                            │
          │ ╱   ┌─── 8 ft crossbar ───┐  │
          │╱    │                      │  │
          │═════│════════════════════ │  │  ← crossbar (PVC, ~5 ft up)
          │     │                      │  │
          │     │ 5 ft                 │  │
          │     │ verticals            │  │
          │     │                      │  │
          │     │                      │  │
          │     ╔══════════════════════╗  │  ← raised bed
          │     ║   2' × 8' × 16-18"   ║  │
          │     ╚══════════════════════╝  │
          │     STONE PATIO              │
          └──────────────────────────────┘
```

**Verticals:** Two 5-ft 1" PVC pipes at the back corners of the raised bed (against the wall side).
**Crossbar:** One 8-ft 1" PVC pipe across the top, joined to the verticals with tee fittings (no glue).
**Anchoring:** Either (a) clamp the verticals to the bed walls with large hose clamps or U-bolts, or (b) sink them 8–10" into the soil inside the bed at each end — bed wall provides lateral support.
**Cloth attachment:** Eye hooks on the house wall above the window for the rear of the cloth. Binder clips or zip ties to the front of the crossbar. Cloth drapes from wall down over the crossbar and angles forward like an awning.
**Bottom open:** Don't enclose — air must flow underneath, otherwise it becomes an oven.

## Materials List

| Item | Source | Approx. cost |
|---|---|---|
| 1" PVC pipe (10 ft) × 2 | Home Depot / Lowe's | ~$8–10 |
| 1" PVC tee fittings × 2 | Home Depot / Lowe's | ~$3 |
| 1" PVC end caps × 2 (optional) | Home Depot / Lowe's | ~$2 |
| Hose clamps (large) × 4 OR U-bolts × 4 | Home Depot / Lowe's | ~$5 |
| Eye hooks × 2 | Home Depot / Lowe's | ~$2 |
| 6 × 8 ft (or 6 × 10 ft) shade cloth panel, 40–50%, white/aluminet | Amazon (search "shade cloth 50% white 6x8") | ~$15–25 |
| Binder clips (jumbo, 8-pack) | Already on hand or ~$3 | |
| Zip ties (variety pack) | Already on hand or ~$3 | |

**Total: ~$35–45.**

## Timing

| Date | Action |
|---|---|
| **Early–Mid May** | Don't deploy yet. Plants want full sun while establishing. |
| **Late May / Early June** | Deploy when daily highs **consistently hit 95°F+**. |
| **June – September** | Keep deployed during peak afternoon (~1–5 PM). Can leave up 24/7 — Houston nights stay warm enough that morning sun still gets through the cloth's diffused light. |
| **Late September** | Remove when daily highs drop below 90°F. Tomatoes resume fruit set. |

## Daily Operation (Manual)

Two options:

1. **Deploy once, leave up all summer.** Simplest. The 40–50% rating still allows enough light through morning + diffused light, and the angle puts most blockage on afternoon sun.
2. **Deploy/retract daily.** Higher labor but maximum morning sun. Pull cloth back at 5–6 PM, redeploy at noon. Cloth folds into a small bundle; takes 30 seconds.

For most of summer, option 1 is the right tradeoff.

## Why NOT a Pop-Up Canopy

A pop-up shade canopy (tailgate-style) would be easier to deploy, BUT:
- Houston thunderstorms blow them away (lost canopies = ~$60 each + plant damage if it falls).
- Not anchored to the structure.
- Hard to angle correctly for a SW-facing wall.

The PVC frame is sturdier, anchored to the bed and house, and survives wind events.

## Phase 2 — Motorized Shade

Once [[Garden Monitor]] is wired up, automate shade deployment with a stepper-driven roller:
- Stepper motor + threaded rod + spool, mounted on the crossbar.
- Cloth attached to a roller bar.
- Trigger from rules engine: deploy when ambient > 95°F AND solar > X lux at 1 PM; retract at 6 PM.
- Stretch goal — simple manual is plenty for v1.

---

**Links:** [[Outdoor Garden Layout]] · [[Patio Orientation]] · [[Watering Guide]] · [[Garden Monitor]]

#garden-monitor #shade #heat-management #outdoor #phase-2
