# CLAUDE.md — juego-14 "Las culturas posclásicas de Mesoamérica"

## Project

**Juego: Las culturas posclásicas de Mesoamérica.** Carpeta autocontenida del repo
multi-juego `edinun-sociales` (Estudios Sociales). Mapea al **Tema 3 de la Unidad 6
("Un legado ancestral que persiste") del libro de 8.º** — libro págs. 134-136 y
cuaderno de trabajo págs. 90-92: civilización **maya** (períodos clásico y
posclásico, migración a Yucatán, sociedad teocrática, numeración vigesimal) y
civilización **azteca** (origen náhuatl, lago de Texcoco, Tenochtitlán,
confederación). Detalle del diseño en `.planning/juego-14-design.md`.

**Audiencia 12 años** (registrada en `memory/audiencia_por_juego.md`).

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

```bash
node .planning/bundle.js
```

Invariantes:
- **No incluir el cierre literal de la etiqueta script en ningún `.jsx`**
  (partir el token si hace falta). Ya se rompió una vez por escribirlo en un comentario.
- **El bundle reescribe desde `<script type="text/babel">` hasta `</html>`**.

### Contrato del shell

- `app.jsx` enruta por estado: `home → character → game → results`. **Idéntico byte
  a byte al de `_PLANTILLA`** — no tocar.
- `screens.jsx`: `HomeScreen`, `CharacterScreen`, contador de visitas, `CosmosBg`.
  Personalizado aquí: `currentCategory: "mesoamerica"`, el `currentCatLabel` con el
  título completo del tema, la pill de subtítulo y los glifos (geometría de grecas
  y motivos solares — **sin emojis figurativos**, que a 12 años se leen infantiles).
- `game-screens.jsx`: la mecánica. Define `GameScreen` y `ResultsScreen`.

### Mecánica (`GameScreen`) — 3 rondas, 3 verbos distintos

Nivel único (sin botones de tema en el Home; bloque RONDA en `top: 52`).
`GameScreen` despacha por número de ronda a tres sub-componentes. Las tres validan
con **¡VERIFICAR!** (acciones variante B). ⭐ = **1 por pieza correcta**, total **10**.

| R | Componente | Qué hace el estudiante | ⭐ |
|:-:|---|---|:-:|
| 1 | `RondaDial` | Arrastra 4 ciudades mayas al tramo CLÁSICO / POSCLÁSICO. El **dial del año** (300→1519) mueve el resplandor de la región viva sobre el mapa: da el contexto sin regalar la respuesta. | 4 |
| 2 | `RondaEstela` | Compone un número vigesimal en dos registros con **punto (1) · barra (5) · caracol (0)**; un marcador muestra la lectura **en vivo**. Tocar un símbolo colocado lo quita. | 2 |
| 3 | `RondaCodice` | Toca cada una de las **4 palabras manchadas** de una crónica y elige entre dos términos. | 4 |

**Anti-repetición** (FIFO en `localStorage`, una clave por ronda):
`edinun_soc_j14_ciudades_v1` (cap 6, sortea 2 clásicas + 2 posclásicas de 12) ·
`edinun_soc_j14_numeros_v1` (cap 17 sobre 18 números) ·
`edinun_soc_j14_cronicas_v1` (cap 3 sobre 4 crónicas).

Reglas EDINUN que la mecánica respeta:
- Fallar **no** baja el progreso: una ronda parcial suma las ⭐ acertadas.
- Al fallar se revela la correcta **en el lenguaje de la mecánica**: la ciudad
  aparece en su tramo con ✓; el nivel errado de la estela muestra debajo la fila
  correcta **dibujada con puntos y barras** (no un número suelto); la palabra mal
  elegida se tacha y la correcta aparece al lado en verde.
- Salir/reiniciar siempre con modal.
- `markFirstAttempt()` en la primera verificación; `incrementGamesCompleted()` al terminar.

### Contenido — todo sale del libro

Los tres bancos son textuales del libro / cuaderno de 8.º. **No inventar datos.**
Única licencia tomada (y marcada en el design-doc §8.2): las **crónicas 2-4** de la
R3 no son textuales del cuaderno — intercambian términos que sí aparecen en el
libro. La crónica 1 sí es la del cuaderno pág. 91 (ej. 7).

### Assets propios del tema

`assets/mapa-mesoamerica.png` · `assets/estela-maya.png` · `assets/papel-amate.png`,
generados por la autora. **El juego funciona sin ellos**: `TemaImg` se oculta
`onError` y queda el respaldo SVG/CSS. Si faltan, el e2e lo reporta como nota, no
como fallo.

### Personajes

Catálogo compartido. **Personaje destacado en el landing: `yaku`** (14 mod 4 = 2 en
el ciclo Domi → Yaku → Sisa → Andi). Como en los demás juegos, el default de
`app.jsx` sigue siendo `domi` (el estudiante elige su guía).

## Contador de visitas

`counter.php` (idéntico en todos los juegos) cuenta visitas globales; cae a
`localStorage` si el servidor no ejecuta PHP. No personalizar. `visits.txt` está
gitignoreado — borrarlo antes de subir a producción.

## Verificación antes de entregar

```bash
node juegos/_PLANTILLA/.planning/format-lint.js juego-14   # 15/15
node juegos/_PLANTILLA/.planning/qa-visual.js  juego-14    # 6 viewports
node .planning/e2e.js                                      # juego real (desde esta carpeta)
```

El `e2e.js` juega de verdad: partida perfecta (10 ⭐), partida fallada con revelado
en las 3 rondas, ronda parcial que suma sin restar, **arrastre real de mouse y
respaldo tap alternados**, 6 recargas sin repetición y consola limpia.
