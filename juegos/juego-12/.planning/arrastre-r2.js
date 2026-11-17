// Comprueba el ARRASTRE REAL de la pirámide (R2 del Libro 6 · Tema 1), con el ratón:
//   1. de la bandeja a un escalón,
//   2. de un escalón a OTRO escalón,
//   3. de un escalón a fuera → el grupo vuelve a la bandeja,
//   4. toque simple sobre un grupo ya puesto → lo saca y lo deja elegido.
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8886;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });
const CIUDADANOS = ["Don Ramón", "Don Tomás", "Capitán Vargas", "Padre Ignacio"];
const ANCHOS = [172, 250, 328, 406];

const centro = (b) => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 });
async function arrastrar(p, desde, hasta) {
  const a = centro(desde), z = centro(hasta);
  await p.mouse.move(a.x, a.y);
  await p.mouse.down();
  await p.mouse.move((a.x + z.x) / 2, (a.y + z.y) / 2, { steps: 6 });
  await p.mouse.move(z.x, z.y, { steps: 6 });
  await p.mouse.up();
  await p.waitForTimeout(200);
}
const txt = async (h) => (await h.innerText()).replace(/\s+/g, " ").trim();
async function escalonEn(p, i) { return await p.$("button[style*='width: " + ANCHOS[i] + "px']"); }
async function libres(p) { return await p.$$("div[style*='min-height: 44px'] > button"); }

(async () => {
  srv.listen(PORT);
  const br = await chromium.launch();
  const p = await (await br.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  const fallos = [];
  p.on("pageerror", (e) => fallos.push("pageerror: " + e.message));
  await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
  await p.waitForSelector("button:has-text('Libro 6')");
  await p.click("button:has-text('Libro 6')");
  await p.fill("input.ed-input", "QA");
  await p.click("button:has-text('ENTRAR')");
  await p.waitForTimeout(500);
  const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(700); }

  // R1 de paso
  for (const t of await p.$$("div[style*='width: 221px']")) {
    const s = (await t.innerText()).replace(/\s+/g, " ");
    await (await t.$(CIUDADANOS.some((n) => s.indexOf(n) >= 0) ? "button:has-text('SÍ')" : "button:has-text('NO')")).click();
  }
  await p.click("button:has-text('¡VERIFICAR!')");
  await p.waitForTimeout(4300);
  await p.waitForSelector("text=Arma la pirámide social");

  // Dos escalones libres cualesquiera (saltando el ancla)
  const vacios = [];
  for (let i = 0; i < 4; i++) {
    const e = await escalonEn(p, i);
    if (e && /escalón libre/.test(await txt(e))) vacios.push(i);
  }
  const [A, B] = vacios;

  // 1 · bandeja → escalón A
  let fichas = await libres(p);
  const grupo = await txt(fichas[0]);
  await arrastrar(p, await fichas[0].boundingBox(), await (await escalonEn(p, A)).boundingBox());
  let ok1 = (await txt(await escalonEn(p, A))) === grupo;
  console.log("1 · bandeja → escalón: '" + grupo.slice(0, 26) + "'" + (ok1 ? "  ✓" : "  ✗"));
  if (!ok1) fallos.push("no cayó en el escalón");

  // 2 · escalón A → escalón B
  await arrastrar(p, await (await escalonEn(p, A)).boundingBox(), await (await escalonEn(p, B)).boundingBox());
  const ok2 = (await txt(await escalonEn(p, B))) === grupo && /escalón libre/.test(await txt(await escalonEn(p, A)));
  console.log("2 · escalón → escalón" + (ok2 ? "  ✓" : "  ✗"));
  if (!ok2) fallos.push("no se movió de un escalón a otro");

  // 3 · escalón B → fuera (sobre el personaje) = vuelve a la bandeja
  const fuera = await (await p.$("text=Andi")).boundingBox();
  await arrastrar(p, await (await escalonEn(p, B)).boundingBox(), fuera);
  const enBandeja = (await Promise.all((await libres(p)).map(txt))).indexOf(grupo) >= 0;
  const ok3 = enBandeja && /escalón libre/.test(await txt(await escalonEn(p, B)));
  console.log("3 · escalón → fuera: vuelve a la bandeja" + (ok3 ? "  ✓" : "  ✗"));
  if (!ok3) fallos.push("soltar fuera no lo devolvió a la bandeja");

  // 4 · toque simple sobre uno ya puesto: lo saca y queda elegido
  fichas = await libres(p);
  await arrastrar(p, await fichas[0].boundingBox(), await (await escalonEn(p, A)).boundingBox());
  const puesto = await txt(await escalonEn(p, A));
  await (await escalonEn(p, A)).click();
  await p.waitForTimeout(200);
  await (await escalonEn(p, B)).click();
  await p.waitForTimeout(200);
  const ok4 = (await txt(await escalonEn(p, B))) === puesto && /escalón libre/.test(await txt(await escalonEn(p, A)));
  console.log("4 · tocar uno puesto y tocar otro escalón" + (ok4 ? "  ✓" : "  ✗"));
  if (!ok4) fallos.push("el toque no movió el grupo de escalón");

  console.log("\n" + (fallos.length ? "✗ " + fallos.join(" | ") : "✓ El arrastre de la pirámide funciona en los cuatro casos."));
  await br.close(); srv.close();
})();
