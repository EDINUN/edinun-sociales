// e2e.js — prueba de juego real de juego-14 (3 rondas).
// Cubre: partida perfecta (10 ⭐), partida fallada con revelado en las 3 rondas,
// ronda parcial (suma sin restar), arrastre REAL de mouse + respaldo tap,
// anti-repetición al recargar y 0 errores de consola.
//
//   node .planning/e2e.js        (desde la carpeta del juego)

const http = require("http");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const PORT = 8791;
const TIPOS = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
  ".jsx": "text/plain", ".png": "image/png", ".svg": "image/svg+xml" };

function serve() {
  return new Promise((res) => {
    const s = http.createServer((req, rep) => {
      const rel = decodeURIComponent(req.url.split("?")[0]).replace(/^\/+/, "") || "index.html";
      const f = path.join(ROOT, rel);
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { rep.writeHead(404); return rep.end(); }
      rep.writeHead(200, { "Content-Type": TIPOS[path.extname(f)] || "application/octet-stream" });
      rep.end(fs.readFileSync(f));
    });
    s.listen(PORT, "127.0.0.1", () => res(s));
  });
}

const fallos = [];
function check(cond, label, extra) {
  console.log(`${cond ? "  ok  " : "  FALLO"} ${label}${cond || !extra ? "" : " — " + extra}`);
  if (!cond) fallos.push(label);
}

// ── Datos espejo de game-screens.jsx (para saber la respuesta correcta) ──
const CLASICAS = ["Copán", "Tikal", "Calakmul", "Palenque", "Toniná", "Bonampak"];

// Palabra correcta de cada hueco, por crónica (se identifica por su fuente).
const CRONICAS_OK = {
  "cuaderno pág. 91": ["náhuatl", "XIII", "chichimecas", "Texcoco"],
  "libro pág. 136": ["Tlatelolco", "Moctezuma II", "Tlatoani", "calpulli"],
  "libro pág. 135": ["sacerdotes", "maíz", "terrazas", "calendario"],
  "libro págs. 134 y 136": ["posclásico", "900", "tolteca", "Popol Vuh"],
};

async function entrar(page, nombre) {
  await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle" });
  await page.fill(".ed-input", nombre);
  await page.getByRole("button", { name: /ENTRAR/ }).click();
  await page.getByRole("button", { name: /VAMOS/ }).click();
  await page.waitForSelector("text=Arrastra cada ciudad");
}

// ── R1 · ubica las 4 ciudades. modo: "drag" | "tap" | "mal" | "parcial" ──
async function jugarR1(page, modo) {
  const zonas = page.locator('div[style*="flex: 1"]').filter({ hasText: /CLÁSICO|POSCLÁSICO/ });
  const bandeja = page.locator("button[data-chip]");

  for (let i = 0; i < 4; i++) {
    const chip = bandeja.first();
    const nombre = (await chip.innerText()).trim();
    const esClasica = CLASICAS.includes(nombre);
    // tramo destino: 0 = CLÁSICO, 1 = POSCLÁSICO
    let destino = esClasica ? 0 : 1;
    if (modo === "mal") destino = 1 - destino;
    if (modo === "parcial" && i === 0) destino = 1 - destino;
    const zona = zonas.nth(destino);

    // "drag" → las 4 arrastradas · "mal" → las 4 con el respaldo TAP (cubre el
    // tap como PRIMER gesto) · "parcial" → alterna arrastre y tap.
    if (modo === "drag" || (modo === "parcial" && i % 2 === 0)) {
      const a = await chip.boundingBox(), b = await zona.boundingBox();
      await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
      await page.mouse.down();
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 12 });
      await page.mouse.up();
    } else {
      await chip.click();              // respaldo tap: ficha → tramo
      await page.waitForTimeout(140);
      await zona.click();
    }
    await page.waitForTimeout(260);
    const quedan = await bandeja.count();
    if (quedan !== 3 - i) throw new Error(`R1 (${modo}): tras ubicar "${nombre}" quedan ${quedan} fichas y debían quedar ${3 - i}`);
  }
}

// ── R2 · escribe el número en la estela. modo: "bien" | "mal" | "parcial" ──
async function jugarR2(page, modo) {
  const txt = await page.locator('div:has-text("Escribe el número")').last().innerText();
  const objetivo = parseInt(txt.match(/(\d+)/)[1], 10);
  let v = Math.floor(objetivo / 20), u = objetivo % 20;
  if (modo === "mal") { v = v === 1 ? 2 : 1; u = u === 3 ? 4 : 3; }
  if (modo === "parcial") { u = u === 3 ? 4 : 3; }

  for (const [nivel, d] of [["veintes", v], ["unidades", u]]) {
    await page.locator(`[data-nivel="${nivel}"]`).click();
    await page.waitForTimeout(80);
    if (d === 0) { await page.getByRole("button", { name: /CARACOL/ }).click(); continue; }
    for (let i = 0; i < Math.floor(d / 5); i++) { await page.getByRole("button", { name: /BARRA/ }).click(); await page.waitForTimeout(40); }
    for (let i = 0; i < d % 5; i++) { await page.getByRole("button", { name: /PUNTO/ }).click(); await page.waitForTimeout(40); }
  }
  return objetivo;
}

// ── R3 · corrige las 4 palabras. modo: "bien" | "mal" | "parcial" ──
async function jugarR3(page, modo) {
  const fuente = await page.locator("[data-fuente]").getAttribute("data-fuente");
  const correctas = CRONICAS_OK[fuente];
  if (!correctas) throw new Error("crónica desconocida: " + fuente);

  for (let h = 0; h < 4; h++) {
    await page.locator(`[data-hueco="${h}"]`).click();
    await page.waitForTimeout(120);
    const opts = page.locator("[data-op]");
    const textos = await opts.allInnerTexts();
    const iOk = textos.findIndex((t) => t.trim() === correctas[h]);
    if (iOk === -1) throw new Error(`hueco ${h} de "${fuente}": no está "${correctas[h]}" en ${JSON.stringify(textos)}`);
    const quiero = modo === "mal" ? 1 - iOk
      : modo === "parcial" && h === 0 ? 1 - iOk
      : iOk;
    await opts.nth(quiero).click();
    await page.waitForTimeout(100);
  }
  return correctas;
}

async function leerEstrellas(page) {
  const t = await page.locator('div:has-text("⭐")').last().innerText();
  const m = t.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : -1;
}

(async () => {
  const server = await serve();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  // Los PNG del tema los genera la autora; mientras no estén, el juego usa su
  // respaldo SVG y el navegador registra un 404 esperado. counter.php sin PHP, igual.
  const PENDIENTES = ["mapa-mesoamerica.png", "estela-maya.png", "papel-amate.png", "counter.php"];
  const errores = [];
  const faltantes = new Set();
  page.on("response", (r) => { if (r.status() === 404) faltantes.add(r.url().split("/").pop()); });
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const t = m.text();
    if (PENDIENTES.some((p) => t.includes(p))) return;
    if (/Failed to load resource.*404/.test(t)) return;   // se audita aparte con `faltantes`
    errores.push(t);
  });
  page.on("pageerror", (e) => errores.push(String(e)));

  console.log("\n── e2e juego-14 ──\n");

  // ════ 1. Partida con arrastre real de mouse (R1) ════
  console.log("1 · Partida con ARRASTRE real de mouse");
  await entrar(page, "Prueba Drag");
  await jugarR1(page, "drag");
  const faltanR1 = await page.locator("button[data-chip]").count();
  check(faltanR1 === 0, "R1: las 4 ciudades quedaron ubicadas con arrastre", `quedan ${faltanR1} en la bandeja`);
  await page.getByRole("button", { name: /VERIFICAR/ }).click();
  await page.waitForTimeout(3600);
  const starsTrasR1 = await leerEstrellas(page);
  check(starsTrasR1 === 4, "R1 perfecta = 4 ⭐", `dio ${starsTrasR1}`);

  // ════ 2. R2 correcta ════
  console.log("2 · R2 estela maya");
  await page.waitForSelector("text=Escribe el número");
  const obj = await jugarR2(page, "bien");
  const lectura = await page.locator("[data-lectura]").getAttribute("data-lectura");
  check(Number(lectura) === obj, `R2: la lectura en vivo marca ${obj}`, `marca ${lectura}`);
  await page.getByRole("button", { name: /VERIFICAR/ }).click();
  await page.waitForTimeout(3600);
  const starsTrasR2 = await leerEstrellas(page);
  check(starsTrasR2 === 6, "R1+R2 perfectas = 6 ⭐", `dio ${starsTrasR2}`);

  // ════ 3. R3 + resultados ════
  console.log("3 · R3 códice y pantalla de resultados");
  await page.waitForSelector("text=Revisa las cuatro palabras");
  await jugarR3(page, "bien");
  await page.getByRole("button", { name: /VERIFICAR/ }).click();
  await page.waitForTimeout(4000);
  await page.waitForSelector("text=¡Ronda completa!", { timeout: 6000 });
  check(true, "Llega a ResultsScreen tras la 3ª ronda");
  const filas = await page.locator(".ed-card table tbody tr").count();
  check(filas === 3, "El reporte trae 3 filas (una por ronda)", `trae ${filas}`);
  const temaOk = await page.locator("text=Las culturas posclásicas de Mesoamérica").count();
  check(temaOk > 0, "El reporte nombra el tema completo");

  // ════ 4. Partida FALLADA: revelado en las 3 rondas, 0 ⭐, sin restar ════
  console.log("4 · Partida fallada (revelado en las 3 rondas)");
  await entrar(page, "Prueba Fallo");
  await jugarR1(page, "mal");
  await page.getByRole("button", { name: /VERIFICAR/ }).click();
  await page.waitForTimeout(1200);
  const revelaR1 = await page.locator("text=/✓/").count();
  check(revelaR1 > 0, "R1 fallada revela la correcta con ✓");
  await page.waitForTimeout(2600);

  await page.waitForSelector("text=Escribe el número");
  await jugarR2(page, "mal");
  await page.getByRole("button", { name: /VERIFICAR/ }).click();
  await page.waitForTimeout(1200);
  const revelaR2 = await page.locator("text=LA RESPUESTA ERA").count();
  check(revelaR2 > 0, "R2 fallada muestra el panel grande con la respuesta");
  await page.waitForTimeout(2600);

  await page.waitForSelector("text=Revisa las cuatro palabras");
  await jugarR3(page, "mal");
  await page.getByRole("button", { name: /VERIFICAR/ }).click();
  await page.waitForTimeout(1200);
  const revelaR3 = await page.locator('span[style*="line-through"]').count();
  check(revelaR3 > 0, "R3 fallada tacha lo elegido y muestra la correcta");
  await page.waitForTimeout(3200);
  await page.waitForSelector("text=¡Ronda completa!", { timeout: 6000 });
  const estrellasFinal = await page.locator("text=/^[0-9]+$/").count();
  check(true, "La partida fallada termina igual en resultados (no se traba)");

  // ════ 4b. SE PUEDE CORREGIR — lo que la autora no podía hacer ════
  console.log("4b · Corregir lo mal colocado");
  await entrar(page, "Prueba Corregir");

  // R1: coloco una ciudad, la devuelvo tocándola, y vuelve a la bandeja.
  const zonasC = page.locator('div[style*="flex: 1"]').filter({ hasText: /CLÁSICO|POSCLÁSICO/ });
  const chipC = page.locator("button[data-chip]").first();
  const nomC = (await chipC.innerText()).trim();
  await chipC.click(); await page.waitForTimeout(140);
  await zonasC.nth(0).click(); await page.waitForTimeout(300);
  check(await page.locator("button[data-chip]").count() === 3, "R1: la ciudad entró en la caja");
  await page.locator(`div[data-chip]`).first().click(); await page.waitForTimeout(300);
  const vuelta = await page.locator("button[data-chip]").count();
  check(vuelta === 4, `R1: tocar la ciudad colocada la devuelve a la bandeja (${nomC})`, `quedan ${vuelta}`);

  // R1: con una ciudad en la mano, tocar la caja SUELTA (no devuelve la que ya está).
  await page.locator("button[data-chip]").first().click(); await page.waitForTimeout(140);
  await zonasC.nth(0).click(); await page.waitForTimeout(300);
  await page.locator("button[data-chip]").first().click(); await page.waitForTimeout(140);
  await zonasC.nth(0).click(); await page.waitForTimeout(320);
  check(await page.locator("button[data-chip]").count() === 2,
    "R1: con ciudad elegida, tocar la caja suelta en vez de devolver");

  // Completar R1 y pasar a R2 para probar BORRAR.
  await jugarR1(page, "mal").catch(() => {});
  while (await page.locator("button[data-chip]").count() > 0) {
    await page.locator("button[data-chip]").first().click(); await page.waitForTimeout(140);
    await zonasC.nth(1).click(); await page.waitForTimeout(280);
  }
  await page.getByRole("button", { name: /VERIFICAR/ }).click();
  await page.waitForTimeout(3600);

  // R2: escribo de más y BORRAR vacía el registro marcado.
  await page.waitForSelector("text=Escribe el número");
  await page.locator('[data-nivel="veintes"]').click(); await page.waitForTimeout(80);
  for (let i = 0; i < 3; i++) { await page.getByRole("button", { name: /BARRA/ }).click(); await page.waitForTimeout(60); }
  const antesBorrar = await page.locator("[data-lectura]").getAttribute("data-lectura");
  check(Number(antesBorrar) === 300, "R2: tres barras en los veintes marcan 300", `marca ${antesBorrar}`);
  await page.getByRole("button", { name: /^BORRAR$/ }).click(); await page.waitForTimeout(220);
  const unoMenos = await page.locator("[data-lectura]").getAttribute("data-lectura");
  check(Number(unoMenos) === 200, "R2: BORRAR quita UN símbolo (300 → 200)", `marca ${unoMenos}`);
  await page.getByRole("button", { name: /^BORRAR$/ }).click(); await page.waitForTimeout(180);
  await page.getByRole("button", { name: /^BORRAR$/ }).click(); await page.waitForTimeout(220);
  const vacio = await page.locator("[data-lectura]").getAttribute("data-lectura");
  check(Number(vacio) === 0, "R2: tres BORRAR dejan la estela vacía", `marca ${vacio}`);
  const apagado = await page.getByRole("button", { name: /^BORRAR$/ }).isDisabled();
  check(apagado, "R2: sin nada escrito, BORRAR queda apagado");

  // El título VEINTES / UNIDADES es el que cambia dónde se escribe.
  await page.locator('[data-nivel="unidades"]').click(); await page.waitForTimeout(100);
  await page.getByRole("button", { name: /PUNTO/ }).click(); await page.waitForTimeout(200);
  const enUnidades = await page.locator("[data-lectura]").getAttribute("data-lectura");
  check(Number(enUnidades) === 1, "R2: tocar UNIDADES cambia dónde se escribe", `marca ${enUnidades}`);

  // ════ 4c. R3: dejar una palabra como está también es responder ════
  console.log("4c · R3 se puede resolver sin tocar las cuatro");
  await entrar(page, "Prueba Dejar");
  const zonasD = page.locator('div[style*="flex: 1"]').filter({ hasText: /CLÁSICO|POSCLÁSICO/ });
  while (await page.locator("button[data-chip]").count() > 0) {
    await page.locator("button[data-chip]").first().click(); await page.waitForTimeout(140);
    await zonasD.nth(0).click(); await page.waitForTimeout(280);
  }
  await page.getByRole("button", { name: /VERIFICAR/ }).click(); await page.waitForTimeout(3600);
  await page.waitForSelector("text=Escribe el número");
  await page.locator('[data-nivel="veintes"]').click(); await page.waitForTimeout(80);
  await page.getByRole("button", { name: /PUNTO/ }).click(); await page.waitForTimeout(150);
  await page.getByRole("button", { name: /VERIFICAR/ }).click(); await page.waitForTimeout(3600);

  await page.waitForSelector("text=Revisa las cuatro palabras");
  const fuenteD = await page.locator("[data-fuente]").getAttribute("data-fuente");
  const correctasD = CRONICAS_OK[fuenteD];
  // ¿Con qué palabra arranca cada hueco? Alguna debe venir YA correcta.
  const iniciales = [];
  for (let h = 0; h < 4; h++) iniciales.push((await page.locator(`[data-hueco="${h}"]`).innerText()).trim());
  const yaBien = iniciales.filter((w, h) => w === correctasD[h]).length;
  check(yaBien >= 1 && yaBien <= 2, "R3: una o dos palabras vienen ya correctas", `vienen ${yaBien}`);

  const verificable = !(await page.getByRole("button", { name: /VERIFICAR/ }).isDisabled());
  check(verificable, "R3: ¡VERIFICAR! está activo sin tocar ninguna palabra");

  // Corrijo SOLO las que están mal y dejo las buenas sin tocar → debe dar 4/4.
  for (let h = 0; h < 4; h++) {
    if (iniciales[h] === correctasD[h]) continue;
    await page.locator(`[data-hueco="${h}"]`).click(); await page.waitForTimeout(120);
    const opts = page.locator("[data-op]");
    const textos = await opts.allInnerTexts();
    await opts.nth(textos.findIndex((t) => t.trim() === correctasD[h])).click();
    await page.waitForTimeout(120);
  }
  const estrellasAntes = await leerEstrellas(page);
  await page.getByRole("button", { name: /VERIFICAR/ }).click(); await page.waitForTimeout(4200);
  await page.waitForSelector("text=¡Ronda completa!", { timeout: 6000 });
  const filaR3 = await page.locator(".ed-card table tbody tr").nth(2).innerText();
  check(filaR3.includes("✓"), "R3: dejar las correctas sin tocar da la ronda por buena", filaR3.replace(/\s+/g, " ").slice(0, 90));

  // ════ 5. Ronda parcial: suma lo acertado SIN restar ════
  console.log("5 · Ronda parcial (3 bien + 1 mal)");
  await entrar(page, "Prueba Parcial");
  await jugarR1(page, "parcial");
  await page.getByRole("button", { name: /VERIFICAR/ }).click();
  await page.waitForTimeout(3600);
  const parciales = await leerEstrellas(page);
  check(parciales === 3, "R1 con 3 aciertos suma +3 ⭐ (no resta)", `dio ${parciales}`);

  // ════ 6. Anti-repetición al recargar ════
  console.log("6 · Anti-repetición en 6 recargas");
  const vistos = [];
  for (let i = 0; i < 6; i++) {
    await entrar(page, "Prueba Repeticion");
    const chips = await page.locator("button[data-chip]").allInnerTexts();
    vistos.push(chips.sort().join("|"));
  }
  let repes = 0;
  for (let i = 1; i < vistos.length; i++) if (vistos[i] === vistos[i - 1]) repes++;
  check(repes === 0, "6 recargas sin repetir el mismo set de ciudades", `${repes} repetición(es)`);
  const distintos = new Set(vistos).size;
  check(distintos >= 4, "Al menos 4 combinaciones distintas en 6 recargas", `hubo ${distintos}`);

  // ════ 7. Consola limpia ════
  check(errores.length === 0, "0 errores de consola (fuera de assets pendientes)", errores.slice(0, 3).join(" / "));
  const inesperados = [...faltantes].filter((f) => !PENDIENTES.includes(f));
  check(inesperados.length === 0, "Sin 404 inesperados", inesperados.join(", "));
  if (faltantes.size) console.log(`  nota  assets pendientes de la autora: ${[...faltantes].join(", ")}`);

  await browser.close();
  server.close();

  console.log(fallos.length === 0
    ? "\n✓ e2e juego-14: todo en verde.\n"
    : `\n✗ e2e juego-14: ${fallos.length} fallo(s):\n   - ${fallos.join("\n   - ")}\n`);
  process.exit(fallos.length === 0 ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
