# juego-12 — design doc

> Estado: **planificación**. Nada construido todavía. Pendiente del OK de la autora.

## 1. El juego

| | |
|---|---|
| Slug | `juego-12` (hueco libre; los saltos vienen de los otros repos) |
| Tipo | **Multi-libro**: menú de dos niveles (Libro → Tema), patrón de `juego-6` |
| Guía | **Andi** — por el ciclo del elenco (`memory/orden-personajes.md`: 12 mod 4 = 0) |
| Título | ⏳ **pendiente** de la autora |

### Estructura que fijó la autora

| Libro | Actividades |
|---|:--:|
| Libro 6 | 3 |
| Libro 7 | 4 |
| **Total** | **7** |

| Libro | Tema | id | Edad | Estado |
|---|---|---|:--:|---|
| 6 | **1. Estado ecuatoriano en sus primeros años de vida** (D.C.D. CS.3.1.30 / 31 / 32) | `l6-t1` | **10** | 🟡 diseñado, sin construir |
| 6 | 2. ⏳ por definir | — | — | ⏳ falta material |
| 6 | 3. ⏳ por definir | — | — | ⏳ falta material |
| 7 | 1-4. ⏳ por definir | — | — | ⏳ falta material |

⚠ **El Libro 6 ya tiene un tema jugado en otro juego:** *"La Amazonía, nido de vida
silvestre"* (Tema 2 del Libro 6) está en `juego-6` con tres rondas. Si cae entre los tres
del Libro 6 de aquí, hay que avisar a la autora antes de duplicarlo.

⚠ **Verbos:** con 7 actividades no caben 21 gestos distintos. La regla que se aplica —la
misma que `juego-6`, que tiene 7— es **tres verbos distintos dentro de cada tema**, y que
un tema no repita los de su vecino. Entre libros distintos sí se puede reutilizar un gesto
con otro contenido.

---

## 2. Libro 6 · Tema 1 — "Estado ecuatoriano en sus primeros años de vida" (10 años)

Del tema del libro (pp. 72-77) y su cuaderno (pp. 65-70).

### 2.1 Qué entra y qué no

**Entra:**
- 1830: se separa el Distrito del Sur; Primera Asamblea Constituyente en **Riobamba**;
  los departamentos de **Azuay, Guayas y Quito** forman el "Estado del Ecuador" (Art. 1).
  **Flores** presidente, **Olmedo** vicepresidente. Fecha: **13 de mayo de 1830**
  (actividad 9 del cuaderno).
- 1834-1835: fin del periodo de Flores, Segunda Constituyente en **Ambato**,
  **Rocafuerte** presidente (Dirección General de Estudios, colegios, primera Ley de
  Hacienda).
- **Población de 1830:** ~500 000 habitantes. Quito 25 000 · Cuenca 18 000 ·
  Riobamba 7 600 · Guayaquil 6 000.
- **La pirámide social** de la p. 74, con sus cuatro escalones textuales.
- **Art. 12 de la Constitución de 1830:** ciudadanía = casado o mayor de 22 + propiedades
  + empleo + saber leer y escribir. Y la exclusión explícita de **analfabetas y mujeres**
  (p. 76).
- Los oficios urbanos y rurales de la p. 76 (aguatero, barrendero, cajonero, cargador,
  vendedor; jornaleros y trabajadores agrícolas).

**No entra:**
- Las actividades de **respuesta abierta** del cuaderno (2, 7, 8, 10 y la grupal).
- La **pena de muerte para 72 opositores**: es un dato real del libro, pero no se gamifica
  — no se hace un juego con una ejecución.
- El mapa de la actividad 1 (pintar las tres regiones): ya hay mapas en juego-10 y
  juego-14, y el verbo "colorear regiones" no aporta nada nuevo aquí.

### 2.2 Las tres rondas (aprobadas por la autora en el chat)

| Ronda | Nombre | Verbo | Valida | ⭐ |
|---|---|---|---|:--:|
| R1 | El sello de ciudadanía | **decidir con criterio** | al tocar, sin ¡VERIFICAR! | 4 |
| R2 | La pirámide | **apilar por jerarquía** | ¡VERIFICAR! | 3 |
| R3 | El censo de 1830 | **comparar tamaños** | ¡VERIFICAR! | 4 |

**⭐ máximo 11.**

#### R1 · "El sello de ciudadanía"

Cuatro personas, una por jugada. La **ley está siempre en pantalla**, así que la ronda se
resuelve leyendo, no recordando (regla 18). Al decidir se marca **qué requisito falló**.

```
┌──────────────────────────────────────────────────────┐
│   Decide quién podía ser ciudadano en 1830.          │
│                                                      │
│  ┌─ CONSTITUCIÓN DE 1830 · ART. 12 ───────────────┐  │
│  │ Casado o mayor de 22 · Tener propiedades ·     │  │
│  │ Tener empleo · Saber leer y escribir           │  │
│  └────────────────────────────────────────────────┘  │
│         ┌──────────────────────────┐                 │
│         │   [ilustración]          │                 │
│         │   MANUEL, 30 años        │                 │
│         │   Jornalero en una hacienda│               │
│         │   No sabe leer            │                │
│         │   No tiene propiedades    │                │
│         └──────────────────────────┘                 │
│     [ ✔ SÍ, CIUDADANO ]      [ ✘ NO PODÍA ]          │
└──────────────────────────────────────────────────────┘
```

**Banco: 12 personas**, todas de los grupos que nombra el tema. Cada una se define por los
cuatro requisitos del Art. 12 más el dato de ser mujer.

⚠ **Reglas del sorteo:**
- En cada partida **al menos un "sí" y al menos un "no"**: si salieran cuatro iguales, se
  acertaría sin leer.
- **El requisito que falla va cambiando** entre las cuatro.
- El caso de la **mujer que cumple todo y queda fuera igual** es el que mejor enseña el
  tema; entra con frecuencia pero no siempre, para que no se vuelva un truco.

#### R2 · "La pirámide"

Los cuatro escalones de la p. 74. **Un escalón llega ya puesto** como ancla (varía cuál) y
se colocan los otros tres ⇒ **+3 ⭐** y la variedad no depende de contenido nuevo.

```
                    ╱▔▔▔▔▔╲
                   ╱ [   ] ╲      ← Élite terrateniente y altos funcionarios
                  ╱─────────╲
                 ╱  [     ]  ╲    ← Militares, comerciantes y clero
                ╱─────────────╲
               ╱   [       ]   ╲  ← Indígenas, campesinos, montuvios y mujeres
              ╱─────────────────╲
             ╱    [         ]    ╲ ← Afroamericanos esclavizados e indígenas
            ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔    de la Amazonía
```

⚠ **El escalón de abajo no lleva ilustración de personas.** Va con un símbolo sobrio y el
nombre textual del grupo: no se dibuja una caricatura de personas esclavizadas.

#### R3 · "El censo de 1830"

Cuatro barras; los números llegan **desordenados** arriba y hay que arrastrar el borde de
cada barra hasta el suyo. La sorpresa del dato (Guayaquil era la más pequeña) es parte de
la lección.

⚠ **Es la ronda con MENOS variedad del tema, y hay que decirlo:** el libro da un solo
cuadro de cifras. Lo que cambia por partida es **cuáles 4 de las 5 cantidades** entran (las
cuatro ciudades + los 500 000 del país), **el orden** en que se ofrecen y **cuál barra
llega ya puesta**. Si a la autora le parece poco, se cambia la ronda por el **organigrama
del Estado** (Ejecutivo / Legislativo → Diputados y Senadores / Judicial), que da más
combinaciones.

### 2.3 Copy (enunciado = QUÉ · bocadillo = CÓMO)

| Ronda | Enunciado | Bocadillo |
|---|---|---|
| R1 | Decide quién podía ser ciudadano en 1830. | Lee la ficha<br>y elige sí o no. |
| R2 | Arma la pirámide social de 1830. | Toca un grupo<br>y luego su escalón. |
| R3 | Pon a cada ciudad sus habitantes. | Arrastra el borde<br>de cada barra. |

### 2.4 Anti-repetición

| Clave | Qué sortea |
|---|---|
| `edinun_j12_l6t1_r1_v1` | 4 personas de 12 (cap < 8) |
| `edinun_j12_l6t1_r2_v1` | cuál escalón llega de ancla (1 de 4, cap 3) |
| `edinun_j12_l6t1_r3_v1` | cuáles 4 cantidades de 5 y cuál barra llega puesta |

### 2.5 Imágenes

**12 ilustraciones cuadradas** (`assets/persona-<id>.jpg`), que sirven para la R1 **y**
para la R2 (la pirámide reutiliza las figuras). Prompts entregados a la autora el
2026-11-17, con el formato explícito (`square image, 1:1 aspect ratio`, regla 17) y sin
marcas (regla 15). Todo el juego funciona con **emoji de respaldo** mientras no estén.

### 2.6 Riesgos

- **Dato sensible:** la exclusión de las mujeres y la esclavitud se juegan como lo que
  son —hechos del libro—, sin caricatura y sin convertir a nadie en un chiste.
- **Edad 10:** registro visual ilustrado, no fotográfico, y frases cortas en las fichas.
- La R3 es la de menor variedad (ver 2.2).

---

# 3. Libro 6 · Tema 2 — "Revolución Marcista" (10 años)

## 3.1 Material del libro (lo que entregó la autora)

Se copia aquí porque es la ÚNICA fuente de los datos de este tema: todo lo que no esté
en esta lista no sale del libro y no se usa sin preguntarle.

- **6 de marzo de 1845**, Guayaquil: golpe contra Flores, el impuesto personal de **tres
  pesos** y el grito *"¡mueran los tres pesos!"*.
- **Bandera marcista:** tres cuarteles — dos blancos y uno azul al centro — con **tres
  estrellas** por Quito, Guayaquil y Cuenca.
- **Consecuencias:** Constitución de Cuenca 1845, Roca presidente, vuelve el clero, se
  revisan los impuestos, cae la "Carta de la Esclavitud".
- **Cinco presidentes 1845-1859.** Marcistas militares: **Urbina** (manumisión de los
  esclavos, 25 de julio de 1851) y **Robles** (abolió la contribución de los indígenas).
- **Crisis de 1859:** cuatro gobiernos a la vez — Quito/García Moreno · Guayaquil/Franco
  · Cuenca/Carrión · Loja/Carrión Pinzano.
- **García Moreno**, el Progresismo, el auge cacaotero y el cuadro Sierra ↔ Costa.

## 3.2 Rondas aprobadas

Verbos ya gastados en el Libro 6 y por tanto prohibidos aquí: *decidir sí/no*,
*arrastrar a su sitio* y *ordenar* (los tres del Tema 1).

- **R1 "La bandera de marzo"** — verbo **componer**. Se toca una pieza y la bandera se
  dibuja encima en el acto: el símbolo nace a la vista. Sobre el 6 de marzo, los tres
  pesos y las tres estrellas (Quito, Guayaquil, Cuenca). Se dibuja en SVG, NO es una
  imagen: una imagen plana no se puede ir montando.
- **R2 "El Ecuador partido en cuatro"** — verbo **tocar en el mapa**. La crisis de 1859:
  se toca dónde manda cada uno de los cuatro gobiernos y la zona se pinta al acertar,
  hasta que el país queda partido a la vista. Mapa de datos reales (Natural Earth),
  nunca dibujado a ojo ni generado como imagen.
- **R3** — pendiente de que la elija la autora.

Descartadas por la autora: "La lupa en el muelle" (explorar una escena del auge
cacaotero) y "La rueda de los años" (girar un dial por 1845-1859).

## 3.3 Cómo quedó (y lo que cazaron las pruebas)

- **R1 «La bandera de marzo»** — se toca un color y entra **solo** en el siguiente cuartel
  vacío; tocar un cuartel lo vacía y los de su derecha se corren, así nunca quedan huecos
  salteados. Las estrellas van con un contador − / +, que es otro gesto. El revelado
  dibuja la bandera correcta en su propio cartel ("IBA ASÍ"), nunca encima de la del niño.
  ⭐ 3 cuarteles + las estrellas = 4.
- **R2 «El Ecuador partido»** — se pide un gobernante y se toca su ciudad; al completarse
  los cuatro aparece el aviso de rematar (antes la columna se quedaba vacía). ⭐ 4.
  Las manchas de color son **zonas de influencia, no fronteras**: el libro no las da.
- **R3 «La Carta de la Esclavitud»** — el corte avanza con el gesto y al pasar del 72 %
  del ancho el renglón se rompe; por el hueco asoma "DEROGADO · 1845" con los dientes del
  papel. ⭐ 3.
  ⚠ **Callejón sin salida, cazado jugando:** si el niño rompía un renglón que una consigna
  POSTERIOR iba a pedir, esa consigna se quedaba sin solución y la ronda no terminaba.
  Ahora **cada turno pide un renglón que siga entero** y, si no queda ninguno de los tres,
  la ronda acaba sola. Lo vigila `sin-callejon-r3.js`.

**Variedad medida** (`variedad-l6t2.js`, 8 partidas): paleta 8/8 · recorrido del mapa 7/8
· orden del papel 8/8 · orden de las consignas 4/8. Lo que varía es el **recorrido**, no
el contenido: la bandera es una sola y los cuatro gobiernos son los del libro.

**Herramientas del tema:** `e2e-l6t2.js`, `espacios-l6t2.js` (solapes y desbordes),
`variedad-l6t2.js`, `sin-callejon-r3.js`, `shot-l6t2.js`.

⚠ El detector de solapes tenía un punto ciego: la **opacidad no se hereda como valor
calculado**, así que medía el texto de un renglón ya roto (su contenedor está a
`opacity: 0` pero el hijo sigue diciendo 1). Corregido en `espacios-l6t1.js` y
`espacios-l6t2.js`: ahora mira también los ancestros.


---

# 4. Libro 7 · Tema 1 — "La Revolución Liberal" (11 años)

D.C.D. CS.3.1.40 · CS.3.1.41 · CS.3.1.42 · CS.3.1.43. Material entregado por la autora el
**2026-11-23** (libro pp. 10-15 + cuaderno pp. 11-14). Es el tema que **enciende el botón
del Libro 7**, que hasta ahora salía apagado por no tener temas.

## 4.1 Material del libro (única fuente)

Se copia aquí porque es la ÚNICA fuente: lo que no esté en esta lista no sale del libro y
no se usa sin preguntarle.

- **1895** — la "venta de la bandera"; el **5 de junio** una Junta Patriótica nombra a
  **Eloy Alfaro jefe supremo** y general en jefe.
- **1897** — Asamblea Constituyente en Quito: **nueva Constitución** y Alfaro presidente.
  Mismo año, **Ley de Instrucción Pública** (el clero sale de la enseñanza) y prohibición
  de que entren comunidades religiosas de enseñanza.
- **1900** — Ley de **Registro Civil**. **1902** — Ley de **Matrimonio Civil y del
  Divorcio**. **1904** — Ley de Cultos. **1906** — **Estado laico** y segunda Constitución.
  **1908** — **Ley de Manos Muertas** y fin del **ferrocarril Guayaquil-Quito (452 km)**.
- **1912** — Alfaro apresado y llevado a Quito; allí muere. Fin de la Revolución liberal.
- **Laicismo:** el Estado se rige por leyes y no por dogmas; la religión queda "relegada al
  ámbito de la vida privada y de la conciencia individual"; libertad de pensamiento por la
  palabra o la prensa. Y (cuaderno p. 13) **la religión siguió en la vida cotidiana**: el
  Carnaval, las procesiones, la Novena a los Santos.
- **Mujer:** educación laica para las niñas, escuelas de artes y oficios, derecho al
  trabajo, **voto en 1929**, Matilde Hidalgo de Procel.
- **Plutocracia 1912-1925**, el Banco Comercial y Agrícola, la **crisis cacaotera**
  (26,76 → 5,75 sucres el quintal; la **monilla** en 1917; la escoba de bruja en 1923),
  el **levantamiento de Concha** (1913-1916) y la **marcha obrera del 15 de noviembre de
  1922** en Guayaquil.

## 4.2 Rondas aprobadas

Verbos ya gastados en el Libro 6: *decidir sí/no*, *apilar*, *ordenar*, *componer*,
*tocar en el mapa*, *rasgar*. Entre **libros distintos** sí se puede reutilizar un gesto
con otro contenido, y la R1 reutiliza *ordenar*; dentro del Libro 7 las tres manos son
distintas.

| Ronda | Mano | ⭐ |
|---|---|:--:|
| R1 "Tender la vía" | ordenar arrastrando sobre los rieles | 4 |
| R2 "La balanza de 1897" | repartir en tres destinos, la viga se inclina | 2 |
| R3 "Expediente abierto" | destapar pistas y apostar cuanto antes | 2 |

**Total 8 ⭐.**

- **R1 «Tender la vía»** — 4 hechos de un banco de **6, todos con año distinto** (si dos
  compartieran año habría dos ordenaciones correctas). **El año no se ve mientras se
  juega**: deducir el orden ES el ejercicio. Se arrastra (la tarjeta sigue al dedo y al
  soltar todas aterrizan) y el toque de dos tarjetas las intercambia, de respaldo. El
  **revelado habla el idioma de la mecánica**: el tren baja por los rieles y **frena en la
  primera tarjeta fuera de sitio**; si las cuatro están bien, llega a Quito. Fondo del
  ferrocarril al 16 % de opacidad, como **background-image**, nunca como `<img>`
  sobredimensionado.
- **R2 «La balanza de 1897»** — llega un asunto a la vez y se toca su destino: **LA
  IGLESIA · CADA PERSONA · EL ESTADO**. La viga se inclina en vivo.
  ⚠ **Son TRES destinos, y es lo que hace que la ronda exista.** Con solo Iglesia/Estado,
  todo lo que el libro cuenta cae del lado del Estado y no habría nada que decidir. El
  tercero sale textual del libro: la creencia queda "en el ámbito de la vida privada y de
  la conciencia individual". El de la Iglesia sale del cuaderno p. 13 (el Carnaval, las
  procesiones, la Novena siguieron igual).
  ⚠ **Dos asuntos por partida, no cinco**, y en **destinos distintos**: se sortea la pareja
  de destinos y se saca un asunto de cada uno.
  ⚠ La viga que se inclina es un **espejo del reparto**, no una corrección: ni verde ni
  rojo antes de ¡VERIFICAR!. **BORRAR** devuelve el último asunto a la mano, de uno en uno.
- **R3 «Expediente abierto»** — 3 expedientes de un banco de 6. Cada uno llega con su
  ilustración y **una pista**; se pueden destapar dos más. ⭐ **+1 por acierto y +1 más si
  se acertó con la primera pista sola**: destapar no quita nada de lo ganado, solo deja de
  sumar el extra. Las **opciones falsas son nombres reales de otros hechos del tema**, no
  inventos. Volver a tocar la opción ya elegida **no la quita**.

## 4.3 Anti-repetición

| Clave | Qué sortea | cap |
|---|---|:--:|
| `edinun_j12_l7t1_r1_v1` | cuáles 2 de los 6 hechos se quedan fuera | 3 |
| `edinun_j12_l7t1_r2_par_v1` | cuál de las 3 parejas de destinos entra | 2 |
| `edinun_j12_l7t1_r2_est_v1` | 1 asunto del Estado de 6 | 4 |
| `edinun_j12_l7t1_r2_igl_v1` | 1 asunto de la Iglesia de 3 | 2 |
| `edinun_j12_l7t1_r2_per_v1` | 1 asunto de la persona de 3 | 2 |
| `edinun_j12_l7t1_r3_v1` | 1 expediente de 6 | 5 |

⚠ Regla de cap: para un SUBCONJUNTO de K, nunca cap = K.

## 4.4 Imágenes

**9 archivos en `assets/`**, prompts entregados a la autora el 2026-11-23. El tema entero
**se juega igual sin ellas** gracias al respaldo de emoji de `J12Img`.

| Archivo | Ratio | Dónde |
|---|:--:|---|
| `j7t1-ferrocarril.jpg` | 16:9 | fondo de la R1 |
| `j7t1-iglesia.jpg` · `j7t1-estado.jpg` | 1:1 | platillos de la R2 |
| `j7t1-cacao` · `-marcha` · `-montonera` · `-escuela` · `-registro` · `-estacion` | 1:1 | los 6 expedientes de la R3 |

⚠ **Ninguna cara de persona real se dibuja.** Alfaro y Matilde Hidalgo se nombran, no se
ilustran. Las escenas con gente van a distancia, sin rostros detallados.

## 4.5 Fuera del juego, a propósito

La **"hoguera bárbara"** como escena. Es del libro, pero no se hace un juego con un
linchamiento: el hecho de 1912 entra en la R1 redactado en seco ("Alfaro es apresado y
llevado a Quito; allí muere y termina la Revolución liberal").

## 4.6 Verificado (2026-11-23)

- `format-lint` **15/15** · `qa-visual` 6 viewports, sin overflow, colchón **67 px**.
- `e2e-l7t1.js`: partida perfecta **3/3 · 15 ⭐** (4 · 5 · 6), partida fallada **0/3 · 0 ⭐**
  con **revelado en las tres rondas**, **BORRAR** de la R2 comprobado, **6 recargas con 6
  combinaciones distintas y 0 repeticiones seguidas**, 0 errores de consola.
- `espacios-l7t1.js`: lienzo entero, 3 rondas, **5 viewports**, en reposo, **en pleno
  arrastre** y con el revelado puesto — nada superpuesto, nada fuera del lienzo, ningún
  texto recortado (18-34 elementos medidos por pantalla).
- Regresión del Libro 6 en verde: `e2e-l6t1`, `e2e-l6t2`, `reglas-r3`, `borrar-y-bocadillo`.
- 🐛 **Cazado por el detector de solapes:** en reposo el tren se dibujaba por encima del
  rótulo GUAYAQUIL en los cinco tamaños de ventana. Ahora se para en el arranque de los
  rieles (`top: 0`).

## 4.7 Pendiente

- Las **9 ilustraciones** (las genera la autora).
- **QA de contenido jugándolo ella**, que es lo único que detecta una ronda que no se
  entiende.
- Los **3 temas restantes del Libro 7** y el **tema 3 del Libro 6**.

---

# 5. Libro 6 · Tema 3 — "El preámbulo del siglo XX" (10 años)

D.C.D. CS.3.1.37 · CS.3.1.38 · CS.3.1.39. Material entregado por la autora el
**2026-11-23** (libro pp. 112-115 + cuaderno pp. 103-106). Cierra el Libro 6.

## 5.1 Material del libro (única fuente)

- **Ideas liberales:** la industrialización europea trae la propiedad privada, la libertad
  y el sufragio; llegan a fines del siglo XIX y prenden en la literatura, la educación y
  la filosofía. El **Estado asume la educación** creando instituciones **dependientes del
  erario público**, que abren el ingreso **de la mujer** y usan materiales **sin
  connotación confesional**, contrarrestando la primacía de la **Iglesia Católica**.
- **Pensadores:** **Juan Montalvo** (Ambato 1833 – París 1889; periodismo contra los
  gobiernos despóticos de García Moreno y Veintimilla; *El Cosmopolita*, *Las
  Catilinarias*), **Abelardo Moncayo** (luchas alfaristas, Estado laico, denunció el
  concertaje) y **José Peralta** (mentalizador de la Carta Constitucional de 1896-97).
  También se nombran Belisario Quevedo, Julio Zaldumbide y Medardo Ángel Silva.
- **La mujer:** relegada al espacio doméstico a fines del XIX; con el liberalismo accede a
  la **educación** y a **espacios públicos y laborales**; se crean **escuelas de prácticas
  y técnicas, colegios femeninos** y el mutualismo. El cuaderno (p. 104) añade que **las
  señoras de clase media y alta** seguían sujetas al papel de **madre y esposa**.
- **Unidad nacional:** Rocafuerte (Dirección General de Estudios, colegios, primera Ley de
  Hacienda) · García Moreno (ferrocarril y educación con visión religiosa) · la Revolución
  Liberal y Alfaro (las 12 obras: ferrocarril, vías, agua potable, Registro Civil, fin del
  concertaje, bienes de la Iglesia al Estado…).
- **Identidad:** el liberalismo saca del **anonimato** a los artesanos y trabajadores del
  puerto de Guayaquil y a los **indígenas de la Sierra**; la cultura popular une raíces
  **andinas, españolas y afro**. Y aparecen las **oligarquías** y la **burguesía bancaria**
  (Banco Comercial y Agrícola, Guayaquil).
- **Fragmento de Montalvo** (cuaderno p. 106): quién **no** pertenece al pueblo (el
  tirano, el opulento, el soberbio, el que oprime) y quién **sí** (el que vive del sudor
  de su frente, el que arranca a la tierra los frutos, el que forja los metales).

⚠ **El ferrocarril y la lista de obras de Alfaro se dejan al Libro 7 · Tema 1**, que ya
los usa. Este tema se queda con las ideas, los pensadores y la mujer.

## 5.2 Rondas aprobadas (una a una, con la autora)

| Ronda | Verbo | ⭐ |
|---|---|:--:|
| R1 «Quitar la niebla» | frotar para descubrir **y elegir** | 2 |
| R2 «Tres plumas» | girar la ficha | 3 |
| R3 «El sello de Montalvo» | estampar | 3 |

Tres verbos que **no existen** en los otros temas del Libro 6 (allí se gastaron decidir
sí/no, arrastrar, ordenar, componer tocando, tocar en el mapa y rasgar). **⭐ 2+3+3 = 8.**

## 5.3 Cómo quedó, y lo que costó

- **La R1 nació sin poder fallarse.** Con las 8 ilustraciones iniciales **todas** eran
  correctas, así que bastaba tocarlas todas. La autora lo vio y pidió lo que ahora está:
  se descubre frotando y **después se eligen** los que no tenían voz. Para eso hizo falta
  material nuevo: **hacendado, sacerdote y banquero** (los que el libro dice que ya tenían
  poder). Cada partida saca **2 sin voz + 2 con voz**.
  - ⚠ La **señora de clase alta** quedó entre las que **NO** tenían voz, no entre las
    poderosas: el libro y el cuaderno dicen que la mujer seguía sujeta al espacio
    doméstico. Se le avisó del cambio a la autora.
  - Mientras se juega solo se ve el **nombre**; la frase que explica si esa persona tenía
    voz aparece **al verificar**, sobre la foto. Enseñarla antes sería regalar la respuesta.
- **Las 12 ilustraciones las generó la autora** y llegaron en 16:9 con la figura pequeña y
  descentrada. `.planning/optimizar-j6t3.js` las recorta a **330×440**: encuadra para que
  la figura ocupe siempre el **84 % del alto**, rellena el aire **estirando el borde** de
  la lámina (un color plano dejaba un marco visible) y, sobre todo, **dibuja, mide la
  silueta en el resultado y corrige** hasta tres veces. Centrar por el torso fallaba: un
  libro o un saco en la mano corre el centro. Lo vigila `.planning/centros-j6t3.js`.
- **Variedad.** La autora pidió comprobarla. Medido en 8 partidas seguidas con
  `.planning/variedad-l6t3.js`: R1 **8/8** repartos distintos, R2 **7/8**, R3 **8/8**, y
  **ninguna partida repitió la anterior**. Para lograrlo hubo que ampliar los bancos: la
  R2 tiene **dos hechos por persona** (12 fichas, sale una de cada una) y la R3 **siete
  frases**, de las que se enseñan cinco. La R1 además evita repetir la **colocación**.
- **¡VERIFICAR! se apaga** hasta elegir exactamente lo que pide la ronda (2 en la R1, 3 en
  la R2 y la R3). Sin letrero debajo: la autora lo quitó.
- **El revelado enseña las correctas, no solo el veredicto**: lo que había que marcar y no
  se marcó sale en **ámbar** («TE FALTÓ» / «ERA ESTA»), y en la R2 se abren **todas** las
  fichas, también las que quedaron boca abajo, con su hecho y su nombre.

---

# 6. Libro 7 · Tema 2 — "Insurgencia, cambio social y surgimiento del velasquismo" (11 años)

D.C.D. **CS.3.1.45 · CS.3.1.46 · CS.3.1.47 · CS.3.1.48**. Material entregado por la autora
el **2026-11-24**: libro pp. 32-38 (Unidad 2, Tema 1) + cuaderno pp. 27-32.

⚠ En el libro es el **Tema 1 de la Unidad 2**; dentro del juego entra como **Libro 7 ·
Tema 2**, porque el Tema 1 del juego es la Revolución Liberal.

## 6.1 Material del libro (ÚNICA fuente)

Copiado aquí porque es lo único de lo que pueden salir los datos del tema. Lo que no esté
en esta lista no sale del libro y no se usa sin preguntarle a la autora.

**La crisis cacaotera (pp. 32-33)**
- De 1870 a 1920 el Ecuador vive un período agroexportador con el cacao como producto de
  comercio internacional; la economía se sustenta en ese solo producto.
- No se sentaron bases sólidas para un desarrollo autosostenible: el beneficio fue de la
  burguesía comercial y la bancaria.
- Causas de la crisis, a partir de 1920: **plagas de la monilla y la escoba de bruja** ·
  **devaluación del precio del quintal en Nueva York** · **incremento de la producción de
  Brasil y Costa de Marfil**, que vendían más barato.
- Consecuencias: en **1930** se reducen notablemente precio y volumen de exportación;
  quiebran instituciones bancarias; **devaluaciones frente al dólar** y subida del costo
  de vida.
- Diversificación: **café en Manabí, Los Ríos y El Oro**; **arroz** en la cuenca del
  Guayas; **tagua** en Manabí y Esmeraldas; modernización ganadera en la Sierra Norte;
  **sombreros de paja en la Sierra Sur**, que crecen en los años veinte y otra vez en los
  cuarenta. Crecen la industria textil, alimenticia, de la construcción, maderera, química
  y farmacéutica.
- La crisis golpea a la clase trabajadora: **bajos salarios y carencia de seguridad
  social**.

**Las organizaciones sociales y la insurgencia (pp. 33-34)**
- SAIP (Sociedad Artística e Industrial de Pichincha), **1892**; **FEU 1919**; Federación
  Textil del Ecuador; **CEDOC 1934**; **CTE** y **FEI**, bajo las ideas socialistas.
- Reclamos: disminución de la jornada, seguridad laboral y social, derecho a la huelga y a
  la organización.
- El **1 de mayo** y la jornada de 8 horas (Chicago, 1886).

**La Revolución Juliana y Ayora (p. 35)**
- **1925**: militares jóvenes forman la "Liga Militar" y buscan modernizar el Estado; las
  medidas resultan débiles y limitadas.
- Los bancos **emitían dinero sin respaldo**, sin institución que garantizara reservas en
  oro.
- **Isidro Ayora (1926-1931)** crea el **Banco Central**, único organismo encargado de
  emitir moneda. Obras: tramo del **ferrocarril Quito–Ibarra**, **Primeras Olimpiadas
  Nacionales en Riobamba**, pavimentación de las calles de Quito, trazado de carreteras.
- Renuncia en agosto de 1931. **Neptalí Bonifaz** electo en octubre de 1931 y
  descalificado el **20 de agosto de 1932**: la **"Guerra de los Cuatro Días"** (29 de
  agosto al 1 de septiembre), más de dos mil muertos.
- Wall Street, **octubre de 1929**.

**El velasquismo (p. 36)**
- Martínez Mera (1932-1933), Abelardo Montalvo (octubre de 1933, renuncia a los pocos
  días), **Velasco Ibarra** elegido en 1933 — primer período **septiembre de 1934 a 1935**,
  derrocado por el ejército; cinco veces presidente y solo una terminó su período.
- Pons, **Páez (1935-1937)**, **Enríquez Gallo (1937-1938)**, **Mosquera Narváez
  (1938-1939)**, **Arroyo del Río (1940-1944)**.
- Cuaderno p. 30: **21 presidentes entre 1929 y 1947**; **Código del Trabajo**, Ley de
  Cooperativas, Ley de Petróleos; tratado de Río de Janeiro; "La Gloriosa", 28 de mayo de
  1944.

**El arte y la vida (pp. 37-38)**
- **Generación de los treinta**; corriente indigenista.
- **Pío Jaramillo Alvarado**, *El indio ecuatoriano* · **César Dávila Andrade** (Cuenca,
  1917), *Boletín y Elegía de las Mitas* · **Grupo de Guayaquil**: **Enrique Gil Gilbert**
  (*Relatos de Emmanuel*, *Nuestro Pan*), **Joaquín Gallegos Lara** (*Las cruces sobre el
  agua*), **Demetrio Aguilera Malta**, **Alfredo Pareja Diezcanseco** (*La hoguera
  bárbara*), **José de la Cuadra** (*Los Sangurimas*), **Ángel Felicísimo Rojas** (*El
  éxodo de Yangana*) · **Fernando Chaves**, *Plata y Bronce* · **Jorge Icaza**
  (*Huasipungo*, *Chulla Romero y Flores*).
- Plástica: **Camilo Egas**, y después Guayasamín y Kingman. **Luis Wallpper** (sic en el
  libro) pintó una representación de *Huasipungo*.
- Vida cotidiana: el pasillo, Nicasio Safadi, Carlota Jaramillo, el dúo Benítez y Valencia;
  Ernesto Albán ("Don Evaristo"); el trompo, las muñecas de trapo, la cometa, las pallas,
  la perinola, la rayuela, la soga.

## 6.2 Rondas aprobadas (una a una, con la autora)

Las tres manos son **nuevas**: el Tema 1 del mismo libro ya gastó *ordenar arrastrando*,
*repartir en destinos* y *destapar pistas*.

| Ronda | Mano | Contenido | ⭐ |
|---|---|---|:--:|
| R1 `L7T2R1Curva` "El quintal se desploma" | **deformar una curva** arrastrando su nudo | la crisis cacaotera | 3 |
| R2 `L7T2R2Imprenta` "La imprenta sin respaldo" | **pulsar y frenar** a tiempo | la emisión sin respaldo y el Banco Central | 3 |
| R3 `L7T2R3Hilos` "La peña del Grupo de Guayaquil" | **tender un hilo** de punto a punto | las obras de los años treinta | 3 |

**⭐ del tema: 3 + 3 + 3 = 9.**

### Lo que se propuso y se descartó

- **R2 "El reloj de Carondelet"** (girar la manecilla hasta los días / meses / años que
  duró cada gobernante). A la autora le gustó **el tema** y no la mecánica.
- **R2 "La cinta de los años"** (estirar una cinta sobre la línea de tiempo) y **R2 "El
  dominó de Carondelet"** (empujar la ficha que lo tumbó). El dominó se le explicó y se
  descartó con argumento: **es una pregunta de opción múltiple con un disfraz** — hay
  cuatro fichas y se elige una; quitar los dominós y poner cuatro botones daría el mismo
  juego. La caída es una animación posterior a la decisión, no parte de ella.
- **R3 "El mural de los años 30"** (frotar para descubrir). Era mi recomendación, pero
  frotar se parece a *destapar pistas* del Tema 1 y la autora eligió los hilos.

### R1 · "El quintal se desploma"

Sale un hecho con su año y se arrastra el nudo de ese año arriba o abajo; la línea se
deforma pegada al dedo. **La respuesta es CUÁNTO, no CUÁL**: no hay opciones que elegir.
Acierto = quedar a **12 niveles o menos** del valor real. Al verificar, la curva correcta
aparece en **dorado punteado sobre la tuya**.

⚠ **Soltar siempre coloca, aunque no se haya movido**: "se quedó igual" es una respuesta
válida y el chico tiene que poder darla.

### R2 · "La imprenta sin respaldo"

Cada toque en IMPRIMIR emite más billetes: la barra sube y **el precio del pan sube con
ella**. Hay que llegar a lo que el país necesita **sin pasar del oro que lo respalda**.
Tres años por partida; ⭐ +1 por año dentro de la franja.

⚠ **SIN CIFRAS.** Las marcas de la barra no llevan números ni dicen millones de nada: el
libro **no da montos de emisión** y ponerlos sería inventar datos. Lo histórico es la
tarjeta de cada año; la barra es el artefacto del juego. Así la ronda **se resuelve con lo
que se ve**, que es la otra regla.

⚠ **La franja correcta se ve desde el principio, a propósito**: el ejercicio es frenar a
tiempo, no adivinar dónde está. Pasarse tiene consecuencia visible.

### R3 · "La peña del Grupo de Guayaquil"

Se arrastra desde el punto del autor hasta la obra y el hilo sigue al dedo; también vale
tocar autor y luego obra. Un hilo nuevo desde el mismo autor **reemplaza** al anterior, y
**dos autores no pueden colgar de la misma obra** (el viejo se suelta solo).

⚠ **Ninguna cara de autor se dibuja**: son personas reales. Lo ilustrado es **la obra**;
el autor va con su nombre y un icono.

⚠ **La obra nunca queda enfrente de su autor**: regalaría la respuesta por posición.

## 6.3 Anti-repetición

| Ronda | Banco | Entran | Clave FIFO | Cap |
|---|---|:--:|---|:--:|
| R1 · curva | 3 | 1 | `…_l7t2_r1c_v1` | **2** = banco − 1 |
| R1 · hechos de esa curva | 6 por curva | 3 | `…_l7t2_r1h_<curva>_v1` | **4** (nunca 3 = K) |
| R2 · años | 8 | 3 | `…_l7t2_r2_v1` | **5** |
| R3 · obras | 8 | 3 | `…_l7t2_r3_v1` | **5** |

**La pregunta de la autora, respondida en el diseño.** Antes de construir nada preguntó
*"¿pero cómo garantizamos variedad en la ronda 1?"*, y tenía razón en sospechar: con una
sola curva, la del cacao, **todos los hechos empujan hacia abajo** y el chico aprende
"arrastra abajo y acierto". Tres respuestas, y las tres están en el código:

1. **Tres curvas**, no solo la del cacao: el quintal de cacao, el sombrero de paja de la
   Sierra Sur y lo que alcanza el sueldo del trabajador.
2. Dentro de cada curva, el banco trae **hechos que suben y hechos que bajan** (el auge
   agroexportador, el crecimiento del sombrero en los veinte y en los cuarenta, el Banco
   Central, el Código del Trabajo).
3. Entran **3 de 6** hechos por partida ⇒ 20 combinaciones por curva, **60 ejercicios**.

## 6.4 Imágenes

**8 archivos `assets/j7t2-*.jpg`, todos 1:1** (prompts entregados el 2026-11-24, los genera
la autora), uno por obra: `huasipungo`, `nuestro-pan`, `cruces-agua`, `hoguera`,
`sangurimas`, `mitas`, `indio`, `plata-bronce`. Estilo común: mural indigenista de los
años treinta, figuras de lejos o de espaldas, sin texto.

Opcional: `j7t2-billete.jpg` en **16:9**, textura de billete antiguo para el fondo de la
R2 (todavía sin montar).

**El tema se juega igual sin ellas**: `J12Img` cae a un emoji.

## 6.5 Verificado (2026-11-24)

- `e2e-l7t2.js` — partida perfecta **3/3 · 9 ⭐** (3 + 3 + 3) y fallada **0/3 · 0 ⭐**, con
  revelado en las tres rondas, el BORRAR de la R1 y 6 recargas sin repetir. 0 errores de
  consola.
- `espacios-l7t2.js` — lienzo entero, 5 viewports, en reposo, **en pleno arrastre**, con la
  barra a tope, con los hilos cruzados y con el revelado puesto: nada superpuesto.
- `arrastre-l7t2.js` — el nudo se queda donde lo sueltas agarrándolo por arriba, por el
  centro y por abajo; el hilo se tiende, se cambia, no admite dos autores en una obra, no
  engancha si sueltas fuera, y el respaldo por toque sigue vivo.
- `variedad-l7t2.js [partidas]` — **12 partidas: la curva 3/3 · curva + 3 años 12/12 distintos · R2 12/12 · R3 11/12, y 0 repeticiones en partidas seguidas en las cuatro medidas.**
