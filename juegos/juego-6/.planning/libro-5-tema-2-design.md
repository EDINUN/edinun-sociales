# Libro 5 · Tema 2 — "La región amazónica" (9 años)

Del tema del libro **"La región amazónica"** (las 6 provincias del Oriente ecuatoriano).
Componente: `AmazoniaGame` (despacho `currentCategory === "l5-t2"`). Guía por defecto:
**Andi** (decisión de la autora; Yaku encajaba pero se mantiene Andi por consistencia
con el Libro 5). Bocetos aprobados por la autora (dibujados en el chat).

## Mecánica — 3 rondas, cada una DISTINTA (petición de la autora)

| Ronda | Mecánica | Qué hace el niño | Estado |
|---|---|---|:--:|
| R1 `PR1Capital` | **Tocar 1 de 4** | "¿Cuál es la capital de {provincia}?" → toca la capital correcta | ✅ |
| R2 (arrastrar) | **Clasificar** | "Arrastra SOLO las de la Amazonía" a la canasta 🌴 (con intrusas de Sierra/Costa) | ⏳ |
| R3 (tocar mapa) | **Ubicar** | "¿Dónde queda {provincia}?" → toca su zona en el mapa del Ecuador | ⏳ |

- `AmazoniaGame` usa un **arreglo `L5T2_ROUNDS`** de `{ C, verify, bubble }` → crece de 1 a
  3 rondas sin refactor; `TOTAL = ROUNDS.length`. Chrome compartido con `InterandinaGame`
  (HUD, RONDA dots, personaje+bocadillo, acciones, overlay ¡EXCELENTE!/¡UPS! con +1 ⭐,
  reporte). El ¡VERIFICAR! aparece solo en las rondas con `verify: true` (R2).

## Contenido (TEXTUAL del libro — no inventar)

- **6 provincias ↔ capital** (`L5T2_PROVINCIAS`): Sucumbíos→Nueva Loja (Lago Agrio) ·
  Orellana→El Coca · Napo→Tena · Pastaza→Puyo · Morona Santiago→Macas · Zamora
  Chinchipe→Zamora.
- **Tesoro/dato por provincia** (para R3 y respaldo emoji): Sucumbíos 🐬 delfín rosado ·
  Orellana 🌳 Yasuní/waorani · Napo 💧 cascada San Rafael / mayor biodiversidad · Pastaza
  🦜 aves exóticas / muchos ríos · Morona Santiago 🕳️ cuevas de los Tayos (shuar) · Zamora
  Chinchipe 🐻 oso de anteojos / oro.
- **Intrusas para R2** (NO amazónicas, del propio libro/currículo): provincias de Sierra
  (Azuay, Pichincha…) y Costa (Guayas, Manabí…).
- **Generales:** limita con Colombia y Perú; relieve cadena montañosa + llanura; clima
  tropical 15–40 °C; selva; ríos que forman el Amazonas; mayor cantidad de especies por m².

## Imágenes

- **R1:** foto opcional por provincia `assets/l5t2-<slug>.jpg` (`L5Foto` con `prefix
  ="l5t2"`), respaldo al emoji del tesoro. Ideal: foto de cada capital/paisaje (la autora
  las puede subir o se sacan del libro/Wikimedia). Hoy: emojis.
- **R3:** mapa del Ecuador **EXACTO** (fuente libre/precisa, NO IA — los límites deben ser
  correctos). Pendiente de conseguir al construir R3.
- **R2:** sin imágenes (solo texto).

## Anti-repetición

`L5T2_R1_KEY` (cap 4). Cada ronda elige **una sola vez al montar** (`useStateG(() =>
build())`) sobre el FIFO genérico `l3t2Recent/Push`. Verificado R1: 6 recargas sin
provincia repetida en consecutivas. Ver [[anti-repeticion-al-recargar]].

## Verificación

- `format-lint.js juego-6` → 15/15.
- R1 (`scratchpad/qa-l5t2-r1.js`): entra por Libro 5 → "La región amazónica" → toca la
  capital correcta → reporte; overflow 0; anti-repetición 0 repes en 6 recargas; sin
  pageerrors.
