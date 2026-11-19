// La R2 se verifica uno a uno, y entre turno y turno el MAPA DEBE QUEDAR LIMPIO:
// si el niño puso Quito en el primero y se equivocó, tiene que poder volver a elegir Quito
// en el segundo. Antes la ciudad usada se quedaba marcada y bloqueada.
// Esta prueba: falla a propósito el primer turno sobre una ciudad, y luego comprueba que
// (1) esa ciudad vuelve a ser elegible, y (2) el mapa no arrastra la marca anterior.
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8907;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });
const CIUDAD_DE = { "García Moreno": "Quito", "Guillermo Franco": "Guayaquil", "Jerónimo Carrión": "Cuenca", "Manuel Carrión Pinzano": "Loja" };

const punto = (p, c) => p.evaluate((c) => {
  const t = Array.from(document.querySelectorAll("text")).find((x) => x.textContent.trim() === c);
  const g = t && t.closest("g"); if (!g) return null;
  const r = g.getBoundingClientRect();
  return { x: r.left + 8, y: r.top + r.height / 2 };
}, c);
// Nombres de gobernante escritos sobre el mapa (las marcas que no deben arrastrarse).
const rotulosMapa = (p) => p.evaluate(() => Array.from(document.querySelectorAll("svg text")).map((t) => t.textContent.trim()).filter((t) => /García|Franco|Carrión/.test(t)));

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
  // Pasar la R1 deprisa.
  await p.waitForSelector("text=Arma la bandera");
  for (const c of ["rojo", "verde", "amarillo"]) { const b = await p.$(`button:has-text('${c}')`); await b.click(); await p.waitForTimeout(70); }
  await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(4300);
  await p.waitForSelector("text=cuatro gobiernos a la vez");

  // TURNO 1: se elige a propósito una ciudad que NO es la suya.
  const jefe1 = (await p.textContent('[data-qa="pedido"]')).trim();
  const suya1 = CIUDAD_DE[jefe1];
  const CICLO = ["Quito", "Guayaquil", "Cuenca", "Loja"];
  const equivocada = CICLO[(CICLO.indexOf(suya1) + 1) % 4];
  const pt1 = await punto(p, equivocada);
  await p.mouse.click(pt1.x, pt1.y); await p.waitForTimeout(160);
  await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(600);

  // TURNO 2: el mapa debe estar limpio en cuanto se toca, y la ciudad usada, libre.
  const jefe2 = (await p.textContent('[data-qa="pedido"]')).trim();
  if (jefe2 === jefe1) fallos.push("el segundo turno repite el mismo gobernante");
  const antes = await rotulosMapa(p);
  const pt2 = await punto(p, equivocada);          // ¡la MISMA que ya se usó!
  await p.mouse.click(pt2.x, pt2.y); await p.waitForTimeout(220);
  const despues = await rotulosMapa(p);
  const banda = (await p.textContent("div[style*='border: 2.5px solid rgb(79, 216, 255)']")).replace(/\s+/g, " ");

  console.log("turno 1: se pidió " + jefe1 + " (su ciudad es " + suya1 + ") y se puso en " + equivocada);
  console.log("turno 2: se pide " + jefe2 + "; rótulos en el mapa antes de tocar: [" + antes.join(", ") + "] · después: [" + despues.join(", ") + "]");
  console.log("banda: " + banda.trim());

  if (banda.indexOf("Elegiste " + equivocada) < 0) fallos.push("no deja volver a elegir " + equivocada + " en el segundo turno");
  if (despues.length > 1) fallos.push("el mapa arrastra marcas del turno anterior: " + despues.join(", "));
  console.log("\n" + (fallos.length ? "X " + fallos.join(" | ") : "OK El mapa queda limpio entre turnos y una ciudad ya usada se puede volver a elegir."));
  await br.close(); srv.close();
})();
