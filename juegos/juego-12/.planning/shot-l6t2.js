// Capturas del Libro 6 · Tema 2 ("Revolución Marcista"), para revisar el aspecto.
// Uso: node shot-l6t2.js [carpeta de salida]
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8900;
const OUT = process.argv[2] || ".";
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });

(async () => {
  srv.listen(PORT);
  const br = await chromium.launch();
  const p = await (await br.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  const tiro = (n) => p.screenshot({ path: path.join(OUT, "j12-t2-" + n + ".png") });
  await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
  await p.click("button:has-text('Libro 6')");
  await p.click("button:has-text('La Revolución Marcista')");
  await tiro("home");
  await p.fill("input.ed-input", "QA");
  await p.click("button:has-text('ENTRAR')");
  await p.waitForTimeout(500);
  const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(700); }

  await p.waitForSelector("text=Arma la bandera");
  await tiro("r1");
  for (const c of ["blanco", "azul", "blanco"]) { const b = await p.$(`button:has-text('${c}')`); await b.click(); await p.waitForTimeout(110); }
  const mas = await p.$("button:has-text('+')"); for (let i = 0; i < 3; i++) { await mas.click(); await p.waitForTimeout(70); }
  await tiro("r1-armada");
  await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(900);
  await tiro("r1-verificada");
  await p.waitForTimeout(3500);

  await p.waitForSelector("text=cuatro gobiernos a la vez");
  await tiro("r2");
  const CICLO = ["Quito", "Guayaquil", "Cuenca", "Loja"];
  const CIUDAD_DE = { "García Moreno": "Quito", "Guillermo Franco": "Guayaquil", "Jerónimo Carrión": "Cuenca", "Manuel Carrión Pinzano": "Loja" };
  for (let k = 0; k < 4; k++) {
    // La R2 ahora pide SOLO DOS gobernantes: se para cuando el cartel desaparece.
    if (!(await p.$("text=¿Dónde mandaba?"))) break;
    const jefe = (await p.textContent('[data-qa="pedido"]')).trim();
    // ⚠ Para ver el revelado hay que fallar, pero fallando SOLO UNA las demás chocan con
    // una ciudad ya ocupada y la ronda se queda sin completar. Se corre la lista entera
    // un puesto: es una permutación sin puntos fijos, así que ninguna cae bien y ninguna
    // choca. La captura "verificada" sale, por tanto, con las cuatro en rojo.
    const ciudad = CICLO[(CICLO.indexOf(CIUDAD_DE[jefe]) + 1) % 4];
    const pt = await p.evaluate((c) => { const t = Array.from(document.querySelectorAll("text")).find((x) => x.textContent.trim() === c); const g = t && t.closest("g"); if (!g) return null; const r = g.getBoundingClientRect(); return { x: r.left + 8, y: r.top + r.height / 2 }; }, ciudad);
    if (pt) { await p.mouse.click(pt.x, pt.y); await p.waitForTimeout(150); }
    // ⚠ Cada gobernante lleva su PROPIO ¡VERIFICAR!: se valida uno a uno.
    if (k === 0) await tiro("r2-elegida");
    await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(500);
    if (k === 0) await tiro("r2-primera-verificada");
  }
  await p.waitForTimeout(500);
  await tiro("r2-verificada");
  await p.waitForTimeout(3500);

  await p.waitForSelector("text=¿Cuáles cayeron en 1845?");
  await tiro("r3");
  // La R3 ya no va por pedidos: se rompen dos de las que cayeron y una que no, para que
  // el revelado salga con sus tres casos (✓, ✗ y el ámbar de la que quedó entera).
  const ROMPER = ["Flores", "tres pesos", "esclavos"];
  for (let k = 0; k < ROMPER.length; k++) {
    const caja = await p.evaluate((clave) => {
      const filas = Array.from(document.querySelectorAll("div")).filter((d) => d.style && d.style.touchAction === "none" && d.textContent.trim().indexOf("▸") === 0 && getComputedStyle(d).opacity !== "0");
      const f = filas.find((d) => d.textContent.indexOf(clave) >= 0);
      if (!f) return null;
      const r = f.getBoundingClientRect();
      return { x: r.left + 12, y: r.top + r.height / 2, w: r.width };
    }, ROMPER[k]);
    if (!caja) continue;
    await p.mouse.move(caja.x, caja.y);
    await p.mouse.down();
    await p.mouse.move(caja.x + caja.w * 0.4, caja.y, { steps: 5 });
    if (k === 0) await tiro("r3-rasgando");
    await p.mouse.move(caja.x + caja.w * 0.95, caja.y, { steps: 8 });
    await p.mouse.up();
    await p.waitForTimeout(300);
  }
  await tiro("r3-rota");
  await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(1000);
  await tiro("r3-verificada");
  console.log("capturas en " + OUT);
  await br.close(); srv.close();
})();
