# Orden del elenco — qué guía protagoniza cada juego

Acordado con la autora. El personaje guía protagonista **no se elige por
temática**: sigue un **ciclo fijo** para que el elenco salga variado a lo largo de
la serie de **15 juegos** prevista.

## Ciclo: Domi → Yaku → Sisa → Andi

Se asigna por el **ordinal del slug** (`juego-N`), no por orden de creación —
los huecos de numeración son intencionales (el número calza con la numeración de
la colección de la autora).

| `N mod 4` | 1 | 2 | 3 | 0 |
|-----------|:-:|:-:|:-:|:-:|
| guía      | `domi` | `yaku` | `sisa` | `andi` |

Comprobación contra los juegos existentes:

| juego | j1 | j2 | j3 | j4 | j5 | j6 | j8 | **j13** |
|-------|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:-------:|
| guía  | domi ✓ | yaku ✓ | sisa ✓ | andi ✓ | domi ✓ | *(excepción)* | andi ✓ | **domi** |

**Excepción `juego-6`:** es el hub de 4 libros con guías mixtos por tema; el
landing lo registra como `andi`. No rompe el ciclo para los siguientes.

## Al crear un juego nuevo

1. Calcular `N mod 4` sobre el **número del slug** y usar ese `charId`.
2. Registrarlo en el array `GAMES` del landing (`charId` debe coincidir con el
   guía por defecto del `screens.jsx` del juego).
3. En juegos multi-tema, el guía del ciclo es el **protagonista del juego**; el
   niño siempre puede cambiarlo en la `CharacterScreen`.
