// e2e del TEMA 4 de juego-10 — "Vivir en equilibrio con la Naturaleza".
// Juega una partida PERFECTA (12 ⭐) y una FALLADA (0 ⭐ con revelado), y comprueba que no
// hay errores de consola. Se entra por el botón del tema, porque `qa-visual.js` solo
// recorre el tema por defecto.
//
// ⚠ La R1 exige emparejar PALABRA ↔ ESPACIO: los espacios abiertos cambian en cada
// partida, así que se deducen leyendo qué palabras del artículo faltan en el texto.
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales";
const PORT = 8871;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => {
  const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0]));
  fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } });
});

const CORRECTAS = ["reconoce", "garantiza", "sano", "ecológicamente", "contaminación", "armonía"];
const BUENAS_R2 = ["Huerto de productos", "Abono hecho", "Energía del sol", "Vivienda que aprovecha", "Semillas guardadas", "Canasta para intercambiar", "Macetas con perejil", "Un sitio para intercambiar", "Recoger el agua"];
const RASGOS = {
  "PROYECTOS AGROECOLÓGICOS": ["Se hacen con apoyo", "Involucran a los habitantes", "Ofrecen un espacio de integración", "Buscan beneficios sociales", "Son una opción de economías"],
  "PERMACULTURA": ["Crea espacios controlados", "Aprovecha las características", "Cultiva productos orgánicos", "Obtiene energía de fuentes", "Crea abonos y fertilizantes", "Construye viviendas"],
  "PRÁCTICAS CAMPESINAS": ["Preservan la mayor cantidad", "Son una práctica ancestral", "Cultivan en equilibrio", "Las emplea el 60"],
};

async function hud(p) {
  return await p.evaluate(() => {
    const d = Array.from(document.querySelectorAll("div")).find((x) => /^⭐\s*\d+$/.test(x.textContent.trim()));
    return d ? parseInt(d.textContent.replace(/\D/g, ""), 10) : -1;
  });
}

async function entrar(p) {
  await p.goto("http://localhost:" + PORT + "/juegos/juego-10/index.html", { waitUntil: "load" });
  await p.waitForSelector("input.ed-input");
  await p.fill("input.ed-input", "QA");
  await p.click("button:has-text('Vivir en equilibrio')");
  await p.click("button:has-text('ENTRAR')");
  await p.waitForTimeout(450);
  const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(650); }
  await p.waitForSelector("text=le faltan cuatro palabras");
}

// Las palabras que NO aparecen en el texto del artículo son, en ese mismo orden, las que
// corresponden a los espacios vacíos de izquierda a derecha.
async function jugarR1(p, bien) {
  const txt = (await p.locator("div[style*='width: 452px']").first().innerText()).replace(/\s+/g, " ");
  const faltan = CORRECTAS.filter((w) => txt.indexOf(w) === -1);
  for (let n = 0; n < faltan.length; n++) {
    const piezas = await p.$$("div[style*='flex-wrap: wrap'] > button");
    let elegida = null;
    for (const b of piezas) {
      const t = (await b.innerText()).trim();
      const correcta = t === faltan[n];
      const senuelo = CORRECTAS.indexOf(t) === -1;
      if (bien ? correcta : senuelo) { elegida = b; break; }
    }
    if (!elegida) elegida = (await p.$$("div[style*='flex-wrap: wrap'] > button"))[0];
    await elegida.click();
    const huecos = await p.$$("span[data-hueco]");
    let destino = null;
    for (const h of huecos) { if (!(await h.innerText()).trim()) { destino = h; break; } }
    if (!destino) break;
    await destino.click();
    await p.waitForTimeout(130);
  }
  await p.click("button:has-text('¡VERIFICAR!')");
  await p.waitForTimeout(4300);
}

async function jugarR2(p, bien) {
  await p.waitForSelector("text=Une cada opción de vida");
  const izq = await p.$$("button[style*='width: 168px']");
  const der = await p.$$("button[style*='width: 206px']");
  const textos = [];
  for (const d of der) textos.push((await d.innerText()).trim());
  // Índice de la característica que SÍ es de cada opción.
  const correcto = [];
  for (let i = 0; i < izq.length; i++) {
    const nombre = (await izq[i].innerText()).replace(/s+/g, " ").trim();
    const propios = RASGOS[Object.keys(RASGOS).find((k) => nombre.indexOf(k) >= 0)] || [];
    correcto.push(textos.findIndex((t) => propios.some((x) => t.indexOf(x) === 0)));
  }
  // ⚠ Para fallar hay que ROTAR, no elegir "una cualquiera que no sea": una característica
  // solo admite un dueño, así que repetir destino deja una opción sin unir y ¡VERIFICAR!
  // se queda inerte (la ronda exige las tres hechas).
  for (let i = 0; i < izq.length; i++) {
    const j = bien ? correcto[i] : correcto[(i + 1) % correcto.length];
    await izq[i].click();
    await der[j].click();
    await p.waitForTimeout(120);
  }
  await p.click("button:has-text('¡VERIFICAR!')");
  await p.waitForTimeout(4300);
}

async function jugarR3(p, bien) {
  await p.waitForSelector("text=Atrapa solo lo que cuida");
  let maxs = 0;
  const t0 = Date.now();
  while (Date.now() - t0 < 34000) {
    const h = await hud(p); if (h > maxs) maxs = h;
    const fichas = await p.$$("button[style*='width: 212px']");
    for (const f of fichas) {
      let t = "";
      try { t = (await f.innerText()).trim(); } catch (e) { continue; }
      const buena = BUENAS_R2.some((x) => t.indexOf(x) >= 0);
      // ⚠ click() normal NO sirve: Playwright espera a que el elemento esté QUIETO y estas
      // fichas se mueven todo el tiempo, así que agota el tiempo sin tocar nada.
      if (bien === buena) { try { await f.dispatchEvent("click"); } catch (e) {} }
    }
    if (!(await p.$("text=Atrapa solo lo que cuida"))) break;
    await p.waitForTimeout(220);
  }
  return "prácticas · ⭐ al cerrar la ronda: " + maxs;
}

async function partida(p, bien, etiqueta) {
  await entrar(p);
  await jugarR1(p, bien);
  const s1 = await hud(p);
  await jugarR2(p, bien);
  const s2 = await hud(p);
  const op = await jugarR3(p, bien);
  let s3 = s2;
  for (let i = 0; i < 26; i++) { const h = await hud(p); if (h >= 0) s3 = h; await p.waitForTimeout(200); }
  const lin = (await p.evaluate(() => document.body.innerText)).split("\n").map((x) => x.trim()).filter(Boolean);
  const res = lin.slice(0, 22).join(" | ");
  console.log("  " + etiqueta + ": R1 → " + s1 + " ⭐ · R2 → " + s2 + " ⭐ · R3 → " + s3 + " ⭐ · opción: " + op);
  console.log("  reporte: " + (res || lin.slice(0, 8).join(" | ")));
}

(async () => {
  srv.listen(PORT);
  const br = await chromium.launch();
  const p = await (await br.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  const errores = [];
  p.on("console", (m) => { if (m.type() === "error") errores.push(m.text()); });
  p.on("pageerror", (e) => errores.push("pageerror: " + e.message));
  console.log("── PARTIDA PERFECTA (esperado 4 · 8 · 12 ⭐) ──");
  await partida(p, true, "perfecta");
  console.log("\n── PARTIDA FALLADA (esperado 0 · 0 · 0 ⭐) ──");
  await partida(p, false, "fallada");
  console.log("\nErrores de consola: " + (errores.length ? errores.join(" | ") : "ninguno"));
  await br.close(); srv.close();
})();
