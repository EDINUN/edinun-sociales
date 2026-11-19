// La Carta (R3 del Tema 2), dos cosas que pidió la autora el 2026-11-19:
//   1. TODO lo que se arrastra se rompe, acertado o no, y el agujero "DEROGADO" SE QUEDA
//      hasta el final: el veredicto de los tres llega junto, al pulsar ¡VERIFICAR!.
//   2. Los TRES pedidos se enseñan siempre, aunque el niño haya roto antes el renglón de
//      uno de ellos: nunca se queda sin poder actuar.
//   3. Hay un botón BORRAR que devuelve el papel entero y los pedidos al primero.
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8911;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });
const RENGLON_DE = {
  "Rompe al hombre contra el que se levantó Guayaquil.": "Flores",
  "Rompe el impuesto que hizo estallar el 6 de marzo.": "tres pesos",
  "La Iglesia vuelve al país: rompe lo que la tenía fuera.": "Iglesia",
};
const filas = (p) => p.evaluate(() => Array.from(document.querySelectorAll("div"))
  .filter((d) => d.style && d.style.touchAction === "none" && d.textContent.trim().indexOf("▸") === 0 && getComputedStyle(d).opacity !== "0")
  .map((d) => { const r = d.getBoundingClientRect(); return { t: d.textContent.trim(), x: r.left + 12, y: r.top + r.height / 2, w: r.width }; }));
const derogados = (p) => p.evaluate(() => Array.from(document.querySelectorAll("span")).filter((x) => x.textContent.indexOf("DEROGADO") === 0).length);
const arrastrar = async (p, f) => { await p.mouse.move(f.x, f.y); await p.mouse.down(); await p.mouse.move(f.x + f.w * 0.95, f.y, { steps: 9 }); await p.mouse.up(); };

(async () => {
  srv.listen(PORT);
  const br = await chromium.launch();
  const p = await (await br.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  const fallos = [];
  p.on("pageerror", (e) => fallos.push("pageerror: " + e.message));
  await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
  await p.click("button:has-text('Libro 6')");
  await p.click("button:has-text('La Revolución Marcista')");
  await p.fill("input.ed-input", "QA");
  await p.click("button:has-text('ENTRAR')");
  await p.waitForTimeout(500);
  const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(700); }
  await p.waitForSelector("text=Arma la bandera");
  for (const c of ["rojo", "verde", "amarillo"]) { const b = await p.$(`button:has-text('${c}')`); await b.click(); await p.waitForTimeout(70); }
  await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(4300);
  const CICLO = ["Quito", "Guayaquil", "Cuenca", "Loja"];
  const CIUDAD_DE = { "García Moreno": "Quito", "Guillermo Franco": "Guayaquil", "Jerónimo Carrión": "Cuenca", "Manuel Carrión Pinzano": "Loja" };
  for (let k = 0; k < 4; k++) {
    if (!(await p.$("text=¿Dónde mandaba?"))) break;
    const jefe = (await p.textContent('[data-qa="pedido"]')).trim();
    const pt = await p.evaluate((c) => { const t = Array.from(document.querySelectorAll("text")).find((x) => x.textContent.trim() === c); const g = t && t.closest("g"); if (!g) return null; const r = g.getBoundingClientRect(); return { x: r.left + 8, y: r.top + r.height / 2 }; }, CIUDAD_DE[jefe]);
    if (pt) { await p.mouse.click(pt.x, pt.y); await p.waitForTimeout(150); }
    await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(500);
  }
  await p.waitForSelector("text=la revolución derribó");

  // ── 1. El renglón equivocado TAMBIÉN se rompe, y el pedido siguiente llega igual ──
  await p.waitForSelector('[data-qa="consigna"]');
  let pide = (await p.textContent('[data-qa="consigna"]')).trim();
  let vivas = await filas(p);
  const mala = vivas.find((f) => f.t.indexOf(RENGLON_DE[pide]) === -1);
  await arrastrar(p, mala);
  await p.waitForTimeout(400);
  const trasError = await filas(p);
  if (trasError.length !== 3) fallos.push("el renglón equivocado no se rompió (quedan " + trasError.length + ", esperaba 3)");
  if ((await derogados(p)) !== 1) fallos.push("no sale el DEROGADO del renglón que arrastró");
  if (!(await p.$('[data-qa="consigna"]'))) fallos.push("tras fallar no llega el pedido siguiente");

  // ── 2. Los DEROGADO se acumulan y NINGUNO se va al seguir jugando ──
  await p.waitForSelector('[data-qa="consigna"]');
  pide = (await p.textContent('[data-qa="consigna"]')).trim();
  vivas = await filas(p);
  // Si el error del paso 1 se llevó justo este renglón, se rompe cualquier otro: lo que
  // se comprueba aquí es que los agujeros se acumulan, no el acierto.
  await arrastrar(p, vivas.find((f) => f.t.indexOf(RENGLON_DE[pide]) >= 0) || vivas[0]);
  await p.waitForTimeout(500);
  const d1 = await derogados(p);   // ya van dos agujeros: el fallado y el acertado
  // Tercer pedido: se juegue como se juegue, el DEROGADO anterior no puede irse.
  await p.waitForSelector('[data-qa="consigna"]');
  pide = (await p.textContent('[data-qa="consigna"]')).trim();
  vivas = await filas(p);
  await arrastrar(p, vivas.find((f) => f.t.indexOf(RENGLON_DE[pide]) === -1) || vivas[0]);
  await p.waitForTimeout(1500);
  const d2 = await derogados(p);
  console.log("DEROGADO tras romper el correcto: " + d1 + " · tras el pedido siguiente: " + d2);
  if (d1 !== 2) fallos.push("los agujeros no se acumulan (van " + d1 + ", esperaba 2)");
  if (d2 !== 3) fallos.push("algún DEROGADO desapareció al seguir jugando (van " + d2 + ", esperaba 3)");
  // Y el veredicto de los TRES llega junto, al verificar.
  await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(900);
  const marcas = await p.evaluate(() => Array.from(document.querySelectorAll("span")).filter((x) => /^(✓|✗)/.test(x.textContent.trim())).length);
  console.log("marcas ✓/✗ en los agujeros al verificar: " + marcas);
  if (marcas !== 3) fallos.push("al verificar no se marcan los tres agujeros (hay " + marcas + ")");

  // ── 3. BORRAR devuelve el papel entero (partida nueva, sin verificar) ──
  await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
  await p.click("button:has-text('Libro 6')");
  await p.click("button:has-text('La Revolución Marcista')");
  await p.fill("input.ed-input", "QA");
  await p.click("button:has-text('ENTRAR')");
  await p.waitForTimeout(500);
  const v2 = await p.$("button:has-text('VAMOS')"); if (v2) { await v2.click(); await p.waitForTimeout(700); }
  await p.waitForSelector("text=Arma la bandera");
  for (const c of ["rojo", "verde", "amarillo"]) { const bb = await p.$(`button:has-text('${c}')`); await bb.click(); await p.waitForTimeout(70); }
  await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(4300);
  for (let k = 0; k < 4; k++) {
    if (!(await p.$("text=¿Dónde mandaba?"))) break;
    const jefe = (await p.textContent('[data-qa="pedido"]')).trim();
    const pt = await p.evaluate((c) => { const t = Array.from(document.querySelectorAll("text")).find((x) => x.textContent.trim() === c); const g = t && t.closest("g"); if (!g) return null; const rr = g.getBoundingClientRect(); return { x: rr.left + 8, y: rr.top + rr.height / 2 }; }, CIUDAD_DE[jefe]);
    if (pt) { await p.mouse.click(pt.x, pt.y); await p.waitForTimeout(150); }
    await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(500);
  }
  await p.waitForSelector("text=la revolución derribó");
  await p.waitForSelector('[data-qa="consigna"]');
  vivas = await filas(p);
  await arrastrar(p, vivas[0]); await p.waitForTimeout(500);
  const btn = await p.$("button:has-text('BORRAR')");
  if (!btn) fallos.push("no hay botón BORRAR en la Carta");
  else {
    await btn.click();
    await p.waitForTimeout(400);
    const tras = await filas(p);
    const dd = await derogados(p);
    const hayPedido = await p.$('[data-qa="consigna"]');
    console.log("tras BORRAR: " + tras.length + " renglones enteros · " + dd + " DEROGADO · ¿vuelve a pedir?: " + (hayPedido ? "sí" : "no"));
    if (tras.length !== 4) fallos.push("BORRAR no devolvió los 4 renglones");
    if (dd !== 0) fallos.push("BORRAR deja un DEROGADO puesto");
    if (!hayPedido) fallos.push("tras BORRAR no vuelve a haber pedido");
  }
  console.log("\n" + (fallos.length ? "X " + fallos.join(" | ") : "OK Todo lo arrastrado se rompe, los DEROGADO se quedan, el veredicto de los tres llega al verificar, y BORRAR devuelve la Carta entera."));
  await br.close(); srv.close();
})();
