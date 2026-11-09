# X Carriage and Mounting: transcript, pp. 65–78

Source: `Assembly_Manual_SB.pdf` (version 2026-11-07). Tip text verbatim from `pdftotext -layout`.

## p.65 — trivia ("Yeah, it went about as expected."). Not a step.
## p.66 — X CARRIAGE. Chapter title page. Not a step.

## p.67 — PART PREP (carriage inserts)
Shows: the carriage halves (left and right frames) from the front: 2 heat set inserts in each, top and bottom outer corners (toolhead mounting); assembled carriage view; the Switchwire carriage variant with slot inserts.
Tips:
- TOOLHEAD MOUNTING: The toolhead is secured to the carriage using the four mounting screws inserted from the front (see previous page). Make sure the toolhead is seated flat against the carriage before tightening the screws in an X pattern.
- PRINTER SPECIFIC PARTS: We provide different versions of the carriage to fit our different printer designs. Be sure to pick the right one for your printer. The next few pages may look slightly different if you are building a Switchwire printer.
Callouts: Heat Set Insert.

## p.68 — PART PREP (rear inserts and nuts)
Shows: from the back: 1 insert in the left frame (upper), 1 lower; right frame 1 upper insert + 1 lower insert, and 2 M3 hex nuts pressed in at the right edge. The probe bracket with 2 inserts.
Tips: PRINTER SPECIFIC PARTS (as p.67).
Callouts: Heat Set Insert, M3 Hex Nut.

## p.69 — X CARRIAGE (on the rail)
Shows: the two frames bolted to the MGN12H block on the X rail with 4 M3x8 SHCS (2 per frame).
Tips:
- FOLLOW BELTING AND X CARRIAGE INSTALLATION OUTLINED IN PRINTER MANUAL: Consult the printer's manual for instructions on how to run the belts and details on carriage mounting.
Callouts: M3x8 SHCS.

## p.70 — X CARRIAGE (clamps and toolhead screws)
Shows: 2 M3x30 SHCS from the left side (belt clamps), 2 M3x12 SHCS from the front right into the hex nuts; detail: two screws left 3 mm proud at the bottom (toolhead mount).
Tips:
- 30MM OR 40MM? The length of these two bolts can be different based on the specific printer you are building. This step has some overlap with the printer manuals. Please refer to the printer specific manual for the correct bolt lengths.
Callouts: M3x30 SHCS, M3x12 SHCS.

## p.71 — X CARRIAGE (probe)
Shows: the probe bracket at the lower front of the carriage; the Omron-style probe into the bracket; 2 M3x30 SHCS from the front through the probe into the bracket inserts.
Tips:
- OTHER PROBE TYPES: The picture shows the BOM-specified Omron TL-Q5MC probe. Other probes with a similar form factor and characteristics might work as well.
Callouts: Omron Style Probe, M3x30 SHCS.

## p.72 — X CARRIAGE (probe height)
Shows: front view; probe tip 6 mm below the carriage's lower edge.
Tips:
- ADJUST PROBE POSITION: The position can be fine-tuned later. Set an initial position of about 6mm below the plastic part.

## p.73 — CW2.5 MOUNTING
Shows: the finished Clockwork 2.5 lowered onto the carriage from above; an M3x8 SHCS from the front through the main body lower right into the carriage.
Callouts: M3x8 SHCS.

## p.74 — CW2.5 MOUNTING (second screw)
Shows: an M3x8 SHCS at the lower left, reached through the access hole in the front.
Tips:
- ACCESS HOLE: The bolt can be accessed from the front of the extruder.
Callouts: M3x8 SHCS.

## p.75 — TOOL CARTRIDGE MOUNTING
Shows: the tool cartridge slides up under the extruder onto the carriage from the front; the PTFE tube enters the extruder.

## p.76 — SB MOUNTING
Shows: the Stealthburner shroud closes over the front; 2 M3x25 SHCS (upper) and 2 M3x50 SHCS (lower) from the front through the shroud.
Callouts: M3x25 SHCS, M3x50 SHCS.

## p.77 — ADXL345 MOUNT. Chapter title page. Not a step.

## p.78 — ADXL345 MOUNT
Shows: the ADXL345 prototype board on sb_adxl_mount_generic_15.5mm_c_c.stl; 2 sb_adxl_washer spacers and 2 M2x10 self tapping screws; the mount bolted to the back of the cartridge (right side) with 2 M3x12 SHCS.
Tips:
- ADXL MOUNT AND INPUT SHAPER CALIBRATION: The ADXL is intended to be mounted only when doing vibration testing/input shaper calibration and should not be left on the tool head during normal printing.
- ISOLATION SPACERS: Most ADXL345 prototype boards have circuit tracks close to the mounting holes. Make sure to install spacers to prevent damage to the board. We included printable spacers in the release.
- MOUNTING TO THE TOOLHEAD: You can use M3x12 screws to mount this assembly to your toolhead.
Callouts: ADXL345 Prototype Board, M2x10 Self Tapping Screws, M3x12 SHCS.

## p.79 — NEXT STEPS (see below). p.80 — HOW TO GET HELP. Used in the closing step.

---

## CAD vs manual

| Manual | CAD | Shown |
| --- | --- | --- |
| p.67/68 carriage inserts | 4 in the frames (front, top and bottom corners), 2 in the probe bracket | As the CAD; p.68 shows the hex nuts and the bracket |
| — | A 3x6 mm magnet in the right frame | Drawn on p.68's step, noted as not in the manual |
| p.70 two M3x12 left 3 mm proud | In the frames at z ≈ 63; the cartridge's rear hooks over them | As the CAD |
| p.67 printer-specific carriages | V2/Trident and Switchwire frames overlap | V2/Trident |

## Not drawn

The Omron probe and its 2 M3x30 SHCS, belts.
