---
name: edinun-game-builder
description: >-
  Diseña, inventa y orquesta juegos del repo edinun-sociales (Estudios Sociales):
  crear un juego nuevo con una GAMIFICACIÓN elegida o inventada, siguiendo la
  planificación inicial (design-doc primero) y la biblioteca de mecánicas; editar
  el shell compartido (app/characters/logo/styles/assets) propagándolo a todos los
  juegos; y regenerar el landing. Úsala siempre que se cree/diseñe un juego nuevo
  (aunque sea una mecánica inédita), cuando la tarea toque MÁS de un juego o el
  shell común, o cuando se cree/renombre/elimine un juego. Para editar la mecánica
  de UN solo juego ya existente, no hace falta esta skill.
---

# edinun-game-builder

Skill de orquestación para `edinun-sociales`. Garantiza tres cosas que es fácil
romper trabajando juego por juego:

1. **El shell se mantiene idéntico** entre todos los juegos (`app.jsx`,
   `characters.jsx`, `logo.jsx`, `styles.css`, `assets/`).
2. **El landing (`index.html` raíz) refleja** los juegos reales de `juegos/`.
3. **Se aprueba antes de propagar** cambios que tocan varios juegos.

Lee primero el `CLAUDE.md` raíz (convenciones, contrato del shell, contador) y el
`USER.md` de la `_PLANTILLA` (preferencias e invariantes de diseño).

## Regla de aprobación previa

Antes de un cambio que toque más de un juego o el shell:

1. **Listar el impacto**: qué archivos y qué slugs de `juegos/` se modificarán.
2. **Esperar OK del usuario.**
3. Recién entonces aplicar y re-empaquetar.

Nunca propagar en silencio. Nunca añadir texto visible nuevo a la UI (rótulos,
títulos de ronda) sin confirmar — los nombres internos de los comentarios no son
para el niño (ver `memory/aprendizajes-de-diseno.md`).

## Tarea A — Diseñar y crear un juego nuevo (planificación primero)

La `_PLANTILLA` ya trae el **formato EDINUN completo** ("Mira y toca"). Un juego
nuevo hereda ese shell y aporta su propia **gamificación** — una de la biblioteca
`references/mechanics-design.md` o **una inventada** sobre el mismo lienzo 900×540.

Flujo: **planear → aprobar → clonar → implementar → empaquetar → landing → QA.**

1. **Confirmar** con la autora: tema/currículo, **edad objetivo**, mecánica
   (elegida o inventada) y personaje guía (`charId`).
2. **Planificación inicial (design-doc primero)** — escribir
   `juegos/<slug>/.planning/<slug>-design.md` (Tema · Niveles · Mecánica · Layout
   ASCII 900×540 · Log/Reporte · Glifos · Copy · Riesgos) y **pedir OK**. Ver
   `references/planificacion-inicial.md` y `references/mechanics-design.md`.
3. **Clonar** `juegos/_PLANTILLA/` → `juegos/juego-N/` (slug kebab-case, coincide
   byte a byte con la entrada del landing) y limpiar lo específico del origen.
4. **Implementar** la mecánica en `game-screens.jsx` respetando el contrato del
   shell, los estándares inamovibles (`planificacion-inicial.md`) y la **matriz
   de posicionamiento exacta** de `references/estandar-visual.md` (HUD,
   personaje/bocadillo, acciones, ResultsScreen — no tocar los valores fijos).
   Personalizar los textos `// ← PERSONALIZAR` de `screens.jsx`.
5. Rellenar `CLAUDE.md`, `MEMORY.md` del juego y registrar la edad en
   `memory/audiencia_por_juego.md`. Guardar `game-rules.md` si cambió rondas/estrellas.
6. Re-empaquetar (`bundle.js` con Node, o `bundle.ps1` / `bundle.py`) —
   verificar ambos HTML idénticos y sin `</script>` literal.
7. Registrar el juego en el array `GAMES` del landing (Tarea C).
8. **Verificación automática antes de entregar** (ambos deben pasar; ver
   `references/estandar-visual.md` §7):
   - `node juegos/_PLANTILLA/.planning/format-lint.js <slug>` — valores fijos
     (logo 300, botones, personaje, acciones, ResultsScreen).
   - `node juegos/_PLANTILLA/.planning/qa-visual.js <slug>` — layout real en los
     6 viewports: sin overflow y colchón mecánica↔acciones ≥ 30px (variante
     angosta justificada permitida).

Detalle completo en `references/crear-juego.md`.

## Tarea B — Editar el shell (propaga a TODOS los juegos)

Ver `references/editar-shell-y-landing.md`. Resumen:

1. Listar los slugs afectados (todo `juegos/` excepto que el usuario diga otra
   cosa) y pedir OK.
2. Aplicar el cambio en `_PLANTILLA/` primero (es la fuente canónica).
3. Replicar el archivo idéntico en cada `juegos/<slug>/`.
4. Si es `.jsx`, re-empaquetar cada juego.
5. Si es `styles.css`/`logo.jsx`/`characters.jsx`/asset, copiarlo también a la
   raíz (los usa el landing).
6. Si fue `logo.jsx` o `characters.jsx`, regenerar el landing (Tarea C).

## Tarea C — Regenerar el landing

Ver `references/editar-shell-y-landing.md`. El `index.html` raíz embebe inline
`logo.jsx` + `characters.jsx` y un literal `GAMES = [{ slug, title, charId }, ...]`.
Tras añadir/quitar/renombrar un juego, actualizar el array verificando:

- cada `slug:` coincide con un folder real en `juegos/` (y `_PLANTILLA` NUNCA va
  en `GAMES`),
- `charId` ∈ {`domi`, `sisa`, `yaku`, `andi`} y matchea al personaje destacado,
- el código inline de `logo`/`characters` coincide con el de los juegos.

## Tarea D — Validar un juego existente ("que quede igual")

Para auditar que uno o varios juegos siguen el estándar de la `_PLANTILLA` (útil
al heredar juegos o antes de publicar). Ver `references/estandar-visual.md` §7.

1. **Shell sin drift**: comparar hash de `app.jsx`, `characters.jsx`, `logo.jsx`,
   `styles.css` de cada juego contra `_PLANTILLA` — deben ser idénticos (el
   elenco es domi/sisa/yaku/andi). Difieren, como se espera, `screens.jsx` y
   `game-screens.jsx` (la mecánica).
2. **Literales fijos**: verificar HUD, personaje/bocadillo, acciones y
   ResultsScreen contra los valores de `estandar-visual.md` §1–§5. Distinguir
   **desviación** (corregir) de **variante justificada** (p. ej. columna de
   acciones angosta cuando la mecánica es ancha — §3 variante C: documentarla).
3. **Invariantes** de gamificación (§6) presentes en `game-screens.jsx`.
4. **QA visual** en los 6 viewports (`_PLANTILLA/.planning/qa-visual.js`): sin
   overflow del lienzo, sin solapes.
5. **Reportar primero, corregir después**: presentar las desviaciones a la
   autora y **pedir OK del alcance** de normalización antes de editar (algunas
   diferencias son decisiones por-mecánica que no se deben uniformar a ciegas).
   Tras corregir, re-empaquetar y re-QA para confirmar que no hay regresión.

## Después de cualquier tarea

- Recordar borrar `visits.txt` antes de subir a producción (`.gitignore` ya lo
  excluye de git).
- Actualizar `CHECK-JUEGOS.md` y `MEMORY.md` si corresponde.
