# MEMORY.md — juego-13 (bitácora)

## 2026-08-06 — Nace juego-13 con el Tema 1 "Los continentes"

- **Slug `juego-13`** por decisión de la autora (calza con su numeración de la
  colección; los huecos 7 y 9-12 son intencionales).
- **Guía Domi** por el ciclo del elenco (13 mod 4 = 1) — ver `memory/orden-personajes.md`,
  regla que se documentó en esta misma sesión.
- **3 temas** planificados; solo el Tema 1 tiene material. Los temas 2 y 3 quedan
  `enabled:false` como **estado temporal de construcción** (decisión explícita de la
  autora: prefiere el Home multi-tema ya montado a rehacerlo después).
- **Tema 1 · 12 años.** Las 3 mecánicas se eligieron con bocetos ASCII en el chat, una
  ronda a la vez y con OK explícito por ronda:
  - R1 «Control de aduana» — arrastrar (elegida entre duelo de cartas / aduana / podio).
  - R2 «Podio mundial» — tap-swap. Se cambió de arrastrar a intercambiar para que R1 y R2
    no se sintieran iguales.
  - R3 «Cazador de errores» — cazar el intruso. La autora la eligió sobre «El continente
    misterioso» (expediente con pistas) y sobre las alternativas de gesto nuevo (medidor
    con deslizador, teclado numérico, trazar líneas).
- **Erratas del libro detectadas** (se le reportaron a la autora): la ficha de África
  repite la superficie de Europa (10 530 751 en vez de 30 330 000), la de Asia repite la
  población de África (1 300 millones en vez de 4 600 000 000) y el Nilo aparece con
  6 671 km en la ficha y 6 843 km en el cuadro comparado. **Decisión: manda el cuadro
  comparado.**
- **Excluidos por ambigüedad:** montes Urales y mar Caspio (límite Europa/Asia → dos
  respuestas correctas) y las pistas de clima ("todos los climas" vale para Asia y para
  Oceanía).
- **Título provisional** "Explorando el mundo": la autora lo decide con los 3 temas.

### Ajustes visuales pedidos por la autora (mismo día)

1. **R1: las 4 fichas en rejilla 2×2** (antes fila de 4). De paso se agrandaron a 140 px,
   así los nombres largos ("Llanura de Siberia Occidental") se leen sin apretarse.
2. **R2: el podio va CENTRADO verticalmente**, no pegado abajo — quedaba mucho espacio
   vacío bajo el enunciado. ⚠ La autora fue explícita: **no agrandar los pedestales**,
   solo subirlos. (Primero se probó agrandándolos y lo descartó.)
3. **R2: las cifras reveladas al verificar tienen que VERSE.** Estaban en 10,5 px sobre
   el pedestal claro y la autora casi no las distinguía. Ahora: placa oscura con borde
   dorado + cuerpo 13-20 px según el largo del dato y el puesto. Verificado que en los
   **7 podios** ninguna cifra se sale del pedestal (el del 4º puesto es el más bajo y
   fue el que reventó en el primer intento).
4. **R2: la pastilla del fallo dice "Aquí va: `<ficha>`"**, o sea **qué correspondía en
   ese puesto** — no "va 3º" (a dónde iba la ficha que puso el niño), que era lo que
   había. La autora lo pidió explícitamente: le resulta más claro leer el hueco.

## 2026-08-06 (tarde) — Tema 2 "Las Américas y su geografía" + título definitivo

- **Título en firme: "Un mundo por descubrir"** (la autora eligió entre 3 propuestas).
  Reemplaza al provisional "Explorando el mundo" en `screens.jsx`, ambos HTML, el array
  `GAMES` del landing y este `CLAUDE.md`.
- **Tema 2 = Tema 4 del libro, 12 años.** La autora pasó el material (fotos de las
  páginas) y eligió las mecánicas viendo **bocetos ASCII en el chat, una ronda a la vez**:
  - **R1 "Pasaporte de la región"** — elegida sobre «Mapa mudo» (tap-to-place sobre una
    silueta) y «El medidor» (deslizador). Pesó que no depende de generar assets y que
    deja libres los verbos ricos para las otras rondas.
  - **R2 "Calculadora demográfica"** — elegida sobre «El medidor» (deslizar) y «Tablero de
    indicadores» (unir columnas). Es la actividad 5 del libro con teclado numérico.
  - **R3: pendiente.** El tema corre con 2 rondas (el estándar pide 3-4) → no publicar.
- **Refactor del orquestador:** `ContinentesGame` pasó a ser **`J13Game({rounds})`**,
  compartido por todos los temas, y el nº de rondas sale de `ROUNDS.length` (antes estaba
  cableado en `TOTAL = 3`, lo que habría forzado 3 rondas en todos los temas). El Tema 1
  no cambió de comportamiento.
- **⭐ del Tema 2:** R1 +1 por hueco (hasta 3) y R2 **+3 al acertar**, para que las dos
  rondas pesen igual. Se apartó del "+1 por elemento" del Tema 1 a propósito: con 1 solo
  elemento, R2 habría valido un tercio que R1.
- **Erratas del libro detectadas en este tema** (reportadas a la autora): la mortalidad
  infantil viene rotulada "punto máximo/mínimo" al revés del sentido real; el IDH de
  América Central se contradice entre el texto (Costa Rica) y el cuadro + actividad 4
  (Cuba, que es el que manda); los ríos de América del Sur no están ordenados por
  longitud. Ninguno de los tres entra en los bancos tal cual.
- **Decisión consultada:** las cifras de R2 son **ejercicios de cálculo** con el molde del
  libro ("un país pasó de X a Y millones"), sin nombrar países reales; el primero del
  banco es el ejercicio 5 literal. Para usar países reales haría falta material con pares
  población inicial/final, que el libro no trae.

### Incidente de concurrencia (mismo día)

Mientras se diseñaba el Tema 2 en el chat, **otra sesión estaba construyendo el Tema 1 en
paralelo** y OneDrive la fue sincronizando en el working copy: la carpeta `juego-13`
"apareció" a mitad de conversación y un `Edit` chocó con un archivo cambiado en disco. Se
paró, se le avisó a la autora y **ella cerró la otra sesión** antes de escribir el Tema 2.
→ **Aprendizaje:** en este repo (OneDrive) conviene comprobar `ls -la` / mtimes del juego
antes de una tanda larga de escritura, y no asumir que el estado inicial sigue vigente.

## 2026-08-06 (cierre) — R3 del Tema 2: «Sala de datos»

- La autora la eligió entre «Sala de datos» (unir con líneas), «El medidor» (deslizador) y
  «Escáner del Caribe» (deslizar la carta a Antillas Mayores/Menores). Cierra el arco del
  tema: R1 geografía física · R2 *calcular* la tasa · R3 **qué significan** los indicadores
  (que es lo que evalúa la actividad 4 del libro).
- Mecánica calcada de `PR3Empareja` de juego-6: anclas por `offsetLeft/offsetTop` + curvas
  SVG, color por pareja, **sin número** (la autora ya había decidido allá que con líneas
  los números sobran).
- **Banco `J13_AM_TABLEROS`: 7 tableros** → misma variedad que el podio del Tema 1.
- ⭐ del tema quedó en **9** (3 por ronda): las tres pesan igual.

### Tres cosas que se corrigieron durante la construcción

1. **Las líneas no se dibujaban.** Los refs de las tarjetas estaban declarados pero **sin
   enganchar** (`ref={...}` olvidado), así que las anclas salían vacías y cada línea se
   descartaba en silencio: las parejas y el puntaje funcionaban, pero el gesto central era
   invisible. Lo cazó el e2e al contar 0 paths SVG.
2. **El revelado como segunda línea era ilegible.** Se probó dibujar la correcta punteada
   en dorado junto a la del niño: con 3 pares fallados quedan **6 curvas en un hueco de
   40 px** = maraña. Se cambió a **"va con `<concepto>`" dentro de la tarjeta derecha** (la
   ancha) + la línea roja del niño, y el hueco se abrió a 58 px. ⚠ Al crecer las tarjetas
   hay que **recalcular las anclas** (`useEffect` con `[verified]`) o las líneas quedan
   descolocadas.
3. **Dos filas del Pasaporte (R1) podían ofrecer el mismo par de opciones** ("limita al
   este" y "limita al oeste" comparten Atlántico/Pacífico): se veía como una fila repetida
   y acertar una regalaba la otra. El build ahora exige **pares de opciones distintos**
   entre las 3 filas.

## 2026-08-07 — Tema 3 "La diversidad cultural de la población mundial" (13 años)

La autora pasó las 3 páginas del tema (125-126 del libro + p. 86 del cuaderno) y pidió
**13 años** y que **"no sea para nada aburrido"**.

- **Es el primer tema del juego sin cuadros de datos.** Los temas 1 y 2 viven de cifras;
  este es actitudinal. Se ejercita **criterio**, no memoria. Eso mandó en la elección de
  mecánicas: nada de fichas para leer, todo gesto y ritmo.
- **Las actividades 3 y 4 del cuaderno son de respuesta abierta** (conversar, reflexionar)
  → no se gamifican. Se le dijo a la autora.
- **Los distractores del cuaderno son el mejor material del tema:** las ideas "que atacan"
  de la R1 salen literales de las opciones incorrectas de las actividades 1 y 2. No hubo
  que inventar ni una.
- Mecánicas elegidas con bocetos ASCII en el chat, una ronda a la vez y con OK explícito:
  - R1 «El muro» — *deslizar cartas* (elegida sobre "Lluvia de palabras" y "Vuelta al
    mundo"/ruleta).
  - R2 «Memoria cultural» — *voltear* (ver el choque de abajo).
  - R3 «Lluvia de palabras» — *atrapar*, para cerrar el tema con adrenalina en vez de con
    otra ficha.

### El choque de verbos con el Tema 2 (lección para la próxima)

Se aprobó una R2 «Pasaporte cultural» de **unir dos columnas con líneas**… y al ir a
construirla resultó que **el Tema 2 había estrenado ese mismo verbo** en su R3 "Sala de
datos" mientras este tema se diseñaba (los dos temas se trabajaron en sesiones paralelas
sobre los mismos archivos). Se detectó **antes de escribir código**, releyendo
`game-screens.jsx`, y se reemplazó por la memoria.

> **Regla que queda:** antes de bocetar una ronda, **releer los arreglos de rondas de TODOS
> los temas del juego** — no fiarse del estado que se leyó al empezar la sesión. Y avisar
> qué verbos consume el tema nuevo, para que el que se construya en paralelo no los tome.

### Ajustes durante la construcción

1. **El revelado de la memoria no dejaba ver las parejas.** Al agotar los 10 intentos, las
   8 cartas se destapaban con la pastilla "era pareja" cada una — cierto, pero inútil: no
   se sabía **cuál iba con cuál**. Ahora cada pareja pendiente lleva **color + forma**
   (● ▲ ■ ◆) y el pie dice "mismo color = pareja". Sin números, que la autora los quitó en
   juego-6. Verde y rojo quedan fuera de esa paleta: significan acertó/falló.
2. **Las 4 ilustraciones quedaron pendientes** (las genera la autora). Las cartas ya
   aceptan `img`; mientras tanto corren con emoji y el juego está completo igual.
