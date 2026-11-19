// Detector de SOLAPES sobre el LIENZO ENTERO de juego-12 (900x540), no solo el carril de
// la mecánica: entran el personaje y su bocadillo, el logo, el reloj, el contador de
// estrellas, el bloque RONDA, la columna de acciones y la mecánica, todos contra todos.
//
// Qué se mide: los BOTONES y los elementos de TEXTO HOJA (los que no contienen a otro
// elemento). Es lo que se lee; dos cajas decorativas superpuestas no son un defecto, dos
// textos encima sí. Descartes a propósito, todos justificados:
//   · un elemento que contiene a otro de la lista (un span dentro de su botón SIEMPRE se
//     solapa con él);
//   · lo invisible: display/visibility, y la opacidad MIRANDO TAMBIÉN A LOS ANCESTROS,
//     porque la opacidad no se hereda como valor calculado;
//   · lo que está dentro de un contenedor con overflow:hidden se mide contra ese recorte.
// Siempre informa CUÁNTOS elementos midió: un "sin solapes" sobre pocos no prueba nada.
//
// Se mide en reposo Y EN MITAD DEL GESTO (rasgando un renglón del Tema 2), que es cuando
// aparecen las piezas que flotan.
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8903;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });
const VIEWPORTS = [[1280, 800], [1024, 640], [1440, 900], [900, 560], [1600, 1000]];
const CIUDADANOS = ["Don Ramón", "Don Tomás", "Capitán Vargas", "Padre Ignacio"];

async function medir(p, etiqueta, fallos) {
  const r = await p.evaluate(() => {
    const stage = Array.from(document.querySelectorAll("div")).find((d) => d.style && d.style.width === "900px" && d.style.height === "540px");
    if (!stage) return { err: "no se encontró el lienzo 900x540" };
    const sr = stage.getBoundingClientRect();
    const hojaTexto = (e) => e.children.length === 0 && (e.textContent || "").trim().length > 0;
    const invisible = (e) => {
      for (let n = e; n && n !== document.body; n = n.parentElement) {
        const s = getComputedStyle(n);
        if (s.visibility === "hidden" || s.display === "none" || parseFloat(s.opacity) < 0.05) return true;
      }
      return false;
    };
    // La pieza que va PEGADA AL DEDO durante un arrastre se solapa con el tablero a
    // propósito: es lo que significa llevarla en la mano. Lo que la distingue es estar
    // LEVANTADA sobre todo lo demás (z-index >= 50); nada del reposo usa esa capa. Sirve
    // igual para el fantasma flotante de la línea del tiempo (absolute, z 80, sin
    // pointer-events) que para la ficha de la pirámide, que es un botón normal con z 60.
    // ⚠ Comprobado con capturas en 1280x800 y 1600x1000 antes de descartarlo: el único
    // par que marcaba era la ficha en la mano contra el escalón que tiene debajo.
    const enLaMano = (e) => {
      for (let n = e; n && n !== document.body; n = n.parentElement) {
        if (parseInt(getComputedStyle(n).zIndex || "0", 10) >= 50) return true;
      }
      return false;
    };
    let cand = Array.from(stage.querySelectorAll("*")).filter((e) => {
      if (e.tagName === "IMG" || e.closest("svg")) return false;
      if (invisible(e) || enLaMano(e)) return false;
      const b = e.getBoundingClientRect();
      if (b.width <= 2 || b.height <= 2) return false;
      // Un boton SIN TEXTO y sin fondo ni borde es una ZONA DE TOQUE, no algo que se
      // vea: los cuarteles de la bandera son eso, y taparlos con el aviso es a proposito.
      if (e.tagName === "BUTTON") {
        const s2 = getComputedStyle(e);
        const pintado = (s2.backgroundColor && s2.backgroundColor !== "rgba(0, 0, 0, 0)") || parseFloat(s2.borderTopWidth) > 0;
        if (!(e.textContent || "").trim() && !pintado) return false;
        return true;
      }
      return hojaTexto(e);
    });
    cand = cand.filter((e) => !cand.some((o) => o !== e && e.contains(o)));
    const recorte = (e) => { let n = e.parentElement; while (n && n !== document.body) { if (getComputedStyle(n).overflow === "hidden") return n.getBoundingClientRect(); n = n.parentElement; } return null; };
    const cajas = cand.map((e) => {
      const b = e.getBoundingClientRect(), c = recorte(e);
      const x = c ? Math.max(b.left, c.left) : b.left, rr = c ? Math.min(b.right, c.right) : b.right;
      const y = c ? Math.max(b.top, c.top) : b.top, bo = c ? Math.min(b.bottom, c.bottom) : b.bottom;
      // Para reconocer los trozos de UNA MISMA FRASE: dos inline hermanos se pisan 2-3 px
      // por la altura de línea, que es como fluye el texto, no un defecto.
      const enLinea = getComputedStyle(e).display.indexOf("inline") >= 0;
      return { t: (e.textContent || "").replace(/\s+/g, " ").trim().slice(0, 24) || "<" + e.tagName.toLowerCase() + ">", x, y, r: rr, b: bo, padre: e.parentElement, enLinea, vis: rr - x > 2 && bo - y > 2, cut: e.scrollWidth > e.clientWidth + 1 };
    }).filter((c) => c.vis);
    const fuera = cajas.filter((c) => c.x < sr.left - 1 || c.r > sr.right + 1 || c.y < sr.top - 1 || c.b > sr.bottom + 1);
    const cortados = cajas.filter((c) => c.cut);
    const solapes = [];
    for (let i = 0; i < cajas.length; i++) for (let j = i + 1; j < cajas.length; j++) {
      const a = cajas[i], b = cajas[j];
      const ox = Math.min(a.r, b.r) - Math.max(a.x, b.x), oy = Math.min(a.b, b.b) - Math.max(a.y, b.y);
      if (a.enLinea && b.enLinea && a.padre === b.padre) continue;   // trozos de la misma frase
      if (ox > 2 && oy > 2) solapes.push(a.t + " <-> " + b.t + " (" + Math.round(ox) + "x" + Math.round(oy) + ")");
    }
    return { n: cajas.length, fuera: fuera.map((c) => c.t), cortados: cortados.map((c) => c.t), solapes };
  });
  if (r.err) { fallos.push(etiqueta + " -> " + r.err); return etiqueta + ": X " + r.err; }
  if (r.n < 6) { fallos.push(etiqueta + " -> solo " + r.n + " elementos medidos (no prueba nada)"); return etiqueta + ": X " + r.n + " elementos"; }
  const malo = r.fuera.length || r.cortados.length || r.solapes.length;
  if (malo) fallos.push(etiqueta + " -> fuera:[" + r.fuera + "] cortados:[" + r.cortados + "] solapes:[" + r.solapes.join(" · ") + "]");
  return etiqueta + ": " + r.n + " elementos" + (malo ? "  X" : "  OK");
}

async function abrir(p, tema) {
  await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
  await p.waitForSelector("button:has-text('Libro 6')");
  await p.click("button:has-text('Libro 6')");
  await p.click(`button:has-text('${tema}')`);
  await p.fill("input.ed-input", "QA");
  await p.click("button:has-text('ENTRAR')");
  await p.waitForTimeout(500);
  const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(700); }
}

(async () => {
  srv.listen(PORT);
  const br = await chromium.launch();
  const fallos = [];
  for (const [w, h] of VIEWPORTS) {
    const et = w + "x" + h;
    const p = await (await br.newContext({ viewport: { width: w, height: h } })).newPage();
    p.on("pageerror", (e) => fallos.push(et + " pageerror: " + e.message));

    // ───────── TEMA 1 ─────────
    await abrir(p, "Los primeros años del Ecuador");
    await p.waitForSelector("div[style*='width: 221px']");
    console.log(await medir(p, et + " T1 R1 antes", fallos));
    for (const t of await p.$$("div[style*='width: 221px']")) {
      const s = (await t.innerText()).replace(/\s+/g, " ");
      await (await t.$(CIUDADANOS.some((n) => s.indexOf(n) >= 0) ? "button:has-text('SÍ')" : "button:has-text('NO')")).click();
    }
    await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(900);
    console.log(await medir(p, et + " T1 R1 revelado", fallos));
    await p.waitForTimeout(3500);
    await p.waitForSelector("text=Arma la pirámide social");
    console.log(await medir(p, et + " T1 R2 antes", fallos));
    // En mitad del arrastre de una ficha de la pirámide
    const ficha = (await p.$$("div[style*='min-height: 44px'] > button"))[0];
    if (ficha) {
      const bb = await ficha.boundingBox();
      await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2);
      await p.mouse.down();
      await p.mouse.move(bb.x + bb.width / 2, bb.y - 60, { steps: 6 });
      console.log(await medir(p, et + " T1 R2 EN PLENO ARRASTRE", fallos));
      await p.mouse.up(); await p.waitForTimeout(250);
    }

    // ───────── TEMA 2 ─────────
    await abrir(p, "La Revolución Marcista");
    await p.waitForSelector("text=Arma la bandera");
    console.log(await medir(p, et + " T2 R1 antes", fallos));
    for (const c of ["blanco", "azul", "blanco"]) { const b = await p.$(`button:has-text('${c}')`); await b.click(); await p.waitForTimeout(80); }
    const mas = await p.$("button:has-text('+')"); for (let i = 0; i < 3; i++) { await mas.click(); await p.waitForTimeout(50); }
    await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(900);
    console.log(await medir(p, et + " T2 R1 revelado", fallos));
    await p.waitForTimeout(3500);

    await p.waitForSelector("text=cuatro gobiernos a la vez");
    console.log(await medir(p, et + " T2 R2 antes", fallos));
    const CICLO = ["Quito", "Guayaquil", "Cuenca", "Loja"];
    const CIUDAD_DE = { "García Moreno": "Quito", "Guillermo Franco": "Guayaquil", "Jerónimo Carrión": "Cuenca", "Manuel Carrión Pinzano": "Loja" };
    for (let k = 0; k < 4; k++) {
      // La R2 pide SOLO DOS gobernantes: se para cuando el cartel desaparece.
      if (!(await p.$("text=¿Dónde mandaba?"))) break;
      const jefe = (await p.textContent('[data-qa="pedido"]')).trim();
      // Corrimiento cíclico: todas mal, para ver el revelado más cargado de texto.
      const ciudad = CICLO[(CICLO.indexOf(CIUDAD_DE[jefe]) + 1) % 4];
      const pt = await p.evaluate((c) => { const t = Array.from(document.querySelectorAll("text")).find((x) => x.textContent.trim() === c); const g = t && t.closest("g"); if (!g) return null; const r = g.getBoundingClientRect(); return { x: r.left + 8, y: r.top + r.height / 2 }; }, ciudad);
      if (pt) { await p.mouse.click(pt.x, pt.y); await p.waitForTimeout(140); }
      // ⚠ Ahora se verifica UNO A UNO: cada gobernante lleva su propio ¡VERIFICAR!
      await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(420);
    }
    console.log(await medir(p, et + " T2 R2 llena", fallos));
    await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(900);
    console.log(await medir(p, et + " T2 R2 revelado", fallos));
    await p.waitForTimeout(3500);

    await p.waitForSelector("text=la revolución derribó");
    console.log(await medir(p, et + " T2 R3 antes", fallos));
    for (let k = 0; k < 3; k++) {
      if (await p.$("text=Pulsa ¡VERIFICAR!")) break;
      const caja = await p.evaluate(() => { const f = Array.from(document.querySelectorAll("div")).filter((d) => d.style && d.style.touchAction === "none" && d.textContent.trim().indexOf("▸") === 0 && getComputedStyle(d).opacity !== "0")[0]; if (!f) return null; const r = f.getBoundingClientRect(); return { x: r.left + 12, y: r.top + r.height / 2, w: r.width }; });
      if (!caja) break;
      await p.mouse.move(caja.x, caja.y); await p.mouse.down();
      await p.mouse.move(caja.x + caja.w * 0.45, caja.y, { steps: 5 });
      if (k === 0) console.log(await medir(p, et + " T2 R3 EN PLENO RASGADO", fallos));
      await p.mouse.move(caja.x + caja.w * 0.95, caja.y, { steps: 7 });
      await p.mouse.up(); await p.waitForTimeout(280);
    }
    console.log(await medir(p, et + " T2 R3 rota", fallos));
    await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(900);
    console.log(await medir(p, et + " T2 R3 revelado", fallos));
    await p.close();
  }
  console.log("\n" + (fallos.length ? "X PROBLEMAS:\n" + fallos.join("\n") : "OK Lienzo entero, los dos temas, en reposo y en pleno gesto: nada superpuesto, nada fuera del lienzo y ningún texto recortado."));
  await br.close(); srv.close();
})();
