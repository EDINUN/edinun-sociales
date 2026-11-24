// La tarjeta beige de la ronda de la curva (Libro 7 · Tema 2) tiene que ir SIEMPRE con el
// nudo que toca.
//
// 📌 Por qué existe: al soltar un nudo, la tarjeta se quedaba enseñando el hecho del año
// recién colocado mientras el nudo encendido ya era el siguiente. La autora lo cazó a ojo
// el 2026-11-24 ("una vez que arrastré el nudo, el texto del cuadro beige debe cambiarse
// porque vamos al siguiente nudo"). Ningún detector de solapes ve esto: el texto está
// perfectamente colocado, solo que es el que no toca.
//
// Comprueba las dos mitades de la regla:
//   · al SOLTAR, la tarjeta pasa al siguiente año;
//   · mientras AGARRAS un nudo ya colocado, la tarjeta vuelve a enseñar SU año.
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8928;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });

// El año de la tarjeta: la pastilla que va justo antes del texto del hecho.
const anioTarjeta = (p) => p.evaluate(() => {
  const h = document.querySelector('[data-qa="hecho"]');
  if (!h) return 0;
  const fila = h.parentElement;
  const m = (fila.textContent || "").match(/(18|19|20)\d\d/);
  return m ? parseInt(m[0], 10) : 0;
});
// Los años pintados bajo el gráfico, en orden (el primero es el punto de partida).
const aniosEje = (p) => p.evaluate(() => Array.from(document.querySelectorAll("text"))
  .map((t) => t.textContent.trim()).filter((t) => /^(18|19|20)\d\d$/.test(t)).map(Number));

(async () => {
  srv.listen(PORT);
  const br = await chromium.launch();
  const p = await (await br.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  const fallos = [];

  await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
  await p.waitForSelector("button:has-text('Libro 7')", { timeout: 60000 });
  await p.click("button:has-text('Libro 7')");
  await p.click("button:has-text('Insurgencia y velasquismo')");
  await p.fill("input.ed-input", "QA");
  await p.click("button:has-text('ENTRAR')");
  await p.waitForTimeout(500);
  const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(700); }
  await p.waitForSelector('[data-qa="nudo"]', { timeout: 30000 });

  const anios = (await aniosEje(p)).slice(1);        // fuera el punto de partida
  console.log("años en juego: " + anios.join(" · "));

  // ── Al soltar cada nudo, la tarjeta tiene que pasar al siguiente año ──
  for (let k = 0; k < anios.length; k++) {
    const antes = await anioTarjeta(p);
    if (antes !== anios[k]) fallos.push("antes de mover el nudo " + (k + 1) + " la tarjeta decía " + antes + " y tocaba " + anios[k]);
    const q = await (await p.$$('[data-qa="nudo"]'))[k].boundingBox();
    await p.mouse.move(q.x + q.width / 2, q.y + q.height / 2);
    await p.mouse.down();
    await p.mouse.move(q.x + q.width / 2, q.y + q.height / 2 - 30, { steps: 5 });
    await p.mouse.up();
    await p.waitForTimeout(260);
    const despues = await anioTarjeta(p);
    const esperado = k + 1 < anios.length ? anios[k + 1] : 0;   // al final ya no hay tarjeta
    console.log("suelto " + anios[k] + " → la tarjeta dice " + (despues || "(ninguna)") + (esperado ? "  (esperado " + esperado + ")" : "  (esperado: ninguna)"));
    if (esperado && despues !== esperado) fallos.push("tras soltar " + anios[k] + " la tarjeta se quedó en " + despues + " en vez de pasar a " + esperado);
  }

  // ── Agarrando un nudo YA COLOCADO, la tarjeta vuelve a su año ──
  const q0 = await (await p.$$('[data-qa="nudo"]'))[0].boundingBox();
  await p.mouse.move(q0.x + q0.width / 2, q0.y + q0.height / 2);
  await p.mouse.down();
  await p.mouse.move(q0.x + q0.width / 2, q0.y + q0.height / 2 - 12, { steps: 4 });
  await p.waitForTimeout(220);
  const agarrado = await anioTarjeta(p);
  console.log("agarrando otra vez el primero → la tarjeta dice " + agarrado + "  (esperado " + anios[0] + ")");
  if (agarrado !== anios[0]) fallos.push("al volver a agarrar el primer nudo la tarjeta no enseña su año (" + agarrado + " en vez de " + anios[0] + ")");
  await p.mouse.up();

  const texto = await p.evaluate(() => document.body.innerText);
  if (texto.indexOf("cambiarlo cuando quieras") >= 0) fallos.push("el bocadillo sigue diciendo 'Puedes cambiarlo cuando quieras'");

  console.log("\n" + (fallos.length ? "X PROBLEMAS:\n - " + fallos.join("\n - ") : "OK La tarjeta va siempre con el nudo que toca."));
  await br.close(); srv.close();
})();
