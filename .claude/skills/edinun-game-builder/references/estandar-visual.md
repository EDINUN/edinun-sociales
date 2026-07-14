# Estándar visual — matriz de posicionamiento (capa fija)

> **Normativo.** Estos son los valores **exactos** implementados en
> `juegos/_PLANTILLA/` (la fuente canónica) y verificados en juego-1..4
> (medición con Playwright, 2026-07). La `_PLANTILLA` YA los cumple: si clonas
> desde ella y no tocas lo que aquí se lista, el juego queda "igual" a los
> demás. **Desviarse de un valor fijo requiere preguntarle a la autora.**
>
> Las coordenadas aproximadas de `planificacion-inicial.md` §4 son para el
> boceto del plan; **este archivo manda para los valores reales.**

Lienzo lógico fijo **900×540**, centrado con `translate(-50%,-50%) scale()`.

---

## 0. Pantalla de inicio (Home) — botones de tema/nivel

Layout: 2 columnas `gridTemplateColumns: "1fr 1.15fr"`, `padding: "34px 52px"`,
`gap: 34`. Izquierda `<EdinunLogo size={300} />` (el de la `_PLANTILLA`;
juego-3 y juego-4 estaban en 280 por error); derecha: hero
(`EDINUN · <tema>` + h1 `¡Bienvenido/a, Estudiante!`), label
`Elige un tema para jugar`, **botones de tema**, pill de descripción del tema,
`Escribe tu nombre y entra` + input `ed-input` + botón `ENTRAR →`
(`ed-btn-primary`, `height: 50, padding: "0 26px", fontSize: 15`). Pill de
visitas abajo-derecha.

### Rejilla de botones SEGÚN el número de temas (¡esto es fijo!)

| Nº temas | `gridTemplateColumns` | `gap` |
|---|---|---|
| 1 (nivel único) | **sin botones** — solo nombre + ENTRAR; el catLabel va como pill estática en el HUD del juego | — |
| 2 | `"1fr 1fr"` | 12 |
| 3 | `"1fr 1fr 1fr"` | 10 |
| 4 | `"1fr 1fr 1fr 1fr"` | 8 |

> ⚠️ Error real cometido: juego-4 (3 temas) usaba `"1fr 1fr"` → los 3 botones
> quedaban 2 arriba + 1 abajo. Con 3 temas SIEMPRE van los 3 en una fila.

### Estilo del botón (COMPACTO — igual para cualquier nº de temas)

```jsx
padding: "14px 6px", minHeight: 60, borderRadius: 16,
fontFamily: "var(--ed-font-display)", fontWeight: 800,
fontSize: 15, letterSpacing: "0.02em", lineHeight: 1.1, textAlign: "center",
```

> ⚠️ Error real cometido: juego-3 y juego-4 usaban `fontSize: 22,
> padding: "20px 12px"` (botones sobredimensionados). El estándar del
> ecosistema (lengua) es `fontSize: 15, padding: "14px 6px"`. **No agrandar los
> botones por juego.**

### Gradientes por POSICIÓN (byte a byte, del estándar EDINUN)

| Posición | `grad` | `ink` |
|---|---|---|
| 1º | `linear-gradient(180deg, #ffc06e, #e4881a)` (naranja) | `#3a2608` |
| 2º | `linear-gradient(180deg, #ffe97a, #d7b12a)` (amarillo) | `#3a2608` |
| 3º | `linear-gradient(180deg, #7ab8ff, #2773d8)` (azul) | `#08264d` |
| 4º | `linear-gradient(180deg, #b48aff, #6f3fe0)` (violeta) | `#1a0a3d` |

Botón activo: `boxShadow` con anillo blanco `0 0 0 3px rgba(255,255,255,0.85)` +
`transform: translateY(-2px)`. Tema deshabilitado ("Próximamente"):
`opacity: 0.72, filter: "grayscale(0.15)", cursor: "not-allowed"`.

---

## 1. HUD superior (fijo)

```jsx
<div style={{ position: "absolute", top: 10, left: 16, right: 16,
  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
```

- **Izquierda**: `<EdinunLogoMini size={60} />`.
- **Derecha** (grupo `gap: 8`): pill ⏱ (`fontFamily var(--ed-font-mono), fontSize 13`) y pill ⭐ (`var(--ed-font-display), fontWeight 600`). Ambas: `background rgba(0,0,0,0.35), borderRadius 999, padding "6px 12px", border 1px solid rgba(242,194,96,0.4), color #fce9a8`.
- **Centro** — según nº de niveles:
  - **1 nivel con rondas**: indicador RONDA en bloque propio (§1.1).
  - **Varios niveles**: tabs de nivel en pill centrada (`top: 14`), colores por nivel.

### 1.1 Indicador de RONDA (juegos de 1 nivel con rondas)

```jsx
<div style={{ position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)",
  display: "flex", alignItems: "center", gap: 8 }}>
  <span className="ed-label" style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, letterSpacing: "0.06em" }}>Ronda</span>
  {/* dots 11×11: done→(#fce9a8 acierto / #ff6b6b fallo), actual→rgba(255,255,255,0.6), pendiente→rgba(255,255,255,0.2); boxShadow "0 0 8px currentColor" al completar */}
</div>
```

- La **etiqueta** puede cambiar a la unidad de progreso del juego cuando "Ronda"
  no aplica (p. ej. juego-1 memory usa **"Parejas"** con dots por pareja
  encontrada). Mantener SIEMPRE `top: 20`, `ed-label fontSize 11`, dots `11×11`.
- Si el juego **no tiene rondas discretas** (p. ej. juego-2, ruta única con
  temporizador), el centro del HUD queda vacío: **no inventar dots**.

---

## 2. Personaje guía + bocadillo (fijo — grupo izquierdo)

```jsx
<div style={{ position: "absolute", left: 8, bottom: 78, width: 220, pointerEvents: "none", textAlign: "center" }}>
```

Dentro, en orden:
1. **Bocadillo** (pista de CÓMO): grupo `className="ed-float-soft"` posicionado
   `bottom: "100%"` (sobre la cabeza). Cuerpo: `maxWidth 210`,
   `background linear-gradient(180deg, rgba(20,12,55,0.95), rgba(10,6,35,0.95))`,
   `border 1.5px solid rgba(242,194,96,0.65)`, `borderRadius 16`,
   `padding "10px 14px"`, `var(--ed-font-display) fontWeight 700 fontSize 14
   lineHeight 1.3 color #fce9a8`, pico triángulo `9/9/10px` en `bottom: -10`.
2. **Sombra** elíptica `140×16`, `blur(5px)`, `bottom: 14`.
3. **Personaje**: `<char.Component size={186} floating />`.
4. **Nombre**: `marginTop -2, var(--ed-font-display) fontWeight 700 fontSize 14,
   color #fce9a8, letterSpacing 0.04em`.

---

## 3. Acciones (fijo — columna derecha, `top: 50%` centrada vertical)

Tres variantes según la mecánica. Botones: `var(--ed-btn)` con
`fontWeight 800, letterSpacing "0.04em"`.

| Variante | Contenedor | Botones |
|---|---|---|
| **A. Tap (2 botones)** — juego-1, juego-2, _PLANTILLA | `right: 18, width: 150, gap: 12` | REINICIAR (`ed-btn-restart`) + SALIR (`ed-btn-ghost`), `height 56, fontSize 15` |
| **B. Arrastrar + VERIFICAR (3 botones)** — juego-3 | `right: 18, width: 150, gap: 12` | ¡VERIFICAR! (`ed-btn-verify`) `height 56 fontSize 16`; REINICIAR + SALIR `height 48 fontSize 14` |
| **C. Mecánica ancha (3 botones, columna angosta)** — juego-4 | `right: 12, width: 122, gap: 10` | igual que B pero columna angosta | 

**Regla**: usar A o B por defecto (`right: 18, width: 150`). La variante **C solo
está justificada** cuando el contenido central llega más a la derecha de x≈732 y
la columna de 150 lo taparía (caso juego-4: sus casillas llegan a x≈748).
Verificar con el QA visual que no haya solape antes de elegir C.

`ed-btn-restart` (botón REINICIAR morado) está definido en `styles.css` — no
redefinirlo inline.

---

## 4. Zona central (capa creativa — dentro de estos márgenes)

El contenido de la mecánica vive centrado entre el personaje (izq) y las
acciones (der). Dos encuadres usados:

- **Tap/opciones** (_PLANTILLA, juego-1): `top: 60, bottom: 18, left: 215, right: 215`,
  flex column `space-evenly`. Enunciado `var(--ed-font-display) fontWeight 700
  fontSize 19–23 color #fff` (QUÉ hacer, termina en punto), luego el cartel/rejilla/opciones.
- **Arrastrar** (juego-3, juego-4): banda de enunciado `left: 150, right: 150,
  top: 44–46` + mecánica en posiciones absolutas. Mantener el contenido dentro
  de x≈150..750 (o justificar la variante C de acciones).

Libertad total en QUÉ va aquí; lo fijo es que respete los márgenes del personaje
y las acciones.

### La mecánica se centra en el EJE X DEL LIENZO (x=450), no en la zona de juego

El enunciado ya va simétrico (`left: 150, right: 150` → centro 450). Las
casillas / rejilla / cartas / opciones **deben compartir ese mismo centro
(x=450)**, no el centro de la "zona de juego" entre el personaje y las acciones
(~500). Si la mecánica usa coordenadas absolutas, sus posiciones deben ser
simétricas respecto a 450 (p. ej. 3 columnas en `[280, 450, 620]`, no
`[330, 500, 670]`). Si al centrar el personaje estorba a la izquierda, córrelo
—el juego se centra en 450—; y como centrar libera la derecha, se suele poder
usar la columna de acciones estándar (`right: 18`) en vez de la angosta.

> ⚠️ Error real cometido: en juego-4 el enunciado iba en 450 pero las casillas
> en 500 (`SLOT_CX = [330, 500, 670]`) → el bloque se veía corrido a la derecha
> de la línea de centro. Se corrigió a `[280, 450, 620]`.

### Colchón mínimo entre la mecánica y las acciones (≥ 30px) — REGLA CRÍTICA

El elemento más a la derecha de la mecánica **—incluido su CONTENEDOR div
(tablero, panel, rejilla), no solo imágenes o botones—** debe terminar al menos
**~30px antes** del borde izquierdo de la columna de acciones (x≈732 en la
variante estándar de 150px, x≈766 en la angosta). Si la mecánica es más ancha:
achícala —escala el contenedor con `transform: "scale(k)"` + `transformOrigin`,
o reduce su tamaño— o córrela a la izquierda. **Nunca dejar que la mecánica
toque los botones.**

> ⚠️ Errores reales cometidos: en juego-1 el tablero de cartas terminaba en
> x≈730 (pegado a los botones en 732) → se achicó la carta y se corrió el
> tablero (colchón 36px). En juego-2 el panel del mapa (`width: 494` desde
> `left: 236` → x=730) tocaba los botones → se escaló el tablero a `0.92`
> (colchón 42px). **El QA visual debe medir divs contenedores, no solo
> imágenes/botones**, o este defecto pasa desapercibido (así se me escapó).

---

## 5. ResultsScreen (fija — no personalizar por juego salvo el contenido de `lastResult`)

- Botón volver: `top: 14, left: 24` — `← VOLVER AL INICIO` (`ed-btn-ghost`).
- Grid: `inset: "70px 32px 20px 32px", gridTemplateColumns: "0.85fr 1.4fr", gap: 24`.
- **Izquierda**: título `¡Ronda completa!` (o `Sesión terminada`) `fontSize 34`
  degradado `#fce9a8→#d9a441`; `<char.Component size={176} />`; frase de cierre
  `fontSize 13 maxWidth 240` con atribución al personaje.
- **Derecha**: `ed-card` con reporte — `EdinunLogoMini size={52}`, encabezado
  "EDINUN — Ediciones Nacionales Unidas" + "Reporte académico · Estudios
  Sociales", tabla de la sesión, 4 celdas resumen (Preguntas / Correctas /
  Estrellas / Precisión), botones IMPRIMIR REPORTE + JUGAR OTRA RONDA (`height 44`).
- `PrintableReport` (portal, `aria-hidden`, solo `@media print`).

---

## 6. Invariantes de gamificación (fijos)

- **3–4 rondas por sesión** (la _PLANTILLA usa 4). Desde 7 años se permite mecánica distinta por ronda.
- **Estrellas**: modelo simple `+1 ⭐ por acierto` (el de sociales) o por tiempo `max(1, 10 - floor(exSec/3))`; elegir en el design-doc.
- **Fallar NO baja** el progreso ya ganado; completar el objetivo cuenta como éxito aunque haya errores.
- **Al fallar, revelar la correcta** (verde + ✓) dejando ver lo que eligió el niño (rojo); en quiz, avanzar automático.
- **Salir / Reiniciar SIEMPRE con modal** (portal a `body`).
- **Contrato del shell**: `markFirstAttempt()` en la 1ª respuesta;
  `incrementGamesCompleted()` + `go("results")` al terminar;
  `Object.assign(window, { GameScreen, ResultsScreen })`; ningún `</script>` literal.
- **Anti-repetición** FIFO en `localStorage` por categoría (`RECENT_KEY`), tamaño ≈ `Math.floor(N/2)`.
- **Vocabulario ecuatoriano**, copy corto sin jerga; nunca rótulos con nombres de trabajo internos.

---

## 7. Cómo validar que un juego "queda igual" (checklist)

> **Antes de entregar CUALQUIER juego, correr estos dos scripts** (desde la raíz
> del repo) y que ambos pasen — así no hay que revisar a ojo cada valor:
> ```
> node juegos/_PLANTILLA/.planning/format-lint.js <slug>   # valores fijos (logo, botones, personaje, acciones, Results)
> node juegos/_PLANTILLA/.planning/qa-visual.js  <slug>    # layout real: overflow + colchón mecánica↔acciones
> ```

0. **`format-lint.js`** en verde: logo Home = 300, mini-logos 60/64, rejilla de
   botones según nº de temas, botón compacto (fontSize 15), personaje (bottom 78 /
   char 186), acciones (right 18/12), ResultsScreen (inset / grid / char 176 / título 34).
1. Shell idéntico: `app.jsx`, `characters.jsx`, `logo.jsx`, `styles.css` con el
   mismo hash que `_PLANTILLA` (cero drift). El elenco es domi/sisa/yaku/andi.
2. HUD, personaje/bocadillo, acciones y ResultsScreen con los valores de §1–§5
   (o la variante justificada de §3).
3. Invariantes de §6 presentes en `game-screens.jsx`.
4. QA visual: `_PLANTILLA/.planning/qa-visual.js` (o el flujo de `USER.md`) en
   los 6 viewports — sin overflow del lienzo, sin solapes, personaje/acciones sin
   chocar con la mecánica.
5. Home según §0: rejilla correcta para el nº de temas, botón compacto
   (`fontSize 15`), gradientes por posición.
6. Colchón mecánica ↔ acciones ≥ 30px (§4).

---

## 8. Juego multi-botón = mecánicas DISTINTAS (una por botón)

**N botones de tema en el Home ⇒ N mini-juegos, uno por botón.** El patrón de
referencia es `edinun-language/juego-2`: `GameScreen` despacha por
`app.currentCategory` a sub-componentes SEPARADOS y completos
(`LetraRGame` / `NoticiaGame` / `BlogGame`), cada uno con su propia mecánica:

```jsx
function GameScreen({ app, setApp, go }) {
  const cat = app.currentCategory || "<tema1>";
  if (cat === "<tema2>") return <Tema2Game ... />;
  if (cat === "<tema3>") return <Tema3Game ... />;
  return <Tema1Game ... />;   // por defecto
}
```

- Las mecánicas deben ser **DISTINTAS entre sí** (ordenar / clasificar / elegir /
  emparejar / atrapar…), no la misma repetida. A 6 años se permite repetir, pero
  variar es lo ideal y lo esperado en este ecosistema.
- **Nunca publicar botones "Próximamente" (`enabled:false`) como estado final**
  sin acordarlo con la autora: un juego de N botones se entrega con las N
  mecánicas hechas.

> ⚠️ Error real cometido: en juego-4 se propuso repetir la MISMA mecánica
> ORDENAR en los 3 temas y se dejaron 2 como "Próximamente". Lo correcto es
> 3 mecánicas distintas (como lengua juego-2), cada una completa.
