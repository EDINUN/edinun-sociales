// Las reglas de la Carta (R3 del Tema 2), tal como las fijó la autora el 2026-11-19:
//   · EL ORDEN NO IMPORTA. Cayeron tres renglones (Flores, el impuesto, la Iglesia); el
//     de los esclavos es el único que no cayó, y el ENUNCIADO dice que son 3.
//   · Ya NO hay cuadro de pedidos: era un espejo del papel y lo quitó la autora.
//   · Todo lo que se arrastra se rompe y el agujero "DEROGADO" SE QUEDA.
//   · No hay tope de roturas: ¡VERIFICAR! está siempre disponible, y el veredicto de
//     todas llega junto.
//   · Ronda perfecta = los tres que cayeron y NINGUNO de más.
//   · BORRAR devuelve el papel entero.
//   · BORRAR está SIEMPRE a la vista, apagado mientras no haya nada roto.
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
  await p.waitForSelector("text=¿Cuáles cayeron en 1845?");
}

(async () => {
  srv.listen(PORT);
  const br = await chromium.launch();
  const p = await (await br.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  const fallos = [];
  p.on("pageerror", (e) => fallos.push("pageerror: " + e.message));

  // ── A. El enunciado dice cuántas son, BORRAR se ve desde el principio, y el orden da igual.
  await hastaLaCarta(p);
  const enunciado = (await p.textContent("text=Son tres")).trim();
  if (!/tres/i.test(enunciado)) fallos.push("el enunciado no dice cuántos renglones cayeron: " + enunciado);
  const btn0 = await p.$("button:has-text('BORRAR')");
  if (!btn0) fallos.push("BORRAR no está a la vista antes de romper nada");
  else if (!(await btn0.isDisabled())) fallos.push("BORRAR debería estar apagado sin nada roto");
  if (await p.$('[data-qa="consigna"]')) fallos.push("sigue estando el cuadro de pedidos, que se quitó");
  const antes = await estrellas(p);
  // En un orden cualquiera, para que se note que da igual.
  await romper(p, "Iglesia"); await romper(p, "tres pesos"); await romper(p, "Flores");
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

  // ── C. BORRAR deshace SOLO el último renglón roto, no el papel entero.
  await hastaLaCarta(p);
  await romper(p, CAYERON[0]);
  await romper(p, CAYERON[1]);
  const btn = await p.$("button:has-text('BORRAR')");
  if (btn && (await btn.isDisabled())) fallos.push("BORRAR sigue apagado habiendo un renglón roto");
  if (!btn) fallos.push("no hay botón BORRAR en la Carta");
  else {
    await btn.click(); await p.waitForTimeout(400);
    const unaVez = await filas(p);
    const vuelve = unaVez.some((x) => x.t.indexOf(CAYERON[1]) >= 0);
    const sigueRota = !unaVez.some((x) => x.t.indexOf(CAYERON[0]) >= 0);
    console.log("tras UN BORRAR (había 2 rotas): " + unaVez.length + " renglones enteros · ¿vuelve la última?: " + (vuelve ? "sí" : "no") + " · ¿la primera sigue rota?: " + (sigueRota ? "sí" : "no"));
    if (unaVez.length !== 3) fallos.push("un BORRAR debería dejar 3 renglones enteros, no " + unaVez.length);
    if (!vuelve) fallos.push("BORRAR no devolvió el ÚLTIMO renglón roto");
    if (!sigueRota) fallos.push("BORRAR se llevó también una rotura anterior");
    // Pulsándolo otra vez se vuelve atrás del todo.
    await btn.click(); await p.waitForTimeout(400);
    const dosVeces = await filas(p), dd = await derogados(p);
    console.log("tras el segundo BORRAR: " + dosVeces.length + " renglones enteros · " + dd + " agujeros");
    if (dosVeces.length !== 4 || dd !== 0) fallos.push("dos BORRAR no devolvieron el papel entero");
    if (!(await (await p.$("button:has-text('BORRAR')")).isDisabled())) fallos.push("sin nada roto, BORRAR debería quedar apagado otra vez");
  }

  console.log("\n" + (fallos.length ? "X " + fallos.join(" | ") : "OK El enunciado dice que son 3, el orden no importa, los agujeros se quedan, romper de más no es ronda perfecta, y BORRAR se ve siempre y devuelve la Carta entera."));
  await br.close(); srv.close();
})();
