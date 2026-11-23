// Recorta y reescala las ilustraciones del Libro 6 · Tema 3 (`j6t3-*.jpg`).
//
// Llegan a 1376×768 (16:9) con la figura pequeña en el centro, de pie sobre un piso de
// madera y contra una pared lisa. Tal cual, en el recuadro del juego la persona se vería
// diminuta entre metros de pared. Este script BUSCA la figura y recorta a su alrededor,
// dejando un 3:4 vertical de 330×440.
//
// Cómo la encuentra, sin librerías de imagen:
//   1. Mira SOLO la franja de la PARED (del 12 % al 55 % de alto): ahí el fondo es liso y
//      la figura resalta. El piso de madera queda fuera a propósito: tiene vetas y
//      sombras que se marcan como si fueran la persona (ese fue el primer intento y daba
//      cajas del ancho entero).
//   2. Para cada fila toma como color de fondo la MEDIANA de la fila entera (la pared
//      ocupa mucho más que la figura) y marca los píxeles que se apartan de él.
//   3. La figura es la RACHA DE COLUMNAS marcadas más ancha; se ignora el ruido suelto.
//   4. Los pies se buscan hacia abajo dentro de esa franja de columnas.
//
// ⚠ NUNCA pisa un respaldo existente (`if (!fs.existsSync(bak))`): en juego-15 una
// segunda pasada se comió los originales.
//
// Uso: node optimizar-j6t3.js <carpeta-de-respaldo>
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", "assets");
const BAK = process.argv[2];
const ANCHO = 330, ALTO = 440, CALIDAD = 0.86;

(async () => {
  if (!BAK) { console.error("Uso: node optimizar-j6t3.js <carpeta-de-respaldo>"); process.exit(1); }
  fs.mkdirSync(BAK, { recursive: true });
  const files = fs.readdirSync(DIR).filter((f) => /^j6t3-.*\.jpg$/i.test(f)).sort();
  if (!files.length) { console.log("No hay ilustraciones j6t3-* que optimizar."); return; }
  const br = await chromium.launch();
  const p = await br.newPage();
  let antes = 0, despues = 0;
  for (const f of files) {
    const src = path.join(DIR, f), bak = path.join(BAK, f);
    if (!fs.existsSync(bak)) fs.copyFileSync(src, bak);
    const b0 = fs.statSync(src).size; antes += b0;
    const dataUrl = "data:image/jpeg;base64," + fs.readFileSync(src).toString("base64");
    const out = await p.evaluate(async ([url, ANCHO, ALTO, q]) => {
      const img = new Image();
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
      const W = img.naturalWidth, H = img.naturalHeight;
      const c = document.createElement("canvas");
      c.width = W; c.height = H;
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, W, H).data;
      const px = (x, y) => { const i = (y * W + x) * 4; return [d[i], d[i + 1], d[i + 2]]; };
      const mediana = (a) => a.slice().sort((x, y) => x - y)[a.length >> 1];
      const fondoDeFila = (y) => {
        const rr = [], gg = [], bb = [];
        for (let x = 0; x < W; x += 4) { const a = px(x, y); rr.push(a[0]); gg.push(a[1]); bb.push(a[2]); }
        return [mediana(rr), mediana(gg), mediana(bb)];
      };
      const difiere = (x, y, fondo, umbral) => {
        const a = px(x, y);
        return Math.abs(a[0] - fondo[0]) + Math.abs(a[1] - fondo[1]) + Math.abs(a[2] - fondo[2]) > umbral;
      };

      // ── 1. La figura, contra la pared ──
      const yA = Math.round(H * 0.12), yB = Math.round(H * 0.55);
      const col = new Array(W).fill(0);
      for (let y = yA; y < yB; y++) {
        const fondo = fondoDeFila(y);
        for (let x = 0; x < W; x++) if (difiere(x, y, fondo, 60)) col[x]++;
      }
      const minCol = (yB - yA) * 0.18;                 // columna "de figura"
      let mejor = null, ini = -1;
      for (let x = 0; x <= W; x++) {
        const dentro = x < W && col[x] >= minCol;
        if (dentro && ini < 0) ini = x;
        if (!dentro && ini >= 0) {
          const hueco = x - ini;
          if (!mejor || hueco > mejor[1] - mejor[0]) mejor = [ini, x - 1];
          ini = -1;
        }
      }
      if (!mejor) return null;
      let [x0, x1] = mejor;

      // ── 2. La cabeza y los pies, dentro de esa franja ──
      const marcadosEnFila = (y, umbral) => {
        const fondo = fondoDeFila(y);
        let n = 0;
        for (let x = x0; x <= x1; x++) if (difiere(x, y, fondo, umbral)) n++;
        return n;
      };
      let y0 = yA;
      for (let y = Math.round(H * 0.02); y < yB; y++) { if (marcadosEnFila(y, 60) > (x1 - x0) * 0.08) { y0 = y; break; } }
      // Los pies: desde abajo, el calzado se aparta del color del piso de su propia fila.
      let y1 = Math.round(H * 0.96);
      for (let y = H - 2; y > H * 0.5; y--) { if (marcadosEnFila(y, 55) > (x1 - x0) * 0.05) { y1 = y; break; } }

      // ── 3. Caja + aire, ajustada a 3:4 sin deformar ──
      const anchoFig = x1 - x0, altoFig = y1 - y0;
      let cx0 = x0 - anchoFig * 0.18, cx1 = x1 + anchoFig * 0.18;
      let cy0 = y0 - altoFig * 0.07, cy1 = y1 + altoFig * 0.04;
      const necesarioW = (cy1 - cy0) * (ANCHO / ALTO);
      if (cx1 - cx0 < necesarioW) { const m = (cx0 + cx1) / 2; cx0 = m - necesarioW / 2; cx1 = m + necesarioW / 2; }
      else { const necesarioH = (cx1 - cx0) * (ALTO / ANCHO); const m = (cy0 + cy1) / 2; cy0 = m - necesarioH / 2; cy1 = m + necesarioH / 2; }
      // Si se sale del lienzo, se corre en vez de encoger (así no cambia la proporción).
      if (cx0 < 0) { cx1 -= cx0; cx0 = 0; }
      if (cx1 > W) { cx0 -= cx1 - W; cx1 = W; }
      if (cy0 < 0) { cy1 -= cy0; cy0 = 0; }
      if (cy1 > H) { cy0 -= cy1 - H; cy1 = H; }
      cx0 = Math.max(0, Math.round(cx0)); cy0 = Math.max(0, Math.round(cy0));
      cx1 = Math.min(W, Math.round(cx1)); cy1 = Math.min(H, Math.round(cy1));

      const o = document.createElement("canvas");
      o.width = ANCHO; o.height = ALTO;
      const octx = o.getContext("2d");
      octx.imageSmoothingQuality = "high";
      octx.drawImage(img, cx0, cy0, cx1 - cx0, cy1 - cy0, 0, 0, ANCHO, ALTO);
      return { url: o.toDataURL("image/jpeg", q), fig: [x0, y0, x1, y1], recorte: [cx0, cy0, cx1, cy1] };
    }, [dataUrl, ANCHO, ALTO, CALIDAD]);
    if (!out) { console.log(f.padEnd(24) + "  ✗ no se encontró la figura: se deja igual"); continue; }
    const buf = Buffer.from(out.url.split(",")[1], "base64");
    fs.writeFileSync(src, buf); despues += buf.length;
    console.log(f.padEnd(24) + Math.round(b0 / 1024) + " KB → " + Math.round(buf.length / 1024) + " KB   figura x[" + out.fig[0] + "-" + out.fig[2] + "] y[" + out.fig[1] + "-" + out.fig[3] + "]  recorte " + out.recorte.join(","));
  }
  console.log("\nTotal: " + Math.round(antes / 1024) + " KB → " + Math.round(despues / 1024) + " KB");
  console.log("Respaldo de los originales en: " + BAK);
  await br.close();
})();
