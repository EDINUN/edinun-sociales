# Design-doc — juego-6 · LIBRO 3 · TEMA 1 · "Hechos históricos relevantes de mi provincia"

> Segundo juego real del hub juego-6. Reemplaza el placeholder de
> `currentCategory === "l3-t1"`. Mecánica elegida por la autora: **Ventanas del
> pasado**, sobre los **personajes históricos** del libro. **Sin generar imágenes.**

## 1. Tema

- **Libro 3 · Tema 1 "Hechos históricos relevantes de mi provincia"** (EESS).
  Audiencia **7 años**.
- Qué enseña (del libro): **ecuatorianos ejemplares** y el **área** en que se
  destacaron (música, deporte, pintura, literatura, política). Como marco/recompensa
  aparecen otros contenidos del tema: la **Batalla de Pichincha** (independencia), el
  **Templo de la Patria** y las **regiones del Ecuador**.
- Personaje guía: lo elige el jugador (sugerido **Yaku**; default del shell: domi).
- **Sin imágenes.** Personas reales → NO se generan sus caras (saldrían inventadas,
  material escolar). Se usan **emoji del área + nombre**.

## 2. Nivel / navegación

Home → **Libro 3** (3 temas) → botón **"Hechos históricos"** → nombre + ENTRAR →
personaje → este juego. `currentCategory = "l3-t1"`,
`currentCatLabel = "Libro 3 · Hechos históricos"`. El label del tema en `screens.jsx`
pasó de "Tema 1" a **"Hechos históricos"**. (Temas 2 y 3 de Libro 3 siguen placeholder.)

## 3. Mecánica — "Ventanas del pasado"

> **Rediseño (opción A, decisión de la autora):** el **nombre** del personaje es el
> título y **su FOTO va tapada por las ventanas**, que se destapan al acertar. Al final,
> un **álbum** con los que descubrió. (La "postal del Ecuador" de la v1 queda reservada
> como posible bonus; ver §5.)

**Concepto:** cada partida son **`L3_ROUNDS` (4)** rondas, **un personaje por ronda**.
El **nombre es el título** (eyebrow chico "¿En qué se destacó?"); debajo, **su FOTO
tapada por una cuadrícula 2×2 de ventanas** (`L3Foto`). El niño **TOCA 1 de 3 áreas**
(emoji + palabra). **Acierta →** las ventanas se abren y **aparece su foto** + overlay
"{nombre} · área" + ⭐. **Falla →** el área correcta se marca en verde y **la foto NO se
destapa** (no lo descubrió), sin restar. Al terminar la ronda 4: **álbum**
(`L3AlbumCard`) con las fotos que **sí** descubrió (acertadas a color; falladas en gris
con 🔒) → "la imagen se muestra si elijo bien".

- **Título = el NOMBRE** del personaje (eyebrow QUÉ pequeño: "¿En qué se destacó?").
- **Bocadillo = CÓMO (fijo):** "Toca su área.<br />¡Descubre su foto!".
- **Fotos:** `assets/pers-<slug>.(jpg|png|jpeg|webp)` con respaldo 👤 (`L3Foto` /
  `L3AlbumCard`). Personas reales → fotos REALES del libro; NO se generan con IA.
- **Anti-repetición:** personajes FIFO (`L3_RECENT_KEY`, cap 6) → recargar/cambiar de
  niño varía (verificado 0 solapes).

## 4. Banco `PERSONAJES_L3` (del libro — persona ↔ área textual)

Áreas (5): 🎵 música · 🎨 pintura · ⚽ deporte · 🏛️ política · 📖 literatura.
Distractores = otras 2 áreas al azar (la correcta SÍ es del libro).

| Personaje | Área (del libro) |
|---|---|
| Julio Jaramillo | 🎵 música |
| Araceli Gilbert | 🎨 pintura |
| Oswaldo Guayasamín | 🎨 pintura |
| Glenda Morejón | ⚽ deporte |
| Richard Carapaz | ⚽ deporte |
| Eloy Alfaro | 🏛️ política |
| Rumiñahui | 🏛️ política *(el libro: "política y milicia")* |
| María Fernanda Heredia | 📖 literatura |
| Juan Montalvo | 📖 literatura *(el libro: "gran novelista de Ambato")* |

Banco de **9** (usar 4 por partida). ⚠ **Eduardo Kingman** se dejó fuera a propósito
(el libro lo etiqueta "arte" → mezclaría con "pintura" y sería injusto para el niño).
No añadir personajes sin material del libro.

## 5. Postales `POSTALES_L3` — RESERVADO (bonus opcional)

En la mecánica **A** las postales **ya no se usan** (el descubrimiento es la FOTO del
personaje). Quedan reservadas por si se añade un **bonus de "juego perfecto"**. Los
**prompts de imagen** (Batalla de Pichincha · Templo de la Patria · Regiones del
Ecuador, sitios/monumentos SIN caras) ya se entregaron a la autora. Si genera esas
imágenes, se pueden mostrar como regalo al terminar con 4/4.

## 6. Layout (lienzo 900×540) — mismos valores fijos de `estandar-visual.md`

- HUD: logo 64 · ⏱ · ⭐. RONDA **4 dots** (top:52).
- Zona central (left:215 right:215): **NOMBRE (título)** + eyebrow "¿En qué se destacó?" ·
  **foto 184 tapada por 4 ventanas** (`L3Foto`) · **3 tarjetas de área** en fila.
- Personaje izq (bocadillo CÓMO fijo) · acciones der REINICIAR/SALIR (right:18 top:50%).
- Overlay "{nombre} · área" al acertar (tras destaparse la foto) · **álbum final**
  (`L3AlbumCard` × log) → "¡Los descubriste a todos!" / "Tu álbum".
- Modales salir/reiniciar (destructivo → confirmación).

## 7. Log y reporte

`log[i] = { idx, emoji: 👤, a: nombre, userAnswer:"emoji área", correctAnswer:"emoji área",
isCorrect, time }`. Reporte estándar; `res.category = "Libro 3 · Hechos históricos"`.

## 8. Copy

- Tema (botón/label): **"Hechos históricos"**.
- Enunciado (QUÉ): "¿En qué se destacó este personaje?"
- Bocadillo (CÓMO, fijo): "Toca su área. ¡Abre ventanas!"
- Overlay: ¡EXCELENTE! / ¡UPS! · final "¡Descubriste: <postal>!" + dato.
- Frase de cierre (results): "¡Descubriste a personajes de tu historia!" — {personaje}.

## 9. Decisiones / riesgos

- **Emojis, no imágenes** (personas reales → no inventar caras). Nombre = texto.
- La correcta SÍ es del libro; distractores = otras áreas (contraste claro).
- La ventana se abre por RONDA (no solo al acertar) para que TODOS vean la postal +
  el dato; el ⭐ solo sube al acertar (no rompe "fallar no resta").
- Implementación: `GameScreen` añade `if (currentCategory === "l3-t1") return
  <VentanasGame/>`; el placeholder queda para l3-t2/l3-t3/l5-*/l6-*.
