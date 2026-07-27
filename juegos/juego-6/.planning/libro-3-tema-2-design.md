# Design-doc — juego-6 · LIBRO 3 · TEMA 2 · "La identidad territorial"

> Tercer juego real del hub. Reemplaza el placeholder de `currentCategory === "l3-t2"`.
> Audiencia **7 años**. Decisión de la autora: **3 rondas encadenadas, cada una con una
> mecánica DISTINTA** (como en juego-4/juego-5). Todo el contenido sale **del libro**.

## Rondas (3 mecánicas distintas)

| Ronda | Tema | Interacción |
|-------|------|-------------|
| **R1** | Las **regiones** | 👆 **tocar 1 de 4** + **destapar imagen** de la región (estilo Tema 1) |
| **R2** | La **organización** del Estado | ✋ **arrastrar para ordenar** (mayor→menor), rota entre los 3 regímenes |
| **R3** | Las **provincias** | 👆 **tocar varias** (las de la región pedida) + **¡VERIFICAR!** |

Las 3 se sienten distintas (tocar‑1 · arrastrar · tocar‑varias) y tocan partes distintas
del tema (regiones · organización · provincias). Anti‑repetición por ronda → recargar varía.

## R1 — "¿De qué región es?" (`R1Region`)

Aparece un **ítem** (plato / elemento típico) y el niño toca su **región** (Costa / Sierra /
Amazonía / Insular). **Acierta →** se destapan 4 ventanas y aparece la **imagen de la
región** (`region-<slug>.jpg`, respaldo al emoji). **Falla →** el botón correcto se marca
en verde, la imagen queda tapada. Bocadillo (CÓMO): "Toca su región."

- Banco `L3T2_ITEMS` (del tema): Costa = mariscos, verde, playa, pescado · Sierra = fritada,
  cuy, nevado, llama · Amazonía = maito, selva, tucán, río · Insular = tortuga, iguana,
  Galápagos. (Platos textuales del libro; naturaleza = lo que define cada región en el tema.)
- **Imágenes de región** (4, las genera la autora, paisajes SIN caras): `region-costa.jpg`,
  `region-sierra.jpg`, `region-amazonia.jpg`, `region-insular.jpg` en `assets/`.

## R2 — "Ordena de mayor a menor" (`R2Orden`)

3 tarjetas que se **arrastran** para ordenarlas de **Provincia › Cantón › Parroquia**. La
variedad sale de **rotar entre los 3 modelos del libro** (diagrama "Modelo para la
administración del Estado"):

- **Régimen seccional dependiente:** Gobernador (Provincia) › Jefe Político (Cantón) ›
  Teniente Político (Parroquia).
- **Régimen seccional autónomo:** Provincia › Cantón › Parroquia.
- **Gobiernos seccionales autónomos:** Consejo Provincial › Consejo Municipal › Junta
  Parroquial.

Cada tarjeta muestra su **nivel** como pista (7 años). `¡VERIFICAR!` → acierto verde; al
fallar, se reordena al correcto (revela). Bocadillo (CÓMO): "Ordena de mayor a menor."

## R3 — "Toca las provincias de la región" (`R3Provincias`)

Salen **6 provincias mezcladas**; el niño **toca las que pertenecen a la región pedida**
(se marcan) → `¡VERIFICAR!`. Correctas verde, mal‑elegidas rojo (revela). Rota la región
objetivo entre **Sierra / Costa / Amazonía** (las que tienen varias provincias) → varía.
Bocadillo (CÓMO): "Toca las provincias correctas."

- Provincias por región (`L3T2_PROVINCIAS`, del libro): Sierra/Interandina (10) · Costa (7)
  · Amazonía (6) · Insular (1 = Galápagos). Se muestran 3 correctas + 3 distractoras.

## Reglas EDINUN respetadas

- Enunciado = QUÉ (la consigna de cada ronda) · Bocadillo = CÓMO (fijo por ronda).
- Fallar **no resta** ⭐ (solo no suma). Al fallar se **revela lo correcto**.
- Avance entre rondas **automático** (no botón "siguiente"). Único botón primario:
  **¡VERIFICAR!** (R2, R3). R1 es tocar directo.
- Salir/Reiniciar con modal. `markFirstAttempt()` en la 1ª acción; `incrementGamesCompleted()`
  al terminar. Reporte estándar (3 filas).

## Layout / estándar

HUD (logo 64 · ⏱ · ⭐) · RONDA **3 dots** (top:52) · personaje izq (bocadillo CÓMO por
ronda) · acciones der REINICIAR/SALIR (right:18) · zona central por ronda · overlay
¡EXCELENTE!/¡UPS! · modales. `GameScreen` despacha `l3-t2 → TerritorioGame`. Label del tema
en `screens.jsx`: "Tema 2" → **"Identidad territorial"**.
