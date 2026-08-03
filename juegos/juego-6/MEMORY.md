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

### Mapa y arrastre de R3 (2026-07-29)

- La autora **sí generó el mapa** (`mapa-ecuador.jpg`, 2048×2048): Ecuador en verde,
  vecinos en gris, océano azul y Galápagos, sin letras ni rosa de los vientos. Se agrandó
  el hueco de 142 → **168 px** y se le puso **marco dorado** (sin marco, al ser un JPG
  opaco, parecía una calcomanía cuadrada pegada sobre el fieltro verde).
  Observado al revisarla: la silueta es una **aproximación** (el Golfo de Guayaquil va más
  abajo, el oriente más redondeado, Galápagos demasiado al norte) y **pesa 1,2 MB** para
  verse a 168 px — se le sugirió exportarla a 512×512. Lo que el mapa AFIRMA sí es correcto.
- **"No se arrastra bien"** (reporte de la autora): el soltado exigía que el cursor cayera
  DENTRO del recuadro de 96×42 px. A 7 años eso casi nunca pasa → el gesto se perdía sin
  ninguna señal y parecía que el juego estaba roto. Arreglado con tres cosas: **soltado
  tolerante** (`slotCercano`, margen 0,62 × ancho medido al borde), **destino iluminado en
  dorado** mientras arrastra, y **recuperación** (si suelta lejos, la ficha queda elegida
  para solo tocar el recuadro). Verificado soltando 45 px FUERA del recuadro: cae igual.
  **Regla general:** en cualquier arrastre para 6-8 años, hit-test estricto = mecánica rota.
- **Bug que introdujo ese mismo arreglo** (cazado por el test, no por la autora): con el
  margen tolerante, **tocar** una ficha la mandaba sola al recuadro SUR, porque la bandeja
  queda a ~60 px de él. Corregido: el soltado tolerante **solo se evalúa si `moved`** (si
  de verdad arrastró); un toque solo elige. **Aprendizaje:** al ampliar un área de soltado,
  revisar qué otros elementos caen dentro del nuevo margen.
- **Bandeja vacía en R3** (lo pidió la autora): cuando ya están los 4 puntos colocados, los
  huecos punteados no decían nada → ahora sale la pastilla **"👉 ¡Ya están los 4! Toca
  ¡VERIFICAR!"** en su lugar, del mismo alto para que el layout no salte.
- **"Páramo" con 🌫️ no se entendía** (lo cazó la autora): parecía niebla suelta. Se sumó
  🌫️ a `L3T3_EMOJI_GENERICO`, que ahora cubre dos casos: emoji **compartido** por varios
  ítems y emoji **que no se entiende**. Páramo quedó solo con su nombre en grande.
- **Sacar arrastrando hacia afuera** (lo pidió la autora): además del toque, tirar la ficha
  fuera de la maleta (R2) o fuera del recuadro (R3) la devuelve. Si arrastra pero suelta
  DENTRO, se queda (se arrepintió). Mismo gesto en las dos rondas, para no enseñar dos
  formas distintas.
- **El álbum de R2 "se dañaba" con las 4 fichas dentro** (2026-07-29, lo vio la autora:
  *"cuando coloco todas las opciones es como el cuadrito se daña"*). La caja era de alto
  **fijo 132 px** y con 4 pastillas el contenido pide ~156 → tapaban el rótulo 📸 y se
  salían por el borde inferior. Alto a **184** (cabe el peor caso) + nombre `nowrap`;
  queda bajo los 196 px de la columna de la ruleta, así que la fila no se mueve.
  **Aprendizaje:** dimensionar toda caja receptora de fichas para que quepan **TODAS**,
  no solo las correctas — el niño mete de más y ese estado hay que dibujarlo bien.
  Verificado con un test que mete las 4 y mide desborde: 0 px arriba/abajo/lados en
  4 viewports, antes y después de ¡VERIFICAR!, overflow del lienzo 0, 0 errores.
- 🐛 **Bug de React que costó encontrar:** en R3 el recuadro estaba escrito como un
  **componente declarado DENTRO** de `R3Mapa` (`function Slot({c})`). Eso crea un tipo
  nuevo en cada render → React **desmonta y remonta** el `<div>` → se pierde el
  `setPointerCapture` a media arrastrada y el `pointerup` nunca llegaba, así que "sacar
  arrastrando" no hacía nada (y los tests de arrastre dentro/fuera daban el mismo
  resultado, que fue la pista). Arreglado convirtiéndolo en una **función que devuelve
  JSX** (`renderSlot(c)`), no un componente. **Regla: nunca declarar un componente dentro
  de otro si adentro hay gestos con pointer capture o refs al DOM.**
  De paso: al decidir en `pointerup`, medir con la **ref del elemento**, no con
  `e.currentTarget` (con capture no siempre es el que se cree).

## Libro 6 · Tema 1 · "La Amazonía, nido de vida silvestre" (10 años)

- La autora pidió "un juego nuevo" y eligió: **tema nuevo dentro del hub**, en el
  **Libro 6** (el último botón que quedaba en construcción). Con esto el hub queda
  **completo: 7 temas, 0 placeholders**.
- **La pregunta clave la hizo ella:** *"si se supone que vamos a recargar la página y que
  no me salga lo mismo, ¿qué opciones más vamos a tener por cada ronda?"*. Se contaron los
  ejercicios distintos de cada propuesta ANTES de codear, y eso **descartó una mecánica
  entera** (la del mapa: sus tres rondas eran de contenido fijo y repetían ya en la 2ª
  partida). **Aprendizaje: contar el banco por ronda es parte del diseño, no del QA.**
- Luego dijo *"haz lo que creas conveniente"* y se armó la mezcla: R1 de una propuesta +
  las dos rondas más variadas de otra. Verbos distintos a propósito (arrastrar · marcar
  varios · tocar 1 de 4), porque ella misma notó en el Libro 3 que dos rondas seguidas de
  arrastrar se sienten iguales.
- **Riesgo evitado:** el hub ya tenía dos temas de Amazonía (Libro 5·T2 con capitales/lupa/
  palabra y Libro 3·T3 con los límites del Ecuador — que es justo el ejercicio "Delimita y
  pinta" de este cuaderno). Este tema se construyó sobre lo suyo: **cuenca · relieve ·
  nacionalidades**.
- **El libro se contradice a sí mismo en 4 datos** (extensión 115 613 vs 120 000 km²;
  "siete nacionalidades" y nombra nueve; Zumaco vs Sumaco; el cuaderno pone "Tena" como
  provincia y omite Pastaza). Ninguno se usa como respuesta — mismo criterio que con la
  doble altura del Chimborazo.
- **Verificado:** e2e perfecto 3/3 · 100 % · 3 ⭐ en 4 viewports, e2e con fallos (revela
  "AQUÍ VA" y "faltó"), overflow 0, colchón 47 px, anti-repetición 0 consecutivas en 5
  recargas, format-lint 15/15.
- **Las fotos de la R3 salieron del PDF del libro** (2026-08-03). La autora preguntó si yo
  podía sacarlas de las capturas del chat: **no** (una imagen pegada en el chat no es un
  archivo que se pueda guardar), pero sí del **PDF** que dejó en `juegos/juego-6/PDF/`.
  Receta, porque esta máquina **no tiene poppler, ImageMagick ni PIL**: volcar los JPEG
  incrustados cortando el binario entre `FFD8`…`FFD9` → recortar a cuadrado con un
  `<canvas>` en Chromium (Playwright), pasando la imagen como `data:` URL porque desde
  `about:blank` no se puede leer `file://` → **verificar** renderizando la página con
  **pdf.js** desde CDN. Lo tercero no es opcional: el orden de los JPEG dentro del PDF no
  tiene por qué ser el de la tabla, y etiquetar mal una nacionalidad sería un error de
  contenido escolar. (Aquí coincidía, pero eso se supo *después* de comprobarlo.)
- **Lo que la autora corrigió jugando la R2 y la R3** (2026-08-03): (1) fuera la línea
  "Son cuatro" — no se dice cuántos son; (2) la marca **○→● sobre crema no se distingue**:
  el elegido pasó a **violeta con texto blanco** + anillo dorado + un pelín más grande;
  (3) en la R3 **faltaban el ✓ y la ✗** en las tarjetas — el color de fondo solo no
  bastaba — y de paso el "¡EXCELENTE!" del acierto se retrasó 500 ms, porque tapaba la
  pantalla antes de que se viera la marca. **Aprendizaje: el estado "elegido" necesita un
  salto de COLOR, no un cambio de glifo; y todo veredicto lleva su ✓/✗ explícito.**
- 🐛 **Un archivo de imagen sin extensión no carga.** La autora guardó su foto de Kichwa
  como `l6-nac-kichwa` (sin `.jpg`) y por eso no aparecía. Renombrada. **Al pedirle fotos,
  decir siempre el nombre COMPLETO con extensión y en minúscula.**
- **Observación (NO es de este tema):** la tabla del reporte muestra ~1 fila y hace
  scroll. Se midió en el Libro 5·T1 y le pasa igual (filas de 107 px en una caja de 117).
  Es un rasgo del `ResultsScreen` de juego-6, que comparten los 7 temas → tocarlo hay que
  acordarlo con la autora.

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
- **Puntuación de los enunciados** (pasada del 2026-07-29, la pidió la autora): el
  enunciado imperativo **cierra con punto**; el que es pregunta cierra con `?` y no lleva
  punto; los `ed-label` (kickers en mayúsculas) y los rótulos del reporte (columna
  "ejercicio") **no llevan punto** porque son etiquetas, no frases. Si el enunciado va
  partido en dos líneas (kicker + destacado), el punto va al final del destacado — igual
  que el `?` de la R1 del Tema 2, que cuelga del destacado.
- **Redundancias que sobran cuando llega el refuerzo bueno:** al dibujarse las líneas de
  unión en la R3 del Libro 5, la autora pidió quitar los números de pareja (*"si ya ponemos
  las líneas de unir entonces quitemos los números"*). La línea + el color del borde + el
  puntito ya dicen con quién está unida cada tarjeta.
- 🐛 **El `cap` del FIFO puede convertir la anti-repetición en un péndulo.** En una ronda
  que elige **k de N**, si `cap ≥ N − k` los "frescos" que quedan son *exactamente* los que
  faltan, así que la partida siguiente los elige a todos: el juego alterna entre 2 tableros
  y nada más. Pasó en la R2 del Libro 6 (4 de 8 con cap 4 → **2 grupos distintos en 30
  partidas**, midiendo). Con cap 2 → 26 de 30. **Regla: `cap < N − k`.** Ojo, C(8,4)=4 900
  combinaciones teóricas no dicen nada: hay que **medir**, no calcular. El test rápido es
  llamar el `build()` N veces seguidas en la consola de la página (el `localStorage` hace
  que cada llamada equivalga a una recarga) y contar distintos, repetidos seguidos y el más
  frecuente. Las rondas que eligen **1 de N** no tienen este problema mientras `cap < N`.
- 🐛 **`overflow:hidden` en una tarjeta con badges salientes los corta.** En la R3 del
  Libro 5 el botón recortaba la foto y, de paso, el ✓/✗ y la etiqueta dorada del pueblo
  correcto → al fallar no se leía la respuesta buena (rompía la invariante del repo).
  El recorte tiene que ir en la **imagen**, no en el contenedor. Lo cazó el QA visual, no
  la autora: los badges se veían como una astilla de color en el borde, fácil de leer como
  "adorno".

## Pendiente

- **Libro 5** (2 temas) y **Libro 6** (1 tema): contenido + mecánica de cada uno (la
  autora los pasa uno por uno). El Libro 3 ya está completo (T1 · T2 · T3).
- **Título global** del hub + card del landing (placeholder por ahora).
- Personaje guía por defecto por libro/tema (hoy: domi, elegible).
