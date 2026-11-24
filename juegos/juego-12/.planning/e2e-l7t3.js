// E2E del Libro 7 · Tema 3 ("Transformación agraria"): juega el tema entero dos veces,
// una acertando todo y otra fallando, y comprueba las estrellas, el revelado de las tres
// rondas y que no haya errores de consola.
//
// Esperado perfecto: R1 3 ⭐ (soldado + armas + jefes) · R2 3 ⭐ (3 años) · R3 3 ⭐ = **9**.
// Esperado fallado: **1 ⭐** — la R3 obliga a encender TRES y solo hay DOS frases falsas,
// así que al menos una verdadera entra siempre. Su peor nota es 1, no 0.
//
// ⚠ La clave va ESCRITA AQUÍ, no leída del juego: si se lee del propio juego, el test se
// da la razón a sí mismo.
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8921;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });

// ── CLAVES (copiadas a mano del bloque L7T3) ──
// R1: cuándo empezó y cuándo terminó cada gobierno (pp. 54-57).
const GOB = {
  "Galo Plaza Lasso": [1948, 1952],
  "Velasco Ibarra · 3.er mandato": [1952, 1956],
  "Camilo Ponce Enríquez": [1956, 1960],
  "Velasco Ibarra · 4.º mandato": [1960, 1961],
  "Carlos Julio Arosemena Monroy": [1961, 1963],
  "Primera Junta Militar": [1963, 1966],
  "Otto Arosemena Gómez": [1966, 1968],
  "Velasco Ibarra · 5.º mandato": [1968, 1972],
};
const A0 = 1948, A1 = 1972;
const CAJAS = { 1948: 1, 1950: 2, 1955: 6, 1960: 9 };   // tabla de la p.55, 1 caja = 100 mil t
const VERDADERAS = [
  "Se eliminó el huasipungo",
  "Se repartieron tierras",
  "Mucha gente tuvo que migrar",
  "Bajó la producción de alimentos",
  "Las haciendas de la Sierra se tecnificaron",
];
const FALSAS = ["recibieron créditos", "mejoraron su calidad de vida", "comprar herramientas"];

const estrellas = (p) => p.evaluate(() => {
  const d = Array.from(document.querySelectorAll("div")).find((x) => /^⭐\s*\d+$/.test(x.textContent.trim()));
  return d ? parseInt(d.textContent.replace(/\D/g, ""), 10) : -1;
});

async function abrirTema(p) {
  // ⚠ 60 s: en frío el navegador baja React + Babel Standalone (~3 MB) del CDN.
  await p.waitForSelector("button:has-text('Libro 7')", { timeout: 60000 });
  await p.click("button:has-text('Libro 7')");
  await p.click("button:has-text('Transformación agraria')");
  await p.waitForSelector("button:has-text('ENTRAR')");
  await p.fill("input.ed-input", "QA");
  await p.click("button:has-text('ENTRAR')");
  await p.waitForTimeout(500);
  const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(700); }
}

async function verificar(p) { await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(900); }

// ── R1 · ¿cuánto le duró? (estirar el borde de la barra) ──
async function r1(p, bien) {
  await p.waitForSelector("text=¿Hasta cuándo gobernó");
  const ejes = await p.evaluate(() => Array.from(document.querySelectorAll('[data-qa="eje"]')).map((e) => {
    const r = e.getBoundingClientRect();
    return { n: e.parentElement.firstElementChild.firstElementChild.textContent.replace(/DESDE \d+/, "").trim(), x: r.left, w: r.width, y: r.top + r.height / 2 };
  }));
  if (ejes.length !== 3) throw new Error("R1: salieron " + ejes.length + " barras, no 3");
  // ⚠ La regla de años NO empieza en 1948: arranca en el gobierno más antiguo de ESTA
  //   partida. Con el 1948 fijo, el test pinchaba en años que no eran y la partida
  //   "fallada" acertaba de casualidad.
  const inicio = Math.min.apply(null, ejes.map((e) => (GOB[e.n] || [A0])[0]));
  for (const e of ejes) {
    const clave = GOB[e.n];
    if (!clave) throw new Error("R1: gobierno desconocido en la clave → " + e.n);
    const real = clave[1] - clave[0];
    // Fallando: a los largos se les da 1 año y a los cortos se les estira hasta 1972.
    const destino = bien ? clave[1] : (real >= 3 ? clave[0] + 1 : A1);
    const x = e.x + ((destino - inicio) / (A1 - inicio)) * e.w;
    await p.mouse.move(e.x + 2, e.y);
    await p.mouse.down();
    await p.mouse.move(x, e.y, { steps: 8 });
    await p.mouse.up();
    await p.waitForTimeout(120);
  }
  if (await p.$("text=marca dónde terminó")) throw new Error("R1: el revelado se ve ANTES de ¡VERIFICAR!");
  await verificar(p);
  if (!(await p.$("text=marca dónde terminó"))) throw new Error("R1: no salió el revelado");
}

// ── R2 · la bodega del banano ──
async function r2(p, bien) {
  await p.waitForSelector("text=¿Cuánto banano salió");
  const cols = await p.evaluate(() => Array.from(document.querySelectorAll('[data-qa="columna"]')).map((c) => {
    const r = c.getBoundingClientRect();
    return { y: parseInt(c.parentElement.lastElementChild.textContent.trim(), 10), x: r.left + r.width / 2, top: r.top + 10 };
  }));
  if (cols.length !== 3) throw new Error("R2: salieron " + cols.length + " columnas, no 3");
  for (const c of cols) {
    // ⚠ Se toca ARRIBA de la columna: tocar una caja la quita, que es el otro gesto.
    const n = bien ? CAJAS[c.y] : 4;              // 4 cajas falla los cuatro años posibles
    for (let k = 0; k < n; k++) { await p.mouse.click(c.x, c.top); await p.waitForTimeout(45); }
  }
  await verificar(p);
  if (!(await p.$("text=El boom bananero"))) throw new Error("R2: no salió el revelado");
}

// ── R3 · lo que cambió y lo que no ──
async function r3(p, bien) {
  await p.waitForSelector("text=La Reforma Agraria de 1964");
  const lamparas = await p.$$('[data-qa="lampara"]');
  if (lamparas.length !== 5) throw new Error("R3: salieron " + lamparas.length + " lámparas, no 5");
  const textos = [];
  for (const l of lamparas) textos.push(((await l.textContent()) || "").replace(/\s+/g, " "));
  const esV = (t) => VERDADERAS.some((v) => t.indexOf(v) >= 0);
  const esF = (t) => FALSAS.some((v) => t.indexOf(v) >= 0);
  if (textos.filter(esV).length !== 3 || textos.filter(esF).length !== 2) {
    throw new Error("R3: la partida no trae 3 verdaderas + 2 falsas → " + textos.join(" | "));
  }
  // Perfecta: las tres verdaderas. Fallada: las dos falsas + una verdadera (no hay otra
  // forma de encender tres), así que su mejor/peor nota posible es 1 ⭐.
  const quiero = bien ? textos.filter(esV) : textos.filter(esF).concat([textos.filter(esV)[0]]);
  for (let k = 0; k < lamparas.length; k++) if (quiero.indexOf(textos[k]) >= 0) { await lamparas[k].click(); await p.waitForTimeout(90); }
  await verificar(p);
  if (!(await p.$("text=No recibieron apoyo")) && !(await p.$("text=no brindó una mejor")) && !(await p.$("text=No pudieron tecnificar"))) throw new Error("R3: no salió el revelado");
}

async function partida(p, bien) {
  await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
  await abrirTema(p);
  await r1(p, bien); await p.waitForTimeout(3600);
  await r2(p, bien); await p.waitForTimeout(3600);
  await r3(p, bien);
  // ⚠ Las estrellas se leen AQUÍ, no tras una espera larga: al cerrar la última ronda el
  //   juego salta a resultados y el HUD con el contador ya no existe (devolvía -1).
  const e = await estrellas(p);
  await p.waitForTimeout(1500);
  return e;
}

(async () => {
  srv.listen(PORT);
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await ctx.newPage();
  const errores = [];
  p.on("pageerror", (e) => errores.push("pageerror: " + e.message));
  p.on("console", (m) => { if (m.type() === "error" && m.text().indexOf("Failed to load resource") < 0) errores.push("console: " + m.text()); });

  const fallos = [];
  try {
    const perf = await partida(p, true);
    console.log("Partida perfecta: " + perf + " ⭐   (esperado 9)");
    if (perf !== 9) fallos.push("la partida perfecta dio " + perf + " ⭐, no 9");

    const mala = await partida(p, false);
    console.log("Partida fallada:  " + mala + " ⭐   (esperado 1)");
    if (mala !== 1) fallos.push("la partida fallada dio " + mala + " ⭐, no 1");
  } catch (e) { fallos.push(e.message); }

  if (errores.length) fallos.push("errores de consola: " + errores.slice(0, 4).join(" · "));
  console.log("\n" + (fallos.length ? "X PROBLEMAS:\n - " + fallos.join("\n - ") : "OK El Libro 7 · Tema 3 se juega entero, acertando y fallando."));
  await br.close(); srv.close();
})();
