// Capturas del Libro 7 · Tema 3 para mirarlas a ojo: lo decorativo (una caja que se monta
// sobre otra, un hueco desperdiciado, una figura descentrada) no lo ve ningún detector.
// Uso: node .planning/shot-l7t3.js <carpeta>
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8923;
const OUT = process.argv[2];
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });
const CAJAS = { 1948: 1, 1950: 2, 1955: 6, 1960: 9 };

(async () => {
  if (!OUT) { console.error("Uso: node shot-l7t3.js <carpeta>"); process.exit(1); }
  fs.mkdirSync(OUT, { recursive: true });
  srv.listen(PORT);
  const br = await chromium.launch();
  const p = await (await br.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  const tiro = async (n) => { await p.screenshot({ path: path.join(OUT, n + ".png") }); console.log("  " + n + ".png"); };

  await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
  await p.waitForSelector("button:has-text('Libro 7')", { timeout: 60000 });
  await p.click("button:has-text('Libro 7')");
  await p.click("button:has-text('Transformación agraria')");
  await p.fill("input.ed-input", "QA");
  await p.click("button:has-text('ENTRAR')");
  await p.waitForTimeout(500);
  const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(700); }

  await p.waitForSelector("text=¿Hasta cuándo gobernó");
  await tiro("r1-vacia");
  // ⚠ Se falla UNA barra a propósito para ver la raya dorada sobre una equivocada.
  const ejes = await p.evaluate(() => Array.from(document.querySelectorAll('[data-qa="eje"]')).map((e) => { const r = e.getBoundingClientRect(); return { x: r.left, w: r.width, y: r.top + r.height / 2 }; }));
  // ⚠ Todas se estiran casi hasta 1972, que está DESPUÉS del inicio de cualquiera de las
  //   ocho: así ninguna queda sin estirar (y con la barra sin mover ¡VERIFICAR! no se
  //   enciende, que fue como se colgó la primera versión de esta captura). Las que no
  //   terminaban en 1972 salen falladas, que es lo que hay que poder mirar.
  for (const e of ejes) { await p.mouse.move(e.x + 2, e.y); await p.mouse.down(); await p.mouse.move(e.x + e.w * 0.92, e.y, { steps: 6 }); await p.mouse.up(); await p.waitForTimeout(80); }
  await p.waitForTimeout(200); await tiro("r1-jugada");
  await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(950); await tiro("r1-revelada");
  await p.waitForTimeout(2600);

  await p.waitForSelector("text=¿Cuánto banano salió");
  await tiro("r2-vacia");
  const cols = await p.evaluate(() => Array.from(document.querySelectorAll('[data-qa="columna"]')).map((c) => { const r = c.getBoundingClientRect(); return { y: parseInt(c.parentElement.lastElementChild.textContent.trim(), 10), x: r.left + r.width / 2, top: r.top + 10 }; }));
  // ⚠ Se falla UNA columna a propósito: con las tres bien el revelado sale todo verde y
  //   no se ve cómo queda la raya de la altura verdadera sobre una pila equivocada.
  for (let i = 0; i < cols.length; i++) {
    const n = i === 0 ? Math.min(10, CAJAS[cols[i].y] + 4) : CAJAS[cols[i].y];
    for (let k = 0; k < n; k++) { await p.mouse.click(cols[i].x, cols[i].top); await p.waitForTimeout(40); }
  }
  await p.waitForTimeout(200); await tiro("r2-jugada");
  await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(1800); await tiro("r2-revelada");
  await p.waitForTimeout(2600);

  await p.waitForSelector("text=La Reforma Agraria de 1964");
  await tiro("r3-vacia");
  const lamp = await p.$$('[data-qa="lampara"]');
  // ⚠ También se falla a propósito: así se ve el ámbar "ESTA SÍ PASÓ" de la que faltó.
  await lamp[0].click(); await lamp[1].click(); await lamp[2].click();
  await p.waitForTimeout(200); await tiro("r3-jugada");
  await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(1800); await tiro("r3-revelada");

  console.log("\nCapturas en " + OUT);
  await br.close(); srv.close();
})();
