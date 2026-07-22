# juego-5 · Tema 1 — "Aprendiendo con mis compañeros y compañeras de clase" (design-doc)

> Estudios Sociales · TEMA 3 del libro · **edad 6** · guía **Domi** (`charId: domi`).
> Las láminas se usan para **entender** el tema, NO para copiar 1:1.

## Tema

La escuela como **segunda familia**: las personas que laboran en ella (director o
directora, secretaria, docentes, conserje, guardián, cocinera), **las funciones que
realizan y la importancia de ellas** (texto del libro, sección "Saberes previos" y
"Convivo con la comunidad de la escuela"). El niño aprende a reconocer **quién hace
qué** en su escuela.

## Estructura del juego (decisión de la autora)

- El juego tendrá **4 botones = 4 temas del libro**. Este tema arranca primero;
  los otros 3 se agregan cuando la autora mande su material (patrón juego-4:
  el Home es un *menú de temas del libro*).
- `LEVELS_CFG` nace con 1 entrada (`id: comunidadescolar`); al sumar temas se
  añaden entradas y el gradiente va **por posición** (1º naranja · 2º amarillo ·
  3º azul · 4º violeta).

## Mecánica — Patrón 5 "Mira y toca" (elegida por la autora entre 3 opciones)

- **3 rondas por sesión** (pedido explícito de la autora) · **1 pregunta por ronda**
  (regla: una ronda = UNA jugada; la variedad la da el banco + anti-repetición).
- Cada ronda: enunciado con la pregunta (QUÉ) + **3 tarjetas** de personas
  (dibujo + nombre). El niño **toca** a la persona correcta — validación al tocar,
  sin VERIFICAR (igual que la `_PLANTILLA`).
- Acierto → tarjeta verde + **+1 ⭐** + ¡EXCELENTE! · Fallo → se revela la correcta
  (verde ✓) dejando ver la tocada (rojo ✗) ~2 s, luego ¡UPS!; **no resta** progreso.
  Avance automático a la siguiente ronda.
- **Distractores:** las otras 2 tarjetas se sortean del mismo banco.
- **Anti-repetición:** FIFO en `localStorage`
  (`RECENT_KEY = "edinun_juego5_aprendiendo_recientes_v1"`, cap = 6 = ⌊12/2⌋).
  3 preguntas por partida de un banco de 12 → 4 partidas seguidas sin repetir.
- **Estrellas:** modelo simple `+1 ⭐ por acierto` (el de sociales).

## Banco (12 personas — APROBADO por la autora, 2026-07-16)

La autora pidió **solo preguntas tipo "¿Quién…?"** (descartó los tipos ¿dónde? y
¿qué usa?) y **variedad**: a las 6 personas del libro (el libro dice "…, etc.",
lo que abre la puerta) se suman 6 aprobadas por ella. **12 ítems:**

| # | Pregunta (enunciado) | Respuesta (rótulo de tarjeta) |
|:-:|---|---|
| 1 | ¿Quién dirige y organiza la escuela? | Directora |
| 2 | ¿Quién enseña a los niños y niñas en el aula? | Docente |
| 3 | ¿Quién mantiene limpia la escuela? | Conserje |
| 4 | ¿Quién cuida la entrada de la escuela? | Guardián |
| 5 | ¿Quién prepara los alimentos en la escuela? | Cocinera |
| 6 | ¿Quién organiza los documentos de la escuela? | Secretaria |
| 7 | ¿Quién cuida los libros de la biblioteca? | Bibliotecario |
| 8 | ¿Quién cuida el orden en los recreos? | Inspectora |
| 9 | ¿Quién te atiende cuando te sientes mal? | Enfermero |
| 10 | ¿Quién te escucha y ayuda con tus emociones? | Psicóloga |
| 11 | ¿Quién te lleva a la escuela en la buseta? | Chofer |
| 12 | ¿Quién cuida las plantas del patio? | Jardinera |

- **Distractores:** 2 personas al azar del mismo banco (todas son de la misma
  familia visual, así que el sorteo es seguro).
- 3 preguntas por partida de 12 → **4 partidas seguidas sin repetir**.
- Géneros repartidos 6/6 (los rótulos siguen al dibujo; si el generador de la
  autora cambia el género de alguno, se ajusta el rótulo).
- Cada ítem se entiende solo (el banco se baraja). Para ampliar: pedir a la autora.

## Layout (lienzo 900×540)

```
┌──────────────────────────────────────────────────────────────────┐
│ [logo 64]   [chip(s) de tema]  RONDA ●●○            [⏱] [⭐ n]   │ 0..60
│                                                                  │
│            ¿Quién prepara los alimentos en la escuela?           │ enunciado (QUÉ)
│                                                                  │
│  ╭──────╮     ┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐  │
│  │ Domi │     │ dibujo │   │ dibujo │   │ dibujo │   │REINICIAR│  │
│  │ +boca│     │        │   │        │   │        │   ├────────┤  │ centro
│  │ dillo│     │Cocinera│   │Guardián│   │Conserje│   │ SALIR  │  │ x=450
│  ╰──────╯     └────────┘   └────────┘   └────────┘   └────────┘  │
│  "Toca a la                                                      │
│   persona correcta."                                             │ 280..530
└──────────────────────────────────────────────────────────────────┘
```

- HUD, personaje (left 8 · bottom 78 · width 220 · char 186), acciones (right 18)
  y ResultsScreen: **valores exactos de `estandar-visual.md`** (no reinventar).
- Tarjetas centradas en **x=450** (p. ej. 3 columnas `[280, 450, 620]`).
- Sin ¡VERIFICAR! (validación al tocar) → columna de acciones solo REINICIAR + SALIR.
- Ronda: `top:52`, `ed-label`, dots 11×11.

## Log y reporte

`lastResult.log[i] = { idx, emoji: "🏫", a: <pregunta>, userAnswer: <persona tocada>,
correctAnswer: <persona correcta>, isCorrect, time }`.
Columnas del reporte: **"Pregunta" / "Tu respuesta"** · `themeEmoji: "🏫"` ·
Subtítulo: "Reporte académico · Estudios Sociales".

## Glifos del fondo (tema comunidad escolar)

- `cosmic` (Home/Character/Results, ~15): 🏫 🍎 📚 ✏️ 🔔 🤝 🧹 🍲 🎒 ★
- `chalkboard` (juego, ~10): mismos, tenues.

## Copy específico (todo texto visible — confirmar con la autora)

- **Título global del juego** (paraguas de los 4 temas): ⚠ PENDIENTE — decisión de
  la autora: **se elige al terminar de programar** el juego. Hasta entonces el rótulo
  del Home queda "EDINUN · Estudios Sociales" y el juego NO se registra en el landing.
- **Chip del tema:** **"Aprendiendo"** (elegido por la autora, 2026-07-16).
- **Descripción bajo el chip (Home):** "Descubre quién trabaja en tu escuela."
- **Enunciado (QUÉ):** la pregunta del banco, p. ej. "¿Quién prepara los alimentos
  en la escuela?" (termina en signo de pregunta — la pregunta ES el enunciado).
- **Bocadillo de Domi (CÓMO):** "Toca a la<br/>persona correcta."
- **catLabel** (campo Tema del reporte): igual al chip.
- **Frase de cierre (Results):** "¡La escuela funciona gracias a todos!" (⚠ confirmar).

## Imágenes (ENTREGADAS por la autora el 2026-07-16 y optimizadas)

Estilo: 3D cartoon amable como las fotos del libro (SIN marcas en el prompt —
regla 15). Mini-escena con contexto (regla 16). Géneros 6/6, verificados contra
los rótulos.

- La autora entregó 12 PNG de **2816×1536 (~6.5 MB c/u, ~78 MB total)** — se
  redimensionaron a **512 px de alto y JPEG q85 (~100 KB c/u, ~1.2 MB total)**
  con System.Drawing (PowerShell). El código apunta a
  **`assets/persona-<id>.jpg`** (`PersonaImg`, con emoji de respaldo en `onError`).
- Las escenas son horizontales → el área de imagen de la tarjeta va **apaisada**
  (~134×102, `object-fit: cover`); el recorte centrado se verificó con una hoja
  de contactos de las 12 (todas reconocibles).
- ⚠ Detalles avisados a la autora: `persona-guardian` trae texto "SCHOOL" en
  inglés (el generador ignoró el "no text"); en `persona-inspectora` la persona
  sale pequeña (la escena la domina el recreo). Ella decide si regenera.
- Si se regenera alguna: mismo prompt (3D cartoon + mini-escena escolar +
  `no text, no letters, no numbers`), guardar como PNG/JPG horizontal y repetir
  la optimización a 512 px.

## Tema 2 — "Medios de transporte" (añadido 2026-07-16, aprobado por la autora)

Del TEMA 3 del libro "Nuestros medios de transporte: cooperamos y estamos seguros"
(6 años). Al añadirlo, el juego pasó a **multi-tema con chips** (patrón juego-4) y
el chip del Tema 1 quedó **"Aprendiendo"** (decisión de la autora; el título global
se define al final, cuando estén todos los temas).

- **Mecánica:** CLASIFICAR arrastrando (patrón 8). 4 transportes (emoji) por ronda
  → 3 cajones **🛣️ Tierra / 🌊 Agua / ☁️ Aire** + ¡VERIFICAR! **3 rondas.**
  Elegida por la autora entre 3 opciones (descartó tap-quiz y "el semáforo").
- **Banco:** `TRANSPORTES` (16), emoji + vía. Tierra: auto, bus, taxi, bomberos,
  ambulancia, moto, camión, tren, bici. Agua: velero, barco, canoa, lancha. Aire:
  avión, helicóptero, globo. 1 garantizado por vía + 1 extra por ronda; los 3
  tableros no repiten; anti-repetición FIFO (`RECENT_KEY_T`).
- **Sin imágenes:** los transportes se leen claros como **emoji** (decisión: ahorra
  generar 16 imágenes y quedan consistentes). Clasificar por vía no es dato inventado.
- **Copy:** enunciado "Lleva cada transporte a su camino." · bocadillo "Arrastra y
  suelta en su vía." · chip "Medios de transporte" · descripción "Nuestros medios de
  transporte: cooperamos y estamos seguros."
- **Reporte:** log por tarjeta (12 = 4×3): `a`=nombre del transporte, `userAnswer`=
  vía elegida, `correctAnswer`=vía correcta. `category`=currentCatLabel.

## Decisiones abiertas / riesgos

1. **Título global del juego** y **nombre corto del chip** — decide la autora (arriba).
2. **Textos de las 6 preguntas** — validar/corregir (funciones redactadas del contexto).
3. **Género de los dibujos** (director hombre o mujer, etc.) — decide la autora al
   generar; el rótulo de la tarjeta se ajusta al dibujo (Director / Directora).
4. Banco corto (6): 2 partidas sin repetir. Si el libro da más personas
   (bibliotecario/a, inspector/a…), la autora manda y se amplía.
5. Nombres en la tarjeta a 1 línea (fontSize según el más largo: "Secretaria").
6. Mientras no estén los PNG, se implementa con un placeholder de color + nombre
   para poder maquetar; las imágenes se enchufan al recibirlas.

## Tema 3 — "Economía" (añadido 2026-07-22, aprobado por la autora · edad 8)

Del **TEMA 2 del libro** "Economía y transporte en nuestro país". Como el transporte
ya es el Tema 2, el Tema 3 se centró en la **economía**. **3 RONDAS ENCADENADAS, cada
una mecánica distinta** (pedido de la autora: "cada ronda debe ser diferente"; patrón
juego-4 Tema 3). Cada mecánica la eligió la autora de entre 3 opciones con bosquejo.

- **R1 · Sectores** (`SectoresRound`, mecánica **B** elegida): quiz "¿a qué sector
  pertenece?" — 1 actividad (emoji) + **4 botones** de sector (autora eligió 4, no 3).
  Tocar 1, validación al tocar. **5 preguntas** (1 por sector + 1 extra). Banco
  `ACTIVIDADES` (15): primario 🌾🐄🎣⛏️ · secundario 🏭🏗️⚡🏺 · terciario 🚚📡🏖️🏫🏦 ·
  cuaternario 🔬🎨. Enunciado "¿A qué sector pertenece? (n/5)" · bocadillo "Toca el
  sector correcto."
- **R2 · Servicios** (`ServiciosRound`, mecánica **C** elegida): **multi-selección** —
  vitrina de **6** cosas, toca **todos los servicios** + ¡LISTO!. Enunciado dice cuántos
  hay (2–4). Banco `COSAS` (16 = 8 servicios 👮💡🚰🚌🏫🩺🏦📱 / 8 bienes 🍞👕🧸🍎🏠👟🥛⚽).
  Feedback: ✓ servicio bien tocado · 🛎️ servicio no tocado (revelado) · ✗ bien tocado
  por error. ⭐ = servicios cazados. Bocadillo "Toca los que ayudan a las personas."
- **R3 · Cadena** (`CadenaRound`, mecánica **A** elegida): **ordenar arrastrando**
  (molde `TransporteGame`) — 3 cartas a huecos **1·2·3** = primario→secundario→terciario
  + ¡VERIFICAR!. Al fallar: ✗ + **➜ nº de su lugar**. **CON IMÁGENES** (decisión de la
  autora): `assets/cadena-<slug>-<n>.jpg` (n = paso 1/2/3) vía `CadenaImg` + **emoji de
  respaldo** (`onError`). Banco `CADENAS` (6 productos): café ☕ · queso 🧀 · ropa 👕 ·
  pan 🍞 · mueble 🪑 · jugo de naranja 🧃 (la autora descartó chocolate por ser
  "gemelo" del café: mismo cultivo→fábrica→tienda). Bocadillo "Arrastra a su lugar: 1 · 2 · 3."
  (El cuaternario no entra en la cadena: no fabrica cosas físicas — coherente con el libro.)

**Arquitectura:** `EconomiaGame` orquesta `phase` 0/1/2, acumula ⭐ + `log`, y hace
`go("results")` tras la R3. `EcoFrame` centraliza el chrome (HUD RONDA 3 etapas,
personaje, acciones, overlay, modales). REINICIAR reinicia el tema desde R1. Reporte
único: 14 filas (5+6+3). Anti-repetición FIFO por ronda (3 keys `localStorage`).

**Copy visible (elegido por la autora):** chip **"Economía"** · descripción del Home
**"Economía y transporte en nuestro país."** · gradiente 3º **azul** (`#7ab8ff→#2773d8`).

**Imágenes R3 (PENDIENTE de la autora):** 18 = 6 productos × 3 pasos. Prompts cuadrados
(2048×2048, `square image, 1:1` + estilo 3D cartoon + `no text/logos`) entregados en el
chat. Guardar como `cadena-<slug>-<n>.jpg`; al llegar, **optimizar a ~640px JPEG q85**
(como las personas del Tema 1). Sin ellas, la R3 corre con emoji.

## Decisiones pendientes del juego (global)

- **Tema 4** (4º botón): pendiente de material de la autora. Gradiente 4º **violeta**.
- **Título global del juego**: se define **al final** (hoy placeholder "Aprendiendo").
