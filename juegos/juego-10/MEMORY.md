# MEMORY.md — Bitácora de juego-10 "Ecuador megadiverso"

## 2026-08-12 — Creación desde `_PLANTILLA` · Tema 1 completo

- Clonado de `juegos/_PLANTILLA/`. Slug `juego-10` (hueco libre; los saltos de
  numeración son intencionales de la autora). Guía **Yaku** por el ciclo del elenco
  (10 mod 4 = 2), no por temática.
- La autora pidió **3 temas → 3 botones**, con **edades distintas por tema**. Solo
  entregó el material del **Tema 1**; los otros dos quedan en "Próximamente".
- **Tema 1 = "Recursos naturales y los derechos de la Tierra"** (Tema 2 del libro),
  **8 años**. Material: pp. 78-79 (megadiversidad y flora/fauna de las 4 regiones) y
  cuaderno pp. 69-72 (zonas del territorio, cóndor, cuadro resumen).
- **Mecánicas aprobadas por la autora ronda por ronda**, con bocetos ASCII en el chat:
  se le ofrecieron 3 opciones por ronda.
  - R1 → eligió **"Mapa vivo"** (arrastrar la especie a su región).
  - R2/R3 → dijo *"me gusta A y C"* sobre las opciones de la R2, así que **"El ascensor
    del Ecuador"** quedó de R2 y **"Ficha del descubrimiento"** de R3.
  - Descartadas: "Foto-safari" (prima de la lluvia de juego-13) y "Guardaparques"
    (el libro trae 7 amenazas y solo ~4 acciones que cuidan → banco desbalanceado).
- **9 ⭐ máximo** (4 + 2 + 3), +1 por elemento resuelto bien.
- Ella pidió **"construye el juego"** sin esperar la aprobación del design-doc; el doc se
  escribió igual (`.planning/juego-10-design.md`) y queda para revisión posterior.

### Decisiones de contenido

- **26 especies excluidas del banco de la R1 por ambigüedad**: el cuadro de la p. 72
  repite muchas en dos regiones (cedro, laurel, caoba, palo santo, monos, loros,
  curiquingues, atún…) y tendrían dos respuestas correctas. Misma regla que los montes
  Urales en juego-13. Quedan 57 ítems limpios.
- Fuera también **naranja/mandarina junto a naranjilla** y **plátano junto a banano**: a
  los 8 años no se distinguen entre sí.
- **La R2 no lleva contador "1 de 2".** Va sin marcador: el estándar no define uno e
  inventarlos ya costó una corrección en juego-4.
- **Los colores de las 4 regiones no salen del libro** (su cuadro no fija paleta): se
  usan los 4 del ecosistema EDINUN, los mismos de juego-13.
- ⏳ **Pendiente de visto bueno:** el criterio de distractores de la R3. El dato correcto
  siempre es del libro; el distractor sale del libro cuando hay alternativa real y, cuando
  no, es una negación evidente (marcada `// negación` en el `.jsx`). Nunca una cifra
  inventada.

### Bugs cazados durante la construcción

- **El guía salía Domi en vez de Yaku.** `app.character || "yaku"` no funciona: `app.jsx`
  (shell, no se toca) inicializa `character: "domi"`, que es truthy. Se usó la forma de
  juego-8: `app.character && app.character !== "domi" ? app.character : "yaku"`.
  **juego-1 arrastra todavía esa misma forma rota** con Yaku — revisar si se retoma.
- **`el.click()` no sirve para probar el arrastre**: solo dispara `click`, sin pointer
  events, y la mecánica vive en `onPointerDown/Up`. El e2e usa `page.mouse` real.
- **`qa-visual.js` no mide el panel del mapa**: solo escanea `button`, `img` y elementos
  `position:absolute`, y el panel es un hijo de flex. Su "gap 140" es el de las fichas de
  la bandeja; el colchón real del panel (54 px) hubo que medirlo aparte.

### Verificación (2026-08-12)

`format-lint` 19/19 · `qa-visual` sin overflow en los 6 viewports · e2e propio: partida
perfecta 3/3 · 9 ⭐ · 100 % (arrastre real), partida fallada con revelado en las 3 rondas
(respaldo tap), ronda parcial que **suma sin restar** y "¡UPS!" sin estrellas, 6 recargas
con 0 repeticiones consecutivas, 0 errores de consola.

## 2026-08-13 — Revisión visual de la autora (5 correcciones)

Todas reportadas mirando el juego corriendo, después de la primera entrega:

1. **"Los cuadritos de las regiones están muy alargados"** → zonas de `minHeight: 176` a
   **126**. Lo que las estiraba era la miniatura de la ficha: apilaba emoji sobre nombre y
   gastaba una línea entera. Ahora el emoji va **al lado** del nombre.
2. **"Los cuadros de las especies muy anchos"** → fichas de la bandeja de **138×70** a
   **104×62**.
3. Efecto colateral del punto 1: con las fichas ya juntas, el **✓/✗ colgando** (`top:-8`) y
   la **pastilla de la región** (`bottom:-9`) se **montaban sobre la ficha vecina**. Los dos
   pasaron a ir **dentro del flujo** de la ficha.
4. **"¿Por qué hay algo al lado que dice Zona Antártida? Está súper feo"** + **"las opciones
   casi no se notan, es como que estuvieran muy brillantes"** → la R2 pasó a **una sola
   columna de 6 franjas** con relleno **crema opaco**. Eran blanco translúcido al 14 % sobre
   el fondo verde: sin opacidad no hay contraste con el lienzo.
5. **"¿A qué mapa se refiere?"** (el bocadillo decía *"Arrastra la ficha sobre el mapa"*) →
   **"Arrastra la ficha hasta su región."**. El panel son 4 zonas de color, no una silueta
   reconocible del Ecuador: el CÓMO no puede nombrar algo que el niño no ve.
   ⏳ Queda abierto si se dibuja la **silueta real del Ecuador**; ahí sí volvería "mapa".

6. **"Las zonas deben ir creciendo hacia arriba cada que muevo una ficha"** → el mapa quedó
   **anclado abajo**, la fila con `alignItems: flex-end` y el alto de cada zona **calculado**
   como `118 + 26 × nº de fichas` (no un `minHeight` fijo: con un fijo el cajón solo habría
   crecido al meter la 4ª). Cada ficha sube su zona 26 px con el borde inferior clavado en
   y=522; el panel va 138 → 164 → 190 → 216 → 242. La bandeja se centra en el hueco de
   arriba.
   ⚠ **Cuatro intentos hasta acertar, uno por reporte de la autora:**
   1. `minHeight: 126` fijo → no crecía nunca.
   2. Base **62** + 26 por ficha → crecía, pero el cajón vacío quedaba como una tira pegada
      al rótulo (*"los cuadritos deben ser más grandes… eso está maaaal"*).
   3. Base **118** pero con el alto **por zona** (cada cajón contando SUS fichas) → los
      cuatro quedaban de alturas distintas (*"no debe crecer solo uno, deberían crecer
      todos, mira lo feo que están"*).
   4. ✅ Alto **compartido** por las 4 zonas = `118 + paso × maxEnZona`. Crecen parejas.
   **Las tres condiciones van juntas: base grande + crecer + crecer todas iguales.**
   ⚠ Y las fichas **dentro** del cajón se veían diminutas — reportado **tres veces** (*"se
   ven muy pequeñas"*, *"cuando coloco en las regiones se hace demasiado pequeño"*, *"con el
   fin de que las letras se vean más grandes"*). Empezaron en emoji 11 / texto 7,5 / alto 22.
   ⚠ En el camino probé ponerlas **en fila** (emoji al lado del nombre) para ahorrar alto, y
   la autora lo cortó: *"¿por qué cuando lo arrastran a su región no dejas que se arrastre
   así como está, es decir arriba el emoji y abajo la descripción?"*. **Tenía razón por
   partida doble:** en fila, el nombre se quedaba con ~60 px y las palabras largas se
   partían ("Murciélag/os", "Chuquiragu/a"), lo que me había obligado a bajar esos nombres a
   9 px. **Apiladas, el nombre usa el ancho completo (~82 px)** y entra a cuerpo **11** —un
   punto más grande que en la bandeja— sin partirse ni excepciones por nombre.
   **Final:** emoji **16**, nombre **11**, alto **58**, base del cajón **84**, paso **62**
   igual antes y después de verificar (el ✓/✗ y la pastilla van absolutos sobre la franja
   que el `paddingBottom` reserva siempre, así nada salta al verificar).
   ⚠ También hizo falta: panel a **468 px** con los 4 cajones al **mismo ancho** (~104),
   canal de mar a 10, y `overflowWrap: anywhere` de red de seguridad.
   **Lección:** el tamaño de la ficha, el ancho del cajón y el largo de los nombres son un
   mismo problema — al tocar uno hay que recorrer **todo el banco** midiendo, no mirar dos
   capturas. Para eso quedó el script `anchos-j10.js` (las 54 especies, una por una).
   **Y la forma que pedía la autora resultó ser también la solución técnica**: conviene
   probar su propuesta antes de optimizar por mi cuenta.
   ⚠ El ✓/✗ y la pastilla de la región van en **su propia línea** dentro de la ficha: en la
   fila del nombre le robaban ancho y lo cortaban ("Naranjil…", "Anguila").
   ⚠ Margen al soltar **asimétrico** (`padY 22` / `padX 8`): vertical generoso para que un
   niño de 8 atine, horizontal corto porque las zonas están a 7 px y un margen ancho suelta
   la ficha en la vecina.
7. **"¿Qué es ese bocadillo, qué feo eso que dice hueco ahí?"** — el CÓMO de la R3 decía
   *"Toca la opción correcta en cada hueco"*. **"Hueco" es jerga de diseño** (el slot vacío
   de un formulario), no palabra de un niño de 8 años. Quedó **"Toca las tres / respuestas /
   correctas."**, en 3 renglones cortos: de paso el globo pasó de 182 px de ancho a 110 y su
   holgura contra la ficha subió de **20 px a 56**.

8. **"¿Por qué Gallinazos está con un corazón negro? ¿En qué se relaciona?"** — lo había
   puesto como "pájaro negro" y quedó en 🖤, que no relaciona nada. Al revisar los 57
   emojis uno por uno aparecieron **nueve más igual de malos**: 🐜 oso hormiguero (¡esa es
   su presa!) · 🌶️ achiote (parece ají) · 🐍 anguilas (parece culebra) · 🕊️ fragatas y
   albatros (paloma blanca) · 🐤 piqueros (pollito) · 🪶 águilas arpías (una pluma suelta) ·
   🎋 caña de azúcar (bambú de Tanabata) · 🪵 caucho (un tronco cortado).
   **Regla nueva:** si existe el emoji de la especie se usa; si no, va el de su **grupo**
   (🐦 ave · 🦅 rapaz · 🦜 lorífero · 🐟 pez · 🐾 mamífero · 🌳 árbol · 🌿 planta · 🌸 flor ·
   🥔 tubérculo · 🌾 cereal); **nunca un parecido que nombre otra cosa**.
   **Papaya, taxos y pepino de mar salieron del banco**: 🍈 es un melón y 🥒 la verdura, y no
   había alternativa que no mintiera. Banco **57 → 54** (Costa 12 · Sierra 14 · Amazonía 15
   · Galápagos 13).

9. **"Los cuadros de las zonas territoriales están muy anchos"** → las franjas de la R2 de
   **380 → 300 px**. La tarjeta de la definición se queda en 446: es el enunciado, no una
   opción tocable.
   Al hacerlo, su bocadillo (*"Toca la franja en el dibujo"*) quedó desfasado —ya no hay
   corte ni "dibujo", son seis opciones en lista— y pasó a **"Toca la que creas /
   correcta."**. Tercer bocadillo corregido por lo mismo.

**Regla que dejan los puntos 5, 7, 8 y 9:** lo que el niño lee o ve **no puede contradecir
lo que hay en pantalla**. Ni un bocadillo que nombre "el mapa" (que no está dibujado), "el
hueco" (jerga nuestra) o "el dibujo" (que ya no existe), ni un emoji que diga otra especie.
**Al cambiar una mecánica hay que releer su bocadillo.**

**Variedad medida (20 recargas seguidas):** 20 combinaciones distintas de 20, **0
repeticiones**, **0 especies repetidas respecto de la recarga anterior** y 47 de las 54
especies vistas. Reparto por región de las 80 fichas: Costa 20 · Sierra 18 · Amazonía 26 ·
Galápagos 16.

### Y una corrección de reglas, no de estética

**"¿Por qué me salen dos preguntas? ¿No se supone que debe ser solo 1?"** — tenía razón.
La R2 encadenaba **2 definiciones** y eso rompe la regla dura del repo: **una ronda = UNA
jugada** (errores aprendidos de la skill, nacida del error de juego-4). Yo había dejado esa
duda planteada, ella no la contestó y decidí ponerlas igual apoyándome en juego-13 T3R1 —
mal: la regla manda sobre el precedente.

Ahora es **una sola definición** y, como se resuelve con un toque, vale **+3 ⭐** de golpe
(criterio de la calculadora de juego-13 T2R2). **Máximo del tema: 9 ⭐ → 10 ⭐** (4 + 3 + 3).
Anti-repetición de la R2: de "2 de 6, cap 3" a **"1 de 6, cap 5"** (para 1 ítem, cap = N−1).

**Reverificado:** format-lint 19/19 · qa-visual sin overflow · e2e 3/3 · 10 ⭐ · 100 %,
partida fallada con revelado, ronda parcial que suma sin restar, 6 recargas sin repes
(6 zonas distintas en la R2 gracias al cap 5) · auditoría de espacios en 3 rondas ×
5 viewports sin un solo solape ni texto recortado.

### Pendientes

1. **Título definitivo** (el actual, "Ecuador megadiverso", es provisional del asistente).
2. **Material de los temas 2 y 3** + su edad. Sus verbos no pueden repetir
   arrastrar-al-mapa · tocar-franja · elegir-en-huecos.
3. Probar el **contador real con PHP** (`php -S localhost:8000`) y **borrar `visits.txt`**
   antes de subir.
