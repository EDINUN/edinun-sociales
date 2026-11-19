// ¿Están los cuatro puntos donde deben? Se comprueba contra las coordenadas reales y
// contra el contorno real, sin fiarse del ojo:
//   1. que la proyección del juego devuelva el mismo x,y que se calcula aquí de cero;
//   2. que cada punto caiga DENTRO del polígono del Ecuador continental;
//   3. las relaciones que se pueden verificar a mano (quién está al norte/sur/este/oeste).
// Uso: node comprobar-ciudades.js <geojson de Natural Earth>
const fs = require("fs");
const gj = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const f = gj.features.find((x) => (x.properties || {}).ADM0_A3 === "ECU");
const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
let anillos = [];
polys.forEach((poly) => poly.forEach((ring, i) => { if (i === 0) anillos.push(ring); }));
anillos = anillos.filter((r) => r.every((c) => c[0] > -85));          // sin Galápagos
const area = (r) => Math.abs(r.reduce((a, c, i) => { const n = r[(i + 1) % r.length]; return a + (c[0] * n[1] - n[0] * c[1]); }, 0) / 2);
const mayor = Math.max.apply(null, anillos.map(area));
const continente = anillos.find((r) => area(r) === mayor);

// Coordenadas reales de las cuatro ciudades (grados decimales).
const CIUDADES = [
  { n: "Quito", lon: -78.4678, lat: -0.1807, x: 126.7, y: 80.4 },
  { n: "Guayaquil", lon: -79.9224, lat: -2.1709, x: 54.3, y: 179.5 },
  { n: "Cuenca", lon: -79.0059, lat: -2.9001, x: 99.9, y: 215.8 },
  { n: "Loja", lon: -79.2042, lat: -3.9931, x: 90.0, y: 270.2 },
];
// El mismo encuadre que usa el juego: caja de los anillos conservados, ancho 288.
const todos = [].concat.apply([], anillos);
const lons = todos.map((c) => c[0]), lats = todos.map((c) => c[1]);
const minLon = Math.min.apply(null, lons), maxLon = Math.max.apply(null, lons);
const minLat = Math.min.apply(null, lats), maxLat = Math.max.apply(null, lats);
const W = 288, esc = W / (maxLon - minLon);

function dentro(lon, lat, ring) {
  let d = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) d = !d;
  }
  return d;
}

let fallos = 0;
console.log("ciudad        x esperado   x del juego   y esperado   y del juego   ¿dentro del país?");
CIUDADES.forEach((c) => {
  const x = (c.lon - minLon) * esc, y = (maxLat - c.lat) * esc;
  const dx = Math.abs(x - c.x), dy = Math.abs(y - c.y);
  const dentroPais = dentro(c.lon, c.lat, continente);
  if (dx > 0.15 || dy > 0.15 || !dentroPais) fallos++;
  console.log(
    c.n.padEnd(12) + x.toFixed(1).padStart(10) + String(c.x).padStart(14) +
    y.toFixed(1).padStart(13) + String(c.y).padStart(14) + "   " + (dentroPais ? "sí" : "NO ✗") +
    (dx > 0.15 || dy > 0.15 ? "   ✗ desvío " + Math.max(dx, dy).toFixed(2) + " px" : "")
  );
});

// Relaciones comprobables a mano, por si el encuadre entero estuviera mal.
const q = CIUDADES[0], g = CIUDADES[1], cu = CIUDADES[2], l = CIUDADES[3];
const pruebas = [
  ["Quito es la más al norte", q.y < g.y && q.y < cu.y && q.y < l.y],
  ["Loja es la más al sur", l.y > q.y && l.y > g.y && l.y > cu.y],
  ["Guayaquil es la más al oeste", g.x < q.x && g.x < cu.x && g.x < l.x],
  ["Cuenca está al este de Loja", cu.x > l.x],
  ["Cuenca está al norte de Loja", cu.y < l.y],
  ["Quito está al este de Guayaquil", q.x > g.x],
];
console.log("");
pruebas.forEach(([t, ok]) => { if (!ok) fallos++; console.log((ok ? "OK  " : "X   ") + t); });
// 4. Prueba INDEPENDIENTE del encuadre: si un punto estuviera corrido, las distancias
//    entre ciudades EN EL MAPA no cuadrarían con las reales. Se compara cada par contra
//    la distancia real (gran círculo) y se mira el error en porcentaje. Esto no depende
//    de la proyección ni de la caja: cualquier punto fuera de sitio salta aquí.
const R = 6371; // km
function km(a, b) {
  const g = (x) => (x * Math.PI) / 180;
  const dLat = g(b.lat - a.lat), dLon = g(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(g(a.lat)) * Math.cos(g(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
const pix = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const pares = [];
for (let i = 0; i < CIUDADES.length; i++) for (let j = i + 1; j < CIUDADES.length; j++) pares.push([CIUDADES[i], CIUDADES[j]]);
// La escala km/píxel sale del par más largo; los demás se miden contra ella.
const refe = pares.reduce((m, p) => (km(p[0], p[1]) > km(m[0], m[1]) ? p : m));
const kmPorPx = km(refe[0], refe[1]) / pix(refe[0], refe[1]);
console.log("\npar de ciudades             real (km)   en el mapa (km)    error");
pares.forEach(([a, bb]) => {
  const real = km(a, bb), mapa = pix(a, bb) * kmPorPx;
  const err = (Math.abs(mapa - real) / real) * 100;
  if (err > 3) fallos++;
  console.log((a.n + " - " + bb.n).padEnd(27) + real.toFixed(0).padStart(9) + mapa.toFixed(0).padStart(18) + (err.toFixed(1) + " %").padStart(9) + (err > 3 ? "  X" : ""));
});

console.log("\n" + (fallos ? "X " + fallos + " comprobacion(es) fallan" : "OK Los cuatro puntos están en sus coordenadas reales, dentro del país, y las distancias entre ellos cuadran con las reales."));
