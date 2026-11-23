// Detector de SOLAPES sobre el LIENZO ENTERO (900x540) del LIBRO 7 · TEMA 1. Mismo
// criterio que `espacios-todo.js` (que cubre el Libro 6): entran el personaje y su
// bocadillo, el logo, el reloj, el contador, el bloque RONDA, la columna de acciones y la
// mecánica, todos contra todos, en 5 tamaños de ventana.
//
// Se mide en reposo, EN MITAD DEL ARRASTRE de la R1 (que es cuando aparece la pieza que
// va pegada al dedo) y con el REVELADO puesto en las tres rondas, que es el estado con
// más texto en pantalla.
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8904;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });
const VIEWPORTS = [[1280, 800], [1024, 640], [1440, 900], [900, 560], [1600, 1000]];

async function medir(p, etiqueta, fallos) {
  const r = await p.evaluate(() => {
    const stage = Array.from(document.querySelectorAll("div")).find((d) => d.style && d.style.width === "900px" && d.style.height === "540px");
    if (!stage) return { err: "no se encontró el lienzo 900x540" };
    const sr = stage.getBoundingClientRect();
    const hojaTexto = (e) => e.children.length === 0 && (e.textContent || "").trim().length > 0;
    const invisible = (e) => {
      for (let n = e; n && n !== document.body; n = n.parentElement) {
        const s = getComputedStyle(n);
        if (s.visibility === "hidden" || s.display === "none" || parseFloat(s.opacity) < 0.05) return true;
      }
      return false;
    };
    // La pieza que va PEGADA AL DEDO se solapa con el tablero a propósito: lo que la
    // distingue es estar LEVANTADA sobre todo lo demás (z-index >= 50).
    const enLaMano = (e) => {
      for (let n = e; n && n !== document.body; n = n.parentElement) {
        if (parseInt(getComputedStyle(n).zIndex || "0", 10) >= 50) return true;
      }
      return false;
    };
    let cand = Array.from(stage.querySelectorAll("*")).filter((e) => {
      if (e.tagName === "IMG" || e.closest("svg")) return false;
      if (invisible(e) || enLaMano(e)) return false;
      const b = e.getBoundingClientRect();
      if (b.width <= 2 || b.height <= 2) return false;
      if (e.tagName === "BUTTON") {
        const s2 = getComputedStyle(e);
        const pintado = (s2.backgroundColor && s2.backgroundColor !== "rgba(0, 0, 0, 0)") || parseFloat(s2.borderTopWidth) > 0;
        if (!(e.textContent || "").trim() && !pintado) return false;
        return true;
      }
      return hojaTexto(e);
    });
    cand = cand.filter((e) => !cand.some((o) => o !== e && e.contains(o)));
    const recorte = (e) => { let n = e.parentElement; while (n && n !== document.body) { if (getComputedStyle(n).overflow === "hidden") return n.getBoundingClientRect(); n = n.parentElement; } return null; };
    const cajas = cand.map((e) => {
      const b = e.getBoundingClientRect(), c = recorte(e);
      const x = c ? Math.max(b.left, c.left) : b.left, rr = c ? Math.min(b.right, c.right) : b.right;
      const y = c ? Math.max(b.top, c.top) : b.top, bo = c ? Math.min(b.bottom, c.bottom) : b.bottom;
      const enLinea = getComputedStyle(e).display.indexOf("inline") >= 0;
      return { t: (e.textContent || "").replace(/\s+/g, " ").trim().slice(0, 24) || "<" + e.tagName.toLowerCase() + ">", x, y, r: rr, b: bo, padre: e.parentElement, enLinea, vis: rr - x > 2 && bo - y > 2, cut: e.scrollWidth > e.clientWidth + 1 };
    }).filter((c) => c.vis);
    const fuera = cajas.filter((c) => c.x < sr.left - 1 || c.r > sr.right + 1 || c.y < sr.top - 1 || c.b > sr.bottom + 1);
    const cortados = cajas.filter((c) => c.cut);
    const solapes = [];
    for (let i = 0; i < cajas.length; i++) for (let j = i + 1; j < cajas.length; j++) {
      const a = cajas[i], b = cajas[j];
      const ox = Math.min(a.r, b.r) - Math.max(a.x, b.x), oy = Math.min(a.b, b.b) - Math.max(a.y, b.y);
      if (a.enLinea && b.enLinea && a.padre === b.padre) continue;   // trozos de la misma frase
      if (ox > 2 && oy > 2) solapes.push(a.t + " <-> " + b.t + " (" + Math.round(ox) + "x" + Math.round(oy) + ")");
    }
    return { n: cajas.length, fuera: fuera.map((c) => c.t), cortados: cortados.map((c) => c.t), solapes };
  });
  if (r.err) { fallos.push(etiqueta + " -> " + r.err); return etiqueta + ": X " + r.err; }
  if (r.n < 6) { fallos.push(etiqueta + " -> solo " + r.n + " elementos medidos (no prueba nada)"); return etiqueta + ": X " + r.n + " elementos"; }
  const malo = r.fuera.length || r.cortados.length || r.solapes.length;
  if (malo) fallos.push(etiqueta + " -> fuera:[" + r.fuera + "] cortados:[" + r.cortados + "] solapes:[" + r.solapes.join(" · ") + "]");
  return etiqueta + ": " + r.n + " elementos" + (malo ? "  X" : "  OK");
}

async function abrir(p) {
  await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
  // ⚠ 60 s: en frío el navegador baja React + Babel Standalone del CDN.
  await p.waitForSelector("button:has-text('Libro 7')", { timeout: 60000 });
  await p.click("button:has-text('Libro 7')");
  await p.fill("input.ed-input", "QA");
  await p.click("button:has-text('ENTRAR')");
  await p.waitForTimeout(500);
  const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(700); }
}

(async () => {
  srv.listen(PORT);
  const br = await chromium.launch();
  const fallos = [];
  for (const [w, h] of VIEWPORTS) {
    const et = w + "x" + h;
    const p = await (await br.newContext({ viewport: { width: w, height: h } })).newPage();
    p.on("pageerror", (e) => fallos.push(et + " pageerror: " + e.message));
    await abrir(p);

    // ── R1 · la vía ──
    await p.waitForSelector("text=Ordena los hechos");
    console.log(await medir(p, et + " R1 antes", fallos));
    const cards = await p.$$('[data-qa="via"]');
    const bb = await cards[0].boundingBox();
    await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2);
    await p.mouse.down();
    await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height * 2, { steps: 6 });
    console.log(await medir(p, et + " R1 EN PLENO ARRASTRE", fallos));
    await p.mouse.up(); await p.waitForTimeout(300);
    await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(1200);
    console.log(await medir(p, et + " R1 revelado", fallos));
    await p.waitForTimeout(3600);

    // ── R2 · la balanza ──
    await p.waitForSelector("text=en manos de quién");
    console.log(await medir(p, et + " R2 antes", fallos));
    // Todo al mismo platillo: es el reparto más desequilibrado, el que más inclina la
    // viga y el que deja el revelado más largo (cuatro fallos).
    for (let k = 0; k < 5; k++) { await p.click('[data-qa="plat-est"]'); await p.waitForTimeout(140); }
    console.log(await medir(p, et + " R2 llena", fallos));
    await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(1000);
    console.log(await medir(p, et + " R2 revelado", fallos));
    await p.waitForTimeout(3600);

    // ── R3 · los expedientes ──
    await p.waitForSelector("text=Descubre de qué hecho");
    console.log(await medir(p, et + " R3 antes", fallos));
    for (let k = 0; k < 3; k++) {
      const tabs = await p.$$('[data-qa="exp"]');
      await tabs[k].click(); await p.waitForTimeout(130);
      // Las tres pistas destapadas: es el expediente con más texto posible.
      for (let d = 0; d < 2; d++) { const bt = await p.$("button:has-text('DESTAPAR')"); if (bt) { await bt.click(); await p.waitForTimeout(110); } }
      const ops = await p.$$('[data-qa="op"]');
      await ops[0].click(); await p.waitForTimeout(130);
    }
    console.log(await medir(p, et + " R3 con las 3 pistas", fallos));
    await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(1000);
    console.log(await medir(p, et + " R3 revelado", fallos));
    await p.close();
  }
  console.log("\n" + (fallos.length ? "X PROBLEMAS:\n" + fallos.join("\n") : "OK Libro 7 · Tema 1: lienzo entero, 3 rondas, en reposo, en pleno arrastre y con el revelado puesto — nada superpuesto, nada fuera del lienzo y ningún texto recortado."));
  await br.close(); srv.close();
  process.exit(fallos.length ? 1 : 0);
})();
