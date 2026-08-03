# CLAUDE.md — juego-6 (Estudios Sociales) · HUB DE 4 LIBROS

## Project

**juego-6 es un HUB de 4 libros** de Estudios Sociales, con un **menú de 2 niveles**:
Home muestra 4 botones de **LIBRO** (Libro 2 · Libro 3 · Libro 5 · Libro 6) y, al
tocar uno, se abre su pantalla de **TEMAS**. Cada libro tiene su propio número de temas:

| Libro | Temas | Estado |
|-------|-------|--------|
| Libro 2 | **1 tema** — "Reconociendo mi país" (6 años) | ✅ hecho |
| Libro 3 | **3 temas** — T1 "Hechos históricos" · T2 "Identidad territorial" · T3 "Viajando por mi país" (7) | ✅ los 3 |
| Libro 5 | **2 temas** — T1 "Región Interandina" · T2 "La región amazónica" (9) | ✅ los 2 |
| Libro 6 | **1 tema** — "La Amazonía, nido de vida silvestre" (10) | ✅ hecho |

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
- `"l5-t2"` → **`AmazoniaGame`** (Libro 5 · Tema 2, 3 rondas).
- `"l6-t1"` → **`SilvestreGame`** (Libro 6 · Tema 1, 3 rondas).
- cualquier otro → **`PlaceholderGame`** ("en construcción · {libro · tema}") — mismo
  chrome EDINUN. **Hoy ya no lo usa ningún tema**: los 7 están implementados.
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
  recuadro; tocar un recuadro lleno la devuelve). El soltado es **tolerante**
  (`slotCercano`: vale el recuadro más cercano dentro de 0,62 × su ancho, medido al borde),
  el destino **se ilumina en dorado** mientras arrastra, y si suelta lejos la ficha queda
  **elegida** en vez de perderse. ⚠ No volver al hit-test estricto: a 7 años el cursor casi
  nunca cae dentro de un recuadro de 96×42 y el juego parecía no responder. ⚠ Se colocan los CARDINALES y no los
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
- **R3 `PR3Empareja` — EMPAREJAR vestimenta↔pueblo.** Izquierda: **fotos reales del traje
  típico** (`assets/l5-pueblo-<slug>.jpg`); derecha: el **nombre del pueblo + su provincia**
  como etiqueta (dato del libro, no se pierde). **Toca un traje, toca su pueblo** → se
  enlazan con una **línea curva + color** (`L5_PAIR_COLORS`): la línea sale de un puntito
  en el borde de cada tarjeta y el borde toma el color de la pareja. **Sin número de
  pareja** (decisión de la autora: *"si ya ponemos las líneas de unir entonces quitemos
  los números"* — el número era la redundancia de cuando no había línea).
  ¡VERIFICAR!: ✓/✗ por traje y, en los fallados, se revela el pueblo correcto en dorado.
  ⚠ La tarjeta de traje **no lleva `overflow:hidden`** (el recorte va en un `<span>` con la
  foto): con el recorte en el botón se cortaban el ✓/✗ y la etiqueta dorada del pueblo
  correcto, o sea que al fallar NO se leía la respuesta buena. Banco `L5_PUEBLOS` (7 del libro; la R3
  SOLO usa los que tienen `vest: true` = con foto de traje → muestra 3 por ronda). Fotos
  **REALES, NO IA** (la ropa tradicional es de culturas reales; generarla sería inexacto).
  Subidas (4): `otavalo, saraguro, salasaka, cayambi`. **"Cañari" queda fuera** (el libro lo
  asigna a Cañar Y Azuay → ambiguo).

Anti-repetición por ronda (`L5_R1/R2/R3_KEY`, sobre el FIFO genérico `l3t2Recent/Push`).
**R1 con FOTOS REALES opcionales** (`L5Foto` prueba `assets/l5-<slug>.(jpg|png|jpeg|webp)`
y cae al emoji si falta; prefijo `l5-` propio, NO reusa `lugar-<slug>` del Tema 3). Las
fotos **NO se generan con IA** (decisión de la autora): salen de las **fotos del propio
libro** (EDINUN) + **Wikimedia Commons** (licencia libre). Subidas (11 → **las 10
provincias tienen al menos una foto**): `quilotoa, otavalo, mitad-del-mundo, ingapirca,
cuenca, vilcabamba, banos, bosque-polylepis, colta, salinas, el-cisne`. **La R1 SOLO
pregunta por los lugares con `foto: true`** (decisión de la autora: que SIEMPRE salga
imagen, nunca emoji) — los 15 lugares sin foto no entran a la R1. ➜ Al subir una foto
nueva, marcar ese lugar con `foto: true` en `L5_LUGARES` para que entre. ⚠ Nombrar en
**minúscula** (`.jpg`, no `.JPG`) — producción es Linux y distingue mayúsculas. Diseño en `.planning/libro-5-tema-1-design.md`. ⚠ El libro trae el Chimborazo con **dos alturas
distintas** (6263 y 6310 m) → **no se usa la altura exacta** como respuesta. **Verificado:**
overflow 0 en las 3 rondas; e2e (R1→R2→R3→reporte) sin errores; anti-repetición 0
repeticiones consecutivas; format-lint 15/15.

### Libro 5 · Tema 2 · "La región amazónica" (`AmazoniaGame`, 9 años)

**3 rondas encadenadas con mecánicas DISTINTAS y frescas** del tema del libro *"La región
amazónica"* (las 6 provincias del Oriente). Orquestadas por `AmazoniaGame`, que usa un
**arreglo `L5T2_ROUNDS`** de `{ C, verify, bubble, erase }` (`TOTAL = ROUNDS.length`) — así
el tema pudo crecer de 1 a 3 rondas sin refactor. Mismo chrome que `InterandinaGame`. Guía
por defecto **Andi**. **La autora eligió cada mecánica viendo bocetos ASCII en el chat,
ronda por ronda.** Enunciado estandarizado en las 3 (fontSize 22, `paddingTop` bajo la
fila RONDA). Sub-componentes (orden real de `L5T2_ROUNDS`):

- **R1 `PR3Palabra` — ARMAR LA PALABRA, CON DIFICULTAD.** "¿Cuál es la capital de
  {provincia}?": ordena las letras en las casillas para escribir la capital + ¡VERIFICAR!.
  **Dificultad:** la bandeja trae las letras de la capital **+ 3 letras señuelo** barajadas;
  hay que elegir las correctas y ponerlas en orden. Tocar una ficha la pone en la siguiente
  casilla; tocar una casilla llena devuelve la letra. **BORRAR** (última letra puesta) vive
  en la **columna de acciones** (`ed-btn-erase`, vía `eraseRef` — como en edinun-language),
  NO en el centro. Banco `L5T2_CAPITALES` (5 capitales de UNA palabra:
  TENA/PUYO/MACAS/ZAMORA/COCA; Sucumbíos/Nueva Loja queda fuera por ser dos palabras).
  Al fallar: casillas ✓/✗ + pastilla dorada "Va: {palabra}". Anti-repetición `L5T2_R3_KEY`
  **cap 4** → recorre las 5 capitales antes de repetir ninguna.
- **R2 `PR2Lupa` — EXPLORAR CON LA LUPA sobre una IMAGEN REAL de la selva.** Fondo
  `assets/l5t2-selva.png` (la genera la autora — paisaje amazónico, sin caras); encima, una
  capa oscura con **máscara radial** que hace de lupa y **sigue el puntero**
  (`onPointerMove`, coords en px lógicos dividiendo por la escala del lienzo). El niño busca
  y **toca** el animal pedido (enunciado = QUÉ: "Encuentra {tesoro}"; bocadillo = CÓMO:
  "Mueve la lupa por la selva."). Hotspots **fraccionales** (escala-independientes) en
  `L5T2_SELVA`: delfín rosado, oso de anteojos, guacamayo + **mono señuelo** (nunca se pide;
  tocarlo = fallo). Al responder: anillo **verde ✓** en el correcto y **rojo ✗** en el
  tocado. Anti-repetición `L5T2_R2_KEY` **cap 2** → rota los 3 objetivos sin repetir seguido
  (tope: la imagen solo tiene esos 3 animales "buenos").
- **R3 `PR3Pesca` — PESCA EN EL RÍO (arcade).** Las provincias flotan por un río de
  derecha a izquierda; el niño **toca las de la Amazonía** antes de que pasen. Cada ronda: 3
  amazónicas (banco `L5T2_AMAZ`, 6) + 3 intrusas de Sierra/Costa (`L5T2_NO_AMAZ`, 8),
  barajadas en 3 carriles con entrada escalonada. Contador 🎣 X/3. **Tocar una intrusa =
  error al INSTANTE** (decisión de la autora, "una mal = incorrecto"): se **congela el
  río**, la carta se marca **roja ✗** (acomodada a la vista si estaba pegada al borde) y las
  amazónicas aún visibles se revelan **verdes ✓**, luego ¡UPS!. **Termina apenas pesca las 3
  amazónicas** (ya no espera a que pasen las intrusas). Dejar pasar una amazónica también
  falla. Anti-repetición `L5T2_PESCA_KEY` **cap 2** (con cap 3 el trío se partía en 2 grupos
  fijos y alternaba idéntico cada recarga; cap 2 lo mezcla de verdad).

**Imágenes:** solo R2 usa una generada (`assets/l5t2-selva.png`); R1 = letras, R3 =
tarjetas+CSS. Diseño en `.planning/libro-5-tema-2-design.md`. **Verificado:** overflow 0 en
las 3 rondas; e2e (R1→R2→R3→reporte) sin errores por los dos caminos de R3 (pescar las 3 =
gana · tocar una intrusa = ¡UPS! con ✗/✓); anti-repetición 0 repes consecutivas en 6
recargas en las 3 rondas (R1 recorre las 5, R2 rota los 3, R3 mezcla los tríos);
format-lint 15/15.

### Libro 6 · Tema 1 · "La Amazonía, nido de vida silvestre" (`SilvestreGame`, 10 años)

**3 rondas encadenadas con TRES VERBOS distintos** (arrastrar · marcar varios · tocar 1
de 4), del TEMA 2 del Libro 6. Mismo chrome que `AmazoniaGame` (arreglo `L6T1_ROUNDS` de
`{C, verify, bubble}`). Guía **Domi**. ⭐ hasta 3 (+1 por ronda).

- **R1 `SR1Descenso` — ARRASTRAR a su lugar.** Columna de 3 fichas sobre un **corte del
  terreno en SVG** (`L6T1Perfil`, dibujo abstracto: franjas y ladera, **no** una silueta
  del país). Rota entre **3 escaleras** (`L6T1_ESCALERAS`): zonas del relieve · volcanes
  por altura · temperatura por lugar; todas con el mismo sentido "arriba = más alto / más
  frío". La ficha muestra **solo el nombre**; el dato (altura, °C) **se revela al
  verificar** — con el número a la vista, ordenar sería leer. Al fallar: ✓/✗ y la pastilla
  **"AQUÍ VA"** (reusa el patrón de `R2Orden`/`PR2OrdenNS`). El perfil se oculta al
  revelar, porque esa pastilla necesita el espacio de la derecha.
- **R2 `SR2Cuenca` — MARCAR VARIOS + ¡VERIFICAR!** 8 tarjetas = 4 países de la cuenca
  (de `L6T1_CUENCA`, los 8 del libro) + 4 intrusos (`L6T1_INTRUSOS`, contrastes obvios, no
  del libro). ✓ / ✗ / **"faltó"** como en el Libro 3. C(8,4)² = 4 900 combinaciones → no
  repite. **Sin banderas emoji**: en Windows se ven como dos letras ("EC"), así que la
  tarjeta lleva el nombre en grande. **El elegido se pinta VIOLETA con texto blanco**
  (gradiente 4º del estándar) + anillo dorado + `scale(1.04)`: con la marca ○→● sobre
  crema la autora no distinguía lo que había tocado. **No se dice cuántos son** (se quitó
  la línea "Son cuatro" a petición suya), ni en el enunciado ni en el bocadillo.
- **R3 `SR3Nacionalidad` — TOCAR 1 de 4** (valida al tocar). Cartel con una **pista
  textual** (`L6T1_PISTAS`, 9) y 4 nacionalidades (`L6T1_NACIONALIDADES`, 6 del libro).
  **Foto en cada tarjeta** (`assets/l6-nac-<slug>.jpg`, `L6T1_NAC_SLUG`: `kichwa, cofan,
  secoya, siona, huaorani, shuar`), vía `L3T3Foto` con `fallback null` → si algún archivo
  faltara, esa tarjeta se queda solo con el nombre y la ronda sigue funcionando.
  **Las 6 ya están subidas:** 5 salen de la columna "Iconografía" de la tabla del libro
  (extraídas del PDF que pasó la autora) y la de **Kichwa** la puso ella aparte.
  ⚠ **Personas reales → NUNCA generadas con IA**; si se reemplaza alguna, que venga del
  libro o de una fuente de licencia libre (Wikimedia Commons), como en el Libro 5.
  El dato que decide la respuesta va **resaltado en dorado** dentro de la pista (campo
  `hi` de `L6T1_PISTAS`) para que el niño sepa dónde mirar. Al responder salen **✓ verde
  en la correcta y ✗ roja en la tocada** (círculo blanco sobre la esquina; lo pidió la
  autora: el color de fondo solo no bastaba) y, al acertar, el cartel "¡EXCELENTE!" se
  retrasa **500 ms** para que dé tiempo a verlo. Verificado con y sin fotos: overflow 0 y
  colchón 47 px en 3 viewports.

  > **Cómo se sacaron las fotos del PDF** (esta máquina no tiene poppler, ImageMagick ni
  > PIL): (1) los JPEG incrustados se vuelcan leyendo el binario del PDF y cortando entre
  > los marcadores `FFD8`…`FFD9`; (2) el recorte a cuadrado se hace **dibujando en un
  > `<canvas>` dentro de Chromium con Playwright** y exportando con `toDataURL` (hay que
  > pasar la imagen como `data:` URL: desde `about:blank` el navegador no lee `file://`);
  > (3) para **verificar** qué foto es cada nacionalidad se renderiza la página con
  > **pdf.js** (CDN) y se compara — el orden de los JPEG dentro del PDF *no* garantiza el
  > orden de la tabla, aunque aquí coincidiera.

Anti-repetición por ronda (`L6T1_R1_KEY` cap 2 · `L6T1_R2_KEY` cap 4 · `L6T1_R3_KEY` cap
4, sobre el FIFO `l3t2Recent/Push`). **Sin ninguna imagen.**

⚠ **Contenido del libro — contradicciones que NO se usan como respuesta:** la extensión
(texto 115 613 km² vs cuaderno 120 000 km²) · cuántas nacionalidades son (dice siete y
nombra nueve) · la ortografía **Zumaco** (texto y cuaderno) vs **Sumaco** (pie de foto) →
se ordena por altura, nunca se escribe el nombre. El cuaderno además lista "Tena" como
provincia y omite Pastaza: **manda el texto**. Secoya y Siona viven las dos en
Shushufindi → sus pistas son **las del propio cuaderno**, que es la clave del libro.
⚠ Las fotos de nacionalidades son de **personas reales**: si algún día se añaden, salen
del libro, **nunca de IA**.

Diseño en `.planning/libro-6-tema-1-design.md`. **Verificado** (4 viewports): overflow 0 y
**colchón mecánica↔acciones 47 px** (mínimo 30) en las 3 rondas; e2e perfecto 3/3 · 100 % ·
3 ⭐ y e2e con fallos (revela "AQUÍ VA" y "faltó"); anti-repetición 0 repeticiones
consecutivas en 5 recargas (R1 rota las 3 escaleras, R3 dio 5 pistas distintas de 5);
format-lint 15/15.

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
