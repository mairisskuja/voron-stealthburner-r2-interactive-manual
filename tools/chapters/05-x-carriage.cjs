// X carriage (manual pp. 67–72). The CAD has the V2/Trident carriage (x_carriage_frame_left
// and _right) and, in the same place, the Switchwire carriage (SW_Carriage_Left/_Right); the
// first is drawn. The rail, its block and the 2020 extrusion stand for the printer's X axis.
// The Omron probe and its two M3x30 are not in the CAD. See docs/transcripts/04-x-carriage.md.
module.exports = ctx => {
  const {pick, near, add, each, auto, move} = ctx;
  const XC = s => new RegExp('X-Carriage_and_Rail:1/' + s);
  const HW = s => XC('X_Carriage v1:1/X_Carriage_Hardware:1/' + s);
  const ext = add('xc-extrusion', '2020 extrusion (X axis)', pick(XC('HFSB5-20-330'), 1), 'extrusion', {note: 'stands for the printer’s X axis'});
  const rail = add('xc-rail', 'MGN12 rail', pick(XC('MGN12 rail:1/=>'), 1), 'rail');
  const block = add('xc-block', 'MGN12H carriage block', pick(XC('MGN12 rail:1/MGN12H:1/'), 9), 'rail', {parent: rail});
  const fl = add('xc-frame-left', 'X carriage frame, left', pick(XC('X_Carriage v1:1/X_Carriage_Printed:1/x_carriage_frame_left'), 1), 'primary', {note: 'x_carriage_frame_left.stl (V2/Trident)'});
  const fr = add('xc-frame-right', 'X carriage frame, right', pick(XC('X_Carriage v1:1/X_Carriage_Printed:1/x_carriage_frame_right'), 1), 'primary', {parent: fl, note: 'x_carriage_frame_right.stl (V2/Trident)'});
  const bracket = add('xc-probe-bracket', 'Probe bracket', pick(XC('.*probe_bracket:1/Part38'), 1), 'primary', {parent: fl});
  const host = i => ({parent: ctx.center(i)[0] < 0 ? fl : fr});
  const ins = each('xc-insert', 'M3 heat set insert', near(HW('M3 Threaded Insert'), [[-16.4, 24.4, 70.9], [16, 24.4, 70.9], [-16.4, 16.6, 19.3], [16.1, 16.6, 19.3]]), 'insert', host);
  const brIns = each('xc-probe-insert', 'M3 heat set insert', pick(XC('.*probe_bracket:1/M3 Threaded Insert'), 2), 'insert', {parent: bracket});
  const nuts = each('xc-nut', 'M3 hex nut', pick(HW('M3 Hext Nut'), 2), 'nut', {parent: fr});
  const magnet = add('xc-magnet', '3x6 mm magnet', pick(HW('3x6mm Magnet'), 1), 'magnet', {parent: fr, note: 'in the CAD, not in the Stealthburner manual'});
  const blockScrews = each('xc-m3x8', 'M3x8 SHCS', pick(HW('M3x8 SHCS'), 4), 'bolt', host);
  const clamps = each('xc-m3x30', 'M3x30 SHCS', pick(HW('M3x30 SHCS'), 2), 'bolt', {parent: fl});
  const proud = each('xc-m3x12', 'M3x12 SHCS', pick(HW('M3x12 SHCS'), 2), 'bolt', host);
  ctx.ids.xc = {fl, fr};
  const SPEC = {kind: 'tip', title: 'Printer specific parts', text: 'We provide different versions of the carriage to fit our different printer designs. Be sure to pick the right one for your printer. The next few pages may look slightly different if you are building a Switchwire printer.'};
  const BASE = [ext, rail, block];
  return [
    {
      id: 'xc-inserts', section: 'Part Prep', title: 'Carriage inserts', pages: [67],
      bench: [fl, fr], shift: {ids: [fr], vec: [20, 0, 0]}, view: {az: -120, el: 20},
      movers: auto(ins, 0, 0.12),
      text: ['Press 2 M3 heat set inserts into the front of each carriage frame, at the top and bottom outer corners.'],
      notes: [{kind: 'tip', title: 'Toolhead mounting', text: 'The toolhead is secured to the carriage using the four mounting screws inserted from the front. Make sure the toolhead is seated flat against the carriage before tightening the screws in an X pattern.'}, SPEC]
    },
    {
      id: 'xc-nuts', section: 'Part Prep', title: 'Hex nuts and probe bracket', pages: [68],
      bench: [fl, fr, bracket], shift: {ids: [fr], vec: [20, 0, 0]}, view: {az: -40, el: 20},
      movers: [...move(nuts, [14, 0, 0], 0, 0.15), ...move(brIns, [0, -14, 0], 1, 0.15), ...move(magnet, [14, 0, 0], 2)],
      text: ['Press 2 M3 hex nuts into the right frame.', 'Press 2 M3 heat set inserts into the probe bracket.', 'The CAD also has a 3x6 mm magnet in the right frame, which the manual does not mention.'],
      notes: [SPEC]
    },
    {
      id: 'xc-rail', section: 'X Carriage', title: 'Carriage on the rail', pages: [69],
      bench: [...BASE, fl, fr], view: {az: -125, el: 22},
      movers: [...move(fl, [0, -35, 0]), ...auto(blockScrews, 1, 0.1)],
      text: ['Bolt the carriage frames to the MGN12H block with 4 M3x8 SHCS, 2 per frame.'],
      notes: [{kind: 'tip', title: 'Follow belting and X carriage installation outlined in printer manual', text: 'Consult the printer’s manual for instructions on how to run the belts and details on carriage mounting.'}]
    },
    {
      id: 'xc-clamps', section: 'X Carriage', title: 'Clamp and mounting screws', pages: [70],
      view: {az: -140, el: 18},
      movers: [...auto(clamps, 0, 0.15), ...auto(proud, 1, 0.15)],
      text: ['Fit 2 M3x30 SHCS from the left through both frames into the hex nuts.', 'Fit 2 M3x12 SHCS into the front of the frames and leave the heads 3 mm proud: the tool cartridge hooks onto them.'],
      notes: [{kind: 'tip', title: '30mm or 40mm?', text: 'The length of these two bolts can be different based on the specific printer you are building. This step has some overlap with the printer manuals. Please refer to the printer specific manual for the correct bolt lengths.'}],
      extras: [{name: 'GT2 belts (per the printer manual)', qty: 2, kind: 'misc'}]
    },
    {
      id: 'xc-probe', section: 'X Carriage', title: 'Probe', pages: [71],
      view: {az: -165, el: -35},
      movers: move(bracket, [0, 30, 0]),
      text: ['Slide the probe bracket into the bottom of the carriage from behind.', 'Fit the probe to it with 2 M3x30 SHCS (the probe is not in the CAD).'],
      notes: [{kind: 'tip', title: 'Other probe types', text: 'The picture shows the BOM-specified Omron TL-Q5MC probe. Other probes with a similar form factor and characteristics might work as well.'}],
      extras: [{name: 'Omron TL-Q5MC probe', qty: 1, kind: 'electronics'}, {name: 'M3x30 SHCS (probe)', qty: 2, kind: 'bolt'}]
    },
    {
      id: 'xc-probe-height', section: 'X Carriage', title: 'Probe height', pages: [72],
      view: {az: -90, el: 0}, focus: [bracket, fl, fr], movers: [],
      text: ['Set the probe tip about 6 mm below the carriage for now.'],
      notes: [{kind: 'tip', title: 'Adjust probe position', text: 'The position can be fine-tuned later. Set an initial position of about 6mm below the plastic part.'}]
    }
  ];
};
