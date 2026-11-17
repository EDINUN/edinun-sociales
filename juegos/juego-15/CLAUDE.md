# CLAUDE.md — juego-15 "Rumbo a la independencia" (Estudios Sociales · 13 años)

## Project

**Juego: "Rumbo a la independencia"** — carpeta autocontenida del repo `edinun-sociales`.
Mapea al tema del libro **"El proceso de independencia en Sudamérica"** (Tema 3,
D.C.D. **CS.4.1.36**): 1804-1825, la campaña de Bolívar y Sucre, la de San Martín, la
independencia de Brasil y la del sur de Sudamérica.
**Audiencia 13 años** (registrada en `memory/audiencia_por_juego.md`). Guía por defecto
**Sisa** (ciclo del ordinal: 15 mod 4 = 3). Diseño en `.planning/juego-15-design.md`.

Registro visual **adulto**: mapa, partes de campaña, cronología. Nada de 3D infantil.

En móvil el diseño es horizontal pero el dispositivo se sostiene vertical (overlay
bloqueante hasta rotar). Preferencias del usuario: `USER.md`.

## Running / bundle

HTML estático (React 18 + Babel Standalone desde unpkg). Sin build ni tests. Tras editar
cualquier `.jsx`, re-empaquetar (concatena los 5 `.jsx` en ambos HTML, idénticos):

```bash
node .planning/bundle.js        # Node (recomendado)
```
Invariantes del bundle: ningún `.jsx` con `</scr`+`ipt>` literal; reescribe desde
`<script type="text/babel">` hasta el cierre del documento.

## Arquitectura (game-screens.jsx)

**3 rondas encadenadas, cada una con una mecánica DISTINTA** (la autora las aprobó ronda
por ronda viendo bocetos ASCII en el chat), orquestadas por `GameScreen` con el arreglo
**`SOC_ROUNDS`** de `{ C, verify, bubble }` (`TOTAL = 3`). Mismo chrome EDINUN que
juego-8 (HUD, personaje/bocadillo, columna de acciones con `¡VERIFICAR!` vía `verifyRef`
+ estado `busy`, overlay `¡EXCELENTE!/¡UPS!`, modales, reporte imprimible de 3 filas).
⭐ hasta 3 (1 por ronda). Enunciado = QUÉ; bocadillo = CÓMO. Las tres rondas usan
¡VERIFICAR! Sub-componentes:

- **R1 `R1Mapa` — TOCAR un territorio en el mapa + ¡VERIFICAR!.** "Ubica en el mapa el
  territorio de este hecho.": un cartel enuncia un hecho y el niño toca uno de los **10
  territorios** del mapa SVG. Los trazados de `J15_MAPA` son los **contornos reales**
  de Natural Earth (`ne_50m_admin_0_countries`, dominio público), proyección plate
  carrée y Douglas-Peucker; `J15_MAPA_INERTE` añade Guyana, Surinam y la Guayana
  Francesa como silueta no tocable. **No dibujar el mapa a mano**: el primer intento
  lo fue y las formas estaban mal (lo cazó la autora).
  Los territorios van **rotulados siempre** (adivinar el país en un mapa mudo no es la
  lección y dejaba la ronda sin respuesta en pantalla); el cartel no nombra el país
  actual, así que la clave sigue siendo el hecho histórico. Al
  acertar se pinta en verde, se rotula y se dibuja la **flecha de avance** de esa campaña
  (`desde → pais`, omitida si coinciden). Al fallar: rojo en lo que tocó, verde en el
  correcto, ambos rotulados. Banco `J15_HECHOS_MAPA` (10 hechos del libro).
- **R2 `R2Despacho` — DEDUCIR con pistas + ¡VERIFICAR!.** "Descubre quién dijo esto.":
  una frase histórica sin autor, rotulada **"FRASE DICHA EL" + fecha**, y **3 pistas
  tapadas**. (Antes se llamaba "parte" de campaña: jerga militar que la autora no
  entendió — *"no entiendo … envió a dónde, qué parte"*. El concepto visible es
  **frase**, no parte.) que el
  niño destapa solo si las necesita; abajo **4 protagonistas** (el correcto + 3
  distractores del elenco real). Se puede acertar sin destapar ninguna. Banco
  `J15_PARTES` (10) sobre `J15_PERSONAS` (8). Las escenas `assets/indep-*.png` son de
  época y **sin rostros** (regla: no generar caras de personas reales); `PersonaImg` cae
  a un sello ⚜ + el nombre si el archivo no está, así el juego funciona sin ellas.
- **R3 `R3Candado` — DESCIFRAR el año + ¡VERIFICAR!.** "Descubre el año y abre el
  candado.": **tres documentos siempre visibles** (no se destapan: ese gesto ya es R2)
  que cruzados dan un año — uno nombra el hecho, otro lo ancla a una fecha conocida
  ("dos años antes de Ayacucho, que fue en 1824") y el tercero lo cruza con otro
  suceso del mismo año. El niño compone el año girando las **dos últimas ruedas** de
  un candado (el 1 y el 8 vienen fijos: todos los años son 18xx) con las flechas ▲▼.
  Al acertar el candado se abre (🔓) y aparece la pintura del hecho; al fallar sigue
  cerrado, se ve su combinación en rojo y el año correcto en verde y en grande.
  Banco `J15_CASOS` (10 casos, uno por hecho) · `J15_R3_KEY`, pick 1, cap 9.
  ⚠ Ancho del panel al revelar: 445 px en un carril de 470 (con 150 px de columna de
  revelación se pasaba a 509 y el QA no lo caza — lo vi en captura).
  ⚠ Toda `<img>` dentro de algo arrastrable lleva `draggable={false}` +
  `pointerEvents:"none"`: el arrastre nativo de imágenes dispara `pointercancel`.

**Arrastre de R3** (reglas ya pagadas en juego-10/13): la pieza **aterriza** con
`element.animate()` 190 ms `ease-out` `fill:"backwards"` (una transición CSS no arranca
porque React aplica el estado antes del primer pintado); un gesto nuevo **cancela** la
animación en curso; las demás piezas van sin transición; **respaldo por tap** (tocar
pieza → tocar casilla) siempre disponible.

**Anti-repetición por ronda** (FIFO `j15Recent/j15Push` en `localStorage`). ⚠ **Regla de
cap**: para elegir 1 de N, cap = N−1; para un SUBCONJUNTO de K NUNCA cap = K. Aquí:
R1 pick 1 de 10 **cap 9** · R2 pick 1 de 10 **cap 9** · R3 pick 1 **grupo** de 3 **cap 2**
(además las piezas se barajan y la cinta cambia de tramo de años con el grupo).

⚠ **Contenido del libro:** todos los hechos, fechas, nombres y citas salen del Tema 3 que
entregó la autora. **No añadir ítems sin material del libro.**

## Contrato del shell

- `app.jsx` (shell, NO tocar): enruta `home → character → game → results`.
- `screens.jsx`: `HomeScreen`, `CharacterScreen` (preselecciona **Sisa**: `sel` = sisa
  salvo elección previa distinta de domi), contador de visitas, `CosmosBg`. `choose()`
  fija `currentCategory:"independencia"`, `currentCatLabel:"El proceso de independencia en Sudamérica"`.
- `game-screens.jsx`: expone `GameScreen`/`ResultsScreen` en `window`. `markFirstAttempt()`
  en la 1ª respuesta; `incrementGamesCompleted()` al terminar.

## Contador de visitas

`counter.php` idéntico a los demás; cae a `localStorage` sin PHP. `visits.txt`
gitignoreado — borrarlo antes de subir a producción.

## Reglas transversales que este juego respeta

- **Resoluble con lo que se ve**: el dato que hace falta está en pantalla (mapa
  rotulado, pistas destapables, años de la cinta).
- **Nada de juicio antes de ¡VERIFICAR!**: antes solo neutro/azul; verde y rojo solo al
  revelar, y entonces la correcta **grita** (halo o panel grande).
- **Todo lo colocado se puede quitar**, y se ve cómo.

## QA

```bash
node juegos/_PLANTILLA/.planning/format-lint.js juego-15
node juegos/_PLANTILLA/.planning/qa-visual.js  juego-15
node juegos/juego-15/.planning/sin-superposiciones.js   # 8 partidas, DOM real
```

> **Landing:** el card de juego-15 usa título "Rumbo a la independencia" y charId `sisa`.
