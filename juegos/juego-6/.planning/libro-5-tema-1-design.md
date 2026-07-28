# Libro 5 · Tema 1 — "Región Interandina" (9 años)

Del tema del libro **"Provincias de la región Interandina"** (las 10 provincias de la
Sierra ecuatoriana, recorridas de norte a sur). Componente: `InterandinaGame`
(despachado por `currentCategory === "l5-t1"`). Personaje por defecto: **Andi**.

## Mecánica — 3 rondas, cada una DISTINTA (petición de la autora)

| Ronda | Mecánica | Qué hace el niño |
|---|---|---|
| R1 `PR1Provincia` | **Tocar 1 de 4** | "¿De qué provincia es {lugar}?" → toca la provincia correcta |
| R2 `PR2OrdenNS` | **Arrastrar (ordenar)** | Ordena 3 provincias de NORTE a SUR |
| R3 `PR3Empareja` | **Emparejar** | Une cada pueblo con su provincia (color + número) + ¡VERIFICAR! |

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

- **Imágenes:** **solo emoji, SIN imágenes** — decisión de la autora (2026-07-28:
  *"no debo generar imágenes"*). No se añaden fotos a este tema.
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
  pageerrors; 3 tarjetas arrastrables en R2; matching con color+número en R3.
