# Stealthburner Shroud, LEDs and Fans: transcript, pp. 52–64

Source: `Assembly_Manual_SB.pdf` (version 2026-11-07). Tip text verbatim from `pdftotext -layout`.

## p.52 — VORON STEALTHBURNER - SHROUD
Chapter title page. Not a step.

## p.53 — SUPPORTS ([a]_stealthburner_main_body.stl)
Shows: the shroud body seen from the back/inside, three small built-in supports highlighted (LED pockets, lower right).
Tips:
- REMOVE SUPPORTS: Remove built-in supports (highlighted in the image) with flush cutters.

## p.54 — LED WIRING
Shows: three Neopixel PCBs (DIN, DOUT, 5V, GND) chained; logo LED (index 1) → toolhead LED right (index 2) → toolhead LED left (index 3); wire lengths 120 mm (controller to logo), 100 mm (logo to right), 75 mm (right to left), 3x 0.16 mm² (AWG26-30).
Tips:
- LED WIRING: Connect the "OUT" side of the LED to the "IN" side of the next LED in the chain. Solder the wires as shown on the right. Both the "IN" and the "OUT" wires must exit in the same direction in order to fit into the printed parts.
Callouts: LOGO LED Index=1, TOOLHEAD LED RIGHT Index=2, TOOLHEAD LED LEFT Index=3, To Controller Board. Side note: "For Illustration Only, Read "LED Wiring" Callout".

## p.55 — LEDS (logo LED carrier, diffuser, mask)
Shows: the logo LED PCB pushed down into [o]_stealthburner_LED_carrier.stl; [c]_stealthburner_LED_diffuser.stl fits into [o]_stealthburner_LED_diffuser_mask.stl.
Tips:
- LED DIFFUSER AND MASK: The diffuser (highlighted part) is printed in a translucent filament to evenly spread the light. The mask (part to the left) is printed in an opaque filament to prevent the light from leaking, resulting in a crisp logo.

## p.56 — LEDS (nozzle LEDs)
Shows: shroud from below; TOOLHEAD LED LEFT and TOOLHEAD LED RIGHT pushed into the two pockets either side of the nozzle opening, wires leading out.

## p.57 — LEDS (diffuser insertion)
Shows: diffuser + mask dropped into the logo window from behind and pushed towards the front.
Tips:
- DIFFUSER INSERTION: Insert the printed parts and push them towards the front.

## p.58 — LEDS (carrier)
Shows: the LED carrier with its LED dropped in behind the diffuser.

## p.59 — LEDS (wire routing)
Shows: LED wires run from the logo carrier down around the fan bay to the nozzle LEDs; exit on the right.
Tips:
- LED WIRE ROUTING: Route the LED wires as shown; wires exit on the right side.

## p.60 — SUPPORTS (fan)
Shows: two thin built-in supports highlighted, at the fan bay.
Tips:
- SUPPORT STRUCTURE: The highlighted parts are built-in support structures. They are designed to break during the fan installation.

## p.61 — HOTEND FAN
Shows: 4010 axial fan, airflow arrow inwards, wire exit circled at the top; inserted at a slight angle into the lower bay of the shroud from behind and clipped in.
Tips:
- FAN ORIENTATION: Rotate the fan so that the wires exit on the top and the air is pushed "inwards".
- FAN INSERTION: Insert the fan at a slight angle and clip it into place. Mind the fan orientation.

## p.62 — HOTEND FAN (wires)
Shows: fan wires routed up and out of the right side.
Tips:
- FAN WIRE ROUTING: Route the fan wires as shown, exiting on the right side

## p.63 — PART COOLING FAN (prep)
Shows: the 5015 blower's front cover removed; its two mounting ears clipped off.
Tips:
- FAN PREPARATION: Remove the front of the 5015 fan. Clip off and file down the stock mounting ears. There's a trimming jig STL included in the release to make this task easier.

## p.64 — PART COOLING FAN (install)
Shows: the trimmed blower placed into the upper bay from behind; 2 M3x6 FHCS (upper left, centre right) hold it.
Callouts: M3x6 FHCS.

---

## CAD vs manual

| Manual | CAD | Shown |
| --- | --- | --- |
| p.53, p.60 built-in supports | Not separate solids | Highlighted body, text only |
| p.63 fan front removed, ears clipped | The 5015 is modelled already trimmed | As the CAD |

## Not drawn

LED and fan wires (p.54 diagram, p.59, p.62 routing), the 5015 trimming jig.
