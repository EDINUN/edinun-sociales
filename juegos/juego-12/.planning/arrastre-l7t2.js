// Comprueba el ARRASTRE de las dos manos nuevas del Libro 7 · Tema 2, con ratón de
// verdad (no con clicks), que es como se escapó el fallo del Tema 1:
//
//   R1 · el nudo de la curva se queda DONDE LO SUELTAS, agarrándolo por arriba, por el
//        centro y por abajo de su zona (el gesto es relativo: no importa dónde se agarre).
//   R3 · el hilo va del autor a la obra, se puede CAMBIAR arrastrando otra vez, soltar
//        fuera no engancha nada, y dos autores no pueden colgar de la misma obra.
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8913;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });

async function abrir(p) {
  await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
  await p.waitForSelector("button:has-text('Libro 7')", { timeout: 60000 });
  await p.click("button:has-text('Libro 7')");
  await p.click("button:has-text('Insurgencia y velasquismo')");
  await p.fill("input.ed-input", "QA");
  await p.click("button:has-text('ENTRAR')");
  await p.waitForTimeout(500);
  const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(700); }
}

// cy del nudo k (0 = el primero que se mueve), leído del SVG.
// ⚠ Se descartan los círculos de halo (r = 17): comparten la x del nudo activo y
// descolocaban el índice.
const cyNudo = (p, k) => p.evaluate((i) => {
  const cs = Array.from(document.querySelectorAll("circle"))
    .filter((c) => { const r = Number(c.getAttribute("r")); return r === 7 || r === 10; })
    .map((c) => ({ x: Number(c.getAttribute("cx")), y: Number(c.getAttribute("cy")) }))
    .sort((a, b) => a.x - b.x);
  return cs[i + 1] ? cs[i + 1].y : null;   // el 0 es el punto de partida, que no se toca
}, k);
const Y0 = 16, Y1 = 262, PASO = (Y1 - Y0) / 4;   // un escalón de banda, en px del lienzo
// Cuántos hilos hay tendidos ahora mismo (las líneas del SVG de la R3).
const hilos = (p) => p.evaluate(() => Array.from(document.querySelectorAll("line")).filter((l) => Number(l.getAttribute("stroke-width")) === 4).length);

(async () => {
  srv.listen(PORT);
  const br = await chromium.launch();
  const p = await (await br.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  let mal = 0;
  const ok = (c, t) => { console.log((c ? "OK  " : "X   ") + t); if (!c) mal++; };

  // ── R1 · el nudo se IMANTA a la banda de al lado, se agarre por donde se agarre ──
  // ⚠ Cada vuelta mueve un nudo distinto, y desde el 2026-11-24 CUALQUIERA se puede
  // mover, esté colocado o no: eso es lo que sustituyó al botón BORRAR en esta ronda.
  await abrir(p);
  await p.waitForSelector('[data-qa="nudo"]');
  const AGARRES = [["borde de arriba", 0.15], ["centro", 0.5], ["borde de abajo", 0.85]];
  for (let k = 0; k < 3; k++) {
    const z = await (await p.$$('[data-qa="nudo"]'))[k].boundingBox();
    const esc = z.height / (Y1 + 4);
    const [nombre, f] = AGARRES[k];
    const antes = await cyNudo(p, k);
    // Un escalón entero hacia donde haya sitio, soltando 8 px antes del riel para que el
    // imán tenga que trabajar.
    const haciaAbajo = antes < Y0 + 2 * PASO;
    const dy = (haciaAbajo ? PASO - 8 : -(PASO - 8)) * esc;
    // ⚠ El agarre se corre si el gesto se saldría de la ventana: Playwright recorta el
    // ratón al viewport y el nudo no llegaría — sería un fallo del test, no del juego.
    let yAg = z.y + z.height * f;
    if (yAg + dy > 780) yAg = 780 - dy;
    if (yAg + dy < 20) yAg = 20 - dy;
    await p.mouse.move(z.x + z.width / 2, yAg); await p.mouse.down();
    await p.mouse.move(z.x + z.width / 2, yAg + dy, { steps: 8 });
    const enVuelo = await cyNudo(p, k);
    await p.mouse.up(); await p.waitForTimeout(240);
    const despues = await cyNudo(p, k);
    const esperado = antes + (haciaAbajo ? PASO : -PASO);
    ok(enVuelo !== null && Math.abs(enVuelo - antes) > 20, "R1 · agarre por el " + nombre + ": el nudo sigue al dedo");
    ok(despues !== null && Math.abs(despues - esperado) < 6,
      "R1 · agarre por el " + nombre + ": se imantó al riel de al lado (" + Math.round(despues) + ", esperado " + Math.round(esperado) + ")");
  }

  // ── R3 · los hilos ──
  await abrir(p);
  // Se resuelven las dos primeras rondas de cualquier manera para llegar a la tercera.
  await p.waitForSelector('[data-qa="nudo"]');
  for (let k = 0; k < 3; k++) { const z = await (await p.$$('[data-qa="nudo"]'))[k].boundingBox(); await p.mouse.move(z.x + z.width / 2, z.y + z.height / 2); await p.mouse.down(); await p.mouse.up(); await p.waitForTimeout(140); }
  await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(4300);
  await p.waitForSelector('[data-qa="zona"]');
  for (let k = 0; k < 3; k++) {
    const z = await (await p.$('[data-qa="zona"]')).boundingBox();
    const cx = z.x + z.width / 2, cy = z.y + z.height / 2;
    await p.mouse.move(cx, cy - 60); await p.mouse.down();
    await p.mouse.move(cx, cy + 60, { steps: 8 }); await p.mouse.up();
    await p.waitForTimeout(260);
  }
  await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(4300);
  await p.waitForSelector('[data-qa="autor"]');

  const centro = async (sel, i) => { const b = await (await p.$$(sel))[i].boundingBox(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; };
  async function tender(i, j) {
    const a = await centro('[data-qa="autor"]', i), o = await centro('[data-qa="obra"]', j);
    await p.mouse.move(a.x, a.y); await p.mouse.down();
    await p.mouse.move((a.x + o.x) / 2, (a.y + o.y) / 2, { steps: 5 });
    await p.mouse.move(o.x, o.y, { steps: 5 });
    await p.mouse.up(); await p.waitForTimeout(200);
  }

  await tender(0, 0);
  ok(await hilos(p) === 1, "R3 · arrastrar del autor a la obra tiende el hilo");
  await tender(0, 1);
  ok(await hilos(p) === 1, "R3 · arrastrar otra vez desde el mismo autor CAMBIA el hilo, no suma otro");
  await tender(1, 1);
  ok(await hilos(p) === 1, "R3 · dos autores no pueden colgar de la misma obra: el hilo viejo se suelta");

  // Soltar en tierra de nadie no engancha nada.
  const a2 = await centro('[data-qa="autor"]', 2);
  await p.mouse.move(a2.x, a2.y); await p.mouse.down();
  await p.mouse.move(a2.x + 10, a2.y - 60, { steps: 6 });
  await p.mouse.up(); await p.waitForTimeout(200);
  ok(await hilos(p) === 1, "R3 · soltar fuera de las obras no engancha nada");

  // Y el respaldo por toque sigue vivo.
  const as = await p.$$('[data-qa="autor"]'); await as[2].click(); await p.waitForTimeout(90);
  const os = await p.$$('[data-qa="obra"]'); await os[2].click(); await p.waitForTimeout(160);
  ok(await hilos(p) === 2, "R3 · respaldo por toque: autor y luego obra");

  console.log(mal === 0 ? "\nTODO OK\n" : "\n" + mal + " FALLO(S)\n");
  await br.close(); srv.close();
  process.exit(mal === 0 ? 0 : 1);
})();
