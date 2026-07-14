#!/usr/bin/env node
/**
 * format-lint.js — verifica que cada juego cumple el ESTÁNDAR VISUAL fijo
 * documentado en `.claude/skills/edinun-game-builder/references/estandar-visual.md`.
 *
 * Revisa los `.jsx` FUENTE (no el HTML) buscando los valores literales fijos:
 * logo del Home (300), mini-logos (60/64), rejilla de botones según nº de temas,
 * botón compacto (fontSize 15 / padding 14px 6px), personaje (bottom 78 / char 186),
 * acciones (right 18/12) y ResultsScreen (inset / grid / char 176 / título 34).
 *
 * Es un LINT ESTÁTICO — no abre el navegador. Para el colchón mecánica↔acciones
 * y el layout real, correr además `qa-visual.js`.
 *
 * Uso (desde la RAÍZ del repo):
 *   node juegos/_PLANTILLA/.planning/format-lint.js            # todos los juego-*
 *   node juegos/_PLANTILLA/.planning/format-lint.js juego-3    # solo ese
 * Exit 0 si todo pasa; 1 si hay desviaciones.
 */
const fs = require("fs");
const path = require("path");

const REPO = path.resolve(__dirname, "..", "..", "..");
const JUEGOS = path.join(REPO, "juegos");

function listGames(args) {
  if (args.length) return args;
  return fs.readdirSync(JUEGOS).filter((d) => /^juego-\d+$/.test(d))
    .sort((a, b) => +a.split("-")[1] - +b.split("-")[1]);
}
function read(g, f) {
  try { return fs.readFileSync(path.join(JUEGOS, g, f), "utf8"); } catch (e) { return ""; }
}
// nº de temas = entradas con catLabel en LEVELS_CFG (0 = juego de 1 nivel)
function countTemas(screens) { return (screens.match(/catLabel:\s*"/g) || []).length; }

const GRID_BY_TEMAS = { 2: '"1fr 1fr"', 3: '"1fr 1fr 1fr"', 4: '"1fr 1fr 1fr 1fr"' };

function lintGame(g) {
  const screens = read(g, "screens.jsx");
  const game = read(g, "game-screens.jsx");
  const issues = [];
  const ok = [];
  const has = (txt, s) => txt.includes(s);
  const check = (cond, label, detail) => { (cond ? ok : issues).push(cond ? label : `${label} — ${detail}`); };

  // ── Home ──
  check(has(screens, "EdinunLogo size={300}"), "Logo Home = 300",
    "se esperaba `EdinunLogo size={300}` (estándar _PLANTILLA)");
  check(has(screens, 'gridTemplateColumns: "1fr 1.15fr"'), "Home grid 1fr 1.15fr",
    "se esperaba el grid exterior `1fr 1.15fr`");

  const nT = countTemas(screens);
  if (nT >= 2) {
    const expGrid = GRID_BY_TEMAS[nT];
    check(expGrid && has(screens, `gridTemplateColumns: ${expGrid}`),
      `Botones de tema en fila (${nT} → ${expGrid || "?"})`,
      `${nT} temas requieren \`gridTemplateColumns: ${expGrid}\``);
    check(has(screens, 'fontSize: 15, letterSpacing: "0.02em"') || has(screens, "fontSize: 15,"),
      "Botón de tema compacto (fontSize 15)",
      "el botón de tema debe ser `fontSize: 15` (no 22)");
    check(has(screens, 'padding: "14px 6px"'), "Botón de tema padding 14px 6px",
      "se esperaba `padding: \"14px 6px\"` en el botón de tema");
  }

  // ── Mini-logos ──
  check(has(game, "EdinunLogoMini size={60}"), "Mini-logo HUD juego = 60",
    "se esperaba `EdinunLogoMini size={60}` en game-screens");
  check(has(screens, "EdinunLogoMini size={64}"), "Mini-logo CharacterScreen = 64",
    "se esperaba `EdinunLogoMini size={64}` en screens");

  // ── Personaje ──
  check(has(game, "left: 8, bottom: 78, width: 220"), "Personaje left:8 bottom:78 width:220",
    "grupo del personaje fuera del estándar");
  check(/char\.Component size=\{186\}/.test(game), "Char size = 186",
    "el personaje del juego debe ser `size={186}`");

  // ── Acciones (estándar 18 o variante angosta 12 justificada) ──
  check(has(game, 'right: 18, top: "50%"') || has(game, 'right: 12, top: "50%"'),
    "Acciones columna derecha (right 18 / 12)",
    "la columna de acciones debe ir a `right: 18` (o 12 en variante angosta)");

  // ── ResultsScreen ──
  check(has(game, 'inset: "70px 32px 20px 32px"'), "Results inset 70/32/20/32", "ResultsScreen fuera del estándar");
  check(has(game, 'gridTemplateColumns: "0.85fr 1.4fr"'), "Results grid 0.85fr 1.4fr", "grid del reporte fuera del estándar");
  check(/char\.Component size=\{176\}/.test(game), "Results char = 176", "el personaje de resultados debe ser `size={176}`");
  check(/fontSize: 34,\s*background: "linear-gradient\(180deg, #fce9a8/.test(game), "Results título = 34",
    "el título '¡Ronda completa!' debe ser `fontSize: 34`");

  return { g, nT, ok, issues };
}

const games = listGames(process.argv.slice(2));
let bad = 0;
console.log("── format-lint (estándar visual) ──\n");
for (const g of games) {
  const r = lintGame(g);
  if (!r.ok.length && !r.issues.length) { console.log(`${g}: (sin .jsx legibles)`); continue; }
  if (r.issues.length) {
    bad++;
    console.log(`✗ ${g}  (${r.nT} temas) — ${r.issues.length} desviación(es):`);
    r.issues.forEach((i) => console.log(`    ⚠ ${i}`));
  } else {
    console.log(`✓ ${g}  (${r.nT} temas) — ${r.ok.length}/${r.ok.length} OK`);
  }
}
console.log(bad === 0 ? "\nTodos los juegos cumplen el estándar." : `\n${bad} juego(s) con desviaciones. Revisa estandar-visual.md.`);
process.exit(bad === 0 ? 0 : 1);
