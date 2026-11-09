# VORON Stealthburner R2: interactive assembly manual (unofficial)

**Open it: https://iconic-fab.com/voron/stealthburner/r2/** (free, in the browser, no install)

An animated 3D companion to the official [VORON Stealthburner assembly manual](https://github.com/VoronDesign/Voron-Stealthburner/blob/main/Manual/Assembly_Manual_SB.pdf) (Stealthburner toolhead with the Clockwork 2.5 extruder). Every step of the official manual is shown on the official CAD model: the parts of each step fly into place, labelled, with the manual's text and tips beside them and a link to the page it comes from.

> **Independent community project.** Not affiliated with, endorsed by or supported by the VORON Design team. The official manual is the reference: where the two differ, follow the manual. All credit for the toolhead, the CAD and the manual goes to the VORON team and community; see [CREDITS.md](CREDITS.md).

**Status:** beta. The whole manual, manual pp. 11–79: Clockwork 2.5, hall effect sensor, hotend mount, shroud, LEDs, fans, X carriage, mounting and the ADXL mount (63–65 steps, depending on the build options).

## Your build

The steps, the drawing and the part counts follow the options you pick (on the start card or under *Configure*):

| Option | Choices |
| --- | --- |
| Hotend | E3D Revo Voron (as in the manual), Revo Micro, V6 / Revo Six, Phaetus Dragon, BMO, BMS 6-fin, BMS 7-fin, Rapido, Rapido V2, Chube Compact |
| PTFE entry | Bowden collet or ECAS04 coupler (two main bodies) |
| Toolhead PCB | on / off |
| Hall effect filament sensor | on / off |
| ADXL345 mount | on / off |

For hotends other than the Revo Voron, the official CAD holds the printed cartridge parts but not the hotend itself: the cartridge is drawn and the hotend and its screws are listed. A link can carry options, e.g. `?hotend=dragon&pcb=0#hm-rear`.

## What you can do

- **Steps:** play, scrub or replay each step; jump between chapters; *Auto* plays through the build (double-click it for 2× speed).
- **Exploded view:** pull the toolhead apart along its assembly paths with the spacing slider.
- **Parts:** click any part to see its name and jump to the step that installs it; isolate or recolour it. *Configure* lists the parts and hardware for your build.
- **Display:** linework styles, filled or outline parts, line colour, light and dark mode.
- **Export:** save the current view as SVG, PNG or PDF (A3 hidden-line drawing).
- **Deep links:** every step has its own address, e.g. [`#cw-tension-arm`](https://iconic-fab.com/voron/stealthburner/r2/#cw-tension-arm).

Where the CAD and the manual differ, the drawing shows the CAD and the difference is written down in [docs/transcripts/](docs/transcripts/). Wiring steps highlight the parts involved and point to the manual's diagrams, because the CAD has no wires.

## Found a mistake?

[Open an issue](https://github.com/mairisskuja/voron-stealthburner-r2-interactive-manual/issues) here, **not** on the VORON repository. Please include the step's address and what is wrong. Pull requests are welcome: [docs/writing-a-chapter.md](docs/writing-a-chapter.md) explains how a chapter is written and checked.

For help with your build, the VORON community is on [Discord](https://discord.gg/voron) and the [forum](https://forum.vorondesign.com).

## Build

Needs Node 20+, [uv](https://docs.astral.sh/uv/) (for Python 3.12 and native OpenCascade) and `curl`.

```bash
npm install         # build tools (meshoptimizer)
npm run setup       # once: Python venv with cadquery-ocp (native OpenCascade)
npm run fetch-cad   # the official STEP files and manual from VoronDesign/Voron-Stealthburner (pinned commit)
npm run build:all   # reads the STEP files (about 20 seconds), then builds dist/ (index.html + model-<hash>.bin)
npm run serve       # http://localhost:8767/
```

| Path | What it is |
| --- | --- |
| `CHANGELOG.md` | What changed in each release |
| `tools/catalog.cjs` | Shared helpers, the build options and the hotend list |
| `tools/chapters/NN-*.cjs` | One module per chapter: parts, steps, text, manual page references |
| `docs/transcripts/` | Page-by-page transcripts of the official manual, with "CAD vs manual" and "Not drawn" |
| `tools/snap.cjs` | Renders steps to PNG without a browser (`node tools/snap.cjs <step id or section>`, `OPTS=hotend=dragon,pcb=0` for another build) |
| `tools/collide.cjs` | Plays every step and reports parts that pass through each other (`node tools/collide.cjs [step id...]`) |
| `tools/step/convert_ocp.py`, `tools/step/merge.cjs` | Read the STEP files into `build/assembly.json` |
| `tools/simplify-hardware.cjs`, `tools/build-*.cjs` | Simplify hardware meshes, pack the model and build `dist/index.html` |
| `src/` | The page: template, viewer, export worker, logos |
| `tools/teardown/` | Hidden-line renderer used for exports (MIT, Jakub Krehel) |

## License

GPL-3.0, the same as the VORON Stealthburner it is built from. See [LICENSE](LICENSE) and [CREDITS.md](CREDITS.md).

"VORON" and the VORON logo belong to VORON Design and are used only to identify the toolhead this manual is for.

Made by Mairis Skuja · [Iconic FAB](https://iconic-fab.com).
