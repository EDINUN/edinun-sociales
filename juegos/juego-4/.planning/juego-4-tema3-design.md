# juego-4 · Tema 3 — "Sistema educativo ecuatoriano" (design-doc)

> Estudios Sociales · Cívica/Ciudadanía · **edad 13** · guía **Andi**.
> Basado en el TEMA 8 del libro ("Sistema educativo ecuatoriano: características y
> necesidades"). Las láminas se usan para **entender** el tema, NO para copiar 1:1.

## Ubicación (decisión de la autora)

Va como **Tema 3 dentro de juego-4**, aunque los Temas 1 y 2 son de 6 años. Razón de
la autora: *"el estudiante entra al juego y según su tema de libro selecciona el
botón"* — el Home es un **menú de temas del libro** y cada estudiante va al suyo.
(Se le planteó la alternativa de un juego nuevo con tono adolescente; la descartó.)

## Tema

La educación como **derecho conquistado** (luchas sociales de 1970-1990), el
**gasto público** (mínimo constitucional del 6 % del PIB, +0,5 %/año; máximo real
5,3 % en 2014; 3,98 % en 2021), la **baja inversión por estudiante**, las
**barreras** (2 h de camino en la zona rural de Azuay, deserción en bachillerato) y
las **necesidades** (priorizar el aprendizaje sobre la burocracia, más recursos,
acompañar a docentes, adaptar el currículo).

## Estructura — 3 rondas encadenadas, mecánica distinta cada una

Pedido explícito de la autora: *"cada ronda debe tener una mecánica diferente por su
edad"*. Patrón de juego-3 · Tema 2: `Tema3Controller` monta cada ronda por turno
(`key`), acumula el log y arma el **reporte combinado**.

**Cada ronda = 1 SOLA actividad** (pedido explícito de la autora: *"es solo 1 juego,
no 3 veces, y así para todas las rondas"*). El tema completo son **3 jugadas**.
Mismo criterio que el Reto 1 de juego-3 · Tema 2 (1 pregunta). La variedad la da el
**banco + anti-repetición**, no la repetición dentro de la ronda.

| Ronda | Mecánica | Banco | Sale por partida |
|:-:|---|---|:-:|
| **1** | 🎯 **Adivina el dato** — deslizador, puntuación **EXACTA** (hay que clavar la muesca) | 6 datos | **1** |
| **2** | ⏱️ **Mitos y datos** — V/F contrarreloj (12 s); timeout = fallo | 8 afirmaciones | **1** |
| **3** | 🧩 **Completa el titular** — arrastrar palabras a los huecos, con trampas | 5 frases | **1** |

**Sin contadores inventados:** no va "Dato 1 de 3" ni "0/3" en el enunciado ni en el
HUD (la autora los rechazó: *"¿de dónde sacas eso? no te inventes"*). El enunciado
lleva sólo el **QUÉ**; el progreso lo dicen los **puntitos de ronda**. Tampoco hay
**racha** en la R2: con 1 sola pregunta no hay nada que encadenar.

Todos con **anti-repetición FIFO** en `localStorage` → al reiniciar salen otras.
Arco pedagógico: **datos → criterio → concepto**.

## Fuentes de los bancos (⚠ cero cifras inventadas)

- **R1** (`SE_DATOS`): las cifras de los párrafos del libro (3,98 % / 6 % / 0,5 % /
  5,3 % / 2014 / 2 h / 1970-1990).
- **R2** (`SE_MITOS`): las **8 afirmaciones de la actividad 3**, que ya vienen con su
  V/F resuelto en el libro.
- **R3** (`SE_FRASES`): la **actividad 1** (f1) + 4 frases armadas con las **palabras
  textuales** de "Construcción del aprendizaje" y de las actividades.

**Regla dura:** para ampliar cualquier banco hay que pedirle más datos a la autora.
Es material escolar: un dato inventado sería un error grave.

## Chrome de las 3 rondas (`SEShell`) — copiado del estándar, NO inventado

Tras una tanda de correcciones de la autora (ver `## Errores aprendidos` en el
`SKILL.md`), las 3 rondas comparten `SEShell`, que replica la matriz fija de
`references/estandar-visual.md` tal como la implementa juego-3:

- **HUD (§1):** logo 60 · pills **⏱** (`var(--ed-font-mono)` 13) y **⭐** (`app.stars`),
  con `background rgba(0,0,0,0.35)`, `padding "6px 12px"`, `border 1px solid rgba(242,194,96,0.4)`.
- **Chips de tema** en `top:14` · **Ronda** en `top:52` (`ed-label` 11 + dots **11×11**).
- **Banda central (§4):** `top:78 bottom:22 left/right:215` con **`space-evenly`** y
  **el enunciado DENTRO** como primer hijo. (Con el enunciado fuera y pocos elementos
  quedaba un hueco enorme: *"la primera ronda está horrible, tiene full espacio vacío"*.)
- **Bocadillo (§2):** `maxWidth 210` y **cortado con `<br />`** — si no, se estira y se
  monta sobre la tarjeta de la mecánica.
- **Acciones (§3):** `right:18`, `width:150`. Con ¡VERIFICAR! → variante B (56/16 + 48/14);
  sin botón primario (R2) → variante A (56/15).
- **`overlay`**: capa hija del root para lo que se posiciona en coords del LIENZO
  (la palabra que se arrastra en la R3); dentro de la banda quedaría desplazada 215/78.

**Sin imágenes** (decisión de la autora tras evaluarlas). **Sin contadores** ("Dato 1 de
3", "0/3") ni **racha**: eran invenciones. **Sin botón SIGUIENTE**: el avance entre
rondas es **automático** (§6) tras el reveal (~3,2 s).

## Invariantes cuidadas

- **Enunciado = QUÉ · bocadillo = CÓMO** (ver `memory/aprendizajes-de-diseno.md` §11).
- Cada pregunta de la R1 se entiende **sola** (el banco se baraja: no puede decir
  "ese máximo…" porque puede salir primera).
- Al fallar se revela lo correcto **sin ocultar** lo que eligió el estudiante.
- Completar el tema cuenta como éxito; fallar no baja lo ganado.
- Salir/reiniciar con modal; cartel ¡EXCELENTE!/¡UPS! antes del reporte.

## Reporte

`cols: ["Actividad", "Tu respuesta"]`, `themeEmoji: "🎓"`,
`praise: "¡ahora conoces el sistema educativo que te toca defender!"`.
Entradas: 3 (R1) + 5 (R2) + n huecos (R3). Estrellas = aciertos.

## Descartado

- **"Ministro/a de Educación por un día"** (simulación de presupuesto con indicadores
  Acceso/Calidad/Permanencia). Era la propuesta más "juego"; la autora eligió otras
  mecánicas para las 3 rondas. Queda documentada por si se retoma.
- **"Une con flechas"** (actividad 5): el libro dice *"ninguna respuesta es
  equivocada, es nuestro punto de vista personal"* → sin correcto/incorrecto no hay
  ✓/✗, ni estrellas, ni reporte. Incompatible con el formato EDINUN.
