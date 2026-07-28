# MEMORY.md — juego-6 · Hub de 4 libros (Estudios Sociales)

Bitácora del juego.

## Qué es (pivote 2026-07-23)

juego-6 fue primero **"Explora el Ecuador"** (provincias del Ecuador: ubica + trivia
del mapa). La autora dijo *"hay cambio de planes… vamos a cambiar todo"* y decidió
**descartar** ese juego y reconstruir juego-6 como un **HUB de 4 libros** con menú de
2 niveles:

```
Home (4 libros) → pantalla del libro (sus temas) → personaje → juego → reporte
  Libro 2 → 1 tema   ("Reconociendo mi país", 6 años)   ✅ hecho
  Libro 3 → 3 temas  (T1 "Hechos históricos" · T2 "Identidad territorial" · T3
                      "Viajando por mi país", 7 años)          ✅ los 3
  Libro 5 → 2 temas                                       ⏳ placeholder
  Libro 6 → 1 tema                                        ⏳ placeholder
```

(El juego de provincias sigue en el historial de git: commits `a2b2e03`, `1d6e46a`,
`3b4686e`.)

## Decisiones de la autora

- **Estructura:** 4 botones de libro en Home (2/3/5/6) → cada uno abre otra pantalla
  con sus temas (1/3/2/1 botones). Confirmó el esqueleto: *"perfecto"*.
- **Menú de 2 niveles** dentro de juego-6, sin tocar el shell (`app.jsx`). El nivel
  "libro" vive en el estado interno de `HomeScreen`.
- Se armó primero el **esqueleto navegable** (placeholders "en construcción") para que
  la autora viera "cómo quedaría", y luego se llenan los libros uno por uno.

## Libro 2 · "Reconociendo mi país" (6 años)

- Del **TEMA 2 del libro** (fotos que mandó la autora): país=Ecuador, capital=Quito
  (Pichincha), **servicios básicos**, **quién ayuda** (ECU 911/bomberos/policía/Cruz
  Roja), población (censo 2022). Se dejó fuera lo abstracto (prefecto/gobernador) por la
  edad.
- Se propusieron 3 mecánicas **como bosquejo ASCII en el chat** (la autora las prefiere
  ahí, no como enlace de artifact). Eligió **A "Mira y toca"** (tras notar que A puede
  absorber los servicios de la B en preguntas de tocar).
- **Sin imágenes:** emojis (la autora preguntó y se decidió emojis; código con respaldo
  para imágenes si se quisieran luego).
- Mecánica: **Mira y toca** (patrón 5), 4 rondas, banco 10 (`PREGUNTAS_L2`), opciones
  barajadas, bocadillo fijo, anti-repetición cap 6.
- **Verificado:** e2e `reachedResults: true`; anti-repetición al recargar **0 solapes**
  (p1=[3,9,5,1] vs p2=[4,7,6,8]); format-lint 15/15.

## Libro 3 · Tema 1 · "Hechos históricos" (7 años)

- Del **TEMA 1 del libro** (fotos de la autora): **ecuatorianos ejemplares** y su **área**
  (música/deporte/pintura/literatura/política); marco/recompensa = Batalla de Pichincha,
  Templo de la Patria y las regiones del Ecuador.
- La autora rechazó las 3 primeras mecánicas (*"como aburrido, plantéame algo más
  interesante"*). Se propusieron 3 con más juego (Detective / **Ventanas del pasado** /
  Atrapa la fuente) **como bosquejo ASCII en el chat**. Eligió **Ventanas del pasado** y
  pidió que fuera **con los personajes históricos**.
- **¿Generar imágenes? → NO.** Personas reales → NO se generan sus caras (saldrían
  inventadas; regla de no inventar). Se usa **emoji del área + nombre** (opción A).
- Mecánica: **Ventanas del pasado** (`VentanasGame`, opción A) — el **nombre es el título**
  y **su foto va tapada por ventanas 2×2**; toca 1 de 3 áreas; **al acertar se destapa su
  foto**, al fallar queda tapada (no resta). Final: **álbum** con las fotos que descubrió.
  Fotos reales del libro en `assets/pers-<slug>` (respaldo 👤); anti-repetición de personajes.
- **Idea de la autora (rediseño):** cambió el diseño para que el **nombre sea el título** y
  las ventanas tapen la **FOTO del personaje** que se va revelando; "al final se muestra la
  imagen si elijo bien todas las preguntas" → **álbum** de los descubiertos. Insistió mucho
  en poner las fotos (por eso `L3Foto`/`L3AlbumCard` cargan `assets/pers-<slug>` con respaldo
  👤). Las postales quedaron **reservadas** como posible bonus (prompts entregados).
- **Verificado:** overflow 0 (4 viewports), anti-repetición **0 solapes**, e2e
  (acierto→foto→álbum→reporte) sin errores, format-lint 15/15.

## Libro 3 · Tema 2 · "La identidad territorial" (7 años)

- La autora pidió **3 rondas, cada una con mecánica distinta** (como juego-4/5). Iteramos
  mucho el diseño en el chat: rechazó R2 fija ("no me gusta que sea fija") → se cambió a
  ordenar **rotando entre los 3 regímenes** del libro; notó que R2 y R3 eran ambas de
  arrastrar → R3 pasó a **tocar** (además más fácil para 7 años que arrastrar varias);
  notó que R1≈R2 → se separaron por sub-tema (regiones / organización / provincias). R3
  quedó **por región** (no por zona de planificación, más fácil).
- Mecánica (`TerritorioGame`): **R1** ¿de qué región? (tocar 1 de 4 + destapar imagen de
  la región) · **R2** ordenar mayor→menor **arrastrando** (rota los 3 regímenes) · **R3**
  tocar las provincias correctas de la región + ¡VERIFICAR!. Anti-repetición por ronda.
- **Imágenes:** la autora ofreció generarlas; para R1 se le pasaron los prompts de las
  **4 regiones** (paisajes SIN caras) → `region-<slug>.jpg` (respaldo al emoji). Contenido
  del texto del tema (no de las actividades) y **bancos grandes** para que recargar varíe
  (petición expresa).
- **Ajustes tras verla jugando:** (1) en R1 la autora **NO quería el tapar/destapar** →
  la **imagen de la región se muestra siempre visible** y el ítem va en la misma línea del
  enunciado (imagen más grande). (2) Vio la referencia de edinun-language ("Vocales/Letra V")
  y pidió **pills de tema** para saltar entre temas del libro sin volver al Home →
  `TemaPills` en `GameScreen`. (3) "Verde" confundía (emoji banano) → fuera; y **aprobó
  ampliar el banco** de R1 (Cangrejo/Banano/Coco/Volcán/Papa/Mono/Caimán/Pingüino/Lobo
  marino) → *"si puedes agregar palabras solo dime y yo apruebo"*.
- **Verificado:** overflow 0 en las 3 rondas, arrastre de R2 mueve cartas, pills cambian de
  tema sin errores, e2e (R1→R2→R3→reporte) sin errores, format-lint 15/15.

## Libro 3 · Tema 3 · "Viajando por mi país" (7 años)

- Del tema del libro **"Viajando por mi país con mi familia"** (8 capturas de la autora):
  las 4 regiones en detalle — Costa (ríos Guayas/Esmeraldas/Jubones, banano/arroz,
  Guayaquil/Manta/Machala/Salinas…), Sierra (callejón interandino, +1500 m y páramos
  +4000 m, Quito/Cuenca/Ambato/Riobamba/Ibarra/Loja, Cotopaxi/Chimborazo/Cayambe, cóndor),
  Amazonía (la más grande y la menos poblada, Puyo/Nueva Loja/El Coca, jaguar) e Insular
  (a 1000 km, especies únicas, Patrimonio Natural de la Humanidad, Archipiélago de Colón /
  Islas Encantadas). También el mapa por colores (Costa amarillo · Sierra café · Amazonía
  verde · Insular azul), que se reusó como color de región en el juego.
- **Ojo con el número de tema:** la página del libro dice **"TEMA 2"**, pero en el hub es
  el **3º botón del Libro 3** (ya pasó con el Libro 2, cuyo juego salió del "TEMA 2" del
  libro). La numeración del libro ≠ la del hub.
- **Riesgo detectado y evitado:** el Tema 2 ya pregunta "¿de qué región es…?" y por
  provincias. La autora insistió: *"verás que debe ser diferente al tema dos por favor"*.
  Por eso las 3 propuestas se construyeron alrededor de un **verbo que el Tema 2 no usa**
  y sobre otro sub-tema (ciudades/ríos/nevados/fauna, no regiones-organización-provincias).
- Se le mostraron **3 bosquejos ASCII en el chat** (memoria / ruleta / postal). Eligió
  **A "Memoria del viaje"** y enseguida notó: *"pero aquí deberíamos tener 3 mecánicas
  diferentes, ¿no crees?"* → **las 3 propuestas pasaron a ser las 3 rondas** (memoria ·
  ruleta · postal). Muy buena idea suya: encaja con el estándar del ecosistema.
- **DECISIÓN FINAL — el tema va SIN IMÁGENES.** Tras pedir los prompts, la autora notó lo
  importante: *"las imágenes están con full detalles y basura visual, cachas que en el
  tamaño que vamos a colocar no se va a notar"* (las fichas son de ~94 px). Y luego:
  *"haz el juego sin las imágenes generadas y si es de cambiar la mecánica dímelo"*.
  **No hizo falta cambiar la mecánica** — las 3 rondas funcionan enteras sin una sola
  imagen. Lo que sí se cambió es el tratamiento de las fichas: se vio en captura que
  **Quito y Riobamba salían con el mismo 🏙️** (todas las ciudades comparten emoji, los
  ríos 🌊 y los nevados 🏔️ también) → `l3t3Generico` **oculta el emoji genérico** y agranda
  el **nombre**; se conserva solo el emoji único (🐆 🐢 🦅 🍌…) y el de las 4 regiones.
  El soporte de fotos se dejó en el código (cuesta cero y cae solo), por si algún día se
  generan. **Aprendizaje:** a tamaño de ficha (~90 px) hay que pedir arte tipo **icono**
  (un sujeto, formas planas, pocos colores), nunca "bright and detailed".
- **Imágenes (historial):** primero se reusaron solo las 4 fotos de región del Tema 2. La autora lo
  cuestionó (*"¿por qué usas las imágenes del tema 2? si necesito generarlas solo dime"*) y
  tenía razón a medias: para las **cartas de región** y la ruleta reusar está bien (lo que
  se ve *es* la región), pero los **lugares** estaban en emoji y la postal mostraba la foto
  genérica de la Sierra cuando la palabra era CHIMBORAZO. → Se añadió soporte de
  **`lugar-<slug>.jpg`** (16, horizontales 3:2, prompts entregados) con **respaldo en
  cadena** (`L3T3Foto`: lugar → región → emoji), así el juego se ve completo con o sin ellas.
- **Copy corregido por la autora (2 pasadas):** el enunciado de R2 decía *"¿Qué nos llevamos
  de la región Amazonía?"*. Ella señaló primero el sentido (*"no sería que llevamos a la
  región… más no que nos llevamos de"*) y luego dio con el verbo bueno: *"o más bien sería
  como que encuentras"* → **"¿Qué encontramos en la Amazonía?"**. De paso se arregló la
  gramática ("la región Amazonía" → **la Costa · la Sierra · la Amazonía · la región
  Insular**, vía `L3T3_REG_EN`).
- **R3 cambió a mitad de la construcción (idea de la autora):** era "Arma la postal"
  (sílabas) y pidió *"la tercera ronda podría ser que arrastramos los puntos cardinales en
  el mapa del Ecuador"*. Se cambió a **`R3Mapa`** (la postal queda en git). Se le advirtió
  que **arrastrar los LÍMITES no funciona** (Perú es límite al Sur *y* al Este → dos fichas
  iguales); por eso los vecinos van dibujados como contexto y lo que se coloca son los
  **4 puntos cardinales**. El **mapa lo genera ella**; se descartó pedírselo a la IA sin
  revisión porque una silueta mal dibujada del país es un error de contenido escolar.
- **Verificado:** overflow 0 y colchón ≥60 px en las 3 rondas × 4 viewports; e2e de
  acierto (6/6, 6 ⭐, 100 %) y de fallo; el ⭐ del HUD sube con **cada pareja** (primero
  no lo hacía: solo sumaba al cerrar la ronda); R1 con 0 solapes en 3 recargas; R2 rota
  las 4 regiones; format-lint 15/15.

## Aprendizajes

- La autora prefiere ver los **bosquejos de mecánica dibujados en el propio chat**
  (ASCII), no como enlace a un artifact. (Lo pidió 3 veces.)
- Regla recordada por la autora: *"al recargar la página me debe salir variado"* →
  anti-repetición FIFO en cada juego con banco, verificado por test de recarga.
- Al proponer mecánicas, si la autora dice que están "aburridas", subir el **factor
  juego** (exploración/sorpresa/recompensa), no solo cambiar de quiz a clasificar.
- Para **personas reales** (personajes históricos): NUNCA generar sus caras con IA
  (inventadas). Retratos solo si la autora pasa los reales del libro (próceres = dominio
  público; modernos = con derechos). Por defecto: emoji del área + nombre.

## Pendiente

- **Libro 5** (2 temas) y **Libro 6** (1 tema): contenido + mecánica de cada uno (la
  autora los pasa uno por uno). El Libro 3 ya está completo (T1 · T2 · T3).
- **Título global** del hub + card del landing (placeholder por ahora).
- Personaje guía por defecto por libro/tema (hoy: domi, elegible).
