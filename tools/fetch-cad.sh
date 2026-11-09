#!/bin/sh
# Downloads the official Stealthburner STEP files and assembly manual into source/ from a pinned
# commit of VoronDesign/Voron-Stealthburner (GPL-3.0). They are too big to keep in git.
set -e
COMMIT=1572a42e6df5d2f0ddf04a2145be4dc9c3693723
BASE="https://raw.githubusercontent.com/VoronDesign/Voron-Stealthburner/$COMMIT"
cd "$(dirname "$0")/.."
mkdir -p source/printheads
get() { [ -f "$2" ] || curl -fsSL -o "$2" "$BASE/$1"; }
get CAD/Stealthburner_CW2.5_Assembly.step source/Stealthburner_CW2.5_Assembly.step
get Manual/Assembly_Manual_SB.pdf source/Assembly_Manual_SB.pdf
for h in Chube_Compact Dragon Phaetus_BMO Phaetus_BMS_6_Fin Phaetus_BMS_7_Fin Rapido Rapido_V2 RevoMicro RevoVoron V6_R6; do
  get "CAD/Printheads/Stealthburner_Printhead_$h.step" "source/printheads/$h.step"
done
echo "source/ is up to date"
