# CLAUDE.md — juego-6 (Estudios Sociales) · HUB DE 4 LIBROS

## Project

**juego-6 es un HUB de 4 libros** de Estudios Sociales, con un **menú de 2 niveles**:
Home muestra 4 botones de **LIBRO** (Libro 2 · Libro 3 · Libro 5 · Libro 6) y, al
tocar uno, se abre su pantalla de **TEMAS**. Cada libro tiene su propio número de temas:

| Libro | Temas | Estado |
|-------|-------|--------|
| Libro 2 | **1 tema** — "Reconociendo mi país" (6 años) | ✅ hecho |
| Libro 3 | **3 temas** | ⏳ placeholder |
| Libro 5 | **2 temas** | ⏳ placeholder |
| Libro 6 | **1 tema** | ⏳ placeholder |

> Historial: juego-6 fue antes "Explora el Ecuador" (provincias del Ecuador). La autora
> pidió descartarlo y reconstruir juego-6 como este hub de libros (2026-07-23). El juego
> de provincias sigue en el historial de git.

En móvil el diseño es horizontal pero el dispositivo se sostiene vertical (overlay
bloqueante hasta rotar). **Preferencias del usuario:** `USER.md`.

## Arquitectura del menú (propio de juego-6, NO toca el shell)

El 2º nivel (Libro → temas) vive **dentro del route `home`** (estado interno de
`HomeScreen`), sin modificar `app.jsx` (que sigue enrutando `home → character → game →
results`). En `screens.jsx`:
- **`LIBROS`** = array `[{ id, label, temas:[{id,label}] }]`. Gradiente del botón por
  **posición** (1º naranja · 2º amarillo · 3º azul · 4º violeta).
- `HomeScreen` con estado `libroId`: nivel 1 = 4 botones de libro; nivel 2 = temas del
  libro (con "← Libros"). 1 tema → sin botones (nombre + ENTRAR directo); N temas →
  N botones + nombre + ENTRAR. Al entrar fija `currentCategory` (id del tema, p. ej.
  `l2-t1`) y `currentCatLabel` (`"Libro 2 · Reconociendo mi país"`).
- **`format-lint` ve 0 temas** (no hay literal `catLabel:` en `screens.jsx`; se usa
  `label`/`currentCatLabel`) → no exige la rejilla de un menú plano; los botones de
  libro/tema siguen el estándar a mano.

## game-screens.jsx

`GameScreen` **despacha por `app.currentCategory`**:
- `"l2-t1"` → **`ReconoceGame`** (Libro 2).
- cualquier otro (l3-t1, l3-t2, l3-t3, l5-t1, l5-t2, l6-t1) → **`PlaceholderGame`**
  ("en construcción · {libro · tema}") — mismo chrome EDINUN, hasta implementar su juego.
- `ResultsScreen`/`PrintableReport` sirven a ambos (log vacío en placeholder).

Al implementar un tema nuevo: crear su componente y añadir `if (currentCategory ===
"<id>") return <SuJuego/>;` en `GameScreen`. Guardar su design-doc en
`.planning/libro-N-design.md` y renombrar su `label` en `LIBROS`.

### Libro 2 · "Reconociendo mi país" (`ReconoceGame`, 6 años)

**Mira y toca** (patrón 5, molde del DEMO de la `_PLANTILLA`): 4 rondas del banco
`PREGUNTAS_L2` (10, del libro), 3 tarjetas (emoji + palabra), el niño **TOCA** la
correcta (sin VERIFICAR). Bocadillo **fijo** = CÓMO ("Toca la respuesta correcta."); no
cambia al responder. Acierto → verde + ⭐ + ¡EXCELENTE!; fallo → revela la correcta
(verde) dejando ver la tocada (roja) ~2 s, luego ¡UPS!, no resta. Anti-repetición FIFO
(`L2_RECENT_KEY`, cap 6) → recargar da preguntas nuevas (2+ partidas sin repetir).
**Emojis, sin imágenes** (decisión de la autora); las opciones se barajan por ronda.
Diseño en `.planning/libro-2-design.md`.

⚠ **Contenido del libro:** las respuestas correctas salen del TEMA 2 "Reconociendo mi
país" (país=Ecuador, capital=Quito, servicios básicos, quién ayuda). Los distractores
son contrastes obvios (no datos del libro). No añadir ítems sin material del libro.

## Personajes

Elenco compartido (domi/sisa/yaku/andi). El jugador elige guía en CharacterScreen
(default del shell: domi). Sugerencia temática por libro/tema al implementarlos.

## Contador de visitas

`counter.php` idéntico a los demás; cae a `localStorage` sin PHP. `visits.txt`
gitignoreado — borrarlo antes de subir a producción.

## QA

```bash
node juegos/_PLANTILLA/.planning/format-lint.js juego-6   # 15/15 OK (con un juego real)
node juegos/_PLANTILLA/.planning/qa-visual.js  juego-6    # 6 viewports, sin overflow
```
Empaquetar tras editar `.jsx`: `node .planning/bundle.js` (ambos HTML idénticos).
Cada juego con banco: probar anti-repetición recargando (0 solapes).

> **Landing:** el card de juego-6 muestra un título/charId placeholder hasta definir el
> título global del hub con la autora.
