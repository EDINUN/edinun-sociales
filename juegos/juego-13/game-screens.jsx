// game-screens.jsx — juego-13 "Un mundo por descubrir" (Estudios Sociales · 12 años).
// Juego MULTI-TEMA: `GameScreen` despacha por `app.currentCategory` y cada tema tiene su
// propio arreglo de rondas; el chrome EDINUN lo comparten todos vía `J13Game`.
//
// TEMA 1 · "Los continentes: África, Asia, Europa y Oceanía" (Tema 5 del libro) — J13_ROUNDS:
//   R1 "Control de aduana"    — ARRASTRAR 4 accidentes geográficos a su continente + ¡VERIFICAR!
//   R2 "Podio mundial"        — INTERCAMBIAR (tap-swap) 4 fichas en el podio 1º-4º + ¡VERIFICAR!
//   R3 "Cazador de errores"   — CAZAR los 2 datos infiltrados en la ficha de un continente.
//
// TEMA 2 · "Las Américas y su geografía" (Tema 4 del libro) — J13_AM_ROUNDS:
//   R1 "Pasaporte de la región"  — ELEGIR la opción correcta en 3 huecos + ¡VERIFICAR!
//   R2 "Calculadora demográfica" — TECLEAR la tasa de crecimiento poblacional + ¡VERIFICAR!
//   R3 "Sala de datos"           — UNIR con líneas cada concepto con su dato + ¡VERIFICAR!
//
// CONTRATO: GameScreen/ResultsScreen({app,setApp,go}) en window; markFirstAttempt() en la
// 1a respuesta; incrementGamesCompleted() al fin. Invariantes EDINUN: fallar NO baja el
// progreso; al fallar se revela la correcta en el lenguaje de la mecánica; salir/reiniciar
// con modal. Enunciado = QUE, bocadillo = COMO. Anti-repeticion por ronda.
//
// ⚠ DATOS: todo sale TEXTUAL del tema del libro. Ante contradicciones del libro manda el
// cuadro "Datos continentales comparados" (pp. 77-78). No inventar cifras.

const { useState: useStateG, useEffect: useEffectG, useRef: useRefG } = React;

function PortalToBody({ children }) {
  return ReactDOM.createPortal(children, document.body);
}

const CAT_LABEL = "Los continentes";
const TOTAL = 3;

const ANIMOS = [
  "¡Casi! Sigue intentándolo.",
  "¡La próxima es tuya!",
  "Equivocarse también es aprender.",
];

// ── Anti-repeticion FIFO en localStorage (una clave por ronda) ──
function j13Recent(key) { try { const r = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(r) ? r : []; } catch (e) { return []; } }
function j13Push(key, id, cap) { try { const prev = j13Recent(key).filter((x) => x !== id); localStorage.setItem(key, JSON.stringify([id].concat(prev).slice(0, cap))); } catch (e) {} }
function j13Shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
// Devuelve k INDICES de `pool` evitando los recientes de `key` (sin registrarlos todavía:
// así se puede re-sortear sin ensuciar la memoria). Registrar luego con j13Commit.
// OJO cap: para elegir un SUBCONJUNTO usar cap < pool.length - k (si no, parte el banco en
// grupos fijos que alternan idéntico cada recarga).
function j13PickIdx(pool, k, key) {
  const recent = new Set(j13Recent(key)), all = pool.map((_, i) => i);
  return j13Shuffle(all.filter((i) => !recent.has(i))).concat(j13Shuffle(all.filter((i) => recent.has(i)))).slice(0, k);
}
function j13Commit(key, idxs, cap) { idxs.forEach((i) => j13Push(key, i, cap)); }

// Miles con espacio y decimales con coma, como los cuadros del libro (44 936 000).
function j13Fmt(v) {
  const s = String(Math.round(v * 100) / 100).split(".");
  return s[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ") + (s[1] ? "," + s[1] : "");
}

// Los 4 continentes del tema. Los colores son los del cuadro de la actividad 6 del
// libro (África naranja · Asia morado · Europa azul · Oceanía verde).
const J13_CONT = [
  { id: "africa", n: "ÁFRICA", col: "#e4881a" },
  { id: "asia", n: "ASIA", col: "#9b6fe0" },
  { id: "europa", n: "EUROPA", col: "#3f8ee0" },
  { id: "oceania", n: "OCEANÍA", col: "#2ecc8f" },
];
function j13Cont(id) { return J13_CONT.find((c) => c.id === id) || J13_CONT[0]; }

// ══════════════════════════════════════════════════════════════════
// BANCO COMPARTIDO (R1 y R3) — 48 accidentes geográficos del tema, textuales del libro.
// FUERA por ambigüedad: montes Urales y mar Caspio (el libro los da como límite entre
// Europa y Asia → tendrían dos respuestas correctas). El río Ural SÍ entra: la actividad 6
// del cuaderno lo resuelve en Europa.
// ══════════════════════════════════════════════════════════════════
const J13_LUGARES = [
  // ── ÁFRICA (11) ──
  { t: "Río Nilo", e: "🏞️", k: "Río", c: "africa" },
  { t: "Río Zaire", e: "🏞️", k: "Río", c: "africa" },
  { t: "Río Níger", e: "🏞️", k: "Río", c: "africa" },
  { t: "Lago Victoria", e: "💧", k: "Lago", c: "africa" },
  { t: "Lago Tanganica", e: "💧", k: "Lago", c: "africa" },
  { t: "Lago Nyasa", e: "💧", k: "Lago", c: "africa" },
  { t: "Montañas Atlas", e: "⛰️", k: "Relieve", c: "africa" },
  { t: "Montañas del Rift", e: "⛰️", k: "Relieve", c: "africa" },
  { t: "Meseta del Sahara", e: "🏜️", k: "Relieve", c: "africa" },
  { t: "Meseta Etíope", e: "🗺️", k: "Relieve", c: "africa" },
  { t: "Kilimanjaro", e: "🏔️", k: "Elevación", c: "africa" },
  // ── ASIA (13) ──
  { t: "Cordillera del Himalaya", e: "⛰️", k: "Relieve", c: "asia" },
  { t: "Meseta Tibetana", e: "🗺️", k: "Relieve", c: "asia" },
  { t: "Meseta de Mongolia", e: "🗺️", k: "Relieve", c: "asia" },
  { t: "Gran Llanura China", e: "🗺️", k: "Relieve", c: "asia" },
  { t: "Llanura de Siberia Occidental", e: "🗺️", k: "Relieve", c: "asia" },
  { t: "Meseta de Siberia Central", e: "🗺️", k: "Relieve", c: "asia" },
  { t: "Everest", e: "🏔️", k: "Elevación", c: "asia" },
  { t: "Río Azul", e: "🏞️", k: "Río", c: "asia" },
  { t: "Río Amarillo", e: "🏞️", k: "Río", c: "asia" },
  { t: "Río Lena", e: "🏞️", k: "Río", c: "asia" },
  { t: "Río Yeniséi", e: "🏞️", k: "Río", c: "asia" },
  { t: "Río Obi", e: "🏞️", k: "Río", c: "asia" },
  { t: "Río Indo", e: "🏞️", k: "Río", c: "asia" },
  // ── EUROPA (16) ──
  { t: "Montes Escandinavos", e: "⛰️", k: "Relieve", c: "europa" },
  { t: "Cáucaso", e: "⛰️", k: "Relieve", c: "europa" },
  { t: "Cárpatos", e: "⛰️", k: "Relieve", c: "europa" },
  { t: "Alpes Dináricos", e: "⛰️", k: "Relieve", c: "europa" },
  { t: "Alpes", e: "⛰️", k: "Relieve", c: "europa" },
  { t: "Apeninos", e: "⛰️", k: "Relieve", c: "europa" },
  { t: "Pirineos", e: "⛰️", k: "Relieve", c: "europa" },
  { t: "Elbrus", e: "🏔️", k: "Elevación", c: "europa" },
  { t: "Río Volga", e: "🏞️", k: "Río", c: "europa" },
  { t: "Río Danubio", e: "🏞️", k: "Río", c: "europa" },
  { t: "Río Ural", e: "🏞️", k: "Río", c: "europa" },
  { t: "Río Rhin", e: "🏞️", k: "Río", c: "europa" },
  { t: "Lago Ladoga", e: "💧", k: "Lago", c: "europa" },
  { t: "Lago Onega", e: "💧", k: "Lago", c: "europa" },
  { t: "Lago Vänern", e: "💧", k: "Lago", c: "europa" },
  { t: "Lago Saimaa", e: "💧", k: "Lago", c: "europa" },
  // ── OCEANÍA (8) ──
  { t: "Gran cordillera divisoria", e: "⛰️", k: "Relieve", c: "oceania" },
  { t: "Gran desierto Victoria", e: "🏜️", k: "Relieve", c: "oceania" },
  { t: "Desierto de Gibson", e: "🏜️", k: "Relieve", c: "oceania" },
  { t: "Alpes neozelandeses", e: "⛰️", k: "Relieve", c: "oceania" },
  { t: "Puncak Jaya", e: "🏔️", k: "Elevación", c: "oceania" },
  { t: "Río Murray", e: "🏞️", k: "Río", c: "oceania" },
  { t: "Río Darling", e: "🏞️", k: "Río", c: "oceania" },
  { t: "Lago Eyre", e: "💧", k: "Lago", c: "oceania" },
];

// ══════════════════════════════════════════════════════════════════
// R1 · "Control de aduana" — clasificar arrastrando (patrón 8).
// 4 fichas → 4 cajones de continente + ¡VERIFICAR!. Reparto variable: se exige que las
// 4 fichas NO sean todas del mismo continente (si no, se resolvería por descarte).
// ══════════════════════════════════════════════════════════════════
const J13_R1_KEY = "edinun_j13_r1_v1";
function j13R1Build() {
  let idxs = j13PickIdx(J13_LUGARES, 4, J13_R1_KEY);
  for (let t = 0; t < 6 && new Set(idxs.map((i) => J13_LUGARES[i].c)).size < 2; t++) {
    idxs = j13PickIdx(J13_LUGARES, 4, J13_R1_KEY);
  }
  j13Commit(J13_R1_KEY, idxs, 12);
  return { items: idxs.map((i, n) => ({ ...J13_LUGARES[i], id: n })) };
}

function R1Aduana({ onSolve, verifyRef }) {
  const [b] = useStateG(() => j13R1Build());
  const [placed, setPlaced] = useStateG({});   // id -> continente
  const [sel, setSel] = useStateG(null);       // respaldo tap: ficha seleccionada
  const [verified, setVerified] = useStateG(false);
  const [drag, setDrag] = useStateG(null);
  const rootRef = useRefG(null);
  const boxRefs = useRefG({});
  const dragInfo = useRefG(null);
  const allPlaced = b.items.every((it) => placed[it.id]);

  function setZone(id, c) { setPlaced((s) => { const n = Object.assign({}, s); if (c) n[id] = c; else delete n[id]; return n; }); setSel(null); }
  function hitBox(x, y) {
    for (const c of J13_CONT) {
      const el = boxRefs.current[c.id]; if (!el) continue;
      const r = el.getBoundingClientRect(), pad = 12;
      if (x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad) return c.id;
    }
    return null;
  }
  function onDown(e, id) {
    if (verified) return;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
    const S = rootRef.current ? (rootRef.current.getBoundingClientRect().width / 470) || 1 : 1;
    dragInfo.current = { id, x0: e.clientX, y0: e.clientY, scale: S };
    setDrag({ id, dx: 0, dy: 0, moved: false, over: null });
  }
  function onMove(e) {
    const di = dragInfo.current; if (!di) return;
    const sdx = e.clientX - di.x0, sdy = e.clientY - di.y0, moved = Math.hypot(sdx, sdy) > 6;
    setDrag({ id: di.id, dx: sdx / di.scale, dy: sdy / di.scale, moved, over: moved ? hitBox(e.clientX, e.clientY) : null });
  }
  function onUp(e) {
    const di = dragInfo.current; if (!di) return;
    const sdx = e.clientX - di.x0, sdy = e.clientY - di.y0, moved = Math.hypot(sdx, sdy) > 6, id = di.id;
    dragInfo.current = null; setDrag(null);
    if (verified) return;
    if (moved) { setZone(id, hitBox(e.clientX, e.clientY)); return; }  // soltar fuera de los cajones = vuelve a la bandeja
    // Toque simple (respaldo del arrastre). Si ya había OTRA ficha seleccionada y esta
    // está dentro de un cajón, el toque vale como "tocar ese cajón": si no, la ficha ya
    // colocada se comería el toque y el cajón lleno dejaría de aceptar fichas.
    if (sel !== null && sel !== id) {
      const zone = placed[id] || hitBox(e.clientX, e.clientY);
      if (zone) { setZone(sel, zone); return; }
    }
    setSel((cur) => (cur === id ? null : id));
  }
  function endDrag() { dragInfo.current = null; setDrag(null); }
  function tapBox(c) { if (verified || sel === null) return; setZone(sel, c); }

  function verificar() {
    if (verified || !allPlaced) return;
    setVerified(true);
    const okCount = b.items.filter((it) => placed[it.id] === it.c).length;
    onSolve(okCount === b.items.length, {
      emoji: "🧭", a: "¿A qué continente pertenece cada lugar?",
      userAnswer: b.items.map((it) => `${it.t}=${j13Cont(placed[it.id]).n}`).join(", "),
      correctAnswer: b.items.map((it) => `${it.t}=${j13Cont(it.c).n}`).join(", "),
    }, okCount);
  }
  verifyRef.current = verificar;

  // Ficha: en la bandeja (grande) o dentro de un cajón (miniatura).
  function chip(it, mini) {
    const isSel = sel === it.id, dragging = drag && drag.id === it.id;
    const ok = verified && placed[it.id] === it.c;
    let border = "#f2c260";
    if (!verified && isSel) border = "#4fd8ff";
    if (verified) border = ok ? "#2ecc8f" : "#ff6b6b";
    return (
      <button key={it.id} onPointerDown={(e) => onDown(e, it.id)} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={endDrag}
        onClick={(e) => e.stopPropagation()} disabled={verified}
        style={{ position: "relative", width: mini ? 92 : 140, minHeight: mini ? 34 : 72, borderRadius: mini ? 9 : 14, border: `${mini ? 2 : 3}px solid ${border}`, background: "linear-gradient(180deg,#fff8e6,#f7e3a8)", color: "#3a2608", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, padding: mini ? "3px 3px" : "6px 6px", cursor: verified ? "default" : "grab", touchAction: "none", zIndex: dragging ? 60 : 1, transform: dragging ? `translate(${drag.dx}px, ${drag.dy}px) scale(1.08)` : (isSel ? "scale(1.05)" : "none"), boxShadow: (dragging || isSel) ? "0 0 18px rgba(79,216,255,0.65)" : "inset 0 1px 0 rgba(255,255,255,0.7), 0 4px 10px rgba(0,0,0,0.26)", transition: dragging ? "none" : "transform 0.12s ease" }}>
        <span style={{ fontSize: mini ? 13 : 24, lineHeight: 1 }}>{it.e}</span>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: mini ? 8.5 : 11, lineHeight: 1.12, textAlign: "center" }}>{it.t}</span>
        {verified && (
          <span style={{ position: "absolute", top: -8, right: -7, fontSize: 11, fontWeight: 900, color: "#fff", background: ok ? "#1f8a54" : "#c0392b", borderRadius: "50%", width: 19, height: 19, display: "flex", alignItems: "center", justifyContent: "center" }}>{ok ? "✓" : "✗"}</span>
        )}
        {verified && !ok && (
          <span style={{ position: "absolute", bottom: -10, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap", background: "linear-gradient(180deg,#ffe6a1,#f1c153)", border: "1.5px solid #e0a72c", borderRadius: 999, padding: "0 6px", fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 8.5, color: "#5a3d0a" }}>{j13Cont(it.c).n}</span>
        )}
      </button>
    );
  }

  function bin(c) {
    const inside = b.items.filter((it) => placed[it.id] === c.id);
    const over = drag && drag.over === c.id && !verified;
    const on = (sel !== null || over) && !verified;
    return (
      <div key={c.id} ref={(el) => { boxRefs.current[c.id] = el; }} onClick={() => tapBox(c.id)}
        style={{ width: 106, minHeight: 132, borderRadius: 14, border: `3px ${on ? "solid" : "dashed"} ${c.col}`, background: over ? "rgba(255,255,255,0.2)" : (on ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.2)"), cursor: (sel !== null && !verified) ? "pointer" : "default", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "7px 6px 9px", boxShadow: over ? `0 0 24px ${c.col}` : "none", transform: over ? "scale(1.03)" : "none", transition: "all 0.14s ease" }}>
        <div style={{ pointerEvents: "none", textAlign: "center", width: "100%" }}>
          <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 12.5, color: "#fff", letterSpacing: "0.02em" }}>{c.n}</span>
          <div style={{ height: 4, borderRadius: 999, background: c.col, marginTop: 4, boxShadow: `0 0 8px ${c.col}` }} />
        </div>
        {inside.map((it) => chip(it, true))}
      </div>
    );
  }

  const tray = b.items.filter((it) => !placed[it.id]);
  return (
    <div ref={rootRef} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", height: "100%", width: "100%", paddingTop: 58 }}>
      <div style={{ pointerEvents: "none", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 20, color: "#fff" }}>¿De qué continente es cada uno? Clasifica las 4 fichas.</span>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, minHeight: 0, width: "100%" }}>
        {/* Bandeja: las fichas todavía sin clasificar, en rejilla 2×2 (minHeight fijo
            para que el bloque de abajo no salte a medida que se vacía). */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, justifyContent: "center", justifyItems: "center", alignContent: "center", minHeight: 156 }}>
          {tray.map((it) => chip(it, false))}
          {tray.length === 0 && <span style={{ gridColumn: "1 / -1", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>¡Todas clasificadas! Toca ¡VERIFICAR!</span>}
        </div>
        {/* Los 4 cajones de continente */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", alignItems: "flex-start" }}>
          {J13_CONT.map((c) => bin(c))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// R2 · "Podio mundial" — ordenar por tap-swap (patrón 9).
// 7 rankings del cuadro "Datos continentales comparados". En 4 de ellos las fichas NO son
// continentes (montañas / ríos / lagos) para que no se memorice un orden único.
// ══════════════════════════════════════════════════════════════════
const J13_PODIOS = [
  { id: "superficie", q: "del continente MÁS extenso al menos extenso", u: "km²", emoji: "🗺️",
    items: [{ t: "Asia", v: 44936000 }, { t: "África", v: 30330000 }, { t: "Europa", v: 10530751 }, { t: "Oceanía", v: 9000000 }] },
  { id: "poblacion", q: "del continente MÁS poblado al menos poblado", u: "hab.", emoji: "👥",
    items: [{ t: "Asia", v: 4600000000 }, { t: "África", v: 1400000000 }, { t: "Europa", v: 748000000 }, { t: "Oceanía", v: 43000000 }] },
  { id: "pib", q: "del PIB MÁS alto al más bajo", u: "mill. USD", emoji: "📊",
    items: [{ t: "Asia", v: 38036943 }, { t: "Europa", v: 16810337 }, { t: "África", v: 2786695 }, { t: "Oceanía", v: 1670000 }] },
  { id: "percapita", q: "del PIB por persona MÁS alto al más bajo", u: "USD", emoji: "💰",
    items: [{ t: "Europa", v: 37466.51 }, { t: "Oceanía", v: 22647 }, { t: "Asia", v: 8326.24 }, { t: "África", v: 2109.84 }] },
  { id: "elevacion", q: "de la elevación MÁS alta a la más baja", u: "m", emoji: "🏔️",
    items: [{ t: "Everest", v: 8848 }, { t: "Kilimanjaro", v: 5895 }, { t: "Elbrus", v: 5633 }, { t: "Jaya", v: 4884 }] },
  { id: "rios", q: "del río MÁS largo al más corto", u: "km", emoji: "🏞️",
    items: [{ t: "Nilo", v: 6843 }, { t: "Río Azul", v: 5470 }, { t: "Murray", v: 3718 }, { t: "Volga", v: 3531 }] },
  { id: "lagos", q: "del lago MÁS grande al más pequeño", u: "km²", emoji: "💧",
    items: [{ t: "Mar Caspio", v: 371000 }, { t: "Victoria", v: 69482 }, { t: "Ladoga", v: 18400 }, { t: "Mackay", v: 3494 }] },
];
const J13_R2_KEY = "edinun_j13_r2_v1";
function j13R2Build() {
  const idx = j13PickIdx(J13_PODIOS, 1, J13_R2_KEY);
  j13Commit(J13_R2_KEY, idx, 6);
  const p = J13_PODIOS[idx[0]];
  let ord = j13Shuffle([0, 1, 2, 3]);
  for (let t = 0; t < 8 && ord.every((v, i) => v === i); t++) ord = j13Shuffle([0, 1, 2, 3]);
  return { p, ord };   // ord[puesto] = índice del item que el niño puso ahí
}

const J13_MEDALS = ["🥇", "🥈", "🥉", "4º"];
const J13_PEDESTAL = [124, 100, 76, 52];
// Cuerpo de la cifra revelada. Depende de DOS cosas: el largo del texto (el pedestal
// mide 106 px de ancho, y "4 600 000 000 hab." no cabe al mismo cuerpo que "6 843 km")
// y el PUESTO, porque el pedestal del 4º es el más bajo (52 px) y ahí no cabe una cifra
// grande en varias líneas. Sin el tope por puesto, la unidad se salía de la caja.
const J13_VCAP = [20, 19, 17, 14];
function vFs(txt, pos) {
  const n = txt.length, base = n <= 8 ? 20 : n <= 12 ? 17 : n <= 16 ? 15 : 13;
  return Math.min(base, J13_VCAP[pos]);
}

function R2Podio({ onSolve, verifyRef }) {
  const [b] = useStateG(() => j13R2Build());
  const [ord, setOrd] = useStateG(b.ord);
  const [sel, setSel] = useStateG(null);
  const [verified, setVerified] = useStateG(false);

  function tap(pos) {
    if (verified) return;
    if (sel === null) { setSel(pos); return; }
    if (sel === pos) { setSel(null); return; }
    setOrd((o) => { const n = o.slice(); const t = n[pos]; n[pos] = n[sel]; n[sel] = t; return n; });
    setSel(null);
  }
  function verificar() {
    if (verified) return;
    setVerified(true);
    const okCount = ord.filter((it, pos) => it === pos).length;
    onSolve(okCount === 4, {
      emoji: b.p.emoji, a: `Podio: ${b.p.q}`,
      userAnswer: ord.map((it, pos) => `${pos + 1}º ${b.p.items[it].t}`).join(", "),
      correctAnswer: b.p.items.map((it, i) => `${i + 1}º ${it.t}`).join(", "),
    }, okCount);
  }
  verifyRef.current = verificar;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", height: "100%", width: "100%", paddingTop: 58 }}>
      <div style={{ pointerEvents: "none", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 20, color: "#fff" }}>Arma el podio: {b.p.q}.</span>
      </div>
      {/* El podio se CENTRA verticalmente en la zona de juego (antes iba pegado abajo y
          dejaba medio lienzo vacío). El escalonado se conserva alineando las columnas por
          su base dentro del bloque interno. */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0, width: "100%" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 10 }}>
        {ord.map((itIdx, pos) => {
          const it = b.p.items[itIdx];
          const isSel = sel === pos, ok = verified && itIdx === pos;
          let border = "#f2c260";
          if (!verified && isSel) border = "#4fd8ff";
          if (verified) border = ok ? "#2ecc8f" : "#ff6b6b";
          return (
            <div key={pos} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}>
              <div style={{ fontSize: pos < 3 ? 20 : 14, lineHeight: 1, marginBottom: 3, fontFamily: "var(--ed-font-display)", fontWeight: 800, color: "#fce9a8" }}>{J13_MEDALS[pos]}</div>
              <button onClick={() => tap(pos)} disabled={verified}
                style={{ position: "relative", width: 106, minHeight: 60, borderRadius: 13, border: `3px solid ${border}`, background: "linear-gradient(180deg,#fff8e6,#f7e3a8)", color: "#3a2608", fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 12.5, lineHeight: 1.12, padding: "6px 5px", cursor: verified ? "default" : "pointer", transform: isSel ? "translateY(-4px) scale(1.05)" : "none", boxShadow: isSel ? "0 0 20px rgba(79,216,255,0.7)" : "inset 0 1px 0 rgba(255,255,255,0.7), 0 5px 12px rgba(0,0,0,0.3)", transition: "transform 0.14s ease" }}>
                {it.t}
                {verified && (
                  <span style={{ position: "absolute", top: -9, right: -8, fontSize: 12, fontWeight: 900, color: "#fff", background: ok ? "#1f8a54" : "#c0392b", borderRadius: "50%", width: 21, height: 21, display: "flex", alignItems: "center", justifyContent: "center" }}>{ok ? "✓" : "✗"}</span>
                )}
                {verified && !ok && (
                  // Se revela QUÉ iba en ESTE puesto (no a dónde va la ficha que puso el
                  // niño): junto a su ficha equivocada, es lo que deja ver el error y la
                  // respuesta a la vez.
                  <span style={{ position: "absolute", bottom: -11, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap", background: "linear-gradient(180deg,#ffe6a1,#f1c153)", border: "1.5px solid #e0a72c", borderRadius: 999, padding: "0 7px", fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 9, color: "#5a3d0a" }}>Aquí va: {b.p.items[pos].t}</span>
                )}
              </button>
              <div style={{ width: 106, height: J13_PEDESTAL[pos], marginTop: 6, borderRadius: "8px 8px 4px 4px", background: verified ? "linear-gradient(180deg, rgba(10,6,35,0.82), rgba(10,6,35,0.6))" : "linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0.07))", border: `1.5px solid rgba(242,194,96,${verified ? 0.85 : 0.45})`, boxShadow: verified ? "inset 0 1px 0 rgba(255,255,255,0.12)" : "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "8px 5px 0", transition: "background 0.2s ease" }}>
                {verified && (() => {
                  // Cifra y unidad van en el MISMO bloque de texto: así fluyen juntas y la
                  // unidad nunca se queda fuera de la caja (antes iba en línea aparte de
                  // altura fija y se salía del pedestal más bajo).
                  const num = j13Fmt(it.v), fs = vFs(num + " " + b.p.u, pos);
                  return (
                    <span style={{ display: "block", width: "100%", fontFamily: "var(--ed-font-mono)", fontWeight: 700, fontSize: fs, color: "#ffe9a8", textAlign: "center", lineHeight: 1.08, textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}>
                      {num}
                      <span style={{ fontFamily: "var(--ed-font-display)", fontSize: Math.max(9, Math.round(fs * 0.66)), color: "rgba(255,255,255,0.92)", whiteSpace: "nowrap" }}> {b.p.u}</span>
                    </span>
                  );
                })()}
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// R3 · "Cazador de errores" — marcar varios (patrón 7).
// La ficha de un continente sale con 3 datos suyos + 2 INFILTRADOS de otros continentes.
// El niño toca los intrusos + ¡VERIFICAR!. Al verificar, cada intruso muestra su
// continente verdadero (revelar la correcta en el lenguaje de la mecánica).
// ══════════════════════════════════════════════════════════════════
const J13_R3_KEY = "edinun_j13_r3_v1";
function j13R3Build() {
  const cIdx = j13PickIdx(J13_CONT, 1, J13_R3_KEY);
  j13Commit(J13_R3_KEY, cIdx, 3);
  const cont = J13_CONT[cIdx[0]];
  const own = j13Shuffle(J13_LUGARES.filter((x) => x.c === cont.id)).slice(0, 3).map((x) => ({ ...x, intruso: false }));
  const out = j13Shuffle(J13_LUGARES.filter((x) => x.c !== cont.id)).slice(0, 2).map((x) => ({ ...x, intruso: true }));
  return { cont, rows: j13Shuffle(own.concat(out)).map((r, i) => ({ ...r, id: i })) };
}

function R3Cazador({ onSolve, verifyRef }) {
  const [b] = useStateG(() => j13R3Build());
  const [mark, setMark] = useStateG({});
  const [verified, setVerified] = useStateG(false);
  function toggle(id) { if (verified) return; setMark((s) => Object.assign({}, s, { [id]: !s[id] })); }
  function verificar() {
    if (verified) return;
    setVerified(true);
    const cazados = b.rows.filter((r) => r.intruso && mark[r.id]).length;
    const limpios = b.rows.every((r) => !!mark[r.id] === r.intruso);
    onSolve(limpios, {
      emoji: "🔍", a: `¿Qué datos no son de ${b.cont.n}?`,
      userAnswer: b.rows.filter((r) => mark[r.id]).map((r) => r.t).join(", ") || "—",
      correctAnswer: b.rows.filter((r) => r.intruso).map((r) => r.t).join(", "),
    }, cazados);
  }
  verifyRef.current = verificar;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", height: "100%", width: "100%", paddingTop: 58 }}>
      <div style={{ pointerEvents: "none", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 20, color: "#fff" }}>La ficha de {b.cont.n} tiene 2 errores. Márcalos.</span>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0, width: "100%" }}>
        <div style={{ width: 430, borderRadius: 18, border: `3px solid ${b.cont.col}`, background: "linear-gradient(180deg, rgba(255,255,255,0.97), rgba(240,235,225,0.93))", padding: "10px 12px 12px", boxShadow: "0 12px 28px rgba(0,0,0,0.4)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, borderBottom: `2px solid ${b.cont.col}`, paddingBottom: 7, marginBottom: 7 }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>🌍</span>
            <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 17, color: "#2a2118", letterSpacing: "0.04em" }}>{b.cont.n}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {b.rows.map((r) => {
              const marked = !!mark[r.id];
              let bg = "rgba(0,0,0,0.05)", border = "transparent", badge = null, fix = null;
              if (!verified && marked) { bg = "rgba(79,216,255,0.22)"; border = "#2c9fc4"; }
              if (verified) {
                if (r.intruso) {
                  bg = marked ? "rgba(72,224,154,0.3)" : "rgba(255,139,139,0.3)";
                  border = marked ? "#1f8a54" : "#c0392b";
                  badge = marked ? "✓" : "✗";
                  fix = `es de ${j13Cont(r.c).n}`;
                } else if (marked) {
                  bg = "rgba(255,139,139,0.3)"; border = "#c0392b"; badge = "✗";
                  fix = `sí es de ${b.cont.n}`;
                }
              }
              return (
                <button key={r.id} onClick={() => toggle(r.id)} disabled={verified}
                  style={{ position: "relative", display: "flex", alignItems: "center", gap: 8, width: "100%", minHeight: 40, padding: "5px 10px", borderRadius: 10, border: `2px solid ${border}`, background: bg, cursor: verified ? "default" : "pointer", textAlign: "left", transition: "all 0.12s ease" }}>
                  <span style={{ fontSize: 19, lineHeight: 1, flexShrink: 0 }}>{r.e}</span>
                  <span style={{ fontFamily: "var(--ed-font-ui)", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7a6a52", width: 68, flexShrink: 0 }}>{r.k}</span>
                  <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 14, color: "#2a2118", flex: 1, minWidth: 0 }}>{r.t}</span>
                  {fix && <span style={{ whiteSpace: "nowrap", background: "linear-gradient(180deg,#ffe6a1,#f1c153)", border: "1.5px solid #e0a72c", borderRadius: 999, padding: "1px 8px", fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 9.5, color: "#5a3d0a" }}>{fix}</span>}
                  {badge && <span style={{ fontSize: 12, fontWeight: 900, color: "#fff", background: badge === "✓" ? "#1f8a54" : "#c0392b", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{badge}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Arreglo de rondas del TEMA 1 (cada mecánica y cada verbo distintos) ──
const J13_ROUNDS = [
  { C: R1Aduana, verify: true, bubble: (<>Arrastra cada ficha<br />a su continente.</>) },
  { C: R2Podio, verify: true, bubble: (<>Toca dos fichas<br />para intercambiarlas.</>) },
  { C: R3Cazador, verify: true, bubble: (<>Toca los datos<br />que no pertenecen.</>) },
];

// ══════════════════════════════════════════════════════════════════
// ══ TEMA 2 · "Las Américas y su geografía" (Tema 4 del libro · 12 años) ══
// Verbos NUEVOS, distintos a los tres del Tema 1 (arrastrar / intercambiar / cazar):
//   R1 ELEGIR entre dos opciones en cada hueco de una ficha.
//   R2 TECLEAR un número en un teclado numérico.
//
// ⚠ Todo el contenido sale TEXTUAL del tema. Quedan FUERA por defectos del libro:
//   · Mortalidad infantil: el libro rotula "punto máximo/mínimo" al revés del sentido
//     real (Cuba 4/1000 es la tasa MÁS BAJA y figura como "punto máximo") → no se usa.
//   · IDH de América Central: el texto destaca a Costa Rica (0,810) pero el cuadro y la
//     actividad 4 dan a Cuba (0,825) como el mayor → manda la actividad.
//   · Los ríos de América del Sur NO están ordenados por longitud en el libro (el
//     Orinoco 2140 km aparece antes que el Madeira 3250 km) → manda la cifra.
//   · Límites de América del Norte: la actividad 1 dice "al Sur y al Oeste con el
//     Océano Pacífico"; se usa el texto de Construcción del aprendizaje (N Ártico ·
//     E Atlántico · O Pacífico · S América Central), que es el coherente.
// ══════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════
// R1 · "Pasaporte de la región" — ELEGIR (patrón 6: huecos en una lectura).
// Ficha de una región con 3 huecos; cada hueco ofrece 2 opciones y el niño toca la
// correcta. ¡VERIFICAR! valida los 3 de una vez → una ronda = una jugada.
// ⭐ +1 por hueco correcto (hasta 3). Al fallar: la correcta en verde con ✓ y la que
// eligió el niño en rojo con ✗ (se ven las dos, invariante EDINUN).
// ══════════════════════════════════════════════════════════════════
const J13_AM_REGIONES = [
  {
    id: "norte", nom: "América del Norte", emoji: "🍁",
    campos: [
      { k: "Limita al norte con", ok: "el océano Ártico", no: "el océano Antártico" },
      { k: "Limita al este con", ok: "el océano Atlántico", no: "el océano Pacífico" },
      { k: "Limita al oeste con", ok: "el océano Pacífico", no: "el mar Caribe" },
      { k: "Limita al sur con", ok: "América Central", no: "América del Sur" },
      { k: "Su principal elevación es", ok: "el Monte McKinley", no: "el Cerro Aconcagua" },
      { k: "Su río más largo es", ok: "el Misisipi", no: "el Amazonas" },
      { k: "Su lago más grande es", ok: "el lago Superior", no: "el lago Titicaca" },
      { k: "Su extensión es de", ok: "24 710 000 km²", no: "17 855 914 km²" },
      { k: "Su población es de", ok: "579 millones", no: "50 millones" },
    ],
  },
  {
    id: "central", nom: "América Central y el Caribe", emoji: "🌴",
    campos: [
      { k: "Su principal elevación es", ok: "el Tajumulco", no: "el Monte McKinley" },
      { k: "Su río más largo es", ok: "el Usumacinta", no: "el Misisipi" },
      { k: "Su lago más grande es", ok: "el lago de Nicaragua", no: "el lago Maracaibo" },
      { k: "Su cordillera es la de", ok: "Talamanca", no: "los Andes" },
      { k: "Su territorio continental mide", ok: "523 000 km²", no: "239 000 km²" },
      { k: "Su población es de", ok: "50 millones", no: "430 millones" },
      { k: "En sus islas predomina el clima", ok: "tropical", no: "polar" },
      { k: "A las Antillas Mayores pertenece", ok: "Cuba", no: "Barbados" },
      { k: "A las Antillas Menores pertenece", ok: "Trinidad y Tobago", no: "Puerto Rico" },
    ],
  },
  {
    id: "sur", nom: "América del Sur", emoji: "🏔️",
    campos: [
      { k: "Limita al norte con", ok: "América Central y el Caribe", no: "el océano Ártico" },
      { k: "Limita al este con", ok: "el océano Atlántico", no: "el océano Pacífico" },
      { k: "Limita al oeste con", ok: "el océano Pacífico", no: "el océano Atlántico" },
      { k: "Limita al sur con", ok: "el océano Antártico", no: "el mar Caribe" },
      { k: "Su principal elevación es", ok: "el Cerro Aconcagua", no: "el Tajumulco" },
      { k: "Su río más largo es", ok: "el Amazonas", no: "el Misisipi" },
      { k: "Su lago más grande es", ok: "el lago Maracaibo", no: "el lago Superior" },
      { k: "Su extensión es de", ok: "17 855 914 km²", no: "24 710 000 km²" },
      { k: "Su población es de", ok: "430 millones", no: "579 millones" },
      { k: "Una de sus mesetas es la de", ok: "Mato Grosso", no: "Mongolia" },
    ],
  },
];

const J13_T2R1REG_KEY = "edinun_j13_t2r1reg_v1";
function j13T2R1CampoKey(id) { return "edinun_j13_t2r1_" + id + "_v1"; }
function j13T2R1Build() {
  // Región: 1 de 3, cap = banco−1 (para 1 solo ítem, cap alto = máxima variedad).
  const ri = j13PickIdx(J13_AM_REGIONES, 1, J13_T2R1REG_KEY)[0];
  j13Commit(J13_T2R1REG_KEY, [ri], 2);
  const reg = J13_AM_REGIONES[ri];
  // Campos: SUBCONJUNTO de 3 → cap < pool−3 (con 9-10 campos, cap 5) para no partir el
  // banco en grupos fijos que alternarían idénticos cada recarga.
  // ⚠ Dos campos NO pueden ofrecer el MISMO par de opciones (p. ej. "limita al este" y
  // "limita al oeste" comparten Atlántico/Pacífico): se vería como una fila repetida y
  // acertar una regalaría la otra. Se piden todos los índices por frescura y se toman los
  // 3 primeros con pares distintos.
  const ck = j13T2R1CampoKey(reg.id);
  const firma = (c) => [c.ok, c.no].slice().sort().join("|");
  const vistas = new Set(), ci = [];
  j13PickIdx(reg.campos, reg.campos.length, ck).forEach((i) => {
    if (ci.length >= 3) return;
    const f = firma(reg.campos[i]);
    if (vistas.has(f)) return;
    vistas.add(f); ci.push(i);
  });
  j13Commit(ck, ci, 5);
  const filas = ci.map((i, n) => {
    const c = reg.campos[i];
    return { id: n, k: c.k, ok: c.ok, opts: j13Shuffle([c.ok, c.no]) };
  });
  return { reg, filas };
}

function T2R1Pasaporte({ onSolve, verifyRef }) {
  const [b] = useStateG(() => j13T2R1Build());
  const [sel, setSel] = useStateG({});          // filaId -> texto elegido
  const [verified, setVerified] = useStateG(false);
  const completas = b.filas.every((f) => sel[f.id] !== undefined);

  function pick(fid, txt) { if (verified) return; setSel((s) => Object.assign({}, s, { [fid]: txt })); }
  function verificar() {
    if (verified || !completas) return;
    setVerified(true);
    const aciertos = b.filas.filter((f) => sel[f.id] === f.ok).length;
    onSolve(aciertos === b.filas.length, {
      emoji: b.reg.emoji, a: `Pasaporte de ${b.reg.nom}`,
      userAnswer: b.filas.map((f) => `${f.k} ${sel[f.id]}`).join(" · "),
      correctAnswer: b.filas.map((f) => `${f.k} ${f.ok}`).join(" · "),
    }, aciertos);
  }
  verifyRef.current = verificar;

  function optBtn(f, o) {
    const chosen = sel[f.id] === o, isOk = o === f.ok;
    let border = "#d9c48a", bg = "linear-gradient(180deg,#fffdf6,#f6ecd2)", col = "#3a2608", badge = null;
    if (!verified && chosen) { border = "#4fd8ff"; bg = "linear-gradient(180deg,#eaf9ff,#cdeeff)"; }
    if (verified) {
      if (isOk) { border = "#2ecc8f"; bg = "linear-gradient(180deg,rgba(72,224,154,0.95),rgba(26,143,95,0.92))"; col = "#06381f"; badge = "✓"; }
      else if (chosen) { border = "#ff6b6b"; bg = "linear-gradient(180deg,rgba(255,139,139,0.92),rgba(178,47,47,0.9))"; col = "#fff"; badge = "✗"; }
      else { bg = "linear-gradient(180deg,rgba(255,253,246,0.45),rgba(246,236,210,0.45))"; col = "rgba(58,38,8,0.4)"; }
    }
    return (
      <button key={o} onClick={() => pick(f.id, o)} disabled={verified}
        style={{ position: "relative", flex: 1, minWidth: 0, minHeight: 40, borderRadius: 11, border: `2.5px solid ${border}`, background: bg, color: col, fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 12.5, lineHeight: 1.15, padding: "5px 7px", cursor: verified ? "default" : "pointer", transform: (!verified && chosen) ? "translateY(-1px)" : "none", boxShadow: (!verified && chosen) ? "0 0 14px rgba(79,216,255,0.5), inset 0 1px 0 rgba(255,255,255,0.7)" : "inset 0 1px 0 rgba(255,255,255,0.7), 0 3px 8px rgba(0,0,0,0.22)", transition: "transform 0.12s ease" }}>
        {o}
        {badge && <span style={{ position: "absolute", top: -9, right: -7, fontSize: 11, fontWeight: 900, color: "#fff", background: badge === "✓" ? "#1f8a54" : "#c0392b", borderRadius: "50%", width: 19, height: 19, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 5px rgba(0,0,0,0.35)" }}>{badge}</span>}
      </button>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", height: "100%", width: "100%", paddingTop: 58 }}>
      <div style={{ pointerEvents: "none", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 22, color: "#fff" }}>Completa el pasaporte de {b.reg.nom}.</span>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0, width: "100%" }}>
        <div style={{ width: 442, background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(240,235,225,0.92))", border: "3px solid #f2c260", borderRadius: 18, padding: "11px 15px 13px", boxShadow: "0 12px 28px rgba(0,0,0,0.4)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, borderBottom: "2px solid rgba(224,167,44,0.55)", paddingBottom: 7, marginBottom: 9 }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>🛂</span>
            <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 14.5, letterSpacing: "0.03em", color: "#3a2608" }}>{b.reg.nom.toUpperCase()}</span>
            <span style={{ marginLeft: "auto", fontSize: 19, lineHeight: 1 }}>{b.reg.emoji}</span>
          </div>
          {b.filas.map((f, n) => (
            <div key={f.id} style={{ marginTop: n === 0 ? 0 : 9 }}>
              <div style={{ fontFamily: "var(--ed-font-ui)", fontSize: 10.5, letterSpacing: "0.07em", textTransform: "uppercase", color: "#7a5c1e", marginBottom: 3 }}>{f.k}</div>
              <div style={{ display: "flex", gap: 8 }}>{f.opts.map((o) => optBtn(f, o))}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// R2 · "Calculadora demográfica" — TECLEAR (patrón 3: respuesta única en teclado).
// Actividad 5 del libro: aplicar ((Pf − Pi) / Pi) × 100. La fórmula queda SIEMPRE
// visible (el libro la da en su recuadro): se ejercita aplicarla, no memorizarla.
// ⭐ +3 al acertar, para que pese lo mismo que los 3 huecos de la R1.
// ⚠ Los pares de cifras son EJERCICIOS DE CÁLCULO con el molde del libro ("un país pasó
// de X a Y millones"), redondos y de resultado entero; NO se nombra ningún país real ni
// se atribuye la cifra a nadie. El primero es el ejercicio literal del libro.
// ══════════════════════════════════════════════════════════════════
const J13_AM_TASAS = [
  { yi: 2010, yf: 2020, pi: 100, pf: 120 },   // +20 % — ejercicio 5 del libro
  { yi: 2000, yf: 2010, pi: 200, pf: 250 },   // +25 %
  { yi: 2010, yf: 2020, pi: 40, pf: 46 },     // +15 %
  { yi: 1990, yf: 2000, pi: 500, pf: 515 },   // +3 %
  { yi: 2000, yf: 2010, pi: 150, pf: 168 },   // +12 %
  { yi: 2010, yf: 2020, pi: 60, pf: 54 },     // −10 % (decrecimiento)
  { yi: 1990, yf: 2000, pi: 250, pf: 320 },   // +28 %
  { yi: 2000, yf: 2010, pi: 90, pf: 72 },     // −20 % (decrecimiento)
];
const J13_T2R2_KEY = "edinun_j13_t2r2_v1";
function j13T2R2Build() {
  const i = j13PickIdx(J13_AM_TASAS, 1, J13_T2R2_KEY)[0];
  j13Commit(J13_T2R2_KEY, [i], 7);            // 1 de 8 → cap = banco−1
  const t = J13_AM_TASAS[i];
  return { t, res: Math.round(((t.pf - t.pi) / t.pi) * 100) };
}

function T2R2Calculadora({ onSolve, verifyRef }) {
  const [b] = useStateG(() => j13T2R2Build());
  const [val, setVal] = useStateG("");
  const [neg, setNeg] = useStateG(false);
  const [verified, setVerified] = useStateG(false);
  const answer = (neg ? -1 : 1) * Number(val || "0");
  const ok = val !== "" && answer === b.res;
  const shown = (neg ? "−" : "") + (val === "" ? "" : val);

  function tap(k) {
    if (verified) return;
    // ⌫ borra de derecha a izquierda como un campo de texto: primero los dígitos y, cuando
    // ya no queda ninguno, el signo −. ⚠ Antes solo recortaba `val`: puesto el signo, el ⌫
    // no lo quitaba nunca y había que adivinar que se saca volviendo a tocar la tecla −.
    if (k === "del") {
      if (val === "") { setNeg(false); return; }
      setVal(val.slice(0, -1));
      return;
    }
    if (k === "neg") { setNeg((n) => !n); return; }
    setVal((v) => (v.length >= 3 ? v : (v === "0" ? k : v + k)));
  }
  function verificar() {
    if (verified || val === "") return;
    setVerified(true);
    onSolve(ok, {
      emoji: "📊", a: `Tasa de crecimiento (de ${b.t.pi} a ${b.t.pf} millones)`,
      userAnswer: `${shown} %`, correctAnswer: `${b.res} %`,
    }, ok ? 3 : 0);
  }
  verifyRef.current = verificar;

  function key(label, k, tone) {
    return (
      <button key={k} onClick={() => tap(k)} disabled={verified}
        style={{ height: 38, borderRadius: 10, border: "2px solid " + (tone || "#d9c48a"), background: tone ? "linear-gradient(180deg,#ffe6a1,#f1c153)" : "linear-gradient(180deg,#fffdf6,#f6ecd2)", color: "#3a2608", fontFamily: "var(--ed-font-mono)", fontWeight: 800, fontSize: 17, cursor: verified ? "default" : "pointer", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7), 0 3px 7px rgba(0,0,0,0.22)" }}>
        {label}
      </button>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", height: "100%", width: "100%", paddingTop: 58 }}>
      <div style={{ pointerEvents: "none", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 22, color: "#fff" }}>Calcula la tasa de crecimiento de este país.</span>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 14, minHeight: 0, width: "100%" }}>
        {/* Ficha: los dos censos + la fórmula del libro + el visor de la respuesta */}
        <div style={{ width: 288, background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(240,235,225,0.92))", border: "3px solid #f2c260", borderRadius: 18, padding: "11px 14px 12px", boxShadow: "0 12px 28px rgba(0,0,0,0.4)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, borderBottom: "2px solid rgba(224,167,44,0.55)", paddingBottom: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 19, lineHeight: 1 }}>👥</span>
            <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 14, letterSpacing: "0.03em", color: "#3a2608" }}>POBLACIÓN</span>
          </div>
          {[[b.t.yi, b.t.pi], [b.t.yf, b.t.pf]].map((r) => (
            <div key={r[0]} style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
              <span style={{ fontFamily: "var(--ed-font-mono)", fontSize: 13, color: "#7a5c1e", width: 42 }}>{r[0]}</span>
              <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 16, color: "#3a2608" }}>{r[1]} millones</span>
            </div>
          ))}
          <div style={{ borderTop: "1.5px dashed rgba(224,167,44,0.6)", marginTop: 8, paddingTop: 7 }}>
            <div style={{ fontFamily: "var(--ed-font-mono)", fontSize: 13, color: "#3a2608", textAlign: "center" }}>((Pf − Pi) / Pi) × 100</div>
            <div style={{ fontFamily: "var(--ed-font-ui)", fontSize: 9.5, color: "#7a5c1e", textAlign: "center", marginTop: 2 }}>Pf = población final · Pi = población inicial</div>
          </div>
          {/* Visor */}
          <div style={{ marginTop: 9, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "linear-gradient(180deg,#241a0a,#12100a)", border: `2.5px solid ${verified ? (ok ? "#2ecc8f" : "#ff6b6b") : "#e0a72c"}`, borderRadius: 12, padding: "6px 12px", minHeight: 40 }}>
            <span style={{ fontFamily: "var(--ed-font-mono)", fontWeight: 800, fontSize: 24, letterSpacing: "0.04em", color: verified ? (ok ? "#7ff0b8" : "#ff9c9c") : "#fce9a8", minWidth: 46, textAlign: "right" }}>{shown || "—"}</span>
            <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 18, color: "rgba(252,233,168,0.75)" }}>%</span>
          </div>
          {/* Al verificar: el desarrollo con las cifras puestas (verde) y, si falló, lo que tecleó (rojo) */}
          {verified && (
            <div style={{ marginTop: 7, textAlign: "center" }}>
              <div style={{ fontFamily: "var(--ed-font-mono)", fontSize: 11.5, fontWeight: 700, color: "#1f8a54", lineHeight: 1.25 }}>
                (({b.t.pf} − {b.t.pi}) / {b.t.pi}) × 100 = {b.res} %
              </div>
              {!ok && <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 11.5, color: "#c0392b", marginTop: 2 }}>Tu respuesta: {shown} %</div>}
            </div>
          )}
        </div>
        {/* Teclado numérico */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 46px)", gap: 6, flexShrink: 0 }}>
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => key(d, d))}
          {key("−", "neg", neg ? "#4fd8ff" : null)}
          {key("0", "0")}
          {key("⌫", "del", "#e0a72c")}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// R3 · "Sala de datos" — UNIR CON LÍNEAS (patrón 10: conectar columnas).
// Tocar una tarjeta de la izquierda y luego una de la derecha las enlaza con una línea
// curva de color (patrón calcado de `PR3Empareja` de juego-6: anclas por offset* + SVG;
// SIN número de pareja, la línea ya dice quién va con quién).
// ⭐ +1 por pareja correcta (hasta 3).
// Al fallar: la línea del niño se pinta ROJA y además aparece **punteada en dorado la
// correcta** → ve su error y la respuesta a la vez (invariante EDINUN).
// ══════════════════════════════════════════════════════════════════
const J13_AM_TABLEROS = [
  {
    enun: "Une cada instrumento con lo que mide.", emoji: "📈",   // actividad 4 a/b/c
    pares: [
      { a: "Tasa de crecimiento poblacional", b: "El crecimiento o la disminución de una población" },
      { a: "Producto Interno Bruto", b: "El total de bienes y servicios producidos por un país" },
      { a: "Índice de Desarrollo Humano", b: "El bienestar: educación, salud e ingresos" },
    ],
  },
  {
    // ⚠ La sigla NO va sola: los tableros salen al azar, así que el niño puede caer aquí
    // sin haber visto nunca el tablero que la define ("Índice de Desarrollo Humano ↔ El
    // bienestar: educación, salud e ingresos"). Se dice en claro y la sigla va detrás.
    enun: "Une cada región con su país de mayor desarrollo humano (IDH).", emoji: "🏅",  // actividad 4 d/e/f
    pares: [
      { a: "América del Norte", b: "Canadá" },
      { a: "América Central y el Caribe", b: "Cuba" },
      { a: "América del Sur", b: "Chile" },
    ],
  },
  {
    enun: "Une cada región con su principal elevación.", emoji: "🏔️",
    pares: [
      { a: "América del Norte", b: "Monte McKinley (6194 m)" },
      { a: "América Central y el Caribe", b: "Tajumulco (4220 m)" },
      { a: "América del Sur", b: "Cerro Aconcagua (6962 m)" },
    ],
  },
  {
    enun: "Une cada región con su río más largo.", emoji: "🏞️",
    pares: [
      { a: "América del Norte", b: "Misisipi (3780 km)" },
      { a: "América Central y el Caribe", b: "Usumacinta (1000 km)" },
      { a: "América del Sur", b: "Amazonas (6992 km)" },
    ],
  },
  {
    enun: "Une cada región con su lago más grande.", emoji: "💧",
    pares: [
      { a: "América del Norte", b: "Lago Superior (82 103 km²)" },
      { a: "América Central y el Caribe", b: "Lago de Nicaragua (8264 km²)" },
      { a: "América del Sur", b: "Lago Maracaibo (13 210 km²)" },
    ],
  },
  {
    enun: "Une cada región con su población.", emoji: "👥",
    pares: [
      { a: "América del Norte", b: "579 millones" },
      { a: "América Central y el Caribe", b: "50 millones" },
      { a: "América del Sur", b: "430 millones" },
    ],
  },
  {
    enun: "Une cada región con su extensión.", emoji: "🗺️",
    pares: [
      { a: "América del Norte", b: "24 710 000 km²" },
      { a: "América Central y el Caribe", b: "523 000 km² (continental)" },
      { a: "América del Sur", b: "17 855 914 km²" },
    ],
  },
];
// Colores de pareja (mismos que usa juego-6 para las líneas de enlace).
const J13_PAIR_COLORS = [
  { border: "#e0a72c", dot: "#e0a72c" },
  { border: "#4f8fef", dot: "#4f8fef" },
  { border: "#9b7be8", dot: "#9b7be8" },
];
const J13_T2R3_KEY = "edinun_j13_t2r3_v1";
function j13T2R3Build() {
  const i = j13PickIdx(J13_AM_TABLEROS, 1, J13_T2R3_KEY)[0];
  j13Commit(J13_T2R3_KEY, [i], 6);            // 1 de 7 → cap = banco−1
  const tab = J13_AM_TABLEROS[i];
  const izq = tab.pares.map((p, n) => ({ id: n, t: p.a }));
  // La derecha se baraja, y nunca sale ya resuelta (misma regla que el podio del Tema 1).
  let der = j13Shuffle(tab.pares.map((p, n) => ({ id: n, t: p.b })));
  let guard = 0;
  while (der.every((d, n) => d.id === n) && guard++ < 20) der = j13Shuffle(der);
  return { tab, izq, der };
}

function T2R3SalaDatos({ onSolve, verifyRef }) {
  const [b] = useStateG(() => j13T2R3Build());
  const [sel, setSel] = useStateG(null);        // índice de la tarjeta IZQUIERDA elegida
  const [pairs, setPairs] = useStateG({});      // izqId -> derId
  const [verified, setVerified] = useStateG(false);
  const wrapRef = useRefG(null), izqRefs = useRefG([]), derRefs = useRefG([]);
  const [anchors, setAnchors] = useStateG(null);
  const completas = b.izq.every((x) => pairs[x.id] !== undefined);

  // ⚠ Se recalcula también al VERIFICAR: ahí las tarjetas de la derecha crecen (les
  // aparece el "va con …") y, con las anclas viejas, las líneas quedarían descolocadas.
  useEffectG(() => {
    const iz = izqRefs.current.map((el) => (el ? { x: el.offsetLeft + el.offsetWidth, y: el.offsetTop + el.offsetHeight / 2 } : null));
    const de = derRefs.current.map((el) => (el ? { x: el.offsetLeft, y: el.offsetTop + el.offsetHeight / 2 } : null));
    setAnchors({ iz, de });
  }, [verified]);

  function tapIzq(i) { if (verified) return; setSel(i === sel ? null : i); }
  function tapDer(did) {
    if (verified || sel === null) return;
    setPairs((prev) => {                        // un destino solo puede tener un origen
      const next = {};
      Object.keys(prev).forEach((k) => { if (prev[k] !== did) next[k] = prev[k]; });
      next[sel] = did;
      return next;
    });
    setSel(null);
  }
  function verificar() {
    if (verified || !completas) return;
    setVerified(true);
    const aciertos = b.izq.filter((x) => pairs[x.id] === x.id).length;
    const nom = (did) => (b.der.find((d) => d.id === did) || {}).t || "?";
    onSolve(aciertos === b.izq.length, {
      emoji: b.tab.emoji, a: b.tab.enun.replace(/\.$/, ""),
      userAnswer: b.izq.map((x) => `${x.t} → ${nom(pairs[x.id])}`).join(" · "),
      correctAnswer: b.izq.map((x) => `${x.t} → ${nom(x.id)}`).join(" · "),
    }, aciertos);
  }
  verifyRef.current = verificar;

  function curva(a, c) { const dx = (c.x - a.x) * 0.5; return `M ${a.x} ${a.y} C ${a.x + dx} ${a.y} ${c.x - dx} ${c.y} ${c.x} ${c.y}`; }
  const derPorId = (did) => b.der.findIndex((d) => d.id === did);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", height: "100%", width: "100%", paddingTop: 58 }}>
      <div style={{ pointerEvents: "none", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 22, color: "#fff" }}>{b.tab.enun}</span>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0, width: "100%" }}>
        <div ref={wrapRef} style={{ position: "relative", display: "flex", alignItems: "center", gap: 58, justifyContent: "center" }}>
          {/* Líneas de enlace (viven en el hueco entre columnas, nunca sobre las tarjetas) */}
          {anchors && (
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }}>
              {Object.keys(pairs).map((k) => {
                const ii = Number(k), di = derPorId(pairs[k]);
                const a = anchors.iz[ii], c = anchors.de[di];
                if (!a || !c) return null;
                const bien = verified && pairs[k] === ii;
                const color = verified ? (bien ? "#2ecc8f" : "#ff6b6b") : J13_PAIR_COLORS[ii].dot;
                const d = curva(a, c);
                return (
                  <g key={"p" + k}>
                    <path d={d} stroke="rgba(0,0,0,0.30)" strokeWidth={8} fill="none" strokeLinecap="round" />
                    <path d={d} stroke={color} strokeWidth={5} fill="none" strokeLinecap="round" />
                    <circle cx={a.x} cy={a.y} r={5.5} fill={color} stroke="#fff" strokeWidth={2} />
                    <circle cx={c.x} cy={c.y} r={5.5} fill={color} stroke="#fff" strokeWidth={2} />
                  </g>
                );
              })}
              {/* El revelado NO va como segunda línea: 6 curvas en el mismo hueco quedan
                  ilegibles. Va como pastilla dorada dentro de la tarjeta derecha (abajo). */}
            </svg>
          )}
          {/* Izquierda */}
          <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            {b.izq.map((x) => {
              const pal = J13_PAIR_COLORS[x.id], unida = pairs[x.id] !== undefined, elegida = sel === x.id;
              const bien = verified && pairs[x.id] === x.id;
              let border = unida ? pal.border : "#d9c48a";
              if (elegida && !verified) border = "#4fd8ff";
              if (verified) border = bien ? "#2ecc8f" : "#ff6b6b";
              return (
                <button key={x.id} onClick={() => tapIzq(x.id)} disabled={verified}
                  ref={(el) => { izqRefs.current[x.id] = el; }}
                  style={{ position: "relative", width: 176, minHeight: 58, borderRadius: 13, border: `3px solid ${border}`, background: "linear-gradient(180deg,#fffdf6,#f6ecd2)", color: "#3a2608", fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 12.5, lineHeight: 1.2, padding: "7px 9px", cursor: verified ? "default" : "pointer", transform: (elegida && !verified) ? "translateX(2px) scale(1.03)" : "none", boxShadow: (elegida && !verified) ? "0 0 16px rgba(79,216,255,0.55), inset 0 1px 0 rgba(255,255,255,0.7)" : "inset 0 1px 0 rgba(255,255,255,0.7), 0 4px 10px rgba(0,0,0,0.25)", transition: "transform 0.12s ease" }}>
                  {x.t}
                  {verified && <span style={{ position: "absolute", top: -10, left: -8, fontSize: 12, fontWeight: 900, color: "#fff", background: bien ? "#1f8a54" : "#c0392b", borderRadius: "50%", width: 21, height: 21, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 5px rgba(0,0,0,0.35)" }}>{bien ? "✓" : "✗"}</span>}
                </button>
              );
            })}
          </div>
          {/* Derecha */}
          <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            {b.der.map((d, n) => {
              const dueño = Object.keys(pairs).find((k) => pairs[k] === d.id);
              const pal = dueño !== undefined ? J13_PAIR_COLORS[Number(dueño)] : null;
              let border = pal ? pal.border : "#d9c48a";
              if (verified) border = (dueño !== undefined && Number(dueño) === d.id) ? "#2ecc8f" : (dueño !== undefined ? "#ff6b6b" : "#d9c48a");
              const clicable = sel !== null && !verified;
              return (
                <button key={d.id} onClick={() => tapDer(d.id)} disabled={verified}
                  ref={(el) => { derRefs.current[n] = el; }}
                  style={{ width: 210, minHeight: 58, borderRadius: 13, border: `3px solid ${border}`, background: "linear-gradient(180deg,#fffdf6,#f6ecd2)", color: "#3a2608", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 11.5, lineHeight: 1.2, padding: "7px 9px", cursor: clicable ? "pointer" : "default", boxShadow: clicable ? "0 0 12px rgba(242,194,96,0.45), inset 0 1px 0 rgba(255,255,255,0.7)" : "inset 0 1px 0 rgba(255,255,255,0.7), 0 4px 10px rgba(0,0,0,0.25)", transition: "box-shadow 0.14s ease" }}>
                  {d.t}
                  {/* Revelado: cada dato dice de quién era. Se ve junto a la línea del
                      niño (verde o roja), así compara su respuesta con la correcta. */}
                  {verified && (
                    <span style={{ display: "block", marginTop: 5, paddingTop: 4, borderTop: "1.5px dashed rgba(224,167,44,0.7)", fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 10, lineHeight: 1.15, color: "#8a6410" }}>
                      va con {b.izq[d.id].t}
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

// ── Arreglo de rondas del TEMA 2 (3 rondas, 3 verbos: elegir · teclear · unir) ──
const J13_AM_ROUNDS = [
  { C: T2R1Pasaporte, verify: true, bubble: (<>Toca una opción<br />en cada línea.</>) },
  // ⚠ El bocadillo dice CÓMO se juega (tocar los números), no qué fórmula usar: "Usa la
  // fórmula de la ficha" no dejaba claro que se escribe con el teclado. La fórmula ya está
  // impresa en la ficha, a la vista.
  { C: T2R2Calculadora, verify: true, bubble: (<>Escribe el resultado<br />con los números.</>) },
  { C: T2R3SalaDatos, verify: true, bubble: (<>Toca una tarjeta<br />y luego su pareja.</>) },
];

// ══════════════════════════════════════════════════════════════════
// ══ TEMA 3 · "La diversidad cultural de la población mundial" (13 años) ══
// Verbos NUEVOS: ninguno se repite de los temas 1 y 2 (allá se arrastra a cajones, se
// intercambia, se marcan intrusos, se elige opción, se teclea y se une con líneas).
//   R1 DESLIZAR la carta al lado que corresponde.
//   R2 VOLTEAR cartas para encontrar las parejas (memoria).
//   R3 ATRAPAR al vuelo las palabras que la diversidad aporta.
//
// ⚠ A diferencia de los temas 1 y 2, este tema NO tiene cuadros de datos: es actitudinal.
// Todo el contenido sale TEXTUAL de las pp. 125-126 y de las opciones de las actividades
// 1 y 2 del cuaderno (p. 86). Las actividades 3 y 4 son de respuesta ABIERTA (conversar,
// reflexionar) → no se gamifican.
// ⚠ NO se reproducen las fotos del libro ni se generan caras de personas reales
// (memory/personas-reales-sin-generar-caras.md). Las cartas de la R2 aceptan imagen
// propia vía `img`; mientras no lleguen, corren con emoji.
// ══════════════════════════════════════════════════════════════════

// ── Ideas que VALORAN la diversidad (textuales del tema y de la actividad 1) ──
const J13_DIV_PRO = [
  { t: "Es fuente de alternativas y de capacidades humanas." },
  { t: "Es fuente de valores y de formas de entender el mundo." },
  { t: "Es fuente de la sabiduría y los conocimientos del pasado." },
  { t: "Sus conocimientos son recursos para dar respuestas al futuro." },
  { t: "Puede impulsar el desarrollo de individuos, comunidades y países." },
  { t: "Sus aprendizajes se entregarán a las futuras generaciones." },
  { t: "Hace falta un entorno que la respete, proteja y conserve." },
  { t: "Cada cultura es una respuesta a cómo llevar a cabo la vida misma." },
  { t: "Enriquece nuestra vida intelectual, afectiva, moral y espiritual." },
  { t: "Ninguna manera de comprender el mundo es más importante que otra." },
  { t: "Solo en conjunto las culturas mejoran la vida de la humanidad." },
  { t: "Muestra la capacidad de la humanidad para crear y entender el mundo." },
  { t: "Una identidad cultural única enriquece la diversidad global." },
  { t: "Forma parte de la identidad de los pueblos." },
];

// ── Ideas que la ATACAN. Salen de los distractores de las actividades 1 y 2 del
// cuaderno y de lo que el texto niega expresamente. No se inventó ninguna. ──
const J13_DIV_CON = [
  { t: "Es fuente de conflictos y de guerras." },
  { t: "Refleja qué tan importante es un ser humano respecto a otro." },
  { t: "Sirve para saber cuál pueblo es mejor que otro." },
  { t: "Sirve para decidir qué pueblos dominan y cuáles son dominados." },
  { t: "Esos conocimientos no se deben compartir con el resto del mundo." },
  { t: "Las generaciones actuales ya no necesitan esos aprendizajes." },
  { t: "No contribuye en nada al mundo de hoy." },
  { t: "Hay culturas mejores que otras." },
];

// Banco ÚNICO de 22 ideas (14 que valoran + 8 que atacan) con una sola clave FIFO.
// ⚠ Se sortean las 2 del mismo pozo A PROPÓSITO, pudiendo salir las dos del mismo lado:
// con 2 cartas, forzar "una de cada" regalaría la segunda (si la 1ª ataca, la 2ª enriquece).
const J13_DIV_IDEAS = J13_DIV_PRO.map((x) => ({ t: x.t, v: 1 })).concat(J13_DIV_CON.map((x) => ({ t: x.t, v: -1 })));
const J13_T3R1_KEY = "edinun_j13_t3r1_v1";
const J13_T3R1_N = 2;

function j13T3R1Build() {
  const idx = j13PickIdx(J13_DIV_IDEAS, J13_T3R1_N, J13_T3R1_KEY);
  j13Commit(J13_T3R1_KEY, idx, 12);        // subconjunto de 2 sobre 22 → cap 12 (< 22−2)
  const cartas = idx.map((i, n) => Object.assign({}, J13_DIV_IDEAS[i], { id: n }));
  return { cartas };
}

const J13_T3R1_TH = 70;   // px de arrastre para que la carta se decida

// ══════════════════════════════════════════════════════════════════
// R1 · "El muro" — DESLIZAR (patrón 14). 5 cartas, una a una: izquierda = LA ATACA,
// derecha = LA ENRIQUECE. Valida AL SOLTAR (sin ¡VERIFICAR!) y la carta sale volando
// hacia el lado CORRECTO, con pastilla "Va en: …" cuando se falló.
// Respaldo tap: los dos rótulos laterales son botones y deciden igual.
// ⭐ +1 por carta bien clasificada (hasta 5).
// ══════════════════════════════════════════════════════════════════
function T3R1Muro({ onSolve }) {
  const [b] = useStateG(() => j13T3R1Build());
  const [i, setI] = useStateG(0);
  const [dx, setDx] = useStateG(0);
  const [fallo, setFallo] = useStateG(null);      // {v, ok} de la carta ya decidida
  const drag = useRefG(null);
  const hechas = useRefG([]);
  const cerrado = useRefG(false);

  const carta = b.cartas[i] || null;
  const lado = (v) => (v > 0 ? "LA ENRIQUECE" : "LA ATACA");

  function decidir(v) {
    if (!carta || fallo) return;
    drag.current = null;
    const ok = v === carta.v;
    hechas.current = hechas.current.concat([{ t: carta.t, v: carta.v, elegido: v, ok }]);
    setFallo({ v, ok });
    // ⚠ Al decidir, la carta VUELVE AL CENTRO. Dos intentos fallidos antes de esto:
    //   1. Volaba 520 px y desaparecía → en la última carta el centro quedaba vacío los
    //      ~2,4 s que tarda en salir el cartel y parecía que el juego se había colgado.
    //   2. Se quedaba desplazada 40 px → se montaba sobre el riel (que se pinta después y
    //      va encima): el ✓/✗ quedaba escondido detrás y el texto cortado. "Pausado a
    //      medias", en palabras de la autora.
    // La dirección ya la comunican el riel correcto ENCENDIDO y la pastilla "Va en: …",
    // así que la carta no necesita moverse.
    setDx(0);
    setTimeout(() => {
      if (i + 1 < b.cartas.length) { setI(i + 1); setDx(0); setFallo(null); return; }
      if (cerrado.current) return;
      cerrado.current = true;
      const aciertos = hechas.current.filter((h) => h.ok).length;
      onSolve(aciertos === b.cartas.length, {
        emoji: "💬", a: "¿Qué ideas enriquecen la diversidad cultural?",
        userAnswer: hechas.current.map((h) => `${h.t} → ${lado(h.elegido)}`).join(" · "),
        correctAnswer: hechas.current.map((h) => `${h.t} → ${lado(h.v)}`).join(" · "),
      }, aciertos);
    }, ok ? 700 : 1600);
  }

  function onDown(e) { if (fallo) return; drag.current = { x0: e.clientX }; try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {} }
  function onMove(e) { if (!drag.current || fallo) return; setDx(e.clientX - drag.current.x0); }
  function onUp() {
    if (!drag.current || fallo) return;
    const d = dx; drag.current = null;
    if (Math.abs(d) >= J13_T3R1_TH) decidir(d > 0 ? 1 : -1); else setDx(0);
  }

  // El lado al que apunta el arrastre se enciende; tras decidir, se enciende el CORRECTO.
  // Los dos rótulos van SIEMPRE con su color (rieles del muro), no solo al apuntarlos: la
  // autora los pidió mucho más evidentes porque en verde sobre verde no se leían.
  const apunta = fallo ? carta.v : (Math.abs(dx) >= J13_T3R1_TH ? (dx > 0 ? 1 : -1) : 0);
  function rotulo(v) {
    const on = apunta === v, txt = lado(v);
    const col = v > 0 ? "#2ecc8f" : "#ff6b6b";
    // ⚠ Opacidad alta a propósito: a 0.42 el rojo sobre el fondo verde del juego se veía
    // MARRÓN y el rótulo no se distinguía. Tienen que leerse rojo y verde de una.
    const base = v > 0
      ? "linear-gradient(180deg, rgba(38,175,116,0.75), rgba(16,95,62,0.85))"
      : "linear-gradient(180deg, rgba(214,63,63,0.75), rgba(138,26,26,0.85))";
    const alto = v > 0
      ? "linear-gradient(180deg, rgba(72,224,154,0.92), rgba(26,143,95,0.9))"
      : "linear-gradient(180deg, rgba(255,139,139,0.92), rgba(178,47,47,0.9))";
    return (
      <button onClick={() => decidir(v)} disabled={!!fallo}
        style={{ flexShrink: 0, width: 104, height: 132, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, borderRadius: 16, border: `3px solid ${on ? "#fff" : col}`, background: on ? alto : base, color: "#fff", fontFamily: "var(--ed-font-display)", fontWeight: 900, fontSize: 14, lineHeight: 1.15, letterSpacing: "0.03em", padding: "10px 6px", cursor: fallo ? "default" : "pointer", textShadow: "0 2px 6px rgba(0,0,0,0.55)", boxShadow: on ? `0 0 26px ${col}, inset 0 1px 0 rgba(255,255,255,0.35)` : `0 6px 16px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.22)`, transform: on ? "scale(1.05)" : "none", transition: "all 0.15s ease" }}>
        <span style={{ fontSize: 26, lineHeight: 1 }}>{v > 0 ? "▶" : "◀"}</span>
        {txt}
      </button>
    );
  }

  // ⚠ `overflow:hidden` es OBLIGATORIO: la carta decidida sale volando 520 px y la zona de
  // juego mide 470 — sin recorte se escapaba del lienzo y aterrizaba sobre REINICIAR/SALIR.
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%", width: "100%", paddingTop: 58, overflow: "hidden" }}>
      <div style={{ pointerEvents: "none", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 20, color: "#fff" }}>¿Esta idea enriquece la diversidad cultural o la ataca?</span>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, minHeight: 0, width: "100%" }}>
        {rotulo(-1)}
        <div style={{ position: "relative", flex: 1, minWidth: 0, display: "flex", justifyContent: "center" }}>
          {carta && (
            <div onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
              style={{ position: "relative", width: "100%", maxWidth: 246, minHeight: 168, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "16px 15px", borderRadius: 18, border: `3px solid ${fallo ? (fallo.ok ? "#2ecc8f" : "#ff6b6b") : "#f2c260"}`, background: "linear-gradient(180deg, rgba(255,255,255,0.97), rgba(240,235,225,0.93))", boxShadow: "0 14px 30px rgba(0,0,0,0.45)", cursor: fallo ? "default" : "grab", touchAction: "none", userSelect: "none", WebkitUserSelect: "none", transform: `translateX(${dx}px) rotate(${dx * 0.05}deg)`, transition: drag.current ? "none" : "transform 0.35s ease, border-color 0.2s ease" }}>
              <span style={{ fontSize: 22, lineHeight: 1 }}>💬</span>
              <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 15, lineHeight: 1.28, color: "#2a2118", textAlign: "center" }}>{carta.t}</span>
              {fallo && (
                /* El ✓/✗ va DENTRO de la carta: asomando por el borde quedaba tapado por el riel. */
                <span style={{ position: "absolute", top: 9, right: 9, fontSize: 15, fontWeight: 900, color: "#fff", background: fallo.ok ? "#1f8a54" : "#c0392b", borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 8px rgba(0,0,0,0.4)" }}>{fallo.ok ? "✓" : "✗"}</span>
              )}
              {fallo && !fallo.ok && (
                <span style={{ position: "absolute", bottom: -13, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap", background: "linear-gradient(180deg,#ffe6a1,#f1c153)", border: "1.5px solid #e0a72c", borderRadius: 999, padding: "3px 12px", fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 11, color: "#5a3d0a" }}>Va en: {lado(carta.v)}</span>
              )}
            </div>
          )}
        </div>
        {rotulo(1)}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 7, paddingBottom: 4 }}>
        {b.cartas.map((c, n) => {
          const hecha = hechas.current[n];
          return <div key={c.id} style={{ width: 10, height: 10, borderRadius: "50%", background: hecha ? (hecha.ok ? "#fce9a8" : "#ff6b6b") : (n === i ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.22)") }} />;
        })}
      </div>
    </div>
  );
}

// ── Los 4 casos culturales del tema. `img` queda listo para las ilustraciones que va a
// generar la autora (ruta relativa dentro de assets/); mientras sea null, manda el emoji.
// ⚠ Ilustraciones de ELEMENTOS culturales, nunca retratos de personas reales. ──
const J13_DIV_TABLEROS = [
  {
    id: "lugar", rel: "cada cultura con su lugar",
    parejas: [
      { k: "taegeukgi", e: "☯️", img: null, t: "Taegeukgi", r: "🇰🇷 Corea del Sur" },
      { k: "holi", e: "🎨", img: null, t: "Festival de Holi", r: "🇮🇳 India" },
      { k: "padaung", e: "💍", img: null, t: "Pueblo Padaung", r: "🇹🇭 Tailandia" },
      { k: "pimampiro", e: "🎭", img: null, t: "Fiestas de Pimampiro", r: "🇪🇨 Ecuador" },
    ],
  },
  {
    id: "signif", rel: "cada cultura con lo que representa",
    parejas: [
      { k: "taegeuk", e: "☯️", img: null, t: "Círculo Taegeuk", r: "El equilibrio entre fuerzas opuestas" },
      { k: "holi", e: "🎨", img: null, t: "Festival de Holi", r: "La llegada de la primavera" },
      { k: "padaung", e: "💍", img: null, t: "Pueblo Padaung", r: "La belleza ligada al largo del cuello" },
      { k: "pimampiro", e: "🎭", img: null, t: "Fiestas de Pimampiro", r: "La herencia de las culturas ancestrales" },
    ],
  },
];

const J13_T3R2_KEY = "edinun_j13_t3r2_v1";
function j13T3R2FueraKey(id) { return "edinun_j13_t3r2fuera_" + id + "_v1"; }
const J13_T3R2_INTENTOS = 8;

// Marca de las parejas que el niño NO resolvió, al destapar el tablero. Va COLOR + FORMA
// (no número: la autora los quitó en juego-6) porque con varias parejas destapadas a la
// vez el "era pareja" suelto no dejaba ver cuál iba con cuál. Verde y rojo quedan fuera:
// están reservados a acertó/falló en todo el juego.
const J13_DIV_PARCOL = [
  { c: "#e0a72c", g: "●" },
  { c: "#4f8fef", g: "▲" },
  { c: "#9b7be8", g: "■" },
  { c: "#ef7fb0", g: "◆" },
];

function j13T3R2Build() {
  const ti = j13PickIdx(J13_DIV_TABLEROS, 1, J13_T3R2_KEY)[0];
  j13Commit(J13_T3R2_KEY, [ti], 1);               // 1 de 2 → cap = banco−1
  const tab = J13_DIV_TABLEROS[ti];
  // De las 4 parejas del tablero juegan 3: se sortea CUÁL SE QUEDA FUERA, con su propia
  // clave FIFO (1 de 4, cap 3), para que en partidas seguidas no falte siempre la misma y
  // los 4 casos culturales del libro sigan apareciendo a lo largo de varias partidas.
  const fk = j13T3R2FueraKey(tab.id);
  const fuera = j13PickIdx(tab.parejas, 1, fk)[0];
  j13Commit(fk, [fuera], 3);
  const parejas = tab.parejas.filter((_, n) => n !== fuera);
  const cartas = [];
  parejas.forEach((p, n) => {
    cartas.push({ id: "a" + n, par: n, cara: "a", e: p.e, img: p.img, t: p.t });
    cartas.push({ id: "b" + n, par: n, cara: "b", e: null, img: null, t: p.r });
  });
  return { tab, parejas, cartas: j13Shuffle(cartas) };
}

// ══════════════════════════════════════════════════════════════════
// R2 · "Memoria cultural" — VOLTEAR (patrón 10, variante memoria). 6 cartas en 3×2.
// ⚠ Se eligió memoria porque el T2 R3 "Sala de datos" ya se llevó UNIR CON LÍNEAS: el
// "Pasaporte cultural" que estaba aprobado habría repetido mecánica (decisión de la
// autora: ningún verbo repetido entre temas).
// ⚠ Empezó con 4 parejas y 10 intentos y la autora la encontró DEMASIADO DIFÍCIL, con
// razón: aquí no se emparejan dos cartas iguales sino un concepto con su explicación (hay
// que recordar la posición Y saber el contenido), y sin las ilustraciones las 6 cartas son
// texto. Se bajó a 3 parejas / 8 intentos por decisión suya.
// Al agotar los intentos se DESTAPAN las parejas que faltaban (color + forma).
// ⭐ +1 por pareja encontrada (hasta 3).
// ══════════════════════════════════════════════════════════════════
function T3R2Memoria({ onSolve }) {
  const [b] = useStateG(() => j13T3R2Build());
  const [vueltas, setVueltas] = useStateG([]);    // ids boca arriba ahora (0, 1 o 2)
  const [hechas, setHechas] = useStateG([]);      // nº de pareja ya resuelta
  const [intentos, setIntentos] = useStateG(0);
  const [revelado, setRevelado] = useStateG(false);
  const lock = useRefG(false);
  const cerrado = useRefG(false);

  function terminar(nHechas) {
    if (cerrado.current) return;
    cerrado.current = true;
    setRevelado(true);
    onSolve(nHechas === b.parejas.length, {
      emoji: "🎴", a: `Memoria cultural: ${b.tab.rel}`,
      userAnswer: `${nHechas} de ${b.parejas.length} parejas`,
      correctAnswer: b.parejas.map((p) => `${p.t} → ${p.r}`).join(" · "),
    }, nHechas);
  }

  function tocar(c) {
    if (lock.current || revelado) return;
    if (hechas.indexOf(c.par) !== -1) return;
    if (vueltas.indexOf(c.id) !== -1) return;
    if (vueltas.length === 0) { setVueltas([c.id]); return; }

    const prev = b.cartas.find((x) => x.id === vueltas[0]);
    const par = prev && prev.par === c.par;
    setVueltas([vueltas[0], c.id]);
    lock.current = true;
    const nIntentos = intentos + 1;
    setIntentos(nIntentos);

    setTimeout(() => {
      if (par) {
        const nh = hechas.concat([c.par]);
        setHechas(nh); setVueltas([]); lock.current = false;
        if (nh.length === b.parejas.length) terminar(nh.length);
      } else {
        setVueltas([]); lock.current = false;
        if (nIntentos >= J13_T3R2_INTENTOS) terminar(hechas.length);
      }
    }, par ? 480 : 900);
  }

  function cara(c) {
    const resuelta = hechas.indexOf(c.par) !== -1;
    const arriba = resuelta || revelado || vueltas.indexOf(c.id) !== -1;
    // Al revelar, las que el niño NO resolvió se marcan con el color+forma de SU pareja.
    const perdida = revelado && !resuelta;
    const pc = J13_DIV_PARCOL[c.par % J13_DIV_PARCOL.length];
    const borde = resuelta ? "#2ecc8f" : perdida ? pc.c : "#f2c260";
    return (
      <button key={c.id} onClick={() => tocar(c)} disabled={revelado}
        style={{ position: "relative", height: 118, borderRadius: 13, border: "none", background: "transparent", padding: 0, cursor: revelado || resuelta ? "default" : "pointer", perspective: 700 }}>
        <div style={{ position: "relative", width: "100%", height: "100%", transformStyle: "preserve-3d", transition: "transform 0.36s ease", transform: arriba ? "rotateY(180deg)" : "none" }}>
          {/* Dorso */}
          <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", borderRadius: 13, border: "2.5px solid rgba(242,194,96,0.7)", background: "linear-gradient(150deg, rgba(32,20,78,0.96), rgba(12,8,40,0.96))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, color: "rgba(252,233,168,0.85)", boxShadow: "0 6px 16px rgba(0,0,0,0.4)" }}>🌍</div>
          {/* Frente */}
          <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)", borderRadius: 13, border: `2.5px solid ${borde}`, background: "linear-gradient(180deg, rgba(255,255,255,0.97), rgba(240,235,225,0.93))", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, padding: "6px 6px", boxShadow: resuelta ? "0 0 14px rgba(46,204,143,0.6)" : "0 6px 16px rgba(0,0,0,0.35)" }}>
            {c.img ? (
              <img src={c.img} alt={c.t} style={{ width: "100%", height: 46, objectFit: "contain" }} />
            ) : c.e ? (
              <span style={{ fontSize: 26, lineHeight: 1 }}>{c.e}</span>
            ) : null}
            <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: c.t.length > 26 ? 9.5 : 11, lineHeight: 1.18, color: "#2a2118", textAlign: "center" }}>{c.t}</span>
            {resuelta && <span style={{ position: "absolute", top: -8, right: -6, fontSize: 11, fontWeight: 900, color: "#fff", background: "#1f8a54", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</span>}
            {perdida && <span style={{ position: "absolute", bottom: -10, left: "50%", transform: "translateX(-50%)", width: 22, height: 22, borderRadius: "50%", background: pc.c, border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.4)" }}>{pc.g}</span>}
          </div>
        </div>
      </button>
    );
  }

  const restantes = Math.max(0, J13_T3R2_INTENTOS - intentos);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%", width: "100%", paddingTop: 58 }}>
      <div style={{ pointerEvents: "none", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 20, color: "#fff" }}>Encuentra la pareja: {b.tab.rel}.</span>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0, width: "100%" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 142px)", gap: 12 }}>
          {b.cartas.map((c) => cara(c))}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, paddingBottom: 6, fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 12.5, color: "#fce9a8", textShadow: "0 2px 6px rgba(0,0,0,0.6)" }}>
        <span>🎴 parejas {hechas.length}/{b.parejas.length}</span>
        {revelado
          ? <span style={{ color: "#fff" }}>Las que faltaron: mismo color = pareja.</span>
          : <span style={{ color: restantes <= 3 ? "#ff9b9b" : "#fce9a8" }}>te quedan {restantes} intentos</span>}
      </div>
    </div>
  );
}

// ── Palabras del tema. Las de APORTA salen del párrafo "La riqueza de la diversidad"
// (alternativas, capacidades humanas, valores, formas de entender el mundo, sabiduría,
// conocimientos del pasado, recursos, desarrollo) más identidad/aprendizajes/respeto y
// los valores del recuadro de la Taegeukgi. Las de NO APORTA son los distractores. ──
const J13_DIV_APORTA = [
  "alternativas", "capacidades humanas", "valores", "formas de entender el mundo",
  "sabiduría", "conocimientos del pasado", "recursos", "desarrollo", "identidad",
  "aprendizajes", "respeto", "unidad", "solidaridad",
];
const J13_DIV_NOAPORTA = ["conflictos", "guerras", "dominadores", "dominados", "discriminación", "ataque"];

const J13_T3R3AP_KEY = "edinun_j13_t3r3ap_v1";
const J13_T3R3NO_KEY = "edinun_j13_t3r3no_v1";
const J13_T3R3_BUENAS = 6;
const J13_T3R3_MALAS = 4;
const J13_T3R3_CAIDA = 3400;    // ms que tarda una palabra en cruzar el carril
const J13_T3R3_GAP = 1450;      // ms entre apariciones

function j13T3R3Build() {
  const ai = j13PickIdx(J13_DIV_APORTA, J13_T3R3_BUENAS, J13_T3R3AP_KEY);
  const ni = j13PickIdx(J13_DIV_NOAPORTA, J13_T3R3_MALAS, J13_T3R3NO_KEY);
  j13Commit(J13_T3R3AP_KEY, ai, 6);               // 6 de 13 → cap 6 (< 13−6)
  j13Commit(J13_T3R3NO_KEY, ni, 1);               // 4 de 6 → cap 1 (< 6−4)
  const mezcla = j13Shuffle(
    ai.map((i) => ({ txt: J13_DIV_APORTA[i], good: true })).concat(ni.map((i) => ({ txt: J13_DIV_NOAPORTA[i], good: false })))
  );
  // Carriles repartidos en ciclo barajado: nunca 3 seguidas en el mismo.
  let ciclo = [];
  const palabras = mezcla.map((p, n) => {
    if (ciclo.length === 0) ciclo = j13Shuffle([0, 1, 2]);
    return Object.assign({}, p, { id: n, carril: ciclo.pop(), t0: n * J13_T3R3_GAP });
  });
  return { palabras, fin: (palabras.length - 1) * J13_T3R3_GAP + J13_T3R3_CAIDA + 250 };
}

// ══════════════════════════════════════════════════════════════════
// R3 · "Lluvia de palabras" — ATRAPAR (patrón 13). 10 palabras por 3 carriles: 6 que la
// diversidad aporta + 4 que no. Tocar una buena suma; tocar una mala marca ✗ pero NO
// resta (invariante EDINUN). Al final, cartel con las buenas que se escaparon.
// ⭐ +1 por palabra buena atrapada (hasta 6).
// ══════════════════════════════════════════════════════════════════
function T3R3Lluvia({ onSolve }) {
  const [b] = useStateG(() => j13T3R3Build());
  const [tomadas, setTomadas] = useStateG({});    // id -> true (atrapada)
  const [erradas, setErradas] = useStateG({});    // id -> true (mala tocada)
  const [fin, setFin] = useStateG(false);
  const cerrado = useRefG(false);
  const marcadas = useRefG({});                   // espejo sin re-render, para `tocar`

  // ⚠ La caída la anima CSS (@keyframes + animationDelay), NO React. El primer intento
  // repintaba la posición con un setInterval de 50 ms = 20 fps y se veía a tirones; ahora
  // el compositor la lleva a 60 fps y React solo re-renderiza al tocar una palabra.
  // Un único timeout cierra la ronda: no hace falta saber dónde va cada palabra.
  useEffectG(() => {
    const t = setTimeout(() => {
      if (cerrado.current) return;
      cerrado.current = true;
      setFin(true);
    }, b.fin);
    return () => clearTimeout(t);
  }, []);

  useEffectG(() => {
    if (!fin) return;
    const buenas = b.palabras.filter((p) => p.good);
    const atrapadas = buenas.filter((p) => tomadas[p.id]);
    const malasTocadas = b.palabras.filter((p) => !p.good && erradas[p.id]);
    onSolve(atrapadas.length === buenas.length && malasTocadas.length === 0, {
      emoji: "🧺", a: "Atrapa lo que aporta la diversidad cultural",
      userAnswer: atrapadas.length ? atrapadas.map((p) => p.txt).join(", ") : "no atrapó ninguna",
      correctAnswer: buenas.map((p) => p.txt).join(", "),
    }, atrapadas.length);
  }, [fin]);

  function tocar(p) {
    if (fin || marcadas.current[p.id]) return;
    marcadas.current[p.id] = true;
    if (p.good) setTomadas((s) => Object.assign({}, s, { [p.id]: true }));
    else setErradas((s) => Object.assign({}, s, { [p.id]: true }));
  }

  const buenas = b.palabras.filter((p) => p.good);
  const nAtrapadas = buenas.filter((p) => tomadas[p.id]).length;
  const escapadas = fin ? buenas.filter((p) => !tomadas[p.id]) : [];
  const PISTA = 300;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%", width: "100%", paddingTop: 58 }}>
      <div style={{ pointerEvents: "none", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 20, color: "#fff" }}>Atrapa lo que la diversidad cultural aporta.</span>
      </div>

      <div style={{ position: "relative", width: "100%", height: PISTA, marginTop: 10, borderRadius: 14, border: "2px solid rgba(242,194,96,0.35)", background: "linear-gradient(180deg, rgba(10,6,35,0.35), rgba(10,6,35,0.05))", overflow: "hidden" }}>
        {/* La animación de caída vive aquí y no en styles.css: styles.css es del SHELL y
            tocarlo obliga a propagarlo a todos los juegos del repo. */}
        {/* ⚠ El recorrido llega a PISTA+70, no a PISTA: la ficha empieza en top:-42 y mide
            ~38, así que con un recorrido corto TERMINABA VISIBLE, clavada en el borde de
            abajo de la caja. Tiene que salir entera. */}
        <style>{`@keyframes j13cae { from { transform: translateY(0); } to { transform: translateY(${PISTA + 70}px); } }`}</style>
        {b.palabras.map((p) => {
          const quieta = !!(tomadas[p.id] || erradas[p.id]);
          const marcada = tomadas[p.id] ? "#2ecc8f" : erradas[p.id] ? "#ff6b6b" : null;
          return (
            <button key={p.id} onClick={() => tocar(p)} disabled={fin || quieta}
              style={{ position: "absolute", left: `${4 + p.carril * 32.6}%`, top: -42, width: "30%", minHeight: 36, borderRadius: 11, border: `2.5px solid ${marcada || "#f2c260"}`, background: marcada ? (tomadas[p.id] ? "rgba(46,204,143,0.92)" : "rgba(255,107,107,0.92)") : "linear-gradient(180deg, rgba(255,255,255,0.97), rgba(240,235,225,0.93))", color: marcada ? "#fff" : "#2a2118", fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 11.5, lineHeight: 1.15, padding: "5px 6px", cursor: quieta || fin ? "default" : "pointer", boxShadow: "0 5px 14px rgba(0,0,0,0.35)", opacity: quieta ? 0 : 1, animation: `j13cae ${J13_T3R3_CAIDA}ms linear ${p.t0}ms both`, animationPlayState: quieta ? "paused" : "running", transition: "opacity 0.45s ease 0.35s, background 0.15s ease, border-color 0.15s ease", willChange: "transform" }}>
              {p.txt}
            </button>
          );
        })}

        {fin && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 7, background: "rgba(10,6,35,0.82)", padding: "0 16px" }}>
            <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 17, color: "#fce9a8" }}>Atrapaste {nAtrapadas} de {buenas.length}</span>
            {escapadas.length > 0 && (
              <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 12.5, lineHeight: 1.3, color: "#fff", textAlign: "center" }}>
                También aporta: {escapadas.map((p) => p.txt).join(", ")}
              </span>
            )}
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: "auto", paddingBottom: 6, fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 12.5, color: "#fce9a8", textShadow: "0 2px 6px rgba(0,0,0,0.6)" }}>
        <span>🧺 atrapadas {nAtrapadas}/{buenas.length}</span>
        <span style={{ color: "rgba(255,255,255,0.65)" }}>deja caer las que no aportan</span>
      </div>
    </div>
  );
}

// ── Arreglo de rondas del TEMA 3 (3 rondas, 3 verbos: deslizar · voltear · atrapar) ──
// Las tres se AUTOVALIDAN (verify:false): no llevan ¡VERIFICAR!.
const J13_DIV_ROUNDS = [
  { C: T3R1Muro, verify: false, bubble: (<>Desliza la carta<br />al lado correcto.</>) },
  { C: T3R2Memoria, verify: false, bubble: (<>Toca dos cartas<br />y busca su pareja.</>) },
  { C: T3R3Lluvia, verify: false, bubble: (<>Toca solo las que<br />la diversidad aporta.</>) },
];

// ══════════════════════════════════════════════════════════════════
// ORQUESTADOR compartido por TODOS los temas — chrome EDINUN (HUD, personaje,
// acciones, overlay, modales). Recibe el arreglo de rondas del tema activo.
// ⭐ = +1 por ELEMENTO resuelto bien (T1: R1 hasta 4 · R2 hasta 4 · R3 hasta 2 = 10 ·
// T2: 3 por ronda = 9); `isCorrect` de la ronda = ronda perfecta. Fallar nunca resta.
// ══════════════════════════════════════════════════════════════════
function J13Game({ app, setApp, go, rounds }) {
  const char = CHARACTERS.find((c) => c.id === app.character) || CHARACTERS[0];
  const ROUNDS = rounds || J13_ROUNDS;
  const total = ROUNDS.length;
  const [round, setRound] = useStateG(0);
  const [stars, setStars] = useStateG(0);
  const [log, setLog] = useStateG([]);
  const [elapsed, setElapsed] = useStateG(0);
  const [feedback, setFeedback] = useStateG(null);
  const [feedbackMsg, setFeedbackMsg] = useStateG("");
  const [confirmingExit, setConfirmingExit] = useStateG(false);
  const [confirmingRestart, setConfirmingRestart] = useStateG(false);
  const [pendingTema, setPendingTema] = useStateG(null);   // id del tema al que se quiere saltar
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
    // ⚠ En "¡UPS!" NUNCA se muestran estrellas, aunque la ronda haya dado algunas: se veía
    // "¡UPS!" con "+2 ⭐" debajo, que es contradictorio. Convención de todos los juegos del
    // repo (juego-5, 6, 8 y _PLANTILLA): acierto → "+N ⭐" · fallo → frase de ánimo. Lo
    // ganado igual se suma y se ve subir en el ⭐ del HUD.
    setTimeout(() => { setFeedback(isCorrect ? "ok" : "err"); setFeedbackMsg(isCorrect ? `+${g} ⭐` : ANIMOS[round % ANIMOS.length]); }, showFbAt);
    setTimeout(() => {
      setFeedback(null); setFeedbackMsg("");
      if (round + 1 < total) { setRound((r) => r + 1); advancing.current = false; setBusy(false); }
      else {
        const solved = newLog.filter((e) => e.isCorrect).length;
        setApp((s) => ({ ...s, stars: newStars, lastResult: { category: app.currentCatLabel || CAT_LABEL, solved, total, time: Math.floor((Date.now() - started.current) / 1000), starsEarned: newStars, log: newLog } }));
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

      {/* Selector de TEMA en el HUD (patrón BÁSICO/MEDIO/AVANZADO de edinun-games ·
          operaciones-basicas): permite saltar de tema SIN volver al Home. Tocar uno
          distinto abre modal de confirmación — cambiar de tema tira la ronda en curso, y
          las acciones destructivas siempre se confirman. Usa `short` de LEVELS_CFG: los
          labels completos ("Las Américas y su geografía") no caben en la barra. */}
      <div style={{ position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 8 }}>
        {LEVELS_CFG.filter((lv) => lv.enabled).map((lv) => {
          const activo = lv.id === (app.currentCategory || "continentes");
          return (
            <button key={lv.id} onClick={() => { if (!activo && !busy) setPendingTema(lv.id); }} disabled={activo}
              style={{ padding: "6px 13px", borderRadius: 999, background: activo ? lv.grad : "rgba(0,0,0,0.32)", color: activo ? lv.ink : "rgba(255,255,255,0.82)", fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 11.5, letterSpacing: "0.04em", border: activo ? "2px solid rgba(255,255,255,0.55)" : "2px solid rgba(255,255,255,0.2)", boxShadow: activo ? "0 0 14px rgba(252,233,168,0.45)" : "none", cursor: activo ? "default" : "pointer", transition: "all 0.15s ease" }}>
              {lv.short || lv.label}
            </button>
          );
        })}
      </div>

      {/* ⚠ El bloque Ronda va SIEMPRE centrado en `top: 52` (estandar-visual §1.1, y el
          format-lint lo verifica). Se probó moverlo junto al logo para dejarle aire a las
          pastillas y el lint lo rechazó: las pastillas van encima, en `top: 14`. */}
      <div style={{ position: "absolute", top: 52, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 8 }}>
        <span className="ed-label" style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>Ronda</span>
        {Array.from({ length: total }).map((_, i) => {
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

      {pendingTema && (() => {
        const cfg = LEVELS_CFG.find((l) => l.id === pendingTema) || LEVELS_CFG[0];
        return (
          <PortalToBody>
            <div onClick={() => setPendingTema(null)} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.62)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "ed-pop-in 0.18s", padding: 16 }}>
              <div onClick={(e) => e.stopPropagation()} className="ed-card" style={{ padding: 24, maxWidth: 440, textAlign: "center", boxShadow: "var(--ed-shadow-card), 0 0 40px rgba(79,216,255,0.28)" }}>
                <div className="ed-label" style={{ color: "#4fd8ff", marginBottom: 6 }}>Cambiar de tema</div>
                <h2 className="ed-h1" style={{ fontSize: 22, lineHeight: 1.15, marginBottom: 8 }}>¿Ir a "{cfg.label}"?</h2>
                <p className="ed-body" style={{ marginBottom: 16, fontSize: 14 }}>Vas a perder lo de esta ronda.</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <button className="ed-btn ed-btn-ghost" onClick={() => setPendingTema(null)} style={{ height: 44, fontWeight: 800, letterSpacing: "0.04em" }}>SEGUIR AQUÍ</button>
                  {/* Cambiar `currentCategory` basta: GameScreen monta J13Game con key={cat},
                      así que el tema nuevo entra con el estado en cero (ronda 1, sin ⭐). */}
                  <button className="ed-btn ed-btn-primary" onClick={() => { setPendingTema(null); setApp((s) => ({ ...s, currentCategory: cfg.id, currentCatLabel: cfg.catLabel })); }} style={{ height: 44, fontWeight: 800, letterSpacing: "0.04em" }}>SÍ, CAMBIAR</button>
                </div>
              </div>
            </div>
          </PortalToBody>
        );
      })()}

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
              <p className="ed-body" style={{ marginBottom: 16, fontSize: 14 }}>Vas a jugar las {total} rondas otra vez.</p>
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

// Despacho por tema (estandar-visual §8: N botones = N mini-juegos con mecánicas
// distintas). Los 3 temas están implementados, con 9 verbos distintos entre todos.
function GameScreen({ app, setApp, go }) {
  const cat = app.currentCategory || "continentes";
  const rounds = cat === "americas" ? J13_AM_ROUNDS : cat === "diversidad" ? J13_DIV_ROUNDS : J13_ROUNDS;
  // `key={cat}`: al saltar de tema desde las pastillas del HUD, J13Game se REMONTA y el
  // tema nuevo arranca limpio (ronda 1, sin ⭐ ni log de la partida anterior).
  return <J13Game key={cat} app={app} setApp={setApp} go={go} rounds={rounds} />;
}

// ─────────────────────────────────────────────────────────────
// RESULTS — reporte académico imprimible (genérico, lee res.log).
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
              <th style={printStyles.th}>Ronda</th>
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
          <div style={printStyles.cell}><div style={printStyles.cellL}>Rondas</div><div style={printStyles.cellV}>{attemptedCount} / {res.total}</div></div>
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
  const res = app.lastResult || { category: CAT_LABEL, solved: 0, total: TOTAL, time: 0, starsEarned: 0, log: [] };
  const mm = Math.floor(res.time / 60), ss = res.time % 60;
  const totalEx = res.total || TOTAL;
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
            ¡Juego completo!
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
                  <th style={{ textAlign: "left", padding: "6px 8px" }}>Ronda</th>
                  <th style={{ textAlign: "right", padding: "6px 8px" }}>Respondió</th>
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
                {(res.log || []).length === 0 && (<tr><td colSpan={5} style={{ padding: "16px 8px", textAlign: "center", color: "var(--ed-ink-soft)", fontStyle: "italic" }}>Sin rondas.</td></tr>)}
              </tbody>
            </table>
          </div>

          <div style={{ borderTop: "2px solid rgba(242,194,96,0.45)", paddingTop: 10, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, fontFamily: "var(--ed-font-ui)", fontSize: 11 }}>
            <SummaryCell label="Rondas" value={`${attemptedCount} / ${totalEx}`} />
            <SummaryCell label="Correctas" value={`${res.solved}`} tone="#2ecc8f" />
            <SummaryCell label="Estrellas" value={`${res.starsEarned}`} tone="#fce9a8" />
            <SummaryCell label="Precisión" value={`${accuracy}%`} tone="#fce9a8" emphasis />
          </div>

          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button className="ed-btn ed-btn-ghost" onClick={() => window.print()} style={{ padding: "0 10px", fontSize: 13, height: 44, fontWeight: 800, letterSpacing: "0.04em" }}>IMPRIMIR REPORTE</button>
            <button className="ed-btn ed-btn-primary" onClick={() => go("game")} style={{ padding: "0 10px", fontSize: 13, height: 44, fontWeight: 800, letterSpacing: "0.04em" }}>JUGAR OTRA VEZ</button>
          </div>
        </div>
      </div>

      <PrintableReport studentName={app.studentName} res={res} dateStr={dateStr} mm={mm} ss={ss} attemptedCount={attemptedCount} accuracy={accuracy} />
    </div>
  );
}

Object.assign(window, { GameScreen, ResultsScreen });
