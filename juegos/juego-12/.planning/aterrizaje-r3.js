// Comprueba que la tarjeta soltada ATERRIZA en vez de saltar: justo después del
// pointerup debe estar DESPLAZADA hacia donde la soltó el dedo, e ir acercándose a su
// hueco en ~140 ms. Si saltara, el desplazamiento sería 0 desde el primer fotograma.
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8890;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });
const CIUDADANOS = ["Don Ramón", "Don Tomás", "Capitán Vargas", "Padre Ignacio"];

// Desplazamiento vertical que lleva aplicado la tarjeta de un puesto (en px de pantalla).
const desplazamiento = (p, idx) => p.evaluate((i) => {
  const ts = Array.from(document.querySelectorAll("button")).filter((b) => b.style && b.style.minHeight === "70px");
  const el = ts[i]; if (!el) return null;
  const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
  return Math.round(m.m42);
}, idx);

(async () => {
  srv.listen(PORT);
  const br = await chromium.launch();
  const p = await (await br.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  const fallos = [];
  p.on("pageerror", (e) => fallos.push("pageerror: " + e.message));
  await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
  await p.waitForSelector("button:has-text('Libro 6')");
  await p.click("button:has-text('Libro 6')");
  await p.fill("input.ed-input", "QA");
  await p.click("button:has-text('ENTRAR')");
  await p.waitForTimeout(500);
  const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(700); }
  for (const t of await p.$$("div[style*='width: 221px']")) {
    const s = (await t.innerText()).replace(/\s+/g, " ");
    await (await t.$(CIUDADANOS.some((n) => s.indexOf(n) >= 0) ? "button:has-text('SÍ')" : "button:has-text('NO')")).click();
  }
  await p.click("button:has-text('¡VERIFICAR!')");
  await p.waitForTimeout(4300);
  await p.waitForSelector("text=Arma la pirámide social");
  for (let k = 0; k < 4; k++) {
    const fichas = await p.$$("div[style*='min-height: 44px'] > button");
    if (!fichas.length) break;
    await fichas[0].click();
    const libre = await p.$("button:has-text('escalón libre')");
    if (!libre) break;
    await libre.click(); await p.waitForTimeout(100);
  }
  await p.click("button:has-text('¡VERIFICAR!')");
  await p.waitForTimeout(4300);
  await p.waitForSelector("text=Ordena los hechos");

  // Se lleva la última tarjeta al primer puesto y se suelta DESVIADA del centro a propósito.
  const ts = await p.$$("button[style*='min-height: 70px']");
  const a = await ts[ts.length - 1].boundingBox(), z = await ts[0].boundingBox();
  await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await p.mouse.down();
  await p.mouse.move(a.x + a.width / 2, (a.y + z.y) / 2, { steps: 8 });
  await p.mouse.move(z.x + z.width / 2, z.y + 14, { steps: 8 });   // 14 px por debajo del borde
  await p.mouse.up();

  const d0 = await desplazamiento(p, 0);
  await p.waitForTimeout(70);
  const d1 = await desplazamiento(p, 0);
  await p.waitForTimeout(220);
  const d2 = await desplazamiento(p, 0);
  console.log("desplazamiento de la tarjeta soltada: al soltar " + d0 + " px · a los 70 ms " + d1 + " px · a los 290 ms " + d2 + " px");
  const aterriza = Math.abs(d0) > 2 && Math.abs(d2) <= 1 && Math.abs(d1) < Math.abs(d0);
  console.log(aterriza ? "✓ aterriza: sale desplazada y llega a su hueco suavemente" : "✗ NO aterriza (salta de golpe o se queda desplazada)");
  if (!aterriza) fallos.push("la tarjeta no aterriza");
  console.log(fallos.length ? "\n✗ " + fallos.join(" | ") : "");
  await br.close(); srv.close();
})();
