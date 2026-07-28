# CLAUDE.md — juego-6 (Estudios Sociales) · HUB DE 4 LIBROS

## Project

**juego-6 es un HUB de 4 libros** de Estudios Sociales, con un **menú de 2 niveles**:
Home muestra 4 botones de **LIBRO** (Libro 2 · Libro 3 · Libro 5 · Libro 6) y, al
tocar uno, se abre su pantalla de **TEMAS**. Cada libro tiene su propio número de temas:

| Libro | Temas | Estado |
|-------|-------|--------|
| Libro 2 | **1 tema** — "Reconociendo mi país" (6 años) | ✅ hecho |
| Libro 3 | **3 temas** — T1 "Hechos históricos" · T2 "Identidad territorial" · T3 "Viajando por mi país" (7) | ✅ los 3 |
| Libro 5 | **2 temas** — T1 "Región Interandina" (9) · T2 | 🟡 T1 ✅ · T2 ⏳ |
| Libro 6 | **1 tema** | ⏳ placeholder |

> Historial: juego-6 fue antes "Explora el Ecuador" (provincias del Ecuador). La autora
> pidió descartarlo y reconstruir juego-6 como este hub de libros (2026-07-23). El juego
> de provincias sigue en el historial de git.

En móvil el diseño es horizontal pero el dispositivo se sostiene vertical (overlay
bloqueante hasta rotar). **Preferencias del usuario:** `USER.md`.

## Arquitectura del menú (propio de juego-6, NO toca el shell)

El 2º nivel (Libro → temas) vive **dentro del route `home`** (estado interno de
`HomeScreen`), sin modificar `app.jsx` (que sigue enrutando `home → character → game →
results`). En `screens.jsx`:
- **`LIBROS`** = array `[{ id, label, temas:[{id,label}] }]`. Gradiente del botón por
  **posición** (1º naranja · 2º amarillo · 3º azul · 4º violeta).
- `HomeScreen` con estado `libroId`: nivel 1 = 4 botones de libro; nivel 2 = temas del
  libro (con "← Libros"). 1 tema → sin botones (nombre + ENTRAR directo); N temas →
  N botones + nombre + ENTRAR. Al entrar fija `currentCategory` (id del tema, p. ej.
  `l2-t1`) y `currentCatLabel` (`"Libro 2 · Reconociendo mi país"`).
- **`format-lint` ve 0 temas** (no hay literal `catLabel:` en `screens.jsx`; se usa
  `label`/`currentCatLabel`) → no exige la rejilla de un menú plano; los botones de
  libro/tema siguen el estándar a mano.

## game-screens.jsx

`GameScreen` **despacha por `app.currentCategory`**:
- `"l2-t1"` → **`ReconoceGame`** (Libro 2).
- `"l3-t1"` → **`VentanasGame`** (Libro 3 · Tema 1).
- `"l3-t2"` → **`TerritorioGame`** (Libro 3 · Tema 2, 3 rondas).
- `"l3-t3"` → **`ViajeGame`** (Libro 3 · Tema 3, 3 rondas).
- `"l5-t1"` → **`InterandinaGame`** (Libro 5 · Tema 1, 3 rondas).
- cualquier otro (l5-t2, l6-t1) → **`PlaceholderGame`**
  ("en construcción · {libro · tema}") — mismo chrome EDINUN, hasta implementar su juego.
- `ResultsScreen`/`PrintableReport` sirven a todos (log vacío en placeholder).

**`TemaPills`** (arriba, centro): en libros con **2+ temas**, `GameScreen` muestra pills
con los temas del libro (lee `LIBROS`, en scope del bundle) para **saltar entre temas sin
volver al Home** — al tocar abre `SwitchTemaModal` (confirmación, acción destructiva) y al
confirmar cambia `currentCategory`/`currentCatLabel` y re-despacha (el juego se remonta por
`key={currentCategory}`). El personaje/nombre se conservan. **Formato calcado de
`edinun-language/juego-2`**: chip oscuro `rgba(0,0,0,0.35)`; activo con el gradiente del
tema por posición (`GRAD_POS[i]`), borde blanco y glow; `top:16`, fontSize 11, padding
"5px 12px".

Al implementar un tema nuevo: crear su componente y añadir `if (currentCategory ===
"<id>") return <SuJuego/>;` en `GameScreen`. Guardar su design-doc en
`.planning/libro-N-design.md` y renombrar su `label` en `LIBROS`.

### Libro 2 · "Reconociendo mi país" (`ReconoceGame`, 6 años)

**Mira y toca** (patrón 5, molde del DEMO de la `_PLANTILLA`): 4 rondas del banco
`PREGUNTAS_L2` (10, del libro), 3 tarjetas (emoji + palabra), el niño **TOCA** la
correcta (sin VERIFICAR). Bocadillo **fijo** = CÓMO ("Toca la respuesta correcta."); no
cambia al responder. Acierto → verde + ⭐ + ¡EXCELENTE!; fallo → revela la correcta
(verde) dejando ver la tocada (roja) ~2 s, luego ¡UPS!, no resta. Anti-repetición FIFO
(`L2_RECENT_KEY`, cap 6) → recargar da preguntas nuevas (2+ partidas sin repetir).
**Emojis, sin imágenes** (decisión de la autora); las opciones se barajan por ronda.
Diseño en `.planning/libro-2-design.md`.

⚠ **Contenido del libro:** las respuestas correctas salen del TEMA 2 "Reconociendo mi
país" (país=Ecuador, capital=Quito, servicios básicos, quién ayuda). Los distractores
son contrastes obvios (no datos del libro). No añadir ítems sin material del libro.

### Libro 3 · Tema 1 · "Hechos históricos" (`VentanasGame`, 7 años)

**Ventanas del pasado (opción A, decisión de la autora):** el **nombre** del personaje es
el título; debajo, **su FOTO tapada por una cuadrícula 2×2 de ventanas**. 4 rondas, un
personaje por ronda. El niño **TOCA 1 de 3 áreas** (🎵🎨⚽🏛️📖). **Acierta →** se abren
las ventanas y **aparece su foto** (`revealed`) + overlay "{nombre} · área" + ⭐;
**falla →** se ve el área correcta en verde y **la foto NO se destapa** (no lo descubrió),
sin restar. Al terminar: **álbum** (`L3AlbumCard`) con las fotos que **sí** descubrió
(acertadas a color; falladas en gris con 🔒) → "la imagen se muestra si elijo bien".
Bocadillo fijo = CÓMO ("Toca su área. ¡Descubre su foto!"). Anti-repetición de personajes
FIFO (`L3_RECENT_KEY`, cap 6). Diseño en `.planning/libro-3-tema-1-design.md`.

**Fotos:** `L3Foto` / `L3AlbumCard` cargan `assets/pers-<slug>.(jpg|png|jpeg|webp)` y caen
al 👤 si falta. Personas reales → la autora pone las **fotos reales del libro**; NO se
generan caras con IA. Slugs: `jaramillo, gilbert, guayasamin, morejon, carapaz, alfaro,
ruminahui, heredia, montalvo`.

⚠ **Contenido del libro:** banco `PERSONAJES_L3` (9) con la **área textual del libro**
("ecuatorianos ejemplares" + "indaguemos más"); distractores = otras áreas. Eduardo
Kingman queda fuera a propósito (el libro lo etiqueta "arte" → mezclaría con "pintura").
`POSTALES_L3` queda **reservado** (bonus opcional de "juego perfecto"; prompts de imagen
ya entregados a la autora), NO usado en la mecánica A. **Verificado:** overflow 0 en 4
viewports; anti-repetición 0 solapes; e2e (acierto→foto→álbum→reporte) sin errores;
format-lint 15/15.

### Libro 3 · Tema 2 · "Identidad territorial" (`TerritorioGame`, 7 años)

**3 rondas encadenadas, cada una con una mecánica DISTINTA** (decisión de la autora),
orquestadas por `TerritorioGame` (chrome compartido + `onSolve` por ronda; avance
automático; reporte de 3 filas). Sub-componentes:

- **R1 `R1Region`** — "¿De qué región es {ítem}?" (ítem inline en el enunciado) **tocar 1
  de 4** (Costa/Sierra/Amazonía/Insular). La **imagen de la región se muestra grande y
  visible** (`L3Foto revealed` fijo; sin tapar/destapar — decisión de la autora), `prefix
  ="region"`, `region-<slug>.jpeg`, respaldo al emoji. Banco `L3T2_ITEMS` = ~23 ítems que
  refieren a cada región (platos + naturaleza/fauna), **ampliado y aprobado por la autora**.
- **R2 `R2Orden`** — ordena **EN VERTICAL** (⬆ más grande → ⬇ más pequeña) **ARRASTRANDO**
  (pointer events por Y, `data-slot`). Rota entre los **3 regímenes** (`L3T2_REGIMENES`:
  dependiente / autónomo / gobiernos autónomos); orden correcto Provincia›Cantón›Parroquia.
  Cada tarjeta muestra su nivel + handle ⠿. Al verificar: **✓** en su sitio, **✗** si está
  mal; al fallar se reordena al correcto (revela).
- **R3 `R3Provincias`** — **tocar varias**: 6 provincias (3 correctas + 3 distractoras) con
  marca **○** sin elegir / **●** elegido; toca las de la región pedida (`L3T2_PROVINCIAS`,
  rota Sierra/Costa/Amazonía). Al verificar: **✓** verde en las correctas (revela) / **✗**
  rojo en las mal elegidas.

El **¡VERIFICAR!** de R2/R3 vive en la **columna de acciones** (verde, arriba de
REINICIAR/SALIR; vía `verifyRef` + estado `busy`), NO en el centro — como
`edinun-language`. Al fallar, la respuesta correcta se ve **~1.8 s** antes del "¡UPS!".

Anti-repetición por ronda (`L3T2_R1/R2/R3_KEY`). **Imágenes de región** (4, las genera la
autora — paisajes SIN caras): `region-costa/sierra/amazonia/insular.jpg` en `assets/`.
Diseño en `.planning/libro-3-tema-2-design.md`. **Verificado:** overflow 0 en las 3 rondas;
arrastre de R2 mueve cartas; e2e (R1→R2→R3→reporte) sin errores; format-lint 15/15.

### Libro 3 · Tema 3 · "Viajando por mi país" (`ViajeGame`, 7 años)

**3 rondas encadenadas con mecánicas distintas**, y cada verbo es uno que el Tema 2 NO
usa (petición expresa de la autora: *"que sea diferente al tema dos"*). Del tema del
libro "Viajando por mi país con mi familia" (las 4 regiones naturales en detalle).

- **R1 `R1Memoria` — VOLTEAR.** Memoria de **8 cartas (4 parejas)**: cada pareja es un
  **lugar ↔ su región** (una pareja por región → sin cartas ambiguas). Patrón calcado de
  `juego-1` (`deck/flipped/matched` + lock, 460 ms al emparejar / 950 ms al fallar). **Al
  formar la pareja la carta de REGIÓN se destapa con la FOTO real** (`L3T3RegionFoto`
  reusa `assets/region-<slug>.jpeg` del Tema 2; respaldo al emoji). **⭐ +1 POR PAREJA**,
  sumada **al instante** (`onStar`) — no al final, o el contador no se movería.
- **R2 `R2Ruleta` — GIRAR.** `GIRAR` anima una ruleta SVG de 4 sectores con los **colores
  del libro** (Costa amarillo · Sierra café · Amazonía verde · Insular azul) y frena en la
  región sorteada (4 vueltas, 1,7 s). Luego el niño lleva a la **maleta 🧳** las 2 de 4
  tarjetas que sí son de ahí — **arrastrando o simplemente TOCANDO** (a los 7 años el
  arrastre falla; el tap hace lo mismo: `moved < 6px` = toque). Al verificar: ✓ verde en
  las bien metidas · ✗ rojo en las intrusas · **"faltó" ámbar** en las que dejó fuera
  (mismo lenguaje que R3 del Tema 2).
- **R3 `R3Mapa` — COLOCAR EN EL MAPA.** Los **límites del Ecuador** (del "Aplico" del
  libro). Alrededor del mapa se ven los vecinos como contexto (**Colombia** arriba ·
  **Perú** abajo y a la derecha · **océano Pacífico** a la izquierda) y el niño coloca los
  **4 puntos cardinales** en sus recuadros, **arrastrando o tocando** (tocar ficha → tocar
  recuadro; tocar un recuadro lleno la devuelve). ⚠ Se colocan los CARDINALES y no los
  límites **a propósito**: Perú es límite al Sur *y* al Este → dos fichas idénticas serían
  ambiguas. Al fallar: ✓/✗ y etiqueta dorada **"VA · NORTE"**. Mapa en
  `assets/mapa-ecuador.<ext>` (lo genera la autora); sin él cae a una placa "ECUADOR".
  **Sin banco:** el contenido es fijo; entre partidas solo cambia el orden de las fichas.
  (Esta ronda era "Arma la postal" —sílabas— y la autora la sustituyó a mitad de la
  construcción; la postal queda en el historial de git.)

**⭐ del tema: hasta 6** (4 de R1 + 1 de R2 + 1 de R3) → el reporte sale con **6 filas**.
`ViajeGame` lleva las ⭐ en `starsRef` (fuente de verdad) porque R1 las suma pareja a
pareja y `onSolve` solo añade las de R2/R3. `onSolve(isCorrect, entries, starsGained,
starsMsg)`: `entries` es un ARRAY (R1 manda 4 filas), y `starsMsg` es lo que anuncia el
cartel cuando las ⭐ ya se sumaron antes.

⚠ **Contenido del libro:** `L3T3_LUGARES` (32 ítems) = grandes ciudades, ríos, productos
agrícolas, nevados y fauna que el texto nombra en cada región; `L3T3_CARDINALES` = los
límites del Ecuador. **No añadir ítems sin material del libro.** Anti-repetición en R1 y R2
(`L3T3_R1/R2_KEY`, sobre el FIFO genérico `l3t2Recent/Push`); R3 no la lleva (contenido fijo).

**El tema se juega SIN NINGUNA IMAGEN** (decisión de la autora): las fichas van con nombre
y, cuando aporta, emoji. Regla `l3t3Generico`: los emojis **compartidos por varios ítems**
(🏙️ todas las ciudades · 🌊 los ríos · 🏔️ los nevados · 🏖️) **no se dibujan** — Quito y
Riobamba salían idénticos — y en su lugar el **nombre va grande** (17 px en R1 / 16 px en
R2). El emoji solo se mantiene cuando es único del ítem (🐆 jaguar, 🐢 tortuga, 🦅 cóndor,
🍌 banano…), porque ahí sí informa. Las 4 cartas de REGIÓN conservan su emoji + color del
libro (son 4 distintos). Si algún día llegan las fotos, la foto gana sobre todo esto.

**Fotos, todas opcionales** (`L3T3Foto` prueba una cadena de candidatos y cae al emoji o a
nada, así que el juego se ve completo aunque falten — hoy no hay ninguna). ⚠ **Este tema NO reusa assets del Tema 2** —
decisión de la autora (*"aquí no debes usar las imágenes del tema 2"*): cada tema lleva su
propio arte o el niño ve la misma foto dos veces. Regiones **`t3-region-<slug>.jpg`** (4,
propias de este tema; el Tema 2 sigue con `region-<slug>`) · lugares
**`lugar-<slug>.jpg`** (16, las genera la autora: `guayaquil, rio-guayas,
banano, delfines, chimborazo, cotopaxi, quito, condor, puyo, nueva-loja, jaguar, selva,
galapagos, tortuga, pinguino, lobos`; **cuadradas 1:1**, sin texto ni rostros) · mapa
`mapa-ecuador.<ext>`. El `slug` de cada lugar vive en `L3T3_LUGARES`; sin `slug`, emoji.
Diseño en `.planning/libro-3-tema-3-design.md`. **Verificado** (4 viewports): overflow 0 y
colchón ≥60 px en las 3 rondas; e2e acierto (6/6, 6 ⭐, 100 %) y e2e fallo; el ⭐ del HUD
sube con cada pareja; R1 sin solapes en 3 recargas; R2 rota las 4 regiones; format-lint 15/15.

> El `qa-visual.js` genérico **no sirve para juego-6**: espera el `input.ed-input` en el
> Home y aquí hay menú de 2 niveles (Libro → tema). Hay que guiarlo a mano (Libro 3 → tema
> → nombre → ENTRAR → ¡VAMOS!) y acotar los clics de prueba a la **zona central** por
> geometría — arriba están las `TemaPills`, que si no se acotan reciben el clic y abren el
> modal de cambio de tema.

### Libro 5 · Tema 1 · "Región Interandina" (`InterandinaGame`, 9 años)

**3 rondas encadenadas con mecánicas distintas** del tema del libro *"Provincias de la
región Interandina"* (las 10 provincias de la Sierra, norte→sur). Orquestadas por
`InterandinaGame` (mismo chrome que `TerritorioGame`: `onSolve` por ronda, ¡VERIFICAR! en
acciones vía `verifyRef`+`busy`, overlay con **+1 ⭐**, reporte de 3 filas). Personaje por
defecto **Andi**. Sub-componentes:

- **R1 `PR1Provincia` — TOCAR 1 de 4.** "¿De qué provincia es {lugar}?": tarjeta central
  con **emoji + nombre del lugar/atractivo** y 4 botones de provincia (la correcta + 3
  distractoras). Marca ✓/✗ al tocar. Banco `L5_LUGARES` (26 lugares ÚNICOS por provincia,
  textuales del libro).
- **R2 `PR2OrdenNS` — ARRASTRAR de NORTE a SUR.** Reusa el arrastre en vivo de `R2Orden`
  (slotCenters, live-reorder) y su **feedback "AQUÍ VA · {correcta}"** al fallar (columna
  se corre a la izquierda, pastilla dorada al lado de cada tarjeta mal ubicada). 3
  provincias por ronda, orden correcto = índice en `L5_ORDEN_NS` (el orden textual del
  libro). Reusa `L3T2_CARD_COLORS`.
- **R3 `PR3Empareja` — EMPAREJAR pueblo↔provincia.** Dos columnas; **toca un pueblo, toca
  su provincia** → se enlazan con **color + número** (`L5_PAIR_COLORS`). ¡VERIFICAR!: ✓/✗
  por pueblo y, en los fallados, se revela **"va con {provincia}"** en dorado. Banco
  `L5_PUEBLOS` (7 pueblos/nacionalidades del libro; **se excluye "Cañari"** porque el libro
  lo asigna a Cañar Y Azuay → sería ambiguo emparejar).

Anti-repetición por ronda (`L5_R1/R2/R3_KEY`, sobre el FIFO genérico `l3t2Recent/Push`).
**Solo emoji, SIN imágenes** (decisión de la autora, 2026-07-28: *"no debo generar
imágenes"*) — no se añaden fotos. Diseño en
`.planning/libro-5-tema-1-design.md`. ⚠ El libro trae el Chimborazo con **dos alturas
distintas** (6263 y 6310 m) → **no se usa la altura exacta** como respuesta. **Verificado:**
overflow 0 en las 3 rondas; e2e (R1→R2→R3→reporte) sin errores; anti-repetición 0
repeticiones consecutivas; format-lint 15/15.

## Personajes

Elenco compartido (domi/sisa/yaku/andi). El jugador elige guía en CharacterScreen, que
**preselecciona el personaje por defecto de cada libro** (`LIBRO_CHAR` en `screens.jsx`):
Libro 2 → **Yaku**, Libro 3 → **Sisa**, Libro 5 → **Andi**, Libro 6 → **Domi**. Usa el
`app.libro` que fija HomeScreen al entrar; el niño puede cambiarlo. (Elección de la autora.)

## Contador de visitas

`counter.php` idéntico a los demás; cae a `localStorage` sin PHP. `visits.txt`
gitignoreado — borrarlo antes de subir a producción.

## QA

```bash
node juegos/_PLANTILLA/.planning/format-lint.js juego-6   # 15/15 OK (con un juego real)
node juegos/_PLANTILLA/.planning/qa-visual.js  juego-6    # 6 viewports, sin overflow
```
Empaquetar tras editar `.jsx`: `node .planning/bundle.js` (ambos HTML idénticos).
Cada juego con banco: probar anti-repetición recargando (0 solapes).

> **Landing:** el card de juego-6 muestra un título/charId placeholder hasta definir el
> título global del hub con la autora.
