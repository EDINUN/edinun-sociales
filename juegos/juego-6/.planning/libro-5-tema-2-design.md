# Libro 5 · Tema 2 — "La región amazónica" (9 años)

Del tema del libro **"La región amazónica"** (las 6 provincias del Oriente ecuatoriano).
Componente: `AmazoniaGame` (despacho `currentCategory === "l5-t2"`). Guía por defecto:
**Andi**. **Mecánicas elegidas por la autora** viendo bocetos ASCII en el chat, ronda por
ronda (R1 = A · R2 = B · R3 = C).

## Mecánica — 3 rondas, cada una DISTINTA (petición de la autora)

| Ronda | Mecánica | Qué hace el niño | Estado |
|---|---|---|:--:|
| R1 `PR1Capital` | **Tocar 1 de 4** | "¿Cuál es la capital de {provincia}?" → toca la capital correcta | ✅ |
| R2 `PR2Lupa` | **Explorar con la lupa** | La selva está a oscuras; mueve la lupa (sigue el puntero) para revelar y **toca** lo que le piden | ✅ |
| R3 `PR3Palabra` | **Armar la palabra** | Ordena las letras (con 2 señuelo) para escribir la capital + ¡VERIFICAR! | ✅ |

- `AmazoniaGame` usa un **arreglo `L5T2_ROUNDS`** de `{ C, verify, bubble }`; `TOTAL =
  ROUNDS.length`. Chrome compartido con `InterandinaGame` (HUD, RONDA dots, personaje+
  bocadillo, acciones, overlay ¡EXCELENTE!/¡UPS! con +1 ⭐, reporte de 3 filas). El
  ¡VERIFICAR! aparece solo en las rondas con `verify: true` (R3).
- Las 3 mecánicas son **distintas entre sí y frescas en el hub** (la lupa y el armar-palabra
  no se usan en ningún otro tema).

## Contenido (TEXTUAL del libro — no inventar)

- **6 provincias ↔ capital** (`L5T2_PROVINCIAS`): Sucumbíos→Nueva Loja (Lago Agrio) ·
  Orellana→El Coca · Napo→Tena · Pastaza→Puyo · Morona Santiago→Macas · Zamora
  Chinchipe→Zamora.
- **R2 fauna/tesoros** (`L5T2_FAUNA`, uno por provincia, del libro): delfín rosado 🐬 ·
  oso de anteojos 🐻 · aves exóticas 🦜 · cascada San Rafael 💧 · cuevas de los Tayos 🕳️ ·
  Parque Yasuní 🌳. Decoys NO amazónicos (`L5T2_DECOYS`): 🦙 🐧 🐢 ⛵ 🏔️ (Sierra/Costa/
  Insular) → buscar el correcto entre intrusos enseña qué es de la Amazonía.
- **R3 capitales de una palabra** (`L5T2_CAPITALES`): TENA (Napo) · PUYO (Pastaza) · MACAS
  (Morona Santiago) · ZAMORA (Zamora Chinchipe) · COCA (Orellana). Sucumbíos/Nueva Loja
  queda fuera de R3 (dos palabras) — se practica en R1.

## Dificultad y distribución

- **R3 con dificultad real** (petición de la autora): la bandeja trae las letras de la
  capital **+ 2 letras señuelo** que no van, todo barajado; hay que elegir las correctas y
  colocarlas **en orden**. Palabras de 4–6 letras.
- **Buena distribución** (sin overflow): R2 escena 450×300 centrada; R3 casillas + bandeja
  centradas en el espacio bajo el enunciado. Verificado overflow 0 en las 3 rondas.

## Imágenes

- **NINGUNA ronda necesita imágenes generadas.** R2 = emojis sobre selva CSS + lupa; R3 =
  fichas de letras. **R1** admite foto opcional por provincia `assets/l5t2-<slug>.jpg`
  (`L5Foto` con `prefix="l5t2"`), respaldo al emoji del tesoro — hoy con emoji.

## Anti-repetición

`L5T2_R1_KEY` (cap 4) · `L5T2_R2_KEY` (cap 3, rota el objetivo de la lupa) · `L5T2_R3_KEY`
(cap 3, rota la capital). Cada ronda elige **una sola vez al montar** (`useStateG(() =>
build())`) sobre el FIFO genérico `l3t2Recent/Push`. Ver [[anti-repeticion-al-recargar]].

## Verificación

- `format-lint.js juego-6` → 15/15.
- e2e (`scratchpad/qa-l5t2-full.js`): Libro 5 → La región amazónica → R1 tocar capital →
  R2 hallar con la lupa y tocar → R3 armar la palabra + ¡VERIFICAR! → reporte 3/3.
  Overflow 0 en las 3 rondas; anti-repetición 0 repes en 5 recargas (R2 objetivo y R3
  palabra); sin pageerrors.
