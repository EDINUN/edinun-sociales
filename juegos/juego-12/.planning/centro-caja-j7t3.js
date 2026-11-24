// ¿Está la caja de banano centrada dentro de su recuadro?
// Mide los márgenes izquierdo y derecho de la caja contra el fondo y dice cuánto se
// desvía del centro. Uso: node .planning/centro-caja-j7t3.js [archivo.jpg]
//
// 📌 La autora lo vio a ojo el 2026-11-24 ("del lado derecho tiene más espacio que del
// izquierdo"). Esto lo convierte en un número.
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path");
const ARCH = process.argv[2] || path.join(__dirname, "..", "assets", "j7t3-caja-banano.jpg");

(async () => {
  if (!fs.existsSync(ARCH)) { console.error("No existe " + ARCH); process.exit(1); }
  const br = await chromium.launch();
  const p = await br.newPage();
  const url = "data:image/jpeg;base64," + fs.readFileSync(ARCH).toString("base64");
  const r = await p.evaluate(async (url) => {
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
    const W = img.naturalWidth, H = img.naturalHeight;
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    const ctx = c.getContext("2d"); ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, W, H).data;
    const px = (x, y) => { const i = (y * W + x) * 4; return [d[i], d[i + 1], d[i + 2]]; };
    const med = (a) => a.slice().sort((x, y) => x - y)[a.length >> 1];
    // El fondo se toma de las CUATRO esquinas.
    const rr = [], gg = [], bb = [];
    for (const [x0, y0] of [[2, 2], [W - 3, 2], [2, H - 3], [W - 3, H - 3]]) {
      for (let dx = 0; dx < 6; dx++) for (let dy = 0; dy < 6; dy++) {
        const a = px(Math.min(W - 1, Math.max(0, x0 + dx)), Math.min(H - 1, Math.max(0, y0 + dy)));
        rr.push(a[0]); gg.push(a[1]); bb.push(a[2]);
      }
    }
    const fr = med(rr), fg = med(gg), fb = med(bb);
    const marca = (x, y) => { const a = px(x, y); return Math.abs(a[0] - fr) + Math.abs(a[1] - fg) + Math.abs(a[2] - fb) > 60; };
    let x0 = -1, x1 = -1, y0 = -1, y1 = -1;
    for (let x = 0; x < W && x0 < 0; x++) { let n = 0; for (let y = 0; y < H; y++) if (marca(x, y)) n++; if (n > H * 0.02) x0 = x; }
    for (let x = W - 1; x >= 0 && x1 < 0; x--) { let n = 0; for (let y = 0; y < H; y++) if (marca(x, y)) n++; if (n > H * 0.02) x1 = x; }
    for (let y = 0; y < H && y0 < 0; y++) { let n = 0; for (let x = 0; x < W; x++) if (marca(x, y)) n++; if (n > W * 0.02) y0 = y; }
    for (let y = H - 1; y >= 0 && y1 < 0; y--) { let n = 0; for (let x = 0; x < W; x++) if (marca(x, y)) n++; if (n > W * 0.02) y1 = y; }
    return { W: W, H: H, x0: x0, x1: x1, y0: y0, y1: y1, fondo: [fr, fg, fb] };
  }, url);

  const izq = r.x0, der = r.W - 1 - r.x1;
  const arriba = r.y0, abajo = r.H - 1 - r.y1;
  const desvio = Math.round((izq - der) / 2);
  console.log(path.basename(ARCH) + "  " + r.W + "x" + r.H + "   fondo rgb(" + r.fondo.join(",") + ")");
  console.log("  margen izquierdo " + izq + " px · derecho " + der + " px   → la caja está " + (desvio > 0 ? "corrida a la DERECHA " + desvio : desvio < 0 ? "corrida a la IZQUIERDA " + (-desvio) : "centrada") + " px");
  console.log("  margen arriba " + arriba + " px · abajo " + abajo + " px");
  console.log("\n" + (Math.abs(desvio) <= 3 ? "OK Centrada (3 px o menos)." : "X Descentrada: hay que reencuadrarla."));
  await br.close();
})();
