// Merges the converted main assembly and the ten printhead STEPs into build/assembly.json.
// The printhead files hold only the two printed cartridge parts (front and rear) of each
// hotend, in the same coordinates as the main assembly, so they drop in where the Revo Voron
// cartridge sits. Their instances get the path prefix `Printheads/<name>/`.
// Usage: node tools/step/merge.cjs   (after tools/step/convert_ocp.py has written build/assembly-main.json and build/ph/*.json)
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '../..');
const read = f => JSON.parse(fs.readFileSync(path.join(root, f)));

const out = read('build/assembly-main.json');
const dir = path.join(root, 'build/ph');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
if (files.length !== 10) throw Error(`expected 10 printhead files in build/ph, found ${files.length}`);
for (const f of files) {
  const a = read('build/ph/' + f), base = out.protos.length, name = f.replace(/\.json$/, '');
  out.protos.push(...a.protos);
  for (const i of a.instances) out.instances.push({...i, proto: i.proto + base, path: ['Printheads', name, ...i.path]});
}
fs.writeFileSync(path.join(root, 'build/assembly.json'), JSON.stringify(out));
console.log(`assembly.json: ${out.protos.length} protos, ${out.instances.length} instances (${files.length} printheads merged)`);
