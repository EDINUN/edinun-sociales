// sin-superposiciones.js — recorre el DOM REAL de las tres rondas de juego-15 y
// busca textos que se pisen entre sí (incluidos los rótulos <text> del mapa SVG,
// que es donde más fácil se solapan: Chile/Argentina, Uruguay/Paraguay…).
// Adaptado de juegos/juego-14/.planning/sin-superposiciones.js.
//   node .planning/sin-superposiciones.js
const http = require("http");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const PORT = 8817;
const T = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
  ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };

// Cada hoja con texto visible vs todas las demás. Tolera 2 px de roce.
const BUSCAR = () => {
  const vis = [];
  document.querySelectorAll("body *").forEach((el) => {
    if (!el.textContent || !el.textContent.trim()) return;
    if ([...el.children].some((h) => h.textContent && h.textContent.trim())) return; // no es hoja
    if (el.closest(".ed-glyphs")) return;              // glifos decorativos del fondo
    // Dos solapes que SON el diseño, no un defecto (declarados a propósito para
    // que el verde de este check signifique algo):
    //   1. el overlay ¡EXCELENTE!/¡UPS! es una capa a pantalla completa;
    //   2. el badge ✓/✗ va clavado a la esquina de la ficha (lenguaje del shell).
    if (el.closest("[data-ed-overlay], div[style*='position: fixed']")) return;
    const txt0 = el.textContent.trim();
    if ((txt0 === "✓" || txt0 === "✗") && el.closest("button")) return;
    const esSVG = !!el.ownerSVGElement;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || parseFloat(cs.opacity) < 0.2) return;
    if (!esSVG && cs.display === "inline") return;     // trozos de texto corrido
    for (let a = el.parentElement; a; a = a.parentElement) {
      if (getComputedStyle(a).textAlign === "justify") return;
    }
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    vis.push({ el, r, t: el.textContent.trim().replace(/\s+/g, " ").slice(0, 30) });
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
  const br = await chromium.launch();
  let total = 0;
  const mirar = (sol, donde) => {
    if (!sol.length) return;
    total += sol.length;
    console.log(`  FALLO ${donde}`);
    sol.forEach((s) => console.log(`         "${s.a}" × "${s.b}"  (${s.ix}×${s.iy}px)`));
  };

  // 8 partidas: el sorteo cambia el hecho del mapa, el parte y el grupo de años.
  for (let partida = 0; partida < 8; partida++) {
    const p = await br.newPage({ viewport: { width: 1280, height: 800 } });
    await p.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle" });
    await p.fill(".ed-input", "Solapes");
    await p.getByRole("button", { name: /ENTRAR/ }).click();
    const vamos = await p.$("button:has-text('VAMOS')");
    if (vamos) await vamos.click();

    // ── R1 (mapa rotulado): sin tocar, con un país elegido y revelada
    await p.waitForSelector("text=Ubica en el mapa");
    await p.waitForTimeout(400);
    mirar(await p.evaluate(BUSCAR), `R1 (${partida}) inicial`);
    await p.locator("svg path[d]").nth(partida % 10 + 3).click();
    await p.waitForTimeout(200);
    mirar(await p.evaluate(BUSCAR), `R1 (${partida}) con selección`);
    await p.getByRole("button", { name: /VERIFICAR/ }).click();
    await p.waitForTimeout(900);
    mirar(await p.evaluate(BUSCAR), `R1 (${partida}) revelada`);
    await p.waitForTimeout(3200);

    // ── R2 (parte + pistas): con las 3 pistas abiertas y revelada
    await p.waitForSelector("text=Descubre quién dijo");
    await p.waitForTimeout(300);
    mirar(await p.evaluate(BUSCAR), `R2 (${partida}) inicial`);
    for (const n of [1, 2, 3]) { await p.getByRole("button", { name: `PISTA ${n}` }).click(); await p.waitForTimeout(120); }
    mirar(await p.evaluate(BUSCAR), `R2 (${partida}) con las 3 pistas abiertas`);
    await p.locator("div[style*='margin-top: 32px'] > button").nth(partida % 4).click();
    await p.waitForTimeout(150);
    await p.getByRole("button", { name: /VERIFICAR/ }).click();
    await p.waitForTimeout(900);
    mirar(await p.evaluate(BUSCAR), `R2 (${partida}) revelada`);
    await p.waitForTimeout(3200);

    // ── R3 (cinta): vacía, llena y revelada (con el panel de solución)
    await p.waitForSelector("text=Descubre el año y abre el candado");
    await p.waitForTimeout(300);
    mirar(await p.evaluate(BUSCAR), `R3 (${partida}) inicial`);
    const arriba = p.locator("button:text-is('▲')");
    const nR = await arriba.count();
    for (let k = 0; k < 3 + partida; k++) { await arriba.nth(nR - 1 - (k % 2)).click(); await p.waitForTimeout(40); }
    mirar(await p.evaluate(BUSCAR), `R3 (${partida}) con las ruedas giradas`);
    await p.getByRole("button", { name: /VERIFICAR/ }).click();
    await p.waitForTimeout(900);
    mirar(await p.evaluate(BUSCAR), `R3 (${partida}) revelada`);
    await p.close();
  }

  await br.close(); srv.close();
  console.log(total === 0
    ? "\n✓ 8 partidas revisadas: ningún texto se superpone en ninguna ronda.\n"
    : `\n✗ ${total} superposición(es).\n`);
  process.exit(total === 0 ? 0 : 1);
})();
