// shots.js — captura una pantalla de cada ronda para revisar el encaje visual.
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const ROOT = path.resolve(__dirname, ".."), PORT = 8797;
const T = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
  ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const CL = ["Copán", "Tikal", "Calakmul", "Palenque", "Toniná", "Bonampak"];
const OUT = path.join(__dirname, "qa-screenshots");

const s = http.createServer((q, r) => {
  const rel = decodeURIComponent(q.url.split("?")[0]).replace(/^\/+/, "") || "index.html";
  const f = path.join(ROOT, rel);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { "Content-Type": T[path.extname(f)] || "application/octet-stream" });
  r.end(fs.readFileSync(f));
});

s.listen(PORT, "127.0.0.1", async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const faltan = [];
  p.on("response", (r) => { if (r.status() === 404) faltan.push(r.url().split("/").pop()); });

  await p.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle" });
  await p.fill(".ed-input", "Revisión");
  await p.getByRole("button", { name: /ENTRAR/ }).click();
  await p.getByRole("button", { name: /VAMOS/ }).click();

  // R1 — mapa con el dial a la mitad y 2 ciudades ya ubicadas
  await p.waitForSelector("text=Arrastra cada ciudad");
  const zonas = p.locator('div[style*="flex: 1"]').filter({ hasText: /CLÁSICO|POSCLÁSICO/ });
  const bandeja = p.locator("button[data-chip]");

  async function ubicar(n) {                       // ubica n ciudades, con reintento
    for (let k = 0; k < n; k++) {
      const antes = await bandeja.count();
      const c = bandeja.first();
      const nom = (await c.innerText()).trim();
      const z = zonas.nth(CL.includes(nom) ? 0 : 1);
      for (let intento = 0; intento < 3; intento++) {
        await c.click(); await p.waitForTimeout(150);
        await z.click({ position: { x: 20, y: 8 } }); await p.waitForTimeout(280);
        if (await bandeja.count() < antes) break;
      }
      if (await bandeja.count() >= antes) throw new Error("no se pudo ubicar " + nom);
    }
  }

  await ubicar(2);
  await p.waitForTimeout(400);
  await p.screenshot({ path: path.join(OUT, "r1-dial.png") });
  await ubicar(2);
  await p.getByRole("button", { name: /VERIFICAR/ }).click();
  await p.waitForTimeout(3600);

  // R2 — estela con el número a medio escribir
  await p.waitForSelector("text=Escribe el número");
  const txt = await p.locator('div:has-text("Escribe el número")').last().innerText();
  const obj = parseInt(txt.match(/(\d+)/)[1], 10);
  const v = Math.floor(obj / 20), u = obj % 20;
  for (const [niv, d] of [["veintes", v], ["unidades", u]]) {
    await p.locator(`[data-nivel="${niv}"]`).click(); await p.waitForTimeout(80);
    if (d === 0) { await p.getByRole("button", { name: /CARACOL/ }).click(); continue; }
    for (let i = 0; i < Math.floor(d / 5); i++) { await p.getByRole("button", { name: /BARRA/ }).click(); await p.waitForTimeout(50); }
    for (let i = 0; i < d % 5; i++) { await p.getByRole("button", { name: /PUNTO/ }).click(); await p.waitForTimeout(50); }
  }
  await p.waitForTimeout(400);
  await p.screenshot({ path: path.join(OUT, "r2-estela.png") });
  console.log("R2 número =", obj, "→", v, "veintes y", u, "unidades");

  await p.getByRole("button", { name: /VERIFICAR/ }).click();
  await p.waitForTimeout(3600);

  // R3 — códice con el selector abierto
  await p.waitForSelector("text=Revisa las cuatro palabras");
  await p.locator('[data-hueco="1"]').click();
  await p.waitForTimeout(350);
  await p.screenshot({ path: path.join(OUT, "r3-codice.png") });
  console.log("R3 fuente:", await p.locator("[data-fuente]").getAttribute("data-fuente"));

  console.log("404:", faltan.length ? [...new Set(faltan)].join(", ") : "ninguno");
  console.log("Capturas en", OUT);
  await b.close(); s.close();
});
