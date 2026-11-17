// La R3 del Tema 4 debe poder cerrarse con ¡VERIFICAR! SIN esperar a que pase la cinta.
// Juega las dos primeras rondas de cualquier manera, atrapa un par de prácticas buenas en
// la R3 y pulsa ¡VERIFICAR! a mitad: comprueba que la ronda termina ahí y que las ⭐ son
// las de lo atrapado.
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8879;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });
const BUENAS = ["Huerto de productos", "Abono hecho", "Energía del sol", "Vivienda que aprovecha", "Semillas guardadas", "Canasta para intercambiar", "Macetas con perejil", "Un sitio para intercambiar", "Recoger el agua"];
const hud = (p) => p.evaluate(() => { const d = Array.from(document.querySelectorAll("div")).find((x) => /^⭐\s*\d+$/.test(x.textContent.trim())); return d ? parseInt(d.textContent.replace(/\D/g, ""), 10) : -1; });

(async () => {
  srv.listen(PORT);
  const br = await chromium.launch();
  const p = await (await br.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  const fallos = [];
  p.on("pageerror", (e) => fallos.push("pageerror: " + e.message));
  await p.goto("http://localhost:" + PORT + "/juegos/juego-10/index.html", { waitUntil: "load" });
  await p.waitForSelector("input.ed-input");
  await p.fill("input.ed-input", "QA");
  await p.click("button:has-text('Vivir en equilibrio')");
  await p.click("button:has-text('ENTRAR')");
  await p.waitForTimeout(450);
  const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(650); }

  // R1 y R2: se rellenan de cualquier manera, no es lo que se mide aquí.
  await p.waitForSelector("text=le faltan cuatro palabras");
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
  await p.waitForSelector("text=Une cada opción de vida");
  const izq = await p.$$("button[style*='width: 168px']"), der = await p.$$("button[style*='width: 206px']");
  for (let n = 0; n < izq.length; n++) { await izq[n].click(); await der[n].click(); await p.waitForTimeout(100); }
  await p.click("button:has-text('¡VERIFICAR!')");
  await p.waitForTimeout(4300);

  // R3
  await p.waitForSelector("text=Atrapa solo lo que cuida");
  const antes = await hud(p);
  const hayBoton = !!(await p.$("button:has-text('¡VERIFICAR!')"));
  console.log("Botón ¡VERIFICAR! visible al empezar la ronda: " + (hayBoton ? "sí  ✓" : "NO  ✗"));
  if (!hayBoton) fallos.push("la R3 no muestra ¡VERIFICAR!");

  // Atrapa las buenas que pueda durante 9 s (la cinta dura ~26), y para ahí.
  let cogidas = 0;
  const t0 = Date.now();
  // Solo DOS: si coge las cuatro, la ronda se cierra sola y ya no hay botón que probar.
  while (Date.now() - t0 < 12000 && cogidas < 2) {
    const fichas = await p.$$("button[style*='width: 212px']");
    for (const f of fichas) {
      let t = ""; try { t = (await f.innerText()).trim(); } catch (e) { continue; }
      if (cogidas < 2 && BUENAS.some((x) => t.indexOf(x) >= 0)) { try { await f.dispatchEvent("click"); cogidas++; } catch (e) {} }
    }
    await p.waitForTimeout(220);
  }
  const quedaCinta = !!(await p.$("button[style*='width: 212px']"));
  console.log("Al cortar quedaban prácticas por pasar: " + (quedaCinta ? "sí" : "no") + " · atrapadas: " + cogidas);
  await p.click("button:has-text('¡VERIFICAR!')");
  await p.waitForTimeout(600);
  const cerrada = !!(await p.$("text=escap"));
  console.log("La ronda se cerró al pulsar el botón: " + (cerrada ? "sí  ✓" : "NO  ✗"));
  if (!cerrada) fallos.push("¡VERIFICAR! no cerró la ronda");
  await p.waitForTimeout(900);
  const despues = await hud(p);
  console.log("⭐ antes de la R3: " + antes + " · después: " + despues + " (sumó " + (despues - antes) + ")");
  if (despues - antes !== cogidas) fallos.push("las ⭐ no cuadran con lo atrapado (" + (despues - antes) + " vs " + cogidas + ")");

  console.log("\n" + (fallos.length ? "✗ " + fallos.join(" | ") : "✓ El botón cierra la ronda a mitad de cinta y suma solo lo atrapado."));
  await br.close(); srv.close();
})();
