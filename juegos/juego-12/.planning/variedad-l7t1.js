// Mide la VARIEDAD del Libro 7 · Tema 1: recarga el juego N veces y anota qué sale en
// cada ronda. Nace de una queja de la autora el 2026-11-23: *"recuerda tener variedad en
// cada ronda porque ahorita me salieron las mismas opciones de hace rato"*.
//
// Qué informa, por ronda:
//   · cuántos ejercicios DISTINTOS salieron en N partidas;
//   · cuántas veces se repitió el MISMO dos partidas seguidas (tiene que ser 0);
//   · el elemento más repetido, para ver si el sorteo está sesgado.
//
// Uso: node .planning/variedad-l7t1.js [partidas]   (por defecto 12)
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8909;
const N = Number(process.argv[2] || 12);
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });

async function abrir(p) {
  await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
  await p.waitForSelector("button:has-text('Libro 7')", { timeout: 60000 });
  await p.click("button:has-text('Libro 7')");
  await p.fill("input.ed-input", "QA");
  await p.click("button:has-text('ENTRAR')");
  await p.waitForTimeout(400);
  const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(700); }
}

function informe(nombre, lista, universo) {
  const distintos = new Set(lista).size;
  let seguidas = 0;
  for (let i = 1; i < lista.length; i++) if (lista[i] === lista[i - 1]) seguidas++;
  const cuenta = {};
  lista.forEach((x) => { cuenta[x] = (cuenta[x] || 0) + 1; });
  const top = Object.keys(cuenta).sort((a, b) => cuenta[b] - cuenta[a])[0];
  console.log(`  ${nombre.padEnd(26)} ${distintos}/${lista.length} distintos` +
    (universo ? ` (de ${universo} posibles)` : "") +
    ` · repetido seguido: ${seguidas} · el más visto salió ${cuenta[top]} vez/veces`);
  return seguidas;
}

(async () => {
  srv.listen(PORT);
  const br = await chromium.launch();
  const p = await (await br.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  const r1 = [], r2 = [], r3 = [];
  for (let i = 0; i < N; i++) {
    await abrir(p);
    // R1 · qué 4 hechos entraron (ordenados, para que el barajado no cuente como variedad)
    await p.waitForSelector('[data-qa="via"]');
    r1.push((await p.$$eval('[data-qa="via"]', (bs) => bs.map((b) => b.textContent.replace(/\s+/g, " ").replace(/^\d+\s*/, "").slice(0, 22)))).sort().join("|"));
    // R2 y R3 hay que alcanzarlas: se resuelve la R1 de cualquier manera.
    await p.click("button:has-text('¡VERIFICAR!')");
    await p.waitForTimeout(4300);
    await p.waitForSelector("text=en manos de quién");
    const asuntos = [];
    while (await p.$('[data-qa="asunto"]')) {
      asuntos.push((await p.textContent('[data-qa="asunto"]')).slice(0, 26));
      await p.click('[data-qa="plat-est"]');
      await p.waitForTimeout(150);
    }
    r2.push(asuntos.sort().join("|"));
    await p.click("button:has-text('¡VERIFICAR!')");
    await p.waitForTimeout(4300);
    await p.waitForSelector("text=Descubre de qué hecho");
    r3.push((await p.textContent('[data-qa="pista"]')).slice(0, 34));
    process.stdout.write(".");
  }
  console.log("\n");
  let mal = 0;
  mal += informe("R1 · los 4 hechos", r1, "126");
  mal += informe("R2 · los 2 asuntos", r2, "más de 100");
  mal += informe("R3 · el expediente", r3, "8");
  console.log("\n" + (mal === 0
    ? "OK Ninguna ronda repitió el mismo ejercicio dos partidas seguidas."
    : "X Hubo " + mal + " repetición(es) en partidas consecutivas."));
  await br.close(); srv.close();
  process.exit(mal === 0 ? 0 : 1);
})();
