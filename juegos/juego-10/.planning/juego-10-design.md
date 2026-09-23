# juego-10 — design-doc · TEMAS 1, 2 y 3

> Planificación inicial (design-doc primero). Escrito ANTES del código, según
> `.claude/skills/edinun-game-builder/references/planificacion-inicial.md`.
> Estado: **los 3 temas aprobados ronda por ronda por la autora** (bocetos ASCII en
> el chat) — Tema 1 el 2026-08-12, Tema 2 el 2026-08-14, Tema 3 el 2026-09-02.
> Ningún botón queda en "Próximamente".
>
> El Tema 2 está en la **§11** y el Tema 3 en la **§12** de este documento.
>
> **Títulos definitivos de los temas** (los fijó la autora el 2026-09-23): "Recursos
> naturales y derechos de la Tierra" · "Inicio del siglo XXI" · "El clima de nuestro
> planeta". Van tal cual en el `catLabel` del reporte; en el botón del Home entran
> enteros los temas 2 y 3 (el 1 se queda con "Recursos naturales": con el título largo
> la fila de botones crecía a 134 px de alto). En el HUD siguen las pastillas cortas
> (RECURSOS · SIGLO XXI · CLIMA), que es lo único que cabe ahí.

---

## 1. Tema

**Tema 1 = "Recursos naturales y derechos de la Tierra"** — es el **Tema 2 del
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
| 1 | `recursos` | Recursos naturales | naranja `#ffc06e→#e4881a` | Recursos naturales y derechos de la Tierra | ✅ 3 rondas · **8 años** |
| 2 | `siglo21` | Inicio del siglo XXI | amarillo `#ffe97a→#d7b12a` | Inicio del siglo XXI | ✅ 3 rondas · **11 años** |
| 3 | `clima` | El clima de nuestro planeta | azul `#7ab8ff→#2773d8` | El clima de nuestro planeta | ✅ 3 rondas · **12 años** |

⚠️ **La edad varía DENTRO del mismo juego** (8 · 11 · 12): la fija la autora tema por
tema. Las mecánicas de los temas 2 y 3 son deliberadamente más exigentes.

Runtime: Home → `app.level` → CharacterScreen (`choose()`) →
`currentCategory` / `currentCatLabel` → `GameScreen` despacha el arreglo de rondas.
Pastillas de tema en el HUD (`top: 14`) para saltar de tema sin volver al Home,
igual que juego-13; con las tres habilitadas se ven las tres, y el bloque Ronda baja
a `top: 74` para dejarles sitio.

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
- **catLabel:** `Recursos naturales y derechos de la Tierra`
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

1. **Título del juego** — provisional hasta que llegue el tema 3.
2. ~~**Tema 3** — sin material.~~ ✅ **Resuelto el 2026-09-02** (§12): "El clima de nuestro
   planeta", 12 años, con tres verbos nuevos — lanzar-la-tarjeta · girar-el-aro ·
   destapar-pistas. El juego queda con **nueve verbos distintos**.
3. **Arrastrar a los 8 años** — juego-8 (misma edad) prefirió tap. Aquí la autora
   eligió el arrastre para la R1; va con **respaldo tap** por si en tablet incomoda.
4. **Sin imágenes todavía**: emoji + nombre. Las fotos del libro no se reproducen. La
   autora va a generar ilustraciones para el Tema 2 (§11.5); el código las acepta con
   el emoji de respaldo.
5. **Vocabulario pesado en la R2 del Tema 1** ("órbita geoestacionaria", "plataforma
   submarina"): está literal en el cuaderno de 8 años, se respeta.

---

# 11. TEMA 2 · "Inicio del siglo XXI"

Es el **Tema 1 del libro** (pp. 112-117 + cuaderno pp. 103-106), donde se titula
"Inicio del siglo XXI: globalización, democracia y unidad nacional"; el título del tema
en el juego lo fijó la autora el 2026-09-23, más corto. En nuestro Home ocupa el **2º
botón** (amarillo, por POSICIÓN). **Edad objetivo: 11 años**, la fija la autora.

Contenido del tema: la dolarización · el cambio climático · la deuda externa ·
emigración e inmigración · la integración regional (ALADI · SELA · CAN · CELAC ·
MERCOSUR) · los retos del Ecuador ante la globalización · el compromiso de la juventud.

## 11.1 Mecánica — 3 rondas, 3 verbos NUEVOS

Elegidas por la autora vía bocetos ASCII, una ronda a la vez (rechazó la primera tanda
del R2 por "aburridas": eran tres variantes de *clasificar*). Los verbos no pueden
repetir los del Tema 1.

| R | Nombre | Verbo | Contenido | Validación | ⭐ |
|:-:|---|---|---|---|:-:|
| 1 | Del sucre al dólar | **ordenar** (arrastrar la tarjeta a su lugar; el toque queda de respaldo) | línea del tiempo del siglo XXI | ¡VERIFICAR! | +1 por posición (4) |
| 2 | ¿Dónde se esconden los gases? | **buscar** con lupa dentro de una escena | cambio climático | ¡VERIFICAR! | +1 por acierto (4) |
| 3 | El gráfico vivo | **arrastrar** el borde de un gráfico | deuda externa · bloques regionales | ¡VERIFICAR! | +1 por dato (3) |

**Máximo 11 ⭐** (el Tema 1 da 10; cada tema es su propia partida).

### R1 · Del sucre al dólar

4 hechos en columna, sin año visible. Se **arrastra** la tarjeta hasta su lugar: mientras
arrastras, la tarjeta flota siguiendo el dedo y una **barra dorada** marca dónde va a caer.
El **toque sigue funcionando de respaldo** (tocar dos tarjetas las intercambia), igual que
la R1 del Tema 1 lleva respaldo tap. ¡VERIFICAR! valida las 4 de una vez. Al revelar, cada tarjeta muestra
**su año** y, si está mal, **"va Nº"** — sin reordenar la columna, para que el niño siga
viendo su propia respuesta.

> ⚠️ Al verificar se **suelta** la tarjeta levantada. Si no, quedaba desplazada y su ✗
> (que cuelga del borde) se salía de la zona de mecánica. Cazado por la auditoría de
> espacios, no a ojo.

### R2 · ¿Dónde se esconden los gases?

Escena de 458×326 con 9 elementos: **4 calientan el planeta y 5 son decorado**, sacados
de un **banco por escena** (7-8 + 10) y repartidos barajados en 9 huecos fijos, para que
no salgan siempre los mismos. Cada elemento va sobre una **placa clara** que le da
contraste sobre cualquier fondo. La lupa
sigue al dedo y **amplía el elemento más cercano** dentro del aro (58 px), a 1,45×. Se marcan 4 y
¡VERIFICAR! valida de una vez. Al revelar: ✓ verde en las marcadas correctas, ✗ rojo en
las marcadas mal, y **aro dorado punteado con el nombre** en las correctas que se
escaparon.

> ⚠️ **Marcar + ¡VERIFICAR!, no "se cierra al encontrar las 4"**: si la ronda solo
> terminara al acertar sería imposible fallar y no habría revelado ni respuesta parcial.
>
> ⚠️ **La lupa amplía UNO SOLO** (el más cercano). Ampliando a todos los que caían dentro
> del aro, dos vecinos crecían a la vez y se tapaban.
>
> ⚠️ **Separación**: **72 px** libres en un eje (15,7 % en x o 22,1 % en y), para que el
> ampliado nunca cubra a su vecino. Subió de 60 a 72 al agrandar el elemento (46 → 58 px,
> emoji 28 → 38, pedido de la autora el 2026-08-28) y por eso **las tres escenas** están
> repartidas en tres filas de profundidad, no solo la del campo.
>
> ⚠️ El **rótulo del revelado** se dibuja ARRIBA del elemento cuando abajo no cabe (la fila
> de adelante del campo): si no, se salía de la escena.
>
> ⚠️ **El fondo es UNA sola pieza**, no dos. Se pintaba en dos bloques —cielo arriba, suelo
> abajo— y la autora lo rechazó: *"¿por qué está de dos colores, celeste y camel? No me
> gusta"* (2026-09-02). Una línea dura a media altura parte el recuadro en dos rectángulos
> en vez de leerse como un paisaje. Ahora es **un degradado de 5 paradas** del celeste al
> tono de tierra, sin costura, con un tinte distinto por escena. Como ya no hay horizonte
> visible, tampoco hay elementos "flotando en el cielo": el problema desapareció con la
> causa. El reparto en **tres filas** se mantiene — es lo que garantiza los 72 px.

### R3 · El gráfico vivo

Dos tipos de gráfico con **el mismo gesto**, porque el pastel solo daba un ejercicio y
la ronda se repetiría al recargar:

- **Pastel** — la deuda del Ecuador con los organismos: FMI 33 % · BID y CAF 49 % ·
  los demás 18 %. Dos manijas sobre el borde; la 3ª porción es lo que queda.
- **Barras** — cuántos países integran cada bloque: ALADI 13 · SELA 26 · CAN 5 ·
  CELAC 33. Salen **3 de los 4** cada vez, escala 0-40, manija en la punta.

Los tres números objetivo se muestran **desordenados** arriba, bajo el rótulo
**"Una de estas va en cada barra:"** (o *"en cada parte"* en el pastel): el ejercicio es
decidir cuál va en cada categoría, no recordar la cifra exacta. Tolerancia ±3 puntos en el
pastel y ±1 país en las barras. Al revelar, la marca verde señala el valor real y la
leyenda muestra `20→13`.

## 11.2 Datos del libro y sus problemas

| Dato | Fuente | Nota |
|---|---|---|
| El sucre circula desde **1884** | p. 112 | |
| **2000**: Mahuad cambia el sucre por el dólar | p. 112 | |
| **Diciembre 2023**: monedas con personajes | p. 113 | |
| ALADI **1960** · CAN **1969** · SELA **1975** · MERCOSUR **1994** · CELAC **2011** | p. 116 | |
| Acuerdo de París ratificado en **2017** | p. 114 | |
| Países por bloque: ALADI 13 · SELA 26 · CAN 5 · CELAC 33 | p. 116 | MERCOSUR no trae número |
| Causas del cambio climático: combustibles fósiles, deforestación, agricultura intensiva | p. 113 | |
| Nitrógeno y oxígeno **regulan** el calor (son los buenos) | cuaderno p. 104 | |

> ⚠️ **INCONSISTENCIA DEL LIBRO** (avisada a la autora el 2026-08-14): la p. 114 dice
> que la deuda total es de **48 129 millones** y que los **8 100 del FMI** "equivalen al
> **33,3 %**". Pero 8 100 de 48 129 es el **17 %**. El 33,3 % solo cuadra sobre la deuda
> con **organismos multilaterales**. Decisión aplicada: el gráfico se rotula **"La deuda
> del Ecuador con los organismos"** y usa **solo porcentajes** — no se mezclan los
> millones para no enseñar una cuenta que no cierra. Revertir es una línea si la autora
> prefiere la redacción literal.
>
> ⚠️ **La CAN con Chile**: el libro la da como integrada por Bolivia, Ecuador, Colombia,
> Perú y **Chile**. Chile salió de la CAN hace décadas. Se juega con **el número del
> libro (5)**, que es lo que van a evaluar; avisado a la autora.

### Hitos EXCLUIDOS de la R1 (y por qué)

- **El feriado bancario** — el libro lo fecha como *"finales del siglo XX"*, sin año.
  Con 1994 (MERCOSUR) en el banco el orden sería ambiguo. Entra si la autora confirma
  el año.
- **La deuda de 48 129 millones (febrero 2023)** — chocaría con las monedas de
  diciembre de 2023: dos hitos del mismo año ⇒ dos ordenaciones correctas.

### Criterio de "calienta el planeta" (R2)

Solo las dos causas que el libro nombra: **quema de combustibles fósiles** (fábricas,
carros, buses, aviones, tractores, camionetas) y **deforestación** (motosierra, troncos
talados, camión maderero, bosque quemado).

⚠️ Deliberadamente **no se usa ganado** ni como respuesta ni como decorado: el metano del
ganado no está en el libro y marcar una vaca como "no contamina" sería enseñar algo
discutible.

## 11.3 Copy del Tema 2

- **Botón 2:** `Inicio del siglo XXI` · descripción: `El Ecuador de hoy: el dólar, el clima y la unión con otros países.`
- **catLabel:** `Inicio del siglo XXI`
- **Pastilla del HUD (`short`):** `SIGLO XXI`

| R | Enunciado (**QUÉ**, termina en punto) | Bocadillo (**CÓMO**) |
|:-:|---|---|
| 1 | Ordena los hechos del más antiguo al más reciente. | Arrastra la tarjeta<br>hasta su lugar. |
| 2 | Encuentra las cuatro cosas que calientan el planeta. | Eres detective.<br>Mira y marca<br>las cuatro. |
| 3 | *pastel:* Reparte la deuda del Ecuador entre quienes le prestaron.<br>*barras:* Completa cada barra con los países que tiene ese grupo. | *pastel:* Arrastra las bolitas<br>hasta que cada parte<br>tenga su número.<br>*barras:* Arrastra la bolita<br>hasta que cada barra<br>tenga su número. |

Sin rótulos visibles inventados: los 4 puntos bajo la escena de la R2 no llevan palabra
(el enunciado ya dice "las cuatro").

| R | `emoji` | `a` (enunciado del reporte) |
|:-:|:-:|---|
| 1 | 🕰️ | ¿En qué orden pasaron estos hechos? |
| 2 | 🔍 | ¿Qué cosas de la escena calientan el planeta? |
| 3 | 📊 | La deuda del Ecuador con los organismos / Países que integran cada grupo |

## 11.4 Anti-repetición del Tema 2

| Clave | Elige | Banco | cap | Combinaciones |
|---|---|:--:|:--:|---|
| `edinun_j10_s21r1_v1` | 4 hitos | 9 | 4 | 126 |
| `edinun_j10_s21r2_v1` | 1 escena | 3 | 2 | 3 |
| `edinun_j10_s21r3_v1` | 1 gráfico | 5 | 4 | 5 |

## 11.5 Ilustraciones pendientes

Los emoji son **marcadores de posición**. La autora va a generar:

- **R1** — 9 iconos de 120×120 PNG con fondo transparente, uno por hito
  (`assets/hito-<id>.png`). El `<span>` del emoji se cambia por un `<img>`.
- **R2** — 3 escenas de 920×600 (ciudad · bosque · campo) + los 12 objetos sueltos en
  PNG transparente, que se colocan en las mismas coordenadas `x/y` en % ya definidas.
- **R3** — ninguna, el gráfico se dibuja por código.

Nada bloquea: el juego es jugable y verificado con emoji.

---

# 12. TEMA 3 · "El clima de nuestro planeta"

Es el **Tema 4 del libro** (pp. 48-51 + cuaderno; D.C.D. **CS.4.2.3**); en nuestro Home
ocupa el **3er botón** (azul, por POSICIÓN). **Edad objetivo: 12 años**, la fija la autora.

Contenido del tema: el concepto de clima frente al de tiempo atmosférico · los 6 tipos de
clima del mundo · las zonas por latitud del mapa de líneas imaginarias · los factores de
variación del clima · los desastres naturales en el contexto del cambio climático · los
planes de contingencia globales (1992 · 1997 · 2015).

## 12.1 Qué NO entra, y por qué

⚠️ **El Tema 2 de este mismo juego ya juega el cambio climático**: su R2 busca las cuatro
cosas que calientan el planeta y su línea del tiempo incluye el Acuerdo de París. Si el
Tema 3 volviera sobre los gases de efecto invernadero, los dos botones se sentirían el
mismo juego con otra pintura. **Reparto acordado:**

| | Tema 2 | Tema 3 |
|---|---|---|
| Cambio climático | ✅ causas, gases, acuerdos | ❌ no se repite |
| El clima como sistema | ❌ | ✅ qué es, tipos, dónde se dan |

Por eso **quedan fuera del Tema 3**: los desastres naturales y su gráfico 1970-2024, y los
tres instrumentos jurídicos (1992 Convenio Marco · 1997 Kioto · 2015 París). Los segundos,
además, solo darían un ejercicio de **ordenar**, que es el verbo de la R1 del Tema 2.

## 12.2 Mecánica — 3 rondas, 3 verbos NUEVOS

Bocetadas en ASCII en el chat, tres opciones para la R1. **La autora eligió las tres**
("me gustaron las 3") y se repartieron como las tres rondas del tema, ordenadas de menor a
mayor exigencia: concepto → tipos → deducción.

| R | Nombre | Verbo | Contenido | Validación | ⭐ |
|:-:|---|---|---|---|:-:|
| 1 | El noticiero | **lanzar** la tarjeta a un riel | clima vs tiempo atmosférico | ¡VERIFICAR! | +1 por noticia (4) |
| 2 | La ruleta de los climas | **girar** el aro | los 6 tipos de clima | ¡VERIFICAR! | +3 de una vez |
| 3 | El lugar misterioso | **destapar** pistas y deducir | clima ↔ lugar del mundo | ¡VERIFICAR! | +3 de una vez |

**Máximo 10 ⭐** (el Tema 1 da 10 y el Tema 2, 11: cada tema es su propia partida).

Ninguno de los tres verbos repite los seis de los temas 1 y 2 (arrastrar-al-mapa ·
tocar-franja · elegir-entre-dos · ordenar-arrastrando · buscar-con-lupa ·
arrastrar-el-borde-del-gráfico). **El juego queda con nueve verbos distintos.**

> ⚠️ **Aviso dado a la autora al proponer:** el gesto de la R1 (lanzar una carta a un lado)
> es el mismo que ella ya aprobó en **juego-13 Tema 3 R1 «El muro»**. Se marcó como
> repetición *entre juegos* (dentro de juego-10 el verbo es nuevo) y ella lo eligió igual.

### R1 · El noticiero

Mazo de 4 noticias en el centro (carta de 300×96) y dos rieles arriba: **CLIMA** (violeta)
y **TIEMPO ATMOSFÉRICO** (azul). Se arrastra la carta, que se **inclina** siguiendo al dedo
(±14°), y al soltarla cae en el riel como miniatura de 44. ¡VERIFICAR! valida las 4.

- El destino se decide por **dónde se suelta** (riel + 16 px de margen) o, si el gesto se
  quedó corto de altura, **por el signo del desplazamiento** cuando pasa de 70 px. Soltar
  en el medio devuelve la carta al mazo.
- **Respaldo tap:** tocar un riel manda ahí la carta de arriba; tocar una miniatura la
  devuelve al mazo (se puede corregir antes de verificar).

> ⚠️ **Los dos rieles van a su alto MÁXIMO desde el principio** (236 px). Si crecieran al
> recibir cartas empujarían el mazo hacia abajo en cada lanzamiento. Es la versión "cajón
> grande desde el principio" de lo que la autora pidió en la R1 del Tema 1: con solo dos
> cajones y cuatro fichas, clavarlos al máximo consigue que **nada se mueva** en toda la
> ronda. El mazo también tiene alto fijo (104) para no encoger al vaciarse.

### R2 · La ruleta de los climas

Aro de 260 px con los 6 tipos de clima en pastillas de 84×34 y una **flecha ▼ fija** arriba.
Se arrastra el aro en círculo y al soltar **encaja** en la ranura más cercana. Arriba, la
tarjeta con la característica **literal de la tabla de la p. 49**. Una jugada ⇒ +3 ⭐.

> ⚠️ **El brazo de la pastilla lleva `rotate(i·60 + ang)`.** Sin el `+ ang` el aro no gira:
> cambiaba la ranura seleccionada pero las pastillas se quedaban quietas y solo rotaba su
> texto. La pastilla se contra-rota `-(i·60) - ang` para que el texto quede horizontal, y
> ambas transiciones deben ser idénticas o se desincronizan al encajar.
>
> ⚠️ **El respaldo tap se resuelve en el `onPointerUp` del ARO**, no con un `onClick` en la
> pastilla: el aro captura el puntero al empezar (necesario para que el arrastre no se
> corte al salirse del círculo) y, con el puntero capturado, el `click` posterior va al aro
> y no a la pastilla. El toque se perdía y la ruleta se quedaba en su posición inicial
> —que a propósito nunca es la respuesta—, así que la ronda era **imposible de acertar sin
> arrastrar**. Lo cazó el e2e (partida "perfecta" que daba 7 ⭐), no se veía a ojo.
>
> ⚠️ **Radio del brazo 83, no 86**: con 86 la esquina externa de la pastilla llegaba a
> 131 px del centro y el aro mide 130 de radio, así que las de las 2 y las 4 cruzaban el
> borde dorado. El buje bajó a 78 para no quedar pegado por dentro.
>
> ⚠️ **El buje es el planeta 🌍**, no el emoji del clima: delataría la respuesta.

### R3 · El lugar misterioso

Tres sobres cerrados que el niño abre tocándolos y cuatro lugares abajo. **Se puede acertar
con una sola pista**: abrirlas todas no es obligatorio y no cuesta estrellas — es lo que
hace que la ronda sea *investigar*, y es la única de las nueve del juego con información
opcional. ¡VERIFICAR! valida ⇒ +3 ⭐. Al revelar, el lugar correcto muestra **su clima**,
que es justo el emparejamiento que pide la actividad 3 del cuaderno.

> ⚠️ **Cómo se garantiza que hay UNA sola respuesta:**
> 1. las 4 opciones tienen siempre **climas distintos** (el banco tiene un lugar por clima) y
> 2. de las 3 pistas, al menos una está marcada **`clave: true`** — describe algo que en la
>    tabla del libro solo cumple ese clima.
>
> Sin (2) podían salir tres pistas compartidas (p. ej. *"Tiene cuatro estaciones"*, que vale
> para templado **y** continental) y la ronda no tendría solución.

## 12.3 Datos del libro y sus problemas

| Dato | Fuente | Nota |
|---|---|---|
| Clima = condiciones **promedio** en un periodo prolongado, **al menos 30 años** | p. 48 | |
| Tiempo atmosférico = estado de la atmósfera en **un momento y lugar específicos**; cambia en horas | p. 48 | |
| Los 6 tipos de clima y sus características | p. 49 (tabla) | literal |
| Zonas cálida / templada / fría y las 5 líneas imaginarias | p. 49 (mapa) | |
| Factores: radiación solar, latitud, altitud, proximidad del agua, corrientes, vientos, topografía, vegetación, gases | p. 49 | |
| tropical→Amazonía · alta montaña→Andes · seco→Sahara · polar→Antártida | cuaderno act. 3 | |
| templado: España, Italia, **Japón** · continental: Siberia, norte de Canadá | cuaderno act. 4 | |

⚠️ **Las 12 noticias de la R1 NO son textuales.** El libro solo da un ejemplo ("si hoy
llueve en tu ciudad o si hace mucho calor durante la tarde"). Lo textual es el **criterio**
de la p. 48; cada noticia lo aplica con una marca temporal explícita. Es el mismo
precedente que los ejercicios de cálculo de juego-13 T2R2: **el molde es del libro, los
enunciados se construyen con él.** Si la autora prefiere solo frases literales, la R1 se
queda con una sola y habría que cambiarle la mecánica.

⚠️ **Japón y no España/Italia** como ejemplo de templado: 🗾 **nombra a Japón**, mientras que
para España no había emoji que no mintiera (🫒 nombra una aceituna, 🏖️ una playa). Manda la
regla del emoji que la autora fijó en el Tema 1.

⚠️ **Los emoji de las noticias van repartidos entre los dos grupos** (los dos usan símbolos
del tiempo). Si el clima llevara paisajes y el tiempo, nubes y lluvia, el emoji resolvería
la ronda sin leer la noticia.

⚠️ **Actividades del cuaderno que NO se gamifican:** la 2 (subrayar afirmaciones sobre la
"responsabilidad compartida pero diferenciada" — su verbo sería *elegir*, ya usado en el
Tema 1, y el contenido es de acuerdos, que se queda en el Tema 2), la 5 (dibujar el
calentamiento global: respuesta abierta) y la 6 (ordenar los tres instrumentos jurídicos:
verbo ya usado en el Tema 2). La 1 y la 3 están en la R1 y la R3; la 4 alimenta las pistas
de templado y continental.

## 12.4 Copy del Tema 3

- **Botón 3:** `El clima de nuestro planeta` · descripción: `El clima, sus tipos y su diferencia con el tiempo atmosférico.`
- **catLabel:** `El clima de nuestro planeta`
- **Pastilla del HUD (`short`):** `CLIMA`

| R | Enunciado (**QUÉ**, termina en punto) | Bocadillo (**CÓMO**) |
|:-:|---|---|
| 1 | Decide de qué habla cada noticia. | Arrastra la noticia<br>a CLIMA o a TIEMPO. |
| 2 | Descubre de qué clima habla la tarjeta. | Gira la ruleta hasta<br>poner ese clima<br>bajo la flecha. |
| 3 | Descubre de qué lugar hablan las pistas. | Abre las pistas.<br>Luego toca el lugar. |

Los bocadillos solo nombran lo que se ve en pantalla (CLIMA y TIEMPO son los rótulos de los
rieles; la flecha y las pistas están dibujadas), como exige la corrección de la autora en la
R1 del Tema 1.

| R | `emoji` | `a` (enunciado del reporte) |
|:-:|:-:|---|
| 1 | 📰 | ¿Cada noticia habla del clima o del tiempo atmosférico? |
| 2 | 🌡️ | ¿De qué tipo de clima habla la tarjeta? |
| 3 | 🔎 | ¿De qué lugar hablan las pistas? |

## 12.5 Anti-repetición del Tema 3

| Clave | Elige | Banco | cap | Combinaciones |
|---|---|:--:|:--:|---|
| `edinun_j10_cl_r1_v1` | 4 noticias | 12 | 6 | 495 |
| `edinun_j10_cl_r2_v1` | 1 clima | 6 | 5 | 6 |
| `edinun_j10_cl_r3_v1` | 1 lugar | 6 | 5 | 6 |

Las **pistas de la R3 no llevan FIFO**: el banco por clima tiene 3 o 4 y guardar recientes
lo dejaría sin de dónde elegir — se barajan obligando a que entre una `clave`. Lo mismo con
las 3 opciones acompañantes y con el orden del aro de la R2, que se barajan en cada montaje.

## 12.6 Ilustraciones pendientes

Los emoji son **marcadores de posición**, como en los otros dos temas. Lo que más ganaría:

- **R2** — 6 iconos de clima (120×120 PNG transparente) para el buje del aro… **no**: el
  buje NO puede mostrar el clima de la respuesta. Irían en la **tarjeta** de la
  característica, a la izquierda del texto.
- **R3** — 6 ilustraciones de lugar (apaisadas ~2:1, como las de juego-13 T3) para las
  cuatro tarjetas de opción.
- **R1** — ninguna: son noticias, el emoji del tiempo funciona como icono de titular.

Nada bloquea: el tema es jugable y está verificado con emoji.
