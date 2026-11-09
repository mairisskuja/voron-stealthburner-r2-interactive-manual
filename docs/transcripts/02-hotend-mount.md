# Hotend Mount: transcript, pp. 44–51

Source: `Assembly_Manual_SB.pdf` (version 2026-11-07). Tip text verbatim from `pdftotext -layout`.

## p.44 — VORON STEALTHBURNER - HOTEND MOUNT
Chapter title page. Not a step.

## p.45 — PART MARKINGS
Shows: stealthburner_printhead_revo_voron_rear_cw2.stl and stealthburner_printhead_revo_voron_front.stl, the "E-RV" marking circled on each.
Tips:
- IDENTIFYING PRINTED PARTS: The hotend type is embossed on the printed parts. Make sure they match your hotend.
- AVAILABLE MOUNTS: We also provide mounts for other hotends. They are assembled in a similar manner. For a full list of available mounts and their identification code, see the readme file included in the toolheads folder.

## p.46 — PART PREP (rear inserts)
Shows: the rear cartridge part with 2 heat set inserts at the upper sides (hotend fan screws / mounting) and 2 more (circled) at the lower right for the ADXL PCB.
Tips:
- OPTIONAL: ADXL PCB MOUNT: To use the optional ADXL PCB for Input Shaper calibration, add additional heat set inserts into the holes in highlighted location. If you are using a toolhead board with an accelerometer, these do not need to be installed.
Callouts: Heat Set Insert.

## p.47 — PART PREP (Revo)
Shows: Revo VORON heatsink, spring, HeaterCore and nozzle, exploded and assembled.
Callouts: Revo VORON Heatsink, Revo HeaterCore, Revo Nozzle.

## p.48 — PART PREP (wire routing)
Shows: the hotend in the rear part, wires routed up the left; the heater core's strain relief bent. Section shows an asymmetrical heater block facing the front.
Tips:
- HOTEND WIRE ROUTING: Route the wires as shown to the right. This is universal to all hotend types.
- BEND STRAIN RELIEF: Carefully bend the strain relief to clear the printed part. Firmly hold the HeaterCore to prevent bending the Revo Nozzle. It is critical that the Revo Nozzle is fully hand tightened into the heatsink. You MUST bend the strain relief to achieve this.
- ASYMMETRICAL HEATER BLOCKS: For asymmetrical heater blocks, like V6 or Dragon HF, ensure the heater block is oriented towards the front. It should not touch the rear piece.

## p.49 — TOOL CARTRIDGE (front)
Shows: the front part closes on the rear from the front (left in the drawing); 2 M3x16 SHCS from the front, upper left and lower centre.
Callouts: M3x16 SHCS.

## p.50 — TOOL CARTRIDGE (hotend bolts)
Shows: 4 M3x8 SHCS from the top into the Revo Voron heatsink.
Tips:
- M3 MOUNTING BOLTS? Bolts are hotend specific, Revo VORON uses M3 hardware as an improvement. This is the way.
Callouts: M3x8 SHCS.

## p.51 — TOOL CARTRIDGE (PTFE)
Shows: PTFE tube pushed down into the centre hole; front view, 11 mm stick-out.
Tips:
- PTFE STICK OUT: The PTFE tube should stick out 11mm above the surface of the printed part. The stick out length might vary if you use an extruder other than the Clockwork 2.5
Callouts: PTFE Tube.

---

## Hotend picker

The main CAD has the Revo Voron cartridge with the hotend, its spring and HeaterCore, 4 M3x8, 2 M3x16, 4 inserts (2 for the ADXL mount) and a 29.8 mm PTFE tube. `CAD/Printheads/*.step` adds the printed front and rear of the other nine hotends. The hotend list, codes and mounting hardware come from `STLs/Stealthburner/Printheads/README.md`; the Rapido and Rapido V2 notes from their readmes (they list 2 M3x12 for joining front and rear, where the manual uses 2 M3x16).

## CAD vs manual

| Manual | CAD | Shown |
| --- | --- | --- |
| p.46 "Part prep" inserts | They are in the front part (the one with the fan opening), where the rear's M3x16 screw in from behind | Inserts in the front part; p.49's rear part comes on from behind |
| p.49 M3x16 direction | Heads at the back of the rear part | From behind |

## Not drawn

Every hotend except the Revo Voron, and their screws (listed in the step). Hotend wires.
