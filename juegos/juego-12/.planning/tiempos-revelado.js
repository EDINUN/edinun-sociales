// ¿Cuánto dura la pantalla del revelado en cada ronda?
//
// 📌 Por qué existe: la autora pidió el 2026-11-24 que SOLO la ronda de los hilos (la 3
// del Libro 7 · Tema 2) se demore más, y que las rondas 1 y 2 se queden como estaban.
// Eso se marca con `lento: true` en la entrada de la ronda, y es fácil que alguien lo
// ponga o lo quite sin darse cuenta. Aquí se mide con un cronómetro de verdad: se pulsa
// ¡VERIFICAR! y se mira cuándo aparece el cartelón y cuándo cambia de ronda.
//
// Esperado (desde que se pulsa ¡VERIFICAR!, acertando o fallando da igual para el tope):
//   rondas normales → cambia de ronda sobre los 2,0-3,4 s
//   ronda lenta     → cambia de ronda sobre los 4,0-5,6 s
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8935;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });

const hayCartelon = (p) => p.evaluate(() => /¡EXCELENTE!|¡UPS!/.test(document.body.innerText));
// ⚠ La ronda se reconoce por SU ENUNCIADO, no por los puntitos de avance: los puntos
// comparten color entre "el que toca" y "los que faltan" y daban lecturas falsas.
const rondaActiva = (p) => p.evaluate(() => {
  const t = Array.from(document.querySelectorAll("span")).find((x) => (x.style || {}).fontSize === "18px");
  return t ? t.textContent.trim().slice(0, 30) : "";
});

async function gestoCualquiera(p) {
  const ops = await p.evaluate(() => Array.from(document.querySelectorAll('[data-qa="opcion"]')).map((e) => e.getAttribute("data-g")));
  const g = ops[0];
  const z = await (await p.$('[data-qa="zona"]')).boundingBox();
  const cx = z.x + z.width / 2, cy = z.y + z.height / 2 - 30;
  if (g === "circulo") { const r = 56; await p.mouse.move(cx + r, cy); await p.mouse.down(); for (let a = 15; a <= 375; a += 15) await p.mouse.move(cx + r * Math.cos(a * Math.PI / 180), cy + r * Math.sin(a * Math.PI / 180)); await p.mouse.up(); await p.waitForTimeout(260); return; }
  if (g === "vaiven") { await p.mouse.move(cx, cy); await p.mouse.down(); await p.mouse.move(cx + 70, cy, { steps: 6 }); await p.mouse.move(cx - 70, cy, { steps: 8 }); await p.mouse.move(cx + 60, cy, { steps: 8 }); await p.mouse.up(); await p.waitForTimeout(260); return; }
  const d = { abajo: [0, 60], arriba: [0, -60], atras: [-80, 0] }[g];
  await p.mouse.move(cx - d[0] / 2, cy - d[1] / 2); await p.mouse.down(); await p.mouse.move(cx + d[0] / 2, cy + d[1] / 2, { steps: 10 }); await p.mouse.up(); await p.waitForTimeout(260);
}

// Pulsa ¡VERIFICAR! y cronometra: cuándo sale el cartelón y cuándo cambia la ronda.
async function cronometrar(p, etiqueta) {
  const antes = await rondaActiva(p);
  const t0 = Date.now();
  await p.click("button:has-text('¡VERIFICAR!')");
  let tCartel = 0, tRonda = 0;
  for (let k = 0; k < 160; k++) {
    await p.waitForTimeout(50);
    if (!tCartel && await hayCartelon(p)) tCartel = Date.now() - t0;
    const r = await rondaActiva(p);
    if (r !== antes) { tRonda = Date.now() - t0; break; }
  }
  console.log(etiqueta.padEnd(28) + "cartelón a los " + (tCartel / 1000).toFixed(1) + " s · cambia de ronda a los " + (tRonda / 1000).toFixed(1) + " s");
  return { cartel: tCartel, ronda: tRonda };
}

(async () => {
  srv.listen(PORT);
  const br = await chromium.launch();
  const p = await (await br.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  const fallos = [];
  await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
  await p.waitForSelector("button:has-text('Libro 7')", { timeout: 60000 });
  await p.click("button:has-text('Libro 7')");
  await p.click("button:has-text('Insurgencia y velasquismo')");
  await p.fill("input.ed-input", "QA");
  await p.click("button:has-text('ENTRAR')");
  await p.waitForTimeout(500);
  const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(700); }

  // R1 · la curva
  await p.waitForSelector('[data-qa="nudo"]', { timeout: 30000 });
  for (let k = 0; k < 3; k++) {
    const q = await (await p.$$('[data-qa="nudo"]'))[k].boundingBox();
    await p.mouse.move(q.x + q.width / 2, q.y + q.height / 2); await p.mouse.down();
    await p.mouse.move(q.x + q.width / 2, q.y + q.height / 2 + 14, { steps: 5 }); await p.mouse.up();
    await p.waitForTimeout(150);
  }
  const r1 = await cronometrar(p, "R1 · la curva");
  if (r1.ronda > 4200) fallos.push("la R1 se demora " + (r1.ronda / 1000).toFixed(1) + " s: tenía que quedarse en los tiempos cortos");

  // R2 · la feria
  await p.waitForSelector('[data-qa="zona"]', { timeout: 30000 });
  for (let k = 0; k < 2; k++) await gestoCualquiera(p);
  const r2 = await cronometrar(p, "R2 · la feria");
  if (r2.ronda > 4200) fallos.push("la R2 se demora " + (r2.ronda / 1000).toFixed(1) + " s: tenía que quedarse en los tiempos cortos");

  // R3 · los hilos (la lenta)
  await p.waitForSelector('[data-qa="autor"]', { timeout: 30000 });
  const a = await p.evaluate(() => Array.from(document.querySelectorAll('[data-qa="autor"]')).map((e) => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }));
  const o = await p.evaluate(() => Array.from(document.querySelectorAll('[data-qa="obra"]')).map((e) => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }));
  for (let k = 0; k < 3; k++) { await p.mouse.click(a[k].x, a[k].y); await p.waitForTimeout(120); await p.mouse.click(o[(k + 1) % 3].x, o[(k + 1) % 3].y); await p.waitForTimeout(140); }
  const r3 = await cronometrar(p, "R3 · los hilos (lenta)");
  if (r3.ronda < 4200) fallos.push("la R3 se va a los " + (r3.ronda / 1000).toFixed(1) + " s: tenía que durar más");

  console.log("\n" + (fallos.length ? "X PROBLEMAS:\n - " + fallos.join("\n - ") : "OK Las rondas 1 y 2 con los tiempos de siempre y la 3 más larga."));
  await br.close(); srv.close();
})();
