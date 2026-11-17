// e2e del LIBRO 6 · TEMA 1 de juego-12 ("Los primeros años del Ecuador").
// Partida PERFECTA (11 ⭐) y partida FALLADA (0 ⭐ con revelado), sin errores de consola.
// ⚠ El Home es de DOS NIVELES: hay que abrir el Libro 6 antes de ver el tema.
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales";
const PORT = 8881;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });

// Quién SÍ podía ser ciudadano, según el banco del juego.
const CIUDADANOS = ["Don Ramón", "Don Tomás", "Capitán Vargas", "Padre Ignacio"];
// Orden correcto de la pirámide, de arriba abajo.
const PIRAMIDE = ["Élite terrateniente", "Militares, comerciantes", "Indígenas, campesinos", "Afroamericanos esclavizados"];
const POBLACION = { "Quito": 25000, "Cuenca": 18000, "Riobamba": 7600, "Guayaquil": 6000 };
const BAR_MAX = 26000, BAR_W = 236;

const hud = (p) => p.evaluate(() => { const d = Array.from(document.querySelectorAll("div")).find((x) => /^⭐\s*\d+$/.test(x.textContent.trim())); return d ? parseInt(d.textContent.replace(/\D/g, ""), 10) : -1; });

async function entrar(p) {
  await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
  await p.waitForSelector("button:has-text('Libro 6')");
  await p.click("button:has-text('Libro 6')");
  await p.waitForSelector("input.ed-input");
  await p.fill("input.ed-input", "QA");
  await p.click("button:has-text('ENTRAR')");
  await p.waitForTimeout(450);
  const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(650); }
  await p.waitForSelector("text=Decide quién podía ser ciudadano");
}

async function jugarR1(p, bien) {
  const tarjetas = await p.$$("div[style*='width: 221px']");
  for (const t of tarjetas) {
    const txt = (await t.innerText()).replace(/\s+/g, " ");
    const esCiudadano = CIUDADANOS.some((n) => txt.indexOf(n) >= 0);
    const quiero = bien ? esCiudadano : !esCiudadano;
    const btn = await t.$(quiero ? "button:has-text('SÍ')" : "button:has-text('NO')");
    await btn.click();
    await p.waitForTimeout(80);
  }
  await p.click("button:has-text('¡VERIFICAR!')");
  await p.waitForTimeout(4300);
}

async function jugarR2(p, bien) {
  await p.waitForSelector("text=Arma la pirámide social");
  // Los cuatro escalones se identifican por su ancho (172 · 250 · 328 · 406).
  const anchos = [172, 250, 328, 406];
  // Se leen las TRES fichas y su escalón correcto ANTES de colocar ninguna.
  // ⚠ La ficha empieza por el EMOJI, así que no vale indexOf(...) === 0.
  const fichas = await p.$$("div[style*='min-height: 44px'] > button");
  const plan = [];
  for (const f of fichas) {
    const texto = (await f.innerText()).replace(/\s+/g, " ").trim();
    plan.push({ texto, destino: PIRAMIDE.findIndex((x) => texto.indexOf(x) >= 0) });
  }
  // ⚠ Para fallar hay que ROTAR los destinos entre las tres fichas, no "elegir cualquier
  // otro libre": eligiendo de forma ávida, la última ficha se queda sin más opción que su
  // propio escalón y la partida fallada acababa sumando 1 ⭐ de vez en cuando.
  for (let i = 0; i < plan.length; i++) {
    const quiero = bien ? plan[i].destino : plan[(i + 1) % plan.length].destino;
    // Se busca la ficha por su texto entre las que quedan (el `:has-text` con acentos y
    // comillas dentro del selector no casaba).
    let ficha = null;
    for (const f of await p.$$("div[style*='min-height: 44px'] > button")) {
      if ((await f.innerText()).replace(/\s+/g, " ").trim() === plan[i].texto) { ficha = f; break; }
    }
    if (!ficha) continue;
    await ficha.click();
    const sel = await p.$(`button[style*='width: ${anchos[quiero]}px']`);
    if (sel) await sel.click();
    await p.waitForTimeout(110);
  }
  await p.click("button:has-text('¡VERIFICAR!')");
  await p.waitForTimeout(4300);
}

// R3: ordenar la línea del tiempo intercambiando tarjetas de dos en dos.
// El año no se ve mientras se juega, así que el orden correcto se deduce del BANCO:
// cada hecho se reconoce por un trozo de su texto.
const CRONOLOGIA = [
  "La Asamblea se reúne en Riobamba",
  "Termina el periodo constitucional",
  "En Ambato se escribe la segunda",
  "El Congreso nombra otra vez",
  "Flores reúne en Quito una nueva",
];
async function jugarR3(p, bien) {
  await p.waitForSelector("text=Ordena los hechos");
  const tarjetas = () => p.$$("button[style*='min-height: 70px']");
  const actual = [];
  for (const t of await tarjetas()) {
    const texto = (await t.innerText()).replace(/\s+/g, " ");
    actual.push(CRONOLOGIA.findIndex((x) => texto.indexOf(x) >= 0));
  }
  // Orden correcto = los hechos presentes, de menor a mayor índice del banco (que va por año).
  const objetivo = actual.slice().sort((a, b) => a - b);
  const meta = bien ? objetivo : objetivo.slice(1).concat(objetivo[0]);   // rotar = fallar todo
  // Ordenación por intercambios: se lleva a su sitio el que toca, uno a uno.
  for (let i = 0; i < meta.length; i++) {
    if (actual[i] === meta[i]) continue;
    const j = actual.indexOf(meta[i]);
    const ts = await tarjetas();
    await ts[i].click(); await p.waitForTimeout(90);
    await ts[j].click(); await p.waitForTimeout(140);
    const t = actual[i]; actual[i] = actual[j]; actual[j] = t;
  }
  await p.click("button:has-text('¡VERIFICAR!')");
  await p.waitForTimeout(1200);
}

async function partida(p, bien, etiqueta) {
  await entrar(p);
  await jugarR1(p, bien);
  const s1 = await hud(p);
  await jugarR2(p, bien);
  const s2 = await hud(p);
  await jugarR3(p, bien);
  let s3 = s2;
  for (let i = 0; i < 20; i++) { const h = await hud(p); if (h >= 0) s3 = h; await p.waitForTimeout(200); }
  console.log("  " + etiqueta + ": R1 → " + s1 + " ⭐ · R2 → " + s2 + " ⭐ · total " + s3 + " ⭐");
  const lin = (await p.evaluate(() => document.body.innerText)).split("\n").map((x) => x.trim()).filter(Boolean);
  console.log("  reporte: " + (lin.find((x) => /acertaste/.test(x)) || "(sin reporte)"));
}

(async () => {
  srv.listen(PORT);
  const br = await chromium.launch();
  const p = await (await br.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  const errores = [];
  // Los 404 de `assets/persona-*.jpg` son esperados mientras la autora no entregue las
  // ilustraciones: el juego cae al emoji de respaldo. No se cuentan como error.
  p.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errores.push(m.text()); });
  p.on("requestfailed", () => {});
  p.on("pageerror", (e) => errores.push("pageerror: " + e.message));
  console.log("── PARTIDA PERFECTA (esperado 4 · 7 · 11 ⭐) ──");
  await partida(p, true, "perfecta");
  console.log("\n── PARTIDA FALLADA (esperado 0 ⭐) ──");
  await partida(p, false, "fallada");
  console.log("\nErrores de consola: " + (errores.length ? errores.join(" | ") : "ninguno"));
  await br.close(); srv.close();
})();
