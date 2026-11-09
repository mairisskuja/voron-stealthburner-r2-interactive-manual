// Stealthburner shroud, LEDs, hotend fan and part cooling fan (manual pp. 53–64). The shroud
// body is the root: everything here rides on it, and it goes onto the toolhead in
// 06-mounting. Chapters follow the manual's table of contents (Stealthburner Shroud, LEDs,
// Hotend Fan, Part Cooling Fan). See docs/transcripts/03-shroud.md.
module.exports = ctx => {
  const {pick, add, each, auto, move} = ctx;
  const SH = s => new RegExp('SB_r2_Shroud:1/Shroud:1/' + s);
  const LED = s => SH('Shroud_Hardware:1/LEDs:1/' + s);
  const body = add('sh-body', 'Stealthburner main body', pick(SH('Shroud_Printed_Parts:1/stealthburner_body'), 2), 'accent', {note: '[a]_stealthburner_main_body.stl'});
  const ledR = add('sh-led-right', 'RGBW LED (toolhead right)', pick(LED('rgbw_led_pcb:2$'), 14), 'electronics', {parent: body, note: 'Neopixel, index 2'});
  const ledL = add('sh-led-left', 'RGBW LED (toolhead left)', pick(LED('rgbw_led_pcb:3$'), 14), 'electronics', {parent: body, note: 'Neopixel, index 3'});
  const carrier = add('sh-led-carrier', 'LED carrier', pick(LED('Logo_Led:1/LED_Carrier'), 1), 'primary', {parent: body, note: '[o]_stealthburner_LED_carrier.stl, opaque'});
  const logoLed = add('sh-led-logo', 'RGBW LED (logo)', pick(LED('Logo_Led:1/rgbw_led_pcb:1$'), 14), 'electronics', {parent: carrier, note: 'Neopixel, index 1'});
  const mask = add('sh-diffuser-mask', 'LED diffuser mask', pick(LED('Logo_Led:1/LED_Diffuser_Mask'), 1), 'primary', {parent: body, note: '[o]_stealthburner_LED_diffuser_mask.stl, opaque'});
  const diffuser = add('sh-diffuser', 'LED diffuser', pick(LED('Logo_Led:1/LED_Diffuser:1'), 1), 'glass', {parent: mask, note: '[c]_stealthburner_LED_diffuser.stl, translucent'});
  const fan = add('sh-hotend-fan', '4010 axial fan', pick(SH('Shroud_Hardware:1/Stealthburner_Fans:1/4010 Axial Fan'), 1), 'fan', {parent: body, note: 'hotend fan'});
  const blower = add('sh-blower', '5015 blower fan', pick(SH('Shroud_Hardware:1/Stealthburner_Fans:1/5015 Fan:1/'), 2), 'fan', {parent: body, note: 'part cooling fan, front cover and ears removed'});
  const fhcs = each('sh-m3x6', 'M3x6 FHCS', pick(SH('Shroud_Hardware:1/Screws:1/M3x6 FHCS'), 2), 'bolt', {parent: blower});
  ctx.ids.sh = {body};

  // Views from behind: the shroud is filled from its back.
  const BACK = {az: 70, el: 35}, FRONT = {az: 110, el: 15};
  return [
    {
      id: 'sh-supports', chapter: 'Stealthburner Shroud', section: 'Supports', title: 'Remove the supports', pages: [53],
      bench: [body], view: BACK, focus: [body], movers: [],
      text: ['Remove the three small built-in supports from inside the Stealthburner main body.'],
      notes: [{kind: 'tip', title: 'Remove supports', text: 'Remove built-in supports (highlighted in the image) with flush cutters.'}]
    },

    {
      id: 'sh-led-wiring', chapter: 'LEDs', section: 'LEDs', title: 'LED wiring', pages: [54],
      bench: [ledR, ledL, logoLed], view: FRONT, focus: [ledR, ledL, logoLed], movers: [],
      text: ['Chain the three RGBW LEDs: from the controller to the logo LED (index 1), on to the toolhead LED right (index 2) and the toolhead LED left (index 3).', 'Wire each LED’s OUT to the next one’s IN. Lengths: 120 mm to the controller, 100 mm logo to right, 75 mm right to left, 3 wires of 0.16 mm² (AWG26–30).', 'The manual’s page 54 has the wiring diagram.'],
      notes: [{kind: 'warn', title: 'LED wiring', text: 'Connect the “OUT” side of the LED to the “IN” side of the next LED in the chain. Solder the wires as shown on the right. Both the “IN” and the “OUT” wires must exit in the same direction in order to fit into the printed parts.'}],
      extras: [{name: '3-core wire 0.16 mm² (AWG26–30), 120 + 100 + 75 mm', qty: 1, kind: 'electronics'}]
    },
    {
      id: 'sh-logo-led', chapter: 'LEDs', section: 'LEDs', title: 'Logo LED, diffuser and mask', pages: [55],
      bench: [carrier, mask], shift: {ids: [carrier], vec: [0, 30, 0]}, view: {az: 60, el: 25},
      movers: [...move(logoLed, [-3, 11, 10]), ...move(diffuser, [0, 22, 0], 1)],
      text: ['Push the logo LED down into the LED carrier.', 'Fit the translucent diffuser into the opaque mask.'],
      notes: [{kind: 'tip', title: 'LED diffuser and mask', text: 'The diffuser (highlighted part) is printed in a translucent filament to evenly spread the light. The mask (part to the left) is printed in an opaque filament to prevent the light from leaking, resulting in a crisp logo.'}]
    },
    {
      id: 'sh-nozzle-leds', chapter: 'LEDs', section: 'LEDs', title: 'Toolhead LEDs', pages: [56],
      bench: [body], view: {az: 90, el: -50},
      movers: [...move(ledL, [-3.3, 0.9, -14.6]), ...move(ledR, [3.3, 0.9, -14.6], 0, 0, 0.15)],
      text: ['Press the toolhead LED left and right up into their pockets either side of the nozzle opening, wires leading out.']
    },
    {
      id: 'sh-diffuser', chapter: 'LEDs', section: 'LEDs', title: 'Diffuser', pages: [57],
      bench: [body], view: BACK,
      movers: move(mask, [-3, 10, -23]),
      text: ['Insert the diffuser and mask into the logo window from inside the shroud and push them towards the front.'],
      notes: [{kind: 'tip', title: 'Diffuser insertion', text: 'Insert the printed parts and push them towards the front.'}]
    },
    {
      id: 'sh-carrier', chapter: 'LEDs', section: 'LEDs', title: 'LED carrier', pages: [58],
      bench: [body], view: BACK,
      // The carrier's slot opens downwards: it goes in through the empty fan bay, then up.
      movers: [{id: carrier, vec: [0, 30, -30], via: [[0, 0, -14]], phase: 0, delay: 0}],
      text: ['Slide the LED carrier with the logo LED into its slot behind the diffuser. In the CAD it goes in through the empty fan bay and up into place.']
    },
    {
      id: 'sh-led-routing', chapter: 'LEDs', section: 'LEDs', title: 'LED wires', pages: [59],
      bench: [body], view: BACK, focus: [body], movers: [],
      text: ['Route the LED wires from the logo down around the fan bay to the toolhead LEDs, as shown in the manual. They exit on the right side.'],
      notes: [{kind: 'tip', title: 'LED wire routing', text: 'Route the LED wires as shown; wires exit on the right side.'}]
    },

    {
      id: 'sh-fan-supports', chapter: 'Hotend Fan', section: 'Supports', title: 'Fan bay supports', pages: [60],
      bench: [body], view: BACK, focus: [body], movers: [],
      text: ['Leave the two thin supports in the fan bay: the fan breaks them as it goes in.'],
      notes: [{kind: 'tip', title: 'Support structure', text: 'The highlighted parts are built-in support structures. They are designed to break during the fan installation.'}]
    },
    {
      id: 'sh-hotend-fan', chapter: 'Hotend Fan', section: 'Hotend Fan', title: 'Hotend fan', pages: [61],
      bench: [body], view: BACK,
      movers: move(fan, [-14, 20, -3]),
      text: ['Turn the 4010 fan so its wires exit at the top and it blows inwards.', 'Insert it at a slight angle into the lower bay and clip it into place.'],
      notes: [
        {kind: 'warn', title: 'Fan orientation', text: 'Rotate the fan so that the wires exit on the top and the air is pushed “inwards”.'},
        {kind: 'tip', title: 'Fan insertion', text: 'Insert the fan at a slight angle and clip it into place. Mind the fan orientation.'}
      ]
    },
    {
      id: 'sh-fan-wires', chapter: 'Hotend Fan', section: 'Hotend Fan', title: 'Fan wires', pages: [62],
      bench: [body], view: {az: 90, el: 10}, focus: [fan], movers: [],
      text: ['Route the fan wires up and out of the right side, as shown in the manual.'],
      notes: [{kind: 'tip', title: 'Fan wire routing', text: 'Route the fan wires as shown, exiting on the right side'}]
    },

    {
      id: 'sh-blower-prep', chapter: 'Part Cooling Fan', section: 'Part Cooling Fan', title: 'Prepare the 5015 fan', pages: [63],
      bench: [blower], view: {az: 70, el: 15}, focus: [blower], movers: [],
      text: ['Remove the front cover of the 5015 blower.', 'Clip off and file down its two mounting ears.'],
      notes: [{kind: 'tip', title: 'Fan preparation', text: 'Remove the front of the 5015 fan. Clip off and file down the stock mounting ears. There’s a trimming jig STL included in the release to make this task easier.'}]
    },
    {
      id: 'sh-blower', chapter: 'Part Cooling Fan', section: 'Part Cooling Fan', title: 'Part cooling fan', pages: [64],
      bench: [body], view: BACK,
      movers: [...move(blower, [0, 35, 0]), ...auto(fhcs, 1, 0.15)],
      text: ['Set the trimmed blower into the upper bay from behind.', 'Secure it with 2 M3x6 FHCS.']
    }
  ];
};
