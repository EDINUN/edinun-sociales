# Referencia — Crear un juego nuevo

**Antes que nada: planificación inicial.** Escribe el design-doc
`juegos/<slug>/.planning/<slug>-design.md` y pide OK ANTES de codear
(ver `references/planificacion-inicial.md`). La mecánica sale de
`references/mechanics-design.md` (o se inventa una nueva ahí). Esta referencia
cubre la implementación una vez aprobado el diseño.

## 0. Confirmar antes de empezar

- **Tema** y a qué parte del currículo/libro mapea.
- **Mecánica / gamificación** — patrón de `references/mechanics-design.md` o nuevo.
- **Edad objetivo** (Estudios Sociales: depende del tema — 6-8 o 9-12).
- **Personaje destacado** (`charId`: domi / sisa / yaku / andi).
- **Slug**: `juego-N` con N = siguiente ordinal libre en `juegos/`.

## 1. Clonar la base correcta

**Importante (de qué clonar):**
- La `_PLANTILLA` **ya trae el formato EDINUN completo** ("Mira y toca", puesto
  el 2026-07-07): HUD con RONDA+dots, personaje guía con bocadillo, cartel dorado,
  fichas candy, overlay ¡EXCELENTE!/¡UPS!, modales y reporte imprimible. Clonar de
  ella da una base ya pulida.
- **En este repo aún no hay juegos publicados de Estudios Sociales**, así que se
  clona de `_PLANTILLA`. En cuanto exista un juego terminado que aporte una
  mecánica nueva mejor pulida, se puede **clonar de ese** para heredar sus arreglos
  (ver `memory/aprendizajes-de-diseno.md`).

Copiar **toda** la carpeta fuente a `juegos/juego-N/`, incluyendo `assets/`,
`counter.php`, `.planning/bundle.*`, los 5 `.jsx`, los dos HTML y los docs
(`CLAUDE.md`, `USER.md`, `MEMORY.md`). Tras clonar, **limpiar** lo específico del
juego fuente: `visits.txt` (si existe), `MEMORY.md`, el array de datos de la
mecánica y los textos del tema.

En PowerShell:
```powershell
# Por ahora (sin juegos publicados aún), clonar del demo:
Copy-Item -Recurse "juegos\_PLANTILLA" "juegos\juego-N"
# Cuando exista un juego terminado con formato EDINUN completo, clonar de ese:
# Copy-Item -Recurse "juegos\juego-1" "juegos\juego-N"
```

## 2. Implementar la mecánica (`game-screens.jsx`)

Reemplazar `DEMO_PREGUNTAS` / reescribir `GameScreen`. Contrato obligatorio:

- `GameScreen({ app, setApp, go })` — al terminar: `incrementGamesCompleted()` y `go("results")`.
- `ResultsScreen({ app, setApp, go })`.
- `Object.assign(window, { GameScreen, ResultsScreen })` al final del archivo.
- `markFirstAttempt()` en la **primera** respuesta del niño (cuenta la visita).

Invariantes de diseño (no negociables sin confirmar):
- Fallar **no** baja progreso ya ganado; completar el objetivo es éxito aunque
  haya errores.
- Al fallar, **revelar la respuesta correcta** dejando ver lo que eligió el niño.
- Salir/reiniciar **siempre con modal**.
- HUD: pregunta/ronda arriba-izq pegado al logo; timer ⏱ + estrellas ⭐ a la
  derecha; nada se tapa.
- Lienzo lógico 900×540; contenido en `position:absolute; inset:0`.

## 3. Personalizar el shell visible (`screens.jsx`)

Solo los textos marcados `// ← PERSONALIZAR` (label del tema, subtítulo,
categoría) y, si encaja, los glifos del `CosmosBg`. No tocar el bloque del
contador.

## 4. Docs

- `CLAUDE.md` y `MEMORY.md` del juego: reemplazar `{{PLACEHOLDERS}}`.
- `memory/audiencia_por_juego.md` (raíz): añadir fila con la edad objetivo.

## 5. Re-empaquetar

Desde la carpeta del juego:
```powershell
powershell -ExecutionPolicy Bypass -File .planning\bundle.ps1
```
Verificar: ambos HTML idénticos en bytes, sin `</script>` literal en los `.jsx`.

## 6. Landing + QA

- Añadir `{ slug, title, charId }` al array `GAMES` del `index.html` raíz.
- QA responsive en 1920×1080, 1280×800, 1024×768, 768×1024, 667×375, 375×667.
- Borrar `visits.txt` antes de subir a producción.
