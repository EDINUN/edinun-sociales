// Comprueba que el DOBLE CLIC no selecciona texto en el juego (el navegador lo pintaba
// de azul y parecía un estado de la mecánica). La autora lo cazó el 2026-11-24 apilando
// cajas de banano.
//
// Prueba los TRES temas del Libro 7 y, de paso, que el campo del nombre del Home SÍ se
// pueda seleccionar: ahí la selección hace falta para corregir lo escrito.
//
// Uso: node .planning/sin-seleccion.js
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8971;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });

const seleccion = (p) => p.evaluate(() => String(window.getSelection()));

const TEMAS = [
  ["La Revolución Liberal", "l7-t1"],
  ["Insurgencia y velasquismo", "l7-t2"],
  ["Transformación agraria", "l7-t3"],
];

(async () => {
  srv.listen(PORT);
  const br = await chromium.launch();
  const p = await (await br.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  let mal = 0;
  const ok = (c, t) => { console.log((c ? "OK  " : "X   ") + t); if (!c) mal++; };

  for (const [label, id] of TEMAS) {
    await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
    await p.waitForSelector("button:has-text('Libro 7')", { timeout: 60000 });
    await p.click("button:has-text('Libro 7')");
    await p.click("button:has-text('" + label + "')");

    // El campo del nombre SÍ se selecciona.
    await p.fill("input.ed-input", "QA QA");
    await p.dblclick("input.ed-input");
    if (id === "l7-t1") ok((await seleccion(p)).length > 0, "El nombre del Home sí se puede seleccionar");

    await p.click("button:has-text('ENTRAR')");
    await p.waitForTimeout(500);
    const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(800); }

    // Doble clic sobre el enunciado y sobre la primera pieza que haya en pantalla.
    await p.evaluate(() => window.getSelection().removeAllRanges());
    const sitios = await p.evaluate(() => {
      const r = [];
      const h = Array.from(document.querySelectorAll("span")).find((s) => s.textContent.length > 20);
      if (h) { const b = h.getBoundingClientRect(); r.push([b.x + b.width / 2, b.y + b.height / 2]); }
      const d = Array.from(document.querySelectorAll("div")).filter((x) => x.offsetWidth > 60 && x.offsetWidth < 400 && x.offsetHeight > 24 && x.textContent.length > 8)[0];
      if (d) { const b = d.getBoundingClientRect(); r.push([b.x + b.width / 2, b.y + b.height / 2]); }
      return r;
    });
    for (const [x, y] of sitios) { await p.mouse.dblclick(x, y); await p.waitForTimeout(90); }
    ok((await seleccion(p)) === "", id + ": el doble clic no selecciona nada en el tablero");
  }

  console.log(mal === 0 ? "\nTODO OK\n" : "\n" + mal + " FALLO(S)\n");
  await br.close(); srv.close();
  process.exit(mal === 0 ? 0 : 1);
})();
