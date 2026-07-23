# Design-doc — juego-6 · LIBRO 2 · "Reconociendo mi país"

> Primer juego real del hub juego-6 (4 libros). Reemplaza el placeholder del
> `currentCategory === "l2-t1"`. **Pedir OK antes de codear.**

## 1. Tema

- **Libro 2 · Tema 2 "Reconociendo mi país"** (del libro EESS). Audiencia **6 años**.
- Qué enseña (concreto, del libro): **nuestro país es Ecuador**, la **capital es
  Quito** (provincia de Pichincha), los **servicios básicos**, y **quién nos ayuda**
  (emergencias). Se deja fuera lo abstracto (prefecto/gobernador/consejo provincial →
  para niños mayores).
- Personaje guía: el jugador lo elige; sugerido **Andi** (representa al Ecuador) — pero
  se respeta la elección en CharacterScreen (default del shell: domi).
- **Sin imágenes**: emojis grandes (claros a 6 años). Código con respaldo por si luego
  se añaden imágenes a tarjetas puntuales.

## 2. Nivel / navegación

Este juego vive dentro del hub: Home → **Libro 2** → (1 tema, sin botones) → nombre +
ENTRAR → personaje → **este juego**. `currentCategory = "l2-t1"`,
`currentCatLabel = "Libro 2 · Reconociendo mi país"`. El label del tema en `screens.jsx`
pasa de "Tema 1" a **"Reconociendo mi país"**.

## 3. Mecánica — "Mira y toca" (patrón 5)

Molde: el juego DEMO de la `_PLANTILLA` (mismo formato EDINUN). Cada partida son
**`ROUNDS` (4)** preguntas del banco `PREGUNTAS_L2`, elegidas sin repetir las recientes.

- **Enunciado = la pregunta (QUÉ).** Cartel central con el emoji de contexto.
- **3 tarjetas** (emoji + palabra): la correcta + 2 distractores. El niño **TOCA** directo
  (sin VERIFICAR). Posición de la correcta variada.
- **Bocadillo de Domi = CÓMO, FIJO:** "Toca la respuesta<br />correcta." (no cambia al
  responder; el feedback va en el overlay).
- **Acierto** → tarjeta verde + ⭐ + "¡EXCELENTE!". **Fallo** → se revela la correcta
  (verde) dejando ver la tocada (roja) ~2 s, luego "¡UPS!"; **no resta**.
- **Estrellas**: +1 ⭐ por acierto. Timer informativo.
- **Anti-repetición** FIFO en `localStorage` (`RECENT_KEY_L2`, cap ≈ 5) → recargar/
  cambiar de niño no repite pregunta.

## 4. Banco `PREGUNTAS_L2` (del libro — la correcta sale del texto)

`{ ctx, enunciado, opciones:[{e,t}], correcta }`. Distractores = contrastes obvios
(no son datos del libro, solo opciones equivocadas claras). **La respuesta correcta SÍ
es del libro.**

1. 🌎 **¿Cómo se llama nuestro país?** → 🇪🇨 Ecuador · 🇵🇪 Perú · 🇨🇴 Colombia
2. 🏛️ **¿Cuál es la capital del Ecuador?** → Quito · Guayaquil · Cuenca
3. 💧 **¿Cuál es un servicio básico?** → 💧 Agua potable · 🧸 Juguete · 🍭 Dulce
4. 💡 **¿Qué servicio lleva la luz a tu casa?** → 💡 Energía eléctrica · 📺 Tele · 🎈 Globo
5. 🗑️ **¿Qué servicio recoge la basura?** → 🗑️ Recolección de basura · 🍎 Fruta · 🎨 Pintura
6. 📞 **¿A quién llamas en una emergencia?** → 📞 ECU 911 · 🎮 Videojuego · 🛒 Tienda
7. 🚒 **¿Quién apaga los incendios?** → 🚒 Bomberos · 🤡 Payaso · 🧑‍🍳 Cocinero
8. 👮 **¿Quién cuida el orden en la ciudad?** → 👮 Policía · 🎤 Cantante · 🎨 Pintor
9. ⛑️ **¿Quién da los primeros auxilios?** → ⛑️ Cruz Roja · 👷 Albañil · 👨‍🌾 Agricultor
10. 🌆 **¿Cuál es la ciudad con más habitantes?** → Guayaquil · Puyo · Manta *(del censo
    2022 del libro; opcional/algo más difícil)*

Banco de **10** (usar 4 por partida). ⚠ No añadir ítems sin material del libro.

## 5. Layout (lienzo 900×540)

Idéntico al DEMO de la `_PLANTILLA` (valores fijos de `estandar-visual.md`):
- HUD: logo 64 · ⏱ · ⭐. RONDA con **4 dots** (top:52).
- Enunciado (QUÉ) arriba · cartel con el emoji de contexto · **3 tarjetas** grandes.
- Personaje izq (bocadillo CÓMO fijo) · acciones der REINICIAR/SALIR (right:18, top:50%).
- Overlay ¡EXCELENTE!/¡UPS! · modales salir/reiniciar.

## 6. Log y reporte

`log[i] = { idx, emoji: ctx, a: enunciado, userAnswer:"e t", correctAnswer:"e t", isCorrect, time }`.
Reporte estándar: subtítulo "Reporte académico · Estudios Sociales";
`res.category = "Libro 2 · Reconociendo mi país"`. Celdas: Preguntas/Correctas/Estrellas/Precisión.

## 7. Glifos

Se mantiene el CosmosBg del hub (glifos de libros/estudios sociales). No se cambian por tema.

## 8. Copy

- Tema (botón/label): **"Reconociendo mi país"**.
- Enunciados: las preguntas del §4 (QUÉ).
- Bocadillo (CÓMO, fijo): **"Toca la respuesta correcta."**
- Overlay: ¡EXCELENTE! / ¡UPS! (+ ánimo al fallar).
- Frase de cierre (results): "¡Ya reconoces tu país!" — {personaje}.

## 9. Decisiones / riesgos

- **Emojis, no imágenes** (decisión de la autora). Arquitectura lista para imágenes con
  respaldo si se quisieran después.
- Distractores = contrastes obvios (no datos del libro); la correcta SÍ es del libro.
- Preguntas de población/región son opcionales (algo más abstractas para 6).
- Implementación: `GameScreen` despacha `if (currentCategory === "l2-t1") return
  <ReconoceGame/>` (el placeholder queda para los demás temas).
