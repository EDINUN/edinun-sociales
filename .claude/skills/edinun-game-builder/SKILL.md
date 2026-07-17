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

> ## 🛑 ANTES DE GENERAR NADA
>
> 1. **Lee `## Errores aprendidos`** (al final de este archivo) y respeta TODAS las
>    reglas acumuladas. No es opcional: son errores ya cometidos y ya pagados por la
>    autora.
> 2. **Lee `references/estandar-visual.md`** — es la especificación normativa, no
>    contexto de apoyo.
> 3. **Si algo no está especificado, NO lo inventes**: búscalo en el último juego
>    terminado o pregúntale a la autora.
> 4. Antes de entregar: `format-lint.js` y `qa-visual.js` en verde — y recuerda que
>    **verde ≠ conforme** (el lint solo mide lo medible).

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

---

## Errores aprendidos

> **Lectura OBLIGATORIA antes de generar o editar cualquier juego.** Cada regla nació
> de un error real que la autora tuvo que cazar a mano. Respetarlas todas, siempre.

### Protocolo de aprendizaje (acordado con la autora, 2026-07-15)

Cuando la autora escriba la frase exacta **«te equivocaste en esto:»** seguida de la
descripción del error, hay que:

1. **Identificar la causa RAÍZ** del error, no el síntoma. Si algo no queda claro,
   **preguntarle**.
2. **Formular una regla correctiva** en lenguaje imperativo y **verificable**
   ("SIEMPRE validar X antes de generar Y" / "NUNCA usar Z en el caso W").
3. **Registrarla en esta sección**, con **fecha** y un **ejemplo del error** que dé
   contexto.
4. **Confirmarle qué regla se añadió y dónde**, para que pueda validarla.

A partir de ese momento, **cada vez que se use la skill hay que revisar esta sección y
respetar todas las reglas acumuladas antes de generar cualquier juego.**

> **Cláusula añadida (validar con la autora):** si la regla es **verificable por
> código**, añadir además el check a `juegos/_PLANTILLA/.planning/format-lint.js` —
> y **probarlo rompiendo el juego a propósito** hasta verlo fallar. Una regla que solo
> vive en un documento depende de que alguien la recuerde; una en el lint, no.

### 2026-07-15 — Tanda inicial (juego-4, Temas 1-3)

Causa raíz común de casi todas: **se construyó "razonando" cada pantalla en vez de
leer `references/estandar-visual.md`**, y los huecos de especificación se rellenaron
inventando UI que "parecía razonable".

| # | Regla (imperativa y verificable) | Error real que la originó |
|:-:|---|---|
| 1 | **SIEMPRE leer `references/estandar-visual.md` ANTES de escribir la primera pantalla.** Es normativo. | Se hizo el Tema 3 entero sin abrirlo → 6 desviaciones seguidas. |
| 2 | **NUNCA inventar UI que no esté en el estándar** (contadores, marcadores, rótulos, botones). Si falta especificación: buscar en el último juego terminado o **preguntar**. | Se inventaron "Dato 1 de 3", "0 / 3", "1/5" y una "racha". La autora: *"¿de dónde sacas eso? no te inventes"*. |
| 3 | **El ENUNCIADO dice QUÉ hacer; el BOCADILLO dice CÓMO hacerlo. NUNCA invertirlos.** Si el verbo de manipulación (arrastra/toca/une) está en el enunciado, está mal. | Enunciado: *"…Arrastra cada acción a su caja"* (el CÓMO) + bocadillo: *"¿Cómo tratas a tus amigos?"* (temático). Ver `memory/aprendizajes-de-diseno.md` §11. |
| 4 | **NUNCA poner un botón para avanzar de ronda: el avance es AUTOMÁTICO (§6).** El único botón primario permitido es **¡VERIFICAR!**. | Se inventaron "CONFIRMAR" y "SIGUIENTE →". → Chequeado por `format-lint.js`. |
| 5 | **El gradiente del botón de tema va por POSICIÓN, NUNCA por temática** (1º naranja · 2º amarillo · 3º azul · 4º violeta). | Tema 2 en **verde** "porque pegaba con Amigos y compañeros"; juego-3 en amarillo/azul. → Chequeado por `format-lint.js`. |
| 6 | **El bloque "Ronda" va SIEMPRE en `top:52`, `ed-label` fontSize 11, dots 11×11** (§1.1). No inventar formato propio. | Se puso en `top:74` con dots 7×7. → Chequeado por `format-lint.js`. |
| 7 | **SIEMPRE cortar el bocadillo con `<br />`** para que el renglón más largo sea corto (§2). | *"Toca antes de que acabe el tiempo."* se estiraba a 210px y se montaba sobre la tarjeta. |
| 8 | **Una ronda = UNA jugada.** NUNCA repetir la actividad N veces dentro de la ronda; la variedad la da el **banco + anti-repetición**. | R1 con 3 datos y R2 con 5 afirmaciones. La autora: *"es solo 1 juego, no 3 veces"*. |
| 9 | **SIEMPRE ajustar el registro visual a la EDAD.** Lo de 6 años (3D cartoon, estrellitas) no sirve para 13. Mirar cómo lo resuelve el libro. | Se propusieron dibujos 3D infantiles para el tema de 13 años. El libro usa fotos ahí. |
| 10 | **NUNCA inventar cifras ni datos.** Es material escolar. Los bancos salen **textuales del libro**; para ampliarlos, pedirle material a la autora. | (Regla preventiva: se respetó, pero es la de mayor riesgo del repo.) |
| 11 | **Cada ítem de un banco debe entenderse SOLO.** El banco se baraja: no puede referirse a otro ítem. | *"¿En qué año se alcanzó **ese máximo**?"* salió primera, sin antecedente. |
| 12 | **Al fallar, revelar la correcta en el MISMO lenguaje visual de la mecánica.** Un emoji suelto no comunica si las fichas son ilustraciones. | Reveal *"Va: 🧘"* bajo tarjetas con dibujos. Se cambió a mini-tarjeta con la ilustración real + nombre. |
| 13 | **NUNCA declarar "verificado" sin cubrir las RAMAS del banco** (ítems de forma distinta: 1/2/3 huecos, etc.). Forzar cada variante sembrando la clave de anti-repetición en `localStorage`. | Se dijo "verificado" tras probar por azar solo la frase de 1 hueco. La autora: *"¿estás seguro?"*. |
| 14 | **Al escribir un lint/guard, probarlo ROMPIENDO el código a propósito hasta verlo fallar.** | El primer check de rótulos no cazaba nada (cortaba en el primer `>`, y las arrow `() =>` metían basura), y el test era un `sed` que no cambiaba nada. |

#### Prompts de imagen (aprendido con la autora)

| # | Regla | Error real |
|:-:|---|---|
| 15 | **NUNCA usar marcas en los prompts** ("Pixar", "Disney"): el generador de la autora **da error**. Usar descripción genérica del estilo. | `Pixar / Disney-Pixar animation style` → error. |
| 16 | **Para acciones/valores, pedir MINI-ESCENA con fondo y 2 personajes interactuando**, no figura suelta. **SIEMPRE** añadir `no text, no letters, no numbers`. | *"A single young child standing patiently…"* → la autora: *"no me dice nada"*. Con escena y contexto sí se entendió. |
| 17 (2026-07-16) | **SIEMPRE especificar el FORMATO en el prompt de imagen según el contenedor de destino** (tarjeta ≈ cuadrada → `square image, 1:1 aspect ratio`; banner → horizontal). Antes de escribir los prompts, mirar el aspect ratio del contenedor en el código. | juego-5: los 12 prompts de personas no decían formato → el generador entregó 2816×1536 (16:9) para tarjetas casi cuadradas; hubo que apaisar la tarjeta y recortar las escenas. La autora: *"¿por qué no me dijiste para generarlas cuadradas?"*. |
