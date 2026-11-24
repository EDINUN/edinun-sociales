// La ronda de los hilos (Libro 7 · Tema 2), después de los cambios que pidió la autora
// el 2026-11-24:
//   1. Se puede unir empezando por CUALQUIERA de los dos lados (obra → autor también).
//   2. El arrastre de toda la vida sigue funcionando.
//   3. Esa ronda YA NO LLEVA el botón BORRAR.
//   4. El bocadillo no dice "Arrastra" ni "Da igual por cuál empieces".
//
// ⚠ La navegación hasta la R3 está copiada de `espacios-l7t2.js`, que es de la sesión que
// construyó este tema: si allí cambian las dos primeras rondas, hay que volver a copiarla.
// (La ronda de los juguetes ya se movió de sitio una vez y dejó este script colgado.)
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8926;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });

const cajas = (p, sel) => p.evaluate((s) => Array.from(document.querySelectorAll(s)).map((e) => {
  const r = e.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, t: e.textContent.replace(/\s+/g, " ").trim().slice(0, 24) };
}), sel);
const hilos = (p) => p.evaluate(() => document.querySelectorAll("svg line").length);
const hayBorrar = (p) => p.evaluate(() => Array.from(document.querySelectorAll("button")).some((b) => b.textContent.trim() === "BORRAR"));

// ── Un gesto cualquiera sobre el juguete de turno (copiado de espacios-l7t2.js) ──
async function gestoCualquiera(p) {
  const ops = await p.evaluate(() => Array.from(document.querySelectorAll('[data-qa="opcion"]')).map((e) => e.getAttribute("data-g")));
  const g = ops[0];
  const z = await (await p.$('[data-qa="zona"]')).boundingBox();
  const cx = z.x + z.width / 2, cy = z.y + z.height / 2 - 30;
  if (g === "circulo") {
    const r = 56;
    await p.mouse.move(cx + r, cy); await p.mouse.down();
    for (let a = 15; a <= 375; a += 15) await p.mouse.move(cx + r * Math.cos(a * Math.PI / 180), cy + r * Math.sin(a * Math.PI / 180));
    await p.mouse.up(); await p.waitForTimeout(260); return;
  }
  if (g === "vaiven") {
    await p.mouse.move(cx, cy); await p.mouse.down();
    await p.mouse.move(cx + 70, cy, { steps: 6 });
    await p.mouse.move(cx - 70, cy, { steps: 8 });
    await p.mouse.move(cx + 60, cy, { steps: 8 });
    await p.mouse.up(); await p.waitForTimeout(260); return;
  }
  const d = { abajo: [0, 60], arriba: [0, -60], atras: [-80, 0] }[g];
  await p.mouse.move(cx - d[0] / 2, cy - d[1] / 2); await p.mouse.down();
  await p.mouse.move(cx + d[0] / 2, cy + d[1] / 2, { steps: 10 });
  await p.mouse.up(); await p.waitForTimeout(260);
}

async function llegarALosHilos(p) {
  await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
  await p.waitForSelector("button:has-text('Libro 7')", { timeout: 60000 });
  await p.click("button:has-text('Libro 7')");
  await p.click("button:has-text('Insurgencia y velasquismo')");
  await p.fill("input.ed-input", "QA");
  await p.click("button:has-text('ENTRAR')");
  await p.waitForTimeout(500);
  const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(700); }

  // R1 · la curva: basta soltar cada nudo (soltar siempre coloca, aunque no se mueva).
  await p.waitForSelector('[data-qa="nudo"]', { timeout: 30000 });
  for (let k = 0; k < 3; k++) {
    const q = await (await p.$$('[data-qa="nudo"]'))[k].boundingBox();
    await p.mouse.move(q.x + q.width / 2, q.y + q.height / 2);
    await p.mouse.down();
    await p.mouse.move(q.x + q.width / 2, q.y + q.height / 2 + 14, { steps: 5 });
    await p.mouse.up(); await p.waitForTimeout(200);
  }
  await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(4400);

  // R2 · la feria: dos juguetes, un gesto en cada uno.
  await p.waitForSelector('[data-qa="zona"]', { timeout: 30000 });
  for (let k = 0; k < 2; k++) await gestoCualquiera(p);
  await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(4400);

  await p.waitForSelector('[data-qa="autor"]', { timeout: 30000 });
}

(async () => {
  srv.listen(PORT);
  const br = await chromium.launch();
  const p = await (await br.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  const fallos = [];
  await llegarALosHilos(p);

  const autores = await cajas(p, '[data-qa="autor"]');
  const obras = await cajas(p, '[data-qa="obra"]');
  if (autores.length !== 3 || obras.length !== 3) fallos.push("no hay 3 autores y 3 obras");

  // 3 · el botón BORRAR ya no está en esta ronda
  if (await hayBorrar(p)) fallos.push("la ronda de los hilos SIGUE enseñando el botón BORRAR");
  else console.log("BORRAR: no aparece   OK");

  // 4 · el bocadillo
  const texto = await p.evaluate(() => document.body.innerText);
  if (texto.indexOf("Arrastra desde el punto") >= 0) fallos.push("el bocadillo sigue diciendo 'Arrastra desde el punto'");
  if (texto.indexOf("Da igual por cuál empieces") >= 0) fallos.push("el bocadillo sigue diciendo 'Da igual por cuál empieces'");

  // 1 · OBRA primero, autor después  ← lo que pidió la autora
  await p.mouse.click(obras[2].x, obras[2].y); await p.waitForTimeout(180);
  await p.mouse.click(autores[0].x, autores[0].y); await p.waitForTimeout(300);
  let n = await hilos(p);
  console.log("obra → autor: " + n + " hilo(s)   (" + obras[2].t + "  ←  " + autores[0].t + ")");
  if (n < 1) fallos.push("tocar la OBRA primero y el autor después no unió nada");

  // 2 · AUTOR primero, obra después
  await p.mouse.click(autores[1].x, autores[1].y); await p.waitForTimeout(180);
  await p.mouse.click(obras[0].x, obras[0].y); await p.waitForTimeout(300);
  n = await hilos(p);
  console.log("autor → obra: " + n + " hilo(s)");
  if (n < 2) fallos.push("tocar el AUTOR primero y la obra después no unió");

  // 3 · el arrastre de siempre
  await p.mouse.move(autores[2].x, autores[2].y);
  await p.mouse.down();
  await p.mouse.move(obras[1].x, obras[1].y, { steps: 10 });
  await p.mouse.up(); await p.waitForTimeout(300);
  n = await hilos(p);
  console.log("arrastre:     " + n + " hilo(s)");
  if (n < 3) fallos.push("el arrastre de toda la vida dejó de unir");

  console.log("\n" + (fallos.length ? "X PROBLEMAS:\n - " + fallos.join("\n - ") : "OK Se une por los dos lados, el arrastre sigue, no hay BORRAR y el bocadillo está limpio."));
  await br.close(); srv.close();
})();
