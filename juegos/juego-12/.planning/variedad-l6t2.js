// ¿Cuánto cambia el Tema 2 al recargar? Mide, en 8 partidas nuevas:
//   R1 — el orden de la paleta de colores (la bandera es una sola: es un símbolo).
//   R2 — el orden en que se piden los cuatro gobernantes (4! = 24).
//   R3 — el orden de los renglones en el papel y el de las tres consignas.
// Lo que se informa es el número de combinaciones DISTINTAS vistas, sin adornos.
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8902;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });
const N = 8;

(async () => {
  srv.listen(PORT);
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: 1280, height: 800 } });   // mismo contexto: el anti-repetición vive en localStorage
  const p = await ctx.newPage();
  const vistos = { paleta: {}, jefes: {}, papel: {}, consignas: {} };
  for (let i = 0; i < N; i++) {
    await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
    await p.click("button:has-text('Libro 6')");
    await p.click("button:has-text('La Revolución Marcista')");
    await p.fill("input.ed-input", "QA");
    await p.click("button:has-text('ENTRAR')");
    await p.waitForTimeout(450);
    const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(650); }

    await p.waitForSelector("text=Arma la bandera");
    const paleta = await p.evaluate(() => Array.from(document.querySelectorAll("button")).filter((b) => /^(blanco|azul|rojo|amarillo|verde)$/.test(b.textContent.trim())).map((b) => b.textContent.trim()).join(","));
    vistos.paleta[paleta] = 1;
    for (const c of ["blanco", "azul", "blanco"]) { const b = await p.$(`button:has-text('${c}')`); await b.click(); await p.waitForTimeout(70); }
    const mas = await p.$("button:has-text('+')"); for (let k = 0; k < 3; k++) { await mas.click(); await p.waitForTimeout(50); }
    await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(4300);

    await p.waitForSelector("text=cuatro gobiernos a la vez");
    const CIUDAD_DE = { "García Moreno": "Quito", "Guillermo Franco": "Guayaquil", "Jerónimo Carrión": "Cuenca", "Manuel Carrión Pinzano": "Loja" };
    const seq = [];
    for (let k = 0; k < 4; k++) {
    // La R2 ahora pide SOLO DOS gobernantes: se para cuando el cartel desaparece.
    if (!(await p.$("text=¿Dónde mandaba?"))) break;
      const jefe = (await p.textContent('[data-qa="pedido"]')).trim();
      seq.push(jefe);
      const pt = await p.evaluate((c) => { const t = Array.from(document.querySelectorAll("text")).find((x) => x.textContent.trim() === c); const g = t && t.closest("g"); if (!g) return null; const r = g.getBoundingClientRect(); return { x: r.left + 8, y: r.top + r.height / 2 }; }, CIUDAD_DE[jefe]);
      if (pt) { await p.mouse.click(pt.x, pt.y); await p.waitForTimeout(140); }
      // ⚠ Cada gobernante lleva su PROPIO ¡VERIFICAR!: el último cierra la ronda.
      await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(500);
    }
    vistos.jefes[seq.join(",")] = 1;
    await p.waitForTimeout(4300);

    await p.waitForSelector("text=¿Cuáles cayeron en 1845?");
    const papel = await p.evaluate(() => Array.from(document.querySelectorAll("div")).filter((d) => d.style && d.style.touchAction === "none" && d.textContent.trim().indexOf("▸") === 0).map((d) => d.textContent.trim().slice(2, 18)).join("|"));
    vistos.papel[papel] = 1;
    const RENGLON_DE = {
      "Rompe al hombre contra el que se levantó Guayaquil.": "Flores",
      "Rompe el impuesto que hizo estallar el 6 de marzo.": "tres pesos",
      "La Iglesia vuelve al país: rompe lo que la tenía fuera.": "Iglesia",
    };
    const cons = [];
    for (let k = 0; k < 3; k++) {
      if (await p.$("text=Pulsa ¡VERIFICAR!")) break;
      const pide = (await p.textContent('[data-qa="consigna"]')).trim();
      const clave = RENGLON_DE[pide];
      cons.push(clave);
      const caja = await p.evaluate((clave) => { const f = Array.from(document.querySelectorAll("div")).filter((d) => d.style && d.style.touchAction === "none" && d.textContent.trim().indexOf("▸") === 0 && getComputedStyle(d).opacity !== "0").find((d) => d.textContent.indexOf(clave) >= 0); if (!f) return null; const r = f.getBoundingClientRect(); return { x: r.left + 12, y: r.top + r.height / 2, w: r.width }; }, clave);
      if (!caja) break;
      await p.mouse.move(caja.x, caja.y); await p.mouse.down();
      await p.mouse.move(caja.x + caja.w * 0.95, caja.y, { steps: 8 });
      await p.mouse.up(); await p.waitForTimeout(260);
    }
    vistos.consignas[cons.join(",")] = 1;
    await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(1200);
  }
  const n = (o) => Object.keys(o).length;
  console.log(`En ${N} partidas:`);
  console.log(`  R1 · orden de la paleta ........ ${n(vistos.paleta)}/${N} distintos (de 120 posibles)`);
  console.log(`  R2 · qué dos gobernantes y en qué orden .. ${n(vistos.jefes)}/${N} distintos (de 12 posibles)`);
  console.log(`  R3 · orden del papel ........... ${n(vistos.papel)}/${N} distintos (de 24 posibles)`);
  console.log(`  R3 · orden de las consignas .... ${n(vistos.consignas)}/${N} distintos (de 6 posibles)`);
  console.log("\n⚠ La bandera y los cuatro gobiernos son los del libro: lo que varía es el");
  console.log("   RECORRIDO, no el contenido. No hay banco del que sortear sin inventar historia.");
  await br.close(); srv.close();
})();
