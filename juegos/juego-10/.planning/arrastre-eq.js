// Comprueba el ARRASTRE REAL de la R1 del Tema 4 (pointerdown → move → up con el ratón):
//   1. de la bandeja a un espacio,
//   2. de un espacio a OTRO espacio (lo que pidió la autora el 2026-11-17),
//   3. de un espacio a fuera → la palabra vuelve a la bandeja,
//   4. toque simple sobre una palabra puesta → la saca y la deja elegida.
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8878;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });

const centro = (b) => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 });
async function arrastrar(p, desde, hasta) {
  const a = centro(desde), z = centro(hasta);
  await p.mouse.move(a.x, a.y);
  await p.mouse.down();
  await p.mouse.move((a.x + z.x) / 2, (a.y + z.y) / 2, { steps: 6 });
  await p.mouse.move(z.x, z.y, { steps: 6 });
  await p.mouse.up();
  await p.waitForTimeout(180);
}
const textos = async (els) => { const r = []; for (const e of els) r.push((await e.innerText()).trim()); return r; };

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
  await p.waitForTimeout(500);
  const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(700); }
  await p.waitForSelector("text=le faltan cuatro palabras");

  // 1 · bandeja → primer espacio
  let piezas = await p.$$("div[style*='flex-wrap: wrap'] > button");
  const palabra = (await piezas[0].innerText()).trim();
  let huecos = await p.$$("span[data-hueco]");
  await arrastrar(p, await piezas[0].boundingBox(), await huecos[0].boundingBox());
  let h0 = (await (await p.$$("span[data-hueco]"))[0].innerText()).trim();
  console.log("1 · bandeja → espacio 1: '" + palabra + "' → espacio 1 dice '" + h0 + "'" + (h0 === palabra ? "  ✓" : "  ✗"));
  if (h0 !== palabra) fallos.push("no cayó en el espacio 1");

  // 2 · espacio 1 → espacio 3
  huecos = await p.$$("span[data-hueco]");
  await arrastrar(p, await huecos[0].boundingBox(), await huecos[2].boundingBox());
  huecos = await p.$$("span[data-hueco]");
  const t = await textos(huecos);
  const ok2 = t[0] === "" && t[2] === palabra;
  console.log("2 · espacio 1 → espacio 3: espacios = [" + t.map((x) => x || "·").join(", ") + "]" + (ok2 ? "  ✓" : "  ✗"));
  if (!ok2) fallos.push("no se movió de un espacio a otro");

  // 3 · espacio 3 → fuera (sobre el personaje) = vuelve a la bandeja
  huecos = await p.$$("span[data-hueco]");
  const fuera = await (await p.$("text=Yaku")).boundingBox();
  await arrastrar(p, await huecos[2].boundingBox(), fuera);
  huecos = await p.$$("span[data-hueco]");
  piezas = await p.$$("div[style*='flex-wrap: wrap'] > button");
  const enBandeja = (await textos(piezas)).indexOf(palabra) >= 0;
  const ok3 = (await textos(huecos)).every((x) => x === "") && enBandeja;
  console.log("3 · espacio → fuera: '" + palabra + "' vuelve a la bandeja" + (ok3 ? "  ✓" : "  ✗"));
  if (!ok3) fallos.push("soltar fuera no la devolvió a la bandeja");

  // 4 · toque simple sobre una palabra puesta: la saca y queda elegida
  piezas = await p.$$("div[style*='flex-wrap: wrap'] > button");
  huecos = await p.$$("span[data-hueco]");
  await arrastrar(p, await piezas[0].boundingBox(), await huecos[1].boundingBox());
  huecos = await p.$$("span[data-hueco]");
  await huecos[1].click();
  await p.waitForTimeout(150);
  huecos = await p.$$("span[data-hueco]");
  await huecos[3].click();                 // debería colocarse aquí, sin volver a elegirla
  await p.waitForTimeout(180);
  huecos = await p.$$("span[data-hueco]");
  const t4 = await textos(huecos);
  const ok4 = t4[1] === "" && t4[3] !== "";
  console.log("4 · tocar una puesta y tocar otro espacio: espacios = [" + t4.map((x) => x || "·").join(", ") + "]" + (ok4 ? "  ✓" : "  ✗"));
  if (!ok4) fallos.push("el toque no movió la palabra de espacio");

  console.log("\n" + (fallos.length ? "✗ " + fallos.join(" | ") : "✓ El arrastre funciona en los cuatro casos."));
  await br.close(); srv.close();
})();
