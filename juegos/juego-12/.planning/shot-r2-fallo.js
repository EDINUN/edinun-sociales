// Captura el revelado de la pirámide CON FALLOS (los tres grupos rotados), para mirar el
// cartel "La pirámide va así" en su caso malo, no solo cuando está todo bien.
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8888;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });
const OUT = process.argv[2] || ".";
const CIUDADANOS = ["Don Ramón", "Don Tomás", "Capitán Vargas", "Padre Ignacio"];
const PIR = ["Élite terrateniente", "Militares, comerciantes", "Indígenas, campesinos", "Afroamericanos esclavizados"];
const ANCHOS = [172, 250, 328, 406];

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

  // Se leen las tres fichas y se ROTAN sus destinos: así ninguna cae en su escalón.
  const fichas = await p.$$("div[style*='min-height: 44px'] > button");
  const plan = [];
  for (const f of fichas) {
    const texto = (await f.innerText()).replace(/\s+/g, " ").trim();
    plan.push({ texto, destino: PIR.findIndex((x) => texto.indexOf(x) >= 0) });
  }
  for (let i = 0; i < plan.length; i++) {
    const quiero = plan[(i + 1) % plan.length].destino;
    let ficha = null;
    for (const f of await p.$$("div[style*='min-height: 44px'] > button")) {
      if ((await f.innerText()).replace(/\s+/g, " ").trim() === plan[i].texto) { ficha = f; break; }
    }
    if (!ficha) continue;
    await ficha.click();
    const esc = await p.$("button[style*='width: " + ANCHOS[quiero] + "px']");
    if (esc) await esc.click();
    await p.waitForTimeout(120);
  }
  await p.click("button:has-text('¡VERIFICAR!')");
  await p.waitForTimeout(1100);
  await p.screenshot({ path: OUT + "/j12-r2-fallo.png" });
  await br.close(); srv.close();
})();
