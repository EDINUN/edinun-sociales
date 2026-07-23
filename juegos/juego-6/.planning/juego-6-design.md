# Design-doc — juego-6 "Provincias del Ecuador" (Estudios Sociales)

> Planificación inicial (design-doc primero). **Pedir OK antes de codear.**
> Reconstrucción moderna del juego `edinun.com/juegos/ProvinciasEcuador` (Construct 2,
> mecánica "Simón dice" de memoria) en el motor EDINUN, cambiando la memoria pura por
> **ubicar + identificar** (aprender de verdad dónde está y cuál es cada provincia).

## 1. Tema

- **Qué enseña:** el **mapa político del Ecuador** — reconocer y ubicar las **24
  provincias**. Geografía / EESS.
- **Edad objetivo:** **7-10 años** (confirmado por la autora).
- **charId:** `yaku` (Oriente, kichwa amazónico) — personaje guía.
- **Título global:** *por definir al final con la autora* (working title
  "Provincias del Ecuador"; propuestas al cierre).
- **Resumen:** una sola temática (provincias) jugada en **2 fases encadenadas** —
  primero ubicar provincias tocándolas en el mapa, luego identificarlas en una trivia.
  Un solo reporte al final.

## 2. Niveles

**1 nivel único** (una sola temática). Según `estandar-visual.md` §0:
- Home **sin botones de tema** — solo hero + nombre + `ENTRAR →`.
- HUD del juego: centro = **indicador de RONDA con 5 dots** (§1.1), no tabs de nivel.
- `catLabel = "Provincias del Ecuador"` (aparece en el encabezado del reporte).

Runtime: Home → `app.level` (único) → CharacterScreen → `currentCategory="provincias"`
→ GameScreen. No hay `TemaChipsBar` (un solo nivel).

## 3. Mecánica

Sesión = **5 rondas encadenadas** en 2 fases (mezcla de mecánicas, permitido 7+).
`GameScreen` orquesta las fases; un `MapaFrame` centraliza el chrome (HUD con RONDA
de 5 dots, personaje Yaku + bocadillo, acciones, overlay, modales) y el **mapa SVG**
compartido.

### Fase 1 — "Ubica en el mapa" (rondas 1-2) · Patrón 7 (marcar en mapa)
- El **enunciado** nombra una provincia: `¿Dónde está {Provincia}?`
- El niño **TOCA** la provincia correcta en el mapa SVG. **Validación al tocar**
  (arcade, sin botón VERIFICAR).
- **Acierto** → la provincia se pinta verde + ✓ + **+1 ⭐**.
- **Fallo** → se resalta la **correcta** en verde dejando ver la que tocó (roja) ~2 s;
  **no baja** el progreso; avanza automático.
- Sesgo de selección: para que sea justo a los 7, la Fase 1 elige provincias de
  **área media/grande** (Guayas, Manabí, Pichincha, Pastaza, Morona…), no las
  diminutas (Tungurahua, Carchi) — esas caen mejor en la trivia (se toca el nombre).

### Fase 2 — "Trivia del mapa" (rondas 3-5) · Patrón 5 (tocar opción)
- El mapa **ilumina UNA provincia**; enunciado `¿Qué provincia está iluminada?`
- **4 opciones A/B/C/D**: la correcta + **3 distractores** = otras 3 provincias
  reales al azar del banco (no se inventa nada). Validación al tocar.
- **Racha 🔥 + puntos 🏆** (igual que juego-5 Tema 4): `pts = 100 + (racha-1)*20`.
  **Sin cronómetro** de presión (decisión por la edad; el ⏱ del HUD es el tiempo
  transcurrido, no una cuenta atrás).
- Acierto → verde + **+1 ⭐**; fallo → resalta la correcta, corta racha, avanza.

### Banco y anti-repetición
- **Banco = las 24 provincias** (nombre + geometría). Fuente: geoBoundaries ADM1
  (CC BY 4.0), simplificado a 24 paths SVG (~48 KB) — ya generado y verificado
  visualmente (`assets/ecu-map` embebido inline en `game-screens.jsx`).
- **Anti-repetición** FIFO en `localStorage` (`RECENT_KEY`, cap ≈ `floor(24/2)=12`):
  las 5 provincias de la partida (2 ubicar + 3 trivia) **no se repiten al recargar**.
- Estrellas: modelo simple **+1 ⭐ por acierto** (el de sociales).

## 4. Layout (lienzo 900×540)

Valores EXACTOS de HUD/personaje/acciones/Results → `estandar-visual.md` (no reinventar).

### Fase 1 — Ubica (mapa grande, centrado en x=450)
```
┌───────────────────────────────────────────────────────────┐
│ [logo64]        Ronda ● ● ○ ○ ○            ⏱ 0:12   ⭐ 2    │  HUD top:10 / dots top:20
│                                                             │
│              ¿Dónde está GUAYAS?           (enunciado top≈64)│
│                    ┌───────────┐                            │
│   ╭─Yaku─╮         │  🗺 MAPA   │            ┌──────────┐    │
│   │bocad.│         │  ECUADOR  │            │ REINICIAR│    │  acciones
│   │ 🧑‍🦱  │         │ (24 prov, │            │  SALIR   │    │  right:18 w:150
│   ╰──────╯         │  tap-able)│            └──────────┘    │  top:50%
│    Yaku            └───────────┘                            │
└───────────────────────────────────────────────────────────┘
```

### Fase 2 — Trivia (mapa arriba-centro + 4 opciones 2×2, centrado en x=450)
```
┌───────────────────────────────────────────────────────────┐
│ [logo64]     Ronda ● ● ● ○ ○      🔥 x2  🏆 220  ⭐ 4       │
│              ¿Qué provincia está iluminada?                 │
│                   ┌──────────┐                              │
│   ╭─Yaku─╮        │ 🗺 (una  │                 ┌──────────┐ │
│   │bocad.│        │ prov.    │                 │ REINICIAR│ │
│   │ 🧑‍🦱  │        │ brilla)  │                 │  SALIR   │ │
│   ╰──────╯        └──────────┘                 └──────────┘ │
│              [A Manabí] [B Guayas]                          │
│              [C El Oro] [D Loja]                            │
└───────────────────────────────────────────────────────────┘
```
- Mapa centrado en **x=450**. Opciones 2×2 también centradas en 450 (badges
  `#7b3ff2/#2773d8/#e0940f/#2ecc8f`, como juego-5).
- Acciones = variante A/B estándar (`right:18, width:150`); QA visual confirmará
  colchón ≥30px (el mapa se escala si hace falta).

## 5. Log y reporte

`lastResult.log[i] = { idx, emoji:"📍", a, userAnswer, correctAnswer, isCorrect, time }`
- `a` = enunciado (`¿Dónde está Guayas?` / `¿Qué provincia está iluminada?`).
- `userAnswer`/`correctAnswer` = nombre de provincia.
- Reporte: columna "Pregunta" → **"Provincia"**; subtítulo
  **"Reporte académico · Estudios Sociales"**. 4 celdas: Preguntas / Correctas /
  Estrellas / Precisión. Además **🏆 Puntos** y **🔥 Racha máx** (como juego-5, porque
  la Fase 2 los genera). `res.category = "Provincias del Ecuador"`.

## 6. Glifos del fondo

- **cosmic** (Home/Character/Results, ~15): 🗺️ 🧭 📍 🌎 ⛰️ 🌊 🌴 🏔️ 🐢 ⭐ ▲ 🧭 🗺️ 📍 🌎
- **chalkboard** (Game, ~10): 🗺️ 📍 🧭 ⛰️ 🌊 🌴 🐢 🏔️ ⭐ 🌎
- (🐢 por Galápagos; 🌴 Costa; ⛰️/🏔️ Sierra; 🌊 el Pacífico; sin banderas para no
  saturar.)

## 7. Copy específico (todos los textos visibles)

- **Home** — eyebrow `EDINUN · Provincias del Ecuador`; h1 `¡Bienvenido/a, Estudiante!`;
  descripción breve `Conoce las 24 provincias del Ecuador.`; `Escribe tu nombre y entra`
  + input + `ENTRAR →`. (Sin botones de tema.)
- **CharacterScreen** — label estándar (`Elige tu personaje` / `¡VAMOS!`).
- **Enunciados (QUÉ)** — F1: `¿Dónde está {Provincia}?` · F2: `¿Qué provincia está
  iluminada?`
- **Bocadillo Yaku (CÓMO)** — F1: `Toca la provincia<br />en el mapa.` · F2:
  `Toca la respuesta<br />correcta.`  *(fijos; no cambian al responder — el
  feedback va en el overlay).*
- **catLabel:** `Provincias del Ecuador`.
- **Frase de cierre (Results):** `¡Ya te ubicas en el mapa del Ecuador!` — Yaku.

## 8. Decisiones abiertas / riesgos

1. **Mapa SVG** — ✅ resuelto: geoBoundaries ADM1 simplificado, 24 provincias,
   reconocible (preview verificado con Playwright). **Atribución CC BY 4.0** en un
   `assets/MAPA-FUENTE.txt` / crédito. Se embebe inline (no es un `.png`).
2. **Punto interior** para el marcador/brillo: usar un punto **dentro** del polígono
   (no el centroide crudo) en provincias cóncavas (Guayas, Esmeraldas) para que el
   resalte no caiga en el mar.
3. **Tap en móvil** — la hit-area es el `<path>` completo; el sesgo por área de la
   Fase 1 evita pedir "toca Tungurahua" a un niño de 7 en pantalla chica.
4. **Colores** — paleta ciclada (coloreo de mapa), **no afirma regiones** → evita
   meter contenido no verificado. Ajustar adyacencias (que 2 vecinas no compartan
   color) en la implementación.
5. **Slug** `santodomingodelostsachilas` → acortar a `santodomingo`; nombre visible
   "Santo Domingo".
6. **Título global** — definir al final (como juego-5).

---

### Verificación previa a entrega (obligatoria)
- `node juegos/_PLANTILLA/.planning/format-lint.js juego-6` (valores fijos).
- `node juegos/_PLANTILLA/.planning/qa-visual.js juego-6` (6 viewports, colchón ≥30px).
- Playwright end-to-end: completar F1+F2 → `reachedResults`; anti-repetición al
  recargar (0 solapes).
