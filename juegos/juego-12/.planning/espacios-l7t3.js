// ¿Hay algo superpuesto, cortado o fuera del lienzo en el Libro 7 · Tema 3?
// Mide el lienzo 900×540 completo en varios viewports y en los PEORES estados de cada
// ronda, no solo al entrar:
//   R1 vacía · R1 con los 8 soldados puestos · R1 revelada
//   R2 vacía · R2 con las columnas llenas (10 cajas) · R2 revelada
//   R3 sin encender · R3 con las cinco encendidas · R3 revelada
// Mismo medidor que `espacios-todo.js`.
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8922;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });
const VIEWPORTS = [[900, 560], [1280, 800], [1920, 1080]];

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
      if (a.enLinea && b.enLinea && a.padre === b.padre) continue;
      if (ox > 2 && oy > 2) solapes.push(a.t + " <-> " + b.t + " (" + Math.round(ox) + "x" + Math.round(oy) + ")");
    }
    return { n: cajas.length, fuera: fuera.map((c) => c.t), cortados: cortados.map((c) => c.t), solapes: solapes.slice(0, 5) };
  });
  if (r.err) { fallos.push(etiqueta + " -> " + r.err); return etiqueta + ": " + r.err; }
  const mal = r.fuera.length || r.cortados.length || r.solapes.length;
  if (mal) fallos.push(etiqueta + " -> fuera:[" + r.fuera + "] cortados:[" + r.cortados + "] solapes:[" + r.solapes + "]");
  return etiqueta.padEnd(42) + r.n + " elementos  " + (mal ? "✗" : "OK");
}

(async () => {
  srv.listen(PORT);
  const br = await chromium.launch();
  const fallos = [];
  for (const [w, h] of VIEWPORTS) {
    const et = w + "x" + h + " ";
    const p = await (await br.newContext({ viewport: { width: w, height: h } })).newPage();
    p.on("pageerror", (e) => fallos.push("pageerror: " + e.message));
    await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
    await p.waitForSelector("button:has-text('Libro 7')", { timeout: 60000 });
    await p.click("button:has-text('Libro 7')");
    await p.click("button:has-text('Transformación agraria')");
    await p.fill("input.ed-input", "QA");
    await p.click("button:has-text('ENTRAR')");
    await p.waitForTimeout(500);
    const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(700); }

    // R1
    await p.waitForSelector("text=¿Hasta cuándo gobernó");
    console.log(await medir(p, et + "R1 sin estirar", fallos));
    // ⚠ Las tres barras a TOPE (hasta 1972) es el estado más ancho: los rótulos de los
    //   años y el texto de la derecha son los que podrían tocarse.
    const ejes = await p.evaluate(() => Array.from(document.querySelectorAll('[data-qa="eje"]')).map((e) => { const r = e.getBoundingClientRect(); return { x: r.left, w: r.width, y: r.top + r.height / 2 }; }));
    for (const e of ejes) { await p.mouse.move(e.x + 2, e.y); await p.mouse.down(); await p.mouse.move(e.x + e.w - 2, e.y, { steps: 6 }); await p.mouse.up(); }
    await p.waitForTimeout(150);
    console.log(await medir(p, et + "R1 las 3 barras a tope", fallos));
    await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(900);
    console.log(await medir(p, et + "R1 revelada", fallos));
    await p.waitForTimeout(3600);

    // R2
    await p.waitForSelector("text=¿Cuánto banano salió");
    console.log(await medir(p, et + "R2 vacía", fallos));
    const cols = await p.evaluate(() => Array.from(document.querySelectorAll('[data-qa="columna"]')).map((c) => { const r = c.getBoundingClientRect(); return { x: r.left + r.width / 2, top: r.top + 10 }; }));
    for (const c of cols) for (let k = 0; k < 10; k++) { await p.mouse.click(c.x, c.top); }
    await p.waitForTimeout(200);
    console.log(await medir(p, et + "R2 columnas LLENAS (10)", fallos));
    await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(900);
    console.log(await medir(p, et + "R2 revelada", fallos));
    await p.waitForTimeout(3600);

    // R3
    await p.waitForSelector("text=La Reforma Agraria de 1964");
    console.log(await medir(p, et + "R3 sin encender", fallos));
    const lamp = await p.$$('[data-qa="lampara"]');
    for (const l of lamp) { await l.click(); await p.waitForTimeout(60); }
    console.log(await medir(p, et + "R3 las CINCO encendidas", fallos));
    // ⚠ ¡VERIFICAR! solo se enciende con TRES, así que se apagan dos para poder revelar.
    await lamp[0].click(); await lamp[1].click(); await p.waitForTimeout(120);
    await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(900);
    console.log(await medir(p, et + "R3 revelada", fallos));
    await p.close();
  }
  console.log("\n" + (fallos.length ? "X PROBLEMAS:\n" + fallos.join("\n") : "OK Nada superpuesto, cortado ni fuera del lienzo en el Tema 3."));
  await br.close(); srv.close();
})();
