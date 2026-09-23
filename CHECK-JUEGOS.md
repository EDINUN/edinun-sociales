# Checklist de revisión — EDINUN GAMES · Estudios Sociales

Revisión juego por juego. Solo lo esencial (lo que más se rompe).
Marca con una `x` dentro de los `[ ]` a medida que verificas.

## Qué revisar (los 6 imprescindibles)

1. **HUD** — pregunta/ronda arriba‑izquierda pegado al logo; timer ⏱ y estrellas ⭐ a la derecha; nada se tapa.
2. **Responsive vertical** — en móvil portrait (375×667 / 768×1024) sale el bloqueo *"Gira tu teléfono"* y el lienzo queda **centrado** (no pegado a la esquina). Al girar a horizontal escala bien y nada se corta.
3. **Juego completo** — se juega de principio a fin hasta resultados; correcta avanza, incorrecta da feedback y no se traba. Funciona con mouse y con tap en móvil.
4. **Contenido sin errores** — preguntas, respuestas y distractores correctos; datos de Estudios Sociales exactos (fechas, lugares, símbolos, mapas); sin typos ni imprecisiones en los enunciados.
5. **Contador** — `counter.php` responde (F12 → Network) o cae a localStorage sin romper. **Borrar `visits.txt` antes de subir.**
6. **Resultados** — aciertos/tiempo/estrellas bien; "JUGAR OTRA RONDA" reinicia; salir pide confirmación.

## Avance

| # | Juego | HUD | Responsive | Completo | Contenido | Contador | Resultados |
|---|-------|:---:|:----------:|:--------:|:---------:|:--------:|:----------:|
| 10 | Ecuador megadiverso · 3 temas (recursos naturales · siglo XXI · clima del planeta) | [x] | [x] | [ ] | [ ] | [ ] | [x] |
| 13 | Un mundo por descubrir · 3 temas (continentes · Américas · diversidad) | [x] | [x] | [x] | [x] | [ ] | [x] |

## Notas por juego

> Apunta aquí lo que encuentres (bug, ajuste pendiente, idea) por juego.

**juego-10 "Ecuador megadiverso" (2026-08-12)** — ⚠️ **título PROVISIONAL**, lo puso el
asistente para poder registrar el juego; falta que lo apruebes. Con los **tres temas ya
hechos** el nombre se queda claramente corto: describe solo el Tema 1, y el Tema 3 habla del
clima del **planeta entero**, no del Ecuador.

- **Tema 1 "Recursos naturales y derechos de la Tierra"** (Tema 2 del libro, **8 años**)
  ✅ **3 rondas** (mapa vivo · ascensor del Ecuador · ficha del descubrimiento), **10 ⭐**
  (4 + 3 + 3). Guía **Yaku**.
- **Tema 2 "Inicio del siglo XXI"** (Tema 1 del libro, **11 años**) ✅ **3 rondas** (del
  sucre al dólar · ¿dónde se esconden los gases? · el gráfico vivo), **11 ⭐** (4 + 4 + 3).
- **Tema 3 "El clima de nuestro planeta"** (Tema 4 del libro, **12 años**) ✅ **3 rondas**
  (el noticiero · la ruleta de los climas · el lugar misterioso), **10 ⭐** (4 + 3 + 3).
  ✅ **Con esto el juego queda completo: 3 botones, 3 mini-juegos y nueve verbos distintos.**
- **Revisión visual de la autora (2026-08-13), 6 correcciones aplicadas:** fichas de la R1
  más chicas (138×70 → 104×62) y zonas menos alargadas (176 → 126); el ✓/✗ y la región
  revelada pasaron **dentro** de la ficha (colgando se montaban sobre la ficha vecina); la
  R2 quedó en **una sola columna de 6 franjas en crema opaco** (eran blanco translúcido y
  "casi no se notaban", y la Antártida colgaba en un recuadro suelto); el bocadillo de la R1
  ya **no dice "el mapa"** (el panel no es una silueta del Ecuador); y la R2 pasó de **2
  definiciones a 1** — encadenar dos rompía la regla *una ronda = UNA jugada*.
- **Segunda tanda:** el mapa quedó **anclado abajo** y las zonas arrancan bajitas, así que
  **crecen hacia arriba** conforme caen las fichas; y el bocadillo de la R3 dejó de decir
  *"en cada hueco"* (jerga de diseño, no palabra de un niño de 8).
  ⚠️ **Regla que dejan las dos:** el bocadillo solo puede nombrar **cosas que el niño ve y
  entiende**. Verificado con format-lint 19/19, qa-visual sin overflow en
  los 6 viewports y un e2e propio: partida perfecta 3/3 · 9 ⭐ · 100 % con **arrastre real
  de mouse**, partida fallada con revelado en las 3 rondas usando el **respaldo tap**,
  ronda parcial (3 bien + 1 mal) que **suma +3 ⭐ sin quitarlas** y "¡UPS!" sin estrellas,
  6 recargas con 0 repeticiones consecutivas, 0 errores de consola.

**Tema 2 (2026-08-14)** — 3 rondas con verbos nuevos: *ordenar arrastrando* · *buscar con
lupa* · *arrastrar el borde del gráfico*.

- **Revisión tuya del 2026-09-02:** el recuadro de la R2 se pintaba en **dos bloques**
  (celeste arriba, camel abajo) con una línea dura en medio. Ahora es **un solo degradado
  continuo**, sin costura, con un tinte distinto por escena.

**Tema 3 (2026-09-02)** — 3 rondas con verbos nuevos: *lanzar la tarjeta* · *girar el aro* ·
*destapar pistas*. Elegiste **las tres opciones** que se bocetaron para la R1 y se
repartieron como las tres rondas (concepto → tipos → deducción).

- **Qué dejé fuera y por qué:** los **desastres naturales** con su gráfico y los **tres
  instrumentos jurídicos** (1992 · 1997 · 2015). El **Tema 2 ya juega el cambio climático**
  (las causas que calientan el planeta, el Acuerdo de París) y repetirlo haría que los dos
  botones se sintieran el mismo juego; además, los instrumentos jurídicos solo darían un
  ejercicio de *ordenar*, que es el verbo de la R1 del Tema 2. **Dímelo si prefieres que
  entren** y le busco otro verbo.
- ⚠️ **Un punto que necesita tu visto bueno:** las **12 noticias de la R1 no están copiadas
  del libro** — el libro solo da un ejemplo. Lo que sí es textual es el **criterio** de la
  p. 48 (el clima es el promedio de al menos 30 años; el tiempo atmosférico es un momento
  concreto que cambia en horas), y cada noticia lo aplica con una marca temporal clara
  ("año tras año" ⇒ clima · "mañana", "ayer" ⇒ tiempo). Es el mismo criterio que usamos en
  juego-13. Si prefieres solo frases literales del libro, la ronda tendría que cambiar.
- **Japón** como ejemplo de clima templado (tu actividad 4 también da España e Italia):
  🗾 es el emoji que **nombra a Japón**, y para España no había ninguno que no mintiera.
- **Verificado:** format-lint 19/19, qa-visual sin overflow, y un e2e propio del Tema 3 con
  partida perfecta 3/3 · **10 ⭐** · 100 % (arrastre real de mouse y giro real del aro),
  partida fallada 0 ⭐ con revelado en las 3 rondas, ronda parcial que **suma +3 ⭐ sin
  quitarlas**, auditoría de espacios en 5 tamaños de pantalla × 3 rondas × antes/después de
  verificar (0 solapes, 0 textos cortados) y 8 recargas sin repetir ejercicio.
- **Revisión tuya del 2026-08-28, 3 cambios aplicados:** la R1 ahora **se arrastra** (el
  toque sigue de respaldo), los **emojis de la R2 son más grandes** (46 → 58 px el
  elemento, 28 → 38 el emoji, con la escena y la lupa a escala) y el enunciado de las
  barras ya **no dice "Estira"** — dice *"Completa cada barra con los países que tiene ese
  grupo."*

- 📌 **Rechazaste la primera tanda de mecánicas de la R2 entera** (*"muy aburridas"*): las
  tres eran variantes de **clasificar**. Regla nueva: a los 11 hay que variar el **tipo de
  interacción** (explorar / manipular un objeto / deducir), no el tema de las tarjetas.
- ⚠️ **Un dato de tu libro no cuadra consigo mismo** (p. 114): dice que la deuda total son
  48 129 millones y que los 8 100 del FMI *"equivalen al 33,3 %"*, pero 8 100 de 48 129 es
  el **17 %**. El 33,3 % solo cuadra sobre la deuda con **organismos multilaterales**. El
  gráfico se rotula *"La deuda del Ecuador con los organismos"* y usa **solo porcentajes**.
  **Dime si prefieres la redacción literal del libro** y se cambia en una línea.
- ⚠️ **La CAN con Chile:** tu libro la da integrada por Bolivia, Ecuador, Colombia, Perú y
  Chile; Chile salió de la CAN hace décadas. El juego usa **el número de tu libro (5)**.
- ⏳ **Faltan las ilustraciones**: 9 iconos de hito (120×120) + 3 escenas (920×600) + 12
  objetos sueltos. Los prompts te los pasé el 2026-08-14; mientras tanto van emoji y el
  juego es plenamente jugable.
- ⚠️ **¿Entra el feriado bancario en la línea del tiempo?** Tu libro lo fecha *"finales del
  siglo XX"*, sin año, y con 1994 (MERCOSUR) en el banco el orden sería ambiguo. Si me
  confirmas el año, entra.
- Verificado: e2e con partida perfecta 3/3 · **11 ⭐** · 100 % en las **dos** variantes del
  gráfico, partida fallada 0 ⭐ con revelado en las 3 rondas, **12 recargas sin repeticiones
  consecutivas**, y auditoría de espacios en 3 rondas × antes/después de verificar × 5
  viewports paseando la lupa por los 9 elementos de cada escena.

- ⏳ **Tema 3 en "Próximamente"**: falta su material y su edad. No es un estado final
  válido (`estandar-visual.md` §8) — el juego se entrega con los 3 botones jugables.
  Su verbo no puede repetir ninguno de los **seis** ya usados.
- ⏳ **"Contenido" sin marcar a propósito:** falta que revises (a) el **criterio de
  distractores** de la R3 del Tema 1 —el dato correcto siempre sale del libro, pero varios
  distractores son una negación evidente porque el libro no ofrece alternativa—, (b) la
  lista de **26 especies excluidas** del banco de la R1 por estar repetidas en dos regiones
  del cuadro de la p. 72, y (c) los dos avisos del Tema 2 (la deuda y la CAN).
- ⚠️ **El colchón mecánica↔acciones del panel del mapa (54 px) hay que medirlo aparte.**
  `qa-visual.js` solo escanea `button`, `img` y elementos `position:absolute`; el panel del
  mapa es hijo de un flex y **no lo ve** — su "gap 140" es el de las fichas de la bandeja.
- ⚠️ **Trampa del e2e:** `el.click()` no prueba el arrastre (solo dispara `click`, sin
  pointer events). Hay que usar el mouse real de Playwright: `move → down → move → up`.

**juego-13 "Un mundo por descubrir" (2026-08-06)** — Título ya definido por la autora.

- **Tema 1 "Los continentes"** ✅ verificado: format-lint 19/19, qa-visual sin overflow en
  los 6 viewports, partida completa 3/3 con revelado correcto al fallar, anti-repetición
  sin repes en 6 recargas.
- **Tema 2 "Las Américas y su geografía"** ✅ **3 rondas** (pasaporte · calculadora · sala
  de datos). Verificado con un e2e propio: partida perfecta 3/3 · 9 ⭐ · 100 %, fallo con
  revelado en las 3 rondas, rama de decrecimiento (tecla −) forzada por siembra de la clave
  FIFO, 6 recargas sin repeticiones en R1/R2 y 8 en R3 (los 7 tableros vistos), sin
  overflow. ⚠ **`qa-visual.js` solo recorre el tema por defecto** (el 1): el 2 hay que
  probarlo aparte seleccionándolo en el Home.
- **Tema 3 "La diversidad cultural de la población mundial"** ✅ **3 rondas** (el muro ·
  memoria cultural · lluvia de palabras), **13 años**, **11 ⭐** (2 + 3 + 6). La memoria va con **3 parejas y 8 intentos**: con 4 parejas la autora la halló demasiado difícil (se empareja concepto ↔ explicación, no dos cartas iguales) — ⚠ **ni juego-1 ni juego-6 ponen tope de intentos** a sus memorias. Verificado con un e2e propio que lo
  selecciona en el Home: partida completa 3/3 en los dos caminos (memoria resuelta 4/4 y
  memoria agotada 0/4 con el tablero destapado), sin overflow en las 3 rondas ni **durante
  el vuelo de la carta**, los 6 viewports con colchón de 47 px, caída de la R3 animada por
  CSS (`j13cae`, 3.4 s linear), "¡UPS!" sin estrellas en 5 capturas, 0 errores de consola.
  ⏳ **Faltan las 4 ilustraciones de la R2** (las genera la autora); corre con emoji.

> ⚠️ **El reporte en pantalla scrollea:** la tabla de rondas vive en una caja de ~166 px
> con overflow:auto (idéntica en juego-5, juego-8 y _PLANTILLA), asi que con filas altas
> solo se ve la primera ronda sin scrollear. **Al imprimir sale completo.** Si las
> respuestas de una mecánica son frases largas, conviene acortarlas para el reporte.

> ⚠️ **Dos trampas al medir estos juegos con Playwright** (cuestan una hora cada una):
> 1. **`document.body.textContent` incluye el JSX inline** del `<script type="text/babel">`.
>    Buscar ahí "¡UPS!" o "+2 ⭐" da falsos positivos: hay que leer el nodo del overlay
>    (`position:fixed; zIndex:1000`).
> 2. **Medir el overflow solo al inicio de la ronda no basta.** Una carta que sale volando
>    se escapa del lienzo a los ~100 ms y la medición estática no lo ve.

> ⚠️ **Antes de tocar cualquier tema de juego-13:** los 3 temas usan **9 verbos distintos**
> y ninguno puede repetirse. Releer los tres arreglos de rondas antes de diseñar — el
> "Pasaporte cultural" del Tema 3 se cayó por chocar con la "Sala de datos" del Tema 2,
> construida en paralelo.

**Pendiente antes de publicar:** (a) probar el **contador real con PHP**
(`php -S localhost:8000` desde la carpeta) — en local cae a `localStorage`, y borrar
`visits.txt`; (b) opcional, las **4 ilustraciones de la memoria** del Tema 3 (el juego
funciona sin ellas, con emoji).

✅ Los 3 temas están implementados: ya no queda ningún botón en "Próximamente"
(`estandar-visual.md` §8).
