// game-screens.jsx — juego-8 "¿En qué trabajan?" (Estudios Sociales · 8 años).
// Tema del libro: "El respeto al trabajo de las personas" (actividades económicas).
// 3 rondas encadenadas, cada una con una mecánica DISTINTA (orquestador SocGame):
//   R1 "Marca los del campo"  — tocar VARIOS + ¡VERIFICAR! (sector primario vs secundario).
//   R2 "¿Bien o servicio?"    — tocar 1 de 2 (una carta a la vez).
//   R3 "¿Activa o inactiva?"  — tocar persona → tocar grupo + ¡VERIFICAR! (PEA vs PEI).
//
// CONTRATO: GameScreen/ResultsScreen({app,setApp,go}) en window; markFirstAttempt() en la
// 1a respuesta; incrementGamesCompleted() al fin. Invariantes EDINUN: fallar NO baja el
// progreso; al fallar se revela la correcta en el lenguaje de la mecánica; salir/reiniciar
// con modal. Enunciado = QUE, bocadillo = COMO. Anti-repeticion por ronda (no repite al recargar).

const { useState: useStateG, useEffect: useEffectG, useRef: useRefG } = React;

function PortalToBody({ children }) {
  return ReactDOM.createPortal(children, document.body);
}

const CAT_LABEL = "El trabajo de las personas";
const TOTAL = 3;

const ANIMOS = [
  "¡Casi! Sigue intentándolo.",
  "¡La próxima es tuya!",
  "Equivocarse también es aprender.",
];

// ── Anti-repeticion FIFO en localStorage (una clave por ronda) ──
function j8Recent(key) { try { const r = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(r) ? r : []; } catch (e) { return []; } }
function j8Push(key, id, cap) { try { const prev = j8Recent(key).filter((x) => x !== id); localStorage.setItem(key, JSON.stringify([id].concat(prev).slice(0, cap))); } catch (e) {} }
function j8Shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
// Elige k elementos de `pool` evitando los recientes de `key` y los registra.
// OJO cap: para elegir un SUBCONJUNTO usar cap < pool.length - k (si no, parte el banco
// en grupos fijos que alternan idéntico cada recarga). Para elegir 1, cap alto = más variedad.
function j8Pick(pool, k, key, cap) {
  const recent = new Set(j8Recent(key)), all = pool.map((_, i) => i);
  const chosen = j8Shuffle(all.filter((i) => !recent.has(i))).concat(j8Shuffle(all.filter((i) => recent.has(i)))).slice(0, k);
  chosen.forEach((i) => j8Push(key, i, cap));
  return chosen.map((i) => pool[i]);
}

// ══════════════════════════════════════════════════════════════════
// R1 · "Marca los del campo" — sector PRIMARIO (naturaleza) vs SECUNDARIO (transformado).
// Del libro (actividad "Aplico"): el niño TOCA los que vienen del campo/mar/animales y
// deja fuera los transformados; ¡VERIFICAR!. Correcto = exactamente los primarios marcados.
// ══════════════════════════════════════════════════════════════════
const J8_PRIMARIO = [
  { e: "🌽", t: "Maíz" }, { e: "🍅", t: "Tomate" }, { e: "🐄", t: "Vaca" }, { e: "🍎", t: "Manzana" },
  { e: "🐟", t: "Pescado" }, { e: "🍌", t: "Banano" }, { e: "🥔", t: "Papa" }, { e: "🍊", t: "Naranja" }, { e: "🌾", t: "Trigo" },
];
const J8_SECUND = [
  { e: "🎒", t: "Mochila" }, { e: "🍞", t: "Pan" }, { e: "👕", t: "Ropa" }, { e: "🪑", t: "Silla" },
  { e: "🍯", t: "Mermelada" }, { e: "🚗", t: "Auto" }, { e: "🧀", t: "Queso" }, { e: "👟", t: "Zapatos" }, { e: "⚽", t: "Pelota" },
];
const J8_R1P_KEY = "edinun_juego8_r1p_v1", J8_R1S_KEY = "edinun_juego8_r1s_v1";
function j8R1Build() {
  const prim = j8Pick(J8_PRIMARIO, 3, J8_R1P_KEY, 4).map((x) => ({ ...x, primario: true }));
  const sec = j8Pick(J8_SECUND, 3, J8_R1S_KEY, 4).map((x) => ({ ...x, primario: false }));
  return { items: j8Shuffle(prim.concat(sec)).map((it, i) => ({ ...it, id: i })) };
}

function R1Campo({ onSolve, verifyRef }) {
  const [b] = useStateG(() => j8R1Build());
  const [sel, setSel] = useStateG({});
  const [verified, setVerified] = useStateG(false);
  function toggle(id) { if (verified) return; setSel((s) => Object.assign({}, s, { [id]: !s[id] })); }
  function verificar() {
    if (verified) return;
    setVerified(true);
    const ok = b.items.every((it) => (!!sel[it.id]) === it.primario);
    onSolve(ok, {
      emoji: "🌱", a: "¿Cuáles vienen del sector primario?",
      userAnswer: b.items.filter((it) => sel[it.id]).map((it) => it.t).join(", ") || "—",
      correctAnswer: b.items.filter((it) => it.primario).map((it) => it.t).join(", "),
    });
  }
  verifyRef.current = verificar;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", height: "100%", width: "100%", paddingTop: 46 }}>
      <div style={{ pointerEvents: "none", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 22, color: "#fff" }}>¿Cuáles vienen del sector primario?</span>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0, width: "100%" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 132px)", gap: 14, justifyContent: "center" }}>
          {b.items.map((it) => {
            const isSel = !!sel[it.id];
            let border = "#f2c260", bg = "linear-gradient(180deg,#fff8e6,#f7e3a8)", txt = "#3a2608";
            if (!verified && isSel) { border = "#4fd8ff"; }
            let badge = null, falto = false;
            if (verified) {
              if (it.primario && isSel) { border = "#2ecc8f"; bg = "linear-gradient(180deg,rgba(72,224,154,0.95),rgba(26,143,95,0.92))"; txt = "#06381f"; badge = "✓"; }
              else if (!it.primario && isSel) { border = "#ff6b6b"; bg = "linear-gradient(180deg,rgba(255,139,139,0.92),rgba(178,47,47,0.9))"; txt = "#fff"; badge = "✗"; }
              else if (it.primario && !isSel) { border = "#e0a72c"; falto = true; }
              else { bg = "linear-gradient(180deg,rgba(255,248,230,0.5),rgba(247,227,168,0.5))"; }
            }
            return (
              <button key={it.id} onClick={() => toggle(it.id)} disabled={verified}
                style={{ position: "relative", width: 132, height: 100, borderRadius: 16, border: `3px ${!verified && isSel ? "solid" : verified ? "solid" : "solid"} ${border}`, background: bg, color: txt, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, cursor: verified ? "default" : "pointer", transform: (!verified && isSel) ? "scale(1.05)" : "none", boxShadow: (!verified && isSel) ? "0 0 16px rgba(79,216,255,0.55), inset 0 1px 0 rgba(255,255,255,0.7)" : "inset 0 1px 0 rgba(255,255,255,0.7), 0 5px 12px rgba(0,0,0,0.28)", transition: "transform 0.12s ease" }}>
                <span style={{ fontSize: 44, lineHeight: 1, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))" }}>{it.e}</span>
                <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 14 }}>{it.t}</span>
                {badge && <span style={{ position: "absolute", top: -10, right: -8, fontSize: 14, fontWeight: 900, color: "#fff", background: badge === "✓" ? "#1f8a54" : "#c0392b", borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>{badge}</span>}
                {falto && <span style={{ position: "absolute", bottom: -13, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap", background: "linear-gradient(180deg,#ffe6a1,#f1c153)", border: "1.5px solid #e0a72c", borderRadius: 999, padding: "0 8px", fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 10, color: "#5a3d0a" }}>este sí va</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// R2 · "¿Bien o servicio?" — bienes (objetos tangibles) vs servicios (actividades).
// Una carta a la vez: el niño TOCA "BIEN" o "SERVICIO" (valida al tocar). Al fallar revela.
// ══════════════════════════════════════════════════════════════════
const J8_BIENES = [
  { e: "🍞", t: "Pan" }, { e: "👕", t: "Ropa" }, { e: "🚗", t: "Auto" }, { e: "🍎", t: "Manzana" },
  { e: "🪑", t: "Silla" }, { e: "⚽", t: "Pelota" }, { e: "👟", t: "Zapatos" }, { e: "📱", t: "Celular" },
];
const J8_SERVICIOS = [
  { e: "👩‍⚕️", t: "Doctora" }, { e: "👨‍🏫", t: "Profesor" }, { e: "🚌", t: "Transporte" }, { e: "🏦", t: "Banco" },
  { e: "💇", t: "Peluquería" }, { e: "🚕", t: "Taxi" }, { e: "🚒", t: "Bomberos" }, { e: "🏨", t: "Hotel" },
];
const J8_R2_KEY = "edinun_juego8_r2_v1";
function j8R2Build() {
  const pool = J8_BIENES.map((x) => ({ ...x, bien: true })).concat(J8_SERVICIOS.map((x) => ({ ...x, bien: false })));
  return { item: j8Pick(pool, 1, J8_R2_KEY, 10)[0] };
}

function R2BienServicio({ onSolve }) {
  const [b] = useStateG(() => j8R2Build());
  const [picked, setPicked] = useStateG(null);
  const answered = picked !== null;
  function tap(choice) {
    if (answered) return;
    setPicked(choice);
    onSolve((choice === "bien") === b.item.bien, {
      emoji: b.item.e, a: `¿"${b.item.t}" es un bien o un servicio?`,
      userAnswer: choice === "bien" ? "Bien" : "Servicio", correctAnswer: b.item.bien ? "Bien" : "Servicio",
    });
  }
  function btnStyle(choice) {
    const isCorrect = (choice === "bien") === b.item.bien;
    let border = choice === "bien" ? "#4fa0ff" : "#ffb14f", bg = "linear-gradient(180deg,#fff8e6,#f7e3a8)", col = "#3a2608";
    if (answered) {
      if (isCorrect) { border = "#2ecc8f"; bg = "linear-gradient(180deg,rgba(72,224,154,0.95),rgba(26,143,95,0.92))"; col = "#06381f"; }
      else if (picked === choice) { border = "#ff6b6b"; bg = "linear-gradient(180deg,rgba(255,139,139,0.92),rgba(178,47,47,0.9))"; col = "#fff"; }
      else { bg = "linear-gradient(180deg,rgba(255,248,230,0.5),rgba(247,227,168,0.5))"; }
    }
    return { position: "relative", width: 168, height: 66, borderRadius: 16, border: `3px solid ${border}`, background: bg, color: col, fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 20, letterSpacing: "0.03em", cursor: answered ? "default" : "pointer", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7), 0 6px 14px rgba(0,0,0,0.3)" };
  }
  // Círculo con ✓ (correcta) o ✗ (la que se tocó mal), como en R1/R3.
  function r2Badge(choice) {
    if (!answered) return null;
    const isCorrect = (choice === "bien") === b.item.bien;
    if (!isCorrect && picked !== choice) return null;
    const ok = isCorrect;
    return <span style={{ position: "absolute", top: -11, right: -9, fontSize: 15, fontWeight: 900, color: "#fff", background: ok ? "#1f8a54" : "#c0392b", borderRadius: "50%", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.35)" }}>{ok ? "✓" : "✗"}</span>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", height: "100%", width: "100%", paddingTop: 30 }}>
      <div style={{ pointerEvents: "none", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 22, color: "#fff" }}>¿Es un bien o un servicio?</span>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", minHeight: 0, width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(240,235,225,0.92))", border: "3px solid #f2c260", borderRadius: 20, padding: "14px 30px", boxShadow: "0 12px 28px rgba(0,0,0,0.4)" }}>
          <span style={{ fontSize: 72, lineHeight: 1, filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.3))" }}>{b.item.e}</span>
          <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 22, color: "#3a2608" }}>{b.item.t}</span>
        </div>
        <div style={{ display: "flex", gap: 22, justifyContent: "center" }}>
          <button onClick={() => tap("bien")} disabled={answered} style={btnStyle("bien")}>BIEN{r2Badge("bien")}</button>
          <button onClick={() => tap("servicio")} disabled={answered} style={btnStyle("servicio")}>SERVICIO{r2Badge("servicio")}</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// R3 · "¿Activa o inactiva?" — PEA (trabaja o busca trabajo) vs PEI (estudiantes, jubilados…).
// El niño TOCA una persona y luego su grupo; ¡VERIFICAR! marca ✓/✗ y revela el grupo correcto.
// ══════════════════════════════════════════════════════════════════
const J8_ACTIVA = [
  { e: "👩‍🌾", t: "Agricultora" }, { e: "👨‍🍳", t: "Cocinero" }, { e: "👷", t: "Albañil" }, { e: "👮", t: "Policía" },
  { e: "👨‍🔧", t: "Mecánico" }, { e: "🧑‍🏭", t: "Obrero" }, { e: "👨‍💼", t: "Comerciante" }, { e: "👩‍⚕️", t: "Enfermera" },
];
const J8_INACTIVA = [
  { e: "🧑‍🎓", t: "Estudiante" }, { e: "👴", t: "Jubilado" }, { e: "👵", t: "Jubilada" }, { e: "👶", t: "Bebé" }, { e: "🧒", t: "Niño" },
];
const J8_R3A_KEY = "edinun_juego8_r3a_v1", J8_R3I_KEY = "edinun_juego8_r3i_v1";
function j8R3Build() {
  const act = j8Pick(J8_ACTIVA, 2, J8_R3A_KEY, 4).map((x) => ({ ...x, activa: true }));
  const ina = j8Pick(J8_INACTIVA, 2, J8_R3I_KEY, 2).map((x) => ({ ...x, activa: false }));
  return { people: j8Shuffle(act.concat(ina)).map((p, i) => ({ ...p, id: i })) };
}

function R3ActivaInactiva({ onSolve, verifyRef }) {
  const [b] = useStateG(() => j8R3Build());
  const [placed, setPlaced] = useStateG({});   // id -> "activa" | "inactiva"
  const [sel, setSel] = useStateG(null);
  const [verified, setVerified] = useStateG(false);
  const [drag, setDrag] = useStateG(null);     // arrastre en curso: {id, dx, dy, moved, over}
  const rootRef = useRefG(null);
  const boxRefs = useRefG({});                  // {activa: el, inactiva: el} para hit-test del soltar
  const dragInfo = useRefG(null);               // {id, x0, y0, scale}
  const allPlaced = b.people.every((p) => placed[p.id]);
  // Mete la carta al cajón g; si g es null, la devuelve a la bandeja.
  function setZone(id, g) { setPlaced((s) => { const n = Object.assign({}, s); if (g) n[id] = g; else delete n[id]; return n; }); setSel(null); }
  function hitBox(x, y) {   // ¿el puntero está sobre un cajón? (con tolerancia); null = bandeja
    for (const g of ["activa", "inactiva"]) {
      const el = boxRefs.current[g]; if (!el) continue;
      const r = el.getBoundingClientRect(), pad = 16;
      if (x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad) return g;
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
    if (moved) setZone(id, hitBox(e.clientX, e.clientY));   // soltar en un cajón lo mete; fuera de los cajones = a la bandeja
    else setSel((cur) => (cur === id ? null : id));         // toque simple: selecciona (respaldo del arrastre)
  }
  function endDrag() { dragInfo.current = null; setDrag(null); }
  function tapGroup(g) { if (verified || sel === null) return; setZone(sel, g); }
  function verificar() {
    if (verified || !allPlaced) return;
    setVerified(true);
    const ok = b.people.every((p) => placed[p.id] === (p.activa ? "activa" : "inactiva"));
    onSolve(ok, {
      emoji: "🧑‍🏭", a: "¿A qué grupo pertenece cada persona? (activa / inactiva)",
      userAnswer: b.people.map((p) => `${p.t}=${placed[p.id] === "activa" ? "activa" : "inactiva"}`).join(", "),
      correctAnswer: b.people.map((p) => `${p.t}=${p.activa ? "activa" : "inactiva"}`).join(", "),
    });
  }
  verifyRef.current = verificar;
  function card(p) {
    const g = placed[p.id], isSel = sel === p.id, dragging = drag && drag.id === p.id;
    let border = "#f2c260", badge = null, showFix = false;
    if (!verified && isSel) border = "#4fd8ff";
    if (verified) {
      const correct = g === (p.activa ? "activa" : "inactiva");
      border = correct ? "#2ecc8f" : "#ff6b6b"; badge = correct ? "✓" : "✗"; showFix = !correct;
    }
    return (
      <button key={p.id} onPointerDown={(e) => onDown(e, p.id)} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={endDrag} onClick={(e) => e.stopPropagation()} disabled={verified}
        style={{ position: "relative", width: 84, height: 62, borderRadius: 12, border: `3px solid ${border}`, background: "linear-gradient(180deg,#fff8e6,#f7e3a8)", color: "#3a2608", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1, cursor: verified ? "default" : "grab", touchAction: "none", zIndex: dragging ? 60 : 1, transform: dragging ? `translate(${drag.dx}px, ${drag.dy}px) scale(1.12)` : (isSel ? "scale(1.07)" : "none"), boxShadow: (dragging || isSel) ? "0 0 18px rgba(79,216,255,0.65)" : "inset 0 1px 0 rgba(255,255,255,0.7), 0 4px 10px rgba(0,0,0,0.28)", transition: dragging ? "none" : "transform 0.12s ease" }}>
        <span style={{ fontSize: 26, lineHeight: 1 }}>{p.e}</span>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 11 }}>{p.t}</span>
        {badge && <span style={{ position: "absolute", top: -9, right: -8, fontSize: 12, fontWeight: 900, color: "#fff", background: badge === "✓" ? "#1f8a54" : "#c0392b", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>{badge}</span>}
        {showFix && <span style={{ position: "absolute", bottom: -11, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap", background: "linear-gradient(180deg,#ffe6a1,#f1c153)", border: "1.5px solid #e0a72c", borderRadius: 999, padding: "0 6px", fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 9, color: "#5a3d0a" }}>{p.activa ? "PEA" : "PEI"}</span>}
      </button>
    );
  }
  function bin(g, label, sub, color) {
    const inside = b.people.filter((p) => placed[p.id] === g);
    const over = drag && drag.over === g && !verified;
    const on = (sel !== null || over) && !verified;
    return (
      <div ref={(el) => { boxRefs.current[g] = el; }} onClick={() => tapGroup(g)}
        style={{ width: 214, minHeight: 110, borderRadius: 18, border: `3px ${on ? "solid" : "dashed"} ${color}`, background: over ? "rgba(255,255,255,0.2)" : (on ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.18)"), cursor: (sel !== null && !verified) ? "pointer" : "default", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, padding: "7px 8px 9px", boxShadow: over ? `0 0 26px ${color}` : "none", transform: over ? "scale(1.02)" : "none", transition: "all 0.14s ease" }}>
        <div style={{ textAlign: "center", pointerEvents: "none", lineHeight: 1.05 }}>
          <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 15, color: "#fff", letterSpacing: "0.02em" }}>{label}</span>
          <span style={{ display: "block", fontFamily: "var(--ed-font-display)", fontWeight: 600, fontSize: 10, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>{sub}</span>
        </div>
        {inside.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", justifyContent: "center", width: "100%" }}>
          {inside.map((p) => card(p))}
        </div>}
      </div>
    );
  }
  return (
    <div ref={rootRef} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", height: "100%", width: "100%", paddingTop: 30 }}>
      <div style={{ pointerEvents: "none", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 22, color: "#fff" }}>¿A qué grupo pertenece cada persona?</span>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 54, minHeight: 0, width: "100%", paddingTop: 6 }}>
        {/* Columna 1: las personas (bandeja vertical) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 9, justifyContent: "center", alignItems: "center", flexShrink: 0 }}>
          {b.people.filter((p) => !placed[p.id]).map((p) => card(p))}
          {b.people.every((p) => placed[p.id]) && <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 12, color: "rgba(255,255,255,0.5)", maxWidth: 92, textAlign: "center", lineHeight: 1.2 }}>¡Todas ubicadas!</span>}
        </div>
        {/* Columna 2: los grupos PEA / PEI (uno sobre otro), más angostos */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, justifyContent: "center", flexShrink: 0 }}>
          {bin("activa", "ACTIVA (PEA)", "Trabaja o busca trabajo", "#2ecc8f")}
          {bin("inactiva", "INACTIVA (PEI)", "Estudiantes, jubilados…", "#9b7be8")}
        </div>
      </div>
    </div>
  );
}

// ── Arreglo de rondas (cada mecánica distinta) ──
const SOC_ROUNDS = [
  { C: R1Campo, verify: true, bubble: (<>Toca los del campo<br />y toca ¡VERIFICAR!</>) },
  { C: R2BienServicio, verify: false, bubble: (<>Toca si es<br />bien o servicio.</>) },
  { C: R3ActivaInactiva, verify: true, bubble: (<>Arrastra a cada<br />persona a su grupo.</>) },
];

// ══════════════════════════════════════════════════════════════════
// ORQUESTADOR — chrome EDINUN compartido (HUD, personaje, acciones, overlay, modales).
// ══════════════════════════════════════════════════════════════════
function GameScreen({ app, setApp, go }) {
  const char = CHARACTERS.find((c) => c.id === app.character) || CHARACTERS[0];
  const ROUNDS = SOC_ROUNDS;
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

  function onSolve(isCorrect, entry) {
    if (advancing.current) return;
    advancing.current = true; setBusy(true);
    if (typeof markFirstAttempt === "function") markFirstAttempt();
    const newLog = [...log, { idx: round + 1, isCorrect, ...entry }];
    const newStars = stars + (isCorrect ? 1 : 0);
    setLog(newLog); setStars(newStars);
    if (isCorrect) setApp((s) => ({ ...s, stars: (s.stars || 0) + 1 }));
    const showFbAt = isCorrect ? 0 : (ROUNDS[round].verify ? 2200 : 1800);
    const advanceAt = showFbAt + (isCorrect ? 1100 : 1000);
    setTimeout(() => { setFeedback(isCorrect ? "ok" : "err"); setFeedbackMsg(isCorrect ? "+1 ⭐" : ANIMOS[round % ANIMOS.length]); }, showFbAt);
    setTimeout(() => {
      setFeedback(null); setFeedbackMsg("");
      if (round + 1 < TOTAL) { setRound((r) => r + 1); advancing.current = false; setBusy(false); }
      else {
        const solved = newLog.filter((e) => e.isCorrect).length;
        setApp((s) => ({ ...s, stars: newStars, lastResult: { category: CAT_LABEL, solved, total: TOTAL, time: Math.floor((Date.now() - started.current) / 1000), starsEarned: newStars, log: newLog } }));
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
            {feedbackMsg && (<div style={{ fontFamily: "'Fredoka','Baloo 2',system-ui,sans-serif", fontWeight: 700, fontSize: "clamp(18px, 2.6vmin, 30px)", color: feedback === "ok" ? "#fce9a8" : "#fff", background: "rgba(0,0,0,0.55)", padding: "8px 26px", borderRadius: 999, textShadow: "0 2px 6px rgba(0,0,0,0.6)", textAlign: "center" }}>{feedback === "err" ? `${feedbackMsg} — ${char.name}` : feedbackMsg}</div>)}
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
              <p className="ed-body" style={{ marginBottom: 16, fontSize: 14 }}>Vas a jugar las 3 rondas otra vez.</p>
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
