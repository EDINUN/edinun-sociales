// sin-superposiciones.js — recorre el DOM REAL de las tres rondas y busca
// textos que se pisen entre sí. Nació de que yo comprobaba a ojo (o solo
// parejas concretas) y se me colaban solapes: "Mayapán" sobre "PENÍNSULA DE
// YUCATÁN", "Chichén Itzá" sobre "Uxmal"…
//   node .planning/sin-superposiciones.js
const http = require("http");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const PORT = 8813;
const T = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
  ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const CL = ["Copán", "Tikal", "Calakmul", "Palenque", "Toniná", "Bonampak"];

// Mira cada hoja con texto visible y compara todas las parejas que no sean
// pariente una de otra. Tolera 2 px de roce.
const BUSCAR = () => {
  const vis = [];
  document.querySelectorAll("body *").forEach((el) => {
    if (!el.textContent || !el.textContent.trim()) return;
    if ([...el.children].some((h) => h.textContent && h.textContent.trim())) return; // no es hoja
    if (el.closest(".ed-glyphs")) return;              // glifos decorativos del fondo
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || parseFloat(cs.opacity) < 0.2) return;
    if (cs.display === "inline") return;               // trozos de texto corrido
    // Texto que fluye dentro de un párrafo justificado (la crónica): el
    // navegador ya lo coloca sin pisarse, y el rectángulo de un trozo que
    // ocupa varias líneas abarca las de al lado. No tiene sentido medirlo.
    for (let a = el.parentElement; a; a = a.parentElement) {
      if (getComputedStyle(a).textAlign === "justify") return;
    }
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    vis.push({ el, r, t: el.textContent.trim().replace(/\s+/g, " ").slice(0, 28) });
  });
  const out = [];
  for (let i = 0; i < vis.length; i++) {
    for (let j = i + 1; j < vis.length; j++) {
      const a = vis[i], b = vis[j];
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
      const ix = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
      const iy = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
      if (ix > 2 && iy > 2) out.push({ a: a.t, b: b.t, ix: Math.round(ix), iy: Math.round(iy) });
    }
  }
  return out;
};

(async () => {
  const srv = http.createServer((q, r) => {
    const rel = decodeURIComponent(q.url.split("?")[0]).replace(/^\/+/, "") || "index.html";
    const f = path.join(ROOT, rel);
    if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
    r.writeHead(200, { "Content-Type": T[path.extname(f)] || "application/octet-stream" });
    r.end(fs.readFileSync(f));
  });
  await new Promise((ok) => srv.listen(PORT, "127.0.0.1", ok));
  const b = await chromium.launch();
  let total = 0;

  // 12 partidas: el sorteo cambia las ciudades, el número y la crónica, así que
  // con varias pasadas se cubren combinaciones distintas.
  for (let partida = 0; partida < 12; partida++) {
    const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
    await p.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle" });
    await p.fill(".ed-input", "Solapes");
    await p.getByRole("button", { name: /ENTRAR/ }).click();
    await p.getByRole("button", { name: /VAMOS/ }).click();

    // R1
    await p.waitForSelector("text=Arrastra cada ciudad");
    await p.waitForTimeout(350);
    const ciudades = await p.locator("button[data-chip]").allInnerTexts();
    let sol = await p.evaluate(BUSCAR);
    if (sol.length) { total += sol.length; console.log(`  FALLO R1 [${ciudades.join(", ")}]`); sol.forEach((s) => console.log(`         "${s.a}" × "${s.b}"  (${s.ix}×${s.iy}px)`)); }

    const zonas = p.locator('div[style*="flex: 1"]').filter({ hasText: /CLÁSICO|POSCLÁSICO/ });
    while (await p.locator("button[data-chip]").count() > 0) {
      const c = p.locator("button[data-chip]").first();
      const n = (await c.innerText()).trim();
      await c.click(); await p.waitForTimeout(130);
      await zonas.nth(CL.includes(n) ? 0 : 1).click(); await p.waitForTimeout(240);
    }
    sol = await p.evaluate(BUSCAR);
    if (sol.length) { total += sol.length; console.log(`  FALLO R1 (con las 4 puestas)`); sol.forEach((s) => console.log(`         "${s.a}" × "${s.b}"  (${s.ix}×${s.iy}px)`)); }
    await p.getByRole("button", { name: /VERIFICAR/ }).click(); await p.waitForTimeout(3700);

    // R2 — con el número escrito entero
    await p.waitForSelector("text=Escribe el número");
    const txt = await p.locator('div:has-text("Escribe el número")').last().innerText();
    const obj = parseInt(txt.match(/(\d+)/)[1], 10);
    for (const [niv, d] of [["veintes", Math.floor(obj / 20)], ["unidades", obj % 20]]) {
      await p.locator(`[data-nivel="${niv}"]`).click(); await p.waitForTimeout(60);
      if (d === 0) { await p.getByRole("button", { name: /CARACOL/ }).click(); continue; }
      for (let i = 0; i < Math.floor(d / 5); i++) { await p.getByRole("button", { name: /BARRA/ }).click(); await p.waitForTimeout(35); }
      for (let i = 0; i < d % 5; i++) { await p.getByRole("button", { name: /PUNTO/ }).click(); await p.waitForTimeout(35); }
    }
    await p.waitForTimeout(250);
    sol = await p.evaluate(BUSCAR);
    if (sol.length) { total += sol.length; console.log(`  FALLO R2 (número ${obj})`); sol.forEach((s) => console.log(`         "${s.a}" × "${s.b}"  (${s.ix}×${s.iy}px)`)); }
    await p.getByRole("button", { name: /VERIFICAR/ }).click(); await p.waitForTimeout(1500);
    sol = await p.evaluate(BUSCAR);
    if (sol.length) { total += sol.length; console.log(`  FALLO R2 revelada (número ${obj})`); sol.forEach((s) => console.log(`         "${s.a}" × "${s.b}"  (${s.ix}×${s.iy}px)`)); }
    await p.waitForTimeout(2400);

    // R3
    await p.waitForSelector("text=Revisa las cuatro palabras");
    await p.waitForTimeout(300);
    const fuente = await p.locator("[data-fuente]").getAttribute("data-fuente");
    sol = await p.evaluate(BUSCAR);
    if (sol.length) { total += sol.length; console.log(`  FALLO R3 (${fuente})`); sol.forEach((s) => console.log(`         "${s.a}" × "${s.b}"  (${s.ix}×${s.iy}px)`)); }
    await p.close();
  }

  await b.close(); srv.close();
  console.log(total === 0
    ? "\n✓ 12 partidas revisadas: ningún texto se superpone en ninguna ronda.\n"
    : `\n✗ ${total} superposición(es).\n`);
  process.exit(total === 0 ? 0 : 1);
})();
