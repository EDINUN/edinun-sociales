# MEMORY.md — Bitácora de juego-12 "Estudios Sociales · Libros 6 y 7"

## 2026-11-17 — Creación

- Clonado de `juegos/_PLANTILLA/`. Slug `juego-12` (hueco libre; los saltos de numeración
  vienen de los otros repos de EDINUN). Guía **Andi** por el ciclo del elenco
  (12 mod 4 = 0). Título **provisional**.
- **Estructura fijada por la autora:** dos libros — **Libro 6 con 3 actividades** y
  **Libro 7 con 4**. (Primero dijo 5 para el Libro 7 y luego lo corrigió a 4.)
- **Home de dos niveles** (Libro → Tema), tomado de `juego-6`, que es el precedente del
  repo para un juego multi-libro. El **Libro 7 sale apagado** mientras no tenga temas: un
  botón que lleva a una pantalla vacía es peor que un botón que avisa.
- Se avisó a la autora de dos cosas antes de empezar: que el Libro 6 **ya tiene un tema
  jugado** en juego-6 (la Amazonía), y que con 7 actividades **no caben 21 verbos
  distintos** — la regla es tres verbos distintos por tema, sin repetir los del vecino.

### Libro 6 · Tema 1 — "Estado ecuatoriano en sus primeros años de vida" (10 años)

Material: pp. 72-77 del libro + pp. 65-70 del cuaderno. D.C.D. CS.3.1.30 / 31 / 32.

- **Mecánicas propuestas con bocetos ASCII en el chat**, tres opciones con tres verbos
  distintos. La autora: *"la opción a b y c me gustan"* → las tres se repartieron como las
  tres rondas: **decidir con criterio · apilar por jerarquía · comparar tamaños**.
- **Antes de construir preguntó dos veces por la variedad** (*"¿cómo vamos a hacer que sea
  variado?"* y *"¿para cada ronda sí va a tener variedad?"*). Se le respondió con la regla
  completa: banco + sorteo donde hay banco; cambiar **qué se pide** donde el contenido es
  único; y si una mecánica no admite ninguna de las dos, no entra.
  📌 **La variedad no es un extra: es parte del diseño y hay que explicarla ANTES, no
  demostrarla después.**
- **R1 "El sello de ciudadanía"**: la ley del Art. 12 está siempre en pantalla y cuatro
  personas aparecen **a la vez** (rejilla 2×2). Que sean cuatro a la vez y no cuatro
  seguidas es lo que respeta *una ronda = una jugada*.
  - El banco son **tipos sociales** del tema, no personajes históricos: así no se inventan
    biografías de personas reales.
  - El sorteo **obliga a que entre al menos un SÍ y un NO**: con cuatro iguales se
    acertaría sin leer.
- **R2 "La pirámide"**: un escalón llega puesto como ancla y se colocan los otros tres.
  - **Decisión de criterio:** el escalón de abajo —personas esclavizadas— **no lleva
    ilustración de personas**, va con un símbolo sobrio y el nombre del grupo. Avisado a
    la autora en el design-doc y aceptado.
- **R3 "El censo de 1830"**: cuatro barras y los cuatro números desordenados.
  - ⚠ **Es la ronda con menos variedad y se dijo de frente**, en el design-doc y en el
    chat: el libro da un solo cuadro de cifras. La alternativa ofrecida (el organigrama
    del Estado) sigue sobre la mesa.
- **Fuera del juego a propósito:** la pena de muerte para los 72 opositores (es del libro,
  pero no se hace un juego con una ejecución) y las actividades de respuesta abierta.

### Lo que cazaron las pruebas

- **Anti-repetición de la R2:** empezó con cap 3 sobre un banco de 4, y eso da una
  **rotación exacta** (1-2-3-4-1-2-3-4), previsible. Con cap 1 el sorteo queda libre entre
  los otros tres. **Es el mismo error que ya se cometió en juego-10**: con un banco de N y
  cap N−1 no hay azar, hay ciclo.
- **`qa-visual.js` fallaba en los 6 viewports** con *"no aparece input.ed-input"*, que
  parecía un juego roto: el script asumía que el campo del nombre está en el Home, y en un
  juego de **dos niveles** solo aparece tras abrir un libro. Se le añadió ese paso
  (y después del caso del teléfono vertical, porque con el overlay de rotación encima el
  clic en el libro se queda esperando). **Afecta también a juego-6**, que tenía el mismo
  problema.
- **Dos trampas del propio e2e**, no del juego: las fichas de la R2 empiezan por el emoji
  (`indexOf(nombre) === 0` nunca casa) y el nombre de la ciudad en la R3 es el primer
  `<span>` de la fila (leer el `textContent` entero da `"Riobamba—"`).
  📌 Las dos veces el primer síntoma fue *"la ronda da 0 estrellas"*, que parece un bug del
  juego. **Antes de tocar el juego, comprobar que el test sabe leer la pantalla.**

### Verificado (2026-11-17)

- format-lint **15/15** · qa-visual **sin overflow**, colchón mecánica↔acciones **67 px**,
  0 errores de página.
- e2e propio: partida **perfecta 3/3 · 11 ⭐** (con arrastre real de ratón en la R3) y
  partida **fallada 0/3 · 0 ⭐** con revelado en las tres rondas. 0 errores de consola.
- Variedad en 8 recargas: **8/8 juegos de personas distintos** en la R1 y **0 repeticiones
  consecutivas** del ancla en la R2.

### Pendiente

- ~~Las 12 ilustraciones~~ **entregadas el 2026-11-17 y cableadas**: llegaron a 1024×1024
  (1 181 KB) y se ven a 62 px → reescaladas a 220 px ⇒ **77 KB en total**. Como son
  figuras de cuerpo entero, la miniatura subió de 46 a 62 px y la tarjeta de 112 a 126.
- **Título definitivo** del juego.
- **Los otros 6 temas**: 2 del Libro 6 y 4 del Libro 7.

## 2026-11-17 (la autora juega el Tema 1)

- **"Ese espacio podemos aprovecharlo."** Medido: **63 px encima del enunciado y 0 debajo**
  — el bloque se comía todo el aire abajo y arriba quedaba una banda muerta. `paddingTop`
  de la ronda **70 → 40**: ahora 33 arriba y el resto repartido dentro de la mecánica.
  📌 Otra vez: **los espacios se miden en el lienzo, no se ajustan mirando la captura.**
- **La pirámide ahora se ARRASTRA** (*"aquí debería poder arrastrar y si ya lo coloqué
  también arrastrar luego"*): bandeja → escalón, escalón → otro escalón, y soltar fuera lo
  devuelve a la bandeja. El toque sigue de respaldo y, sobre un grupo ya puesto, lo saca
  dejándolo elegido. Verificado con ratón real en `.planning/arrastre-r2.js`.
  El bocadillo pasó a **"Arrastra cada grupo a su escalón"**: el CÓMO tiene que nombrar el
  gesto que de verdad se usa.
- **La R3 del censo, descartada**: *"la tercera ronda no me agrada, cambiemos de mecánica,
  está como muy aburrida"*. Se le habían ofrecido tres alternativas con bocetos y eligió
  **la línea del tiempo** (ordenar intercambiando). Las cifras de población quedan libres.
  📌 **Lo había avisado yo mismo en el design-doc** —era la ronda con menos variedad— y aun
  así se construyó. **Si una ronda nace con una pega conocida, mejor cambiarla antes de
  construirla.**

### Regla nueva de la autora (2026-11-17), guardada en la memoria global

> *"Deben ser diferentes las mecánicas porque si no me parece muy aburrido… todos los que
> van dentro del libro 6 deben tratar de ser los más distintos posibles porque son del
> mismo libro, y esto también debe pasar con el libro 7."*

No basta con tres verbos distintos **dentro** de un tema: los temas **vecinos del mismo
libro** también tienen que diferenciarse. Y si los verbos conocidos ya están gastados, la
autora pide **inventar una mecánica nueva y proponérsela** antes de construir.
Verbos ya usados en el **Libro 6**: decidir con criterio · arrastrar a su sitio · ordenar
intercambiando.

### 2026-11-17 (segunda tanda jugando)

- **Las ilustraciones, más grandes.** Idea de la autora: *"les recortas un poco del ancho y
  así las puedes alargar"*. El recuadro pasó de **62×62 a 56×72**: con `objectFit: cover`
  sobre una ilustración cuadrada se recortan los lados y la figura —que va de cuerpo
  entero y centrada— ocupa todo el alto. `objectPosition: center top` garantiza que, si
  sobra, se recorte por los pies y nunca por la cabeza. La tarjeta creció a 132 de alto.
  📌 **Para una figura de cuerpo entero, el recuadro va VERTICAL, no cuadrado.**
- **La línea del tiempo también se ARRASTRA** (*"aquí debo poder arrastrar para colocar el
  orden correcto"*). Soltar una tarjeta sobre otra posición la **inserta** ahí y corre las
  demás —que es como se ordena una línea del tiempo de verdad—, no un intercambio. El
  toque-intercambio queda de respaldo. Verificado con ratón real en
  `.planning/arrastre-r3.js`, incluido ordenar la línea entera solo arrastrando.
- **El revelado de la pirámide, rehecho** (*"no me agrada cómo se ven las respuestas
  correctas"*). Las pastillas *"aquí va: …"* colgaban de cada escalón, caían entre dos
  filas, pisaban el de abajo y **rompían la forma de la pirámide**. Ahora el orden correcto
  va en un **cartel "LA PIRÁMIDE VA ASÍ"** en el sitio de la bandeja, con ✓ en los que
  acertó y el número de puesto en los que no.
  📌 **Tercera vez en el repo que una pastilla colgando por fuera da problemas** (juego-10
  Tema 1, juego-10 Tema 4, aquí). **Regla: el revelado no cuelga de la ficha — o va dentro,
  en una franja reservada, o va en un cartel aparte.**

### 2026-11-17 (tercera tanda jugando)

- **El ✓/✗ faltaba donde más hace falta.** En la R1 se pintaban **los dos** botones al
  verificar (verde el correcto, rojo el elegido si fallaba) y **no se distinguía cuál había
  tocado el niño**: *"aquí debería indicarme con un visto si la opción que puse estaba bien
  o con una x si estaba mal"*. Ahora la marca va **dentro del botón que él eligió**, más un
  distintivo en la esquina de la tarjeta. Se añadió también a la R2 (dentro del escalón) y
  a la R3 (junto al año), para que las tres rondas se lean igual.
  📌 **Pintar la respuesta correcta no basta: hay que marcar LA SUYA.**
- **El arrastre de la línea del tiempo, en dos correcciones seguidas.** Primero pidió poder
  arrastrar; se hizo que al soltar insertara. Luego: *"si arrastro una opción deberían
  moverse las demás para que esa entre en el espacio que deseo colocar"* → las demás se
  apartan. Y por último: *"quiero poder arrastrar la tarjeta, no como se baja de lugar sino
  arrastrar y luego yo colocarla"* → la versión que reordenaba **en vivo** mientras movías
  el dedo se sentía como que la tarjeta saltaba sola. **La forma buena: la tarjeta se
  levanta y sigue al dedo, las demás se apartan para enseñar el hueco, y solo al SOLTAR se
  reordena.**
  📌 Las posiciones de referencia se **congelan** al empezar el arrastre: con las tarjetas
  apartándose, medirlas en vivo da un destino que baila.
- **Y una corrección más del arrastre:** *"no me gusta ese efecto de que coloco la tarjeta
  y luego salta; simplemente la coloco y déjala ahí"*. Al soltar, el desplazamiento volvía
  a cero **con transición** y la tarjeta se veía saltar a su hueco. Ahora la transición de
  `transform` solo existe **mientras se arrastra** y solo en las tarjetas que se apartan;
  al soltar, todo es instantáneo y la tarjeta se queda donde la dejaste.
  📌 **Una animación de acomodo después de soltar se lee como que el juego te mueve la
  pieza.** El viaje se anima cuando la pieza va SOLA a su sitio (el aterrizaje de
  juego-15), no cuando el niño ya la puso donde quería.
- **El salto seguía, y la causa real era otra.** Quitar la transición no bastó: **el dedo
  casi nunca suelta justo en el centro del hueco**, así que entre el punto donde sueltas y
  el sitio donde cae la tarjeta hay decenas de píxeles, y esa diferencia se veía como un
  salto instantáneo. La solución es la que ya tiene el repo: **la tarjeta ATERRIZA** —
  viaja esos píxeles en 140 ms con `element.animate()` y `fill: "backwards"`. Empezar otro
  arrastre corta el vuelo.
  📌 Afinado: **no es lo mismo "no animar" que "no saltar".** Lo que molesta es el
  teletransporte; el viaje corto desde donde soltaste hasta el hueco es justo lo que lo
  evita. Verificado midiendo el desplazamiento tras soltar: 54 px a mitad de vuelo y 0 al
  final (`.planning/aterrizaje-r3.js`).
- **El salto no era el de la tarjeta arrastrada: era el de la de arriba.** La autora lo
  precisó: *"yo arrastro la opción y suelto el clic y la opción que se encuentra arriba
  salta"*. Causa: mientras arrastrabas, las demás se **apartaban** una distancia fija (el
  alto de la tarjeta que llevabas) y al soltar el reordenado las movía la distancia real —
  y **las tarjetas no miden todas igual** (unas ocupan un renglón y otras dos), así que la
  diferencia se veía como un salto.
  **Solución:** ninguna tarjeta se desplaza durante el arrastre (el destino solo se
  **marca**), y al soltar **todas viajan** de su sitio viejo al nuevo en 150 ms
  (`aterrizarTodas`, patrón FLIP: se guardan los rectángulos antes de reordenar y se
  anima la diferencia después).
  ⚠ Hay que **cancelar las animaciones vivas** de cada tarjeta antes de lanzar las nuevas:
  dos animaciones de `transform` sobre el mismo elemento se pisan y una quedaba clavada en
  destino — se veía justo como el salto que se quería quitar.
  📌 **De QA:** medir las posiciones justo después de soltar **no distingue un salto de un
  viaje**, porque la animación arranca en el fotograma siguiente. Lo que lo distingue es la
  posición **intermedia** (`.planning/sin-saltos-r3.js`, comprueba que a los 60 ms cada
  tarjeta está entre su sitio viejo y el nuevo).

## Tema 2 del Libro 6 ("Revolución Marcista") — lo aprendido

- **La autora eligió ronda por ronda, con bocetos ASCII en el chat.** Pidió alternativas
  para la 2.ª y la 3.ª antes de quedarse con «El Ecuador partido» y «La Carta de la
  Esclavitud». No se construyó nada hasta su OK de cada una.
- **El material del libro se perdió al recortarse la conversación y se recuperó del
  registro de la sesión**, no pidiéndoselo otra vez. Ahora está copiado en el design-doc
  (§3.1): es la única fuente de los datos del tema.
- **Un gesto bonito no es un ejercicio.** La idea de rasgar la Carta se avisó como floja:
  romper el papel por sí solo no hace pensar. Lo que la salvó fue que **no se rompe donde
  sea, sino donde piden**, y para saberlo hay que leer.
- 🐛 **Callejón sin salida en la R3**: romper un renglón que una consigna posterior iba a
  pedir dejaba esa consigna sin solución. Lo destapó una **captura de pantalla** del
  recorrido completo, no el e2e, que fallaba "bien" por otro lado.
- 🐛 **El detector de solapes medía texto invisible**: `opacity: 0` en el padre no baja la
  opacidad **calculada** del hijo. Un "✓ sin solapes" puede venir de medir lo que no se ve.
- 🐛 **`qa-visual.js` se quedaba en el Home** al haber **varios temas**: ninguno viene
  preseleccionado y ENTRAR sale apagado. Arreglado en la `_PLANTILLA` y propagado a
  juego-6 y juego-12 — el arreglo anterior (abrir el libro) **no se había propagado**.
