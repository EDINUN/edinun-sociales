// Mide, en píxeles del lienzo (900×540), los huecos verticales de la R1: del enunciado a
// la primera tarjeta y de la última al borde del panel. La autora lee un hueco distinto
// como descuido, así que esto convierte "se ve raro" en dos números comparables.
// Uso: node .planning/huecos-l7t1.js
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8908;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });

(async () => {
  srv.listen(PORT);
  const br = await chromium.launch();
  const p = await (await br.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
  await p.waitForSelector("button:has-text('Libro 7')", { timeout: 60000 });
  await p.click("button:has-text('Libro 7')");
  // Desde que el Libro 7 tiene dos temas hay que ELEGIR uno: con mas de uno no se
  // preselecciona solo y ENTRAR queda apagado (mismo tropiezo que arrastre-r3 en el Libro 6).
  await p.click("button:has-text('La Revolución Liberal')");
  await p.fill("input.ed-input", "QA");
  await p.click("button:has-text('ENTRAR')");
  await p.waitForTimeout(500);
  const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(700); }
  await p.waitForSelector("text=Ordena los hechos");

  const r = await p.evaluate(() => {
    const stage = Array.from(document.querySelectorAll("div")).find((d) => d.style && d.style.width === "900px" && d.style.height === "540px");
    const S = stage.getBoundingClientRect().width / 900;       // px de pantalla por px de lienzo
    const enun = Array.from(document.querySelectorAll("span")).find((s) => s.textContent.indexOf("Ordena los hechos") === 0);
    const cards = Array.from(document.querySelectorAll('[data-qa="via"]'));
    // El panel del fondo: el div con la imagen del ferrocarril.
    const panel = Array.from(document.querySelectorAll("div")).find((d) => (d.style.backgroundImage || "").indexOf("j7t1-ferrocarril") >= 0);
    const q = (el) => el.getBoundingClientRect();
    return {
      arriba: (q(cards[0]).top - q(enun).bottom) / S,
      abajo: (q(panel).bottom - q(cards[cards.length - 1]).bottom) / S,
      alturaTarjeta: q(cards[0]).height / S,
    };
  });
  console.log(`  hueco ARRIBA (enunciado → 1ª tarjeta): ${r.arriba.toFixed(1)} px`);
  console.log(`  hueco ABAJO  (última tarjeta → panel): ${r.abajo.toFixed(1)} px`);
  console.log(`  alto de tarjeta: ${r.alturaTarjeta.toFixed(1)} px`);
  const dif = Math.abs(r.arriba - r.abajo);
  console.log("\n" + (dif <= 6 ? `OK Huecos parejos (difieren ${dif.toFixed(1)} px).` : `X Los huecos difieren ${dif.toFixed(1)} px: se lee como descuido.`));
  await br.close(); srv.close();
  process.exit(dif <= 6 ? 0 : 1);
})();
