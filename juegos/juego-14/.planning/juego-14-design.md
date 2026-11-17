# juego-14 — "Las culturas posclásicas de Mesoamérica"

## 1. Tema

Estudios Sociales **8.º**, Unidad 6 *"Un legado ancestral que persiste"*,
**Tema 3** (libro págs. 134-136 · cuaderno págs. 90-92). Civilización **maya**
(períodos clásico y posclásico, migración a Yucatán, sociedad teocrática,
numeración vigesimal) y civilización **azteca** (origen náhuatl, lago de
Texcoco, Tenochtitlán, confederación).

- **Edad objetivo:** 12 años.
- **`charId`: `yaku`** (14 mod 4 = 2 → ciclo Domi → **Yaku** → Sisa → Andi).
- **catLabel:** `Las culturas posclásicas de Mesoamérica`
- Todo el contenido es **textual del libro / cuaderno**. Nada inventado.
  (Única licencia, pendiente de confirmar: las variantes 2-4 de la crónica de la
  R3 intercambian términos que sí están en el libro — ver §3.3.)

## 2. Niveles

**Nivel único** (un solo tema). Por tanto:
- Home **sin botones de tema** (solo nombre + ENTRAR), según `estandar-visual.md` §0.
- HUD con el bloque **RONDA + dots en `top: 52`** (no hay pastillas de tema → §1.2 no aplica).
- `currentCategory: "mesoamerica"`, `currentCatLabel: CAT_LABEL`.

## 3. Mecánica — 3 rondas, 3 verbos distintos

`ROUNDS = 3`. `GameScreen` despacha por número de ronda a tres sub-componentes
completos. Validación con **¡VERIFICAR!** en las tres (acciones variante B).
⭐ = **1 por pieza correcta**; fallar **no** resta.

| R | Nombre interno | Verbo | Patrón | ⭐ |
|:-:|---|---|---|:-:|
| 1 | Dial de los siglos | recorrer el tiempo y ubicar | 9 (secuencia) + dial explorador | 4 |
| 2 | Estela maya | componer un valor y verlo cambiar | 1/2 (entrada de valor) | 2 |
| 3 | Códice azteca | detectar y corregir | 6 (huecos en lectura) | 4 |

**Total: 10 estrellas.**

### 3.1 R1 · Las dos regiones mayas (4 estrellas)

> **Rehecha el 2026-11-16 tras probarla la autora.** La versión original traía un
> **dial del año** que iluminaba la región viva. No se entendía, y el motivo de
> fondo era que **la ronda pedía un dato que no estaba en pantalla**: sin saberse
> de memoria la época de cada ciudad, no había de dónde deducirla. El dial se
> eliminó y la regla del libro pasó al mapa.

Mapa de Mesoamérica (`assets/mapa-mesoamerica.jpg`) con las **dos regiones
rotuladas encima**, cada una con su nombre y sus fechas:

- **PENÍNSULA DE YUCATÁN · 900 – 1519 d. C.** (posclásico)
- **SELVAS DEL SUR · 300 – 900 d. C.** (clásico)

Los 4 marcadores de las ciudades en juego caen dentro de su recuadro. La
**jugada**: arrastrar cada ficha (o tap ficha → tap caja) a la caja de época
correspondiente. VERIFICAR valida las 4.

- **Banco (12 ciudades, cuaderno ej. 4, textual):**
  - Clásico 300-900: Copán · Tikal · Calakmul · Palenque · Toniná · Bonampak
  - Posclásico 900-1519: Chichén Itzá · Uxmal · Mayapán · Tulum · Edzná · Cobá
- Cada partida sortea **2 + 2**. **Anti-repetición:** FIFO de **6**.
- **Se puede corregir:** tocar una ciudad ya colocada la devuelve a la bandeja.
  Con una ciudad elegida, el toque sobre la caja **suelta** (la ficha no intercepta).
- **Al fallar:** la ficha mal puesta se marca en rojo con ✗ y la que SÍ iba en ese
  tramo aparece en **verde sólido con halo** (en translúcido no se veía).

### 3.2 R2 · Estela maya (2 estrellas)

Sobre `assets/estela-maya.png`, dos registros apilados: **nivel de los VEINTES**
(arriba) y **nivel de las UNIDADES** (abajo). Bandeja con **punto (1)**,
**barra (5)** y **caracol (0)**. Un marcador muestra **el valor que llevas
escrito, en vivo**, mientras colocas.

- **Del libro (cuaderno ej. 5, textual):** «Para los mayas un punto representa el
  número 1, una barra horizontal el número 5 y un caracol el número 0. Estos
  símbolos se combinaban en un sistema posicional similar al utilizado actualmente.»
- **Banco: 18 números** entre 20 y 260, todos de **exactamente 2 niveles**; seis
  de ellos con **0 unidades** para que entre el caracol.
- Estrellas: 1 por **nivel** correcto (veintes / unidades). Un registro **vacío**
  nunca cuenta como acierto, aunque el valor esperado sea 0.
- **Se puede corregir:** botón **BORRAR** (vacía el registro marcado) y tocar un
  símbolo puesto lo quita. Los puntos **se reparten en varias filas** (13 en una
  sola se salían de la estela).
- **¡VERIFICAR! se habilita con haber escrito algo**, no con los dos registros llenos.
- **Anti-repetición:** FIFO de **17** → no repite hasta agotar el banco.
- **Al fallar:** el nivel errado se pinta rojo y debajo aparece la fila correcta
  dibujada con los mismos puntos/barras (no un número suelto).

### 3.3 R3 · Códice azteca (4 estrellas)

Sobre `assets/papel-amate.png`, una crónica con **4 palabras manchadas**. Al
tocar una, se abre un **selector de dos opciones**; el párrafo se "sana".

- **Variante 1 (textual, cuaderno ej. 7):** quechua→**náhuatl** · siglo VII→**XIII**
  · mayas→**chichimecas** · Titicaca→**Texcoco**.
- **Variantes 2-4:** mismo formato, intercambiando términos que **sí aparecen en
  el libro**: Tenochtitlán / Tlatelolco / Tlacopán (confederación), Huey Tlatoani /
  calpulli (sistema político), Popol Vuh / Códice Florentino (textos), sacerdotes /
  nobles (pirámide social maya), vigesimal / decimal, Quetzalcóatl / Huitzilopochtli.
- **Anti-repetición:** FIFO de **3**.
- **Al fallar:** la opción elegida queda tachada en rojo y la correcta aparece
  en verde dentro del párrafo.

## 4. Layout (lienzo 900×540)

Acciones **variante B** (`right: 18, width: 150`): VERIFICAR (56) + REINICIAR
(48) + SALIR (48). Mecánica centrada en **x = 450**, terminando antes de
**x ≈ 702** (colchón ≥ 30 px hasta los botones en 732).

```
+----------------------------------------------------------------------+
| [logo 64]                 Ronda @oo                   tiempo  estrellas|  0..60
|                                                                      |
|            ENUNCIADO (QUE hacer, termina en punto)                   |  top 92
|                                                                      |
|  +-bocadillo-+   +--------- ZONA MECANICA ---------+    +---------+  |
|  | COMO, con |   |  x: 236..702   y: 120..470      |    |VERIFICAR|  |
|  | <br />    |   |                                 |    +---------+  |
|  +-----------+   |  R1 mapa + linea del tiempo     |    |REINICIAR|  |
|   +---------+    |  R2 estela + bandeja de fichas  |    +---------+  |
|   |  YAKU   |    |  R3 papel amate + parrafo       |    |  SALIR  |  |
|   |  186px  |    |                                 |    +---------+  |
|   +---------+    +---------------------------------+                 |
|   left 8, bottom 78, width 220                           right 18    |
+----------------------------------------------------------------------+
```

## 5. Log y reporte

Una fila de `lastResult.log[i]` **por ronda** (3 filas):

| campo | R1 | R2 | R3 |
|---|---|---|---|
| `emoji` | 🗺️ | 🔢 | 📜 |
| `a` | enunciado de la ronda | ídem | ídem |
| `userAnswer` | `Tikal→Clásico · Tulum→Posclásico · …` | `20x1 + 7 = 27` | las 4 palabras elegidas |
| `correctAnswer` | el reparto correcto | la lectura correcta | las 4 palabras correctas |
| `isCorrect` | true solo si las 4 bien | las 2 bien | las 4 bien |
| `time` | segundos de la ronda | ídem | ídem |

Subtítulo del reporte: **"Reporte académico · Estudios Sociales"** (sin cambios).

## 6. Glifos del fondo

- `cosmic` (home / character / results): ☀ ▲ ✦ ◈ ✧ ○ ∿ ✸ ⌛ ◇ ❂ ⬟ ✶ ◉ ▽
- `chalkboard` (game): ▲ ☀ ◈ ✦ ∿ ○ ◇ ✧ ▽ ⬟

Geometría de grecas y motivos solares/escalonados — **sin emojis figurativos**,
que a 12 años se leen como infantiles.

## 7. Copy

- **Home · label:** `EDINUN · Estudios Sociales`
- **Home · pill:** `Los mayas y los aztecas: sus ciudades, sus números y su historia.`
- **CharacterScreen:** `currentCatLabel = "Las culturas posclásicas de Mesoamérica"`
- **R1** — enunciado: `Ubica cada ciudad maya en la época en que floreció.`
  · bocadillo: `Mueve el año para<br />ver qué ciudades<br />siguen en pie.`
- **R2** — enunciado: `Escribe el número NN en la estela maya.`
  · bocadillo: `El punto vale 1,<br />la barra 5 y el<br />caracol 0.`
- **R3** — enunciado: `Corrige las cuatro palabras manchadas de la crónica.`
  · bocadillo: `Toca una palabra<br />manchada y elige.`
- **Cierre (ResultsScreen):** lo genérico de la plantilla.

## 8. Estado final (2026-11-16) — tras jugarlo la autora

El diseño de arriba es el de partida. Lo que quedó montado, con lo que cambió:

**R1** — el **dial se quitó y volvió**: primero estorbaba (la ronda no se podía
resolver), luego la autora lo echó de menos. Ahora **conviven**: los **rótulos de
región sobre el mapa** (PENÍNSULA DE YUCATÁN 900-1519 · SELVAS DEL SUR 300-900)
hacen la ronda resoluble, y la **barra de los años** aclara el sector vivo. El
mapa se muestra **ampliado y recortado** (`CROP`: x 350-1180, y 136-591 del
archivo → 420×230), así las ciudades se ven al doble. Sus posiciones salen de
lat/lon con la escala medida sobre la imagen (`xf`/`yf` = imagen completa). Los
rótulos van **al lado** del punto. Se puede **devolver** una ciudad tocándola
(queda *en la mano*) y **arrastrarla** de una caja a otra.

**R2** — estela 196×352. Los símbolos se guardan como **lista en orden**:
**BORRAR quita el último, uno a uno**. **VEINTES / UNIDADES son pastillas
tocables** con estado activo. La lectura en vivo es **neutra** (no se pinta verde
al acertar). ¡VERIFICAR! se habilita con haber escrito algo; un nivel vacío
**nunca** cuenta como acierto. Al revelar, la columna derecha se convierte en el
panel **LA RESPUESTA ERA**.

**R3** — papel amate 424×342. **Una o dos de las cuatro palabras vienen ya
correctas** (al azar) y **dejarlas como están cuenta**: ¡VERIFICAR! está activo
desde el principio. Resaltado **ámbar** sin tocar, **azul** al revisar; verde y
rojo solo al verificar. Sin línea de "Fuente".

**Las tres rondas** arrancan en `top: 134` y el enunciado en `top: 86`, centrado
entre el bloque RONDA y el contenido.

## 9. Verificación (los cinco checks)

```bash
node juegos/_PLANTILLA/.planning/format-lint.js juego-14   # valores fijos del estándar
node juegos/_PLANTILLA/.planning/qa-visual.js  juego-14    # 6 viewports, colchón ≥ 30 px
node .planning/ciudades-en-tierra.js                       # las 12 en tierra + rótulos
node .planning/sin-superposiciones.js                      # 12 partidas, DOM real
node .planning/e2e.js                                      # juego real de punta a punta
```

Auxiliar: `.planning/mapa-grid.js` saca la rejilla mar/tierra del mapa (sirvió
para calibrar las coordenadas) y `.planning/shots.js` captura una ronda de cada.

## 10. Pendiente de la autora

1. **Crónicas 2-4 de la R3**: no son textuales del cuaderno — intercambian
   términos que sí están en el libro. La crónica 1 sí es la del cuaderno pág. 91.
   Si prefiere solo esa, R3 se queda con **una** variante y habrá que darle
   variedad de otra forma.
2. Revisión de contenido jugándolo y prueba en un dispositivo real.
