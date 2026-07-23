// Inyecta ecu-map.json entre los marcadores /*__MAP__*/ .. /*__MAP_END__*/ del
// game-screens.jsx de juego-6. Idempotente.
// Uso (desde esta carpeta .planning): node gen-map.js && node inject-map.js
const fs = require("fs");
const path = require("path");
const GAME = path.join(__dirname, "..", "game-screens.jsx");
const map = JSON.parse(fs.readFileSync(path.join(__dirname, "ecu-map.json"), "utf8"));
let src = fs.readFileSync(GAME, "utf8");
const json = JSON.stringify(map);
if (json.indexOf("</") !== -1 || json.indexOf("*/") !== -1) { console.error("¡El JSON contiene una secuencia peligrosa!"); process.exit(1); }
const re = /\/\*__MAP__\*\/[\s\S]*?\/\*__MAP_END__\*\//;
if (!re.test(src)) { console.error("No se encontraron los marcadores __MAP__ .. __MAP_END__"); process.exit(1); }
src = src.replace(re, "/*__MAP__*/" + json + "/*__MAP_END__*/");
fs.writeFileSync(GAME, src);
console.log("mapa inyectado:", map.provincias.length, "provincias ·", json.length, "bytes JSON");
