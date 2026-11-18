// Cuanto mide de ancho, de verdad, la linea "<nombre>, <edad> anos" de cada una de las 12
// personas de la R1, y cuanto sitio le queda si se reserva el hueco del sello ✓/✗.
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = "c:/Users/Analist Prod & Platf/OneDrive/Desktop/edinun-sociales", PORT = 8895;
const M = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "Content-Type": M[path.extname(p)] || "application/octet-stream" }); r.end(d); } }); });

(async () => {
  srv.listen(PORT);
  const br = await chromium.launch();
  const p = await (await br.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  await p.goto("http://localhost:" + PORT + "/juegos/juego-12/index.html", { waitUntil: "load" });
  await p.waitForSelector("button:has-text('Libro 6')");
  const nombres = await p.evaluate(() => {
    // Se mide fuera del juego, con la misma tipografia y tamano, para las 12 personas.
    const todas = [
      ["Don Ramón", 42], ["Doña Mercedes", 35], ["Don Tomás", 28], ["Don Julián", 26],
      ["Capitán Vargas", 33], ["Padre Ignacio", 50], ["Manuel", 30], ["Rosa", 27],
      ["Lucho", 29], ["Carlitos", 19], ["Pedro", 24], ["Juana", 31],
    ];
    const d = document.createElement("div");
    d.style.cssText = "position:fixed;left:-9999px;top:0;white-space:nowrap;font-family:var(--ed-font-display);font-weight:800;font-size:12.5px";
    document.body.appendChild(d);
    const o = todas.map(([n, e]) => { d.textContent = n + ", " + e + " años"; return [n, Math.ceil(d.getBoundingClientRect().width)]; });
    d.remove();
    return o;
  });
  nombres.sort((a, b) => b[1] - a[1]).forEach(([n, w]) => console.log(String(w).padStart(4) + " px  " + n));
  console.log("\nAncho disponible hoy: 221 - 16 (padding) - 56 (retrato) - 7 (gap) = 142 px");
  console.log("Si se reserva el hueco del sello (18 px + 6 de aire): 118 px");
  await br.close(); srv.close();
})();
