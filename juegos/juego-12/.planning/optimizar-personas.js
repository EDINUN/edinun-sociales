// Reescala las ilustraciones de personas a un tamaño razonable para pantalla.
// Llegan a 1024×1024 y se ven a 46 px: a 220 px se ven idénticas y pesan una décima.
//
// ⚠ NUNCA pisa un respaldo existente (`if (!fs.existsSync(bak))`). En juego-15 una
// segunda pasada sobrescribió los respaldos con las versiones ya reducidas y se
// perdieron los originales.
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", "assets");
const BAK = process.argv[2];                 // carpeta de respaldo (fuera del repo)
const LADO = Number(process.argv[3] || 220);
const CALIDAD = 0.86;

(async () => {
  if (!BAK) { console.error("Uso: node optimizar-personas.js <carpeta-de-respaldo> [lado]"); process.exit(1); }
  fs.mkdirSync(BAK, { recursive: true });
  const files = fs.readdirSync(DIR).filter((f) => /^persona-.*\.jpg$/i.test(f)).sort();
  if (!files.length) { console.log("No hay ilustraciones que optimizar."); return; }
  const br = await chromium.launch();
  const p = await br.newPage();
  let antes = 0, despues = 0;
  for (const f of files) {
    const src = path.join(DIR, f), bak = path.join(BAK, f);
    if (!fs.existsSync(bak)) fs.copyFileSync(src, bak);      // ⚠ jamás pisar el respaldo
    const b0 = fs.statSync(src).size; antes += b0;
    const dataUrl = "data:image/jpeg;base64," + fs.readFileSync(src).toString("base64");
    const out = await p.evaluate(async ([url, lado, q]) => {
      const img = new Image();
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
      const c = document.createElement("canvas");
      c.width = lado; c.height = lado;
      const ctx = c.getContext("2d");
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, lado, lado);
      return c.toDataURL("image/jpeg", q);
    }, [dataUrl, LADO, CALIDAD]);
    const buf = Buffer.from(out.split(",")[1], "base64");
    fs.writeFileSync(src, buf); despues += buf.length;
    console.log(f.padEnd(30), Math.round(b0 / 1024) + " KB → " + Math.round(buf.length / 1024) + " KB");
  }
  console.log("\nTOTAL " + Math.round(antes / 1024) + " KB → " + Math.round(despues / 1024) + " KB");
  console.log("Originales a 1024 px guardados en: " + BAK);
  await br.close();
})();
