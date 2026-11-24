// Capturas del Libro 7 · Tema 2 para mirarlas a ojo (lo que ningún detector ve: si una
// curva queda rara, si la barra se entiende, si los hilos se cruzan feo).
// Uso: node .planning/shot-l7t2.js <carpeta-de-salida>
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8915;
const OUT = process.argv[2];
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

(async () => {
  if (!OUT) { console.error("Uso: node shot-l7t2.js <carpeta-de-salida>"); process.exit(1); }
  fs.mkdirSync(OUT, { recursive: true });
  srv.listen(PORT);
  const br = await chromium.launch();
  const p = await (await br.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  const tiro = async (n) => { await p.screenshot({ path: path.join(OUT, n + ".png") }); console.log("  " + n + ".png"); };

  await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
  await p.waitForSelector("button:has-text('Libro 7')", { timeout: 60000 });
  await p.click("button:has-text('Libro 7')");
  await tiro("00-temas");
  await p.click("button:has-text('Insurgencia y velasquismo')");
  await p.fill("input.ed-input", "QA");
  await p.click("button:has-text('ENTRAR')");
  await p.waitForTimeout(500);
  const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(700); }

  // ── R1 · la curva ──
  await p.waitForSelector('[data-qa="nudo"]');
  await tiro("01-r1-curva");
  for (let k = 0; k < 3; k++) {
    const z = await (await p.$$('[data-qa="nudo"]'))[k].boundingBox();
    await p.mouse.move(z.x + z.width / 2, z.y + z.height / 2); await p.mouse.down();
    await p.mouse.move(z.x + z.width / 2, z.y + z.height * (k === 1 ? 0.15 : 0.8), { steps: 6 });
    if (k === 0) await tiro("02-r1-en-pleno-arrastre");
    await p.mouse.up(); await p.waitForTimeout(200);
  }
  await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(1300);
  await tiro("03-r1-revelado");
  await p.waitForTimeout(3600);

  // ── R2 · la feria de juegos ──
  await p.waitForSelector('[data-qa="zona"]');
  await tiro("04-r2-feria");
  // ⚠ Para mirar el revelado hace falta FALLAR: se hace el mismo gesto en los tres
  // juguetes, así que al menos dos quedan mal.
  {
    const z = await (await p.$('[data-qa="zona"]')).boundingBox();
    await p.mouse.move(z.x + z.width / 2, z.y + 40); await p.mouse.down();
    await p.mouse.move(z.x + z.width / 2, z.y + 110, { steps: 8 });
    await tiro("05-r2-trazo");
    await p.mouse.up(); await p.waitForTimeout(280);
  }
  for (let k = 0; k < 2; k++) await gestoCualquiera(p);
  await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(1000);
  await tiro("06-r2-revelado");
  await p.waitForTimeout(3600);

  // ── R3 · los hilos ──
  await p.waitForSelector('[data-qa="autor"]');
  await tiro("08-r3-hilos");
  // ⚠ Para mirar el revelado hace falta FALLAR, y el corrimiento ciclico no lo garantiza:
  // como las dos columnas se barajan por separado, "el de al lado" puede ser el correcto y
  // la captura sale toda en verde. Asi que se cuelga cada autor de una obra que NO es la
  // suya, con la clave escrita aqui. (Misma trampa que shot-l7t1.js con los platillos.)
  const OBRA_DE = {
    "Jorge Icaza": "Huasipungo", "Enrique Gil Gilbert": "Nuestro Pan",
    "Joaquín Gallegos Lara": "Las cruces sobre el agua", "Alfredo Pareja Diezcanseco": "La hoguera bárbara",
    "José de la Cuadra": "Los Sangurimas", "César Dávila Andrade": "Boletín y Elegía de las Mitas",
    "Pío Jaramillo Alvarado": "El indio ecuatoriano", "Fernando Chaves": "Plata y Bronce",
  };
  const autores = await p.$$eval('[data-qa="autor"]', (bs) => bs.map((b) => b.textContent.trim()));
  const obras = await p.$$eval('[data-qa="obra"]', (bs) => bs.map((b) => b.textContent.trim()));
  for (let k = 0; k < autores.length; k++) {
    const n = Object.keys(OBRA_DE).find((x) => autores[k].indexOf(x) !== -1);
    const correcto = obras.findIndex((o) => o.indexOf(OBRA_DE[n]) !== -1);
    const j = (correcto + 1) % obras.length;
    const as = await p.$$('[data-qa="autor"]'), os = await p.$$('[data-qa="obra"]');
    await as[k].click(); await p.waitForTimeout(80);
    await os[j].click(); await p.waitForTimeout(140);
    if (k === 0) await tiro("09-r3-un-hilo");
  }
  await tiro("10-r3-cruzados");
  await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(1000);
  await tiro("11-r3-revelado");

  await br.close(); srv.close();
})();
