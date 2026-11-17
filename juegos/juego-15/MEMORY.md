# MEMORY.md — Bitácora del juego-15 "Rumbo a la independencia"

## 2026-11-16 — Creación desde `juego-8`

- Clonado de `juegos/juego-8/` (misma estructura: 1 tema, `SOC_ROUNDS` con 3 rondas
  distintas) en vez de la `_PLANTILLA`, para heredar sus arreglos.
- **Tema del libro:** "El proceso de independencia en Sudamérica" (Tema 3, CS.4.1.36).
  **Edad 13.** Guía **Sisa** (ciclo del ordinal: 15 mod 4 = 3).
- **Mecánicas aprobadas ronda por ronda** con bocetos ASCII en el chat, sin construir
  nada hasta el OK de cada una. Criterio explícito de la autora: *"que no sea aburrido"*
  → tres **verbos distintos** y ninguno de clasificar:
  **R1 explorar un mapa · R2 deducir con pistas · R3 manipular una cronología.**
- **R1 "La ruta libertadora"**: mapa SVG estilizado de 10 territorios. Cambio respecto
  al boceto: una ronda = una jugada, así que en vez de la "ruta que se va uniendo" se
  dibuja la **flecha de avance** de esa campaña al acertar. Avisado a la autora.
- **R2 "El despacho sin firma"**: patrón nuevo (deducción con pistas destapables). Se
  puede acertar sin destapar ninguna. **Sin rostros generados**: las escenas son de
  época con figuras lejanas/de espalda; si la autora pasa los retratos del libro, se
  sustituyen. Fallback a sello ⚜ + nombre si falta el PNG.
- **R3 "La cinta de la independencia"**: 5 casillas de año y 4 piezas (sobra una casilla
  → no se resuelve por descarte). Arrastre con **aterrizaje** (`element.animate()`
  190 ms), cancelación del gesto anterior y **respaldo por tap**.
- **Anti-repetición**: R1 y R2 pick 1 de 10 con cap 9; R3 pick 1 grupo de 3 con cap 2
  (nunca cap = K para subconjuntos).
- **Imágenes**: las entregó la autora en **.jpg** (no .png) — se ajustaron las rutas.
  8 escenas 4:3 + 2 fondos 16:9. Se cablearon también los dos fondos: pergamino
  detrás del parte (R2) y mapa sepia muy tenue detrás de la cinta (R3).
  **Yegros y Rodríguez de Francia tienen escena propia** (antes compartían archivo
  y podían salir como dos tarjetas idénticas en la misma ronda).
- **Peso**: llegaban a 1200×896 y ~900 KB cada una (9,8 MB en total) para verse a
  100×66 px. Reescaladas a 400 px (fondos a 900) con calidad 0.84: **la carpeta del
  juego bajó de 11 MB a 2,1 MB** y en pantalla se ven igual. Los originales quedaron
  fuera del repo, en el scratchpad de la sesión.

## 2026-11-16 (2ª pasada) — Repaso con las reglas nuevas

Tras terminar el juego llegaron tres reglas de la autora (nacidas en juego-14) y se
revisó juego-15 contra ellas:

- **Resoluble con lo que se ve** → **R1 cambió**: el mapa va **rotulado siempre**.
  Antes era un mapa mudo: quien no reconociera la silueta de Colombia o Chile no
  tenía de dónde sacar la respuesta, y esa dificultad (geografía muda) no es la
  lección. Ahora la clave es el hecho histórico, que sí está en el cartel. Se
  comprobó que ningún cartel nombra el país actual (si no, lo regalaría).
  R2 (las 3 pistas resuelven siempre) y R3 (los años están en pantalla) ya cumplían.
- **Nada de juicio antes de ¡VERIFICAR!** → ya se cumplía: lo elegido va en azul,
  verde/rojo solo al revelar. Se reforzó que al revelar **la correcta grite**: halo
  verde en R1 (polígono) y R2 (tarjeta), y en R3 un **panel "VAN ASÍ"** grande bajo
  la cinta (la pastilla de 9 px bajo la casilla vacía casi no se veía: se quitó).
- **Todo lo colocado se puede quitar** → **R3 cambió**: tocar una ficha ya puesta la
  saca y la deja en la mano, con el aviso visible *"Toca una ficha colocada para
  sacarla."* Antes solo se podía mover de casilla a casilla, nunca devolver.
- **Verificado solo si el check lo cubre** → se escribió
  `.planning/sin-superposiciones.js` (adaptado del de juego-14) que recorre el DOM
  real de las 3 rondas en 8 partidas, **incluidos los rótulos `<text>` del mapa SVG**.
  Ignora a propósito dos solapes que son diseño y están declarados en el script: el
  overlay ¡EXCELENTE! y el badge ✓/✗ clavado a la esquina de la ficha.

## 2026-11-16 (3ª pasada) — Correcciones de la autora jugando

- **El mapa de R1 estaba mal dibujado.** Lo había hecho a mano con polígonos
  inventados; la autora mandó una captura de un mapa real: *"este mapa está super
  mal"*. Se rehízo con los **contornos reales de Natural Earth**
  (`ne_50m_admin_0_countries`, dominio público) proyectados y simplificados, más
  Guyana/Surinam/Guayana Francesa como silueta inerte. **Regla: un mapa no se dibuja
  a ojo ni se genera como imagen — se convierte desde datos geográficos reales.**
  (Una imagen tampoco sirve: no es tocable por país y la IA inventa fronteras.)
- **"Parte" era jerga.** *"no entiendo cómo descubre quién envió este parte, envió a
  dónde, qué parte"*. El enunciado pasó a **"Descubre quién dijo esto."** y la tarjeta
  a **"FRASE DICHA EL · <fecha>"**. Su confusión = el diagnóstico.
- **R2 colgaba arriba** con todo el hueco abajo: el bloque se centra en el alto
  disponible, igual que R3.

## 2026-11-16 (4ª pasada) — R3 rehecha: la autora la veía aburrida

- *"esta actividad está como que fea, no sé, la veo aburrida"* (sobre la cinta de
  años: una losa gris con recuadros punteados, sin nada que mirar, al lado del mapa
  de R1 y las pinturas de R2).
- Se le propusieron **dos caminos** (lavado de cara vs mecánica nueva) y luego
  **tres mecánicas más** cuando pidió otras opciones. Eligió **insertar en la línea**
  (mecanismo del juego de mesa *Timeline*) y, de las dos formas de validar,
  la **(a) un solo ¡VERIFICAR! al final**.
- Implementada como `R3Linea`: línea con flecha y nudos, ancla con año visible,
  fichas que llegan de una en una sin año (`????`), huecos `+` entre fichas,
  sacar devuelve a la mano, panel "EL ORDEN ES" al revelar.
- **El detector de solapes cazó un defecto real**: con las 4 fichas la fila medía
  474 px en un carril de 470. Fichas 82→78 y huecos 26→24 (448 px). También hubo que
  esperar 450 ms antes de medir: el aterrizaje de 190 ms daba falsos positivos.
- Además en esta tanda: bocadillo de R2 "Destapa…" → **"Toca una pista si la
  necesitas."** (la autora: el verbo tiene que decir qué hacer), y el pergamino del
  parte se amplía al 170 % porque sus **bordes rasgados** se veían como recuadros
  grises a los costados.

## 2026-11-16 (5ª pasada) — Pinturas en la línea del tiempo

- La autora generó las **5 escenas que faltaban** (Haití, acta de Venezuela,
  Guayaquil, Ayacucho, República de Bolívar). `actaven` y `vendef` comparten la de
  Venezuela: nunca caen en el mismo grupo, así que no se repiten en una partida.
- Ficha de la línea rehecha para que quepan: 84×76 con miniatura, y la ficha que
  llega a 164 px con la pintura en grande.
- **Fallo encontrado al cablearlas:** el arrastre dejó de funcionar. Al apretar sobre
  la imagen, el navegador arranca su **drag nativo de imágenes** y dispara
  `pointercancel`. Solución: `draggable={false}` + `pointerEvents:"none"` en toda
  `<img>` dentro de un elemento arrastrable (se aplicó también a las de R2).
- **Descuido propio:** el filtro del script de optimización no se aplicó y la segunda
  pasada **sobrescribió los respaldos** de la primera tanda con sus versiones ya
  reducidas (se perdieron los originales a 1200 px de 8 escenas y 2 fondos). Avisado
  a la autora. El script ya no pisa un respaldo existente.

## 2026-11-16 (6ª pasada) — Retratos reales y R3 cambiada otra vez

- **R2 con retratos históricos reales.** La autora: *"debería verse los personajes, no
  esas escenas"*. Las escenas de época no identifican a nadie. Solución: **óleos del
  s. XIX en dominio público** (Wikimedia Commons), comprobando la licencia de cada uno
  con la API antes de bajarlo. Se **descartaron dos en CC BY-SA** (Yegros y Rodríguez
  de Francia por Alborno) y se buscaron sustitutos en dominio público. Procedencia:
  Bolívar (Toro Moreno, 1922) · Sucre (Tovar y Tovar) · San Martín (c.1828) · Pedro I
  (Rodrigues de Sá) · Artigas (Blanes, *Artigas en la Ciudadela*) · Lavalleja (Goulu) ·
  Yegros · Rodríguez de Francia. El de Artigas lleva recorte cerrado (cuadro de cuerpo
  entero). **Nunca se generaron caras**: la regla sigue intacta.
- **R3 rechazada dos veces más.** Primero la cinta de años, luego la línea de inserción:
  *"está fea, no me gusta nada"*. Al proponer alternativas, la autora rechazó la tanda
  entera: *"nada que ver las que me mandas, están muy aburridas"*. **Causa raíz: dos de
  las tres eran el MISMO quiz con decoración** (tablero con peón y ruleta). Lección:
  cuando pida mecánicas, que cada una sea un **tipo de interacción distinto de verdad**
  (descifrar / decidir con consecuencia / arcade), no un cuestionario disfrazado.
- Eligió **"El candado del archivo"** (descifrar, tipo escape room) y está construida.
- **El enunciado estaba pegado al bloque RONDA** y con todo el aire debajo: `paddingTop`
  34 en las tres rondas y el cartel del hecho separado 22 px.
