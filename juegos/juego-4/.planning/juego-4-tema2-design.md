# juego-4 · Tema 2 — "Amigos y compañeros" (design-doc)

> Estudios Sociales · Cívica/Ciudadanía · **edad 6** · guía **Andi**.
> Basado en el libro (láminas "Amigos y compañeros" / "La vida en la escuela").
> Las láminas se usan para **entender** el tema, NO para copiar 1:1.

## Tema

La buena **convivencia** en la escuela: cómo tratar bien a los compañeros
(compartir, ayudar, esperar el turno, saludar) y reconocer el **mal trato**
(burla, empujón, gritos) como algo que **no está bien**. Todos somos diferentes
y nos respetamos.

## Niveles / rondas

1 sola ronda (como el Tema 1 de emergencias). Se muestran **4 tarjetas** tomadas de
un **banco de 8** con anti-repetición → al reiniciar salen otras. El **reparto NO es
fijo**: puede salir **1+3, 2+2 o 3+1** (decisión de la autora), garantizando ≥1 de
cada tipo para que ninguna caja quede vacía. Objetivo: clasificar las 4 correctamente.

## Mecánica

**Clasificar (arrastrar a 2 cajas) + ¡VERIFICAR!** — mismo motor de arrastre y
mismo flujo verificación→reveal→banner→reporte que el Tema 1.

- 2 cajas de destino: **😊 Está bien** (verde) y **😞 No está bien** (rojo suave).
- El niño arrastra cada tarjeta a una caja. Con las 4 puestas se habilita **¡VERIFICAR!**
- Al verificar: ✓ en aciertos; ✗ en errores + **mini-tag revelando la caja correcta**
  ("va en 😊 Está bien"), dejando ver lo que eligió el niño (invariante EDINUN).
- Luego banner **¡EXCELENTE! / ¡UPS!** y **reporte** imprimible.
- Fallar NO baja lo ganado; completar cuenta como éxito. Estrellas = # aciertos.

## Banco de acciones (propuesto)

**ESTÁ BIEN 😊** (buena convivencia)
- Compartir · "Comparto mis colores"
- Ayudar · "Ayudo a un compañero"
- Esperar mi turno · "Espero mi turno"
- Saludar · "Saludo con cariño"

**NO ESTÁ BIEN 😞** (mal trato)
- Burlarse · "Me burlo de un compañero"
- Empujar · "Empujo a un compañero"
- Gritar · "Grito enojado"
- Quitar las cosas · "Arrebato las cosas"

→ Banco de **4 + 4 = 8**; cada partida usa **4** con reparto variable (variedad al
reiniciar). Con solo 4 tarjetas caben **más grandes** (escena de 130 px, se leen bien)
y las cajas quedan **bajitas** (las 4 miniaturas entran en una sola fila).

## Layout (lienzo 900×540) — bandeja arriba / cajas abajo (del juego de basura)

```
[ Estar preparados | Amigos y compañeros | Tema 3 ]      (chips, top)
 logo   Las siguientes acciones ¿están bien o no?     📋 x/4   ← QUÉ

  Andi 🦅          [🃏 grande] [🃏 grande]        [ ¡VERIFICAR! ]
  "Arrastra las    [🃏 grande] [🃏 grande]        [  REINICIAR  ]
   acciones según      (bandeja 2×2)              [    SALIR    ]
   corresponda."  ← CÓMO

     ┌────────────────┐        ┌────────────────┐
     │  😊 Está bien  │        │ 😞 No está bien │
     │  [·][·][·][·]  │        │  [·][·][·][·]  │   ← miniaturas, 1 fila
     └────────────────┘        └────────────────┘
```

**Regla de textos (ver `memory/aprendizajes-de-diseno.md` §11):** el **enunciado**
dice **QUÉ** ("Las siguientes acciones ¿están bien o no?") y el **bocadillo** dice
**CÓMO** ("Arrastra las acciones según corresponda."). NO invertirlos.

## Log / Reporte

- `cols: ["Acción", "¿Dónde va?"]`, `themeEmoji: "🤝"`,
  `praise: "¡aprendiste a ser un buen amigo/a!"`.
- Cada fila: emoji + acción · "Está bien / No está bien" · ✓/✗.

## Copy (texto final, dictado por la autora)

- Enunciado (**QUÉ**): **"Las siguientes acciones ¿están bien o no?"**
  (el "¿están bien o no?" va en dorado).
- Bocadillo Andi (**CÓMO**): **"Arrastra las acciones según corresponda."**
- Home — botón Tema 2: label **"Amigos y compañeros"**, descripción
  **"Separa lo que está bien de lo que no."**, `id: "convivencia"`, `enabled:true`.

## Glifos / fondo

Reusa el `CosmosBg` de juego-4 (🏫🚸🎒…). Opcional añadir 🤝❤️😊 al set.

## Assets necesarios (los genera la autora, estilo Tema 1)

8 dibujos fondo transparente (o 6 si se hace 3+3 fijo): compartir, ayudar,
esperar-turno, saludar, burlarse, empujar, gritar, quitar. Nombres sugeridos:
`conviv-compartir.png`, `conviv-ayudar.png`, `conviv-turno.png`, `conviv-saludar.png`,
`conviv-burla.png`, `conviv-empujar.png`, `conviv-gritar.png`, `conviv-quitar.png`.
Alternativa rápida: tarjetas con **emoji** en vez de dibujo (menos arte, menos cálido).

## Riesgos / notas

- Las escenas de "mal trato" deben ser **caricatura suave**, no gráficas ni
  atemorizantes (el libro las muestra así).
- El label del chip "Amigos y compañeros" es largo para el chip pequeño → si
  aprieta, usar chip corto ("Amigos") manteniendo el título largo en el botón del Home.
- Cabe en 900×540 reusando la geometría del juego de basura (6 ítems + cajas).
