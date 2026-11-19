// game-screens.jsx — juego-12 (Estudios Sociales · multi-LIBRO).
// Juego MULTI-LIBRO: el Home tiene dos niveles (Libro → Tema) y `GameScreen` despacha
// por `app.currentCategory`, que es el id del tema. Cada tema trae su propio arreglo de
// rondas; el chrome EDINUN lo comparten todos vía `J12Game`.
//
// ESTRUCTURA FIJADA POR LA AUTORA: Libro 6 → 3 temas · Libro 7 → 4 temas (7 en total).
//
// LIBRO 6 · TEMA 1 · "Estado ecuatoriano en sus primeros años de vida" — 10 años —
// D.C.D. CS.3.1.30 / CS.3.1.31 / CS.3.1.32 — L6T1_ROUNDS:
//   R1 "El sello de ciudadanía" — DECIDIR con criterio: quién podía ser ciudadano en 1830
//   R2 "La pirámide"            — APILAR por jerarquía los grupos sociales de 1830
//   R3 "La línea del tiempo"     — ORDENAR los hechos de los primeros años
//
// LIBRO 6 · TEMA 2 · "Revolución Marcista" — 10 años — L6T2_ROUNDS:
//   R1 "La bandera de marzo"       — COMPONER: el símbolo se dibuja al tocar
//   R2 "El Ecuador partido"        — TOCAR EN EL MAPA (contorno real de Natural Earth)
//   R3 "La Carta de la Esclavitud" — RASGAR: se rompe pasando el dedo
//
// CONTRATO: GameScreen/ResultsScreen({app,setApp,go}) en window; markFirstAttempt() en la
// 1a respuesta; incrementGamesCompleted() al fin. Invariantes EDINUN: fallar NO baja el
// progreso; al fallar se revela la correcta en el lenguaje de la mecánica; salir/reiniciar
// con modal. Enunciado = QUE, bocadillo = COMO. Anti-repeticion por ronda.
//
// ⚠ DATOS: todo sale del tema del libro (pp. 72-77) y su cuaderno (pp. 65-70). No inventar
// cifras ni personajes históricos: es material escolar. Ver `.planning/juego-12-design.md`.

const { useState: useStateG, useEffect: useEffectG, useRef: useRefG } = React;

function PortalToBody({ children }) {
  return ReactDOM.createPortal(children, document.body);
}

const CAT_LABEL = "Los primeros años del Ecuador";

const ANIMOS = [
  "¡Casi! Sigue intentándolo.",
  "¡La próxima es tuya!",
  "Equivocarse también es aprender.",
];

// ── Anti-repeticion FIFO en localStorage (una clave por ronda) ──
function j12Recent(key) { try { const r = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(r) ? r : []; } catch (e) { return []; } }
function j12Push(key, id, cap) { try { const prev = j12Recent(key).filter((x) => x !== id); localStorage.setItem(key, JSON.stringify([id].concat(prev).slice(0, cap))); } catch (e) {} }
function j12Shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
// Devuelve k INDICES de `pool` evitando los recientes de `key`, sin registrarlos todavía
// (registrar luego con j12Commit). ⚠ Cap: para un SUBCONJUNTO de K, nunca cap = K — eso
// parte el banco en grupos fijos que alternan idéntico en cada recarga.
function j12PickIdx(pool, k, key) {
  const recent = new Set(j12Recent(key)), all = pool.map((_, i) => i);
  return j12Shuffle(all.filter((i) => !recent.has(i))).concat(j12Shuffle(all.filter((i) => recent.has(i)))).slice(0, k);
}
function j12Commit(key, idxs, cap) { idxs.forEach((i) => j12Push(key, i, cap)); }
// 25000 → "25 000" (espacio fino, como lo escribe el libro).
function j12Num(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " "); }

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║ LIBRO 6 · TEMA 1 · "Estado ecuatoriano en sus primeros años de vida"       ║
// ║ Edad objetivo: 10 años (la fija la autora).                                ║
// ║                                                                            ║
// ║ 3 rondas, 3 verbos distintos:                                              ║
// ║   R1 "El sello de ciudadanía" — DECIDIR con criterio                       ║
// ║   R2 "La pirámide"            — APILAR por jerarquía                       ║
// ║   R3 "La línea del tiempo"     — ORDENAR intercambiando                    ║
// ║                                                                            ║
// ║ ⭐ 4 + 3 + 4 = **11 máximo**.                                               ║
// ║                                                                            ║
// ║ ⚠ Fuera del juego, a propósito: la pena de muerte para los 72 opositores   ║
// ║ (es del libro, pero no se hace un juego con una ejecución) y las           ║
// ║ actividades de respuesta abierta del cuaderno (2, 7, 8, 10 y la grupal).   ║
// ╚════════════════════════════════════════════════════════════════════════════╝

// ══════════════════════════════════════════════════════════════════
// R1 · "El sello de ciudadanía" — DECIDIR con criterio.
// Cuatro personas a la vez y, para cada una, SÍ o NO; ¡VERIFICAR! valida las cuatro de
// una vez (una ronda = UNA jugada, nunca cuatro jugadas seguidas). ⭐ +1 por persona.
//
// ⚠ La LEY está siempre en pantalla: la ronda se resuelve leyendo, no recordando. Es la
// regla "una ronda se resuelve con lo que se ve" (nacida en juego-14).
//
// ⚠ Las personas NO son personajes históricos: son tipos sociales que el tema nombra
// (terrateniente criollo, jornalero indígena, artesano mestizo, montuvio, aguatero,
// barrendero, vendedora, clero, militar, comerciante). Sus datos aplican los requisitos
// del Art. 12 tal como los cita el libro; no se inventan biografías de personas reales.
//
// ⚠ El caso de la MUJER que cumple los cuatro requisitos y aun así queda fuera es el que
// mejor enseña el tema (la p. 76 dice que se excluía "a las mujeres en general").
//
// ⚠ Nada de verde ni rojo antes de ¡VERIFICAR!: lo elegido se marca en azul.
// ══════════════════════════════════════════════════════════════════
const J12_LEY = [
  "Ser casado o mayor de 22 años",
  "Tener propiedades",
  "Tener empleo",
  "Saber leer y escribir",
];

// ciu = si podía ser ciudadano · motivo = lo que se revela al verificar.
const J12_PERSONAS = [
  { id: "terrateniente", n: "Don Ramón", e: "🎩", edad: 42,
    l: ["Dueño de una hacienda en la Sierra.", "Sabe leer y escribir."],
    ciu: true, motivo: "Cumplía los cuatro requisitos." },
  { id: "hacendada", n: "Doña Mercedes", e: "👒", edad: 35,
    l: ["Dueña de una hacienda y de un negocio.", "Sabe leer y escribir."],
    ciu: false, motivo: "Cumplía todo, pero las mujeres no podían ser ciudadanas." },
  { id: "comerciante", n: "Don Tomás", e: "📦", edad: 28,
    l: ["Comerciante de cacao en Guayaquil.", "Tiene casa propia y sabe leer."],
    ciu: true, motivo: "Cumplía los cuatro requisitos." },
  { id: "militar", n: "Capitán Vargas", e: "🎖️", edad: 33,
    l: ["Militar del ejército de la República.", "Tiene tierras y sabe leer."],
    ciu: true, motivo: "Cumplía los cuatro requisitos." },
  { id: "clero", n: "Padre Ignacio", e: "⛪", edad: 50,
    l: ["Sacerdote de una parroquia.", "Sabe leer y escribir, y tiene bienes."],
    ciu: true, motivo: "Cumplía los cuatro requisitos." },
  { id: "artesano", n: "Don Julián", e: "🔨", edad: 26,
    l: ["Artesano orfebre en la ciudad.", "Sabe leer, pero no tiene propiedades."],
    ciu: false, motivo: "No tenía propiedades." },
  { id: "jornalero", n: "Manuel", e: "🌾", edad: 30,
    l: ["Jornalero en una hacienda.", "No sabe leer ni tiene propiedades."],
    ciu: false, motivo: "No sabía leer y no tenía propiedades." },
  { id: "montuvio", n: "Don Jacinto", e: "🪓", edad: 38,
    l: ["Montuvio con una chacra en la Costa.", "Tiene su tierra, pero no sabe leer."],
    ciu: false, motivo: "No sabía leer y escribir." },
  { id: "aguatero", n: "Pedro", e: "🏺", edad: 24,
    l: ["Aguatero: lleva agua por la ciudad.", "No sabe leer ni tiene propiedades."],
    ciu: false, motivo: "No sabía leer y no tenía propiedades." },
  { id: "barrendero", n: "Lucho", e: "🧹", edad: 29,
    l: ["Barrendero en las calles de Quito.", "No sabe leer ni escribir."],
    ciu: false, motivo: "No sabía leer y no tenía propiedades." },
  { id: "vendedora", n: "Rosa", e: "🧺", edad: 27,
    l: ["Vende frutas en el mercado.", "Sabe leer y tiene su puesto."],
    ciu: false, motivo: "Las mujeres no podían ser ciudadanas." },
  { id: "joven", n: "Carlitos", e: "📘", edad: 19,
    l: ["Hijo de un hacendado, soltero.", "Sabe leer y vive en la casa familiar."],
    ciu: false, motivo: "Era menor de 22 años y soltero." },
];

const J12_R1_KEY = "edinun_j12_l6t1_r1_v1";
function j12R1Build() {
  // 4 de 12 ⇒ cap < 8. Se re-sortea hasta que entren al menos un SÍ y un NO: con cuatro
  // iguales se acertaría sin leer la ley.
  let idx = [], guard = 0;
  do {
    idx = j12PickIdx(J12_PERSONAS, 4, J12_R1_KEY);
    guard++;
  } while (guard < 25 && !(idx.some((i) => J12_PERSONAS[i].ciu) && idx.some((i) => !J12_PERSONAS[i].ciu)));
  j12Commit(J12_R1_KEY, idx, 6);
  return { fichas: idx.map((i) => J12_PERSONAS[i]) };
}

// La ilustración la genera la autora; mientras no esté, va el emoji del oficio.
function J12Retrato({ p, ancho, alto }) {
  const [roto, setRoto] = useStateG(false);
  if (roto) return <span style={{ fontSize: Math.round(Math.min(ancho, alto) * 0.62), lineHeight: 1 }}>{p.e}</span>;
  // ⚠ `objectFit: cover` sobre una ilustración cuadrada recorta los lados y deja la figura
  // (que va de cuerpo entero y centrada) ocupando todo el alto. El `objectPosition` en
  // "center top" asegura que, si sobra, se recorte por los pies y nunca por la cabeza.
  return <img src={`assets/persona-${p.id}.jpg`} alt="" draggable={false} onError={() => setRoto(true)}
    style={{ width: ancho, height: alto, objectFit: "cover", objectPosition: "center top", borderRadius: 10, pointerEvents: "none", WebkitUserDrag: "none" }} />;
}

function L6T1R1Sello({ onSolve, verifyRef }) {
  const [b] = useStateG(() => j12R1Build());
  const [sel, setSel] = useStateG({});          // id -> true (sí) | false (no)
  const [verified, setVerified] = useStateG(false);
  const completas = b.fichas.every((f) => sel[f.id] !== undefined);

  function elegir(id, v) { if (verified) return; setSel((s) => Object.assign({}, s, { [id]: v })); }
  function verificar() {
    if (verified || !completas) return;
    setVerified(true);
    const aciertos = b.fichas.filter((f) => sel[f.id] === f.ciu).length;
    onSolve(aciertos === b.fichas.length, {
      emoji: "📜", a: "¿Quién podía ser ciudadano en 1830?",
      userAnswer: b.fichas.map((f) => `${f.n}: ${sel[f.id] ? "sí" : "no"}`).join(" · "),
      correctAnswer: b.fichas.map((f) => `${f.n}: ${f.ciu ? "sí" : "no"}`).join(" · "),
    }, aciertos);
  }
  verifyRef.current = verificar;

  function tarjeta(f) {
    const eleccion = sel[f.id], ok = verified && eleccion === f.ciu;
    let border = "#d9c48a";
    if (!verified && eleccion !== undefined) border = "#4fd8ff";
    if (verified) border = ok ? "#2ecc8f" : "#ff6b6b";
    function btn(valor, texto) {
      const puesto = eleccion === valor;
      const correcto = verified && valor === f.ciu;
      let bg = "linear-gradient(180deg,#fffdf6,#f6ecd2)", col = "#3a2608", bd = "#d9c48a";
      if (!verified && puesto) { bg = "linear-gradient(180deg,#eaf9ff,#cdeeff)"; bd = "#4fd8ff"; }
      if (verified && correcto) { bg = "linear-gradient(180deg,rgba(72,224,154,0.95),rgba(26,143,95,0.92))"; col = "#06381f"; bd = "#2ecc8f"; }
      else if (verified && puesto) { bg = "linear-gradient(180deg,rgba(255,139,139,0.92),rgba(178,47,47,0.9))"; col = "#fff"; bd = "#ff6b6b"; }
      return (
        <button onClick={() => elegir(f.id, valor)} disabled={verified}
          style={{ flex: 1, minWidth: 0, height: 26, borderRadius: 8, border: `2px solid ${bd}`, background: bg, color: col, fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 11, cursor: verified ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
          {texto}
          {verified && puesto && <span style={{ flexShrink: 0, width: 15, height: 15, borderRadius: "50%", background: correcto ? "#0f6b3f" : "#8e1f1f", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 9.5 }}>{correcto ? "✓" : "✗"}</span>}
        </button>
      );
    }
    return (
      <div key={f.id} style={{ position: "relative", width: 221, minHeight: 132, boxSizing: "border-box", borderRadius: 13, border: `3px solid ${border}`, background: "linear-gradient(180deg, rgba(255,253,246,0.97), rgba(240,232,214,0.94))", padding: "7px 8px 8px", display: "flex", flexDirection: "column", gap: 5, boxShadow: "0 5px 14px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ flexShrink: 0, width: 56, height: 72, borderRadius: 10, background: "rgba(224,167,44,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <J12Retrato p={f} ancho={56} alto={72} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 12.5, color: "#3a2608", lineHeight: 1.1 }}>{f.n}, {f.edad} años</div>
            {f.l.map((x, i) => (
              <div key={i} style={{ fontFamily: "var(--ed-font-ui)", fontSize: 9.5, lineHeight: 1.2, color: "#5a4420", marginTop: 1 }}>{x}</div>
            ))}
          </div>
        </div>
        {/* Franja reservada SIEMPRE para el motivo del revelado: así la tarjeta no crece
            al verificar y nada salta (mismo remedio que la R1 del Tema 1 de juego-10). */}
        {/* El sello ✓/✗ de la tarjeta va AQUÍ, no en la esquina de arriba: ahí se montaba
            sobre el final del nombre, y los tres nombres más largos (135 px) no caben si
            se les estrecha el hueco. La franja ya estaba reservada, así que el sello entra
            sin que la tarjeta crezca. */}
        <div style={{ minHeight: 15, display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ flexShrink: 0, width: 15, height: 15, borderRadius: "50%", background: !verified ? "transparent" : ok ? "#1f8a54" : "#c0392b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 10, boxShadow: verified ? "0 2px 5px rgba(0,0,0,0.3)" : "none" }}>{verified ? (ok ? "✓" : "✗") : ""}</span>
          {verified && (
            <div style={{ flex: 1, minWidth: 0, fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 8.5, lineHeight: 1.15, color: "#8a6410", background: "linear-gradient(180deg,#ffe6a1,#f1c153)", border: "1.5px solid #e0a72c", borderRadius: 7, padding: "1px 6px" }}>{f.motivo}</div>
          )}
        </div>
        <div style={{ display: "flex", gap: 6 }}>{btn(true, "SÍ")}{btn(false, "NO")}</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", height: "100%", width: "100%", paddingTop: 40 }}>
      <div style={{ pointerEvents: "none", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 20, color: "#fff" }}>Decide quién podía ser ciudadano en 1830.</span>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, minHeight: 0, width: "100%" }}>
        <div style={{ width: 452, boxSizing: "border-box", borderRadius: 12, border: "2.5px solid rgba(242,194,96,0.6)", background: "rgba(0,0,0,0.34)", padding: "5px 12px 6px", flexShrink: 0 }}>
          <div className="ed-label" style={{ color: "#fce9a8", fontSize: 9.5, textAlign: "center", marginBottom: 4 }}>Constitución de 1830 · Art. 12</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "center" }}>
            {J12_LEY.map((x) => (
              <span key={x} style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 9.5, color: "#fff", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 999, padding: "2px 9px" }}>{x}</span>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, flexShrink: 0 }}>
          {b.fichas.map((f) => tarjeta(f))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// R2 · "La pirámide" — APILAR por jerarquía.
// Los cuatro escalones de la pirámide social de la p. 74. UN escalón llega ya puesto
// como ancla (varía cuál en cada partida) y se colocan los otros tres ⇒ ⭐ +1 por
// escalón, hasta 3. Tocar un grupo y luego su escalón; tocar un escalón lleno lo saca.
//
// ⚠ El ancla es lo que da variedad SIN inventar contenido: la pirámide del libro es una
// sola. Mismo recurso que el artículo de la Constitución de juego-10 (cambia qué falta).
//
// ⚠ El escalón de abajo NO lleva ilustración de personas: va con un símbolo sobrio y el
// nombre textual del grupo. No se dibuja una caricatura de personas esclavizadas.
// ══════════════════════════════════════════════════════════════════
const J12_PIRAMIDE = [
  { id: "elite", e: "🎩", n: "Élite terrateniente y altos funcionarios", an: 172 },
  { id: "medios", e: "🎖️", n: "Militares, comerciantes y clero", an: 250 },
  { id: "populares", e: "🌾", n: "Indígenas, campesinos, montuvios y mujeres", an: 328 },
  { id: "base", e: "⛓️", n: "Afroamericanos esclavizados e indígenas de la Amazonía", an: 406 },
];

const J12_R2_KEY = "edinun_j12_l6t1_r2_v1";
function j12R2Build() {
  const a = j12PickIdx(J12_PIRAMIDE, 1, J12_R2_KEY)[0];
  // ⚠ cap 1, no 3: con un banco de 4 y cap 3 sale una ROTACIÓN exacta (1-2-3-4-1-2-3-4),
  // previsible. Con cap 1 solo se descarta el ancla de la partida anterior.
  j12Commit(J12_R2_KEY, [a], 1);
  const sueltos = J12_PIRAMIDE.map((_, i) => i).filter((i) => i !== a);
  return { ancla: a, fichas: j12Shuffle(sueltos).map((i) => J12_PIRAMIDE[i]) };
}

function L6T1R2Piramide({ onSolve, verifyRef }) {
  const [b] = useStateG(() => j12R2Build());
  const [puesto, setPuesto] = useStateG({});     // indice del escalón -> id de grupo
  const [sel, setSel] = useStateG(null);
  // ⚠ El mapa queda LIMPIO para el turno siguiente: solo se ve la marca del ÚLTIMO
  // verificado, y ninguna ciudad se bloquea. Antes la ciudad usada se quedaba marcada y
  // no se podía volver a elegir, aunque fuese la correcta para el segundo gobernante.
  const [ultimo, setUltimo] = useStateG(null);   // { pide, ciudad }
  const [verified, setVerified] = useStateG(false);
  const [drag, setDrag] = useStateG(null);
  const rootRef = useRefG(null);
  const escRefs = useRefG({});
  const dragInfo = useRefG(null);
  const libres = b.fichas.filter((f) => Object.keys(puesto).every((k) => puesto[k] !== f.id));
  const completas = b.fichas.length === Object.keys(puesto).length;

  // Mueve un grupo a un escalón (o a la bandeja si `idx` es null). Si el escalón ya tenía
  // otro grupo, ese vuelve a la bandeja: nunca se pierde una ficha.
  function ponerEn(id, idx) {
    setSel(null);
    setPuesto((prev) => {
      const n = {};
      Object.keys(prev).forEach((k) => { if (prev[k] !== id && Number(k) !== idx) n[k] = prev[k]; });
      if (idx !== null && idx !== undefined && idx !== b.ancla) n[idx] = id;
      return n;
    });
  }

  // ⚠ Arrastre (pedido de la autora el 2026-11-17: *"aquí debería poder arrastrar y si ya
  // lo coloqué también arrastrar luego"*). El toque sigue funcionando como respaldo.
  function hitEscalon(x, y) {
    for (let i = 0; i < J12_PIRAMIDE.length; i++) {
      if (i === b.ancla) continue;
      const el = escRefs.current[i]; if (!el) continue;
      const r = el.getBoundingClientRect(), pad = 12;
      if (x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad) return i;
    }
    return null;
  }
  function onDown(e, id, desdeEscalon) {
    if (verified) return;
    e.stopPropagation();
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
    const S = rootRef.current ? (rootRef.current.getBoundingClientRect().width / 470) || 1 : 1;
    dragInfo.current = { id, x0: e.clientX, y0: e.clientY, scale: S, desdeEscalon: desdeEscalon === true };
    setDrag({ id, dx: 0, dy: 0, over: null, cx: e.clientX, cy: e.clientY, desdeEscalon: desdeEscalon === true, movido: false });
  }
  function onMove(e) {
    const di = dragInfo.current; if (!di) return;
    const dx = e.clientX - di.x0, dy = e.clientY - di.y0, moved = Math.hypot(dx, dy) > 6;
    setDrag({ id: di.id, dx: dx / di.scale, dy: dy / di.scale, over: moved ? hitEscalon(e.clientX, e.clientY) : null, cx: e.clientX, cy: e.clientY, desdeEscalon: di.desdeEscalon, movido: moved });
  }
  function onUp(e) {
    const di = dragInfo.current; if (!di) return;
    const moved = Math.hypot(e.clientX - di.x0, e.clientY - di.y0) > 6;
    dragInfo.current = null; setDrag(null);
    if (verified) return;
    if (moved) { ponerEn(di.id, hitEscalon(e.clientX, e.clientY)); return; }
    // Toque simple: si estaba puesta, la saca y la deja elegida para el siguiente escalón.
    if (di.desdeEscalon) { ponerEn(di.id, null); setSel(di.id); return; }
    setSel((s) => (s === di.id ? null : di.id));
  }
  function endDrag() { dragInfo.current = null; setDrag(null); }
  function tapEscalon(i) {
    if (verified || i === b.ancla) return;
    if (sel) { ponerEn(sel, i); return; }
    if (puesto[i]) ponerEn(puesto[i], null);
  }

  function verificar() {
    if (verified || !completas) return;
    setVerified(true);
    const aciertos = J12_PIRAMIDE.filter((e, i) => i !== b.ancla && puesto[i] === e.id).length;
    const nom = (id) => (J12_PIRAMIDE.find((x) => x.id === id) || {}).n || "—";
    onSolve(aciertos === b.fichas.length, {
      emoji: "🔺", a: "La pirámide social de 1830",
      userAnswer: J12_PIRAMIDE.map((e, i) => (i === b.ancla ? `${e.n} (dado)` : nom(puesto[i]))).join(" · "),
      correctAnswer: J12_PIRAMIDE.map((e) => e.n).join(" · "),
    }, aciertos);
  }
  verifyRef.current = verificar;

  function escalon(e, i) {
    const esAncla = i === b.ancla;
    const id = esAncla ? e.id : puesto[i];
    const volando = drag && drag.movido && drag.desdeEscalon && drag.id === id && !esAncla;
    const grupo = id ? J12_PIRAMIDE.find((x) => x.id === id) : null;
    const ok = verified && !esAncla && id === e.id;
    const over = drag && drag.over === i && !verified;
    let border = "#9b86d8", bg = "rgba(0,0,0,0.3)", col = "rgba(255,255,255,0.5)";
    if (esAncla) { border = "#f2c260"; bg = "linear-gradient(180deg,rgba(255,230,161,0.95),rgba(241,193,83,0.92))"; col = "#5a3d0a"; }
    else if (grupo && !volando) { border = "#d9c48a"; bg = "linear-gradient(180deg,#fffdf6,#f6ecd2)"; col = "#3a2608"; }
    if (over) { border = "#4fd8ff"; bg = "rgba(205,238,255,0.85)"; col = "#3a2608"; }
    if (verified && !esAncla) {
      border = ok ? "#2ecc8f" : "#ff6b6b";
      bg = ok ? "linear-gradient(180deg,rgba(72,224,154,0.95),rgba(26,143,95,0.92))" : "linear-gradient(180deg,rgba(255,139,139,0.92),rgba(178,47,47,0.9))";
      col = ok ? "#06381f" : "#fff";
    }
    const arrastrando = drag && grupo && drag.id === grupo.id && !esAncla;
    return (
      <button key={e.id} ref={(el) => { escRefs.current[i] = el; }} onClick={() => tapEscalon(i)} disabled={verified || esAncla}
        style={{ position: "relative", width: e.an, minHeight: 50, boxSizing: "border-box", borderRadius: 10, border: `3px ${(grupo && !volando) ? "solid" : "dashed"} ${border}`, background: bg, color: col, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "4px 10px", cursor: (verified || esAncla) ? "default" : "pointer", boxShadow: over ? "0 0 18px rgba(79,216,255,0.6)" : ((grupo && !volando) ? "inset 0 1px 0 rgba(255,255,255,0.6), 0 3px 9px rgba(0,0,0,0.26)" : "none"), transition: "border-color 0.12s ease, background 0.12s ease" }}>
        {grupo ? (
          <span onPointerDown={(verified || esAncla) ? undefined : ((ev) => onDown(ev, grupo.id, true))}
            onPointerMove={(verified || esAncla) ? undefined : onMove} onPointerUp={(verified || esAncla) ? undefined : onUp} onPointerCancel={endDrag}
            onClick={(ev) => ev.stopPropagation()}
            style={{ position: "relative", display: "flex", alignItems: "center", gap: 7, touchAction: "none", cursor: (verified || esAncla) ? "default" : "grab", opacity: volando ? 0 : 1 }}>
            {verified && !esAncla && (
              <span style={{ flexShrink: 0, width: 18, height: 18, borderRadius: "50%", background: ok ? "#1f8a54" : "#c0392b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 11, boxShadow: "0 2px 5px rgba(0,0,0,0.35)" }}>{ok ? "✓" : "✗"}</span>
            )}
            <span style={{ flexShrink: 0, fontSize: 16, lineHeight: 1 }}>{grupo.e}</span>
            <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 10.5, lineHeight: 1.15, textAlign: "left" }}>{grupo.n}</span>
          </span>
        ) : (
          <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 10.5 }}>escalón libre</span>
        )}
        {esAncla && <span style={{ position: "absolute", top: -9, left: 8, fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 8, color: "#5a3d0a", background: "linear-gradient(180deg,#ffe6a1,#f1c153)", border: "1.5px solid #e0a72c", borderRadius: 999, padding: "0 7px" }}>ya está</span>}
        {/* ⚠ El revelado NO cuelga de cada escalón. Las pastillas "aquí va: …" quedaban
            entre dos escalones, pisaban el de abajo y rompían la forma de la pirámide; la
            autora lo rechazó el 2026-11-17 (*"no me agrada cómo se ven las respuestas
            correctas"*). Va en un PANEL aparte donde estaba la bandeja (ver más abajo),
            igual que el "IBAN ASÍ" de juego-10. */}
      </button>
    );
  }

  return (
    <div ref={rootRef} style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", height: "100%", width: "100%", paddingTop: 40 }}>
      <div style={{ pointerEvents: "none", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 20, color: "#fff" }}>Arma la pirámide social de 1830.</span>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, minHeight: 0, width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, flexShrink: 0 }}>
          <span className="ed-label" style={{ color: "rgba(255,255,255,0.6)", fontSize: 9.5 }}>Arriba, los que mandaban</span>
          {J12_PIRAMIDE.map((e, i) => escalon(e, i))}
        </div>
        {/* Al verificar, el orden correcto va en un CARTEL en el sitio que ocupaba la
            bandeja: las fichas ya no sirven y así nada se mueve ni se monta. */}
        {verified ? (
          <div style={{ width: 452, boxSizing: "border-box", borderRadius: 14, border: "2.5px solid #f2c260", background: "linear-gradient(180deg, rgba(0,0,0,0.42), rgba(0,0,0,0.3))", padding: "7px 12px 9px", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flexShrink: 0 }}>
            <span className="ed-label" style={{ color: "#fce9a8", fontSize: 10 }}>La pirámide va así</span>
            {J12_PIRAMIDE.map((e, i) => {
              const acerto = i === b.ancla || puesto[i] === e.id;
              return (
                <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 7, width: "100%" }}>
                  <span style={{ flexShrink: 0, width: 16, height: 16, borderRadius: "50%", background: acerto ? "#1f8a54" : "rgba(242,194,96,0.9)", color: acerto ? "#fff" : "#5a3d0a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--ed-font-mono)", fontWeight: 700, fontSize: 9.5 }}>{acerto ? "✓" : i + 1}</span>
                  <span style={{ flexShrink: 0, fontSize: 13, lineHeight: 1 }}>{e.e}</span>
                  <span style={{ flex: 1, minWidth: 0, fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 10.5, lineHeight: 1.15, color: acerto ? "#bff3d9" : "#fff" }}>{e.n}</span>
                </div>
              );
            })}
          </div>
        ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, justifyContent: "center", width: 452, minHeight: 44, alignContent: "flex-start", flexShrink: 0 }}>
          {libres.map((f) => {
            const elegida = sel === f.id, arrastrando = drag && drag.id === f.id;
            return (
              <button key={f.id} onPointerDown={(e) => onDown(e, f.id, false)} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={endDrag} disabled={verified}
                style={{ maxWidth: 212, minHeight: 40, borderRadius: 11, border: `2.5px solid ${(elegida || arrastrando) ? "#4fd8ff" : "#d9c48a"}`, background: (elegida || arrastrando) ? "linear-gradient(180deg,#eaf9ff,#cdeeff)" : "linear-gradient(180deg,#fffdf6,#f6ecd2)", color: "#3a2608", display: "flex", alignItems: "center", gap: 6, padding: "4px 9px", textAlign: "left", cursor: verified ? "default" : "grab", touchAction: "none", zIndex: arrastrando ? 60 : 1, transform: arrastrando ? `translate(${drag.dx}px, ${drag.dy}px) scale(1.04)` : (elegida ? "translateY(-2px)" : "none"), boxShadow: (elegida || arrastrando) ? "0 0 16px rgba(79,216,255,0.6)" : "inset 0 1px 0 rgba(255,255,255,0.7), 0 3px 8px rgba(0,0,0,0.25)", transition: "none" }}>
                <span style={{ flexShrink: 0, fontSize: 15, lineHeight: 1 }}>{f.e}</span>
                <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 10, lineHeight: 1.15 }}>{f.n}</span>
              </button>
            );
          })}
          {libres.length === 0 && (
            <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 11, color: "rgba(255,255,255,0.5)", alignSelf: "center" }}>Ya los colocaste todos. Toca ¡VERIFICAR!</span>
          )}
        </div>
        )}
      </div>
      {/* Ficha FANTASMA: lo que sigue al dedo mientras se arrastra un grupo que ya estaba
          en un escalón. Su escalón se ve libre durante el gesto, así que no hay dos
          textos montados. No recibe eventos: el puntero está capturado por el origen. */}
      {drag && drag.movido && drag.desdeEscalon && (() => {
        const grupo = J12_PIRAMIDE.find((x) => x.id === drag.id);
        const r = rootRef.current ? rootRef.current.getBoundingClientRect() : null;
        if (!grupo || !r) return null;
        const S = (r.width / 470) || 1;
        return (
          <div style={{ position: "absolute", left: (drag.cx - r.left) / S, top: (drag.cy - r.top) / S, transform: "translate(-50%, -50%) scale(1.04)", pointerEvents: "none", zIndex: 80, maxWidth: 240, borderRadius: 11, border: "2.5px solid #4fd8ff", background: "linear-gradient(180deg,#eaf9ff,#cdeeff)", color: "#3a2608", display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", boxShadow: "0 0 18px rgba(79,216,255,0.7), 0 6px 16px rgba(0,0,0,0.35)" }}>
            <span style={{ flexShrink: 0, fontSize: 15, lineHeight: 1 }}>{grupo.e}</span>
            <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 10.5, lineHeight: 1.15 }}>{grupo.n}</span>
          </div>
        );
      })()}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// R3 · "La línea del tiempo" — ORDENAR intercambiando (verbo nuevo en el tema).
// Cuatro hechos de los primeros años de la República, desordenados: se tocan DOS tarjetas
// para intercambiarlas y ¡VERIFICAR! valida las cuatro de una vez. ⭐ +1 por tarjeta en
// su sitio.
//
// ⚠ Las tarjetas NO muestran el año mientras se juega: deducir el orden ES el ejercicio.
// El año aparece al verificar, junto al ✓/✗ y, si está mal, el puesto que le tocaba —
// **sin reordenar la columna**, para que el niño siga viendo su respuesta (mismo criterio
// que la línea del tiempo de juego-10).
//
// ⚠ Banco de 5 hechos, todos con **año explícito en el material y todos distintos**: si
// dos compartieran año habría dos ordenaciones correctas. Entran 4 por partida y lo que
// cambia es **cuál se queda fuera** (FIFO de 1, para que no sea el mismo dos veces
// seguidas) más el barajado inicial.
//
// ⚠ SUSTITUYE a "El censo de 1830" (estirar barras de población), que la autora descartó
// el 2026-11-17: *"la tercera ronda no me agrada, cambiemos de mecánica, está como muy
// aburrida"*. Ya se le había avisado de que era la ronda con menos variedad del tema,
// porque el libro da un solo cuadro de cifras. Esas cifras (Quito 25 000 · Cuenca 18 000 ·
// Riobamba 7 600 · Guayaquil 6 000, p. 73) quedan libres para otro tema.
// ══════════════════════════════════════════════════════════════════
const J12_HITOS = [
  { id: "h1830", y: 1830, e: "📜", t: "La Asamblea se reúne en Riobamba y nace el Estado del Ecuador." },
  { id: "h1834", y: 1834, e: "🏁", t: "Termina el periodo constitucional de Juan José Flores." },
  { id: "h1835", y: 1835, e: "🏛️", t: "En Ambato se escribe la segunda Constitución y Rocafuerte llega a la presidencia." },
  { id: "h1839", y: 1839, e: "🤝", t: "El Congreso nombra otra vez presidente a Flores y a Rocafuerte gobernador del Guayas." },
  { id: "h1843", y: 1843, e: "✒️", t: "Flores reúne en Quito una nueva Asamblea; a su Constitución la llamaron “Carta de Esclavitud”." },
];

const J12_R3_KEY = "edinun_j12_l6t1_r3_v1";
function j12R3Build() {
  // Entran 4 de 5: lo que cambia es CUÁL se queda fuera (FIFO de 1 para no repetirlo dos
  // partidas seguidas) y el barajado inicial.
  const fuera = j12PickIdx(J12_HITOS, 1, J12_R3_KEY)[0];
  j12Commit(J12_R3_KEY, [fuera], 1);
  const juegan = J12_HITOS.filter((_, i) => i !== fuera).slice().sort((a, b) => a.y - b.y);
  let ini = j12Shuffle(juegan), guard = 0;
  // Nunca arranca ya ordenada: se ganaría sin jugar.
  while (guard++ < 30 && ini.every((h, i) => h.id === juegan[i].id)) ini = j12Shuffle(juegan);
  return { correcto: juegan, orden: ini };
}

function L6T1R3Linea({ onSolve, verifyRef }) {
  const [b] = useStateG(() => j12R3Build());
  const [st, setSt] = useStateG(() => ({ orden: b.orden, drag: null }));
  const orden = st.orden, drag = st.drag;
  const setOrden = (f) => setSt((s) => ({ ...s, orden: typeof f === "function" ? f(s.orden) : f }));
  const setDrag = (d) => setSt((s) => ({ ...s, drag: d }));
  const [sel, setSel] = useStateG(null);
  // ⚠ El mapa queda LIMPIO para el turno siguiente: solo se ve la marca del ÚLTIMO
  // verificado, y ninguna ciudad se bloquea. Antes la ciudad usada se quedaba marcada y
  // no se podía volver a elegir, aunque fuese la correcta para el segundo gobernante.
  const [ultimo, setUltimo] = useStateG(null);   // { pide, ciudad }         // índice de la tarjeta levantada
  const [verified, setVerified] = useStateG(false);
  const rootRef = useRefG(null);
  const cardRefs = useRefG([]);
  const dragInfo = useRefG(null);
  const vuelo = useRefG(null);

  function tap(i) {
    if (verified) return;
    if (sel === null) { setSel(i); return; }
    if (sel === i) { setSel(null); return; }
    setOrden((o) => { const n = o.slice(); const t = n[i]; n[i] = n[sel]; n[sel] = t; return n; });
    setSel(null);
  }

  // ⚠ Arrastre (pedido de la autora el 2026-11-17: *"aquí debo poder arrastrar para
  // colocar el orden correcto"*). Soltar una tarjeta sobre otra posición la **inserta**
  // ahí y corre las demás — que es como se ordena una línea del tiempo de verdad. El
  // toque-intercambio sigue funcionando como respaldo.
  // ⚠ ARRASTRE de la línea del tiempo. La autora lo pidió en dos pasos y el segundo
  // corrigió al primero:
  //   1. *"aquí debo poder arrastrar para colocar el orden correcto"*;
  //   2. *"quiero poder arrastrar la tarjeta, no como se baja de lugar sino arrastrar y
  //      luego yo colocarla"*.
  // Es decir: la tarjeta se **levanta y sigue al dedo**, las demás se **apartan** para
  // enseñar dónde va a caer, y solo al SOLTAR se reordena la lista. La versión que se
  // reordenaba en vivo mientras movías se sentía como que la tarjeta saltaba sola.
  //
  // ⚠ Las posiciones de referencia se CONGELAN al empezar el arrastre (`slots`): las
  // tarjetas se están apartando, así que medirlas en vivo daría un destino que baila.
  function destinoDe(y, slots) {
    let mejor = 0, d = Infinity;
    for (let i = 0; i < slots.length; i++) {
      const dist = Math.abs(y - slots[i]);
      if (dist < d) { d = dist; mejor = i; }
    }
    return mejor;
  }
  function onDown(e, i) {
    if (verified) return;
    // Si había una tarjeta aterrizando, se corta: el gesto del niño manda.
    if (vuelo.current) { vuelo.current.cortado = true; (vuelo.current.anims || []).forEach((a) => { try { a.cancel(); } catch (err) {} }); vuelo.current = null; }
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
    const S = rootRef.current ? (rootRef.current.getBoundingClientRect().width / 470) || 1 : 1;
    const slots = orden.map((_, k) => {
      const el = cardRefs.current[k];
      if (!el) return 0;
      const r = el.getBoundingClientRect();
      return r.top + r.height / 2;
    });
    const propio = cardRefs.current[i] ? cardRefs.current[i].getBoundingClientRect() : null;
    const alto = propio ? (propio.height / S) + 12 : 82;        // alto de la tarjeta + hueco
    dragInfo.current = { i, x0: e.clientX, y0: e.clientY, scale: S, slots, alto, movido: false };
    setDrag({ i, dy: 0, over: i, alto, slots, scale: S, movido: false });
  }
  function onMove(e) {
    const di = dragInfo.current; if (!di) return;
    const dy = e.clientY - di.y0;
    if (!di.movido && Math.hypot(e.clientX - di.x0, dy) <= 6) return;
    di.movido = true;
    setDrag({ i: di.i, dy: dy / di.scale, over: destinoDe(e.clientY, di.slots), alto: di.alto, slots: di.slots, scale: di.scale, movido: true });
  }
  function onUp(e) {
    const di = dragInfo.current; if (!di) return;
    dragInfo.current = null;
    if (verified) { setDrag(null); return; }
    if (!di.movido) { setDrag(null); tap(di.i); return; }       // respaldo: toque = intercambio
    const destino = destinoDe(e.clientY, di.slots);
    if (destino === di.i) { setDrag(null); return; }
    // Dónde está AHORA cada tarjeta (la arrastrada, siguiendo al dedo).
    const antes = {};
    orden.forEach((h, k) => { const el = cardRefs.current[k]; if (el) antes[h.id] = el.getBoundingClientRect().top; });
    const nuevoOrden = orden.slice();
    const [x] = nuevoOrden.splice(di.i, 1);
    nuevoOrden.splice(destino, 0, x);
    setSt({ orden: nuevoOrden, drag: null });
    setSel(null);
    aterrizarTodas(antes, nuevoOrden, di.scale || 1);
  }
  function endDrag() { dragInfo.current = null; setDrag(null); }
  // ⚠ NINGUNA tarjeta se desplaza mientras arrastras: solo se MARCA el puesto de destino.
  // Apartarlas en vivo obligaba a que el desplazamiento y el reordenado se cancelaran al
  // píxel, y como las tarjetas no miden todas igual, al soltar **la de arriba saltaba**.
  // Ahora, al soltar, TODAS viajan suavemente de su sitio viejo al nuevo
  // (`aterrizarTodas`), así que no hay ningún salto posible.
  function aterrizarTodas(antes, nuevo, S) {
    const v = { cortado: false, anims: [] };
    vuelo.current = v;
    requestAnimationFrame(() => {
      if (v.cortado) return;
      nuevo.forEach((h, k) => {
        const el = cardRefs.current[k];
        if (!el || !el.animate || antes[h.id] === undefined) return;
        // ⚠ Cancelar lo que quede vivo en esa tarjeta: dos animaciones de `transform`
        // sobre el mismo elemento se pisan y una de ellas la deja clavada en destino
        // (se veía como que esa tarjeta saltaba mientras las demás viajaban).
        if (el.getAnimations) el.getAnimations().forEach((an) => { try { an.cancel(); } catch (err) {} });
        const salto = (antes[h.id] - el.getBoundingClientRect().top) / S;
        if (Math.abs(salto) < 1) return;
        v.anims.push(el.animate(
          [{ transform: `translateY(${salto}px)` }, { transform: "translateY(0px)" }],
          { duration: 150, easing: "ease-out", fill: "backwards" }
        ));
      });
    });
  }

  function verificar() {
    if (verified) return;
    setSel(null);
    setVerified(true);
    const aciertos = orden.filter((h, i) => h.id === b.correcto[i].id).length;
    onSolve(aciertos === orden.length, {
      emoji: "🕰️", a: "Los primeros años de la República, en orden",
      userAnswer: orden.map((h) => h.t.slice(0, 34)).join(" · "),
      correctAnswer: b.correcto.map((h) => `${h.y} ${h.t.slice(0, 28)}`).join(" · "),
    }, aciertos);
  }
  verifyRef.current = verificar;

  function puestoDe(h) { return b.correcto.findIndex((x) => x.id === h.id) + 1; }

  return (
    <div ref={rootRef} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", height: "100%", width: "100%", paddingTop: 40 }}>
      <div style={{ pointerEvents: "none", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 20, color: "#fff" }}>Ordena los hechos del más antiguo al más reciente.</span>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0, width: "100%" }}>
        <div style={{ display: "flex", alignItems: "stretch", gap: 10, width: 452 }}>
          {/* La flecha del tiempo: deja claro hacia dónde va "más reciente". */}
          <div style={{ flexShrink: 0, width: 26, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 4, paddingBottom: 4 }}>
            <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 8.5, color: "rgba(255,255,255,0.75)", letterSpacing: "0.06em" }}>ANTES</span>
            <div style={{ flex: 1, width: 4, margin: "4px 0", borderRadius: 999, background: "linear-gradient(180deg, rgba(242,194,96,0.8), rgba(155,123,232,0.8))" }} />
            <div style={{ width: 0, height: 0, borderLeft: "7px solid transparent", borderRight: "7px solid transparent", borderTop: "9px solid rgba(155,123,232,0.9)" }} />
            <span style={{ marginTop: 2, fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 8.5, color: "rgba(255,255,255,0.75)", letterSpacing: "0.06em" }}>DESPUÉS</span>
          </div>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {orden.map((h, i) => {
              const ok = verified && h.id === b.correcto[i].id;
              const elegida = sel === i;
              const arrastrando = drag && drag.i === i;
              const destino = drag && drag.movido && drag.over === i && drag.i !== i && !verified;
              let border = "#d9c48a", bg = "linear-gradient(180deg,#fffdf6,#f6ecd2)", col = "#3a2608";
              if (!verified && elegida) { border = "#4fd8ff"; bg = "linear-gradient(180deg,#eaf9ff,#cdeeff)"; }
              if (!verified && (arrastrando || destino)) { border = "#4fd8ff"; bg = "linear-gradient(180deg,#eaf9ff,#cdeeff)"; }
              if (verified) {
                border = ok ? "#2ecc8f" : "#ff6b6b";
                bg = ok ? "linear-gradient(180deg,rgba(72,224,154,0.95),rgba(26,143,95,0.92))" : "linear-gradient(180deg,rgba(255,139,139,0.92),rgba(178,47,47,0.9))";
                col = ok ? "#06381f" : "#fff";
              }
              return (
                <button key={h.id} ref={(el) => { cardRefs.current[i] = el; }}
                  onPointerDown={(e) => onDown(e, i)} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={endDrag} disabled={verified}
                  style={{ position: "relative", width: "100%", minHeight: 70, touchAction: "none", boxSizing: "border-box", borderRadius: 12, border: `3px solid ${border}`, background: bg, color: col, display: "flex", alignItems: "center", gap: 9, padding: "6px 10px", textAlign: "left", cursor: verified ? "default" : "pointer", transform: arrastrando ? `translateY(${drag.dy}px) scale(1.03)` : ((elegida && !verified) ? "translateX(4px) scale(1.02)" : "none"), zIndex: arrastrando ? 60 : 1, boxShadow: ((elegida || arrastrando || destino) && !verified) ? "0 0 18px rgba(79,216,255,0.6), inset 0 1px 0 rgba(255,255,255,0.7)" : "inset 0 1px 0 rgba(255,255,255,0.7), 0 4px 10px rgba(0,0,0,0.28)", transition: arrastrando ? "none" : "transform 0.16s ease" }}>
                  <span style={{ flexShrink: 0, width: 21, height: 21, borderRadius: "50%", background: "rgba(0,0,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--ed-font-mono)", fontWeight: 700, fontSize: 11 }}>{i + 1}</span>
                  <span style={{ flexShrink: 0, fontSize: 17, lineHeight: 1 }}>{h.e}</span>
                  <span style={{ flex: 1, minWidth: 0, fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 11.5, lineHeight: 1.25 }}>{h.t}</span>
                  {/* Al verificar aparece el año y, si está mal, el puesto que le tocaba.
                      La columna NO se reordena: el niño tiene que poder ver su respuesta. */}
                  {verified && (
                    <span style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ flexShrink: 0, width: 18, height: 18, borderRadius: "50%", background: ok ? "#1f8a54" : "#c0392b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 11, boxShadow: "0 2px 5px rgba(0,0,0,0.35)" }}>{ok ? "✓" : "✗"}</span>
                        <span style={{ fontFamily: "var(--ed-font-mono)", fontWeight: 700, fontSize: 12.5 }}>{h.y}</span>
                      </span>
                      {!ok && <span style={{ whiteSpace: "nowrap", background: "linear-gradient(180deg,#ffe6a1,#f1c153)", border: "1.5px solid #e0a72c", borderRadius: 999, padding: "0 6px", fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 8.5, color: "#5a3d0a" }}>va {puestoDe(h)}º</span>}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Arreglo de rondas del LIBRO 6 · TEMA 1 (3 verbos: decidir · arrastrar · ordenar) ──
const L6T1_ROUNDS = [
  { C: L6T1R1Sello, verify: true, bubble: (<>Lee la ficha<br />y elige sí o no.</>) },
  { C: L6T1R2Piramide, verify: true, bubble: (<>Arrastra cada grupo<br />a su escalón.</>) },
  { C: L6T1R3Linea, verify: true, bubble: (<>Arrastra cada tarjeta<br />hasta su lugar.</>) },
];

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║ LIBRO 6 · TEMA 2 · "Revolución Marcista"                                   ║
// ║ Edad objetivo: 10 años (la fija la autora).                                ║
// ║                                                                            ║
// ║ 3 rondas, 3 verbos que NO existen en el Tema 1 (allí se gastaron decidir    ║
// ║ sí/no, arrastrar a su sitio y ordenar):                                     ║
// ║   R1 "La bandera de marzo"      — COMPONER: el símbolo se dibuja al tocar   ║
// ║   R2 "El Ecuador partido"       — TOCAR EN EL MAPA                          ║
// ║   R3 "La Carta de la Esclavitud" — RASGAR: se rompe pasando el dedo         ║
// ║                                                                            ║
// ║ ⭐ 4 + 4 + 3 = **11 máximo**.                                               ║
// ║                                                                            ║
// ║ ⚠ Todo el contenido sale del tema del libro (ver §3.1 del design-doc). La   ║
// ║ autora aprobó uno por uno los renglones de la R3, redactados con hechos     ║
// ║ que el libro sí afirma, porque no dio el articulado de la Carta.            ║
// ╚════════════════════════════════════════════════════════════════════════════╝

const CAT_LABEL_T2 = "La Revolución Marcista";

// ── R1 · "La bandera de marzo" ──────────────────────────────────────────────
// VERBO: componer. Se toca un color y entra solo en el siguiente cuartel vacío
// (izquierda → centro → derecha): no se "coloca" nada, se va pintando, y la bandera
// crece a la vista. Las estrellas se ponen con un contador, que es otro gesto.
// La bandera marcista del libro: tres cuarteles, dos blancos y uno AZUL al centro,
// con TRES estrellas (Quito, Guayaquil, Cuenca).
const J12_BAN_COLORES = [
  { id: "bla", t: "blanco", c: "#fdfaf0" },
  { id: "azu", t: "azul", c: "#1f4fa8" },
  { id: "roj", t: "rojo", c: "#c0392b" },
  { id: "ama", t: "amarillo", c: "#f1c40f" },
  { id: "ver", t: "verde", c: "#1f8a54" },
];
const J12_BAN_OK = ["bla", "azu", "bla"];
const J12_BAN_ESTRELLAS = 3;

function j12Estrella(cx, cy, r, key) {
  let p = "";
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.46;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    p += (i ? "L" : "M") + (cx + rad * Math.cos(a)).toFixed(1) + "," + (cy + rad * Math.sin(a)).toFixed(1);
  }
  return <path key={key} d={p + "Z"} fill="#fdfaf0" stroke="#c9a227" strokeWidth="0.8" />;
}

// Dibuja la bandera: `cuarteles` es un arreglo de 3 ids de color (o null) y `estrellas`
// cuántas van en el cuartel del centro. Sirve tanto para la que arma el niño como para
// el cartel del revelado.
function J12Bandera({ cuarteles, estrellas, ancho, alto }) {
  const w = ancho, h = alto, cw = w / 3;
  const col = (i) => { const c = J12_BAN_COLORES.find((x) => x.id === cuarteles[i]); return c ? c.c : "rgba(255,255,255,0.07)"; };
  const sep = h * 0.1;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ borderRadius: 6, boxShadow: "0 6px 16px rgba(0,0,0,0.4)" }}>
      <rect x="0" y="0" width={w} height={h} fill="rgba(0,0,0,0.3)" />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={i * cw} y="0" width={cw} height={h} fill={col(i)} style={{ transition: "fill 0.25s" }} />
      ))}
      {Array.from({ length: estrellas }).map((_, i) => {
        const n = estrellas, paso = cw / (n + 1);
        return j12Estrella(cw + paso * (i + 1), h / 2, Math.min(h * 0.17, paso * 0.52), i);
      })}
      {[1, 2].map((i) => <line key={i} x1={i * cw} y1="0" x2={i * cw} y2={h} stroke="rgba(0,0,0,0.18)" strokeWidth="1" />)}
      <rect x="0.75" y="0.75" width={w - 1.5} height={h - 1.5} fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="1.5" rx="4" />
      <rect x="0" y={h - sep} width={w} height="0" fill="none" />
    </svg>
  );
}

function L6T2R1Bandera({ onSolve, verifyRef }) {
  // Varía el ORDEN de la paleta en cada partida (la bandera, en cambio, es una sola:
  // es un símbolo histórico, no hay nada que sortear). Ver "variedad" en el design-doc.
  const [paleta] = useStateG(() => j12Shuffle(J12_BAN_COLORES));
  const [cuarteles, setCuarteles] = useStateG([null, null, null]);
  const [estrellas, setEstrellas] = useStateG(0);
  const [verified, setVerified] = useStateG(false);
  const completa = cuarteles.every((c) => c !== null);

  function pintar(id) {
    if (verified) return;
    const i = cuarteles.indexOf(null);
    if (i === -1) return;
    setCuarteles((cs) => { const n = cs.slice(); n[i] = id; return n; });
  }
  function borrar(i) {
    if (verified || cuarteles[i] === null) return;
    // Al quitar un cuartel, los de su derecha se corren para que el siguiente toque
    // entre siempre en el primer hueco: así nunca quedan huecos salteados.
    setCuarteles((cs) => { const n = cs.filter((_, k) => k !== i); n.push(null); return n; });
  }

  function verificar() {
    if (verified || !completa) return;
    setVerified(true);
    const bien = cuarteles.filter((c, i) => c === J12_BAN_OK[i]).length;
    const estrOk = estrellas === J12_BAN_ESTRELLAS;
    const ganadas = bien + (estrOk ? 1 : 0);
    const nombre = (id) => { const c = J12_BAN_COLORES.find((x) => x.id === id); return c ? c.t : "—"; };
    onSolve(bien === 3 && estrOk, {
      emoji: "🏴", a: "La bandera de la Revolución Marcista",
      userAnswer: cuarteles.map(nombre).join(" · ") + " · " + estrellas + (estrellas === 1 ? " estrella" : " estrellas"),
      correctAnswer: J12_BAN_OK.map(nombre).join(" · ") + " · 3 estrellas",
    }, ganadas);
  }
  verifyRef.current = verificar;

  const estrOk = estrellas === J12_BAN_ESTRELLAS;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", height: "100%", width: "100%", paddingTop: 40 }}>
      <div style={{ pointerEvents: "none", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 20, color: "#fff" }}>Arma la bandera de la Revolución Marcista.</span>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 11, minHeight: 0, width: "100%" }}>
        {/* ⚠ CÓMO ERA LA BANDERA, SIEMPRE A LA VISTA. La primera versión solo decía
            "Levanta la bandera del 6 de marzo" y no explicaba en ninguna parte cómo era:
            había que saberlo de memoria. La autora lo probó y no entendió qué hacer. La
            ronda se resuelve LEYENDO esto y aplicándolo, igual que el panel del Art. 12
            del Tema 1. Las estrellas no se dicen: se CUENTAN de la lista de ciudades. */}
        <div style={{ width: 452, boxSizing: "border-box", borderRadius: 12, border: "2.5px solid rgba(242,194,96,0.6)", background: "rgba(0,0,0,0.34)", padding: "5px 12px 7px", flexShrink: 0 }}>
          <div className="ed-label" style={{ color: "#fce9a8", fontSize: 9.5, textAlign: "center", marginBottom: 4 }}>Así era la bandera</div>
          <div style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 11, lineHeight: 1.3, color: "#fff", textAlign: "center" }}>
            Tres cuarteles: <b style={{ color: "#fdfaf0" }}>blancos los de los lados</b> y <b style={{ color: "#9fc4ff" }}>azul el del centro</b>.<br />
            En el del centro, <b>una estrella por cada ciudad que se levantó</b>:
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "center", marginTop: 4 }}>
            {["Quito", "Guayaquil", "Cuenca"].map((x) => (
              <span key={x} style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 9.5, color: "#fff", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 999, padding: "2px 9px" }}>{x}</span>
            ))}
          </div>
        </div>

        {/* El asta y la bandera */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 7, flexShrink: 0 }}>
          <div style={{ width: 7, height: 128, borderRadius: 4, background: "linear-gradient(180deg,#a9793a,#6b4a1e)", boxShadow: "0 4px 10px rgba(0,0,0,0.4)" }} />
          <div style={{ position: "relative" }}>
            <J12Bandera cuarteles={cuarteles} estrellas={estrellas} ancho={222} alto={128} />
            {/* Con la bandera en blanco no se ve que los cuarteles son tocables: el aviso
                dice dónde empieza todo y se va en cuanto entra el primer color. */}
            {cuarteles.every((c) => c === null) && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 12, color: "rgba(255,255,255,0.75)", textShadow: "0 2px 6px rgba(0,0,0,0.7)" }}>toca un color de abajo</span>
              </div>
            )}
            {/* Los tres cuarteles son tocables para vaciarlos (no hay "deshacer" escondido). */}
            {!verified && (
              <div style={{ position: "absolute", inset: 0, display: "flex" }}>
                {[0, 1, 2].map((i) => (
                  <button key={i} className="ed-btn-plain" onClick={() => borrar(i)} aria-label={`Vaciar cuartel ${i + 1}`}
                    style={{ flex: 1, background: "transparent", border: "none", cursor: cuarteles[i] ? "pointer" : "default", padding: 0 }} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Paleta de colores */}
        <div style={{ display: "flex", gap: 7, flexShrink: 0 }}>
          {paleta.map((c) => (
            <button key={c.id} onClick={() => pintar(c.id)} disabled={verified || completa}
              style={{ width: 62, height: 38, borderRadius: 9, border: "2.5px solid rgba(255,255,255,0.4)", background: c.c, cursor: verified || completa ? "default" : "pointer", opacity: verified || completa ? 0.45 : 1, boxShadow: "0 3px 8px rgba(0,0,0,0.35)", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 2 }}>
              <span style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 800, fontSize: 8.5, color: c.id === "bla" || c.id === "ama" ? "#3a2608" : "#fff", textShadow: c.id === "bla" || c.id === "ama" ? "none" : "0 1px 2px rgba(0,0,0,0.6)" }}>{c.t}</span>
            </button>
          ))}
          {/* ⚠ BORRAR a la vista. Tocar un cuartel ya lo vaciaba, pero eso no se ve por
              ningún lado: con la bandera llena la paleta se apaga y la autora se quedó
              sin manera visible de rectificar. Deja la bandera COMO AL EMPEZAR: vacía los
              tres cuarteles Y pone las estrellas a cero (lo pidió la autora; borrar a
              medias se siente roto). */}
          <button onClick={() => { if (!verified) { setCuarteles([null, null, null]); setEstrellas(0); } }} disabled={verified || (cuarteles.every((c) => c === null) && estrellas === 0)}
            style={{ width: 62, height: 38, borderRadius: 9, border: "2.5px dashed rgba(255,255,255,0.45)", background: "rgba(0,0,0,0.3)", cursor: verified || (cuarteles.every((c) => c === null) && estrellas === 0) ? "default" : "pointer", opacity: verified || (cuarteles.every((c) => c === null) && estrellas === 0) ? 0.35 : 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1 }}>
            <span style={{ fontSize: 13, lineHeight: 1 }}>🧽</span>
            <span style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 800, fontSize: 8.5, color: "#fff" }}>borrar</span>
          </button>
        </div>

        {/* Contador de estrellas: otro gesto distinto, y se dibujan en vivo */}
        <div style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0, borderRadius: 11, border: `2.5px solid ${verified ? (estrOk ? "#2ecc8f" : "#ff6b6b") : "rgba(242,194,96,0.55)"}`, background: "rgba(0,0,0,0.34)", padding: "4px 11px" }}>
          <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 11.5, color: "#fce9a8" }}>Estrellas del centro</span>
          <button onClick={() => !verified && setEstrellas((n) => Math.max(0, n - 1))} disabled={verified || estrellas === 0}
            style={{ width: 28, height: 28, borderRadius: 8, border: "2px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.12)", color: "#fff", fontFamily: "var(--ed-font-display)", fontWeight: 900, fontSize: 15, cursor: verified || estrellas === 0 ? "default" : "pointer", opacity: verified || estrellas === 0 ? 0.4 : 1 }}>−</button>
          <span style={{ minWidth: 20, textAlign: "center", fontFamily: "var(--ed-font-display)", fontWeight: 900, fontSize: 18, color: "#fff" }}>{estrellas}</span>
          <button onClick={() => !verified && setEstrellas((n) => Math.min(5, n + 1))} disabled={verified || estrellas === 5}
            style={{ width: 28, height: 28, borderRadius: 8, border: "2px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.12)", color: "#fff", fontFamily: "var(--ed-font-display)", fontWeight: 900, fontSize: 15, cursor: verified || estrellas === 5 ? "default" : "pointer", opacity: verified || estrellas === 5 ? 0.4 : 1 }}>+</button>
        </div>

        {/* Revelado: la bandera correcta al lado, en su propio cartel (NUNCA colgando de
            la que armó el niño: eso tapaba lo que eligió). */}
        {verified && (
          <div style={{ display: "flex", alignItems: "center", gap: 11, flexShrink: 0, borderRadius: 12, border: "2.5px solid #f2c260", background: "rgba(0,0,0,0.5)", padding: "6px 12px" }}>
            <div className="ed-label" style={{ color: "#fce9a8", fontSize: 9 }}>IBA<br />ASÍ</div>
            <J12Bandera cuarteles={J12_BAN_OK} estrellas={J12_BAN_ESTRELLAS} ancho={78} alto={45} />
            <div style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 9.5, lineHeight: 1.25, color: "#fce9a8", maxWidth: 232 }}>Dos cuarteles blancos y uno azul al centro, con tres estrellas: Quito, Guayaquil y Cuenca.</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── R2 · "El Ecuador partido" ───────────────────────────────────────────────
// VERBO: tocar en el mapa. Crisis de 1859: cuatro gobiernos a la vez. Se pide un
// gobernante y el niño toca la ciudad donde manda; al tocar, la ciudad se queda con su
// rótulo y pasa el siguiente. Cuatro colocados → ¡VERIFICAR!
//
// ⚠ MAPA DE DATOS REALES: contorno del Ecuador continental de Natural Earth
// (ne_10m_admin_0_countries, dominio público), proyección plate carrée —sobre la línea
// equinoccial la deformación es despreciable— y simplificado con Douglas-Peucker
// (tolerancia 0.008°, 335 puntos). Las cuatro ciudades van en sus coordenadas reales.
// NUNCA dibujar un mapa a ojo ni generarlo como imagen: no sería tocable por lugar.
// Galápagos queda fuera del encuadre (el tema es la crisis continental de 1859).
const J12_ECU_W = 288, J12_ECU_H = 320.9;
const J12_ECU_D = "M108.7,0.0L111.7,2.0L116.9,8.3L120.0,8.5L121.6,11.9L123.1,11.4L125.8,12.0L132.6,18.8L137.5,20.6L144.0,25.5L146.1,26.6L149.6,26.7L154.0,27.9L154.8,30.0L157.5,31.1L164.8,29.4L166.2,30.6L166.6,34.2L167.6,35.7L172.7,38.7L176.5,39.0L178.1,49.8L180.0,52.1L189.5,54.8L193.9,53.6L195.6,54.0L197.5,56.2L202.5,57.1L205.6,59.4L209.8,59.0L213.0,59.8L212.9,57.8L213.5,57.6L218.3,58.5L221.4,60.6L229.2,58.7L228.8,51.4L231.3,51.1L234.6,48.4L238.4,51.1L242.8,51.6L243.6,53.9L246.9,53.3L250.9,58.9L251.9,61.2L258.6,66.4L261.8,67.8L268.1,67.5L276.2,73.4L285.2,76.7L282.8,78.6L279.3,78.7L277.9,79.5L272.5,77.4L268.3,76.7L267.3,77.8L268.5,80.4L270.5,80.5L275.2,83.7L276.8,89.3L279.1,93.4L280.6,94.6L282.0,94.8L286.3,98.4L286.6,102.5L284.7,104.6L284.5,108.6L286.8,117.9L288.0,119.7L282.0,119.9L279.1,116.9L270.8,147.9L245.0,177.4L215.5,199.5L156.6,220.2L152.9,223.4L147.9,230.2L144.8,232.9L142.6,236.8L140.2,238.8L140.2,239.9L142.2,242.1L141.8,244.5L138.7,246.0L137.2,241.1L134.4,240.0L132.5,240.1L132.0,241.1L131.9,245.1L130.0,250.3L130.0,254.6L128.8,255.0L129.1,260.1L126.1,263.0L125.2,268.0L122.0,269.5L121.3,275.5L117.3,285.0L116.0,286.8L116.5,290.5L118.3,292.2L116.6,295.1L116.5,297.9L114.2,300.0L107.5,303.0L105.2,305.1L103.8,307.7L105.2,312.5L104.6,313.5L101.2,314.0L99.7,318.3L97.0,320.9L95.0,319.3L85.1,318.4L83.2,315.5L81.4,314.6L80.5,312.7L77.8,310.8L75.4,303.4L73.9,301.3L75.1,298.2L75.0,297.0L72.4,296.2L67.5,292.3L60.6,294.6L58.7,294.3L55.2,290.4L51.3,289.9L46.5,285.9L43.4,284.6L40.2,285.3L37.7,289.8L31.4,294.2L30.1,294.3L27.0,292.7L25.9,291.1L33.2,280.4L27.0,281.1L26.0,278.9L26.2,277.0L24.8,274.7L25.9,271.2L27.2,269.9L29.1,269.6L34.2,271.3L35.3,270.8L37.5,267.7L42.2,265.0L41.0,263.4L40.8,261.6L39.2,258.0L39.7,252.2L39.2,250.2L38.0,249.5L38.5,246.3L36.9,244.9L37.2,242.0L33.5,240.3L33.4,239.1L35.1,236.7L34.5,238.4L34.8,239.4L36.2,236.7L37.5,238.1L43.7,237.0L47.4,230.9L48.6,231.1L48.4,234.7L52.8,230.6L53.7,226.5L56.7,221.0L56.3,219.0L58.7,211.1L61.6,203.8L64.0,200.5L63.1,195.4L60.9,194.9L58.4,189.7L58.4,181.4L57.0,179.0L57.7,176.9L57.3,176.3L59.5,174.9L60.1,173.2L61.7,172.3L62.1,171.2L58.8,173.1L58.7,174.4L56.7,174.7L55.8,176.7L55.3,180.2L57.2,185.7L56.5,195.4L55.6,198.0L53.7,199.8L50.5,201.2L49.7,200.3L47.3,199.7L47.0,198.9L49.1,197.1L50.3,194.9L51.7,194.7L53.2,195.8L53.9,195.1L53.6,194.0L53.4,195.0L51.5,193.7L48.7,194.5L48.6,192.8L50.0,188.8L51.5,188.2L52.9,186.2L51.3,187.2L49.8,187.2L48.8,188.2L46.6,193.7L41.7,200.2L40.1,200.9L38.9,202.2L37.0,201.1L36.5,201.4L36.5,203.3L38.2,205.2L37.7,207.3L34.5,206.3L30.7,203.3L27.1,201.7L17.7,191.6L10.4,189.6L7.4,187.3L4.9,186.8L3.9,183.9L0.5,180.6L0.0,179.3L3.2,180.2L4.1,181.8L7.1,181.1L11.6,178.1L13.3,176.1L13.7,173.1L12.5,169.7L13.9,168.7L14.1,167.4L12.6,160.9L7.8,150.5L9.8,148.7L9.6,146.1L10.6,145.1L12.1,145.0L12.4,140.6L13.5,139.5L13.4,138.3L8.9,132.7L6.5,128.4L4.8,124.4L5.1,123.4L9.8,118.5L11.2,118.7L14.5,117.7L14.4,118.2L16.0,118.7L17.9,117.3L18.4,118.0L19.7,118.3L22.1,116.8L23.2,115.6L25.7,105.9L28.1,101.6L29.4,101.2L30.2,103.6L31.6,104.1L35.5,104.4L35.5,103.8L30.9,102.5L29.7,100.0L28.7,99.1L27.9,95.1L25.7,90.4L28.9,88.3L31.9,82.5L33.0,82.1L34.3,80.0L35.2,80.8L38.9,78.4L45.1,71.0L45.5,69.4L47.1,68.8L47.9,66.9L48.6,62.6L48.0,55.6L48.6,53.6L50.2,55.2L50.9,53.2L48.3,48.6L48.3,46.4L49.6,43.6L48.6,40.3L45.9,38.9L45.0,36.8L45.0,34.7L46.7,30.8L48.1,29.6L51.4,30.0L53.1,28.8L57.3,27.8L60.7,25.5L62.1,23.9L67.6,21.4L67.8,22.4L66.8,25.5L69.6,29.3L67.9,26.2L68.7,22.3L69.6,21.8L71.7,22.4L78.5,17.7L82.1,18.0L86.7,17.0L87.8,17.6L92.0,16.7L97.4,10.8L99.6,12.0L100.6,15.7L102.1,14.4L102.5,11.3L103.7,9.5L104.2,10.1L105.1,9.9L106.6,7.2L109.5,7.8L109.2,7.1L106.4,6.4L106.1,5.7L108.5,2.6L108.7,0.0Z";
const J12_GOBIERNOS = [
  { id: "qui", ciudad: "Quito", jefe: "García Moreno", x: 126.7, y: 80.4 },
  { id: "gye", ciudad: "Guayaquil", jefe: "Guillermo Franco", x: 54.3, y: 179.5 },
  { id: "cue", ciudad: "Cuenca", jefe: "Jerónimo Carrión", x: 99.9, y: 215.8 },
  { id: "loj", ciudad: "Loja", jefe: "Manuel Carrión Pinzano", x: 90.0, y: 270.2 },
];
const J12_ZONA_COL = { qui: "#f1c40f", gye: "#4fd8ff", cue: "#b388ff", loj: "#ff9a6b" };

function L6T2R2Mapa({ onSolve, verifyRef }) {
  // ⚠ Se piden DOS gobernantes, no los cuatro: con cuatro la ronda se hacía larga y
  // repetitiva (lo pidió la autora jugando). El mapa sigue enseñando las cuatro ciudades,
  // que es lo que cuenta la historia; lo que se juega son dos.
  // Cuáles dos varía por partida. ⚠ Cap 1, nunca 2: para un SUBCONJUNTO de K, cap = K
  // parte el banco en parejas fijas que se alternan igual en cada recarga.
  const [b] = useStateG(() => {
    const idx = j12PickIdx(J12_GOBIERNOS, 2, "edinun_j12_l6t2_r2_v1");
    j12Commit("edinun_j12_l6t2_r2_v1", idx, 1);
    return { orden: j12Shuffle(idx.map((i) => J12_GOBIERNOS[i].id)) };
  });
  const orden = b.orden;
  // ⚠ SE VERIFICA UNO A UNO, no los dos al final: colocas el primero, pulsas ¡VERIFICAR!,
  // ves si acertaste, y recién entonces viene el segundo. Lo pidió así la autora.
  // `pasos` guarda lo ya verificado; `sel` es la ciudad elegida que aún no se ha validado.
  const [pasos, setPasos] = useStateG([]);     // [{ pide, ciudad }]
  const [sel, setSel] = useStateG(null);
  // ⚠ El mapa queda LIMPIO para el turno siguiente: solo se ve la marca del ÚLTIMO
  // verificado, y ninguna ciudad se bloquea. Antes la ciudad usada se quedaba marcada y
  // no se podía volver a elegir, aunque fuese la correcta para el segundo gobernante.
  const [ultimo, setUltimo] = useStateG(null);   // { pide, ciudad }
  const idx = pasos.length;
  const pendiente = orden[idx];
  const pedido = J12_GOBIERNOS.find((g) => g.id === pendiente);
  const terminado = idx >= orden.length;
  // Al terminar se enseñan las dos marcas; durante la ronda, solo la del turno anterior.
  const marcas = terminado ? pasos : (ultimo ? [ultimo] : []);

  function tocar(ciudadId) {
    if (terminado) return;
    setUltimo(null);                            // al elegir, el mapa se limpia
    setSel(ciudadId);                           // se puede cambiar de idea antes de verificar
  }
  function verificar() {
    if (terminado || sel === null) return;
    const nuevo = pasos.concat([{ pide: pendiente, ciudad: sel }]);
    setPasos(nuevo); setSel(null); setUltimo({ pide: pendiente, ciudad: sel });
    if (nuevo.length < orden.length) return;    // quedan gobernantes: sigue la ronda
    const aciertos = nuevo.filter((p) => p.pide === p.ciudad).length;
    const nombre = (id) => (J12_GOBIERNOS.find((g) => g.id === id) || {}).jefe;
    const ciudad = (id) => (J12_GOBIERNOS.find((g) => g.id === id) || {}).ciudad;
    onSolve(aciertos === orden.length, {
      emoji: "🗺️", a: "1859: el país con cuatro gobiernos",
      userAnswer: nuevo.map((p) => `${nombre(p.pide)} en ${ciudad(p.ciudad)}`).join(" · "),
      correctAnswer: orden.map((id) => `${nombre(id)} en ${ciudad(id)}`).join(" · "),
    }, aciertos);
  }
  verifyRef.current = verificar;

  const ESC = 0.78;
  const MW = J12_ECU_W * ESC, MH = J12_ECU_H * ESC;
  const nombreDe = (id) => (J12_GOBIERNOS.find((g) => g.id === id) || {}).jefe;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", height: "100%", width: "100%", paddingTop: 40 }}>
      <div style={{ pointerEvents: "none", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 20, color: "#fff" }}>En 1859 el país tuvo cuatro gobiernos a la vez.</span>
      </div>
      {/* ⚠ El pedido va en una BANDA sobre el mapa, centrada, como la consigna de la R3.
          Antes iba en una columna a la izquierda y dejaba un hueco grande y feo entre el
          cartel y el mapa. */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", gap: 8, minHeight: 0, width: "100%", paddingTop: 8 }}>
        <div style={{ width: 452, boxSizing: "border-box", borderRadius: 12, border: `2.5px solid ${terminado ? "#f2c260" : "#4fd8ff"}`, background: "rgba(0,0,0,0.45)", padding: "6px 12px", flexShrink: 0, minHeight: 44, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          {!terminado && (<>
            <span className="ed-label" style={{ color: "#9fe9ff", fontSize: 8.5 }}>¿Dónde manda? · {idx + 1} de {orden.length}</span>
            <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 14, lineHeight: 1.15, color: "#fff" }}>{pedido.jefe}</span>
            <span style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 9.5, color: sel ? "#fce9a8" : "rgba(255,255,255,0.65)", marginTop: 1 }}>
              {sel ? `Elegiste ${(J12_GOBIERNOS.find((g) => g.id === sel) || {}).ciudad}. Pulsa ¡VERIFICAR!` : "Toca su ciudad en el mapa."}
            </span>
          </>)}
          {terminado && (
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
              {pasos.map((p) => {
                const ok = p.pide === p.ciudad;
                const ciudadOk = (J12_GOBIERNOS.find((g) => g.id === p.pide) || {}).ciudad;
                return (
                  <div key={p.pide} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ flexShrink: 0, width: 15, height: 15, borderRadius: "50%", background: ok ? "#1f8a54" : "#c0392b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 10 }}>{ok ? "✓" : "✗"}</span>
                    <span style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 10, lineHeight: 1.2, color: "#fce9a8" }}>{nombreDe(p.pide)} mandaba en <b>{ciudadOk}</b></span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* El mapa */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <svg width={MW} height={MH} viewBox={`0 0 ${J12_ECU_W} ${J12_ECU_H}`} style={{ overflow: "visible" }}>
            <path d={J12_ECU_D} fill="rgba(255,253,246,0.1)" stroke="rgba(242,194,96,0.75)" strokeWidth="2" strokeLinejoin="round" />
            {/* La mancha de cada gobierno colocado. Es una zona de influencia alrededor de
                su ciudad, NO una frontera: el libro no da límites y no se inventan. */}
            {J12_GOBIERNOS.map((g) => {
              const p = marcas.find((x) => x.ciudad === g.id);
              const marca = p ? p.pide : (sel === g.id ? pendiente : null);
              if (!marca) return null;
              return <circle key={"z" + g.id} cx={g.x} cy={g.y} r="46" fill={J12_ZONA_COL[marca]} opacity={p && p.pide !== g.id ? 0.1 : 0.19} style={{ pointerEvents: "none" }} />;
            })}
            {J12_GOBIERNOS.map((g) => {
              const p = marcas.find((x) => x.ciudad === g.id);
              const elegida = sel === g.id;
              // Verde/rojo SOLO en las ciudades ya verificadas; la elegida va en celeste
              // mientras no se verifique, y las que no se juegan se quedan en blanco.
              let col = "#fdfaf0";
              if (p) col = p.pide === g.id ? "#2ecc8f" : "#ff6b6b";
              else if (elegida) col = "#4fd8ff";
              const jefe = p ? nombreDe(p.pide) : (elegida ? pedido.jefe : null);
              return (
                <g key={g.id} onClick={() => tocar(g.id)} style={{ cursor: terminado ? "default" : "pointer" }}>
                  <circle cx={g.x} cy={g.y} r="19" fill="transparent" />
                  {elegida && <circle cx={g.x} cy={g.y} r="12" fill="none" stroke="#4fd8ff" strokeWidth="2.5" />}
                  <circle cx={g.x} cy={g.y} r="7.5" fill={col} stroke="rgba(0,0,0,0.45)" strokeWidth="1.5" />
                  <text x={g.x + 12} y={g.y + 4} fontFamily="var(--ed-font-display)" fontWeight="800" fontSize="13" fill="#fff" stroke="rgba(0,0,0,0.65)" strokeWidth="2.8" paintOrder="stroke">{g.ciudad}</text>
                  {jefe && <text x={g.x + 12} y={g.y + 17} fontFamily="var(--ed-font-ui)" fontWeight="700" fontSize="10.5" fill={p ? (p.pide === g.id ? "#8cf0c0" : "#ffb3b3") : "#9fe9ff"} stroke="rgba(0,0,0,0.65)" strokeWidth="2.4" paintOrder="stroke">{jefe}</text>}
                  {p && <text x={g.x - 16} y={g.y + 5} fontFamily="var(--ed-font-display)" fontWeight="900" fontSize="13" textAnchor="middle" fill={p.pide === g.id ? "#8cf0c0" : "#ffb3b3"} stroke="rgba(0,0,0,0.7)" strokeWidth="2.6" paintOrder="stroke">{p.pide === g.id ? "✓" : "✗"}</text>}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}

// ── R3 · "La Carta de la Esclavitud" ────────────────────────────────────────
// VERBO: rasgar. Se pasa el dedo (o el ratón) por encima de un renglón y el papel se
// corta: el trozo se despega y cae. Lo que se piensa es CUÁL romper, y para saberlo hay
// que leer: la ronda se resuelve con lo que está en pantalla, no de memoria.
//
// ⚠ Los cuatro renglones los aprobó la autora uno por uno. El libro dice que la Carta
// de la Esclavitud cae, pero no da su articulado: están redactados SOLO con hechos que
// el libro sí afirma. No añadir renglones sin pasar por ella.
// El renglón de los esclavos NO se pide nunca: sobrevive al papel roto, y así se ve que
// la revolución no lo arregló todo de golpe (la manumisión llega en 1851, con Urbina).
const J12_CARTA = [
  { id: "flores", t: "El general Juan José Flores gobierna el Ecuador.", pide: "Rompe al hombre contra el que se levantó Guayaquil." },
  { id: "pesos", t: "Cada hombre paga tres pesos al año.", pide: "Rompe el impuesto que hizo estallar el 6 de marzo." },
  { id: "iglesia", t: "La Iglesia queda apartada de los asuntos del país.", pide: "La Iglesia vuelve al país: rompe lo que la tenía fuera." },
  { id: "esclavos", t: "Los esclavos siguen sin libertad.", pide: null },
];
const J12_CARTA_PIDEN = J12_CARTA.filter((r) => r.pide).map((r) => r.id);

function L6T2R3Carta({ onSolve, verifyRef }) {
  // Varía el orden de los renglones en el papel (4! = 24) y el orden de las tres
  // consignas (3! = 6). El renglón que sobrevive es siempre el mismo a propósito.
  const [b] = useStateG(() => ({
    renglones: j12Shuffle(J12_CARTA),
    consignas: j12Shuffle(J12_CARTA_PIDEN),
  }));
  // `pasos` guarda, por turno, qué se pidió y qué rompió el niño.
  // ⚠ No basta con ir consigna por consigna en orden fijo: si rompe por error el renglón
  // que una consigna POSTERIOR iba a pedir, esa consigna se queda sin solución posible y
  // la ronda se atasca. Por eso cada turno se pide un renglón que SIGA entero; si ya no
  // queda ninguno de los tres, la ronda termina ahí.
  const [pasos, setPasos] = useStateG([]);            // [{ pide, roto }]
  const [corte, setCorte] = useStateG(null);          // { id, avance 0..1 }
  const [verified, setVerified] = useStateG(false);
  const refs = useRefG({});
  const rotos = pasos.map((x) => x.roto);
  const pedidas = pasos.map((x) => x.pide);
  const consigna = b.consignas.find((id) => pedidas.indexOf(id) === -1 && rotos.indexOf(id) === -1);
  const terminado = !consigna;
  const paso = pasos.length;

  function rasgar(id) {
    if (verified || terminado || rotos.indexOf(id) >= 0) return;
    setCorte(null);
    setPasos((p) => p.concat([{ pide: consigna, roto: id }]));
  }

  // El corte avanza con el gesto: se mide cuánto ha recorrido el puntero a lo ancho del
  // renglón desde que lo tocó. Al pasar del 72 % el renglón se rompe.
  function onDown(e, id) {
    if (verified || terminado || rotos.indexOf(id) >= 0) return;
    const el = refs.current[id];
    if (!el) return;
    try { el.setPointerCapture(e.pointerId); } catch (x) {}
    const r = el.getBoundingClientRect();
    setCorte({ id, x0: e.clientX, avance: 0, ancho: r.width });
  }
  function onMove(e, id) {
    if (!corte || corte.id !== id) return;
    const a = Math.min(1, Math.abs(e.clientX - corte.x0) / Math.max(1, corte.ancho * 0.72));
    if (a >= 1) { rasgar(id); return; }
    setCorte((c) => (c && c.id === id ? Object.assign({}, c, { avance: a }) : c));
  }
  function onUp(e, id) {
    if (!corte || corte.id !== id) return;
    setCorte(null);
  }

  function verificar() {
    if (verified || !terminado) return;
    setVerified(true);
    const aciertos = pasos.filter((x) => x.pide === x.roto).length;
    const texto = (id) => (J12_CARTA.find((r) => r.id === id) || {}).t;
    onSolve(aciertos === b.consignas.length, {
      emoji: "📜", a: "Lo que cayó con la Revolución Marcista",
      userAnswer: rotos.map(texto).join(" · "),
      correctAnswer: b.consignas.map(texto).join(" · "),
    }, aciertos);
  }
  verifyRef.current = verificar;

  // ¿Qué debía romperse en el turno i? Para el revelado.
  const debia = {};
  b.consignas.forEach((id, i) => { debia[id] = i; });

  function renglon(r, i) {
    const roto = rotos.indexOf(r.id) >= 0;
    const turno = rotos.indexOf(r.id);
    const acerto = roto && pasos[turno] && pasos[turno].pide === r.id;
    const cortando = corte && corte.id === r.id ? corte.avance : 0;
    // Tras verificar: verde el que tocaba y se rompió, rojo el que se rompió de más,
    // y marcado en ámbar el que había que romper y sigue entero.
    let bd = "rgba(120,94,48,0.5)", bg = "rgba(255,253,246,0.93)";
    if (roto) { bd = "transparent"; }
    if (verified && roto) { bd = acerto ? "#2ecc8f" : "#ff6b6b"; }
    if (verified && !roto && debia[r.id] !== undefined) { bd = "#f2c260"; bg = "rgba(255,230,161,0.95)"; }
    return (
      <div key={r.id} style={{ position: "relative", height: 46, flexShrink: 0 }}>
        <div
          ref={(el) => { refs.current[r.id] = el; }}
          onPointerDown={(e) => onDown(e, r.id)}
          onPointerMove={(e) => onMove(e, r.id)}
          onPointerUp={(e) => onUp(e, r.id)}
          onPointerCancel={(e) => onUp(e, r.id)}
          style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 7,
            borderRadius: 7, border: `2px solid ${bd}`, background: roto ? "transparent" : bg,
            padding: "0 10px", boxSizing: "border-box", touchAction: "none",
            // Sin esto, rasgar SELECCIONA el texto del renglón y se ve el resaltado azul.
            userSelect: "none", WebkitUserSelect: "none",
            cursor: verified || terminado || roto ? "default" : "grab",
            opacity: roto ? 0 : 1, transition: "opacity 0.25s",
            boxShadow: roto ? "none" : "0 2px 6px rgba(0,0,0,0.2)",
          }}>
          <span style={{ flexShrink: 0, fontSize: 11, color: "#8a6410" }}>▸</span>
          <span style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 11.5, lineHeight: 1.2, color: "#3a2608" }}>{r.t}</span>
          {/* El corte dentado que avanza con el dedo */}
          {cortando > 0 && (
            <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: `${cortando * 100}%`, pointerEvents: "none", borderRight: "3px dashed #c0392b", background: "linear-gradient(90deg, rgba(192,57,43,0.06), rgba(192,57,43,0.16))" }} />
          )}
        </div>
        {/* Lo que asoma por el hueco cuando el renglón ya no está */}
        {roto && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 3, boxSizing: "border-box", background: "rgba(24,14,4,0.62)", boxShadow: "inset 0 3px 7px rgba(0,0,0,0.55)", overflow: "hidden" }}>
            {/* Los dientes del papel roto, arriba y abajo del hueco: sin ellos parecía una
                fila apagada, no un agujero. Van del color del papel, que es lo que queda
                a los lados del desgarrón. */}
            {["top", "bottom"].map((lado) => (
              <div key={lado} style={{ position: "absolute", left: 0, right: 0, [lado]: 0, height: 7, background: "repeating-linear-gradient(90deg, rgba(246,237,213,0.95) 0 5px, transparent 5px 10px)", WebkitMaskImage: `linear-gradient(${lado === "top" ? "180deg" : "0deg"}, #000, transparent)`, maskImage: `linear-gradient(${lado === "top" ? "180deg" : "0deg"}, #000, transparent)` }} />
            ))}
            <span style={{ position: "relative", fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 10.5, letterSpacing: "0.06em", color: verified ? (acerto ? "#8cf0c0" : "#ffb3b3") : "#fce9a8" }}>DEROGADO · 1845</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", height: "100%", width: "100%", paddingTop: 40 }}>
      <div style={{ pointerEvents: "none", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 20, color: "#fff" }}>Rompe lo que la revolución derribó.</span>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", gap: 10, minHeight: 0, width: "100%", paddingTop: 8 }}>
        {/* La consigna del turno, pegada al enunciado: centrada quedaba demasiado baja. */}
        <div style={{ width: 452, boxSizing: "border-box", borderRadius: 12, border: `2.5px solid ${verified ? "#f2c260" : "#4fd8ff"}`, background: "rgba(0,0,0,0.45)", padding: "6px 12px", flexShrink: 0, minHeight: 42, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1 }}>
          {!verified && !terminado && (<>
            <span className="ed-label" style={{ color: "#9fe9ff", fontSize: 8.5, flexShrink: 0 }}>¿Cuál rompes? · {paso + 1} de {b.consignas.length}</span>
            <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 12.5, color: "#fff", textAlign: "center" }}>{(J12_CARTA.find((r) => r.id === consigna) || {}).pide}</span>
          </>)}
          {!verified && terminado && (
            <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 12.5, color: "#fce9a8", textAlign: "center" }}>Listo. Pulsa ¡VERIFICAR!</span>
          )}
          {verified && (
            <span style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 11, lineHeight: 1.25, color: "#fce9a8", textAlign: "center" }}>El renglón de los esclavos no cayó en 1845: hubo que esperar a 1851, con Urbina.</span>
          )}
        </div>

        {/* El papel */}
        <div style={{ width: 452, boxSizing: "border-box", borderRadius: 10, border: "3px solid rgba(190,158,96,0.75)", background: "linear-gradient(180deg, rgba(255,251,236,0.96), rgba(238,226,198,0.94))", padding: "9px 11px 11px", flexShrink: 0, boxShadow: "0 8px 20px rgba(0,0,0,0.38)" }}>
          <div style={{ textAlign: "center", fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 11, letterSpacing: "0.08em", color: "#7a5a12", borderBottom: "2px solid rgba(190,158,96,0.5)", paddingBottom: 4, marginBottom: 7 }}>CARTA DE LA ESCLAVITUD · 1843</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {b.renglones.map((r, i) => renglon(r, i))}
          </div>
        </div>
      </div>
    </div>
  );
}

const L6T2_ROUNDS = [
  { C: L6T2R1Bandera, verify: true, bubble: (<>Toca un color y entra<br />en el cuartel vacío.</>) },
  { C: L6T2R2Mapa, verify: true, bubble: (<>Toca en el mapa la<br />ciudad donde manda.</>) },
  { C: L6T2R3Carta, verify: true, bubble: (<>Arrastra a lo ancho<br />del renglón y se rompe.</>) },
];

// ══════════════════════════════════════════════════════════════════
// ORQUESTADOR compartido por TODOS los temas — chrome EDINUN (HUD, personaje, acciones,
// overlay, modales). Recibe el arreglo de rondas del tema activo.
// ⭐ = +1 por ELEMENTO resuelto bien; `isCorrect` de la ronda = ronda perfecta. Fallar
// nunca resta.
// ══════════════════════════════════════════════════════════════════
function J12Game({ app, setApp, go, rounds }) {
  const char = CHARACTERS.find((c) => c.id === app.character) || CHARACTERS[0];
  const catLabel = app.currentCatLabel || CAT_LABEL;
  const ROUNDS = rounds || L6T1_ROUNDS;
  const TOTAL = ROUNDS.length;
  const [round, setRound] = useStateG(0);
  const [stars, setStars] = useStateG(0);
  const [log, setLog] = useStateG([]);
  const [elapsed, setElapsed] = useStateG(0);
  const [feedback, setFeedback] = useStateG(null);
  const [feedbackMsg, setFeedbackMsg] = useStateG("");
  const [confirmingExit, setConfirmingExit] = useStateG(false);
  const [confirmingRestart, setConfirmingRestart] = useStateG(false);
  const [rk, setRk] = useStateG(0);
  const [busy, setBusy] = useStateG(false);
  const started = useRefG(Date.now());
  const advancing = useRefG(false);
  const verifyRef = useRefG(null);

  useEffectG(() => { const t = setInterval(() => setElapsed(Math.floor((Date.now() - started.current) / 1000)), 500); return () => clearInterval(t); }, []);
  function formatTime(s) { const m = Math.floor(s / 60), ss = s % 60; return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`; }

  function onSolve(isCorrect, entry, gained) {
    if (advancing.current) return;
    advancing.current = true; setBusy(true);
    if (typeof markFirstAttempt === "function") markFirstAttempt();
    const g = typeof gained === "number" ? gained : (isCorrect ? 1 : 0);
    const newLog = [...log, { idx: round + 1, isCorrect, ...entry }];
    const newStars = stars + g;
    setLog(newLog); setStars(newStars);
    if (g > 0) setApp((s) => ({ ...s, stars: (s.stars || 0) + g }));
    const showFbAt = isCorrect ? 900 : 2400;
    const advanceAt = showFbAt + (isCorrect ? 1100 : 1000);
    // ⚠ En "¡UPS!" NUNCA se muestran estrellas, aunque la ronda haya dado algunas.
    setTimeout(() => { setFeedback(isCorrect ? "ok" : "err"); setFeedbackMsg(isCorrect ? `+${g} ⭐` : ANIMOS[round % ANIMOS.length]); }, showFbAt);
    setTimeout(() => {
      setFeedback(null); setFeedbackMsg("");
      if (round + 1 < TOTAL) { setRound((r) => r + 1); advancing.current = false; setBusy(false); }
      else {
        const solved = newLog.filter((e) => e.isCorrect).length;
        setApp((s) => ({ ...s, stars: newStars, lastResult: { category: catLabel, solved, total: TOTAL, time: Math.floor((Date.now() - started.current) / 1000), starsEarned: newStars, log: newLog } }));
        if (typeof incrementGamesCompleted === "function") incrementGamesCompleted();
        go("results");
      }
    }, advanceAt);
  }

  function confirmRestart() {
    setConfirmingRestart(false); advancing.current = false; setBusy(false);
    setRound(0); setStars(0); setLog([]); setFeedback(null); setFeedbackMsg(""); setRk((k) => k + 1);
    started.current = Date.now();
  }

  const Comp = ROUNDS[round].C;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 10, left: 16, right: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <EdinunLogoMini size={64} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.35)", borderRadius: 999, padding: "6px 12px", border: "1px solid rgba(242,194,96,0.4)", fontFamily: "var(--ed-font-mono)", fontSize: 13, color: "#fce9a8" }}>⏱ {formatTime(elapsed)}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.35)", borderRadius: 999, padding: "6px 12px", border: "1px solid rgba(242,194,96,0.4)", fontFamily: "var(--ed-font-display)", fontWeight: 600, color: "#fce9a8" }}>⭐ {stars}</div>
        </div>
      </div>

      <div style={{ position: "absolute", top: 52, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 8 }}>
        <span className="ed-label" style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>Ronda</span>
        {Array.from({ length: TOTAL }).map((_, i) => {
          const done = i < log.length, ok = done && log[i] && log[i].isCorrect;
          return <div key={i} style={{ width: 11, height: 11, borderRadius: "50%", background: done ? (ok ? "#fce9a8" : "#ff6b6b") : (i === round ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)"), boxShadow: done ? "0 0 8px currentColor" : "none", color: ok ? "#fce9a8" : "#ff6b6b" }} />;
        })}
      </div>

      <div style={{ position: "absolute", left: 8, bottom: 78, width: 220, pointerEvents: "none", textAlign: "center" }}>
        <div className="ed-float-soft" style={{ position: "absolute", left: 0, right: 0, bottom: "100%", display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative", display: "inline-block", maxWidth: 210, background: "linear-gradient(180deg, rgba(20,12,55,0.95), rgba(10,6,35,0.95))", border: "1.5px solid rgba(242,194,96,0.65)", borderRadius: 16, padding: "10px 14px", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 14, lineHeight: 1.3, color: "#fce9a8", textAlign: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}>
            {ROUNDS[round].bubble}
            <div style={{ position: "absolute", bottom: -10, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "9px solid transparent", borderRight: "9px solid transparent", borderTop: "10px solid rgba(20,12,55,0.95)", filter: "drop-shadow(0 1px 0 rgba(242,194,96,0.55))" }} />
          </div>
        </div>
        <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
          <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", width: 140, height: 16, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(242,194,96,0.45), transparent 70%)", filter: "blur(5px)" }} />
          <char.Component size={186} floating />
        </div>
        <div style={{ marginTop: -2, fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 14, color: "#fce9a8", letterSpacing: "0.04em", textShadow: "0 2px 6px rgba(0,0,0,0.6)" }}>{char.name}</div>
      </div>

      <div style={{ position: "absolute", top: 60, bottom: 18, left: 215, right: 215 }}>
        <Comp key={`r${round}-${rk}`} onSolve={onSolve} verifyRef={verifyRef} />
      </div>

      <div style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 12, width: 150 }}>
        {ROUNDS[round].verify && !busy && (
          <button className="ed-btn" onClick={() => verifyRef.current && verifyRef.current()} style={{ fontSize: 15, padding: "0 10px", height: 56, fontWeight: 800, letterSpacing: "0.04em", background: "linear-gradient(180deg, #4fe08a, #1f9d57)", color: "#06381f", border: "none" }}>¡VERIFICAR!</button>
        )}
        <button className="ed-btn ed-btn-restart" onClick={() => setConfirmingRestart(true)} style={{ fontSize: 15, padding: "0 10px", height: 56, fontWeight: 800, letterSpacing: "0.04em" }}>REINICIAR</button>
        <button className="ed-btn ed-btn-ghost" onClick={() => setConfirmingExit(true)} style={{ fontSize: 15, padding: "0 10px", height: 56, fontWeight: 800, letterSpacing: "0.04em" }}>SALIR</button>
      </div>

      {feedback && (
        <PortalToBody>
          <div style={{ position: "fixed", inset: 0, zIndex: 1000, pointerEvents: "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)", animation: "ed-pop-in 0.3s" }}>
            <div style={{ fontFamily: "'Fredoka','Baloo 2',system-ui,sans-serif", fontWeight: 700, fontSize: "clamp(56px, 11vmin, 120px)", color: feedback === "ok" ? "#2ecc8f" : "#ff6b6b", textShadow: "0 4px 0 rgba(0,0,0,0.45), 0 0 60px currentColor" }}>{feedback === "ok" ? "¡EXCELENTE!" : "¡UPS!"}</div>
            {feedbackMsg && (<div style={{ fontFamily: "'Fredoka','Baloo 2',system-ui,sans-serif", fontWeight: 700, fontSize: "clamp(18px, 2.6vmin, 30px)", color: feedback === "ok" ? "#fce9a8" : "#fff", background: "rgba(0,0,0,0.55)", padding: "8px 26px", borderRadius: 999, textShadow: "0 2px 6px rgba(0,0,0,0.6)", textAlign: "center" }}>{feedback === "err" && feedbackMsg.indexOf("⭐") === -1 ? `${feedbackMsg} — ${char.name}` : feedbackMsg}</div>)}
          </div>
        </PortalToBody>
      )}

      {confirmingExit && (
        <PortalToBody>
          <div onClick={() => setConfirmingExit(false)} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.62)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "ed-pop-in 0.18s", padding: 16 }}>
            <div onClick={(e) => e.stopPropagation()} className="ed-card" style={{ padding: 24, maxWidth: 440, textAlign: "center", boxShadow: "var(--ed-shadow-card), 0 0 40px rgba(255,107,107,0.3)" }}>
              <div className="ed-label" style={{ color: "#ff8b8b", marginBottom: 6 }}>Salir del juego</div>
              <h2 className="ed-h1" style={{ fontSize: 22, lineHeight: 1.15, marginBottom: 8 }}>¿Volver al inicio?</h2>
              <p className="ed-body" style={{ marginBottom: 16, fontSize: 14 }}>Vas a perder lo de esta ronda.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <button className="ed-btn ed-btn-ghost" onClick={() => setConfirmingExit(false)} style={{ height: 44, fontWeight: 800, letterSpacing: "0.04em" }}>SEGUIR JUGANDO</button>
                <button className="ed-btn ed-btn-primary" onClick={() => { setConfirmingExit(false); go("home"); }} style={{ height: 44, fontWeight: 800, letterSpacing: "0.04em" }}>SÍ, SALIR</button>
              </div>
            </div>
          </div>
        </PortalToBody>
      )}

      {confirmingRestart && (
        <PortalToBody>
          <div onClick={() => setConfirmingRestart(false)} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.62)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "ed-pop-in 0.18s", padding: 16 }}>
            <div onClick={(e) => e.stopPropagation()} className="ed-card" style={{ padding: 24, maxWidth: 440, textAlign: "center", boxShadow: "var(--ed-shadow-card), 0 0 40px rgba(155,123,232,0.3)" }}>
              <div className="ed-label" style={{ color: "#c4a8ff", marginBottom: 6 }}>Reiniciar juego</div>
              <h2 className="ed-h1" style={{ fontSize: 22, lineHeight: 1.15, marginBottom: 8 }}>¿Empezar de nuevo?</h2>
              <p className="ed-body" style={{ marginBottom: 16, fontSize: 14 }}>Vas a jugar las {TOTAL} rondas otra vez.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <button className="ed-btn ed-btn-ghost" onClick={() => setConfirmingRestart(false)} style={{ height: 44, fontWeight: 800, letterSpacing: "0.04em" }}>SEGUIR JUGANDO</button>
                <button className="ed-btn ed-btn-primary" onClick={confirmRestart} style={{ height: 44, fontWeight: 800, letterSpacing: "0.04em" }}>SÍ, REINICIAR</button>
              </div>
            </div>
          </div>
        </PortalToBody>
      )}
    </div>
  );
}

// Despacho por TEMA. Los temas que faltan (2 y 3 del Libro 6, y los 4 del Libro 7) no
// están en el menú todavía, así que una categoría desconocida cae en el Tema 1 en vez de
// romperse.
const J12_ROUNDS_POR_TEMA = { "l6-t1": L6T1_ROUNDS, "l6-t2": L6T2_ROUNDS };
function GameScreen({ app, setApp, go }) {
  const cat = app.currentCategory || "l6-t1";
  const rounds = J12_ROUNDS_POR_TEMA[cat] || L6T1_ROUNDS;
  return <J12Game key={cat} app={app} setApp={setApp} go={go} rounds={rounds} />;
}

// ─────────────────────────────────────────────────────────────
const printStyles = {
  doc: { padding: 0, margin: 0, color: "#111", background: "#fff" },
  head: { display: "flex", alignItems: "center", gap: 14, borderBottom: "2px solid #d9a441", paddingBottom: 10, marginBottom: 14 },
  logo: { width: 56, height: 56, objectFit: "contain" },
  org: { fontFamily: "'Fredoka','Baloo 2','Nunito',sans-serif", fontWeight: 700, fontSize: "16pt", letterSpacing: "0.03em", lineHeight: 1.1, margin: 0 },
  sub: { fontSize: "9pt", color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 4 },
  date: { fontFamily: "ui-monospace,Consolas,monospace", fontSize: "10pt", color: "#555", textAlign: "right", whiteSpace: "nowrap" },
  fields: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 },
  field: { padding: "8px 10px", borderRadius: 6, border: "1px solid #ddd" },
  fieldL: { fontSize: "8pt", textTransform: "uppercase", letterSpacing: "0.08em", color: "#666" },
  fieldV: { fontSize: "12pt", fontWeight: 700, marginTop: 2 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "11pt" },
  thHead: { borderBottom: "2px solid #111" },
  th: { padding: 8, textAlign: "left", fontSize: "9pt", textTransform: "uppercase", letterSpacing: "0.08em", color: "#555", fontWeight: 700 },
  thC: { textAlign: "center" },
  thR: { textAlign: "right" },
  tr: { borderBottom: "1px solid #ccc" },
  td: { padding: "9px 8px", fontFamily: "'Nunito',sans-serif" },
  tdNum: { color: "#888", width: 36, fontFamily: "ui-monospace,Consolas,monospace" },
  tdOk: { color: "#1e8a5d", textAlign: "center", fontWeight: 700 },
  tdErr: { color: "#c33b3b", textAlign: "center", fontWeight: 700 },
  summary: { marginTop: 16, borderTop: "2px solid #d9a441", paddingTop: 12, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 },
  cell: { padding: 10, borderRadius: 6, border: "1px solid #ddd", textAlign: "center" },
  cellEmp: { background: "#faf3df", borderColor: "#d9a441" },
  cellL: { fontSize: "8pt", textTransform: "uppercase", letterSpacing: "0.08em", color: "#666" },
  cellV: { fontSize: "18pt", fontWeight: 800, marginTop: 4 },
  foot: { marginTop: 16, fontSize: "9pt", color: "#888", textAlign: "center" },
};

function PrintableReport({ studentName, res, dateStr, mm, ss, attemptedCount, accuracy }) {
  const log = res.log || [];
  return (
    <PortalToBody>
      <div className="ed-print-doc" style={printStyles.doc} aria-hidden="true">
        <div style={printStyles.head}>
          <img src="assets/edinun-logo.png" alt="" style={printStyles.logo} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={printStyles.org}>EDINUN — Ediciones Nacionales Unidas</h1>
            <div style={printStyles.sub}>Reporte académico · Estudios Sociales</div>
          </div>
          <div style={printStyles.date}>{dateStr}</div>
        </div>
        <div style={printStyles.fields}>
          <div style={printStyles.field}><div style={printStyles.fieldL}>Estudiante</div><div style={printStyles.fieldV}>{studentName || "—"}</div></div>
          <div style={printStyles.field}><div style={printStyles.fieldL}>Tema</div><div style={printStyles.fieldV}>{res.category || "—"}</div></div>
          <div style={printStyles.field}><div style={printStyles.fieldL}>Tiempo total</div><div style={printStyles.fieldV}>{String(mm).padStart(2,"0")}:{String(ss).padStart(2,"0")}</div></div>
        </div>
        <table style={printStyles.table}>
          <thead>
            <tr style={printStyles.thHead}>
              <th style={printStyles.th}>#</th>
              <th style={printStyles.th}>Pregunta</th>
              <th style={{ ...printStyles.th, ...printStyles.thR }}>Respuesta del estudiante</th>
              <th style={{ ...printStyles.th, ...printStyles.thR }}>Respuesta correcta</th>
              <th style={{ ...printStyles.th, ...printStyles.thC }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {log.map((e) => (
              <tr key={e.idx} style={printStyles.tr}>
                <td style={{ ...printStyles.td, ...printStyles.tdNum }}>{e.idx}</td>
                <td style={{ ...printStyles.td, fontWeight: 700 }}>{e.emoji} {e.a}</td>
                <td style={{ ...printStyles.td, textAlign: "right" }}>{e.userAnswer}</td>
                <td style={{ ...printStyles.td, textAlign: "right" }}>{e.correctAnswer}</td>
                <td style={{ ...printStyles.td, ...(e.isCorrect ? printStyles.tdOk : printStyles.tdErr) }}>{e.isCorrect ? "Correcto" : "Incorrecto"}</td>
              </tr>
            ))}
            {log.length === 0 && (<tr><td colSpan={5} style={{ padding: 24, textAlign: "center", color: "#888", fontStyle: "italic" }}>Sin ejercicios.</td></tr>)}
          </tbody>
        </table>
        <div style={printStyles.summary}>
          <div style={printStyles.cell}><div style={printStyles.cellL}>Preguntas</div><div style={printStyles.cellV}>{attemptedCount} / {res.total}</div></div>
          <div style={printStyles.cell}><div style={printStyles.cellL}>Correctas</div><div style={printStyles.cellV}>{res.solved}</div></div>
          <div style={printStyles.cell}><div style={printStyles.cellL}>Estrellas</div><div style={printStyles.cellV}>{res.starsEarned}</div></div>
          <div style={{ ...printStyles.cell, ...printStyles.cellEmp }}><div style={printStyles.cellL}>Precisión</div><div style={printStyles.cellV}>{accuracy}%</div></div>
        </div>
        <div style={printStyles.foot}>EDINUN GAMES · Reporte generado automáticamente</div>
      </div>
    </PortalToBody>
  );
}

function ReportField({ label, value }) {
  return (
    <div style={{ padding: "8px 10px", borderRadius: 10, background: "rgba(10,6,35,0.45)", border: "1px solid rgba(148,120,255,0.25)" }}>
      <div className="ed-label" style={{ fontSize: 9, color: "var(--ed-ink-soft)", marginBottom: 2 }}>{label}</div>
      <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 600, fontSize: 14, color: "var(--ed-ink)" }}>{value}</div>
    </div>
  );
}

function SummaryCell({ label, value, tone = "var(--ed-ink)", emphasis = false }) {
  return (
    <div style={{ padding: "8px 10px", borderRadius: 10, background: emphasis ? "rgba(242,194,96,0.12)" : "rgba(10,6,35,0.4)", border: `1px solid ${emphasis ? "rgba(242,194,96,0.5)" : "rgba(148,120,255,0.25)"}`, textAlign: "center" }}>
      <div className="ed-label" style={{ fontSize: 9, color: "var(--ed-ink-soft)", marginBottom: 2 }}>{label}</div>
      <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: emphasis ? 22 : 18, color: tone, lineHeight: 1 }}>{value}</div>
    </div>
  );
}

function ResultsScreen({ app, setApp, go }) {
  const char = CHARACTERS.find((c) => c.id === app.character) || CHARACTERS[0];
  const res = app.lastResult || { category: CAT_LABEL, solved: 0, total: ROUNDS, time: 0, starsEarned: 0, log: [] };
  const mm = Math.floor(res.time / 60), ss = res.time % 60;
  const totalEx = res.total || ROUNDS;
  const attemptedCount = (res.log || []).length;
  const accuracy = attemptedCount > 0 ? Math.round((res.solved / attemptedCount) * 100) : 0;
  const dateStr = new Date().toLocaleDateString("es-EC", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 14, left: 24, right: 24, display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
        <button className="ed-btn ed-btn-ghost" onClick={() => go("home")} style={{ padding: "8px 14px", fontWeight: 800, letterSpacing: "0.04em" }}>← VOLVER AL INICIO</button>
      </div>

      <div style={{ position: "absolute", inset: "70px 32px 20px 32px", display: "grid", gridTemplateColumns: "0.85fr 1.4fr", gap: 24, alignItems: "stretch" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 34, background: "linear-gradient(180deg, #fce9a8, #d9a441)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1, marginBottom: 4 }}>
            ¡Ronda completa!
          </div>
          <char.Component size={176} />
          <div className="ed-body" style={{ fontStyle: "italic", textAlign: "center", maxWidth: 240, fontSize: 13 }}>
            "{app.studentName || "Campeón"}, acertaste {res.solved} de {totalEx}."
            <div style={{ marginTop: 4, color: "var(--ed-ink-soft)", fontSize: 12 }}>— {char.name}</div>
          </div>
        </div>

        <div className="ed-card" style={{ padding: 16, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, borderBottom: "2px solid rgba(242,194,96,0.45)", paddingBottom: 10, marginBottom: 12 }}>
            <EdinunLogoMini size={56} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 17, letterSpacing: "0.04em", lineHeight: 1.1 }}>EDINUN — Ediciones Nacionales Unidas</div>
              <div style={{ fontFamily: "var(--ed-font-ui)", fontSize: 11, color: "var(--ed-ink-soft)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>Reporte académico · Estudios Sociales</div>
            </div>
            <div style={{ fontFamily: "var(--ed-font-mono)", fontSize: 11, color: "var(--ed-ink-dim)", textAlign: "right" }}>{dateStr}</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, fontFamily: "var(--ed-font-ui)", fontSize: 12, marginBottom: 10 }}>
            <ReportField label="Estudiante" value={app.studentName || "—"} />
            <ReportField label="Tema" value={res.category} />
            <ReportField label="Tiempo" value={`${String(mm).padStart(2,"0")}:${String(ss).padStart(2,"0")}`} />
          </div>

          <div style={{ flex: 1, minHeight: 0, overflow: "auto", marginBottom: 10 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--ed-font-ui)", fontSize: 12 }}>
              <thead>
                <tr style={{ fontWeight: 700, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ed-ink-dim)", borderBottom: "1px solid rgba(148,120,255,0.3)" }}>
                  <th style={{ textAlign: "left", padding: "6px 8px", width: 30 }}>#</th>
                  <th style={{ textAlign: "left", padding: "6px 8px" }}>Pregunta</th>
                  <th style={{ textAlign: "right", padding: "6px 8px" }}>Tocó</th>
                  <th style={{ textAlign: "right", padding: "6px 8px" }}>Correcta</th>
                  <th style={{ textAlign: "center", padding: "6px 8px" }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {(res.log || []).map((e) => (
                  <tr key={e.idx} style={{ borderBottom: "1px solid rgba(148,120,255,0.18)" }}>
                    <td style={{ padding: "7px 8px", color: "var(--ed-ink-soft)" }}>{e.idx}</td>
                    <td style={{ padding: "7px 8px", fontWeight: 600 }}>{e.emoji} {e.a}</td>
                    <td style={{ padding: "7px 8px", textAlign: "right" }}>{e.userAnswer}</td>
                    <td style={{ padding: "7px 8px", textAlign: "right" }}>{e.correctAnswer}</td>
                    <td style={{ padding: "7px 8px", textAlign: "center", fontFamily: "var(--ed-font-display)", fontWeight: 700, color: e.isCorrect ? "#2ecc8f" : "#ff6b6b" }}>{e.isCorrect ? "✓" : "✗"}</td>
                  </tr>
                ))}
                {(res.log || []).length === 0 && (<tr><td colSpan={5} style={{ padding: "16px 8px", textAlign: "center", color: "var(--ed-ink-soft)", fontStyle: "italic" }}>Sin preguntas.</td></tr>)}
              </tbody>
            </table>
          </div>

          <div style={{ borderTop: "2px solid rgba(242,194,96,0.45)", paddingTop: 10, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, fontFamily: "var(--ed-font-ui)", fontSize: 11 }}>
            <SummaryCell label="Preguntas" value={`${attemptedCount} / ${totalEx}`} />
            <SummaryCell label="Correctas" value={`${res.solved}`} tone="#2ecc8f" />
            <SummaryCell label="Estrellas" value={`${res.starsEarned}`} tone="#fce9a8" />
            <SummaryCell label="Precisión" value={`${accuracy}%`} tone="#fce9a8" emphasis />
          </div>

          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button className="ed-btn ed-btn-ghost" onClick={() => window.print()} style={{ padding: "0 10px", fontSize: 13, height: 44, fontWeight: 800, letterSpacing: "0.04em" }}>IMPRIMIR REPORTE</button>
            <button className="ed-btn ed-btn-primary" onClick={() => go("game")} style={{ padding: "0 10px", fontSize: 13, height: 44, fontWeight: 800, letterSpacing: "0.04em" }}>JUGAR OTRA RONDA</button>
          </div>
        </div>
      </div>

      <PrintableReport studentName={app.studentName} res={res} dateStr={dateStr} mm={mm} ss={ss} attemptedCount={attemptedCount} accuracy={accuracy} />
    </div>
  );
}

Object.assign(window, { GameScreen, ResultsScreen });
