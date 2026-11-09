# Evidence: CAD, official manual and decisions

What each fact on the page comes from. Sources are pinned in [CREDITS.md](CREDITS.md): VoronDesign/Voron-Stealthburner `1572a42` (2026-11-08), the STEP `SBr2_CW2.5_Assembly-20261108` and the assembly manual version 2026-11-07. Each chapter's page-by-page record, with "CAD vs manual" and "Not drawn", is in [docs/transcripts/](docs/transcripts/).

## Geometry

- `Stealthburner_CW2.5_Assembly.step`: 225 unique solids placed 455 times (Stealthburner with Revo Voron cartridge, Clockwork 2.5, toolhead PCB, hall effect sensor, X carriage on an MGN12 rail and 2020 extrusion, generic ADXL mount).
- `CAD/Printheads/*.step`: ten files, each with only the printed front and rear of one hotend's cartridge (the Rapido rear is two solids), in the same coordinates as the main assembly. `tools/step/merge.cjs` adds them under `Printheads/<name>/`. The Revo Voron copy duplicates the main assembly and is not drawn.
- Read with native OpenCascade (`tools/step/convert_ocp.py`), deflection 0.1 mm.
- Axes: Z up, millimetres, nozzle tip near z = 0. The toolhead's front is −y (the shroud), the X rail and extrusion are at +y. +x is the right side seen from the front (the toolhead PCB side).

## Variants the CAD holds in the same place

| CAD | Drawn |
| --- | --- |
| `CW2.5_Main_Body_Collet` and `CW2.5_Main_Body_ECAS04` | Per the PTFE entry option |
| Bowden collet + clip and ECAS04 coupler | Per the PTFE entry option |
| Latch pivot `M3x20 SHCS` and the sensor's `M3x25 SHCS` | M3x20 from p.29; with the sensor it leaves on p.40 and the M3x25 goes in on p.41 |
| `hall_effect_bracket` and `hall_effect_retained_bracket` | The first; the manual says two bracket versions exist |
| Cable anchor screw `M3x20 SHCS` and `M3x30 SHCS` | M3x30, matching the umbilical anchor the CAD has |
| `x_carriage_frame_left/right` and `SW_Carriage_Left/Right` (Switchwire) | The V2/Trident frames |

## Not in the CAD

Wires, the Omron probe and its 2 M3x30 SHCS, belts, the hotends other than the Revo Voron and their screws, the generic and IGUS cable chain anchors, grease, thread locker, filament. They are listed in the steps as items not drawn.

## Decisions

- The extruder's motor plate, the cartridge's front part and the shroud body are the roots of the three sub-assemblies: everything rides on them, and each goes onto the carriage in one move in Mounting.
- The built-in support in the main body's sensor slot is a separate solid in the CAD: it leaves on p.23.
- Steps with nothing to move (alignment checks, wiring, supports to remove) are shown with the parts involved highlighted, and point to the manual's diagrams.
