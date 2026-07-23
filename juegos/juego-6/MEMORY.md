# MEMORY.md — juego-6 · Hub de 4 libros (Estudios Sociales)

Bitácora del juego.

## Qué es (pivote 2026-07-23)

juego-6 fue primero **"Explora el Ecuador"** (provincias del Ecuador: ubica + trivia
del mapa). La autora dijo *"hay cambio de planes… vamos a cambiar todo"* y decidió
**descartar** ese juego y reconstruir juego-6 como un **HUB de 4 libros** con menú de
2 niveles:

```
Home (4 libros) → pantalla del libro (sus temas) → personaje → juego → reporte
  Libro 2 → 1 tema   ("Reconociendo mi país", 6 años)   ✅ hecho
  Libro 3 → 3 temas                                       ⏳ placeholder
  Libro 5 → 2 temas                                       ⏳ placeholder
  Libro 6 → 1 tema                                        ⏳ placeholder
```

(El juego de provincias sigue en el historial de git: commits `a2b2e03`, `1d6e46a`,
`3b4686e`.)

## Decisiones de la autora

- **Estructura:** 4 botones de libro en Home (2/3/5/6) → cada uno abre otra pantalla
  con sus temas (1/3/2/1 botones). Confirmó el esqueleto: *"perfecto"*.
- **Menú de 2 niveles** dentro de juego-6, sin tocar el shell (`app.jsx`). El nivel
  "libro" vive en el estado interno de `HomeScreen`.
- Se armó primero el **esqueleto navegable** (placeholders "en construcción") para que
  la autora viera "cómo quedaría", y luego se llenan los libros uno por uno.

## Libro 2 · "Reconociendo mi país" (6 años)

- Del **TEMA 2 del libro** (fotos que mandó la autora): país=Ecuador, capital=Quito
  (Pichincha), **servicios básicos**, **quién ayuda** (ECU 911/bomberos/policía/Cruz
  Roja), población (censo 2022). Se dejó fuera lo abstracto (prefecto/gobernador) por la
  edad.
- Se propusieron 3 mecánicas **como bosquejo ASCII en el chat** (la autora las prefiere
  ahí, no como enlace de artifact). Eligió **A "Mira y toca"** (tras notar que A puede
  absorber los servicios de la B en preguntas de tocar).
- **Sin imágenes:** emojis (la autora preguntó y se decidió emojis; código con respaldo
  para imágenes si se quisieran luego).
- Mecánica: **Mira y toca** (patrón 5), 4 rondas, banco 10 (`PREGUNTAS_L2`), opciones
  barajadas, bocadillo fijo, anti-repetición cap 6.
- **Verificado:** e2e `reachedResults: true`; anti-repetición al recargar **0 solapes**
  (p1=[3,9,5,1] vs p2=[4,7,6,8]); format-lint 15/15.

## Aprendizajes

- La autora prefiere ver los **bosquejos de mecánica dibujados en el propio chat**
  (ASCII), no como enlace a un artifact. (Lo pidió 3 veces.)
- Regla recordada por la autora: *"al recargar la página me debe salir variado"* →
  anti-repetición FIFO en cada juego con banco, verificado por test de recarga.

## Pendiente

- **Libro 3** (3 temas), **Libro 5** (2 temas), **Libro 6** (1 tema): contenido +
  mecánica de cada uno (la autora los pasa uno por uno).
- **Título global** del hub + card del landing (placeholder por ahora).
- Personaje guía por defecto por libro/tema (hoy: domi, elegible).
