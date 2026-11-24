// E2E del Libro 7 · Tema 1 ("La Revolución Liberal"): juega el tema entero dos veces,
// una acertando todo y otra fallando todo, y comprueba las estrellas, el revelado de las
// tres rondas, el botón BORRAR de la R2 y que no haya errores de consola. Además recarga
// 6 veces para ver que no se repite el ejercicio.
//
// Esperado perfecto: R1 4 ⭐ (4 tarjetas) · R2 2 ⭐ (2 asuntos) · R3 2 ⭐ (1 acierto con
// una sola pista) = **8**.
//
// ⚠ La clave de respuestas va ESCRITA AQUÍ, no leída del juego: si se lee del propio
// juego, el test se da la razón a sí mismo y no comprueba nada.
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8897;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });

// ── CLAVES DE RESPUESTA (copiadas a mano del material del libro) ──
const ANIO = [
  ["venta de la bandera", 1895],
  ["Asamblea en Quito", 1897],
  ["Matrimonio Civil", 1902],
  ["Estado laico", 1906],
  ["ferrocarril que une Guayaquil", 1908],
  ["apresado", 1912],
  ["Registro Civil pone", 1900],
  ["Ley de Cultos ordena", 1904],
  ["marcha obrera paraliza", 1922],
];
const DESTINO = [
  ["Registrar los matrimonios", "est"],
  ["Anotar quién nace", "est"],
  ["Las escuelas y quién puede dar clases", "est"],
  ["Las leyes, que valen igual", "est"],
  ["Los hospitales", "est"],
  ["Las tierras que tenía la Iglesia", "est"],
  ["procesiones y la Novena", "igl"],
  ["El Carnaval", "igl"],
  ["La misa y los bautizos", "igl"],
  ["En qué religión cree", "per"],
  ["Lo que una persona piensa", "per"],
  ["va o no va a la iglesia", "per"],
  ["entrar al país a enseñar", "est"],
  ["niñas estudien en escuelas laicas", "est"],
  ["jornada máxima y el salario", "est"],
  ["La Novena a los Santos", "igl"],
  ["escriben los periódicos", "per"],
];
const CASO = [
  ["Primera Guerra Mundial", "La crisis cacaotera"],
  ["Guayaquil quedó paralizada", "La marcha obrera del 15 de noviembre de 1922"],
  ["1913 y 1916", "El levantamiento de Concha"],
  ["comunidades religiosas de enseñanza", "La educación laica"],
  ["Es de 1902", "La Ley de Matrimonio Civil"],
  ["sin él no había progreso", "El ferrocarril Guayaquil–Quito"],
  ["dejó de regirse por creencias", "La implantación del Estado laico"],
  ["Va de 1912 a 1925", "El período plutocrático"],
];
function busca(tabla, txt, que) {
  const f = tabla.find((r) => txt.indexOf(r[0]) !== -1);
  if (!f) throw new Error("no está en la clave de " + que + ": " + txt.slice(0, 60));
  return f[1];
}

const estrellas = (p) => p.evaluate(() => {
  const d = Array.from(document.querySelectorAll("div")).find((x) => /^⭐\s*\d+$/.test(x.textContent.trim()));
  return d ? parseInt(d.textContent.replace(/\D/g, ""), 10) : -1;
});

async function abrirTema(p) {
  // ⚠ 60 s: en frío el navegador baja React + Babel Standalone (~3 MB) del CDN y la
  // primera pintada puede pasar de 20 s. No es lentitud del juego.
  await p.waitForSelector("button:has-text('Libro 7')", { timeout: 60000 });
  await p.click("button:has-text('Libro 7')");
  // Desde que el Libro 7 tiene dos temas hay que ELEGIR uno: con mas de uno no se
  // preselecciona solo y ENTRAR queda apagado (mismo tropiezo que arrastre-r3 en el Libro 6).
  await p.click("button:has-text('La Revolución Liberal')");
  await p.waitForSelector("button:has-text('ENTRAR')");
  await p.fill("input.ed-input", "QA");
  await p.click("button:has-text('ENTRAR')");
  await p.waitForTimeout(500);
  const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(700); }
}

// ── R1 · ordena la vía intercambiando (el toque es el respaldo del arrastre) ──
async function jugarR1(p, bien) {
  await p.waitForSelector("text=Ordena los hechos");
  const textos = await p.$$eval('[data-qa="via"]', (bs) => bs.map((b) => b.textContent));
  const anios = textos.map((t) => busca(ANIO, t, "años")); // se evalúa en Node, no en la página
  let quiero = anios.slice().sort((a, b) => a - b);
  // Partida fallada: corrimiento cíclico — permutación SIN ningún punto fijo, así que no
  // se cuela ni una tarjeta en su sitio.
  if (!bien) quiero = quiero.slice(1).concat(quiero.slice(0, 1));
  const actual = anios.slice();
  for (let i = 0; i < quiero.length; i++) {
    if (actual[i] === quiero[i]) continue;
    const j = actual.indexOf(quiero[i], i + 1);
    const cs = await p.$$('[data-qa="via"]');
    await cs[i].click(); await p.waitForTimeout(80);
    await cs[j].click(); await p.waitForTimeout(140);
    const t = actual[i]; actual[i] = actual[j]; actual[j] = t;
  }
  const fin = await p.$$eval('[data-qa="via"]', (bs) => bs.map((b) => b.textContent));
  const puesto = fin.map((t) => busca(ANIO, t, "años"));
  if (puesto.join() !== quiero.join()) throw new Error("R1: el intercambio no dejó el orden pedido");
  await p.click("button:has-text('¡VERIFICAR!')");
}

// ── R2 · reparte los 5 asuntos entre los tres platillos ──
async function jugarR2(p, bien, probarBorrar) {
  await p.waitForSelector("text=en manos de quién");
  const OTRO = { est: "igl", igl: "per", per: "est" };
  if (probarBorrar) {
    // BORRAR devuelve el último asunto a la mano: el contador 1/5 tiene que volver.
    const t0 = await p.textContent('[data-qa="asunto"]');
    await p.click('[data-qa="plat-est"]'); await p.waitForTimeout(150);
    const t1 = await p.textContent('[data-qa="asunto"]');
    if (t1 === t0) throw new Error("R2: colocar no avanzó al asunto siguiente");
    await p.click("button:has-text('BORRAR')"); await p.waitForTimeout(150);
    const t2 = await p.textContent('[data-qa="asunto"]');
    if (t2 !== t0) throw new Error("R2: BORRAR no devolvió el último asunto a la mano");
  }
  // La ronda trae 2 asuntos (antes 5): se colocan los que vayan apareciendo en la mano.
  let puestos = 0;
  while (await p.$('[data-qa="asunto"]')) {
    const t = await p.textContent('[data-qa="asunto"]');
    const d = busca(DESTINO, t, "destinos");
    await p.click(`[data-qa="plat-${bien ? d : OTRO[d]}"]`);
    await p.waitForTimeout(170);
    if (++puestos > 8) throw new Error("R2: la mano no se vacía");
  }
  if (puestos !== 2) throw new Error("R2: se esperaban 2 asuntos, hubo " + puestos);
  await p.click("button:has-text('¡VERIFICAR!')");
}

// ── R3 · UN expediente, respondido con la primera pista ──
async function jugarR3(p, bien) {
  await p.waitForSelector("text=Descubre de qué hecho");
  // ⚠ Ya solo se ve el expediente de turno: cuántos hay lo dice su atributo data-total.
  const n = Number(await p.getAttribute('[data-qa="exp"]', "data-total"));
  if (n !== 1) throw new Error("R3: se esperaba 1 expediente, hay " + n);
  for (let k = 0; k < n; k++) {
    const pista = await p.textContent('[data-qa="pista"]');
    const bueno = busca(CASO, pista, "casos");
    const ops = await p.$$eval('[data-qa="op"]', (bs) => bs.map((b) => b.textContent));
    const i = bien ? ops.findIndex((o) => o.indexOf(bueno) !== -1)
                   : ops.findIndex((o) => o.indexOf(bueno) === -1);
    if (i < 0) throw new Error("R3: no se encontró la opción buscada para: " + bueno);
    const btns = await p.$$('[data-qa="op"]');
    await btns[i].click();
    await p.waitForTimeout(150);
    // ⚠ Cada expediente lleva su propio ¡VERIFICAR!; el último cierra la ronda.
    await p.click("button:has-text('¡VERIFICAR!')");
    if (k + 1 < n) await p.waitForTimeout(2200);
  }
}

async function partida(p, bien) {
  await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
  await abrirTema(p);
  await jugarR1(p, bien);
  const rev1 = await p.evaluate(() => /va \d+º/.test(document.body.textContent) || document.body.textContent.indexOf("1895") !== -1);
  await p.waitForTimeout(4300);
  const e1 = await estrellas(p);
  await jugarR2(p, bien, bien);
  const rev2 = (await p.textContent("body")).indexOf(bien ? "EN SU SITIO" : "LA RESPUESTA ERA") !== -1;
  await p.waitForTimeout(4300);
  const e2 = await estrellas(p);
  await jugarR3(p, bien);
  const rev3 = (await p.textContent("body")).indexOf("ERA ESTA") !== -1;
  let total = e2;
  for (let i = 0; i < 22; i++) { const h = await estrellas(p); if (h >= 0) total = h; await p.waitForTimeout(200); }
  await p.waitForSelector("text=acertaste");
  const rep = (await p.textContent("body")).match(/QA, acertaste \d+ de \d+/);
  return { e1, e2, total, rev1, rev2, rev3, rep: rep ? rep[0] : "(sin reporte)" };
}

(async () => {
  srv.listen(PORT);
  const br = await chromium.launch();
  const p = await (await br.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  const errores = [];
  p.on("pageerror", (e) => errores.push("pageerror: " + e.message));
  // ⚠ Se filtran los 404: las 9 ilustraciones j7t1-*.jpg todavía no están subidas y el
  // tema se juega igual con el respaldo de emoji. Cualquier otro error sí cuenta.
  p.on("console", (m) => { if (m.type() === "error" && m.text().indexOf("Failed to load resource") === -1) errores.push("console: " + m.text()); });

  console.log("── PARTIDA PERFECTA (esperado 4 · 6 · 8 ⭐) ──");
  const a = await partida(p, true);
  console.log(`  perfecta: tras R1 → ${a.e1} ⭐ · tras R2 → ${a.e2} ⭐ · total ${a.total} ⭐`);
  console.log(`  revelado R1/R2/R3: ${a.rev1} / ${a.rev2} / ${a.rev3}`);
  console.log(`  reporte: "${a.rep}"`);

  console.log("\n── PARTIDA FALLADA (esperado 0 ⭐ y revelado en las 3) ──");
  const b = await partida(p, false);
  console.log(`  fallada: tras R1 → ${b.e1} ⭐ · tras R2 → ${b.e2} ⭐ · total ${b.total} ⭐`);
  console.log(`  revelado R1/R2/R3: ${b.rev1} / ${b.rev2} / ${b.rev3}`);
  console.log(`  reporte: "${b.rep}"`);

  console.log("\n── VARIEDAD: 6 recargas seguidas ──");
  const vistas = { r1: [], r2: [], r3: [] };
  for (let i = 0; i < 6; i++) {
    await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
    await abrirTema(p);
    await p.waitForSelector('[data-qa="via"]');
    vistas.r1.push((await p.$$eval('[data-qa="via"]', (bs) => bs.map((x) => x.textContent.slice(0, 40)))).sort().join("|"));
  }
  const repes = vistas.r1.filter((x, i) => i > 0 && x === vistas.r1[i - 1]).length;
  console.log(`  R1: ${new Set(vistas.r1).size} combinaciones distintas en 6 recargas · repeticiones seguidas: ${repes}`);

  const mal = [];
  if (a.total !== 8) mal.push("la perfecta no da 8 ⭐ (da " + a.total + ")");
  if (a.e1 !== 4) mal.push("la R1 perfecta no da 4 ⭐ (da " + a.e1 + ")");
  if (a.e2 !== 6) mal.push("la R2 perfecta no deja el contador en 6 ⭐ (deja " + a.e2 + ")");
  if (a.rep.indexOf("3 de 3") < 0) mal.push("la perfecta no reporta 3 de 3");
  if (b.total !== 0) mal.push("la fallada no da 0 ⭐ (da " + b.total + ")");
  if (b.rep.indexOf("0 de 3") < 0) mal.push("la fallada no reporta 0 de 3");
  if (!b.rev1 || !b.rev2 || !b.rev3) mal.push("falta el revelado en alguna ronda de la partida fallada");
  if (!a.rev3 || !b.rev3) mal.push("la R3 no enseña la correcta al cerrar el expediente");
  if (repes > 0) mal.push("la R1 repitió el mismo ejercicio en dos recargas seguidas");
  console.log("\nErrores de consola: " + (errores.length ? errores.join(" | ") : "ninguno"));
  if (errores.length) mal.push("hay errores de consola");
  console.log(mal.length ? "X " + mal.join(" · ") : "OK e2e del Libro 7 · Tema 1 en verde.");
  await br.close(); srv.close();
  process.exit(mal.length ? 1 : 0);
})();
