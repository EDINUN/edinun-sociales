// Capturas del Libro 6 · Tema 3 para mirar a ojo. Uso: node shot-l6t3.js <carpeta>
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8915;
const OUT = process.argv[2];
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });
(async () => {
  if (!OUT) { console.error("Uso: node shot-l6t3.js <carpeta>"); process.exit(1); }
  fs.mkdirSync(OUT, { recursive: true });
  srv.listen(PORT);
  const br = await chromium.launch();
  const p = await (await br.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  const tiro = (n) => p.screenshot({ path: path.join(OUT, "j12-t3-" + n + ".png") });
  await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
  await p.click("button:has-text('Libro 6')");
  await p.click("button:has-text('El preámbulo del siglo XX')");
  await p.fill("input.ed-input", "QA");
  await p.click("button:has-text('ENTRAR')");
  await p.waitForTimeout(600);
  const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(700); }

  await p.waitForSelector("text=no tenían voz");
  await tiro("r1");
  const cajas = await p.evaluate(() => Array.from(document.querySelectorAll("img")).filter((i) => /j6t3-/.test(i.getAttribute("src") || "")).map((i) => { const r = i.parentElement.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; }));
  for (let c = 0; c < cajas.length; c++) {
    const caja = cajas[c];
    await p.mouse.move(caja.x + 4, caja.y + 4); await p.mouse.down();
    for (let f = 0; f < 8; f++) {
      const y = caja.y + 3 + (caja.h - 6) * (f / 7);
      await p.mouse.move(caja.x + 3, y, { steps: 3 });
      await p.mouse.move(caja.x + caja.w - 3, y, { steps: 10 });
      if (c === 1 && f === 3) await tiro("r1-frotando");
    }
    await p.mouse.up();
  }
  await tiro("r1-limpia");
  const CONVOZ = ["hacendado", "sacerdote", "banquero"];
  const elegir = await p.evaluate(() => Array.from(document.querySelectorAll("img")).filter((i) => (i.getAttribute("src") || "").indexOf("j6t3-") >= 0).map((i) => { const r = i.parentElement.getBoundingClientRect(); return { id: (i.getAttribute("src") || "").split("j6t3-")[1].replace(".jpg", ""), x: r.left + r.width / 2, y: r.top + r.height / 2 }; }));
  for (const f of elegir.filter((x) => CONVOZ.indexOf(x.id) === -1)) { await p.mouse.click(f.x, f.y); await p.waitForTimeout(170); }
  await tiro("r1-elegidas");
  await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(900);
  await tiro("r1-verificada");
  await p.waitForTimeout(3500);

  await p.waitForSelector("text=Montalvo, Moncayo y Peralta");
  await tiro("r2");
  const fichas = await p.$$("button.ed-btn-plain");
  for (let i = 0; i < fichas.length; i++) {
    await fichas[i].click(); await p.waitForTimeout(240);
    const t = (await fichas[i].textContent()) || "";
    const buena = /periodismo contra los gobiernos|El Cosmopolita|concertaje|Estado laico|Carta Constitucional de 1896|posturas liberales/.test(t);
    if (i === 0) await tiro("r2-girada");
    if (!buena) { await fichas[i].click(); await p.waitForTimeout(180); }
  }
  await tiro("r2-elegidas");
  await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(900);
  await tiro("r2-verificada");
  await p.waitForTimeout(3600);

  await p.waitForSelector("text=fuera del pueblo");
  await tiro("r3");
  for (const clave of ["El tirano", "El opulento", "El soberbio", "El que oprime"]) {
    const caja = await p.evaluate((clave) => { const d = Array.from(document.querySelectorAll('[data-qa="frase"]')).find((x) => x.textContent.indexOf(clave) >= 0); if (!d) return null; const r = d.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, clave);
    if (caja) { await p.mouse.click(caja.x, caja.y); await p.waitForTimeout(200); }
  }
  await tiro("r3-sellada");
  await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(900);
  await tiro("r3-verificada");
  console.log("capturas en " + OUT);
  await br.close(); srv.close();
})();
