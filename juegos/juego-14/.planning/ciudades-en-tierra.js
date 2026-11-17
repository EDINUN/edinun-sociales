// ciudades-en-tierra.js — comprueba que las 12 ciudades del banco caen sobre
// TIERRA en el mapa y dentro del recuadro de su región. Nació de un error real:
// las coordenadas se pusieron "en filas" y varias quedaron en el mar.
//   node .planning/ciudades-en-tierra.js
const fs = require("fs");
const path = require("path");
const http = require("http");
const { chromium } = require("playwright");

const FILE = path.resolve(__dirname, "..", "assets", "mapa-mesoamerica.jpg");
const PORT = 8809;

// Espejo de CIUDADES, CROP y REGIONES de game-screens.jsx.
// xf / yf = sobre la imagen completa; x / y = sobre el recorte que se muestra.
const CIUDADES = [
  { n: "Palenque",     e: "clasico",    xf: 0.438, yf: 0.498 },
  { n: "Calakmul",     e: "clasico",    xf: 0.552, yf: 0.443 },
  { n: "Tikal",        e: "clasico",    xf: 0.562, yf: 0.521 },
  { n: "Toniná",       e: "clasico",    xf: 0.440, yf: 0.550 },
  { n: "Bonampak",     e: "clasico",    xf: 0.488, yf: 0.568 },
  { n: "Copán",        e: "clasico",    xf: 0.587, yf: 0.733 },
  { n: "Chichén Itzá", e: "posclasico", xf: 0.616, yf: 0.214 },
  { n: "Mayapán",      e: "posclasico", xf: 0.570, yf: 0.218 },
  { n: "Cobá",         e: "posclasico", xf: 0.659, yf: 0.231 },
  { n: "Uxmal",        e: "posclasico", xf: 0.555, yf: 0.242 },
  { n: "Tulum",        e: "posclasico", xf: 0.674, yf: 0.256 },
  { n: "Edzná",        e: "posclasico", xf: 0.531, yf: 0.310 },
];
const CROP = { x0: 350 / 1376, x1: 1180 / 1376, y0: 136 / 768, y1: 591 / 768 };
CIUDADES.forEach((c) => {
  c.x = (c.xf - CROP.x0) / (CROP.x1 - CROP.x0);
  c.y = (c.yf - CROP.y0) / (CROP.y1 - CROP.y0);
});
const REGIONES = {
  posclasico: { x0: 0.42, y0: 0.02, x1: 0.74, y1: 0.28 },
  clasico:    { x0: 0.26, y0: 0.40, x1: 0.59, y1: 0.98 },
};
const MAPA_W = 420, MAPA_H = 230;
// Rótulo de cada región: centro (lx, ly) en % y su tamaño aproximado en px.
// Se escriben en DOS líneas, por eso son estrechos y altos.
const ROTULO_REGION = {
  posclasico: { lx: 14, ly: 16, w: 112, h: 36 },
  clasico:    { lx: 14, ly: 80, w: 108, h: 36 },
};

(async () => {
  const srv = http.createServer((q, r) => {
    r.writeHead(200, { "Content-Type": "image/jpeg" });
    r.end(fs.readFileSync(FILE));
  });
  await new Promise((ok) => srv.listen(PORT, "127.0.0.1", ok));
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto(`http://127.0.0.1:${PORT}/`);

  const res = await p.evaluate(async ([src, ciudades]) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    const W = img.naturalWidth, H = img.naturalHeight;
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const x = c.getContext("2d");
    x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, W, H).data;
    const esMar = (px, py) => {
      const i = (py * W + px) * 4;
      return d[i + 2] > d[i] + 8;              // azul por encima del rojo => agua
    };
    return ciudades.map((ci) => {
      const px = Math.round(ci.xf * W), py = Math.round(ci.yf * H);
      // margen de 6 px: el punto y su contorno deben estar en tierra
      let mar = 0, total = 0;
      for (let dx = -6; dx <= 6; dx += 3) {
        for (let dy = -6; dy <= 6; dy += 3) {
          const qx = Math.min(W - 1, Math.max(0, px + dx));
          const qy = Math.min(H - 1, Math.max(0, py + dy));
          total++; if (esMar(qx, qy)) mar++;
        }
      }
      return { n: ci.n, e: ci.e, marPct: Math.round((mar / total) * 100) };
    });
  }, [`http://127.0.0.1:${PORT}/`, CIUDADES]);

  let fallos = 0;
  console.log("\n── ¿Cada ciudad está en tierra y en su región? ──\n");
  for (let i = 0; i < CIUDADES.length; i++) {
    const ci = CIUDADES[i], r = res[i], reg = REGIONES[ci.e];
    const enTierra = r.marPct <= 25;
    const enRegion = ci.x >= reg.x0 && ci.x <= reg.x1 && ci.y >= reg.y0 && ci.y <= reg.y1;
    const ok = enTierra && enRegion;
    if (!ok) fallos++;
    console.log(`${ok ? "  ok  " : "  FALLO"} ${ci.n.padEnd(13)} ${ci.e.padEnd(11)}`
      + ` agua alrededor: ${String(r.marPct).padStart(3)}%`
      + `  ${enRegion ? "dentro de su recuadro" : "FUERA DE SU RECUADRO"}`);
  }
  // ── ¿Se distingue qué rótulo es de qué punto? ──
  // Esto es lo que NO comprobé la primera vez y la autora cazó: los nombres se
  // amontonaban arriba. El rótulo va al lado del punto (el de más a la
  // izquierda hacia la izquierda, el otro hacia la derecha), así que hay que
  // verificar TODAS las parejas posibles de cada región.
  const ancho = (n) => 14 + 6.4 * n.length;   // ancho aproximado del rótulo
  const ALTO = 16;
  let choques = 0;
  console.log("── ¿Se distinguen los rótulos en las 15 parejas de cada región? ──\n");
  for (const reg of ["clasico", "posclasico"]) {
    const grupo = CIUDADES.filter((c) => c.e === reg);
    let malos = 0;
    for (let i = 0; i < grupo.length; i++) {
      for (let j = i + 1; j < grupo.length; j++) {
        const par = [grupo[i], grupo[j]].sort((a, b) => a.x - b.x);
        const caja = par.map((c, k) => {
          const cx = c.x * MAPA_W, cy = c.y * MAPA_H, w = ancho(c.n);
          // k=0 -> rótulo a la izquierda del punto; k=1 -> a la derecha
          const x0 = k === 0 ? cx - 5.5 - 6 - w : cx + 5.5 + 6;
          return { x0, x1: x0 + w, y0: cy - ALTO / 2, y1: cy + ALTO / 2, n: c.n };
        });
        const solapa = caja[0].x1 > caja[1].x0 && caja[1].x1 > caja[0].x0
          && caja[0].y1 > caja[1].y0 && caja[1].y1 > caja[0].y0;
        const fuera = caja.some((b) => b.x0 < 0 || b.x1 > MAPA_W);
        if (solapa || fuera) {
          malos++; choques++;
          console.log(`  FALLO ${par[0].n} + ${par[1].n}: ${solapa ? "los rótulos se pisan" : "un rótulo se sale del mapa"}`);
        }
      }
    }
    if (malos === 0) console.log(`  ok   ${reg}: las 15 parejas se distinguen`);

    // …y ninguna puede pisar el rótulo de la región (esto se me escapó: el
    // nombre de Mayapán se montaba sobre "PENÍNSULA DE YUCATÁN").
    const rr = ROTULO_REGION[reg];
    const cajaReg = {
      x0: (rr.lx / 100) * MAPA_W - rr.w / 2, x1: (rr.lx / 100) * MAPA_W + rr.w / 2,
      y0: (rr.ly / 100) * MAPA_H - rr.h / 2, y1: (rr.ly / 100) * MAPA_H + rr.h / 2,
    };
    let contraRegion = 0;
    for (const c of grupo) {
      for (const lado of ["izq", "der"]) {     // según con quién le toque salir
        const cx = c.x * MAPA_W, cy = c.y * MAPA_H, w = ancho(c.n);
        const x0 = lado === "izq" ? cx - 5.5 - 6 - w : cx + 5.5 + 6;
        const b = { x0, x1: x0 + w, y0: cy - ALTO / 2, y1: cy + ALTO / 2 };
        if (b.x1 > cajaReg.x0 && cajaReg.x1 > b.x0 && b.y1 > cajaReg.y0 && cajaReg.y1 > b.y0) {
          contraRegion++; choques++;
          console.log(`  FALLO ${c.n} (rótulo a la ${lado}) pisa el rótulo de la región`);
        }
      }
    }
    if (contraRegion === 0) console.log(`  ok   ${reg}: ningún nombre pisa el rótulo de la región`);
  }

  fallos += choques;
  console.log(fallos === 0
    ? "\n✓ Las 12 ciudades están en tierra, en su recuadro, y todos los rótulos se distinguen.\n"
    : `\n✗ ${fallos} problema(s).\n`);

  await b.close(); srv.close();
  process.exit(fallos === 0 ? 0 : 1);
})();
