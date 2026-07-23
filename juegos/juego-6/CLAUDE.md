# CLAUDE.md — juego-6 "Explora el Ecuador" (Estudios Sociales)

## Project

**Juego: "Explora el Ecuador"** (título global elegido por la autora, 2026-07-23).
El **tema** que se estudia sigue siendo *"Provincias del Ecuador"* (así aparece en el
reporte y en `CAT_LABEL`). Carpeta autocontenida del repo multi-juego
`edinun-sociales`. **Reconstrucción del
juego viejo de `edinun.com/juegos/ProvinciasEcuador`** (Construct 2, mecánica "Simón
dice" de memoria) en el motor EDINUN: en vez de memorizar una secuencia de colores,
el niño **aprende a ubicar e identificar** las 24 provincias. Diseño en
`.planning/juego-6-design.md`. Bitácora en `MEMORY.md`.

**Nivel único** (una sola temática) → Home **sin botones de tema** (solo nombre +
ENTRAR); el HUD del juego usa el indicador de **RONDA con 5 dots**. Personaje guía:
**Yaku** (Oriente). **Audiencia 7-10** (registrada en `memory/audiencia_por_juego.md`).

La sesión son **5 rondas encadenadas en 2 fases** (`ProvinciasGame` orquesta), con un
único reporte al final:

- **Fase 1 — "Ubica en el mapa"** (rondas 1-2): el enunciado nombra una provincia
  (`¿Dónde está X?`) y el niño la **TOCA** en el mapa SVG. **Validación al tocar**
  (sin VERIFICAR). Sesgo a provincias **grandes** (top-14 por área, sin Galápagos)
  para que sea justo a los 7. Acierto → provincia verde + ✓ + **+1 ⭐**; fallo →
  resalta la correcta (verde) dejando ver la que tocó (roja) ~2 s, avanza; no resta.
- **Fase 2 — "Trivia del mapa"** (rondas 3-5): el mapa **ilumina** una provincia
  (fill amarillo + glow) y el niño toca su nombre entre **4 opciones A/B/C/D**
  (correcta + 3 distractores reales al azar). **Racha 🔥 + puntos 🏆**
  (`pts = 100 + (racha-1)*20`), **sin cronómetro** de presión. Acierto → +1 ⭐;
  fallo → corta la racha, resalta la correcta, avanza.

En móvil el diseño es horizontal pero el dispositivo se sostiene vertical: el usuario
gira físicamente el teléfono (overlay bloqueante hasta rotar).

- **Preferencias del usuario** (usabilidad, QA responsive, invariantes): `USER.md`.

## Running / deploying

No build system, no package manager. HTML estático que carga React 18 + Babel
Standalone desde unpkg.

- **Abrir local:** doble clic en `index.html`.
- **Servir local:** servidor estático desde la raíz del repo (esta máquina no tiene
  Python real ni PHP; usar Node).
- **Contador PHP real:** requiere PHP (`php -S localhost:8000`); sin PHP cae a
  `localStorage` (lo normal en local; el error `counter.php` en `file://` es esperado).

## Architecture

Mismo shell que los demás juegos. Los 5 `.jsx` (`logo`, `characters`, `screens`,
`game-screens`, `app`) son la fuente editable. Tras editar, re-empaquetar:

```bash
node .planning/bundle.js        # (o bundle.ps1 / bundle.py)
```
Verificar que ambos HTML (`index.html` == `EDINUN GAMES.html`) quedan idénticos.

Invariantes:
- **No incluir `</script>` literal en ningún `.jsx`** (partir el token si hace falta).
- **El bundle reescribe desde `<script type="text/babel">` hasta `</html>`**.

### Contrato del shell

- `app.jsx` enruta por estado: `home → character → game → results`. No tocar (shell
  compartido). Su estado inicial fija `character: "domi"`; la CharacterScreen de este
  juego **preselecciona Yaku** (`screens.jsx`) por ser el guía destacado.
- `screens.jsx`: `HomeScreen` (sin chips — nivel único), `CharacterScreen` (categoría
  fija `provincias` / catLabel `Provincias del Ecuador`), contador, `CosmosBg` con
  **glifos de geografía** (🗺️ 🧭 📍 ⛰️ 🌊 🌴 🐢 🏔️ 🌎 🌋 🏞️). **No hay `LEVELS_CFG`**
  (0 temas → format-lint no exige rejilla de botones).
- `game-screens.jsx`: **la mecánica.** `GameScreen` → `<ProvinciasGame/>` (única).
  `ResultsScreen`/`PrintableReport` (con badges 🏆 puntos / 🔥 racha máx, como juego-5).

### El mapa (`const ECU_MAP`)

24 provincias como **paths SVG embebidos inline** (~50 KB) — geoBoundaries ADM1
simplificado (**CC BY 4.0**, atribución en `assets/MAPA-FUENTE.txt`). Se generó con
`scratchpad/gen-map.js` (proyección equirectangular del continente + **Galápagos en
recuadro/inset**) y se inyectó con `scratchpad/inject-map.js` entre los marcadores
`/*__MAP__*/ … /*__MAP_END__*/`. Cada provincia: `{ id, name, d, fill, gala, area }`.
- El **resalte pinta el propio `<path>`** (no un punto/círculo) → siempre cae dentro
  de la provincia, incluso en las cóncavas (Guayas, Esmeraldas).
- **Colores:** paleta de 6, asignada a mano en `COLOR_BY_SLUG` para que **ninguna
  vecina comparta color**. **NO representan regiones** (evita afirmar contenido no
  verificado).
- Cada `<path>` lleva `data-prov={id}` y `aria-label={name}` (tests + accesibilidad).

### Anti-repetición

FIFO en `localStorage` (`RECENT_KEY = edinun_juego6_provincias_recientes_v1`, cap 12):
las 5 provincias de la partida (2 ubicar + 3 trivia) **no se repiten al recargar**.
`buildSession()` usa `pickFresh` (fresh-first).

### Personajes

Catálogo compartido (regiones del Ecuador): Domi (Costa), Sisa (Sierra), Yaku
(Oriente), Andi (cóndor tricolor). **Destacado: `yaku`.** Arte en `assets/char-yaku.png`.

Reglas EDINUN que la mecánica respeta:
- **Enunciado = QUÉ** (`¿Dónde está X?` / `¿Qué provincia está iluminada?`);
  **bocadillo de Yaku = CÓMO** (`Toca la provincia en el mapa.` / `Toca la respuesta
  correcta.`) — **fijos**, no cambian al responder (el feedback va en el overlay).
- Fallar no baja el progreso; al fallar se revela la correcta dejando ver lo del niño.
- Salir/reiniciar siempre con modal. `markFirstAttempt()` en la 1ª respuesta;
  `incrementGamesCompleted()` + `go("results")` al terminar.

⚠ **Contenido:** los nombres y contornos de las 24 provincias son datos reales
(geoBoundaries + libro). No se inventa nada. La trivia toma la correcta del mapa y 3
distractores = otras provincias reales.

## Contador de visitas

`counter.php` (idéntico en todos los juegos) cuenta visitas globales; cae a
`localStorage` sin PHP. No personalizar. `visits.txt` gitignoreado — borrarlo antes
de subir a producción.

## QA

```bash
node juegos/_PLANTILLA/.planning/format-lint.js juego-6   # valores fijos (15/15 OK)
node juegos/_PLANTILLA/.planning/qa-visual.js  juego-6    # 6 viewports, sin overflow
```
Smoke/e2e con Playwright: entra → 2 ubica + 3 trivia → `reachedResults`; anti-
repetición al recargar (0 solapes).
