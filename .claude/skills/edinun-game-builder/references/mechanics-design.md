# Referencia — Biblioteca de mecánicas (gamificaciones)

Catálogo de **patrones de interacción** reutilizables sobre el shell EDINUN
(lienzo 900×540, HUD, personaje guía con bocadillo = CÓMO, enunciado = QUÉ, zona
central, acciones a la derecha, feedback verde/rojo con ✓ en la correcta al
fallar, reporte imprimible). Destilado de los **14 juegos de matemáticas** y
**25 de lengua** de `EDINUN GAMES EXPERIENCIAS`.

**Cómo usarla:** en el design-doc, "Mecánica" cita un patrón ("Patrón N") y
describe su adaptación a EESS — o define un **patrón nuevo** y lo documenta abajo.
Desde 7 años una sesión puede **mezclar mecánicas por ronda** (estándar de lengua:
3 rondas, cada una distinta). Todas respetan las invariantes de
`planificacion-inicial.md`. Convención: math usa casi siempre botón **VERIFICAR**;
lengua alterna VERIFICAR con auto-validación al tocar (arcade).

Familias: **A** entrada de valor · **B** reconocer/seleccionar · **C** organizar/
relacionar · **D** arcade/dinámicas · **E** completar palabra. *(Los ejemplos son
de otros repos: son referencia de PATRÓN, no de contenido — adaptar a EESS y a
domi/sisa/yaku/andi.)*

---

## A · Entrada de valor en casillas

**1. Rellenar slots posicionales** — arrastrar/tap fichas a casilleros ordenados
(se llenan de derecha a izq), botón BORRAR + VERIFICAR. UI: rejilla de columnas +
bandeja de fichas. *Sirve:* reconstruir algo multi-parte (una fecha, un número, un
código). Usan: `valor-posicional`, `operaciones-basicas`.

**2. Constructor con manipulables** — botones `+DECENA/+UNIDAD` apilan bloques,
QUITAR ÚLTIMO deshace, VERIFICAR. UI: contenedores con contador vivo + objetivo.
*Sirve:* representar una cantidad de forma concreta (votos, población, recursos).
Usan: `valor-posicional` (vp40/vp60).

**3. Teclear respuesta única (numpad)** — escribir en 1-2 slots con numpad; largo
del slot = pista. UI: consigna + numpad. *Sirve:* un dato exacto (año, cantidad,
conversión). Usan: `medidas-de-masa`, `fracciones`.

**4. Resolución paso a paso ("escalera")** — teclear el resultado de cada paso;
VERIFICAR avanza; errores intermedios se reintentan. *Sirve:* procesos multi-etapa
(pasos de un trámite, de una ley). Usan: `operaciones-combinadas`, `numeros-primos`.

## B · Reconocer / seleccionar

**5. Tocar la opción correcta (Mira y toca · binario · trivia)** — tap en 1 de
N fichas (2-4); valida al tocar o con VERIFICAR. UI: cartel/pregunta + fichas
candy. *Sirve:* definiciones, roles, ¿quién?, verdadero/falso, hecho vs opinión.
Usan: `_PLANTILLA`, `ccn/juego-1`, `lengua/juego-16`.

**6. Rellenar huecos en una lectura** — párrafo con varios huecos; cada hueco es
un selector segmentado (par de opciones) según contexto; VERIFICAR valida todos.
UI: "hojita rayada" con selectores inline. *Sirve:* elegir el término correcto
según contexto (vocabulario histórico/geográfico), comprensión de fuentes.
Usan: `lengua/juego-12`, `juego-8`.

**7. Marcar varios (multi-selección en campo/rejilla)** — tocar todos los que
cumplen; VERIFICAR compara el conjunto. UI: grilla/texto con hit-areas. *Sirve:*
"marca los deberes", "cuáles son recursos naturales", encontrar errores/casos.
Usan: `pares-ordenados`, `lengua/juego-6`.

## C · Organizar / relacionar

**8. Clasificar en cajones (bins)** — arrastrar (o tap-item→tap-caja) cada ítem a
su categoría; VERIFICAR. UI: bandeja + 2-4 cajones etiquetados. *Sirve:* poderes
del Estado, sector económico (1º/2º/3º), derechos/deberes, recursos renovables/no.
Usan: `lengua/juego-13`, `juego-22`.

**9. Ordenar secuencia (línea del tiempo)** — colocar fragmentos en casillas 1..N
(o swap de tarjetas); VERIFICAR. UI: tarjetas mezcladas + casilleros ordenados.
*Sirve:* cronología histórica, etapas de un proceso, antes/ahora/después.
Usan: `lengua/juego-17` (evolución de la escritura), `juego-10`, `juego-15`.

**10. Emparejar pares (memoria · conectar columnas)** — voltear 2 cartas iguales,
o unir columna A↔B con líneas. UI: grid de cartas o dos columnas. *Sirve:*
bandera↔país, símbolo↔significado, prócer↔obra, provincia↔capital, autoridad↔función.
Usan: `lengua/juego-6`, `juego-22`, `juego-4`.

**11. Organizador gráfico (tap-to-place a ranuras etiquetadas)** — arrastrar
etiquetas a un formulario/rueda/mapa; puede haber distractores; VERIFICAR. UI:
ficha tipo formulario o radios posicionados. *Sirve:* ficha de un hecho histórico
(¿Quién?/¿Qué?/¿Cuándo?/¿Dónde?/¿Por qué?), rotular un mapa o la bandera/escudo.
Usan: `lengua/juego-16` (laboratorio del relato), `juego-7`.

## D · Arcade / dinámicas (motivadoras, para mezclar rondas 7+)

**12. Ruleta giratoria + clasificar** — GIRAR anima la rueda; el sector sorteado
da un caso que el niño clasifica tocando la categoría. UI: rueda SVG + puntero +
botones. *Sirve:* repaso de categorías con azar (formal/coloquial → normas, casos
→ derecho/deber). Usan: `lengua/juego-12`, `juego-19`.

**13. Shooter / atrapa lo que cae** — ítems caen en 3 columnas con temporizador;
tocar solo los correctos, dejar caer las trampas; auto-evaluado. UI: carril de
caída + marcador + cronómetro. *Sirve:* discriminación rápida (pertenece/no,
símbolo nacional/extranjero, buena/mala convivencia). Usan: `lengua/juego-5`, `juego-22`.

**14. Simulador de decisión (chat · fases · tablero · swipe)** — avanzar una
historia decidiendo: elegir la respuesta de chat, moderar por fases, avanzar un
peón al acertar, o **deslizar** una carta izq/der para clasificarla. UI: marco de
celular / escenario / tablero / carta que se inclina. *Sirve (muy fuerte para
EESS):* criterio ciudadano, normas, resolución de conflictos, valores.
Usan: `lengua/juego-23` (chat), `juego-25` (swipe), `juego-22` (coloquio).

## E · Completar palabra

**15. Completar la palabra (letras/sílabas a huecos)** — imagen-pista (emoji) +
palabra con huecos; tap en ficha reutilizable llena el hueco; distractores
fonéticos. UI: cartel + casillas + bandeja. *Sirve:* armar el nombre de un símbolo/
prócer/lugar junto a su imagen. Usan: `lengua/juego-1`, `juego-9`.

---

## Reglas del arrastre (valen para CUALQUIER mecánica que se arrastre)

Aprendidas a base de correcciones de la autora en juego-10 y juego-13.

1. **Lo que se mueve tiene que VERSE moverse.** Una barra o un recuadro que marque el
   destino no basta: las piezas que están entre el origen y el destino se **apartan**
   el hueco que dejó la arrastrada. Si la columna se queda quieta, el niño no percibe
   que esté reordenando nada.
2. **Al soltar, la pieza ATERRIZA; no aparece.** Reordenar el arreglo y dejar que la
   pieza salte a su casilla se lee como un fallo (*"como que salta al lugar en el que
   le estoy colocando"*). Se cambia el orden **al instante** (el estado nunca queda a
   medias, así ¡VERIFICAR! lee siempre lo definitivo) y la pieza se anima ~190 ms desde
   donde quedó el dedo hasta su casilla.
3. **Ese viaje va con `element.animate()`, no con una transición CSS.** Para que una
   transición arranque, el navegador tiene que **pintar** el fotograma de partida, y
   React aplica los dos cambios de estado antes de ese pintado: la pieza llega de un
   tirón. Medido en juego-10: 0 ms donde el dedo, 30 ms ya en destino. Con
   `{ duration: 190, easing: "ease-out", fill: "backwards" }` (el `fill` aplica el
   desplazamiento inverso ya en el primer fotograma) sale bien.
4. **Empezar otro arrastre CORTA la animación en curso.** Bloquear el gesto mientras
   algo aterriza parece inofensivo (son 190 ms) pero pierde arrastres encadenados: en
   juego-10 la partida "perfecta" del e2e bajó de 11 ⭐ a 8. Se cancela la animación (la
   pieza ya está en su casilla) y se mide sobre los rectángulos reales.
5. **Mientras una pieza aterriza, las demás van SIN transición.** Cambian de casilla y
   de desplazamiento a la vez, así que no se mueven ni un píxel; si se animan, saltan
   un puesto y vuelven.
6. **Respaldo tap SIEMPRE** (tocar pieza → tocar destino), y el e2e juega **una partida
   con el arrastre y otra con el respaldo**: en juego-13 el tap no existía en la
   práctica y la ronda era imposible de acertar sin arrastrar.

## Separaciones: un hueco distinto se lee como un descuido

Dentro de una lista o rejilla, **todos los huecos iguales**. Si un elemento es de otra
naturaleza, se distingue por su **sitio** (al final), su color o su rótulo — nunca
dándole más aire. En juego-10 la zona Antártida llevaba 7 px extra a propósito y la
autora lo reportó como error. Al revés también: dos bloques que son **dos pasos
distintos** (abrir pistas → elegir lugar) necesitan separarse de verdad (~32 px), si no
se leen como una sola parrilla.

## Los avisos dentro de la mecánica no usan el verbo interno

El nombre del verbo con el que diseñamos la ronda (*lanzar*, *destapar*, *estirar*) es
vocabulario de trabajo. El aviso que ve el niño cuenta **lo que pasó**, no cómo lo
llamamos: ❌ `¡Todas lanzadas! Toca ¡VERIFICAR!` → ✅ `Ya colocaste las cuatro. Toca
¡VERIFICAR!`. Mismo caso que el `Estira el gráfico` que la autora mandó quitar.

## Inventar una mecánica nueva

Se anima a crear gamificaciones inéditas — **manteniendo el shell**:

1. Respeta las **zonas del lienzo 900×540** (HUD arriba · personaje guía izq ·
   zona central · acciones der) y dibújalas en el ASCII del design-doc.
2. Reusa piezas ya construidas: cartel dorado, fichas candy, bandeja, rejilla,
   cajones, rueda SVG, carril de caída, bocadillo del personaje, botones
   VERIFICAR/REINICIAR/SALIR.
3. Decide la **validación** (tap directo vs VERIFICAR) y respeta "fallar no baja
   progreso / revelar la correcta".
4. Mapea a `lastResult.log[i]` (`idx, emoji, a, userAnswer, correctAnswer,
   isCorrect, time`) para que el **reporte imprimible** funcione.
5. Añade **anti-repetición** (FIFO en localStorage) si hay banco.
6. Documenta el patrón nuevo aquí y en el design-doc.

## Gamificaciones recomendadas para Estudios Sociales

| Tema de EESS                                   | Patrón(es) sugerido(s)          |
|------------------------------------------------|---------------------------------|
| Mapas · ubicación · puntos cardinales · capitales | 7 (marcar en plano/mapa) + avatar-a-celda (var. de 8/11) |
| Historia · línea del tiempo · etapas · causas   | 9 (ordenar secuencia)           |
| Clasificar (poderes, sectores, derechos/deberes, recursos) | 8 (cajones) · 12 (ruleta) |
| Símbolos patrios · próceres · provincia↔capital | 10 (emparejar) · 15 (completar) |
| Convivencia · normas · valores · conflictos     | 14 (simulador/swipe) · 5 (binario) |
| Interpretar fuentes · ¿quién/qué/cuándo/dónde?  | 11 (organizador) · 6 (huecos en lectura) |
| Definiciones · conceptos                        | 5 (Mira y toca)                 |

### Ideas concretas ya mapeadas (del catálogo de 39 juegos)

1. **Mapa/ubicación** — sobre un mapa del Ecuador (regiones o cuadrícula), el niño
   arrastra el avatar a "¿dónde queda Quito?" o marca varias capitales pedidas
   (reusa la rejilla de `plano-cartesiano`/`pares-ordenados`).
2. **Línea del tiempo** — ordenar hechos (independencia, fundación, presidentes) en
   casillas 1→N (idéntico a `lengua/juego-17`).
3. **Clasificar cívico/económico** — cajones "Ejecutivo/Legislativo/Judicial",
   "primario/secundario/terciario", "derechos/deberes", "renovable/no renovable";
   o ruleta que sortea un caso y el niño lo clasifica.
4. **Símbolos patrios** — memoria o dos columnas bandera↔país, símbolo↔significado,
   prócer↔obra; o armar el nombre del símbolo con sílabas junto a su escudo.
5. **Convivencia** — simulador de decisiones en aula/barrio por fases, o **swipe**
   de conductas a "respeta la norma / la rompe", o binario "¿derecho o deber?".
6. **Interpretar fuentes** — ficha "expediente" tap-to-place (¿Quién?/¿Qué?/
   ¿Cuándo?/¿Dónde?/¿Por qué?) de un hecho histórico (reusa `lengua/juego-16`), o
   una lectura con huecos donde elige el término histórico/geográfico correcto.
