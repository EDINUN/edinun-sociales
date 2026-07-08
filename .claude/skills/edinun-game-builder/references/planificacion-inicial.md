# Referencia — Planificación inicial (design-doc primero)

**Regla de oro (heredada de los repos de matemáticas y lengua):** antes de tocar
código, se escribe un **documento de diseño** en
`juegos/<slug>/.planning/<slug>-design.md`. Ese doc es "la planificación inicial
que se ve al inicio de todo el juego": obliga a decidir tema, mecánica, layout y
copy ANTES de programar, y sirve de contrato para el `game-screens.jsx`.

Flujo completo: **planear → aprobar → clonar → implementar → empaquetar → landing → QA.**

---

## 0. Confirmar con la autora (antes de escribir el design-doc)

- **Tema** y a qué parte del currículo/libro de EESS mapea.
- **Edad objetivo** (EESS: familia/comunidad/oficios → 6-8; geografía/historia/
  ciudadanía → 9-12; registrar luego en `memory/audiencia_por_juego.md`).
- **Mecánica / gamificación** — elegir de `references/mechanics-design.md` o
  **inventar una nueva** sobre el mismo shell (proponerla ahí).
- **Personaje guía** (`charId`: domi / sisa / yaku / andi).

## 1. Escribir el design-doc y pedir OK

Crear `juegos/<slug>/.planning/<slug>-design.md` con **estas secciones fijas**
(máx ~200 líneas; ver ejemplos en los repos math/lengua):

1. **Tema** — qué enseña, currículo, edad, resumen en 3-4 líneas. `charId:`.
2. **Niveles** — ¿1 nivel único o varios? Si varios: tabla `id | label chip |
   glifo | banco | catLabel`, y cómo se elige en runtime (Home → `app.level` →
   CharacterScreen → `currentCategory/currentCatLabel` → GameScreen). Si es
   nivel único, ocultar chips de Home y tabs del HUD (pill estática con catLabel).
3. **Mecánica** — **patrón base** de `mechanics-design.md` (o "patrón nuevo:
   …") + detalle: qué toca/arrastra/ordena el niño, si hay botón VERIFICAR
   explícito o validación al tocar, cuántas rondas, cómo se genera cada ejercicio,
   anti-repetición (`RECENT_KEY` / FIFO en localStorage).
4. **Layout (lienzo 900×540)** — **diagrama ASCII** de las zonas + mapeo
   `zona → elemento` con coordenadas aproximadas. Zonas EDINUN estándar:
   - HUD (logo izq · RONDA+dots o pill catLabel centro · ⏱+⭐ der): `0..900 × 0..60`
   - Personaje guía + bocadillo: margen izquierdo `~0..230 × 280..530`
   - Zona central (cartel/rejilla/casillas): `~260..720`
   - Acciones (VERIFICAR/REINICIAR/SALIR, columna): margen derecho `~740..888`
   - Bandeja de fichas (si aplica): inferior centrada
5. **Log y reporte** — mapeo de `lastResult.log[i]` (`idx, emoji, a` [enunciado],
   `userAnswer, correctAnswer, isCorrect, time`) y si el reporte renombra columnas
   (ej. "Coordenadas" en vez de "Pregunta"). Subtítulo del reporte:
   "Reporte académico · Estudios Sociales".
6. **Glifos del fondo** — símbolos `cosmic` (home/character/results, ~15) y
   `chalkboard` (game, ~10) afines al tema (ej. 🧭 🗺️ ⭐ ▲ ⏳ 🤝).
7. **Copy específico** — TODOS los textos visibles: hero de Home, label de chips,
   descripción, label de CharacterScreen, **enunciado** (QUÉ hacer, termina en
   punto) y **bocadillo** (CÓMO hacerlo) por nivel, catLabel, frase de cierre.
8. **Decisiones abiertas / riesgos** — tamaños en mobile, pools finitos,
   distractores, compatibilidad de emojis, etc.

**Pedir OK del design-doc antes de codear.** Es más barato corregir el plan que el código.

---

## Estándares de shell EDINUN (inamovibles — desviarse requiere preguntar)

Destilados de los repos math/lengua. Valen para CUALQUIER mecánica:

1. **Lienzo lógico fijo 900×540**, centrado con `translate(-50%,-50%) scale()`
   (NUNCA `place-items:center` — rompe el mobile portrait).
2. **3–4 rondas por sesión.** Desde 7 años, se permite (y gusta) **cada ronda
   con una mecánica distinta**. Fallar **no** baja el progreso ya ganado.
3. **Enunciado = QUÉ hacer** (la tarea, termina en punto); **bocadillo del
   personaje = CÓMO hacerlo** (la pista/mecánica). Nunca usar solo el título
   como enunciado.
4. **Al fallar: revelar la correcta** (verde + ✓) dejando ver lo que eligió el
   niño (rojo). En mecánicas tipo quiz, avanzar automático para no dejarlo atascado.
5. **Salir / Reiniciar SIEMPRE con modal** de confirmación (portal a `body`).
6. **HUD**: logo izq; RONDA con dots (o pill catLabel si nivel único) centro;
   ⏱ + ⭐ der. Nada se tapa.
7. **Anti-repetición**: buffer FIFO en `localStorage` por categoría, tamaño
   ≈ `Math.floor(N/2)`; recargar o cambiar de niño NO repite ejercicios.
8. **Estrellas**: modelo simple (+1 ⭐ por acierto, el de la `_PLANTILLA`) o
   modelo por tiempo (`max(1, 10 - floor(exSec/3))`, el de math). Elegir en el
   design-doc; declararlo en `game-rules.md` si se usa el de tiempo.
9. **Vocabulario ecuatoriano**; sin regionalismos MX/ES/CO. Copy corto, sin jerga.
10. **No mostrar nombres de trabajo internos** (de comentarios) como rótulos.
    Confirmar antes de añadir texto visible nuevo.
11. **Contrato del shell** (obligatorio en `game-screens.jsx`):
    - `GameScreen({app,setApp,go})` → al terminar `incrementGamesCompleted()` + `go("results")`.
    - `ResultsScreen({app,setApp,go})` con reporte imprimible.
    - `Object.assign(window, { GameScreen, ResultsScreen })` al final.
    - `markFirstAttempt()` en la PRIMERA respuesta del niño.
    - **Ningún `</script>` literal** en los `.jsx` (partir el token si hace falta).

---

## Después del design-doc

Seguir `references/crear-juego.md` (clonar la `_PLANTILLA` — que ya trae el
formato EDINUN completo —, implementar la mecánica, personalizar `screens.jsx`,
docs, `bundle.ps1`, landing, QA). Guardar `game-rules.md` en `.planning/` si la
mecánica cambia rondas/estrellas/accuracy respecto al default.
