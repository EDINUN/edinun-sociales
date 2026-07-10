# Design-doc — juego-3 "Cuido mi entorno"

Juego multi-tema de Estudios Sociales (cuidado del ambiente). Personaje guía:
**Sisa**. Landing: `{ slug:"juego-3", title:"Cuido mi entorno", charId:"sisa" }`.
Lienzo lógico fijo **900×540**. Las láminas del libro se usaron **solo para
entender el tema**, no para copiar actividades 1:1.

## Temas y audiencia

Multi-tema con chips de cambio de tema en la pantalla de juego (`LEVELS_CFG` en
`screens.jsx`):

| Tema | slug categoría | Edad | Mecánica |
|------|----------------|:----:|----------|
| 1 — Clasifica la basura | `reciclaje` | 6 | Arrastrar residuos a 3 tachos + VERIFICAR (1 ronda) |
| 2 — Cambio climático | `cambioclimatico` | 9 | 3 rondas encadenadas (mecánicas distintas) + reporte combinado |

`GameScreen` despacha por `app.currentCategory`: `"cambioclimatico"` →
`Tema2Controller`; en otro caso → `BasuraGame`.

---

## Tema 1 — "Clasifica la basura" (`BasuraGame`)

**Objetivo:** clasificar 6 residuos (elegidos al azar de un banco de **18**
objetos inequívocos) en el tacho correcto y presionar **VERIFICAR**.

**Tachos (`BINS`):**
- 🔵 Azul — **Papel y cartón** (periódico, caja, cartón de huevos, hoja, revista, tubo)
- 🟡 Amarillo — **Plástico y latas** (botella, lata gaseosa, lata atún, tetra pack, funda, cepillo)
- 🟤 Café — **Orgánico** (cáscara plátano, manzana, cáscara naranja, espina, cáscara huevo, mazorca)

**Geometría (900×540):** bandeja en 2 filas × 3 columnas `GRID_X=[300,450,600]`,
`GRID_Y=[136,244]`; tachos en fila plana `BIN_CX=[290,450,610]` (amarillo al
centro), `BIN_TOPS=[312,312,312]`; `BIN_HIT_PAD=22` (margen de soltado para dedos
de niño). Drag con pointer events sobre el lienzo escalado.

**Flujo de verificación (estándar arrastrar):** al presionar VERIFICAR →
pantalla de verificación limpia (`revealMs` = 700 si perfecto, si no 3000): ✓
verde en aciertos, ✗ + **círculo rojo con ➜** señalando el tacho correcto en los
errores (NO se ilumina el tacho, NO recuadro azul de selección) → **luego**
overlay estándar **¡EXCELENTE!/¡UPS!**.

```
900×540 — Tema 1
┌──────────────────────────────────────────────────────────┐
│ [logo]        Ronda ●        chips[Basura][Clima]   ⏱ ⭐  │
│                                                            │
│              Arrastra cada objeto a su tacho               │  ← enunciado (aire arriba/abajo)
│   [o] [o] [o]                                    (Sisa)    │
│   [o] [o] [o]                                   bocadillo  │  ← bandeja 2×3
│                                                [VERIFICAR] │
│      ┌───┐        ┌───┐        ┌───┐           [REINICIAR] │
│      │AZ │        │AM │        │CA │           [ SALIR   ] │  ← 3 tachos fila plana
│   Papel/cartón  Plástico   Orgánico                        │
└──────────────────────────────────────────────────────────┘
```

---

## Tema 2 — "Cambio climático" (`Tema2Controller`, 3 rondas)

Controlador que monta cada ronda por turno (`key`) y acumula en un ref; al
terminar la 3.ª arma el **reporte combinado**. Cada ronda llama
`onDone({log, stars, aciertos, total})` en vez de ir directo a resultados.

### Ronda 1 — "¿Qué pasa si...?" (`CausaEfectoRound`)
Tap-quiz de causa-efecto. **`ROUNDS_CLIMA = 1`** (1 sola pregunta, pedido de la
autora). Bocadillo **ESTÁTICO** (no cambia por acierto/error). Opción incorrecta
tocada → **✗ roja**; correcta → **✓ verde**. Banco de ítems
`{ ctx, enunciado, pista, opciones:[{e,t}], correcta }`.

### Ronda 2 — "El termómetro del planeta" (`TermometroRound`)
Tocar las **acciones buenas** para enfriar la Tierra. Imagen de Tierra según
temperatura: `tierra-caliente.png` (temp>66) / `tierra-media.png` (>33) /
`tierra-feliz.png` (else), 2048×2048 nítidas, fondo transparente, sin borde.
Termómetro CSS + 6 tarjetas de acción (buenas/malas). Pastilla de éxito
`+N ⭐`.

### Ronda 3 — "¿Qué clima es?" (`ClimaRound`)
Arrastrar 6 tarjetas de clima al panel correcto + VERIFICAR (mismo flujo
verificación→overlay; `revealMs` = 900 perfecto / 5000 para revisar las 6).

**Paneles (`CLIMA3_BINS`):** 🌧️ **El Niño** · 🌤️ **Neutral** · ❄️ **La Niña**.
**Tarjetas (`CLIMA3_CARTAS`):** Mucha lluvia / Inundación → El Niño; Día soleado /
Clima normal → Neutral; Mucho frío / Heladas → La Niña. Pista de error COMPACTA:
`➜` + círculo de 32 px con solo el emoji del panel correcto.

### Reporte combinado
`ResultsScreen` / `PrintableReport` generalizados: `cols: ["Actividad","Tu
respuesta"]`, `themeEmoji: "🌍"`, `praise: "¡aprendiste cómo cuidar el planeta!"`.
Nunca se exponen nombres internos ("Reto") en la UI.

---

## Estándares heredados (copiados de CCNN/lengua, NO inventados)

- Overlay **¡EXCELENTE!** (verde `#2ecc8f`) / **¡UPS!** (rojo `#ff6b6b`, frase de
  ánimo firmada por Sisa). Pantalla completa `rgba(0,0,0,0.55)` + blur.
- Chips de tema (~top:14) + indicador **"Ronda"** (palabra + puntitos, ~top:50).
- Modal de cambio de tema (texto copiado del juego de lengua). Modales
  salir/reiniciar con glow rojo/violeta; botones 150×56, logo HUD 60.
- Distribución `space-evenly`, enunciado con aire arriba/abajo.
- Fallar no baja el progreso; al fallar revelar la correcta; salir/reiniciar con modal.
- `markFirstAttempt()` en la 1.ª respuesta; `incrementGamesCompleted()` al terminar.

## Riesgos / notas

- Imágenes de props: 1 objeto por imagen, alta resolución (2048²), transparente,
  sin borde/anillo — regenerar grande desde el inicio (no se puede "enfocar" luego).
- Invariante del bundle: sin `</script>` literal en ningún `.jsx`; gemelos
  (`index.html` == `EDINUN GAMES.html`) idénticos tras `bundle.ps1`.
- QA visual la hace la autora en el navegador (Ctrl+F5 para saltar caché).
