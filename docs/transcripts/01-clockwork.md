# Clockwork 2.5: transcript, pp. 9–42

Source: `Assembly_Manual_SB.pdf` (version 2026-11-07, VoronDesign/Voron-Stealthburner `1572a42`). Tip text verbatim from `pdftotext -layout`, title case turned to sentence case in the steps.

## p.9 — OVERVIEW
Exploded view of the four sub-assemblies: VORON Clockwork 2.5 Extruder (top), ADXL Sensor Mount (left), VORON Stealthburner Tool Cartridge (bottom), VORON Stealthburner (shroud, right). Not a step: used as the opening view.

## p.10 — VORON Clockwork 2.5
Chapter title page. Not a step.

## p.11 — HEAT SET INSERTS (main_body.stl)
Shows: main body from the back (gear side), 2 heat set inserts highlighted: one in the bore right of the drive gear pocket, one lower left.
Tips:
- HEAT SET INSERTS: This design relies heavily on heat set inserts. Make sure you have the proper inserts (check the hardware reference for a close-up picture and the Sourcing Guide for dimensions). If you've never worked with heat set inserts before we recommend you watch the linked guide. https://voron.link/m5ybt4d
- WHICH BODY? There are two main body options for Clockwork 2.5 - one that uses an ECAS04 coupler and one that uses a Bowden Collet. For simplicity, the collet version will be shown when the part is otherwise identical.

## p.12 — HEAT SET INSERTS (motor_plate.stl)
Shows: motor plate both faces; 3 inserts on the outer face (two upper right, one lower), 1 insert on the lower right corner seen from the other face. Side section shows top and bottom inserts sunk below the surface.
Tips:
- BELOW SURFACE: The top heatset insert needs to sit below the surface of the printed part.
- BELOW SURFACE: The bottom heatset insert needs to sit below the surface of the printed part. Mind the cutout in the part and make sure to install it straight.

## p.13 — HEAT SET INSERTS (optional toolhead PCB)
Shows: one extra insert in motor_plate.stl (right edge), one extra in main_body.stl (inside, left, near the edge, circled).
Tips:
- OPTIONAL: TOOLHEAD PCB: If you opt to use a toolhead PCB, add additional heat set inserts into locations highlighted below.
- HEAT SET INSERT: Be careful when inserting this heat set insert. It's easy to accidentally touch the left side of the part with the soldering iron.

## p.14 — HEAT SET INSERTS (chain anchors)
Shows: chain_anchor_3hole.stl with 3 inserts on top + 1 in the lower front; chain_anchor_2hole.stl with 2 on top + 1 lower front.
Tips:
- GENERIC CABLE CHAINS: The 3-hole pattern is usually found on generic cable chains.
- IGUS-style CABLE CHAINS: IGUS-style chains have two mounting holes.
- PRINTER SPECIFIC MOUNTS: V2, Trident and Legacy use the same printed parts. Extra parts are included for Switchwire.

## p.15 — HEAT SET INSERTS ([a]_latch_shuttle.stl, [a]_guidler_a.stl)
Shows: one insert in the side of the latch shuttle; one insert in guidler_a (side bore).
Tips:
- FLUSH WITH SURFACE: The heat set insert needs to sit flush or slightly below the surface of the printed part.
- ACCENT PART? Look for Voron heart next to the part. It indicates that this is a part that is usually printed in the accent color.

## p.16 — GUIDLER ARM
Shows: [a]_guidler_b.stl joins [a]_guidler_a.stl from the side; an M3x16 SHCS goes through both (lower bore).
Callouts: M3x16 SHCS.

## p.17 — GUIDLER ARM (BMG idler)
Shows: BMG Idler Assembly exploded: pin (shaft), two needle bearings, idler gear; then the assembly placed in the guidler arm's lower slot. Section view shows orientation of the gear (teeth to the right).
Tips:
- LUBRICATE BEARINGS: A lubrication film is required on the needle bearings to ensure smooth operation and longevity. Refer to the Voron sourcing guide for lubricant options - look for a "light grease".
- MIND ORIENTATION: Make sure to orient the idler assembly as shown above.

## p.18 — GUIDLER ARM (thumbscrew)
Shows: BMG Thumbscrew Assembly: thumb screw, spring, nylon washer; assembled screw goes through the top bore of the guidler arm; latch shuttle sits on its tip. Side view of the arm with the latch shuttle, spring and idler gear.
Tips:
- A NOTE ON SPRINGS: Longer/shorter/stiffer springs will change the tension characteristics and have an impact on how well the tension mechanism works. Consider buying the original Bondtech part as those are known to work well. If sourced from a different vendor check if it's roughly 12mm long with an outer diameter of 6mm and a wire thickness of 1mm.
Callouts: BMG Thumbscrew Assembly.

## p.19 — MOTOR PLATE
Shows: drive gear shaft with two MR85 bearings slipped on; one MR85 bearing pressed into motor_plate.stl's centre pocket.
Tips:
- CHECK BEARING FIT: The bearings must slip on and off the shaft easily to allow the gear to self-centre. Pressing the bearings on the shaft will damage them. Lightly sand the shaft if required.
- BEARING FIT: Fully seat the bearing into the plastic pocket. Apply even pressure to insert them. Avoid pressing on the inner ring of the bearing. If the fit is too tight the printed parts are likely over-extruded.
Callouts: MR85 Bearing.

## p.20 — MAIN BODY
Shows: MR85 bearing pressed into main_body.stl's pocket (gear side); section shows it seated.
Tips:
- BEARING FIT: Fully seat the bearing into the plastic pocket. Apply even pressure to insert them. Avoid pressing on the inner ring of the bearing.

## p.21 — MAIN BODY - BOWDEN COLLET (OPTION 1)
Shows: bowden collet pressed into the top of the main body; the Bowden clip slides under the collet head.
Tips:
- CHOICES, CHOICES: There are two options for the PTFE entry retainer - a Bowden Collet (This one) and ECAS04 (next page).
- INSTALL COLLET: Press fit install the bowden collet into the main body. Use a hard surface to help push it into place if needed.
- INSTALL CLIP: Install the Bowden clip to secure the collet and prevent the PTFE tube from moving during extrusion and retraction. To remove the PTFE tube, first remove the Bowden clip.
Callouts: Bowden Collet, Bowden Clip.

## p.22 — MAIN BODY - ECAS04 COUPLER (OPTION 2)
Shows: ECAS04 coupling with its rubber gasket removed; the coupling pressed into the top of the main body (ECAS04 version).
Tips:
- REMOVE RUBBER GASKET: The rubber gasket included with most ECAS04 fittings is not required. Remove and discard appropriately.
- INSTALL ECAS04: Press fit install the ECAS04 fitting into the main body. Use a hard surface to help push it into place if needed.
Callouts: ECAS04 Coupling.

## p.23 — MAIN BODY (remove support)
Shows: built-in support block highlighted at the latch screw boss, upper front of the main body.
Tips:
- REMOVE SUPPORT: Remove the support with a pair of needle nose pliers, or by pushing it out through the screw hole from behind with a hex key.

## p.24 — DRIVE ASSEMBLY
Shows: the filament drive gear slides onto the gear shaft (big 50T gear), set screw against the flat (notch); 15.6 mm from the gear face to the drive gear's outer end as the initial position.
Tips:
- A NOTE ON GEARS: Poorly made gears often cause print quality issues. For best performance consider sourcing the original Bondtech parts.
- DRIVE GEAR: Make sure the set screw in the filament drive gear is seated against the notch in the shaft. Carefully tighten the set screw, the head is easy to strip.
- INITIAL POSITION: The final position is set later.
- THREAD LOCKER: The final position of the drive gear is set in a later step. Common thread lockers have a long enough working time to complete the steps without issues. Familiarize yourself with the steps on the next 3 pages before you apply thread locker. Complete the steps on the next 3 pages after applying the thread locker.

## p.25 — MAIN BODY (drive into the plate)
Shows: the drive shaft assembly goes into the motor plate's bearing; then the main body closes over it from the front.

## p.26 — MAIN BODY (M3x25)
Shows: 2 M3x25 SHCS from the front through the main body into the motor plate (upper left and lower centre). Section: filament path in line with the drive gear teeth.
Tips:
- DON'T OVERTIGHTEN: Tighten until the plastic bends and cracks. Back up 2 turns, discard parts, reprint and try again.
- INITIAL ALIGNMENT CHECK: Check if the filament path aligns with the toothed section of the drive gear.
Callouts: M3x25 SHCS.

## p.27 — DRIVE ALIGNMENT
Shows: a piece of filament through the extruder; detail of drive gear and filament; detail of the shaft end and the motor housing.
Tips:
- INSERT FILAMENT: Insert a piece of 1.75mm filament into the extruder.
- CHECK ALIGNMENT: With the filament inserted, verify if the filament path and drive gear are aligned. Loosen the set screw and adjust the position of the drive gear if required.
- CHECK FOR CLEARANCE, CLARENCE: The drive shaft must not touch the motor housing. Make sure it does not sit above the surface of the printed part. Check if the shaft has sufficient clearance when fully seated. Depending on the shaft's tolerances you may need to adjust the position of the drive gear or sand the face of the shaft.
Callouts: Filament.

## p.28 — TENSION ARM
Shows: the guidler arm (with idler, thumbscrew, latch shuttle) drops into the body from the left; an M3x25 SHCS from the front through the lower pivot. Cutaway: guidler (red), shuttle (purple), spring.
Tips:
- DON'T TIGHTEN: The tensioning arm must move freely. Tightening the bolt may lock it in place.
Callouts: M3x25 SHCS.

## p.29 — LATCH
Shows: [a]_latch.stl lowered on top of the body (left of the filament inlet); an M3x20 SHCS from the front right side through the latch pivot.
Callouts: M3x20 SHCS.

## p.30 — TENSION MECHANISM
Shows: the thumb screw (assembled earlier) highlighted on the left side.
Tips:
- TENSION KNOB: Turning the thumb screw clockwise will increase the tension and grip on the filament. Too much tension will result in print issues.

## p.31 — STEPPER MOTOR
Shows: NEMA14 stepper offered to the back (motor plate side), pinion into the gear opening; an M3x30 SHCS from the front through the upper left of the body into the motor; back view marks the matching motor hole (upper left).
Callouts: NEMA14 Stepper, M3x30 SHCS.

## p.32 — STEPPER MOTOR (second bolt)
Shows: M3x8 SHCS with M3 washer into the lower left (front, through the access hole) into the motor; back view marks the lower right motor hole.
Tips:
- DON'T TIGHTEN: The motor position will be adjusted in the next steps. Don't fully tighten just yet.
- ACCESS HOLE: The second motor bolt can be accessed from the front of the extruder.
Callouts: M3 Washer, M3x8 SHCS.

## p.33 — STEPPER MOTOR (gear mesh)
Shows: the motor swings about the M3x30 to set the mesh of pinion and 50T gear; detail of the meshed teeth.
Tips:
- SET GEAR MESHING: Adjust the stepper motor position so that the motor and extruder gear teeth fully mesh/overlap with each other. There should be a very small gap between the faces of the gear teeth; the gears must not press tightly against each other.
- CHECK GEAR PLAY: The gear should have a slight play and should not be fully tight against the pinion. Adjust the position of the motor until you have a faint play.
- TIGHTEN WHEN DONE: Don't forget to tighten the second motor bolt after adjusting. https://voron.link/u6ehxsw

## p.34 — CHAIN ANCHOR
Shows: chain_anchor_3hole wraps under the motor on the left; an M3x20 SHCS from the back left into the anchor's lower insert.
Tips:
- GENERIC CHAIN MOUNT: This example shows the generic cable chain mount. Other chain mounts will look different.
Callouts: M3x20 SHCS.

## p.35 — CHAIN ANCHOR (second screw)
Shows: an M3x8 SHCS from the front left, below the thumb screw, into the anchor.
Callouts: M3x8 SHCS.

## p.36 — TOOLHEAD PCB (OPTIONAL)
Shows: [a]_pcb_spacer on the right side (gear side) of the extruder, the toolhead PCB against it, two M3x8 SHCS through the PCB.
Tips:
- PCB SPACER: Align the printed spacer with the two mounting holes on the SB toolhead PCB, then secure the PCB with two M3x8 SHCS screws.
Callouts: M3x8 SHCS.

## p.37 — CABLE COVER (open latch, M3x16)
Shows: the latch flipped up; an M3x16 SHCS dropped into the bolt pocket at the top front right; section shows it standing proud to hold the cable cover.
Tips:
- OPEN LATCH: Undo the filament latch to expose the bolt pocket for the cable cover.
Callouts: M3x16 SHCS.

## p.38 — CABLE COVER (fit the cover)
Shows: the cable cover (hex-mesh) slides over the motor from the left, hooked on the proud M3x16 head; an M3x6 BHCS from below at the front left; front view marks the M3x16 access hole.
Tips:
- DON'T OVER-TIGHTEN: The bolt is threaded directly into plastic.
- ACCESS HOLE: The bolt can be accessed from the front of the extruder.
Callouts: M3x6 BHCS.

## p.39 — HALL EFFECT SENSOR (OPTIONAL): prep
Shows: wires soldered to the three pins (+5V, GND, Signal); the sensor slides into the printed bracket; pins bent around the bracket. Two brackets: self-sourced and pre-soldered.
Tips:
- PREPPING THE SENSOR: Solder wires to the sensor pins as shown.
- ASSEMBLE THE SENSOR: Run wires and pins through the hole in the printed bracket, and slide sensor into place. Two printed bracket versions are available. Use the version that corresponds with your hardware.
- BEND THE PINS: Turn the assembly over and carefully bend the pins around the printed bracket. The pins are delicate and may break if bent repeatedly or too sharply.
Callouts: Hall Effect Sensor.

## p.40 — HALL EFFECT SENSOR (OPTIONAL): magnet
Shows: the M3x20 SHCS at the latch pivot (upper front left) removed; an N52 6x3mm magnet dropped into the channel beside the filament path.
Tips:
- REMOVE SCREW: Remove this M3x20 SHCS to allow installation of the hall effect sensor.
- THE N52 MAGNET: Insert the N52 6x3mm magnet into the channel, south pole facing outward. Make sure it can slide horizontally without obstruction. To determine the south pole, stack two magnets together to strengthen the magnetic field. Then stand the stack on its circumference on a smooth, level surface so it can rotate freely. It should naturally align with Earth's magnetic field, allowing you to identify the north- and south-facing poles. The linked guide may be helpful for this step. https://voron.link/htekfs8
Callouts: M3x20 SHCS, N52 6x3mm Magnet.

## p.41 — HALL EFFECT SENSOR (OPTIONAL): install
Shows: the sensor in its bracket goes into the slot over the magnet; a ferrous M3x25 SHCS from the front through the bracket (where the M3x20 was). Filament test: a filament pushes the magnet aside.
Tips:
- INSTALL THE SENSOR: The printed bracket and sensor will retain the magnet in the channel. Insert the assembly and secure with a ferrous/magnetic M3x25 SHCS. Do not fully tighten. The magnet must have clearance to move horizontally.
- FILAMENT TEST: Insert filament and verify that the magnet is pushed fully to the side. Remove the filament; the magnet should return to its starting position.
Callouts: M3x25 SHCS.

## p.42 — HALL EFFECT SENSOR (OPTIONAL): wires
Shows: wires routed up and right from the sensor; pinout from the front: Signal, GND, +5V top to bottom.
Tips:
- TIDY UP: Route the wires as shown.
- PINOUT: Verify the sensor pinout matches the diagram when viewed from the front.

## p.43 — trivia ("StealthBurner development started on 2021-04-13…"). Not a step.

---

## CAD vs manual

| Manual | CAD | Shown |
| --- | --- | --- |
| p.11 "Which body?": collet body shown | Both bodies in the same place, each with a small second solid in the sensor slot | The body of the PTFE entry option; the second solid is the support removed on p.23 |
| p.12 motor plate inserts, count not stated | 6 inserts in the plate (+1 for the PCB, p.13) | 6 (+1) |
| p.14 chain anchors (3-hole, 2-hole) | `cable_anchor_umbilical` with one insert, an M3x30 and an M3x20 in the same place | The umbilical anchor with the M3x30; the text names the chain anchors' M3x20 |
| p.26 two M3x25, p.28 one M3x25 | M3x25 at upper left and lower right join body and plate; the one at the guidler's lower end is the pivot | As the CAD |
| p.29 latch M3x20, p.40–41 replaced by an M3x25 | Both screws in the same place | M3x20 from p.29; with the sensor it leaves on p.40 and the M3x25 goes in on p.41 |
| p.36 "SB toolhead PCB" | An LDO Nitehawk-SB board | Drawn as "Toolhead PCB" |
| p.38 cable cover | `CW2.5_Cable_Cover_HexMesh_Thick`: cover plus a thermistor mount | Both as one part |
| p.39 two hall bracket versions | `hall_effect_bracket` and `hall_effect_retained_bracket` overlap | The first |

## Not drawn

Filament, grease, thread locker, sensor wires, the generic/IGUS chain anchors.
