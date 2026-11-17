// Variedad del TEMA 4 de juego-10: 8 partidas seguidas en el MISMO navegador
// (localStorage persistente, como un chico que recarga) anotando qué sale en cada ronda.
// Comprueba que no se repita el mismo ejercicio en partidas consecutivas.
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales";
const PORT = 8875;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });
const CORRECTAS = ["reconoce", "garantiza", "sano", "ecológicamente", "contaminación", "armonía"];

(async () => {
  srv.listen(PORT);
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: 1280, height: 800 } });   // un solo perfil
  const p = await ctx.newPage();
  const R1 = [], R2 = [], R3 = [];
  for (let i = 0; i < 8; i++) {
    await p.goto("http://localhost:" + PORT + "/juegos/juego-10/index.html", { waitUntil: "load" });
    await p.waitForSelector("input.ed-input");
    await p.fill("input.ed-input", "QA");
    await p.click("button:has-text('Vivir en equilibrio')");
    await p.click("button:has-text('ENTRAR')");
    await p.waitForTimeout(400);
    const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(600); }
    await p.waitForSelector("text=le faltan cuatro palabras");

    // R1: qué palabras faltan en el artículo = qué espacios se abrieron
    const txt = (await p.locator("div[style*='width: 452px']").first().innerText()).replace(/\s+/g, " ");
    R1.push(CORRECTAS.filter((w) => txt.indexOf(w) === -1).join("+"));
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
    await p.waitForTimeout(4300);

    // R2: las 3 características que salieron (una por opción de vida)
    await p.waitForSelector("text=Une cada opción de vida");
    const der = await p.$$("button[style*='width: 206px']");
    const rasgos = [];
    for (const d of der) rasgos.push((await d.innerText()).replace(/\s+/g, " ").trim().slice(0, 26));
    R2.push(rasgos.slice().sort().join(" | "));
    const izq = await p.$$("button[style*='width: 168px']");
    for (let n = 0; n < izq.length; n++) { await izq[n].click(); await der[n].click(); await p.waitForTimeout(100); }
    await p.click("button:has-text('¡VERIFICAR!')");
    await p.waitForTimeout(4300);

    // R3: las 8 prácticas que pasan por la cinta
    await p.waitForSelector("text=Atrapa solo lo que cuida");
    await p.waitForTimeout(300);
    const cinta = await p.$$eval("button[style*='width: 212px']", (bs) => bs.map((x) => x.textContent.replace(/\s+/g, " ").trim().slice(0, 20)));
    R3.push(cinta.slice().sort().join(" | "));
  }
  const repes = (a) => a.filter((x, i) => i > 0 && x === a[i - 1]).length;
  const fmt = (n, a) => "\n── " + n + " ──\n" + a.map((x, i) => " " + (i + 1) + ". " + x).join("\n") +
    "\n   distintos: " + new Set(a).size + "/8 · repetidos seguidos: " + repes(a);
  console.log(fmt("RONDA 1 · espacios abiertos del artículo", R1));
  console.log(fmt("RONDA 2 · características que salen", R2));
  console.log(fmt("RONDA 3 · prácticas de la cinta", R3));
  await br.close(); srv.close();
})();
