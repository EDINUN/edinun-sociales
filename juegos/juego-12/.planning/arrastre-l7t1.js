// Comprueba que en la R1 del Libro 7 · Tema 1 la tarjeta SE QUEDA DONDE LA SUELTAS,
// agarrándola por donde sea. Nace de un fallo que reportó la autora el 2026-11-23:
// *"si arrastro una opción debe poder colocarse en ese espacio, porque si no arrastro y
// no se queda ahí"*.
//
// La causa era que el destino se medía por la posición del DEDO. Las tarjetas miden 74 px:
// agarrando una por el borde superior, el dedo queda 37 px por encima de su centro, así
// que la tarjeta ya cubría el hueco de abajo y el dedo seguía más cerca del de arriba.
// Al soltar, volvía a su sitio.
//
// Por eso se prueba agarrando por el BORDE DE ARRIBA, por el CENTRO y por el BORDE DE
// ABAJO: solo el del centro pasaba antes.
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8906;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });

// ⚠ La tarjeta lleva DENTRO su número de puesto ("1", "2"…), que cambia justo cuando se
// reordena: hay que quitarlo o ninguna tarjeta se reconoce después de moverla.
const textos = (p) => p.$$eval('[data-qa="via"]', (bs) => bs.map((b) => b.textContent.replace(/\s+/g, " ").replace(/^\d+\s*/, "").trim().slice(0, 36)));

async function abrir(p) {
  await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
  await p.waitForSelector("button:has-text('Libro 7')", { timeout: 60000 });
  await p.click("button:has-text('Libro 7')");
  await p.fill("input.ed-input", "QA");
  await p.click("button:has-text('ENTRAR')");
  await p.waitForTimeout(500);
  const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(700); }
  await p.waitForSelector("text=Ordena los hechos");
}

// Arrastra la tarjeta `desde` hasta el hueco `hasta`, agarrándola en `agarre`
// (0 = borde de arriba · 0.5 = centro · 1 = borde de abajo) y devuelve el orden final.
async function arrastrar(p, desde, hasta, agarre) {
  const cs = await p.$$('[data-qa="via"]');
  const a = await cs[desde].boundingBox(), b = await cs[hasta].boundingBox();
  const margen = 6;
  const y0 = a.y + Math.min(a.height - margen, Math.max(margen, a.height * agarre));
  const destinoCentro = b.y + b.height / 2;
  // El dedo viaja lo mismo que tiene que viajar la tarjeta: la diferencia entre centros.
  const y1 = y0 + (destinoCentro - (a.y + a.height / 2));
  const x = a.x + a.width / 2;
  await p.mouse.move(x, y0);
  await p.mouse.down();
  await p.mouse.move(x, y0 + (y1 - y0) * 0.4, { steps: 6 });
  await p.mouse.move(x, y1, { steps: 8 });
  await p.mouse.up();
  await p.waitForTimeout(320);
  return textos(p);
}

(async () => {
  srv.listen(PORT);
  const br = await chromium.launch();
  const p = await (await br.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  const mal = [];
  const AGARRES = [["borde de arriba", 0], ["centro", 0.5], ["borde de abajo", 1]];
  const CASOS = [[0, 1], [0, 3], [3, 0], [2, 1], [1, 3]];

  for (const [nombre, agarre] of AGARRES) {
    for (const [desde, hasta] of CASOS) {
      await abrir(p);
      const antes = await textos(p);
      const esperado = antes.slice();
      const movida = esperado.splice(desde, 1)[0];
      esperado.splice(hasta, 0, movida);
      const despues = await arrastrar(p, desde, hasta, agarre);
      const ok = despues.join("|") === esperado.join("|");
      console.log(`  agarrada por el ${nombre.padEnd(16)} ${desde} → ${hasta}: ${ok ? "se queda donde la solté" : "X VOLVIÓ A SU SITIO (quedó en " + despues.indexOf(movida) + ")"}`);
      if (!ok) mal.push(`${nombre}: ${desde} → ${hasta} no se quedó`);
    }
  }

  // El toque (sin mover) sigue siendo el respaldo: intercambia dos tarjetas.
  await abrir(p);
  const antes = await textos(p);
  let cs = await p.$$('[data-qa="via"]');
  await cs[0].click(); await p.waitForTimeout(120);
  cs = await p.$$('[data-qa="via"]');
  await cs[2].click(); await p.waitForTimeout(220);
  const tras = await textos(p);
  const swapOk = tras[0] === antes[2] && tras[2] === antes[0] && tras[1] === antes[1];
  console.log("  respaldo por toque (intercambia 0 y 2): " + (swapOk ? "OK" : "X"));
  if (!swapOk) mal.push("el toque ya no intercambia dos tarjetas");

  console.log("\n" + (mal.length ? "X " + mal.join(" · ") : "OK La tarjeta se queda donde la sueltas, se agarre por donde se agarre, y el toque sigue intercambiando."));
  await br.close(); srv.close();
  process.exit(mal.length ? 1 : 0);
})();
