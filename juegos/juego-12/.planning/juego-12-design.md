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
