// Captura la R1 EN MITAD DEL ARRASTRE en varios momentos, que es el estado que no se ve
// en una captura normal: la tarjeta siguiendo al dedo, el hueco que abren las demás y la
// marca de destino en la vía.
// Uso: node .planning/shot-arrastre-l7t1.js <carpeta>
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8907;
const OUT = process.argv[2];
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });

(async () => {
  if (!OUT) { console.error("Uso: node shot-arrastre-l7t1.js <carpeta>"); process.exit(1); }
  fs.mkdirSync(OUT, { recursive: true });
  srv.listen(PORT);
  const br = await chromium.launch();
  const p = await (await br.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
  await p.waitForSelector("button:has-text('Libro 7')", { timeout: 60000 });
  await p.click("button:has-text('Libro 7')");
  // Desde que el Libro 7 tiene dos temas hay que ELEGIR uno: con mas de uno no se
  // preselecciona solo y ENTRAR queda apagado (mismo tropiezo que arrastre-r3 en el Libro 6).
  await p.click("button:has-text('La Revolución Liberal')");
  await p.fill("input.ed-input", "QA");
  await p.click("button:has-text('ENTRAR')");
  await p.waitForTimeout(500);
  const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(700); }
  await p.waitForSelector("text=Ordena los hechos");

  // Dónde está cada tarjeta y qué número lleva, para poder leer el estado sin ojo humano.
  const estado = () => p.$$eval('[data-qa="via"]', (bs) => bs.map((b) => {
    const r = b.getBoundingClientRect();
    return { n: (b.textContent.match(/^\s*(\d+)/) || [])[1], y: Math.round(r.top), txt: b.textContent.replace(/\s+/g, " ").replace(/^\d+\s*/, "").trim().slice(0, 26) };
  }));

  const cs = await p.$$('[data-qa="via"]');
  const a = await cs[0].boundingBox();
  const paso = (await cs[1].boundingBox()).y - a.y;      // un paso = alto + hueco, ya escalado
  const x = a.x + a.width / 2, y0 = a.y + a.height / 2;

  await p.mouse.move(x, y0);
  await p.mouse.down();
  await p.mouse.move(x, y0 + 10, { steps: 3 });
  await p.waitForTimeout(400);
  await p.screenshot({ path: path.join(OUT, "a-recien-levantada.png") });
  console.log("a-recien-levantada  " + JSON.stringify(await estado()));

  await p.mouse.move(x, y0 + paso * 0.6, { steps: 6 });
  await p.waitForTimeout(400);
  await p.screenshot({ path: path.join(OUT, "b-medio-paso.png") });
  console.log("b-medio-paso        " + JSON.stringify(await estado()));

  await p.mouse.move(x, y0 + paso, { steps: 6 });
  await p.waitForTimeout(400);
  await p.screenshot({ path: path.join(OUT, "c-un-paso.png") });
  console.log("c-un-paso           " + JSON.stringify(await estado()));

  await p.mouse.move(x, y0 + paso * 2, { steps: 8 });
  await p.waitForTimeout(400);
  await p.screenshot({ path: path.join(OUT, "d-dos-pasos.png") });
  console.log("d-dos-pasos         " + JSON.stringify(await estado()));

  await p.mouse.up();
  await br.close(); srv.close();
})();
