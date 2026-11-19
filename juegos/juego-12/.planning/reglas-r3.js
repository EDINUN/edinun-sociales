// Las reglas de la Carta (R3 del Tema 2), tal como las fijó la autora el 2026-11-19:
//   · Los TRES pedidos se ven a la vez y EL ORDEN NO IMPORTA. Cayeron tres renglones
//     (Flores, el impuesto, la Iglesia); el de los esclavos es el único que no cayó.
//   · Todo lo que se arrastra se rompe y el agujero "DEROGADO" SE QUEDA.
//   · No hay tope de roturas: ¡VERIFICAR! está siempre disponible, y el veredicto de
//     todas llega junto.
//   · Ronda perfecta = los tres que cayeron y NINGUNO de más.
//   · BORRAR devuelve el papel entero.
//   · Nada de juicio antes de ¡VERIFICAR!: los pedidos no se marcan al romper.
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8911;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });
const CAYERON = ["Flores", "tres pesos", "Iglesia"], NO_CAYO = "esclavos";
const filas = (p) => p.evaluate(() => Array.from(document.querySelectorAll("div"))
  .filter((d) => d.style && d.style.touchAction === "none" && d.textContent.trim().indexOf("▸") === 0 && getComputedStyle(d).opacity !== "0")
  .map((d) => { const r = d.getBoundingClientRect(); return { t: d.textContent.trim(), x: r.left + 12, y: r.top + r.height / 2, w: r.width }; }));
const derogados = (p) => p.evaluate(() => Array.from(document.querySelectorAll("span")).filter((x) => x.textContent.indexOf("DEROGADO") >= 0 || x.textContent.indexOf("✗ ") === 0).length);
const estrellas = (p) => p.evaluate(() => { const d = Array.from(document.querySelectorAll("div")).find((x) => /^⭐\s*\d+$/.test(x.textContent.trim())); return d ? parseInt(d.textContent.replace(/\D/g, ""), 10) : -1; });
const romper = async (p, clave) => {
  const f = (await filas(p)).find((x) => x.t.indexOf(clave) >= 0);
  if (!f) throw new Error("no está el renglón de " + clave);
  await p.mouse.move(f.x, f.y); await p.mouse.down();
  await p.mouse.move(f.x + f.w * 0.95, f.y, { steps: 9 }); await p.mouse.up();
  await p.waitForTimeout(320);
};

// Llega hasta la R3 pasando la bandera y el mapa.
async function hastaLaCarta(p) {
  await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
  await p.click("button:has-text('Libro 6')");
  await p.click("button:has-text('La Revolución Marcista')");
  await p.fill("input.ed-input", "QA");
  await p.click("button:has-text('ENTRAR')");
  await p.waitForTimeout(500);
  const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(700); }
  await p.waitForSelector("text=Arma la bandera");
  for (const c of ["rojo", "verde", "amarillo"]) { const b = await p.$("button:has-text('" + c + "')"); await b.click(); await p.waitForTimeout(70); }
  await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(4300);
  const CIUDAD_DE = { "García Moreno": "Quito", "Guillermo Franco": "Guayaquil", "Jerónimo Carrión": "Cuenca", "Manuel Carrión Pinzano": "Loja" };
  for (let k = 0; k < 4; k++) {
    if (!(await p.$("text=¿Dónde mandaba?"))) break;
    const jefe = (await p.textContent('[data-qa="pedido"]')).trim();
    const pt = await p.evaluate((c) => { const t = Array.from(document.querySelectorAll("text")).find((x) => x.textContent.trim() === c); const g = t && t.closest("g"); if (!g) return null; const r = g.getBoundingClientRect(); return { x: r.left + 8, y: r.top + r.height / 2 }; }, CIUDAD_DE[jefe]);
    if (pt) { await p.mouse.click(pt.x, pt.y); await p.waitForTimeout(150); }
    await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(500);
  }
  await p.waitForSelector("text=la revolución derribó");
}

(async () => {
  srv.listen(PORT);
  const br = await chromium.launch();
  const p = await (await br.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  const fallos = [];
  p.on("pageerror", (e) => fallos.push("pageerror: " + e.message));

  // ── A. Los tres pedidos a la vez, el orden da igual, y nada se marca antes de verificar.
  await hastaLaCarta(p);
  const pedidos = (await p.textContent('[data-qa="consigna"]')).replace(/\s+/g, " ").trim();
  if (!/Guayaquil/.test(pedidos) || !/6 de marzo/.test(pedidos) || !/Iglesia/.test(pedidos)) fallos.push("no se ven los tres pedidos a la vez: " + pedidos);
  const antes = await estrellas(p);
  // Al revés del orden en que están escritos, para que se note que da igual.
  await romper(p, "Iglesia"); await romper(p, "tres pesos"); await romper(p, "Flores");
  const marcasPrematuras = await p.evaluate(() => Array.from(document.querySelectorAll('[data-qa="consigna"] span')).filter((x) => x.textContent.trim() === "✓").length);
  if (marcasPrematuras) fallos.push("los pedidos se marcan con ✓ ANTES de verificar");
  if ((await derogados(p)) !== 3) fallos.push("no quedan los tres agujeros puestos");
  if ((await filas(p)).length !== 1) fallos.push("el renglón de los esclavos no es el único que queda entero");
  await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(1000);
  const ganadas = (await estrellas(p)) - antes;
  console.log("rompiendo los tres al revés del orden escrito: +" + ganadas + " ⭐");
  if (ganadas !== 3) fallos.push("romper los tres en otro orden no da 3 ⭐ (dio " + ganadas + ")");

  // ── B. Romper además el de los esclavos: sigue dando 3 ⭐, pero la ronda NO es perfecta.
  await hastaLaCarta(p);
  const antesB = await estrellas(p);
  for (const c of CAYERON) await romper(p, c);
  await romper(p, NO_CAYO);
  if ((await filas(p)).length !== 0) fallos.push("no se pudo romper el cuarto renglón");
  await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(1000);
  const ganadasB = (await estrellas(p)) - antesB;
  await p.waitForTimeout(3800);
  const reporteB = ((await p.textContent("body")).match(/QA, acertaste \d+ de \d+/) || ["(sin reporte)"])[0];
  console.log("rompiendo los tres MÁS el de los esclavos: +" + ganadasB + " ⭐ · " + reporteB);
  if (ganadasB !== 3) fallos.push("romper de más debería seguir dando 3 ⭐ (dio " + ganadasB + ")");
  // El atajo juega la R1 MAL a propósito y la R2 bien, así que la única ronda perfecta
  // posible sería la R3: si rompiendo de más saliera "2 de 3", estaría contándola perfecta.
  if (!/acertaste 1 de 3/.test(reporteB)) fallos.push("romper de más NO debería contar como ronda perfecta: " + reporteB);

  // ── C. BORRAR devuelve el papel entero.
  await hastaLaCarta(p);
  await romper(p, CAYERON[0]);
  const btn = await p.$("button:has-text('BORRAR')");
  if (!btn) fallos.push("no hay botón BORRAR en la Carta");
  else {
    await btn.click(); await p.waitForTimeout(400);
    const tras = await filas(p), dd = await derogados(p);
    console.log("tras BORRAR: " + tras.length + " renglones enteros · " + dd + " agujeros");
    if (tras.length !== 4) fallos.push("BORRAR no devolvió los 4 renglones");
    if (dd !== 0) fallos.push("BORRAR deja un agujero puesto");
  }

  console.log("\n" + (fallos.length ? "X " + fallos.join(" | ") : "OK El orden no importa, los agujeros se quedan, romper de más no es ronda perfecta, y BORRAR devuelve la Carta entera."));
  await br.close(); srv.close();
})();
