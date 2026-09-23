# CLAUDE.md — juego-10 "Ecuador megadiverso" (Estudios Sociales)

## Project

Carpeta autocontenida del repo `edinun-sociales`. Juego **multi-tema** (3 botones en el
Home). Guía por defecto **Yaku** — por el **ciclo del elenco** (`memory/orden-personajes.md`:
Domi → Yaku → Sisa → Andi según el ordinal del slug; **10 mod 4 = 2 → yaku**), no por
temática.

> ⚠️ **Título PROVISIONAL: "Ecuador megadiverso".** Lo puso el asistente para poder
> registrar el juego; **la autora todavía no lo aprobó**. Con los tres temas cerrados ya
> se queda claramente corto: solo describe el Tema 1 — el Tema 2 es el Ecuador del siglo
> XXI y el Tema 3 es el clima del **planeta entero**, no del Ecuador. Al definirlo hay que
> cambiarlo en 4 sitios: hero de `screens.jsx`, `<title>` de **ambos** HTML y el array
> `GAMES` del landing.

| Tema | id | Edad | Estado |
|---|---|:--:|---|
| **1. Recursos naturales y derechos de la Tierra** (Tema 2 del libro) | `recursos` | **8** | ✅ 3 rondas · 10 ⭐ |
| **2. Inicio del siglo XXI** (Tema 1 del libro) | `siglo21` | **11** | ✅ 3 rondas · 11 ⭐ |
| **3. El clima de nuestro planeta** (Tema 4 del libro, D.C.D. CS.4.2.3) | `clima` | **12** | ✅ 3 rondas · 10 ⭐ |

> ✅ **Los 3 temas están completos (2026-09-02), con NUEVE verbos distintos entre ellos.**
> Ya no queda ningún botón en "Próximamente" (`estandar-visual.md` §8).
>
> ⚠️ **La edad varía por tema dentro del MISMO juego** (8, 11 y 12). La fija la autora tema
> por tema; no se deduce del juego. Las mecánicas de los temas 2 y 3 son más exigentes a
> propósito.
>
> **Los nueve verbos, para que un tema nuevo no repita ninguno:**
> arrastrar-al-mapa · tocar-franja · elegir-entre-dos (Tema 1) ·
> ordenar-arrastrando · buscar-con-lupa · arrastrar-el-borde-del-gráfico (Tema 2) ·
> lanzar-la-tarjeta · girar-el-aro · destapar-pistas (Tema 3).

Diseño: `.planning/juego-10-design.md`. Audiencia registrada en
`memory/audiencia_por_juego.md`. Preferencias del usuario: `USER.md`.

## Running / bundle

HTML estático (React 18 + Babel Standalone desde unpkg). Sin build ni tests. Tras
editar cualquier `.jsx`, re-empaquetar (concatena los 5 `.jsx` en ambos HTML, idénticos):

```bash
node .planning/bundle.js        # Node (recomendado; esta máquina no tiene Python real)
```
Invariantes del bundle: ningún `.jsx` con `</script>` literal; reescribe desde
`<script type="text/babel">` hasta `</html>`.

## Arquitectura (game-screens.jsx)

`GameScreen` despacha por `app.currentCategory` y monta **`J10Game`**, el orquestador
único que comparten todos los temas: recibe el arreglo de rondas por prop y saca de él el
nº de rondas (`total = ROUNDS.length`). Trae el chrome EDINUN de juego-13 (HUD,
pastillas de tema, personaje/bocadillo, columna de acciones con `¡VERIFICAR!` vía
`verifyRef` + estado `busy`, overlay `¡EXCELENTE!/¡UPS!`, modales, reporte imprimible).

### Tema 1 · Recursos naturales — `J10_ROUNDS` (3 rondas, 3 verbos)

- **R1 `R1Mapa` — ARRASTRAR + ¡VERIFICAR!.** 4 fichas (especie o producto) en bandeja 2×2
  (fichas de **104×62**, `minHeight: 132` fijo para que el mapa no salte al vaciarse) →
  panel de 456 px con **4 zonas** (`minHeight: 126`): recuadro insular **GALÁPAGOS** (86 px),
  un **canal de mar** de 12 px y las bandas **COSTA · SIERRA · AMAZONÍA** repartiéndose el
  resto. Pointer events con **respaldo tap** (tocar ficha → tocar zona); soltar fuera
  devuelve a la bandeja. Se exige que las 4 fichas **no sean todas de la misma región** (si
  no, se resolvería por descarte). Al verificar: ✓/✗ y, si falló, la región correcta.

  ⚠ **Ajustes de la autora (2026-08-13), no volver atrás:**
  1. Las fichas medían **138×70** y las zonas **176** de alto: *"los cuadritos están muy
     alargados"* / *"los cuadros de las especies muy anchos"*.
  2. En **miniatura** el emoji va **al lado** del nombre, no encima: apilarlos le sumaba una
     línea entera a cada ficha y era lo que estiraba las zonas.
  3. El **✓/✗ cierra la fila de la miniatura** y la **región correcta va dentro del flujo**
     de la ficha. Colgando por fuera (`top:-8` / `bottom:-9`) se montaban sobre la ficha
     vecina en cuanto las fichas quedaron juntas.
  4. ⚠ **El bocadillo NO puede decir "sobre el mapa"**: la autora preguntó *"¿a qué mapa se
     refiere?"* — el panel son 4 zonas de color, no una silueta reconocible del Ecuador.
     Dice **"Arrastra la ficha hasta su región."**. Si algún día se dibuja la silueta real,
     ahí sí se puede volver a nombrar el mapa.
  5. **El mapa va ANCLADO ABAJO** (`justifyContent: flex-end` en el contenedor, bandeja
     centrada en el hueco libre de arriba) y la fila lleva `alignItems: flex-end`, así que
     **cada ficha que cae hace crecer los cajones HACIA ARRIBA** con la base clavada.
     El alto es **COMPARTIDO por las 4 zonas**: `118 + paso × maxEnZona` (manda el cajón más
     lleno), calculado — no un `minHeight` fijo. `paso` = **34** jugando y **48** al
     verificar, que es cuando cada ficha suma su línea de ✓/✗ + región.
     Medido: el borde inferior se queda en **y=522** y el panel va **138 → 172 → 206 →
     240 → 274**.
     ⚠ **Cuatro intentos hasta acertar**, uno por reporte de la autora: `minHeight: 126`
     fijo (no crecía nunca) → base **62** (*"los cuadritos deben ser más grandes"*) → alto
     **por zona** (*"no debe crecer solo uno, deberían crecer todos, mira lo feo que
     están"*) → **alto compartido**. Las tres condiciones van juntas: **base grande +
     crecer + crecer todas iguales**.
  6. **La ficha colocada conserva la MISMA forma que en la bandeja**: emoji arriba, nombre
     abajo (pedido de la autora: *"que se arrastre así como está"*). Valores `mini`: emoji
     **16**, nombre **11** —un punto MÁS grande que en la bandeja, que va a 10,5— y alto
     **58**. Empezó en 11/7,5/22 y hubo **tres reportes** hasta llegar aquí ("se ven muy
     pequeñas", "se reducen demasiado", "que las letras se vean más grandes").
     ⚠ Se probó ponerlos **en fila** (emoji al lado del nombre) para ahorrar alto: además de
     no gustarle, dejaba el nombre en ~60 px y las palabras largas se partían
     ("Murciélag/os"). **Apilados el nombre dispone del ancho completo (~82 px)** y entra a
     cuerpo 11 sin partirse — la forma que ella pedía era también la que resolvía el ancho.
     - El panel está en **468 px** (de 470 disponibles) y los **4 cajones al mismo ancho**
       (~104); el canal de mar, en 10 px.
     - `overflowWrap: "anywhere"` queda de red de seguridad: con `minWidth: 0`, una palabra
       larga sin punto de corte se derramaba fuera de la ficha.
     ✅ Verificado recorriendo **las 54 especies** (`anchos-j10.js`): ninguna se parte ni se
     derrama dentro del cajón.
  7. Al verificar, el **✓/✗ y la pastilla de la región van posicionados DENTRO de la ficha**,
     sobre la franja de 12 px que su `paddingBottom` reserva **siempre** (también sin
     verificar). Así el alto de la ficha —y el del cajón— es idéntico antes y después de
     verificar: **nada salta**. En el flujo normal sumaban una línea y obligaban a reservar
     20 px extra por ficha; en la fila del nombre le robaban ancho y lo cortaban
     ("Naranjil…", "Anguila"); flotando fuera del borde se montaban sobre la ficha vecina.
  8. El margen de tolerancia al soltar es **asimétrico**: `padY = 22` y `padX = 8`. Las
     zonas están a 7 px una de otra y un margen horizontal ancho las solaparía, soltando la
     ficha en la vecina.
- **R2 `R2Ascensor` — TOCAR, sin ¡VERIFICAR!.** Corte vertical del territorio en **una
  sola columna de 6 franjas** (órbita geoestacionaria · espacio aéreo · mar territorial ·
  plataforma submarina · subsuelo, y la **zona Antártida** cerrando con algo más de aire
  arriba). Yaku muestra una definición **literal del cuaderno** y el niño toca la franja.
  **UNA definición por ronda**; valida al tocar y se llama a `onSolve` de inmediato — el
  revelado (tocada en rojo, correcta en verde) sigue en pantalla mientras el orquestador
  espera sus 900/2400 ms.

  ⚠ **Dos correcciones de la autora (2026-08-13), no volver atrás:**
  1. Iba con **2 definiciones** encadenadas "para que la ronda no quedara corta" → rompe
     la regla dura *una ronda = UNA jugada* (errores aprendidos, nacida de juego-4). Es una
     sola, y por eso vale **+3 ⭐** de golpe (criterio de la calculadora de juego-13 T2R2).
  2. Las franjas eran **blanco translúcido al 14 %** sobre el fondo verde y la **Antártida
     iba en un recuadro suelto al costado**: *"casi no se notan, se ven muy brillantes"* y
     *"eso está súper feo"*. Ahora van en **crema opaco** (como las fichas de la R1 y las
     opciones de la R3) y en la misma columna.
- **R3 `R3Ficha` — ELEGIR + ¡VERIFICAR!.** Ficha tipo cuaderno de campo de UNA especie
  emblemática con **3 huecos** de 2 opciones. `¡VERIFICAR!` valida los 3 de una vez (una
  ronda = una jugada). Al fallar: la correcta en verde con ✓ **y** la elegida en rojo con
  ✗ — se ven las dos.

### Tema 2 · Siglo XXI — `J10_ROUNDS_S21` (3 rondas, 3 verbos NUEVOS)

Es el **Tema 1 del libro** (pp. 112-117 + cuaderno 103-106), **para 11 años**. Los verbos
no repiten los del Tema 1. Diseño completo en `.planning/juego-10-design.md` §11.

- **R1 `R1Linea` — ORDENAR ARRASTRANDO + ¡VERIFICAR!.** 4 hechos en columna (tarjetas de
  452 px, sin año visible). Se **arrastra** la tarjeta hasta su lugar: flota siguiendo el
  dedo y una **barra dorada** marca el destino. ⚠ La columna **no se reordena en vivo** y
  los rectángulos de los slots se **congelan** al empezar el arrastre — reordenar mientras
  arrastras mueve las tarjetas bajo el dedo y da tirones. El desplazamiento se **acota** al
  alto de la lista (±20 px) para que la tarjeta no se salga de la zona. El **toque queda de
  respaldo**: tocar una la levanta y tocar otra las intercambia. Al revelar, cada
  tarjeta muestra **su año** y, si está mal, **"va Nº"** — sin reordenar la columna, para
  que el niño siga viendo su respuesta.
  Banco `J10_HITOS`: **9 hitos, todos con año explícito y todos con año DISTINTO**.
  ⚠ **Fuera del banco:** el *feriado bancario* (el libro lo fecha "finales del siglo XX",
  sin año → orden ambiguo frente a 1994) y la *deuda de febrero 2023* (chocaría con las
  monedas de diciembre 2023). Si la autora confirma el año del feriado, entra.
  ⚠ **`verificar()` hace `setSel(null)` primero**: si el niño toca una tarjeta y va directo
  a ¡VERIFICAR!, esa tarjeta quedaba desplazada y su ✗ se salía de la zona de mecánica.

- **R2 `R2Lupa` — BUSCAR con lupa + ¡VERIFICAR!.** Escena de **458×326** con 9 elementos
  (4 calientan el planeta, 5 decorado). Cada escena trae **su propio banco** (7-8 que
  calientan + 10 de decorado) y cada partida saca **4 + 5** barajados en 9 huecos fijos
  (`J10_SLOTS`, 3 filas × 3 columnas medidas): la autora pidió *"emojis variados, no
  siempre los mismos"* (2026-09-02). Cada banco lleva su clave FIFO propia.
  ⚠ Ningún emoji puede ser "calienta" en una escena y decorado en otra — el e2e deduce la
  respuesta por emoji.
  Cada elemento va sobre una **placa clara** (blanco al 66 %, borde y sombra): sueltos
  sobre el degradado, los emojis pálidos (nube, fuente, casa) se fundían con el fondo
  (*"se pierden mucho"*, 2026-09-04). La placa da contraste a claros y oscuros por igual y
  además avisa de que el elemento se puede tocar.
  La lupa sigue al dedo (`onPointerMove`) y **amplía
  el más cercano** dentro de 58 px, a 1,45×. Elemento de **58 px con el emoji a 38** (la
  autora los pidió más grandes el 2026-08-28; antes 46 y 28). Se marcan 4 y se verifica de una vez. Revelado: ✓ en
  las marcadas bien, ✗ en las marcadas mal y **aro dorado punteado con el nombre** en las
  correctas que se escaparon.
  ⚠ **Marcar + ¡VERIFICAR!, no "se cierra al encontrar las 4"**: si solo terminara al
  acertar, sería imposible fallar y no habría revelado ni puntaje parcial.
  ⚠ **La lupa amplía UNO SOLO.** Ampliando a todos los que caían dentro del aro, dos
  vecinos crecían a la vez y se tapaban.
  ⚠ **Separación mínima de 72 px en un eje** (15,7 % en x o 22,1 % en y) entre elementos,
  para que el ampliado nunca cubra al vecino. Subió de 60 a 72 al agrandar el elemento, y
  por eso **las tres escenas** están repartidas en tres filas de profundidad. El **rótulo
  del revelado** se dibuja arriba cuando abajo no cabe.
  ⚠ **El fondo de la escena es UN degradado continuo** (`esc.fondo`, 5 paradas del celeste
  al tono de tierra), no dos bloques cielo/suelo. Los dos bloques dejaban una línea dura a
  media altura y la autora los rechazó: *"¿por qué está de dos colores, celeste y camel?"*
  (2026-09-02). Sin horizonte visible tampoco hay elementos "flotando en el cielo", que era
  el otro problema de ese reparto. Las tres escenas se distinguen por el **tinte**.
  ⚠ **Criterio de "calienta":** solo las dos causas del libro — quema de combustibles
  fósiles y deforestación. **Nada de ganado** ni como respuesta ni como decorado: el metano
  del ganado no está en el libro y marcar una vaca como "no contamina" sería discutible.

- **R3 `R3Grafico` — ARRASTRAR el borde + ¡VERIFICAR!.** Dos gráficos con el mismo gesto,
  porque el pastel solo daba **un** ejercicio y la ronda se repetiría al recargar:
  **pastel** de la deuda (2 manijas sobre el borde, la 3ª porción es lo que queda) y
  **barras** de países por bloque (3 de 4, escala 0-40, manija en la punta). Los tres
  números objetivo se muestran **desordenados** arriba: el ejercicio es decidir cuál va en
  cada categoría, no recordar la cifra. Tolerancia **±3** puntos (pastel) y **±1** país.

### Tema 3 · El clima de nuestro planeta — `J10_ROUNDS_CLIMA` (3 rondas, 3 verbos NUEVOS)

Es el **Tema 4 del libro** (pp. 48-51 + cuaderno; D.C.D. CS.4.2.3), **para 12 años**.
Diseño completo en `.planning/juego-10-design.md` §12.

⚠ **Reparto de contenido con el Tema 2.** El Tema 2 ya juega el cambio climático (su R2
busca las causas que calientan el planeta; su línea del tiempo incluye el Acuerdo de
París). Para que los dos temas no se sientan el mismo, el Tema 3 se queda con el **clima
como sistema** —qué es, en qué se diferencia del tiempo atmosférico, sus tipos y dónde se
dan— y **no vuelve sobre los gases de efecto invernadero**.

- **R1 `R1Noticias` — LANZAR la tarjeta + ¡VERIFICAR!.** Mazo de 4 noticias en el centro
  (carta de **300×96**); se arrastra cada una hasta uno de los dos rieles de arriba,
  **CLIMA** (violeta) y **TIEMPO ATMOSFÉRICO** (azul), y cae dentro como miniatura de 44.
  La carta se **inclina** al arrastrar (`rotate(dx·0,07)`, tope ±14°). ¡VERIFICAR! valida
  las 4 de una vez.
  - El destino se decide primero por **dónde se suelta** (riel + 16 px de margen) y, si el
    gesto se quedó corto de altura, **por el signo del desplazamiento** cuando pasa de
    70 px: a los 12 años el gesto natural es un manotazo horizontal, no puntería. Soltar
    en el medio devuelve la carta al mazo.
  - **Respaldo tap:** tocar un riel manda ahí la carta de arriba. Tocar una miniatura ya
    colocada la devuelve al mazo (se puede corregir antes de verificar).
  - ⚠ **Los dos rieles van a su alto MÁXIMO desde el principio (236 px = cabecera + las 4
    miniaturas).** Si crecieran al recibir cartas empujarían el mazo hacia abajo en cada
    lanzamiento. Es la versión "cajón grande desde el principio" de lo que la autora pidió
    en la R1 del Tema 1 (base grande + crecer + crecer todos iguales): aquí, con solo dos
    cajones y cuatro fichas, clavarlos al máximo es lo que consigue que **nada se mueva**.
    El mazo también tiene alto fijo (104) para no encoger al vaciarse.
  - ⚠ El ✓/✗ y la pastilla del lado correcto van **posicionados sobre la franja de 13 px**
    que el `paddingBottom` de la miniatura reserva SIEMPRE: el alto no cambia al revelar.
    Mismo remedio que la R1 del Tema 1.

- **R2 `R2Ruleta` — GIRAR el aro + ¡VERIFICAR!.** Aro de **260 px** con los 6 tipos de
  clima en pastillas de 84×34; la **flecha ▼ es fija** y arriba. Se arrastra el aro en
  círculo y al soltar **encaja** en la ranura más cercana (múltiplo de 60°). UNA jugada
  por ronda ⇒ **+3 ⭐** de golpe, igual que la R2 del Tema 1.
  - ⚠ **El brazo de cada pastilla lleva `rotate(i·60 + ang)`** — sin el `+ ang` el aro no
    gira: cambiaba la ranura seleccionada pero las pastillas se quedaban quietas y solo
    rotaba su texto. La pastilla se **contra-rota** `-(i·60) - ang` para que su texto quede
    siempre horizontal (girando con el aro, las de abajo se leerían de cabeza) y **ambas
    transiciones son idénticas**, si no se desincronizan al encajar.
  - ⚠ **El respaldo tap se resuelve en el `onPointerUp` DEL ARO, no con un `onClick` en la
    pastilla.** El aro captura el puntero al empezar (`setPointerCapture`, necesario para
    que el arrastre no se corte al salirse del círculo) y, con el puntero capturado, el
    `click` posterior se dispara sobre el aro y **no** sobre la pastilla: el toque se
    perdía y la ruleta se quedaba en su posición inicial —que a propósito nunca es la
    respuesta—, así que la ronda era **imposible de acertar sin arrastrar**. Las pastillas
    van con `pointerEvents: "none"` y el aro hit-testea cuál está bajo el dedo.
    Lo cazó el e2e: la partida "perfecta" daba **7 ⭐ en vez de 10**, no se veía a ojo.
  - ⚠ El **radio del brazo es 83**, no 86: con 86 la esquina externa de la pastilla llegaba
    a 131 px del centro y el aro mide 130 de radio, así que las de las 2 y las 4 cruzaban
    el borde dorado. El buje bajó a 78 en la misma medida para no quedar pegado por dentro.
  - ⚠ El **buje central es el planeta 🌍**, no el emoji del clima: delataría la respuesta
    antes de girar.
  - ⚠ El aro **nunca arranca con la respuesta bajo la flecha** (se sortea otra ranura): la
    ronda se ganaría sin jugar.

- **R3 `R3Misterio` — DESTAPAR pistas y deducir + ¡VERIFICAR!.** Tres sobres cerrados
  (148×146) que el niño abre tocándolos, y cuatro lugares abajo (92 de alto). ¡VERIFICAR!
  valida ⇒ **+3 ⭐**.
  - **Se puede acertar con UNA sola pista**: abrirlas todas no es obligatorio y no cuesta
    estrellas. Eso es lo que hace que la ronda sea *investigar* y no leer un enunciado
    largo — es la única de las nueve rondas del juego con información opcional.
  - ⚠ **Cómo se garantiza que hay UNA sola respuesta:** (1) las 4 opciones tienen siempre
    **climas distintos** (el banco tiene un lugar por clima) y (2) de las 3 pistas, al
    menos una está marcada **`clave: true`** — describe algo que en la tabla del libro solo
    cumple ese clima. Sin (2) podían salir tres pistas compartidas (p. ej. *"Tiene cuatro
    estaciones"*, que vale para templado **y** continental) y la ronda no tendría solución.
  - Al revelar, el lugar correcto muestra **su clima** en una pastilla ("clima templado"):
    es justo el emparejamiento que pide la actividad 3 del cuaderno.

### Estrellas (distinto del default)

**+1 ⭐ por ELEMENTO resuelto bien.**
- **Tema 1:** R1 hasta 4 (fichas) · R3 hasta 3 (huecos). La **R2 da +3 de una vez** porque
  se resuelve con un solo toque (criterio de la calculadora de juego-13 T2R2: que las
  rondas pesen parecido) → **máximo 10 ⭐**.
- **Tema 2:** 4 + 4 + 3 → **máximo 11 ⭐**. Que los temas no den lo mismo es correcto: cada
  tema es su propia partida.
- **Tema 3:** R1 hasta 4 (noticias) · **R2 y R3 dan +3 de una vez** (ambas se resuelven con
  una sola decisión) → **máximo 10 ⭐**.

`onSolve(isCorrect, entry, gained)` acepta el 3er parámetro. El `isCorrect` de la ronda
(dot del HUD y reporte) = **ronda perfecta**. Fallar nunca resta.

### Bancos y criterio de datos

- **`J10_ESPECIES` (R1): 54 ítems** del cuadro resumen de flora y fauna (p. 72) y de los
  textos por región — Costa 12 · Sierra 14 · Amazonía 15 · Galápagos 13.

  ⚠ **REGLA DEL EMOJI** (2026-08-13, reportada por la autora: *"¿por qué Gallinazos está con
  un corazón negro? Eso está mal, ¿en qué se relaciona?"*). El emoji es decorativo pero **no
  puede contradecir al nombre**: si existe el de la especie se usa; si no, va el de su
  **grupo** (🐦 ave · 🦅 rapaz o carroñera · 🦜 lorífero · 🐟 pez · 🐾 mamífero · 🌳 árbol ·
  🌿 planta · 🌸 flor · 🥔 tubérculo · 🌾 cereal). **Nunca un "parecido" que nombre otra
  cosa.** Corregidos: 🖤 gallinazos · 🐜 oso hormiguero (¡esa es su presa!) · 🌶️ achiote ·
  🐍 anguilas · 🕊️ fragatas/albatros · 🐤 piqueros · 🪶 águilas arpías · 🎋 caña de azúcar ·
  🪵 caucho. **Fuera del banco** papaya, taxos (🍈 es un melón) y pepino de mar (🥒 es la
  verdura): no había emoji que no mintiera.

  ⚠ **Excluidos por ambigüedad** (tendrían DOS respuestas correctas, misma regla que los
  montes Urales en juego-13): cedro · laurel · caoba · palo santo · cacao · palma
  africana · soya · monos · loros · papagayos · curiquingues · buitres · arveja ·
  garbanzo · atún · corvina · ganado vacuno · caballar · cabras · manglares · líquenes ·
  musgos · culebras · lagartijas · lagartos · serpientes.
  ⚠ Fuera también naranja/mandarina junto a naranjilla y plátano junto a banano: a los
  8 años son indistinguibles entre sí.

- **`J10_ZONAS` (R2): las 6 zonas** del territorio con sus definiciones **literales** del
  cuaderno (p. 69, "Lee el texto sobre las otras regiones que pertenecen a nuestro país").
- **`J10_FICHAS` (R3): 4 especies emblemáticas** — Cutín (7 campos) · Tortuga de
  Galápagos (5) · Cóndor (6) · Chuquiragua (5).

  ⚠ **Criterio de distractores (pendiente de visto bueno de la autora):** el dato correcto
  (`ok`) es SIEMPRE textual del libro. El distractor (`no`) sale también del libro (de otra
  región u otra ficha) siempre que exista alternativa real —p. ej. "8 200 especies" como
  distractor de "1 900 especies"—; donde el libro no ofrece ninguna, es una **negación
  evidente** del dato, nunca una cifra inventada, y va marcada con `// negación` en el
  `.jsx`.

- **Los colores de las 4 regiones NO salen del libro** (su cuadro no fija paleta): son los
  4 del ecosistema EDINUN, los mismos que juego-13 usa para los continentes.

### Bancos del Tema 2

- **`J10_HITOS` (R1): 9 hitos** con año explícito del libro — 1884 sucre · 1960 ALADI ·
  1969 CAN · 1975 SELA · 1994 MERCOSUR · 2000 dólar · 2011 CELAC · 2017 París ·
  2023 monedas.
- **`J10_ESCENAS` (R2): 3 escenas** (ciudad · bosque · campo) de 9 elementos cada una.
- **`J10_DEUDA` + `J10_BLOQUES` (R3):** FMI 33 % · BID y CAF 49 % · los demás 18 %;
  ALADI 13 · SELA 26 · CAN 5 · CELAC 33 países.

⚠️ **INCONSISTENCIA DEL LIBRO, avisada a la autora (2026-08-14):** la p. 114 dice que la
deuda total son **48 129 millones** y que los **8 100 del FMI** "equivalen al **33,3 %**",
pero 8 100 de 48 129 es el **17 %**. El 33,3 % solo cuadra sobre la deuda con **organismos
multilaterales**. Por eso el gráfico se rotula **"La deuda del Ecuador con los organismos"**
y usa **solo porcentajes**: no se mezclan los millones para no enseñar una cuenta que no
cierra. Volver a la redacción literal es cambiar `J10_DEUDA.titulo`.

⚠️ **La CAN con Chile:** el libro la da integrada por Bolivia, Ecuador, Colombia, Perú y
**Chile**; Chile salió de la CAN hace décadas. Se juega con **el número del libro (5)**,
que es lo que se va a evaluar. Avisado a la autora.

### Bancos del Tema 3

- **`J10_CL_NOTICIAS` (R1): 12 noticias** — 6 de clima y 6 de tiempo atmosférico.
  ⚠ **NO son textuales del libro** (el libro solo da un ejemplo). Lo textual es el
  **criterio** de la p. 48: el clima son "las condiciones promedio […] durante un periodo
  prolongado […] al menos treinta años" y el tiempo atmosférico es "el estado de la
  atmósfera en un momento y lugar específicos", que "puede cambiar rápidamente, incluso en
  cuestión de horas". Cada noticia aplica ese criterio con una marca temporal explícita
  ("desde hace décadas", "año tras año", "todos los años" ⇒ clima · "mañana", "hoy", "esta
  noche", "ayer" ⇒ tiempo). Mismo precedente que los ejercicios de cálculo de juego-13
  T2R2: **el molde es del libro, los enunciados se construyen con él.**
  ⚠ **Los emoji están repartidos a propósito entre los dos grupos** (los dos usan símbolos
  del tiempo: 🌧️ ☀️ ❄️ 🌨️ 🍂 🏔️ / 🌂 🌡️ 🌫️ 💨 🧊 ☁️). Si el clima llevara paisajes y el
  tiempo, nubes y lluvia, **el emoji resolvería la ronda sin leer la noticia**.
- **`J10_CL_CLIMAS` (R2): los 6 tipos de clima** con sus características **literales** de
  la tabla "Tipos de climas alrededor del mundo" (p. 49). Los nombres van en **singular**
  ("TROPICAL", "ALTA MONTAÑA") porque así los escribe el cuaderno en la actividad 3; la
  tabla los lista en plural.
- **`J10_CL_LUGARES` (R3): 6 lugares, uno por clima** — Amazonía 🌴 tropical · cordillera
  de los Andes 🏔️ alta montaña · desierto del Sahara 🏜️ seco · Antártida 🧊 polar (los
  cuatro, de la actividad 3 del cuaderno) · Siberia 🌲 continental · Japón 🗾 templado (los
  dos, de la actividad 4). ⚠ **Japón, y no España o Italia** —que la actividad 4 también
  da como templados— porque 🗾 **nombra a Japón**: para España no había emoji que no
  mintiera (🫒 nombra una aceituna, 🏖️ una playa) y la regla del emoji del Tema 1 lo
  prohíbe.
- **`J10_CL_PISTAS` (R3): 3-4 pistas por clima**, todas de la tabla de la p. 49, del mapa
  de zonas de la p. 49 o de las actividades 3 y 4 del cuaderno. Las marcadas `clave: true`
  son las que **solo cumple ese clima**; el sorteo obliga a incluir una.

### Anti-repetición

FIFO en `localStorage`, **una clave por ronda**.
Tema 1: `edinun_j10_r1_v1` (4 de 54, cap 14) · `edinun_j10_r2_v1` (1 de 6, cap 5) ·
`edinun_j10_r3fic_v1` (1 de 4 fichas, cap 3) · `edinun_j10_r3_<ficha>_v1` (3 campos de
4-7, cap 2).
Tema 2: `edinun_j10_s21r1_v1` (4 de 9, cap 4 → 126 combinaciones) ·
`edinun_j10_s21r2_v1` (1 de 3 escenas, cap 2) · `edinun_j10_s21r3_v1` (1 de 5 gráficos,
cap 4).
Tema 3: `edinun_j10_cl_r1_v1` (4 noticias de 12, cap 6) · `edinun_j10_cl_r2_v1` (1 clima
de 6, cap 5) · `edinun_j10_cl_r3_v1` (1 lugar de 6, cap 5). Las **pistas de la R3 NO
llevan FIFO**: el banco por clima tiene 3 o 4 y guardar recientes lo dejaría sin de dónde
elegir — se barajan obligando a que entre una `clave`. Lo mismo con las 3 opciones
acompañantes y con el orden del aro de la R2, que se barajan en cada montaje.
`j10PickIdx` devuelve índices **sin registrarlos** y `j10Commit` los registra. ⚠ Regla de
cap: para un SUBCONJUNTO de K, nunca cap = K (partiría el banco en grupos fijos que
alternan idéntico cada recarga).

**Sin imágenes todavía:** emoji + nombre. Las fotos del libro no se reproducen. La autora
va a generar **9 iconos de hito (120×120)** y **3 escenas + 12 objetos** para el Tema 2;
el código los espera en `assets/` con el emoji de respaldo (ver design-doc §11.5).

**Textos (regla dura):** el **enunciado** dice **QUÉ** hacer y el **bocadillo** del guía
dice **CÓMO**. Ver `memory/aprendizajes-de-diseno.md` §11.

## Contrato del shell

- `app.jsx` (shell, NO tocar): enruta `home → character → game → results`.
- `screens.jsx`: `HomeScreen` (3 botones desde **`LEVELS_CFG`**, grid `1fr 1fr 1fr` gap 10,
  gradientes **por posición**), `CharacterScreen` (preselecciona **Yaku**), contador de
  visitas, `CosmosBg`. `choose()` fija `currentCategory` / `currentCatLabel`.
- `game-screens.jsx`: expone `GameScreen`/`ResultsScreen` en `window`. `markFirstAttempt()`
  en la 1ª respuesta; `incrementGamesCompleted()` al terminar.

⚠ **La preselección del guía NO puede escribirse `app.character || "yaku"`**: `app.jsx`
—que es shell y no se toca— inicializa `character: "domi"`, que es truthy, así que el
fallback nunca entra y el niño veía a Domi. Va como en juego-8:
`app.character && app.character !== "domi" ? app.character : "yaku"`.
(**juego-1 tiene todavía esa forma rota** con Yaku: `app.character || "yaku"`.)

## Contador de visitas

`counter.php` idéntico a los demás; cae a `localStorage` sin PHP. `visits.txt`
gitignoreado — borrarlo antes de subir a producción.

## QA

```bash
node juegos/_PLANTILLA/.planning/format-lint.js juego-10   # 19/19 OK
node juegos/_PLANTILLA/.planning/qa-visual.js  juego-10    # 6 viewports, sin overflow
```

**Verificado (2026-08-13, tras los ajustes visuales)** con un e2e propio que juega las 3
rondas, más una auditoría de espacios en las 3 rondas × 5 viewports (0 solapes, 0 textos
recortados, nada fuera de la zona central; colchones mecánica→acciones 54/59/61 px):
- **Partida perfecta:** 3/3 rondas · **10 ⭐** · 100 %, con **arrastre real de mouse**
  (pointerdown → move → up) en la R1. Sin overflow en ninguna ronda, 0 errores de consola.
- **Partida fallada** con el **respaldo tap** en la R1: ✗ en las 4 fichas + las 4 pastillas
  de revelado con la región correcta; R3 muestra ✓ y ✗ a la vez (6 distintivos en 3 filas);
  resultado 0/3 · 0 ⭐.
- **Ronda parcial** (3 bien + 1 mal): suma **+3 ⭐ y no las quita**, el dot de la ronda va
  rojo y el "¡UPS!" **no muestra estrellas**.
- **Anti-repetición:** 6 recargas → **0 repeticiones consecutivas** en las 3 rondas
  (6 combinaciones distintas en R1, 4 en R2, las 4 fichas en R3).
- **Colchón mecánica ↔ acciones: 54 px** medido sobre el **panel del mapa** (el div de
  456 px). ⚠ `qa-visual.js` **no lo mide**: solo escanea `button`, `img` y elementos
  `position:absolute`, y el panel es un hijo de flex. Su "gap 140" corresponde a las fichas
  de la bandeja.

**Verificado el Tema 3 (2026-09-02)** con un e2e propio que entra por el botón "El clima de
nuestro planeta" y juega sus 3 rondas:
- **Partida perfecta:** 3/3 rondas · **10 ⭐** · 100 %, con **arrastre real de mouse** en la
  R1 (4 cartas lanzadas) y **giro real en arco** sobre el aro de la R2.
- **Partida fallada:** 0/3 · **0 ⭐**, usando el **respaldo tap** en la R2 (toque sobre la
  pastilla). Revelado correcto en las tres rondas: 4 ✗ con el lado correcto en la R1, la
  correcta (✓) y la elegida (✗) a la vez en la R2 y en la R3.
- **Ronda parcial** (3 noticias bien + 1 mal): suma **+3 ⭐ y no las quita**; el dot de la
  ronda queda rojo.
- **Auditoría de espacios: 5 viewports × 3 rondas × antes/después de verificar** — 0
  elementos fuera del lienzo, 0 solapes entre botones de la mecánica, 0 textos recortados,
  0 errores de página. **Colchones mecánica ↔ acciones: 47 px** (R1 y R3) y **59 px** (R2).
- **Anti-repetición: 8 recargas jugando la partida entera** → 0 repeticiones consecutivas
  en las 3 rondas (8 combinaciones distintas de noticias, 6 climas, 7 juegos de pistas) y
  6 juegos de opciones distintos en la R3.

⚠ `qa-visual.js` **solo recorre el tema por defecto** (el 1): los temas 2 y 3 hay que
probarlos aparte seleccionándolos en el Home (como en juego-13).
