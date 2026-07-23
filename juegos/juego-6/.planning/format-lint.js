#!/usr/bin/env node
/**
 * format-lint.js — verifica que cada juego cumple el ESTÁNDAR VISUAL fijo
 * documentado en `.claude/skills/edinun-game-builder/references/estandar-visual.md`.
 *
 * Revisa los `.jsx` FUENTE (no el HTML) buscando los valores literales fijos:
 * logo del Home (300), mini-logos (HUD 64 / CharacterScreen 64 / reporte 56),
 * rejilla de botones según nº de temas,
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

// Grid de los botones de tema en el Home. 4 temas → 2×2 ("1fr 1fr", 2 filas),
// igual que la referencia visual edinun-language/juego-4 (no una fila de 4).
const GRID_BY_TEMAS = { 2: '"1fr 1fr"', 3: '"1fr 1fr 1fr"', 4: '"1fr 1fr"' };

// §0 — Gradientes de los botones de tema POR POSICIÓN (tabla del estándar).
const GRAD_BY_POS = [
  "linear-gradient(180deg, #ffc06e, #e4881a)",   // 1º naranja
  "linear-gradient(180deg, #ffe97a, #d7b12a)",   // 2º amarillo
  "linear-gradient(180deg, #7ab8ff, #2773d8)",   // 3º azul
  "linear-gradient(180deg, #b48aff, #6f3fe0)",   // 4º violeta
];
function gradsOf(screens) {
  const re = /grad:\s*"([^"]+)"/g, out = []; let m;
  while ((m = re.exec(screens))) out.push(m[1]);
  return out;
}

// §3 — Rótulos de acción INVENTADOS. El estándar solo admite ¡VERIFICAR! / REINICIAR /
// SALIR en la columna de acciones; el avance entre rondas es AUTOMÁTICO (§6), así que
// un "SIGUIENTE"/"CONTINUAR" es señal de que alguien se inventó un botón.
const ROTULOS_PROHIBIDOS = ["CONFIRMAR", "SIGUIENTE", "CONTINUAR", "ACEPTAR", "EMPEZAR", "ENVIAR", "COMPROBAR", "REVISAR"];
// OJO: NO cortar en el primer ">" — las funciones flecha (`() =>`) de los props traen
// un ">" y el texto saldría con código pegado ("setX(true)} style={}>REINICIAR"), con lo
// que la comparación nunca casa y el lint no caza nada. El texto del botón es lo que va
// tras el ÚLTIMO ">" del bloque.
function buttonTexts(src) {
  const re = /<button\b([\s\S]*?)<\/button>/g, out = []; let m;
  while ((m = re.exec(src))) {
    const i = m[1].lastIndexOf(">");
    if (i === -1) continue;
    const t = m[1].slice(i + 1).replace(/\{[^{}]*\}/g, "").replace(/\s+/g, " ").trim();
    if (t) out.push(t);
  }
  return out;
}

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
      `Botones de tema (${nT} → ${expGrid || "?"})`,
      `${nT} temas requieren \`gridTemplateColumns: ${expGrid}\``);
    check(has(screens, 'fontSize: 15, letterSpacing: "0.02em"') || has(screens, "fontSize: 15,"),
      "Botón de tema compacto (fontSize 15)",
      "el botón de tema debe ser `fontSize: 15` (no 22)");
    check(has(screens, 'padding: "14px 6px"'), "Botón de tema padding 14px 6px",
      "se esperaba `padding: \"14px 6px\"` en el botón de tema");

    // §0 — gradiente por posición (byte a byte)
    const grads = gradsOf(screens);
    const malos = [];
    grads.slice(0, 4).forEach((gr, i) => {
      if (GRAD_BY_POS[i] && gr !== GRAD_BY_POS[i]) malos.push(`${i + 1}º usa "${gr}" y toca "${GRAD_BY_POS[i]}"`);
    });
    check(malos.length === 0, "Gradientes de tema por posición",
      malos.join(" · "));
  }

  // ── §3/§6 — rótulos de acción inventados (el avance entre rondas es automático) ──
  const rotMalos = buttonTexts(game).filter((t) =>
    ROTULOS_PROHIBIDOS.some((p) => t.toUpperCase().replace(/[^A-ZÁÉÍÓÚÑ ]/g, "").trim() === p));
  check(rotMalos.length === 0, "Sin rótulos de botón inventados",
    `botón(es) no permitidos: ${rotMalos.map((t) => `"${t}"`).join(", ")} — el estándar admite ¡VERIFICAR! · REINICIAR · SALIR (y el avance entre rondas es AUTOMÁTICO, §6)`);

  // ── §1.1 — indicador de Ronda (solo si el juego lo usa) ──
  if (/>\s*Ronda\s*</.test(game)) {
    check(has(game, "top: 52,"), "Ronda en top: 52",
      "el bloque `Ronda` va en `top: 52` (§1.1)");
    check(has(game, "width: 11, height: 11"), "Ronda con dots 11×11",
      "los dots de ronda son `width: 11, height: 11` (§1.1)");
  }

  // ── Mini-logos (64/64/56, alineado con edinun-language 2026-07-16) ──
  check(has(game, "EdinunLogoMini size={64}"), "Mini-logo HUD juego = 64",
    "se esperaba `EdinunLogoMini size={64}` en game-screens (igual que edinun-language)");
  check(has(screens, "EdinunLogoMini size={64}"), "Mini-logo CharacterScreen = 64",
    "se esperaba `EdinunLogoMini size={64}` en screens");
  check(has(game, "EdinunLogoMini size={56}"), "Mini-logo reporte = 56",
    "se esperaba `EdinunLogoMini size={56}` en el reporte imprimible (igual que edinun-language)");

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
