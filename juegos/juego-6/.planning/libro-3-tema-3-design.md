# Design-doc — juego-6 · LIBRO 3 · TEMA 3 · "Viajando por mi país"

> Cuarto juego real del hub. Reemplaza el placeholder de `currentCategory === "l3-t3"`.
> Audiencia **7 años** (confirmado por la autora). Contenido **textual del libro**
> (páginas del tema "Viajando por mi país con mi familia": las 4 regiones naturales).
> Decisión de la autora: **3 rondas encadenadas, cada una con una mecánica DISTINTA**,
> y que **NO se parezca al Tema 2**.

## Por qué no se pisa con el Tema 2

| | Tema 2 "Identidad territorial" | **Tema 3 "Viajando por mi país"** |
|---|---|---|
| R1 | tocar 1 de 4 botones (región) | **voltear** cartas (memoria) |
| R2 | arrastrar para **ordenar** en columna | **girar** ruleta + arrastrar a la **maleta** |
| R3 | **tocar varias** en rejilla | **arrastrar los puntos cardinales** al mapa |
| Sub-tema | regiones · organización del Estado · provincias | ciudades · ríos · nevados · fauna de cada región |
| Azar | no | **sí** (posición de las cartas + la ruleta) |

Los verbos **voltear** y **girar** son nuevos en juego-6; el arrastre de R3 es a un
**mapa** (colocar), no la columna ordenada del Tema 2.

## Rondas

| Ronda | Mecánica | Interacción | Validación |
|-------|----------|-------------|------------|
| **R1** | Memoria del viaje | 👆 **voltear** 2 cartas de 8 (4 parejas) | automática al voltear |
| **R2** | La ruleta del viaje | 🎡 **girar** + ✋ **arrastrar a la maleta** | **¡VERIFICAR!** |
| **R3** | Los límites del Ecuador | ✋ **arrastrar** (o tocar) N·S·E·O al mapa | **¡VERIFICAR!** |

Orquesta `ViajeGame` (chrome compartido + `onSolve` por ronda; avance automático;
reporte). `GameScreen` despacha `l3-t3 → ViajeGame`.

## R1 — "Memoria del viaje" (`R1Memoria`)

Tablero de **8 cartas (4 parejas)**, calcado del patrón de `juego-1` (`buildDeck`,
`flipped`/`matched`, lock, 480 ms al emparejar / 980 ms al fallar). Cada pareja es
**un lugar/elemento ↔ su región**:

```
              Encuentra las 4 parejas: cada lugar con su región.
   (Sisa)   ┌────────┐┌────────┐┌────────┐┌────────┐
  ╭───────╮ │   ❓   ││   ❓   ││   🏔️   ││   ❓   │   ┌──────────┐
  │Voltea │ │        ││        ││Cotopaxi││        │   │ REINICIAR│
  │dos    │ └────────┘└────────┘└────────┘└────────┘   ├──────────┤
  │cartas │ ┌────────┐┌────────┐┌────────┐┌────────┐   │  SALIR   │
  │y busca│ │   ❓   ││ [foto] ││   ❓   ││   ❓   │   └──────────┘
  │la     │ │        ││ Sierra ││        ││        │
  │pareja.│ └────────┘└────────┘└────────┘└────────┘
  ╰───────╯
```

- **Carta de lugar:** emoji + nombre (🏔️ Cotopaxi, 🐢 Tortuga gigante, 🏙️ Guayaquil…).
- **Carta de región:** el color del libro (🟡 Costa · 🟤 Sierra · 🟢 Amazonía · 🔵 Insular)
  + nombre; **al emparejar muestra la FOTO real de la región** (`region-<slug>.jpeg`,
  ya en `assets/`, respaldo al emoji) → recompensa visual, igual que el álbum del Tema 1.
- Una pareja por región → las 4 cartas de región son distintas (sin ambigüedad).
- **⭐ +1 por pareja** (calcado de `juego-1`: en un memory la unidad de progreso es la
  pareja). El log aporta **4 filas** al reporte.
- Anti-repetición: `L3T3_R1_KEY` — el ítem sorteado de cada región no repite al recargar.

## R2 — "La ruleta del viaje" (`R2Ruleta`)

```
                  ¿Qué encontramos en la Sierra?
   (Sisa)      ╭───────────╮        ╭────────╮
  ╭───────╮   ╱  🟡  │  🟤  ╲      │   🧳   │      ┌──────────┐
  │Gira y │  │ ──────┼────── │     │ maleta │      │¡VERIFICAR!│
  │arrastra│  ╲  🟢  │  🔵  ╱      ╰────────╯      ├──────────┤
  │a la   │    ╰──────▼─────╯                      │ REINICIAR│
  │maleta.│      [ GIRAR ]                         │  SALIR   │
  ╰───────╯                                        └──────────┘
       ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
       │🏔️ Coto-│ │🐢 Tortu│ │🏙️ Quito│ │🌊 Río  │
       │  paxi  │ │ga gigan│ │        │ │ Guayas │
       └────────┘ └────────┘ └────────┘ └────────┘
```

- Ruleta SVG de **4 sectores** con los colores del libro; `[ GIRAR ]` la anima (~1.6 s,
  `cubic-bezier` desacelerando) y se para en la región sorteada (anti-repetición
  `L3T3_R2_KEY`). Hasta que no gire, las tarjetas están apagadas.
- Aparecen **4 tarjetas: 2 de esa región + 2 distractoras** (de otras regiones).
  El niño **arrastra a la maleta 🧳** las que sí son. Puede sacarlas (tocar la tarjeta
  dentro de la maleta la devuelve).
- **¡VERIFICAR!** en la columna de acciones (como el Tema 2). Al fallar, se marcan las
  correctas en verde ✓ y las mal metidas en rojo ✗ **~1.8 s** antes del "¡UPS!".
- ⭐ +1 si las 2 correctas están dentro y ninguna distractora.

## R3 — "Los límites del Ecuador" (`R3Mapa`)

**Cambio pedido por la autora a mitad de la construcción:** la R3 era "Arma la postal"
(completar el nombre con sílabas) y la reemplazó por el **mapa con los puntos cardinales**.
La postal queda en el historial de git.

```
              ¿Dónde queda cada punto cardinal?
                        COLOMBIA
                      ┌──────────┐
   (Sisa)             │    ?     │        ┌──────────┐
  ╭────────╮          └──────────┘        │¡VERIFICAR!│
  │Arrastra│  OC. PACÍFICO ┌────┐ PERÚ    ├──────────┤
  │cada    │  ┌────────┐   │mapa│ ┌──────┐│ REINICIAR│
  │punto a │  │   ?    │   │ EC │ │  ?   ││  SALIR   │
  │su lugar│  └────────┘   └────┘ └──────┘└──────────┘
  ╰────────╯          ┌──────────┐
                      │    ?     │
                      └──────────┘
                         PERÚ
          [ OESTE ] [ SUR ] [ NORTE ] [ ESTE ]
```

Del **"Aplico" del libro** ("Ubica los límites de tu país: Al Norte / Al Sur / Al Este /
Al Oeste"). Alrededor del mapa se ven los **vecinos** como contexto (Colombia · Perú ·
océano Pacífico) y el niño coloca los **4 puntos cardinales**.

- ⚠ **Por qué se colocan los CARDINALES y no los límites:** Perú es límite **al Sur y al
  Este** → habría dos fichas "Perú" idénticas y la ronda sería ambigua. Al revés, cada
  ficha (NORTE·SUR·ESTE·OESTE) es única y se aprenden las dos cosas a la vez.
- **Arrastrar o tocar:** se puede arrastrar la ficha al recuadro, o **tocarla y luego tocar
  el recuadro** (a los 7 años el arrastre falla). Tocar un recuadro lleno devuelve la ficha.
- **¡VERIFICAR!** en la columna de acciones. Al fallar: ✓ verde donde acertó, ✗ rojo donde
  no, y debajo la etiqueta dorada **"VA · NORTE"** revelando cuál iba (dorado, no verde).
- **Mapa:** `assets/mapa-ecuador.<jpg|png|jpeg|webp>` (lo genera la autora). Mientras no
  exista, cae a una **placa "ECUADOR"** y la ronda funciona igual.
- **Sin banco:** el contenido es fijo (el Ecuador tiene unos límites). La variación entre
  partidas viene de **barajar el orden de las fichas** — no hay anti-repetición aquí.

## Bancos (TODO textual del libro — no inventar)

`L3T3_LUGARES` (lugar → región), usado por R1 y R2:

- **🟡 Costa:** Guayaquil · Manta · Machala · Salinas · Esmeraldas · Babahoyo · Santo
  Domingo · Río Guayas · Río Esmeraldas · Río Jubones · Banano · Arroz · Manglares ·
  Delfines · Ballenas · Gaviotas
- **🟤 Sierra:** Quito · Cuenca · Ambato · Riobamba · Ibarra · Loja · Cotopaxi ·
  Chimborazo · Cayambe · Cóndor andino · Páramo
- **🟢 Amazonía:** Puyo · Nueva Loja · El Coca · Jaguar · Selva virgen
- **🔵 Insular:** Galápagos · Tortuga gigante · Pingüino · Lobos marinos · Iguana ·
  Volcanes activos · Arena negra

`L3T3_CARDINALES` (R3, del "Aplico" del libro): Norte → **Colombia** · Sur → **Perú** ·
Este → **Perú** · Oeste → **océano Pacífico**.

### Sin imágenes (así se entrega)

La autora decidió **no generar imágenes**: el tema se juega con nombre + emoji. Como los
emojis genéricos (🏙️ ciudades · 🌊 ríos · 🏔️ nevados · 🏖️) los comparten varios ítems y no
distinguían nada (Quito y Riobamba idénticos), `l3t3Generico` los **oculta** y agranda el
**nombre**. Se conserva el emoji único (🐆 🐢 🦅 🍌 🐋 🌳 🐧 🦭 🌾 🌿 🐬 🌫️) y el de las 4
regiones. En R3 el mapa se sustituye por una **placa con la bandera + "ECUADOR"**.

### Fotos (todas opcionales — hoy NO existen; si llegan, ganan sobre el emoji)

- **Regiones — PROPIAS de este tema:** `t3-region-<costa|sierra|amazonia|insular>.jpg`
  (**cuadradas 1:1**). ⚠ **No reusar las `region-<slug>` del Tema 2** (decisión de la autora).
- **Mapa de R3:** `mapa-ecuador.<ext>` — **sin rosa de los vientos ni letras N/S/E/O**, o
  regalaría la respuesta. Respaldo: placa con la bandera + "ECUADOR".
- **Lugares** (`lugar-<slug>.jpg`, las genera la autora; formato **cuadrado 1:1**, sin
  texto ni rostros): Costa `guayaquil · rio-guayas · banano · delfines` · Sierra
  `chimborazo · cotopaxi · quito · condor` · Amazonía `puyo · nueva-loja · jaguar · selva`
  · Insular `galapagos · tortuga · pinguino · lobos`.
- **Mapa** (R3): `mapa-ecuador.<ext>` — respaldo: placa "ECUADOR".

## Reglas EDINUN respetadas

- **Enunciado = QUÉ · Bocadillo = CÓMO** (bocadillo fijo por ronda, cortado con `<br />`).
- Fallar **no resta** ⭐ (solo no suma). Al fallar se **revela lo correcto** dejando ver
  lo que eligió el niño.
- Avance entre rondas **automático**. Único botón primario: **¡VERIFICAR!** (R2, R3);
  R1 se valida sola al voltear.
- Salir/Reiniciar con **modal**. `markFirstAttempt()` en la 1ª acción;
  `incrementGamesCompleted()` al terminar.
- **Sin contadores ni rótulos inventados**: HUD estándar (logo 64 · ⏱ · ⭐) + bloque
  **Ronda** con **3 dots 11×11** en `top: 20`.
- ⭐ del tema: **4 (R1) + 1 (R2) + 1 (R3) = 6 máx.** Reporte de **6 filas**.

## Layout / estándar

Personaje izq (`left: 8, bottom: 78`, char 186) · acciones der (`right: 18, width: 150`;
variante B con ¡VERIFICAR! en R2/R3) · mecánica centrada en **x = 450** con colchón
**≥ 30 px** hasta la columna de acciones. Label del tema en `screens.jsx`:
"Tema 3" → **"Viajando por mi país"**.

## Riesgos

- **Tablero de R1 vs. columna de acciones:** en `juego-1` el tablero llegaba a x≈730 y
  hubo que achicar la carta. Aquí son 8 cartas (4×2) → medir con `qa-visual.js`.
- **Ruleta:** que la animación no deje al niño esperando; ~1.6 s y bloquear GIRAR mientras gira.
- **R3 sin variación:** los límites del Ecuador son fijos → dos partidas seguidas piden lo
  mismo (solo cambia el orden de las fichas). Es contenido, no un descuido.
- **Mapa generado:** si la silueta del Ecuador sale mal, es un error de contenido en
  material escolar → revisar la imagen antes de darla por buena.
