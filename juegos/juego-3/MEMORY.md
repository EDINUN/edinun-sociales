# MEMORY.md — Bitácora del juego "Cuido mi entorno"

> Decisiones de diseño, bugs encontrados y cómo se resolvieron, en orden
> cronológico. Una entrada por hito.

## 2026-07-09 — Creación desde `_PLANTILLA`

- Clonado de `juegos/_PLANTILLA/`. Personaje guía: **Sisa**.
- Tema del currículo: cuidado del ambiente (Estudios Sociales).
- **Tema 1 "Clasifica la basura"** (edad 6): en lugar del formato "Mira y toca"
  de la plantilla, se implementó una mecánica de **arrastrar** 6 residuos a 3
  tachos (amarillo/azul/café) con botón **VERIFICAR**.
- Assets de residuos/tachos generados por la autora y recortados con el cortador
  por espacios (gap-based, `HighQualityBicubic`).

## 2026-07-09 — Flujo verificación → overlay (arrastrar)

- La autora pidió que la **pantalla de verificación** (✓/✗, revelar el correcto)
  se vea **antes** y el overlay **¡EXCELENTE!/¡UPS!** después (~3 s), NO
  simultáneos (no dejaba ver qué estaba mal). Se replicó el patrón de CCNN.
- Errores: revelar el tacho correcto con **círculo rojo + ➜** (no iluminar el
  tacho). Sin recuadro azul de selección (se añadió `user-select:none`,
  `-webkit-user-drag:none`, `onDragStart preventDefault`, `::selection` transparente).
- Bug de distribución: al colocar el 3.er objeto se formaban 2 filas → se ajustó
  el grid (`GRID_Y`) para repartir parejo.

## 2026-07-10 — Tema 2 "Cambio climático" (edad 9, 3 rondas)

- Multi-tema: `LEVELS_CFG` con 2 temas; chips de cambio de tema en la pantalla de
  juego + indicador **"Ronda"** (palabra + puntitos) copiados del juego de lengua.
- **3 rondas encadenadas con mecánicas distintas** (`Tema2Controller`):
  1. `CausaEfectoRound` "¿Qué pasa si...?" — tap causa-efecto, **1 pregunta**
     (la autora lo pidió explícito), bocadillo ESTÁTICO.
  2. `TermometroRound` "El termómetro del planeta" — tocar acciones buenas para
     enfriar la Tierra; imagen de Tierra según temperatura.
  3. `ClimaRound` "¿Qué clima es?" — arrastrar tarjetas a El Niño/Neutral/La Niña
     + VERIFICAR (mismo flujo verificación→overlay).
- Reporte **combinado** al final (`cols: ["Actividad","Tu respuesta"]`,
  `themeEmoji:"🌍"`, `praise:"¡aprendiste cómo cuidar el planeta!"`).
- **Las láminas del libro se usaron solo para entender el tema**, no para copiar
  actividades 1:1 (indicación de la autora).

## 2026-07-10 — Imágenes de la Tierra nítidas

- Las 3 Tierras estaban en 1 sola imagen (676×369) → cada una ~200 px → borrosas.
  La autora regeneró **cada Tierra por separado a 2048×2048**, fondo transparente,
  **sin borde/anillo gris**. Archivos: `tierra-caliente/media/feliz.png`.

## 2026-07-10 — Estandarización + distribución + publicación

- Overlay ¡EXCELENTE!/¡UPS!, modales con glow (rojo salir / violeta reiniciar),
  botones 150×56, logo HUD 60, bocadillo con sombras estándar — **copiado exacto
  de CCNN/lengua**, no inventado. Auditoría cruzada de los 3 juegos sociales OK.
- Distribución "perfecta": `space-evenly`, enunciado con aire arriba/abajo, chips
  ~top:14 y "Ronda" ~top:50 sin quedar pegados.
- **Publicado en producción** (commit `480e4f9`, push a `main`): juego-3 nuevo +
  juego-1/juego-2 re-subidos con la estandarización + landing actualizado.
- Gemelos idénticos (`index.html` == `EDINUN GAMES.html`, 150068 bytes), sin
  `</script>` literal.
