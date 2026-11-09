// Collision check of the step animations, without a browser. Every step is played through in
// time (phases and delays as in src/app.js); at each sample the vertices of each moving part are
// tested against the solids of the other visible parts. A part that ends inside another part
// (an insert pressed into plastic, a screw in its hole) is only flagged while it still has more
// than END_MM of travel left.
// Point-in-solid: each part is voxelised once into z-columns (0.5 mm) holding the heights where
// its surface crosses the column; a point is inside when it has an odd number of crossings
// below it.
// A part may pass into a part it ends up fitted into (a screw into its insert or its hole, an
// insert into the plastic, a bearing into its pocket) for its last stretch: as far as the part
// reaches along its own travel.
// VEC='id=x,y,z;id2=…' tries other start offsets without a rebuild.
// Usage: node tools/collide.cjs [step id | number | section ...]   (OPTS=hotend=dragon,pcb=0, BUILD_OUT=build/x)
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const root = path.join(__dirname, '..');
const dir = path.join(root, process.env.BUILD_OUT || 'build');
const MODEL = JSON.parse(fs.readFileSync(path.join(dir, 'model.json')));
const bin = zlib.gunzipSync(Buffer.from(fs.readFileSync(path.join(dir, 'model.bin.gz.b64'), 'utf8'), 'base64'));
const view = (Type, [at, len]) => new Type(bin.buffer.slice(bin.byteOffset + at, bin.byteOffset + at + len * Type.BYTES_PER_ELEMENT));
const parts = MODEL.parts.map(p => ({...p, P: view(Float32Array, p.pos), T: view(Uint32Array, p.idx)}));
const byId = new Map(parts.map(p => [p.id, p]));
const PHASE = 1.05, MOVE = 0.85, END_MM = 1.5, CELL = 0.5, MIN_POINTS = 2;

// ---------- build options and visibility, as in src/app.js ----------
const build = Object.fromEntries((MODEL.options || []).map(o => [o.key, o.default]));
for (const kv of (process.env.OPTS || '').split(',').filter(Boolean)) {
  const [k, v] = kv.split('='), o = MODEL.options.find(x => x.key === k);
  if (!o) throw Error('unknown option ' + k);
  build[k] = o.type === 'bool' ? !/^(0|false|no|off)$/i.test(v) : v;
}
const holds = when => !when || [].concat(when).every(c => {
  const [, neg, key, op, val] = /^(!?)([\w-]+)(?:(!?=)(.+))?$/.exec(c);
  let r = op ? val.split('|').includes(String(build[key])) : !!build[key];
  if (op === '!=') r = !r;
  return neg ? !r : r;
});
const enabled = p => holds(p.when);
for (const p of parts) if (p.parents) p.parent = p.parents.find(id => enabled(byId.get(id))) ?? p.parents[0];
const tryVec = new Map((process.env.VEC || '').split(';').filter(Boolean).map(kv => { const [id, v] = kv.split('='); return [id, v.split(',').map(Number)]; }));
const tryRot = new Map((process.env.ROT || '').split(';').filter(Boolean).map(kv => { const [id, v] = kv.split('='); const n = v.split(',').map(Number); return [id, {axis: n.slice(0, 3), deg: n[3], pivot: n.slice(4, 7)}]; }));
// VIA='id=x,y,z/x,y,z;…' tries waypoints.
const tryVia = new Map((process.env.VIA || '').split(';').filter(Boolean).map(kv => { const [id, v] = kv.split('='); return [id, v.split('/').map(p => p.split(',').map(Number))]; }));
// ADD='id=x,y,z;…' adds an extra (again) mover in the step named on the command line.
const tryAdd = new Map((process.env.ADD || '').split(';').filter(Boolean).map(kv => { const [id, v] = kv.split('='); return [id, v.split(',').map(Number)]; }));
const steps = MODEL.steps.filter(s => holds(s.when)).map(s => ({...s, movers: s.movers.filter(m => enabled(byId.get(m.id))).map(m => tryVec.has(m.id) ? {...m, vec: tryVec.get(m.id)} : m).map(m => tryRot.has(m.id) ? {...m, rot: tryRot.get(m.id)} : m).map(m => tryVia.has(m.id) ? {...m, via: tryVia.get(m.id)} : m).concat([...tryAdd].filter(([id]) => s.id === (process.env.ADD_STEP || s.id) && process.argv.includes(s.id)).map(([id, vec]) => ({id, vec, phase: 0, delay: 0, again: true})))}));
const refStep = new Map(), mountStep = new Map(), removedAt = new Map();
steps.forEach((s, i) => { for (const m of s.movers) if (!m.again && !m.out && !refStep.has(m.id)) refStep.set(m.id, i); });
steps.forEach((s, i) => { for (const id of s.bench || []) if (!refStep.has(id)) refStep.set(id, i); });
steps.forEach((s, i) => { for (const m of s.movers) { if (m.again && !mountStep.has(m.id)) mountStep.set(m.id, i); if (m.out && !removedAt.has(m.id)) removedAt.set(m.id, i); } });
const gone = (id, i) => removedAt.has(id) && removedAt.get(id) < i;
const refOf = id => refStep.has(id) ? refStep.get(id) : byId.get(id).parent ? refOf(byId.get(id).parent) : 0;
const ancestors = id => { const out = []; for (let p = byId.get(id); p.parent; p = byId.get(p.parent)) out.push(p.parent); return out; };
function visibleSet(si) {
  const s = steps[si], out = new Set();
  const movers = new Set(s.movers.map(m => m.id));
  for (const p of parts) {
    if (!enabled(p) || gone(p.id, si)) continue;
    if (s.bench) { if (s.bench.includes(p.id) || movers.has(p.id) || (refOf(p.id) <= si && ancestors(p.id).some(a => s.bench.includes(a) || movers.has(a)))) out.add(p.id); }
    else if (refOf(p.id) <= si && !(mountStep.get(p.id) > si)) out.add(p.id);
  }
  const roots = new Set(s.bench ? [...s.bench, ...movers] : []);
  for (const id of [...out]) {
    if (roots.has(id)) continue;
    for (const a of ancestors(id)) { if (!out.has(a)) { out.delete(id); break; } if (roots.has(a)) break; }
  }
  return out;
}
const ease = u => u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
const {poseOf, apply, invert} = require('./pose.cjs');
const kAt = t => m => { const u = Math.min(1, Math.max(0, (t - m.phase * PHASE - m.delay) / MOVE)); return m.out ? ease(u) : 1 - ease(u); };
const poseAt = (s, t) => poseOf(s, kAt(t), byId);

// ---------- voxel columns ----------
const columns = new Map();
function columnsOf(p) {
  if (columns.has(p.id)) return columns.get(p.id);
  const P = p.P, T = p.T, [mn, mx] = p.box;
  const nx = Math.max(1, Math.ceil((mx[0] - mn[0]) / CELL)), ny = Math.max(1, Math.ceil((mx[1] - mn[1]) / CELL));
  const cols = new Map();
  for (let t = 0; t < T.length; t += 3) {
    const a = 3 * T[t], b = 3 * T[t + 1], c = 3 * T[t + 2];
    const x0 = Math.min(P[a], P[b], P[c]), x1 = Math.max(P[a], P[b], P[c]), y0 = Math.min(P[a + 1], P[b + 1], P[c + 1]), y1 = Math.max(P[a + 1], P[b + 1], P[c + 1]);
    for (let i = Math.max(0, Math.floor((x0 - mn[0]) / CELL)); i <= Math.min(nx - 1, Math.floor((x1 - mn[0]) / CELL)); i++) {
      const px = mn[0] + (i + 0.5) * CELL;
      for (let j = Math.max(0, Math.floor((y0 - mn[1]) / CELL)); j <= Math.min(ny - 1, Math.floor((y1 - mn[1]) / CELL)); j++) {
        const py = mn[1] + (j + 0.5) * CELL;
        // Barycentric test of the column centre in the triangle's xy projection, then its z.
        const d = (P[b + 1] - P[c + 1]) * (P[a] - P[c]) + (P[c] - P[b]) * (P[a + 1] - P[c + 1]);
        if (Math.abs(d) < 1e-12) continue;
        const l1 = ((P[b + 1] - P[c + 1]) * (px - P[c]) + (P[c] - P[b]) * (py - P[c + 1])) / d;
        const l2 = ((P[c + 1] - P[a + 1]) * (px - P[c]) + (P[a] - P[c]) * (py - P[c + 1])) / d;
        const l3 = 1 - l1 - l2;
        if (l1 < 0 || l2 < 0 || l3 < 0) continue;
        const z = l1 * P[a + 2] + l2 * P[b + 2] + l3 * P[c + 2], key = i * 100000 + j;
        (cols.get(key) || cols.set(key, []).get(key)).push(z);
      }
    }
  }
  for (const v of cols.values()) v.sort((a, b) => a - b);
  const res = {mn, mx, cols};
  columns.set(p.id, res);
  return res;
}
// Inside when an odd number of surface crossings lie below the point (a little margin keeps
// touching surfaces from counting).
function inside(p, inv, x, y, z) {
  const c = columnsOf(p), [lx, ly, lz] = apply(inv, [x, y, z]), M = 0.15;
  if (lx < c.mn[0] + M || lx > c.mx[0] - M || ly < c.mn[1] + M || ly > c.mx[1] - M || lz < c.mn[2] + M || lz > c.mx[2] - M) return false;
  const v = c.cols.get(Math.floor((lx - c.mn[0]) / CELL) * 100000 + Math.floor((ly - c.mn[1]) / CELL));
  if (!v) return false;
  let n = 0; for (const h of v) { if (h < lz - M) n++; else break; }
  if (n % 2 === 0) return false;
  // Not within M of the next crossing above either.
  const above = v[n]; return above === undefined || above > lz + M;
}
// Up to 400 vertices per part, spread over the mesh.
// Screws, inserts and PTFE tube are round and sit in holes barely larger than they are: their
// centre line is tested (a centre line in material means the part goes through it). Other parts
// are tested on up to 400 vertices.
const sampleCache = new Map();
const samples = p => {
  if (sampleCache.has(p.id)) return sampleCache.get(p.id);
  let out = [];
  if (p.kind === 'bolt' || p.kind === 'insert' || p.kind === 'ptfe') {
    const lo = p.box[0], hi = p.box[1], c = lo.map((v, k) => (v + hi[k]) / 2), d = hi.map((v, k) => v - lo[k]);
    const ax = p.axis || (() => { const a = [0, 0, 0]; a[d.indexOf(Math.max(...d))] = 1; return a; })();
    const L = Math.abs(ax[0]) * d[0] + Math.abs(ax[1]) * d[1] + Math.abs(ax[2]) * d[2];
    for (let i = 0; i <= 24; i++) { const t = (i / 24 - 0.5) * L * 0.96; out.push(c.map((v, k) => v + ax[k] * t)); }
  } else {
    // Points spread over the surface by area (about one per 1.5 mm²), so large flat faces that
    // cross a thin wall are caught too; at most 4000 per part.
    const P = p.P, T = p.T, area = [];
    let A = 0;
    for (let t = 0; t < T.length; t += 3) {
      const a = 3 * T[t], b = 3 * T[t + 1], c = 3 * T[t + 2];
      const u = [P[b] - P[a], P[b + 1] - P[a + 1], P[b + 2] - P[a + 2]], w = [P[c] - P[a], P[c + 1] - P[a + 1], P[c + 2] - P[a + 2]];
      const ar = Math.hypot(u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]) / 2;
      A += ar; area.push(A);
    }
    const N = Math.min(4000, Math.max(200, Math.round(A / 1.5)));
    let seed = 1; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < N; i++) {
      const r = rnd() * A; let lo = 0, hi = area.length - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (area[m] < r) lo = m + 1; else hi = m; }
      const t = 3 * lo, a = 3 * T[t], b = 3 * T[t + 1], c = 3 * T[t + 2];
      let x = rnd(), y = rnd(); if (x + y > 1) { x = 1 - x; y = 1 - y; }
      out.push([0, 1, 2].map(k => P[a + k] + x * (P[b + k] - P[a + k]) + y * (P[c + k] - P[a + k])));
    }
  }
  sampleCache.set(p.id, out);
  return out;
};

// ---------- run ----------
const args = process.argv.slice(2);
const chosen = steps.map((s, i) => i).filter(i => !args.length || args.some(a => a === steps[i].id || a === String(i + 1) || a === steps[i].section));
let flagged = 0, score = 0;
for (const si of chosen) {
  const s = steps[si];
  if (!s.movers.length) continue;
  const vis = visibleSet(si), end = Math.max(...s.movers.map(m => m.phase * PHASE + m.delay + MOVE));
  const moving = new Set([...vis].filter(id => [id, ...ancestors(id)].some(a => s.movers.some(m => m.id === a))));
  const hits = new Map();
  const box = (pts) => { const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity]; for (const v of pts) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], v[k]); hi[k] = Math.max(hi[k], v[k]); } return [lo, hi]; };
  const corners = (p, m) => { const out = []; for (let c = 0; c < 8; c++) out.push(apply(m, [0, 1, 2].map(k => p.box[(c >> k) & 1][k]))); return out; };
  // Which parts each moving part ends up inside (its fit), and how far it reaches along its travel.
  const fin = poseAt(s, 1e9).world, start = poseAt(s, 0).world, fits = new Map(), reach = new Map();
  for (const id of moving) {
    const p = byId.get(id), f = fin(id), pts = samples(p).map(v => apply(f, v)), set = new Set();
    for (const qid of vis) { if (qid === id) continue; const q = byId.get(qid), qi = invert(fin(qid)); let n = 0; for (const v of pts) if (inside(q, qi, ...v)) n++; if (n) set.add(qid); }
    fits.set(id, set);
    const c0 = apply(start(id), [0, 0, 0]), c1 = apply(f, [0, 0, 0]), d = c0.map((x, k) => x - c1[k]), L = Math.hypot(...d) || 1, u = d.map(x => x / L);
    let lo = Infinity, hi = -Infinity; for (const v of samples(p)) { const t = v[0] * u[0] + v[1] * u[1] + v[2] * u[2]; lo = Math.min(lo, t); hi = Math.max(hi, t); }
    reach.set(id, hi - lo);
  }
  // Travel left: how far the part's sample points still are from where they end (own motion
  // for a mover, the carrier's for a carried part).
  const travel = (w, f, p) => Math.max(...samples(p).filter((_, i) => i % 5 === 0).map(v => { const a = apply(w, v), b = apply(f, v); return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]); }));
  // Screws, inserts, bearings, gears and tube slide into what holds them for as far as they
  // reach; any other part may only touch at the very end (snug fits, 2 mm).
  const allowance = (p, id) => /^(bolt|insert|ptfe|bearing|motion|hotend|spring|washer|nut|magnet)$/.test(p.kind) ? reach.get(id) + 0.5 : 2;
  for (let t = 0; t <= end; t += 0.04) {
    const {world, ownOff} = poseAt(s, t);
    for (const id of moving) {
      const p = byId.get(id), w = world(id);
      const isMover = s.movers.some(m => m.id === id);
      const left = isMover ? (() => { const m = s.movers.find(x => x.id === id); const k = kAt(t)(m), o = ownOff.get(id); return Math.hypot(...o) + (m.rot ? Math.abs(m.rot.deg * k) * Math.PI / 180 * 20 : 0); })() : travel(w, fin(id), p);
      if (left < END_MM && !s.movers.some(m => m.id === id && m.out)) continue;
      const pts = samples(p).map(v => apply(w, v));
      const [lo, hi] = box(pts);
      for (const qid of vis) {
        if (qid === id) continue;
        const q = byId.get(qid), qw = world(qid);
        // Parts that move together (a sub-assembly) cannot collide with each other.
        if (moving.has(qid) && qw.every((x, k) => Math.abs(x - w[k]) < 1e-9)) continue;
        if ((fits.get(id).has(qid) || ancestors(id).includes(qid) || ancestors(qid).includes(id)) && left <= allowance(p, id)) continue;
        const [qlo, qhi] = box(corners(q, qw));
        if (qlo.some((x, k) => x > hi[k]) || qhi.some((x, k) => x < lo[k])) continue;
        const qi = invert(qw);
        let n = 0; for (const v of pts) if (inside(q, qi, v[0], v[1], v[2])) n++;
        if (n >= MIN_POINTS) {
          const key = id + ' → ' + qid, h = hits.get(key);
          if (!h || n > h.n) hits.set(key, {n, t: +t.toFixed(2), left: +left.toFixed(1)});
        }
      }
    }
  }
  for (const [k, h] of hits) { if (h.left > 3) score += h.n; flagged++; console.log(`${String(si + 1).padStart(2)} ${s.id.padEnd(18)} ${k}  (${h.n} pts, t=${h.t}s, ${h.left} mm before the end)`); }
}
console.log(flagged ? `${flagged} collisions` : 'no collisions');
console.log(`score ${score} (contact points more than 3 mm before the end)`);
