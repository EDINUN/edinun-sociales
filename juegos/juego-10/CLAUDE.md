# CLAUDE.md — juego-10 "Ecuador megadiverso" (Estudios Sociales)

## Project

Carpeta autocontenida del repo `edinun-sociales`. Juego **multi-tema** (3 botones en el
Home). Guía por defecto **Yaku** — por el **ciclo del elenco** (`memory/orden-personajes.md`:
Domi → Yaku → Sisa → Andi según el ordinal del slug; **10 mod 4 = 2 → yaku**), no por
temática.

> ⚠️ **Título PROVISIONAL: "Ecuador megadiverso".** Lo puso el asistente para poder
> registrar el juego; **la autora todavía no lo aprobó** y solo cubre bien el Tema 1. Al
> definirlo hay que cambiarlo en 4 sitios: hero de `screens.jsx`, `<title>` de **ambos**
> HTML y el array `GAMES` del landing.

| Tema | id | Edad | Estado |
|---|---|:--:|---|
| **1. Recursos naturales y los derechos de la Tierra** (Tema 2 del libro) | `recursos` | **8** | ✅ 3 rondas |
| **2. (sin definir)** | `tema2` | — | ⏳ sin material |
| **3. (sin definir)** | `tema3` | — | ⏳ sin material |

> ⏳ **Los temas 2 y 3 están en "Próximamente"** porque la autora aún no entregó su
> material. `estandar-visual.md` §8 **no admite eso como estado final**: un juego de N
> botones se entrega con las N mecánicas hechas. Es un estado intermedio declarado.
>
> Al implementarlos, sus verbos **no pueden repetir** los del Tema 1
> (arrastrar-al-mapa · tocar-franja · elegir-en-huecos).

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

### Estrellas (distinto del default)

**+1 ⭐ por ELEMENTO resuelto bien**: R1 hasta 4 (fichas) · R3 hasta 3 (huecos). La **R2 da
+3 de una vez** porque se resuelve con un solo toque (criterio de la calculadora de
juego-13 T2R2: que las rondas pesen parecido) → **máximo 10 ⭐**.
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

### Anti-repetición

FIFO en `localStorage`, **una clave por ronda**: `edinun_j10_r1_v1` (4 de 54, cap 14) ·
`edinun_j10_r2_v1` (1 de 6, cap 5) · `edinun_j10_r3fic_v1` (1 de 4 fichas, cap 3) ·
`edinun_j10_r3_<ficha>_v1` (3 campos de 4-7, cap 2). `j10PickIdx` devuelve índices **sin
registrarlos** y `j10Commit` los registra. ⚠ Regla de cap: para un SUBCONJUNTO de K, nunca
cap = K (partiría el banco en grupos fijos que alternan idéntico cada recarga).

**Sin imágenes:** emoji + nombre. Las fotos del libro no se reproducen. Si la autora genera
ilustraciones, el emoji queda de respaldo.

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

⚠ `qa-visual.js` solo recorre el tema por defecto; cuando existan los temas 2 y 3 habrá
que probarlos aparte seleccionándolos en el Home (como en juego-13).
