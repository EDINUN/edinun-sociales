// ¿Cuánto cambia el Libro 7 · Tema 3 al recargar? Mide en N partidas seguidas (mismo
// navegador, porque el anti-repetición vive en localStorage):
//   R1 — qué TRES gobiernos de los ocho salen, y que no caigan dos mandatos del mismo.
//   R2 — qué TRES años de los cuatro de la tabla salen.
//   R3 — qué CINCO frases salen (3 verdaderas de 5 + 2 falsas de 3 = 30 combinaciones).
// Uso: node .planning/variedad-l7t3.js [partidas]
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8934;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });
const N = parseInt(process.argv[2] || "8", 10);
const CAJAS = { 1948: 1, 1950: 2, 1955: 6, 1960: 9 };

(async () => {
  srv.listen(PORT);
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await ctx.newPage();
  const vistos = { gob: {}, anios: {}, frases: {} };
  const seguidas = { gob: 0, anios: 0, frases: 0 };
  let antes = { gob: "", anios: "", frases: "" };

  for (let i = 0; i < N; i++) {
    await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
    await p.waitForSelector("button:has-text('Libro 7')", { timeout: 60000 });
    await p.click("button:has-text('Libro 7')");
    await p.click("button:has-text('Transformación agraria')");
    await p.fill("input.ed-input", "QA");
    await p.click("button:has-text('ENTRAR')");
    await p.waitForTimeout(500);
    const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(700); }

    // R1 · qué tres gobiernos salen
    await p.waitForSelector("text=¿Hasta cuándo gobernó");
    const ejes = await p.evaluate(() => Array.from(document.querySelectorAll('[data-qa="eje"]')).map((e) => {
      const r = e.getBoundingClientRect();
      return { n: e.parentElement.firstElementChild.firstElementChild.textContent.replace(/DESDE \d+/, "").trim(), x: r.left, w: r.width, y: r.top + r.height / 2 };
    }));
    const firmaG = ejes.map((e) => e.n).sort().join("|");
    vistos.gob[firmaG] = 1;
    if (firmaG === antes.gob) seguidas.gob++;
    antes.gob = firmaG;
    // ⚠ Dos mandatos de la MISMA persona no pueden salir juntos.
    const personas = ejes.map((e) => e.n.split(" · ")[0]);
    if (new Set(personas).size !== personas.length) throw new Error("R1: dos mandatos de la misma persona → " + personas.join(" | "));
    for (const e of ejes) { await p.mouse.move(e.x + 2, e.y); await p.mouse.down(); await p.mouse.move(e.x + e.w * 0.92, e.y, { steps: 5 }); await p.mouse.up(); }
    await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(4200);

    // R2 · qué tres años
    await p.waitForSelector("text=¿Cuánto banano salió");
    const cols = await p.evaluate(() => Array.from(document.querySelectorAll('[data-qa="columna"]')).map((c) => {
      const r = c.getBoundingClientRect();
      return { y: parseInt(c.parentElement.lastElementChild.textContent.trim(), 10), x: r.left + r.width / 2, top: r.top + 10 };
    }));
    const firmaA = cols.map((c) => c.y).sort().join(",");
    vistos.anios[firmaA] = 1;
    if (firmaA === antes.anios) seguidas.anios++;
    antes.anios = firmaA;
    for (const c of cols) for (let k = 0; k < CAJAS[c.y]; k++) { await p.mouse.click(c.x, c.top); await p.waitForTimeout(35); }
    await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(4200);

    // R3 · qué cinco frases
    await p.waitForSelector("text=La Reforma Agraria de 1964");
    const fr = await p.evaluate(() => Array.from(document.querySelectorAll('[data-qa="lampara"]')).map((d) => d.textContent.replace(/\s+/g, " ").trim().slice(0, 30)).sort());
    const firmaF = fr.join("|");
    vistos.frases[firmaF] = 1;
    if (firmaF === antes.frases) seguidas.frases++;
    antes.frases = firmaF;
    // ⚠ No hace falta cerrar la ronda: lo medido es lo que SALIÓ, y la siguiente partida
    //   recarga la página.
  }

  const n = (o) => Object.keys(o).length;
  console.log("En " + N + " partidas seguidas:");
  console.log("  R1 · qué tres gobiernos  " + n(vistos.gob) + "/" + N + " distintos (de 56 posibles)");
  console.log("  R2 · qué tres años ..... " + n(vistos.anios) + "/" + N + " distintos (de 4 posibles)");
  console.log("  R3 · qué cinco frases .. " + n(vistos.frases) + "/" + N + " distintas (de 30 posibles)");
  console.log("  Repitió EXACTAMENTE la partida anterior: R1 " + seguidas.gob + " · R2 " + seguidas.anios + " · R3 " + seguidas.frases);
  const mal = [];
  if (seguidas.gob || seguidas.anios || seguidas.frases) mal.push("alguna ronda repitió el ejercicio de la partida anterior");
  if (n(vistos.gob) < Math.min(6, N)) mal.push("la R1 varía poco");
  if (n(vistos.anios) < 3) mal.push("la R2 varía poco");
  if (n(vistos.frases) < Math.min(6, N)) mal.push("la R3 varía poco");
  console.log("\n" + (mal.length ? "X " + mal.join(" · ") : "OK Las tres rondas cambian de partida en partida y ninguna repite la anterior."));
  await br.close(); srv.close();
})();
