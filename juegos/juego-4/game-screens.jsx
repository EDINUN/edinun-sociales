// game-screens.jsx — JUEGO-4 · "Mi escuela y mi barrio" (Estudios Sociales · 6 años).
// Juego MULTI-TEMA (3 botones en Home). Este archivo implementa el TEMA 1.
//
// TEMA 1 · "Estar preparados" (categoría "emergencias"):
//   Mecánica ORDENAR/SECUENCIA: salen 3 tarjetas (dibujos de acciones) DESORDENADAS en una
//   bandeja; el niño las ARRASTRA a las 3 casillas numeradas 1·2·3 en el orden correcto y
//   toca VERIFICAR. Cada casilla correcta sale con ✓; las incorrectas con ✗ y se REVELA la
//   acción que iba ahí. Banco de secuencias de seguridad (sismo, ceniza, evacuar) con
//   anti-repetición FIFO → al recargar/reiniciar sale OTRA secuencia (no la misma).
//
// Arrastre: pointer events (mouse + touch). Posición en coords lógicas del lienzo 900×540
// (desplazamiento de pantalla / escala real del contenedor); el "soltar" se resuelve por
// hit-test con getBoundingClientRect de cada casilla — igual que los demás juegos.
//
// CONTRATO: GameScreen/ResultsScreen({app,setApp,go}) en window; markFirstAttempt() en la
// 1ª acción; incrementGamesCompleted() al terminar. Salir/reiniciar con modal.
// Los TEMAS 2 y 3 se añadirán como otras categorías cuando la autora mande sus láminas.

const { useState: useStateG, useEffect: useEffectG, useRef: useRefG } = React;

function PortalToBody({ children }) {
  return ReactDOM.createPortal(children, document.body);
}

const CAT_LABEL = "Estar preparados";
const ROUND = 3;        // 3 tarjetas por secuencia (compat. con el reporte)
const RECENT_KEY = "edinun_juego4_emergencias_recientes_v1";
const RECENT_CAP = 2;   // no repetir la misma secuencia en partidas seguidas

// Banco de secuencias de seguridad. `pasos` va SIEMPRE en el orden correcto (1→2→3).
// img = dibujo (fondo transparente en assets/); emoji = respaldo y uso en el reporte.
const SEQUENCES = [
  { id: "sismo", titulo: "¿Qué hago en un sismo?", themeEmoji: "🌎",
    pasos: [
      { id: "agachate", label: "Agáchate", img: "sismo-agachate.png", emoji: "🙇" },
      { id: "cubrete",  label: "Cúbrete",  img: "sismo-cubrete.png",  emoji: "🛡️" },
      { id: "sujetate", label: "Sujétate", img: "sismo-sujetate.png", emoji: "✊" },
    ] },
  { id: "ceniza", titulo: "Si cae ceniza, ¿qué me pongo?", themeEmoji: "🌋",
    pasos: [
      { id: "mascarilla", label: "Mascarilla", img: "ceniza-mascarilla.png", emoji: "😷" },
      { id: "gafas",      label: "Gafas",      img: "ceniza-gafas.png",      emoji: "🥽" },
      { id: "gorra",      label: "Gorra",      img: "ceniza-gorra.png",      emoji: "🧢" },
    ] },
  { id: "evacuar", titulo: "Para evacuar, ¿qué hago?", themeEmoji: "🚸",
    pasos: [
      { id: "calma",  label: "Mantén la calma",    img: "evacuar-calma.png",  emoji: "🧘" },
      { id: "camina", label: "Camina sin correr",  img: "evacuar-camina.png", emoji: "🚶" },
      { id: "punto",  label: "Punto de encuentro", img: "evacuar-punto.png",  emoji: "🚩" },
    ] },
];

// Geometría (lienzo 900×540). 3 casillas arriba, bandeja (desordenada) abajo, en 3 columnas.
const SLOT_CX = [330, 500, 670];
const SLOT_CY = 220;
const TRAY_CX = [330, 500, 670];
const TRAY_CY = 428;
const SLOT_W = 156, SLOT_H = 182;
const SLOT_HIT_PAD = 26;

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}
function readRecent() {
  try { const a = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); return Array.isArray(a) ? a : []; }
  catch (e) { return []; }
}
function writeRecent(ids) {
  try {
    const prev = readRecent().filter((id) => ids.indexOf(id) === -1);
    localStorage.setItem(RECENT_KEY, JSON.stringify(ids.concat(prev).slice(0, RECENT_CAP)));
  } catch (e) { /* sin localStorage: sin anti-repetición, no crítico */ }
}
// Elige una secuencia evitando las recién vistas → al recargar/reiniciar sale OTRA.
function pickSequence() {
  const recent = readRecent();
  const fresh = shuffle(SEQUENCES.filter((s) => recent.indexOf(s.id) === -1));
  const stale = shuffle(SEQUENCES.filter((s) => recent.indexOf(s.id) !== -1));
  const seq = fresh.concat(stale)[0];
  writeRecent([seq.id]);
  return seq;
}
function buildRoundData() {
  const seq = pickSequence();
  const steps = {};
  seq.pasos.forEach((p, i) => { steps[p.id] = Object.assign({}, p, { order: i }); });
  return { seq, steps, cards: shuffle(seq.pasos.map((p) => p.id)) };
}

const GAME_CSS = `
@keyframes edBinBounce{ 0%{transform:translateY(0)} 35%{transform:translateY(-12px)} 100%{transform:translateY(0)} }
.ed-binBounce{ animation:edBinBounce .5s; }
@keyframes edCheckPop{ 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }
.ed-checkPop{ animation:edCheckPop .34s cubic-bezier(.2,.9,.3,1.4); }
.ed-noselect, .ed-noselect *{ -webkit-user-select:none; -moz-user-select:none; -ms-user-select:none; user-select:none; -webkit-user-drag:none; -webkit-touch-callout:none; -webkit-tap-highlight-color:transparent; }
.ed-noselect img{ -webkit-user-drag:none; pointer-events:none; }
.ed-noselect::selection, .ed-noselect *::selection{ background:transparent; }
`;

// Frases de ánimo para el ¡UPS! (firmadas por el personaje), estilo EDINUN.
const ANIMOS = [
  "¡Casi! Sigue intentándolo.",
  "¡La próxima es tuya!",
  "Equivocarse también es aprender.",
  "¡Vamos, tú puedes!",
];

// Chips de tema (arriba, centrados) — permiten cambiar de tema SIN volver al Home.
// Cambiar es destructivo (se pierde el avance del tema) → pasa por modal de confirmación.
function TemaChipsBar({ app, setApp }) {
  const current = app.currentCategory;
  const levels = (typeof LEVELS_CFG !== "undefined" && LEVELS_CFG) || (window.LEVELS_CFG || []);
  const [pending, setPending] = useStateG(null);
  function confirmSwitch() {
    const cfg = levels.find((l) => l.id === pending);
    setPending(null);
    if (cfg) setApp((s) => ({ ...s, level: cfg.id, currentCategory: cfg.id, currentCatLabel: cfg.catLabel }));
  }
  return (
    <>
      <div style={{ position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 6, zIndex: 6 }}>
        {levels.map((lv) => {
          const active = lv.id === current;
          return (
            <button key={lv.id} onClick={() => { if (lv.enabled && !active) setPending(lv.id); }} disabled={!lv.enabled}
              title={active ? "Tema actual" : (lv.enabled ? `Cambiar a "${lv.label}"` : "Próximamente")}
              style={{ padding: "5px 12px", borderRadius: 999, background: active ? lv.grad : "rgba(0,0,0,0.35)", color: active ? lv.ink : "rgba(252,233,168,0.85)", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 11, letterSpacing: "0.02em", border: active ? "1px solid rgba(255,255,255,0.55)" : "1px solid rgba(242,194,96,0.35)", boxShadow: active ? "inset 0 1px 0 rgba(255,255,255,0.45), 0 0 12px rgba(255,255,255,0.18)" : "none", cursor: (lv.enabled && !active) ? "pointer" : "default", opacity: lv.enabled ? 1 : 0.55, whiteSpace: "nowrap" }}>
              {lv.label}
            </button>
          );
        })}
      </div>
      {pending && (() => {
        const cfg = levels.find((l) => l.id === pending);
        if (!cfg) return null;
        return (
          <PortalToBody>
            <div onClick={() => setPending(null)} style={{ position: "fixed", inset: 0, zIndex: 1100, background: "rgba(0,0,0,0.62)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "ed-pop-in 0.18s", padding: 16 }}>
              <div onClick={(e) => e.stopPropagation()} className="ed-card" style={{ padding: 24, maxWidth: 460, textAlign: "center", boxShadow: "var(--ed-shadow-card), 0 0 40px rgba(148,120,255,0.3)" }}>
                <div className="ed-label" style={{ color: "#a78bfa", marginBottom: 6 }}>Cambiar de tema</div>
                <h2 className="ed-h1" style={{ fontSize: 22, lineHeight: 1.15, marginBottom: 8 }}>¿Ir a "{cfg.label}"?</h2>
                <p className="ed-body" style={{ marginBottom: 16, fontSize: 14 }}>Vas a perder tu avance en este tema. No habrá reporte de esta sesión.</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <button className="ed-btn ed-btn-ghost" onClick={() => setPending(null)} style={{ height: 44, fontWeight: 800, letterSpacing: "0.04em" }}>SEGUIR JUGANDO</button>
                  <button className="ed-btn ed-btn-primary" onClick={confirmSwitch} style={{ height: 44, fontWeight: 800, letterSpacing: "0.04em" }}>SÍ, CAMBIAR</button>
                </div>
              </div>
            </div>
          </PortalToBody>
        );
      })()}
    </>
  );
}

function OrdenarGame({ app, setApp, go }) {
  const char = CHARACTERS.find((c) => c.id === app.character) || CHARACTERS[0];

  const rootRef = useRefG(null);
  const slotRefs = useRefG([null, null, null]);

  const initRef = useRefG(null);
  if (!initRef.current) initRef.current = buildRoundData();
  const { seq, steps, cards } = initRef.current;

  const [slots, setSlots] = useStateG([null, null, null]);   // slotIndex -> cardId
  const [dragId, setDragId] = useStateG(null);
  const [dragXY, setDragXY] = useStateG({ x: 0, y: 0 });
  const [verdict, setVerdict] = useStateG(null);   // slotIndex -> 'ok' | 'wrong'
  const [banner, setBanner] = useStateG(null);
  const [bannerMsg, setBannerMsg] = useStateG("");
  const [done, setDone] = useStateG(false);
  const [confirmingExit, setConfirmingExit] = useStateG(false);
  const [confirmingRestart, setConfirmingRestart] = useStateG(false);

  const started = useRefG(Date.now());
  const firstDone = useRefG(false);
  const logRef = useRefG([]);
  const dragRef = useRefG(null);

  function trayIndexOf(id) { return cards.indexOf(id); }
  function restPos(id) {
    const si = slots.indexOf(id);
    if (si !== -1) return { x: SLOT_CX[si], y: SLOT_CY };
    const ti = trayIndexOf(id);
    return { x: TRAY_CX[ti] != null ? TRAY_CX[ti] : 500, y: TRAY_CY };
  }

  function onPointerDown(e, id) {
    if (done || verdict) return;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
    const rect = rootRef.current ? rootRef.current.getBoundingClientRect() : { width: 900 };
    const scale = rect.width / 900 || 1;
    const cur = restPos(id);
    dragRef.current = { id, sx: e.clientX, sy: e.clientY, cx: cur.x, cy: cur.y, scale, moved: false };
    setDragId(id); setDragXY(cur);
    if (!firstDone.current) { firstDone.current = true; if (typeof markFirstAttempt === "function") markFirstAttempt(); }
  }
  function onPointerMove(e) {
    const d = dragRef.current; if (!d) return;
    if (Math.abs(e.clientX - d.sx) + Math.abs(e.clientY - d.sy) > 4) d.moved = true;
    setDragXY({ x: d.cx + (e.clientX - d.sx) / d.scale, y: d.cy + (e.clientY - d.sy) / d.scale });
  }
  function onPointerUp(e) {
    const d = dragRef.current; if (!d) return;
    dragRef.current = null; setDragId(null);
    const id = d.id;
    let hit = -1;
    for (let i = 0; i < 3; i++) {
      const el = slotRefs.current[i]; if (!el) continue;
      const r = el.getBoundingClientRect();
      if (e.clientX >= r.left - SLOT_HIT_PAD && e.clientX <= r.right + SLOT_HIT_PAD &&
          e.clientY >= r.top - SLOT_HIT_PAD && e.clientY <= r.bottom + SLOT_HIT_PAD) { hit = i; break; }
    }
    if (hit !== -1) {
      setSlots((prev) => {
        const n = prev.slice();
        const from = n.indexOf(id);
        const occ = n[hit];
        if (from !== -1) n[from] = null;
        n[hit] = id;
        if (occ && occ !== id && from !== -1) n[from] = occ; // intercambio si venía de otra casilla
        return n;
      });
    } else if (d.moved) {
      setSlots((prev) => { const n = prev.slice(); const from = n.indexOf(id); if (from !== -1) n[from] = null; return n; });
    }
  }

  const allPlaced = slots.every((s) => s !== null);
  const placedCount = slots.filter((s) => s !== null).length;

  function onVerify() {
    if (!allPlaced || verdict || done) return;
    const vd = {};
    logRef.current = [];
    slots.forEach((cardId, i) => {
      const st = steps[cardId];
      const ok = st.order === i;
      vd[i] = ok ? "ok" : "wrong";
      logRef.current.push({ idx: i + 1, id: cardId, label: st.label, emoji: st.emoji, binLabel: `${i + 1}° lugar`, ok });
    });
    const aciertos = slots.filter((cardId, i) => steps[cardId].order === i).length;
    const perfecto = aciertos === 3;
    setVerdict(vd);
    setApp((s) => ({ ...s, stars: aciertos }));
    // 1) Verificación limpia (✓/✗ + revelar el correcto) ~3 s → 2) cartel ¡EXCELENTE!/¡UPS!
    //    → 3) reporte. (Patrón estándar EDINUN de los juegos de arrastrar.)
    const revealMs = perfecto ? 700 : 3000;
    const bannerMs = 1700;
    setTimeout(() => {
      if (perfecto) { setBanner("ok"); setBannerMsg(`+${aciertos} ⭐`); }
      else { setBanner("err"); setBannerMsg(ANIMOS[Math.floor(Math.random() * ANIMOS.length)]); }
    }, revealMs);
    setTimeout(() => {
      setBanner(null); setBannerMsg("");
      setApp((s) => ({
        ...s,
        lastResult: {
          category: seq.titulo, cols: ["Acción", "Lo pusiste en"], themeEmoji: seq.themeEmoji,
          praise: "¡aprendiste el orden correcto para cuidarte!",
          solved: aciertos, total: 3,
          time: Math.floor((Date.now() - started.current) / 1000),
          starsEarned: aciertos, log: logRef.current.slice(), success: true,
        },
      }));
      if (typeof incrementGamesCompleted === "function") incrementGamesCompleted();
      go("results");
    }, revealMs + bannerMs);
  }

  function confirmRestart() {
    setConfirmingRestart(false);
    initRef.current = buildRoundData();
    setSlots([null, null, null]); setDragId(null); setVerdict(null); setBanner(null); setBannerMsg(""); setDone(false);
    firstDone.current = false; dragRef.current = null; logRef.current = []; started.current = Date.now();
  }

  return (
    <div ref={rootRef} className="ed-noselect" style={{ position: "absolute", inset: 0, overflow: "hidden", WebkitTapHighlightColor: "transparent" }}>
      <style>{GAME_CSS}</style>
      <TemaChipsBar app={app} setApp={setApp} />

      {/* ── HUD ── */}
      <div style={{ position: "absolute", top: 10, left: 16, right: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <EdinunLogoMini size={60} />
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.4)", border: "1px solid rgba(242,194,96,0.45)", borderRadius: 999, padding: "6px 16px", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 14, color: "#fce9a8", letterSpacing: "0.04em" }}>
          📋 {placedCount} / 3
        </div>
      </div>

      {/* ── Enunciado (QUÉ) ── */}
      <div style={{ position: "absolute", left: 150, right: 150, top: 46, textAlign: "center", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 20, color: "#fff", textShadow: "0 2px 6px rgba(0,0,0,0.55)", pointerEvents: "none" }}>
        {seq.titulo} <span style={{ color: "#fce9a8" }}>Ordena del 1 al 3.</span>
      </div>

      {/* ── 3 casillas numeradas ── */}
      {[0, 1, 2].map((i) => {
        const v = verdict && verdict[i];
        const correctStep = seq.pasos[i];
        return (
          <div key={i} ref={(el) => { slotRefs.current[i] = el; }}
            style={{ position: "absolute", left: SLOT_CX[i], top: SLOT_CY, transform: "translate(-50%,-50%)", width: SLOT_W, height: SLOT_H, borderRadius: 18,
              border: v === "ok" ? "3px solid #2ecc71" : v === "wrong" ? "3px solid #e74c3c" : "3px dashed rgba(255,255,255,0.42)",
              background: "rgba(10,6,35,0.32)", zIndex: 2, pointerEvents: "none",
              boxShadow: v === "ok" ? "0 0 0 3px rgba(46,204,113,0.22)" : "none" }}>
            <div style={{ position: "absolute", top: -17, left: "50%", transform: "translateX(-50%)", width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(180deg,#fce9a8,#d9a441)", color: "#3a2608", fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(255,255,255,0.9)", boxShadow: "0 2px 5px rgba(0,0,0,0.4)", zIndex: 4 }}>{i + 1}</div>
            {v === "wrong" && (
              <div className="ed-checkPop" style={{ position: "absolute", left: "50%", bottom: -15, transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 4, background: "rgba(10,6,35,0.92)", border: "1.5px solid #ffd27a", borderRadius: 999, padding: "2px 9px", whiteSpace: "nowrap", zIndex: 5 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#ffd27a" }}>Va:</span>
                <span style={{ fontSize: 17 }}>{correctStep.emoji}</span>
              </div>
            )}
          </div>
        );
      })}

      {/* ── Tarjetas (bandeja abajo / colocadas en su casilla) ── */}
      {cards.map((id) => {
        const st = steps[id];
        const dragging = dragId === id;
        const pos = dragging ? dragXY : restPos(id);
        const si = slots.indexOf(id);
        const v = verdict && si !== -1 ? verdict[si] : null;
        const locked = done || !!verdict;
        return (
          <div key={id}
            onPointerDown={(e) => onPointerDown(e, id)}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onDragStart={(e) => e.preventDefault()}
            style={{ position: "absolute", left: pos.x, top: pos.y, transform: "translate(-50%,-50%)",
              width: 150, zIndex: dragging ? 60 : (si !== -1 ? 12 : 15), touchAction: "none",
              cursor: locked ? "default" : (dragging ? "grabbing" : "grab"),
              transition: dragging ? "none" : "left 0.18s ease, top 0.18s ease",
              filter: dragging ? "drop-shadow(0 10px 12px rgba(0,0,0,0.4))" : "drop-shadow(0 5px 7px rgba(0,0,0,0.3))" }}>
            <div style={{ position: "relative", background: "linear-gradient(180deg, rgba(255,255,255,0.97), rgba(224,231,242,0.97))", borderRadius: 16, border: "2px solid rgba(255,255,255,0.9)", padding: "8px 6px 6px", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <img src={`assets/${st.img}`} alt={st.label} draggable="false" style={{ width: 124, height: 124, objectFit: "contain", display: "block", pointerEvents: "none" }} />
              <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 13, color: "#1a1030", textAlign: "center", lineHeight: 1.05 }}>{st.label}</div>
              {v === "ok" && (<div className="ed-checkPop" style={{ position: "absolute", top: -8, right: -8, width: 26, height: 26, borderRadius: "50%", background: "#2ecc71", color: "#fff", fontWeight: 900, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff", boxShadow: "0 2px 5px rgba(0,0,0,0.4)" }}>✓</div>)}
              {v === "wrong" && (<div className="ed-checkPop" style={{ position: "absolute", top: -8, right: -8, width: 26, height: 26, borderRadius: "50%", background: "#e74c3c", color: "#fff", fontWeight: 900, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff", boxShadow: "0 2px 5px rgba(0,0,0,0.4)" }}>✗</div>)}
            </div>
          </div>
        );
      })}

      {/* ── Personaje guía + bocadillo (izquierda, tamaño estándar EDINUN) ── */}
      <div style={{ position: "absolute", left: 8, bottom: 78, width: 220, pointerEvents: "none", textAlign: "center" }}>
        <div className="ed-float-soft" style={{ position: "absolute", left: 0, right: 0, bottom: "100%", display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative", display: "inline-block", maxWidth: 176, background: "linear-gradient(180deg, rgba(20,12,55,0.95), rgba(10,6,35,0.95))", border: "1.5px solid rgba(242,194,96,0.65)", borderRadius: 16, padding: "10px 14px", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 14, lineHeight: 1.3, color: "#fce9a8", textAlign: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}>
            Arrastra las tarjetas<br />al orden 1, 2, 3.
            <div style={{ position: "absolute", bottom: -10, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "9px solid transparent", borderRight: "9px solid transparent", borderTop: "10px solid rgba(20,12,55,0.95)", filter: "drop-shadow(0 1px 0 rgba(242,194,96,0.55))" }} />
          </div>
        </div>
        <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
          <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", width: 140, height: 16, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(242,194,96,0.45), transparent 70%)", filter: "blur(5px)" }} />
          <char.Component size={186} floating />
        </div>
        <div style={{ marginTop: -2, fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 14, color: "#fce9a8", letterSpacing: "0.04em", textShadow: "0 2px 6px rgba(0,0,0,0.6)" }}>{char.name}</div>
      </div>

      {/* ── Acciones (derecha) ── */}
      <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 10, width: 122 }}>
        <button className="ed-btn ed-btn-verify" onClick={onVerify} disabled={!allPlaced || !!verdict}
          style={{ height: 56, fontSize: 16, fontWeight: 800, letterSpacing: "0.04em", opacity: (allPlaced && !verdict) ? 1 : 0.5, cursor: (allPlaced && !verdict) ? "pointer" : "not-allowed" }}>
          ¡VERIFICAR!
        </button>
        <button className="ed-btn ed-btn-restart" onClick={() => setConfirmingRestart(true)} style={{ fontSize: 14, height: 48, fontWeight: 800, letterSpacing: "0.04em" }}>REINICIAR</button>
        <button className="ed-btn ed-btn-ghost" onClick={() => setConfirmingExit(true)} style={{ fontSize: 14, height: 48, fontWeight: 800, letterSpacing: "0.04em" }}>SALIR</button>
      </div>

      {/* ── Banner ── */}
      {banner && (
        <PortalToBody>
          <div style={{
            position: "fixed", inset: 0, zIndex: 1000, pointerEvents: "none",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14,
            background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)", animation: "ed-pop-in 0.3s",
          }}>
            <div style={{
              fontFamily: "'Fredoka','Baloo 2',system-ui,sans-serif", fontWeight: 700,
              fontSize: "clamp(56px, 11vmin, 120px)",
              color: banner === "ok" ? "#2ecc8f" : "#ff6b6b",
              textShadow: "0 4px 0 rgba(0,0,0,0.45), 0 0 60px currentColor", textAlign: "center",
            }}>
              {banner === "ok" ? "¡EXCELENTE!" : "¡UPS!"}
            </div>
            {bannerMsg && (
              <div style={{
                fontFamily: "'Fredoka','Baloo 2',system-ui,sans-serif", fontWeight: 700,
                fontSize: "clamp(18px, 2.6vmin, 30px)",
                color: banner === "ok" ? "#fce9a8" : "#fff",
                background: "rgba(0,0,0,0.55)", padding: "8px 26px", borderRadius: 999,
                textShadow: "0 2px 6px rgba(0,0,0,0.6)", textAlign: "center",
              }}>
                {banner === "err" ? `${bannerMsg} — ${char.name}` : bannerMsg}
              </div>
            )}
          </div>
        </PortalToBody>
      )}

      {/* ── Modal SALIR ── */}
      {confirmingExit && (
        <PortalToBody>
          <div onClick={() => setConfirmingExit(false)} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.62)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "ed-pop-in 0.18s", padding: 16 }}>
            <div onClick={(e) => e.stopPropagation()} className="ed-card" style={{ padding: 24, maxWidth: 440, textAlign: "center", boxShadow: "var(--ed-shadow-card), 0 0 40px rgba(255,107,107,0.3)" }}>
              <div className="ed-label" style={{ color: "#ff8b8b", marginBottom: 6 }}>Salir del juego</div>
              <h2 className="ed-h1" style={{ fontSize: 22, lineHeight: 1.15, marginBottom: 8 }}>¿Volver al inicio?</h2>
              <p className="ed-body" style={{ marginBottom: 16, fontSize: 14 }}>Vas a perder tu avance.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <button className="ed-btn ed-btn-ghost" onClick={() => setConfirmingExit(false)} style={{ height: 44, fontWeight: 800, letterSpacing: "0.04em" }}>SEGUIR JUGANDO</button>
                <button className="ed-btn ed-btn-primary" onClick={() => { setConfirmingExit(false); go("home"); }} style={{ height: 44, fontWeight: 800, letterSpacing: "0.04em" }}>SÍ, SALIR</button>
              </div>
            </div>
          </div>
        </PortalToBody>
      )}

      {/* ── Modal REINICIAR ── */}
      {confirmingRestart && (
        <PortalToBody>
          <div onClick={() => setConfirmingRestart(false)} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.62)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "ed-pop-in 0.18s", padding: 16 }}>
            <div onClick={(e) => e.stopPropagation()} className="ed-card" style={{ padding: 24, maxWidth: 440, textAlign: "center", boxShadow: "var(--ed-shadow-card), 0 0 40px rgba(155,123,232,0.3)" }}>
              <div className="ed-label" style={{ color: "#c4a8ff", marginBottom: 6 }}>Reiniciar juego</div>
              <h2 className="ed-h1" style={{ fontSize: 22, lineHeight: 1.15, marginBottom: 8 }}>¿Empezar de nuevo?</h2>
              <p className="ed-body" style={{ marginBottom: 16, fontSize: 14 }}>Sale otra secuencia para ordenar.</p>
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
// RESULTS — reporte académico imprimible (generalizado: res.cols/praise/themeEmoji).
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
  tr: { borderBottom: "1px solid #ccc" },
  td: { padding: "9px 8px", fontFamily: "'Nunito',sans-serif" },
  tdNum: { color: "#888", width: 36, fontFamily: "ui-monospace,Consolas,monospace" },
  tdOk: { textAlign: "center", fontWeight: 700 },
  summary: { marginTop: 16, borderTop: "2px solid #d9a441", paddingTop: 12, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 },
  cell: { padding: 10, borderRadius: 6, border: "1px solid #ddd", textAlign: "center" },
  cellEmp: { background: "#faf3df", borderColor: "#d9a441" },
  cellL: { fontSize: "8pt", textTransform: "uppercase", letterSpacing: "0.08em", color: "#666" },
  cellV: { fontSize: "18pt", fontWeight: 800, marginTop: 4 },
  foot: { marginTop: 16, fontSize: "9pt", color: "#888", textAlign: "center" },
};

function PrintableReport({ studentName, res, dateStr, mm, ss, aciertos, errores }) {
  const log = res.log || [];
  const pcols = res.cols || ["Acción", "Posición"];
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
          <div style={printStyles.field}><div style={printStyles.fieldL}>Tiempo total</div><div style={printStyles.fieldV}>{String(mm).padStart(2, "0")}:{String(ss).padStart(2, "0")}</div></div>
        </div>
        <table style={printStyles.table}>
          <thead>
            <tr style={printStyles.thHead}>
              <th style={printStyles.th}>#</th>
              <th style={printStyles.th}>{pcols[0]}</th>
              <th style={printStyles.th}>{pcols[1]}</th>
              <th style={{ ...printStyles.th, ...printStyles.thC }}>Resultado</th>
            </tr>
          </thead>
          <tbody>
            {log.map((e) => (
              <tr key={e.idx} style={printStyles.tr}>
                <td style={{ ...printStyles.td, ...printStyles.tdNum }}>{e.idx}</td>
                <td style={{ ...printStyles.td, fontWeight: 700 }}>{e.emoji} {e.label}</td>
                <td style={printStyles.td}>{e.binLabel}</td>
                <td style={{ ...printStyles.td, ...printStyles.tdOk, color: e.ok ? "#1e8a5d" : "#c0392b" }}>{e.ok ? "Correcto" : "Incorrecto"}</td>
              </tr>
            ))}
            {log.length === 0 && (<tr><td colSpan={4} style={{ padding: 24, textAlign: "center", color: "#888", fontStyle: "italic" }}>Sin datos.</td></tr>)}
          </tbody>
        </table>
        <div style={printStyles.summary}>
          <div style={printStyles.cell}><div style={printStyles.cellL}>Aciertos</div><div style={printStyles.cellV}>{aciertos} / {res.total}</div></div>
          <div style={printStyles.cell}><div style={printStyles.cellL}>Errores</div><div style={printStyles.cellV}>{errores}</div></div>
          <div style={printStyles.cell}><div style={printStyles.cellL}>Estrellas</div><div style={printStyles.cellV}>{res.starsEarned}</div></div>
          <div style={{ ...printStyles.cell, ...printStyles.cellEmp }}><div style={printStyles.cellL}>Tema</div><div style={printStyles.cellV}>{res.themeEmoji || "🛡️"}</div></div>
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
  const res = app.lastResult || { category: CAT_LABEL, solved: 0, total: ROUND, time: 0, starsEarned: 0, log: [] };
  const cols = res.cols || ["Acción", "Posición"]; // encabezados de la tabla según la mecánica
  const mm = Math.floor(res.time / 60), ss = res.time % 60;
  const log = res.log || [];
  const aciertos = res.solved != null ? res.solved : log.filter((e) => e.ok).length;
  const errores = Math.max(0, (res.total || log.length) - aciertos);
  const dateStr = new Date().toLocaleDateString("es-EC", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 14, left: 24, right: 24, display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
        <button className="ed-btn ed-btn-ghost" onClick={() => go("home")} style={{ padding: "8px 14px", fontWeight: 800, letterSpacing: "0.04em" }}>← VOLVER AL INICIO</button>
      </div>

      <div style={{ position: "absolute", inset: "70px 32px 20px 32px", display: "grid", gridTemplateColumns: "0.85fr 1.4fr", gap: 24, alignItems: "stretch" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 34, background: "linear-gradient(180deg, #fce9a8, #d9a441)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1, marginBottom: 4 }}>¡Muy bien!</div>
          <char.Component size={176} />
          <div className="ed-body" style={{ fontStyle: "italic", textAlign: "center", maxWidth: 240, fontSize: 13 }}>
            {`"${app.studentName || "Campeón"}, ${res.praise || "¡lo hiciste muy bien!"}"`}
            <div style={{ marginTop: 4, color: "var(--ed-ink-soft)", fontSize: 12 }}>— {char.name}</div>
          </div>
        </div>

        <div className="ed-card" style={{ padding: 16, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, borderBottom: "2px solid rgba(242,194,96,0.45)", paddingBottom: 10, marginBottom: 12 }}>
            <EdinunLogoMini size={52} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 17, letterSpacing: "0.04em", lineHeight: 1.1 }}>EDINUN — Ediciones Nacionales Unidas</div>
              <div style={{ fontFamily: "var(--ed-font-ui)", fontSize: 11, color: "var(--ed-ink-soft)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>Reporte académico · Estudios Sociales</div>
            </div>
            <div style={{ fontFamily: "var(--ed-font-mono)", fontSize: 11, color: "var(--ed-ink-dim)", textAlign: "right" }}>{dateStr}</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, fontFamily: "var(--ed-font-ui)", fontSize: 12, marginBottom: 10 }}>
            <ReportField label="Estudiante" value={app.studentName || "—"} />
            <ReportField label="Tema" value={res.category} />
            <ReportField label="Tiempo" value={`${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`} />
          </div>

          <div style={{ flex: 1, minHeight: 0, overflow: "auto", marginBottom: 10 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--ed-font-ui)", fontSize: 12 }}>
              <thead>
                <tr style={{ fontWeight: 700, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ed-ink-dim)", borderBottom: "1px solid rgba(148,120,255,0.3)" }}>
                  <th style={{ textAlign: "left", padding: "6px 8px", width: 30 }}>#</th>
                  <th style={{ textAlign: "left", padding: "6px 8px" }}>{cols[0]}</th>
                  <th style={{ textAlign: "left", padding: "6px 8px" }}>{cols[1]}</th>
                  <th style={{ textAlign: "center", padding: "6px 8px" }}>Resultado</th>
                </tr>
              </thead>
              <tbody>
                {log.map((e) => (
                  <tr key={e.idx} style={{ borderBottom: "1px solid rgba(148,120,255,0.18)" }}>
                    <td style={{ padding: "7px 8px", color: "var(--ed-ink-soft)" }}>{e.idx}</td>
                    <td style={{ padding: "7px 8px", fontWeight: 600 }}>{e.emoji} {e.label}</td>
                    <td style={{ padding: "7px 8px" }}>{e.binLabel}</td>
                    <td style={{ padding: "7px 8px", textAlign: "center", fontFamily: "var(--ed-font-display)", fontWeight: 700, color: e.ok ? "#2ecc8f" : "#e74c3c" }}>{e.ok ? "✓" : "✗"}</td>
                  </tr>
                ))}
                {log.length === 0 && (<tr><td colSpan={4} style={{ padding: "16px 8px", textAlign: "center", color: "var(--ed-ink-soft)", fontStyle: "italic" }}>Sin datos.</td></tr>)}
              </tbody>
            </table>
          </div>

          <div style={{ borderTop: "2px solid rgba(242,194,96,0.45)", paddingTop: 10, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, fontFamily: "var(--ed-font-ui)", fontSize: 11 }}>
            <SummaryCell label="Aciertos" value={`${aciertos} / ${res.total}`} />
            <SummaryCell label="Errores" value={`${errores}`} tone="#ff9b9b" />
            <SummaryCell label="Estrellas" value={`${res.starsEarned}`} tone="#fce9a8" />
            <SummaryCell label="Tema" value={res.themeEmoji || "🛡️"} tone="#fce9a8" emphasis />
          </div>

          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button className="ed-btn ed-btn-ghost" onClick={() => window.print()} style={{ padding: "0 10px", fontSize: 13, height: 44, fontWeight: 800, letterSpacing: "0.04em" }}>IMPRIMIR REPORTE</button>
            <button className="ed-btn ed-btn-primary" onClick={() => go("game")} style={{ padding: "0 10px", fontSize: 13, height: 44, fontWeight: 800, letterSpacing: "0.04em" }}>JUGAR OTRA VEZ</button>
          </div>
        </div>
      </div>

      <PrintableReport studentName={app.studentName} res={res} dateStr={dateStr} mm={mm} ss={ss} aciertos={aciertos} errores={errores} />
    </div>
  );
}

// GameScreen: por ahora el juego tiene un solo tema activo (Tema 1 = ORDENAR).
// Cuando se agreguen los temas 2 y 3, este dispatcher elegirá por app.currentCategory.
function GameScreen(props) {
  return <OrdenarGame {...props} />;
}

Object.assign(window, { GameScreen, ResultsScreen });
