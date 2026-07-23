# MEMORY.md — juego-6 "Explora el Ecuador"

Bitácora del juego. (Diseño completo en `.planning/juego-6-design.md`.)
Título global **"Explora el Ecuador"** (elegido por la autora, 2026-07-23). El *tema*
que se estudia sigue siendo "Provincias del Ecuador" (así sale en el reporte).

## Qué es

Reconstrucción del juego viejo de `edinun.com/juegos/ProvinciasEcuador` (Construct 2,
"Simón dice" de memoria) en el motor EDINUN. **Nivel único**, personaje **Yaku**,
audiencia **7-10**. La autora eligió las mecánicas A + C de los bosquejos:
- **Fase 1 · Ubica en el mapa** (rondas 1-2): tocar la provincia nombrada.
- **Fase 2 · Trivia del mapa** (rondas 3-5): identificar la provincia iluminada entre
  4 opciones, con racha 🔥 + puntos 🏆.
5 rondas encadenadas, 1 reporte al final.

## Decisiones de la autora (esta sesión, 2026-07-23)

- Analizamos el juego original (era Construct 2, mecánica de memoria pura). La autora:
  *"el juego era una referencia… ¿tienes alguna mecánica mejor?"* → se propusieron 3
  bosquejos visuales (artifact `bosquejos-provincias.html`). Eligió **A (ubica) + C
  (trivia)** encadenadas.
- Edad: **7-10** (más peques que el rango típico de geografía) → por partida **pocas
  provincias** (2 ubicar + 3 trivia), no las 24 de golpe; Fase 1 sesgada a provincias
  grandes.
- Personaje: **Yaku**. Estructura: **Ubica ×2 → Trivia ×3**.

## Mapa (lo importante)

- 24 provincias como **paths SVG inline** (~50 KB), de **geoBoundaries ADM1** (CC BY
  4.0). Generado con `scratchpad/gen-map.js`, inyectado con `inject-map.js` entre
  `/*__MAP__*/ … /*__MAP_END__*/`. Atribución en `assets/MAPA-FUENTE.txt`.
- **Galápagos** va en **recuadro (inset)** aparte (está a lon −92, lejísimos).
- **Resalte = pintar el propio path** (no un círculo), así cae dentro de la provincia
  aunque sea cóncava (Guayas/Esmeraldas).
- **6 colores asignados a mano** (`COLOR_BY_SLUG`) sin choques entre vecinas; NO son
  regiones (para no meter contenido no verificado).
- Verificado visualmente con Playwright (se ve como Ecuador: costa, Amazonía, golfo).

## Estándar / QA

- Nivel único → Home sin chips, RONDA con **5 dots** (top:52, 11×11). format-lint
  **15/15 OK** (0 temas). qa-visual: sin overflow en los 6 viewports.
- Acciones estándar `right:18, top:"50%"` (el mapa se centra en x=450 y deja colchón
  amplio con las acciones).
- e2e Playwright: `reachedResults: true`; anti-repetición al recargar verificada.

## Ajustes durante el build

- El default de personaje venía de `app.jsx` (=domi, shell compartido) → la
  CharacterScreen de este juego **preselecciona Yaku** sin tocar el shell.
- El enunciado de Fase 1 se encimaba con la fila RONDA → bajado a `top:78`; mapa a
  `top:106` height 370.

## Pendiente / abierto

- **Título global**: "Provincias del Ecuador" es de trabajo; confirmar con la autora
  (propuestas: "Explora el Ecuador", "Mapa del Ecuador", "Viaje por las provincias").
- **Colores del mapa**: paleta amable actual; ajustable si la autora prefiere otra.
- Deploy: subir la carpeta `juegos/juego-6/` a producción (borrar `visits.txt` antes).
