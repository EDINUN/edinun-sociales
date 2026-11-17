# MEMORY.md — juego-14 "Las culturas posclásicas de Mesoamérica"

Bitácora del juego. Lo que se decidió y por qué.

## 2026-11-16 — Creación del juego

**Origen.** La autora pidió un juego para **12 años** sobre el tema que se localizó
buscando en los PDFs de `BLINK SOCIALES`: aparece en **un solo libro**, el de
**8.º**, Unidad 6 "Un legado ancestral que persiste", **Tema 3** (libro págs.
134-136, cuaderno págs. 90-92, D.C.D. CS.4.1.18).

**Título.** Lo fijó la autora: **"Las culturas posclásicas de Mesoamérica"**, el
mismo del libro. Es largo para la tarjeta del landing — si estira la fila, el
título completo se queda en el `catLabel` y la tarjeta lleva uno corto
(regla de `titulo-tema-no-es-rotulo-boton`).

**Guía: Yaku** por el ciclo del ordinal (14 mod 4 = 2), no por temática.

### Las tres rondas: cómo se eligieron

Se propusieron **dos tandas** de bocetos ASCII en el chat. La primera, más
sencilla; la segunda, revisada con más tensión porque la autora avisó: *"no es
para niño, es para un chico de 12 años, ellos se aburren pronto"*.

**La autora se quedó con las TRES de la PRIMERA tanda** (estela maya · dial de los
siglos · códice con palabras marcadas), así que no se eligió una: **se repartieron
como las tres rondas**, igual que en juego-10 Tema 3.

> ⚠️ **Queda pendiente su visto bueno**: las versiones revisadas (destapar solo 3
> de 5 pruebas con la respuesta "no se sabe" · la selva tragándose las ciudades al
> cruzar el año 900 · las 4 mentiras **sin marcar**) están descritas en el chat y
> son un plan B si al probarlo le resulta fácil.

### Decisiones de diseño

- **El dial no regala la respuesta.** La primera idea era encender cada ciudad
  según el año: eso convierte la ronda en "mueve y lee el resultado". Se cambió a
  que el dial ilumine la **región** viva (selvas del sur antes del 900, Yucatán
  después) y el mapa muestre **dónde** está cada ciudad. El estudiante tiene que
  cruzar las dos cosas.
- **Orden de las rondas = orden del libro** (mayas → su ciencia → aztecas), que
  además va de menor a mayor exigencia.
- **⭐ por pieza, no por ronda** (4+2+4 = 10): una ronda parcial suma lo acertado.
  Verificado en el e2e (3 aciertos de 4 → +3 ⭐, nunca resta).
- **El caracol es exclusivo** en la estela: ocupa el nivel él solo, y ningún nivel
  pasa de 19 (el constructor lo bloquea). Así no se puede escribir un número que
  los mayas no escribirían.
- **Glifos geométricos, no emojis figurativos.** A 12 años las florecitas y los
  copos de nieve de la plantilla se leen como infantiles.

### Errores propios cazados durante la construcción

1. **El bundle abortó** porque escribí el cierre literal de `script` **en un
   comentario** de cabecera ("Ningún `</script>` literal en este archivo"). La
   invariante aplica también a los comentarios. Reescrito en prosa.
2. **El e2e contaba 6 filas en el reporte** en vez de 3: el selector `table tbody
   tr` cazaba también la tabla del `PrintableReport`, que vive en el DOM aunque
   solo se vea al imprimir. Acotado a `.ed-card table tbody tr`.
3. **Selectores frágiles por estilo inline.** El primer e2e buscaba por
   `span[style*="border-radius: 6px"]` y por el texto del nivel, y fallaba. Se
   añadieron anclas estables al DOM: `data-hueco`, `data-op`, `data-nivel`,
   `data-lectura`, `data-fuente`, `data-chip`.

## 2026-11-16 (tarde) — Llegan las imágenes y aparecen 4 fallos

La autora entregó las tres imágenes **en `.jpg`, no `.png`** (se actualizaron las
rutas). Ninguna encajaba con las medidas supuestas, y montarlas destapó fallos que
ni el lint ni el QA de overflow podían ver:

| # | Qué pasaba | Arreglo |
|:-:|---|---|
| 1 | **El mapa tiene otro encuadre** del que supuse: Yucatán arriba-centro y la selva del sur abajo-derecha. Las 12 ciudades caían en el mar. | Recalibradas las 12 coordenadas sobre el archivo real (1376×768) y el contenedor pasó a **404×225**, que conserva el ratio 1.792 → entra entera, sin recorte. |
| 2 | **El resplandor de la región viva no se veía.** Iluminar en azul sobre un mapa de tonos medios no contrasta. | Se invirtió: ahora se **oscurece todo el resto** del mapa (radial-gradient a `rgba(2,8,18,0.66)`) y la región activa queda limpia. Se lee de golpe. |
| 3 | **La estela es mucho más alta** (ratio 0.558, no 0.8). El contenedor cuadrado la recortaba. | Nuevo layout de la R2: estela angosta a la izquierda (178×319) y la bandeja de símbolos en columna a la derecha, ambas simétricas respecto a x=450. |
| 4 | **El papel amate viene sobre un fondo gris.** | La imagen se amplía y se desplaza (454×339 en −18,−69) para que solo se vea la hoja. |

### Dos fallos de fondo que las capturas delataron

5. **La palabra "manchada" a veces ya era la correcta.** El banco guardaba
   `{op:[a,b], ok}` y se mostraba siempre `op[0]`: en la crónica 4 el hueco 2
   mostraba **900**, que es la respuesta buena. La consigna "estas cuatro están
   mal" era falsa. Ahora cada hueco es `{ mal, bien }`: se muestra **siempre**
   `mal`, y el **orden de las dos opciones del selector se baraja por partida**
   para que no se pueda acertar tocando siempre el mismo lado.

6. 🐛 **El respaldo tap no funcionaba con Copán.** `tocarZona` guardaba con
   `if (revealed || !sel) return;` y **Copán es el índice 0** del banco: `!0` es
   `true`, así que la función salía sin hacer nada. Solo fallaba con esa ciudad y
   solo por tap (el arrastre no usa `sel`), por eso el e2e no lo cazaba: alternaba
   y el **primer** gesto era siempre un arrastre.
   > **Regla:** con índices de banco, comparar **`=== null`**, nunca `!x`. El
   > ítem 0 existe. Y el e2e debe cubrir el **tap como primer gesto**, no solo
   > como gesto intermedio — ahora la partida fallada usa **tap puro**.

## 2026-11-16 (noche) — La autora prueba el juego y la R1 se rehace entera

La autora entró, jugó, y **no entendió qué había que hacer en la R1**. Primero
intenté arreglarlo con copy; insistió; luego propuse tres mecánicas nuevas y las
rechazó en bloque. El diagnóstico correcto llegó al tercer intento:

> **La ronda pedía un dato que no se podía averiguar mirando la pantalla.** Si no
> te sabías de memoria que Tulum es posclásica, no había de dónde sacarlo. El
> dial y el mapa parecían la pista, pero no contenían la regla.

**La corrección (aprobada):** la regla del libro (pág. 134 — los clásicos
vivieron en las selvas del sur y en el 900 emigraron a Yucatán) se **rotula
sobre el mapa**, con el nombre de cada región y sus fechas. **El dial se
eliminó.** Ahora la respuesta se lee en pantalla y al jugarla se aprende la regla.
Enunciado: *"Arrastra cada ciudad a la época en que floreció."* · bocadillo:
*"Mira en qué región está en el mapa."*

> **Regla que deja:** antes de dar una ronda por buena, preguntarse **"¿con qué
> hay en pantalla, se puede resolver?"**. Si la respuesta exige conocimiento
> previo que el juego no muestra, no es una ronda difícil: está rota. Ni el lint
> ni el QA de overflow detectan esto — solo jugarla.

### Cinco fallos más que salieron al jugarla de verdad

7. **No se podía corregir nada.** Una ciudad mal colocada no salía de la caja y
   los símbolos mal puestos no se quitaban: la ronda era una trampa. Ahora
   **tocar una ciudad colocada la devuelve** a la bandeja y la estela tiene un
   botón **BORRAR** (patrón 1 de `mechanics-design.md`, rótulo permitido).
8. **Choque entre "tocar la caja para soltar" y "tocar la ficha para sacarla".**
   Si había una ficha en el centro de la caja, el toque la sacaba en vez de
   soltar la que traías. Ahora **con una ciudad elegida la ficha no intercepta**:
   el toque cae en la caja.
9. **Los puntos se salían de la estela.** 13 puntos en una sola fila se
   desbordaban. Ahora **se reparten en varias filas** y encogen a partir de 7
   (verificado con 13 y con 19, el máximo posible).
10. **¡VERIFICAR! parecía habilitarse solo al acertar.** Exigía los dos registros
    llenos y no explicaba por qué estaba apagado. Ahora **basta con haber escrito
    algo**; un registro vacío cuenta como fallo y se revela (nunca como acierto,
    aunque el valor esperado sea 0).
11. **La respuesta correcta casi no se veía.** Se revelaba en verde translúcido
    con borde punteado, al lado de un rojo sólido: lo que hay que aprender era lo
    menos visible. Ahora la correcta es **verde sólido con halo**, en las tres
    rondas.

También se **bajó la estela** (estaba pegada al enunciado) y se **repartieron las
12 ciudades en filas** dentro de su región, para que ningún punto caiga en la
costura entre las dos zonas ni se pisen los rótulos salga el sorteo que salga.

## 2026-11-16 (tanda final) — La autora juega entero y pule ronda por ronda

### R1 — el mapa

12. **La barra de los años vuelve.** La había quitado al rehacer la ronda; la
    autora la echó de menos (*"me gustaba más cuando estaba la barra que
    aclaraba por sectores"*). Ahora **conviven**: los rótulos de región hacen la
    ronda resoluble y la barra la hace viva.
13. **Las fichas ya colocadas se arrastran** de una caja a otra, y soltándolas
    fuera vuelven a la bandeja.
14. 🐛 **El estado del arrastre pasó a un `ref`.** En el primer gesto el
    `pointerup` corría con el closure del render anterior, donde `drag` todavía
    era `null`, y el gesto se perdía.
15. **Las ciudades estaban mal otra vez.** Yo había dicho que las verifiqué,
    pero solo comprobé *tierra* y *dentro del recuadro* — no que se distinguiera
    qué rótulo era de qué punto. Arreglos: el rótulo va **al lado** del punto (el
    de más a la izquierda hacia la izquierda, el otro hacia la derecha), y el
    comprobador ahora valida **las 15 parejas de cada región**.
    > **Regla:** una verificación que no cubre lo que se ve no sirve para decir
    > "está revisado". Si afirmo que algo está comprobado, el check tiene que
    > cubrir exactamente eso.
16. **Mapa ampliado y recortado** (idea de la autora): se muestra solo la
    ventana con las 12 ciudades (x 350-1180, y 136-591 del archivo) escalada a
    420×230 → **las ciudades se ven al doble** y dejan de amontonarse. La fuente
    de verdad son `xf`/`yf` sobre la imagen completa; el recorte se aplica con
    `CROP`.
17. **Recuadros ceñidos** a las ciudades (el celeste sobraba por todos lados) y
    rótulos de región pegados a su recuadro.

### R2 — la estela

18. **BORRAR quita el último símbolo**, uno a uno (antes vaciaba el nivel). Los
    símbolos se guardan como **lista en orden de colocación**.
19. **VEINTES y UNIDADES parecen botones** (pastilla que se ilumina). No había
    forma de saber que se podía tocar ahí.
20. **Fuera la palabra "registro"** de toda la pantalla: no se entendía.
21. **¡VERIFICAR! se habilita con haber escrito algo.** Un nivel vacío cuenta
    como fallo, nunca como acierto.
22. **La respuesta correcta salió de la estela.** Metida entre los dos niveles
    no se leía; ahora la columna derecha se convierte en un panel verde grande,
    **LA RESPUESTA ERA**, con los dos niveles dibujados y la cuenta.

### R3 — la crónica

23. **Ni "manchadas" ni "equivocadas", ni rojo.** Decirle que las cuatro están
    mal es falso y pintarlas de rojo le adelanta el juicio. Ahora: *"Revisa las
    cuatro palabras resaltadas"*, en **ámbar** (resaltador); azul al revisarlas;
    verde y rojo **solo** al verificar.
24. **Dejar una palabra como está es responder.** Antes había que tocar las
    cuatro aunque no hubiera que cambiarlas. Ahora **una o dos de las cuatro
    vienen ya correctas** (al azar), todas arrancan con una opción puesta y
    ¡VERIFICAR! está activo desde el principio.
25. 🐛 **`resetRondas` usaba una variable inexistente** tras ese cambio y rompía
    el paso de ronda. Lo cazó el e2e, no la vista.
26. **Fuera la línea "Fuente: …"** (la había puesto yo sin que la pidieran) y el
    papel pasó de 198 a 278 px de alto, con el bloque centrado.

### Y una lección de herramienta

27. **Una imagen ampliada va como fondo CSS, no como `<img>`.** Un `<img>` más
    grande que su marco sobresale de la caja aunque se vea recortado, y
    `qa-visual.js` lo cuenta como que la mecánica invade la columna de botones
    (daba −29 px). Con `background-image` + `background-size/position` el
    colchón volvió a 72 px.

### Y el detector de superposiciones

28. 🐛 **"Mayapán" se montaba sobre "PENÍNSULA DE YUCATÁN".** Mi comprobador
    miraba que los rótulos de ciudad no se pisaran **entre sí**, pero no contra
    los rótulos de región. Segunda vez que una verificación parcial me hace
    decir "ya está revisado" sin estarlo.
    > **Arreglo de raíz:** `.planning/sin-superposiciones.js` recorre el **DOM
    > real** de las tres rondas en **12 partidas** y compara todas las parejas
    > de texto visible. Ignora los glifos decorativos del fondo y el texto que
    > fluye en párrafo justificado (ahí el navegador ya lo coloca sin pisarse).
    > Es el único check que puede afirmar "no hay nada superpuesto".
29. Los nombres de región van **en dos líneas** para que el rótulo sea estrecho,
    y el enunciado bajó a `top: 86` para quedar **centrado** entre RONDA y el
    contenido. Las tres rondas arrancan a la misma altura (**134**).
30. **La lectura en vivo de la estela ya no se pinta de verde** al coincidir con
    el número pedido: era decirle la respuesta antes de ¡VERIFICAR!
31. **Sacar una ficha de una caja la deja "en la mano"** (resaltada), lista para
    soltarla tocando la otra: mover de una época a otra son dos toques.

### Pendientes

- **Confirmar las crónicas 2-4** de la R3: no son textuales del cuaderno (solo
  intercambian términos que sí están en el libro). Si prefiere únicamente la del
  cuaderno, R3 se queda con una sola variante y habrá que darle variedad de otra
  forma.
- QA de contenido con la autora y prueba en un dispositivo real.
- Las versiones "difíciles" de las tres rondas (plan B) siguen descritas arriba
  por si al probarlo le resulta fácil para 12 años.

### Verificación hecha

- `format-lint.js` → **15/15 OK**.
- `qa-visual.js` → **6 viewports sin overflow**, colchón mecánica↔acciones **72 px**.
- `.planning/e2e.js` → **todo en verde**: partida perfecta 10 ⭐ · partida fallada
  con revelado en las 3 rondas · ronda parcial que suma sin restar · arrastre real
  de mouse y respaldo tap alternados · 6 recargas sin repetir · consola limpia.
