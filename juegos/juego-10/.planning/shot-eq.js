// Capturas sueltas para mirar a ojo el Home (4 botones) y las 3 rondas del Tema 4.
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8876;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });
const OUT = process.argv[2] || ".";
(async () => {
  srv.listen(PORT);
  const br = await chromium.launch();
  const p = await (await br.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  await p.goto("http://localhost:" + PORT + "/juegos/juego-10/index.html", { waitUntil: "load" });
  await p.waitForSelector("input.ed-input");
  await p.waitForTimeout(700);
  await p.screenshot({ path: OUT + "/eq-home.png" });
  await p.fill("input.ed-input", "QA");
  await p.click("button:has-text('Vivir en equilibrio')");
  await p.waitForTimeout(300);
  await p.screenshot({ path: OUT + "/eq-home-sel.png" });
  await p.click("button:has-text('ENTRAR')");
  await p.waitForTimeout(500);
  const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(700); }
  await p.screenshot({ path: OUT + "/eq-r1.png" });
  for (let n = 0; n < 4; n++) {
    const piezas = await p.$$("div[style*='flex-wrap: wrap'] > button");
    if (!piezas.length) break;
    await piezas[0].click();
    const hs = await p.$$("span[data-hueco]");
    let d = null; for (const x of hs) { if (!(await x.innerText()).trim()) { d = x; break; } }
    if (!d) break;
    await d.click(); await p.waitForTimeout(100);
  }
  await p.click("button:has-text('¡VERIFICAR!')");
  await p.waitForTimeout(800);
  await p.screenshot({ path: OUT + "/eq-r1-verificada.png" });
  await p.waitForTimeout(3600);
  await p.waitForSelector("text=Une cada opción de vida");
  await p.screenshot({ path: OUT + "/eq-r2.png" });
  const izq = await p.$$("button[style*='width: 168px']");
  const der = await p.$$("button[style*='width: 206px']");
  for (let n = 0; n < izq.length; n++) { await izq[n].click(); await der[n].click(); await p.waitForTimeout(100); }
  await p.click("button:has-text('¡VERIFICAR!')");
  await p.waitForTimeout(1400);
  await p.screenshot({ path: OUT + "/eq-r2-verificada.png" });
  await p.waitForTimeout(3200);
  await p.waitForSelector("text=Atrapa solo lo que cuida");
  await p.waitForTimeout(3400);
  await p.screenshot({ path: OUT + "/eq-r3.png" });
  await br.close(); srv.close();
})();
