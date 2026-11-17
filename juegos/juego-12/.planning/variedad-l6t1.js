// Variedad del Libro 6 · Tema 1: 8 partidas seguidas en el MISMO navegador (localStorage
// persistente, como un chico que recarga). Anota qué sale en cada ronda y comprueba que
// no se repita en partidas consecutivas.
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8884;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });
const CIUDADANOS = ["Don Ramón", "Don Tomás", "Capitán Vargas", "Padre Ignacio"];

(async () => {
  srv.listen(PORT);
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: 1280, height: 800 } });   // un solo perfil
  const p = await ctx.newPage();
  const R1 = [], R2 = [], R3 = [];
  for (let i = 0; i < 8; i++) {
    await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
    await p.waitForSelector("button:has-text('Libro 6')");
    await p.click("button:has-text('Libro 6')");
    await p.fill("input.ed-input", "QA");
    await p.click("button:has-text('ENTRAR')");
    await p.waitForTimeout(450);
    const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(650); }
    await p.waitForSelector("text=Decide quién podía ser ciudadano");

    // R1: las cuatro personas que salieron
    const tarjetas = await p.$$("div[style*='width: 221px']");
    const nombres = [];
    for (const t of tarjetas) nombres.push((await t.innerText()).split("\n")[0].split(",")[0].trim());
    R1.push(nombres.slice().sort().join(" · "));
    for (const t of tarjetas) {
      const txt = (await t.innerText()).replace(/\s+/g, " ");
      const esC = CIUDADANOS.some((n) => txt.indexOf(n) >= 0);
      await (await t.$(esC ? "button:has-text('SÍ')" : "button:has-text('NO')")).click();
    }
    await p.click("button:has-text('¡VERIFICAR!')");
    await p.waitForTimeout(4300);

    // R2: qué escalón llegó de ancla
    await p.waitForSelector("text=Arma la pirámide social");
    await p.waitForTimeout(200);
    const ancla = await p.evaluate(() => {
      const b = Array.from(document.querySelectorAll("button")).find((x) => /ya está/.test(x.textContent));
      return b ? b.textContent.replace("ya está", "").replace(/\s+/g, " ").trim().slice(0, 34) : "(ninguna)";
    });
    R2.push(ancla);

    // R3: qué hecho se queda FUERA de la línea del tiempo esa partida
    for (let k = 0; k < 4; k++) {
      const fichas = await p.$$("div[style*='min-height: 44px'] > button");
      if (!fichas.length) break;
      await fichas[0].click();
      const libre = await p.$("button:has-text('escalón libre')");
      if (!libre) break;
      await libre.click(); await p.waitForTimeout(100);
    }
    await p.click("button:has-text('¡VERIFICAR!')");
    await p.waitForTimeout(4300);
    await p.waitForSelector("text=Ordena los hechos");
    await p.waitForTimeout(250);
    const hechos = await p.$$eval("button[style*='min-height: 70px']", (bs) => bs.map((x) => x.textContent.replace(/\s+/g, " ").trim().slice(3, 30)));
    R3.push(hechos.slice().sort().join(" | "));
  }
  const repes = (a) => a.filter((x, i) => i > 0 && x === a[i - 1]).length;
  const fmt = (n, a) => "\n── " + n + " ──\n" + a.map((x, i) => " " + (i + 1) + ". " + x).join("\n") +
    "\n   distintos: " + new Set(a).size + "/8 · repetidos seguidos: " + repes(a);
  console.log(fmt("RONDA 1 · las cuatro personas", R1));
  console.log(fmt("RONDA 2 · escalón que llega puesto", R2));
  console.log(fmt("RONDA 3 · los cuatro hechos que entran", R3));
  await br.close(); srv.close();
})();
