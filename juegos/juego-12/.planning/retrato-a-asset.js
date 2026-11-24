// Deja un retrato listo para el juego: lo recorta a 3:4 por la parte de ARRIBA (donde
// está la cara), lo reescala y lo guarda como JPEG en assets/ con el nombre que usa la
// ronda. Sirve para cualquier foto, venga de donde venga.
//
// ⚠ Solo se usa con fotos de DOMINIO PÚBLICO comprobado por la API de Commons, o con las
// que entregue la autora: en este repo no se generan caras de personas reales.
//
// Uso: node .planning/retrato-a-asset.js <origen> <nombre> [recorte] [ancla-x]
//   <recorte> = fracción del alto que se conserva desde arriba (por defecto 1 = todo).
//   <ancla-x> = 0 izquierda · 0.5 centro (por defecto) · 1 derecha.
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", "assets");
const SRC = process.argv[2], NOMBRE = process.argv[3], TOMA = Number(process.argv[4] || 1);
// ⚠ anclaX: 0 = pega el recorte a la IZQUIERDA, 0.5 = centrado, 1 = a la derecha. Hace
// falta cuando la foto libre es de dos personas y solo una es la que toca (Velasco Ibarra
// con su esposa: su retrato está en la mitad izquierda).
const ANCLA = process.argv[5] === undefined ? 0.5 : Number(process.argv[5]);
const ANCHO = 180;   // se ve a 60 px lógicos; 180 cubre pantallas grandes

(async () => {
  if (!SRC || !NOMBRE) { console.error("Uso: node retrato-a-asset.js <origen> <nombre> [recorte]"); process.exit(1); }
  if (!fs.existsSync(SRC)) { console.error("No existe " + SRC); process.exit(1); }
  const mime = path.extname(SRC).toLowerCase() === ".png" ? "image/png" : "image/jpeg";
  const b64 = fs.readFileSync(SRC).toString("base64");
  const br = await chromium.launch();
  const p = await br.newPage();
  const r = await p.evaluate(async ({ b64, mime, ANCHO, TOMA, ANCLA }) => {
    const img = new Image();
    await new Promise((ok, mal) => { img.onload = ok; img.onerror = mal; img.src = "data:" + mime + ";base64," + b64; });
    // Se recorta a 3:4 quedándose con la parte de arriba: en un retrato ahí está la cara.
    const hUtil = img.height * TOMA;
    let w = img.width, h = w * 4 / 3;
    if (h > hUtil) { h = hUtil; w = h * 3 / 4; }
    const x0 = Math.round((img.width - w) * ANCLA), y0 = 0;
    const c = document.createElement("canvas");
    c.width = ANCHO; c.height = Math.round(ANCHO * 4 / 3);
    const x = c.getContext("2d");
    x.imageSmoothingQuality = "high";
    x.drawImage(img, x0, y0, Math.round(w), Math.round(h), 0, 0, c.width, c.height);
    return { de: img.width + "x" + img.height, a: c.width + "x" + c.height, data: c.toDataURL("image/jpeg", 0.88) };
  }, { b64, mime, ANCHO, TOMA, ANCLA });
  const buf = Buffer.from(r.data.split(",")[1], "base64");
  const dest = path.join(DIR, NOMBRE + ".jpg");
  fs.writeFileSync(dest, buf);
  console.log("  " + path.basename(SRC) + "  " + r.de + "  →  " + NOMBRE + ".jpg  " + r.a + "  " + Math.round(buf.length / 1024) + " KB");
  await br.close();
})();
