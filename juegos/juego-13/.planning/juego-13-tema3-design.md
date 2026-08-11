# Design-doc — juego-13 · Tema 3 "La diversidad cultural de la población mundial"

> Planificación aprobada por la autora en el chat (bocetos ASCII, una ronda a la vez,
> 2026-08-06). Este doc es el contrato del bloque TEMA 3 de `game-screens.jsx`.

## 1. Tema

**Tema 3 del libro: "La diversidad cultural de la población mundial"** (D.C.D.
**CS.4.2.26**), con los sellos *Cívica, ética e integridad* y *Educación socioemocional*.

- **Edad objetivo: 13 años** (los temas 1 y 2 son de 12) — decisión de la autora.
  Registro visual adulto, cero infantilismo, y **ritmo alto**: fue un pedido explícito
  ("no debe ser para nada aburrido").
- **`charId`: `domi`** — el guía del juego no cambia por tema.
- `id` del tema: **`diversidad`** (antes el placeholder `tema3`).

### Naturaleza del material (cambia el tipo de mecánica)

A diferencia de los temas 1 y 2, **este tema no tiene cuadros de datos**: es
actitudinal. Lo que se ejercita es **criterio**, no memoria de cifras. Lo aprovechable:

| Fuente | Qué aporta |
|---|---|
| pp. 125-126 *Construcción del aprendizaje* | ~14 ideas que **valoran** la diversidad |
| p. 86 actividades 1 y 2 (distractores) | ~8 ideas que la **atacan**, textuales |
| Recuadros *Mi experiencia* y pies de foto | **4 casos culturales** concretos |

**Los 4 casos culturales:** Taegeukgi 🇰🇷 (círculo Taegeuk, equilibrio entre fuerzas
opuestas, adoptada en 1883, unidad y solidaridad) · Festival de Holi 🇮🇳 (la primavera,
los colores) · pueblo Padaung 🇹🇭 · fiestas de Pimampiro 🇪🇨 (herencia de las culturas
ancestrales de América).

**Fuera del juego:** las **actividades 3 y 4 son de respuesta abierta** (conversar y
reflexionar) → no tienen respuesta única, no se gamifican.

**No se inventa contenido:** toda frase del banco sale textual del tema o de las
opciones de sus actividades.

## 2. Mecánica — 3 rondas, 3 verbos nuevos

`J13_DIV_ROUNDS` (3 rondas), orquestadas por `J13Game` con el chrome EDINUN compartido.

⚠ **Restricción dura de la autora:** ningún verbo puede repetirse de los temas 1 y 2.
Ocupados: *arrastrar a cajones* · *intercambiar* · *marcar intrusos* (T1) y *elegir
opción* · *teclear* · **unir con líneas** (T2 R3 "Sala de datos"). Por eso el
"Pasaporte cultural" (unir dos columnas), que llegó a estar aprobado como R2, **se
descartó al detectarse la colisión** y se reemplazó por la memoria.

### R1 · "El muro" — DESLIZAR CARTAS (patrón 14) · verbo: **deslizar**

- **2 cartas** por ronda, una a una (la autora las bajó de 5 a 2: con 5 la ronda se hacía larga). Cada carta trae una idea sobre la diversidad
  cultural; se arrastra a la **izquierda = LA ATACA** o a la **derecha = LA ENRIQUECE**.
- La carta **se inclina** mientras se arrastra (`rotate` proporcional al desplazamiento)
  y el rótulo del lado apuntado se enciende. Umbral: **70 px**.
- **Respaldo tap:** los dos rótulos laterales son botones — tocarlos decide igual (misma
  tradición que el respaldo tap de R1 del Tema 1).
- **Validación al soltar**, sin ¡VERIFICAR! (una ronda son 2 jugadas encadenadas): ✓
  verde o ✗ rojo al instante y la carta **queda inclinada hacia el lado que eligió el niño**
  (40 px), con el riel correcto encendido y la pastilla `Va en: LA ENRIQUECE` cuando falló
  → ve su error y la respuesta juntos. ⚠ **No se va de la pantalla**: volaba 520 px y en la
  última carta el centro quedaba vacío los ~2,4 s del cartel, y parecía colgado.
- **Los dos rótulos son rieles de 104×132 y van SIEMPRE con su color** (rojo / verde,
  opacidad 0.75-0.85). ⚠ Tres iteraciones hasta acertar: eran cajitas translúcidas que
  solo se encendían al apuntarlas (sobre el fondo verde no se distinguían); luego el rojo
  a 0.42 se veía **marrón**; y al ponerlos de alto completo quedaron como dos columnas
  enormes ("eso está horrible"). Alto fijo, a la altura de la carta.
- El contenedor lleva **`overflow:hidden`** por seguridad (antes la carta volaba 520 px en
  una zona de 470 y aterrizaba sobre REINICIAR/SALIR).
- La carta tiene **`userSelect:none`**: al arrastrarla se seleccionaba su texto en azul.
- **Reparto:** las 2 salen del MISMO banco combinado de 22 y pueden caer las dos del mismo lado — forzar "una de cada" regalaría la segunda.
- Banco: `J13_DIV_IDEAS` = 14 que valoran + 8 que atacan, con una sola clave FIFO.

### R2 · "Memoria cultural" — VOLTEAR CARTAS (patrón 10, variante memoria) · verbo: **voltear**

- **6 cartas boca abajo en rejilla 3×2**; se voltean de a dos buscando la pareja.
  ⚠ Empezó con **4 parejas y 10 intentos** y la autora la encontró demasiado difícil, con
  razón: aquí no se emparejan dos cartas iguales sino **un concepto con su explicación**
  (hay que recordar la posición Y saber el contenido) y, sin las ilustraciones, todo es
  texto. Ni juego-1 ni juego-6 ponen tope de intentos a sus memorias.
  Pareja acertada → se quedan boca arriba con ✓ y **+1 ⭐**. Pareja fallada → vuelven a
  taparse a los 900 ms.
- **Límite: 8 intentos.** Al agotarlos (o al encontrar las 3), **se destapan las
  parejas que faltaban**, cada una con **color + forma** (● ▲ ■ ◆) e "mismo color =
  pareja" al pie — invariante EDINUN de revelar la respuesta. ⚠ El primer intento ponía
  "era pareja" en todas las cartas y no dejaba ver **cuál iba con cuál**; verde y rojo no
  entran en esa paleta (son acertó/falló en todo el juego) y tampoco se usan números
  (la autora los quitó en juego-6).
- **Dos tableros que alternan** (anti-repetición 1 de 2, cap 1) y, dentro del tablero,
  **juegan 3 de sus 4 parejas**: se sortea cuál se queda fuera con su propia clave FIFO
  (1 de 4, cap 3), así no falta siempre la misma y los 4 casos del libro van saliendo.
  - **`lugar`** — cultura ↔ país: Taegeukgi/Corea del Sur · Holi/India ·
    Padaung/Tailandia · Pimampiro/Ecuador.
  - **`signif`** — cultura ↔ lo que representa: círculo Taegeuk/equilibrio entre fuerzas
    opuestas · Holi/la llegada de la primavera · Padaung/la belleza ligada al largo del
    cuello · Pimampiro/herencia de las culturas ancestrales.
- **Imágenes:** cada carta acepta `img` (ruta en `assets/`). **Hoy corre con emoji de
  placeholder**; la autora va a generar las 4 ilustraciones y entonces solo se rellena
  ese campo — el resto del componente no cambia.

  ⚠ **Regla de imagen:** no se reproducen las fotos del libro ni se generan **caras de
  personas reales** (`memory/personas-reales-sin-generar-caras.md`). Las 4 ilustraciones
  van de **elementos culturales**, no de retratos.

### R3 · "Lluvia de palabras" — ATRAPAR (patrón 13) · verbo: **atrapar**

- **10 palabras** caen por **3 carriles** (aparecen cada 1450 ms, tardan 3400 ms en
  caer): **6 que la diversidad aporta** + **4 que no**.
- ⚠ **La caída la anima CSS** (`@keyframes j13cae` + `animationDelay` por palabra), no
  React: el primer intento repintaba la posición con un `setInterval` de 50 ms = 20 fps y
  **se veía a tirones**. Ahora React solo re-renderiza cuando se toca una palabra, y un
  único `setTimeout` cierra la ronda. La keyframe vive en un `<style>` del componente y
  **no** en `styles.css`, que es del shell y obligaría a propagarlo a todos los juegos.
- Tocar una buena → ✓ y **+1 ⭐** (hasta 6). Tocar una mala → ✗ y **no resta** lo ya
  ganado. Dejar caer una mala es lo correcto.
- Al terminar, cartel de cierre con **las buenas que se escaparon** (revelado).
- Bancos: `J13_DIV_APORTA` (13 palabras) · `J13_DIV_NOAPORTA` (6), todas textuales.

### Estrellas

**+1 ⭐ por elemento**, como el resto del juego: R1 hasta 2 (cartas) · R2 hasta 3
(parejas) · R3 hasta 6 (palabras) → **máximo 11 ⭐**. `isCorrect` de la ronda (dot del
HUD y reporte) = ronda perfecta. **Fallar nunca resta.**

### Anti-repetición

FIFO en `localStorage`, una clave por ronda (regla de cap: para un subconjunto de K
sobre N, `cap < N − K`):

| Clave | Elige | Cap |
|---|---|:--:|
| `edinun_j13_t3r1_v1` | 2 de 22 | 12 |
| `edinun_j13_t3r2_v1` | 1 de 2 tableros | 1 |
| `edinun_j13_t3r2fuera_<tablero>_v1` | la pareja que NO entra, 1 de 4 | 3 |
| `edinun_j13_t3r3ap_v1` | 6 de 13 | 6 |
| `edinun_j13_t3r3no_v1` | 4 de 6 | 1 |

## 3. Layout (lienzo 900×540)

Zona central `top:60 bottom:18 left:215 right:215` (470×462). Las tres rondas corren
**sin ¡VERIFICAR!** (`verify:false`), así que la columna derecha solo lleva REINICIAR y
SALIR — el colchón con la mecánica sigue siendo de 47 px.

```
┌─ 900 × 540 ──────────────────────────────────────────────────────────────┐
│ [logo 64]              Ronda ● ○ ○  (top 52)          ⏱ tiempo   ⭐ estrellas│
│   ┌────────────── ZONA CENTRAL (x 215..685) ──────────────────────────┐  │
│   │  enunciado = QUÉ hacer                                            │  │
│   │  R1: rótulo ◀ LA ATACA · carta que se inclina · LA ENRIQUECE ▶    │  │
│   │  R2: rejilla 4×2 de cartas que voltean                            │  │
│   │  R3: 3 carriles con palabras cayendo + marcador                   │  │
│   └───────────────────────────────────────────────────────────────────┘  │
│  ╭─ bocadillo = CÓMO ─╮                                    ┌───────────┐ │
│      (Domi 186)                                            │ REINICIAR │ │
│       Domi                                                 │   SALIR   │ │
└────────────────────────────────────────────────────────────└───────────┘─┘
```

## 4. Log y reporte

`lastResult.log[i]` = `{ idx, emoji, a, userAnswer, correctAnswer, isCorrect }`.

| Ronda | `emoji` | `a` (enunciado del reporte) |
|---|---|---|
| R1 | 💬 | ¿Qué ideas enriquecen la diversidad cultural? |
| R2 | 🎴 | Memoria cultural: `<tablero>` |
| R3 | 🧺 | Atrapa lo que aporta la diversidad cultural |

## 5. Copy

- Label del botón en el Home: `La diversidad cultural` · descripción:
  `Culturas del mundo: conocerlas, valorarlas y respetarlas.`
- **Enunciado (QUÉ) / bocadillo (CÓMO)** por ronda:

| R | Enunciado | Bocadillo |
|---|---|---|
| 1 | ¿Esta idea enriquece la diversidad cultural o la ataca? | Desliza la carta / al lado correcto. |
| 2 | Encuentra la pareja: `<relación del tablero>`. | Toca dos cartas / y busca su pareja. |
| 3 | Atrapa lo que la diversidad cultural aporta. | Toca solo las que / la diversidad aporta. |

## 6. Decisiones abiertas / riesgos

- **Banco de casos culturales corto (4).** El material entregado son 3 páginas y al pie
  de la 126 se ve cortado *"Aplica tu experiencia"*: **falta el resto del tema**. Con
  más casos, la R2 gana tableros sin tocar el componente.
- **Las 4 ilustraciones de la R2 están pendientes** (las genera la autora). Mientras
  tanto corren con emoji: ☯️ Taegeukgi · 🎨 Holi · 💍 Padaung · 🎭 Pimampiro.
- **El pueblo Padaung es el caso más delicado**: el libro lo describe por el largo del
  cuello de las mujeres. Se usa la formulación del libro, sin adjetivos añadidos, y la
  ilustración debe evitar el retrato.
