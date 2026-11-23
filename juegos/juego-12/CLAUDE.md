# CLAUDE.md — juego-12 "Estudios Sociales · Libros 6 y 7"

## Project

Carpeta autocontenida del repo `edinun-sociales`. Juego **multi-LIBRO**: el Home tiene
**dos niveles** (Libro → Tema), como `juego-6`. Guía por defecto **Andi**, por el ciclo
del elenco (`memory/orden-personajes.md`: 12 mod 4 = 0), no por temática.

> ⚠️ **Título PROVISIONAL: "Estudios Sociales · Libros 6 y 7"**, puesto para poder
> registrar el juego en el landing. Cuando la autora fije el definitivo hay que cambiarlo
> en 3 sitios: hero de `screens.jsx`, `<title>` de **ambos** HTML y el array `GAMES` del
> landing.

### Estructura que fijó la autora

| Libro | Actividades | Estado |
|---|:--:|---|
| Libro 6 | 3 | 1 hecha · 2 por definir |
| Libro 7 | 4 | ⏳ sin material |

| Libro · Tema | id | Edad | Estado |
|---|---|:--:|---|
| **6 · 1. Estado ecuatoriano en sus primeros años de vida** (D.C.D. CS.3.1.30 / 31 / 32) | `l6-t1` | **10** | ✅ 3 rondas · 11 ⭐ |
| 6 · 2 y 3 | — | — | ⏳ falta material |
| 7 · 1 a 4 | — | — | ⏳ falta material |

⚠ **El Libro 7 no se puede abrir todavía:** su botón sale apagado (patrón "Próximamente"
del estándar §8) porque no tiene temas. En cuanto llegue el primero, se añade a `LIBROS`
en `screens.jsx` y el botón se activa solo.

⚠ **El Libro 6 ya tiene un tema jugado en otro juego:** *"La Amazonía, nido de vida
silvestre"* (Tema 2 del Libro 6) está en `juego-6`. Si cae entre los tres de aquí, avisar
a la autora antes de duplicarlo.

⚠ **Verbos:** con 7 actividades no caben 21 gestos distintos. La regla —la misma que
`juego-6`, que también tiene 7— es **tres verbos distintos dentro de cada tema**, y que un
tema no repita los de su vecino. Entre libros distintos sí se puede reutilizar un gesto
con otro contenido.

Diseño: `.planning/juego-12-design.md`. Audiencia: `memory/audiencia_por_juego.md`.
Preferencias del usuario: `USER.md`.

## Running / bundle

HTML estático (React 18 + Babel Standalone desde unpkg). Sin build ni tests. Tras editar
cualquier `.jsx`, re-empaquetar (concatena los 5 `.jsx` en ambos HTML, idénticos):

```bash
node .planning/bundle.js
```
Invariantes del bundle: ningún `.jsx` con `</script>` literal **ni siquiera en un
comentario**; reescribe desde `<script type="text/babel">` hasta `</html>`.

## Arquitectura (game-screens.jsx)

`GameScreen` despacha por `app.currentCategory` (el id del tema) y monta **`J12Game`**,
el orquestador único que comparten todos los temas: recibe el arreglo de rondas por prop
y saca de él el nº de rondas. Chrome EDINUN estándar: HUD (logo 64 + ⏱ + ⭐), bloque
**Ronda en `top: 52`** (este juego **no** lleva pastillas de tema: con 7 temas no caben),
personaje/bocadillo, columna de acciones con `¡VERIFICAR!` vía `verifyRef` + estado
`busy`, overlay `¡EXCELENTE!/¡UPS!`, modales y reporte imprimible.

### Libro 6 · Tema 1 — `L6T1_ROUNDS` (3 rondas, 3 verbos)

- **R1 `L6T1R1Sello` — DECIDIR con criterio + ¡VERIFICAR!.** Cuatro personas **a la vez**
  en una rejilla 2×2 (tarjetas de 221 px) y, para cada una, SÍ o NO. Una ronda = UNA
  jugada: nunca cuatro jugadas seguidas (regla 8).
  - ⚠ **La LEY está siempre en pantalla** (los cuatro requisitos del Art. 12, en un panel
    sobre las tarjetas): la ronda se resuelve **leyendo**, no recordando.
  - **Banco `J12_PERSONAS`: 12 personas.** NO son personajes históricos, son los **tipos
    sociales que nombra el tema** (terrateniente criollo, jornalero indígena, artesano
    mestizo, montuvio, aguatero, barrendero, vendedora, clero, militar, comerciante). Sus
    datos aplican los requisitos del Art. 12 tal como los cita el libro.
  - ⚠ **El sorteo obliga a que entre al menos un SÍ y un NO**: con cuatro iguales se
    acertaría sin leer la ley.
  - El caso de la **mujer que cumple los cuatro requisitos y aun así queda fuera** es el
    que mejor enseña el tema (la p. 76 dice que se excluía "a las mujeres en general").
  - ⚠ La franja del **motivo del revelado** está reservada SIEMPRE (`minHeight: 15`), así
    la tarjeta no crece al verificar y nada salta.

- **R2 `L6T1R2Piramide` — APILAR por jerarquía + ¡VERIFICAR!.** Los cuatro escalones de la
  pirámide de la p. 74, con anchos crecientes (172 · 250 · 328 · 406). **Un escalón llega
  ya puesto** como ancla (varía cuál) y se colocan los otros tres ⇒ **+3 ⭐**.
  - ⚠ **El ancla es lo que da variedad sin inventar contenido**: la pirámide del libro es
    una sola. Mismo recurso que el artículo de la Constitución de juego-10.
  - ⚠ **El escalón de abajo NO lleva ilustración de personas**: símbolo sobrio y el nombre
    textual del grupo. No se dibuja una caricatura de personas esclavizadas.
  - **Se ARRASTRA**: bandeja → escalón, escalón → otro escalón, y soltar fuera devuelve el
    grupo a la bandeja. Tocar un escalón lleno lo vacía (todo lo colocado se puede quitar).
  - ⚠ **El revelado NO cuelga de cada escalón.** Las pastillas "aquí va: …" caían entre dos
    filas, pisaban el escalón de abajo y rompían la forma de la pirámide. Va en un cartel
    **"LA PIRÁMIDE VA ASÍ"** donde estaba la bandeja, con ✓ en los acertados y el número de
    puesto en los demás.

- **R3 `L6T1R3Linea` — ORDENAR intercambiando + ¡VERIFICAR!.** Cuatro hechos de los
  primeros años de la República, desordenados; se tocan **dos tarjetas para
  intercambiarlas**. ⭐ +1 por tarjeta en su sitio.
  - **Se ARRASTRA**: la tarjeta se **levanta y sigue al dedo**, las demás **se apartan**
    para enseñar el hueco donde va a caer, y al **soltar** se reordena (inserta, no
    intercambia). El toque de dos tarjetas las intercambia, de respaldo.
  - ⚠ **Las posiciones de referencia se CONGELAN al empezar el arrastre** (`slots`): las
    tarjetas se están apartando, así que medirlas en vivo daría un destino que baila.
  - ⚠ **Al soltar, la tarjeta ATERRIZA**: viaja en 140 ms desde donde la dejó el dedo
    hasta el centro de su hueco, con `element.animate()` y `fill: "backwards"` (una
    transición CSS no arranca: React aplica el estado nuevo antes del primer pintado).
    Sin esto **saltaba** —el dedo casi nunca suelta justo en el centro del hueco— y la
    autora lo reportó dos veces. Empezar otro arrastre **corta** el vuelo en curso.
    La transición de `transform` de las demás tarjetas solo vive mientras se arrastra.
  - ⚠ **Hubo una versión intermedia que se reordenaba EN VIVO** mientras movías el dedo y
    la autora la corrigió: *"quiero poder arrastrar la tarjeta, no como se baja de lugar
    sino arrastrar y luego yo colocarla"*. Se siente como que la tarjeta salta sola.
  - ⚠ **Las tarjetas no muestran el año mientras se juega**: deducir el orden ES el
    ejercicio. El año aparece al verificar, con el ✓/✗ y, si está mal, el puesto que le
    tocaba — **sin reordenar la columna**, para que el niño siga viendo su respuesta.
  - **Banco `J12_HITOS`: 5 hechos**, todos con **año explícito y todos distintos** (1830 ·
    1834 · 1835 · 1839 · 1843). Si dos compartieran año habría dos ordenaciones correctas.
    Entran 4 por partida: lo que cambia es **cuál se queda fuera** (FIFO de 1) más el
    barajado inicial, que nunca arranca ya ordenado.
  - ⚠ **SUSTITUYE a "El censo de 1830"** (estirar barras de población), que la autora
    descartó el 2026-11-17: *"la tercera ronda no me agrada… está como muy aburrida"*. Ya
    se le había avisado de que era la de menos variedad del tema. Las cifras de población
    (p. 73) quedan libres para otro tema.

### Estrellas

**+1 ⭐ por ELEMENTO resuelto bien**: R1 hasta 4 (personas) · R2 hasta 3 (escalones, el
cuarto es el ancla) · R3 hasta 4 (tarjetas) → **máximo 11 ⭐**. `onSolve(isCorrect, entry,
gained)` acepta el 3er parámetro. El `isCorrect` de la ronda = **ronda perfecta**. Fallar
nunca resta.

### Anti-repetición

FIFO en `localStorage`, una clave por ronda:
`edinun_j12_l6t1_r1_v1` (4 personas de 12, cap 6) · `edinun_j12_l6t1_r2_v1` (1 ancla de 4,
**cap 1** — con cap 3 salía una rotación exacta 1-2-3-4, previsible: mismo error que ya se
cometió en juego-10). `edinun_j12_l6t1_r3_v1` (cuál de los 5 hechos se queda fuera, cap 1).
⚠ Regla de cap: para un SUBCONJUNTO de K, nunca cap = K.

### Imágenes

**12 ilustraciones cuadradas** `assets/persona-<id>.jpg` — **ya entregadas por la autora
(2026-11-17)**. Sirven para la R1 **y** para la R2 (la pirámide reutiliza las figuras).

- Llegaron a **1024×1024 (1 181 KB en total)** y se ven a 62 px: reescaladas a **220 px**
  con calidad 0.86 ⇒ **77 KB en total**, y en pantalla se ven igual. Los originales
  quedaron fuera del repo (scratchpad de la sesión). Script:
  `.planning/optimizar-personas.js <carpeta-de-respaldo> [lado]`, que **nunca pisa un
  respaldo existente** (en juego-15 una segunda pasada se comió los originales).
- Las figuras son de **cuerpo entero**, así que el recuadro es **VERTICAL (56×72)**, no
  cuadrado: `objectFit: cover` recorta los lados y la figura ocupa todo el alto, y
  `objectPosition: center top` hace que, si sobra, se recorte por los pies. La tarjeta
  mide **132** de alto. (Empezó en 46 px cuadrados y no se distinguía nada.)
- `J12Retrato` conserva el **emoji del oficio** como respaldo si falta un archivo.

**Textos (regla dura):** el **enunciado** dice **QUÉ** y el **bocadillo** dice **CÓMO**.

## Contrato del shell

- `app.jsx` (shell, NO tocar): enruta `home → character → game → results`.
- `screens.jsx`: `HomeScreen` de **dos niveles** desde `LIBROS` (un libro sin temas sale
  apagado), `CharacterScreen` (preselecciona por `LIBRO_CHAR`, Andi en los dos libros),
  contador de visitas, `CosmosBg`. `start()` fija `currentCategory` (id del tema) y
  `currentCatLabel` (`"Libro 6 · <tema>"`).
- `game-screens.jsx`: expone `GameScreen`/`ResultsScreen` en `window`. `markFirstAttempt()`
  en la 1ª respuesta; `incrementGamesCompleted()` al terminar.

## Contador de visitas

`counter.php` idéntico a los demás; cae a `localStorage` sin PHP. `visits.txt`
gitignoreado — borrarlo antes de subir a producción.

## QA

```bash
node juegos/_PLANTILLA/.planning/format-lint.js juego-12   # 15/15 OK
node juegos/_PLANTILLA/.planning/qa-visual.js  juego-12    # 6 viewports
node juegos/juego-12/.planning/e2e-l6t1.js                 # partida perfecta y fallada
node juegos/juego-12/.planning/shot-l6t1.js <carpeta>      # capturas para mirar a ojo
```

**Verificado el Libro 6 · Tema 1 (2026-11-17):**
- **Partida perfecta:** 3/3 rondas · **11 ⭐**, con **arrastre real de ratón** en la R3.
- **Arrastre verificado con ratón** en la R2 (`arrastre-r2.js`, cuatro casos) y en la R3
  (`arrastre-r3.js`, insertar + respaldo tap + ordenar la línea entera arrastrando).
- **✓/✗ en las tres rondas**: en la R1 la marca va en **el botón que tocó el niño** (antes
  se pintaban los dos y no se distinguía cuál había elegido) más un distintivo en la
  esquina de la tarjeta; en la R2, dentro del escalón; en la R3, junto al año.
- **Partida fallada:** 0/3 · **0 ⭐**, con revelado en las tres rondas.
- 0 errores de consola (los 404 de las ilustraciones que faltan están filtrados).

⚠ **Dos trampas del e2e, ya resueltas, para no repetirlas:**
1. Las fichas de la R2 empiezan por el **emoji**, así que `texto.indexOf(nombre) === 0`
   nunca casa: hay que usar `>= 0`.
2. El nombre de la ciudad en la R3 es el **primer `<span>` de la fila**; leer el
   `textContent` de la fila entera y cortar por espacios da `"Riobamba—"`, porque se pega
   al valor de la derecha.

## Libro 6 · Tema 2 — "Revolución Marcista" (10 años)

Tres rondas con tres verbos que **no existen en el Tema 1** (allí se gastaron *decidir
sí/no*, *arrastrar a su sitio* y *ordenar*). Regla de la autora: dentro del mismo libro,
los temas deben diferenciarse al máximo.

| Ronda | Verbo | ⭐ |
|---|---|---|
| R1 "La bandera de marzo" | componer (el símbolo se dibuja al tocar) | 4 |
| R2 "El Ecuador partido" | tocar en el mapa | 2 |
| R3 "La Carta de la Esclavitud" | rasgar (se rompe pasando el dedo) | 3 |

**Invariantes de este tema:**

- **El mapa sale de datos reales**: contorno del Ecuador continental de Natural Earth
  (`ne_10m_admin_0_countries`, dominio público), plate carrée, Douglas-Peucker 0.008°
  (335 puntos), y las cuatro ciudades en coordenadas reales. **Nunca dibujarlo a ojo ni
  generarlo como imagen**: no sería tocable por lugar. Las manchas de color son zonas de
  influencia, **no fronteras** — el libro no las da.
- **Los cuatro renglones de la Carta los aprobó la autora uno por uno.** El libro dice que
  la Carta de la Esclavitud cae, pero **no da su articulado**: están redactados solo con
  hechos que el libro sí afirma. No añadir ni cambiar renglones sin pasar por ella.
- **El renglón de los esclavos no se pide nunca** y sobrevive al papel roto: la manumisión
  llega en **1851, con Urbina**. Es el remate del tema, no un descuido.
- **R3 SIN TURNOS Y SIN ORDEN.** Los **tres pedidos se ven a la vez** sobre el papel y el
  niño rompe los renglones que cayeron, en el orden que quiera. **Cayeron TRES** (Flores ·
  el impuesto de los tres pesos · el apartamiento de la Iglesia); el de los esclavos es el
  único que **no** cayó, y ese es el remate del tema.
  - **No hay tope de roturas** y **¡VERIFICAR! está siempre disponible**. Con el tope de
    tres, el único error posible era el renglón de los esclavos y la ronda se volvía casi
    infallable; abierta, cada renglón es una decisión.
  - ⭐ **+1 por renglón que cayó y se rompió** (máx. 3). **Ronda perfecta = los tres y
    ninguno de más**: romper también el de los esclavos sigue dando 3 ⭐ pero no es
    perfecta (fallar no resta, pero tampoco se premia el "rompo todo").
  - Lo que se arrastra **se rompe y el agujero se queda**; el veredicto de todas llega
    **junto, al pulsar ¡VERIFICAR!**: ✓ en el agujero que tocaba, ✗ con el texto en el que
    no cayó, y en **ámbar** los que había que romper y siguen enteros.
  - ⚠ **Los pedidos NO se marcan al romper** (nada de ✓ ni tachado): sería juicio antes de
    ¡VERIFICAR!.
  - ⚠ **Tres intentos descartados por la autora el 2026-11-19**, todos por pedir los
    renglones **de uno en uno y en un orden**:
    1. *Roto para siempre* → el pedido cuyo renglón ya no estaba se descartaba y la ronda
       acababa en dos: *"aquí no se supone que se rompe 3?"*.
    2. *Roto y vuelto a pegar* → el DEROGADO desaparecía: *"cuando sale DEROGADO debe
       quedarse así"*.
    3. *El equivocado no se rompe* → *"si ya arrastro una debe salir… DEROGADO… y luego le
       doy verificar y ahí me sale si fue correcto o incorrecto todas las opciones"*.
    Y el diagnóstico final, que es el que mandó: *"cuántos derogados correctos aparecen por
    ronda, porque si solo hay 1 entonces yo debería derogar solo 1, no las 3 opciones
    porque dos obviamente voy a estar equivocada"*. **El orden era la trampa**: romper un
    renglón que sí cayó, pero en el turno de otro pedido, se contaba como error.
  - Lo vigila `.planning/reglas-r3.js` (orden indiferente · agujeros que se quedan · romper
    de más no es ronda perfecta · BORRAR · ningún ✓ antes de verificar). Sustituye a
    `sin-callejon-r3.js` y `borrar-r3.js`, que probaban reglas que ya no existen.
- **La Carta tiene botón «BORRAR»**, como la bandera de la R1: devuelve el papel **entero**.
  Sale apagado hasta la primera rotura.
  - ⚠ Para que quepa: renglones de **56 px** (eran 62), `gap` 8 y `paddingTop` 26. Con 62
    el botón se salía del lienzo por abajo.

**Correcciones de la autora jugando el Tema 2 (2026-11-19):**

- **R1 no se entendía.** El enunciado decía *"Levanta la bandera del 6 de marzo"* y en
  ningún sitio se contaba cómo era: había que saberlo de memoria. Ahora el panel **"Así
  era la bandera"** está siempre a la vista con la descripción (blancos los lados, azul el
  centro) y las tres ciudades, de las que se **cuenta** el número de estrellas. Enunciado:
  *"Arma la bandera de la Revolución Marcista."* La bandera vacía lleva el aviso **"toca un
  color de abajo"**, que se va con el primer color.
- **R2 pide DOS gobernantes, no cuatro** (⭐ 2). Con cuatro se hacía larga. El mapa sigue
  enseñando las cuatro ciudades. Banco de 4, **cap 1**.
  - ⚠ **Se verifica UNO A UNO**: se coloca el primero, se pulsa ¡VERIFICAR!, se ve el ✓/✗
    en su ciudad y **recién entonces** viene el segundo; el último ¡VERIFICAR! cierra la
    ronda llamando a `onSolve`. Lo pidió así la autora. Mientras no se verifica, la ciudad
    elegida va en **celeste** y se puede cambiar tocando otra.
  - ⚠ **Solo se marcan las ciudades jugadas**: pintar de rojo también las vacías parecía
    que había fallado cuatro veces.
  - ⚠ **El pedido va en una BANDA centrada sobre el mapa**, no en una columna a la
    izquierda: así dejaba un hueco grande entre el cartel y el mapa.
  - ⚠ **La banda lleva SOLO dos líneas**: el rótulo *"¿Dónde mandaba?"* con sus puntos y el
    nombre del gobernante. La tercera —*"Toca en el mapa la ciudad desde la que
    gobernaba"*— la quitó la autora el 2026-11-23: repetía el bocadillo.
  - ⚠ **El acuse "Elegiste Quito. Pulsa ¡VERIFICAR!" va POR EL BOCADILLO**, no en la banda
    (lo pidió así la autora el mismo día). Para eso `J12Game` tiene estado `dice` y pasa
    `say` a la ronda: si la ronda no dice nada, el bocadillo lleva su CÓMO fijo, y al
    cambiar de ronda o reiniciar vuelve solo. El bocadillo va con `whiteSpace: "pre-line"`,
    así que el salto de línea se escribe con `
`.
- **R3 decía "Ya no queda nada que romper"** con renglones aún a la vista: lo que se acaba
  son las órdenes, no el papel. Ahora dice **"Listo. Pulsa ¡VERIFICAR!"**, el enunciado es
  **"Rompe lo que la revolución derribó."** y la consigna lleva el rótulo **"¿Cuál
  rompes?"** con el contador, como el *"¿Dónde manda?"* de la R2.
- **⭐ del tema: 4 + 2 + 3 = 9.**
- **R1 tiene botón «borrar» a la vista.** Tocar un cuartel ya lo vaciaba, pero eso no se
  ve: con la bandera llena la paleta se apaga y no quedaba forma visible de rectificar.
  El botón deja la bandera **como al empezar**: vacía los tres cuarteles **y pone las
  estrellas a cero**. Borrar a medias se siente roto (lo corrigió la autora).
  - ⚠ **Entre turno y turno el mapa queda LIMPIO** y **ninguna ciudad se bloquea**: solo se
    ve la marca del último verificado, y se borra en cuanto el niño toca otra. Antes la
    ciudad ya usada se quedaba marcada y no se podía volver a elegir, aunque fuera la
    correcta para el segundo gobernante. Lo vigila `.planning/mapa-limpio-r2.js`.
  - ⚠ **Las cuatro ciudades van en coordenadas reales** y están comprobadas, no puestas a
    ojo: `scratchpad/comprobar-ciudades.js` verifica que la proyección del juego coincide
    con el cálculo hecho de cero, que cada punto cae **dentro** del polígono del Ecuador y
    las relaciones norte/sur/este/oeste. Al preguntar la autora, el mayor desvío era de
    **1,1 px sobre 288** (coordenadas redondeadas); ahora van exactas.
- **Los bocadillos no pueden nombrar el dedo.** El mismo juego se juega en celular y en
  computadora: *"Pasa el dedo por el renglón"* pasó a *"Arrastra a lo ancho del renglón y
  se rompe"*. Vale para cualquier aparato.
  - ⚠ **La marca se borra SOLA** a los 1,3 s: se ve un momento para que el niño sepa si
    acertó, y al cambiar de gobernante el mapa sale limpio. Lo vigila
    `.planning/limpia-sola-r2.js`, que comprueba las dos mitades: que la marca **se vea**
    al verificar y que **se haya ido** poco después sin tocar nada.
  - **Escala del mapa `ESC = 1.05`.** A 0,78 sobraba espacio por los cuatro lados; al
    quitar la tercera línea de la banda quedó sitio para agrandarlo otro poco.
  - 📌 **La autora dudó dos veces de la posición de los puntos.** Están comprobados con
    `.planning/comprobar-ciudades.js`, que además de la proyección y del punto-en-polígono
    contrasta las **seis distancias entre ciudades** con las reales (gran círculo): error
    **0,0 %** en las seis. Es la comprobación que convence, porque no depende del encuadre.
- **R3: los renglones miden 62 px y la letra 13,5.** Con 46 px y 11,5 sobraba un hueco
  grande debajo del papel (lo marcó la autora en rojo sobre una captura).
- **Los textos del Tema 2 van en PASADO.** *"¿Dónde manda?"* y *"la ciudad donde manda"*
  pasaron a **mandaba**: es 1859, ya no manda nadie de esos. Lo cazó la autora.
- **El avance se marca con PUNTOS, no con "2 de 3".** Ese número se leía de dos maneras
  ("vas por el pedido 2" o "llevas 2 hechos") y la autora lo leyó como lo segundo. Los
  puntos llenos son los que ya hizo: una sola lectura posible. Helper `J12Puntos`.
- ⚠ **Asideros de prueba `data-qa`** en el pedido de la R2 y en la consigna de la R3. Los
  selectores por posición (`span:nth-child(2)`, `span:last-child`) se rompieron al meter
  los puntos dentro del rótulo: pasaron a casar con un punto y devolvían texto vacío.
