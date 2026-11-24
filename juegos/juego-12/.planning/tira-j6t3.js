// Hoja de contacto de las 12 ilustraciones del Tema 3, cada una con una LÍNEA ROJA en el
// centro de su recuadro. Uso: node tira-j6t3.js <archivo.png>
//
// 📌 Por qué existe: `centros-j6t3.js` da un número por imagen, y un número puede mentir.
// Midiendo la silueta entera decía "centrada" con el cuerpo pegado a un borde, porque la
// mesita de la oficinista o el saco del portuario entran en la silueta. La autora lo vio
// a ojo antes que cualquier medida. Doce imágenes en fila con su eje marcado se juzgan de
// un vistazo; doce números, no.
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", "assets");
const OUT = process.argv[2];

(async () => {
  if (!OUT) { console.error("Uso: node tira-j6t3.js <archivo.png>"); process.exit(1); }
  const files = fs.readdirSync(DIR).filter((x) => /^j6t3-.*\.jpg$/.test(x)).sort();
  if (!files.length) { console.error("No hay ilustraciones j6t3-*."); process.exit(1); }
  const urls = files.map((f) => "data:image/jpeg;base64," + fs.readFileSync(path.join(DIR, f)).toString("base64"));
  const br = await chromium.launch();
  const p = await br.newPage();
  const dataUrl = await p.evaluate(async ({ urls, files }) => {
    const COL = 4, W = 165, H = 220, PIE = 16;
    const filas = Math.ceil(urls.length / COL);
    const c = document.createElement("canvas");
    c.width = COL * W; c.height = filas * (H + PIE);
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#123"; ctx.fillRect(0, 0, c.width, c.height);
    for (let i = 0; i < urls.length; i++) {
      const img = new Image();
      await new Promise((res) => { img.onload = res; img.src = urls[i]; });
      const x = (i % COL) * W, y = Math.floor(i / COL) * (H + PIE);
      ctx.drawImage(img, x, y, W, H);
      ctx.strokeStyle = "rgba(255,0,0,0.9)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x + W / 2, y); ctx.lineTo(x + W / 2, y + H); ctx.stroke();
      ctx.fillStyle = "#fff"; ctx.font = "11px sans-serif"; ctx.textAlign = "center";
      ctx.fillText(files[i].replace("j6t3-", "").replace(".jpg", ""), x + W / 2, y + H + 12);
    }
    return c.toDataURL("image/png");
  }, { urls, files });
  fs.writeFileSync(OUT, Buffer.from(dataUrl.split(",")[1], "base64"));
  console.log("hoja de contacto en " + OUT + "  (" + files.length + " ilustraciones)");
  await br.close();
})();
