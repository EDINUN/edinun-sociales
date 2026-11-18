// Detector de SOLAPES (y desbordes) del Libro 6 · Tema 2 de juego-12 (Revolución Marcista), sobre el DOM real.
// Mide, en 5 viewports y en las 3 rondas ANTES y DESPUÉS de verificar:
//   · que nada de la mecánica se salga del lienzo 900×540,
//   · que nada invada la columna de acciones (¡VERIFICAR! / REINICIAR / SALIR),
//   · que no haya texto recortado (scrollWidth > clientWidth),
//   · que no se solapen dos cajas visibles ni dos textos.
// Qué cuenta como caja: botones, cajas con fondo o borde, y elementos de TEXTO HOJA
// (los que no contienen otro elemento) — así se detecta también texto encima de texto,
// que es la queja real del revelado. Descartes a propósito: un elemento que contiene a
// otro de la lista se omite (un span dentro de su botón SIEMPRE se solapa con él), y lo
// que está dentro de un contenedor con overflow:hidden se mide contra ese recorte.
// Siempre informa CUÁNTOS elementos midió: "✓ sin solapes" sobre 0 elementos no prueba nada.
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8898;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });
const VIEWPORTS = [[1280, 800], [1024, 640], [1440, 900], [900, 560], [1600, 1000]];
const CIUDADANOS = ["Don Ramón", "Don Tomás", "Capitán Vargas", "Padre Ignacio"];

async function medir(p, etiqueta, fallos) {
  const r = await p.evaluate(() => {
    const zona = Array.from(document.querySelectorAll("div")).find((d) => d.style && d.style.left === "215px" && d.style.right === "215px");
    const acciones = Array.from(document.querySelectorAll("button")).filter((b) => /VERIFICAR|REINICIAR|SALIR/.test(b.textContent));
    const stage = Array.from(document.querySelectorAll("div")).find((d) => d.style && d.style.width === "900px" && d.style.height === "540px") || document.body;
    const sr = stage.getBoundingClientRect();
    const accL = acciones.length ? Math.min.apply(null, acciones.map((b) => b.getBoundingClientRect().left)) : Infinity;
    if (!zona) return { err: "no se encontro el carril de la mecanica (left:215/right:215)" };
    const pintada = (e) => { const s = getComputedStyle(e); return (s.backgroundColor && s.backgroundColor !== "rgba(0, 0, 0, 0)" && s.backgroundColor !== "transparent") || parseFloat(s.borderTopWidth) > 0 || parseFloat(s.borderBottomWidth) > 0; };
    const hojaTexto = (e) => e.children.length === 0 && (e.textContent || "").trim().length > 0;
    let cand = Array.from(zona.querySelectorAll("*")).filter((e) => {
      if (e.tagName === "IMG" || e.closest("svg")) return false;
      const s = getComputedStyle(e);
      if (s.visibility === "hidden" || s.display === "none" || parseFloat(s.opacity) < 0.05) return false;
      // ⚠ La opacidad NO se hereda como valor calculado: un hijo de un contenedor con
      // opacity:0 sigue diciendo opacity:1 aunque no se vea nada. Hay que mirar arriba.
      for (let n = e.parentElement; n && n !== document.body; n = n.parentElement) {
        if (parseFloat(getComputedStyle(n).opacity) < 0.05) return false;
      }
      const b = e.getBoundingClientRect();
      if (b.width <= 2 || b.height <= 2) return false;
      return e.tagName === "BUTTON" || e.hasAttribute("data-hueco") || hojaTexto(e) || pintada(e);
    });
    cand = cand.filter((e) => !cand.some((o) => o !== e && e.contains(o)));
    const recorte = (e) => { let n = e.parentElement; while (n && n !== document.body) { if (getComputedStyle(n).overflow === "hidden") return n.getBoundingClientRect(); n = n.parentElement; } return null; };
    const cajas = cand.map((e) => {
      const b = e.getBoundingClientRect(), c = recorte(e);
      const x = c ? Math.max(b.left, c.left) : b.left, rr = c ? Math.min(b.right, c.right) : b.right;
      const y = c ? Math.max(b.top, c.top) : b.top, bo = c ? Math.min(b.bottom, c.bottom) : b.bottom;
      return { t: (e.textContent || "").replace(/\s+/g, " ").trim().slice(0, 26) || "<" + e.tagName.toLowerCase() + ">", x, y, r: rr, b: bo, vis: rr - x > 2 && bo - y > 2, cut: e.scrollWidth > e.clientWidth + 1 };
    }).filter((c) => c.vis);
    const fuera = cajas.filter((c) => c.x < sr.left - 1 || c.r > sr.right + 1 || c.y < sr.top - 1 || c.b > sr.bottom + 1);
    const invaden = cajas.filter((c) => c.r > accL + 1);
    const cortados = cajas.filter((c) => c.cut);
    const solapes = [];
    for (let i = 0; i < cajas.length; i++) for (let j = i + 1; j < cajas.length; j++) {
      const a = cajas[i], b = cajas[j];
      const ox = Math.min(a.r, b.r) - Math.max(a.x, b.x), oy = Math.min(a.b, b.b) - Math.max(a.y, b.y);
      if (ox > 2 && oy > 2) solapes.push(a.t + " <-> " + b.t + " (" + Math.round(ox) + "x" + Math.round(oy) + ")");
    }
    const derecha = cajas.length ? Math.max.apply(null, cajas.map((c) => c.r)) : 0;
    return { n: cajas.length, fuera: fuera.map((c) => c.t), invaden: invaden.map((c) => c.t), cortados: cortados.map((c) => c.t), solapes, colchon: Math.round(accL - derecha) };
  });
  if (r.err) { fallos.push(etiqueta + " -> " + r.err); return etiqueta + ": X " + r.err; }
  if (r.n === 0) { fallos.push(etiqueta + " -> midio 0 elementos (la comprobacion no prueba nada)"); return etiqueta + ": X 0 elementos medidos"; }
  const malo = r.fuera.length || r.invaden.length || r.cortados.length || r.solapes.length;
  if (malo) fallos.push(etiqueta + " -> fuera:[" + r.fuera + "] invaden:[" + r.invaden + "] cortados:[" + r.cortados + "] solapes:[" + r.solapes.join(" · ") + "]");
  return etiqueta + ": " + r.n + " elementos · colchon " + r.colchon + " px" + (malo ? "  X" : "  OK");
}

(async () => {
  srv.listen(PORT);
  const br = await chromium.launch();
  const fallos = [];
  for (const [w, h] of VIEWPORTS) {
    const et = w + "x" + h;
    const p = await (await br.newContext({ viewport: { width: w, height: h } })).newPage();
    p.on("pageerror", (e) => fallos.push(et + " pageerror: " + e.message));
    await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
    await p.waitForSelector("button:has-text('Libro 6')");
    await p.click("button:has-text('Libro 6')");
    await p.click("button:has-text('La Revolución Marcista')");
    await p.fill("input.ed-input", "QA");
    await p.click("button:has-text('ENTRAR')");
    await p.waitForTimeout(500);
    const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(700); }

    // R1 "La bandera de marzo"
    await p.waitForSelector("text=Levanta la bandera");
    console.log(await medir(p, et + " R1 antes", fallos));
    for (const c of ["blanco", "azul", "blanco"]) { const b = await p.$(`button:has-text('${c}')`); await b.click(); await p.waitForTimeout(90); }
    const mas = await p.$("button:has-text('+')"); for (let i = 0; i < 3; i++) { await mas.click(); await p.waitForTimeout(60); }
    console.log(await medir(p, et + " R1 armada", fallos));
    await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(900);
    console.log(await medir(p, et + " R1 revelado", fallos));
    await p.waitForTimeout(3500);

    // R2 "El Ecuador partido"
    await p.waitForSelector("text=cuatro gobiernos a la vez");
    console.log(await medir(p, et + " R2 antes", fallos));
    for (const c of ["Quito", "Guayaquil", "Cuenca", "Loja"]) {
      const pt = await p.evaluate((c) => { const t = Array.from(document.querySelectorAll("text")).find((x) => x.textContent.trim() === c); const g = t && t.closest("g"); if (!g) return null; const r = g.getBoundingClientRect(); return { x: r.left + 8, y: r.top + r.height / 2 }; }, c);
      if (pt) { await p.mouse.click(pt.x, pt.y); await p.waitForTimeout(150); }
    }
    console.log(await medir(p, et + " R2 llena", fallos));
    await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(900);
    console.log(await medir(p, et + " R2 revelado", fallos));
    await p.waitForTimeout(3500);

    // R3 "La Carta de la Esclavitud"
    await p.waitForSelector("text=cayeron con la revolución");
    console.log(await medir(p, et + " R3 antes", fallos));
    for (let k = 0; k < 3; k++) {
      const caja = await p.evaluate(() => { const f = Array.from(document.querySelectorAll("div")).filter((d) => d.style && d.style.touchAction === "none" && d.textContent.trim().indexOf("▸") === 0 && getComputedStyle(d).opacity !== "0")[0]; if (!f) return null; const r = f.getBoundingClientRect(); return { x: r.left + 12, y: r.top + r.height / 2, w: r.width }; });
      if (!caja) break;
      await p.mouse.move(caja.x, caja.y); await p.mouse.down();
      await p.mouse.move(caja.x + caja.w * 0.95, caja.y, { steps: 10 });
      await p.mouse.up(); await p.waitForTimeout(300);
    }
    console.log(await medir(p, et + " R3 rota", fallos));
    await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(900);
    console.log(await medir(p, et + " R3 revelado", fallos));

    await p.close();
  }
  console.log("\n" + (fallos.length ? "X PROBLEMAS:\n" + fallos.join("\n") : "OK Sin solapes, sin desbordes, sin invasion de la columna de acciones y sin textos recortados."));
  await br.close(); srv.close();
})();
