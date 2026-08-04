#!/usr/bin/env node
/**
 * QA visual de los juegos de edinun-sociales con Playwright.
 * Sirve el repo, recorre Home → Personaje → Game de cada juego en los 6
 * viewports canónicos, captura screenshots y detecta si algún elemento se
 * sale del lienzo lógico 900×540 (los juegos de sociales no llevan atributos
 * data-qa; la detección es estructural por el stage de 900×540).
 *
 * Uso (desde la RAÍZ del repo):
 *   node juegos/_PLANTILLA/.planning/qa-visual.js                 # todos los juego-*
 *   node juegos/_PLANTILLA/.planning/qa-visual.js juego-3 juego-4 # solo esos
 *
 * Requiere Playwright (package.json ya lo declara como devDependency):
 *   npm install && npx playwright install chromium
 * Si está instalado en otro repo EDINUN de la misma máquina, se puede reusar:
 *   NODE_PATH="<ruta>/node_modules" node juegos/_PLANTILLA/.planning/qa-visual.js
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");
const OUT = path.join(__dirname, "qa-screenshots");
const PORT = 8770;
const VIEWPORTS = [
  { name: "desktop-fullhd", width: 1920, height: 1080 },
  { name: "laptop", width: 1280, height: 800 },
  { name: "tablet-land", width: 1024, height: 768 },
  { name: "tablet-portrait", width: 768, height: 1024 },
  { name: "mobile-land", width: 667, height: 375 },
  { name: "mobile-portrait", width: 375, height: 667 },
];
const MIME = { ".html":"text/html",".css":"text/css",".js":"text/javascript",".jsx":"text/jsx",".json":"application/json",".png":"image/png",".svg":"image/svg+xml",".php":"text/plain" };

function serve() {
  return new Promise((res) => {
    const s = http.createServer((req, r) => {
      let u = decodeURIComponent(req.url.split("?")[0]);
      if (u.endsWith("/")) u += "index.html";
      fs.readFile(path.join(REPO_ROOT, u), (e, d) => {
        if (e) { r.writeHead(404); r.end("nf"); return; }
        r.writeHead(200, { "Content-Type": MIME[path.extname(u)] || "application/octet-stream" });
        r.end(d);
      });
    });
    s.listen(PORT, "localhost", () => res(s));
  });
}

function listGames(args) {
  if (args.length) return args;
  return fs.readdirSync(path.join(REPO_ROOT, "juegos"))
    .filter((d) => /^juego-\d+$/.test(d))
    .sort((a, b) => +a.split("-")[1] - +b.split("-")[1]);
}

async function measureOverflow(page) {
  return await page.evaluate(() => {
    const stage = [...document.querySelectorAll("div")].find((d) => d.style.width === "900px" && d.style.height === "540px");
    if (!stage) return { err: "no stage 900x540" };
    const s = stage.getBoundingClientRect();
    const sc = s.width / 900;
    const L = (r) => ({ x: (r.x - s.x) / sc, right: (r.right - s.x) / sc, y: (r.y - s.y) / sc, bottom: (r.bottom - s.y) / sc, w: r.width / sc, h: r.height / sc });

    // (a) nada fuera del lienzo 900×540
    const out = [];
    stage.querySelectorAll("button, [style*='position: absolute']").forEach((el) => {
      const b = L(el.getBoundingClientRect());
      if (b.w < 1 || b.h < 1) return;
      if (b.x < -2 || b.y < -2 || b.right > 902 || b.bottom > 542) {
        out.push({ label: (el.textContent || "").trim().slice(0, 18), x: +b.x.toFixed(0), y: +b.y.toFixed(0), w: +b.w.toFixed(0), h: +b.h.toFixed(0) });
      }
    });

    // (b) COLCHÓN mecánica ↔ acciones (≥30px). Mide TODO — botones, imgs y divs
    //     contenedores (tablero/panel) — en la franja vertical de las acciones.
    const ACC = new Set(["REINICIAR", "SALIR", "VERIFICAR", "¡VERIFICAR!", "BORRAR"]);
    const accBtns = [...document.querySelectorAll("button")].filter((b) => ACC.has(b.textContent.trim()));
    let gap = null, mech = null;
    if (accBtns.length) {
      const boxes = accBtns.map((b) => L(b.getBoundingClientRect()));
      const accLeft = Math.min(...boxes.map((b) => b.x));
      const accTop = Math.min(...boxes.map((b) => b.y));
      const accBot = Math.max(...boxes.map((b) => b.bottom));
      let worst = null;
      stage.querySelectorAll("button, img, [style*='position: absolute']").forEach((el) => {
        if (el.tagName === "BUTTON" && ACC.has(el.textContent.trim())) return; // excluye las acciones
        // Los DIV wrapper transparentes (contenedores de posición, sin fondo ni borde)
        // no son contenido visible → ignorarlos, o dan falsos positivos.
        if (el.tagName !== "BUTTON" && el.tagName !== "IMG") {
          const cs = getComputedStyle(el);
          const bg = cs.backgroundColor && cs.backgroundColor !== "rgba(0, 0, 0, 0)" && cs.backgroundColor !== "transparent";
          const bgImg = cs.backgroundImage && cs.backgroundImage !== "none";
          const bord = parseFloat(cs.borderTopWidth) > 0 || parseFloat(cs.borderLeftWidth) > 0 || parseFloat(cs.borderRightWidth) > 0;
          if (!bg && !bgImg && !bord) return; // wrapper invisible → no cuenta
        }
        const b = L(el.getBoundingClientRect());
        if (b.w < 8 || b.h < 8) return;
        if (b.right < 200) return;                       // descarta personaje/bocadillo (izquierda)
        if (b.bottom < accTop - 10 || b.y > accBot + 10) return; // solo la franja vertical de las acciones
        if (b.right > accLeft + 40) return;              // ignora lo que ya está bajo/dentro de las acciones
        if (!worst || b.right > worst.right) worst = { right: b.right, label: (el.textContent || el.alt || el.tagName).trim().slice(0, 16) };
      });
      if (worst) { gap = +(accLeft - worst.right).toFixed(0); mech = worst.label; }
    }
    return { overflow: out, gap, mech };
  });
}

async function run() {
  const games = listGames(process.argv.slice(2));
  fs.mkdirSync(OUT, { recursive: true });
  const server = await serve();
  const browser = await chromium.launch();
  const report = {};
  let problems = 0;
  for (const g of games) {
    report[g] = {};
    for (const vp of VIEWPORTS) {
      const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await ctx.newPage();
      const errs = [];
      page.on("pageerror", (e) => errs.push(String(e).slice(0, 160)));
      try {
        await page.goto(`http://localhost:${PORT}/juegos/${g}/index.html`, { waitUntil: "load" });
        await page.waitForSelector("input.ed-input", { timeout: 20000 });
        // En teléfono vertical el overlay bloqueante de rotación es lo esperado.
        const phonePortrait = Math.min(vp.width, vp.height) <= 600 && vp.height > vp.width;
        if (phonePortrait) {
          await page.screenshot({ path: path.join(OUT, `${g}-${vp.name}-rotate.png`) });
          report[g][vp.name] = { note: "teléfono vertical: overlay de rotación (esperado)" };
          await ctx.close(); continue;
        }
        await page.fill("input.ed-input", "QABot");
        await page.click("button:has-text('ENTRAR')");
        await page.waitForTimeout(500);
        const vamos = await page.$("button:has-text('VAMOS')");
        if (vamos) { await vamos.click(); await page.waitForTimeout(700); }
        await page.waitForTimeout(600);
        await page.screenshot({ path: path.join(OUT, `${g}-${vp.name}-game.png`) });
        const m = await measureOverflow(page);
        if (errs.length) m.pageerrors = errs;
        // colchón mecánica↔acciones: <10px = pegado (error); 10–29px = revisar (warn)
        if (m.gap != null && m.gap < 10) m.gapAlert = `PEGADO: mecánica (${m.mech}) a ${m.gap}px de las acciones`;
        else if (m.gap != null && m.gap < 30) m.gapWarn = `apretado: mecánica (${m.mech}) a ${m.gap}px de las acciones (ideal ≥30)`;
        if ((m.overflow && m.overflow.length) || m.err || m.gapAlert || errs.length) problems++;
        report[g][vp.name] = m;
      } catch (e) {
        report[g][vp.name] = { fail: String(e).slice(0, 160), pageerrors: errs };
        problems++;
      }
      await ctx.close();
    }
  }
  await browser.close();
  server.close();
  fs.writeFileSync(path.join(OUT, "qa-report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  console.log(`\nScreenshots: ${OUT}`);
  console.log(problems === 0 ? "QA OK: sin overflow ni errores." : `QA con ${problems} viewport(s) a revisar.`);
  process.exit(problems === 0 ? 0 : 1);
}
run().catch((e) => { console.error(e); process.exit(2); });
