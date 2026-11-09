// Hall effect filament sensor, optional (manual pp. 39–42). The sensor replaces the latch's
// M3x20 pivot screw with a ferrous M3x25: the M3x20 leaves in the magnet step. The CAD holds
// two brackets in the same place ([a]_hall_effect_bracket and the retained/DIY variant); the
// first is drawn. See docs/transcripts/01-clockwork.md (pp. 39–42).
module.exports = ctx => {
  const {pick, add, auto, move, out} = ctx;
  const {plate, BODY, latchScrew} = ctx.ids.cw;
  const R = s => new RegExp('CW2\\.5_Assembly:1/.*' + s);
  const S = 'sensor';
  const bracket = add('hs-bracket', 'Hall effect bracket', pick(R('CW2\\.5_Printed_Parts_Subassembly:1/CW2\\.5_\\[a\\]_hall_effect_bracket:1$'), 1), 'accent', {parent: plate, when: S, note: '[a]_hall_effect_bracket.stl'});
  const sensor = add('hs-sensor', 'Hall effect sensor', pick(R('Runout Sensor Hardware:1/AH3364Q-P-B'), 4), 'electronics', {parent: bracket, when: S, note: 'AH3364Q in the CAD'});
  const magnet = add('hs-magnet', 'N52 6x3 mm magnet', pick(R('Runout Sensor Hardware:1/6x3mm Magnet'), 1), 'magnet', {parents: BODY, when: S});
  const screw = add('hs-m3x25', 'M3x25 SHCS', pick(R('Fasteners:1/M3x25 SHCS \\(1\\):2$'), 1), 'bolt', {parent: bracket, when: S, note: 'ferrous (magnetic) screw'});
  const sec = 'Hall Effect Sensor (Optional)', V = {az: -105, el: 15};
  return [
    {
      id: 'hs-prep', section: sec, title: 'Sensor and bracket', pages: [39], when: S,
      bench: [bracket], view: {az: -60, el: 30},
      movers: move(sensor, [-22, 0, 0]),
      text: ['Solder three wires to the sensor pins: +5V, GND and Signal.', 'Slide the sensor into the printed bracket, pins and wires through the hole, then bend the pins around the bracket.'],
      notes: [
        {kind: 'tip', title: 'Prepping the sensor', text: 'Solder wires to the sensor pins as shown.'},
        {kind: 'tip', title: 'Assemble the sensor', text: 'Run wires and pins through the hole in the printed bracket, and slide sensor into place. Two printed bracket versions are available. Use the version that corresponds with your hardware.'},
        {kind: 'warn', title: 'Bend the pins', text: 'Turn the assembly over and carefully bend the pins around the printed bracket. The pins are delicate and may break if bent repeatedly or too sharply.'}
      ],
      extras: [{name: 'Sensor wires', qty: 3, kind: 'electronics'}]
    },
    {
      id: 'hs-magnet', section: sec, title: 'Magnet', pages: [40], when: S,
      bench: [plate], view: V,
      movers: [...out(move(latchScrew, [0, -40, 0])), ...move(magnet, [-15, -20, 0], 1)],
      text: ['Remove the latch’s M3x20 SHCS.', 'Drop the N52 6x3 mm magnet into the channel beside the filament path, south pole facing outward.'],
      notes: [
        {kind: 'tip', title: 'Remove screw', text: 'Remove this M3x20 SHCS to allow installation of the hall effect sensor.'},
        {kind: 'tip', title: 'The N52 magnet', text: 'Insert the N52 6x3mm magnet into the channel, south pole facing outward. Make sure it can slide horizontally without obstruction. To determine the south pole, stack two magnets together to strengthen the magnetic field. Then stand the stack on its circumference on a smooth, level surface so it can rotate freely. It should naturally align with Earth’s magnetic field, allowing you to identify the north- and south-facing poles. The linked guide may be helpful for this step.', link: 'https://voron.link/htekfs8'}
      ]
    },
    {
      id: 'hs-install', section: sec, title: 'Install the sensor', pages: [41], when: S,
      bench: [plate], view: V,
      movers: [...move(bracket, [8, -18, -3]), ...auto(screw, 1)],
      text: ['Slide the sensor and bracket into the slot over the magnet.', 'Secure it with a ferrous M3x25 SHCS where the M3x20 was. Leave it slightly loose.'],
      notes: [
        {kind: 'warn', title: 'Install the sensor', text: 'The printed bracket and sensor will retain the magnet in the channel. Insert the assembly and secure with a ferrous/magnetic M3x25 SHCS. Do not fully tighten. The magnet must have clearance to move horizontally.'},
        {kind: 'check', title: 'Filament test', text: 'Insert filament and verify that the magnet is pushed fully to the side. Remove the filament; the magnet should return to its starting position.'}
      ]
    },
    {
      id: 'hs-wires', section: sec, title: 'Sensor wires', pages: [42], when: S,
      bench: [plate], view: {az: -90, el: 5}, focus: [bracket],
      movers: [],
      text: ['Route the sensor wires up and out as shown in the manual.', 'Seen from the front, the pins are Signal, GND and +5V from top to bottom.'],
      notes: [
        {kind: 'tip', title: 'Tidy up', text: 'Route the wires as shown.'},
        {kind: 'check', title: 'Pinout', text: 'Verify the sensor pinout matches the diagram when viewed from the front.'}
      ]
    }
  ];
};
