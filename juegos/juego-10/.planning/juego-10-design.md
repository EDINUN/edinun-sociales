# juego-10 — design-doc · TEMA 1

> Planificación inicial (design-doc primero). Escrito ANTES del código, según
> `.claude/skills/edinun-game-builder/references/planificacion-inicial.md`.
> Estado: **Tema 1 aprobado ronda por ronda por la autora** (bocetos ASCII en el
> chat, 2026-08-12). **Temas 2 y 3: sin material todavía** → botones en
> "Próximamente" hasta que la autora entregue su texto y su edad.

---

## 1. Tema

**Tema 1 = "Recursos naturales y los derechos de la Tierra"** — es el **Tema 2 del
libro**; en nuestro Home ocupa el **1er botón** (el gradiente va por POSICIÓN, no
por temática → naranja).

Enseña la **megadiversidad del Ecuador**: por qué es un país megadiverso, la flora
y la fauna de las 4 regiones naturales (Costa · Sierra · Amazonía · Galápagos),
las zonas del territorio nacional más allá del suelo firme, y las especies
emblemáticas y amenazadas. D.C.D. **CS.2.2.11, CS.2.2.16**.

- **Edad objetivo: 8 años** (la fija la autora).
- **`charId: yaku`** — por el **ciclo del elenco** (`memory/orden-personajes.md`:
  Domi → Yaku → Sisa → Andi por ordinal del slug; **10 mod 4 = 2 → yaku**), no por
  temática.
- Título del juego: **provisional** hasta que lleguen los temas 2 y 3.

## 2. Niveles

**3 temas = 3 botones** (grid `1fr 1fr 1fr`, gap 10 — `estandar-visual.md` §0).

| # | id | label | grad (por posición) | catLabel | Estado |
|:-:|---|---|---|---|---|
| 1 | `recursos` | Recursos naturales | naranja `#ffc06e→#e4881a` | Recursos naturales y los derechos de la Tierra | ✅ 3 rondas |
| 2 | `tema2` | Tema 2 | amarillo `#ffe97a→#d7b12a` | Tema 2 (provisional) | ⏳ sin material |
| 3 | `tema3` | Tema 3 | azul `#7ab8ff→#2773d8` | Tema 3 (provisional) | ⏳ sin material |

Runtime: Home → `app.level` → CharacterScreen (`choose()`) →
`currentCategory` / `currentCatLabel` → `GameScreen` despacha el arreglo de rondas.
Pastillas de tema en el HUD (`top: 14`) para saltar de tema sin volver al Home,
igual que juego-13; con un solo tema habilitado se ve una sola pastilla.

> ⚠️ `estandar-visual.md` §8 prohíbe **entregar** un juego con botones en
> "Próximamente" como estado final. Aquí es un estado **intermedio declarado**: los
> temas 2 y 3 se implementan en cuanto llegue su material.

## 3. Mecánica — 3 rondas, 3 verbos distintos

Elegidas por la autora vía bocetos ASCII, una ronda a la vez.

| R | Nombre | Patrón | Verbo | Validación | ⭐ |
|:-:|---|---|---|---|:-:|
| 1 | Mapa vivo | 8 (clasificar en cajones) sobre zonas de color | **arrastrar** | ¡VERIFICAR! | +1 por ficha (4) |
| 2 | El ascensor del Ecuador | 5 (tocar la opción correcta) sobre un corte vertical | **tocar** | al tocar | +3 de una vez |
| 3 | Ficha del descubrimiento | 6 (huecos en una lectura) | **elegir** | ¡VERIFICAR! | +1 por hueco (3) |

**Máximo 10 ⭐.** `isCorrect` de la ronda = ronda perfecta (dot del HUD y reporte).
Fallar nunca resta.

### R1 · Mapa vivo

4 fichas (especie o producto, emoji + nombre) → 4 zonas de un mapa esquemático del
Ecuador (**GALÁPAGOS** como recuadro insular + bandas **COSTA · SIERRA · AMAZONÍA**).
Arrastre con pointer events y **respaldo tap** (tocar ficha → tocar zona), calcado
de `R1Aduana` de juego-13; soltar fuera devuelve la ficha a la bandeja.

- Reparto **variable**: se exige que las 4 fichas cubran **≥ 2 regiones** y **no**
  se reparte una por región (si no, se resolvería por descarte).
- Al verificar: ✓/✗ sobre la ficha donde la puso el niño + pastilla con la región
  correcta — el revelado va **en el lenguaje de la mecánica**.

### R2 · El ascensor del Ecuador

Corte vertical del territorio: **6 franjas en una sola columna** — órbita
geoestacionaria · espacio aéreo · mar territorial · plataforma submarina · subsuelo,
y la **zona Antártida** cerrando la lista con un poco más de aire arriba (no es una
capa del corte). Yaku muestra una definición **textual del cuaderno** y el niño toca
la franja. **UNA definición por ronda.**

- Valida **al tocar**, sin ¡VERIFICAR!. Al fallar: la tocada en rojo y la **correcta
  en verde**.
- Franjas con relleno **crema opaco**, como las fichas de la R1 y las opciones de la R3.
- Sin marcadores inventados.

> ⚠️ **Corregido el 2026-08-13, reportado por la autora.** Iba con **2 definiciones**
> seguidas ("para que la ronda no quedara corta") y eso rompe la regla dura del repo —
> *una ronda = UNA jugada*, nacida del error de juego-4. Como ahora se resuelve con un
> solo toque, vale **+3 ⭐** de una vez, con el criterio de la calculadora de juego-13
> (Tema 2, R2), para que las tres rondas pesen parecido.
>
> ⚠️ También reportado: la **zona Antártida en un recuadro suelto al costado se veía
> mal** → entró a la misma columna. Y las franjas eran **blanco translúcido al 14 %**
> sobre el fondo verde → *"casi no se notan, se ven muy brillantes"*.

### R3 · Ficha del descubrimiento

Ficha tipo cuaderno de campo de UNA especie emblemática con **3 huecos**; cada hueco
ofrece **2 opciones** y el niño toca la correcta. ¡VERIFICAR! valida los 3 de una vez
y **solo se habilita con los 3 contestados** (una ronda = una jugada). Al fallar: la
correcta en verde con ✓ **y** la elegida en rojo con ✗ — se ven las dos.

## 4. Layout (lienzo 900×540)

Zona de la mecánica: `top: 60, bottom: 18, left: 215, right: 215` (470×462), igual
que juego-13. HUD, personaje/bocadillo, acciones y Results con los valores fijos de
`estandar-visual.md` §1-§5 — **no se tocan**.

```
┌────────────────────────────────────────────────────────────────┐
│ [logo 64]   ·RECURSOS·      Ronda ● ○ ○         ⏱ 0:12  ⭐ 0   │  HUD (top 10 / 14 / 52)
│                                                                │
│                  ← enunciado (QUÉ hacer) →                     │
│   ╭──────────╮   ┌──────────────────────────┐    ┌─────────┐   │
│   │ bocadillo│   │                          │    │¡VERIFI- │   │
│   │  (CÓMO)  │   │    zona de la mecánica   │    │  CAR!   │   │
│   ╰────┬─────╯   │      x ≈ 215..685        │    ├─────────┤   │
│        │         │   (centrada en x = 450)  │    │REINICIAR│   │
│     (Yaku 186)   │                          │    ├─────────┤   │
│      Yaku        └──────────────────────────┘    │  SALIR  │   │
│                                          right:18 └─────────┘   │
└────────────────────────────────────────────────────────────────┘
```

**R1** — bandeja 2×2 (fichas 140 px, `minHeight: 156` fijo para que el mapa no salte
al vaciarse) sobre el panel del mapa (452×196): recuadro Galápagos 92 px + 3 bandas
de ~111 px.
**R2** — tarjeta de la definición arriba; debajo, las 5 franjas (320 px de ancho) y
la caja de la Antártida a la derecha, alineada abajo.
**R3** — ficha de 442 px de ancho, 3 filas de 2 opciones (calcado de `T2R1Pasaporte`).

Colchón mecánica ↔ acciones ≥ 30 px (§4) y columna de acciones estándar
(`right: 18, width: 150`).

## 5. Log y reporte

`lastResult.log[i]` = `{ idx, emoji, a, userAnswer, correctAnswer, isCorrect, time }`.
Subtítulo del reporte: **"Reporte académico · Estudios Sociales"** (sin renombrar
columnas).

| R | `emoji` | `a` (enunciado del reporte) | `userAnswer` / `correctAnswer` |
|:-:|:-:|---|---|
| 1 | 🗺️ | ¿En qué región natural vive cada especie? | `Tortuga gigante=GALÁPAGOS, …` |
| 2 | 🛰️ | ¿Qué zona del territorio es? | `Espacio aéreo` / `Órbita geoestacionaria` |
| 3 | 🐸 | Ficha del Cutín | `Apareció en el año 2010 · …` |

⚠️ Las respuestas se escriben **cortas**: la tabla del reporte en pantalla vive en una
caja de ~166 px con `overflow:auto` (ver `CHECK-JUEGOS.md`).

## 6. Glifos del fondo

Naturaleza y megadiversidad, afines al tema (y neutros para los temas 2-3 que faltan):
`cosmic` (15): 🌿 🐢 🦜 🌋 🏔️ 🌊 🐸 🌸 🦎 🌵 🍌 🐆 🦅 🐬 🌴 ·
`chalkboard` (10): 🌿 🐢 🦜 🌊 🐸 🌵 🦎 🏔️ 🌸 🦅.

## 7. Copy (todos los textos visibles)

- **Hero del Home:** `EDINUN · Ecuador megadiverso` + `¡Bienvenido/a, Estudiante!`
- **Label:** `Elige un tema para jugar`
- **Botón 1:** `Recursos naturales` · descripción: `La megadiversidad del Ecuador y sus cuatro regiones.`
- **Botones 2 y 3:** `Tema 2` / `Tema 3` · descripción: `Muy pronto.` (deshabilitados)
- **catLabel:** `Recursos naturales y los derechos de la Tierra`
- **Pastilla del HUD (`short`):** `RECURSOS`

| R | Enunciado (**QUÉ**, termina en punto) | Bocadillo (**CÓMO**) |
|:-:|---|---|
| 1 | Ubica cada especie en la región donde vive. | Arrastra la ficha<br>hasta su región. |
| 2 | Encuentra la zona del territorio que se describe. | Toca la que creas<br>correcta. |
| 3 | Completa la ficha de la especie. | Toca las tres<br>respuestas<br>correctas. |

⚠️ **Vocabulario:** el bocadillo de la R3 decía *"…en cada hueco"* y la autora lo rechazó —
**"hueco" es jerga de diseño**, no palabra de un niño de 8 años. Y el de la R1 decía
*"sobre el mapa"* cuando en pantalla no hay una silueta reconocible del Ecuador. Regla:
**el bocadillo solo puede nombrar cosas que el niño ve y entiende.**

- **Frase de cierre (Results):** la genérica del shell — `"<Nombre>, acertaste N de 3."`

## 8. Bancos — todo TEXTUAL del libro

### `J10_REGIONES` (4)
Costa `#e4881a` · Sierra `#9b6fe0` · Amazonía `#2ecc8f` · Galápagos `#3f8ee0`.
⚠️ Los colores **no salen del libro** (el cuadro de la p. 72 no fija paleta): son los
del ecosistema EDINUN, los mismos 4 de juego-13.

### `J10_ESPECIES` (R1) — 54 ítems del cuadro resumen (p. 72) y de los textos por región

Costa 12 · Sierra 14 · Amazonía 15 · Galápagos 13.

⚠️ **Regla del emoji:** si existe el de la especie se usa; si no, el de su **grupo**
(🐦 ave · 🦅 rapaz · 🦜 lorífero · 🐟 pez · 🐾 mamífero · 🌳 árbol · 🌿 planta · 🌸 flor ·
🥔 tubérculo · 🌾 cereal). **Nunca un parecido que nombre otra cosa** (🖤 para gallinazos,
🐜 para el oso hormiguero, 🥒 para el pepino de mar). Papaya, taxos y pepino de mar quedan
fuera del banco porque no había emoji que no mintiera.

⚠️ **Exclusión por ambigüedad** (misma regla que los montes Urales en juego-13): el
cuadro repite especies en dos regiones, y esas tendrían **dos respuestas correctas**.
**Fuera del banco:** cedro · laurel · caoba · palo santo · cacao · palma africana ·
soya · monos · loros · papagayos · curiquingues · buitres · arveja · garbanzo ·
atún · corvina · ganado vacuno · ganado caballar · cabras · manglares · líquenes ·
musgos · culebras · lagartijas · lagartos · serpientes.

También fuera **naranja/mandarina/naranjilla juntas** y **banano/plátano juntos**: a
los 8 años son indistinguibles entre sí. Se conservan banano (Costa) y naranjilla y
limones (Amazonía).

### `J10_ZONAS` (R2) — las 6 zonas del territorio, definiciones literales del cuaderno (p. 69)

órbita geoestacionaria 🛰️ · espacio aéreo ✈️ · mar territorial 🌊 · plataforma
submarina 🐟 · subsuelo ⛏️ · zona Antártida 🐧.

### `J10_FICHAS` (R3) — 4 especies emblemáticas

| Ficha | Campos disponibles | Fuente |
|---|:--:|---|
| 🐸 **Cutín** | 7 | p. 78 + "Mi experiencia con Ciencias Naturales" |
| 🐢 **Tortuga de Galápagos** | 6 | Flora y fauna de las islas Galápagos + glosario *endémico* |
| 🦅 **Cóndor** | 6 | cuaderno p. 69 ("Indaga y escribe…") + Flora y fauna de la Sierra |
| 🌸 **Chuquiragua** | 4 | Flora y fauna de la Sierra + glosario |

⚠️ **Criterio de distractores (consultar con la autora):** el dato correcto siempre es
textual del libro. El distractor sale **también del libro** (de otra región u otra
ficha) siempre que exista una alternativa real — p. ej. "8 200 especies de vegetales"
como distractor de "1 900 especies de animales". Donde el libro no ofrece alternativa,
el distractor es una **negación evidente** del dato (nunca una cifra inventada).
Los que son negación evidente van marcados con `// negación` en el `.jsx`.

## 9. Anti-repetición (FIFO en `localStorage`, una clave por ronda)

| Clave | Elige | Banco | cap |
|---|---|:--:|:--:|
| `edinun_j10_r1_v1` | 4 especies | 54 | 14 |
| `edinun_j10_r2_v1` | 1 zona | 6 | 5 |
| `edinun_j10_r3fic_v1` | 1 ficha | 4 | 3 |
| `edinun_j10_r3_<ficha>_v1` | 3 campos | 4-7 | 2 |

⚠️ Regla de cap para un **subconjunto de K**: nunca `cap = K` (partiría el banco en
grupos fijos que alternarían idénticos en cada recarga). Para elegir **1** de N el cap
va alto (`N − 1`).

## 10. Decisiones abiertas / riesgos

1. **Título del juego** — provisional hasta que lleguen los temas 2 y 3.
2. **Temas 2 y 3** — sin material. Sus verbos tendrán que ser distintos de
   arrastrar · tocar-franja · elegir-en-huecos.
3. **Arrastrar a los 8 años** — juego-8 (misma edad) prefirió tap. Aquí la autora
   eligió el arrastre para la R1; va con **respaldo tap** por si en tablet incomoda.
4. **Sin imágenes**: emoji + nombre. Las fotos del libro no se reproducen. Si la autora
   genera ilustraciones, el código las acepta con el emoji de respaldo.
5. **Vocabulario pesado en la R2** ("órbita geoestacionaria", "plataforma submarina"):
   está literal en el cuaderno de 8 años, se respeta.
