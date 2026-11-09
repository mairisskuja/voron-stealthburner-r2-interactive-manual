// ADXL345 mount, optional (manual p. 78), and the closing page (p. 79).
module.exports = ctx => {
  const {pick, add, each, auto, move} = ctx;
  const {FRONTS} = ctx.ids.hm;
  const A = s => new RegExp('ADXL_Assembly - Generic:1/' + s);
  const W = 'adxl';
  const mount = add('ad-mount', 'ADXL mount (generic, 15.5 mm)', pick(A('adxl_mount_generic'), 1), 'primary', {parents: FRONTS, when: W, note: 'sb_adxl_mount_generic_15.5mm_c_c.stl'});
  const board = add('ad-board', 'ADXL345 board', pick(A('asxl345_sensor_generic')), 'electronics', {parent: mount, when: W, note: 'prototype board'});
  const spacers = each('ad-washer', 'ADXL washer', pick(A('ADXL_Printed:1/adxl_screw_spacer'), 2), 'primary', {parent: mount, when: W, note: 'sb_adxl_washer_x2.stl'});
  const m2 = each('ad-m2x10', 'M2x10 self tapping screw', pick(A('ADXL_Hardware:1/M2x10'), 2), 'bolt', {parent: board, when: W});
  const m3 = each('ad-m3x12', 'M3x12 SHCS', pick(A('ADXL_Hardware:1/M3x12 SHCS'), 2), 'bolt', {parent: mount, when: W});
  const S = 'ADXL345 Mount';
  return [
    {
      id: 'ad-assemble', section: S, title: 'ADXL on its mount', pages: [78], when: W,
      bench: [mount], view: {az: 160, el: 15},
      movers: [...move(board, [-18, 0, 0]), ...move(spacers, [-20, 0, 0], 1, 0.15), ...move(m2, [-40, 0, 0], 2, 0.15)],
      text: ['Put the ADXL345 board on the mount, the 2 printed washers over its mounting holes, and fix it with 2 M2x10 self tapping screws.'],
      notes: [{kind: 'tip', title: 'Isolation spacers', text: 'Most ADXL345 prototype boards have circuit tracks close to the mounting holes. Make sure to install spacers to prevent damage to the board. We included printable spacers in the release.'}]
    },
    {
      id: 'ad-mount', section: S, title: 'Mount on the toolhead', pages: [78], when: W,
      view: {az: 150, el: -18},
      movers: [...move(mount, [0, 30, 0]), ...auto(m3, 1, 0.15)],
      text: ['Fix the mount to the back of the tool cartridge with 2 M3x12 SHCS into the inserts you added for it.'],
      notes: [
        {kind: 'warn', title: 'ADXL mount and input shaper calibration', text: 'The ADXL is intended to be mounted only when doing vibration testing/input shaper calibration and should not be left on the tool head during normal printing.'},
        {kind: 'tip', title: 'Mounting to the toolhead', text: 'You can use M3x12 screws to mount this assembly to your toolhead.'}
      ]
    },
    {
      id: 'finale', chapter: 'Next Steps', section: 'Next Steps', title: 'Assembly completed!', pages: [79], finale: true,
      view: {az: -125, el: 18}, movers: [],
      text: ['Your Stealthburner is built. Next: setup and calibration.', 'The software setup and the first steps with your new toolhead are on the VORON documentation pages.'],
      notes: [{kind: 'tip', title: 'Next step: setup & calibration', text: 'This manual is designed to be a reference manual for the build process of a VORON Stealthburner Toolhead. Additional details about the build and background on advanced topics can be found on our documentation page.', link: 'https://docs.vorondesign.com/'}]
    }
  ];
};
