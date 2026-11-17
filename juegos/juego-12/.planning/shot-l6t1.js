// Capturas del Libro 6 · Tema 1 para mirarlo a ojo (Home, las 3 rondas y sus revelados).
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8883;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });
const OUT = process.argv[2] || ".";
const CIUDADANOS = ["Don Ramón", "Don Tomás", "Capitán Vargas", "Padre Ignacio"];
const PIR = ["Élite terrateniente", "Militares, comerciantes", "Indígenas, campesinos", "Afroamericanos esclavizados"];
const ANCHOS = [172, 250, 328, 406];
const META = { "Quito": 25000, "Cuenca": 18000, "Riobamba": 7600, "Guayaquil": 6000 };

(async () => {
  srv.listen(PORT);
  const br = await chromium.launch();
  const p = await (await br.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
  await p.waitForSelector("button:has-text('Libro 6')");
  await p.waitForTimeout(600);
  await p.screenshot({ path: OUT + "/j12-home-libros.png" });
  await p.click("button:has-text('Libro 6')");
  await p.waitForTimeout(400);
  await p.screenshot({ path: OUT + "/j12-home-temas.png" });
  await p.fill("input.ed-input", "QA");
  await p.click("button:has-text('ENTRAR')");
  await p.waitForTimeout(500);
  const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(700); }

  await p.waitForSelector("text=Decide quién podía ser ciudadano");
  await p.screenshot({ path: OUT + "/j12-r1.png" });
  const tarjetas = await p.$$("div[style*='width: 221px']");
  for (let i = 0; i < tarjetas.length; i++) {
    const txt = (await tarjetas[i].innerText()).replace(/\s+/g, " ");
    const esC = CIUDADANOS.some((n) => txt.indexOf(n) >= 0);
    // La última se marca al revés a propósito, para ver el revelado de un fallo.
    const quiero = i === tarjetas.length - 1 ? !esC : esC;
    await (await tarjetas[i].$(quiero ? "button:has-text('SÍ')" : "button:has-text('NO')")).click();
  }
  await p.click("button:has-text('¡VERIFICAR!')");
  await p.waitForTimeout(1100);
  await p.screenshot({ path: OUT + "/j12-r1-verificada.png" });
  await p.waitForTimeout(3600);

  await p.waitForSelector("text=Arma la pirámide social");
  await p.screenshot({ path: OUT + "/j12-r2.png" });
  for (let k = 0; k < 4; k++) {
    const fichas = await p.$$("div[style*='min-height: 44px'] > button");
    if (!fichas.length) break;
    const txt = (await fichas[0].innerText()).replace(/\s+/g, " ").trim();
    const d = PIR.findIndex((x) => txt.indexOf(x) >= 0);
    await fichas[0].click();
    // La última se coloca MAL a propósito, para ver el revelado con un fallo.
    const idx = (k === 2) ? ANCHOS.findIndex((w, n) => n !== d && true) : d;
    const esc = await p.$("button[style*='width: " + ANCHOS[idx] + "px']:has-text('escalón libre')") || await p.$("button[style*='width: " + ANCHOS[d] + "px']");
    await esc.click();
    await p.waitForTimeout(110);
  }
  await p.click("button:has-text('¡VERIFICAR!')");
  await p.waitForTimeout(1100);
  await p.screenshot({ path: OUT + "/j12-r2-verificada.png" });
  await p.waitForTimeout(3600);

  await p.waitForSelector("text=Ordena los hechos");
  await p.screenshot({ path: OUT + "/j12-r3.png" });
  // Se intercambian dos tarjetas para ver el estado "a medias" y luego se verifica
  // con el orden tal cual, que normalmente tendrá fallos: así se ve el revelado.
  const ts = await p.$$("button[style*='min-height: 70px']");
  if (ts.length > 1) { await ts[0].click(); await p.waitForTimeout(150); await ts[1].click(); await p.waitForTimeout(250); }
  await p.click("button:has-text('¡VERIFICAR!')");
  await p.waitForTimeout(1100);
  await p.screenshot({ path: OUT + "/j12-r3-verificada.png" });
  await br.close(); srv.close();
})();
