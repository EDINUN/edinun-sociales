# MEMORY.md — Bitácora de juego-10 "Ecuador megadiverso" (título provisional)

## 2026-08-12 — Creación desde `_PLANTILLA` · Tema 1 completo

- Clonado de `juegos/_PLANTILLA/`. Slug `juego-10` (hueco libre; los saltos de
  numeración son intencionales de la autora). Guía **Yaku** por el ciclo del elenco
  (10 mod 4 = 2), no por temática.
- La autora pidió **3 temas → 3 botones**, con **edades distintas por tema**. Solo
  entregó el material del **Tema 1**; los otros dos quedan en "Próximamente".
- **Tema 1 = "Recursos naturales y derechos de la Tierra"** (Tema 2 del libro),
  **8 años**. Material: pp. 78-79 (megadiversidad y flora/fauna de las 4 regiones) y
  cuaderno pp. 69-72 (zonas del territorio, cóndor, cuadro resumen).
- **Mecánicas aprobadas por la autora ronda por ronda**, con bocetos ASCII en el chat:
  se le ofrecieron 3 opciones por ronda.
  - R1 → eligió **"Mapa vivo"** (arrastrar la especie a su región).
  - R2/R3 → dijo *"me gusta A y C"* sobre las opciones de la R2, así que **"El ascensor
    del Ecuador"** quedó de R2 y **"Ficha del descubrimiento"** de R3.
  - Descartadas: "Foto-safari" (prima de la lluvia de juego-13) y "Guardaparques"
    (el libro trae 7 amenazas y solo ~4 acciones que cuidan → banco desbalanceado).
- **9 ⭐ máximo** (4 + 2 + 3), +1 por elemento resuelto bien.
- Ella pidió **"construye el juego"** sin esperar la aprobación del design-doc; el doc se
  escribió igual (`.planning/juego-10-design.md`) y queda para revisión posterior.

### Decisiones de contenido

- **26 especies excluidas del banco de la R1 por ambigüedad**: el cuadro de la p. 72
  repite muchas en dos regiones (cedro, laurel, caoba, palo santo, monos, loros,
  curiquingues, atún…) y tendrían dos respuestas correctas. Misma regla que los montes
  Urales en juego-13. Quedan 57 ítems limpios.
- Fuera también **naranja/mandarina junto a naranjilla** y **plátano junto a banano**: a
  los 8 años no se distinguen entre sí.
- **La R2 no lleva contador "1 de 2".** Va sin marcador: el estándar no define uno e
  inventarlos ya costó una corrección en juego-4.
- **Los colores de las 4 regiones no salen del libro** (su cuadro no fija paleta): se
  usan los 4 del ecosistema EDINUN, los mismos de juego-13.
- ⏳ **Pendiente de visto bueno:** el criterio de distractores de la R3. El dato correcto
  siempre es del libro; el distractor sale del libro cuando hay alternativa real y, cuando
  no, es una negación evidente (marcada `// negación` en el `.jsx`). Nunca una cifra
  inventada.

### Bugs cazados durante la construcción

- **El guía salía Domi en vez de Yaku.** `app.character || "yaku"` no funciona: `app.jsx`
  (shell, no se toca) inicializa `character: "domi"`, que es truthy. Se usó la forma de
  juego-8: `app.character && app.character !== "domi" ? app.character : "yaku"`.
  **juego-1 arrastra todavía esa misma forma rota** con Yaku — revisar si se retoma.
- **`el.click()` no sirve para probar el arrastre**: solo dispara `click`, sin pointer
  events, y la mecánica vive en `onPointerDown/Up`. El e2e usa `page.mouse` real.
- **`qa-visual.js` no mide el panel del mapa**: solo escanea `button`, `img` y elementos
  `position:absolute`, y el panel es un hijo de flex. Su "gap 140" es el de las fichas de
  la bandeja; el colchón real del panel (54 px) hubo que medirlo aparte.

### Verificación (2026-08-12)

`format-lint` 19/19 · `qa-visual` sin overflow en los 6 viewports · e2e propio: partida
perfecta 3/3 · 9 ⭐ · 100 % (arrastre real), partida fallada con revelado en las 3 rondas
(respaldo tap), ronda parcial que **suma sin restar** y "¡UPS!" sin estrellas, 6 recargas
con 0 repeticiones consecutivas, 0 errores de consola.

## 2026-08-13 — Revisión visual de la autora (5 correcciones)

Todas reportadas mirando el juego corriendo, después de la primera entrega:

1. **"Los cuadritos de las regiones están muy alargados"** → zonas de `minHeight: 176` a
   **126**. Lo que las estiraba era la miniatura de la ficha: apilaba emoji sobre nombre y
   gastaba una línea entera. Ahora el emoji va **al lado** del nombre.
2. **"Los cuadros de las especies muy anchos"** → fichas de la bandeja de **138×70** a
   **104×62**.
3. Efecto colateral del punto 1: con las fichas ya juntas, el **✓/✗ colgando** (`top:-8`) y
   la **pastilla de la región** (`bottom:-9`) se **montaban sobre la ficha vecina**. Los dos
   pasaron a ir **dentro del flujo** de la ficha.
4. **"¿Por qué hay algo al lado que dice Zona Antártida? Está súper feo"** + **"las opciones
   casi no se notan, es como que estuvieran muy brillantes"** → la R2 pasó a **una sola
   columna de 6 franjas** con relleno **crema opaco**. Eran blanco translúcido al 14 % sobre
   el fondo verde: sin opacidad no hay contraste con el lienzo.
5. **"¿A qué mapa se refiere?"** (el bocadillo decía *"Arrastra la ficha sobre el mapa"*) →
   **"Arrastra la ficha hasta su región."**. El panel son 4 zonas de color, no una silueta
   reconocible del Ecuador: el CÓMO no puede nombrar algo que el niño no ve.
   ⏳ Queda abierto si se dibuja la **silueta real del Ecuador**; ahí sí volvería "mapa".

6. **"Las zonas deben ir creciendo hacia arriba cada que muevo una ficha"** → el mapa quedó
   **anclado abajo**, la fila con `alignItems: flex-end` y el alto de cada zona **calculado**
   como `118 + 26 × nº de fichas` (no un `minHeight` fijo: con un fijo el cajón solo habría
   crecido al meter la 4ª). Cada ficha sube su zona 26 px con el borde inferior clavado en
   y=522; el panel va 138 → 164 → 190 → 216 → 242. La bandeja se centra en el hueco de
   arriba.
   ⚠ **Cuatro intentos hasta acertar, uno por reporte de la autora:**
   1. `minHeight: 126` fijo → no crecía nunca.
   2. Base **62** + 26 por ficha → crecía, pero el cajón vacío quedaba como una tira pegada
      al rótulo (*"los cuadritos deben ser más grandes… eso está maaaal"*).
   3. Base **118** pero con el alto **por zona** (cada cajón contando SUS fichas) → los
      cuatro quedaban de alturas distintas (*"no debe crecer solo uno, deberían crecer
      todos, mira lo feo que están"*).
   4. ✅ Alto **compartido** por las 4 zonas = `118 + paso × maxEnZona`. Crecen parejas.
   **Las tres condiciones van juntas: base grande + crecer + crecer todas iguales.**
   ⚠ Y las fichas **dentro** del cajón se veían diminutas — reportado **tres veces** (*"se
   ven muy pequeñas"*, *"cuando coloco en las regiones se hace demasiado pequeño"*, *"con el
   fin de que las letras se vean más grandes"*). Empezaron en emoji 11 / texto 7,5 / alto 22.
   ⚠ En el camino probé ponerlas **en fila** (emoji al lado del nombre) para ahorrar alto, y
   la autora lo cortó: *"¿por qué cuando lo arrastran a su región no dejas que se arrastre
   así como está, es decir arriba el emoji y abajo la descripción?"*. **Tenía razón por
   partida doble:** en fila, el nombre se quedaba con ~60 px y las palabras largas se
   partían ("Murciélag/os", "Chuquiragu/a"), lo que me había obligado a bajar esos nombres a
   9 px. **Apiladas, el nombre usa el ancho completo (~82 px)** y entra a cuerpo **11** —un
   punto más grande que en la bandeja— sin partirse ni excepciones por nombre.
   **Final:** emoji **16**, nombre **11**, alto **58**, base del cajón **84**, paso **62**
   igual antes y después de verificar (el ✓/✗ y la pastilla van absolutos sobre la franja
   que el `paddingBottom` reserva siempre, así nada salta al verificar).
   ⚠ También hizo falta: panel a **468 px** con los 4 cajones al **mismo ancho** (~104),
   canal de mar a 10, y `overflowWrap: anywhere` de red de seguridad.
   **Lección:** el tamaño de la ficha, el ancho del cajón y el largo de los nombres son un
   mismo problema — al tocar uno hay que recorrer **todo el banco** midiendo, no mirar dos
   capturas. Para eso quedó el script `anchos-j10.js` (las 54 especies, una por una).
   **Y la forma que pedía la autora resultó ser también la solución técnica**: conviene
   probar su propuesta antes de optimizar por mi cuenta.
   ⚠ El ✓/✗ y la pastilla de la región van en **su propia línea** dentro de la ficha: en la
   fila del nombre le robaban ancho y lo cortaban ("Naranjil…", "Anguila").
   ⚠ Margen al soltar **asimétrico** (`padY 22` / `padX 8`): vertical generoso para que un
   niño de 8 atine, horizontal corto porque las zonas están a 7 px y un margen ancho suelta
   la ficha en la vecina.
7. **"¿Qué es ese bocadillo, qué feo eso que dice hueco ahí?"** — el CÓMO de la R3 decía
   *"Toca la opción correcta en cada hueco"*. **"Hueco" es jerga de diseño** (el slot vacío
   de un formulario), no palabra de un niño de 8 años. Quedó **"Toca las tres / respuestas /
   correctas."**, en 3 renglones cortos: de paso el globo pasó de 182 px de ancho a 110 y su
   holgura contra la ficha subió de **20 px a 56**.

8. **"¿Por qué Gallinazos está con un corazón negro? ¿En qué se relaciona?"** — lo había
   puesto como "pájaro negro" y quedó en 🖤, que no relaciona nada. Al revisar los 57
   emojis uno por uno aparecieron **nueve más igual de malos**: 🐜 oso hormiguero (¡esa es
   su presa!) · 🌶️ achiote (parece ají) · 🐍 anguilas (parece culebra) · 🕊️ fragatas y
   albatros (paloma blanca) · 🐤 piqueros (pollito) · 🪶 águilas arpías (una pluma suelta) ·
   🎋 caña de azúcar (bambú de Tanabata) · 🪵 caucho (un tronco cortado).
   **Regla nueva:** si existe el emoji de la especie se usa; si no, va el de su **grupo**
   (🐦 ave · 🦅 rapaz · 🦜 lorífero · 🐟 pez · 🐾 mamífero · 🌳 árbol · 🌿 planta · 🌸 flor ·
   🥔 tubérculo · 🌾 cereal); **nunca un parecido que nombre otra cosa**.
   **Papaya, taxos y pepino de mar salieron del banco**: 🍈 es un melón y 🥒 la verdura, y no
   había alternativa que no mintiera. Banco **57 → 54** (Costa 12 · Sierra 14 · Amazonía 15
   · Galápagos 13).

9. **"Los cuadros de las zonas territoriales están muy anchos"** → las franjas de la R2 de
   **380 → 300 px**. La tarjeta de la definición se queda en 446: es el enunciado, no una
   opción tocable.
   Al hacerlo, su bocadillo (*"Toca la franja en el dibujo"*) quedó desfasado —ya no hay
   corte ni "dibujo", son seis opciones en lista— y pasó a **"Toca la que creas /
   correcta."**. Tercer bocadillo corregido por lo mismo.

**Regla que dejan los puntos 5, 7, 8 y 9:** lo que el niño lee o ve **no puede contradecir
lo que hay en pantalla**. Ni un bocadillo que nombre "el mapa" (que no está dibujado), "el
hueco" (jerga nuestra) o "el dibujo" (que ya no existe), ni un emoji que diga otra especie.
**Al cambiar una mecánica hay que releer su bocadillo.**

**Variedad medida (20 recargas seguidas):** 20 combinaciones distintas de 20, **0
repeticiones**, **0 especies repetidas respecto de la recarga anterior** y 47 de las 54
especies vistas. Reparto por región de las 80 fichas: Costa 20 · Sierra 18 · Amazonía 26 ·
Galápagos 16.

### Y una corrección de reglas, no de estética

**"¿Por qué me salen dos preguntas? ¿No se supone que debe ser solo 1?"** — tenía razón.
La R2 encadenaba **2 definiciones** y eso rompe la regla dura del repo: **una ronda = UNA
jugada** (errores aprendidos de la skill, nacida del error de juego-4). Yo había dejado esa
duda planteada, ella no la contestó y decidí ponerlas igual apoyándome en juego-13 T3R1 —
mal: la regla manda sobre el precedente.

Ahora es **una sola definición** y, como se resuelve con un toque, vale **+3 ⭐** de golpe
(criterio de la calculadora de juego-13 T2R2). **Máximo del tema: 9 ⭐ → 10 ⭐** (4 + 3 + 3).
Anti-repetición de la R2: de "2 de 6, cap 3" a **"1 de 6, cap 5"** (para 1 ítem, cap = N−1).

**Reverificado:** format-lint 19/19 · qa-visual sin overflow · e2e 3/3 · 10 ⭐ · 100 %,
partida fallada con revelado, ronda parcial que suma sin restar, 6 recargas sin repes
(6 zonas distintas en la R2 gracias al cap 5) · auditoría de espacios en 3 rondas ×
5 viewports sin un solo solape ni texto recortado.

### Pendientes (al cierre del Tema 1)

1. **Título definitivo** (el actual, "Ecuador megadiverso", es provisional del asistente).
2. **Material de los temas 2 y 3** + su edad. Sus verbos no pueden repetir
   arrastrar-al-mapa · tocar-franja · elegir-en-huecos.
3. Probar el **contador real con PHP** (`php -S localhost:8000`) y **borrar `visits.txt`**
   antes de subir.

## 2026-08-14 — Tema 2 "Inicio del siglo XXI" (11 años)

La autora entregó el material del **Tema 1 del libro** (pp. 112-117 + cuaderno 103-106) y
lo pidió **para 11 años** — en el mismo juego que el Tema 1, que es para 8. Confirmado:
**la edad varía por tema dentro del mismo juego**, la fija ella tema por tema.

### Cómo se eligieron las mecánicas

Bocetos ASCII en el chat, **una ronda a la vez**, 3 opciones por ronda:

- **R1 → "Del sucre al dólar"** (ordenar una línea del tiempo tocando dos tarjetas).
  Descartadas: emparejar personajes de las monedas con su oficio (habría necesitado datos
  que el libro NO trae: solo lista los 12 nombres) y un mazo de "¿verdad o mito?".
- **R2 → rechazó la primera tanda entera**: *"dame mecánicas más divertidas las siento muy
  aburridas"*. Las tres eran variantes de **clasificar** (unir causa-efecto, atrapar con
  canasta, marcar compromisos). La segunda tanda tenía movimiento y consecuencia en
  pantalla y eligió **"¿Dónde se esconden los gases?"** (buscar con lupa en una escena).
  Descartadas: cerrar llaves con el mar subiendo en vivo y reventar gases que suben.
- **R3 → "Estira el gráfico"**. Descartadas: sellar pasaportes (emigración/inmigración) y
  subir la barrera de una aduana a los países del bloque.

> 📌 **Aprendizaje: "divertido" para 11 años = consecuencia visible, no clasificación.**
> Tres mecánicas distintas que por dentro son "pon cada cosa en su grupo" se sienten la
> misma y se sienten aburridas. Lo que aceptó tiene o **exploración** (la lupa), o
> **manipulación directa de un objeto** (estirar el gráfico), o **deducción encadenada**
> (ordenar). Al proponer, variar el TIPO de interacción, no el tema de las tarjetas.

### Decisiones de contenido

- **`J10_HITOS` (R1): 9 hitos**, todos con año explícito y **todos con año distinto**.
  Fuera: el **feriado bancario** (el libro lo fecha "finales del siglo XX", sin año; con
  1994 en el banco el orden sería ambiguo — entra si ella confirma el año) y la **deuda de
  febrero 2023** (chocaría con las monedas de diciembre 2023).
- ⚠️ **La p. 114 del libro no cuadra consigo misma**: deuda total 48 129 millones y FMI
  8 100 millones "que equivale al 33,3 %" — pero 8 100 de 48 129 es el **17 %**. El 33,3 %
  solo cuadra sobre la deuda con **organismos multilaterales**. Avisado a ella; el gráfico
  se rotula *"La deuda del Ecuador con los organismos"* y usa **solo porcentajes**. Ella no
  contestó ese punto y dijo "genera el juego", así que va la recomendación, declarada.
- ⚠️ **La CAN con Chile**: el libro la da con Bolivia, Ecuador, Colombia, Perú y Chile.
  Chile salió hace décadas. Se juega con **el número del libro (5)**: es su material y es
  lo que van a evaluar. Avisado.
- **Nada de ganado en la R2**, ni como respuesta ni como decorado. El metano del ganado no
  está en el libro y marcar una vaca como "no contamina" sería enseñar algo discutible.
  Solo las dos causas que el libro nombra: combustibles fósiles y deforestación.
- **11 ⭐ máximo** (4 + 4 + 3). Que un tema dé 10 y otro 11 es correcto: cada tema es su
  propia partida.

### Bugs cazados por las herramientas (ninguno a ojo)

- **La tarjeta levantada se salía de la zona al verificar.** Si el niño toca una tarjeta y
  va directo a ¡VERIFICAR!, quedaba desplazada y su ✗ (que cuelga del borde) se salía 6,6 px
  de la zona de mecánica. `verificar()` ahora hace `setSel(null)` primero.
- **La lupa ampliaba a TODOS los elementos dentro del aro** y dos vecinos crecían a la vez
  tapándose. Ahora amplía **solo el más cercano** — que además es lo que una lupa hace.
- **La escena del campo tenía 3 pares a menos de 60 px**: al ampliar uno cubría al vecino.
  Se rehizo en **tres filas de profundidad**. Regla nueva: **60 px libres en un eje**
  (13,4 % en x o 20,5 % en y) entre elementos de una escena con lupa.
- **La fila del fondo flotaba en el cielo**: `sueloAlto` era 30/32/34 y los elementos de
  y≈42-56 caían por encima del horizonte. Subido a **56/58/62**.
- **Dos `.click()` en el mismo `page.evaluate` no intercambian nada** (React no ha aplicado
  el primer `setSel` cuando corre el segundo). Los toques del test van en evaluates
  separados. Era un fallo del test, no del juego.
- **El reporte sale DOS veces en el DOM** (la tabla de pantalla + `PrintableReport`, oculto
  con `aria-hidden`). El primer aserto contaba 6 filas y "fallaba" con el juego correcto.

### Verificación (2026-08-14)

`format-lint` 19/19 · `qa-visual` sin overflow en los 6 viewports · e2e propio del Tema 2:
partida **perfecta 3/3 · 11 ⭐ · 100 %** con las dos variantes de la R3 (barras y pastel,
esta forzada por `localStorage` porque sale 1 de cada 5), partida **fallada 0 ⭐** con
revelado y respuesta correcta en las 3 rondas, **12 recargas con 0 repeticiones
consecutivas** en las 3 rondas · auditoría de espacios en **3 rondas × antes/después de
verificar × 5 viewports**, con la lupa paseada por los 9 elementos de cada escena: 0
elementos fuera del lienzo, 0 solapes, 0 texto recortado.

### Pendientes

1. **Título definitivo** del juego (sigue siendo provisional; "Ecuador megadiverso" ya no
   cubre el Tema 2).
2. **Ilustraciones del Tema 2**: 9 iconos de hito (120×120) + 3 escenas (920×600) + 12
   objetos sueltos. Los prompts se le entregaron el 2026-08-14. Mientras tanto van emoji.
3. **Material del Tema 3** + su edad. Su verbo no puede repetir ninguno de los **seis** ya
   usados.
4. ¿Entra el **feriado bancario** en la R1? Necesita año.
5. Probar el **contador real con PHP** y **borrar `visits.txt`** antes de subir.

## 2026-08-28 — Revisión de la autora sobre el Tema 2 (3 cambios)

Jugó el Tema 2 y pidió tres cosas, todas aplicadas:

1. **"Aquí quiero poder arrastrar."** (R1) — la línea del tiempo se ordenaba tocando dos
   tarjetas para intercambiarlas. Ahora **se arrastra**: la tarjeta flota siguiendo el dedo
   y una **barra dorada** marca dónde va a caer. El **toque queda de respaldo** (sigue
   intercambiando), igual que la R1 del Tema 1 lleva respaldo tap.
   - ⚠ La columna **no se reordena en vivo** y los rectángulos de los slots se **congelan**
     al empezar el arrastre. Reordenar mientras arrastras mueve las tarjetas por debajo del
     dedo y obliga a recalcular el desplazamiento en cada paso (da tirones).
   - ⚠ El desplazamiento se **acota** al alto de la lista (±20 px): sin tope, tirando muy
     arriba o muy abajo la tarjeta se salía de la zona de mecánica.
   - Bocadillo: "Toca dos tarjetas para cambiarlas de lugar." → **"Arrastra la tarjeta hasta
     su lugar."**
2. **"Quiero que los emojis se vean más grandes."** (R2) — elemento **46 → 58 px** y emoji
   **28 → 38**. Eso arrastró toda la geometría de la escena:
   - escena **448×292 → 458×326**, lupa **52 → 58** y ampliación **1,6× → 1,45×**;
   - la separación mínima entre elementos sube de **60 a 72 px** en un eje (15,7 % en x o
     22,1 % en y), así que **las tres escenas** pasaron a tres filas de profundidad, no solo
     la del campo;
   - el **horizonte del campo** sube a `sueloAlto: 70` (sus tres filas van todas en suelo);
   - el **rótulo del revelado** se dibuja **arriba** del elemento cuando abajo no cabe.
   📌 **Aprendizaje:** agrandar el elemento de una escena con lupa no es cambiar un número —
   toca el tamaño de la escena, el radio de la lupa, la ampliación, la separación mínima,
   la línea de horizonte y dónde cabe el rótulo. Hay que volver a medir todo el reparto.
3. **"Qué feo eso que dice Estira, cámbialo."** (R3) — el enunciado de las barras decía
   *"Estira cada barra hasta cuántos países tiene ese grupo."* → **"Completa cada barra con
   los países que tiene ese grupo."**. La ronda pasa a llamarse **"El gráfico vivo"** en los
   documentos (el nombre interno no se ve en pantalla, pero se alinea).

### Dos cosas más que salieron al verificar (2026-08-28)

- **La barra de destino quedaba tapada** por la propia tarjeta que flota: iba a `left/right:
  -3` y la tarjeta la cubría entera. Ahora **sobresale 16 px por cada lado** y la lista bajó
  de 452 a **436 px** para que ese saliente (468 en total) siga cabiendo en los 470 de la
  zona. Regla: **un indicador que va debajo del elemento arrastrado tiene que ser más ancho
  que él.**
- **El auditor de espacios daba un falso positivo**: contaba el aro de la lupa como si se
  saliera 0,8 px de la zona, cuando la escena lo **recorta** con `overflow: hidden`.
  `getBoundingClientRect()` devuelve la caja SIN recortar. El auditor ahora intersecta el
  rectángulo con el de todos los ancestros que recortan. ⚠ Vale para cualquier juego con
  una zona de `overflow: hidden`.

### Reverificación (2026-08-28)

`format-lint` 19/19 · `qa-visual` sin overflow en los 6 viewports · e2e del Tema 2 con la
R1 resuelta **arrastrando** (partida perfecta 11 ⭐ · 100 % en las dos variantes del
gráfico), partida fallada 0 ⭐ con el **respaldo tap**, 12 recargas sin repeticiones ·
auditoría de espacios en 3 rondas × 5 viewports, midiendo también **durante el arrastre**
(tirando la 1ª y la 4ª tarjeta a los extremos) y con la lupa paseada por los 9 elementos de
cada escena: nada fuera, 0 solapes, 0 texto recortado.

## 2026-09-02 — El fondo de la escena de la R2, de dos bloques a uno

**"¿Por qué está de dos colores, celeste y camel? No me gusta eso, arréglalo."**

La escena se pintaba con un `div` de cielo y otro de suelo, con una **línea dura** a media
altura. Leído en pantalla no parecía un paisaje sino **dos rectángulos de colores** pegados.

Ahora es **un solo degradado de 5 paradas** (celeste → neutro → tierra) sin costura, con un
tinte distinto por escena para que ciudad / bosque / campo se sigan distinguiendo.

📌 **Y de paso desapareció un problema anterior por la raíz.** El 2026-08-14 hubo que subir
`sueloAlto` (30/32/34 → 56/58/70) porque los elementos de la fila del fondo quedaban
*"flotando en el cielo"*. Ese problema **solo existía porque había un horizonte visible**:
sin línea de horizonte, ningún elemento puede quedar del lado equivocado. Vale la pena
preguntarse si un ajuste que se está peleando con un elemento visual no se resuelve mejor
quitando ese elemento.

El reparto en **tres filas de profundidad** se mantiene: eso no era decorativo, es lo que
garantiza los **72 px de separación** que evitan que la lupa tape al vecino.

## 2026-09-02 — Tema 3 "El clima de nuestro planeta" (12 años) · **juego completo**

La autora entregó el material del **Tema 4 del libro** (pp. 48-51 + cuaderno; D.C.D.
CS.4.2.3) y lo pidió **para 12 años**. Con esto **los 3 botones quedan hechos**: se acabó
el "Próximamente" que `estandar-visual.md` §8 no admite como estado final.

### Cómo se eligieron las mecánicas

Bocetos ASCII en el chat, 3 opciones para la R1… y **eligió las tres**: *"me gustaron las 3
jajaj construye el juego"*. Se repartieron como las tres rondas, ordenadas de menor a mayor
exigencia — **concepto → tipos → deducción**:

- **R1 «El noticiero»** — *lanzar* la tarjeta a CLIMA o a TIEMPO ATMOSFÉRICO.
- **R2 «La ruleta de los climas»** — *girar* un aro con los 6 tipos hasta la flecha.
- **R3 «El lugar misterioso»** — *destapar* sobres con pistas y deducir el lugar.

> 📌 **Aprendizaje: proponer tres opciones que sean tres TIPOS de interacción distintos
> —manipulación con consecuencia física, manipulación directa de un objeto y deducción—
> deja abierta la posibilidad de que valgan las tres.** Es lo contrario del caso de la R2
> del Tema 2, donde las tres opciones eran variantes de *clasificar* y las rechazó en
> bloque. Cuando cada opción aporta un tipo distinto, no compiten: se reparten.

Al proponer se le avisó de que el gesto de la R1 (lanzar una carta a un lado) es el mismo
que ya aprobó en **juego-13 T3 R1 «El muro»** — repetición *entre juegos*, no dentro de
juego-10. Lo eligió igual.

### Decisión de contenido: qué NO entra, y por qué

⚠️ **El Tema 2 de este mismo juego ya juega el cambio climático** (su R2 busca lo que
calienta el planeta; su línea del tiempo incluye el Acuerdo de París). Si el Tema 3 volviera
sobre los gases, los dos botones se sentirían el mismo juego repintado. Reparto aplicado:
el Tema 2 se queda el **cambio climático** y el Tema 3, el **clima como sistema** (qué es,
tipos, dónde se dan). Por eso quedan fuera del Tema 3 los **desastres naturales** con su
gráfico 1970-2024 y los **tres instrumentos jurídicos** (1992 · 1997 · 2015) — que además
solo darían un ejercicio de *ordenar*, el verbo de la R1 del Tema 2.

**Actividades del cuaderno que no se gamifican:** la 2 (subrayar afirmaciones: su verbo
sería *elegir*, ya usado, y el contenido es de acuerdos), la 5 (dibujo: respuesta abierta) y
la 6 (ordenar los instrumentos: verbo ya usado). La 1 y la 3 están en la R1 y la R3; la 4
alimenta las pistas de templado y continental.

### Decisiones de contenido

- **`J10_CL_NOTICIAS` (R1): 12 noticias**, 6 de clima y 6 de tiempo. ⚠️ **No son textuales**:
  el libro solo da un ejemplo. Lo textual es el **criterio** de la p. 48 (clima = promedio de
  ≥30 años · tiempo = un momento y lugar concretos, cambia en horas) y cada noticia lo aplica
  con una marca temporal explícita. Mismo precedente que los ejercicios de cálculo de
  juego-13 T2R2: **el molde es del libro, los enunciados se construyen con él.** Declarado a
  la autora; si prefiere solo frases literales, la R1 se queda con una y hay que cambiarle
  la mecánica.
- ⚠️ **Los emoji están repartidos a propósito entre los dos grupos** (los dos usan símbolos
  del tiempo: 🌧️ ☀️ ❄️ 🌨️ 🍂 🏔️ / 🌂 🌡️ 🌫️ 💨 🧊 ☁️). Si el clima llevara paisajes y el
  tiempo, nubes y lluvia, **el emoji resolvería la ronda sin leer la noticia**. Es una vuelta
  de tuerca a la regla del emoji del Tema 1: además de no mentir, no puede delatar.
- **`J10_CL_CLIMAS` (R2): los 6 tipos** con sus características **literales** de la tabla de
  la p. 49. Nombres en **singular** ("TROPICAL", "ALTA MONTAÑA") porque así los escribe el
  cuaderno en la actividad 3; la tabla los lista en plural.
- **`J10_CL_LUGARES` (R3): 6 lugares, uno por clima.** ⚠️ **Japón, y no España o Italia** —que
  la actividad 4 también da como templados— porque **🗾 nombra a Japón** y para España no
  había emoji que no mintiera (🫒 es una aceituna, 🏖️ una playa). Manda la regla del emoji.
- **`J10_CL_PISTAS`: 3-4 pistas por clima**, con las `clave: true` marcadas. La ronda obliga
  a incluir una clave, si no puede quedar sin solución (ver abajo).
- **10 ⭐ máximo** (4 + 3 + 3).

### Bugs cazados por las herramientas (ninguno a ojo)

- 🐛 **El aro de la R2 no giraba.** Al brazo de la pastilla le faltaba el `+ ang`
  (`rotate(i·60)` en vez de `rotate(i·60 + ang)`): la ranura seleccionada cambiaba, pero las
  pastillas se quedaban quietas y solo rotaba su **texto**. Se veía como un aro con las
  palabras dando vueltas sobre sí mismas.
- 🐛 **El respaldo tap de la R2 no existía en la práctica.** El aro captura el puntero al
  empezar (`setPointerCapture`, necesario para que el arrastre no se corte al salirse del
  círculo) y, con el puntero capturado, el **`click` posterior se dispara sobre el aro y no
  sobre la pastilla**: el toque se perdía y la ruleta se quedaba en su posición inicial
  —que a propósito nunca es la respuesta—, así que **la ronda era imposible de acertar sin
  arrastrar**. Ahora el toque se resuelve en el `onPointerUp` del propio aro (hit-test de
  cuál pastilla está bajo el dedo) y las pastillas van con `pointerEvents: "none"`.
  📌 **Lo cazó el e2e: la partida "perfecta" daba 7 ⭐ en vez de 10.** A ojo no se veía —la
  pantalla parecía correcta— y las capturas tampoco lo mostraban. **Regla: cuando una ronda
  tiene respaldo tap, el e2e debe jugar una partida con el gesto principal y otra con el
  respaldo**, si no el respaldo se publica roto.
- 🐛 **Las pastillas cruzaban el borde del aro.** Con el brazo a 86 px la esquina externa
  llegaba a 131 px del centro y el aro mide 130 de radio: las de las 2 y las 4 pisaban el
  filo dorado. Brazo a **83** y buje a **78**. No lo detecta ningún script (está dentro del
  lienzo): salió de mirar la captura.
- 🐛 **Un `{/* comentario */}` JSX delante del elemento raíz de un `return`** es error de
  sintaxis (son dos hijos sin fragmento) y tumbaba la página entera. Va como `//` encima del
  `return`.
- ⚠️ **La R3 podía quedarse sin solución.** Las 3 pistas salen del banco del clima objetivo,
  y algunas son compartidas: *"Tiene cuatro estaciones"* vale para templado **y** continental.
  Si salían tres compartidas y las opciones incluían los dos lugares, había dos respuestas
  correctas. Remedio: (1) las 4 opciones tienen siempre climas distintos y (2) el sorteo
  **obliga a incluir una pista `clave`** — un dato que en la tabla solo cumple ese clima.

### Verificación (2026-09-02)

`format-lint` 19/19 · `qa-visual` sin overflow · e2e propio del Tema 3:
- **Partida perfecta 3/3 · 10 ⭐ · 100 %**, con **arrastre real de mouse** en la R1 (4 cartas)
  y **giro real en arco** sobre el aro de la R2.
- **Partida fallada 0/3 · 0 ⭐** usando el **respaldo tap** en la R2, con revelado correcto en
  las tres rondas (4 ✗ con el lado correcto en la R1; la correcta ✓ y la elegida ✗ a la vez
  en la R2 y la R3).
- **Ronda parcial** (3 noticias bien + 1 mal): **+3 ⭐ sin quitar nada**, dot rojo.
- **Auditoría de espacios: 5 viewports × 3 rondas × antes/después de verificar** — 0
  elementos fuera del lienzo, 0 solapes, 0 textos recortados, 0 errores de página.
  Colchones mecánica ↔ acciones **47 px** (R1 y R3) y **59 px** (R2).
- **8 recargas jugando la partida entera**: 0 repeticiones consecutivas en las 3 rondas
  (8 combinaciones de noticias, 6 climas, 7 juegos de pistas) y 6 juegos de opciones
  distintos en la R3.

### Pendientes

1. **Título definitivo** del juego. Ahora urge más: "Ecuador megadiverso" describe solo el
   Tema 1, y el Tema 3 habla del clima del **planeta entero**, no del Ecuador.
2. **Ilustraciones**: siguen faltando las del Tema 2 (9 iconos de hito + 3 escenas + 12
   objetos, prompts entregados el 2026-08-14) y ganarían las del Tema 3 (6 iconos de clima
   para la tarjeta de la R2 y 6 ilustraciones de lugar para la R3). Nada bloquea.
3. **Visto bueno** al criterio de las 12 noticias de la R1 (construidas con el criterio del
   libro, no copiadas) y al criterio de distractores de la R3 del Tema 1.
4. ¿Entra el **feriado bancario** en la R1 del Tema 2? Sigue necesitando año.
5. Probar el **contador real con PHP** y **borrar `visits.txt`** antes de subir.

## 2026-09-04 — Segunda revisión del Tema 2 (6 cambios)

1. **"Se pierden mucho"** (R2) — los emojis pálidos (nube, fuente, casa) se fundían con el
   degradado. Cada elemento va ahora sobre una **placa clara** (blanco 66 %, borde y
   sombra) y el fondo bajó un punto de claridad. La placa funciona con emojis claros Y
   oscuros, y de paso avisa de que el elemento se puede tocar.
   📌 **Regla:** el contraste de un elemento no puede depender del color del fondo. Si el
   fondo cambia (y aquí cambió tres veces), lo que salva es darle base propia al elemento.
2. **"Emojis variados, no siempre los mismos"** (R2) — cada escena tiene ahora su **banco**
   (7-8 que calientan + 10 de decorado) y cada partida saca **4 + 5** barajados en 9 huecos
   fijos. Medido: 12 recargas → **12 combinaciones distintas**.
   ⚠ Ningún emoji puede ser "calienta" en una escena y decorado en otra: el e2e deduce la
   respuesta por emoji. Hay un chequeo que lo verifica.
3. **"¿Qué significan esos valores?"** (R3) — las tres cifras de referencia salían sueltas y
   se leían como adorno. Llevan rótulo: **"Una de estas va en cada barra/parte:"**.
   📌 **Regla:** un dato que el niño necesita para jugar tiene que decir para qué está.
4. **"La quema… distribuye bien los espacios"** (R2) — los rótulos del revelado iban con
   `nowrap` y los nombres largos se salían de su placa pisando al vecino. Ahora tienen
   **ancho fijo de 96 px** y parten en dos líneas; además se acortaron cinco nombres
   ("La quema del bosque" → **El fuego**, "Los troncos talados" → **Los troncos**…).
5. **"Ronda más abajo"** — el bloque quedaba a **8 px** de las pastillas de tema y a **51**
   del enunciado. Baja de `top: 52` a **74** (30 arriba, 29 abajo).
   📌 El `52` del estándar se fijó **antes de que existieran las pastillas**. Regla nueva,
   ya en el `format-lint`: **52 sin pastillas · 74 con pastillas**.
   ⏳ **Pendiente propagar a juego-3, juego-4, juego-5 y juego-13**, que el lint ya marca.
6. **Bocadillos** — el de la R2 pasó a **"Eres detective. / Mira y marca / las cuatro."**
   (eligió esa entre ocho propuestas). El de la R3 decía *"Arrastra los puntos del
   gráfico"* y no lo entendía: el niño no ve "puntos" ni sabe qué es un "gráfico".
   ⚠ El problema de fondo era que **un solo bocadillo servía para barras Y pastel**, y por
   eso salía vago. Se añadió al orquestador un `setBubble`: **una ronda puede reemplazar su
   propio bocadillo** (se limpia al pasar de ronda y al reiniciar). Ahora dice
   *"Arrastra la bolita hasta que cada barra tenga su número."* o *"…cada parte…"*.
   📌 **Regla:** si un texto tiene que servir para dos casos distintos y por eso queda
   vago, el arreglo no es buscar mejores palabras — es dejar que cada caso tenga el suyo.

### El test también se arregló

El e2e calculaba los aciertos de la R1 con **su propia contabilidad** de los intercambios;
si un toque se perdía, la cuenta se desviaba de la pantalla y el test mentía sobre el juego
(dio un "0 esperado / 1 en el reporte" que parecía un bug del juego y no lo era). Ahora
**relee el orden real del DOM** antes de verificar, y los asertos contrastan lo esperado
**contra las estrellas del reporte**, no contra la suposición.
📌 **Regla:** un test que lleva su propio modelo del estado acaba comprobando el modelo, no
el producto. Leer siempre de la pantalla antes de afirmar.

### 7. El arrastre tenía que VERSE (mismo día)

*"Cuando muevo, las opciones deben moverse para que se note que estoy moviendo."*

La columna se quedaba quieta mientras arrastrabas y solo aparecía la barra de destino: no
se leía como un cambio de orden. Ahora las tarjetas que están **entre el origen y el
destino se apartan** justo el alto que dejó libre la arrastrada, con transición de 0,17 s,
y la barra se dibuja **dentro del hueco** que acaban de abrir.

⚠ Sigue **sin reordenarse el arreglo** hasta que sueltas — solo se desplazan visualmente.
Reordenar en vivo mueve las tarjetas por debajo del dedo y obliga a recalcular el
desplazamiento en cada paso.
⚠ La barra pasó a `zIndex: 55` (por **debajo** de la tarjeta arrastrada, que va en 60):
cruzándola por encima parecía un tachado sobre el texto.

📌 **Regla:** un indicador de destino no sustituye al movimiento. Si el usuario no ve
moverse aquello que está reordenando, no percibe que esté reordenando nada.

---

## 2026-09-23 — Títulos definitivos de los temas y cuatro arreglos de la autora

### Los tres temas ya tienen título

La autora los fijó de una: **"Recursos naturales y derechos de la Tierra"** (sin el "los"
que traía) · **"Inicio del siglo XXI"** (sin el subtítulo largo del libro) · **"El clima de
nuestro planeta"** (el que ya estaba). Los tres van completos en el **`catLabel`** (reporte).
En el **botón del Home** entran enteros los temas 2 y 3, pero el 1 se queda con "Recursos
naturales": con el título completo la fila entera subía de 87 a 134 px de alto —los tres
botones comparten altura— y la autora lo cazó en el acto (*"el botón naranja está muy
grande"*). En el HUD siguen las pastillas cortas, que es lo único que cabe ahí.
📌 **Regla:** el título del tema y la etiqueta del botón no tienen por qué ser el mismo
texto. El botón lo manda el sitio disponible; el título completo vive donde sí cabe.
⚠ El subtítulo del libro ("…: globalización, democracia y unidad nacional") queda anotado
en el design-doc §11 como referencia de la fuente, no como título del tema.

### "Suena a pregunta y no hay signo de pregunta"

La descripción del Tema 3 era *"Qué es el clima, en qué se diferencia del tiempo y sus
tipos."* → **"El clima, sus tipos y su diferencia con el tiempo atmosférico."**
📌 **Regla:** las descripciones del Home van en **afirmativo**. Enumerar los contenidos
arrancando con "Qué es…", "En qué se diferencia…" lee como una pregunta a la que le
faltan los signos.

### Espacios que no eran parejos

- **Tema 1, R2:** la zona Antártida llevaba **7 px extra** de aire arriba para marcar que
  no es una capa del corte del territorio. La autora lo leyó como un error de maquetación
  (*"¿por qué hay más espacio entre subsuelo y zona Antártida?"*). Ahora los **seis huecos
  son iguales**: la Antártida se distingue por ir al final, no por el hueco.
- **Tema 3, R3:** las pistas y los lugares pasaron de **14 a 32 px** de separación. Son dos
  pasos distintos (abrir, luego elegir) y pegados se leían como una sola parrilla; la zona
  tenía aire de sobra por debajo.
📌 **Regla:** un espacio distinto se lee como un descuido, no como una categoría. Si dos
cosas son diferentes, diferenciarlas con su sitio o su forma, no con el hueco.

### "Todas lanzadas" (Tema 3, R1)

El aviso del mazo vacío decía *"¡Todas lanzadas! Toca ¡VERIFICAR!"* → **"Ya colocaste las
cuatro. Toca ¡VERIFICAR!"**. "Lanzadas" venía del nombre interno del verbo de la ronda
(*lanzar*), y los nombres de trabajo no se enseñan.

### La tarjeta tenía que ATERRIZAR, no aparecer (Tema 2, R1)

*"No me gusta que luego de arrastrar un hecho este como que salta al lugar en el que le
estoy colocando."* Al soltar se reordenaba la columna y la tarjeta aparecía de golpe en su
casilla. Ahora **viaja 190 ms** desde donde quedó el dedo hasta su sitio (medido en
pantalla: 35 → 21 → 7 → 0 px).

⚠ **Va con `element.animate()`, no con una transición CSS.** Con transición no se animaba
nada: para que arranque hace falta que el navegador **pinte** el fotograma del
desplazamiento inverso, y React aplica los dos cambios de estado antes de ese pintado — la
medición lo dejó claro (0 ms donde el dedo, 30 ms ya en destino). Lleva `fill: "backwards"`
para que el desplazamiento se aplique también antes del primer fotograma.
⚠ **Las demás tarjetas no se animan**: ya estaban apartadas justo en su sitio final, así
que cambian de casilla y de desplazamiento a la vez. Mientras dura el aterrizaje toda la
lista va **sin transición**; animar ese cambio simultáneo las hacía saltar un puesto y
volver.
⚠ **Empezar otro arrastre CORTA el aterrizaje en curso.** El primer intento lo bloqueaba
(para poder medir rectángulos quietos) y el e2e lo cazó enseguida: encadenando arrastres
rápidos se perdía uno y la partida "perfecta" daba 8 ⭐ en vez de 11.
📌 **Regla:** una animación de respuesta nunca puede tragarse el gesto siguiente. Si hay
que elegir, se corta la animación, no la acción del niño.

**Verificado:** e2e del Tema 2 OK (partida perfecta 11 ⭐ en las dos variantes de la R3,
partida fallada con revelado, 12 recargas sin repetir), format-lint 19/19, y medición de
los seis huecos de la R2 del Tema 1 (7,11 px los cinco).
