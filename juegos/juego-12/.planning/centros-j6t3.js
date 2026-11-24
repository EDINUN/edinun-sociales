// ¿Están las doce ilustraciones del Tema 3 centradas dentro de su recuadro?
// Mide en la imagen YA recortada: toma el color de la pared en las esquinas de arriba,
// busca la silueta entre el 8 % y el 55 % del alto (más abajo cruza el piso y mancharía
// la medida) y compara su centro con el centro del recuadro.
// Es la MISMA medida que usa `optimizar-j6t3.js` para corregirse, así que los números
// de los dos tienen que coincidir.
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", "assets");
const TOLERANCIA = 12;   // píxeles sobre 330 de ancho

(async () => {
  const br = await chromium.launch();
  const p = await br.newPage();
  const malas = [];
  for (const f of fs.readdirSync(DIR).filter((x) => /^j6t3-.*\.jpg$/.test(x)).sort()) {
    const url = "data:image/jpeg;base64," + fs.readFileSync(path.join(DIR, f)).toString("base64");
    const r = await p.evaluate(async (url) => {
      const img = new Image();
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
      const W = img.naturalWidth, H = img.naturalHeight;
      const c = document.createElement("canvas"); c.width = W; c.height = H;
      const ctx = c.getContext("2d"); ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, W, H).data;
      const px = (x, y) => { const i = (y * W + x) * 4; return [d[i], d[i + 1], d[i + 2]]; };
      const med = (a) => a.slice().sort((x, y) => x - y)[a.length >> 1];
      const rr = [], gg = [], bb = [];
      for (let y = 2; y < Math.round(H * 0.07); y++) for (const x of [3, 5, 7, W - 8, W - 6, W - 4]) { const a = px(x, y); rr.push(a[0]); gg.push(a[1]); bb.push(a[2]); }
      const fr = med(rr), fg = med(gg), fb = med(bb);
      const marca = (x, y) => { const a = px(x, y); return Math.abs(a[0] - fr) + Math.abs(a[1] - fg) + Math.abs(a[2] - fb) > 70; };
      // ⚠ Se mide LA CABEZA: la silueta entera incluye la mesita, el saco o el vuelo de
      // una falda, y eso corre el centro. Mirando las imágenes se veía que el número
      // decía "centrada" con la persona pegada a un lado.
      let yTop = -1;
      for (let y = 2; y < Math.round(H * 0.5) && yTop < 0; y++) {
        let n = 0;
        for (let x = 4; x < W - 4; x++) if (marca(x, y)) n++;
        if (n >= 3) yTop = y;
      }
      const yFin = Math.min(H - 2, (yTop < 0 ? 0 : yTop) + Math.round(H * 0.14));
      let suma = 0, peso = 0;
      for (let y = Math.max(0, yTop); y < yFin; y++) for (let x = 3; x < W - 3; x++) if (marca(x, y)) { suma += x; peso++; }
      return { centro: peso ? Math.round(suma / peso) : Math.round(W / 2), medio: Math.round(W / 2) };
    }, url);
    const desvio = r.centro - r.medio;
    if (Math.abs(desvio) > TOLERANCIA) malas.push(f + " (" + (desvio > 0 ? "+" : "") + desvio + " px)");
    console.log(f.padEnd(22) + "centro " + String(r.centro).padStart(4) + " / " + r.medio + "   desvío " + (desvio > 0 ? "+" : "") + desvio + (Math.abs(desvio) > TOLERANCIA ? "   ✗" : ""));
  }
  console.log("\n" + (malas.length ? "X Descentradas: " + malas.join(" · ") : "OK Las doce quedan centradas (desvío de " + TOLERANCIA + " px o menos)."));
  await br.close();
})();
