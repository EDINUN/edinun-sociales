# CLAUDE.md — juego-4 "Mi escuela y mi barrio" (Estudios Sociales)

## Project

**Juego: Mi escuela y mi barrio.** Carpeta autocontenida del repo multi-juego
`edinun-sociales` (Estudios Sociales). Juego **multi-tema** sobre la vida en la
escuela y el barrio, con personaje guía **Andi**. Tiene **3 temas** seleccionables
desde el Home (chips de cambio de tema arriba en la pantalla de juego):

- **Tema 1 — "Estar preparados"** (`id: emergencias`, audiencia **6**): mecánica
  **ORDENAR**. Salen 3 tarjetas desordenadas; el niño las arrastra a las casillas
  **1·2·3** en el orden correcto y toca **VERIFICAR**. Banco de secuencias de
  seguridad (sismo · ceniza · evacuar) con anti-repetición FIFO. 1 ronda.
- **Tema 2 — "Amigos y compañeros"** (`id: convivencia`, audiencia **6**): mecánica
  **CLASIFICAR**. 4 tarjetas de acciones (de un banco de 8 con anti-repetición) se
  arrastran a 2 cajas **😊 Está bien / 😞 No está bien** + **VERIFICAR**. El reparto
  **no es fijo**: 1+3, 2+2 o 3+1 (≥1 de cada tipo). 1 ronda. Diseño en
  `.planning/juego-4-tema2-design.md`.
- **Tema 3 — "Sistema educativo"** (`id: sistemaeducativo`, audiencia **13**):
  **3 rondas encadenadas con mecánicas distintas** (patrón de juego-3 · Tema 2) que
  terminan en un reporte combinado. Diseño en `.planning/juego-4-tema3-design.md`.

**Audiencia: 6 en los Temas 1 y 2 · 13 en el Tema 3** — registrada en
`memory/audiencia_por_juego.md`. El salto es **deliberado**: la autora entiende el
Home como un *menú de temas del libro* (cada estudiante entra al suyo).
Los libros/láminas se usan solo para **entender el tema**, NO para copiar
actividades 1:1.

En móvil el diseño es horizontal pero el dispositivo se sostiene vertical: el
usuario gira físicamente el teléfono (overlay bloqueante hasta rotar).

- **Bitácora del proyecto:** `MEMORY.md`.
- **Preferencias del usuario** (usabilidad, QA responsive, invariantes): `USER.md`.
  **Léelo antes de cualquier cambio de UI o flujo.**

## Running / deploying

No build system, no package manager para el runtime. HTML estático que carga
React 18 + Babel Standalone desde unpkg.

- **Abrir local:** doble clic en `index.html`.
- **Servir local:** servidor estático desde la raíz del repo (esta máquina **no
  tiene Python real ni PHP**; usar Node).
- **Contador PHP real:** requiere PHP (`php -S localhost:8000`); sin PHP cae a
  `localStorage`, que es lo normal en local.

## Architecture

Mismo shell que los demás juegos. Los 5 `.jsx` (`logo`, `characters`, `screens`,
`game-screens`, `app`) son la fuente editable. Tras editar, re-empaquetar:

```powershell
powershell -ExecutionPolicy Bypass -File .planning\bundle.ps1
```
(este juego **no** trae `bundle.js`; existen `bundle.ps1` y `bundle.py`, y el
`python` del PATH son stubs del Store → usar el de PowerShell).
Verificar que ambos HTML (`index.html` == `EDINUN GAMES.html`) quedan idénticos.

Invariantes:
- **No incluir `</script>` literal en ningún `.jsx`** (partir el token si hace falta).
- **El bundle reescribe desde `<script type="text/babel">` hasta `</html>`**.

### Contrato del shell

- `app.jsx` enruta por estado: `home → character → game → results`. No tocar salvo
  cambio de shell coordinado con los demás juegos.
- `screens.jsx`: `HomeScreen`, `CharacterScreen`, contador de visitas, `CosmosBg`.
  Define el array **`LEVELS_CFG`** con los 3 temas (emergencias + convivencia +
  tema3); los chips del Home fijan `app.level` → `app.currentCategory` /
  `currentCatLabel`.
- `game-screens.jsx`: **aquí va la mecánica.** `GameScreen` **despacha por
  `app.currentCategory`**: `"convivencia"` → `<ClasificaGame/>`; en otro caso →
  `<OrdenarGame/>` (Tema 1). `ResultsScreen`/`PrintableReport` están generalizados
  (`res.cols`, `res.praise`, `res.themeEmoji`) para servir a todos los temas.

### Mecánicas (`game-screens.jsx`)

**Tema 1 — `OrdenarGame` (ordenar + VERIFICAR):** 3 tarjetas desde la bandeja a
3 casillas numeradas 1·2·3. Al fallar, debajo de la casilla aparece **"✓ Aquí va"**
con la **mini-tarjeta (dibujo real + nombre)** de la acción correcta, dejando ver
la tarjeta que eligió el niño con su ✗. Los números 1·2·3 se dibujan en una **capa
aparte (`zIndex 40`) por encima de las tarjetas** — si se meten dentro de la
casilla quedan tapados.

**Tema 2 — `ClasificaGame` (clasificar + VERIFICAR):** bandeja de 4 tarjetas grandes
(2×2, arriba) → 2 cajas abajo (😊 Está bien / 😞 No está bien). Al soltar, la tarjeta
se encoge a **miniatura** dentro de la caja (1 fila de hasta 4). Al fallar, la
miniatura **se queda donde la puso el niño** (con ✗) y muestra un chip con
**flecha hacia la caja correcta**, que además **brilla**. Geometría heredada del
juego de basura de juego-3 (bandeja arriba / cajas abajo).

**Tema 3 — `Tema3Controller` (3 rondas encadenadas, 13 años):** monta cada ronda del
array **`SE_ROUNDS`** por turno (la `key` incluye la ronda → remonta limpia), acumula
el log y arma el reporte combinado + el cartel ¡EXCELENTE!/¡UPS!. Las 3 comparten el
chrome vía **`SEShell`** (chips, HUD, enunciado, puntitos de ronda, guía, acciones).
1. **`AdivinaDatoRound`** — deslizador (`input.se-range`); puntúa por **cercanía**
   (`tol` por dato). Banco `SE_DATOS` (7) → 3 por partida.
2. **`MitosDatosRound`** — V/F contrarreloj 12 s con racha; timeout = fallo. Banco
   `SE_MITOS` (8, actividad 3 del libro) → 5 por partida.
3. **`CompletaTitularRound`** — arrastrar palabras a huecos, con trampas. Banco
   `SE_FRASES` (5) → 1 por partida. Los listeners de arrastre van en **window** (al
   sacar una palabra de un hueco su nodo se desmonta y se perdería el pointer capture).

⚠ **Los 3 bancos salen TEXTUALES del libro. No inventar cifras** (material escolar):
para ampliarlos hay que pedirle más datos a la autora. Y **cada ítem debe entenderse
solo** — los bancos se barajan, así que no puede referirse a otro ítem.

**Textos de toda mecánica (regla dura):** el **enunciado** dice **QUÉ** hacer y el
**bocadillo** del guía dice **CÓMO** hacerlo. Ver `memory/aprendizajes-de-diseno.md` §11.

Reglas EDINUN que las mecánicas respetan (ver `USER.md` y
`memory/aprendizajes-de-diseno.md`):
- Fallar no baja el progreso ya ganado; completar el objetivo cuenta como éxito.
- Al fallar, revelar la respuesta correcta dejando ver lo que eligió el niño.
- Salir/reiniciar siempre con modal (con glow rojo/violeta).
- Cambio de tema con modal de confirmación.
- `markFirstAttempt()` en la primera respuesta; `incrementGamesCompleted()` al terminar.

### Personajes

Catálogo compartido (elenco por regiones del Ecuador): Domi (`domi`, Costa,
montubia), Sisa (`sisa`, Sierra, kichwa otavaleña), Yaku (`yaku`, Oriente, kichwa
amazónico) y Andi (`andi`, cóndor tricolor del Ecuador). **Personaje destacado en
el landing: `andi`.** Arte en `assets/char-andi.png`.

## Contador de visitas

`counter.php` (idéntico en todos los juegos) cuenta visitas globales; cae a
`localStorage` si el servidor no ejecuta PHP. No personalizar. `visits.txt` está
gitignoreado — borrarlo antes de subir a producción.

## QA

Playwright está declarado en el `package.json` de la raíz y **los navegadores ya
están cacheados** en esta máquina; si falta, basta `npm install` en la raíz
(rápido, no re-descarga chromium). Antes de declarar completo:

```bash
node juegos/_PLANTILLA/.planning/format-lint.js juego-4   # valores fijos del estándar
node juegos/_PLANTILLA/.planning/qa-visual.js  juego-4    # 6 viewports, sin overflow
```
