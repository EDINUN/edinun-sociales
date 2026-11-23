// E2E del Libro 6 · Tema 3 ("El preámbulo del siglo XX"): juega el tema dos veces, una
// acertando y otra fallando, y comprueba las estrellas y que no haya errores de consola.
// Esperado perfecto: R1 2 ⭐ (las dos que no tenían voz) · R2 3 ⭐ (las 3 fichas de los
// pensadores) · R3 3 ⭐ (las 3 frases que Montalvo deja fuera del pueblo) = 8.
// Fallando: R1 0 (no se frota nada) · R2 0 (solo los distractores) · R3 0 = 0 ⭐.
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8914;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });

const estrellas = (p) => p.evaluate(() => {
  const d = Array.from(document.querySelectorAll("div")).find((x) => /^⭐\s*\d+$/.test(x.textContent.trim()));
  return d ? parseInt(d.textContent.replace(/\D/g, ""), 10) : -1;
});

// ── R1: frotar la niebla de las cuatro figuras y ELEGIR a las dos que no tenían voz ──
// Por partida salen 2 sin voz + 2 con voz. Los que SÍ tenían voz son hacendado,
// sacerdote y banquero: se reconocen por el nombre del archivo de su ilustración.
const CON_VOZ = ["hacendado", "sacerdote", "banquero"];
async function jugarR1(p, bien) {
  await p.waitForSelector("text=no tenían voz");
  const cajas = await p.evaluate(() => Array.from(document.querySelectorAll("img"))
    .filter((i) => (i.getAttribute("src") || "").indexOf("j6t3-") >= 0)
    .map((i) => { const r = i.parentElement.getBoundingClientRect(); return { id: (i.getAttribute("src") || "").split("j6t3-")[1].replace(".jpg", ""), x: r.left, y: r.top, w: r.width, h: r.height }; }));
  if (cajas.length !== 4) throw new Error("esperaba 4 figuras, hay " + cajas.length);
  // 1) Se descubren las cuatro: hasta que no están todas, ¡VERIFICAR! sigue apagado.
  for (const c of cajas) {
    await p.mouse.move(c.x + 4, c.y + 4);
    await p.mouse.down();
    for (let f = 0; f < 8; f++) {
      const y = c.y + 3 + (c.h - 6) * (f / 7);
      await p.mouse.move(c.x + 3, y, { steps: 3 });
      await p.mouse.move(c.x + c.w - 3, y, { steps: 10 });
    }
    await p.mouse.up();
    await p.waitForTimeout(120);
  }
  // 2) Se eligen DOS: las correctas o, para fallar, las dos que sí tenían voz.
  const quiere = cajas.filter((c) => (bien ? CON_VOZ.indexOf(c.id) === -1 : CON_VOZ.indexOf(c.id) >= 0));
  if (quiere.length !== 2) throw new Error("salieron " + quiere.length + " figuras del grupo que buscaba, esperaba 2");
  for (const c of quiere) { await p.mouse.click(c.x + c.w / 2, c.y + c.h / 2); await p.waitForTimeout(160); }
  await p.click("button:has-text('¡VERIFICAR!')");
}

// ── R2: girar las fichas y dejar destapadas las de los pensadores ──
// ⚠ Hay DOS hechos por persona y cada partida saca uno, así que no vale buscar una
// frase concreta: se reconoce a los pensadores por cualquiera de sus dos hechos.
const PENSADORES = ["periodismo contra los gobiernos", "El Cosmopolita", "concertaje", "Estado laico", "Carta Constitucional de 1896", "posturas liberales"];
const OTROS = ["Dirección General de Estudios", "Ley de Hacienda", "visión religiosa", "Escuela Politécnica", "ferrocarril", "Registro Civil"];
async function jugarR2(p, bien) {
  await p.waitForSelector("text=Montalvo, Moncayo y Peralta");
  // ⚠ Boca abajo las seis fichas dicen lo mismo, así que no se pueden buscar por texto:
  //   hay que girarlas UNA A UNA, en orden, y volver a tapar las que no se quieren. Con
  //   un selector "la primera boca abajo" se daba vueltas sobre la misma ficha.
  const quiere = bien ? PENSADORES : OTROS;
  const fichas = await p.$$("button.ed-btn-plain");
  if (fichas.length !== 6) throw new Error("esperaba 6 fichas, hay " + fichas.length);
  let elegidas = 0;
  for (const f of fichas) {
    await f.click(); await p.waitForTimeout(230);
    const texto = (await f.textContent()) || "";
    if (quiere.some((c) => texto.indexOf(c) >= 0)) elegidas++;
    else { await f.click(); await p.waitForTimeout(180); }
  }
  if (elegidas !== 3) throw new Error("se dejaron " + elegidas + " fichas destapadas, esperaba 3");
  await p.click("button:has-text('¡VERIFICAR!')");
}

// ── R3: sellar las frases que Montalvo deja fuera del pueblo ──
// ⚠ El banco tiene SIETE frases y cada partida enseña cinco (3 fuera + 2 del pueblo),
// así que no se puede buscar una frase fija: hay que mirar cuáles salieron.
const FUERA = ["El tirano", "El opulento", "El soberbio", "El que oprime"];
const PUEBLO = ["sudor de tu frente", "forjas los metales", "arrancas a la tierra"];
async function jugarR3(p, bien) {
  await p.waitForSelector("text=fuera del pueblo");
  const cajas = await p.evaluate(({ FUERA, PUEBLO, bien }) => {
    // ⚠ Por asidero data-qa: filtrar por "empieza con ▸" agarraba también el
    //   contenedor de todas las frases, y el clic caía en la del medio.
    const quiere = bien ? FUERA : PUEBLO;
    return Array.from(document.querySelectorAll("[data-qa=\"frase\"]"))
      .filter((d) => quiere.some((c) => d.textContent.indexOf(c) >= 0))
      .map((d) => { const r = d.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  }, { FUERA, PUEBLO, bien });
  const esperadas = bien ? 3 : 2;
  if (cajas.length !== esperadas) throw new Error("salieron " + cajas.length + " frases de las que buscaba, esperaba " + esperadas);
  for (const c of cajas) { await p.mouse.click(c.x, c.y); await p.waitForTimeout(160); }
  // ⚠ ¡VERIFICAR! no se enciende hasta tener TRES selladas, así que la partida fallada
  //   (que sella las dos del pueblo) tiene que añadir una tercera: la peor nota posible
  //   de esta ronda es 1 ⭐, no 0. Es la consecuencia de exigir tres.
  if (!bien) {
    const extra = await p.evaluate((FUERA) => {
      const d = Array.from(document.querySelectorAll("[data-qa=\"frase\"]")).find((x) => FUERA.some((c) => x.textContent.indexOf(c) >= 0));
      if (!d) return null;
      const r = d.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }, FUERA);
    if (extra) { await p.mouse.click(extra.x, extra.y); await p.waitForTimeout(160); }
  }
  await p.click("button:has-text('¡VERIFICAR!')");
}

async function partida(p, bien) {
  await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
  await p.click("button:has-text('Libro 6')");
  await p.click("button:has-text('El preámbulo del siglo XX')");
  await p.fill("input.ed-input", "QA");
  await p.click("button:has-text('ENTRAR')");
  await p.waitForTimeout(500);
  const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(700); }
  await jugarR1(p, bien); await p.waitForTimeout(4300);
  const e1 = await estrellas(p);
  await jugarR2(p, bien); await p.waitForTimeout(4300);
  const e2 = await estrellas(p);
  await jugarR3(p, bien);
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
  p.on("console", (m) => { if (m.type() === "error" && !/j6t3-.*\.jpg/.test(m.text())) errores.push("console: " + m.text()); });

  console.log("── PARTIDA PERFECTA (esperado 2 · 5 · 8 ⭐) ──");
  const a = await partida(p, true);
  console.log(`  perfecta: tras R1 → ${a.e1} ⭐ · tras R2 → ${a.e2} ⭐ · total ${a.total} ⭐ · "${a.rep}"`);

  console.log("\n── PARTIDA FALLADA (esperado 1 ⭐: la R3 obliga a sellar tres) ──");
  const b = await partida(p, false);
  console.log(`  fallada: tras R1 → ${b.e1} ⭐ · tras R2 → ${b.e2} ⭐ · total ${b.total} ⭐ · "${b.rep}"`);

  const mal = [];
  if (a.total !== 8) mal.push("la partida perfecta no da 8 ⭐ (da " + a.total + ")");
  if (a.rep.indexOf("3 de 3") < 0) mal.push("la partida perfecta no reporta 3 de 3");
  if (b.total !== 1) mal.push("la partida fallada no da 1 ⭐ (da " + b.total + ")");
  if (b.rep.indexOf("0 de 3") < 0) mal.push("la partida fallada no reporta 0 de 3");   // ninguna ronda perfecta
  console.log("\nErrores de consola: " + (errores.length ? errores.join(" | ") : "ninguno"));
  console.log(mal.length ? "X " + mal.join(" · ") : "OK e2e del Tema 3 en verde.");
  await br.close(); srv.close();
})();
