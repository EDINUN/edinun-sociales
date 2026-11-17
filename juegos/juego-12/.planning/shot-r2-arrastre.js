// Captura la línea del tiempo CON UNA TARJETA EN EL AIRE: la que se arrastra sigue al
// puntero y las demás se apartan para abrir el hueco donde va a caer.
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8889;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });
const OUT = process.argv[2] || ".";
const CIUDADANOS = ["Don Ramón", "Don Tomás", "Capitán Vargas", "Padre Ignacio"];

(async () => {
  srv.listen(PORT);
  const br = await chromium.launch();
  const p = await (await br.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
  await p.waitForSelector("button:has-text('Libro 6')");
  await p.click("button:has-text('Libro 6')");
  await p.fill("input.ed-input", "QA");
  await p.click("button:has-text('ENTRAR')");
  await p.waitForTimeout(500);
  const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(700); }
  for (const t of await p.$$("div[style*='width: 221px']")) {
    const s = (await t.innerText()).replace(/\s+/g, " ");
    await (await t.$(CIUDADANOS.some((n) => s.indexOf(n) >= 0) ? "button:has-text('SÍ')" : "button:has-text('NO')")).click();
  }
  await p.click("button:has-text('¡VERIFICAR!')");
  await p.waitForTimeout(4300);
  await p.waitForSelector("text=Arma la pirámide social");
  for (let k = 0; k < 4; k++) {
    const fichas = await p.$$("div[style*='min-height: 44px'] > button");
    if (!fichas.length) break;
    await fichas[0].click();
    const libre = await p.$("button:has-text('escalón libre')");
    if (!libre) break;
    await libre.click(); await p.waitForTimeout(100);
  }
  // Captura el arrastre de un grupo YA COLOCADO entre dos escalones.
  const puestos = await p.$("button[style*='width: 250px'], button[style*='width: 328px']");
  const a = await puestos[0].boundingBox(), z = await puestos[1].boundingBox();
  await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await p.mouse.down();
  await p.mouse.move(a.x + a.width / 2, (a.y + z.y) / 2, { steps: 6 });
  await p.mouse.move(z.x + z.width / 2, z.y + z.height / 2, { steps: 6 });
  await p.waitForTimeout(300);
  await p.screenshot({ path: OUT + "/j12-r2-arrastrando.png" });
  await p.mouse.up();
  await p.waitForTimeout(300);
  await p.screenshot({ path: OUT + "/j12-r2-soltado.png" });
  await br.close(); srv.close();
})();
