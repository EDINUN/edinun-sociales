// Mide, en coordenadas del lienzo 900×540, los huecos verticales de las 3 rondas:
// RONDA → enunciado → bloque de la mecánica → borde inferior de la zona.
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8885;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });
const CIUDADANOS = ["Don Ramón", "Don Tomás", "Capitán Vargas", "Padre Ignacio"];
const PIR = ["Élite terrateniente", "Militares, comerciantes", "Indígenas, campesinos", "Afroamericanos esclavizados"];
const ANCHOS = [172, 250, 328, 406];

async function medir(p, etiqueta) {
  const r = await p.evaluate(() => {
    const stage = Array.from(document.querySelectorAll("div")).find((d) => d.style && d.style.width === "900px" && d.style.height === "540px");
    const sc = stage.getBoundingClientRect().width / 900;
    const y = (v) => Math.round(v / sc);
    const zona = Array.from(document.querySelectorAll("div")).find((d) => d.style && d.style.left === "215px" && d.style.right === "215px");
    const ronda = Array.from(document.querySelectorAll("span")).find((s) => s.textContent.trim() === "Ronda");
    const enun = zona.querySelector("span[style*='font-size: 20px']");
    const zr = zona.getBoundingClientRect(), rr = ronda.getBoundingClientRect(), er = enun.getBoundingClientRect();
    const caja = zona.querySelector("div[style*='flex: 1']") || zona.lastElementChild;
    const hijos = Array.from(caja.children).filter((c) => c.getBoundingClientRect().height > 2);
    const pri = hijos[0].getBoundingClientRect(), ult = hijos[hijos.length - 1].getBoundingClientRect();
    const internos = [];
    for (let i = 1; i < hijos.length; i++) internos.push(y(hijos[i].getBoundingClientRect().top - hijos[i - 1].getBoundingClientRect().bottom));
    return { rondaAEnun: y(er.top - rr.bottom), enunABloque: y(pri.top - er.bottom), internos, bloqueAFondo: y(zr.bottom - ult.bottom) };
  });
  console.log(etiqueta + ": Ronda→enunciado " + r.rondaAEnun + " · enunciado→bloque " + r.enunABloque +
    " · entre piezas [" + r.internos.join(", ") + "] · bloque→fondo " + r.bloqueAFondo);
}

(async () => {
  srv.listen(PORT);
  const br = await chromium.launch();
  const p = await (await br.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
  await p.waitForSelector("button:has-text('Libro 6')");
  await p.click("button:has-text('Libro 6')");
  await p.fill("input.ed-input", "QA");
  await p.click("button:has-text('ENTRAR')");
  await p.waitForTimeout(500);
  const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(700); }

  await p.waitForSelector("text=Decide quién podía ser ciudadano");
  await medir(p, "R1");
  const tarjetas = await p.$$("div[style*='width: 221px']");
  for (const t of tarjetas) {
    const txt = (await t.innerText()).replace(/\s+/g, " ");
    const esC = CIUDADANOS.some((n) => txt.indexOf(n) >= 0);
    await (await t.$(esC ? "button:has-text('SÍ')" : "button:has-text('NO')")).click();
  }
  await p.click("button:has-text('¡VERIFICAR!')");
  await p.waitForTimeout(900);
  await medir(p, "R1 verificada");
  await p.waitForTimeout(3600);

  await p.waitForSelector("text=Arma la pirámide social");
  await medir(p, "R2");
  for (let k = 0; k < 4; k++) {
    const fichas = await p.$$("div[style*='min-height: 44px'] > button");
    if (!fichas.length) break;
    const txt = (await fichas[0].innerText()).replace(/\s+/g, " ").trim();
    const d = PIR.findIndex((x) => txt.indexOf(x) >= 0);
    await fichas[0].click();
    const esc = await p.$("button[style*='width: " + ANCHOS[d] + "px']");
    await esc.click();
    await p.waitForTimeout(110);
  }
  await p.click("button:has-text('¡VERIFICAR!')");
  await p.waitForTimeout(900);
  await medir(p, "R2 verificada");
  await p.waitForTimeout(3600);

  await p.waitForSelector("text=Ordena los hechos");
  await p.waitForTimeout(300);
  await medir(p, "R3");
  await br.close(); srv.close();
})();
