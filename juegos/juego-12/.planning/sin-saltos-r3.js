// Comprueba que al SOLTAR una tarjeta de la línea del tiempo **ninguna otra SALTA**.
// Las que cambian de puesto tienen que VIAJAR hasta él, no aparecer de golpe.
// ⚠ Medir justo después del pointerup no distingue un salto de un viaje (la animación
// arranca en el fotograma siguiente): lo que lo distingue es la posición INTERMEDIA, que
// debe quedar entre el sitio viejo y el nuevo.
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8892;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });
const CIUDADANOS = ["Don Ramón", "Don Tomás", "Capitán Vargas", "Padre Ignacio"];

// Posición en pantalla de cada hecho, identificado por su texto (no por su puesto).
const posiciones = (p) => p.evaluate(() => {
  const ts = Array.from(document.querySelectorAll("button")).filter((b) => b.style && b.style.minHeight === "70px");
  const o = {};
  ts.forEach((el) => { o[el.textContent.replace(/\s+/g, " ").trim().slice(3, 40)] = Math.round(el.getBoundingClientRect().top); });
  return o;
});

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

  // Se prueban varios arrastres: hacia arriba, hacia abajo y a un puesto lejano.
  const casos = [[3, 0], [0, 2], [1, 3]];
  for (const [desde, hasta] of casos) {
    const ts = await p.$$("button[style*='min-height: 70px']");
    const arrastrado = (await ts[desde].innerText()).replace(/\s+/g, " ").trim().slice(3, 40);
    const a = await ts[desde].boundingBox(), z = await ts[hasta].boundingBox();
    await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
    await p.mouse.down();
    await p.mouse.move(a.x + a.width / 2, (a.y + z.y) / 2, { steps: 6 });
    await p.mouse.move(z.x + z.width / 2, z.y + z.height / 2 - 8, { steps: 6 });
    await p.waitForTimeout(250);
    const antes = await posiciones(p);
    await p.mouse.up();
    // ⚠ Medir justo DESPUÉS de soltar no distingue un salto de un viaje: la animación
    // arranca en el fotograma siguiente. Lo que prueba que viaja es la posición
    // INTERMEDIA: a mitad de camino tiene que estar ENTRE el sitio viejo y el nuevo.
    await p.waitForTimeout(60);
    const anims = await p.evaluate(() => Array.from(document.querySelectorAll("button")).filter((b)=>b.style&&b.style.minHeight==="70px").map((el)=>el.textContent.replace(/s+/g," ").trim().slice(1,16)+":"+el.getAnimations().length));
    console.log("   animaciones vivas:", anims.join(" | "));
    const medio = await posiciones(p);
    await p.waitForTimeout(400);
    const final = await posiciones(p);
    const malas = [];
    Object.keys(antes).forEach((k) => {
      if (k === arrastrado || final[k] === undefined || medio[k] === undefined) return;
      const d = final[k] - antes[k];
      if (Math.abs(d) <= 1) { if (Math.abs(medio[k] - antes[k]) > 1) malas.push(k.slice(0,20) + " se movió sin motivo"); return; }
      const avance = (medio[k] - antes[k]) / d;        // 0 = no ha salido · 1 = ya llegó
      if (avance > 0.97) malas.push(k.slice(0,20) + " SALTA (llega de golpe)");
      else if (avance < 0.03) malas.push(k.slice(0,20) + " no se mueve");
    });
    console.log("arrastre " + desde + "→" + hasta + ": " + (malas.length ? "✗ " + malas.join(" · ") : "✓ las demás viajan suavemente a su sitio"));
    if (malas.length) fallos.push("saltos en " + desde + "→" + hasta);
    await p.waitForTimeout(200);
  }
  console.log("\n" + (fallos.length ? "✗ " + fallos.join(" | ") : "✓ Al soltar, ninguna tarjeta salta: todas viajan a su sitio."));
  await br.close(); srv.close();
})();
