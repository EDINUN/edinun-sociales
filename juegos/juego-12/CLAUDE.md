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
| Libro 6 | 3 | ✅ las 3 hechas |
| Libro 7 | 4 | ⏳ 3 de 4 hechas |

| Libro · Tema | id | Edad | Estado |
|---|---|:--:|---|
| **6 · 1. Estado ecuatoriano en sus primeros años de vida** (D.C.D. CS.3.1.30 / 31 / 32) | `l6-t1` | **10** | ✅ 3 rondas · 11 ⭐ |
| **6 · 2. La Revolución Marcista** | `l6-t2` | **10** | ✅ 3 rondas · 9 ⭐ |
| **6 · 3. El preámbulo del siglo XX** (D.C.D. CS.3.1.37 / 38 / 39) | `l6-t3` | **10** | ✅ 3 rondas · 8 ⭐ |
| **7 · 1. La Revolución Liberal** | `l7-t1` | **11** | ✅ 3 rondas · 8 ⭐ |
| **7 · 2. Insurgencia, cambio social y velasquismo** (D.C.D. CS.3.1.45 a 48) | `l7-t2` | **11** | ✅ 3 rondas · 9 ⭐ |
| **7 · 3. Transformación agraria** (D.C.D. CS.3.1.52 a 56) | `l7-t3` | **11** | ✅ 3 rondas · 9 ⭐ |
| 7 · 4 | — | — | ⏳ falta material |

⚠ **El Libro 7 ya tiene DOS temas**, así que al entrar hay que **elegir uno**: con más de
un tema `openLibro` no preselecciona y ENTRAR queda apagado. Cada vez que un libro estrena
tema hay que revisar los scripts de QA de sus temas anteriores, que entraban directos.

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

⚠ **Bocadillo de la R1 del Tema 2:** *"Pinta la bandera tocando los colores de abajo."*
El anterior (*"Toca un color y entra en el cuartel vacío"*) le pareció feo a la autora el
2026-11-23: "cuartel" es la palabra técnica del escudo, no la que usa un niño.

📌 **El cartel "ASÍ ERA LA BANDERA" SE QUEDA.** La autora dudó el 2026-11-23 de si hacía
falta; al recordarle que ella misma lo pidió el 19-11 porque sin él había que saberse la
bandera de memoria, decidió dejarlo. No quitarlo sin volver a preguntárselo.

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
node juegos/juego-12/.planning/espacios-todo.js            # solapes y desbordes, los dos temas
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
- 📌 **La Carta se queda en CUATRO renglones y el ejercicio NO varía entre partidas**
  (decisión de la autora, 2026-11-23). Medido con `.planning/variedad-l6t2.js` sobre 8
  partidas: R1 paleta **8/8** órdenes distintos · R2 **6/8** parejas de gobernantes
  distintas (de 12 posibles) · R3 **7/8** órdenes del papel, pero **siempre los mismos
  cuatro renglones**, así que la respuesta correcta nunca cambia.
  - Se le ofreció un **quinto renglón** sacado de su propio material (*"Robles abolió la
    contribución de los indígenas"*, así que en 1845 seguía en pie, igual que la
    esclavitud): con 3 caídos + 2 supervivientes se enseñarían 4 por partida y el renglón
    que hay que dejar entero cambiaría. **Dijo que lo dejáramos así.** No montarlo sin
    volver a preguntárselo.
  - Con el material entregado, **5 es el máximo posible** sin inventar mandatos: el libro
    solo da tres cosas que cayeron en 1845 y dos que no.
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
  - ⚠ **NO hay cuadro de pedidos.** Lo hubo (primero *"¿Cuál rompes?"* de uno en uno,
    luego *"ESTAS 3 CAYERON"* con los tres numerados) y la autora lo quitó el 2026-11-23:
    *"¿crees que es necesario el cuadro ESTAS 3 CAYERON o lo podemos quitar?"*. Tenía
    razón: era **casi un espejo del papel** (*"el impuesto que hizo estallar el 6 de
    marzo"* ≈ *"Cada hombre paga tres pesos al año"*), así que la ronda se resolvía
    traduciendo línea por línea en vez de pensar.
  - 📌 **Consecuencia asumida, dicha a la autora:** sin ese cuadro la ronda **no** se
    resuelve solo con lo que está en pantalla; hace falta lo que el niño aprendió del
    tema. Si al probarlo resulta duro, la vuelta atrás acordada es **una sola línea** de
    ayuda, no las tres.
  - **El enunciado PREGUNTA**: *"¿Qué mandatos de la Carta cayeron en 1845?"* y, debajo en
    pequeño, *"Son tres."*
  - ⚠ **NO son "decretos".** La autora lo propuso el 2026-11-23 y no cuadra: la Carta de la
    Esclavitud **era la Constitución de 1843**, así que sus renglones son **mandatos** de
    esa Constitución, no decretos. Es el término que eligió al explicárselo. Lo eligió la autora entre cuatro redacciones el 2026-11-23; la anterior
    (*"Rompe los 3 renglones que la revolución derribó"*) le pareció fea. El CÓMO sigue
    en el bocadillo, así que la regla QUÉ/CÓMO se mantiene.
  - ⚠ **1845, no 1859**: la Carta cae con la Revolución Marcista. El 1859 es el de la R2.
  - ⚠ **El cartel del revelado cuelga del papel en ABSOLUTO** (`top: 100%`), no ocupa
    sitio en la columna: reservándole hueco, el enunciado subía demasiado (*"el enunciado
    está muy arriba"*), y sin reservarlo el papel saltaba al verificar.
  - ⚠ **El bloque va CENTRADO en el carril** (`justifyContent: "center"`, sin
    `paddingTop` fijo): con el padding quedaba más aire debajo del papel que encima del
    enunciado, y la autora lo marcó.
  - ⚠ **El cartel del revelado ocupa sitio desde el principio** (invisible hasta
    verificar): si apareciera de golpe empujaría el papel hacia abajo justo cuando el niño
    mira sus respuestas.
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
- **BORRAR vive en la COLUMNA DE ACCIONES**, debajo de SALIR, no suelto bajo la mecánica
  (lo pidió la autora el 2026-11-23). Lo monta `J12Game`: la ronda le pasa por `onClear`
  un `{ fn, puede }`. **Va SIEMPRE a la vista y se apaga** mientras no haya nada que
  borrar: con la primera versión, que solo lo mostraba al romper algo, la autora no lo
  encontraba (*"yo no veo el botón de borrar"*).
  - ⚠ **Deshace SOLO LO ÚLTIMO**, nunca el trabajo entero (lo pidió la autora el
    2026-11-23, primero para la Carta y enseguida *"sí, igualalo en la ronda 1 también"*).
    Pulsándolo varias veces se va hacia atrás paso a paso.
    - En la **Carta**: quita el último renglón roto.
    - En la **bandera**: la R1 guarda una **foto del estado antes de cada cambio**
      (`hist`) y BORRAR vuelve a la anterior. Con fotos da igual si lo último fue un color
      o una estrella; distinguirlo a mano era el camino frágil. El botón de la paleta
      ("🧽 borrar") desapareció: ahora está en la columna.
  - ⚠ Lo vigila `.planning/borrar-y-bocadillo.js`.
  - ⚠ **El padre NO puede limpiar `dice`/`limpiar` en un efecto con `[round]`**: los
    efectos del hijo corren **antes** que los del padre, así que borraba lo que la ronda
    acababa de registrar y el botón no aparecía nunca. Se limpia al **avanzar de ronda** y
    en `confirmRestart`.
  - ⚠ En la R1 (la bandera) el BORRAR sigue junto a la paleta; si se quiere, se mueve igual.

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
  - ⚠ **Al cerrar el SEGUNDO gobernante el bocadillo CAMBIA** a *"¡Listo! Esos eran los
    dos gobiernos."*: son solo dos, así que seguir diciendo *"Toca en el mapa la ciudad…"*
    es pedir algo que ya no se puede hacer. Lo marcó la autora.
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
    así que el salto de línea se escribe con la barra invertida y una ene.
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
- **R3: los renglones miden 68 px y la letra 14,5.** La autora marcó en rojo el hueco
  vacío debajo del papel dos veces (con 46 px y con 62); el espacio sobrante es de los
  renglones. **Más altos no caben**: el cartel del revelado cuelga del papel en absoluto y
  se saldría del lienzo. El `paddingBottom` del bloque (12) es lo que le deja sitio.
- **Los textos del Tema 2 van en PASADO.** *"¿Dónde manda?"* y *"la ciudad donde manda"*
  pasaron a **mandaba**: es 1859, ya no manda nadie de esos. Lo cazó la autora.
- **El avance se marca con PUNTOS, no con "2 de 3".** Ese número se leía de dos maneras
  ("vas por el pedido 2" o "llevas 2 hechos") y la autora lo leyó como lo segundo. Los
  puntos llenos son los que ya hizo: una sola lectura posible. Helper `J12Puntos`.
- ⚠ **Asideros de prueba `data-qa`** en el pedido de la R2 y en la consigna de la R3. Los
  selectores por posición (`span:nth-child(2)`, `span:last-child`) se rompieron al meter
  los puntos dentro del rótulo: pasaron a casar con un punto y devolvían texto vacío.


## Libro 7 · Tema 1 — "La Revolución Liberal" (11 años)

D.C.D. CS.3.1.40/41/42/43 (libro pp. 10-15 + cuaderno pp. 11-14, entregado 2026-11-23).
**Enciende el botón del Libro 7**, que salía apagado por no tener temas.

| Ronda | Mano | ⭐ |
|---|---|:--:|
| R1 `L7T1R1Via` "Tender la vía" | ordenar arrastrando sobre los rieles | 4 |
| R2 `L7T1R2Balanza` "La balanza de 1897" | repartir en tres destinos | 2 |
| R3 `L7T1R3Expediente` "Expediente abierto" | destapar pistas y apostar | 2 |

**⭐ del tema: 4 + 2 + 2 = 8.**

**Invariantes de este tema:**

- **R1 · el año NO se ve mientras se juega** (deducir el orden ES el ejercicio) y aparece
  al verificar con el ✓/✗ y el puesto que le tocaba, **sin reordenar la columna**. Banco de
  **6 hechos con año explícito y todos distintos**; entran 4. Arrastre con aterrizaje
  (mismo patrón probado en la línea del tiempo del Libro 6) y toque-intercambio de
  respaldo.
  - **El revelado habla el idioma de la mecánica:** el tren baja por los rieles y **frena
    en la primera tarjeta fuera de sitio**. En reposo se para en `top: 0` — a `-16` se
    montaba sobre el rótulo GUAYAQUIL, lo cazó `espacios-l7t1.js`.
  - El fondo del ferrocarril va como **background-image al 16 %**, nunca como `<img>`
    sobredimensionado.
- **R2 · son TRES destinos y eso es lo que hace que la ronda exista.** Con solo
  Iglesia/Estado, todo lo que cuenta el libro cae del lado del Estado y no hay nada que
  decidir. **CADA PERSONA** sale textual del libro (la creencia queda "en el ámbito de la
  vida privada y de la conciencia individual"); **LA IGLESIA** sale del cuaderno p. 13 (el
  Carnaval, las procesiones y la Novena siguieron igual).
  - **Son DOS asuntos por partida, no cinco** (lo pidió la autora el 2026-11-23 jugándolo:
    *"en esta ronda solo quiero que sean 2 no 5"*; con cinco se hacía larga). Los dos caen
    en **destinos distintos**: se sortea la pareja de destinos (FIFO de 2 sobre las tres
    posibles) y se saca un asunto de cada uno. Con los dos del mismo lado la ronda no
    enseñaría el reparto, que es justo lo que cuenta el tema.
  - La **viga que se inclina es un espejo del reparto**, no una corrección: ni verde ni
    rojo antes de ¡VERIFICAR!.
  - **BORRAR** (columna de acciones, vía `onClear`) devuelve **el último** asunto a la
    mano, de uno en uno.
  - ⚠ **Un platillo que ya tiene algo se nota desde lejos**: marco ámbar grueso, halo y la
    etiqueta **"YA COLOCASTE AQUÍ"**, más una ficha de 34 px con el emoji del asunto. Antes
    solo lo decía una fichita de 22 px y la autora no veía que hubiese colocado nada. Va en
    **ámbar, nunca en verde**: no es un veredicto, es un acuse.
  - ⚠ **Las ilustraciones van grandes y casi cuadradas (132×118)**: las fuentes son 1:1, así
    se recortan lo mínimo. Caben porque solo hay dos asuntos.
  - Al revelar, la correcta **grita**: panel verde grande "LA RESPUESTA ERA" con dónde iba
    cada fallo y por qué, en el sitio que ocupaba la carta en la mano.
- **R3 · destapar no castiga lo ya ganado.** ⭐ +1 por acierto y **+1 más si se acertó con
  la primera pista sola**; destapar solo deja de sumar el extra. Las **opciones falsas son
  nombres reales de otros hechos del tema**, nunca inventos. **Volver a tocar la opción ya
  elegida no la quita**: quedarse con ella es una respuesta válida.
- ⚠ **Ninguna cara de persona real se dibuja.** Alfaro y Matilde Hidalgo se nombran, no se
  ilustran.
- ⚠ **Fuera a propósito:** la "hoguera bárbara" como escena. El hecho de 1912 entra en la
  R1 redactado en seco.

### Imágenes del tema

**9 archivos `assets/j7t1-*.jpg`** (prompts entregados 2026-11-23, las genera la autora):
`ferrocarril` 16:9 para el fondo de la R1; `iglesia` y `estado` 1:1 para los platillos de
la R2; `cacao`, `marcha`, `montonera`, `escuela`, `registro`, `estacion` 1:1 para los 6
expedientes de la R3. **El tema se juega igual sin ellas**: `J12Img` cae a un emoji.

### QA del tema

```bash
node juegos/juego-12/.planning/e2e-l7t1.js       # perfecta 15 ⭐ · fallada 0 ⭐ · 6 recargas
node juegos/juego-12/.planning/espacios-l7t1.js  # solapes, 5 viewports, 3 rondas
```

**Verificado el 2026-11-23:** format-lint 15/15 · qa-visual sin overflow (colchón 67 px) ·
e2e perfecta **3/3 · 15 ⭐** y fallada **0/3 · 0 ⭐** con revelado en las tres · BORRAR de la
R2 · 6 recargas con 6 combinaciones distintas y 0 repeticiones seguidas · 0 errores de
consola · detector de solapes limpio en 5 viewports, también **en pleno arrastre**.

⚠ **Dos trampas del e2e de este tema:**
1. Los **404 de las `j7t1-*.jpg` que aún no existen** llenan la consola. Se filtran por
   "Failed to load resource"; cualquier otro error sí cuenta.
2. **Las recargas en frío tardan más de 20 s** en bajar React + Babel (~3 MB) del CDN. El
   `waitForSelector` del menú va a **60 s**; con 30 s el test fallaba por red, no por el
   juego.

### Ilustraciones entregadas (2026-11-23)

Las **9 `j7t1-*.jpg` ya están**. Llegaron a 1024×1024 (y el ferrocarril a 1376×768),
**7,2 MB en total**; reescaladas pesan **302 KB** y en pantalla se ven igual.

```bash
node .planning/optimizar-j7t1.js <carpeta-de-respaldo-fuera-del-repo>
```

⚠ **`optimizar-j7t1.js` NO es `optimizar-personas.js`**: este **respeta la proporción**
(el ferrocarril es 16:9 y forzarlo a cuadrado lo deformaría). Ancho máximo 320 px, salvo
el fondo del carril, que va a 720. Como el de personas, **jamás pisa un respaldo
existente**.

⚠ **El fondo de la R1 es TEXTURA, no una escena que se lea.** El carril mide 470×462 (casi
cuadrado) y la ilustración es 16:9, así que `cover` recorta los lados y **el viaducto con
el tren queda detrás de las tarjetas**. Se probaron `contain` anclado arriba y abajo:
encajan la escena entera, pero dejan un **borde horizontal duro a media pantalla** que
parece un defecto. Con las tarjetas ocupando 452 de los 470 px **no hay encuadre que
enseñe el tren**; si se quiere ver, hay que darle su propio hueco en la maqueta. Queda al
22 % de opacidad.

⚠ **"CADA PERSONA" es el único platillo sin ilustración** (lleva el emoji 💭 sobre un
recuadro violeta) y se nota al lado de los otros dos, que sí tienen foto. Si la autora
quiere igualarlo, hace falta una décima imagen cuadrada.

**Ajustes de maqueta tras mirar las capturas con las imágenes puestas:**
- **R3:** la foto pasó de 106 a **140 px** y las pistas y las opciones ganaron aire. Había
  un **hueco muerto** entre el expediente y las tres opciones, y un hueco distinto se lee
  como descuido.

```bash
node juegos/juego-12/.planning/shot-l7t1.js <carpeta>   # capturas para mirar a ojo
```

### Correcciones de la autora jugando el Libro 7 · Tema 1 (2026-11-23)

- 🐛 **La tarjeta de la R1 no se quedaba donde la soltabas.** *"Si arrastro una opción debe
  poder colocarse en ese espacio, porque si no arrastro y no se queda ahí."* El destino se
  medía por la posición del **dedo**; las tarjetas miden 74 px, así que agarrando una por
  el borde el dedo quedaba hasta 37 px de su centro: la tarjeta ya cubría el hueco de abajo
  y el dedo seguía más cerca del de arriba, y al soltar volvía a su sitio. Ahora se mide por
  el **centro de la tarjeta arrastrada** (`slots[i] + dy`), que es lo que se ve.
  - ⚠ **El mismo fallo estaba en la línea del tiempo del Libro 6** (`L6T1R3Linea`), que
    comparte el código del arrastre: corregido en las dos.
  - Lo vigila `.planning/arrastre-l7t1.js`: 15 arrastres (5 recorridos × 3 puntos de agarre
    — **borde de arriba, centro y borde de abajo**) más el respaldo por toque. Solo el
    agarre por el centro pasaba antes.
  - ⚠ **Trampa del test:** la tarjeta lleva dentro su número de puesto, que cambia justo al
    reordenar; hay que quitarlo del texto o ninguna tarjeta se reconoce después de moverla.
- **R2: dos asuntos, no cinco** (⭐ 2). Con cinco se hacía larga.
- **R2: lo ya colocado se nota.** Marco ámbar, halo, ficha de 34 px y "YA COLOCASTE AQUÍ".
- **R2: ilustraciones a 132×118**, casi cuadradas como las fuentes.
- ⏳ **`j7t1-persona.jpg` (1:1) está pedida y aún no llega**: es la única ilustración que
  falta, para que "CADA PERSONA" no sea el único platillo sin foto. Mientras tanto cae al
  emoji 🏠 — **no 💭**, que es el mismo que lleva el asunto "En qué religión cree cada uno" y
  parecían la misma cosa en dos sitios.

### Segunda tanda de la autora jugando el Libro 7 · Tema 1 (2026-11-23)

**R1 · la vía**

- 🐛 **Parpadeo / "no se colocan".** Con ratón y con dedo el arrastre sí colocaba la
  tarjeta (comprobado en `arrastre-l7t1.js` y con una sonda de `pointerType: "touch"`). Lo
  que faltaba era **ver dónde iba a caer**: la tarjeta cae en el hueco cuyo centro tiene
  más cerca, y al soltarla sin pasar la mitad volvía a su sitio sin que nada lo avisara.
  Ahora, mientras arrastras, **se enciende el hueco de destino EN LA VÍA** (barra celeste
  con halo) y el tren se atenúa. Va en la vía porque ahí hay sitio libre: dentro de las
  tarjetas taparía texto y el detector de solapes lo marcaría.
- **El fondo ya no llega hasta arriba** (`top: 22`): el bloque RONDA se montaba sobre el
  borde del panel translúcido y la autora lo leyó como superposición.

**R2 · la balanza**

- 🐛 **"CADA PERSONA parpadeaba".** `Platillo` estaba definido **dentro** de
  `L7T1R2Balanza`: su identidad cambiaba en cada render, así que React desmontaba y volvía
  a montar el subárbol entero. El `J12Img` de "CADA PERSONA" —el único sin archivo— perdía
  su estado `roto`, reintentaba la carga, fallaba y volvía al emoji. **Un componente que
  se define dentro de otro se remonta en cada render: nunca hacerlo.** Ahora
  `J7T1Platillo` vive a nivel de módulo.
- **El acuse se borra solo a los 1,3 s**, así el platillo sale limpio con el asunto
  siguiente: *"si voy a la segunda opción se debe borrar lo que seleccioné en la primera"*.
  Mismo criterio que el mapa del Libro 6. Al verificar se ven **todas** las fichas con su
  ✓/✗.

**R3 · los expedientes**

- **DOS expedientes, no tres** (⭐ 4): *"solo quiero que hayan dos expedientes para que
  haya variedad en cada ronda"*. Con 2 de un banco de 6 hay **15 parejas posibles**.
- **Se verifica UNO A UNO**: ¡VERIFICAR! resuelve el expediente de turno, enseña la
  respuesta y pasa al siguiente; el último cierra la ronda. Las pestañas de arriba pasaron
  a ser un **indicador de avance**: ya no se tocan, el orden lo lleva ¡VERIFICAR!.
- **DESTAPAR es ahora un botón de verdad**: ámbar sólido, candado, letra oscura y el coste
  en segunda línea. Antes era un renglón celeste y se confundía con las pistas.
- **"Pista todavía tapada"** sustituye al gris casi invisible de "Pista 3, sin destapar".

**⭐ del tema: 4 + 2 + 2 = 8.**

### Tercera tanda de la autora jugando el Libro 7 · Tema 1 (2026-11-23)

- **R1 · las demás tarjetas SE APARTAN** para abrir el hueco donde va a caer la
  arrastrada: las de en medio suben o bajan un paso entero (74 + 10 px). *"Si quiero
  colocarla en algún espacio las dos opciones deben de moverse, por ejemplo la una hacia
  arriba y la otra hacia abajo."*
  - ⚠ **Esto NO es lo que rechazó en el Libro 6.** Allí rechazó que se **reordenara la
    lista en vivo** y la tarjeta arrastrada saltara sola. Aquí la arrastrada sigue al dedo
    y la lista solo cambia **al soltar**; lo único que se mueve antes es el hueco.
  - Las tarjetas se desplazan **en bloque y un paso exacto**, así que nunca se pisan entre
    ellas durante la transición. Lo comprueba `espacios-l7t1.js` midiendo EN PLENO
    ARRASTRE, y `shot-arrastre-l7t1.js` deja una captura de ese estado para mirarlo.
- **R2 · fuera "platillo".** Es la palabra del código, no la del chico. El bocadillo pasa a
  **"Lee el asunto de abajo y toca quién se quedó con él."** (sigue siendo el CÓMO).
- **R3 · se ve UN SOLO expediente**, el de turno, y en grande: pastilla con borde dorado,
  letra de 14,5 y halo, más los **puntos de avance** (`J12Puntos`). Antes estaban los dos a
  la vez y el activo casi no se distinguía del que faltaba: *"lo que dice expediente 1 se
  vea más porque casi no se nota"* y *"solo quiero que se vea un expediente y ya"*.
  - ⚠ **El test ya no puede contar las pastillas** para saber cuántos expedientes hay: la
    pastilla lleva `data-total`.

### Cuarta tanda de la autora jugando el Libro 7 · Tema 1 (2026-11-23)

- 🐛 **El hueco del arrastre se había aplicado a la ronda EQUIVOCADA.** El código del
  arrastre está **duplicado** en `L6T1R3Linea` (Libro 6) y en `L7T1R1Via` (Libro 7), y un
  reemplazo por texto cayó en la primera coincidencia: el Libro 6 se llevó el cambio y el
  Libro 7 se quedó igual. Por eso la autora seguía viendo que las demás tarjetas no se
  movían. **Al tocar el arrastre hay que decir SIEMPRE en qué ronda**, y comprobarlo con
  `shot-arrastre-l7t1.js`, que imprime la **y de cada tarjeta** en cuatro momentos del
  gesto: así se ve en números si las demás se apartan o no, sin depender de mirar una
  captura.
  - En el Libro 6 las tarjetas tienen **alto variable** (`minHeight: 70`), así que un paso
    fijo sería incorrecto: allí el cambio se revirtió.
- 🐛 **La viga de la balanza se metía dentro de las ilustraciones.** Con 14° sus puntas
  bajaban 35 px. Ahora el tope es **8°** y la viga mide 236 px (antes 288). ⚠ **El detector
  de solapes no lo ve**: la viga es un `div` decorativo sin texto, y el detector mide
  textos hoja y botones pintados. Para lo decorativo hay que mirar la captura.
- **R3: UN solo expediente** (⭐ 2). *"En la ronda 3 solo quiero que haya un solo
  expediente, es decir que no hayan dos intentos solo uno."* La variedad la da cuál de los
  6 toca; cap 5 = banco − 1, que es el máximo para un solo ítem.
  - El código **sigue preparado para varios**: se verifican uno a uno y la pastilla enseña
    el número y los puntos de avance en cuanto `casos.length > 1`. Basta cambiar el 1 de
    `j7t1R3Build`.

**⭐ del tema: 4 + 2 + 2 = 8.**

### Quinta tanda de la autora jugando el Libro 7 · Tema 1 (2026-11-23)

- **R1 · se acabó el hueco muerto bajo la última tarjeta.** Dos cambios:
  1. Las tarjetas pasaron de **74 a 86 px** de alto (y la letra de 11 a 12,5), así la
     columna llena el panel en vez de dejar un vacío abajo. La autora lo marcó **en rojo
     sobre una captura**.
  2. La columna de tarjetas se **centra** (`justifyContent: "center"`). La columna del
     riel es más alta que la de las tarjetas —le suman los rótulos GUAYAQUIL y QUITO— y,
     al estirarse, todo el sobrante se iba abajo: **2,5 px arriba contra 26,5 abajo**.
  - ⚠ Lo vigila `.planning/huecos-l7t1.js`, que **mide los dos huecos en píxeles del
    lienzo** y falla si difieren más de 6. Convierte "se ve raro" en dos números: ahora
    son 15,5 y 13,5. Nació de esta corrección porque mirar la captura no bastaba — el
    desajuste venía de una columna hermana, no de la que se veía mal.
- **R3 · el enunciado dice "el expediente"**, no "cada expediente": ya solo hay uno.

### Sexta tanda de la autora jugando el Libro 7 · Tema 1 (2026-11-23)

**R2 · el revelado, rehecho.** *"Cuando se ve si fue correcto o no, mejora eso, no me
agrada cómo se ve."* Antes el veredicto vivía en una fichita de 34 px perdida dentro del
platillo. Ahora:

- **El marco del platillo da el veredicto**: verde si lo que pusiste ahí está bien, rojo
  si hay un error, **ámbar a rayas si ahí faltaba algo**.
- **Un sello ✓/✗ de 30 px** en la esquina de la ilustración: se ve de un vistazo cuál
  acertó, sin leer las fichas.
- **El hueco "AQUÍ IBA"**: en el platillo correcto aparece la ficha del asunto mal
  colocado, en un círculo de rayas. El revelado ya no solo dice "te equivocaste": enseña
  **dónde iba**, en el lenguaje de la mecánica.
- ⚠ **Para mirarlo hay que forzar el fallo.** `shot-l7t1.js` manda **los dos asuntos al
  MISMO platillo**: como caen en destinos distintos, al menos uno queda mal. Repartirlos
  en dos platillos distintos acierta los dos por casualidad y la captura sale verde.

**Variedad.** *"Recuerda tener variedad en cada ronda porque ahorita me salieron las
mismas opciones de hace rato."* La causa no era el sorteo sino **el tamaño de los bancos**:

| Banco | antes | ahora |
|---|:--:|:--:|
| R1 · hechos de la vía | 6 | **9** |
| R2 · asuntos del Estado | 6 | **9** |
| R2 · asuntos de la Iglesia | 3 | **4** |
| R2 · asuntos de cada persona | 3 | **4** |
| R3 · expedientes | 6 | **8** |

- ⚠ **La R1 ahora sortea LOS QUE JUEGAN (4 de 9), no los que se quedan fuera.** Con un
  banco grande, sortear la exclusión deja a la mayoría dentro en todas las partidas y la
  ronda se repite igual. 9 sobre 4 son **126 combinaciones**.
- Caps al día: R1 6 · R2 est 6 / igl 3 / per 3 · R3 **7 = banco − 1** (para un solo ítem).
- Todo el material nuevo sale del mismo tema del libro (Registro Civil 1900, Ley de Cultos
  1904, la marcha del 15 de noviembre de 1922, las escuelas laicas para niñas, la jornada
  y el salario de la mujer, la Novena, la prensa, el Estado laico y el período
  plutocrático). **Nada inventado.**
- ⚠ Lo mide `.planning/variedad-l7t1.js [partidas]`, que recarga N veces y cuenta
  ejercicios distintos y repeticiones consecutivas. **12 partidas: R1 12/12 distintos ·
  R2 10/12 · R3 8/12 (de 8 posibles) · 0 repeticiones seguidas en las tres.**


## Libro 6 · Tema 3 — "El preámbulo del siglo XX" (10 años)

D.C.D. CS.3.1.37 · CS.3.1.38 · CS.3.1.39. Material: libro pp. 112-115 + cuaderno
pp. 103-106 (entregado el 2026-11-23). Diseño completo en `.planning/juego-12-design.md`
§5. Cierra el Libro 6.

| Ronda | Verbo | ⭐ |
|---|---|:--:|
| R1 "Quitar la niebla" | frotar para descubrir **y elegir** | 2 |
| R2 "Tres plumas" | girar la ficha | 3 |
| R3 "El sello de Montalvo" | estampar | 3 |

⚠ **Este tema NO toca el ferrocarril ni las obras de Alfaro**: son del Libro 7 · Tema 1.
Aquí van las ideas liberales, los tres pensadores y la mujer.

**Invariantes:**

- **R1 · 2 sin voz + 2 con voz.** Se descubre frotando (basta **pasar por encima**, sin
  apretar; cada pasada limpia un bloque de 3×3 celdas) y **después se eligen** los dos que
  no tenían voz. Nació sin poder fallarse —las ocho primeras ilustraciones eran todas
  correctas— y la autora lo cazó.
  - ⚠ **La señora de clase alta va entre las que NO tenían voz.** El libro dice que la
    mujer "permanecía relegada al espacio doméstico" y el cuaderno lo repite para las de
    clase media y alta. La autora la pidió como incorrecta; se le avisó del cambio.
  - ⚠ **Mientras se juega solo se ve el NOMBRE.** La frase explica si esa persona tenía
    voz, así que aparece al verificar, **sobre la foto** (no debajo: reservarle una franja
    dejaba un hueco vacío que la autora marcó en rojo).
- **R2 · 12 fichas, una por persona.** Dos hechos de cada uno de los seis (Montalvo,
  Moncayo, Peralta · Rocafuerte, García Moreno, Alfaro) y cada partida saca uno de cada
  uno: 2⁶ = 64 combinaciones. Los distractores son **del mismo tema**, así que no se
  acierta por descarte.
  - ⚠ **"El Viejo Luchador" es ALFARO**, no Peralta: el libro dice que Peralta se ganó su
    admiración.
- **R3 · 7 frases textuales** del fragmento de *El Cosmopolita* (cuaderno p. 106); salen
  **3 que quedan fuera del pueblo + 2 que sí lo son**.
- **¡VERIFICAR! se apaga** hasta elegir lo que pide la ronda (2 · 3 · 3). **Sin letrero
  debajo**: la autora lo quitó.
- **El revelado enseña CUÁLES eran**, no solo el veredicto: lo que había que marcar y no
  se marcó sale en ámbar ("TE FALTÓ" / "ERA ESTA"), y en la R2 se abren **todas** las
  fichas con su hecho y su nombre.
- **BORRAR** deshace lo último (la última elección; si no hay ninguna, vuelve la niebla).

### Las 12 ilustraciones

`assets/j6t3-<id>.jpg`, generadas por la autora. Llegaron en 16:9 (y una en 1:1) con la
figura pequeña y descentrada; `.planning/optimizar-j6t3.js` las deja en **330×440**:

- La figura ocupa siempre el **84 % del alto** y el recorte **puede salirse de la lámina**:
  el aire que falta se rellena **estirando el borde**, no con un color plano (un tono
  sacado de la esquina dejaba un marco visible sobre el degradado).
- ⚠ **El centrado se MIDE y se CORRIGE**: dibuja, mide la silueta en el resultado y
  reencuadra, hasta tres veces. Centrar por el torso falla porque un libro o un saco en la
  mano corren el centro de masa. Lo comprueba `.planning/centros-j6t3.js` (las doce con
  2 px de desvío o menos sobre 330).
- ⚠ **La corrección va AMORTIGUADA (60 %) y se guarda el mejor encuadre visto.** Con la
  corrección entera, dos láminas rebotaban sin converger (la maestra: −12 → 10 → −9 → 12…):
  la medida cambia un poco al mover el recorte, así que aplicar el desvío completo se pasa
  de largo.
- ⚠ **Se mide LA CABEZA, no la silueta entera.** Lo que la persona lleva al lado —la
  mesita de la oficinista, el saco del portuario, el vuelo de una falda— entra en la
  silueta y corre el centro: el número decía "centrada" con el cuerpo pegado a un borde,
  y la autora lo vio a ojo. La cabeza siempre está sobre el eje del cuerpo.
- 📌 **Para juzgarlo, hoja de contacto con una línea roja en el centro de cada recuadro**:
  doce números no dicen lo que doce imágenes en fila.
- 4,9 MB → ~230 KB en total. Los originales se respaldan fuera del repo (el script nunca
  pisa un respaldo existente).

### QA del tema

```bash
node juegos/juego-12/.planning/e2e-l6t3.js        # perfecta 8 ⭐ · fallada 1 ⭐
node juegos/juego-12/.planning/variedad-l6t3.js   # 8 partidas seguidas
node juegos/juego-12/.planning/centros-j6t3.js    # encuadre de las 12 fotos (números)
node juegos/juego-12/.planning/tira-j6t3.js <png>  # ...y las 12 en fila, con su eje marcado
node juegos/juego-12/.planning/espacios-todo.js   # solapes: los TRES temas
node juegos/juego-12/.planning/espacios-extra.js  # peores casos + Libro 7
node juegos/juego-12/.planning/shot-l6t3.js <carpeta>
```

**Verificado (2026-11-24):** perfecta 3/3 · **8 ⭐** · fallada **1 ⭐** (la R3 obliga a
sellar tres, así que su peor nota es 1, no 0). Variedad en 8 partidas: R1 **8/8**, R2
**7/8**, R3 **8/8**, sin repetir la partida anterior. Nada superpuesto en 6 viewports ni
en los casos peores (seis fichas abiertas, cinco frases selladas, en pleno frotado).
0 errores de consola.


## Libro 7 · Tema 2 — "Insurgencia, cambio social y velasquismo" (11 años)

D.C.D. CS.3.1.45/46/47/48 (libro pp. 32-38 + cuaderno pp. 27-32, entregado 2026-11-24).
Diseño completo en `.planning/juego-12-design.md` §6.

⚠ **En el libro es el "Tema 1" de la Unidad 2**; dentro del juego entra como Libro 7 ·
Tema 2, porque el Tema 1 del juego es la Revolución Liberal.

| Ronda | Mano | ⭐ |
|---|---|:--:|
| R1 `L7T2R1Curva` "El quintal se desploma" | deformar una curva arrastrando su nudo | 3 |
| R2 `L7T2R2Feria` "La feria de juegos" | hacer el gesto con el que se juega | 3 |
| R3 `L7T2R3Hilos` "La peña del Grupo de Guayaquil" | tender un hilo de punto a punto | 3 |

**⭐ del tema: 3 + 3 + 3 = 9.** Las tres manos son **nuevas**: el Tema 1 del mismo libro ya
gastó *ordenar arrastrando*, *repartir en destinos* y *destapar pistas*.

**Invariantes de este tema:**

- **R1 · la respuesta es CUÁNTO, no CUÁL.** No hay opciones: se arrastra el nudo del año y
  la línea se deforma pegada al dedo. Acierto = quedar a **12 niveles o menos** del valor
  real. El revelado habla el idioma de la mecánica: la curva correcta aparece en **dorado
  punteado sobre la tuya**.
  - ⚠ **Soltar SIEMPRE coloca, aunque no se haya movido**: "se quedó igual" es una
    respuesta válida y el chico tiene que poder darla.
  - **Tres curvas** (cacao · sombrero de paja · lo que alcanza el sueldo), cada una con su
    banco de 6 hechos, de los que entran 3.
- **R2 · el gesto ES la respuesta.** Aparece un juguete de los que nombra el libro (p. 38)
  y el chico hace con el dedo lo que haría con el de verdad: **lanzar** el trompo hacia
  abajo, **tirar** del hilo de la cometa hacia arriba, **dar vueltas** a la soga,
  **estirar** la liga de las pallas, **mecer** la muñeca de lado a lado, **saltar** la
  rayuela con dos toques. Banco de 6, entran 3.
  - ⚠ **NO hay menú de gestos.** Ponerlo convertiría la ronda en una opción múltiple de
    seis botones, que es justo lo que se quería evitar. Si el trazo no se reconoce no se
    pierde nada: se avisa y se repite.
  - ⚠ **El reconocedor es GENEROSO a propósito**: 25 px de trazo mínimo, 250° para dar por
    buena una vuelta, 90 px de margen en el vaivén. Lo juega un niño de 11 con el dedo.
  - ⚠ La zona de juego mide **452×280 y se come todo lo que sobra del carril**
    (30+22+5+18+6+280+6+86 = 461 de 462): con 236 px quedaba hueco muerto debajo.
- **R3 · ninguna cara de autor se dibuja**: son personas reales (regla del repo). Lo
  ilustrado es **la obra**; el autor va con su nombre y un icono.
  - ⚠ **La obra nunca queda enfrente de su autor**: regalaría la respuesta por posición.
  - Un hilo nuevo desde el mismo autor **reemplaza** al anterior, y **dos autores no pueden
    colgar de la misma obra** (el viejo se suelta solo): así no hay estados imposibles.
  - ⚠ **Las filas miden 92 px, no 102.** Con 102 la columna medía 336 px y al revelar el
    panel verde no cabía en lo que queda del carril y **se montaba sobre las tarjetas**. Lo
    cazó `espacios-l7t2.js` en los cinco viewports. Por lo mismo el panel enseña **tres
    líneas cortas** (✓/✗ + autor — obra) y el porqué de **un solo** fallo: con el párrafo de
    cada obra volvía a crecer.

### Mecánicas que la autora descartó (2026-11-24)

- **"El reloj de Carondelet"** — girar la manecilla hasta los días/meses/años que duró cada
  gobernante. Le gustó **el tema** y no la mecánica.
- **"El dominó de Carondelet"** — empujar la ficha que tumbó al gobierno. Se descartó con
  argumento, y conviene recordarlo: **era una pregunta de opción múltiple disfrazada**. Hay
  cuatro fichas y se elige una; quitando los dominós y poniendo cuatro botones el juego es
  el mismo. La caída en cadena es una animación **posterior** a la decisión, no parte de
  ella.
- **"El mural de los años 30"** — frotar para descubrir. Era mi recomendación, pero frotar
  se parece a *destapar pistas* del Tema 1 y ella eligió los hilos.

### La pregunta de la variedad, respondida antes de construir

La autora preguntó *"¿pero cómo garantizamos variedad en la ronda 1?"* **antes** de que se
escribiera una línea, y la sospecha era correcta: con una sola curva, la del cacao, **todos
los hechos empujan hacia abajo** y se acierta arrastrando abajo sin leer. Tres arreglos,
los tres en el código:

1. **Tres curvas**, no solo la del cacao.
2. Dentro de cada una, hechos que **suben** y hechos que **bajan** (el auge agroexportador,
   el sombrero en los veinte y en los cuarenta, el Banco Central, el Código del Trabajo).
3. Entran **3 de 6** por partida ⇒ 20 combinaciones por curva, **60 ejercicios**.

Caps FIFO: curva **2** (= banco − 1, para un solo ítem) · hechos **4** (nunca 3 = K) · R2
**5** · R3 **5**.

### Imágenes del tema

**8 archivos `assets/j7t2-*.jpg`, todos 1:1**, uno por obra: `huasipungo`, `nuestro-pan`,
`cruces-agua`, `hoguera`, `sangurimas`, `mitas`, `indio`, `plata-bronce`. Prompts
entregados el 2026-11-24 con una línea de estilo común (mural indigenista de los treinta,
figuras de lejos o de espaldas, sin texto). Opcional y aún sin montar: `j7t2-billete.jpg`
en 16:9 como fondo de la R2. **El tema se juega igual sin ellas**: `J12Img` cae a un emoji.

### QA del tema

```bash
node juegos/juego-12/.planning/e2e-l7t2.js        # perfecta 9 ⭐ · fallada 0 ⭐ · 6 recargas
node juegos/juego-12/.planning/espacios-l7t2.js   # solapes, 5 viewports, 3 rondas
node juegos/juego-12/.planning/arrastre-l7t2.js   # el nudo y los hilos, con ratón de verdad
node juegos/juego-12/.planning/variedad-l7t2.js 12
```

**Verificado el 2026-11-24:** format-lint 15/15 · e2e perfecta **3/3 · 9 ⭐** y fallada
**0/3 · 0 ⭐** con revelado en las tres y el BORRAR de la R1 · detector de solapes limpio en
5 viewports, también en pleno arrastre, con la barra a tope y con los hilos cruzados ·
arrastre 11/11 · variedad medida otra vez con la ronda nueva: **8 partidas, 8/8 ejercicios distintos en
las tres rondas y 0 repeticiones seguidas** · 0 errores de consola.

⚠ **Al añadir este tema, el Libro 7 pasó a tener DOS**, así que ya **no se preselecciona
solo** y ENTRAR queda apagado hasta elegir uno (`openLibro` solo autoselecciona con
`temas.length === 1`). Hubo que añadir el click del tema a **los siete scripts del Tema
1** (`e2e`, `espacios`, `arrastre`, `huecos`, `variedad`, `shot`, `shot-arrastre`). Es el
mismo tropiezo que ya tuvo `arrastre-r3.js` cuando el Libro 6 estrenó su segundo tema:
**cada vez que un libro estrena tema, revisar los scripts de sus temas anteriores.**

### Lo que cazaron las capturas del Tema 2 (y ningún detector)

Tres cosas que el detector de solapes no puede ver, porque son **decorativas o de color**:

- **La franja verde iba DEBAJO del relleno de la barra.** En cuanto se emitían unos
  billetes, el relleno tapaba el borde izquierdo de la franja y se perdía de vista dónde
  había que parar. Ahora la franja se pinta **encima**, translúcida.
- **Las dos etiquetas de la barra se tocaban.** Centradas en su marca, con una franja
  estrecha "HACE FALTA" y "HASTA AQUÍ HAY ORO" quedaban pegadas. Ahora **crecen hacia
  fuera**: una termina en el borde izquierdo y la otra empieza en el derecho.
- **El pasillo de los hilos pasó de 44 a 66 px.** Al revelar conviven hasta **seis** hilos
  (el tuyo y el dorado de cada pareja) y en 44 px se trenzaban. Además el dorado va más
  grueso y el equivocado se apaga al 55 %.

Y un plural mal escrito que solo se ve jugando: *"Te faltan 1 hilo"*.

⚠ **Para mirar el revelado de la R3 hay que FORZAR el fallo**, y el corrimiento cíclico no
basta: como las dos columnas se barajan por separado, "el de al lado" puede ser el
correcto y la captura sale toda en verde. `shot-l7t2.js` lleva la clave escrita y cuelga
cada autor de **la obra siguiente a la suya**. Mandarlos todos a la misma obra tampoco
sirve: dos autores no pueden colgar de una sola, así que quedaría **un solo hilo** y
¡VERIFICAR! no haría nada.


### La ronda 2, rehecha entera (2026-11-24)

La primera R2 fue **"La imprenta sin respaldo"**: se pulsaba IMPRIMIR y había que parar
dentro de la franja que respaldaba el oro. La autora la descartó jugándola, con la frase
que más vale la pena recordar: *"en esta ronda no entiendo nada de cómo se juega"*.

**El diagnóstico, para no repetirlo:** la ronda pedía entender una idea abstracta —que los
billetes necesitan respaldo en oro— **antes** de poder tocar nada. Eso no se arregla con
más dibujos ni con mejor copy: si la mecánica solo cobra sentido después de entender el
concepto, el juego no está enseñando, está examinando. Las otras dos rondas del tema se
entienden mirándolas (una línea que sube y baja, un hilo de un sitio a otro) y esta no.

**Lo que la sustituye: "La feria de juegos"**, con los juegos de infancia de la p. 38. Se
entiende sin leer, porque el gesto es la respuesta.

Antes de rehacerla se le ofrecieron tres caminos y eligió este:

- **A · "La torre de los gobiernos"** (apilar un bloque por año; las tres torres juntas
  enseñan la inestabilidad). Era mi recomendación.
- **B · "El pliego de la huelga"** (sellar lo que los obreros consiguieron). Descartada por
  ser, en el fondo, decidir sí/no sobre cada línea, que ya existe en el Libro 6.
- **C · "La feria de juegos"** ← la elegida. Se le dijo de frente que es la que **menos
  contenido histórico** tiene: enseña cómo se jugaba, no por qué pasó lo que pasó.

### La R1, rehecha el mismo día

*"Aquí nunca vamos a tener una respuesta correcta porque nunca vamos a poner el nudo en el
lugar exacto."* Tenía razón: con una tolerancia de ±12 sobre 100 había que clavar el píxel
y un nudo que se veía bien salía ✗.

Ahora el gráfico tiene **cuatro alturas con nombre** —MUY ALTO · ALTO · BAJO · MUY BAJO—
dibujadas como rieles, y al soltar **el nudo se imanta** al riel más cercano.

- ⚠ **Son cuatro y no dos.** Ella proponía solo alto/bajo; con dos, el auge y el desplome
  quedarían a la misma altura, la curva perdería la forma y cada nudo sería una moneda al
  aire. Con cuatro, acertar depende de entender, no de la puntería.
- **El recuadro del hecho va ENCIMA del gráfico**, no debajo (lo pidió ella), y el bloque
  tiene **altura reservada** para que el gráfico no salte cuando el revelado ocupa su
  sitio.
- El gráfico pasó de 206 a **290 px de alto**: se comió el hueco que sobraba abajo.

### Imágenes de la R2

**6 archivos "assets/j7t2-*.jpg", 1:1**: "trompo", "cometa", "soga", "pallas",
"muneca", "rayuela" (prompts entregados el 2026-11-24, estilo de ilustración infantil
pintada a mano, fondo liso, sin texto ni personas). **La ronda se juega igual sin ellas**:
"J12Img" cae a un emoji.

## Libro 7 · Tema 3 — "Transformación agraria" (11 años)

D.C.D. CS.3.1.52 a CS.3.1.56 (libro pp. 52-58 + cuaderno pp. 49-52, entregado 2026-11-24).

⚠ **En el libro es el "Tema 1" de la Unidad 3**, igual que pasó con el Tema 2; dentro del
juego entra como Libro 7 · Tema 3. **El título NO es un arrastre del banner**: la autora
preguntó por él y el cuaderno (p. 49) lo repite, así que el tema se llama de verdad
"Transformación agraria" aunque sus dos primeras páginas hablen de la guerra de 1941.

| Ronda | Mano | ⭐ |
|---|---|:--:|
| R1 `L7T3R1Mandatos` "¿Cuánto le duró?" | estirar el borde de una barra | 3 |
| R2 `L7T3R2Banano` "La bodega del banano" | apilar | 3 |
| R3 `L7T3R3Lamparas` "Lo que cambió y lo que no" | encender y apagar | 3 |

**⭐ del tema: 3 + 3 + 3 = 9.** Las tres manos son nuevas en el Libro 7, que ya gastó
*ordenar arrastrando*, *repartir en destinos*, *destapar pistas*, *deformar una curva*,
*pulsar y frenar* y *tender hilos*.

**El arco del tema lo recorren las tres rondas enteras**, no solo su arranque: primero la
guerra (p. 52), luego la plata del banano (p. 55) y al final la Reforma Agraria (pp.
56-57), que es la que da nombre al tema. Las primeras propuestas se quedaban en las pp.
52-53 (frontera, Protocolo, velasquismo) y el tema se habría llamado "Transformación
agraria" sin hablar de ella; se le dijo a la autora y aceptó cambiar el contenido
conservando los tres gestos que ya había elegido.

**Invariantes de este tema:**

- **R1 · la respuesta es CUÁNTO, no cuál.** Tres gobiernos a la vez, con su año de inicio
  YA PUESTO, y se estira el borde derecho de su barra sobre la línea 1948-1972. Acierto =
  quedar a **un año o menos**. Cada uno lleva una frase de lo que hizo, SIN años. Banco de
  **8 gobiernos** (pp. 54-57), 3 por partida ⇒ 56
  combinaciones.
  - ⚠ **SUSTITUYE a "Uno contra ocho"** (poner soldados en la fila), que la autora no
    entendió jugándola el 2026-11-24: *"no entiendo para nada cómo es esa ronda"*. El
    diagnóstico no era el copy: **la pantalla no decía por ningún lado que lo correcto
    fuera dejar UN soldado sin armas y sin jefes**, así que solo se acertaba recordando la
    frase de la p.52. Las dos ilustraciones de soldados quedaron sin uso.
  - ⚠ **También se descartaron tres versiones de "medir el territorio perdido"** (cortar
    con tijeras, estirar una cinta, doblar el mapa): los 200 000 km² son UN SOLO dato, así
    que la ronda sería idéntica en todas las partidas. **Lo marcó la autora**, que pidió
    variedad al recargar antes de elegir.
  - ⚠ **Nunca dos mandatos de la MISMA persona en la misma partida**: salían el 3.er y el
    4.º de Velasco juntos y la pantalla parecía repetida. Campo `q` + repesca en el build.
  - ⚠ **El año se calcula con el ancho REAL del eje** (`getBoundingClientRect`), no con los
    398 lógicos: el lienzo va escalado con `transform`.
  - ⚠ **Clemente Yerovi queda fuera del banco**: gobernó de marzo a noviembre de 1966 y la
    barra se mide en años enteros, así que no tendría respuesta clara.
  - ⚠ **El libro se contradice con Arosemena Monroy**: el titular dice "(1960-1963)" pero
    el texto cuenta que Velasco ganó en 1960 y lo desconocieron en 1961. En el juego entra
    como **1961-1963**. Conviene que la autora lo revise en el libro.
  - Lo que enseña sin explicarlo: los tres primeros duran cuatro años justos (el "período
    de estabilidad") y desde 1960 **ninguno llega al final**.
- **R2 · las cifras son las de la tabla de la p. 55** (99 · 169,6 · 612,6 · 895,1 mil
  toneladas) y **1 caja = 100 mil toneladas**, que es lo único que se inventa: la unidad
  del juego, no el dato. **Acierto solo si es EXACTO** (pasarse no vale). Entran 3 de los 4 años.
  - ⚠ **El PASO de la pila es 22 px, no 26.** Con 26 la columna de diez medía 280 y al
    verificar el cartel verde se montaba sobre los años. **Lo vio la captura, no el
    detector de solapes** (se tocaban por pocos píxeles).
  - Tocar la columna sube una caja; **tocar una caja baja la pila hasta ahí**, igual que
    la fila de la R1. BORRAR quita la última.
- **R3 · las cinco frases salen de las pp. 56-57**, y las falsas son lo que el libro dice
  EXPRESAMENTE que no ocurrió (no hubo créditos ni préstamos, no mejoró la calidad de
  vida, no pudieron tecnificarse ni frenar las plagas). **Nada inventado.**
  - Banco: **5 verdaderas + 3 falsas**; salen 3 + 2 ⇒ **30 combinaciones**.
  - El revelado marca en ámbar **"ESTA SÍ PASÓ"** la verdadera que no se encendió, y el
    cartel verde cita el porqué de las falsas que tocaron esa partida.
  - 📌 **Su peor nota es 1 ⭐, no 0**: hay que encender tres y solo hay dos falsas, así que
    al menos una verdadera entra siempre. El e2e lo espera así.
- **Caps FIFO:** R2 años **2** (nunca 3 = K) · R3 verdaderas **2** (nunca 3) · R3 falsas
  **1** (nunca 2).

### Imágenes del tema

**4 archivos `assets/j7t3-*.jpg`, entregados por la autora el 2026-11-24**:
`soldado-ecuador` y `soldado-peru` (3:4, misma pose y misma escala, uno sin arma y el
otro equipado), `caja-banano` (1:1, con la tapa plana porque se apila) y `campesino`
(3:4, junto a las lámparas de la R3). **2 266 KB → 41 KB** con
`.planning/optimizar-j7t3.js <carpeta-de-respaldo-fuera-del-repo>`, que respeta la
proporción y nunca pisa un respaldo existente.

⚠ **`J7T3Fig` cae a un emoji si falta el archivo** (🪖 · 📦 · 🧑‍🌾): el tema se puede jugar y
probar sin esperar a las ilustraciones.

⚠ **Ninguna cara de persona real.** Arroyo del Río, Tobar Donoso y Velasco Ibarra se
nombran en los textos; no se ilustran. Los soldados y el campesino son tipos, no personas.

### Mecánicas que se descartaron (2026-11-24)

- **"La franja que se va"** (arrastrar el borde del mapa hasta los 200 000 km² perdidos) —
  era mi recomendación; la autora prefirió otras.
- **"El telegrama"** (jalar la cinta y marcar los partes ciertos) — **la eligió y luego
  cayó** al llegar el material completo: su contenido eran las pp. 52-53 y el tema pedía
  llegar hasta la reforma agraria. Su ilustración (`j7t3-telegrafo.jpg`) se canceló antes
  de generarla.
- **"El rodillo de censura"** — se le ofreció avisando de que ahí el chico de 11 años hace
  el papel del dictador y la pantalla suelta, sin el final, se lee mal. No la eligió.

### QA del tema

```bash
node juegos/juego-12/.planning/e2e-l7t3.js        # perfecta 9 ⭐ · fallada 1 ⭐
node juegos/juego-12/.planning/espacios-l7t3.js   # solapes, 3 viewports, 9 estados
node juegos/juego-12/.planning/variedad-l7t3.js 8
node juegos/juego-12/.planning/shot-l7t3.js <carpeta>
```

**Verificado el 2026-11-24:** format-lint 15/15 · e2e perfecta **3/3 · 9 ⭐** y fallada
**1 ⭐** con revelado en las tres rondas · detector de solapes limpio en 27 estados (las
tres rondas vacías, en su estado más lleno y reveladas, en 3 viewports) · variedad en 8 partidas: **R1 6/8 distintos · R2 4/8 (de 4
posibles) · R3 6/8 · 0 repeticiones seguidas** ·
`espacios-todo.js` sigue limpio en los tres temas del Libro 6 · 0 errores de consola.

⚠ **El overlay ¡EXCELENTE!/¡UPS! tapa el revelado** durante todo el tiempo que la ronda
sigue en pantalla, así que una captura nunca lo enseña limpio: lo que haya que comprobar
del revelado se mide en el DOM (colores, textos), no mirando una foto.

### Cuarta tanda de la autora jugando el Libro 7 · Tema 2 (2026-11-24)

**R1 · los nudos ya colocados se pueden volver a mover.** *"Una vez que muevo los nudos me
doy cuenta que me equivoqué, debe dejarme mover, no así como se queda estático."* Ahora
hay **una zona de agarre por nudo**, no una sola para el que toca, y la tarjeta del hecho
**sigue al nudo que tienes en la mano** (estado `foco`), no al turno.

- ⚠ **Y por eso esta ronda ya NO registra BORRAR** — lo quitó ella en la misma frase. Con
  los nudos libres, rectificar es mover otra vez; un botón de deshacer sería un segundo
  camino para lo mismo.
- 🐛 **El punto de PARTIDA se encendía** como si fuera el nudo activo en cuanto estaban
  los tres colocados: es `i = 0`, o sea `k = -1`, y `activo` vale −1 al terminar. Falta
  la guarda `k >= 0`. Lo cazó un diagnóstico que imprimía todos los círculos del SVG.

**R2 · fuera la rayuela.** *"Si juego rayuela, ¿cómo indico que se juega?"* Tenía razón, y
el defecto era de ese juguete, no de la mecánica: los otros cinco gestos salen solos
—lanzar, tirar, dar vueltas, estirar, mecer— y **saltar no se parece a nada que se pueda
hacer con el dedo**, así que había que adivinar una convención nuestra. El banco baja de
6 a 5 (de 20 tríos a 10) y se gana que los cinco sean honestos. Un toque suelto ya no
anota nada: todos los gestos son trazos.

- 📌 Ella propuso en su lugar **dar pistas y adivinar el juego**. Se descartó con
  argumento: eso es exactamente *"Expediente abierto"*, la R3 del **Tema 1 de este mismo
  libro**, y rompería su propia regla de no repetir manos dentro de un libro.

**R3 · el hueco de debajo no era aire suelto.** Era el sitio **reservado** para el panel
del revelado (86 px). Se ganó haciendo el panel más bajo: ya **no repite las tres parejas
en texto**, porque el veredicto lo dan el **hilo dorado** y el **marco de cada tarjeta**;
queda el título y el porqué. Con eso las filas suben de 92 a **106** y las fotos de las
obras a 96 px de ancho. Cuentas: 34 + 22 + 10 + 342 + 4 + 44 = **456 de 462**.

- ⚠ **112 px por fila NO caben** (364 > 306 disponibles): el panel se montaba sobre la
  última tarjeta en los cinco viewports. Lo cazó `espacios-l7t2.js`.
- 📌 **Los emojis de las obras son el respaldo**, no una decisión de diseño: las 8
  `j7t2-*.jpg` todavía no están subidas. En cuanto estén, aparecen solas.

**⚠ Trampa de los parches, apuntada para no repetirla:** en `String.replace`, un `$$` en
el **texto de reemplazo** significa un `$` literal. Varios parches a los scripts de QA
dejaron `p.$(` donde debía ir `p.$$(` y los tests fallaban con *"cannot read properties of
undefined"*. Para reemplazos con `$` usar `split(...).join(...)`.

**⚠ Trampa del test del arrastre:** la zona de agarre es tan alta que un salto de varias
bandas sacaba el ratón fuera de la ventana y Playwright lo recortaba — el nudo no llegaba
y parecía un fallo del juego. Ahora se mueve **un escalón** y el punto de agarre se corre
si el gesto no cabría.

### Las 13 ilustraciones, entregadas (2026-11-24)

Ya están las **13 `j7t2-*.jpg`**: 5 juguetes (R2) y 8 obras (R3), todas 1:1.

```bash
node .planning/optimizar-j7t2.js <carpeta-de-respaldo-fuera-del-repo>
```

Llegaron a 1024×1024 y **11 435 KB en total**; reescaladas a 360 px pesan **444 KB** y en
pantalla se ven igual (el juguete se muestra a 168 px y las obras a 96). Como
`optimizar-j7t1.js`, **respeta la proporción** y **nunca pisa un respaldo existente**.

**Dos estilos a propósito, y no es un descuido:**

- **Juguetes (R2): ilustración pintada a mano**, fondo liso. Un juguete fotográfico
  recortado sobre fondo neutro queda frío y además compite con el rastro del dedo.
- **Obras (R3): fotografía documental de los años treinta.** La autora rechazó el estilo
  de mural indigenista que se había propuesto primero: *"cambia el estilo de las obras, no
  me gusta, debería ser algo más realista"*. Las dos rondas no se ven juntas nunca, así
  que la mezcla no se nota.

⚠ **Ninguna lleva texto ni caras reconocibles.** Son novelas sobre personas reales y no
puede parecer el retrato de nadie; las figuras van de lejos o de espaldas.

### Por qué NO se usaron imágenes reales de las obras

La autora preguntó si se podían sacar de internet. Se buscó en **Wikimedia Commons
comprobando la licencia por la API**, archivo por archivo, y el resultado no alcanza:

- **Con derechos vigentes** todas las portadas: en Ecuador la protección es **vida del
  autor + 70 años** (Icaza † 1978 → ~2048; Pareja Diezcanseco † 1993 → ~2063), y aunque la
  novela entrara en dominio público **la portada tiene su propio dueño**, el que la
  diseñó.
- **Trampa del CC0:** los óleos de **Camilo Egas** aparecen como CC0 en Commons, pero ese
  CC0 lo puso quien **fotografió** el cuadro y cubre la foto, no la pintura — Egas murió en
  1962. Lo mismo con la caricatura de Gil Gilbert, que es el diseño de **una estampilla de
  Correos del Ecuador**. **Una licencia libre sobre la reproducción no libera la obra
  reproducida.**
- Lo único realmente limpio: el retrato de **José de la Cuadra** (dominio público) y la
  portada de *El indio ecuatoriano* (dominio público, repositorio de la Casa de la
  Cultura), esta última de **191×263 px**, demasiado pequeña. Todo lo demás, CC BY-SA de
  tumbas, monumentos y casas: esa licencia obliga a **compartir igual**, que no se puede
  cumplir dentro de un juego escolar.

### Quinta tanda: los movimientos de la R2 se VEN (2026-11-24)

*"Habíamos quedado que debería ser diferente porque si no, no se entiende qué movimientos
se deberían realizar."* El problema era más hondo que el de la rayuela: el chico puede
mover el dedo de mil maneras y **solo cinco significan algo**, así que estaba adivinando
una convención nuestra — el mismo defecto que hundió a la imprenta.

Ahora, debajo del juguete, salen **tres tarjetas** con la flecha y el nombre del
movimiento (el suyo y dos de los otros cuatro, barajados).

- ⚠ **Son una LEYENDA, no botones** (`pointerEvents: none`): hay que **hacer** el
  movimiento sobre el juguete. Si se pudieran tocar, la ronda sería una pregunta de tres
  botones y la mano dejaría de pintar nada.
- ⚠ **Un movimiento que no esté entre los tres no se anota**: avisa *"Ese no es ninguno de
  los tres"* y se repite. Si se anotara, el chico gastaría el juguete sin haber elegido
  nada de lo que se le ofrecía.
- 📌 **Se le dijo el precio antes de hacerlo:** con las tres a la vista la ronda se acerca
  a una opción múltiple. Lo eligió sabiéndolo, frente a cambiar de ronda — que además
  habría tirado las 5 ilustraciones de juguetes que acababa de generar. Las alternativas
  ofrecidas fueron otra vez la torre de los gobiernos y el pliego de la huelga.

**R3 · "unir", no "tender".** *"Eso que dice ya tendiste los tres, cambiado sería algo así
como que ya uniste los 3."* Tender un hilo es la palabra del código, no la de un chico de
11 — mismo caso que "platillo" en el Tema 1. Ahora: *"Te falta unir 1"* / *"Te faltan 2
por unir"* / *"Ya uniste los 3. Toca ¡VERIFICAR!"*.

⚠ **Y una trampa de los scripts, por tercera vez:** los de QA hacían siempre el mismo
trazo, y desde esta regla un movimiento fuera de los tres no avanza: se colgaban. Ahora
`espacios`, `variedad` y `shot` **leen las opciones de la pantalla** y hacen la primera.

### Segunda tanda de la autora jugando el Tema 3 (2026-11-24)

Tres huecos marcados **en rojo sobre las capturas** y una regla de juego:

- **R1 · la regla de años empieza en el gobierno más antiguo de la partida, no en 1948.**
  *"¿Por qué mostrar desde 1948 si tenemos todo ese espacio vacío?"* — con el 1948 fijo,
  una partida de los años sesenta dejaba media regla muerta a la izquierda. Ahora el eje
  va de `min(ini)` a 1972 y el paso de las marcas se calcula para no pasar de siete.
  - ⚠ **El e2e tenía el 1948 escrito**: al volverse dinámico el eje, pinchaba en años que
    no eran y la partida "fallada" acertaba de casualidad (daba 3 ⭐ en vez de 1). El test
    calcula ahora el origen con los gobiernos que le tocaron.
- **R1 · cada gobierno lleva una frase de lo que hizo** y la ronda tiene una ilustración.
  *"Está horrible, pongámosle algo más, si no está muy pobre"*. Eran tres nombres pelados
  sobre tres barras.
  - ⚠ **Las frases NO llevan años**: si los llevaran regalarían la respuesta. Son obras
    (*"Creó TAME y el decimotercer sueldo"*), nunca fechas.
  - ⏳ Falta `assets/j7t3-carondelet.jpg` (1:1, el Palacio de Carondelet). Mientras no
    esté, cae al emoji 🏛️ y la ronda se juega igual.
- **R2 · pasarse NO es acierto.** *"Solo cuando pongo los bananos correctos debe salir
  correcto, no cuando lo supero"*. Antes valía con quedar a una caja, de más o de menos;
  ahora el acierto es **exacto**. Tenía razón: poner de más no es aproximarse.
- **R2 y R3 · bloques centrados y cartel del revelado en absoluto**, como ya estaba la R1.
  El hueco que marcó en rojo era el sitio reservado al cartel, que se veía vacío mientras
  se jugaba. Además la R3 tiene **fichas más altas (34 px) y la foto a 140×196**, y la R2
  columnas más anchas y un paso de 20 px.

**Verificado tras los cambios (2026-11-24):** format-lint 15/15 · e2e perfecta **9 ⭐** y
fallada **1 ⭐** · solapes limpios en 27 estados · variedad en 8 partidas: **R1 8/8 ·
R2 4/8 (de 4 posibles) · R3 8/8 · 0 repeticiones seguidas**.

⚠ **Las dos ilustraciones de soldados (`j7t3-soldado-*.jpg`) quedaron SIN USO** al caer
"Uno contra ocho". Siguen en `assets/` por si sirven para otro tema; si no, se borran.

## Libro 7 · Tema 3 — correcciones de la autora (2026-11-24)

⚠ **Este tema lo construyó OTRA sesión en paralelo.** Estas correcciones se hicieron desde
la sesión del Tema 2 después de comprobar que el fichero no se tocaba desde hacía rato y
que el último commit de la otra sesión era de horas antes. **Dos sesiones escribiendo en
`game-screens.jsx` a la vez se pisan**: antes de entrar, mirar `stat` del fichero y el
`git log`, y avisar a la autora de que no abra el otro chat.

**R1 · el retrato de cada gobierno, y el nombre que se lee.**

- El nombre iba en blanco entre más texto blanco y no se distinguía: ahora en **ámbar**.
- Fuera el **Palacio único** de la izquierda (no decía nada de cada gobierno) y en su
  lugar un **retrato por fila**, `assets/j7t3-<q>.jpg`. Con el sitio ganado, las barras
  pasaron de 322 a **356** y las filas de 22 a 26 de alto.
- ⚠ **Ninguna cara se genera.** El archivo es una foto real o no hay foto: si falta, cae
  a un icono y la fila sigue entera.

**R2 · columnas más grandes y la caja recortada.**

- 84 px de ancho (antes 62) y más separación. ⚠ **El paso quedó en 21, no en 26**: con 26
  la columna medía 278 y el año de abajo chocaba con el cartel del revelado en los tres
  viewports. Lo cazó `espacios-l7t3`.
- 🐛 **El "celeste" que no le gustaba a la autora era el fondo de la ilustración.** La
  caja de banano venía con un marco gris clarísimo y mucho aire alrededor; al apilarse,
  de las cajas de abajo solo se veía ese fondo, que **contra el verde del juego se lee
  azul**. No era un color del código: era la imagen. Se recorta con
  `.planning/recortar-margen.js`, que detecta el color de las cuatro esquinas y corta
  hasta el primer píxel distinto. 200×200 → 240×166.

**R3 · el veredicto se ve.** Cada frase lleva su **sello ✓/✗** (verde, rojo o ámbar)
además del color del marco. ⚠ Sin rótulo al lado: con él, el texto se iba a tres líneas,
la lista crecía y el cartel del revelado tapaba la última ficha.

**Variedad.** La R1 tenía el **mismo fallo del cap** que se corrigió en el Tema 2: cap 4
sobre un banco de 8 deja solo 4 libres para elegir 3, así que salía casi siempre el mismo
trío. Con cap 2 quedan 6 libres. Medido en 10 partidas: **R1 7/10 · R2 4/10 · R3 8/10**, y
ninguna repitió la anterior.

📌 **La R2 tiene un techo real de 4 combinaciones**: el libro solo da cuatro años en la
tabla de la p. 55 (1948, 1950, 1955, 1960) y se juegan tres. No se sube sin más material;
inventar cifras no es una opción.

**Retratos: lo que hay en dominio público.** Comprobado con la API de Commons, archivo
por archivo:

| Gobierno | Foto libre |
|---|---|
| Galo Plaza Lasso | sí (varias, PD) |
| Camilo Ponce Enríquez | sí (PD, 230×280) |
| Carlos Julio Arosemena Monroy | sí (PD, recortada de una con Kennedy) |
| Velasco Ibarra | sí (PD), las mejores con su esposa |
| Otto Arosemena Gómez | **no** |
| Primera Junta Militar | **no** |
| Palacio de Carondelet | **no** (todas CC BY-SA) |

⚠ **Para los que no tienen foto NO se genera un retrato**: se genera un **símbolo del
cargo** (la banda presidencial sobre una silla, los uniformes vacíos en un perchero). Una
cara inventada de una persona real no puede salir en material escolar.

⚠ **Descargar de Wikimedia da HTTP 429 si se piden varias seguidas.** Hay que espaciar
las peticiones y mandar un User-Agent propio — y **nunca el correo de la autora**.

`.planning/retrato-a-asset.js <origen> <nombre> [recorte]` deja cualquier foto lista:
recorta a 3:4 por arriba (donde está la cara) y guarda 180×240 en `assets/`.

### Las seis figuras de la R1, completas (2026-11-24)

| Archivo | Qué es |
|---|---|
| `j7t3-plaza.jpg` | foto real, dominio público (Commons) |
| `j7t3-ponce.jpg` | foto real, dominio público |
| `j7t3-arosemena.jpg` | foto real, dominio público (recortada de una con Kennedy) |
| `j7t3-velasco.jpg` | foto real, dominio público (recortada de una con su esposa) |
| `j7t3-otto.jpg` | **símbolo del cargo**: la banda presidencial sobre una silla |
| `j7t3-junta.jpg` | **símbolo del cargo**: cuatro uniformes vacíos en un perchero |

Las seis a 180×240 (3:4), de 7 a 13 KB cada una. Las dos generadas llegaron a 1024×1024 y
casi 800 KB.

⚠ **Otto Arosemena y la Junta NO llevan retrato inventado.** No hay foto libre de ellos y
una cara generada de una persona real no sale en material escolar: en su hueco va un
objeto que representa el cargo. Es la misma salida que con los autores del Tema 2.

⚠ **`upload.wikimedia.org` corta con HTTP 429** a quien baja varias seguidas, y el corte
dura un buen rato. Se baja de una en una, con pausas; si se atasca, el agente `web-fetch`
lo consigue porque sale por otro cliente.

⚠ **`retrato-a-asset.js` tiene ancla horizontal** (`0` izquierda · `0.5` centro · `1`
derecha) justo para estos casos: la única foto libre de Velasco Ibarra es con su esposa,
y su retrato está en la mitad izquierda. Se usó `0.42 0.04` (42 % del alto, pegado a la
izquierda).

### El doble clic ya no pinta de azul (2026-11-24)

Al hacer **doble clic** sobre una ficha, el navegador seleccionaba su texto y la pintaba
del azul de selección del sistema. La autora lo cazó apilando cajas de banano: dos toques
seguidos en la misma caja y se quedaba azul, como si fuera un estado del juego.

Arreglado en **`styles.css` de juego-12**, así que vale para los **seis temas** a la vez:
`user-select: none` en `body`/`.ed-body` más `-webkit-tap-highlight-color: transparent`
(el destello gris del toque en móvil).

- ⚠ **Los campos de texto se excluyen** (`input, textarea, select`): en el Home hay que
  poder escribir y corregir el nombre, y ahí seleccionar sí tiene sentido.
- ⚠ `styles.css` **no se empaqueta**: va enlazado desde el HTML, así que no hace falta
  `bundle.js` para este cambio.
- 📌 Es una copia del `styles.css` maestro: **los demás juegos siguen sin el arreglo**. Si
  se quiere para todos, hay que replicarlo en cada `juegos/<slug>/styles.css`, en la raíz
  y en `_PLANTILLA` (ver la sección de editar el shell en el CLAUDE.md del repo).

Lo vigila `.planning/sin-seleccion.js`: hace doble clic en el tablero de los tres temas
del Libro 7 y comprueba que no se selecciona nada, **y que el nombre del Home sí**.
