// Al cambiar de gobernante, el mapa tiene que salir LIMPIO SOLO: la marca del turno
// anterior se enseña un momento y se borra, sin que el niño tenga que tocar nada.
// Antes se quedaba puesta hasta que tocaba otra ciudad, y parecía que seguía contando.
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8908;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });
const CIUDAD_DE = { "García Moreno": "Quito", "Guillermo Franco": "Guayaquil", "Jerónimo Carrión": "Cuenca", "Manuel Carrión Pinzano": "Loja" };
// Rótulos de gobernante escritos sobre el mapa = las marcas del turno anterior.
const marcas = (p) => p.evaluate(() => Array.from(document.querySelectorAll("svg text")).map((t) => t.textContent.trim()).filter((t) => /García|Franco|Carrión/.test(t)));

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
  await p.waitForSelector("text=cuatro gobiernos a la vez");

  const jefe1 = (await p.textContent('[data-qa="pedido"]')).trim();
  const pt = await p.evaluate((c) => { const t = Array.from(document.querySelectorAll("text")).find((x) => x.textContent.trim() === c); const g = t && t.closest("g"); if (!g) return null; const r = g.getBoundingClientRect(); return { x: r.left + 8, y: r.top + r.height / 2 }; }, CIUDAD_DE[jefe1]);
  await p.mouse.click(pt.x, pt.y); await p.waitForTimeout(160);
  await p.click("button:has-text('¡VERIFICAR!')");

  // Justo después de verificar la marca TIENE que verse (si no, no hay respuesta visible).
  await p.waitForTimeout(350);
  const alVerificar = await marcas(p);
  // Y un momento más tarde tiene que haberse ido SOLA, sin tocar nada.
  await p.waitForTimeout(1600);
  const despues = await marcas(p);

  console.log("marcas justo tras verificar: [" + alVerificar.join(", ") + "]");
  console.log("marcas 2 s después, sin tocar nada: [" + despues.join(", ") + "]");
  if (!alVerificar.length) fallos.push("tras verificar no se ve ninguna marca: el niño se queda sin respuesta");
  if (despues.length) fallos.push("la marca no se borra sola: " + despues.join(", "));
  console.log("\n" + (fallos.length ? "X " + fallos.join(" | ") : "OK La marca se ve al verificar y el mapa se limpia solo para el turno siguiente."));
  await br.close(); srv.close();
})();
