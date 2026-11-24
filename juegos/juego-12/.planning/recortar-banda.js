// Recorta una ilustración a una BANDA horizontal (una fracción del alto, desde arriba).
// Nace de las cajas de banano del Libro 7 · Tema 3: apiladas de diez en diez, cada caja
// solo puede medir unos 26 px de alto, y a lo ancho queremos 90. Con la caja entera
// (proporción 1,45:1) o salían columnas estrechas o había que superponer las cajas, que
// es lo que la autora no quería: *"no me gusta que cada banano se monte sobre la imagen
// anterior"*. Recortada a su FRENTE, la proporción se acerca a la de la casilla y las
// cajas se apoyan una sobre otra sin taparse.
//
// ⚠ NUNCA pisa un respaldo existente.
//
// Uso: node .planning/recortar-banda.js <archivo-en-assets> <carpeta-respaldo> <fracción> [ancho]
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", "assets");
const FICHERO = process.argv[2], BAK = process.argv[3];
const FRAC = Number(process.argv[4] || 0.55), ANCHO = Number(process.argv[5] || 280);

(async () => {
  if (!FICHERO || !BAK) { console.error("Uso: node recortar-banda.js <archivo> <respaldo> <fracción> [ancho]"); process.exit(1); }
  const src = path.join(DIR, FICHERO);
  if (!fs.existsSync(src)) { console.error("No existe " + src); process.exit(1); }
  fs.mkdirSync(BAK, { recursive: true });
  const bak = path.join(BAK, FICHERO);
  if (!fs.existsSync(bak)) fs.copyFileSync(src, bak); else console.log("  (respaldo ya existente)");
  const b64 = fs.readFileSync(src).toString("base64");
  const br = await chromium.launch();
  const p = await br.newPage();
  const r = await p.evaluate(async ({ b64, FRAC, ANCHO }) => {
    const img = new Image();
    await new Promise((ok, mal) => { img.onload = ok; img.onerror = mal; img.src = "data:image/jpeg;base64," + b64; });
    const h = Math.round(img.height * FRAC);
    const c = document.createElement("canvas");
    c.width = ANCHO; c.height = Math.round(ANCHO * h / img.width);
    const x = c.getContext("2d");
    x.imageSmoothingQuality = "high";
    x.drawImage(img, 0, 0, img.width, h, 0, 0, c.width, c.height);
    return { de: img.width + "x" + img.height, a: c.width + "x" + c.height, data: c.toDataURL("image/jpeg", 0.88) };
  }, { b64, FRAC, ANCHO });
  const buf = Buffer.from(r.data.split(",")[1], "base64");
  fs.writeFileSync(src, buf);
  console.log("  " + FICHERO + "  " + r.de + "  →  " + r.a + "  " + Math.round(buf.length / 1024) + " KB");
  await br.close();
})();
