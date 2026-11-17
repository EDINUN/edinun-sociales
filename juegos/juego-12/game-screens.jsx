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
        {verified && (
          <span style={{ position: "absolute", top: 6, right: 6, width: 20, height: 20, borderRadius: "50%", background: ok ? "#1f8a54" : "#c0392b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 12, boxShadow: "0 2px 5px rgba(0,0,0,0.35)" }}>{ok ? "✓" : "✗"}</span>
        )}
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
        <div style={{ minHeight: 15 }}>
          {verified && (
            <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 8.5, lineHeight: 1.15, color: "#8a6410", background: "linear-gradient(180deg,#ffe6a1,#f1c153)", border: "1.5px solid #e0a72c", borderRadius: 7, padding: "1px 6px" }}>{f.motivo}</div>
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
  const [sel, setSel] = useStateG(null);         // índice de la tarjeta levantada
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
const J12_ROUNDS_POR_TEMA = { "l6-t1": L6T1_ROUNDS };
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
