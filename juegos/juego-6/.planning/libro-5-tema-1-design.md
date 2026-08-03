# Libro 5 · Tema 1 — "Región Interandina" (9 años)

Del tema del libro **"Provincias de la región Interandina"** (las 10 provincias de la
Sierra ecuatoriana, recorridas de norte a sur). Componente: `InterandinaGame`
(despachado por `currentCategory === "l5-t1"`). Personaje por defecto: **Andi**.

## Mecánica — 3 rondas, cada una DISTINTA (petición de la autora)

| Ronda | Mecánica | Qué hace el niño |
|---|---|---|
| R1 `PR1Provincia` | **Tocar 1 de 4** | "¿De qué provincia es {lugar}?" → toca la provincia correcta |
| R2 `PR2OrdenNS` | **Arrastrar (ordenar)** | Ordena 3 provincias de NORTE a SUR |
| R3 `PR3Empareja` | **Emparejar** | Une la **vestimenta** (foto real del traje) con su **pueblo** (nombre + provincia de etiqueta) + ¡VERIFICAR! · solo pueblos con `vest`/foto |

- Chrome compartido con `TerritorioGame`: HUD, RONDA (3 dots), personaje+bocadillo,
  acciones (¡VERIFICAR! en R2/R3), overlay ¡EXCELENTE!/¡UPS! con **+1 ⭐**, reporte 3 filas.
- Avance automático. Al fallar se ve la respuesta correcta antes del ¡UPS!
  (R2 ~2.3 s por el revelado; R1/R3 ~1.8 s).

## Contenido (TEXTUAL del libro — no inventar)

- **Provincias (N→S):** Carchi · Imbabura · Pichincha · Cotopaxi · Tungurahua ·
  Chimborazo · Bolívar · Cañar · Azuay · Loja (`L5_ORDEN_NS`).
- **R1 `L5_LUGARES` (26):** un lugar/atractivo **único** por provincia (Laguna Verde,
  Bosque de Polylepis → Carchi; Otavalo, Mojanda, Peguche → Imbabura; Mitad del Mundo,
  Quito, Mindo → Pichincha; Cotopaxi, Quilotoa, El Boliche → Cotopaxi; Baños, Flores y
  Frutas, Sangay → Tungurahua; Guano, Colta → Chimborazo; Salinas, Guaranda → Bolívar;
  Ingapirca, Culebrillas → Cañar; Cuenca, Cajas, Chordeleg → Azuay; Vilcabamba, El Cisne,
  Puyango → Loja). Se evitan ítems ambiguos (Inti Raymi sale en Imbabura Y Cañar → fuera).
- **R3 `L5_PUEBLOS` (7):** Otavalo→Imbabura · Cayambi→Pichincha · Panzaleo→Cotopaxi ·
  Salasaka→Tungurahua · Waranka→Bolívar · Puruwá→Chimborazo · Saraguro→Loja. **"Cañari"
  se excluye** (el libro lo asigna a Cañar Y Azuay → ambiguo para emparejar).

## Decisiones / avisos

- **Imágenes:** R1 usa **FOTOS REALES opcionales** (`L5Foto`: prueba `assets/l5-<slug>.
  (jpg|png|jpeg|webp)`, cae al emoji si falta). **NO se generan con IA** — salen de las
  **fotos del libro** (EDINUN, sin líos de derechos) + **Wikimedia Commons** (licencia
  libre). Subidas: 11 fotos → **las 10 provincias tienen al menos una** (`quilotoa,
  otavalo, mitad-del-mundo, ingapirca, cuenca, vilcabamba, banos, bosque-polylepis, colta,
  salinas, el-cisne`); el resto (15 lugares) en emoji. ⚠ Extensión en **minúscula**
  (producción Linux distingue mayúsculas).
- ⚠ **Chimborazo:** el libro trae **dos alturas** distintas (pág. 56 = 6263 m, pág. 59 =
  6310 m). Para no meter un dato equivocado, **no se usa la altura exacta** en el juego.
- Alternativa descartada para R3 (por ahora): clasificar Sierra Norte/Centro/Sur — el
  libro **no** da esa partición (la deja como R.A. para el alumno) → habría que pedirla a
  la autora para no inventar.

## Anti-repetición

`L5_R1_KEY` (cap 10) · `L5_R2_KEY` (cap 4, clave = trío) · `L5_R3_KEY` (cap 4), todas
sobre el FIFO genérico `l3t2Recent/Push`. Cada sub-componente elige **una sola vez al
montar** (`useStateG(() => build())`), no en cada render.

## Verificación

- `format-lint.js juego-6` → 15/15.
- e2e (`scratchpad/qa-l5.js`): Libro 5 → Región Interandina → R1 tocar → R2 ordenar
  (revelado "AQUÍ VA") → R3 emparejar → reporte. Overflow 0 en las 3 rondas; sin
  pageerrors; 3 tarjetas arrastrables en R2; matching con **línea + color** en R3.

## Cambios posteriores (2026-07-29)

- **R3 sin números de pareja** (la autora: *"si ya ponemos las líneas de unir entonces
  quitemos los números"*). El enlace se lee con la **línea curva de color** + el borde de
  las dos tarjetas + el puntito de anclaje; el número solo repetía esa información. Se
  quitaron los dos badges (el de la foto y el del pueblo); el ✓/✗ de la verificación queda.
- 🐛 **El ✓/✗ y la etiqueta del pueblo correcto salían recortados**: la tarjeta de traje
  llevaba `overflow:hidden` para recortar la foto a las esquinas redondeadas, y eso también
  cortaba los badges que sobresalen (`top/right:-9`, `bottom:-11`). Al fallar, la respuesta
  correcta quedaba ilegible → **rompía la invariante "al fallar, revelar la correcta"**.
  Arreglado moviendo el recorte a un `<span>` interno con la foto (`inset:0`, radio 13) y
  dejando el botón con overflow visible. **Regla:** si una tarjeta recorta su imagen, el
  recorte va en la imagen, nunca en el contenedor que lleva badges salientes.
- **Enunciado con punto final** ("Une la vestimenta con su pueblo.") — ver la pasada de
  puntuación de enunciados del juego-6.
- **R1: el enunciado bajó 16 px** (lo pidió la autora: *"colócalo un poquito más abajo"*).
  `paddingTop` del contenedor **8 → 24**: con 8 el enunciado caía en **y=68** y los puntos
  de RONDA terminan en **y=67**, o sea pegados. Ahora va en y=84; la tarjeta y las opciones
  bajan solo la mitad (8 px) porque el bloque de abajo va centrado en el espacio restante,
  y la fila de provincias cierra en **y=491**, con 31 px hasta el borde de la zona de juego
  (522). Verificado en 4 viewports: overflow 0.
