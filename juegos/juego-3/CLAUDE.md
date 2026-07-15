# CLAUDE.md — juego-3 "Cuido mi planeta" (Estudios Sociales)

## Project

**Juego: Cuido mi planeta.** Carpeta autocontenida del repo multi-juego
`edinun-sociales` (Estudios Sociales). Juego **multi-tema** sobre el cuidado del
ambiente, con personaje guía **Sisa**. Tiene **2 temas** seleccionables desde el
Home (chips de cambio de tema arriba en la pantalla de juego):

> **Renombrado el 2026-07-15:** el juego se llamaba "Cuido mi entorno"; ese nombre
> pasó a ser el **Tema 1** y el juego tomó un título paraguas que cubre los 2 temas.

- **Tema 1 — "Cuido mi entorno"** (`id: reciclaje`, audiencia **6**): arrastrar 6
  residuos a 3 tachos (amarillo/azul/café) y presionar **VERIFICAR**. 1 sola ronda.
- **Tema 2 — "Cambio climático"** (audiencia **9**): **3 rondas encadenadas con
  mecánicas distintas** que terminan en un reporte combinado.

Detalle del diseño en `.planning/juego-3-design.md`.

**Audiencia 6 (Tema 1) y 9 (Tema 2)** — registrada en
`memory/audiencia_por_juego.md`. Los libros/láminas se usaron solo para
**entender el tema**, NO para copiar actividades 1:1.

En móvil el diseño es horizontal pero el dispositivo se sostiene vertical: el
usuario gira físicamente el teléfono (overlay bloqueante hasta rotar).

- **Bitácora del proyecto:** `MEMORY.md`.
- **Preferencias del usuario** (usabilidad, QA responsive, invariantes): `USER.md`.
  **Léelo antes de cualquier cambio de UI o flujo.**

## Running / deploying

No build system, no package manager. HTML estático que carga React 18 + Babel
Standalone desde unpkg.

- **Abrir local:** doble clic en `index.html`.
- **Servir local:** `python -m http.server 8765` desde la raíz del repo.
- **Contador PHP real:** `php -S localhost:8000` desde esta carpeta.

## Architecture

Mismo shell que los demás juegos. Los 5 `.jsx` (`logo`, `characters`, `screens`,
`game-screens`, `app`) son la fuente editable. Tras editar, re-empaquetar:

```powershell
powershell -ExecutionPolicy Bypass -File .planning\bundle.ps1
```
o `python .planning/bundle.py` si hay Python real. Verificar que ambos HTML
(`index.html` == `EDINUN GAMES.html`) quedan idénticos.

Invariantes:
- **No incluir `</script>` literal en ningún `.jsx`** (partir el token si hace falta).
- **El bundle reescribe desde `<script type="text/babel">` hasta `</html>`**.

### Contrato del shell

- `app.jsx` enruta por estado: `home → character → game → results`. No tocar salvo
  cambio de shell coordinado con los demás juegos.
- `screens.jsx`: `HomeScreen`, `CharacterScreen`, contador de visitas, `CosmosBg`.
  Define el array **`LEVELS_CFG`** con los 2 temas (reciclaje + cambioclimatico);
  los chips del Home fijan `app.level` → `app.currentCategory` / `currentCatLabel`.
- `game-screens.jsx`: **aquí va la mecánica.** `GameScreen` **despacha por
  `app.currentCategory`**: `"cambioclimatico"` → `<Tema2Controller/>`; en otro caso
  → `<BasuraGame/>` (Tema 1). `ResultsScreen`/`PrintableReport` están
  generalizados (`res.cols`, `res.praise`, `res.themeEmoji`) para servir a ambos temas.

### Mecánicas (`game-screens.jsx`)

**Tema 1 "Cuido mi entorno" — `BasuraGame` (arrastrar + VERIFICAR):** 6 residuos en la bandeja se
arrastran a 3 tachos. Al presionar VERIFICAR se muestra una **pantalla de
verificación limpia ~3 s** (✓ en aciertos, ✗ + círculo rojo con ➜ señalando el
tacho correcto en los errores, sin iluminar el tacho), y **luego** el overlay
estándar **¡EXCELENTE! / ¡UPS!**. Drag con pointer events sobre el lienzo escalado.

**Tema 2 — `Tema2Controller` (3 rondas encadenadas):** monta cada ronda por turno
(`key`) y acumula resultados en un ref; al terminar la 3.ª arma el reporte
combinado (`cols: ["Actividad","Tu respuesta"]`, `themeEmoji:"🌍"`). Rondas:
1. **`CausaEfectoRound`** ("¿Qué pasa si...?") — tap-quiz de causa-efecto, **1
   pregunta**, bocadillo ESTÁTICO.
2. **`TermometroRound`** ("El termómetro del planeta") — tocar acciones buenas para
   enfriar la Tierra (imagen `tierra-caliente/media/feliz.png` según temperatura).
3. **`ClimaRound`** ("¿Qué clima es?") — arrastrar 6 tarjetas de clima a
   El Niño / Neutral / La Niña + VERIFICAR (mismo flujo verificación→overlay).

Reglas EDINUN que las mecánicas respetan (ver `USER.md` y
`memory/aprendizajes-de-diseno.md`):
- Fallar no baja el progreso ya ganado; completar el objetivo cuenta como éxito.
- Al fallar, revelar la respuesta correcta dejando ver lo que eligió el niño.
- Salir/reiniciar siempre con modal (con glow rojo/violeta).
- Cambio de tema con modal de confirmación (copiado textual del juego de lengua).
- `markFirstAttempt()` en la primera respuesta; `incrementGamesCompleted()` al terminar.

### Personajes

Catálogo compartido (elenco por regiones del Ecuador): Domi (`domi`, Costa,
montubia), Sisa (`sisa`, Sierra, kichwa otavaleña), Yaku (`yaku`, Oriente, kichwa
amazónico) y Andi (`andi`, cóndor tricolor del Ecuador). **Personaje destacado en
el landing: `sisa`.** Arte en `assets/char-sisa.png`.

## Contador de visitas

`counter.php` (idéntico en todos los juegos) cuenta visitas globales; cae a
`localStorage` si el servidor no ejecuta PHP. No personalizar. `visits.txt` está
gitignoreado — borrarlo antes de subir a producción.

## QA responsive

Antes de declarar completo, capturar el flujo en al menos: 1920×1080, 1280×800,
1024×768, 768×1024, 667×375, 375×667.
