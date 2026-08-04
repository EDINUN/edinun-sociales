#!/usr/bin/env node
/**
 * Re-empaquetar los .jsx editables en el bloque <script type="text/babel">
 * de index.html y EDINUN GAMES.html. Equivalente a bundle.py / bundle.ps1.
 *
 * Útil cuando Python no está disponible (caso frecuente en Windows: el
 * `python` del PATH son stubs del Microsoft Store). Correr desde la carpeta
 * del juego:  node .planning/bundle.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const JSX_FILES = ["logo.jsx", "characters.jsx", "screens.jsx", "game-screens.jsx", "app.jsx"];
const HTML_FILES = ["index.html", "EDINUN GAMES.html"];

const sources = JSX_FILES.map((f) => {
  const text = fs.readFileSync(path.join(ROOT, f), "utf8");
  // Ningún .jsx puede contener "</script>" literal: cerraría el bloque babel.
  if (text.toLowerCase().includes("</" + "script>")) {
    console.error(
      `ERROR: ${f} contiene '</` + `script>' literal. El parser HTML del ` +
      `navegador cerraría el bloque <script type=text/babel> ahí mismo. ` +
      `Dividí el token (ej: "<\\\\/scr"+"ipt>").`
    );
    process.exit(1);
  }
  return text;
});
const bundle = sources.join("\n");

// Reescribe desde <script type="text/babel"> hasta </html> (sana HTML corrupto).
const pattern = /(<script type="text\/babel" data-presets="react">)[\s\S]*<\/html>/i;

for (const html of HTML_FILES) {
  const p = path.join(ROOT, html);
  const src = fs.readFileSync(p, "utf8");
  if (!pattern.test(src)) {
    console.error(`No se encontró el bloque <script babel> en ${html}`);
    process.exit(1);
  }
  const out = src.replace(pattern, (m, open) => `${open}\n${bundle}\n</` + `script>\n</body>\n</html>`);
  fs.writeFileSync(p, out, "utf8");
  console.log(`  OK ${html} actualizado (${Buffer.byteLength(out, "utf8")} bytes)`);
}
console.log("Bundle listo.");
