# CLAUDE.md — juego-13 "Un mundo por descubrir" (Estudios Sociales)

## Project

Carpeta autocontenida del repo `edinun-sociales`. Juego **multi-tema** (3 botones en
el Home). Guía por defecto **Domi** — por el **ciclo del elenco** (`memory/orden-personajes.md`:
Domi → Yaku → Sisa → Andi según el ordinal del slug; **13 mod 4 = 1 → domi**), no por
temática.

> **Título definido por la autora (2026-08-06):** "Un mundo por descubrir" (antes el
> provisional "Explorando el mundo"). Vive en 4 sitios: hero de `screens.jsx`,
> `<title>` de ambos HTML y el array `GAMES` del landing.

| Tema | id | Edad | Estado |
|---|---|:--:|---|
| **1. Los continentes: África, Asia, Europa y Oceanía** (Tema 5 del libro) | `continentes` | **12** | ✅ 3 rondas |
| **2. Las Américas y su geografía** (Tema 4 del libro) | `americas` | **12** | ✅ 3 rondas |
| **3. La diversidad cultural de la población mundial** (Tema 3 del libro) | `diversidad` | **13** | ✅ 3 rondas |

> ✅ **Los 3 temas están implementados** y ninguno queda en "Próximamente"
> (`estandar-visual.md` §8). **9 verbos distintos** entre los tres.
>
> ⏳ **Lo único pendiente:** las **4 ilustraciones de la R2 del Tema 3** (las genera la
> autora). El juego funciona sin ellas — corre con emoji hasta que lleguen.

Diseño: `.planning/juego-13-design.md` (temas 1-2) y
`.planning/juego-13-tema3-design.md` (tema 3). Audiencia registrada en
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

`GameScreen` **despacha por `app.currentCategory`** (`"americas"` → Tema 2; en otro caso
→ Tema 1) y monta **`J13Game`**, el orquestador ÚNICO que comparten todos los temas: recibe
el arreglo de rondas por prop y saca de él el nº de rondas (`total = ROUNDS.length`), así
un tema puede tener 2 y otro 3 sin tocar el chrome. Trae el chrome EDINUN de juego-8 (HUD,
personaje/bocadillo, columna de acciones con `¡VERIFICAR!` vía `verifyRef` + estado `busy`,
overlay `¡EXCELENTE!/¡UPS!`, modales, reporte imprimible).

⚠ El `TOTAL = 3` de módulo **ya no manda en el juego**: sobrevive solo como respaldo de
`ResultsScreen` si `lastResult` viniera vacío. El nº de rondas real sale del arreglo.

### Tema 1 · Los continentes — `J13_ROUNDS` (3 rondas, 3 verbos)

- **R1 `R1Aduana` — ARRASTRAR + ¡VERIFICAR!.** 4 fichas (accidente geográfico) en **rejilla
  2×2** (bandeja `display:grid`, fichas de 140 px, `minHeight:156` fijo para que el bloque
  de cajones no salte al vaciarse) → 4 cajones
  **ÁFRICA / ASIA / EUROPA / OCEANÍA**, con los **colores del cuadro de la actividad 6 del
  libro** (naranja · morado · azul · verde). Pointer events con **respaldo tap** (tocar
  ficha → tocar cajón); soltar fuera de los cajones devuelve a la bandeja. Se exige que las
  4 fichas **no sean todas del mismo continente** (si no, se resolvería por descarte). Al
  verificar: ✓/✗ sobre la ficha donde la puso el niño + pastilla con el continente correcto.
- **R2 `R2Podio` — INTERCAMBIAR (tap-swap) + ¡VERIFICAR!.** Podio de 4 pedestales de altura
  decreciente, **centrado verticalmente** (el contenedor externo centra; el bloque interno
  lleva `alignItems:flex-end` para conservar el escalonado — pegarlo abajo dejaba medio
  lienzo vacío); tocar ficha A → tocar ficha B las intercambia de puesto (**no se arrastra**:
  R1 ya arrastra). Al verificar aparecen **las cifras reales** en cada pedestal (placa
  oscura + borde dorado; cuerpo calculado por `vFs(texto, puesto)` — ⚠ el tope
  `J13_VCAP` por puesto es necesario: el pedestal del 4º mide 52 px y sin él la unidad
  se salía de la caja; cifra y unidad van en el MISMO bloque de texto para que fluyan
  juntas), ✓/✗ y
  pastilla **"Aquí va: `<ficha>`"** en las mal colocadas — revela **qué iba en ESE puesto**,
  no a dónde va la ficha que puso el niño (decisión de la autora: así ve su error y la
  respuesta juntos, como en juego-4). Banco `J13_PODIOS` (7 rankings del cuadro
  comparado); en 4 de ellos las fichas **no son continentes** (montañas / ríos / lagos)
  para que no se memorice un orden único. El barajado inicial nunca sale ya resuelto.
- **R3 `R3Cazador` — CAZAR EL INTRUSO + ¡VERIFICAR!.** Ficha de un continente con 5 filas:
  3 datos suyos + **2 infiltrados**. Se tocan los sospechosos. Al verificar: intruso cazado
  → ✓ + "es de ÁFRICA"; intruso no cazado → ✗ + "es de ÁFRICA" (revelado); fila legítima
  marcada por error → ✗ + "sí es de ASIA".

**Banco compartido `J13_LUGARES` (R1 y R3): 48 ítems textuales** del tema (África 11 ·
Asia 13 · Europa 16 · Oceanía 8).

⚠ **Excluidos por ambigüedad: montes Urales y mar Caspio** — el libro los da como límite
entre Europa y Asia, así que tendrían **dos respuestas correctas**. El **río Ural sí entra**
(la actividad 6 del cuaderno lo resuelve en Europa). Fuera también el río "Dniepper"
(errata del libro).

⚠ **Criterio de datos (acordado con la autora):** el libro se contradice en 3 cifras
(superficie de África, población de Asia, largo del Nilo). **Manda siempre el cuadro
"Datos continentales comparados" (pp. 77-78).** No inventar cifras: es material escolar.
Descartadas las pistas de clima (el libro dice "todos los climas" de Asia *y* de Oceanía).

### Estrellas (distinto del default)

**+1 ⭐ por ELEMENTO resuelto bien**, no por ronda: R1 hasta 4 (fichas) · R2 hasta 4
(puestos) · R3 hasta 2 (intrusos) → **máximo 10 ⭐**. `onSolve(isCorrect, entry, gained)`
acepta el 3er parámetro; sin él cae al default (`isCorrect ? 1 : 0`). El `isCorrect` de la
ronda (dot del HUD y reporte) = **ronda perfecta**. Fallar nunca resta.

### Anti-repetición

FIFO en `localStorage`, **una clave por ronda**: `edinun_j13_r1_v1` (4 de 48, cap 12) ·
`edinun_j13_r2_v1` (1 de 7, cap 6) · `edinun_j13_r3_v1` (1 de 4 continentes, cap 3).
`j13PickIdx` devuelve índices **sin registrarlos** (para poder re-sortear sin ensuciar la
memoria) y `j13Commit` los registra. ⚠ Regla de cap: para un SUBCONJUNTO de K, nunca
cap = K (partiría el banco en grupos fijos que alternan idéntico cada recarga).

**Sin imágenes:** emojis de tipo (🏞️ 💧 ⛰️ 🏔️ 🏜️ 🗺️) + nombre. Los mapas del libro no se
reproducen.

**Textos (regla dura):** el **enunciado** dice **QUÉ** hacer y el **bocadillo** del guía
dice **CÓMO**. Ver `memory/aprendizajes-de-diseno.md` §11.

## Tema 2 · "Las Américas y su geografía" — `J13_AM_ROUNDS`

Tema 4 del libro, **12 años**. **3 rondas con 3 verbos NUEVOS**: ninguno se repite del
Tema 1 (allá se arrastra, se intercambia y se caza).

- **R1 `T2R1Pasaporte` — ELEGIR + ¡VERIFICAR!** (patrón 6: huecos en una lectura). Ficha
  tipo pasaporte de UNA región con **3 huecos**; cada hueco muestra **las 2 opciones** y el
  niño toca la correcta. `¡VERIFICAR!` valida los 3 de una vez (una ronda = una jugada) y
  **solo se habilita con los 3 contestados**. Al fallar: la correcta en verde con ✓ **y**
  la que eligió el niño en rojo con ✗ — se ven las dos. Banco `J13_AM_REGIONES`: 3 regiones
  × 9-10 campos textuales (límites, elevación principal, río más largo, lago más grande,
  extensión, población, cordillera, clima, Antillas Mayores/Menores).
- **R2 `T2R2Calculadora` — TECLEAR + ¡VERIFICAR!** (patrón 3: respuesta única en teclado).
  Es la **actividad 5 del libro**: aplicar `((Pf − Pi) / Pi) × 100`. La ficha muestra los
  dos censos y **la fórmula siempre visible** (el libro la da en su recuadro): se ejercita
  aplicarla, no memorizarla. Teclado 3×4 con **tecla −** (el libro enseña el decrecimiento:
  Ecuador −1,2 % en 2021) y ⌫; visor de máximo 3 dígitos. Al verificar se revela **el
  desarrollo con las cifras puestas** en verde y, si falló, "Tu respuesta: N %" en rojo.
- **R3 `T2R3SalaDatos` — UNIR CON LÍNEAS + ¡VERIFICAR!** (patrón 10: conectar columnas).
  Tocar una tarjeta de la izquierda y luego una de la derecha las enlaza con una **línea
  curva de color** (anclas por `offsetLeft/offsetTop` + SVG, calcado de `PR3Empareja` de
  juego-6; **sin número de pareja**, la línea ya dice quién va con quién). Banco
  `J13_AM_TABLEROS`: **7 tableros** — los 3 instrumentos estadísticos ↔ lo que miden
  (actividad 4) · mayor IDH por región (Canadá/Cuba/Chile) · región ↔ elevación · ↔ río ·
  ↔ lago · ↔ población · ↔ extensión. La derecha se baraja y **nunca sale ya resuelta**.
  - ⚠ **El revelado NO va como segunda línea.** Se probó dibujar la correcta punteada en
    dorado junto a la del niño: con 3 pares fallados son **6 curvas en el mismo hueco** y
    queda una maraña ilegible. Ahora cada tarjeta de la DERECHA (que es la ancha) muestra
    al verificar **"va con `<concepto>`"** — el niño lee la respuesta ahí y ve su error en
    la línea roja. Las anclas **se recalculan al verificar** (`useEffect` con `[verified]`):
    las tarjetas crecen al aparecer ese texto y, con las anclas viejas, las líneas quedarían
    descolocadas.

**⭐ del Tema 2:** R1 **+1 por hueco correcto** (hasta 3) · R2 **+3 al acertar** · R3 **+1
por pareja correcta** (hasta 3) — las tres rondas pesan igual. Máximo **9 ⭐**.
`isCorrect` de la ronda = ronda perfecta.

**Anti-repetición del Tema 2** (claves propias): `edinun_j13_t2r1reg_v1` (región, 1 de 3,
cap 2) · `edinun_j13_t2r1_<región>_v1` (campos, **subconjunto de 3** de 9-10 → cap 5, nunca
cap = 3) · `edinun_j13_t2r2_v1` (1 de 8, cap 7) · `edinun_j13_t2r3_v1` (1 de 7 tableros, cap 6).

⚠ **Defectos del libro que quedan FUERA de los bancos** (documentados también en el `.jsx`):
- **Mortalidad infantil:** el libro rotula "punto máximo/mínimo" al revés del sentido real
  (Cuba 4/1000 es la tasa MÁS BAJA y figura como "punto máximo") → **no se usa**.
- **IDH de América Central:** el texto destaca a Costa Rica (0,810) pero el cuadro y la
  actividad 4 dan a **Cuba** (0,825) como el mayor → manda la actividad.
- **Ríos de América del Sur:** la lista NO está ordenada por longitud (Orinoco 2140 km
  antes que Madeira 3250 km) → manda la cifra, nunca el orden del libro.
- **Límites de América del Norte:** la actividad 1 dice "al Sur y al Oeste con el Océano
  Pacífico"; se usa el texto de *Construcción del aprendizaje* (N Ártico · E Atlántico ·
  O Pacífico · S América Central), que es el coherente.

⚠ **Las cifras de R2 son EJERCICIOS DE CÁLCULO**, no datos geográficos: el molde es el del
libro ("un país pasó de X a Y millones"), redondas y de resultado entero, **sin nombrar
ningún país real**. El primero del banco es el ejercicio 5 literal. Decisión consultada y
aprobada por la autora — **para ampliar el banco con países reales hace falta material**.

## Tema 3 · "La diversidad cultural de la población mundial" — `J13_DIV_ROUNDS`

Tema 3 del libro (D.C.D. **CS.4.2.26**), **13 años** — un año más que los otros dos, por
decisión de la autora, con el pedido explícito de que **no sea aburrido**.

⚠ **Este tema NO tiene cuadros de datos: es actitudinal.** Lo que se ejercita es
**criterio**, no memoria de cifras. El material son las pp. 125-126 y las actividades 1 y
2 del cuaderno (p. 86); **las actividades 3 y 4 son de respuesta abierta** (conversar,
reflexionar) → no se gamifican.

- **R1 `T3R1Muro` — DESLIZAR** (patrón 14). 5 cartas de a una: izquierda **LA ATACA**,
  derecha **LA ENRIQUECE**. La carta se inclina al arrastrar (`rotate` ∝ desplazamiento),
  umbral **70 px**, y los dos rótulos laterales son **botones (respaldo tap)**. **Valida
  al soltar, sin ¡VERIFICAR!**: la carta sale volando **siempre hacia el lado correcto**,
  con pastilla `Va en: …` si se falló. Reparto **3+2 o 2+3**, nunca 5 del mismo lado.
  Bancos `J13_DIV_PRO` (14 ideas que valoran) y `J13_DIV_CON` (8 que atacan, textuales de
  los distractores del cuaderno). ⭐ +1 por carta.
- **R2 `T3R2Memoria` — VOLTEAR** (patrón 10, variante memoria). 8 cartas en 4×2, **10
  intentos**. Dos tableros que alternan: `lugar` (cultura ↔ país) y `signif` (cultura ↔ lo
  que representa). Al agotar los intentos **se destapa todo** y las parejas no resueltas se
  marcan con **color + forma** (`J13_DIV_PARCOL`) — ⚠ el primer intento ponía "era pareja"
  en las 8 cartas y **no dejaba ver cuál iba con cuál**; verde y rojo quedan fuera de esa
  paleta porque significan acertó/falló en todo el juego. ⭐ +1 por pareja.
- **R3 `T3R3Lluvia` — ATRAPAR** (patrón 13). 10 palabras por 3 carriles (aparecen cada
  1450 ms, caen en 3400 ms): **6 que la diversidad aporta + 4 que no**. Tocar una mala
  marca ✗ pero **no resta**; dejarla caer es lo correcto. Al final, cartel con **las buenas
  que se escaparon**. Bancos `J13_DIV_APORTA` (13) y `J13_DIV_NOAPORTA` (6). ⭐ +1 por
  palabra buena.

**⭐ del Tema 3:** 5 + 4 + 6 = **máximo 15**. Las tres rondas van **`verify:false`** (se
autovalidan): la columna derecha solo muestra REINICIAR y SALIR.

⚠ **Por qué la R2 es una memoria y no el "Pasaporte cultural"** que llegó a aprobarse:
el Tema 2 estrenó **unir con líneas** en su R3 mientras se diseñaba este tema, y la autora
puso como condición dura que **ningún verbo se repita entre temas**. Antes de tocar este
tema, revisar qué verbos están tomados en los otros dos.

⚠ **Imágenes:** las cartas de la R2 aceptan `img` (ruta en `assets/`) y **hoy corren con
emoji** (☯️ Taegeukgi · 🎨 Holi · 💍 Padaung · 🎭 Pimampiro). Al llegar las ilustraciones
de la autora solo se rellena ese campo. **No se reproducen las fotos del libro ni se
generan caras de personas reales** (`memory/personas-reales-sin-generar-caras.md`): van
elementos culturales, no retratos. El pueblo **Padaung** es el caso delicado — el libro lo
describe por el largo del cuello de las mujeres; se usa la formulación del libro, sin
adjetivos añadidos.

## Contrato del shell

- `app.jsx` (shell, NO tocar): enruta `home → character → game → results`.
- `screens.jsx`: `HomeScreen` (3 botones desde **`LEVELS_CFG`**, grid `1fr 1fr 1fr` gap 10,
  gradientes **por posición**), `CharacterScreen` (preselecciona **Domi**), contador de
  visitas, `CosmosBg`. `choose()` fija `currentCategory` / `currentCatLabel` desde el tema.
- `game-screens.jsx`: expone `GameScreen`/`ResultsScreen` en `window`. `markFirstAttempt()`
  en la 1ª respuesta; `incrementGamesCompleted()` al terminar.

## Contador de visitas

`counter.php` idéntico a los demás; cae a `localStorage` sin PHP. `visits.txt`
gitignoreado — borrarlo antes de subir a producción.

## QA

```bash
node juegos/_PLANTILLA/.planning/format-lint.js juego-13   # 19/19 OK
node juegos/_PLANTILLA/.planning/qa-visual.js  juego-13    # 6 viewports, sin overflow (colchón 55px)
```
**Tema 1 verificado (2026-08-06):** partida perfecta 3/3 · 10 ⭐ · 100 %; partida fallada con
el revelado correcto en las 3 rondas; 0 repeticiones consecutivas en 6 recargas (R1/R2/R3).

**Tema 2 verificado (2026-08-06)** — ⚠ `qa-visual.js` **solo recorre el tema por defecto**
(el 1), así que el 2 se probó con un e2e propio que lo selecciona en el Home:
- Partida perfecta: **3/3 rondas · 9 ⭐ · 100 %**, dots de Ronda = 3, 0 errores de consola.
- Fallo deliberado en R1: 3 ✓ verdes (las correctas) + 1 ✗ roja (la elegida) — se ven las
  dos; ⭐ no baja. R2: se revela el desarrollo `((46 − 40) / 40) × 100 = 15 %` y "Tu
  respuesta: 22 %". R3: 3 líneas rojas + los 3 "va con …" + 3 ✗.
- **Rama del decrecimiento** forzada sembrando la clave FIFO: ejercicio 60 → 54, tecla −,
  visor "−10" y acierto. (Sin forzarla, el azar podía no sacar nunca un negativo.)
- Anti-repetición: 6 recargas → 0 repes y 6 combinaciones distintas en R1/R2; **8 recargas
  en R3 → 0 repes consecutivas y los 7 tableros vistos**.
- Sin overflow del lienzo en ninguna de las 3 rondas.

> ⚠ **Dos trampas del e2e de la R3** (no son bugs del juego, pero cuestan una hora):
> 1. Los dos toques (izquierda → derecha) deben ir en **ticks distintos**; en el mismo tick
>    React aún no aplicó la selección y el segundo toque se ignora.
> 2. Para fallar hay que usar una **rotación cíclica** de destinos: si dos tarjetas apuntan
>    al mismo, la segunda le roba el enlace a la primera y la ronda queda incompleta.
> En la R1 pasa algo parecido: **hay que clicar dentro de su fila**, porque dos filas
> pueden ofrecer el mismo texto de opción.

> ⚠ **Bug ya cazado en el respaldo tap de R1** (no repetirlo al tocar `R1Aduana`): las
> fichas ya colocadas son botones dentro del cajón y **se comían el toque**, así que un
> cajón que ya tenía una ficha dejaba de aceptar más en modo tap. `onUp` lo resuelve: si
> hay OTRA ficha seleccionada, tocar una ficha ya colocada equivale a **tocar su cajón**.
