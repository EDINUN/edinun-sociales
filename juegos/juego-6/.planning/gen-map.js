// Genera el SVG simplificado de las 24 provincias del Ecuador (geoBoundaries ADM1,
// CC BY 4.0). Mainland proyectado (equirectangular) + Galápagos en inset.
// Salida: ecu-map.json { viewBox, galaBox, provincias:[{id,name,d,fill,gala,area}] }
const fs = require("fs");
const DIR = __dirname;
const gj = JSON.parse(fs.readFileSync(DIR + "/ecu-adm1.geojson", "utf8"));

const slug = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/ñ/gi, "n").toLowerCase().replace(/[^a-z]/g, "");

// nombre visible (con tildes ecuatorianas correctas) por shapeName de la fuente
const NAME_BY_SOURCE = {
  "Pastaza": "Pastaza", "Carchi": "Carchi", "Loja": "Loja",
  "Zamora Chinchipe": "Zamora Chinchipe", "El Oro": "El Oro", "Esmeraldas": "Esmeraldas",
  "Imbabura": "Imbabura", "Sucumbios": "Sucumbíos", "Santa Elena": "Santa Elena",
  "Santo Domingo de los Tsáchilas": "Santo Domingo", "Pichincha": "Pichincha",
  "Manabi": "Manabí", "Azuay": "Azuay", "Cañar": "Cañar", "Guayas": "Guayas",
  "Los Ríos": "Los Ríos", "Cotopaxi": "Cotopaxi", "Bolívar": "Bolívar",
  "Tungurahua": "Tungurahua", "Chimborazo": "Chimborazo", "Morona Santiago": "Morona Santiago",
  "Napo": "Napo", "Orellana": "Orellana", "Galápagos": "Galápagos",
};

// Coloreo de mapa asignado a mano: 6 colores, ninguna vecina comparte color.
const COLOR = { A: "#F09E1F", B: "#57A83E", C: "#3B93D8", D: "#BE6FC9", E: "#E67C36", F: "#2FA79A" };
const COLOR_BY_SLUG = {
  esmeraldas: "A", manabi: "C", santaelena: "B", guayas: "E", losrios: "D", eloro: "F",
  santodomingo: "B",
  carchi: "B", imbabura: "E", pichincha: "A", cotopaxi: "C", tungurahua: "E", bolivar: "F",
  chimborazo: "A", canar: "D", azuay: "B", loja: "C",
  sucumbios: "C", napo: "B", orellana: "A", pastaza: "D", moronasantiago: "C", zamorachinchipe: "E",
  galapagos: "F",
};

const isGala = (name) => /gal/i.test(name);
const walk = (c, f) => { if (typeof c[0] === "number") f(c); else c.forEach((k) => walk(k, f)); };

// bounds del continente (excluye Galápagos)
let minX = 180, minY = 90, maxX = -180, maxY = -90;
gj.features.forEach((ft) => {
  if (isGala(ft.properties.shapeName)) return;
  walk(ft.geometry.coordinates, ([x, y]) => {
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  });
});

const MW = 440, MH = 500, PAD = 14;
const s = Math.min((MW - 2 * PAD) / (maxX - minX), (MH - 2 * PAD) / (maxY - minY));
const offx = PAD + ((MW - 2 * PAD) - (maxX - minX) * s) / 2;
const offy = PAD + ((MH - 2 * PAD) - (maxY - minY) * s) / 2;
const mainProj = { x: (lon) => offx + (lon - minX) * s, y: (lat) => offy + (maxY - lat) * s };

const MIN_D = 1.3;
function ringToPath(ring, proj) {
  const pts = [];
  for (const [lon, lat] of ring) {
    const x = +proj.x(lon).toFixed(1), y = +proj.y(lat).toFixed(1);
    const last = pts[pts.length - 1];
    if (!last || Math.hypot(x - last[0], y - last[1]) >= MIN_D) pts.push([x, y]);
  }
  if (pts.length < 3) return { d: "", area: 0 };
  let a = 0;
  for (let i = 0; i < pts.length; i++) { const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length]; a += x1 * y2 - x2 * y1; }
  return { d: "M" + pts.map((p) => p.join(",")).join("L") + "Z", area: Math.abs(a) / 2 };
}
function geomToPath(geom, proj) {
  const polys = geom.type === "Polygon" ? [geom.coordinates] : geom.coordinates;
  let d = "", area = 0;
  for (const poly of polys) poly.forEach((ring, i) => { const r = ringToPath(ring, proj); d += r.d; if (i === 0) area += r.area; });
  return { d, area };
}

// Galápagos inset: mini-proyección propia
const gala = gj.features.find((ft) => isGala(ft.properties.shapeName));
let gminX = 180, gminY = 90, gmaxX = -180, gmaxY = -90;
walk(gala.geometry.coordinates, ([x, y]) => {
  if (x < gminX) gminX = x; if (x > gmaxX) gmaxX = x; if (y < gminY) gminY = y; if (y > gmaxY) gmaxY = y;
});
const GBOX = { x: 10, y: 18, w: 100, h: 70 }, GP = 10;
const gs = Math.min((GBOX.w - 2 * GP) / (gmaxX - gminX), (GBOX.h - 2 * GP) / (gmaxY - gminY));
const galaProj = { x: (lon) => GBOX.x + GP + (lon - gminX) * gs, y: (lat) => GBOX.y + GP + (gmaxY - lat) * gs };

const provincias = gj.features.map((ft) => {
  const src = ft.properties.shapeName;
  const name = NAME_BY_SOURCE[src] || src;
  const id = slug(name);
  const g = isGala(src);
  const { d, area } = geomToPath(ft.geometry, g ? galaProj : mainProj);
  return { id, name, d, fill: COLOR[COLOR_BY_SLUG[id]] || "#cccccc", gala: g, area: +area.toFixed(0) };
}).sort((a, b) => a.name.localeCompare(b.name, "es"));

// ── Regiones vecinas (Océano / Colombia / Perú) + líneas fronterizas ──
// 3 cuñas desde un punto interior P, a través de los 3 "vértices frontera" de
// Ecuador (NW, NE, SW), extendidas al marco. Ecuador (dibujado encima) tapa el
// centro; se ven las 3 regiones de colores + las líneas de frontera al marco.
const verts = [];
gj.features.forEach((ft) => {
  if (isGala(ft.properties.shapeName)) return;
  walk(ft.geometry.coordinates, ([lon, lat]) => verts.push([+mainProj.x(lon).toFixed(1), +mainProj.y(lat).toFixed(1)]));
});
let bxmin = 1e9, bxmax = -1e9, bymin = 1e9, bymax = -1e9;
verts.forEach(([x, y]) => { if (x < bxmin) bxmin = x; if (x > bxmax) bxmax = x; if (y < bymin) bymin = y; if (y > bymax) bymax = y; });
const CX = (bxmin + bxmax) / 2;
const P = [CX, (bymin + bymax) / 2];
const best = (score) => verts.reduce((b, v) => (score(v) > score(b) ? v : b), verts[0]);
const A = best(([x, y]) => -(x + y));               // NW (océano/Colombia)
const B = best(([x, y]) => (x - y));                // NE (Colombia/Perú)
const C = verts.filter(([x]) => x < CX).reduce((b, v) => (v[1] > b[1] ? v : b), [0, -1e9]); // SW costa (océano/Perú)

function frameHit(from, thru) {
  const dx = thru[0] - from[0], dy = thru[1] - from[1];
  let t = Infinity;
  const cand = [];
  if (dx > 0) cand.push((MW - from[0]) / dx); if (dx < 0) cand.push((0 - from[0]) / dx);
  if (dy > 0) cand.push((MH - from[1]) / dy); if (dy < 0) cand.push((0 - from[1]) / dy);
  cand.forEach((c) => { if (c > 0 && c < t) { const x = from[0] + dx * c, y = from[1] + dy * c; if (x >= -0.5 && x <= MW + 0.5 && y >= -0.5 && y <= MH + 0.5) t = c; } });
  return [+(from[0] + dx * t).toFixed(1), +(from[1] + dy * t).toFixed(1)];
}
const fA = frameHit(P, A), fB = frameHit(P, B), fC = frameHit(P, C);
function param(pt) { const [x, y] = pt, e = 0.5;
  if (Math.abs(y) <= e) return x / MW;                 // top 0..1
  if (Math.abs(x - MW) <= e) return 1 + y / MH;        // right 1..2
  if (Math.abs(y - MH) <= e) return 2 + (MW - x) / MW; // bottom 2..3
  return 3 + (MH - y) / MH;                            // left 3..4
}
const CORNERS = [[MW, 0, 1], [MW, MH, 2], [0, MH, 3], [0, 0, 4]]; // TR, BR, BL, TL
function cornersBetween(fromPt, toPt) {
  const a = param(fromPt), b = param(toPt);
  const inArc = (p) => { const d = (p - a + 4) % 4, db = (b - a + 4) % 4; return d > 1e-6 && d < db - 1e-6; };
  return CORNERS.filter((c) => inArc(c[2])).sort((c1, c2) => ((c1[2] - a + 4) % 4) - ((c2[2] - a + 4) % 4)).map((c) => [c[0], c[1]]);
}
const poly = (pts) => "M" + pts.map((p) => p.join(",")).join("L") + "Z";
const colombiaD = poly([A, fA, ...cornersBetween(fA, fB), fB, B, P]);
const peruD = poly([B, fB, ...cornersBetween(fB, fC), fC, C, P]);
const seam = (p, q) => `M${p[0]},${p[1]}L${q[0]},${q[1]}`;

out_neighbors = {
  base: "#cfe3ee",                                  // océano (Pacífico)
  colombia: { d: colombiaD, fill: "#e8e1c6" },      // tierra (tono cálido)
  peru: { d: peruD, fill: "#ecd6cd" },              // tierra (tono rosado)
};
const out_seams = [seam(A, fA), seam(B, fB), seam(C, fC)];

const out = { viewBox: `0 0 ${MW} ${MH}`, galaBox: GBOX, provincias, neighbors: out_neighbors, seams: out_seams };
fs.writeFileSync(DIR + "/ecu-map.json", JSON.stringify(out));

console.log("provincias:", provincias.length,
  "| bytes paths:", provincias.reduce((n, p) => n + p.d.length, 0));
console.log("por área (desc):");
provincias.slice().sort((a, b) => b.area - a.area).forEach((p, i) =>
  console.log(`  ${String(i + 1).padStart(2)}. ${p.name.padEnd(18)} area=${p.area} ${p.gala ? "(inset)" : ""} ${p.fill}`));

// preview HTML (resalta manabi)
const HL = "manabi";
const PV = provincias;
const svg = `<svg viewBox="${out.viewBox}" xmlns="http://www.w3.org/2000/svg">
<rect x="0" y="0" width="${MW}" height="${MH}" fill="${out_neighbors.base}"/>
<path d="${colombiaD}" fill="${out_neighbors.colombia.fill}"/>
<path d="${peruD}" fill="${out_neighbors.peru.fill}"/>
${out_seams.map((d) => `<path d="${d}" fill="none" stroke="#9aa0a6" stroke-width="1.2" stroke-dasharray="4 3"/>`).join("\n")}
<rect x="${GBOX.x}" y="${GBOX.y}" width="${GBOX.w}" height="${GBOX.h}" fill="#cfe6ef" stroke="#8fb3c0" stroke-width="1" rx="5"/>
<text x="${GBOX.x + 5}" y="${GBOX.y + 13}" font-size="8" fill="#3a5560" font-family="sans-serif">GALÁPAGOS</text>
${PV.map((p) => `<path d="${p.d}" fill="${p.id === HL ? "#FFD34D" : p.fill}" stroke="#ffffff" stroke-width="0.8"/>`).join("\n")}
<text x="250" y="40" font-size="11" fill="#5b6b74" font-weight="700">COLOMBIA</text>
<text x="366" y="300" font-size="11" fill="#5b6b74" font-weight="700">PERÚ</text>
<text x="8" y="250" font-size="8" fill="#5b6b74">OCÉANO</text>
</svg>`;
fs.writeFileSync(DIR + "/ecu-map-preview.html",
  `<!doctype html><meta charset="utf8"><body style="margin:0;background:#fff;display:flex;justify-content:center;padding:20px"><div style="width:470px">${svg}</div></body>`);
