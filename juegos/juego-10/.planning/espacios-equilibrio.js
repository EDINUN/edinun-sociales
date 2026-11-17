// Auditoría de espacios del TEMA 4 de juego-10 ("Vivir en equilibrio con la Naturaleza").
// Recorre las 3 rondas en varios viewports, antes y después de verificar, y comprueba:
//   · que ningún elemento de la mecánica se salga del lienzo 900×540,
//   · que nada invada la columna de acciones (¡VERIFICAR! / REINICIAR / SALIR),
//   · que no haya textos recortados (scrollWidth > clientWidth),
//   · que no se solapen dos elementos tocables de la mecánica.
// También mide el colchón entre la mecánica y la columna de acciones.
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales";
const PORT = 8873;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });
const VIEWPORTS = [[1280, 800], [1024, 640], [1440, 900], [900, 560], [1600, 1000]];
const CORRECTAS = ["reconoce", "garantiza", "sano", "ecológicamente", "contaminación", "armonía"];

async function medir(p, etiqueta, fallos) {
  const r = await p.evaluate(() => {
    // ⚠ El selector de atributo no sirve: el navegador reserializa el style y no coincide.
    // Hay que buscar por la propiedad calculada.
    const zona = Array.from(document.querySelectorAll("div")).find((d) => d.style && d.style.left === "215px" && d.style.right === "215px");
    const acciones = Array.from(document.querySelectorAll("button")).filter((b) => /VERIFICAR|REINICIAR|SALIR/.test(b.textContent));
    const stage = Array.from(document.querySelectorAll("div")).find((d) => d.style && d.style.width === "900px" && d.style.height === "540px") || document.body;
    const sr = stage.getBoundingClientRect();
    const zr = zona ? zona.getBoundingClientRect() : null;
    const accL = acciones.length ? Math.min.apply(null, acciones.map((b) => b.getBoundingClientRect().left)) : Infinity;
    // ⚠ Dos descartes, los dos documentados a propósito:
    //  1. Un <span> dentro de un <button> SIEMPRE se solapa con su padre: solo se miden
    //     los elementos que no contienen a otro de la lista ni están dentro de otro.
    //  2. Las fichas de la cinta de la R3 salen del carril por diseño y el contenedor las
    //     RECORTA (overflow: hidden): se miden contra ese recorte, no contra el lienzo.
    // Los espacios vacíos del artículo (R1) son <span>, no <button>: se añaden a mano.
    const huecos = zona ? Array.from(zona.querySelectorAll("span[data-hueco]")) : [];
    const todos = zona ? Array.from(zona.querySelectorAll("button")).concat(huecos).filter((e) => { const b = e.getBoundingClientRect(); return b.width > 2 && b.height > 2; }) : [];
    const tocables = todos.filter((e) => !todos.some((o) => o !== e && e.contains(o)));
    function recorte(e) {
      let n = e.parentElement;
      while (n && n !== document.body) { if (getComputedStyle(n).overflow === "hidden") return n.getBoundingClientRect(); n = n.parentElement; }
      return null;
    }
    const cajas = tocables.map((e) => {
      const b = e.getBoundingClientRect(), c = recorte(e);
      const x = c ? Math.max(b.left, c.left) : b.left, r = c ? Math.min(b.right, c.right) : b.right;
      const y = c ? Math.max(b.top, c.top) : b.top, bo = c ? Math.min(b.bottom, c.bottom) : b.bottom;
      return { t: (e.textContent || "").trim().slice(0, 28), x, y, r, b: bo, vis: r - x > 2 && bo - y > 2, cut: e.scrollWidth > e.clientWidth + 1 };
    }).filter((c) => c.vis);
    const fuera = cajas.filter((c) => c.x < sr.left - 1 || c.r > sr.right + 1 || c.y < sr.top - 1 || c.b > sr.bottom + 1);
    const invaden = cajas.filter((c) => c.r > accL + 1);
    const cortados = cajas.filter((c) => c.cut);
    const solapes = [];
    for (let i = 0; i < cajas.length; i++) for (let j = i + 1; j < cajas.length; j++) {
      const a = cajas[i], b = cajas[j];
      const ox = Math.min(a.r, b.r) - Math.max(a.x, b.x), oy = Math.min(a.b, b.b) - Math.max(a.y, b.y);
      if (ox > 2 && oy > 2) solapes.push(a.t + " ↔ " + b.t);
    }
    const derecha = cajas.length ? Math.max.apply(null, cajas.map((c) => c.r)) : 0;
    return { n: cajas.length, fuera: fuera.map((c) => c.t), invaden: invaden.map((c) => c.t), cortados: cortados.map((c) => c.t), solapes, colchon: Math.round(accL - derecha), zona: !!zr };
  });
  const malo = r.fuera.length || r.invaden.length || r.cortados.length || r.solapes.length;
  if (malo) fallos.push(etiqueta + " → fuera:[" + r.fuera + "] invaden:[" + r.invaden + "] cortados:[" + r.cortados + "] solapes:[" + r.solapes + "]");
  return etiqueta + ": " + r.n + " elementos · colchón " + r.colchon + " px" + (malo ? "  ✗" : "  ✓");
}

(async () => {
  srv.listen(PORT);
  const br = await chromium.launch();
  const fallos = [];
  for (const [w, h] of VIEWPORTS) {
    const p = await (await br.newContext({ viewport: { width: w, height: h } })).newPage();
    await p.goto("http://localhost:" + PORT + "/juegos/juego-10/index.html", { waitUntil: "load" });
    await p.waitForSelector("input.ed-input");
    await p.fill("input.ed-input", "QA");
    await p.click("button:has-text('Vivir en equilibrio')");
    await p.click("button:has-text('ENTRAR')");
    await p.waitForTimeout(450);
    const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(650); }
    await p.waitForSelector("text=le faltan cuatro palabras");
    const et = w + "×" + h;
    console.log(await medir(p, et + " R1 antes", fallos));
    // llenar la R1 (da igual si acierta: se mide el espacio, no el puntaje)
    for (let n = 0; n < 4; n++) {
      const piezas = await p.$$("div[style*='flex-wrap: wrap'] > button");
      if (!piezas.length) break;
      await piezas[0].click();
      const huecos = await p.$$("span[data-hueco]");
      let d = null; for (const x of huecos) { if (!(await x.innerText()).trim()) { d = x; break; } }
      if (!d) break;
      await d.click(); await p.waitForTimeout(110);
    }
    await p.click("button:has-text('¡VERIFICAR!')");
    await p.waitForTimeout(900);
    console.log(await medir(p, et + " R1 después", fallos));
    await p.waitForTimeout(3600);

    await p.waitForSelector("text=Une cada opción de vida");
    console.log(await medir(p, et + " R2 antes", fallos));
    const izq = await p.$$("button[style*='width: 168px']");
    const der = await p.$$("button[style*='width: 206px']");
    for (let n = 0; n < izq.length; n++) { await izq[n].click(); await der[n].click(); await p.waitForTimeout(110); }
    await p.click("button:has-text('¡VERIFICAR!')");
    await p.waitForTimeout(900);
    console.log(await medir(p, et + " R2 después", fallos));
    await p.waitForTimeout(3600);

    await p.waitForSelector("text=Atrapa solo lo que cuida");
    await p.waitForTimeout(2600);
    console.log(await medir(p, et + " R3 en marcha", fallos));
    // atrapar unas cuantas para que la canasta tenga contenido y volver a medir
    for (let i = 0; i < 10; i++) {
      const fichas = await p.$$("button[style*='width: 212px']");
      for (const f of fichas) { try { await f.dispatchEvent("click"); } catch (e) {} }
      await p.waitForTimeout(400);
      if (!(await p.$("text=Atrapa solo lo que cuida"))) break;
    }
    const sigue = await p.$("text=Atrapa solo lo que cuida");
    if (sigue) console.log(await medir(p, et + " R3 con canasta", fallos));
    await p.close();
  }
  console.log("\n" + (fallos.length ? "✗ PROBLEMAS:\n" + fallos.join("\n") : "✓ Sin desbordes, sin invasión de la columna de acciones, sin textos recortados y sin solapes."));
  await br.close(); srv.close();
})();
