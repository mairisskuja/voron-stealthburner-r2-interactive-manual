// Clockwork 2.5 extruder (manual pp. 11–38). The motor plate is the root of the extruder:
// every part of it rides on the plate, so the finished extruder moves onto the X carriage in
// one move (06-mounting). Both main bodies are in the CAD: the collet body or the ECAS04 body
// is drawn, following the `ptfe` option. See docs/transcripts/01-clockwork.md.
module.exports = ctx => {
  const {pick, at, near, add, each, auto, move, out, volume, notes} = ctx;
  const CW = 'CW2\\.5_Assembly:1/';
  const R = s => new RegExp(CW + s);
  const HS = R('CW2\\.5_Hardware_Subassembly:1/Heatsets:1/M3 Threaded Insert');
  const FA = s => R('CW2\\.5_Hardware_Subassembly:1/Fasteners:1/' + s);
  const PP = s => R('CW2\\.5_Printed_Parts_Subassembly:1/' + s);
  const BMG = s => R('BMG_Extruder_Hardware:1/' + s);
  const bySize = list => list.sort((a, b) => volume(b) - volume(a));

  // ---------- printed parts ----------
  const plate = add('cw-plate', 'Motor plate', pick(PP('CW2\\.5_motor_plate:1$'), 1), 'primary', {note: 'motor_plate.stl'});
  // Each main body STEP part holds the body and the small support block in the sensor slot (p.23).
  const [bodyC, supC] = bySize(pick(PP('CW2\\.5_Main_Body_Collet:1$'), 2));
  const [bodyE, supE] = bySize(pick(PP('CW2\\.5_Main_Body_ECAS04:1/'), 2));
  const body = add('cw-body', 'Main body (collet)', bodyC, 'primary', {parent: plate, when: 'ptfe=collet', note: 'main_body_collet.stl'});
  const bodyEcas = add('cw-body-ecas', 'Main body (ECAS04)', bodyE, 'primary', {parent: plate, when: 'ptfe=ecas', note: 'main_body_ecas04.stl'});
  const BODY = [body, bodyEcas], onBody = {parents: BODY};
  const support = add('cw-support', 'Built-in support', supC, 'primary', {parent: body, when: 'ptfe=collet'});
  const supportEcas = add('cw-support-ecas', 'Built-in support', supE, 'primary', {parent: bodyEcas, when: 'ptfe=ecas'});
  const ga = add('cw-guidler-a', 'Guidler A', pick(PP('CW2\\.5_\\[a\\]_guidler_a:1$'), 1), 'accent', {parent: plate, note: '[a]_guidler_a.stl'});
  const gb = add('cw-guidler-b', 'Guidler B', pick(PP('CW2\\.5_\\[a\\]_guidler_b:1$'), 1), 'accent', {parent: ga, note: '[a]_guidler_b.stl'});
  const shuttle = add('cw-shuttle', 'Latch shuttle', pick(PP('CW2\\.5_\\[a\\]_shuttle:1$'), 1), 'accent', {parent: ga, note: '[a]_latch_shuttle.stl'});
  const latch = add('cw-latch', 'Latch', pick(PP('CW2\\.5_\\[a\\]_latch:1$'), 1), 'accent', {parent: plate, note: '[a]_latch.stl'});
  const anchor = add('cw-anchor', 'Cable anchor (umbilical)', pick(PP('CW2\\.5_Cable_Chain_Anchors:1/cable_anchor_umbilical'), 1), 'primary', {parent: plate, note: 'cable_anchor_umbilical.stl, as in the CAD; the manual shows a cable chain anchor'});
  const cover = add('cw-cover', 'Cable cover', pick(PP('CW2\\.5_Cable_Cover_HexMesh_Thick:1/'), 2), 'primary', {parent: plate, note: 'cable_cover.stl'});
  const spacer = add('cw-pcb-spacer', 'PCB spacer', pick(PP('CW2\\.5_\\[a\\]_pcb_spacer:1$'), 1), 'accent', {parent: plate, when: 'pcb', note: '[a]_pcb_spacer.stl'});

  // ---------- heat set inserts (12 in the CAD) ----------
  const ins = (prefix, points, extra) => each(prefix, 'M3 heat set insert', near(HS, points), 'insert', extra);
  const bodyIns = ins('cw-body-insert', [[22.7, -4, 71.5], [-22.7, -4, 71.5]], onBody);
  const plateIns = ins('cw-plate-insert', [[3.6, 16.4, 114.9], [-21.8, 19.4, 115.3], [-30, 20.4, 100.2], [-5.4, 19.4, 73.1], [6.8, 16.6, 69.5], [22.9, 17.9, 69.7]], {parent: plate});
  const pcbPlateIns = ins('cw-pcb-insert-plate', [[11.4, 17.9, 106.9]], {parent: plate, when: 'pcb'});
  const pcbBodyIns = ins('cw-pcb-insert-body', [[11.4, 5.9, 94.1]], {...onBody, when: 'pcb'});
  const gaIns = ins('cw-guidler-insert', [[-10.2, 11.5, 92.3]], {parent: ga});
  const shuttleIns = ins('cw-shuttle-insert', [[-11.6, 9.3, 107.9]], {parent: shuttle});
  // The CAD places this insert 0.59 mm off the anchor's bore (it sits on the motor plate's screw
  // axis; the anchor is placed slightly turned). Drawn centred in the bore.
  const anchorIns = each('cw-anchor-insert', 'M3 heat set insert', pick(R('CW2\\.5_Cable_Chain_Anchors_Hardware:1/M3 Threaded Insert'), 1), 'insert', {parent: anchor, fix: {vec: [0.498, 0, 0.31], why: 'centred in the cable anchor bore'}});

  // ---------- drive and idler ----------
  const shaft = add('cw-shaft', 'Gear shaft (50T)', pick(BMG('Driveshaft Assembly.*/Shaft-assembly'), 2), 'motion', {parent: plate, note: 'BMG gear shaft with its 50-tooth gear'});
  const drive = add('cw-drive-gear', 'Drive gear', pick(BMG('Driveshaft Assembly.*/Direct_Drivegear \\(1\\) \\(1\\):1$'), 1), 'motion', {parent: shaft});
  const grub = add('cw-grub', 'Set screw', pick(BMG('Driveshaft Assembly.*/DIN 913'), 1), 'bolt', {parent: drive});
  const [brPlate] = near(BMG('Driveshaft Assembly.*/MR825'), [[4.7, 21, 86.3]]);
  const [brBody] = near(BMG('Driveshaft Assembly.*/MR825'), [[4.7, -4.6, 86.3]]);
  const bearingPlate = add('cw-bearing-plate', 'MR85 bearing', brPlate, 'bearing', {parent: plate});
  const bearingBody = add('cw-bearing-body', 'MR85 bearing', brBody, 'bearing', onBody);
  const IDL = s => BMG('Direct_Drivegear_without_setscrew.*/' + s);
  const idler = add('cw-idler-gear', 'Idler gear', pick(IDL('Part36'), 1), 'motion', {parent: ga, note: 'BMG idler'});
  const pin = add('cw-idler-pin', 'Idler pin 3×20', pick(IDL('stift 3 x 20'), 1), 'motion', {parent: idler});
  const needles = [1, 2].map(n => add(`cw-needle-${n}`, 'Needle bearing', pick(IDL(`K3x5x7 Needlebearing.*:${n}$`), 6), 'bearing', {parent: idler}));
  const thumb = add('cw-thumbscrew', 'M3 thumb screw', pick(BMG('Spring Assembly.*/M3 Thumb Screw'), 2), 'bolt', {parent: ga});
  const spring = add('cw-spring', 'BMG spring', pick(BMG('Spring Assembly.*/BMG Spring'), 1), 'spring', {parent: thumb});
  const nylon = add('cw-nylon-washer', 'Nylon washer', pick(BMG('Nylon Washer'), 1), 'washer', {parent: thumb});

  // ---------- motor and fasteners ----------
  const motor = add('cw-motor', 'NEMA14 pancake stepper', pick(R('NEMA14 Pancake Stepper Body'), 2), 'motor', {parent: plate});
  const [s25a, s25b] = near(FA('M3x25 SHCS'), [[-21.8, 6.8, 115.3], [6.8, 6.4, 69.5]]);
  const bodyScrews = [add('cw-m3x25-1', 'M3x25 SHCS', s25a, 'bolt', onBody), add('cw-m3x25-2', 'M3x25 SHCS', s25b, 'bolt', onBody)];
  const pivot = add('cw-m3x25-pivot', 'M3x25 SHCS', at(FA('M3x25 SHCS'), [-5.4, 6.4, 73.1]), 'bolt', {parent: ga});
  const latchScrew = add('cw-m3x20-latch', 'M3x20 SHCS', pick(FA('M3x20 SHCS'), 1), 'bolt', {parent: latch});
  const guidlerScrew = add('cw-m3x16-guidler', 'M3x16 SHCS', at(FA('M3x16 SHCS'), [-10.2, 4.2, 92.3]), 'bolt', {parent: gb});
  const motorScrew = add('cw-m3x30-motor', 'M3x30 SHCS', pick(FA('M3x30 SHCS'), 1), 'bolt', {parent: motor});
  const motorScrew2 = add('cw-m3x8-motor', 'M3x8 SHCS', at(FA('M3x8 SHCS'), [-19.5, 20.6, 82.1]), 'bolt', {parent: motor});
  const motorWasher = add('cw-washer-motor', 'M3 washer', pick(R('CW2\\.5_Hardware_Subassembly:1/DIN EN ISO 7089'), 1), 'washer', {parent: motor});
  const pcbScrews = each('cw-m3x8-pcb', 'M3x8 SHCS', near(FA('M3x8 SHCS'), [[16.3, 5.9, 94.1], [16.3, 17.9, 106.9]]), 'bolt', {parent: plate, when: 'pcb'});
  const coverPost = add('cw-m3x16-cover', 'M3x16 SHCS', at(FA('M3x16 SHCS'), [-11.8, 24.5, 120.8]), 'bolt', {parent: plate});
  const coverScrew = add('cw-m3x6-cover', 'M3x6 BHCS', pick(FA('M3x6 BHCS'), 1), 'bolt', {parent: cover});
  // The CAD's umbilical anchor uses an M3x30 where the manual's chain anchor uses an M3x20; the
  // CAD has both in the same place. The M3x30 is drawn with the anchor the CAD has.
  const anchorScrew = add('cw-m3x30-anchor', 'M3x30 SHCS', pick(R('CW2\\.5_Cable_Chain_Anchors_Hardware:1/M3x30 SHCS'), 1), 'bolt', {parent: anchor});
  const anchorScrew2 = add('cw-m3x8-anchor', 'M3x8 SHCS', pick(R('CW2\\.5_Cable_Chain_Anchors_Hardware:1/M3x8 SHCS'), 1), 'bolt', {parent: anchor});

  // ---------- PTFE entry ----------
  const collet = add('cw-collet', 'Bowden collet', pick(R('CW2\\.5_Hardware_Subassembly:1/Collet ID4\\.2_OD6'), 1), 'ptfe', {parent: body, when: 'ptfe=collet'});
  const clip = add('cw-clip', 'Bowden clip', pick(R('CW2\\.5_Hardware_Subassembly:1/Bowden_Clip'), 1), 'ptfe', {parent: body, when: 'ptfe=collet'});
  const ecas = add('cw-ecas', 'ECAS04 coupler', pick(R('CW2\\.5_Hardware_Subassembly:1/ECAS Bowden Collet:1/'), 4), 'ptfe', {parent: bodyEcas, when: 'ptfe=ecas'});

  // ---------- toolhead PCB ----------
  const pcb = add('cw-pcb', 'Toolhead PCB', pick(R('NH-SB-v2\\.0_Toolboard:1/')), 'electronics', {parent: spacer, when: 'pcb', note: 'the CAD shows an LDO Nitehawk-SB'});

  // The latch turns about its M3x20 pivot screw (axis y); positive opens it upwards.
  const LATCH_TURN = deg => ({axis: [0, 1, 0], deg, pivot: [3.6, 6.3, 114.9]});
  ctx.ids.cw = {plate, body, bodyEcas, BODY, ga, latch, latchScrew, motor, shaft, drive};

  // Views: mostly front-left (the manual's usual angle), turning only as far as the action needs.
  const V = {front: {az: -115, el: 18}, frontR: {az: -75, el: 18}, back: {az: 160, el: 20}, backL: {az: 160, el: 20}, left: {az: 175, el: 15}};
  const WHICH = {kind: 'tip', title: 'Which body?', text: 'There are two main body options for Clockwork 2.5 - one that uses an ECAS04 coupler and one that uses a Bowden Collet. For simplicity, the collet version will be shown when the part is otherwise identical.'};
  const FIT = {kind: 'tip', title: 'Bearing fit', text: 'Fully seat the bearing into the plastic pocket. Apply even pressure to insert them. Avoid pressing on the inner ring of the bearing.'};
  const CHOICES = {kind: 'tip', title: 'Choices, choices', text: 'There are two options for the PTFE entry retainer - a Bowden Collet and an ECAS04 coupler. Pick yours under Configure.'};
  const S = 'Heat Set Inserts';
  return [
    {
      id: 'cw-body-inserts', section: S, title: 'Main body', pages: [11],
      bench: BODY, view: V.front,
      movers: auto(bodyIns, 0, 0.15),
      text: ['Press 2 M3 heat set inserts into the main body, one each side of the gear pocket.'],
      notes: [notes.INSERTS, WHICH]
    },
    {
      id: 'cw-plate-inserts', section: S, title: 'Motor plate', pages: [12],
      bench: [plate], view: V.front,
      movers: auto(plateIns, 0, 0.12),
      text: ['Press 6 M3 heat set inserts into the motor plate.'],
      notes: [
        {kind: 'tip', title: 'Below surface', text: 'The top heatset insert needs to sit below the surface of the printed part.'},
        {kind: 'tip', title: 'Below surface', text: 'The bottom heatset insert needs to sit below the surface of the printed part. Mind the cutout in the part and make sure to install it straight.'}
      ]
    },
    {
      id: 'cw-pcb-inserts', section: S, title: 'Toolhead PCB inserts (optional)', pages: [13], when: 'pcb',
      bench: [plate, ...BODY], shift: {ids: BODY, vec: [0, -45, 0]}, view: {az: -70, el: 18},
      movers: auto([...pcbPlateIns, ...pcbBodyIns], 0, 0.2),
      text: ['For a toolhead PCB, press one more M3 heat set insert into the right edge of the motor plate and one into the main body.'],
      notes: [
        {kind: 'tip', title: 'Optional: toolhead PCB', text: 'If you opt to use a toolhead PCB, add additional heat set inserts into locations highlighted below.'},
        {kind: 'warn', title: 'Heat set insert', text: 'Be careful when inserting this heat set insert. It’s easy to accidentally touch the left side of the part with the soldering iron.'}
      ]
    },
    {
      id: 'cw-anchor-inserts', section: S, title: 'Cable anchor', pages: [14],
      bench: [anchor], view: {az: -100, el: 18},
      movers: auto(anchorIns),
      text: ['Press an M3 heat set insert into the lower front of the cable anchor.'],
      notes: [
        {kind: 'tip', title: 'Which anchor?', text: 'The drawing shows the umbilical anchor of the official CAD, which takes this one insert. The manual’s cable chain anchors take one here plus three (generic chains) or two (IGUS-style chains) on top.'},
        {kind: 'tip', title: 'Generic cable chains', text: 'The 3-hole pattern is usually found on generic cable chains.'},
        {kind: 'tip', title: 'IGUS-style cable chains', text: 'IGUS-style chains have two mounting holes.'},
        {kind: 'tip', title: 'Printer specific mounts', text: 'V2, Trident and Legacy use the same printed parts. Extra parts are included for Switchwire.'}
      ]
    },
    {
      id: 'cw-small-inserts', section: S, title: 'Latch shuttle and guidler A', pages: [15],
      bench: [shuttle, ga], shift: {ids: [shuttle], vec: [0, 0, 32]}, view: {az: -80, el: 20},
      movers: auto([...shuttleIns, ...gaIns], 0, 0.2),
      text: ['Press one M3 heat set insert into the side of the latch shuttle and one into guidler A.'],
      notes: [
        {kind: 'tip', title: 'Flush with surface', text: 'The heat set insert needs to sit flush or slightly below the surface of the printed part.'},
        {kind: 'tip', title: 'Accent part?', text: 'Look for Voron heart next to the part. It indicates that this is a part that is usually printed in the accent color.'}
      ]
    },

    {
      id: 'cw-guidler', section: 'Guidler Arm', title: 'Guidler A and B', pages: [16],
      bench: [ga], view: {az: -80, el: 18},
      movers: [...move(gb, [0, -30, 0]), ...auto(guidlerScrew, 1)],
      text: ['Fit guidler B onto guidler A and join them with an M3x16 SHCS.']
    },
    {
      id: 'cw-idler', section: 'Guidler Arm', title: 'Idler', pages: [17],
      bench: [ga], view: {az: -80, el: 18},
      movers: [...move(needles[0], [0, -14, 0], 0), ...move(needles[1], [0, 14, 0], 0), ...move(pin, [0, -26, 0], 0, 0, 0.35), ...move(idler, [26, 0, 0], 1)],
      text: ['Build the BMG idler: the two needle bearings go into the idler gear and the pin through them.', 'Slide the idler assembly into the lower slot of the guidler arm.'],
      notes: [
        {kind: 'tip', title: 'Lubricate bearings', text: 'A lubrication film is required on the needle bearings to ensure smooth operation and longevity. Refer to the Voron sourcing guide for lubricant options - look for a “light grease”.'},
        {kind: 'warn', title: 'Mind orientation', text: 'Make sure to orient the idler assembly as shown above.'}
      ],
      extras: [{name: 'Light grease', qty: 1, kind: 'misc'}]
    },
    {
      id: 'cw-thumbscrew', section: 'Guidler Arm', title: 'Thumb screw and latch shuttle', pages: [18],
      bench: [ga], view: V.front,
      movers: [...move(shuttle, [0, 0, 22], 0), ...move(spring, [16, 0, 0], 0, 0, 0.2), ...move(nylon, [26, 0, 0], 0, 0, 0.5), ...move(thumb, [-32, 0, 0], 1)],
      text: ['Set the latch shuttle on top of the guidler arm.', 'Put the spring and the nylon washer on the M3 thumb screw (the BMG thumbscrew assembly), push it through the top bore of the arm and thread it into the shuttle’s insert.'],
      notes: [{kind: 'tip', title: 'A note on springs', text: 'Longer/shorter/stiffer springs will change the tension characteristics and have an impact on how well the tension mechanism works. Consider buying the original Bondtech part as those are known to work well. If sourced from a different vendor check if it’s roughly 12mm long with an outer diameter of 6mm and a wire thickness of 1mm.'}]
    },

    {
      id: 'cw-plate-bearing', section: 'Motor Plate', title: 'MR85 bearing', pages: [19],
      bench: [plate], view: {az: 135, el: 25},
      movers: move(bearingPlate, [0, 22, 0]),
      text: ['Press an MR85 bearing fully into the pocket of the motor plate.'],
      notes: [
        {kind: 'check', title: 'Check bearing fit', text: 'The bearings must slip on and off the shaft easily to allow the gear to self-centre. Pressing the bearings on the shaft will damage them. Lightly sand the shaft if required.'},
        {...FIT, text: FIT.text + ' If the fit is too tight the printed parts are likely over-extruded.'}
      ]
    },
    {
      id: 'cw-body-bearing', section: 'Main Body', title: 'MR85 bearing', pages: [20],
      bench: BODY, view: V.back,
      movers: move(bearingBody, [0, 22, 0]),
      text: ['Press the second MR85 bearing fully into the pocket of the main body.'],
      notes: [FIT]
    },
    {
      id: 'cw-collet', section: 'Main Body - Bowden Collet (Option 1)', title: 'Bowden collet and clip', pages: [21], when: 'ptfe=collet',
      bench: [body], view: V.front,
      movers: [...move(collet, [0, 0, 22]), ...move(clip, [0, -20, 0], 1)],
      text: ['Press the Bowden collet into the top of the main body.', 'Slide the Bowden clip under the collet head.'],
      notes: [
        CHOICES,
        {kind: 'tip', title: 'Install collet', text: 'Press fit install the bowden collet into the main body. Use a hard surface to help push it into place if needed.'},
        {kind: 'tip', title: 'Install clip', text: 'Install the Bowden clip to secure the collet and prevent the PTFE tube from moving during extrusion and retraction. To remove the PTFE tube, first remove the Bowden clip.'}
      ]
    },
    {
      id: 'cw-ecas', section: 'Main Body - ECAS04 Coupler (Option 2)', title: 'ECAS04 coupler', pages: [22], when: 'ptfe=ecas',
      bench: [bodyEcas], view: V.front,
      movers: move(ecas, [0, 0, 22]),
      text: ['Remove the rubber gasket from the ECAS04 coupler.', 'Press the coupler into the top of the main body.'],
      notes: [
        CHOICES,
        {kind: 'tip', title: 'Remove rubber gasket', text: 'The rubber gasket included with most ECAS04 fittings is not required. Remove and discard appropriately.'},
        {kind: 'tip', title: 'Install ECAS04', text: 'Press fit install the ECAS04 fitting into the main body. Use a hard surface to help push it into place if needed.'}
      ]
    },
    {
      id: 'cw-support', section: 'Main Body', title: 'Remove the support', pages: [23],
      bench: BODY, view: V.front,
      movers: out(move([support, supportEcas], [0, -25, 0])),
      text: ['Remove the built-in support from the slot below the PTFE entry.'],
      notes: [{kind: 'tip', title: 'Remove support', text: 'Remove the support with a pair of needle nose pliers, or by pushing it out through the screw hole from behind with a hex key.'}]
    },

    {
      id: 'cw-drive-gear', section: 'Drive Assembly', title: 'Drive gear on the shaft', pages: [24],
      bench: [shaft], view: {az: -150, el: 12},
      movers: [...move(drive, [0, -28, 0]), ...move(grub, [11, 0, -5], 1)],
      text: ['Slide the drive gear onto the gear shaft and seat its set screw against the notch in the shaft.', 'Set it about 15.6 mm from the face of the big gear for now.'],
      notes: [
        {kind: 'tip', title: 'A note on gears', text: 'Poorly made gears often cause print quality issues. For best performance consider sourcing the original Bondtech parts.'},
        {kind: 'warn', title: 'Drive gear', text: 'Make sure the set screw in the filament drive gear is seated against the notch in the shaft. Carefully tighten the set screw, the head is easy to strip.'},
        {kind: 'tip', title: 'Initial position', text: 'The final position is set later.'},
        {kind: 'tip', title: 'Thread locker', text: 'The final position of the drive gear is set in a later step. Common thread lockers have a long enough working time to complete the steps without issues. Familiarize yourself with the steps on the next 3 pages before you apply thread locker. Complete the steps on the next 3 pages after applying the thread locker.'}
      ],
      extras: [{name: 'Thread locker', qty: 1, kind: 'misc'}]
    },
    {
      id: 'cw-drive-in', section: 'Main Body', title: 'Close the extruder', pages: [25],
      bench: [plate, ...BODY], view: V.front,
      movers: [...move(shaft, [0, -32, 0]), ...move(BODY, [0, -45, 0], 1, 0)],
      text: ['Put the gear shaft into the bearing of the motor plate.', 'Close the main body over it.']
    },
    {
      id: 'cw-body-screws', section: 'Main Body', title: 'Body screws', pages: [26],
      bench: [plate], view: V.front,
      movers: auto(bodyScrews, 0, 0.15),
      text: ['Join the main body and the motor plate with 2 M3x25 SHCS.'],
      notes: [
        {kind: 'warn', title: 'Don’t overtighten', text: 'Tighten until the plastic bends and cracks. Back up 2 turns, discard parts, reprint and try again.'},
        {kind: 'check', title: 'Initial alignment check', text: 'Check if the filament path aligns with the toothed section of the drive gear.'}
      ]
    },
    {
      id: 'cw-alignment', section: 'Drive Alignment', title: 'Check the drive gear', pages: [27],
      bench: [plate], view: {az: -175, el: 5}, focus: [drive, shaft],
      movers: [],
      text: ['Push a piece of 1.75 mm filament down through the extruder.', 'Check that it runs along the teeth of the drive gear, and that the shaft clears the motor housing.'],
      notes: [
        {kind: 'tip', title: 'Insert filament', text: 'Insert a piece of 1.75mm filament into the extruder.'},
        {kind: 'check', title: 'Check alignment', text: 'With the filament inserted, verify if the filament path and drive gear are aligned. Loosen the set screw and adjust the position of the drive gear if required.'},
        {kind: 'check', title: 'Check for clearance, Clarence', text: 'The drive shaft must not touch the motor housing. Make sure it does not sit above the surface of the printed part. Check if the shaft has sufficient clearance when fully seated. Depending on the shaft’s tolerances you may need to adjust the position of the drive gear or sand the face of the shaft.'}
      ],
      extras: [{name: 'Filament 1.75 mm, a short piece', qty: 1, kind: 'misc'}]
    },
    {
      id: 'cw-tension-arm', section: 'Tension Arm', title: 'Guidler arm', pages: [28],
      bench: [plate], view: V.front,
      // The shuttle rides on the thumb screw but slides into its own slot in the body: it settles
      // into it while the arm comes in.
      movers: [...move(ga, [-45, 0, -12]), {id: shuttle, vec: [10, 0, 8], phase: 0, delay: 0, again: true}, ...auto(pivot, 1)],
      text: ['Drop the guidler arm into the left side of the extruder.', 'Fit the M3x25 SHCS through its lower pivot.'],
      notes: [{kind: 'warn', title: 'Don’t tighten', text: 'The tensioning arm must move freely. Tightening the bolt may lock it in place.'}]
    },
    {
      id: 'cw-latch', section: 'Latch', title: 'Latch', pages: [29],
      bench: [plate], view: V.front,
      movers: [{id: latch, vec: [4, 0, 6], phase: 0, delay: 0, rot: LATCH_TURN(30)}, ...auto(latchScrew, 1)],
      text: ['Put the latch on top of the extruder and swing it down into place.', 'Fit its M3x20 SHCS pivot screw.']
    },
    {
      id: 'cw-tension', section: 'Tension Mechanism', title: 'Tension knob', pages: [30],
      bench: [plate], view: V.front, focus: [thumb],
      movers: [],
      text: ['The thumb screw sets the grip on the filament: clockwise is more tension.'],
      notes: [{kind: 'tip', title: 'Tension knob', text: 'Turning the thumb screw clockwise will increase the tension and grip on the filament. Too much tension will result in print issues.'}]
    },
    {
      id: 'cw-motor', section: 'Stepper Motor', title: 'Motor', pages: [31],
      bench: [plate], view: {az: 175, el: 15},
      movers: [...move(motor, [0, 40, 0]), ...auto(motorScrew, 1)],
      text: ['Offer the NEMA14 stepper to the back of the motor plate, its pinion into the gear opening.', 'Fit the M3x30 SHCS from the front, through the extruder into the motor.']
    },
    {
      id: 'cw-motor-2', section: 'Stepper Motor', title: 'Second motor screw', pages: [32],
      bench: [plate], view: V.front,
      movers: [...auto(motorScrew2), {id: motorWasher, vec: 'auto-of:' + motorScrew2, phase: 0, delay: 0}],
      text: ['Fit the second motor screw, an M3x8 SHCS with an M3 washer, through the access hole in the front. Leave it loose.'],
      notes: [
        {kind: 'warn', title: 'Don’t tighten', text: 'The motor position will be adjusted in the next steps. Don’t fully tighten just yet.'},
        {kind: 'tip', title: 'Access hole', text: 'The second motor bolt can be accessed from the front of the extruder.'}
      ]
    },
    {
      id: 'cw-mesh', section: 'Stepper Motor', title: 'Gear mesh', pages: [33],
      bench: [plate], view: {az: 170, el: 10}, focus: [motor, shaft],
      movers: [],
      text: ['Swing the motor on its top screw until the pinion meshes fully with the big gear, with a faint play.', 'Then tighten the second motor screw.'],
      notes: [
        {kind: 'tip', title: 'Set gear meshing', text: 'Adjust the stepper motor position so that the motor and extruder gear teeth fully mesh/overlap with each other. There should be a very small gap between the faces of the gear teeth; the gears must not press tightly against each other.'},
        {kind: 'check', title: 'Check gear play', text: 'The gear should have a slight play and should not be fully tight against the pinion. Adjust the position of the motor until you have a faint play.'},
        {kind: 'warn', title: 'Tighten when done', text: 'Don’t forget to tighten the second motor bolt after adjusting.', link: 'https://voron.link/u6ehxsw'}
      ]
    },
    {
      id: 'cw-anchor', section: 'Chain Anchor', title: 'Cable anchor', pages: [34],
      bench: [plate], view: {az: 150, el: 20},
      movers: [...move(anchor, [0, 30, 15]), ...auto(anchorScrew, 1)],
      text: ['Fit the cable anchor to the back of the extruder with an M3 screw into the motor plate.', 'The CAD shows the umbilical anchor, which takes an M3x30 SHCS here; the manual’s generic cable chain anchor takes an M3x20 SHCS.'],
      notes: [{kind: 'tip', title: 'Generic chain mount', text: 'The manual shows the generic cable chain mount. Other chain mounts will look different.'}]
    },
    {
      id: 'cw-anchor-2', section: 'Chain Anchor', title: 'Second anchor screw', pages: [35],
      bench: [plate], view: {az: -140, el: 18},
      movers: auto(anchorScrew2),
      text: ['Fit an M3x8 SHCS from the front, below the thumb screw, into the anchor.']
    },
    {
      id: 'cw-pcb', section: 'Toolhead PCB (Optional)', title: 'Toolhead PCB', pages: [36], when: 'pcb',
      bench: [plate], view: {az: -60, el: 18},
      movers: [...move(spacer, [20, 10, 0]), ...move(pcb, [9, 26, 12], 1), ...auto(pcbScrews, 2, 0.15)],
      text: ['Put the PCB spacer on the right side of the extruder.', 'Fit the toolhead PCB over it from behind and secure it with 2 M3x8 SHCS.'],
      notes: [{kind: 'tip', title: 'PCB spacer', text: 'Align the printed spacer with the two mounting holes on the SB toolhead PCB, then secure the PCB with two M3×8 SHCS screws.'}]
    },
    {
      id: 'cw-cover-post', section: 'Cable Cover', title: 'Cable cover screw', pages: [37],
      bench: [plate], view: {az: -75, el: 18}, pose: [{id: latch, ...LATCH_TURN(70)}],
      movers: auto(coverPost),
      text: ['Swing the filament latch open.', 'Fit an M3x16 SHCS into the bolt pocket it uncovers. Its head stays proud and holds the cable cover. Close the latch again.'],
      notes: [{kind: 'tip', title: 'Open latch', text: 'Undo the filament latch to expose the bolt pocket for the cable cover.'}]
    },
    {
      id: 'cw-cover', section: 'Cable Cover', title: 'Cable cover', pages: [38],
      bench: [plate], view: {az: -30, el: 18},
      movers: [...move(cover, [25, 4, 3]), ...auto(coverScrew, 1)],
      text: ['Fit the cable cover over the right side of the extruder and the motor, hooked on the M3x16 head.', 'Secure it with an M3x6 BHCS from below.'],
      notes: [
        {kind: 'warn', title: 'Don’t over-tighten', text: 'The bolt is threaded directly into plastic.'},
        {kind: 'tip', title: 'Access hole', text: 'The M3x16 can be accessed from the front of the extruder.'}
      ]
    }
  ];
};
