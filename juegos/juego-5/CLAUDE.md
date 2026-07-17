# CLAUDE.md — juego-5 "Aprendiendo" (Estudios Sociales)

## Project

**Juego: "Aprendiendo".** Carpeta autocontenida del repo multi-juego
`edinun-sociales` (Estudios Sociales). Juego **multi-tema** con personaje guía
**Domi**. Diseño en `.planning/juego-5-design.md`. Bitácora en `MEMORY.md`.

- **Tema 1 — "Mi escuela"** (`id: aprendiendo`, audiencia **6**): las personas que
  trabajan en la escuela. Mecánica **¿QUIÉN? (tocar)** — pregunta + 3 tarjetas
  (imagen + nombre), el niño toca a la persona. 3 rondas · banco de 12 personas.
- **Tema 2 — "Medios de transporte"** (`id: transporte`, audiencia **6**):
  clasificar transportes por vía. Mecánica **CLASIFICAR (arrastrar)** — 4 transportes
  (emoji) a 3 cajones **🛣️ Tierra / 🌊 Agua / ☁️ Aire** + ¡VERIFICAR! 3 rondas ·
  banco de 16 transportes. **Sin imágenes**: los emojis de transporte se leen claros.

**Audiencia 6** (registrada en `memory/audiencia_por_juego.md`).

**Plan de crecimiento:** el juego tendrá **4 botones = 4 temas del libro** (pedido
de la autora). Hoy hay 2; al llegar el 3º, añadir entrada a `LEVELS_CFG` con
gradiente por posición (3º azul · 4º violeta).

En móvil el diseño es horizontal pero el dispositivo se sostiene vertical: el
usuario gira físicamente el teléfono (overlay bloqueante hasta rotar).

- **Preferencias del usuario** (usabilidad, QA responsive, invariantes): `USER.md`.
  **Léelo antes de cualquier cambio de UI o flujo.**

## Running / deploying

No build system, no package manager. HTML estático que carga React 18 + Babel
Standalone desde unpkg.

- **Abrir local:** doble clic en `index.html`.
- **Servir local:** servidor estático desde la raíz del repo (esta máquina no
  tiene Python real ni PHP; usar Node).
- **Contador PHP real:** requiere PHP (`php -S localhost:8000`); sin PHP cae a
  `localStorage` (lo normal en local).

## Architecture

Mismo shell que los demás juegos. Los 5 `.jsx` (`logo`, `characters`, `screens`,
`game-screens`, `app`) son la fuente editable. Tras editar, re-empaquetar:

```powershell
powershell -ExecutionPolicy Bypass -File .planning\bundle.ps1
```
o `node .planning/bundle.js`. Verificar que ambos HTML quedan idénticos.

Invariantes:
- **No incluir `</script>` literal en ningún `.jsx`** (partir el token si hace falta).
- **El bundle reescribe desde `<script type="text/babel">` hasta `</html>`**.

### Contrato del shell

- `app.jsx` enruta por estado: `home → character → game → results`. No tocar salvo
  cambio de shell coordinado con los demás juegos.
- `screens.jsx`: `HomeScreen` (chips de tema), `CharacterScreen`, contador,
  `CosmosBg`. Define el array **`LEVELS_CFG`** con los 2 temas (aprendiendo +
  transporte); los chips del Home fijan `app.level` → `app.currentCategory` /
  `currentCatLabel`. Se exporta `LEVELS_CFG` en `window` (lo usa `TemaChipsBar`).
- `game-screens.jsx`: **la mecánica.** `GameScreen` **despacha por
  `app.currentCategory`**: `"transporte"` → `<TransporteGame/>`; en otro caso →
  `<PersonasGame/>` (Tema 1). `TemaChipsBar` (chips para cambiar de tema sin volver
  al Home, con modal). `ResultsScreen`/`PrintableReport` sirven a ambos temas
  (mismo shape de `log`; `res.category` = `currentCatLabel`).

### Mecánica Tema 1 (`PersonasGame`)

**"Mira y toca" con tarjetas de dibujo** (patrón 5 de la biblioteca de la skill):
cada partida son **`ROUNDS` (3)** preguntas "¿Quién…?" del banco **`PERSONAS`
(12)** — 6 personas del libro + 6 aprobadas por la autora. Por pregunta salen
**3 tarjetas** (dibujo + nombre): la correcta + **2 distractores al azar** del
mismo banco (`buildRounds`), barajadas. El niño TOCA directo (sin VERIFICAR).
Acierto → verde + ⭐ + ¡EXCELENTE!; fallo → se revela la correcta (verde) dejando
ver la tocada (roja) ~2 s, luego ¡UPS!; no resta. Anti-repetición FIFO
(`RECENT_KEY`, cap 6) → 4 partidas sin repetir pregunta.

**Imágenes:** cada tarjeta carga `assets/persona-<id>.jpg` vía `PersonaImg`
(con `key={persona.id}`); si falta el archivo cae al **emoji placeholder**
(`onError`). Las 12 las generó la autora (2026-07-16), **cuadradas** (2048×2048),
optimizadas a **640×640 · JPEG q85 (~90 KB c/u)**. Si se reemplaza alguna:
generarla **cuadrada** (prompt con `square image, 1:1 aspect ratio` — regla #17 de
la skill) y repetir esa optimización (los originales ~6.5 MB son inviables para web).

⚠ **El banco sale del libro + aprobación de la autora. NO añadir ni reformular
ítems sin consultarle** (material escolar).

### Mecánica Tema 2 (`TransporteGame`)

**Clasificar arrastrando** (patrón 8; molde `ClimaRound`/`BasuraGame` de juego-3):
**3 rondas**; cada ronda son **4 transportes** (1 garantizado por vía + 1 extra) del
banco **`TRANSPORTES` (16)** que se arrastran a 3 cajones **`VIAS`** (tierra/agua/
aire) y se toca **¡VERIFICAR!**. Al fallar: círculo rojo ✗ en la tarjeta + flecha
**➜** a su vía correcta (deja ver dónde la puso el niño). Anti-repetición FIFO
(`RECENT_KEY_T`, cap 8); los 3 tableros de la partida no repiten transporte.
**Emojis, no imágenes** (los medios de transporte se leen claros). Clasificar por
vía NO es dato inventado — pero el banco de transportes lo elegí yo del tema del
libro; ampliarlo/cambiarlo, confirmar con la autora.

**Textos (regla dura):** el **enunciado** es la tarea (QUÉ) y el **bocadillo** de
Domi dice el CÓMO. T1: "Toca a la persona correcta." · T2: "Arrastra y suelta en su vía."

Reglas EDINUN que la mecánica respeta (ver `USER.md` y `memory/`):
- Fallar no baja el progreso ya ganado; completar el objetivo cuenta como éxito.
- Al fallar, revelar la respuesta correcta dejando ver lo que eligió el niño.
- Salir/reiniciar siempre con modal.
- `markFirstAttempt()` en la primera respuesta; `incrementGamesCompleted()` al terminar.

### Personajes

Catálogo compartido (elenco por regiones del Ecuador): Domi (`domi`, Costa,
montubia), Sisa (`sisa`, Sierra, kichwa otavaleña), Yaku (`yaku`, Oriente, kichwa
amazónico) y Andi (`andi`, cóndor tricolor del Ecuador). **Personaje destacado:
`domi`.** Arte en `assets/char-domi.png`.

## Contador de visitas

`counter.php` (idéntico en todos los juegos) cuenta visitas globales; cae a
`localStorage` si el servidor no ejecuta PHP. No personalizar. `visits.txt` está
gitignoreado — borrarlo antes de subir a producción.

## QA

```bash
node juegos/_PLANTILLA/.planning/format-lint.js juego-5   # valores fijos del estándar
node juegos/_PLANTILLA/.planning/qa-visual.js  juego-5    # 6 viewports, sin overflow
```

⚠ **El juego NO está en el landing** (`GAMES` del index.html raíz) hasta que la
autora elija el título global.
