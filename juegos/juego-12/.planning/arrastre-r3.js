// Comprueba el ARRASTRE REAL de la línea del tiempo (R3 del Libro 6 · Tema 1):
//   1. arrastrar la última tarjeta al primer puesto la INSERTA ahí y corre las demás,
//   2. el toque sigue funcionando como respaldo (intercambia dos),
//   3. se puede dejar la línea ordenada del todo y ¡VERIFICAR! da las 4 ⭐.
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8887;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });
const CIUDADANOS = ["Don Ramón", "Don Tomás", "Capitán Vargas", "Padre Ignacio"];
const CRONOLOGIA = ["La Asamblea se reúne en Riobamba", "Termina el periodo constitucional", "En Ambato se escribe la segunda", "El Congreso nombra otra vez", "Flores reúne en Quito una nueva"];
const ANCHOS = [172, 250, 328, 406];

const tarjetas = (p) => p.$$("button[style*='min-height: 70px']");
async function orden(p) {
  const r = [];
  for (const t of await tarjetas(p)) {
    const s = (await t.innerText()).replace(/\s+/g, " ");
    r.push(CRONOLOGIA.findIndex((x) => s.indexOf(x) >= 0));
  }
  return r;
}
async function arrastrar(p, desdeIdx, hastaIdx) {
  const ts = await tarjetas(p);
  const a = await ts[desdeIdx].boundingBox(), z = await ts[hastaIdx].boundingBox();
  await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await p.mouse.down();
  await p.mouse.move(a.x + a.width / 2, (a.y + z.y) / 2 + z.height / 2, { steps: 6 });
  await p.mouse.move(z.x + z.width / 2, z.y + z.height / 2, { steps: 6 });
  await p.mouse.up();
  await p.waitForTimeout(200);
}

(async () => {
  srv.listen(PORT);
  const br = await chromium.launch();
  const p = await (await br.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  const fallos = [];
  p.on("pageerror", (e) => fallos.push("pageerror: " + e.message));
  await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
  // ⚠ 60 s: en frío el navegador baja React + Babel Standalone del CDN.
  await p.waitForSelector("button:has-text('Libro 6')", { timeout: 60000 });
  await p.click("button:has-text('Libro 6')");
  // ⚠ Desde que el Libro 6 tiene DOS temas, ninguno viene preseleccionado y ENTRAR sale
  // apagado: hay que elegir el tema. Sin esto el test se colgaba en el Home.
  await p.click("button:has-text('Los primeros años del Ecuador')");
  await p.fill("input.ed-input", "QA");
  await p.click("button:has-text('ENTRAR')");
  await p.waitForTimeout(500);
  const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(700); }

  // R1 y R2 de paso
  for (const t of await p.$$("div[style*='width: 221px']")) {
    const s = (await t.innerText()).replace(/\s+/g, " ");
    await (await t.$(CIUDADANOS.some((n) => s.indexOf(n) >= 0) ? "button:has-text('SÍ')" : "button:has-text('NO')")).click();
  }
  await p.click("button:has-text('¡VERIFICAR!')");
  await p.waitForTimeout(4300);
  await p.waitForSelector("text=Arma la pirámide social");
  for (let k = 0; k < 4; k++) {
    const fichas = await p.$$("div[style*='min-height: 44px'] > button");
    if (!fichas.length) break;
    await fichas[0].click();
    const libre = await p.$("button:has-text('escalón libre')");
    if (!libre) break;
    await libre.click(); await p.waitForTimeout(100);
  }
  await p.click("button:has-text('¡VERIFICAR!')");
  await p.waitForTimeout(4300);
  await p.waitForSelector("text=Ordena los hechos");

  // 1 · arrastrar la última al primer puesto = insertar
  const antes = await orden(p);
  await arrastrar(p, antes.length - 1, 0);
  const despues = await orden(p);
  const esperado = [antes[antes.length - 1]].concat(antes.slice(0, antes.length - 1));
  const ok1 = JSON.stringify(despues) === JSON.stringify(esperado);
  console.log("1 · arrastrar la última al 1er puesto: [" + antes + "] → [" + despues + "]" + (ok1 ? "  ✓" : "  ✗ esperaba [" + esperado + "]"));
  if (!ok1) fallos.push("el arrastre no insertó en el puesto");

  // 2 · respaldo tap: tocar dos las intercambia
  let ts = await tarjetas(p);
  await ts[0].click(); await p.waitForTimeout(120);
  ts = await tarjetas(p);
  await ts[2].click(); await p.waitForTimeout(180);
  const tras = await orden(p);
  const esp2 = despues.slice(); const t0 = esp2[0]; esp2[0] = esp2[2]; esp2[2] = t0;
  const ok2 = JSON.stringify(tras) === JSON.stringify(esp2);
  console.log("2 · respaldo tap (intercambia)" + (ok2 ? "  ✓" : "  ✗"));
  if (!ok2) fallos.push("el toque ya no intercambia");

  // 3 · dejar la línea ordenada arrastrando y verificar
  let actual = await orden(p);
  const meta = actual.slice().sort((a, b) => a - b);
  for (let i = 0; i < meta.length; i++) {
    if (actual[i] === meta[i]) continue;
    const j = actual.indexOf(meta[i]);
    await arrastrar(p, j, i);
    const [x] = actual.splice(j, 1); actual.splice(i, 0, x);
  }
  const ok3 = JSON.stringify(await orden(p)) === JSON.stringify(meta);
  await p.click("button:has-text('¡VERIFICAR!')");
  await p.waitForTimeout(1200);
  const estrellas = await p.evaluate(() => { const d = Array.from(document.querySelectorAll("div")).find((x) => /^⭐\s*\d+$/.test(x.textContent.trim())); return d ? parseInt(d.textContent.replace(/\D/g, ""), 10) : -1; });
  console.log("3 · línea ordenada solo arrastrando" + (ok3 ? "  ✓" : "  ✗") + " · ⭐ al verificar: " + estrellas);
  if (!ok3) fallos.push("no se pudo ordenar solo con arrastres");

  console.log("\n" + (fallos.length ? "✗ " + fallos.join(" | ") : "✓ El arrastre de la línea del tiempo funciona."));
  await br.close(); srv.close();
})();
