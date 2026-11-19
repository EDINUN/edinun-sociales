// La R3 del Tema 2 no puede dejar al niño sin salida: si rompe por error un renglón que
// una consigna POSTERIOR iba a pedir, ese renglón SE VUELVE A PEGAR solo, y la orden
// siguiente conserva su solución. Esta prueba rompe SIEMPRE el renglón equivocado y
// comprueba que:
//   · se juegan LAS TRES órdenes (antes la ronda se acababa en dos: lo vio la autora),
//   · nunca se pide un renglón que ya no está,
//   · se puede verificar (no se queda colgada),
//   · el revelado marca en ámbar lo que había que romper.
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8901;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });

const RENGLON_DE = {
  "Rompe al hombre contra el que se levantó Guayaquil.": "Flores",
  "Rompe el impuesto que hizo estallar el 6 de marzo.": "tres pesos",
  "La Iglesia vuelve al país: rompe lo que la tenía fuera.": "Iglesia",
};
const filas = (p) => p.evaluate(() => Array.from(document.querySelectorAll("div"))
  .filter((d) => d.style && d.style.touchAction === "none" && d.textContent.trim().indexOf("▸") === 0 && getComputedStyle(d).opacity !== "0")
  .map((d) => { const r = d.getBoundingClientRect(); return { t: d.textContent.trim(), x: r.left + 12, y: r.top + r.height / 2, w: r.width }; }));

(async () => {
  srv.listen(PORT);
  const br = await chromium.launch();
  const p = await (await br.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  const fallos = [];
  p.on("pageerror", (e) => fallos.push("pageerror: " + e.message));
  await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
  await p.click("button:has-text('Libro 6')");
  await p.click("button:has-text('La Revolución Marcista')");
  await p.fill("input.ed-input", "QA");
  await p.click("button:has-text('ENTRAR')");
  await p.waitForTimeout(500);
  const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(700); }
  // Saltar la R1 y la R2 cuanto antes, dejándolas incompletas no se puede: hay que
  // completarlas para que aparezca ¡VERIFICAR! con efecto.
  await p.waitForSelector("text=Arma la bandera");
  for (const c of ["rojo", "verde", "amarillo"]) { const b = await p.$(`button:has-text('${c}')`); await b.click(); await p.waitForTimeout(80); }
  await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(4300);
  const CICLO = ["Quito", "Guayaquil", "Cuenca", "Loja"];
  const CIUDAD_DE = { "García Moreno": "Quito", "Guillermo Franco": "Guayaquil", "Jerónimo Carrión": "Cuenca", "Manuel Carrión Pinzano": "Loja" };
  for (let k = 0; k < 4; k++) {
    // La R2 ahora pide SOLO DOS gobernantes: se para cuando el cartel desaparece.
    if (!(await p.$("text=¿Dónde mandaba?"))) break;
    const jefe = (await p.textContent('[data-qa="pedido"]')).trim();
    const ciudad = CICLO[(CICLO.indexOf(CIUDAD_DE[jefe]) + 1) % 4];
    const pt = await p.evaluate((c) => { const t = Array.from(document.querySelectorAll("text")).find((x) => x.textContent.trim() === c); const g = t && t.closest("g"); if (!g) return null; const r = g.getBoundingClientRect(); return { x: r.left + 8, y: r.top + r.height / 2 }; }, ciudad);
    if (pt) { await p.mouse.click(pt.x, pt.y); await p.waitForTimeout(150); }
    await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(420);
  }
  await p.click("button:has-text('¡VERIFICAR!')"); await p.waitForTimeout(4300);
  await p.waitForSelector("text=la revolución derribó");

  let turnos = 0;
  for (let k = 0; k < 6; k++) {
    const acabo = await p.$("text=Pulsa ¡VERIFICAR!");
    if (acabo) break;
    const pide = (await p.textContent('[data-qa="consigna"]')).trim();
    const clave = RENGLON_DE[pide];
    if (!clave) { fallos.push("consigna desconocida: " + pide); break; }
    const fs2 = await p.filas ? null : await filas(p);
    const vivas = fs2;
    if (!vivas.some((f) => f.t.indexOf(clave) >= 0)) {
      fallos.push("se pidió un renglón que YA NO ESTÁ: " + pide);
      break;
    }
    // Romper siempre el EQUIVOCADO
    const mala = vivas.find((f) => f.t.indexOf(clave) === -1);
    if (!mala) break;
    await p.mouse.move(mala.x, mala.y); await p.mouse.down();
    await p.mouse.move(mala.x + mala.w * 0.95, mala.y, { steps: 9 });
    // ⚠ 1,5 s: el renglón roto por error tarda 1,3 s en volver a pegarse. Mirar antes
    //   haría creer que ese renglón ya no está.
    await p.mouse.up(); await p.waitForTimeout(1500);
    turnos++;
  }
  const acabo = await p.$("text=Pulsa ¡VERIFICAR!");
  if (!acabo) fallos.push("la ronda se quedó colgada: nunca llegó el aviso de verificar");
  else {
    await p.click("button:has-text('¡VERIFICAR!')");
    await p.waitForTimeout(1200);
    const ambar = await p.evaluate(() => Array.from(document.querySelectorAll("div")).filter((d) => d.style && d.style.touchAction === "none" && /rgb\(242, 194, 96\)/.test(d.style.border || "")).length);
    console.log("turnos jugados: " + turnos + " · renglones marcados en ámbar al revelar: " + ambar);
    if (ambar === 0) fallos.push("el revelado no marca lo que había que romper");
    if (turnos !== 3) fallos.push("se jugaron " + turnos + " órdenes y tenían que ser 3");
  }
  console.log(fallos.length ? "X " + fallos.join(" | ") : "OK Rompiendo siempre mal: nunca se pide un renglón ausente, la ronda termina sola y el revelado marca lo que tocaba.");
  await br.close(); srv.close();
})();
