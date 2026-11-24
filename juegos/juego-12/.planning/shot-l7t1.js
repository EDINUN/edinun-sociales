// Capturas del Libro 7 · Tema 1 para mirarlas a ojo (lo que ningún detector ve: si un
// recorte de ilustración queda feo, si una escena no se entiende a ese tamaño).
// Uso: node .planning/shot-l7t1.js <carpeta-de-salida>
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8905;
const OUT = process.argv[2];
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });

(async () => {
  if (!OUT) { console.error("Uso: node shot-l7t1.js <carpeta-de-salida>"); process.exit(1); }
  fs.mkdirSync(OUT, { recursive: true });
  srv.listen(PORT);
  const br = await chromium.launch();
  const p = await (await br.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  const tiro = async (n) => { await p.screenshot({ path: path.join(OUT, n + ".png") }); console.log("  " + n + ".png"); };

  await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
  await p.waitForSelector("button:has-text('Libro 7')", { timeout: 60000 });
  await p.click("button:has-text('Libro 7')");
  // Desde que el Libro 7 tiene dos temas hay que ELEGIR uno: con mas de uno no se
  // preselecciona solo y ENTRAR queda apagado (mismo tropiezo que arrastre-r3 en el Libro 6).
  await p.click("button:has-text('La Revolución Liberal')");
  await tiro("00-temas");
  await p.fill("input.ed-input", "QA");
  await p.click("button:has-text('ENTRAR')");
  await p.waitForTimeout(500);
  const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(700); }

  await p.waitForSelector("text=Ordena los hechos");
  await tiro("01-r1-via");
  await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(1300);
  await tiro("02-r1-revelado");
  await p.waitForTimeout(3600);

  await p.waitForSelector("text=en manos de quién");
  await tiro("03-r2-balanza");
  // ⚠ LOS DOS AL MISMO PLATILLO: como los dos asuntos caen en destinos DISTINTOS, así al
  // menos uno queda mal y la captura enseña el revelado con error, que es el que importa
  // mirar. Repartirlos en dos platillos distintos puede acertar los dos por casualidad.
  await p.click('[data-qa="plat-igl"]'); await p.waitForTimeout(220);
  await tiro("04-r2-uno-colocado");
  while (await p.$('[data-qa="asunto"]')) { await p.click('[data-qa="plat-igl"]'); await p.waitForTimeout(170); }
  await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(900);
  await tiro("05-r2-revelado");
  await p.waitForTimeout(3600);

  await p.waitForSelector("text=Descubre de qué hecho");
  await tiro("06-r3-expediente");
  const bt = await p.$('[data-qa="destapar"]'); if (bt) { await bt.click(); await p.waitForTimeout(220); }
  await tiro("07-r3-dos-pistas");
  const ops = await p.$$('[data-qa="op"]');
  await ops[0].click(); await p.waitForTimeout(160);
  await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(900);
  await tiro("08-r3-revelado");

  await br.close(); srv.close();
})();
