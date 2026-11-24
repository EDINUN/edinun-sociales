// Recorta el MARGEN UNIFORME de una ilustración (el fondo liso que rodea al objeto) y la
// reescala. Nace de la R2 del Libro 7 · Tema 3: la caja de banano venía con un fondo gris
// clarísimo y mucho aire alrededor, y al apilarse solo se veía ese fondo — que contra el
// verde del juego **se lee azul**. La autora lo marcó: *"mira cómo se pinta de celeste y
// no sé por qué, eso no me agrada"*.
//
// ⚠ Detecta el color de las CUATRO esquinas y recorta hasta el primer píxel que se
// aparte de él más que la tolerancia. Si las esquinas no coinciden entre sí, no hay
// margen uniforme que quitar y no toca el archivo.
//
// ⚠ NUNCA pisa un respaldo existente.
//
// Uso: node .planning/recortar-margen.js <archivo-en-assets> <carpeta-de-respaldo> [lado]
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", "assets");
const FICHERO = process.argv[2], BAK = process.argv[3], LADO = Number(process.argv[4] || 240);
const TOL = 26, MARGEN = 3;

(async () => {
  if (!FICHERO || !BAK) { console.error("Uso: node recortar-margen.js <archivo> <respaldo> [lado]"); process.exit(1); }
  const src = path.join(DIR, FICHERO);
  if (!fs.existsSync(src)) { console.error("No existe " + src); process.exit(1); }
  fs.mkdirSync(BAK, { recursive: true });
  const bak = path.join(BAK, FICHERO);
  if (!fs.existsSync(bak)) fs.copyFileSync(src, bak);
  else console.log("  (el respaldo ya existía, no se toca)");

  const br = await chromium.launch();
  const p = await br.newPage();
  const b64 = fs.readFileSync(src).toString("base64");
  const r = await p.evaluate(async ({ b64, TOL, MARGEN, LADO }) => {
    const img = new Image();
    await new Promise((ok, mal) => { img.onload = ok; img.onerror = mal; img.src = "data:image/jpeg;base64," + b64; });
    const c = document.createElement("canvas");
    c.width = img.width; c.height = img.height;
    const x = c.getContext("2d");
    x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height).data;
    const px = (i, j) => { const o = (j * c.width + i) * 4; return [d[o], d[o + 1], d[o + 2]]; };
    const esq = [px(0, 0), px(c.width - 1, 0), px(0, c.height - 1), px(c.width - 1, c.height - 1)];
    const dif = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
    for (let k = 1; k < 4; k++) if (dif(esq[0], esq[k]) > TOL) return { err: "las esquinas no son del mismo color: no hay margen uniforme" };
    const fondo = esq[0];
    let x0 = c.width, y0 = c.height, x1 = -1, y1 = -1;
    for (let j = 0; j < c.height; j++) for (let i = 0; i < c.width; i++) {
      if (dif(px(i, j), fondo) > TOL) { if (i < x0) x0 = i; if (j < y0) y0 = j; if (i > x1) x1 = i; if (j > y1) y1 = j; }
    }
    if (x1 < 0) return { err: "la imagen entera es del color del fondo" };
    x0 = Math.max(0, x0 - MARGEN); y0 = Math.max(0, y0 - MARGEN);
    x1 = Math.min(c.width - 1, x1 + MARGEN); y1 = Math.min(c.height - 1, y1 + MARGEN);
    const w = x1 - x0 + 1, h = y1 - y0 + 1;
    const o = document.createElement("canvas");
    const esc = LADO / Math.max(w, h);
    o.width = Math.round(w * esc); o.height = Math.round(h * esc);
    const xo = o.getContext("2d");
    xo.imageSmoothingQuality = "high";
    xo.drawImage(c, x0, y0, w, h, 0, 0, o.width, o.height);
    return { antes: img.width + "x" + img.height, w: o.width, h: o.height, data: o.toDataURL("image/jpeg", 0.88) };
  }, { b64, TOL, MARGEN, LADO });

  if (r.err) { console.log("  X " + r.err); await br.close(); return; }
  const buf = Buffer.from(r.data.split(",")[1], "base64");
  const antes = fs.statSync(src).size, despues = buf.length;
  fs.writeFileSync(src, buf);
  console.log("  " + FICHERO + "  " + r.antes + " " + Math.round(antes / 1024) + " KB  →  " + r.w + "x" + r.h + " " + Math.round(despues / 1024) + " KB");
  await br.close();
})();
