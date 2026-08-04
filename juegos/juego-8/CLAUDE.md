# CLAUDE.md — juego-8 "¿En qué trabajan?" (Estudios Sociales · 8 años)

## Project

**Juego: "¿En qué trabajan?"** — carpeta autocontenida del repo `edinun-sociales`.
Mapea al tema del libro **"El respeto al trabajo de las personas"** (las **actividades
económicas**): sectores de la economía, bienes vs servicios y población activa/inactiva.
**Audiencia 8 años** (registrada en `memory/audiencia_por_juego.md`). Guía por defecto
**Andi**. Diseño en `.planning/juego-8-design.md`.

En móvil el diseño es horizontal pero el dispositivo se sostiene vertical (overlay
bloqueante hasta rotar). Preferencias del usuario: `USER.md`.

## Running / bundle

HTML estático (React 18 + Babel Standalone desde unpkg). Sin build ni tests. Tras editar
cualquier `.jsx`, re-empaquetar (concatena los 5 `.jsx` en ambos HTML, idénticos):

```bash
node .planning/bundle.js        # Node (recomendado)
```
Invariantes del bundle: ningún `.jsx` con `</script>` literal; reescribe desde
`<script type="text/babel">` hasta `</html>`.

## Arquitectura (game-screens.jsx)

**3 rondas encadenadas, cada una con una mecánica DISTINTA** (la autora las eligió viendo
bocetos ASCII en el chat), orquestadas por `GameScreen` con un arreglo **`SOC_ROUNDS`** de
`{ C, verify, bubble }` (`TOTAL = 3`). Mismo chrome EDINUN que los temas del juego-6 (HUD,
personaje/bocadillo, columna de acciones con `¡VERIFICAR!` vía `verifyRef` + estado `busy`,
overlay `¡EXCELENTE!/¡UPS!`, modales de salir/reiniciar, reporte imprimible de 3 filas).
⭐ hasta 3 (1 por ronda). Enunciado = QUÉ; bocadillo = CÓMO. Sub-componentes:

- **R1 `R1Campo` — TOCAR VARIOS + ¡VERIFICAR!.** "¿Cuáles vienen del sector primario?":
  6 fichas (3 primario naturales + 3 secundario transformados, barajadas), el niño toca
  las del **sector primario** (campo/mar/animales) y verifica. Correcto = exactamente los
  primarios marcados. Al fallar: ✓ verde en los bien marcados, ✗ rojo en los mal marcados,
  y pastilla **"este sí va"** en los primarios que faltaron (revela). Bancos `J8_PRIMARIO`
  (9) y `J8_SECUND` (9), del libro (actividad "Aplico").
- **R2 `R2BienServicio` — TOCAR 1 de 2** (valida al tocar, sin verificar). "¿Es un bien o
  un servicio?": una carta a la vez (emoji + nombre), botones **BIEN / SERVICIO**. Al
  responder: verde en el correcto, rojo en el tocado si falló. Bancos `J8_BIENES` (8) +
  `J8_SERVICIOS` (8) — bienes = objetos tangibles; servicios = actividades.
- **R3 `R3ActivaInactiva` — TOCAR persona → TOCAR grupo + ¡VERIFICAR!.** "¿A qué grupo
  pertenece cada persona?": 4 personas (2 PEA + 2 PEI); el niño toca una persona (se marca)
  y luego el grupo **ACTIVA (PEA)** o **INACTIVA (PEI)**; tocar una ya colocada la devuelve.
  ¡VERIFICAR! solo cuando las 4 están colocadas. Al fallar: ✓/✗ por persona + pastilla con
  el grupo correcto (PEA/PEI). Bancos `J8_ACTIVA` (8 oficios) + `J8_INACTIVA` (5:
  estudiante, jubilado/a, bebé, niño). **Tap, no drag** (a los 8 años el arrastre falla).

**Anti-repetición por ronda** (FIFO `j8Recent/j8Push` en `localStorage`, una clave por
ronda). ⚠ **Regla de cap** (aprendida): para elegir un SUBCONJUNTO de K ítems NUNCA usar
cap = K (parte el banco en grupos fijos que alternan idéntico cada recarga); usar cap <
pool−K. Aquí: R1 primario/secundario pick 3 de 9 con **cap 4**; R3 activa pick 2 de 8 cap
4, inactiva pick 2 de 5 **cap 2**; R2 pick 1 de 16 **cap 10**. La memoria vive en
`localStorage` → **servido/en producción** persiste (con doble clic algún navegador no).

**Sin imágenes** (decisión de la autora): todo con **emojis + nombre** (a tamaño de ficha
se leen al instante; y en R3 son personas → los emojis evitan generar caras reales). Si
algún ítem quedara confuso, la autora pasa la imagen.

⚠ **Contenido del libro:** los bancos salen del tema "El respeto al trabajo de las
personas" (sectores primario/secundario/terciario, tabla de bienes/servicios, PEA/PEI).
No añadir ítems sin material del libro. Los distractores son contrastes claros.

## Contrato del shell

- `app.jsx` (shell, NO tocar): enruta `home → character → game → results`.
- `screens.jsx`: `HomeScreen`, `CharacterScreen` (preselecciona **Andi**: `sel` = andi
  salvo elección previa distinta de domi), contador de visitas, `CosmosBg`. `choose()` fija
  `currentCategory:"trabajo"`, `currentCatLabel:"El trabajo de las personas"`.
- `game-screens.jsx`: expone `GameScreen`/`ResultsScreen` en `window`. `markFirstAttempt()`
  en la 1ª respuesta; `incrementGamesCompleted()` al terminar.

## Contador de visitas

`counter.php` idéntico a los demás; cae a `localStorage` sin PHP. `visits.txt`
gitignoreado — borrarlo antes de subir a producción.

## QA

```bash
node juegos/_PLANTILLA/.planning/format-lint.js juego-8   # 15/15 OK
node juegos/_PLANTILLA/.planning/qa-visual.js  juego-8    # 6 viewports, sin overflow
```
**Verificado:** format-lint 15/15; qa-visual sin overflow (colchón 70px) en los 6 tamaños;
e2e (R1→R2→R3→reporte) sin errores; anti-repetición 0 repeticiones consecutivas en las 3
rondas en 6 recargas (R1 6 fichas siempre distintas · R2 mezcla bienes/servicios · R3 4
personas distintas). Guía Andi.

> **Landing:** el card de juego-8 usa título "¿En qué trabajan?" y charId `andi`. El
> **juego-7 quedó pendiente** (hueco intencional; se hará después).
