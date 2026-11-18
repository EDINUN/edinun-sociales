// E2E del Libro 6 · Tema 2 ("Revolución Marcista"): juega el tema entero dos veces,
// una acertando todo y otra fallando todo, y comprueba las estrellas, el revelado en
// las tres rondas y que no haya errores de consola.
// Esperado: R1 4 ⭐ (3 cuarteles + las estrellas) · R2 4 ⭐ · R3 3 ⭐ = 11.
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8896;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });

// El contador del HUD: "⭐ 7".
const estrellas = (p) => p.evaluate(() => {
  const d = Array.from(document.querySelectorAll("div")).find((x) => /^⭐\s*\d+$/.test(x.textContent.trim()));
  return d ? parseInt(d.textContent.replace(/\D/g, ""), 10) : -1;
});

async function abrirTema(p) {
  await p.waitForSelector("button:has-text('Libro 6')");
  await p.click("button:has-text('Libro 6')");
  await p.waitForSelector("button:has-text('La Revolución Marcista')");
  await p.click("button:has-text('La Revolución Marcista')");
  await p.fill("input.ed-input", "QA");
  await p.click("button:has-text('ENTRAR')");
  await p.waitForTimeout(500);
  const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(700); }
}

// ── R1: pinta los tres cuarteles y pone las estrellas ──
async function jugarR1(p, bien) {
  await p.waitForSelector("text=Levanta la bandera");
  const quiere = bien ? ["blanco", "azul", "blanco"] : ["rojo", "verde", "amarillo"];
  for (const c of quiere) {
    const b = await p.$(`button:has-text('${c}')`);
    if (!b) throw new Error("no aparece el color " + c);
    await b.click(); await p.waitForTimeout(90);
  }
  const mas = await p.$("button:has-text('+')");
  for (let i = 0; i < (bien ? 3 : 5); i++) { await mas.click(); await p.waitForTimeout(60); }
  await p.click("button:has-text('¡VERIFICAR!')");
}

// ── R2: toca en el mapa la ciudad del gobernante pedido ──
const CIUDAD_DE = { "García Moreno": "Quito", "Guillermo Franco": "Guayaquil", "Jerónimo Carrión": "Cuenca", "Manuel Carrión Pinzano": "Loja" };
async function jugarR2(p, bien) {
  await p.waitForSelector("text=cuatro gobiernos a la vez");
  const usadas = [];
  for (let k = 0; k < 4; k++) {
    const jefe = (await p.textContent("div[style*='border: 2.5px solid rgb(79, 216, 255)'] div:last-child")).trim();
    let ciudad = CIUDAD_DE[jefe];
    if (!ciudad) throw new Error("gobernante desconocido: " + jefe);
    if (!bien) {
      // ⚠ Fallar eligiendo "cualquier otra libre" deja al último turno sin más opción
      // que la correcta, y la partida fallada acababa sumando 1 ⭐. Se usa un CORRIMIENTO
      // cíclico de la lista de ciudades: es una permutación sin ningún punto fijo, así
      // que ninguna cae en su sitio y nunca chocan dos.
      const CICLO = ["Quito", "Guayaquil", "Cuenca", "Loja"];
      ciudad = CICLO[(CICLO.indexOf(ciudad) + 1) % CICLO.length];
    }
    usadas.push(ciudad);
    const libre = await p.evaluate((c) => {
      const t = Array.from(document.querySelectorAll("text")).find((x) => x.textContent.trim() === c);
      if (!t) return null;
      const g = t.closest("g"); if (!g) return null;
      const r = g.getBoundingClientRect();
      return { x: r.left + 8, y: r.top + r.height / 2 };
    }, ciudad);
    if (!libre) throw new Error("no se encontró la ciudad " + ciudad);
    await p.mouse.click(libre.x, libre.y);
    await p.waitForTimeout(140);
  }
  await p.click("button:has-text('¡VERIFICAR!')");
}

// ── R3: rasga el renglón que piden (o cualquier otro, si toca fallar) ──
const RENGLON_DE = {
  "Rompe al hombre contra el que se levantó Guayaquil.": "Flores",
  "Rompe el impuesto que hizo estallar el 6 de marzo.": "tres pesos",
  "La Iglesia vuelve al país: rompe lo que la tenía fuera.": "Iglesia",
};
async function jugarR3(p, bien) {
  await p.waitForSelector("text=cayeron con la revolución");
  for (let k = 0; k < 3; k++) {
    // Rompiendo mal, la ronda puede acabarse antes de las tres: cuando ya no queda
    // ningún renglón de los pedidos, termina sola (ver sin-callejon-r3.js).
    if (await p.$("text=Pulsa ¡VERIFICAR!")) break;
    const pide = (await p.textContent("div[style*='border: 2.5px solid rgb(79, 216, 255)'] span:last-child")).trim();
    const clave = RENGLON_DE[pide];
    if (!clave) throw new Error("consigna desconocida: " + pide);
    const caja = await p.evaluate(({ clave, bien }) => {
      // ⚠ Filtrar solo por touch-action agarra tambien el contenedor del lienzo entero
      // (1280x800). El renglon se reconoce porque su texto empieza por la viñeta "▸".
      const filas = Array.from(document.querySelectorAll("div"))
        .filter((d) => d.style && d.style.touchAction === "none" && d.textContent.trim().indexOf("▸") === 0 && getComputedStyle(d).opacity !== "0");
      const quiere = bien ? filas.find((d) => d.textContent.indexOf(clave) >= 0)
                          : filas.find((d) => d.textContent.indexOf(clave) === -1);
      if (!quiere) return null;
      const r = quiere.getBoundingClientRect();
      return { x: r.left + 12, y: r.top + r.height / 2, w: r.width };
    }, { clave, bien });
    if (!caja) throw new Error("no se encontró el renglón para: " + pide);
    // Se rasga de verdad: ratón abajo, recorrer a lo ancho, soltar.
    await p.mouse.move(caja.x, caja.y);
    await p.mouse.down();
    await p.mouse.move(caja.x + caja.w * 0.45, caja.y, { steps: 6 });
    await p.mouse.move(caja.x + caja.w * 0.95, caja.y, { steps: 8 });
    await p.mouse.up();
    await p.waitForTimeout(260);
  }
  await p.waitForSelector("text=Pulsa ¡VERIFICAR!");
  await p.click("button:has-text('¡VERIFICAR!')");
}

async function partida(p, bien) {
  await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
  await abrirTema(p);
  await jugarR1(p, bien); await p.waitForTimeout(4300);
  const e1 = await estrellas(p);
  await jugarR2(p, bien); await p.waitForTimeout(4300);
  const e2 = await estrellas(p);
  await jugarR3(p, bien);
  // ⚠ En la pantalla de resultados ya no hay HUD, así que el total se toma del último
  // valor que mostró el contador antes de salir de la partida.
  let total = e2;
  for (let i = 0; i < 22; i++) { const h = await estrellas(p); if (h >= 0) total = h; await p.waitForTimeout(200); }
  await p.waitForSelector("text=acertaste");
  const rep = (await p.textContent("body")).match(/QA, acertaste \d+ de \d+/);
  return { e1, e2, total, rep: rep ? rep[0] : "(sin reporte)" };
}

(async () => {
  srv.listen(PORT);
  const br = await chromium.launch();
  const p = await (await br.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  const errores = [];
  p.on("pageerror", (e) => errores.push("pageerror: " + e.message));
  p.on("console", (m) => { if (m.type() === "error") errores.push("console: " + m.text()); });

  console.log("── PARTIDA PERFECTA (esperado 4 · 8 · 11 ⭐) ──");
  const a = await partida(p, true);
  console.log(`  perfecta: tras R1 → ${a.e1} ⭐ · tras R2 → ${a.e2} ⭐ · total ${a.total} ⭐`);
  console.log(`  reporte: "${a.rep}"`);

  console.log("\n── PARTIDA FALLADA (esperado 0 ⭐) ──");
  const b = await partida(p, false);
  console.log(`  fallada: tras R1 → ${b.e1} ⭐ · tras R2 → ${b.e2} ⭐ · total ${b.total} ⭐`);
  console.log(`  reporte: "${b.rep}"`);

  const mal = [];
  if (a.total !== 11) mal.push("la partida perfecta no da 11 ⭐ (da " + a.total + ")");
  if (a.rep.indexOf("3 de 3") < 0) mal.push("la partida perfecta no reporta 3 de 3");
  if (b.total !== 0) mal.push("la partida fallada no da 0 ⭐ (da " + b.total + ")");
  if (b.rep.indexOf("0 de 3") < 0) mal.push("la partida fallada no reporta 0 de 3");
  console.log("\nErrores de consola: " + (errores.length ? errores.join(" | ") : "ninguno"));
  console.log(mal.length ? "X " + mal.join(" · ") : "OK e2e del Tema 2 en verde.");
  await br.close(); srv.close();
})();
