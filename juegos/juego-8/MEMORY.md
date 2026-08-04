# MEMORY.md — Bitácora del juego-8 "¿En qué trabajan?"

## 2026-08-04 — Creación desde `_PLANTILLA`

- Clonado de `juegos/_PLANTILLA/`. Se creó **juego-8** (se dejó el **juego-7 pendiente**,
  hueco intencional a pedido de la autora).
- **Tema del libro:** "El respeto al trabajo de las personas" (actividades económicas).
  **Edad 8.** Guía **Andi**. 1 tema, **3 rondas con mecánicas distintas**, elegidas por la
  autora viendo **bocetos ASCII en el chat** (R1 tocar-varios · R2 tocar 1 de 2 · R3
  colocar en grupo).
- **R1 "Marca los del campo"** (primario vs secundario) · **R2 "¿Bien o servicio?"** ·
  **R3 "¿Activa o inactiva?"** (PEA/PEI, **tap no drag** por la edad). Bancos del libro;
  **sin imágenes** (emojis + nombre; personas → sin caras generadas).
- **Anti-repetición**: aplicada la regla nueva — para elegir un subconjunto K de N, cap <
  N−K (con cap = K el banco alterna grupos fijos idénticos cada recarga). Verificado 6
  recargas: 0 repeticiones consecutivas en las 3 rondas.
- **Guía por defecto**: app.jsx (shell) arranca en "domi"; se preseleccionó Andi en
  `CharacterScreen` (`sel = andi` salvo elección previa ≠ domi) sin tocar el shell.
- **Verificado:** format-lint 15/15 · qa-visual 6 viewports sin overflow (colchón 70px) ·
  e2e R1→R2→R3→reporte sin errores.
