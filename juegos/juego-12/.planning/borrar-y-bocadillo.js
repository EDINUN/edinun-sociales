// Dos cosas que pidió la autora el 2026-11-23:
//   1. R1 (la bandera): BORRAR deshace SOLO LO ÚLTIMO (igual que la Carta), no vacía la
//      bandera entera. Y cuenta tanto los colores como las estrellas, en el orden en que
//      se hicieron.
//   2. R2 (el mapa): al verificar al SEGUNDO gobernante ya no queda nada que tocar, así
//      que el bocadillo NO puede seguir diciendo "Toca en el mapa la ciudad…".
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8913;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });

// Cuántos cuarteles de la bandera están pintados, y cuántas estrellas marca el contador.
const estado = (p) => p.evaluate(() => {
  const n = Array.from(document.querySelectorAll("span")).find((x) => x.textContent.trim() === "Estrellas del centro");
  const fila = n ? n.parentElement : null;
  const num = fila ? Array.from(fila.querySelectorAll("span")).map((x) => x.textContent.trim()).find((t) => /^\d$/.test(t)) : null;
  // La bandera es un <svg>: un cuartel pintado es un <rect> con uno de los cinco colores
  // de la paleta; el vacío va en blanco translúcido.
  const COLS = ["#fdfaf0", "#1f4fa8", "#c0392b", "#f1c40f", "#1f8a54"];
  const pintados = Array.from(document.querySelectorAll("svg rect")).filter((x) => COLS.indexOf((x.getAttribute("fill") || "").toLowerCase()) >= 0).length;
  return { estrellas: num === undefined || num === null ? -1 : parseInt(num, 10), pintados: pintados };
});
const bocadillo = (p) => p.evaluate(() => {
  const d = Array.from(document.querySelectorAll("div")).filter((x) => /rgba\(242, 194, 96, 0.65\)/.test(x.style.border || ""))[0];
  return d ? d.textContent.replace(/\s+/g, " ").trim() : "(sin bocadillo)";
});

(async () => {
  srv.listen(PORT);
  const br = await chromium.launch();
  const p = await (await br.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  const fallos = [];
  p.on("pageerror", (e) => fallos.push("pageerror: " + e.message));
  await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
  await p.click("button:has-text('Libro 6')");
  await p.click("button:has-text('La Revolución Marcista')");
  await p.fill("input.ed-input", "QA");
  await p.click("button:has-text('ENTRAR')");
  await p.waitForTimeout(500);
  const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(700); }
  await p.waitForSelector("text=Arma la bandera");

  // ── 1. La bandera: dos colores y una estrella; luego se deshace al revés ──
  const btn = () => p.$("button:has-text('BORRAR')");
  if (await (await btn()).isDisabled() === false) fallos.push("BORRAR debería estar apagado antes de tocar nada");
  for (const c of ["blanco", "azul"]) { const b = await p.$(`button:has-text('${c}')`); await b.click(); await p.waitForTimeout(80); }
  await (await p.$("button:has-text('+')")).click(); await p.waitForTimeout(80);
  const a0 = await estado(p);
  await (await btn()).click(); await p.waitForTimeout(220);
  const a1 = await estado(p);                      // se va la ESTRELLA, no los colores
  await (await btn()).click(); await p.waitForTimeout(220);
  const a2 = await estado(p);                      // ahora sí, el último color
  console.log("bandera: " + a0.pintados + " colores/" + a0.estrellas + "⭐ → " + a1.pintados + "/" + a1.estrellas + " → " + a2.pintados + "/" + a2.estrellas);
  if (!(a1.estrellas === 0 && a1.pintados === a0.pintados)) fallos.push("el primer BORRAR no deshizo SOLO la estrella");
  if (a2.pintados !== a0.pintados - 1) fallos.push("el segundo BORRAR no deshizo SOLO el último color");

  // La ronda se termina para llegar al mapa.
  await (await p.$("button:has-text('blanco')")).click(); await p.waitForTimeout(80);
  const falta = await p.$("button:has-text('azul')"); if (falta) { await falta.click(); await p.waitForTimeout(80); }
  await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(4300);

  // ── 2. El mapa: el bocadillo tiene que cambiar al cerrar el segundo gobernante ──
  await p.waitForSelector("text=cuatro gobiernos a la vez");
  const CIUDAD_DE = { "García Moreno": "Quito", "Guillermo Franco": "Guayaquil", "Jerónimo Carrión": "Cuenca", "Manuel Carrión Pinzano": "Loja" };
  let antesDelUltimo = "";
  for (let k = 0; k < 4; k++) {
    if (!(await p.$("text=¿Dónde mandaba?"))) break;
    antesDelUltimo = await bocadillo(p);
    const jefe = (await p.textContent('[data-qa="pedido"]')).trim();
    const pt = await p.evaluate((c) => { const t = Array.from(document.querySelectorAll("text")).find((x) => x.textContent.trim() === c); const g = t && t.closest("g"); if (!g) return null; const r = g.getBoundingClientRect(); return { x: r.left + 8, y: r.top + r.height / 2 }; }, CIUDAD_DE[jefe]);
    if (pt) { await p.mouse.click(pt.x, pt.y); await p.waitForTimeout(150); }
    await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(500);
  }
  const final = await bocadillo(p);
  console.log("bocadillo durante el último turno: \"" + antesDelUltimo + "\"");
  console.log("bocadillo al cerrar la ronda:      \"" + final + "\"");
  if (/Toca en el mapa/i.test(final)) fallos.push("el bocadillo sigue pidiendo tocar el mapa con la ronda terminada");

  console.log("\n" + (fallos.length ? "X " + fallos.join(" | ") : "OK BORRAR deshace solo lo último en la bandera, y el bocadillo del mapa cambia al cerrar la ronda."));
  await br.close(); srv.close();
})();
