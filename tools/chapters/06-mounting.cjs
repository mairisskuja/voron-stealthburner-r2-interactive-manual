// Mounting (manual pp. 73–76): the extruder, the tool cartridge and the shroud, each built on
// the bench, go onto the carriage. See docs/transcripts/04-x-carriage.md.
module.exports = ctx => {
  const {pick, at, add, each, auto, move, again} = ctx;
  const {plate} = ctx.ids.cw, {FRONTS} = ctx.ids.hm, {body} = ctx.ids.sh, {fl, fr} = ctx.ids.xc;
  const FA = new RegExp('CW2\\.5_Hardware_Subassembly:1/Fasteners:1/M3x8 SHCS \\(2\\) \\(1\\)');
  const cwR = add('mt-m3x8-right', 'M3x8 SHCS', at(FA, [16.2, 20.5, 70.9]), 'bolt', {parent: fr});
  const cwL = add('mt-m3x8-left', 'M3x8 SHCS', at(FA, [-16.4, 20.5, 70.9]), 'bolt', {parent: fl});
  const SC = s => new RegExp('SB_r2_Shroud:1/Shroud:1/Shroud_Hardware:1/Screws:1/' + s);
  const m25 = each('mt-m3x25', 'M3x25 SHCS', pick(SC('M3x25 SHCS'), 2), 'bolt', {parent: body});
  const m50 = each('mt-m3x50', 'M3x50 SHCS', pick(SC('M3x50 SHCS'), 2), 'bolt', {parent: body});
  const V = {az: -125, el: 20};
  return [
    {
      id: 'mt-cw', section: 'CW2.5 Mounting', title: 'Extruder onto the carriage', pages: [73],
      view: V,
      movers: [...again(move(plate, [0, 0, 55])), {id: cwR, vec: [0, -14, 0], phase: 1, delay: 0}],
      text: ['Set the Clockwork 2.5 on top of the carriage.', 'Fit an M3x8 SHCS through the main body, lower right, into the carriage.']
    },
    {
      id: 'mt-cw-2', section: 'CW2.5 Mounting', title: 'Second extruder screw', pages: [74],
      view: {az: -100, el: 10},
      movers: [{id: cwL, vec: [0, -14, 0], phase: 0, delay: 0}],
      text: ['Fit the second M3x8 SHCS at the lower left, through the access hole in the front.'],
      notes: [{kind: 'tip', title: 'Access hole', text: 'The bolt can be accessed from the front of the extruder.'}]
    },
    {
      id: 'mt-cartridge', section: 'Tool Cartridge Mounting', title: 'Tool cartridge', pages: [75],
      view: V,
      movers: again(move(FRONTS, [0, -25, -45])),
      text: ['Slide the tool cartridge up under the extruder and hook it onto the two proud M3x12 heads. The PTFE tube goes up into the extruder.']
    },
    {
      id: 'mt-shroud', section: 'SB Mounting', title: 'Stealthburner shroud', pages: [76],
      view: V,
      movers: [...again(move(body, [0, -55, 0])), ...auto(m25, 1, 0.12), ...auto(m50, 1, 0.12, 0.3)],
      text: ['Close the Stealthburner over the front.', 'Fit 2 M3x25 SHCS at the top and 2 M3x50 SHCS at the bottom, through the shroud into the extruder and the carriage.']
    }
  ];
};
