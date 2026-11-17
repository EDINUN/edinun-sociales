# juego-15 — "Rumbo a la independencia" · design-doc

## 1. Tema

**El proceso de independencia en Sudamérica** (Tema 3 del libro, D.C.D. CS.4.1.36).
Cubre 1804-1825: los primeros movimientos de resistencia (1808), el primer grito
de independencia de Quito (1809), la campaña de Bolívar, la de San Martín, la
independencia de Brasil, la del sur de Sudamérica y el cierre con Ayacucho (1824)
y la República de Bolívar (1825).

- **Edad objetivo:** 13 años. Registro visual adulto (mapas, partes de campaña,
  cronología); nada de 3D infantil ni estrellitas decorativas.
- **charId:** `sisa` (ciclo del ordinal: 15 mod 4 = 3 → Sisa).
- **Fuente:** textual de las páginas del libro que entregó la autora. Cero datos
  inventados.

## 2. Niveles

**Nivel único**, 3 rondas encadenadas (`SOC_ROUNDS`, como juego-8).
Sin botones de tema en el Home y sin pastillas en el HUD → el bloque **Ronda va
en `top: 52`** (§1.1 del estándar). `catLabel` = "El proceso de independencia en Sudamérica" (título completo del tema).

## 3. Mecánica — 3 verbos distintos

| R | Nombre interno | Patrón base | Validación |
|:-:|---|---|---|
| 1 | La ruta libertadora | 7 / 11 (marcar en mapa) — **variante nueva: mapa SVG por territorios** | ¡VERIFICAR! |
| 2 | El despacho sin firma | **patrón nuevo: deducción con pistas destapables** | ¡VERIFICAR! |
| 3 | El candado del archivo | **patrón nuevo: descifrar (escape room)** | ¡VERIFICAR! |

### R1 · La ruta libertadora
Mapa SVG con los **contornos reales** de Natural Earth (dominio público),
10 territorios tocables **y rotulados siempre** (identificar países en un mapa mudo no es la lección: la lección es el
hecho histórico, y la respuesta tiene que poder salir de la pantalla). Un cartel
enuncia un hecho sin nombrar el país actual; el niño toca el territorio y verifica. Al acertar, el territorio se
pinta y se dibuja una **flecha de avance** desde el punto de partida de esa
campaña hasta el territorio (no se dibuja si coinciden).
Al fallar: queda marcado en rojo lo que tocó **y** se enciende en verde el correcto.
Banco de 9 hechos · `RECENT_KEY = edinun_juego15_r1_v1`, pick 1, cap 8.

### R2 · El despacho sin firma
Un parte de campaña sin firma + **3 pistas tapadas** (se destapan tocándolas) +
4 tarjetas de protagonista (la correcta y 3 distractores del elenco real).
Se puede acertar sin destapar ninguna. VERIFICAR revela.
Las tarjetas usan `assets/indep-*.png` (escenas de época, **sin rostros**); si la
imagen no está, cae a un sello decorativo y el nombre, que es lo que identifica.
Banco de 8 partes · `RECENT_KEY = edinun_juego15_r2_v1`, pick 1, cap 7.

### R3 · El candado del archivo
Tres documentos siempre visibles que, cruzados, dan un año. El niño lo compone
girando las dos últimas ruedas de un candado (1 y 8 fijos) y toca ¡VERIFICAR!:
acierto → el candado se abre y aparece la pintura del hecho; fallo → sigue cerrado
y se revela el año correcto en grande. Banco de 10 casos (uno por hecho) ·
`RECENT_KEY = edinun_juego15_r3c_v1`, pick 1, cap 9.

**Invariantes:** fallar no baja el progreso ya ganado · al fallar se revela la
correcta en el lenguaje de la mecánica · salir/reiniciar con modal · +1 ⭐ por
acierto · avance automático entre rondas (único botón primario: ¡VERIFICAR!).

**Nada de juicio antes de ¡VERIFICAR!:** ni verde ni rojo hasta verificar (lo
elegido va en azul = ya respondido); **todo lo colocado se puede quitar** (en R3,
tocar una ficha ya puesta la saca y la deja en la mano, con el aviso visible de
cómo hacerlo); y al revelar, **la correcta grita** — halo verde en R1/R2 y panel
"VAN ASÍ" grande bajo la cinta en R3.

## 4. Layout (900×540)

```
┌───────────────────────────────────────────────────────────── 900×540 ┐
│ logo 64                     Ronda ● ● ●                  ⏱   ⭐      │ HUD 0..60
│                                                                      │
│            ╔═════════ enunciado (QUÉ) ═════════╗        ┌─────────┐  │
│  bocadillo ║                                   ║        │¡VERIFICAR│ │
│   (CÓMO)   ╚═══════════════════════════════════╝        └─────────┘  │
│   ╭────╮   ┌──── zona central 215..685 ────┐            ┌─────────┐  │
│   │SISA│   │  R1 mapa SVG · R2 parte+      │            │REINICIAR│  │
│   ╰────╯   │  pistas+retratos · R3 cinta   │            └─────────┘  │
│   nombre   └───────────────────────────────┘            ┌─────────┐  │
│                                                         │  SALIR  │  │
└──────────────────────────────────────────────────────────────────────┘
```

Zona central `top: 60, bottom: 18, left: 215, right: 215` (encuadre tap de la
plantilla). Acciones variante **B** (`right: 18, width: 150`). Todo centrado en
el eje x=450 del lienzo. Colchón mecánica↔acciones ≥ 30px (verificado con
`qa-visual.js`).

## 5. Log y reporte

`lastResult.log[i]` = `{ idx, emoji, a, userAnswer, correctAnswer, isCorrect }`.

| R | emoji | `a` (pregunta del reporte) | userAnswer / correctAnswer |
|:-:|:--:|---|---|
| 1 | 🗺️ | "¿Dónde ocurrió: <hecho>?" | nombre del territorio |
| 2 | 📜 | "¿Quién envió el parte del <fecha>?" | nombre del protagonista |
| 3 | 🕰️ | "¿En qué año ocurrió cada hecho?" | `hecho=año, …` |

Subtítulo del reporte: "Reporte académico · Estudios Sociales" (sin cambios).

## 6. Glifos del fondo

- `chalkboard` (juego): ✦ ⚑ ⚔︎ ⚓︎ ★ ▲ ⌖ ✧ ⊙ ✶ — monocromo, baja opacidad.
- `cosmic` (home/character/results): el set estándar del shell.

## 7. Copy

- Hero Home: `EDINUN · Estudios Sociales` + `¡Bienvenido/a, Estudiante!`
- Subtítulo: `El proceso de independencia en Sudamérica`
- catLabel: `El proceso de independencia en Sudamérica`
- R1 — enunciado: `Ubica en el mapa el territorio de este hecho.` · bocadillo: `Toca el país<br />en el mapa.`
- R2 — enunciado: `Descubre quién dijo esto.` · bocadillo: `Toca una pista<br />si la necesitas.`
- R3 — enunciado: `Descubre el año y abre el candado.` · bocadillo: `Gira las ruedas<br />y abre el candado.`
- Cierre (Results): frase atribuida a Sisa.

## 8. Riesgos / decisiones abiertas

- **Imágenes de R2:** se pidieron escenas de época sin rostros (regla: no generar
  caras de personas reales). Si la autora entrega los retratos del libro, se
  sustituyen. El juego funciona sin ellas (fallback a sello + nombre).
- **Mapa SVG:** resuelto con datos reales de Natural Earth (2026-11-16). No volver
  a dibujarlo a mano.
- **Ronda 1 sin línea acumulada:** una ronda = una jugada, así que en vez de la
  "ruta que se va uniendo" se dibuja la **flecha de avance** de esa campaña.
- Ancho útil 470 px: la cinta de R3 usa casillas de 80 px con gap 12.
