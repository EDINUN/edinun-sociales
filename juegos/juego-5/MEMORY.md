# MEMORY.md — Bitácora de juego-5 (Tema "Aprendiendo")

## 2026-07-16 — Creación desde `_PLANTILLA`

- Clonado de `juegos/_PLANTILLA/`. Diseño en `.planning/juego-5-design.md`
  (aprobado por la autora el mismo día).
- **Tema:** las personas que trabajan en la escuela — TEMA 3 del libro
  ("Aprendiendo con mis compañeros y compañeras de clase"). **Audiencia 6.**
  Guía: **Domi**.
- **Mecánica:** "Mira y toca" (patrón 5) con **tarjetas de dibujo**: pregunta
  "¿Quién…?" + 3 tarjetas (imagen + nombre); el niño toca a la persona.
  **3 rondas** (pedido de la autora; la plantilla traía 4). Elegida por la autora
  entre 3 opciones (descartó "unir columnas" y "el semáforo del peatón").
- **Banco de 12 personas**: 6 del libro (director/a, secretaria, docente,
  conserje, guardián, cocinera) + 6 propuestas aprobadas por la autora
  (bibliotecario, inspectora, enfermero, psicóloga, chofer, jardinera). La autora
  pidió explícitamente **solo preguntas tipo "¿Quién…?"** y un banco variado
  ("quiero que tenga más opciones, más variedad"). Distractores: 2 al azar del
  mismo banco. Anti-repetición FIFO 6 → 4 partidas sin repetir.
- **Imágenes:** 12 PNG (`assets/persona-<id>.png`) los genera la autora — los 12
  prompts se le entregaron en el chat (estilo 3D cartoon, mini-escena, sin texto,
  sin marcas). Mientras no existan, la tarjeta cae al **emoji placeholder**
  (`PersonaImg` con `onError`): se enchufan copiando los archivos, sin tocar código.
- Ronda movida a `top:52` (la plantilla traía `top:20`, fuera del estándar §1.1).
- QA: format-lint 15/15 · qa-visual sin overflow en los 6 viewports.

## 2026-07-16 — Llegaron las 12 imágenes (y optimización)

- La autora generó las 12 escenas (2816×1536, ~6.5 MB c/u = ~78 MB: inviable para
  web escolar). Se optimizaron a **512 px de alto · JPEG q85** (~100 KB c/u,
  ~1.2 MB total) y el código pasó de `.png` a **`.jpg`**.
- El área de imagen de la tarjeta se hizo **apaisada** (tarjeta 150×152) porque
  las escenas son horizontales; recortes verificados con hoja de contactos de
  las 12: todas reconocibles, géneros = rótulos.
- ⚠ 1ª tanda salió **horizontal** (2816×1536) porque los prompts NO pedían
  formato → hubo que apaisar la tarjeta y recortar. La autora: *"¿por qué no me
  dijiste para generarlas cuadradas?"*. **Aprendizaje → regla #17 de la skill**
  (especificar formato en el prompt según el contenedor).
- **2ª tanda (definitiva): 12 imágenes CUADRADAS 2048×2048**, con prompts que
  agregan `square image, 1:1 aspect ratio` + `main character large and centered`.
  Se corrigieron los 2 flojos: `guardian` sin el texto "SCHOOL"; `inspectora` en
  primer plano. `chofer` regenerado 3 veces hasta lograr "sentado al volante
  recogiendo a los estudiantes" (el 1º salió desproporcionado, bus gigante).
- Optimizadas a **640×640 JPEG q85** (~90 KB c/u) → tarjeta vuelta a CUADRADA
  (156×194). QA: lint 15/15 · qa-visual sin overflow · hoja de contactos: las 12
  reconocibles y géneros = rótulos.

## 2026-07-16 — Título global + registro en el landing

- **Título global elegido por la autora: "Aprendiendo"** (Home: "EDINUN ·
  Aprendiendo"). Descripción del Home = **"Aprendiendo con mis compañeros y
  compañeras de clase."** (el título del TEMA 3 del libro).
- `<title>` de ambos HTML → "EDINUN GAMES — Aprendiendo".
- **Registrado en el landing** (`GAMES` del index.html raíz): 5ª card, Domi.

## 2026-07-16 — Tema 2 "Medios de transporte" + migración a multi-tema

- El juego pasó de 1 tema a **chips (2 temas)**, patrón juego-4. `LEVELS_CFG` en
  `screens.jsx`; Home con chips; `CharacterScreen` mapea `app.level`→category;
  `game-screens.jsx` gana `TemaChipsBar` + `GameScreen` despachador.
- **Chip del Tema 1: "Aprendiendo"** (decisión de la autora). Nota: primero se probó
  "Mi escuela" para no chocar con el título del juego, pero la autora prefirió que el
  chip diga "Aprendiendo". El **título global** queda pendiente: se pondrá **al final**,
  cuando estén configurados todos los temas/juegos (hoy el Home usa "Aprendiendo" como
  placeholder). `catLabel` (campo Tema del reporte) = "Aprendiendo".
- **Tema 2 "Medios de transporte"** (TEMA 3 del libro de transporte, 6 años):
  elegido por la autora entre 3 mecánicas (descartó tap-quiz y semáforo). Mecánica
  **clasificar arrastrando** 4 transportes a 🛣️/🌊/☁️, **3 rondas**, banco 16.
  Chip "Medios de transporte", descripción "Nuestros medios de transporte:
  cooperamos y estamos seguros." (título del libro).
- **Sin imágenes generadas**: los transportes usan **emojis** (🚗🚌🚂✈️🚁⛵🛶…),
  que se leen claros y quedan consistentes → la autora no generó nada. (A diferencia
  del Tema 1, donde las personas como emoji se veían pobres y sí valió generarlas.)
- Verificado con Playwright: arrastrar las 4 tarjetas + VERIFICAR + revelación ➜ ✓,
  cambio entre chips ✓, Tema 1 intacto ✓. Lint 19/19 (2 temas), qa-visual sin overflow.

## 2026-07-22 — Tema 3 "Economía" (3 rondas encadenadas, edad 8)

- Del **TEMA 2 del libro** "Economía y transporte en nuestro país". El transporte
  ya lo cubre el Tema 2, así que el Tema 3 se centró en la **economía**.
- **Edad 8** (¡distinta a los otros dos temas, que son 6!). El Home funciona como
  menú de temas del libro, cada estudiante entra al suyo (igual que juego-4).
- Chip **"Economía"** · descripción **"Economía y transporte en nuestro país."**
  (elegidas por la autora). Gradiente 3º = **azul** (`#7ab8ff→#2773d8`).
- **Diseño: 3 rondas encadenadas, cada una mecánica DISTINTA** (pedido explícito de
  la autora: "cada ronda debe ser diferente"). La autora eligió cada mecánica de
  entre 3 opciones con bosquejo:
  - **R1 · Sectores** (`SectoresRound`): quiz "¿a qué sector pertenece?" — 1 actividad
    (emoji) + **4 botones de sector** (primario/secundario/terciario/cuaternario),
    tocar 1. **5 preguntas** (1 garantizada por sector + 1 extra). Los 4 sectores
    (no 3): decisión de la autora. Banco de 15 actividades del diagrama del libro.
  - **R2 · Servicios** (`ServiciosRound`): **multi-selección** — vitrina de **6 cosas**
    (bienes+servicios), toca **todos los servicios** + ¡LISTO!. El enunciado dice
    cuántos hay (2–4). Banco de 16 (8 servicios / 8 bienes). Gesto nuevo en el repo.
  - **R3 · Cadena** (`CadenaRound`): **ordenar arrastrando** — 3 cartas a huecos
    **1·2·3** (naturaleza→transforma→vende) + ¡VERIFICAR!, molde de `TransporteGame`.
    **CON IMÁGENES** (`assets/cadena-<slug>-<n>.jpg`, n=1/2/3) + emoji de respaldo
    (`CadenaImg` con `onError`). Banco de **6 productos**: café/queso/ropa/pan/
    mueble/jugo (la autora cambió chocolate→jugo de naranja: chocolate quedaba
    "gemelo" del café). Los 18 prompts (cuadrados) se le entregaron a la autora;
    aún los está generando (por eso hoy corre con emoji).
- **Arquitectura:** `EconomiaGame` orquesta las fases (0/1/2), acumula ⭐ + `log` y
  hace `go("results")` al terminar la R3. `EcoFrame` centraliza el chrome (HUD con
  RONDA de 3 etapas, personaje+bocadillo, acciones, overlay, modales). REINICIAR
  reinicia **todo el tema** desde la R1. Reporte único con las 3 rondas (14 filas =
  5+6+3). Despachador `GameScreen`: `currentCategory==="economia"` → `<EconomiaGame/>`.
- **Anti-repetición FIFO por ronda** (3 keys `localStorage`): recargar da otros
  ejercicios (pedido de la autora: "recargo y no me deben salir los mismos").
- **Contenido del libro** (regla dura): sectores + sus ejemplos, bienes/servicios y
  el flujo por sectores son del libro; los ejemplos de relleno (leche, pelota) y los
  productos de la cadena (café, queso…) los elegí dentro de las categorías del libro
  (ajustables con la autora).
- QA: bundle ✓ (HTML idénticos) · **format-lint 19/19** (3 temas, grid `"1fr 1fr 1fr"`) ·
  qa-visual sin overflow · **Playwright end-to-end**: Home→Economía→personaje→R1(5)→
  R2(LISTO)→R3(arrastrar+VERIFICAR)→reporte 14/14, sin errores JS (solo counter.php
  bajo file:// y los 3 `cadena-*.jpg` faltantes → emoji, ambos esperados).

## 2026-07-22 (tarde) — Juego COMPLETO: 4 temas + título + ajustes finos

Sesión larga que dejó el juego terminado. Cambios clave:

- **Tema 3 "Economía" — ajustes de la autora sobre el diseño inicial:**
  - **R1 Sectores → 1 sola pregunta** (era 5). "Cada ronda = 1 jugada, como R2 y R3".
    `ecoBuildQuiz` robusto para cualquier `ECO_Q` (si <4, sortea directo).
  - **R2 Servicios → DESLIZAR cartas** (era multi-selección "toca todos"). La autora
    notó que R1 y R2 eran ambas "tocar" → se rediseñó R2 como *swipe* izq/der a
    zonas **📦 Bien / 🛎️ Servicio** (`SW_ZONES`), **3 cartas** por partida. Así los
    3 gestos son distintos: **tocar (R1) · deslizar (R2) · arrastrar-ordenar (R3)**.
  - **Bocadillos FIJOS** (regla reforzada [[enunciado-que-bocadillo-como]]): el
    bocadillo se queda con el CÓMO, NO cambia a "¡Muy bien!/¡Casi!" al responder (eso
    va en el overlay). Corregido en las 3 rondas de Economía **y en el Tema 1**.
  - Enunciado = QUÉ, sin el verbo de manipulación. R2: enunciado "¿Es un bien o un
    servicio?" + bocadillo "Desliza la carta al lado correcto."
  - **18 imágenes de la R3 ENTREGADAS** (chocolate→jugo de naranja) y optimizadas.
  - Bordes de las zonas de arrastre más brillantes/gruesos (el verde se perdía en el
    fondo verde); aviso **"✅ ¡Todo en su lugar!"** al completar.

- **Tema 2 "Medios de transporte" — de 3 rondas idénticas a 1 tablero completo:**
  La autora: "las 3 rondas hacen lo mismo, aburre". Para 6 años NO conviene 3
  mecánicas distintas → se dejó **1 sola ronda** con **6 transportes (2 por vía)**.
  Bandeja en **2 filas de 3 alineadas con los cajones** (`T_TRAY_COLS`/`ROWS`), **sin
  nombres** (emoji grande), fondo de tarjeta más apagado (menos brillo), cajones un
  poco más abajo, transportes **centrados en el cajón** (se corrigió el `+58`→centro),
  indicador de ronda oculto (1 ronda), aviso "¡Todo en su lugar!". Se agregó
  **🚡 Teleférico** al banco de aire (más variedad).

- **Tema 4 "Transporte y movilidad" NUEVO (edad 13) — "Trivia Rush":**
  Del TEMA 4 del libro. **Opción múltiple tipo Kahoot** (`TriviaGame`): pregunta +
  **4 opciones A/B/C/D** (tiles medianos 2×2), **cronómetro + RACHA 🔥 + puntos**.
  **4 preguntas** por partida de un banco de **18** (`PREGUNTAS_MOV`, `TRIVIA_K`,
  memoria 10). La correcta sale del libro; los distractores son opciones plausibles.
  Chip **"Movilidad"** (corto, para que quepan 4), gradiente 4º **violeta**
  (`#b48aff→#6f3fe0`). Reporte estándar + badges 🏆 pts / 🔥 racha máx. Despachador:
  `currentCategory==="movilidad"` → `<TriviaGame/>`.

- **Título global elegido: "Nuestra sociedad en movimiento"** (engloba los 4 temas).
  Aplicado en: label del Home ("EDINUN · Nuestra sociedad en movimiento"), `<title>`
  de ambos HTML, y el card del landing (`GAMES` en `index.html` raíz).

- **Glifos del `CosmosBg` rebalanceados a los 4 temas**: 🏫📚✏️🍎 (escuela) ·
  🚌✈️⛵🚗 (transporte) · 💰🏦🛒 (economía) · 🚦 (movilidad) · 🤝🌎⭐ (sociales).

- **Home con 4 chips → grid 2×2** (`"1fr 1fr"`), como la **referencia
  edinun-language/juego-4** (no una fila de 4). Se actualizó `format-lint.js`
  (`GRID_BY_TEMAS[4] = '"1fr 1fr"'`).

- **Anti-repetición verificada al RECARGAR en los 4 temas** (Playwright, test
  `test-norepeat-all`): reload → re-entrar → los ejercicios cambian. `OK: true` en
  T1/T2/T3-R1/T4. Bancos/memoria: T1 12/mem6 · T2 17/mem8 · T3 R1 15/mem7·R2 16/mem8·
  R3 6/mem5 · T4 18/mem10.

## Pendiente / Estado

- ✅ **Juego COMPLETO** (4 temas + título + glifos). Registrado en el landing como
  "Nuestra sociedad en movimiento".
- 🔸 **Opcionales** (decisión de la autora, no bloquean): chip del Tema 4 dice
  "Movilidad" (¿o "Transporte y movilidad"?); color de fondo de las tarjetas del
  Tema 2 quedó apagado (`#fbf2d6→#efdcaa`, menos brillo) — se puede revertir.
- Para producción: borrar `visits.txt` si existe (gitignoreado).
