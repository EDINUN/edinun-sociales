# Libro 6 · Tema 1 — "La Amazonía, nido de vida silvestre" (`SilvestreGame`)

## 1. Tema

Del **TEMA 2 del Libro 6**, *"La Amazonía, nido de vida silvestre"* (la numeración del
libro ≠ la del hub: en el hub es el único tema del Libro 6). Enseña la Amazonía
ecuatoriana **por dentro**: la cuenca del Amazonas y los países que baña, el relieve que
desciende de los Andes al Este en tres zonas, los ríos, el clima, los cultivos y las
**nacionalidades indígenas** que la habitan.

- **Edad: 10 años** (confirmada por la autora). `charId:` **domi** (por defecto del
  Libro 6 en `LIBRO_CHAR`).
- **⚠ Qué NO puede repetir.** El hub ya tiene dos temas de Amazonía/regiones:
  - *Libro 5 · Tema 2* (9 años) usa **provincia↔capital**, **buscar fauna con lupa** y
    **armar la palabra de la capital**.
  - *Libro 3 · Tema 3* (7 años) usa **los límites del Ecuador** (justo el ejercicio
    "Delimita y pinta" de este cuaderno) y **lugares↔región**.

  Por eso este tema se construye sobre lo que es **suyo**: cuenca · relieve ·
  nacionalidades.

## 2. Niveles

Ninguno propio: es un **tema del hub juego-6** (`currentCategory = "l6-t1"`). El Libro 6
tiene **1 solo tema**, así que su pantalla no lleva botones (nombre + ENTRAR) y el
`GameScreen` **no muestra `TemaPills`** (solo salen con 2+ temas).

`currentCatLabel` = `"Libro 6 · La Amazonía, nido de vida silvestre"`.

## 3. Mecánica — 3 rondas, 3 interacciones distintas

Orquestadas por `SilvestreGame` (mismo chrome que `AmazoniaGame`: arreglo `L6T1_ROUNDS`
de `{C, verify, bubble}`, `onSolve` por ronda, ¡VERIFICAR! en la columna de acciones vía
`verifyRef`+`busy`, overlay `+1 ⭐`, reporte de 3 filas). **⭐ máximo: 3** (+1 por ronda
acertada, modelo simple).

| Ronda | Patrón | Verbo | Validación |
|---|---|---|---|
| **R1 `SR1Descenso`** | 9 (ordenar secuencia) | **ARRASTRAR** en vertical | ¡VERIFICAR! |
| **R2 `SR2Cuenca`** | 7 (marcar varios) | **TOCAR VARIOS** | ¡VERIFICAR! |
| **R3 `SR3Nacionalidad`** | 5 (tocar la correcta) | **TOCAR 1 de 4** | al tocar |

> Los tres verbos son distintos a propósito: la autora ya señaló en el Libro 3 que dos
> rondas seguidas de arrastrar se sienten iguales. Es la misma repartición aprobada en
> el Libro 3 · Tema 2 (tocar 1 · arrastrar · tocar varias).

### R1 — "El descenso" (arrastrar de arriba abajo)

Columna de 3 tarjetas sobre un **perfil del terreno en SVG** (de los Andes, arriba a la
izquierda, hacia la llanura del Este). El niño arrastra para ordenar; **la tarjeta solo
muestra el NOMBRE**, y el dato (altura / temperatura) **se revela al verificar** — así la
ronda enseña en vez de regalar la respuesta con el número a la vista.

Rota entre **3 escaleras** (`L6T1_ESCALERAS`), todas del libro y todas con el mismo
sentido "arriba = más alto / más frío":

| id | Enunciado | Orden correcto (arriba → abajo) |
|---|---|---|
| `relieve` | Ordena las zonas de la más alta a la más baja. | La subandina (2 500–500 m) › El piedemonte (1 500–300 m) › Llanuras aluviales (250–300 m) |
| `volcanes` | Ordena los volcanes del más alto al más bajo. | Zumaco (3 990 m) › Reventador (3 562 m) › Pan de Azúcar (3 482 m) |
| `clima` | Ordena los lugares del más frío al más caliente. | Papallacta (9 °C) › Putumayo (25 °C) › Llanura amazónica (40 °C) |

Al fallar: ✓/✗ por tarjeta y, 1 s después, la pastilla dorada **"AQUÍ VA · {correcta}"**
al lado de cada una mal ubicada (mismo revelado que `R2Orden`/`PR2OrdenNS`).
Anti-repetición `L6T1_R1_KEY` (cap 2 sobre 3 → rotación estricta).

### R2 — "El río grande" (marcar varios)

Rejilla de **8 tarjetas**: 4 países de la cuenca + 4 intrusos. El niño toca los que sí
(marca ○ → ●) y verifica.

- **Correctos (8, textuales):** Ecuador · Colombia · Perú · Bolivia · Brasil ·
  Guyana Francesa · Surinam · Venezuela.
- **Intrusos (8, contrastes obvios, NO del libro):** Chile · Argentina · Uruguay ·
  Paraguay · México · Panamá · Costa Rica · Cuba.
- Combinaciones teóricas: C(8,4) × C(8,4) = **4 900**. Lo que manda es el **cap** del FIFO:
  con cap 4 los "frescos" eran exactamente los 4 que faltaban, así que la ronda alternaba
  entre **2 tableros** (medido: 2 grupos distintos en 30 partidas). Con **cap 2** quedan 6
  frescos → C(6,4)=15 por partida → **26 grupos distintos en 30 partidas**.
  Regla: `cap < banco − elegidos`.
- Al verificar: **✓** verde en los bien marcados · **✗** rojo en los intrusos marcados ·
  **"faltó"** ámbar en los correctos que dejó sin marcar (mismo lenguaje que el Libro 3).

**Sin banderas emoji**: en Windows se ven como dos letras ("EC", "CO") en vez de bandera.
Tarjeta con el **nombre en grande**, que además es lo que se está evaluando.

### R3 — "¿Quiénes viven aquí?" (tocar 1 de 4)

Cartel con una **pista textual del libro** y 4 nacionalidades para tocar (la correcta +
3 de las otras 5). Banco `L6T1_PISTAS` = **9 pistas** de la tabla "Nacionalidades
indígenas en la Amazonía" y de la actividad 2 del cuaderno (que trae la clave del propio
libro). Anti-repetición `L6T1_R3_KEY` (cap 4 sobre 9 → 4-5 partidas limpias).

Al fallar: la correcta se marca en verde ✓ dejando ver la tocada en rojo, sin restar.

## 4. Layout (lienzo 900×540)

Chrome fijo del estándar: HUD (§1), personaje+bocadillo `left:8 bottom:78` (§2), acciones
`right:18 width:150` (§3B), zona central `top:60 bottom:18 left:215 right:215` (§4) →
**centro x=450**, ancho útil 470.

```
R1 — El descenso                              R2 — El río grande
┌──────────────────────────────┐              ┌──────────────────────────────┐
│  Ordena las zonas de la más  │              │ Toca los países que baña el  │
│  alta a la más baja.         │              │ río Amazonas.                │
│        ⬆ MÁS ALTO            │              │  ┌────────┐    ┌────────┐    │
│  ╱▔╲  ┌────────────────┐     │              │  │○ Brasil│    │○ Chile │    │
│ ╱   ╲ │ ⠿  El piedemonte│    │              │  └────────┘    └────────┘    │
│╱     ╲│ ⠿  La subandina │    │              │  ┌────────┐    ┌────────┐    │
│       ╲ ⠿  Llanuras…    │    │              │  │○ Perú  │    │○ Cuba  │    │
│        ⬇ MÁS BAJO            │              │  └────────┘    └────────┘    │
└──────────────────────────────┘              └──────────────────────────────┘

R3 — ¿Quiénes viven aquí?
┌────────────────────────────────────────┐
│      ¿Qué nacionalidad vive aquí?      │
│  ┌──────────────────────────────────┐  │
│  │ "Se ubican en las riberas del    │  │  ← cartel dorado con la pista
│  │  río Aguarico."                  │  │
│  └──────────────────────────────────┘  │
│  [Secoya] [Shuar] [Kichwa] [Siona]     │
└────────────────────────────────────────┘
```

## 5. Log y reporte

Una fila por ronda (`onSolve(isCorrect, entry)`), reporte de 3 filas:

| Ronda | `emoji` | `a` (ejercicio) | `userAnswer` | `correctAnswer` |
|---|---|---|---|---|
| R1 | ⛰️ | "Ordena: {escalera}" | orden que dejó (`A › B › C`) | orden correcto |
| R2 | 🌊 | "Países de la cuenca del Amazonas" | los que marcó | los 4 correctos |
| R3 | 🪶 | la pista | nacionalidad tocada | nacionalidad correcta |

## 6. Glifos del fondo

Los del juego (`CosmosBg` / pizarra) ya definidos en `screens.jsx`; no se tocan.

## 7. Copy (todos los textos visibles)

- **Botón/tema del hub:** "La Amazonía, nido de vida silvestre";
  `desc` = "La Amazonía, nido de vida silvestre".
- **Enunciados (QUÉ, terminan en punto; los que preguntan cierran con `?`):**
  - R1: "Ordena las zonas de la más alta a la más baja." / "Ordena los volcanes del más
    alto al más bajo." / "Ordena los lugares del más frío al más caliente."
  - R2: "Toca los países que baña el río Amazonas."
  - R3: "¿Qué nacionalidad vive aquí?"
- **Bocadillos (CÓMO):** R1 "Arrastra cada ficha<br />a su lugar." · R2 "Elige con
  calma<br />y comprueba." · R3 "Toca la nacionalidad<br />correcta." El de R2 se eligió
  en dos rondas de opciones (la autora descartó primero "Toca todos los que sí y
  verifica." y luego "Toca los países. Puedes cambiarlos."); el definitivo **no nombra el
  botón ni dice cuántos son**.
- **La R2 no dice cuántos son.** Se quitó la línea "Son cuatro" del enunciado por
  petición de la autora: el niño decide cuántos marca y lo descubre al verificar
  (✓ / ✗ / "faltó").

## 8. Riesgos y decisiones

- ⚠ **Contradicciones del propio libro — no se usan como respuesta:** extensión
  (texto 115 613 km² vs cuaderno 120 000 km²) · el cuaderno lista "Tena" como provincia y
  omite Pastaza (el texto sí da las 6 bien) · dice "siete nacionalidades" y nombra nueve ·
  el volcán aparece como **Zumaco** (texto y cuaderno) y **Sumaco** (pie de foto) → se usa
  "Zumaco" y **la ortografía nunca es la respuesta** (se ordena por altura).
- **Secoya vs Siona** viven las dos en Shushufindi: sus pistas son **las del propio
  cuaderno** (Secoya = "riberas del río Aguarico", Siona = "Sucumbíos, cantón
  Shushufindi"), que es la clave del libro.
- **R1 sin dibujo.** Se probó un corte del terreno en SVG al lado de las fichas y la autora
  lo mandó quitar (*"está bien feo eso, solo deja las opciones"*). Las etiquetas
  ⬆ MÁS ALTO / ⬇ MÁS BAJO ya orientan la escalera.
- **R3 con foto en cada tarjeta** (`assets/l6-nac-<slug>.jpg`, slugs `kichwa, cofan,
  secoya, siona, huaorani, shuar`): la autora pidió una imagen "para que sea más fácil
  adivinarlo". **Las 6 ya están**: 5 extraídas del PDF del libro (columna "Iconografía")
  y la de Kichwa la puso ella. Son **personas reales, nunca IA**. Si falta alguna, esa
  tarjeta queda solo con el nombre y la ronda funciona igual. Cabe con foto (86×86 +
  nombre) y sin ella: overflow 0 y colchón 47 px.
- **Ojo con la ayuda real:** la foto de una nacionalidad NO ayuda a acertar (la pista dice
  *dónde viven*, y la foto no lleva lugar); lo que sí ayuda es el **dato resaltado en
  dorado** dentro de la pista (`hi`). Se hicieron las dos cosas.
- **La R1 tiene 3 variantes**, el suelo más bajo de las tres rondas. Se aceptó porque es
  la misma rotación aprobada en el Libro 3 · Tema 2 (3 regímenes) y porque las otras dos
  rondas casi no repiten.
