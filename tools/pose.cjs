// Part poses for the check tools (snap.cjs, collide.cjs), matching src/app.js.
// A part's own motion in a step is a translation (`vec`) and, optionally, a turn about a pivot:
//   mover {id, vec, rot: {axis: [x,y,z], deg, pivot: [x,y,z]}}  starts turned by deg and moved by vec
//   step  pose: [{id, axis, deg, pivot, vec?}]                  holds a part turned for the step
//                                                               (a latch swung open)
// Its world pose is its parent's pose times its own. Matrices are 3x4 row-major arrays.
const I = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0];
const mul = (a, b) => {
  const o = new Array(12);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) o[4 * r + c] = a[4 * r] * b[c] + a[4 * r + 1] * b[4 + c] + a[4 * r + 2] * b[8 + c];
    o[4 * r + 3] = a[4 * r] * b[3] + a[4 * r + 1] * b[7] + a[4 * r + 2] * b[11] + a[4 * r + 3];
  }
  return o;
};
const translate = v => [1, 0, 0, v[0], 0, 1, 0, v[1], 0, 0, 1, v[2]];
// Rodrigues rotation by deg about axis through pivot.
function turn(axis, deg, pivot) {
  const l = Math.hypot(...axis), [x, y, z] = axis.map(a => a / l), t = deg * Math.PI / 180, c = Math.cos(t), s = Math.sin(t), C = 1 - c;
  const R = [c + x * x * C, x * y * C - z * s, x * z * C + y * s, 0, y * x * C + z * s, c + y * y * C, y * z * C - x * s, 0, z * x * C - y * s, z * y * C + x * s, c + z * z * C, 0];
  return mul(translate(pivot), mul(R, translate(pivot.map(v => -v))));
}
const apply = (m, v) => [m[0] * v[0] + m[1] * v[1] + m[2] * v[2] + m[3], m[4] * v[0] + m[5] * v[1] + m[6] * v[2] + m[7], m[8] * v[0] + m[9] * v[1] + m[10] * v[2] + m[11]];
// Inverse of a rigid 3x4 matrix (rotation + translation).
const invert = m => {
  const R = [m[0], m[4], m[8], 0, m[1], m[5], m[9], 0, m[2], m[6], m[10], 0];
  const t = apply(R, [m[3], m[7], m[11]]);
  R[3] = -t[0]; R[7] = -t[1]; R[11] = -t[2];
  return R;
};
// Offset along a mover's path at progress k (1 = start, 0 = in place): straight from vec, or
// through the waypoints in `via` (offsets, in order towards the end).
function pathOffset(m, k) {
  if (!m.via || !m.via.length) return m.vec.map(x => x * k);
  const pts = [m.vec, ...m.via, [0, 0, 0]], seg = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) { const l = Math.hypot(...pts[i].map((x, j) => x - pts[i - 1][j])); seg.push(l); total += l; }
  let s = (1 - k) * total;
  for (let i = 0; i < seg.length; i++) {
    if (s <= seg[i] || i === seg.length - 1) { const u = seg[i] ? Math.min(1, s / seg[i]) : 1; return pts[i].map((x, j) => x + (pts[i + 1][j] - x) * u); }
    s -= seg[i];
  }
  return [0, 0, 0];
}
// Own matrix of a part: translation by `off`, then a turn of `deg` (scaled by k) about its pivot.
const own = (off, rot, k) => rot ? mul(translate(off), turn(rot.axis, rot.deg * k, rot.pivot)) : translate(off);

// World matrices of every part in a step at progress function kOf(mover) (1 = start, 0 = end).
// byId: part records with .parent; shift: the step's bench shift.
function poseOf(step, kOf, byId) {
  const ownM = new Map(), ownOff = new Map();
  for (const m of step.movers) {
    const k = kOf(m);
    const off = pathOffset(m, k);
    ownOff.set(m.id, off);
    ownM.set(m.id, own(off, m.rot, k));
  }
  for (const h of step.pose || []) {
    const prev = ownM.get(h.id) || I;
    ownM.set(h.id, mul(prev, own(h.vec || [0, 0, 0], h, 1)));
  }
  if (step.shift) for (const id of step.shift.ids) ownM.set(id, mul(translate(step.shift.vec), ownM.get(id) || I));
  const cache = new Map();
  const world = id => {
    if (cache.has(id)) return cache.get(id);
    const p = byId.get(id), m = ownM.get(id) || I;
    const w = p.parent ? mul(world(p.parent), m) : m;
    cache.set(id, w);
    return w;
  };
  return {world, ownOff};
}
module.exports = {I, mul, translate, turn, apply, invert, poseOf, pathOffset};
