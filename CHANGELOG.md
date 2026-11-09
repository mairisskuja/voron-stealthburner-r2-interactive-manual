# Changelog

Changes to the interactive manual at https://iconic-fab.com/voron/stealthburner/r2/. Dates are release dates. Where the drawing differs from the official CAD or manual, the details are in [docs/transcripts/](docs/transcripts/) under "CAD vs manual".

## 2026-11-09 (update)

### Fixed

- **Cable anchor insert** ([`#cw-anchor-inserts`](https://iconic-fab.com/voron/stealthburner/r2/#cw-anchor-inserts)): the M3 heat set insert is now drawn centred in the anchor's bore. The official CAD places it 0.59 mm off the bore, on the axis of the motor plate's screw hole. The M3x8 SHCS that threads into it stays on the motor plate's hole.

### Added

- Parts can carry a small correction to where the CAD places them (`fix: {vec, why}` in a chapter module): at most 3 mm, with a required reason, logged by the build and recorded in the chapter's transcript. See [docs/writing-a-chapter.md](docs/writing-a-chapter.md).

## 2026-11-09 (first release)

- The whole official manual, pp. 11–79: Clockwork 2.5, hall effect sensor, hotend mount, shroud, LEDs, fans, X carriage, mounting and the ADXL mount (58–63 steps, depending on the build options).
- Build options: hotend (ten printheads from the official CAD), PTFE entry (Bowden collet or ECAS04), toolhead PCB, hall effect sensor and ADXL mount.
- Parts move along collision-checked paths (`tools/collide.cjs`), turning or following waypoints where a straight move would pass through another part.
- Navigation in its own bar along the bottom of the screen; on phones the step text sits above it at a fixed height.
- Exploded view, parts panel, SVG / PNG / PDF export, deep links per step.
