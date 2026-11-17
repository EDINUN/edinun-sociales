// Mide, en coordenadas del lienzo 900×540, los huecos verticales de las 3 rondas del
// Tema 4: RONDA → enunciado → bloque de la mecánica → borde inferior de la zona.
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8877;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });

async function medir(p, etiqueta) {
  const r = await p.evaluate(() => {
    const stage = Array.from(document.querySelectorAll("div")).find((d) => d.style && d.style.width === "900px" && d.style.height === "540px");
    const sc = stage.getBoundingClientRect().width / 900;      // factor de escala
    const y = (v) => Math.round(v / sc);
    const zona = Array.from(document.querySelectorAll("div")).find((d) => d.style && d.style.left === "215px" && d.style.right === "215px");
    const ronda = Array.from(document.querySelectorAll("span")).find((s) => s.textContent.trim() === "Ronda");
    const enun = zona.querySelector("span[style*='font-size: 20px']");
    const sr = stage.getBoundingClientRect(), zr = zona.getBoundingClientRect();
    const rr = ronda.getBoundingClientRect(), er = enun.getBoundingClientRect();
    // Primer y último elemento del bloque de la mecánica (hijos del contenedor flex:1)
    const caja = zona.querySelector("div[style*='flex: 1']") || zona.lastElementChild;
    const hijos = Array.from(caja.children).filter((c) => c.getBoundingClientRect().height > 2);
    const pri = hijos[0].getBoundingClientRect(), ult = hijos[hijos.length - 1].getBoundingClientRect();
    const internos = [];
    for (let i = 1; i < hijos.length; i++) internos.push(y(hijos[i].getBoundingClientRect().top - hijos[i - 1].getBoundingClientRect().bottom));
    return {
      rondaAEnun: y(er.top - rr.bottom),
      enunABloque: y(pri.top - er.bottom),
      bloqueAFondo: y(zr.bottom - ult.bottom),
      internos,
      zonaTop: y(zr.top - sr.top), zonaBottom: y(sr.bottom - zr.bottom),
    };
  });
  console.log(`${etiqueta}: Ronda→enunciado ${r.rondaAEnun} · enunciado→bloque ${r.enunABloque} · entre piezas [${r.internos.join(", ")}] · bloque→fondo ${r.bloqueAFondo}`);
  return r;
}

(async () => {
  srv.listen(PORT);
  const br = await chromium.launch();
  const p = await (await br.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  await p.goto("http://localhost:" + PORT + "/juegos/juego-10/index.html", { waitUntil: "load" });
  await p.waitForSelector("input.ed-input");
  await p.fill("input.ed-input", "QA");
  await p.click("button:has-text('Vivir en equilibrio')");
  await p.click("button:has-text('ENTRAR')");
  await p.waitForTimeout(500);
  const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(700); }
  await p.waitForSelector("text=le faltan cuatro palabras");
  await medir(p, "R1");
  for (let n = 0; n < 4; n++) {
    const piezas = await p.$$("div[style*='flex-wrap: wrap'] > button");
    if (!piezas.length) break;
    await piezas[0].click();
    const hs = await p.$$("span[data-hueco]");
    let d = null; for (const x of hs) { if (!(await x.innerText()).trim()) { d = x; break; } }
    if (!d) break;
    await d.click(); await p.waitForTimeout(100);
  }
  await p.click("button:has-text('¡VERIFICAR!')");
  await p.waitForTimeout(900);
  await medir(p, "R1 verificada");
  await p.waitForTimeout(3600);
  await p.waitForSelector("text=Une cada opción de vida");
  await medir(p, "R2");
  const izq = await p.$$("button[style*='width: 168px']");
  const der = await p.$$("button[style*='width: 206px']");
  for (let n = 0; n < izq.length; n++) { await izq[n].click(); await der[n].click(); await p.waitForTimeout(100); }
  await p.click("button:has-text('¡VERIFICAR!')");
  await p.waitForTimeout(4300);
  await p.waitForSelector("text=Atrapa solo lo que cuida");
  await p.waitForTimeout(400);
  await medir(p, "R3");
  await br.close(); srv.close();
})();
