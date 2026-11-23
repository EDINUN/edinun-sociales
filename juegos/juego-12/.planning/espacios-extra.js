// Estados que el barrido de `espacios-todo.js` NO toca y que son los peores casos:
//   · Tema 3 · R2 con las SEIS fichas destapadas a la vez (todo el texto en pantalla).
//   · Tema 3 · R3 con las cinco frases selladas.
//   · Libro 7 · Tema 1 entero, que no estaba cubierto por ningún detector.
// Mismo medidor que espacios-todo.js (mira el lienzo 900x540 completo).
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8918;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });
const VIEWPORTS = [[900, 560], [1280, 800], [1920, 1080]];

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
      const enLinea = getComputedStyle(e).display.indexOf("inline") >= 0;
      return { t: (e.textContent || "").replace(/\s+/g, " ").trim().slice(0, 24) || "<" + e.tagName.toLowerCase() + ">", x, y, r: rr, b: bo, padre: e.parentElement, enLinea, vis: rr - x > 2 && bo - y > 2, cut: e.scrollWidth > e.clientWidth + 1 };
    }).filter((c) => c.vis);
    const fuera = cajas.filter((c) => c.x < sr.left - 1 || c.r > sr.right + 1 || c.y < sr.top - 1 || c.b > sr.bottom + 1);
    const cortados = cajas.filter((c) => c.cut);
    const solapes = [];
    for (let i = 0; i < cajas.length; i++) for (let j = i + 1; j < cajas.length; j++) {
      const a = cajas[i], b = cajas[j];
      const ox = Math.min(a.r, b.r) - Math.max(a.x, b.x), oy = Math.min(a.b, b.b) - Math.max(a.y, b.y);
      if (a.enLinea && b.enLinea && a.padre === b.padre) continue;
      if (ox > 2 && oy > 2) solapes.push(a.t + " <-> " + b.t + " (" + Math.round(ox) + "x" + Math.round(oy) + ")");
    }
    return { n: cajas.length, fuera: fuera.map((c) => c.t), cortados: cortados.map((c) => c.t), solapes: solapes.slice(0, 5) };
  });
  if (r.err) { fallos.push(etiqueta + " -> " + r.err); return etiqueta + ": " + r.err; }
  const mal = r.fuera.length || r.cortados.length || r.solapes.length;
  if (mal) fallos.push(etiqueta + " -> fuera:[" + r.fuera + "] cortados:[" + r.cortados + "] solapes:[" + r.solapes + "]");
  return etiqueta + ": " + r.n + " elementos  " + (mal ? "✗" : "OK");
}

async function entrar(p, PORT, libro, tema) {
  await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
  await p.click("button:has-text('" + libro + "')");
  // ⚠ Un libro con UN SOLO tema no dibuja botones de tema: el menú lo elige solo. Con
  //   `p.click` a secas, la prueba se quedaba 30 s esperando un botón que no existe.
  const bt = await p.$("button:has-text('" + tema + "')");
  if (bt) await bt.click();
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
    p.on("pageerror", (e) => fallos.push("pageerror: " + e.message));

    // ── Tema 3: el peor caso de texto ──
    await entrar(p, PORT, "Libro 6", "El preámbulo del siglo XX");
    await p.waitForSelector("text=no tenían voz");
    const cajas = await p.evaluate(() => Array.from(document.querySelectorAll("img")).filter((i) => (i.getAttribute("src") || "").indexOf("j6t3-") >= 0).map((i) => { const r = i.parentElement.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; }));
    for (const c of cajas) {
      await p.mouse.move(c.x + 4, c.y + 4); await p.mouse.down();
      for (let f = 0; f < 8; f++) { const y = c.y + 3 + (c.h - 6) * (f / 7); await p.mouse.move(c.x + 3, y, { steps: 3 }); await p.mouse.move(c.x + c.w - 3, y, { steps: 9 }); }
      await p.mouse.up();
    }
    const CONVOZ = ["hacendado", "sacerdote", "banquero"];
    const ids = await p.evaluate(() => Array.from(document.querySelectorAll("img")).filter((i) => (i.getAttribute("src") || "").indexOf("j6t3-") >= 0).map((i) => { const r = i.parentElement.getBoundingClientRect(); return { id: (i.getAttribute("src") || "").split("j6t3-")[1].replace(".jpg", ""), x: r.left + r.width / 2, y: r.top + r.height / 2 }; }));
    for (const f of ids.filter((x) => CONVOZ.indexOf(x.id) === -1)) { await p.mouse.click(f.x, f.y); await p.waitForTimeout(150); }
    await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(4300);
    await p.waitForSelector("text=Montalvo, Moncayo y Peralta");
    const fichas = await p.$$("button.ed-btn-plain");
    for (const f of fichas) { await f.click(); await p.waitForTimeout(170); }
    console.log(await medir(p, et + " T3 R2 LAS SEIS DESTAPADAS", fallos));
    // ⚠ ¡VERIFICAR! solo se enciende con TRES destapadas, así que se vuelven a tapar las
    //   tres que no son de los pensadores. (Lo medido arriba es el estado con las seis.)
    const PENS2 = ["periodismo contra los gobiernos", "El Cosmopolita", "concertaje", "Estado laico", "Carta Constitucional de 1896", "posturas liberales"];
    for (const f of fichas) {
      const t = (await f.textContent()) || "";
      if (!PENS2.some((c) => t.indexOf(c) >= 0)) { await f.click(); await p.waitForTimeout(150); }
    }
    await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(900);
    console.log(await medir(p, et + " T3 R2 revelado con las seis", fallos));
    await p.waitForTimeout(3600);
    await p.waitForSelector("text=fuera del pueblo");
    const todas = await p.$$('[data-qa="frase"]');
    for (const f of todas) { await f.click(); await p.waitForTimeout(140); }
    console.log(await medir(p, et + " T3 R3 LAS CINCO SELLADAS", fallos));
    // ⚠ Igual que arriba: para poder verificar hay que dejar TRES selladas, así que se
    //   quitan los sellos de las dos del pueblo.
    const PUEBLO2 = ["sudor de tu frente", "forjas los metales", "arrancas a la tierra"];
    for (const f of todas) {
      const t = (await f.textContent()) || "";
      if (PUEBLO2.some((c) => t.indexOf(c) >= 0)) { await f.click(); await p.waitForTimeout(140); }
    }
    await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(900);
    console.log(await medir(p, et + " T3 R3 revelado con las cinco", fallos));

    // ── Libro 7 · Tema 1 (de la otra sesión): solo se MIDE, no se toca ──
    await entrar(p, PORT, "Libro 7", "La Revolución Liberal");
    await p.waitForTimeout(1200);
    console.log(await medir(p, et + " L7T1 R1 antes", fallos));
    for (let k = 0; k < 6; k++) {
      const btns = await p.$$("button.ed-btn-plain");
      if (!btns.length) break;
      await btns[Math.min(k, btns.length - 1)].click();
      await p.waitForTimeout(260);
      if (k === 1) console.log(await medir(p, et + " L7T1 R1 con dos puestas", fallos));
    }
    console.log(await medir(p, et + " L7T1 R1 jugada", fallos));
    await p.close();
  }
  console.log("\n" + (fallos.length ? "X PROBLEMAS:\n" + fallos.join("\n") : "OK Nada superpuesto en los peores casos del Tema 3 ni en el Libro 7."));
  await br.close(); srv.close();
})();
