# juego-8 · "¿En qué trabajan?" — design-doc

## Tema
Libro de Estudios Sociales, tema **"El respeto al trabajo de las personas"** (actividades
económicas). Edad **8 años**. Guía **Andi**. 1 tema, **3 rondas**, cada una con mecánica
distinta (elegidas por la autora viendo bocetos ASCII en el chat). ⭐ hasta 3.

## Conceptos del libro (bancos, sin inventar)
- **Sectores:** primario (agricultura, ganadería, pesca, minería, forestal) · secundario
  (industrias: alimentaria, maderera, textil, automotriz, construcción/artesanía) ·
  terciario (comercio, transporte, salud, educación, turismo) · cuaternario (intelectual).
- **Bienes vs servicios:** bienes = tangibles/objetos; servicios = actividades.
- **Sector primario vs secundario:** natural vs transformado (actividad "Aplico").
- **PEA vs PEI:** activa (trabaja o busca trabajo) vs inactiva (estudiantes, jubilados…).

## Rondas
| # | Nombre | Mecánica | Concepto | Verifica |
|---|--------|----------|----------|----------|
| R1 | Marca los del campo | tocar VARIOS + ¡VERIFICAR! | primario vs secundario | sí |
| R2 | ¿Bien o servicio? | tocar 1 de 2 (1 carta) | bienes vs servicios | valida al tocar |
| R3 | ¿Activa o inactiva? | tocar persona → grupo + ¡VERIFICAR! | PEA vs PEI | sí |

Las 3 mecánicas son distintas entre sí (tocar-varios · tocar 1 de 2 · colocar en grupo).

## Layout 900×540 (chrome EDINUN estándar)
HUD arriba (logo · RONDA con dots · ⏱ · ⭐). Personaje/bocadillo izquierda (margen 215).
Zona central (`top:60 bottom:18 left:215 right:215`): enunciado (fontSize 22, paddingTop
30) + mecánica. Columna de acciones derecha: `¡VERIFICAR!` (R1/R3) · REINICIAR · SALIR.

## Log / Reporte
1 fila por ronda (`{idx, emoji, a, userAnswer, correctAnswer, isCorrect}`). Reporte
imprimible de 3 filas + resumen (rondas/correctas/estrellas/precisión).

## Invariantes EDINUN
- Fallar NO baja el progreso; al fallar se **revela la correcta** en el lenguaje de la
  mecánica (✓/✗ + pastilla "este sí va" / grupo correcto).
- Enunciado = QUÉ; bocadillo = CÓMO.
- Salir/reiniciar con modal.
- **Anti-repetición por ronda**: al recargar, cada ronda da algo distinto (cap por ronda,
  ver CLAUDE.md; regla: subconjunto K → cap < pool−K).
- **Sin imágenes**: emojis + nombre (personas → emojis, no caras generadas).

## Glifos / Copy
Enunciados: R1 "¿Cuáles vienen del sector primario?" · R2 "¿Es un bien o un servicio?" ·
R3 "¿A qué grupo pertenece cada persona?". Bocadillos (CÓMO): "Toca los del campo y toca
¡VERIFICAR!" · "Toca si es bien o servicio." · "Toca una persona y luego su grupo."

## Riesgos / decisiones
- 8 años → **tap, no drag** en R3 (el arrastre falla a esa edad).
- Clasificación primario/secundario y bien/servicio: solo ítems **inequívocos** (leche
  cruda = primario, queso = secundario, etc.).
- PEA/PEI: ejemplos del libro (estudiante/jubilado = inactiva; oficios = activa).
