# Design-doc — juego-13 "Un mundo por descubrir"

> **Índice.** §1-§8 = **Tema 1** "Los continentes". El **Tema 2** ("Las Américas y su
> geografía") va al final, en §9. El **Tema 3** sigue sin material.

# Tema 1 — "Los continentes: África, Asia, Europa y Oceanía"

> Planificación inicial aprobada por la autora en el chat (bocetos ASCII ronda por
> ronda, 2026-08-06). Este doc es el contrato de `game-screens.jsx`.

## 1. Tema

**Tema 5 del libro: "Los continentes: África, Asia, Europa y Oceanía".** Geografía
física y humana de los 4 continentes: límites, relieve, hidrografía, clima y los
**indicadores de calidad de vida** (esperanza de vida, mortalidad infantil, IDH,
ingreso per cápita) con el cuadro de **datos continentales comparados**.

- **Edad objetivo: 12 años.** Registro visual poco infantil, lectura de datos,
  mecánicas con dificultad real.
- **`charId`: `domi`** — por el ciclo del elenco (`memory/orden-personajes.md`:
  Domi → Yaku → Sisa → Andi por ordinal del slug; 13 mod 4 = 1).
- Título del juego: **"Un mundo por descubrir"** (definido por la autora el 2026-08-06;
  antes el provisional "Explorando el mundo").

### Criterio de datos (acordado con la autora)

El libro **se contradice** en 3 cifras. Manda siempre el cuadro **"Datos
continentales comparados" (pp. 77-78)**, que es coherente consigo mismo:

| Dato | Ficha del continente | **Se usa** (cuadro comparado) |
|---|---|---|
| Superficie de África | 10 530 751 km² (repite la de Europa) | **30 330 000 km²** |
| Población de Asia | 1 300 millones (repite la de África) | **4 600 000 000** |
| Río más largo de África | Nilo 6 671 km | **Nilo 6 843 km** |

**No se inventa ningún dato**: todo sale textual del tema o de sus actividades.

## 2. Niveles

Juego **multi-tema**: 3 botones en el Home (`LEVELS_CFG` en `screens.jsx`), grid
`1fr 1fr 1fr` gap 10, gradientes **por posición** (1º naranja · 2º amarillo · 3º azul).

| id | label | catLabel | estado |
|---|---|---|---|
| `continentes` | Los continentes | Los continentes | ✅ 3 rondas (§1-§8) |
| `americas` | Las Américas y su geografía | Las Américas y su geografía | ✅ 3 rondas (§9) |
| `tema3` | Tema 3 | Tema 3 | ⏳ `enabled:false` — **temporal**, a la espera de material |

Home → `app.level` → CharacterScreen → `currentCategory` / `currentCatLabel` →
`GameScreen` despacha por `app.currentCategory`.

> ⚠️ El "Próximamente" del tema 3 es **estado temporal de construcción**, no de
> publicación (`estandar-visual.md` §8): el juego se entrega con las 3 mecánicas
> cuando llegue su material.

## 3. Mecánica — 3 rondas, 3 verbos distintos

`J13_ROUNDS` (`TOTAL = 3`), orquestadas por `GameScreen` con el chrome EDINUN
compartido (patrón de juego-8).

### R1 · "Control de aduana" — patrón 8 (clasificar en cajones) · verbo: **arrastrar**
- 4 fichas (accidente geográfico: emoji de tipo + nombre) en **rejilla 2×2** (fichas de
  140 px: los nombres largos se leen sin apretar) → 4 cajones
  **ÁFRICA / ASIA / EUROPA / OCEANÍA** en fila, con los **colores del libro**
  (actividad 6: naranja · morado · azul · verde).
- Arrastrar con pointer events; **respaldo tap** (tocar ficha → tocar cajón).
- **¡VERIFICAR!** una sola vez → una ronda = una jugada.
- **Reparto variable** (nunca 1 por continente): se exige ≥2 continentes distintos
  entre las 4 fichas para que no se resuelva por descarte.
- Al verificar: ✓ verde / ✗ rojo sobre la ficha **donde la puso el niño**, y
  pastilla con el **continente correcto** debajo.
- Banco `J13_LUGARES`: **48 ítems** textuales (África 11 · Asia 13 · Europa 16 ·
  Oceanía 8). **Excluidos por ambigüedad:** montes Urales y mar Caspio (el libro
  los da como límite Europa/Asia → dos respuestas correctas). El **río Ural** sí
  entra: la actividad 6 lo resuelve en Europa. También fuera el río "Dniepper"
  (errata del libro).

### R2 · "Podio mundial" — patrón 9 (ordenar) · verbo: **intercambiar (tap-swap)**
- 4 fichas sobre pedestales de altura decreciente (1º…4º), con el bloque **centrado
  verticalmente** en la zona de juego (pegado abajo dejaba medio lienzo vacío; el
  escalonado se conserva alineando las columnas por su base). **Tocar ficha A → tocar
  ficha B = intercambian de puesto.** No se arrastra (R1 ya arrastra).
- **¡VERIFICAR!** revela **las cifras reales** dentro de cada pedestal —en placa oscura
  con borde dorado y cuerpo grande (13-20 px según el largo del dato y el puesto), porque
  a 10 px sobre fondo claro no se leían— + ✓/✗, y cada
  ficha mal colocada muestra una pastilla **"va Nº"** con su puesto correcto (patrón
  "este sí va" del repo; se descartó animar el salto por no aportar información).
- Banco `J13_PODIOS`: **7 rankings** del cuadro comparado — superficie · población ·
  PIB · **PIB per cápita** (rompe el patrón: Europa · Oceanía · Asia · África) ·
  elevaciones (actividad 7) · ríos · lagos. En 4 de ellos las fichas **no son
  continentes** sino montañas / ríos / lagos, para que no se memorice un orden único.

### R3 · "Cazador de errores" — patrón 7 (marcar varios) · verbo: **cazar el intruso**
- Ficha de un continente con **5 filas**: 3 datos suyos + **2 infiltrados** de otro.
- El niño **toca las filas sospechosas** + **¡VERIFICAR!**.
- Al verificar: intruso cazado → ✗ rojo **con su continente verdadero** al lado
  ("Montañas Atlas → África"); intruso no cazado → pastilla ámbar "era intruso";
  fila legítima marcada por error → ✓ verde de "esta sí era del continente".
- Reusa `J13_LUGARES` (mismo banco que R1) → cientos de fichas distintas.

### Estrellas (modelo del juego)
**+1 ⭐ por elemento resuelto bien**, no por ronda: R1 hasta 4 (fichas), R2 hasta 4
(puestos), R3 hasta 2 (intrusos) → **máximo 10 ⭐**. `isCorrect` de la ronda (dot del
HUD y reporte) = ronda perfecta. **Fallar nunca resta** lo ya ganado.

### Anti-repetición
FIFO en `localStorage`, una clave por ronda:
`edinun_j13_r1_v1` (4 de 48, cap 12) · `edinun_j13_r2_v1` (1 de 7, cap 6) ·
`edinun_j13_r3_v1` (1 de 4 continentes, cap 3 + ítems desde el pool de R1).

## 4. Layout (lienzo 900×540)

Zona central `top:60 bottom:18 left:215 right:215` (ancho útil 470). Valores fijos
del HUD, personaje/bocadillo, acciones y ResultsScreen: `estandar-visual.md` §1-§5
(acciones variante **B**: `right:18, width:150` + ¡VERIFICAR!).

```
┌─ 900 × 540 ──────────────────────────────────────────────────────────────┐
│ [logo 64]              Ronda ● ○ ○  (top 52)          ⏱ tiempo   ⭐ estrellas│
│                                                                           │
│   ┌────────────── ZONA CENTRAL (x 215..685, centrada en 450) ─────────┐  │
│   │  enunciado = QUÉ hacer                                            │  │
│   │  R1: bandeja 4 fichas  →  4 cajones de continente                 │  │
│   │  R2: 4 pedestales 1º-4º (alturas decrecientes)                    │  │
│   │  R3: panel-ficha con 5 filas tocables                             │  │
│   └───────────────────────────────────────────────────────────────────┘  │
│  ╭─ bocadillo = CÓMO ─╮                                    ┌───────────┐ │
│  ╰────────╮╭──────────╯                                    │¡VERIFICAR!│ │
│      (Domi 186)                                            │ REINICIAR │ │
│       Domi                                                 │   SALIR   │ │
└────────────────────────────────────────────────────────────└───────────┘─┘
```

Colchón mecánica ↔ acciones: la zona central termina en x=685 y la columna de
acciones empieza en x=732 → **47 px** (≥30 exigido).

## 5. Log y reporte

`lastResult.log[i]` = `{ idx, emoji, a, userAnswer, correctAnswer, isCorrect }`.

| Ronda | `emoji` | `a` (enunciado del reporte) |
|---|---|---|
| R1 | 🧭 | ¿A qué continente pertenece cada lugar? |
| R2 | 🏆 | Podio: <criterio> |
| R3 | 🔍 | ¿Qué datos no son de <continente>? |

Subtítulo del reporte: **"Reporte académico · Estudios Sociales"** (fijo).

## 6. Glifos del fondo

`cosmic` (home/character/results, 15): 🌍 🌏 🌎 🗺️ 🧭 ⛰️ 🏔️ 🌊 💧 🏜️ ★ 📊
`chalkboard` (game, 10): 🌍 🗺️ 🧭 ⛰️ 🏔️ 🌊 💧 🏜️ ★ 📊

## 7. Copy

- Hero Home: `EDINUN · Explorando el mundo` + `¡Bienvenido/a, Estudiante!`
- Label chips: `Elige un tema para jugar` · descripción T1:
  `Explora África, Asia, Europa y Oceanía.`
- **Enunciado (QUÉ) / bocadillo (CÓMO)** por ronda:

| R | Enunciado | Bocadillo |
|---|---|---|
| 1 | ¿De qué continente es cada uno? Clasifica las 4 fichas. | Arrastra cada ficha / a su continente. |
| 2 | Arma el podio: `<criterio>`. | Toca dos fichas / para intercambiarlas. |
| 3 | La ficha de `<CONTINENTE>` tiene 2 errores. Márcalos. | Toca los datos / que no pertenecen. |

- Frase de cierre (ResultsScreen): `"<nombre>, acertaste N de 3."` — Domi.

## 8. Decisiones abiertas / riesgos

- **Nombres largos** ("Llanura de Siberia Occidental", "Gran cordillera divisoria")
  en fichas de ~108 px → `fontSize` 10 y hasta 3 líneas; verificar en qa-visual.
- **"Victoria" aparece dos veces** en el banco (lago Victoria = África · Gran
  desierto Victoria = Oceanía). Es del libro y funciona como distractor legítimo:
  el niño debe leer el tipo, no la palabra.
- **Sin imágenes**: emojis de tipo (🏞️ 💧 ⛰️ 🏔️ 🏜️ 🗺️) + nombre. Mapas del libro no
  se reproducen.
- Cifras formateadas con **espacio de millar**, como el libro (44 936 000).
- Temas 2 y 3: pendientes de material.

---

# 9. Tema 2 — "Las Américas y su geografía"

> Aprobado por la autora en el chat con **bocetos ASCII, una ronda a la vez** (2026-08-06).
> **Tema 4 del libro · 12 años · `charId: domi` · `id: americas`.**

## 9.1 Tema

Geografía física y humana del continente americano: sus **tres regiones** (América del
Norte · América Central y el Caribe · América del Sur) con límites, relieve, hidrografía,
clima y demografía, más los **instrumentos estadísticos** (tasa de crecimiento
poblacional, PIB, IDH).

### Criterio de datos — defectos del libro que quedan FUERA

| Dato | Problema | Decisión |
|---|---|---|
| Mortalidad infantil (Central y Sur) | El libro rotula "punto máximo/mínimo" al revés del sentido real (Cuba 4/1000 es la MÁS BAJA y figura como "máximo") | **No se usa** en ningún banco |
| IDH de América Central | El texto destaca Costa Rica (0,810); el cuadro y la actividad 4 dan Cuba (0,825) | Manda la **actividad 4: Cuba** |
| Ríos de América del Sur | La lista NO está ordenada por longitud (Orinoco 2140 antes que Madeira 3250) | Manda **la cifra**, nunca el orden |
| Límites de América del Norte | La actividad 1 dice "al Sur y al Oeste con el Océano Pacífico" | Manda el texto de *Construcción del aprendizaje* (N Ártico · E Atlántico · O Pacífico · S América Central) |

## 9.2 Mecánica — verbos NUEVOS, ninguno del Tema 1

El Tema 1 ya usa **arrastrar** (aduana), **intercambiar** (podio) y **cazar intrusos**.
El Tema 2 estrena **elegir en huecos** y **teclear**. Arreglo `J13_AM_ROUNDS`; el nº de
rondas sale de `ROUNDS.length` (orquestador compartido `J13Game`).

### R1 · "Pasaporte de la región" — patrón 6 (huecos en una lectura) · verbo: **elegir**

Ficha tipo pasaporte de **una** región con **3 huecos**; cada hueco muestra **las 2
opciones** y el niño toca la correcta. Una sola jugada por ronda. `¡VERIFICAR!` solo se
atiende con los 3 huecos contestados. Al fallar: la correcta en **verde con ✓** y la
elegida en **rojo con ✗** — se ven las dos (invariante EDINUN).

- Banco `J13_AM_REGIONES`: **3 regiones × 9-10 campos** textuales del libro (límites N/E/O/S,
  elevación principal, río más largo, lago más grande, extensión, población, cordillera,
  clima, Antillas Mayores/Menores).
- Cada distractor sale también del libro (otra región), nunca inventado.
- ⭐ **+1 por hueco correcto** (hasta 3).

```
┌─ 900 ─────────────────────────────────────────────────────────────────┐
│ EDINUN                     Ronda ● ○                     ⏱ 0:14  ⭐ 0 │
│              Completa el pasaporte de América del Norte.              │
│    ╭────────╮   ┌──────────────────────────────────┐   ┌──────────┐  │
│    │ Toca   │   │ 🛂  AMÉRICA DEL NORTE         🍁 │   │¡VERIFICAR!│  │
│    │ una    │   │ ──────────────────────────────── │   ├──────────┤  │
│    │ opción │   │ LIMITA AL NORTE CON              │   │ REINICIAR│  │
│    │ en cada│   │ [ el océano Ártico ][ el Antár…] │   ├──────────┤  │
│    │ línea. │   │ SU RÍO MÁS LARGO ES              │   │  SALIR   │  │
│    ╰───┬────╯   │ [ el Misisipi     ][ el Amazonas]│   └──────────┘  │
│      (Domi)     │ SU POBLACIÓN ES DE               │                 │
│                 │ [ 579 millones    ][ 50 millones]│                 │
│                 └──────────────────────────────────┘                 │
└───────────────────────────────────────────────────────────────────────┘
```

### R2 · "Calculadora demográfica" — patrón 3 (respuesta única en teclado) · verbo: **teclear**

Es la **actividad 5 del libro**: aplicar `((Pf − Pi) / Pi) × 100`. La ficha muestra los dos
censos y **la fórmula siempre visible** (el libro la da en su recuadro) → se ejercita
aplicarla, no memorizarla. Teclado 3×4 con **tecla −** (el libro enseña el decrecimiento:
Ecuador −1,2 % en 2021) y ⌫; visor de máximo 3 dígitos. Al verificar se revela **el
desarrollo con las cifras puestas** en verde y, si falló, "Tu respuesta: N %" en rojo.

- Banco `J13_AM_TASAS`: **8 ejercicios**, resultados 20 · 25 · 15 · 3 · 12 · −10 · 28 · −20 %.
- ⚠ Son **ejercicios de cálculo** con el molde del libro ("un país pasó de X a Y millones"),
  redondos y de resultado entero, **sin nombrar ningún país real**; el primero es el
  ejercicio 5 literal. **Decisión consultada y aprobada por la autora.** Para usar países
  reales haría falta material con pares población inicial/final, que el libro no trae.
- ⭐ **+3 al acertar**, para que pese lo mismo que los 3 huecos de R1.

```
┌─ 900 ─────────────────────────────────────────────────────────────────┐
│ EDINUN                     Ronda ● ●                     ⏱ 0:38  ⭐ 3 │
│            Calcula la tasa de crecimiento de este país.               │
│  ╭────────╮  ┌─────────────────────────┐  ┌───┬───┬───┐  ┌──────────┐│
│  │ Usa la │  │  👥  POBLACIÓN          │  │ 1 │ 2 │ 3 │  │¡VERIFICAR!││
│  │fórmula │  │  2010    100 millones   │  ├───┼───┼───┤  ├──────────┤│
│  │ de la  │  │  2020    120 millones   │  │ 4 │ 5 │ 6 │  │ REINICIAR││
│  │ ficha. │  │ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │  ├───┼───┼───┤  ├──────────┤│
│  ╰───┬────╯  │  ((Pf − Pi) / Pi) × 100 │  │ 7 │ 8 │ 9 │  │  SALIR   ││
│    (Domi)    │   Pf = final · Pi = ini │  ├───┼───┼───┤  └──────────┘│
│              │  ┌───────────────────┐  │  │ − │ 0 │ ⌫ │              │
│              │  │      20 %         │  │  └───┴───┴───┘              │
│              │  └───────────────────┘  │                             │
│              └─────────────────────────┘                             │
└───────────────────────────────────────────────────────────────────────┘
```

### R3 · "Sala de datos" — patrón 10 (conectar columnas) · verbo: **unir con líneas**

Elegida entre «Sala de datos», «El medidor» (deslizador) y «Escáner del Caribe» (deslizar
la carta a Antillas Mayores/Menores). Tocar una tarjeta de la izquierda y luego una de la
derecha las enlaza con una **curva de color** (anclas por `offsetLeft/offsetTop` + SVG,
calcado de `PR3Empareja` de juego-6). **Sin número de pareja**: la línea ya lo dice.

- Banco `J13_AM_TABLEROS`: **7 tableros** — los 3 instrumentos ↔ lo que miden (actividad 4)
  · mayor IDH por región (Canadá/Cuba/Chile) · región ↔ elevación · ↔ río · ↔ lago ·
  ↔ población · ↔ extensión. La derecha se baraja y **nunca sale ya resuelta**.
- ⭐ **+1 por pareja correcta** (hasta 3).
- **Revelado:** cada tarjeta de la DERECHA muestra al verificar **"va con `<concepto>`"**,
  junto a la línea del niño (verde o roja) → compara su respuesta con la correcta.
  ⚠ Se **descartó** dibujar la correcta como segunda línea punteada: con 3 pares fallados
  son **6 curvas en el mismo hueco** y queda ilegible. Y al crecer las tarjetas hay que
  **recalcular las anclas** (`useEffect` con `[verified]`) o las líneas quedan descolocadas.

```
┌─ 900 ─────────────────────────────────────────────────────────────────┐
│ EDINUN                     Ronda ● ● ●                   ⏱ 1:02  ⭐ 6 │
│              Une cada región con su lago más grande.                  │
│  ╭────────╮  ┌────────────────┐        ┌──────────────────┐ ┌────────┐│
│  │ Toca a │  │ América del    │──╮  ╭──│ Lago Maracaibo   │ │¡VERIFI-││
│  │ un lado│  │ Norte          │  ╰──╫──│ (13 210 km²)     │ │ CAR!   ││
│  │ y luego│  ├────────────────┤     ╰──┼──────────────────┤ ├────────┤│
│  │ al otro│  │ América Central│────────│ Lago Superior    │ │REINICIA││
│  ╰───┬────╯  │ y el Caribe    │        │ (82 103 km²)     │ ├────────┤│
│    (Domi)    ├────────────────┤        ├──────────────────┤ │ SALIR  ││
│              │ América del Sur│────────│ Lago de Nicaragua│ └────────┘│
│              └────────────────┘        └──────────────────┘           │
└───────────────────────────────────────────────────────────────────────┘
```

## 9.3 Log y reporte

| Ronda | `emoji` | `a` | `userAnswer` / `correctAnswer` |
|---|---|---|---|
| R1 | el de la región (🍁 🌴 🏔️) | `Pasaporte de <región>` | los 3 campos con su valor, separados por ` · ` |
| R2 | 📊 | `Tasa de crecimiento (de X a Y millones)` | `N %` |
| R3 | el del tablero (📈 🏅 🏔️ 🏞️ 💧 👥 🗺️) | el enunciado del tablero | los 3 enlaces `concepto → dato` |

`category` = "Las Américas y su geografía" (viene de `currentCatLabel`). Reporte de 3 filas.

## 9.4 Copy

| Elemento | Texto |
|---|---|
| Botón del Home (2º, gradiente amarillo) | Las Américas y su geografía |
| Pill de descripción | Recorre América del Norte, Central y del Sur. |
| Enunciado R1 (QUÉ) | Completa el pasaporte de `<región>`. |
| Bocadillo R1 (CÓMO) | Toca una opción / en cada línea. |
| Enunciado R2 (QUÉ) | Calcula la tasa de crecimiento de este país. |
| Enunciado R3 (QUÉ) | Une cada región con su `<dato>`. · Une cada instrumento con lo que mide. |
| Bocadillo R3 (CÓMO) | Toca una tarjeta / y luego su pareja. |
| Bocadillo R2 (CÓMO) | Usa la fórmula / de la ficha. |

## 9.5 Anti-repetición

Claves propias, FIFO en `localStorage`:

| Clave | Elige | Cap | Nota |
|---|---|:--:|---|
| `edinun_j13_t2r1reg_v1` | región (1 de 3) | 2 | 1 ítem → cap = banco−1 |
| `edinun_j13_t2r1_<región>_v1` | campos (3 de 9-10) | 5 | subconjunto → **nunca cap = 3** |
| `edinun_j13_t2r2_v1` | ejercicio (1 de 8) | 7 | 1 ítem → cap = banco−1 |
| `edinun_j13_t2r3_v1` | tablero (1 de 7) | 6 | 1 ítem → cap = banco−1 |

Verificado: 6 recargas → 0 repeticiones consecutivas y 6 combinaciones distintas en R1/R2;
**8 recargas en R3 → 0 repes consecutivas y los 7 tableros vistos**.

## 9.6 Riesgos / pendientes

- El tema ya tiene sus **3 rondas**. Lo que sigue bloqueando la publicación es el **Tema 3**
  (sin material, botón en "Próximamente").
- `qa-visual.js` **solo recorre el tema por defecto** (el Tema 1). El Tema 2 se verifica
  con un e2e propio que lo selecciona en el Home; si se añade una ronda, repetirlo.
- La rama de **decrecimiento** (resultado negativo) hay que forzarla sembrando la clave
  FIFO: por azar puede no salir nunca en una tanda de pruebas.
- El enunciado de R1 con "América Central y el Caribe" ocupa **2 líneas**; verificado que
  no desborda ni empuja la ficha fuera del lienzo.
