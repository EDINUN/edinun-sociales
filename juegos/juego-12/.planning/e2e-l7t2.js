// E2E del Libro 7 · Tema 2 ("Insurgencia, cambio social y velasquismo"): juega el tema
// entero dos veces, una acertando todo y otra fallando todo, y comprueba las estrellas,
// el revelado de las tres rondas, el BORRAR y que no haya errores de consola.
//
// Esperado perfecto: R1 3 ⭐ (3 nudos) · R2 2 ⭐ (2 juguetes) · R3 3 ⭐ (3 hilos) = **8**.
//
// ⚠ La clave de respuestas va ESCRITA AQUÍ, no leída del juego: si se lee del propio
// juego, el test se da la razón a sí mismo y no comprueba nada.
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8911;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });

// ── CLAVES (copiadas a mano del bloque L7T2 de game-screens.jsx) ──
// R1: por curva, el nivel de partida y el nivel que le toca a cada año.
const CURVAS = {
  "cacao": { ini: 2, y: { 1915: 3, 1917: 2, 1919: 3, 1920: 1, 1922: 1, 1929: 1, 1930: 0, 1931: 0 } },
  "sombrero": { ini: 1, y: { 1922: 2, 1925: 3, 1928: 3, 1930: 1, 1934: 0, 1936: 0, 1940: 2, 1945: 3 } },
  "bolsillo": { ini: 2, y: { 1926: 3, 1928: 2, 1929: 2, 1930: 1, 1933: 0, 1936: 0, 1938: 1, 1940: 1 } },
};
// La curva se reconoce por su AÑO DE PARTIDA, que es unico: mirar el enunciado es fragil
// (hubo una pasada en la que el texto del cuerpo caso con otra curva).
const CURVA_POR_INICIO = { 1910: "cacao", 1918: "sombrero", 1924: "bolsillo" };
// R3: de quién es cada obra.
const OBRA_DE = {
  "Jorge Icaza": "Huasipungo",
  "Enrique Gil Gilbert": "Nuestro Pan",
  "Joaquín Gallegos Lara": "Las cruces sobre el agua",
  "Alfredo Pareja Diezcanseco": "La hoguera bárbara",
  "José de la Cuadra": "Los Sangurimas",
  "César Dávila Andrade": "Boletín y Elegía de las Mitas",
  "Pío Jaramillo Alvarado": "El indio ecuatoriano",
  "Fernando Chaves": "Plata y Bronce",
};
// Geometría del gráfico de la R1, igual que en el juego.
// Geometría del gráfico y centro de cada una de las CUATRO bandas, igual que en el juego.
const Y0 = 16, Y1 = 262;
const niv = (b) => 12.5 + b * 25;


// ── Gestos de la R2, hechos con el ratón sobre la zona de juego ──
// ⚠ La clave va ESCRITA AQUÍ, no leída del juego.
const GESTO_DE = {
  "EL TROMPO": "abajo", "LA COMETA": "arriba", "LA SOGA": "circulo",
  "LAS PALLAS": "atras", "LA MUÑECA DE TRAPO": "vaiven", "LA RAYUELA": "dostoques",
};
async function hazGesto(p, g) {
  const z = await (await p.$('[data-qa="zona"]')).boundingBox();
  const cx = z.x + z.width / 2, cy = z.y + z.height / 2;
  if (g === "dostoques") {
    await p.mouse.move(cx, cy); await p.mouse.down(); await p.mouse.up();
    await p.waitForTimeout(120);
    await p.mouse.move(cx, cy); await p.mouse.down(); await p.mouse.up();
    await p.waitForTimeout(220); return;
  }
  if (g === "circulo") {
    const r = Math.min(70, z.height / 3.2);
    await p.mouse.move(cx + r, cy); await p.mouse.down();
    for (let a = 15; a <= 375; a += 15) await p.mouse.move(cx + r * Math.cos(a * Math.PI / 180), cy + r * Math.sin(a * Math.PI / 180));
    await p.mouse.up(); await p.waitForTimeout(220); return;
  }
  if (g === "vaiven") {
    await p.mouse.move(cx, cy); await p.mouse.down();
    await p.mouse.move(cx + 70, cy, { steps: 6 });
    await p.mouse.move(cx - 70, cy, { steps: 8 });
    await p.mouse.move(cx + 60, cy, { steps: 8 });
    await p.mouse.up(); await p.waitForTimeout(220); return;
  }
  const d = { abajo: [0, 70], arriba: [0, -70], atras: [-90, 0] }[g];
  await p.mouse.move(cx - d[0] / 2, cy - d[1] / 2); await p.mouse.down();
  await p.mouse.move(cx + d[0] / 2, cy + d[1] / 2, { steps: 10 });
  await p.mouse.up(); await p.waitForTimeout(220);
}

const estrellas = (p) => p.evaluate(() => {
  const d = Array.from(document.querySelectorAll("div")).find((x) => /^⭐\s*\d+$/.test(x.textContent.trim()));
  return d ? parseInt(d.textContent.replace(/\D/g, ""), 10) : -1;
});

async function abrirTema(p) {
  // ⚠ 60 s: en frío el navegador baja React + Babel Standalone (~3 MB) del CDN.
  await p.waitForSelector("button:has-text('Libro 7')", { timeout: 60000 });
  await p.click("button:has-text('Libro 7')");
  await p.click("button:has-text('Insurgencia y velasquismo')");
  await p.waitForSelector("button:has-text('ENTRAR')");
  await p.fill("input.ed-input", "QA");
  await p.click("button:has-text('ENTRAR')");
  await p.waitForTimeout(500);
  const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(700); }
}

// ── R1 · deforma la curva arrastrando el nudo del año activo ──
// El año activo es el que el juego pinta en ámbar bajo el nudo.
const bandasEnPantalla = (p) => p.evaluate(() => {
  const cs = Array.from(document.querySelectorAll("circle"))
    // ⚠ Fuera los halos (r = 17): comparten la x del nudo activo y descolocan el índice.
    .filter((c) => { const r = Number(c.getAttribute("r")); return r === 7 || r === 10; })
    .map((c) => ({ x: Number(c.getAttribute("cx")), y: Number(c.getAttribute("cy")) }))
    .sort((a, b) => a.x - b.x);
  // El primero es el punto de partida, que no se toca.
  return cs.slice(1).map((c) => Math.max(0, Math.min(3, Math.round((((262 - c.y) / (262 - 16)) * 100 - 12.5) / 25))));
});

const anioActivo = (p) => p.evaluate(() => {
  const t = Array.from(document.querySelectorAll("text")).filter((x) => /^(18|19|20)\d\d$/.test(x.textContent.trim()));
  const a = t.find((x) => (x.getAttribute("fill") || "").indexOf("ffe79a") !== -1);
  return a ? parseInt(a.textContent.trim(), 10) : 0;
});

// Arrastra el nudo activo desde la banda `previo` hasta la banda `destino` (0-3).
async function moverNudo(p, k, previoB, destinoB) {
  const previo = niv(previoB), destino = niv(destinoB);
  const zonas = await p.$$('[data-qa="nudo"]');
  if (!zonas[k]) throw new Error("R1: no hay zona de agarre para el nudo " + k);
  const r = await zonas[k].boundingBox();
  r.w = r.width; r.h = r.height;
  const esc = r.h / (Y1 + 4);
  const x = r.x + r.w / 2, yIni = r.y + r.h / 2;
  const dy = (previo - destino) * ((Y1 - Y0) / 100) * esc;
  await p.mouse.move(x, yIni); await p.mouse.down();
  await p.mouse.move(x, yIni + dy * 0.5, { steps: 4 });
  await p.mouse.move(x, yIni + dy, { steps: 6 });
  await p.mouse.up();
  await p.waitForTimeout(140);
}

async function jugarR1(p, bien, probarCambio) {
  await p.waitForSelector('[data-qa="nudo"]');
  const primero = await p.evaluate(() => {
    const t = Array.from(document.querySelectorAll("text")).filter((x) => /^(18|19|20)\d\d$/.test(x.textContent.trim()));
    return t.length ? parseInt(t[0].textContent.trim(), 10) : 0;
  });
  const cual = CURVA_POR_INICIO[primero];
  if (!cual) throw new Error("R1: no reconozco la curva (año de partida " + primero + ")");
  const clave = CURVAS[cual];

  // Los años que juegan, en el orden en que están pintados en el eje.
  const anios = await p.evaluate(() => Array.from(document.querySelectorAll("text"))
    .map((t) => t.textContent.trim()).filter((t) => /^(18|19|20)\d\d$/.test(t)).slice(1).map(Number));

  let previo = clave.ini;
  for (let k = 0; k < anios.length; k++) {
    const y = anios[k];
    if (clave.y[y] === undefined) throw new Error("R1: el año " + y + " no está en la clave de " + cual);
    // Partida fallada: cualquier banda MENOS la suya.
    const destino = bien ? clave.y[y] : (clave.y[y] === 0 ? 3 : 0);
    await moverNudo(p, k, previo, destino);
    previo = destino;
  }

  if (probarCambio) {
    // ⚠ Un nudo YA COLOCADO se puede volver a mover: es lo que sustituyó al BORRAR en
    // esta ronda (la autora, 2026-11-24). Se mueve el primero a otra banda, se comprueba
    // que cambió, y se devuelve a la suya.
    const antes = await bandasEnPantalla(p);
    const otra = antes[0] === 0 ? 3 : 0;
    await moverNudo(p, 0, antes[0], otra);
    const medio = await bandasEnPantalla(p);
    if (medio[0] !== otra) throw new Error("R1: un nudo ya colocado no se dejó mover (quedó en " + medio[0] + ")");
    if (medio[1] !== antes[1] || medio[2] !== antes[2]) throw new Error("R1: mover un nudo movió a los demás");
    await moverNudo(p, 0, otra, antes[0]);
    const fin = await bandasEnPantalla(p);
    if (fin.join() !== antes.join()) throw new Error("R1: no se pudo devolver el nudo a su sitio");
  }

  await p.click("button:has-text('¡VERIFICAR!')");
}

// ── R2 · haz el gesto de cada juguete ──
async function jugarR2(p, bien) {
  await p.waitForSelector('[data-qa="zona"]');
  // ⚠ DOS juguetes, no tres, desde el 2026-11-24.
  for (let k = 0; k < 2; k++) {
    const n = (await p.textContent('[data-qa="juguete"]')).trim();
    const g = GESTO_DE[n];
    if (!g) throw new Error("R2: juguete fuera de la clave: " + n);
    // ⚠ Los tres movimientos posibles se ven en pantalla, y uno que no esté entre ellos
    // NO cuenta: para fallar hay que elegir otro DE LOS TRES, no cualquiera.
    const ops = await p.evaluate(() => Array.from(document.querySelectorAll('[data-qa="opcion"]')).map((e) => e.getAttribute("data-g")));
    if (ops.indexOf(g) === -1) throw new Error("R2: el movimiento correcto de " + n + " no está entre los tres");
    const malo = ops.find((o) => o !== g);
    await hazGesto(p, bien ? g : malo);
    const n2 = await p.textContent('[data-qa="juguete"]');
    if (k < 1 && n2.trim() === n) throw new Error("R2: el gesto no anotó nada en " + n);
  }
  await p.click("button:has-text('¡VERIFICAR!')");
}

// ── R3 · tiende los tres hilos (por toque: el arrastre lo prueba arrastre-l7t2) ──
async function jugarR3(p, bien) {
  await p.waitForSelector('[data-qa="autor"]');
  const autores = await p.$$eval('[data-qa="autor"]', (bs) => bs.map((b) => b.textContent.trim()));
  const obras = await p.$$eval('[data-qa="obra"]', (bs) => bs.map((b) => b.textContent.replace(/[“”]/g, "").trim()));
  for (let i = 0; i < autores.length; i++) {
    const nombre = Object.keys(OBRA_DE).find((n) => autores[i].indexOf(n) !== -1);
    if (!nombre) throw new Error("R3: autor fuera de la clave: " + autores[i]);
    // El texto de la tarjeta empieza por el emoji de respaldo cuando la ilustracion aun no
    // esta subida, asi que se busca por contenido, no por igualdad.
    let j = obras.findIndex((o) => o.indexOf(OBRA_DE[nombre]) !== -1);
    if (j < 0) throw new Error("R3: la obra de " + nombre + " no está en pantalla");
    if (!bien) j = (j + 1) % obras.length;      // corrimiento cíclico: ningún punto fijo
    const as = await p.$$('[data-qa="autor"]'); await as[i].click(); await p.waitForTimeout(90);
    const os = await p.$$('[data-qa="obra"]'); await os[j].click(); await p.waitForTimeout(130);
  }
  await p.click("button:has-text('¡VERIFICAR!')");
}

async function partida(p, bien) {
  await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
  await abrirTema(p);
  await jugarR1(p, bien, bien);
  await p.waitForTimeout(900);
  if (!(await p.$("text=LA LÍNEA DORADA"))) throw new Error("R1: no apareció el revelado");
  const e1 = await estrellas(p);
  await p.waitForTimeout(3600);
  await jugarR2(p, bien);
  await p.waitForTimeout(900);
  if (!(await p.$("text=ASÍ SE JUGABA"))) throw new Error("R2: no apareció el revelado");
  const e2 = await estrellas(p);
  await p.waitForTimeout(3600);
  await jugarR3(p, bien);
  await p.waitForTimeout(900);
  // El revelado de la R3 se nota en el MARCO de las tarjetas de las obras: verde si
  // acertaste esa, rojo si no. Se mira el color calculado, no el atributo style.
  const marcadas = await p.evaluate(() => Array.from(document.querySelectorAll('[data-qa="obra"]'))
    .filter((e) => {
      const c = getComputedStyle(e).borderTopColor;
      return c === "rgb(46, 204, 143)" || c === "rgb(255, 107, 107)";
    }).length);
  if (marcadas === 0) throw new Error("R3: no apareció el revelado");
  // ⚠ El HUD de ⭐ desaparece con la pantalla de resultados: se sondea mientras existe y
  // se guarda el ultimo valor bueno, como en el e2e del Tema 1.
  let fin = e2;
  for (let i = 0; i < 24; i++) { const h = await estrellas(p); if (h >= 0) fin = h; await p.waitForTimeout(200); }
  await p.waitForSelector("text=acertaste", { timeout: 15000 });
  const rep = (await p.textContent("body")).match(/QA, acertaste \d+ de \d+/);
  return { e1: e1, e2: e2, fin: fin, rep: rep ? rep[0] : "(sin reporte)" };
}

(async () => {
  srv.listen(PORT);
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await ctx.newPage();
  const errores = [];
  p.on("console", (m) => { if (m.type() === "error" && m.text().indexOf("Failed to load resource") === -1) errores.push(m.text()); });
  p.on("pageerror", (e) => errores.push(String(e)));

  let mal = 0;
  const ok = (c, t) => { console.log((c ? "OK  " : "X   ") + t); if (!c) mal++; };

  console.log("\n── Partida PERFECTA ──");
  const a = await partida(p, true);
  ok(a.e1 === 3, "R1: 3 ⭐ por los tres nudos (dio " + a.e1 + ")");
  ok(a.e2 === 5, "R2: +2 ⭐ por los dos juguetes (acumulado " + a.e2 + ")");
  ok(a.fin === 8, "Total 8 ⭐ (dio " + a.fin + ")");
  ok(a.rep === "QA, acertaste 3 de 3", "Reporte: " + a.rep);

  console.log("\n── Partida FALLADA ──");
  const b = await partida(p, false);
  ok(b.fin === 0, "Total 0 ⭐ fallando todo (dio " + b.fin + ")");
  ok(b.rep === "QA, acertaste 0 de 3", "Reporte: " + b.rep);

  console.log("\n── Sin repetir al recargar ──");
  const vistos = [];
  for (let i = 0; i < 6; i++) {
    await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
    await abrirTema(p);
    await p.waitForSelector('[data-qa="hecho"]');
    vistos.push(await p.textContent('[data-qa="hecho"]'));
  }
  let seguidos = 0;
  for (let i = 1; i < vistos.length; i++) if (vistos[i] === vistos[i - 1]) seguidos++;
  ok(seguidos === 0, "R1: ningún ejercicio repetido en recargas seguidas");

  ok(errores.length === 0, "Sin errores de consola" + (errores.length ? ": " + errores[0] : ""));
  console.log(mal === 0 ? "\nTODO OK\n" : "\n" + mal + " FALLO(S)\n");
  await br.close(); srv.close();
  process.exit(mal === 0 ? 0 : 1);
})();
