// Builds the embedded model for the interactive manual from the STEP-derived assembly.
//   build/assembly.json <- tools/step/convert_ocp.py (unique meshes + placed instances)
// Output: build/model.json (parts, steps, fastener axes) and build/model.bin.gz.b64
// Usage: node tools/build-data.cjs   (BUILD_OUT=build/x writes model.* there instead of build/)
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const root = path.join(__dirname, '..');
const asm = JSON.parse(fs.readFileSync(path.join(root, 'build/assembly.json')));
const out = path.join(root, process.env.BUILD_OUT || 'build');
fs.mkdirSync(out, {recursive: true});
const {parts, steps, kinds, options} = require('./catalog.cjs')(asm);

const boxOf = P => {
  const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < P.length; i += 3) for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], P[i + k]); mx[k] = Math.max(mx[k], P[i + k]); }
  return {mn, mx, c: mn.map((v, k) => (v + mx[k]) / 2), d: mn.map((v, k) => mx[k] - v)};
};

// 1. Hardware meshes come simplified from tools/simplify-hardware.cjs (build/hardware.json).
//    They no longer carry the CAD faces, so their lines are found by angle alone.
const hardware = JSON.parse(fs.readFileSync(path.join(root, 'build/hardware.json')));

// World-space mesh of one placed instance: its proto mesh moved by the instance matrix.
const worldCache = new Map();
function worldMesh(i) {
  if (worldCache.has(i)) return worldCache.get(i);
  const inst = asm.instances[i];
  const proto = hardware[inst.proto] || asm.protos[inst.proto], m = inst.matrix, P = proto.position;
  const out = new Float64Array(P.length);
  for (let v = 0; v < P.length; v += 3) {
    const x = P[v], y = P[v + 1], z = P[v + 2];
    out[v] = m[0] * x + m[1] * y + m[2] * z + m[3];
    out[v + 1] = m[4] * x + m[5] * y + m[6] * z + m[7];
    out[v + 2] = m[8] * x + m[9] * y + m[10] * z + m[11];
  }
  // A mirrored placement (negative determinant) flips the triangle winding.
  const det = m[0] * (m[5] * m[10] - m[6] * m[9]) - m[1] * (m[4] * m[10] - m[6] * m[8]) + m[2] * (m[4] * m[9] - m[5] * m[8]);
  const res = {position: out, index: proto.index, faces: proto.faces, mirrored: det < 0};
  worldCache.set(i, res);
  return res;
}

// Build options: a `when` names only known options and values.
function checkWhen(when, where) {
  for (const c of [].concat(when || [])) {
    const m = /^(!?)([\w-]+)(?:(!?=)(.+))?$/.exec(c);
    const o = m && options.find(x => x.key === m[2]);
    if (!o) throw Error(`${where}: unknown option in when '${c}'`);
    if (m[3]) for (const v of m[4].split('|')) if (!o.values?.some(x => x.value === v)) throw Error(`${where}: unknown value '${v}' in when '${c}'`);
  }
}

// 2. Every catalog instance exists, carries geometry and is used once.
const byId = new Map(parts.map(p => [p.id, p]));
if (byId.size !== parts.length) throw Error('duplicate part ids');
const usedBy = new Map();
for (const p of parts) {
  if (p.parent && !byId.has(p.parent)) throw Error(`${p.id}: unknown parent ${p.parent}`);
  for (const q of p.parents || []) if (!byId.has(q)) throw Error(`${p.id}: unknown parent ${q}`);
  checkWhen(p.when, p.id);
  for (const i of p.inst) {
    if (!asm.instances[i]) throw Error(`${p.id}: unknown instance ${i}`);
    if (!asm.protos[asm.instances[i].proto].index.length) throw Error(`${p.id}: instance ${i} has no triangles`);
    if (usedBy.has(i)) throw Error(`instance ${i} is in both ${usedBy.get(i)} and ${p.id}`);
    usedBy.set(i, p.id);
  }
}
console.log(`catalog: ${parts.length} parts from ${usedBy.size} of ${asm.instances.length} CAD instances`);

// 3. Fastener axes. Axis-aligned parts show two equal box sides; others use PCA.
function axisOf(P) {
  const b = boxOf(P), d = b.d;
  let ax = null, best = Infinity;
  for (const [a, u, v] of [[0, 1, 2], [1, 0, 2], [2, 0, 1]]) {
    const diff = Math.abs(d[u] - d[v]);
    if (diff < best) { best = diff; ax = a; }
  }
  let axis;
  // A fastener as long as it is wide (an M3x6 FHCS has a 6 x 6 x 6 mm box) has two equal box
  // sides about every axis. It is round about its true axis, so take the axis about which the
  // mesh reaches least far out.
  if (Math.max(...d) - Math.min(...d) < 0.3) {
    const reach = a => { let r = 0; for (let k = 0; k < P.length; k += 3) { const q = [0, 1, 2].map(j => P[k + j] - b.c[j]); q[a] = 0; r = Math.max(r, Math.hypot(...q)); } return r; };
    ax = [0, 1, 2].reduce((m, a) => reach(a) < reach(m) ? a : m, 0);
  }
  if (best < 0.3) { axis = [0, 0, 0]; axis[ax] = 1; }
  else {
    const c = b.c, C = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    for (let k = 0; k < P.length; k += 3) {
      const q = [P[k] - c[0], P[k + 1] - c[1], P[k + 2] - c[2]];
      for (let r = 0; r < 3; r++) for (let s = 0; s < 3; s++) C[r][s] += q[r] * q[s];
    }
    axis = [1, 1, 1];
    for (let it = 0; it < 100; it++) {
      const n = [0, 1, 2].map(r => C[r][0] * axis[0] + C[r][1] * axis[1] + C[r][2] * axis[2]);
      const l = Math.hypot(...n); axis = n.map(x => x / l);
    }
  }
  // Head side: the end with the larger radius.
  const c = b.c;
  let tMin = Infinity, tMax = -Infinity;
  for (let k = 0; k < P.length; k += 3) { const t = (P[k] - c[0]) * axis[0] + (P[k + 1] - c[1]) * axis[1] + (P[k + 2] - c[2]) * axis[2]; tMin = Math.min(tMin, t); tMax = Math.max(tMax, t); }
  const L = tMax - tMin;
  let rLo = 0, rHi = 0;
  for (let k = 0; k < P.length; k += 3) {
    const q = [P[k] - c[0], P[k + 1] - c[1], P[k + 2] - c[2]], t = q[0] * axis[0] + q[1] * axis[1] + q[2] * axis[2];
    const r = Math.hypot(q[0] - t * axis[0], q[1] - t * axis[1], q[2] - t * axis[2]);
    if (t < tMin + L * 0.2) rLo = Math.max(rLo, r);
    if (t > tMax - L * 0.2) rHi = Math.max(rHi, r);
  }
  const dir = rHi >= rLo ? axis : axis.map(x => -x);
  return {dir: dir.map(x => +x.toFixed(5)), length: +L.toFixed(2)};
}

// 4. Steps: resolve movers' vectors. Inserts travel 14 mm, bolts their length + 16 mm.
const fastenerAxis = new Map();
for (const p of parts) {
  if (p.kind !== 'bolt' && p.kind !== 'insert') continue;
  const a = axisOf(worldMesh(p.inst[0]).position);
  fastenerAxis.set(p.id, a);
  p.axis = a.dir; p.length = a.length;
}
// An insert looks the same from both ends, so its mesh does not say which way it goes in. It is
// pressed in from the open side of its hole: rays along its axis through the host part find
// how far each side stays clear. A through hole (both sides clear) takes the side the screw
// that threads into it comes from.
const centerOf = i => asm.instances[i].bbox[0].map((v, k) => (v + asm.instances[i].bbox[1][k]) / 2);
function rayFree(o, d, inst) {
  let best = Infinity;
  for (const i of inst) {
    const {position: P, index: T} = worldMesh(i);
    for (let t = 0; t < T.length; t += 3) {
      const a = 3 * T[t], b = 3 * T[t + 1], c = 3 * T[t + 2];
      const e1 = [P[b] - P[a], P[b + 1] - P[a + 1], P[b + 2] - P[a + 2]], e2 = [P[c] - P[a], P[c + 1] - P[a + 1], P[c + 2] - P[a + 2]];
      const h = [d[1] * e2[2] - d[2] * e2[1], d[2] * e2[0] - d[0] * e2[2], d[0] * e2[1] - d[1] * e2[0]];
      const det = e1[0] * h[0] + e1[1] * h[1] + e1[2] * h[2];
      if (Math.abs(det) < 1e-9) continue;
      const s = [o[0] - P[a], o[1] - P[a + 1], o[2] - P[a + 2]], f = 1 / det;
      const u = f * (s[0] * h[0] + s[1] * h[1] + s[2] * h[2]); if (u < 0 || u > 1) continue;
      const q = [s[1] * e1[2] - s[2] * e1[1], s[2] * e1[0] - s[0] * e1[2], s[0] * e1[1] - s[1] * e1[0]];
      const v = f * (d[0] * q[0] + d[1] * q[1] + d[2] * q[2]); if (v < 0 || u + v > 1) continue;
      const dist = f * (e2[0] * q[0] + e2[1] * q[1] + e2[2] * q[2]);
      if (dist > 0 && dist < best) best = dist;
    }
  }
  return best;
}
const insertDir = new Map();
function insertDirection(id) {
  if (insertDir.has(id)) return insertDir.get(id);
  const p = byId.get(id), a = fastenerAxis.get(id), host = byId.get(p.parent || (p.parents || [])[0]);
  const c = centerOf(p.inst[0]), half = a.length / 2;
  const free = s => { const d = a.dir.map(x => x * s); return host ? rayFree(c.map((v, k) => v + d[k] * (half + 0.3)), d, host.inst) : Infinity; };
  const fPlus = free(1), fMinus = free(-1);
  let sign, why;
  if (Math.min(fPlus, fMinus) > 10) {
    // Through hole: the screw that passes through the insert's centre on the same axis.
    const bolt = parts.find(q => q.kind === 'bolt' && fastenerAxis.has(q.id) && (() => {
      const ax = fastenerAxis.get(q.id).dir, bc = centerOf(q.inst[0]);
      if (Math.abs(ax[0] * a.dir[0] + ax[1] * a.dir[1] + ax[2] * a.dir[2]) < 0.99) return false;
      const w = c.map((v, k) => v - bc[k]), t = w[0] * ax[0] + w[1] * ax[1] + w[2] * ax[2];
      return Math.hypot(...w.map((v, k) => v - t * ax[k])) < 0.8 && Math.abs(t) < fastenerAxis.get(q.id).length / 2 + 4;
    })());
    if (bolt) { const ax = fastenerAxis.get(bolt.id).dir; sign = Math.sign(ax[0] * a.dir[0] + ax[1] * a.dir[1] + ax[2] * a.dir[2]); why = 'screw ' + bolt.id; }
    else { sign = fPlus >= fMinus ? 1 : -1; why = 'through, no screw'; }
  } else { sign = fPlus >= fMinus ? 1 : -1; why = 'open side'; }
  const dir = a.dir.map(x => x * sign);
  insertDir.set(id, dir);
  if (process.env.INSERT_LOG) console.log(`  ${id.padEnd(26)} ${why.padEnd(28)} free +${fPlus === Infinity ? '∞' : fPlus.toFixed(1)} −${fMinus === Infinity ? '∞' : fMinus.toFixed(1)}`);
  return dir;
}
const autoVec = id => {
  const p = byId.get(id), a = fastenerAxis.get(id);
  if (!a) throw Error(`${id}: 'auto' needs a fastener`);
  if (p.kind === 'insert') return insertDirection(id).map(x => +(x * 14).toFixed(3));
  return a.dir.map(x => +(x * (a.length + 16)).toFixed(3));
};
for (const step of steps) {
  for (const m of step.movers) {
    if (!byId.has(m.id)) throw Error(`step ${step.id}: unknown part ${m.id}`);
    if (m.vec === 'auto') m.vec = autoVec(m.id);
    else if (typeof m.vec === 'string' && m.vec.startsWith('auto-of:')) m.vec = autoVec(m.vec.slice(8));
    m.delay ??= 0;
  }
  for (const id of [...(step.bench || []), ...(step.focus || [])]) if (!byId.has(id)) throw Error(`step ${step.id}: unknown part ${id}`);
  checkWhen(step.when, 'step ' + step.id);
  for (const x of [...step.text, ...(step.notes || []), ...(step.extras || [])]) if (typeof x === 'object') checkWhen(x.when, 'step ' + step.id);
  if (!step.pages?.length) throw Error(`step ${step.id}: no manual pages`);
}
// Each part is installed by exactly one step. A mover marked `again` carries a finished
// sub-assembly to its place later (a drive onto the frame); it does not install the part.
const installedBy = new Map(), seen = new Set();
const seenOrCarried = id => { for (let p = byId.get(id); p; p = byId.get(p.parent || (p.parents || [])[0])) if (seen.has(p.id)) return true; return false; };
steps.forEach((s, si) => {
  s.movers.forEach(m => {
    if (m.again || m.out) { if (!seenOrCarried(m.id)) throw Error(`step ${s.id}: ${m.id} moves ${m.out ? 'out' : 'again'} before it is installed or benched`); return; }
    if (installedBy.has(m.id)) throw Error(`${m.id} moves in two steps`);
    installedBy.set(m.id, si);
    seen.add(m.id);
  });
  (s.bench || []).forEach(id => seen.add(id));
});
// A part that never moves must be the base of a bench step (the piece you start from).
const benched = new Set(steps.flatMap(s => s.bench || []));
// A part that only leaves (a support piece printed with its host) shows with its host until then.
const leaving = new Set(steps.flatMap(s => s.movers.filter(m => m.out).map(m => m.id)));
const still = parts.filter(p => !installedBy.has(p.id) && !benched.has(p.id) && !leaving.has(p.id)).map(p => p.id);
if (still.length) throw Error('parts no step shows: ' + still.join(', '));
console.log('bench bases (shown without a move):', parts.filter(p => !installedBy.has(p.id)).map(p => p.id).join(', '));

// 5. Geometry: weld vertices per part, keep CAD feature edges (B-rep face boundaries
//    sharper than 28 degrees, plus open boundaries). Silhouettes are found at view time.
const SHARP = Math.cos(28 * Math.PI / 180);
const chunks = [];
let byteOffset = 0;
const push = arr => {
  const pad = (4 - (byteOffset % 4)) % 4;
  if (pad) { chunks.push(Buffer.alloc(pad)); byteOffset += pad; }
  const buf = Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength);
  chunks.push(buf);
  const at = byteOffset; byteOffset += buf.length;
  return [at, arr.length];
};
const tidy = s => s.replace(/:\d+$/, '').replace(/\s*\(\d+\)$/, '');
let totalTris = 0, totalEdges = 0, totalVerts = 0;
const outParts = parts.map(p => {
  const verts = [], vmap = new Map(), tris = [], tface = [];
  let faceBase = 0;
  for (const i of p.inst) {
    const m = worldMesh(i), P = m.position, I = m.index;
    const remap = new Int32Array(P.length / 3);
    for (let v = 0; v < P.length / 3; v++) {
      const x = +P[3 * v].toFixed(3), y = +P[3 * v + 1].toFixed(3), z = +P[3 * v + 2].toFixed(3);
      const key = x + ',' + y + ',' + z;
      let w = vmap.get(key);
      if (w === undefined) { w = verts.length / 3; verts.push(x, y, z); vmap.set(key, w); }
      remap[v] = w;
    }
    const faceOf = new Int32Array(I.length / 3);
    // A simplified mesh has no CAD faces: every triangle counts as its own face.
    if (m.faces) { m.faces.forEach(([a, b], f) => { for (let t = a; t <= b; t++) faceOf[t] = faceBase + f; }); faceBase += m.faces.length; }
    else { for (let t = 0; t < faceOf.length; t++) faceOf[t] = faceBase + t; faceBase += faceOf.length; }
    for (let t = 0; t < I.length / 3; t++) {
      const a = remap[I[3 * t]], b = remap[I[3 * t + (m.mirrored ? 2 : 1)]], c = remap[I[3 * t + (m.mirrored ? 1 : 2)]];
      if (a === b || b === c || a === c) continue;
      tris.push(a, b, c); tface.push(faceOf[t]);
    }
  }
  const nrm = t => {
    const [a, b, c] = [tris[3 * t], tris[3 * t + 1], tris[3 * t + 2]];
    const u = [verts[3 * b] - verts[3 * a], verts[3 * b + 1] - verts[3 * a + 1], verts[3 * b + 2] - verts[3 * a + 2]];
    const w = [verts[3 * c] - verts[3 * a], verts[3 * c + 1] - verts[3 * a + 1], verts[3 * c + 2] - verts[3 * a + 2]];
    const n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]], l = Math.hypot(...n) || 1;
    return n.map(x => x / l);
  };
  const edges = new Map();
  for (let t = 0; t < tris.length / 3; t++) for (let j = 0; j < 3; j++) {
    const a = tris[3 * t + j], b = tris[3 * t + (j + 1) % 3], k = a < b ? a * 1e7 + b : b * 1e7 + a;
    const e = edges.get(k); if (e) e.push(t); else edges.set(k, [t]);
  }
  const feature = [];
  for (const [k, ts] of edges) {
    const a = Math.floor(k / 1e7), b = k % 1e7;
    if (ts.length === 1) { feature.push(a, b); continue; }
    if (ts.length !== 2 || tface[ts[0]] === tface[ts[1]]) continue;
    const n1 = nrm(ts[0]), n2 = nrm(ts[1]);
    if (n1[0] * n2[0] + n1[1] * n2[1] + n1[2] * n2[2] < SHARP) feature.push(a, b);
  }
  totalTris += tris.length / 3; totalEdges += feature.length / 2; totalVerts += verts.length / 3;
  const b = boxOf(verts);
  return {
    id: p.id, name: p.name, kind: p.kind, note: p.note || null, parent: p.parent || null, axis: p.axis || null,
    ...(p.parents ? {parents: p.parents} : {}), ...(p.when ? {when: p.when} : {}),
    source: [...new Set(p.inst.map(i => tidy(asm.instances[i].path.at(-1))))].join(', '),
    box: [b.mn.map(v => +v.toFixed(2)), b.mx.map(v => +v.toFixed(2))],
    pos: push(new Float32Array(verts)), idx: push(new Uint32Array(tris)), edges: push(new Uint32Array(feature))
  };
});
const bin = Buffer.concat(chunks);
const gz = zlib.gzipSync(bin, {level: 9});
fs.writeFileSync(path.join(out, 'model.bin.gz.b64'), gz.toString('base64'));
const model = {
  source: 'Stealthburner_CW2.5_Assembly.step and CAD/Printheads, VoronDesign/Voron-Stealthburner @ 1572a42 (GPL-3.0)',
  options,
  bytes: bin.length,
  kinds,
  parts: outParts,
  steps: steps.map(s => ({...s, movers: s.movers.map(m => ({id: m.id, vec: m.vec, phase: m.phase, delay: m.delay, ...(m.again ? {again: true} : {}), ...(m.out ? {out: true} : {}), ...(m.rot ? {rot: m.rot} : {}), ...(m.via ? {via: m.via} : {})}))}))
};
fs.writeFileSync(path.join(out, 'model.json'), JSON.stringify(model));
console.log(`steps ${steps.length}, parts ${outParts.length}, vertices ${totalVerts}, triangles ${totalTris}, feature edges ${totalEdges}`);
console.log(`binary ${(bin.length / 1048576).toFixed(2)} MB, gzip+base64 ${(gz.length * 4 / 3 / 1048576).toFixed(2)} MB`);
