// ¿Cuánto cambia el Libro 6 · Tema 3 al recargar? Mide, en 8 partidas nuevas y seguidas
// (mismo navegador, porque el anti-repetición vive en localStorage):
//   R1 — qué CUATRO personas salen de las ocho del banco.
//   R2 — qué SEIS fichas salen (hay dos hechos por persona y se saca uno de cada una).
//   R3 — qué CINCO frases salen de las siete (3 de las que quedan fuera + 2 del pueblo).
// Lo que se informa es el número de combinaciones DISTINTAS vistas, sin adornos.
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8917;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });
const N = 8;
const PENSADORES = ["periodismo contra los gobiernos", "El Cosmopolita", "concertaje", "Estado laico", "Carta Constitucional de 1896", "posturas liberales"];

(async () => {
  srv.listen(PORT);
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await ctx.newPage();
  const vistos = { gente: {}, fichas: {}, frases: {} };
  const repetidasSeguidas = { gente: 0, fichas: 0, frases: 0 };
  let anterior = { gente: "", fichas: "", frases: "" };

  for (let i = 0; i < N; i++) {
    await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
    await p.click("button:has-text('Libro 6')");
    await p.click("button:has-text('El preámbulo del siglo XX')");
    await p.fill("input.ed-input", "QA");
    await p.click("button:has-text('ENTRAR')");
    await p.waitForTimeout(450);
    const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(650); }

    // R1 · qué cuatro personas salen (por el nombre del archivo de su ilustración)
    await p.waitForSelector("text=no tenían voz");
    const gente = (await p.evaluate(() => Array.from(document.querySelectorAll("img"))
      .map((im) => im.getAttribute("src") || "")
      .filter((s) => s.indexOf("j6t3-") >= 0)
      .map((s) => s.split("j6t3-")[1].replace(".jpg", "")).sort())).join(",");
    vistos.gente[gente] = 1;
    if (gente === anterior.gente) repetidasSeguidas.gente++;
    anterior.gente = gente;
    // Se destapan para poder pasar de ronda.
    const cajas = await p.evaluate(() => Array.from(document.querySelectorAll("img")).filter((im) => (im.getAttribute("src") || "").indexOf("j6t3-") >= 0).map((im) => { const r = im.parentElement.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; }));
    for (const c of cajas) {
      await p.mouse.move(c.x + 4, c.y + 4); await p.mouse.down();
      for (let f = 0; f < 8; f++) {
        const y = c.y + 3 + (c.h - 6) * (f / 7);
        await p.mouse.move(c.x + 3, y, { steps: 3 });
        await p.mouse.move(c.x + c.w - 3, y, { steps: 9 });
      }
      await p.mouse.up();
    }
    const CONVOZ = ["hacendado", "sacerdote", "banquero"];
    const puntos = await p.evaluate(() => Array.from(document.querySelectorAll("img")).filter((i) => (i.getAttribute("src") || "").indexOf("j6t3-") >= 0).map((i) => { const r = i.parentElement.getBoundingClientRect(); return { id: (i.getAttribute("src") || "").split("j6t3-")[1].replace(".jpg", ""), x: r.left + r.width / 2, y: r.top + r.height / 2 }; }));
    for (const f of puntos.filter((x) => CONVOZ.indexOf(x.id) === -1)) { await p.mouse.click(f.x, f.y); await p.waitForTimeout(150); }
    await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(4300);

    // R2 · qué seis fichas salen
    await p.waitForSelector("text=Montalvo, Moncayo y Peralta");
    const fichas = await p.$$("button.ed-btn-plain");
    const textos = [];
    for (let k = 0; k < fichas.length; k++) {
      await fichas[k].click(); await p.waitForTimeout(190);
      const t = ((await fichas[k].textContent()) || "").replace(/\s+/g, " ").trim();
      textos.push(t.slice(0, 32));
      if (!PENSADORES.some((c) => t.indexOf(c) >= 0)) { await fichas[k].click(); await p.waitForTimeout(150); }
    }
    const firmaF = textos.slice().sort().join("|");
    vistos.fichas[firmaF] = 1;
    if (firmaF === anterior.fichas) repetidasSeguidas.fichas++;
    anterior.fichas = firmaF;
    await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(4300);

    // R3 · qué cinco frases salen
    await p.waitForSelector("text=fuera del pueblo");
    const frases = (await p.evaluate(() => Array.from(document.querySelectorAll('[data-qa="frase"]')).map((d) => d.textContent.replace(/\s+/g, " ").trim().slice(2, 34)).sort())).join("|");
    vistos.frases[frases] = 1;
    if (frases === anterior.frases) repetidasSeguidas.frases++;
    anterior.frases = frases;
    // ⚠ No hace falta terminar la ronda: lo que se mide son las frases que SALIERON, y
    //   la partida siguiente recarga la página. Además ¡VERIFICAR! está apagado hasta
    //   sellar tres, así que pulsarlo aquí dejaba la prueba esperando.
  }

  const n = (o) => Object.keys(o).length;
  console.log(`En ${N} partidas seguidas:`);
  console.log(`  R1 · qué cuatro personas (2+2) . ${n(vistos.gente)}/${N} distintas (de 108 posibles)`);
  console.log(`  R2 · qué seis fichas .......... ${n(vistos.fichas)}/${N} distintas (de 64 posibles)`);
  console.log(`  R3 · qué cinco frases ......... ${n(vistos.frases)}/${N} distintas (de 12 posibles)`);
  console.log(`  Veces que una partida repitió EXACTAMENTE la anterior: R1 ${repetidasSeguidas.gente} · R2 ${repetidasSeguidas.fichas} · R3 ${repetidasSeguidas.frases}`);
  const mal = [];
  if (repetidasSeguidas.gente || repetidasSeguidas.fichas || repetidasSeguidas.frases) mal.push("alguna ronda repitió el ejercicio de la partida anterior");
  if (n(vistos.gente) < 6) mal.push("la R1 varía poco");
  if (n(vistos.fichas) < 6) mal.push("la R2 varía poco");
  if (n(vistos.frases) < 5) mal.push("la R3 varía poco");
  console.log("\n" + (mal.length ? "X " + mal.join(" · ") : "OK Las tres rondas cambian de partida en partida y ninguna repite la anterior."));
  await br.close(); srv.close();
})();
