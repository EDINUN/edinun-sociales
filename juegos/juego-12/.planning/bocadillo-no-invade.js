// ¿Algún bocadillo de Andi se monta sobre la mecánica?
//
// 📌 Por qué existe: el detector de solapes (`espacios-*.js`) NO lo ve. El bocadillo vive
// fuera del carril, en la columna del personaje, y el detector descarta lo que va por
// encima en z-index. La autora lo cazó a ojo el 2026-11-24: el bocadillo de tres líneas
// de la ronda de los hilos se montaba sobre las tarjetas de los autores.
//
// Cómo mide, sin tener que jugar las 18 rondas: saca TODOS los textos de bocadillo de
// `game-screens.jsx`, los mete uno a uno en el bocadillo de verdad que hay en pantalla y
// mide su caja en píxeles del lienzo. El carril de la mecánica empieza en x = 215.
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8927;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });
const CARRIL = 215;

// Todos los bocadillos declarados en el juego: bubble: (<> … </>)
function bocadillos() {
  const src = fs.readFileSync(path.join(__dirname, "..", "game-screens.jsx"), "utf8");
  const out = [];
  const re = /bubble:\s*\(<>([\s\S]*?)<\/>\)/g;
  let m;
  while ((m = re.exec(src)) !== null) out.push(m[1].replace(/<br\s*\/>/g, "<br>").replace(/\s+/g, " ").trim());
  return out;
}

(async () => {
  srv.listen(PORT);
  const textos = bocadillos();
  if (!textos.length) { console.error("No se encontró ningún bocadillo en game-screens.jsx"); process.exit(1); }
  const br = await chromium.launch();
  const p = await (await br.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
  await p.waitForSelector("button:has-text('Libro 6')", { timeout: 60000 });
  await p.click("button:has-text('Libro 6')");
  const bt = await p.$("button:has-text('La Revolución Marcista')");
  if (bt) await bt.click();
  await p.fill("input.ed-input", "QA");
  await p.click("button:has-text('ENTRAR')");
  await p.waitForTimeout(600);
  const v = await p.$("button:has-text('VAMOS')"); if (v) { await v.click(); await p.waitForTimeout(900); }

  const res = await p.evaluate(({ textos, CARRIL }) => {
    const stage = Array.from(document.querySelectorAll("div")).find((d) => d.style && d.style.width === "900px" && d.style.height === "540px");
    if (!stage) return { err: "no hay lienzo" };
    const sr = stage.getBoundingClientRect();
    const esc = sr.width / 900;
    const burbuja = Array.from(stage.querySelectorAll("div")).find((d) => {
      const s = getComputedStyle(d);
      // ⚠ Se reconoce por el color del texto y el radio: el ancho del borde (1.5px) lo
      //   redondea el navegador y no se puede comparar a pelo.
      return s.borderTopLeftRadius === "16px" && s.color === "rgb(252, 233, 168)" && (d.textContent || "").trim().length > 0;
    });
    if (!burbuja) return { err: "no se encontró el bocadillo en pantalla" };
    const original = burbuja.innerHTML;
    const filas = textos.map((t) => {
      burbuja.innerHTML = t;
      const b = burbuja.getBoundingClientRect();
      return { t: t.replace(/<br>/g, " / "), izq: Math.round((b.left - sr.left) / esc), der: Math.round((b.right - sr.left) / esc) };
    });
    burbuja.innerHTML = original;
    return { filas: filas };
  }, { textos: textos, CARRIL: CARRIL });

  if (res.err) { console.error("X " + res.err); await br.close(); srv.close(); process.exit(1); }
  const malos = [];
  res.filas.forEach((f) => {
    const invade = f.der - CARRIL;
    if (invade > 0) malos.push(f.t + "  (llega a x=" + f.der + ", invade " + invade + " px)");
    console.log(String(f.izq).padStart(4) + " →" + String(f.der).padStart(4) + "   " + (invade > 0 ? "✗ invade " + invade : "OK       ") + "   " + f.t);
  });
  console.log("\nEl carril de la mecánica empieza en x = " + CARRIL + ". Bocadillos medidos: " + res.filas.length + ".");
  console.log(malos.length ? "X Se montan sobre la mecánica:\n - " + malos.join("\n - ") : "OK Ningún bocadillo llega al carril.");
  await br.close(); srv.close();
})();
