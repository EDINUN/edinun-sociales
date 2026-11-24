// Mide la VARIEDAD del Libro 7 · Tema 2: recarga el juego N veces y anota qué sale en
// cada ronda. Nace de la pregunta de la autora el 2026-11-24, antes de construir nada:
// *"¿pero cómo garantizamos variedad en la ronda 1?"*
//
// Qué informa, por ronda:
//   · cuántos ejercicios DISTINTOS salieron en N partidas;
//   · cuántas veces se repitió el MISMO dos partidas seguidas (tiene que ser 0);
//   · el más repetido, para ver si el sorteo está sesgado.
//
// Uso: node .planning/variedad-l7t2.js [partidas]   (por defecto 12)
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8914;
const N = Number(process.argv[2] || 12);
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });


// Hace el primero de los tres movimientos que ofrece la pantalla.
async function gestoCualquiera(p) {
  const ops = await p.evaluate(() => Array.from(document.querySelectorAll('[data-qa="opcion"]')).map((e) => e.getAttribute("data-g")));
  const g = ops[0];
  const z = await (await p.$('[data-qa="zona"]')).boundingBox();
  const cx = z.x + z.width / 2, cy = z.y + z.height / 2 - 30;
  if (g === "circulo") {
    const r = 56;
    await p.mouse.move(cx + r, cy); await p.mouse.down();
    for (let a = 15; a <= 375; a += 15) await p.mouse.move(cx + r * Math.cos(a * Math.PI / 180), cy + r * Math.sin(a * Math.PI / 180));
    await p.mouse.up(); await p.waitForTimeout(260); return;
  }
  if (g === "vaiven") {
    await p.mouse.move(cx, cy); await p.mouse.down();
    await p.mouse.move(cx + 70, cy, { steps: 6 });
    await p.mouse.move(cx - 70, cy, { steps: 8 });
    await p.mouse.move(cx + 60, cy, { steps: 8 });
    await p.mouse.up(); await p.waitForTimeout(260); return;
  }
  const d = { abajo: [0, 60], arriba: [0, -60], atras: [-80, 0] }[g];
  await p.mouse.move(cx - d[0] / 2, cy - d[1] / 2); await p.mouse.down();
  await p.mouse.move(cx + d[0] / 2, cy + d[1] / 2, { steps: 10 });
  await p.mouse.up(); await p.waitForTimeout(260);
}

async function abrir(p) {
  await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
  await p.waitForSelector("button:has-text('Libro 7')", { timeout: 60000 });
  await p.click("button:has-text('Libro 7')");
  await p.click("button:has-text('Insurgencia y velasquismo')");
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
  const r1 = [], r1c = [], r2 = [], r3 = [];
  for (let i = 0; i < N; i++) {
    await abrir(p);
    // R1 · qué curva y qué tres años entraron
    await p.waitForSelector('[data-qa="nudo"]');
    const anios = await p.$$eval("text", (ts) => ts.map((t) => t.textContent.trim()).filter((t) => /^(18|19|20)\d\d$/.test(t)));
    r1c.push(anios[0]);                       // el año de partida identifica la curva
    r1.push(anios.join("|"));
    // Para llegar a las otras dos rondas se resuelve la R1 de cualquier manera.
    for (let k = 0; k < 3; k++) { const z = await (await p.$$('[data-qa="nudo"]'))[k].boundingBox(); await p.mouse.move(z.x + z.width / 2, z.y + z.height / 2); await p.mouse.down(); await p.mouse.up(); await p.waitForTimeout(130); }
    await p.click("button:has-text('¡VERIFICAR!')");
    await p.waitForTimeout(4300);
    await p.waitForSelector('[data-qa="zona"]');
    const casos = [];
    for (let k = 0; k < 2; k++) {
      casos.push((await p.textContent('[data-qa="juguete"]')).trim());
      await gestoCualquiera(p);
    }
    r2.push(casos.sort().join("|"));
    await p.click("button:has-text('¡VERIFICAR!')");
    await p.waitForTimeout(4300);
    await p.waitForSelector('[data-qa="autor"]');
    r3.push((await p.$$eval('[data-qa="autor"]', (bs) => bs.map((b) => b.textContent.trim()))).sort().join("|"));
    process.stdout.write(".");
  }
  console.log("\n");
  let mal = 0;
  mal += informe("R1 · la curva", r1c, "3");
  mal += informe("R1 · curva + 3 años", r1, "60");
  mal += informe("R2 · los 3 juguetes", r2, "20");
  mal += informe("R3 · los 3 autores", r3, "56");
  console.log("\n" + (mal === 0
    ? "OK Ninguna ronda repitió el mismo ejercicio dos partidas seguidas."
    : "X Hubo " + mal + " repetición(es) en partidas consecutivas."));
  await br.close(); srv.close();
  process.exit(mal === 0 ? 0 : 1);
})();
