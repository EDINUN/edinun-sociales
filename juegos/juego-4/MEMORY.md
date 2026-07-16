# MEMORY.md — Bitácora del juego "Mi escuela y mi barrio"

> Decisiones de diseño, bugs encontrados y cómo se resolvieron, en orden
> cronológico. Una entrada por hito.

## 2026-07-13 — Creación · Tema 1 "Estar preparados"

- Juego multi-tema (3 botones en el Home). Personaje guía: **Andi**. Edad **6**.
- **Tema 1 "Estar preparados"** (`id: emergencias`): mecánica **ORDENAR** —
  3 tarjetas desordenadas → casillas **1·2·3** + VERIFICAR. Banco de secuencias de
  seguridad con anti-repetición FIFO: **sismo** (agáchate/cúbrete/sujétate),
  **ceniza** (mascarilla/gafas/gorra), **evacuar** (calma/camina/punto).
- Assets de las acciones generados por la autora (dibujos 3D, fondo transparente).

## 2026-07-15 — Tema 1: reveal del correcto (mini-tarjeta)

- La autora **rechazó** el reveal original: un pill con **emoji suelto** ("Va: 🧘")
  debajo de la casilla. Para un niño de 6 un emoji que **no se parece al dibujo**
  de la tarjeta no comunica nada.
- Se reemplazó por **"✓ Aquí va" + mini-tarjeta con la ILUSTRACIÓN real + el nombre**
  de la acción correcta, dejando arriba la tarjeta que eligió el niño con su ✗.
  → **Aprendizaje: el reveal debe usar el MISMO lenguaje visual que las tarjetas.**

## 2026-07-15 — Tema 1: números 1·2·3 tapados

- Bug reportado por la autora: los badges **1·2·3 quedaban detrás** de las tarjetas.
- Causa: el badge vivía **dentro** del div de la casilla (`zIndex: 2`), y las
  tarjetas colocadas son hermanas con `zIndex: 12` → toda la casilla y sus hijos se
  pintan por debajo (el z-index de un hijo no puede escapar del contexto del padre).
- Fix: sacar los números a una **capa propia de nivel raíz con `zIndex: 40`**,
  posicionada en coords lógicas (`SLOT_CX[i]`, `SLOT_CY - SLOT_H/2`).

## 2026-07-15 — Tema 2 "Amigos y compañeros" (CLASIFICAR)

- Contenido del libro (láminas "Amigos y compañeros" / vida en la escuela):
  convivencia, buen trato vs. maltrato, respeto, todos somos diferentes. Edad **6**.
- Mecánica elegida por la autora entre 2 propuestas: **CLASIFICAR** — 6 tarjetas
  (3 buenas + 3 malas de un banco de 8, anti-repetición) → 2 cajas
  **😊 Está bien / 😞 No está bien** + VERIFICAR. Diseño en
  `.planning/juego-4-tema2-design.md`.
- **Geometría reusada del juego de basura (juego-3): bandeja arriba (2×3) / cajas
  abajo.** Al soltar, la tarjeta se encoge a miniatura dentro de la caja (grid 3×2).
- **Reveal:** la miniatura **se queda donde la puso el niño** (con ✗) + chip con
  flecha a la caja correcta, que además **brilla**. Cumple la invariante de revelar
  el correcto sin ocultar lo que eligió.

## 2026-07-15 — Assets del Tema 2: las escenas necesitan CONTEXTO

- Primer intento de prompts: figuras sueltas con **fondo transparente**. La autora
  los rechazó: *"no me dice nada"* — un niño parado no comunica "esperar el turno".
- Fix: prompts con **mini-escena + fondo** (aula/patio, props, **2 niños
  interactuando**, caras muy expresivas). Con fondo se entienden mucho mejor.
  → **Aprendizaje: para acciones/valores, la tarjeta necesita escena, no figura suelta.**
- Los prompts con marcas ("Pixar / Disney") **dan error** en el generador de la
  autora → usar estilo genérico ("modern 3D animated cartoon style, glossy
  stylized CGI look").
- 8 imágenes: `conviv-{compartir,ayudar,turno,saludar,burla,empujar,gritar,quitar}.png`.

## 2026-07-15 — Tema 2: bug de las miniaturas sobre el rótulo

- La primera versión ponía las miniaturas a `BOX_TOP + 46` → **tapaban el título**
  de la caja ("Está bien" / "No está bien"). Fix: caja más alta (160) y miniaturas
  a `BOX_TOP + 66`.
- El chip de la flecha estaba **fuera** de la miniatura → habría chocado con la
  miniatura vecina si el error caía en otra columna. Fix: chip **dentro** de la
  miniatura (abajo, centrado).
- Verificado con Playwright (E2E real: arrastre → VERIFICAR → reveal → reporte),
  `format-lint` 14/14 y `qa-visual` sin overflow en los 6 viewports (colchón 34px).

## 2026-07-15 — Tema 2: enunciado y bocadillo estaban INVERTIDOS

- La autora lo reclamó: **"el enunciado me dice QUÉ hacer y el bocadillo CÓMO
  hacerlo"**. La primera versión tenía el enunciado "¿Está bien o no está bien?
  *Arrastra cada acción a su caja*" (el CÓMO en el enunciado) y el bocadillo
  "¿Cómo tratas a tus amigos?" (pregunta temática, no el CÓMO).
- Corregido, con el copy **dictado por la autora**: enunciado **"Las siguientes
  acciones ¿están bien o no?"** (QUÉ) + bocadillo **"Arrastra las acciones según
  corresponda."** (CÓMO). El Tema 1 ya lo cumplía.
- La regla existía en `memory/aprendizajes-de-diseno.md` §11 pero de forma implícita
  → se reescribió explícita, con tabla de roles y checklist.

## 2026-07-15 — Tema 2: de 6 a 4 tarjetas (y escenas más grandes)

- Pedido de la autora: **solo 4 tarjetas**, y **no tienen que ser 2 en cada caja**
  ("pueden ser 3 en un lado y 1 en el otro").
- Implementado: se eligen 4 del banco de 8 con reparto **al azar 1+3 / 2+2 / 3+1**,
  garantizando **≥1 de cada tipo** (si no, una caja quedaría vacía).
- **Beneficio colateral:** con 4 tarjetas las 4 miniaturas caben en **1 sola fila**
  dentro de la caja → las cajas bajan de 160 a 90 de alto → sobra espacio arriba →
  la bandeja pasa a **2×2 con escenas de 130 px** (antes 100). Se leen mucho mejor.
- Verificado con Playwright en 3 corridas: siempre 4 tarjetas, repartos 2+2/2+2/1+3,
  ninguna caja vacía, sin errores. `format-lint` 14/14 · `qa-visual` sin overflow.

## 2026-07-15 — Tema 2: centrado de miniaturas + aviso de "ya están todas"

Dos pedidos de la autora sobre el estado "ya arrastré todas":

1. **Las miniaturas deben quedar SIEMPRE centradas en su caja**, sin importar
   cuántas caigan en cada una. Estaban ancladas a una rejilla fija de 4
   (`(k - 1.5) * 50`) → con 1 o 3 quedaban pegadas a la izquierda. Fix:
   `convThumbPos(bi, k, n)` con offset `(k - (n-1)/2) * 50`, donde `n` = cuántas
   hay en ESA caja. Como hay `transition` en left/top, se **re-centran solas** al
   añadir/quitar.
2. **El hueco de la bandeja vacía no gustaba** → se añadió un aviso centrado
   (✓ verde + **"¡Ya están todas! / Ahora toca ¡VERIFICAR!"**) que sale solo cuando
   `allPlaced && !verdict`.

**Bug de animación encontrado por la captura de QA (importante, se repetía en 3
sitios):** poner `className="ed-checkPop"` en un elemento que ya usa
`transform: translate(...)` para posicionarse **rompe el centrado**: el keyframe
`edCheckPop` anima `transform:scale(...)` y **pisa** al translate mientras dura
(0.34 s) → el elemento aparece descentrado y luego "salta" a su sitio.
**Patrón correcto: un div de fuera POSICIONA (translate) y otro de dentro ANIMA.**
Corregido en el aviso nuevo, en el chip del reveal del Tema 2 y en el "✓ Aquí va"
del Tema 1 (que tenía el mismo salto latente).

## 2026-07-15 — Tema 2: en la CORRECCIÓN las tarjetas vuelven grandes

- Pedido de la autora: *"en la pantalla de corrección me gustaría que salgan las
  imágenes más grandes en ese espacio vacío para ver mejor"*. Con las miniaturas de
  46 px no se apreciaba la escena justo cuando más importa mirarla.
- Implementado: al fijar `verdict`, `restPos()` devuelve la posición de **bandeja** y
  `mini` pasa a `false` → las 4 tarjetas **vuelven a la bandeja 2×2 a tamaño completo**
  (con la `transition` de left/top/width la vuelta se anima sola). El hueco vacío
  se aprovecha justo cuando existe.
- Cada tarjeta lleva un **chip sobre el borde inferior de la imagen** (`top:112`, para
  **no tapar el nombre** de la acción — el primer intento con `bottom:5` lo tapaba):
  - acierto → `😊 Está bien` (la caja donde la puso, que es la correcta);
  - error → `😞(apagado) ➜ 😊 Está bien` = lo que eligió + a dónde iba (cumple la
    invariante de revelar el correcto sin ocultar la elección del niño).
- El ✓ verde grande que acompañaba al cartel "¡Ya están todas!" **se quitó**: a la
  autora no le gustó. Quedó solo el cartelito de texto.

## 2026-07-15 — Tema 3 "Sistema educativo ecuatoriano" (13 años, 3 rondas)

- **Salto de edad deliberado:** el tema es para **13 años** dentro de un juego cuyos
  Temas 1 y 2 son de 6. Se le advirtió a la autora (tono infantil, Andi, estrellitas)
  y **decidió meterlo igual**: para ella el Home es un **menú de temas del libro** y
  *"el estudiante entra y según su tema de libro selecciona el botón"*.
- Pedido explícito: **cada ronda con una mecánica distinta** y **nada aburrido**.
  Quedó: R1 **adivina el dato** (deslizador, cercanía) · R2 **mitos y datos**
  (V/F contrarreloj con racha) · R3 **completa el titular** (arrastrar con trampas).
  Diseño completo en `.planning/juego-4-tema3-design.md`.
- **Se descartó** la simulación "Ministro/a de Educación por un día" (era la más
  "juego"); la autora eligió otras. También "une con flechas": el libro dice que
  *ninguna respuesta es equivocada* → sin correcto/incorrecto no hay reporte.

## 2026-07-15 — Aprendizajes del Tema 3

- **⚠ NUNCA inventar cifras.** Es material escolar. Los 3 bancos salen **textuales**
  del libro (párrafos + actividad 1 + actividad 3, que ya trae los V/F resueltos).
  Para ampliar un banco → pedirle datos a la autora, no deducirlos.
- **Bug de banco barajado:** la pregunta *"¿En qué año se alcanzó ese máximo?"* salió
  **primera** y "ese máximo" no se había mencionado. → **Cada ítem de un banco debe
  entenderse SOLO**, sin depender de que otro haya salido antes.
- El emoji **🎚️ no renderiza** en la fuente del juego (sale un cuadrito) → usar 🎯.
- **Arrastre con nodos que se desmontan:** en la R3, sacar una palabra de un hueco
  desmonta su nodo y se pierde el `setPointerCapture` a media arrastrada. → los
  listeners `pointermove`/`pointerup` van en **window**, no en la palabra.
- `Tema3Controller` usa un array `SE_ROUNDS`: añadir una ronda = sumarla al array.
  La `key` incluye la ronda (si no, React reusa el componente y no se reinicia).

## 2026-07-15 — Lección de QA: "verificado" tiene que cubrir las RAMAS del banco

La autora preguntó *"¿estás seguro?"* tras decir yo que el Tema 3 estaba verificado.
**No lo estaba del todo:**

- El E2E cayó **por azar** en la frase de **1 solo hueco** (f3). Las de **2 y 3
  huecos** (incluida la más larga) nunca se habían ejecutado.
- `qa-visual` entra con el tema **por defecto** (Tema 1) → el layout del Tema 3
  **no estaba medido** en los 6 viewports.

Al probarlo bien, **la app aguantó**: 5/5 frases OK, 6/6 viewports sin overflow,
REINICIAR y el camino de FALSO OK. Los "fallos" eran **de mi test**, dos veces:
1. Soltaba todas las palabras en el **mismo hueco** (`huecos[0]`).
2. `span[style*="grab"]` matchea **también las palabras ya colocadas**, y como los
   huecos van **antes que la bandeja en el DOM**, `chips[0]` era una ya colocada →
   la sacaba del hueco anterior. Hay que filtrar por `!el.closest('span[dashed]')`.

→ **Regla:** cuando una mecánica tira de un banco con ítems de **forma distinta**
(1/2/3 huecos, distinto nº de opciones), hay que **forzar cada variante** (se puede
sembrando la clave de anti-repetición en `localStorage`), no confiar en el azar.

## 2026-07-15 — Tema 3: 1 sola actividad por ronda + fuera los contadores inventados

Dos correcciones de la autora sobre la primera entrega del Tema 3:

1. **"Es solo 1 juego, no 3 veces, y así para todas las rondas."** Yo había puesto
   3 datos (R1) y 5 afirmaciones (R2) por ronda. **Una ronda = UNA jugada.** El tema
   completo son 3 actividades. La variedad la da el **banco + anti-repetición**, no
   repetir dentro de la ronda. (Mismo criterio que el Reto 1 de juego-3 · Tema 2.)
   → `SE_DATOS_POR_PARTIDA = 1`, `SE_MITOS_POR_PARTIDA = 1`, caps a 4 para que no se
   repita entre partidas seguidas.
2. **"¿Qué es eso de 0/3 en el enunciado, de dónde sacas eso? No te inventes."**
   Los contadores ("Dato 1 de 3", "0 / 3", "1/5") **me los inventé yo**: no salen del
   libro ni los pidió. En el enunciado va **solo el QUÉ**; el progreso ya lo dicen los
   **puntitos de ronda**. Eliminados del enunciado y del HUD.
   → Cae también la **racha** de la R2: con 1 sola pregunta no hay nada que encadenar.

→ **Regla:** no añadir UI ni texto visible "de relleno" (contadores, marcadores,
rótulos) porque parezca útil. Si no lo pidió la autora ni sale del libro, **preguntar
antes** (ya está en `memory/aprendizajes-de-diseno.md`, lo volví a saltar).

## 2026-07-15 — Tema 3: alinear con el estándar (la tanda de correcciones)

La autora cazó, una tras otra, que el Tema 3 **no seguía el formato EDINUN**:
*"muchas cosas te estás inventando, ¿qué te pasa?"*. **Causa raíz: se construyó
"razonando" cada pantalla sin abrir `references/estandar-visual.md`** (273 líneas
normativas). Corregido contra el estándar y contra juego-3:

| Invento | Estándar |
|---|---|
| botón "CONFIRMAR" / "SIGUIENTE →" | **¡VERIFICAR!** y **avance automático** (§6) |
| "¿Cuánto crees que…?" encima de otra pregunta | la pregunta **es** el enunciado |
| contadores "Dato 1 de 3", "0/3", "1/5" + racha | fuera (el progreso lo dicen los dots) |
| Ronda `top:74`, dots 7×7 | **`top:52`, `ed-label`, dots 11×11** (§1.1) |
| HUD sin pills / pill propia | **⏱ + ⭐** con el estilo fijo (§1) |
| Tema 2 en **verde** "porque pega con el tema" | **amarillo**: el color va por **posición** (§0) |
| enunciado fuera de la banda → hueco enorme | **banda `top:78 bottom:22` con `space-evenly` y el enunciado DENTRO** (§4) |
| bocadillo largo montándose sobre la tarjeta | **cortado con `<br />`** (§2) |

También se corrigió **juego-3** (llevaba los gradientes fuera de tabla desde antes) y
se **amplió `format-lint.js`** con 4 checks nuevos (gradiente por posición, rótulos de
botón, Ronda top/dots) — probados rompiendo el juego a propósito. Los 4 juegos: verde.
El protocolo de aprendizaje quedó en `## Errores aprendidos` del `SKILL.md`.

## Pendiente

- Los 3 bancos son cortos (7 datos · 8 afirmaciones · 5 frases). Como ahora sale
  **1 ítem por ronda**, el banco rinde bastante más (7 partidas sin repetir dato),
  pero si la autora manda más material del libro, ampliarlos sigue sumando.
- **Sin imágenes**: se evaluaron (7 escenas, una por dato) y la autora las descartó.
  Si algún día se retoman, el registro visual para 13 años **no** es el 3D cartoon de
  los temas de 6 (el libro usa fotos ahí).

## 2026-07-15 — Tema 3 · R1: puntuación EXACTA (no por cercanía)

- La autora: *"si la respuesta es 2014 y yo selecciono 2013, entonces debería estar
  mal, ¿no crees?"*. Tenía razón: un año es un dato discreto, no una estimación.
- **Causa raíz:** yo puse "puntúa por cercanía" como **decisión por defecto** y ella
  nunca la aprobó. Con `tol: 2` en el año, 2013 y 2012 contaban como acierto.
  → Otra vez el mismo patrón: rellenar un hueco de especificación por mi cuenta.
- **Ahora:** sin `tol`. Acierto = **caer en la muesca correcta**. Se compara con
  `< step/2` y NO con `=== 0`: el deslizador calcula `min + n*step` y la coma flotante
  devuelve 5.300000000000001, así que un `=== 0` fallaría siempre.
- **Se sacó del banco el "3,98 % del PIB"** (decisión de la autora): con step 0,02 en
  un rango 0-10 son 500 posiciones; clavarlo arrastrando es imposible → sería siempre
  fallo. El banco queda en **6 datos, todos clavables** (verificado: 6/6).
- Copy: "¡Muy cerca!" → **"¡Exacto!"**. Y fuera el **"No era así"** de la R2
  (a la autora no le gustó): el fallo muestra solo ✗ + "Es VERDADERO/FALSO."
- Verificado con Playwright forzando el dato del año: **2013 → FALLO ✓ · 2014 → ¡Exacto! ✓**

## 2026-07-16 — Renombres (decisión de la autora)

- **Bocadillo R3:** "Arrastra las palabras a los huecos." → "…a los **espacios**."
- **Chip Tema 1:** "Estar preparados" → **"Mi escuela y mi barrio"** (tomó el nombre
  que era del juego). **Chip Tema 3:** "Sistema educativo" → **"Sistema educativo
  ecuatoriano"** (como el tema del libro). Cambian `label` + `catLabel` (el campo
  "Tema" del reporte) y `CAT_LABEL`.
- **Título global del juego:** "Mi escuela y mi barrio" → **"Ciudadanos en acción"**
  (elegido por la autora entre 4 propuestas; debía ser un paraguas para los 3 temas).
  Tocó: rótulo del Home (`EDINUN · …`), `<title>` de ambos HTML (estaba quedado de la
  PLANTILLA), card del landing raíz (`GAMES`), CLAUDE.md y `memory/audiencia_por_juego.md`.
- QA: format-lint 18/18 + qa-visual sin overflow (los 3 chips largos caben).
- **Glifos del fondo** (pedido de la autora): antes eran solo de escuela/emergencias
  (T1); ahora mezclan los 3 temas — 🏫🚸🧯⛑️🚦 (T1) · 🤝😊 (T2) · 🎓📚✏️📊 (T3) —
  en las dos variantes de `CosmosBg` (cosmic del Home y chalkboard del juego),
  manteniendo posiciones/tamaños. Fuera 🎒🗺️🛡️📋🧭 (utilería genérica).

## 2026-07-16 — Mini-logo alineado con edinun-language (cambio de ESTÁNDAR, todos los juegos)

- La autora notó que el logo del HUD se veía más chico que en los juegos de lenguaje.
  Cierto: sociales usaba **60** (HUD) y **52** (reporte); lenguaje usa **64/56** en
  sus 25 juegos (`logo.jsx` es idéntico entre repos — era solo el `size`).
- Con su OK se cambió el **estándar del repo**: HUD 60→**64**, reporte 52→**56**, en
  los 4 juegos + `_PLANTILLA` (re-empaquetados los 5). CharacterScreen ya estaba en 64.
- `estandar-visual.md` §1/§5/§7 actualizados y `format-lint.js` ajustado (HUD=64) +
  **check nuevo** "Mini-logo reporte = 56" — ambos probados rompiendo juego-1 a
  propósito hasta verlos fallar. Lint: 13/13 · 13/13 · 19/19 · 19/19. qa-visual: verde.
