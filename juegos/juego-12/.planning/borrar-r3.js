// La Carta (R3 del Tema 2), dos cosas que pidió la autora el 2026-11-19:
//   1. El renglón EQUIVOCADO no se rompe: se resiste, el cartel dice "Ese no era" y pasa
//      al pedido siguiente. Así "DEROGADO" solo sale en lo que de verdad cayó.
//   2. "DEROGADO" se QUEDA: un renglón bien roto no reaparece al jugar los siguientes.
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

  // ── 1. El renglón equivocado NO se rompe ──
  await p.waitForSelector('[data-qa="consigna"]');
  let pide = (await p.textContent('[data-qa="consigna"]')).trim();
  let vivas = await filas(p);
  const mala = vivas.find((f) => f.t.indexOf(RENGLON_DE[pide]) === -1);
  await arrastrar(p, mala);
  await p.waitForTimeout(400);
  const trasError = await filas(p);
  const avisa = await p.$("text=Ese no era");
  if (trasError.length !== 4) fallos.push("el renglón equivocado SÍ se rompió (quedan " + trasError.length + " de 4)");
  if (!avisa) fallos.push("no avisa de que ese renglón no era");
  if ((await derogados(p)) !== 0) fallos.push("sale DEROGADO en un renglón que no cayó");

  // ── 2. El renglón correcto se rompe y el DEROGADO se QUEDA ──
  await p.waitForSelector('[data-qa="consigna"]');
  pide = (await p.textContent('[data-qa="consigna"]')).trim();
  vivas = await filas(p);
  await arrastrar(p, vivas.find((f) => f.t.indexOf(RENGLON_DE[pide]) >= 0));
  await p.waitForTimeout(500);
  const d1 = await derogados(p);
  // Tercer pedido: se juegue como se juegue, el DEROGADO anterior no puede irse.
  await p.waitForSelector('[data-qa="consigna"]');
  pide = (await p.textContent('[data-qa="consigna"]')).trim();
  vivas = await filas(p);
  await arrastrar(p, vivas.find((f) => f.t.indexOf(RENGLON_DE[pide]) === -1) || vivas[0]);
  await p.waitForTimeout(1500);
  const d2 = await derogados(p);
  console.log("DEROGADO tras romper el correcto: " + d1 + " · tras el pedido siguiente: " + d2);
  if (d1 !== 1) fallos.push("el renglón correcto no quedó roto");
  if (d2 < 1) fallos.push("el DEROGADO desapareció al seguir jugando");

  // ── 3. BORRAR devuelve el papel entero ──
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
  console.log("\n" + (fallos.length ? "X " + fallos.join(" | ") : "OK El papel solo cede donde debe, el DEROGADO se queda, y BORRAR devuelve la Carta entera."));
  await br.close(); srv.close();
})();
