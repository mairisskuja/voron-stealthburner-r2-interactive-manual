// Part and step catalog for the VORON Stealthburner R2 interactive manual (Stealthburner
// toolhead with Clockwork 2.5 extruder). This file holds the shared helpers and the build
// options; every chapter is a module in tools/chapters/ (NN-name.cjs, loaded in order) that
// adds its parts and returns its steps. Later chapters reach earlier parts through `ctx.ids`.
// CHAPTERS=01,03 builds only those chapter modules (for quick checks).
//
// Parts are picked from build/assembly.json (tools/step/convert_ocp.py + tools/step/merge.cjs)
// by their path in the STEP product tree, so the selection reads like the CAD browser. Every
// pick states how many instances it expects, and the build stops if the CAD no longer matches.
// Step order, titles and tips follow the official assembly manual (version 2026-11-07);
// `pages` holds the manual pages each step is based on.
//
// Build options: the CAD holds both main bodies (Bowden collet and ECAS04), a toolhead PCB, the
// hall effect filament sensor and the ADXL mount; CAD/Printheads holds the printed cartridge of
// every supported hotend. A part or step with `when` exists only in builds where it holds:
// 'pcb', '!sensor', 'ptfe=ecas', 'hotend=dragon', 'hotend!=revo-voron' or an array of these.
// A part on one of several alternative hosts lists them in `parents` (the first enabled one
// carries it). A mover with `out: true` takes a part away (a support piece, a replaced screw).

const fs = require('fs');
const path = require('path');

// Supported hotends, from STLs/Stealthburner/Printheads/README.md and the Rapido READMEs.
// `file` is the printhead STEP in CAD/Printheads (merged under Printheads/<file>/).
const HOTENDS = [
  {value: 'revo-voron', label: 'E3D Revo Voron', code: 'E-RV', file: 'RevoVoron', hw: '4× M3x8 SHCS', help: 'As in the manual and the main CAD.'},
  {value: 'revo-micro', label: 'E3D Revo Micro', code: 'E-RM', file: 'RevoMicro', hw: 'M12x1.5 plastic mount nut', tip: 'If your mount nut has a ridge on it, put that to the top.'},
  {value: 'v6-r6', label: 'E3D V6 / Revo Six', code: 'E-V/R6', file: 'V6_R6', hw: null},
  {value: 'dragon', label: 'Phaetus Dragon ST/SF/HF', code: 'P-DRG', file: 'Dragon', hw: '4× M2.5x8 SHCS', tip: 'Remove the screws attaching the groove-mount adaptor to access the hard mounting points.'},
  {value: 'bmo', label: 'Phaetus BMO', code: 'P-BMO', file: 'Phaetus_BMO', hw: '4× M2.5x8 SHCS', tip: 'Unscrew the groove-mount adaptor to access the hard mounting points.'},
  {value: 'bms6', label: 'Phaetus BMS (6 fins)', code: 'P-BMS6', file: 'Phaetus_BMS_6_Fin', hw: '2× M3x12 SHCS', tip: 'Phaetus has two versions of the BMS; Count the number of fins on your hotend to determine your version.'},
  {value: 'bms7', label: 'Phaetus BMS (7 fins)', code: 'P-BMS7', file: 'Phaetus_BMS_7_Fin', hw: '2× M3x12 SHCS', tip: 'Phaetus has two versions of the BMS; Count the number of fins on your hotend to determine your version.'},
  {value: 'rapido', label: 'Phaetus Rapido', code: 'P-RPD', file: 'Rapido', hw: '4× M2.5x8 SHCS', tip: 'Only the standard Rapido is supported (No UHF support). Mind the heatsink orientation: see the Rapido readme in the printheads folder.'},
  {value: 'rapido-v2', label: 'Phaetus Rapido V2', code: 'P-RPD V2', file: 'Rapido_V2', hw: '4× M2.5x8 SHCS', tip: 'Mind the heatsink orientation and route the heater wires below the mounting screw boss: see the Rapido V2 readme in the printheads folder.'},
  {value: 'chube', label: 'Chube Compact', code: 'Chube_Compact', file: 'Chube_Compact', hw: '4× M3x12 SHCS'}
];
const OPTIONS = [
  {key: 'hotend', label: 'Hotend', type: 'select', default: 'revo-voron', values: HOTENDS.map(h => ({value: h.value, label: h.label, help: h.value === 'revo-voron' ? h.help : `Printed cartridge ${h.code} from the official CAD. The hotend itself is not drawn.`}))},
  {key: 'ptfe', label: 'PTFE entry', type: 'select', default: 'collet', values: [
    {value: 'collet', label: 'Bowden collet', help: 'main_body_collet.stl with a Bowden collet and clip.'},
    {value: 'ecas', label: 'ECAS04 coupler', help: 'main_body_ecas04.stl with an ECAS04 coupler.'}]},
  {key: 'pcb', label: 'Toolhead PCB', type: 'bool', default: true, help: 'Optional. The CAD shows a Nitehawk-SB board.'},
  {key: 'sensor', label: 'Hall effect filament sensor', type: 'bool', default: true, help: 'Optional filament runout sensor in the extruder.'},
  {key: 'adxl', label: 'ADXL345 mount', type: 'bool', default: true, help: 'Optional, for input shaper calibration.'}
];

module.exports = function catalog(asm) {
  const I = asm.instances;
  const center = i => I[i].bbox[0].map((v, k) => (v + I[i].bbox[1][k]) / 2);
  const inside = (c, i, m = 0.5) => c.every((v, k) => v > I[i].bbox[0][k] - m && v < I[i].bbox[1][k] + m);
  const volume = i => I[i].bbox[1].reduce((s, v, k) => s * (v - I[i].bbox[0][k]), 1);
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const pick = (re, n) => {
    const out = I.map((_, i) => i).filter(i => re.test(I[i].path.join('/')));
    if (n !== undefined && out.length !== n) throw Error(`${re}: expected ${n} instances, found ${out.length}`);
    return out;
  };
  const parts = [], used = new Set();
  // The one instance of `re` nearest to a point (mm), for parts the CAD names alike. It must
  // lie within 1 mm, so a moved part in a new CAD release stops the build.
  const at = (re, p) => {
    const i = pick(re).filter(j => !used.has(j)).sort((a, b) => dist(center(a), p) - dist(center(b), p))[0];
    if (i === undefined || dist(center(i), p) > 1) throw Error(`${re}: nothing within 1 mm of ${p}`);
    return i;
  };
  const add = (id, name, inst, kind, extra = {}) => {
    inst = [].concat(inst);
    if (!inst.length || inst.some(i => i === undefined)) throw Error(`${id}: missing instance`);
    if (!kinds[kind]) throw Error(`${id}: unknown kind ${kind}`);
    inst.forEach(i => used.add(i));
    parts.push({id, name, inst, kind, ...extra});
    return id;
  };
  const free = (re, n) => {
    const out = pick(re).filter(i => !used.has(i));
    if (n !== undefined && out.length !== n) throw Error(`${re}: expected ${n} free instances, found ${out.length}`);
    return out;
  };
  const part = id => { const p = parts.find(q => q.id === id); if (!p) throw Error(`unknown part ${id}`); return p; };
  // Hardware gets one part per instance, so each piece can travel along its own axis.
  const each = (prefix, name, list, kind, extra = {}) => list.map((i, n) => add(`${prefix}-${n + 1}`, name, i, kind, typeof extra === 'function' ? extra(i) : extra));
  // Instances by nearest point, in the order given.
  const near = (re, points) => points.map(p => at(re, p));

  const auto = (ids, phase = 0, gap = 0.08, start = 0) => [].concat(ids).map((id, n) => ({id, vec: 'auto', phase, delay: start + n * gap}));
  const move = (ids, vec, phase = 0, gap = 0.1, start = 0) => [].concat(ids).map((id, n) => ({id, vec, phase, delay: start + n * gap}));
  const again = movers => movers.map(m => ({...m, again: true}));
  const out = movers => movers.map(m => ({...m, out: true}));

  const INSERTS = {kind: 'tip', title: 'Heat set inserts', text: 'This design relies heavily on heat set inserts. Make sure you have the proper inserts (check the hardware reference for a close-up picture and the Sourcing Guide for dimensions). If you’ve never worked with heat set inserts before we recommend you watch the linked guide.', link: 'https://voron.link/m5ybt4d'};

  const kinds = {
    primary: 'Printed, primary colour', accent: 'Printed, accent colour ([a] files)', glass: 'Printed, clear ([c] files)',
    motor: 'Motors', motion: 'Gears and shafts', bearing: 'Bearings', bolt: 'Screws', washer: 'Washers',
    insert: 'Heat set inserts', nut: 'Nuts', magnet: 'Magnets', spring: 'Springs', ptfe: 'PTFE and couplers',
    hotend: 'Hotend', fan: 'Fans', electronics: 'Electronics', rail: 'Linear rail', extrusion: 'Extrusion', misc: 'Other'
  };

  const ctx = {
    asm, I, pick, free, at, near, center, inside, volume, dist, add, each, part, parts, kinds,
    auto, move, again, out, notes: {INSERTS}, HOTENDS, ids: {}
  };
  const dir = path.join(__dirname, 'chapters');
  const only = process.env.CHAPTERS ? process.env.CHAPTERS.split(',') : null;
  const files = fs.readdirSync(dir).filter(f => /^\d\d-.*\.cjs$/.test(f)).sort();
  // Chapters as in the manual's table of contents; a step may name its own chapter.
  const CHAPTERS = {'01': 'Clockwork 2.5', '02': 'Hall Effect Sensor', '03': 'Hotend Mount', '04': 'Stealthburner Shroud',
    '05': 'X Carriage', '06': 'Mounting', '07': 'ADXL Mounting'};
  const steps = [];
  for (const f of files) {
    if (only && !only.some(o => f.startsWith(o))) continue;
    const chapter = CHAPTERS[f.slice(0, 2)];
    if (!chapter) throw Error(`${f}: no chapter title for ${f.slice(0, 2)}`);
    steps.push(...require(path.join(dir, f))(ctx).map(s => ({chapter, ...s})));
  }
  return {parts, steps, kinds, options: OPTIONS};
};
