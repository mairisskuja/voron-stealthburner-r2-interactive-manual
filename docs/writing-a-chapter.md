# Writing or fixing a chapter

How the chapters of the VORON Stealthburner R2 interactive manual are written and checked. Set up the build first (see the [README](../README.md#build)).

## Read first

1. [evidence.md](../evidence.md): the CAD, its variants, and how differences are recorded.
2. `tools/catalog.cjs`: the helpers, the build options and the hotend list.
3. One chapter module, e.g. `tools/chapters/01-clockwork.cjs`, and its transcript in `docs/transcripts/`.
4. The official manual, `source/Assembly_Manual_SB.pdf` (`npm run fetch-cad`). Verbatim text: `pdftotext -f P -l P -layout`; page images: `pdftoppm -f P -l P -scale-to 1100 -png`. Look at the image of every instruction page: the text alone does not say where parts go.
5. The CAD: `build/assembly.json` (`{protos, instances: [{proto, name, path, matrix, bbox}]}`, mm, Z up, front is −y). Query it with node.

## A chapter

`tools/chapters/NN-name.cjs` exports `ctx => [ ...steps ]`. It adds its parts with `ctx.add` / `ctx.each` and returns its steps in manual order. Ids a later chapter needs go on `ctx.ids`.

| Helper | Meaning |
| --- | --- |
| `pick(re, n)` | Instance indices whose `path.join('/')` matches `re`; throws unless exactly `n` |
| `near(re, points)` / `at(re, point)` | The unused instance of `re` nearest each point (within 1 mm) |
| `add(id, name, inst, kind, extra)` | One part, possibly several instances. `extra`: `parent`, `parents`, `when`, `note`, `fix: {vec, why}` (moves a piece the CAD places off its seat; at most 3 mm, recorded in the transcript) |
| `each(prefix, name, list, kind, extra)` | One part per instance (hardware) |
| `auto(ids, phase, gap)` | Movers along each fastener's own axis (bolts and inserts) |
| `move(ids, [dx,dy,dz], phase, gap, start)` | Movers from a fixed offset in mm |
| `again(movers)` | Carry a finished sub-assembly to its place (it was built earlier) |
| `out(movers)` | Take a part away (a support, a replaced screw); it is gone afterwards |

A mover can also turn while it moves (`rot: {axis, deg, pivot}`, e.g. a latch swinging shut) or follow a path (`via: [[dx,dy,dz], …]`, offsets towards the end, e.g. in through an opening and then up into a slot). A step's `pose` holds a part turned for that step.

**Build options** (`hotend`, `ptfe`, `pcb`, `sensor`, `adxl`): a part, step, text line (`{text, when}`), note or extra with `when` exists only where it holds: `'pcb'`, `'!sensor'`, `'ptfe=ecas'`, `'hotend=dragon|bmo'`, `'hotend!=revo-voron'`, or an array of these. A part on alternative hosts lists them in `parents`; the first enabled one carries it.

**Steps:** `{id, section, title, pages, bench?, shift?, view: {az, el}, focus?, movers, text, notes?, extras?, when?, chapter?}`. `az` 0 looks from +x (right), −90 from the front, 90 from the back. In a bench step only the bench parts, their installed children and the movers show. Text is short imperative sentences; notes are the manual's red-headed tips, nearly verbatim. Never invent facts: a CAD-derived fact goes in the transcript's "CAD vs manual".

## Check your work

```bash
CHAPTERS=03 BUILD_OUT=build/ch03 node tools/build-data.cjs     # must finish without errors
BUILD_OUT=build/ch03 node tools/snap.cjs "Tool Cartridge"      # start pose left, end pose right
OPTS=hotend=dragon,adxl=0 BUILD_OUT=build/ch03 node tools/snap.cjs hm-rear
node tools/collide.cjs hm-rear                                  # parts passing through each other
```

`collide.cjs` plays each step and lists contact between parts more than 3 mm before a part arrives; screws, inserts and bearings may touch along their own reach. Compare the snapshots with the manual pages: the right parts, the right places, a sensible direction of travel, a camera that shows the action. Check every build option your chapter touches.
