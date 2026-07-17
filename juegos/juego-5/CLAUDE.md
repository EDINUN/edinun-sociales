# CLAUDE.md — juego-5 · Tema "Aprendiendo" (Estudios Sociales)

## Project

**Juego: (título global PENDIENTE — la autora lo elige al terminar).** Carpeta
autocontenida del repo multi-juego `edinun-sociales` (Estudios Sociales). Juego
sobre **las personas que trabajan en la escuela** (TEMA 3 del libro, "Aprendiendo
con mis compañeros y compañeras de clase"), con personaje guía **Domi**.
Diseño en `.planning/juego-5-design.md`. Bitácora en `MEMORY.md`.

**Audiencia 6** (registrada en `memory/audiencia_por_juego.md`).

**Plan de crecimiento:** el juego tendrá **4 botones = 4 temas del libro** (pedido
de la autora). Hoy existe solo el Tema 1 (`id: aprendiendo`, chip **"Aprendiendo"**);
al llegar el material del 2º tema, migrar el Home a chips (`LEVELS_CFG`, patrón
juego-4) con gradiente por posición.

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
- `screens.jsx`: `HomeScreen`, `CharacterScreen`, contador de visitas, `CosmosBg`
  (glifos de comunidad escolar). `CharacterScreen.choose()` fija
  `currentCategory: "aprendiendo"` / `currentCatLabel: "Aprendiendo"`.
- `game-screens.jsx`: **la mecánica.** `GameScreen` + `ResultsScreen` (reporte
  académico imprimible).

### Mecánica (`game-screens.jsx`)

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

**Textos (regla dura):** el **enunciado** es la pregunta del banco (QUÉ) y el
**bocadillo** de Domi dice el CÓMO ("Toca a la persona correcta.").

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
