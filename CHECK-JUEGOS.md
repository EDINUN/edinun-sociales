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
| 10 | Ecuador megadiverso · Tema 1 (recursos naturales) | [x] | [x] | [x] | [ ] | [ ] | [x] |
| 13 | Un mundo por descubrir · 3 temas (continentes · Américas · diversidad) | [x] | [x] | [x] | [x] | [ ] | [x] |

## Notas por juego

> Apunta aquí lo que encuentres (bug, ajuste pendiente, idea) por juego.

**juego-10 "Ecuador megadiverso" (2026-08-12)** — ⚠️ **título PROVISIONAL**, lo puso el
asistente para poder registrar el juego; falta que lo apruebes.

- **Tema 1 "Recursos naturales y los derechos de la Tierra"** (Tema 2 del libro, **8 años**)
  ✅ **3 rondas** (mapa vivo · ascensor del Ecuador · ficha del descubrimiento), **10 ⭐**
  (4 + 3 + 3). Guía **Yaku**.
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
- ⏳ **Temas 2 y 3 en "Próximamente"**: falta su material y su edad. No es un estado final
  válido (`estandar-visual.md` §8) — el juego se entrega con los 3 botones jugables.
  Sus verbos no pueden repetir arrastrar-al-mapa · tocar-franja · elegir-en-huecos.
- ⏳ **"Contenido" sin marcar a propósito:** falta que revises (a) el **criterio de
  distractores** de la R3 —el dato correcto siempre sale del libro, pero varios distractores
  son una negación evidente porque el libro no ofrece alternativa— y (b) la lista de **26
  especies excluidas** del banco de la R1 por estar repetidas en dos regiones del cuadro de
  la p. 72.
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
