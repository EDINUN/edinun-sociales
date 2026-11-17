// mapa-grid.js — clasifica el mapa en mar/tierra/selva muestreando píxeles,
// para colocar las ciudades sobre tierra de verdad y no "a ojo".
//   node .planning/mapa-grid.js
const path = require("path");
const fs = require("fs");
const http = require("http");
const { chromium } = require("playwright");

const FILE = path.resolve(__dirname, "..", "assets", "mapa-mesoamerica.jpg");
const PORT = 8807;
const IMG = `http://127.0.0.1:${PORT}/mapa.jpg`;
const COLS = 74, ROWS = 34;

(async () => {
  const srv = http.createServer((q, r) => {
    r.writeHead(200, { "Content-Type": "image/jpeg" });
    r.end(fs.readFileSync(FILE));
  });
  await new Promise((ok) => srv.listen(PORT, "127.0.0.1", ok));
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto(`http://127.0.0.1:${PORT}/`);
  const grid = await p.evaluate(async ([src, COLS, ROWS]) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    const W = img.naturalWidth, H = img.naturalHeight;
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const x = c.getContext("2d");
    x.drawImage(img, 0, 0);
    const data = x.getImageData(0, 0, W, H).data;
    const at = (px, py) => { const i = (py * W + px) * 4; return [data[i], data[i + 1], data[i + 2]]; };
    const out = [];
    for (let r = 0; r < ROWS; r++) {
      let line = "";
      for (let q = 0; q < COLS; q++) {
        const px = Math.floor((q + 0.5) / COLS * W), py = Math.floor((r + 0.5) / ROWS * H);
        const [R, G, B] = at(px, py);
        const mar = B > R + 8;                       // azules/verdeazulados del agua
        const selva = !mar && G >= R - 10 && R < 175; // verdes de la selva
        line += mar ? "." : selva ? "#" : "+";
      }
      out.push(line);
    }
    return { W, H, out };
  }, [IMG, COLS, ROWS]);

  console.log(`imagen ${grid.W}x${grid.H}   . = mar   + = tierra clara   # = selva\n`);
  let head = "    ";
  for (let i = 0; i < COLS; i++) head += (i % 10 === 0 ? String(i / 10) : (i % 5 === 0 ? "+" : "-"));
  console.log(head);
  grid.out.forEach((l, i) => console.log(String(i).padStart(3) + " " + l));
  console.log("\ncolumna q -> x = (q+0.5)/" + COLS + "   fila r -> y = (r+0.5)/" + ROWS);
  await b.close(); srv.close();
})();
