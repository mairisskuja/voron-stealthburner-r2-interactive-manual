// Hotend mount: the tool cartridge (manual pp. 45–51). The main CAD has the Revo Voron
// cartridge with its hotend; CAD/Printheads has the printed front and rear of every other
// supported hotend, in the same place. The `hotend` option picks one pair. Only the Revo Voron
// itself is in the CAD: for other hotends the printed parts are drawn and the hotend and its
// screws are listed. The front part is the root of the cartridge (it carries the rear, the
// hotend, the inserts and later the ADXL mount). See docs/transcripts/03-hotend-mount.md.
module.exports = ctx => {
  const {pick, add, near, each, auto, move, HOTENDS} = ctx;
  const RV = s => new RegExp('SB_r2_RevoVoron:1/' + s);
  const front = {}, rear = {};
  for (const h of HOTENDS) {
    const when = `hotend=${h.value}`, name = h.label;
    let f, r;
    if (h.value === 'revo-voron') {
      f = pick(RV('Printed_Parts:1/RevoVoron_Front'), 1); r = pick(RV('Printed_Parts:1/RevoVoron_Rear'), 1);
    } else {
      const all = pick(new RegExp(`^Printheads/${h.file}/`));
      // Front: y up to 0 (the toolhead's front is −y); rear: behind it. The Rapido rear is two solids.
      f = all.filter(i => ctx.center(i)[1] < -5); r = all.filter(i => ctx.center(i)[1] >= -5);
      if (f.length !== 1 || r.length < 1) throw Error(`${h.file}: expected one front and a rear, found ${f.length} and ${r.length}`);
    }
    const code = h.code.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    front[h.value] = add(`hm-front-${h.value}`, `Printhead front (${h.code})`, f, 'primary', {when, note: `stealthburner_printhead_…_front.stl, for the ${name}`});
    rear[h.value] = add(`hm-rear-${h.value}`, `Printhead rear (${h.code})`, r, 'primary', {when, parent: front[h.value], note: `stealthburner_printhead_…_rear_cw2.stl, for the ${name}`});
  }
  const FRONTS = Object.values(front), REARS = Object.values(rear);
  const onFront = {parents: FRONTS};
  const HSI = RV('Hardware \\(1\\):1/Heatset Inserts:1/M3 Threaded Insert');
  const inserts = each('hm-insert', 'M3 heat set insert', near(HSI, [[-12.7, -1.8, 55.4], [12.7, -1.8, 55.4]]), 'insert', onFront);
  const adxlInserts = each('hm-insert-adxl', 'M3 heat set insert', near(HSI, [[-25, -1.8, 35], [-28, -1.8, 19]]), 'insert', {...onFront, when: 'adxl'});
  const REVO = 'hotend=revo-voron', HW = s => RV('Hardware \\(1\\):1/Hotend:1/P6 Assembly \\(RevC\\):1/' + s);
  const heatsink = add('hm-heatsink', 'Revo Voron heatsink', pick(HW('Heatsink'), 1), 'hotend', {parent: front['revo-voron'], when: REVO});
  const spring = add('hm-revo-spring', 'Revo spring', pick(HW('Revo Spring'), 1), 'spring', {parent: heatsink, when: REVO});
  const core = add('hm-heatercore', 'Revo HeaterCore and nozzle', pick(HW('V7_wo_fan'), 10), 'hotend', {parent: heatsink, when: REVO});
  const hotendScrews = each('hm-m3x8', 'M3x8 SHCS', pick(RV('Hardware \\(1\\):1/Screws \\(1\\):1/M3x8 SHCS'), 4), 'bolt', {parent: heatsink, when: REVO});
  const joinScrews = each('hm-m3x16', 'M3x16 SHCS', pick(RV('Hardware \\(1\\):1/Screws \\(1\\):1/M3x16 SHCS'), 2), 'bolt', {parents: REARS});
  const ptfe = add('hm-ptfe', 'PTFE tube 4×2 mm, 30 mm', pick(RV('Hardware \\(1\\):1/PTFE Tube'), 1), 'ptfe', {...onFront, note: '29.8 mm in the CAD'});
  ctx.ids.hm = {front, rear, FRONTS, REARS, heatsink};

  const OTHER = 'hotend!=revo-voron';
  const byHotend = (fn) => HOTENDS.filter(h => h.value !== 'revo-voron').map(h => fn(h)).filter(Boolean);
  // Views from behind: the cartridge is built from its back.
  const V = {back: {az: 75, el: 22}, backL: {az: 110, el: 22}};
  const S = 'Tool Cartridge';
  return [
    {
      id: 'hm-markings', section: 'Part Markings', title: 'Front and rear parts', pages: [45],
      bench: [...FRONTS, ...REARS], view: {az: 120, el: 25},
      shift: {ids: REARS, vec: [0, 55, 0]}, movers: [],
      text: ['Pick the front and rear printhead parts for your hotend. The hotend type is embossed on both.',
        ...HOTENDS.map(h => ({text: `Yours read ${h.code} (${h.label}).`, when: `hotend=${h.value}`}))],
      notes: [
        {kind: 'tip', title: 'Identifying printed parts', text: 'The hotend type is embossed on the printed parts. Make sure they match your hotend.'},
        {kind: 'tip', title: 'Available mounts', text: 'We also provide mounts for other hotends. They are assembled in a similar manner. For a full list of available mounts and their identification code, see the readme file included in the toolheads folder. Pick yours under Configure.'}
      ]
    },
    {
      id: 'hm-inserts', section: 'Part Prep', title: 'Heat set inserts', pages: [46],
      bench: FRONTS, view: V.back,
      movers: [...auto(inserts, 0, 0.15), ...auto(adxlInserts, 1, 0.15)],
      text: ['Press 2 M3 heat set inserts into the back of the front part, top left and top right.', {text: 'For the ADXL mount, press 2 more into the holes at the lower edge.', when: 'adxl'}],
      notes: [{kind: 'tip', title: 'Optional: ADXL PCB mount', text: 'To use the optional ADXL PCB for Input Shaper calibration, add additional heat set inserts into the holes in highlighted location. If you are using a toolhead board with an accelerometer, these do not need to be installed.'}]
    },
    {
      id: 'hm-revo', section: 'Part Prep', title: 'Revo Voron hotend', pages: [47], when: REVO,
      bench: [heatsink], view: {az: 75, el: 10},
      movers: [...move(spring, [0, 0, -16]), ...move(core, [0, 0, -32], 1)],
      text: ['Put the Revo spring into the Revo Voron heatsink.', 'Screw the Revo HeaterCore with its nozzle in from below.']
    },
    {
      id: 'hm-hotend', section: 'Part Prep', title: 'Prepare your hotend', pages: [47], when: OTHER,
      bench: FRONTS, view: V.back, movers: [],
      text: ['Prepare your hotend as its maker describes. Its mounting hardware:',
        ...byHotend(h => ({text: `${h.label}: ${h.hw || 'mounted by the printed parts, no extra screws'}.`, when: `hotend=${h.value}`}))],
      notes: [
        ...byHotend(h => h.tip && {kind: 'tip', title: h.label, text: h.tip, when: `hotend=${h.value}`}),
        {kind: 'tip', title: 'Not drawn', text: 'The official CAD has the printed parts for this hotend but not the hotend itself, so the drawing shows the cartridge without it.'}
      ]
    },
    {
      id: 'hm-hotend-in', section: 'Part Prep', title: 'Hotend into the front part', pages: [48],
      bench: FRONTS, view: V.back,
      movers: move(heatsink, [0, 38, 0]),
      text: ['Set the hotend into the front part from behind and route its wires up the side as shown in the manual.',
        {text: 'Bend the HeaterCore’s strain relief so the nozzle can be fully hand tightened into the heatsink.', when: REVO}],
      notes: [
        {kind: 'tip', title: 'Hotend wire routing', text: 'Route the wires as shown to the right. This is universal to all hotend types.'},
        {kind: 'warn', title: 'Bend strain relief', text: 'Carefully bend the strain relief to clear the printed part. Firmly hold the HeaterCore to prevent bending the Revo Nozzle. It is critical that the Revo Nozzle is fully hand tightened into the heatsink. You MUST bend the strain relief to achieve this.', when: 'hotend=revo-voron|revo-micro|v6-r6'},
        {kind: 'warn', title: 'Asymmetrical heater blocks', text: 'For asymmetrical heater blocks, like V6 or Dragon HF, ensure the heater block is oriented towards the front. It should not touch the rear piece.', when: OTHER}
      ]
    },
    {
      id: 'hm-rear', section: S, title: 'Rear part', pages: [49],
      bench: FRONTS, view: V.backL,
      movers: [...move(REARS, [0, 38, 0]), ...auto(joinScrews, 1, 0.15)],
      text: ['Close the cartridge with the rear part.', 'Join the two with 2 M3x16 SHCS from the back into the inserts.',
        {text: 'The Rapido readmes list 2 M3x12 SHCS here instead.', when: 'hotend=rapido|rapido-v2'}]
    },
    {
      id: 'hm-hotend-screws', section: S, title: 'Hotend screws', pages: [50],
      bench: FRONTS, view: {az: 75, el: 55},
      movers: auto(hotendScrews, 0, 0.1),
      text: [{text: 'Secure the Revo Voron heatsink with 4 M3x8 SHCS from the top.', when: REVO},
        ...byHotend(h => ({text: h.hw ? `Secure the ${h.label} with its ${h.hw}, as the printhead readme describes.` : `The ${h.label} is held by the printed parts: no screws here.`, when: `hotend=${h.value}`}))],
      notes: [{kind: 'tip', title: 'M3 mounting bolts?', text: 'Bolts are hotend specific, Revo VORON uses M3 hardware as an improvement. This is the way.'}],
      extras: [
        {name: 'M2.5x8 SHCS', qty: 4, kind: 'bolt', when: 'hotend=dragon|bmo|rapido|rapido-v2'},
        {name: 'M3x12 SHCS', qty: 2, kind: 'bolt', when: 'hotend=bms6|bms7'},
        {name: 'M3x12 SHCS', qty: 4, kind: 'bolt', when: 'hotend=chube'},
        {name: 'M12x1.5 plastic mount nut', qty: 1, kind: 'nut', when: 'hotend=revo-micro'},
        ...byHotend(h => ({name: `${h.label} hotend`, qty: 1, kind: 'hotend', when: `hotend=${h.value}`}))
      ]
    },
    {
      id: 'hm-ptfe', section: S, title: 'PTFE tube', pages: [51],
      bench: FRONTS, view: {az: 40, el: 25},
      movers: move(ptfe, [0, 0, 32]),
      text: ['Push the PTFE tube down into the top of the cartridge. It sticks out 11 mm.'],
      notes: [{kind: 'tip', title: 'PTFE stick out', text: 'The PTFE tube should stick out 11mm above the surface of the printed part. The stick out length might vary if you use an extruder other than the Clockwork 2.5'}]
    }
  ];
};
