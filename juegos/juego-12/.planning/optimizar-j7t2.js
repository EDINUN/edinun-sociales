// Reescala las 9 ilustraciones del Libro 7 · Tema 1 a un tamaño razonable para pantalla.
// Llegan a ~1024 px y se ven a 106 px (expedientes), 124×46 (platillos) o como fondo del
// carril (470 px lógicos): sobran. A los tamaños de abajo se ven idénticas y pesan una
// fracción.
//
// ⚠ A DIFERENCIA de `optimizar-personas.js`, este RESPETA LA PROPORCIÓN: el ferrocarril
// es 16:9 y forzarlo a cuadrado lo deformaría.
//
// ⚠ NUNCA pisa un respaldo existente (`if (!fs.existsSync(bak))`). En juego-15 una
// segunda pasada sobrescribió los respaldos con las versiones ya reducidas y se
// perdieron los originales.
//
// Uso: node .planning/optimizar-j7t2.js <carpeta-de-respaldo>
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", "assets");
const BAK = process.argv[2];
const CALIDAD = 0.86;
// El juguete de la R2 es el que más grande se ve (168 px lógicos): 360 le da margen de
// sobra en pantallas grandes, y las obras de la R3 (96 px) van igual de holgadas.
const ANCHO = {};
const ANCHO_POR_DEFECTO = 360;

(async () => {
  if (!BAK) { console.error("Uso: node optimizar-j7t2.js <carpeta-de-respaldo>"); process.exit(1); }
  fs.mkdirSync(BAK, { recursive: true });
  const files = fs.readdirSync(DIR).filter((f) => /^j7t2-.*\.jpg$/i.test(f)).sort();
  if (!files.length) { console.log("No hay ilustraciones j7t2-*.jpg que optimizar."); return; }
  const br = await chromium.launch();
  const p = await br.newPage();
  let antes = 0, despues = 0;
  for (const f of files) {
    const src = path.join(DIR, f), bak = path.join(BAK, f);
    if (!fs.existsSync(bak)) fs.copyFileSync(src, bak);      // ⚠ jamás pisar el respaldo
    const b0 = fs.statSync(src).size; antes += b0;
    const dataUrl = "data:image/jpeg;base64," + fs.readFileSync(src).toString("base64");
    const out = await p.evaluate(async ([url, maxW, q]) => {
      const img = new Image();
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
      const esc = Math.min(1, maxW / img.naturalWidth);       // nunca agrandar
      const w = Math.round(img.naturalWidth * esc), h = Math.round(img.naturalHeight * esc);
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      const ctx = c.getContext("2d");
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, w, h);
      return { url: c.toDataURL("image/jpeg", q), w, h, w0: img.naturalWidth, h0: img.naturalHeight };
    }, [dataUrl, ANCHO[f] || ANCHO_POR_DEFECTO, CALIDAD]);
    const buf = Buffer.from(out.url.split(",")[1], "base64");
    fs.writeFileSync(src, buf); despues += buf.length;
    console.log(f.padEnd(24) + `${out.w0}x${out.h0} ${Math.round(b0 / 1024)} KB  →  ${out.w}x${out.h} ${Math.round(buf.length / 1024)} KB`);
  }
  console.log(`\nTotal: ${Math.round(antes / 1024)} KB → ${Math.round(despues / 1024)} KB`);
  console.log("Originales respaldados en: " + BAK);
  await br.close();
})();
