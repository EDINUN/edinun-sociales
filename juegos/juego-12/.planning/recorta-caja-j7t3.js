// Reencuadra la caja de banano del Tema 3 dejándola CENTRADA y pegada a sus bordes.
//
// 📌 La autora vio el 2026-11-24 que la caja tenía más fondo a un lado que al otro. Medido
// con `centro-caja-j7t3.js`: 13 px de fondo a la izquierda contra 4 a la derecha. Como la
// caja se apila en columnas, cualquier descuadre se repite diez veces y se nota.
//
// Qué hace: busca la caja contra el fondo, recorta a su silueta con un margen IGUAL a los
// cuatro lados y guarda a lo ancho que se le pida. No toca el original.
// Uso: node .planning/recorta-caja-j7t3.js <origen.jpg> [ancho=260]
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path");
const ORIGEN = process.argv[2];
const ANCHO = parseInt(process.argv[3] || "260", 10);
// ⚠ Margen en % del lado mayor. 0 = a ras: en ESTE original la caja ya toca el borde
//   derecho, así que cualquier margen solo puede añadirse por la izquierda y la deja
//   descentrada. Fue lo que vio la autora.
const MARGEN = parseFloat(process.argv[4] || "0");
const DESTINO = path.join(__dirname, "..", "assets", "j7t3-caja-banano.jpg");

(async () => {
  if (!ORIGEN || !fs.existsSync(ORIGEN)) { console.error("Uso: node recorta-caja-j7t3.js <origen.jpg> [ancho]"); process.exit(1); }
  const br = await chromium.launch();
  const p = await br.newPage();
  const url = "data:image/jpeg;base64," + fs.readFileSync(ORIGEN).toString("base64");
  const out = await p.evaluate(async ({ url, ANCHO, MARGEN }) => {
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
    const W = img.naturalWidth, H = img.naturalHeight;
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    const ctx = c.getContext("2d"); ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, W, H).data;
    const px = (x, y) => { const i = (y * W + x) * 4; return [d[i], d[i + 1], d[i + 2]]; };
    const med = (a) => a.slice().sort((x, y) => x - y)[a.length >> 1];
    const rr = [], gg = [], bb = [];
    for (const [x0, y0] of [[2, 2], [W - 8, 2], [2, H - 8], [W - 8, H - 8]]) {
      for (let dx = 0; dx < 6; dx++) for (let dy = 0; dy < 6; dy++) { const a = px(x0 + dx, y0 + dy); rr.push(a[0]); gg.push(a[1]); bb.push(a[2]); }
    }
    const fr = med(rr), fg = med(gg), fb = med(bb);
    const marca = (x, y) => { const a = px(x, y); return Math.abs(a[0] - fr) + Math.abs(a[1] - fg) + Math.abs(a[2] - fb) > 60; };
    // ⚠ NO se recorta por el contorno extremo: la SOMBRA de la caja llega hasta el borde
    //   del lienzo y hacía creer que no sobraba fondo, mientras que arriba a la derecha
    //   el 62 % de cada columna era fondo claro — la banda blanca que vio la autora.
    //   Se recorta por el CUERPO: columnas (y filas) donde la caja ocupa al menos el 45 %.
    const colLlena = (x) => { let n = 0; for (let y = 0; y < H; y++) if (marca(x, y)) n++; return n / H; };
    const filLlena = (y) => { let n = 0; for (let x = 0; x < W; x++) if (marca(x, y)) n++; return n / W; };
    const MIN = 0.45;
    let x0 = 0, x1 = W - 1, y0 = 0, y1 = H - 1;
    while (x0 < W && colLlena(x0) < MIN) x0++;
    while (x1 > x0 && colLlena(x1) < MIN) x1--;
    while (y0 < H && filLlena(y0) < MIN) y0++;
    while (y1 > y0 && filLlena(y1) < MIN) y1--;
    // Margen igual a los cuatro lados: 2 % del lado mayor de la caja.
    const m = Math.round(Math.max(x1 - x0, y1 - y0) * MARGEN);
    const cx0 = Math.max(0, x0 - m), cx1 = Math.min(W - 1, x1 + m);
    const cy0 = Math.max(0, y0 - m), cy1 = Math.min(H - 1, y1 + m);
    const cw = cx1 - cx0 + 1, ch = cy1 - cy0 + 1;
    const alto = Math.round((ch / cw) * ANCHO);
    const o = document.createElement("canvas"); o.width = ANCHO; o.height = alto;
    const oc = o.getContext("2d");
    oc.imageSmoothingQuality = "high";
    oc.drawImage(img, cx0, cy0, cw, ch, 0, 0, ANCHO, alto);
    return { data: o.toDataURL("image/jpeg", 0.88), W: W, H: H, caja: [x0, y0, x1, y1], salida: [ANCHO, alto] };
  }, { url, ANCHO, MARGEN });

  fs.writeFileSync(DESTINO, Buffer.from(out.data.split(",")[1], "base64"));
  console.log("origen " + out.W + "x" + out.H + " · caja en x " + out.caja[0] + "-" + out.caja[2] + ", y " + out.caja[1] + "-" + out.caja[3]);
  console.log("guardado " + out.salida.join("x") + " en assets/j7t3-caja-banano.jpg (" + Math.round(fs.statSync(DESTINO).size / 1024) + " KB)");
  await br.close();
})();
