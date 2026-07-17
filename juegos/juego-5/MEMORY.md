# MEMORY.md — Bitácora de juego-5 (Tema "Aprendiendo")

## 2026-07-16 — Creación desde `_PLANTILLA`

- Clonado de `juegos/_PLANTILLA/`. Diseño en `.planning/juego-5-design.md`
  (aprobado por la autora el mismo día).
- **Tema:** las personas que trabajan en la escuela — TEMA 3 del libro
  ("Aprendiendo con mis compañeros y compañeras de clase"). **Audiencia 6.**
  Guía: **Domi**.
- **Mecánica:** "Mira y toca" (patrón 5) con **tarjetas de dibujo**: pregunta
  "¿Quién…?" + 3 tarjetas (imagen + nombre); el niño toca a la persona.
  **3 rondas** (pedido de la autora; la plantilla traía 4). Elegida por la autora
  entre 3 opciones (descartó "unir columnas" y "el semáforo del peatón").
- **Banco de 12 personas**: 6 del libro (director/a, secretaria, docente,
  conserje, guardián, cocinera) + 6 propuestas aprobadas por la autora
  (bibliotecario, inspectora, enfermero, psicóloga, chofer, jardinera). La autora
  pidió explícitamente **solo preguntas tipo "¿Quién…?"** y un banco variado
  ("quiero que tenga más opciones, más variedad"). Distractores: 2 al azar del
  mismo banco. Anti-repetición FIFO 6 → 4 partidas sin repetir.
- **Imágenes:** 12 PNG (`assets/persona-<id>.png`) los genera la autora — los 12
  prompts se le entregaron en el chat (estilo 3D cartoon, mini-escena, sin texto,
  sin marcas). Mientras no existan, la tarjeta cae al **emoji placeholder**
  (`PersonaImg` con `onError`): se enchufan copiando los archivos, sin tocar código.
- Ronda movida a `top:52` (la plantilla traía `top:20`, fuera del estándar §1.1).
- QA: format-lint 15/15 · qa-visual sin overflow en los 6 viewports.

## 2026-07-16 — Llegaron las 12 imágenes (y optimización)

- La autora generó las 12 escenas (2816×1536, ~6.5 MB c/u = ~78 MB: inviable para
  web escolar). Se optimizaron a **512 px de alto · JPEG q85** (~100 KB c/u,
  ~1.2 MB total) y el código pasó de `.png` a **`.jpg`**.
- El área de imagen de la tarjeta se hizo **apaisada** (tarjeta 150×152) porque
  las escenas son horizontales; recortes verificados con hoja de contactos de
  las 12: todas reconocibles, géneros = rótulos.
- ⚠ 1ª tanda salió **horizontal** (2816×1536) porque los prompts NO pedían
  formato → hubo que apaisar la tarjeta y recortar. La autora: *"¿por qué no me
  dijiste para generarlas cuadradas?"*. **Aprendizaje → regla #17 de la skill**
  (especificar formato en el prompt según el contenedor).
- **2ª tanda (definitiva): 12 imágenes CUADRADAS 2048×2048**, con prompts que
  agregan `square image, 1:1 aspect ratio` + `main character large and centered`.
  Se corrigieron los 2 flojos: `guardian` sin el texto "SCHOOL"; `inspectora` en
  primer plano. `chofer` regenerado 3 veces hasta lograr "sentado al volante
  recogiendo a los estudiantes" (el 1º salió desproporcionado, bus gigante).
- Optimizadas a **640×640 JPEG q85** (~90 KB c/u) → tarjeta vuelta a CUADRADA
  (156×194). QA: lint 15/15 · qa-visual sin overflow · hoja de contactos: las 12
  reconocibles y géneros = rótulos.

## 2026-07-16 — Título global + registro en el landing

- **Título global elegido por la autora: "Aprendiendo"** (Home: "EDINUN ·
  Aprendiendo"). Descripción del Home = **"Aprendiendo con mis compañeros y
  compañeras de clase."** (el título del TEMA 3 del libro).
- `<title>` de ambos HTML → "EDINUN GAMES — Aprendiendo".
- **Registrado en el landing** (`GAMES` del index.html raíz): 5ª card, Domi.

## Pendiente

- **Tema 2**: la autora manda capturas del libro (mismo TEMA 3). Al llegar, migrar
  el Home a chips (`LEVELS_CFG`, patrón juego-4) — y como el juego ya se llama
  "Aprendiendo", **el chip del Tema 1 necesita un nombre propio** (ya no puede ser
  "Aprendiendo"): p. ej. "Las personas de mi escuela" / "La comunidad escolar"
  (confirmar con la autora). Gradiente por posición (1º naranja · 2º amarillo · …).
- **3 temas más**: el juego tendrá 4 botones (4 temas del libro). Al llegar el
  material del 2º tema, migrar el Home a chips (`LEVELS_CFG`, patrón juego-4) y
  el gradiente por posición (1º naranja · 2º amarillo · 3º azul · 4º violeta).
  Material ya visto que puede servir: bloques de convivencia (acuerdos, buen
  trato) y educación vial (peatones, señales) del mismo TEMA 3 del libro.
