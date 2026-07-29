// game-screens.jsx — juego-6 (Estudios Sociales) · ESQUELETO.
// Por ahora cada tema abre un juego PLACEHOLDER ("en construcción") que respeta el
// chrome EDINUN (HUD, personaje, acciones, reporte). Cuando llegue el contenido de
// cada libro/tema, aquí se implementa la mecánica real y GameScreen despacha por
// `app.currentCategory` (l2-t1, l3-t1, l3-t2, l3-t3, l5-t1, l5-t2, l6-t1).

const { useState: useStateG, useEffect: useEffectG, useRef: useRefG } = React;

function PortalToBody({ children }) {
  return ReactDOM.createPortal(children, document.body);
}

// ═════════════════════════════════════════════════════════════════════════
// LIBRO 2 · "Reconociendo mi país" (6 años) — Mira y toca (patrón 5).
// Banco del libro (la correcta sale del texto; los distractores son contrastes
// obvios). El niño TOCA 1 de 3. Bocadillo fijo = CÓMO. Anti-repetición al recargar.
// ═════════════════════════════════════════════════════════════════════════
const L2_ROUNDS = 4;
const L2_RECENT_KEY = "edinun_juego6_l2_recientes_v1";
const L2_RECENT_CAP = 6;

const PREGUNTAS_L2 = [
  { ctx: "🌎", enunciado: "¿Cómo se llama nuestro país?", opciones: [{ e: "🇪🇨", t: "Ecuador" }, { e: "🇵🇪", t: "Perú" }, { e: "🇨🇴", t: "Colombia" }], correcta: 0 },
  { ctx: "🏛️", enunciado: "¿Cuál es la capital del Ecuador?", opciones: [{ e: "🏛️", t: "Quito" }, { e: "🌆", t: "Guayaquil" }, { e: "⛪", t: "Cuenca" }], correcta: 0 },
  { ctx: "💧", enunciado: "¿Cuál es un servicio básico?", opciones: [{ e: "💧", t: "Agua potable" }, { e: "🧸", t: "Juguete" }, { e: "🍭", t: "Dulce" }], correcta: 0 },
  { ctx: "💡", enunciado: "¿Qué servicio lleva la luz a tu casa?", opciones: [{ e: "💡", t: "Energía eléctrica" }, { e: "📺", t: "Tele" }, { e: "🎈", t: "Globo" }], correcta: 0 },
  { ctx: "🗑️", enunciado: "¿Qué servicio recoge la basura?", opciones: [{ e: "🍎", t: "Fruta" }, { e: "🗑️", t: "Recolección de basura" }, { e: "🎨", t: "Pintura" }], correcta: 1 },
  { ctx: "📞", enunciado: "¿A quién llamas en una emergencia?", opciones: [{ e: "🎮", t: "Videojuego" }, { e: "🛒", t: "Tienda" }, { e: "📞", t: "ECU 911" }], correcta: 2 },
  { ctx: "🚒", enunciado: "¿Quién apaga los incendios?", opciones: [{ e: "🚒", t: "Bomberos" }, { e: "🤡", t: "Payaso" }, { e: "🧑‍🍳", t: "Cocinero" }], correcta: 0 },
  { ctx: "👮", enunciado: "¿Quién cuida el orden en la ciudad?", opciones: [{ e: "🎤", t: "Cantante" }, { e: "👮", t: "Policía" }, { e: "🎨", t: "Pintor" }], correcta: 1 },
  { ctx: "⛑️", enunciado: "¿Quién da los primeros auxilios?", opciones: [{ e: "👷", t: "Albañil" }, { e: "👨‍🌾", t: "Agricultor" }, { e: "⛑️", t: "Cruz Roja" }], correcta: 2 },
  { ctx: "🌆", enunciado: "¿Cuál es la ciudad con más habitantes?", opciones: [{ e: "🏙️", t: "Guayaquil" }, { e: "🌳", t: "Puyo" }, { e: "🏖️", t: "Manta" }], correcta: 0 },
];

function l2Shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}
function l2Recent() { try { const r = JSON.parse(localStorage.getItem(L2_RECENT_KEY) || "[]"); return Array.isArray(r) ? r : []; } catch (e) { return []; } }
function l2Push(ids) { try { const prev = l2Recent().filter((id) => ids.indexOf(id) === -1); localStorage.setItem(L2_RECENT_KEY, JSON.stringify(ids.concat(prev).slice(0, L2_RECENT_CAP))); } catch (e) {} }
// Elige L2_ROUNDS preguntas: primero las NO recientes (barajadas) → recargar varía.
function l2BuildRounds() {
  const recent = new Set(l2Recent());
  const all = PREGUNTAS_L2.map((_, i) => i);
  const fresh = l2Shuffle(all.filter((i) => !recent.has(i)));
  const stale = l2Shuffle(all.filter((i) => recent.has(i)));
  const chosen = fresh.concat(stale).slice(0, L2_ROUNDS);
  l2Push(chosen);
  // baraja las opciones de cada pregunta (posición de la correcta variada)
  return chosen.map((qi) => {
    const q = PREGUNTAS_L2[qi];
    const ok = q.opciones[q.correcta];
    const ops = l2Shuffle(q.opciones);
    return { ctx: q.ctx, enunciado: q.enunciado, opciones: ops, correcta: ops.indexOf(ok) };
  });
}

const L2_ANIMOS = ["¡Casi! Sigue intentándolo.", "¡La próxima es tuya!", "Equivocarse también es aprender.", "¡Ya casi te lo sabes!"];
const L2_OPT_COLORS = ["#ef5a5a", "#4fa0ff", "#2ecc8f"];

function ReconoceGame({ app, setApp, go }) {
  const char = CHARACTERS.find((c) => c.id === app.character) || CHARACTERS[0];
  const catLabel = app.currentCatLabel || "Reconociendo mi país";

  const [rounds, setRounds] = useStateG(() => l2BuildRounds());
  const [idx, setIdx] = useStateG(0);
  const [picked, setPicked] = useStateG(null);
  const [feedback, setFeedback] = useStateG(null);
  const [feedbackMsg, setFeedbackMsg] = useStateG("");
  const [aciertos, setAciertos] = useStateG(0);
  const [stars, setStars] = useStateG(0);
  const [elapsed, setElapsed] = useStateG(0);
  const [log, setLog] = useStateG([]);
  const [confirmingExit, setConfirmingExit] = useStateG(false);
  const [confirmingRestart, setConfirmingRestart] = useStateG(false);

  const started = useRefG(Date.now());
  const exerciseStart = useRefG(Date.now());
  const advancing = useRefG(false);

  useEffectG(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - started.current) / 1000)), 500);
    return () => clearInterval(t);
  }, []);

  const q = rounds[idx];
  const answered = picked !== null;
  const correcta = q.opciones[q.correcta];
  function formatTime(s) { const m = Math.floor(s / 60), ss = s % 60; return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`; }

  function confirmRestart() {
    setConfirmingRestart(false); advancing.current = false;
    setRounds(l2BuildRounds());
    setIdx(0); setPicked(null); setFeedback(null); setFeedbackMsg(""); setAciertos(0); setStars(0); setLog([]);
    started.current = Date.now(); exerciseStart.current = Date.now();
  }

  function answerTap(i) {
    if (answered || advancing.current) return;
    if (typeof markFirstAttempt === "function") markFirstAttempt();
    setPicked(i);
    const isCorrect = i === q.correcta;
    const exSec = Math.max(0, Math.floor((Date.now() - exerciseStart.current) / 1000));
    const entry = { idx: idx + 1, emoji: q.ctx, a: q.enunciado, userAnswer: `${q.opciones[i].e} ${q.opciones[i].t}`, correctAnswer: `${correcta.e} ${correcta.t}`, isCorrect, time: exSec };
    const newLog = [...log, entry];
    const newAciertos = aciertos + (isCorrect ? 1 : 0);
    const newStars = stars + (isCorrect ? 1 : 0);
    const isLast = idx + 1 >= rounds.length;
    setLog(newLog); setAciertos(newAciertos); setStars(newStars);
    advancing.current = true;
    if (isCorrect) {
      setApp((s) => ({ ...s, stars: (s.stars || 0) + 1 }));
      setFeedback("ok"); setFeedbackMsg("+1 ⭐");
      setTimeout(() => advance(newLog, newAciertos, newStars, isLast), 1050);
    } else {
      setTimeout(() => { setFeedback("err"); setFeedbackMsg(L2_ANIMOS[idx % L2_ANIMOS.length]); }, 2000);
      setTimeout(() => advance(newLog, newAciertos, newStars, isLast), 2700);
    }
  }

  function advance(newLog, newAciertos, newStars, isLast) {
    setFeedback(null); setFeedbackMsg("");
    if (!isLast) {
      setIdx((i) => i + 1); setPicked(null); exerciseStart.current = Date.now(); advancing.current = false;
    } else {
      setApp((s) => ({
        ...s, stars: newStars,
        lastResult: { category: catLabel, solved: newAciertos, total: rounds.length, time: Math.floor((Date.now() - started.current) / 1000), starsEarned: newStars, log: newLog },
      }));
      if (typeof incrementGamesCompleted === "function") incrementGamesCompleted();
      go("results");
    }
  }

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* HUD */}
      <div style={{ position: "absolute", top: 10, left: 16, right: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <EdinunLogoMini size={64} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.35)", borderRadius: 999, padding: "6px 12px", border: "1px solid rgba(242,194,96,0.4)", fontFamily: "var(--ed-font-mono)", fontSize: 13, color: "#fce9a8" }}>⏱ {formatTime(elapsed)}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.35)", borderRadius: 999, padding: "6px 12px", border: "1px solid rgba(242,194,96,0.4)", fontFamily: "var(--ed-font-display)", fontWeight: 600, color: "#fce9a8" }}>⭐ {stars}</div>
        </div>
      </div>

      {/* RONDA con dots — top:52 (§1.1) */}
      <div style={{ position: "absolute", top: 52, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 8 }}>
        <span className="ed-label" style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>Ronda</span>
        {Array.from({ length: rounds.length }).map((_, i) => {
          const done = i < log.length;
          const ok = done && log[i] && log[i].isCorrect;
          return (
            <div key={i} style={{ width: 11, height: 11, borderRadius: "50%", background: done ? (ok ? "#fce9a8" : "#ff6b6b") : (i === idx ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)"), boxShadow: done ? "0 0 8px currentColor" : "none", color: ok ? "#fce9a8" : "#ff6b6b" }} />
          );
        })}
      </div>

      {/* Personaje guía + bocadillo (CÓMO, fijo) */}
      <div style={{ position: "absolute", left: 8, bottom: 78, width: 220, pointerEvents: "none", textAlign: "center" }}>
        <div className="ed-float-soft" style={{ position: "absolute", left: 0, right: 0, bottom: "100%", display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative", display: "inline-block", maxWidth: 210, background: "linear-gradient(180deg, rgba(20,12,55,0.95), rgba(10,6,35,0.95))", border: "1.5px solid rgba(242,194,96,0.65)", borderRadius: 16, padding: "10px 14px", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 14, lineHeight: 1.3, color: "#fce9a8", textAlign: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}>
            Toca la respuesta<br />correcta.
            <div style={{ position: "absolute", bottom: -10, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "9px solid transparent", borderRight: "9px solid transparent", borderTop: "10px solid rgba(20,12,55,0.95)", filter: "drop-shadow(0 1px 0 rgba(242,194,96,0.55))" }} />
          </div>
        </div>
        <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
          <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", width: 140, height: 16, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(242,194,96,0.45), transparent 70%)", filter: "blur(5px)" }} />
          <char.Component size={186} floating />
        </div>
        <div style={{ marginTop: -2, fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 14, color: "#fce9a8", letterSpacing: "0.04em", textShadow: "0 2px 6px rgba(0,0,0,0.6)" }}>{char.name}</div>
      </div>

      {/* Zona central: enunciado + cartel + opciones */}
      <div style={{ position: "absolute", top: 60, bottom: 18, left: 215, right: 215, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly" }}>
        <div style={{ textAlign: "center", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 23, lineHeight: 1.15, color: "#fff", textShadow: "0 2px 6px rgba(0,0,0,0.55)", pointerEvents: "none", maxWidth: 470 }}>
          {q.enunciado}
        </div>
        <div style={{ width: 130, height: 116, borderRadius: 20, background: "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(240,235,225,0.9))", border: "3px solid #f2c260", boxShadow: "0 12px 28px rgba(0,0,0,0.45), 0 0 0 1px rgba(242,194,96,0.35), inset 0 -4px 0 rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 82, lineHeight: 1 }}>
          {q.ctx}
        </div>
        <div style={{ display: "flex", gap: 18, justifyContent: "center", flexWrap: "nowrap" }}>
          {q.opciones.map((op, i) => {
            const correctOne = i === q.correcta;
            const baseColor = L2_OPT_COLORS[i % L2_OPT_COLORS.length];
            let borderColor = baseColor, bg = "linear-gradient(180deg, #fff8e6 0%, #f7e3a8 100%)", nameColor = "#3a2608";
            if (answered) {
              if (correctOne) { borderColor = "#2ecc8f"; bg = "linear-gradient(180deg, rgba(72,224,154,0.95), rgba(26,143,95,0.92))"; nameColor = "#06381f"; }
              else if (i === picked) { borderColor = "#ff6b6b"; bg = "linear-gradient(180deg, rgba(255,139,139,0.92), rgba(178,47,47,0.9))"; nameColor = "#fff"; }
              else { bg = "linear-gradient(180deg, rgba(255,248,230,0.5), rgba(247,227,168,0.5))"; }
            }
            return (
              <button key={i} onClick={() => answerTap(i)} disabled={answered}
                style={{ width: 128, height: 128, borderRadius: 18, border: `3px solid ${borderColor}`, background: bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, cursor: answered ? "default" : "pointer", boxShadow: answered && correctOne ? "0 0 22px rgba(46,204,143,0.6), inset 0 1px 0 rgba(255,255,255,0.4)" : "inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -3px 0 rgba(0,0,0,0.12), 0 6px 14px rgba(0,0,0,0.3)", transform: answered && correctOne ? "translateY(-4px)" : "none", transition: "all 0.15s ease" }}>
                <span style={{ fontSize: 62, lineHeight: 1, filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.3))" }}>{op.e}</span>
                <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 15, color: nameColor, textAlign: "center", lineHeight: 1.05 }}>{op.t}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Acciones */}
      <div style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 12, width: 150 }}>
        <button className="ed-btn ed-btn-restart" onClick={() => setConfirmingRestart(true)} style={{ fontSize: 15, padding: "0 10px", height: 56, fontWeight: 800, letterSpacing: "0.04em" }}>REINICIAR</button>
        <button className="ed-btn ed-btn-ghost" onClick={() => setConfirmingExit(true)} style={{ fontSize: 15, padding: "0 10px", height: 56, fontWeight: 800, letterSpacing: "0.04em" }}>SALIR</button>
      </div>

      {/* Overlay */}
      {feedback && (
        <PortalToBody>
          <div style={{ position: "fixed", inset: 0, zIndex: 1000, pointerEvents: "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)", animation: "ed-pop-in 0.3s" }}>
            <div style={{ fontFamily: "'Fredoka','Baloo 2',system-ui,sans-serif", fontWeight: 700, fontSize: "clamp(56px, 11vmin, 120px)", color: feedback === "ok" ? "#2ecc8f" : "#ff6b6b", textShadow: "0 4px 0 rgba(0,0,0,0.45), 0 0 60px currentColor" }}>{feedback === "ok" ? "¡EXCELENTE!" : "¡UPS!"}</div>
            {feedbackMsg && (<div style={{ fontFamily: "'Fredoka','Baloo 2',system-ui,sans-serif", fontWeight: 700, fontSize: "clamp(18px, 2.6vmin, 30px)", color: feedback === "ok" ? "#fce9a8" : "#fff", background: "rgba(0,0,0,0.55)", padding: "8px 26px", borderRadius: 999, textShadow: "0 2px 6px rgba(0,0,0,0.6)", textAlign: "center" }}>{feedback === "err" ? `${feedbackMsg} — ${char.name}` : feedbackMsg}</div>)}
          </div>
        </PortalToBody>
      )}

      {/* Modal SALIR */}
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

      {/* Modal REINICIAR */}
      {confirmingRestart && (
        <PortalToBody>
          <div onClick={() => setConfirmingRestart(false)} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.62)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "ed-pop-in 0.18s", padding: 16 }}>
            <div onClick={(e) => e.stopPropagation()} className="ed-card" style={{ padding: 24, maxWidth: 440, textAlign: "center", boxShadow: "var(--ed-shadow-card), 0 0 40px rgba(155,123,232,0.3)" }}>
              <div className="ed-label" style={{ color: "#c4a8ff", marginBottom: 6 }}>Reiniciar juego</div>
              <h2 className="ed-h1" style={{ fontSize: 22, lineHeight: 1.15, marginBottom: 8 }}>¿Empezar de nuevo?</h2>
              <p className="ed-body" style={{ marginBottom: 16, fontSize: 14 }}>Vas a jugar con preguntas nuevas.</p>
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

// ═════════════════════════════════════════════════════════════════════════
// LIBRO 3 · TEMA 1 · "Hechos históricos" (7 años) — VENTANAS DEL PASADO.
// Un personaje histórico (nombre) → su ÁREA (el niño TOCA 1 de 3). Con cada
// ronda se abre una ventana de una POSTAL escondida del Ecuador; al terminar se
// revela la postal completa + su dato. Contenido del libro; personas reales SIN
// imagen (emoji del área + nombre). Bocadillo fijo = CÓMO. Anti-repetición.
// ═════════════════════════════════════════════════════════════════════════
const L3_ROUNDS = 4;
const L3_RECENT_KEY = "edinun_juego6_l3_recientes_v1";
const L3_RECENT_CAP = 6;

const L3_AREAS = {
  musica: { t: "música", e: "🎵" },
  pintura: { t: "pintura", e: "🎨" },
  deporte: { t: "deporte", e: "⚽" },
  politica: { t: "política", e: "🏛️" },
  literatura: { t: "literatura", e: "📖" },
};
const L3_AREA_IDS = ["musica", "pintura", "deporte", "politica", "literatura"];

// Persona ↔ área SALEN DEL LIBRO ("ecuatorianos ejemplares" + "indaguemos más").
// (Eduardo Kingman se deja fuera: el libro lo etiqueta "arte" → mezclaría con
//  "pintura" y sería injusto para el niño. No añadir personas sin material del libro.)
// `slug` → retrato opcional en assets/pers-<slug>.(jpg|png|…). Si el archivo no
// existe, cae al 👤 (ver L3Foto). Personas reales → la autora pone las fotos
// REALES del libro; NO se generan con IA.
const PERSONAJES_L3 = [
  { n: "Julio Jaramillo", slug: "jaramillo", area: "musica" },
  { n: "Araceli Gilbert", slug: "gilbert", area: "pintura" },
  { n: "Oswaldo Guayasamín", slug: "guayasamin", area: "pintura" },
  { n: "Glenda Morejón", slug: "morejon", area: "deporte" },
  { n: "Richard Carapaz", slug: "carapaz", area: "deporte" },
  { n: "Eloy Alfaro", slug: "alfaro", area: "politica" },
  { n: "Rumiñahui", slug: "ruminahui", area: "politica" }, // el libro: "política y milicia"
  { n: "María Fernanda Heredia", slug: "heredia", area: "literatura" },
  { n: "Juan Montalvo", slug: "montalvo", area: "literatura" }, // el libro: "gran novelista de Ambato"
];

// Postales del Ecuador — RESERVADO para un posible "bonus de juego perfecto"
// (imágenes opcionales; los prompts ya se entregaron a la autora). La mecánica A
// (elegida) NO las usa: el álbum final muestra las FOTOS de los personajes descubiertos.
const POSTALES_L3 = [
  { id: "pichincha", titulo: "Batalla de Pichincha", cells: ["☀️", "🦅", "🌋", "🇪🇨"], dato: "La Batalla de Pichincha fue parte de nuestra independencia." },
  { id: "templo", titulo: "Templo de la Patria", cells: ["🕊️", "⭐", "🏛️", "🔥"], dato: "El Templo de la Patria, en Quito, recuerda a los héroes." },
  { id: "regiones", titulo: "Regiones del Ecuador", cells: ["🏝️", "⛰️", "🏖️", "🌳"], dato: "Ecuador tiene región insular, costa, sierra y amazonía." },
];

function l3Shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function l3Recent() { try { const r = JSON.parse(localStorage.getItem(L3_RECENT_KEY) || "[]"); return Array.isArray(r) ? r : []; } catch (e) { return []; } }
function l3Push(ids) { try { const prev = l3Recent().filter((id) => ids.indexOf(id) === -1); localStorage.setItem(L3_RECENT_KEY, JSON.stringify(ids.concat(prev).slice(0, L3_RECENT_CAP))); } catch (e) {} }

// Elige L3_ROUNDS personajes (los NO recientes primero) y arma 3 opciones de área
// por ronda: la correcta (del libro) + 2 áreas distractoras. Recargar varía.
function l3BuildRounds() {
  const recent = new Set(l3Recent());
  const all = PERSONAJES_L3.map((_, i) => i);
  const fresh = l3Shuffle(all.filter((i) => !recent.has(i)));
  const stale = l3Shuffle(all.filter((i) => recent.has(i)));
  const chosen = fresh.concat(stale).slice(0, L3_ROUNDS);
  l3Push(chosen);
  return chosen.map((pi) => {
    const p = PERSONAJES_L3[pi];
    const distractores = l3Shuffle(L3_AREA_IDS.filter((a) => a !== p.area)).slice(0, 2);
    const opsIds = l3Shuffle([p.area].concat(distractores));
    const opciones = opsIds.map((id) => ({ id, e: L3_AREAS[id].e, t: L3_AREAS[id].t }));
    return { nombre: p.n, slug: p.slug, area: p.area, opciones, correcta: opsIds.indexOf(p.area) };
  });
}

const L3_ANIMOS = ["¡Casi! Sigue intentándolo.", "¡La próxima es tuya!", "Equivocarse también es aprender.", "¡Ya casi te lo sabes!"];
const L3_OPT_COLORS = ["#ef5a5a", "#4fa0ff", "#2ecc8f"];
// Foto del personaje TAPADA por 4 ventanas. Intenta la foto real
// (assets/pers-<slug>.<ext>) y, si no existe ninguna, cae al 👤. `revealed` abre las
// ventanas (solo al acertar). La autora pone las fotos REALES del libro; NO se generan.
const L3_IMG_EXTS = ["jpg", "png", "jpeg", "webp"];

function L3Foto({ slug, revealed, size = 184, prefix = "pers", fallback = "👤" }) {
  const [tryIdx, setTryIdx] = useStateG(0);
  const failed = tryIdx >= L3_IMG_EXTS.length;
  return (
    <div style={{ position: "relative", width: size, height: size, borderRadius: 16, overflow: "hidden", border: "3px solid #f2c260", boxShadow: "0 12px 28px rgba(0,0,0,0.45)", background: "#2b1c62" }}>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(180deg, #fff, #efe9dc)" }}>
        {!failed ? (
          <img src={`assets/${prefix}-${slug}.${L3_IMG_EXTS[tryIdx]}`} alt="" draggable="false" onError={() => setTryIdx((i) => i + 1)}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <span style={{ fontSize: Math.round(size * 0.5), lineHeight: 1, filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.25))" }}>{fallback}</span>
        )}
      </div>
      <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 4, padding: 4, pointerEvents: "none" }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(180deg, #f2c260, #d79a2b)", border: "1px solid rgba(255,255,255,0.35)", boxShadow: "inset 0 -3px 0 rgba(0,0,0,0.15)", transition: "opacity 0.5s ease, transform 0.5s ease", transitionDelay: `${i * 130}ms`, opacity: revealed ? 0 : 1, transform: revealed ? "scale(0.4)" : "scale(1)" }}>
            <span style={{ fontSize: 30, color: "rgba(60,38,8,0.55)", fontWeight: 800 }}>?</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Tarjeta del álbum final: foto si lo descubrió (acertó); 👤/🔒 (gris) si no.
function L3AlbumCard({ slug, nombre, area, ok }) {
  const [tryIdx, setTryIdx] = useStateG(0);
  const failed = tryIdx >= L3_IMG_EXTS.length;
  const ar = L3_AREAS[area] || { t: area, e: "❓" };
  return (
    <div style={{ width: 116, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ position: "relative", width: 92, height: 92, borderRadius: 12, overflow: "hidden", border: `3px solid ${ok ? "#2ecc8f" : "rgba(255,255,255,0.3)"}`, background: "linear-gradient(180deg, #fff, #efe9dc)", display: "flex", alignItems: "center", justifyContent: "center", filter: ok ? "none" : "grayscale(1) brightness(0.85)" }}>
        {ok && !failed ? (
          <img src={`assets/pers-${slug}.${L3_IMG_EXTS[tryIdx]}`} alt="" draggable="false" onError={() => setTryIdx((i) => i + 1)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: 46 }}>{ok ? "👤" : "🔒"}</span>
        )}
      </div>
      <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 12, color: "#fff", textAlign: "center", lineHeight: 1.05 }}>{nombre}</div>
      <div style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 11, color: ok ? "#fce9a8" : "rgba(255,255,255,0.5)" }}>{ar.e} {ar.t}</div>
    </div>
  );
}

function VentanasGame({ app, setApp, go }) {
  const char = CHARACTERS.find((c) => c.id === app.character) || CHARACTERS[0];
  const catLabel = app.currentCatLabel || "Hechos históricos";

  const [rounds, setRounds] = useStateG(() => l3BuildRounds());
  const [idx, setIdx] = useStateG(0);
  const [picked, setPicked] = useStateG(null);
  const [revealed, setRevealed] = useStateG(false); // ventanas abiertas de la ronda (solo al acertar)
  const [feedback, setFeedback] = useStateG(null);
  const [feedbackMsg, setFeedbackMsg] = useStateG("");
  const [aciertos, setAciertos] = useStateG(0);
  const [stars, setStars] = useStateG(0);
  const [elapsed, setElapsed] = useStateG(0);
  const [log, setLog] = useStateG([]);
  const [albumOpen, setAlbumOpen] = useStateG(false); // overlay final (álbum de personajes)
  const [confirmingExit, setConfirmingExit] = useStateG(false);
  const [confirmingRestart, setConfirmingRestart] = useStateG(false);

  const started = useRefG(Date.now());
  const exerciseStart = useRefG(Date.now());
  const advancing = useRefG(false);

  useEffectG(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - started.current) / 1000)), 500);
    return () => clearInterval(t);
  }, []);

  const q = rounds[idx];
  const answered = picked !== null;
  const correcta = q.opciones[q.correcta];
  function formatTime(s) { const m = Math.floor(s / 60), ss = s % 60; return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`; }

  function confirmRestart() {
    setConfirmingRestart(false); advancing.current = false;
    setRounds(l3BuildRounds());
    setIdx(0); setPicked(null); setRevealed(false); setFeedback(null); setFeedbackMsg(""); setAciertos(0); setStars(0); setLog([]); setAlbumOpen(false);
    started.current = Date.now(); exerciseStart.current = Date.now();
  }

  function answerTap(i) {
    if (answered || advancing.current) return;
    if (typeof markFirstAttempt === "function") markFirstAttempt();
    setPicked(i);
    const isCorrect = i === q.correcta;
    const exSec = Math.max(0, Math.floor((Date.now() - exerciseStart.current) / 1000));
    const entry = { idx: idx + 1, emoji: "👤", a: q.nombre, slug: q.slug, area: q.area, userAnswer: `${q.opciones[i].e} ${q.opciones[i].t}`, correctAnswer: `${correcta.e} ${correcta.t}`, isCorrect, time: exSec };
    const newLog = [...log, entry];
    const newAciertos = aciertos + (isCorrect ? 1 : 0);
    const newStars = stars + (isCorrect ? 1 : 0);
    const isLast = idx + 1 >= rounds.length;
    setLog(newLog); setAciertos(newAciertos); setStars(newStars);
    advancing.current = true;
    if (isCorrect) {
      setRevealed(true); // abre las ventanas → aparece su foto
      setApp((s) => ({ ...s, stars: (s.stars || 0) + 1 }));
      const ar = L3_AREAS[q.area] || { t: q.area, e: "" };
      setTimeout(() => { setFeedback("ok"); setFeedbackMsg(`${q.nombre} · ${ar.e} ${ar.t}`); }, 900);
      setTimeout(() => advance(newLog, newAciertos, newStars, isLast), 1750);
    } else {
      setTimeout(() => { setFeedback("err"); setFeedbackMsg(L3_ANIMOS[idx % L3_ANIMOS.length]); }, 2000);
      setTimeout(() => advance(newLog, newAciertos, newStars, isLast), 2700);
    }
  }

  function advance(newLog, newAciertos, newStars, isLast) {
    setFeedback(null); setFeedbackMsg("");
    if (!isLast) {
      setIdx((i) => i + 1); setPicked(null); setRevealed(false); exerciseStart.current = Date.now(); advancing.current = false;
    } else {
      // Álbum final: las fotos que sí descubrió (acertó), luego el reporte.
      setAlbumOpen(true);
      setTimeout(() => {
        setApp((s) => ({
          ...s, stars: newStars,
          lastResult: { category: catLabel, solved: newAciertos, total: rounds.length, time: Math.floor((Date.now() - started.current) / 1000), starsEarned: newStars, log: newLog },
        }));
        if (typeof incrementGamesCompleted === "function") incrementGamesCompleted();
        go("results");
      }, 3600);
    }
  }

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* HUD */}
      <div style={{ position: "absolute", top: 10, left: 16, right: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <EdinunLogoMini size={64} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.35)", borderRadius: 999, padding: "6px 12px", border: "1px solid rgba(242,194,96,0.4)", fontFamily: "var(--ed-font-mono)", fontSize: 13, color: "#fce9a8" }}>⏱ {formatTime(elapsed)}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.35)", borderRadius: 999, padding: "6px 12px", border: "1px solid rgba(242,194,96,0.4)", fontFamily: "var(--ed-font-display)", fontWeight: 600, color: "#fce9a8" }}>⭐ {stars}</div>
        </div>
      </div>

      {/* RONDA con dots — top:52 (§1.1) */}
      <div style={{ position: "absolute", top: 52, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 8 }}>
        <span className="ed-label" style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>Ronda</span>
        {Array.from({ length: rounds.length }).map((_, i) => {
          const done = i < log.length;
          const ok = done && log[i] && log[i].isCorrect;
          return (
            <div key={i} style={{ width: 11, height: 11, borderRadius: "50%", background: done ? (ok ? "#fce9a8" : "#ff6b6b") : (i === idx ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)"), boxShadow: done ? "0 0 8px currentColor" : "none", color: ok ? "#fce9a8" : "#ff6b6b" }} />
          );
        })}
      </div>

      {/* Personaje guía + bocadillo (CÓMO, fijo) */}
      <div style={{ position: "absolute", left: 8, bottom: 78, width: 220, pointerEvents: "none", textAlign: "center" }}>
        <div className="ed-float-soft" style={{ position: "absolute", left: 0, right: 0, bottom: "100%", display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative", display: "inline-block", maxWidth: 210, background: "linear-gradient(180deg, rgba(20,12,55,0.95), rgba(10,6,35,0.95))", border: "1.5px solid rgba(242,194,96,0.65)", borderRadius: 16, padding: "10px 14px", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 14, lineHeight: 1.3, color: "#fce9a8", textAlign: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}>
            Toca su área.<br />¡Descubre su foto!
            <div style={{ position: "absolute", bottom: -10, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "9px solid transparent", borderRight: "9px solid transparent", borderTop: "10px solid rgba(20,12,55,0.95)", filter: "drop-shadow(0 1px 0 rgba(242,194,96,0.55))" }} />
          </div>
        </div>
        <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
          <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", width: 140, height: 16, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(242,194,96,0.45), transparent 70%)", filter: "blur(5px)" }} />
          <char.Component size={186} floating />
        </div>
        <div style={{ marginTop: -2, fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 14, color: "#fce9a8", letterSpacing: "0.04em", textShadow: "0 2px 6px rgba(0,0,0,0.6)" }}>{char.name}</div>
      </div>

      {/* Zona central: NOMBRE (título) + foto tapada por ventanas + opciones de área */}
      <div style={{ position: "absolute", top: 60, bottom: 18, left: 215, right: 215, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly" }}>
        <div style={{ textAlign: "center", pointerEvents: "none" }}>
          <div className="ed-label" style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, marginBottom: 3 }}>¿En qué se destacó?</div>
          <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 30, lineHeight: 1.1, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.6)", maxWidth: 460 }}>
            {q.nombre}
          </div>
        </div>

        {/* Foto del personaje tapada por 4 ventanas (se abren al acertar) */}
        <L3Foto key={q.slug} slug={q.slug} revealed={revealed} size={184} />

        {/* 3 tarjetas de área */}
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "nowrap" }}>
          {q.opciones.map((op, i) => {
            const correctOne = i === q.correcta;
            const baseColor = L3_OPT_COLORS[i % L3_OPT_COLORS.length];
            let borderColor = baseColor, bg = "linear-gradient(180deg, #fff8e6 0%, #f7e3a8 100%)", nameColor = "#3a2608";
            if (answered) {
              if (correctOne) { borderColor = "#2ecc8f"; bg = "linear-gradient(180deg, rgba(72,224,154,0.95), rgba(26,143,95,0.92))"; nameColor = "#06381f"; }
              else if (i === picked) { borderColor = "#ff6b6b"; bg = "linear-gradient(180deg, rgba(255,139,139,0.92), rgba(178,47,47,0.9))"; nameColor = "#fff"; }
              else { bg = "linear-gradient(180deg, rgba(255,248,230,0.5), rgba(247,227,168,0.5))"; }
            }
            return (
              <button key={i} onClick={() => answerTap(i)} disabled={answered}
                style={{ width: 122, height: 112, borderRadius: 18, border: `3px solid ${borderColor}`, background: bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, cursor: answered ? "default" : "pointer", boxShadow: answered && correctOne ? "0 0 22px rgba(46,204,143,0.6), inset 0 1px 0 rgba(255,255,255,0.4)" : "inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -3px 0 rgba(0,0,0,0.12), 0 6px 14px rgba(0,0,0,0.3)", transform: answered && correctOne ? "translateY(-4px)" : "none", transition: "all 0.15s ease" }}>
                <span style={{ fontSize: 50, lineHeight: 1, filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.3))" }}>{op.e}</span>
                <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 15, color: nameColor, textAlign: "center", lineHeight: 1.05 }}>{op.t}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Acciones */}
      <div style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 12, width: 150 }}>
        <button className="ed-btn ed-btn-restart" onClick={() => setConfirmingRestart(true)} style={{ fontSize: 15, padding: "0 10px", height: 56, fontWeight: 800, letterSpacing: "0.04em" }}>REINICIAR</button>
        <button className="ed-btn ed-btn-ghost" onClick={() => setConfirmingExit(true)} style={{ fontSize: 15, padding: "0 10px", height: 56, fontWeight: 800, letterSpacing: "0.04em" }}>SALIR</button>
      </div>

      {/* Overlay acierto/fallo */}
      {feedback && (
        <PortalToBody>
          <div style={{ position: "fixed", inset: 0, zIndex: 1000, pointerEvents: "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)", animation: "ed-pop-in 0.3s" }}>
            <div style={{ fontFamily: "'Fredoka','Baloo 2',system-ui,sans-serif", fontWeight: 700, fontSize: "clamp(56px, 11vmin, 120px)", color: feedback === "ok" ? "#2ecc8f" : "#ff6b6b", textShadow: "0 4px 0 rgba(0,0,0,0.45), 0 0 60px currentColor" }}>{feedback === "ok" ? "¡EXCELENTE!" : "¡UPS!"}</div>
            {feedbackMsg && (<div style={{ fontFamily: "'Fredoka','Baloo 2',system-ui,sans-serif", fontWeight: 700, fontSize: "clamp(18px, 2.6vmin, 30px)", color: feedback === "ok" ? "#fce9a8" : "#fff", background: "rgba(0,0,0,0.55)", padding: "8px 26px", borderRadius: 999, textShadow: "0 2px 6px rgba(0,0,0,0.6)", textAlign: "center" }}>{feedback === "err" ? `${feedbackMsg} — ${char.name}` : feedbackMsg}</div>)}
          </div>
        </PortalToBody>
      )}

      {/* Overlay final: álbum de personajes descubiertos */}
      {albumOpen && (
        <PortalToBody>
          <div style={{ position: "fixed", inset: 0, zIndex: 1001, pointerEvents: "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, background: "rgba(0,0,0,0.66)", backdropFilter: "blur(3px)", animation: "ed-pop-in 0.3s", padding: 16 }}>
            <div style={{ fontFamily: "'Fredoka','Baloo 2',system-ui,sans-serif", fontWeight: 700, fontSize: "clamp(26px, 4.5vmin, 46px)", color: "#fce9a8", textShadow: "0 4px 0 rgba(0,0,0,0.45), 0 0 60px rgba(242,194,96,0.6)", textAlign: "center" }}>
              {aciertos >= rounds.length ? "¡Los descubriste a todos! 🎉" : "Tu álbum de personajes"}
            </div>
            <div style={{ display: "flex", gap: 14, padding: "16px 18px", borderRadius: 18, background: "linear-gradient(135deg, #2b1c62, #140a37)", border: "3px solid #f2c260", boxShadow: "0 16px 40px rgba(0,0,0,0.5)", flexWrap: "wrap", justifyContent: "center", maxWidth: "92vw" }}>
              {log.map((e, i) => (
                <L3AlbumCard key={i} slug={e.slug} nombre={e.a} area={e.area} ok={e.isCorrect} />
              ))}
            </div>
            <div style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: "clamp(13px, 2vmin, 16px)", color: "#fff", background: "rgba(0,0,0,0.45)", padding: "6px 20px", borderRadius: 999 }}>
              Descubriste {aciertos} de {rounds.length}
            </div>
          </div>
        </PortalToBody>
      )}

      {/* Modal SALIR */}
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

      {/* Modal REINICIAR */}
      {confirmingRestart && (
        <PortalToBody>
          <div onClick={() => setConfirmingRestart(false)} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.62)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "ed-pop-in 0.18s", padding: 16 }}>
            <div onClick={(e) => e.stopPropagation()} className="ed-card" style={{ padding: 24, maxWidth: 440, textAlign: "center", boxShadow: "var(--ed-shadow-card), 0 0 40px rgba(155,123,232,0.3)" }}>
              <div className="ed-label" style={{ color: "#c4a8ff", marginBottom: 6 }}>Reiniciar juego</div>
              <h2 className="ed-h1" style={{ fontSize: 22, lineHeight: 1.15, marginBottom: 8 }}>¿Empezar de nuevo?</h2>
              <p className="ed-body" style={{ marginBottom: 16, fontSize: 14 }}>Vas a jugar con personajes nuevos.</p>
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

// ═════════════════════════════════════════════════════════════════════════
// LIBRO 3 · TEMA 2 · "La identidad territorial" (7 años) — 3 RONDAS DISTINTAS.
// R1 ¿de qué región es? (tocar 1 de 4 + destapar imagen de la región, como Tema 1)
// R2 ordena de mayor a menor (ARRASTRAR; rota entre los 3 regímenes del libro)
// R3 toca solo las provincias de la región (TOCAR VARIAS + ¡VERIFICAR!)
// Todo del libro. Anti-repetición por ronda → recargar varía. Ver design-doc.
// ═════════════════════════════════════════════════════════════════════════
const L3T2_REGIONES = {
  costa: { t: "Costa", e: "🏖️", slug: "costa" },
  sierra: { t: "Sierra", e: "⛰️", slug: "sierra" },
  amazonia: { t: "Amazonía", e: "🌳", slug: "amazonia" },
  insular: { t: "Insular", e: "🏝️", slug: "insular" },
};
const L3T2_REG_IDS = ["costa", "sierra", "amazonia", "insular"];

// R1 — ítem → región (platos textuales del libro + naturaleza que define cada región).
// `art` = artículo para el enunciado ("¿De qué región es el cuy?"); `pl` = plural ("son").
// Galápagos (nombre propio) → art "" ("¿De qué región es Galápagos?").
const L3T2_ITEMS = [
  { t: "Mariscos", art: "los", pl: true, reg: "costa" }, { t: "Playa", art: "la", reg: "costa" }, { t: "Pescado", art: "el", reg: "costa" }, { t: "Cangrejo", art: "el", reg: "costa" }, { t: "Banano", art: "el", reg: "costa" }, { t: "Coco", art: "el", reg: "costa" },
  { t: "Fritada", art: "la", reg: "sierra" }, { t: "Cuy", art: "el", reg: "sierra" }, { t: "Nevado", art: "el", reg: "sierra" }, { t: "Llama", art: "la", reg: "sierra" }, { t: "Volcán", art: "el", reg: "sierra" }, { t: "Papa", art: "la", reg: "sierra" },
  { t: "Maito", art: "el", reg: "amazonia" }, { t: "Selva", art: "la", reg: "amazonia" }, { t: "Tucán", art: "el", reg: "amazonia" }, { t: "Río", art: "el", reg: "amazonia" }, { t: "Mono", art: "el", reg: "amazonia" }, { t: "Caimán", art: "el", reg: "amazonia" },
  { t: "Tortuga", art: "la", reg: "insular" }, { t: "Iguana", art: "la", reg: "insular" }, { t: "Galápagos", art: "", reg: "insular" }, { t: "Pingüino", art: "el", reg: "insular" }, { t: "Lobo marino", art: "el", reg: "insular" },
];

// R2 — "Modelo para la administración del Estado" (diagrama del libro). Orden correcto:
// Provincia › Cantón › Parroquia (las cards YA vienen mayor→menor: índice 0,1,2 = correcto).
const L3T2_REGIMENES = [
  { id: "dependiente", label: "Régimen seccional dependiente", cards: [
    { t: "Gobernador", nivel: "Provincia" }, { t: "Jefe Político", nivel: "Cantón" }, { t: "Teniente Político", nivel: "Parroquia" },
  ] },
  { id: "autonomo", label: "Régimen seccional autónomo", cards: [
    { t: "Provincia", nivel: "" }, { t: "Cantón", nivel: "" }, { t: "Parroquia", nivel: "" },
  ] },
  { id: "gobiernos", label: "Gobiernos seccionales autónomos", cards: [
    { t: "Consejo Provincial", nivel: "Provincia" }, { t: "Consejo Municipal", nivel: "Cantón" }, { t: "Junta Parroquial", nivel: "Parroquia" },
  ] },
];

// Un color distinto por tarjeta de R2 (viaja CON la tarjeta al arrastrar → fácil de
// seguir). NO se usan verde ni rojo: quedan reservados para el ✓/✗ al verificar.
const L3T2_CARD_COLORS = [
  { bg: "linear-gradient(180deg, #fff1c9, #f6cf72)", border: "#e0a72c", ink: "#5a3d0a", handle: "#b9820f" },
  { bg: "linear-gradient(180deg, #d9e9ff, #a6c8ff)", border: "#4f8fef", ink: "#0f2a55", handle: "#2f66c8" },
  { bg: "linear-gradient(180deg, #ecdcff, #c7a9ff)", border: "#9b7be8", ink: "#2a1657", handle: "#6d45c8" },
];

// R3 — provincias por región (del libro: Sierra/Interandina 10 · Costa 7 · Amazonía 6 · Insular 1).
const L3T2_PROVINCIAS = {
  sierra: ["Pichincha", "Cotopaxi", "Tungurahua", "Chimborazo", "Imbabura", "Carchi", "Bolívar", "Cañar", "Azuay", "Loja"],
  costa: ["Guayas", "Manabí", "Esmeraldas", "Santa Elena", "Los Ríos", "El Oro", "Santo Domingo"],
  amazonia: ["Napo", "Orellana", "Pastaza", "Morona Santiago", "Zamora Chinchipe", "Sucumbíos"],
  insular: ["Galápagos"],
};

const L3T2_R1_KEY = "edinun_juego6_l3t2_r1_v1";
const L3T2_R2_KEY = "edinun_juego6_l3t2_r2_v1";
const L3T2_R3_KEY = "edinun_juego6_l3t2_r3_v1";
function l3t2Recent(key) { try { const r = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(r) ? r : []; } catch (e) { return []; } }
function l3t2Push(key, id, cap) { try { const prev = l3t2Recent(key).filter((x) => x !== id); localStorage.setItem(key, JSON.stringify([id].concat(prev).slice(0, cap))); } catch (e) {} }
function l3t2PickItem() {
  const recent = new Set(l3t2Recent(L3T2_R1_KEY)), all = L3T2_ITEMS.map((_, i) => i);
  const idx = l3Shuffle(all.filter((i) => !recent.has(i))).concat(l3Shuffle(all.filter((i) => recent.has(i))))[0];
  l3t2Push(L3T2_R1_KEY, idx, 8); return L3T2_ITEMS[idx];
}
function l3t2PickRegimen() {
  const recent = new Set(l3t2Recent(L3T2_R2_KEY)), ids = L3T2_REGIMENES.map((r) => r.id);
  const pickId = (l3Shuffle(ids.filter((i) => !recent.has(i))).concat(l3Shuffle(ids)))[0];
  l3t2Push(L3T2_R2_KEY, pickId, 2); return L3T2_REGIMENES.find((r) => r.id === pickId);
}
function l3t2BuildR3() {
  const targets = ["sierra", "costa", "amazonia"], recent = new Set(l3t2Recent(L3T2_R3_KEY));
  const target = (l3Shuffle(targets.filter((t) => !recent.has(t))).concat(l3Shuffle(targets)))[0];
  l3t2Push(L3T2_R3_KEY, target, 2);
  const correct = l3Shuffle(L3T2_PROVINCIAS[target]).slice(0, 4);
  const others = l3Shuffle(L3T2_REG_IDS.filter((r) => r !== target).flatMap((r) => L3T2_PROVINCIAS[r])).slice(0, 4);
  const shown = l3Shuffle(correct.map((n) => ({ name: n, ok: true })).concat(others.map((n) => ({ name: n, ok: false }))));
  return { target, shown };
}

// ── R1: ¿de qué región es? (tocar 1 de 4 + destapar imagen) ──
function R1Region({ onSolve }) {
  const [item] = useStateG(() => l3t2PickItem()); // una sola vez al montar (anti-repetición correcta)
  const [picked, setPicked] = useStateG(null);
  const answered = picked !== null;
  const correctReg = item.reg, R = L3T2_REGIONES[correctReg];
  const verbo = item.pl ? "son" : "es";
  const frase = item.art ? `${item.art} ${item.t.toLowerCase()}` : item.t;
  function tap(regId) {
    if (answered) return;
    setPicked(regId);
    const p = L3T2_REGIONES[regId];
    onSolve(regId === correctReg, { emoji: "📍", a: `¿De qué región ${verbo} ${frase}?`, userAnswer: `${p.e} ${p.t}`, correctAnswer: `${R.e} ${R.t}` });
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", width: "100%", gap: 24 }}>
      <div style={{ pointerEvents: "none", display: "flex", alignItems: "baseline", gap: 9, justifyContent: "center", flexWrap: "wrap", maxWidth: 480, textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 22, color: "rgba(255,255,255,0.9)" }}>¿De qué región {verbo}</span>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 28, color: "#fce9a8" }}>{frase}?</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22, width: "100%" }}>
      <L3Foto slug={R.slug} prefix="region" fallback={R.e} revealed={true} size={200} />
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "nowrap" }}>
        {L3T2_REG_IDS.map((rid) => {
          const rg = L3T2_REGIONES[rid], isCorrect = rid === correctReg;
          let border = "#f2c260", bg = "linear-gradient(180deg, #fff8e6, #f7e3a8)", col = "#3a2608";
          if (answered) {
            if (isCorrect) { border = "#2ecc8f"; bg = "linear-gradient(180deg, rgba(72,224,154,0.95), rgba(26,143,95,0.92))"; col = "#06381f"; }
            else if (rid === picked) { border = "#ff6b6b"; bg = "linear-gradient(180deg, rgba(255,139,139,0.92), rgba(178,47,47,0.9))"; col = "#fff"; }
            else bg = "linear-gradient(180deg, rgba(255,248,230,0.5), rgba(247,227,168,0.5))";
          }
          return (
            <button key={rid} onClick={() => tap(rid)} disabled={answered}
              style={{ position: "relative", width: 104, height: 94, borderRadius: 16, border: `3px solid ${border}`, background: bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, cursor: answered ? "default" : "pointer", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7), 0 6px 14px rgba(0,0,0,0.3)" }}>
              {answered && (isCorrect || rid === picked) && (
                <span style={{ position: "absolute", top: 5, right: 7, fontSize: 20, fontWeight: 900, lineHeight: 1, color: isCorrect ? "#06381f" : "#fff" }}>{isCorrect ? "✓" : "✗"}</span>
              )}
              <span style={{ fontSize: 38, lineHeight: 1 }}>{rg.e}</span>
              <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 13, color: col }}>{rg.t}</span>
            </button>
          );
        })}
      </div>
      </div>
    </div>
  );
}

// ── R2: ordena de mayor a menor (ARRASTRAR VERTICAL; rota entre los 3 regímenes) ──
// El ¡VERIFICAR! vive en la columna de acciones (TerritorioGame) → aquí se expone
// `verificar` vía verifyRef. Al verificar: ✓ verde en su sitio, ✗ rojo si está mal, y
// al fallar se reordena al correcto (revela).
function R2Orden({ onSolve, verifyRef }) {
  const [regimen] = useStateG(() => l3t2PickRegimen()); // una sola vez al montar (anti-repetición correcta)
  // Ancho de la tarjeta según la etiqueta más larga del régimen: el "autónomo" (palabras
  // cortas) queda angosto; los otros ("Consejo Provincial", "Teniente Político") reciben lo
  // justo para no cortar el texto. Así no quedan cuadros enormes con hueco a los lados.
  const cardW = Math.min(228, Math.max(150, Math.round(74 + Math.max(...regimen.cards.map((c) => c.t.length)) * 8.6)));
  const [order, setOrder] = useStateG(() => { let o = l3Shuffle([0, 1, 2]); if (o[0] === 0 && o[1] === 1 && o[2] === 2) o = [o[1], o[0], o[2]]; return o; });
  const [verified, setVerified] = useStateG(false);
  const [revealSol, setRevealSol] = useStateG(false); // al fallar, revela el orden correcto (dorado)
  const [dragPos, setDragPos] = useStateG(null);
  const [dxy, setDxy] = useStateG({ x: 0, y: 0 });
  const colRef = useRefG(null), startRef = useRefG({ x: 0, y: 0 }), slotCentersRef = useRefG([]);
  // Arrastre con reordenamiento EN VIVO: las cartas se acomodan mientras arrastras (sin
  // esperar a soltar → se siente inmediato). Los 3 huecos NO se mueven (solo cambia qué
  // carta ocupa cada uno), así que sus centros se miden una sola vez al empezar.
  function down(e, pos) {
    if (verified) return;
    startRef.current = { x: e.clientX, y: e.clientY };
    const col = colRef.current;
    slotCentersRef.current = col ? [...col.querySelectorAll("[data-slot]")].map((s) => { const r = s.getBoundingClientRect(); return r.top + r.height / 2; }) : [];
    setDragPos(pos); setDxy({ x: 0, y: 0 });
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (er) {}
  }
  function move(e) {
    if (dragPos === null) return;
    const cy = slotCentersRef.current;
    let target = 0;
    for (let i = 0; i < cy.length; i++) if (e.clientY > cy[i] - 6) target = i;
    if (cy.length && target !== dragPos) {
      setOrder((prev) => { const a = prev.slice(); const [m] = a.splice(dragPos, 1); a.splice(target, 0, m); return a; });
      startRef.current = { x: startRef.current.x, y: cy[target] };
      setDragPos(target);
      setDxy({ x: e.clientX - startRef.current.x, y: e.clientY - cy[target] });
      return;
    }
    setDxy({ x: e.clientX - startRef.current.x, y: e.clientY - startRef.current.y });
  }
  function up(e) { if (dragPos === null) return; setDragPos(null); setDxy({ x: 0, y: 0 }); }
  function verificar() {
    if (verified) return;
    const isCorrect = order[0] === 0 && order[1] === 1 && order[2] === 2;
    setVerified(true);
    // Al FALLAR: 1º deja ver SU arreglo con ✗ rojo (ve su error); ~1s después reordena al
    // orden correcto en DORADO con el rótulo "orden correcto" (NO verde, para que no parezca
    // que ganó). Así ve claramente cuál era la respuesta.
    if (!isCorrect) setTimeout(() => setRevealSol(true), 1000); // revela la correcta AL LADO de cada tarjeta mal ubicada (sin reordenar)
    onSolve(isCorrect, { emoji: "🗂️", a: `Ordena: ${regimen.label}`, userAnswer: order.map((i) => regimen.cards[i].t).join(" › "), correctAnswer: regimen.cards.map((c) => c.t).join(" › ") });
  }
  verifyRef.current = verificar;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", height: "100%", width: "100%" }}>
      <div style={{ textAlign: "center", pointerEvents: "none" }}>
        <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 21, color: "#fff", textShadow: "0 2px 6px rgba(0,0,0,0.55)" }}>Ordena de lo más grande a lo más pequeño</div>
        <div className="ed-label" style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, marginTop: 3 }}>{regimen.label}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div className="ed-label" style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>⬆ más grande</div>
        <div ref={colRef} style={{ display: "flex", flexDirection: "column", gap: 18, touchAction: "none", transform: revealSol ? "translateX(-75px)" : "none", transition: "transform 0.3s ease" }}>
          {order.map((cardIdx, pos) => {
            const c = regimen.cards[cardIdx], dragging = dragPos === pos, okPos = verified && order[pos] === pos;
            const pal = L3T2_CARD_COLORS[cardIdx % 3];
            let border = pal.border, bg = pal.bg;
            if (verified) { border = okPos ? "#2ecc8f" : "#ff6b6b"; bg = okPos ? "linear-gradient(180deg, rgba(72,224,154,0.95), rgba(26,143,95,0.92))" : "linear-gradient(180deg, rgba(255,139,139,0.92), rgba(178,47,47,0.9))"; }
            const inkMain = verified ? (okPos ? "#06381f" : "#fff") : pal.ink;
            return (
              <div key={cardIdx} data-slot onPointerDown={(e) => down(e, pos)} onPointerMove={move} onPointerUp={up}
                style={{ position: "relative", width: 224, height: 64, borderRadius: 14, border: `3px solid ${border}`, background: bg, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: verified ? "default" : "grab", touchAction: "none", userSelect: "none", boxShadow: dragging ? "0 16px 30px rgba(0,0,0,0.5)" : "inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -3px 0 rgba(0,0,0,0.12), 0 6px 14px rgba(0,0,0,0.3)", transform: dragging ? `translate(${dxy.x}px, ${dxy.y}px) scale(1.04)` : "none", transition: dragging ? "none" : "transform 0.15s ease", zIndex: dragging ? 50 : 1 }}>
                <span style={{ fontSize: verified ? 22 : 17, fontWeight: 900, color: verified ? inkMain : pal.handle, width: 22, textAlign: "center", flexShrink: 0 }}>{verified ? (okPos ? "✓" : "✗") : "⠿"}</span>
                <div style={{ textAlign: "center", lineHeight: 1.05 }}>
                  <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 15, color: inkMain }}>{c.t}</div>
                  {c.nivel && <div style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 11, color: verified ? (okPos ? "rgba(6,56,31,0.75)" : "rgba(255,255,255,0.85)") : pal.handle }}>{c.nivel}</div>}
                </div>
                {revealSol && order[pos] !== pos && (
                  <div style={{ position: "absolute", left: "calc(100% + 12px)", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: 7, whiteSpace: "nowrap", background: "linear-gradient(180deg, #ffe6a1, #f1c153)", border: "2px solid #e0a72c", borderRadius: 12, padding: "4px 12px", boxShadow: "0 5px 12px rgba(0,0,0,0.4)" }}>
                    <span style={{ fontSize: 15, fontWeight: 900, color: "#1f8a54" }}>✓</span>
                    <div style={{ textAlign: "left", lineHeight: 1.05 }}>
                      <div style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 800, fontSize: 8, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(90,61,10,0.7)" }}>aquí va</div>
                      <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 13, color: "#5a3d0a" }}>{regimen.cards[pos].t}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="ed-label" style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>⬇ más pequeña</div>
      </div>
    </div>
  );
}

// ── R3: toca solo las provincias de la región (TOCAR VARIAS; ¡VERIFICAR! en acciones) ──
// Cuadro con marca: ○ sin elegir · ● elegido · ✓ correcto (aunque no la tocara → revela)
// · ✗ mal elegida.
function R3Provincias({ onSolve, verifyRef }) {
  const [built] = useStateG(() => l3t2BuildR3()); // una sola vez al montar (anti-repetición correcta)
  const R = L3T2_REGIONES[built.target];
  const [selected, setSelected] = useStateG(() => ({}));
  const [verified, setVerified] = useStateG(false);
  function toggle(name) { if (verified) return; setSelected((p) => ({ ...p, [name]: !p[name] })); }
  function verificar() {
    if (verified) return;
    setVerified(true);
    const correct = built.shown.filter((p) => p.ok).map((p) => p.name);
    const sel = built.shown.filter((p) => selected[p.name]).map((p) => p.name);
    const isCorrect = sel.length === correct.length && sel.every((n) => correct.includes(n));
    onSolve(isCorrect, { emoji: R.e, a: `Provincias de la ${R.t}`, userAnswer: sel.join(", ") || "—", correctAnswer: correct.join(", ") });
  }
  verifyRef.current = verificar;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", height: "100%", width: "100%", paddingTop: 14, gap: 10 }}>
      <div style={{ textAlign: "center", pointerEvents: "none" }}>
        <div className="ed-label" style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, marginBottom: 3 }}>Toca las provincias que sí son de la</div>
        <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 24, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>{R.e} Región {R.t}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", alignContent: "space-evenly", columnGap: 16, width: "100%", maxWidth: 380, flex: 1 }}>
        {built.shown.map((p) => {
          const sel = !!selected[p.name];
          // 4 estados CLAROS al verificar: la tocó y acertó (verde ✓) · la tocó y no era
          // (rojo ✗) · NO la tocó pero sí era (ámbar rayado + "faltó") · no era y no la
          // tocó (apagada ○). Así el VERDE solo sale en lo que ELLA tocó bien.
          let border = sel ? "#4fa0ff" : "rgba(242,194,96,0.7)", borderStyle = "solid", bg = sel ? "linear-gradient(180deg, #dcecff, #a9d0ff)" : "linear-gradient(180deg, #fff8e6, #f7e3a8)", col = "#3a2608", mark = sel ? "●" : "○", markCol = sel ? "#2773d8" : "rgba(58,38,8,0.35)", missed = false;
          if (verified) {
            if (p.ok && sel) { border = "#2ecc8f"; bg = "linear-gradient(180deg, rgba(72,224,154,0.95), rgba(26,143,95,0.92))"; col = "#06381f"; mark = "✓"; markCol = "#06381f"; }
            else if (p.ok) { border = "#c98a1e"; borderStyle = "dashed"; bg = "linear-gradient(180deg, #fff2d0, #f4d693)"; col = "#5a3d0a"; mark = "★"; markCol = "#b9780f"; missed = true; }
            else if (sel) { border = "#ff6b6b"; bg = "linear-gradient(180deg, rgba(255,139,139,0.92), rgba(178,47,47,0.9))"; col = "#fff"; mark = "✗"; markCol = "#fff"; }
            else { bg = "linear-gradient(180deg, rgba(255,248,230,0.3), rgba(247,227,168,0.3))"; mark = "○"; markCol = "rgba(58,38,8,0.25)"; }
          }
          return (
            <button key={p.name} onClick={() => toggle(p.name)} disabled={verified}
              style={{ position: "relative", height: 60, borderRadius: 14, border: `3px ${borderStyle} ${border}`, background: bg, cursor: verified ? "default" : "pointer", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6), 0 5px 12px rgba(0,0,0,0.28)", padding: "0 8px", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
              {missed && <span style={{ position: "absolute", top: -9, right: -7, background: "#c98a1e", color: "#fff", fontFamily: "var(--ed-font-ui)", fontWeight: 800, fontSize: 10, padding: "2px 8px", borderRadius: 999, letterSpacing: "0.05em", boxShadow: "0 2px 6px rgba(0,0,0,0.4)" }}>faltó</span>}
              <span style={{ fontSize: verified ? 19 : 15, fontWeight: 900, color: markCol, flexShrink: 0, width: 20, textAlign: "center" }}>{mark}</span>
              <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 13, color: col, textAlign: "center", lineHeight: 1.05 }}>{p.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TerritorioGame({ app, setApp, go }) {
  const char = CHARACTERS.find((c) => c.id === app.character) || CHARACTERS[0];
  const catLabel = app.currentCatLabel || "La identidad territorial";
  const TOTAL = 3;
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
    // Deja ver la respuesta ANTES del overlay: al acertar en R1 ~0.8s (para ver la
    // imagen); al FALLAR ~1.8s (para ver ✓/✗ y la respuesta correcta), como en los demás
    // juegos EDINUN. Luego el overlay ~1s y avanza.
    const showFbAt = isCorrect ? (round === 0 ? 800 : 0) : (round === 1 ? 2300 : 1800);
    const advanceAt = showFbAt + (isCorrect ? 1250 : 1000);
    setTimeout(() => { setFeedback(isCorrect ? "ok" : "err"); setFeedbackMsg(isCorrect ? "+1 ⭐" : L3_ANIMOS[round % L3_ANIMOS.length]); }, showFbAt);
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

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* HUD */}
      <div style={{ position: "absolute", top: 10, left: 16, right: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <EdinunLogoMini size={64} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.35)", borderRadius: 999, padding: "6px 12px", border: "1px solid rgba(242,194,96,0.4)", fontFamily: "var(--ed-font-mono)", fontSize: 13, color: "#fce9a8" }}>⏱ {formatTime(elapsed)}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.35)", borderRadius: 999, padding: "6px 12px", border: "1px solid rgba(242,194,96,0.4)", fontFamily: "var(--ed-font-display)", fontWeight: 600, color: "#fce9a8" }}>⭐ {stars}</div>
        </div>
      </div>

      {/* RONDA con dots — top:52 (§1.1) */}
      <div style={{ position: "absolute", top: 52, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 8 }}>
        <span className="ed-label" style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>Ronda</span>
        {Array.from({ length: TOTAL }).map((_, i) => {
          const done = i < log.length, ok = done && log[i] && log[i].isCorrect;
          return <div key={i} style={{ width: 11, height: 11, borderRadius: "50%", background: done ? (ok ? "#fce9a8" : "#ff6b6b") : (i === round ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)"), boxShadow: done ? "0 0 8px currentColor" : "none", color: ok ? "#fce9a8" : "#ff6b6b" }} />;
        })}
      </div>

      {/* Personaje guía + bocadillo (CÓMO por ronda) */}
      <div style={{ position: "absolute", left: 8, bottom: 78, width: 220, pointerEvents: "none", textAlign: "center" }}>
        <div className="ed-float-soft" style={{ position: "absolute", left: 0, right: 0, bottom: "100%", display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative", display: "inline-block", maxWidth: 210, background: "linear-gradient(180deg, rgba(20,12,55,0.95), rgba(10,6,35,0.95))", border: "1.5px solid rgba(242,194,96,0.65)", borderRadius: 16, padding: "10px 14px", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 14, lineHeight: 1.3, color: "#fce9a8", textAlign: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}>
            {round === 0 ? "Toca su región." : round === 1 ? (<>Ordena de mayor<br />a menor.</>) : (<>Toca las<br />correctas.</>)}
            <div style={{ position: "absolute", bottom: -10, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "9px solid transparent", borderRight: "9px solid transparent", borderTop: "10px solid rgba(20,12,55,0.95)", filter: "drop-shadow(0 1px 0 rgba(242,194,96,0.55))" }} />
          </div>
        </div>
        <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
          <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", width: 140, height: 16, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(242,194,96,0.45), transparent 70%)", filter: "blur(5px)" }} />
          <char.Component size={186} floating />
        </div>
        <div style={{ marginTop: -2, fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 14, color: "#fce9a8", letterSpacing: "0.04em", textShadow: "0 2px 6px rgba(0,0,0,0.6)" }}>{char.name}</div>
      </div>

      {/* Zona central: la ronda actual */}
      <div style={{ position: "absolute", top: 60, bottom: 18, left: 215, right: 215 }}>
        {round === 0 && <R1Region key={`r1-${rk}`} onSolve={onSolve} />}
        {round === 1 && <R2Orden key={`r2-${rk}`} onSolve={onSolve} verifyRef={verifyRef} />}
        {round === 2 && <R3Provincias key={`r3-${rk}`} onSolve={onSolve} verifyRef={verifyRef} />}
      </div>

      {/* Acciones (¡VERIFICAR! verde arriba, solo en R2/R3) */}
      <div style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 12, width: 150 }}>
        {(round === 1 || round === 2) && !busy && (
          <button className="ed-btn" onClick={() => verifyRef.current && verifyRef.current()} style={{ fontSize: 15, padding: "0 10px", height: 56, fontWeight: 800, letterSpacing: "0.04em", background: "linear-gradient(180deg, #4fe08a, #1f9d57)", color: "#06381f", border: "none" }}>¡VERIFICAR!</button>
        )}
        <button className="ed-btn ed-btn-restart" onClick={() => setConfirmingRestart(true)} style={{ fontSize: 15, padding: "0 10px", height: 56, fontWeight: 800, letterSpacing: "0.04em" }}>REINICIAR</button>
        <button className="ed-btn ed-btn-ghost" onClick={() => setConfirmingExit(true)} style={{ fontSize: 15, padding: "0 10px", height: 56, fontWeight: 800, letterSpacing: "0.04em" }}>SALIR</button>
      </div>

      {/* Overlay acierto/fallo */}
      {feedback && (
        <PortalToBody>
          <div style={{ position: "fixed", inset: 0, zIndex: 1000, pointerEvents: "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)", animation: "ed-pop-in 0.3s" }}>
            <div style={{ fontFamily: "'Fredoka','Baloo 2',system-ui,sans-serif", fontWeight: 700, fontSize: "clamp(56px, 11vmin, 120px)", color: feedback === "ok" ? "#2ecc8f" : "#ff6b6b", textShadow: "0 4px 0 rgba(0,0,0,0.45), 0 0 60px currentColor" }}>{feedback === "ok" ? "¡EXCELENTE!" : "¡UPS!"}</div>
            {feedbackMsg && (<div style={{ fontFamily: "'Fredoka','Baloo 2',system-ui,sans-serif", fontWeight: 700, fontSize: "clamp(18px, 2.6vmin, 30px)", color: feedback === "ok" ? "#fce9a8" : "#fff", background: "rgba(0,0,0,0.55)", padding: "8px 26px", borderRadius: 999, textShadow: "0 2px 6px rgba(0,0,0,0.6)", textAlign: "center" }}>{feedback === "err" ? `${feedbackMsg} — ${char.name}` : feedbackMsg}</div>)}
          </div>
        </PortalToBody>
      )}

      {/* Modal SALIR */}
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

      {/* Modal REINICIAR */}
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

// ═════════════════════════════════════════════════════════════════════════
// LIBRO 3 · TEMA 3 — "Viajando por mi país" (7 años) · ViajeGame
//
// 3 rondas encadenadas, cada una con una mecánica DISTINTA — y cada una con un
// VERBO que el Tema 2 NO usa (petición expresa de la autora: "que no se parezca
// al Tema 2"):
//   R1 VOLTEAR   → memoria: 4 parejas lugar ↔ región (patrón de juego-1)
//   R2 GIRAR     → ruleta que sortea la región + arrastrar/tocar al álbum
//   R3 COMPLETAR → armar el nombre del lugar con sílabas sobre una postal
// Todo el contenido es TEXTUAL del tema del libro (ciudades, ríos, productos,
// nevados y fauna de cada región). Diseño: .planning/libro-3-tema-3-design.md
// ═════════════════════════════════════════════════════════════════════════

// Colores de región TAL COMO LOS PIDE EL LIBRO en la actividad del mapa
// ("Costa amarillo · Sierra café · Amazonía verde · Insular azul"). Son colores de
// CONTENIDO, no los gradientes por posición de los botones de tema (§0 del estándar).
const L3T3_REG_COLOR = {
  costa: { grad: "linear-gradient(180deg, #ffe9a0, #e8b93a)", border: "#c99a1e", ink: "#3a2608" },
  sierra: { grad: "linear-gradient(180deg, #d9ab78, #8f5c2c)", border: "#6b4320", ink: "#2c1806" },
  amazonia: { grad: "linear-gradient(180deg, #93dd93, #2f8f45)", border: "#1e6a30", ink: "#05300f" },
  insular: { grad: "linear-gradient(180deg, #9fd0ff, #2e7ad8)", border: "#1f5cb0", ink: "#08264d" },
};
// Color plano para los sectores de la ruleta (SVG no admite gradiente CSS inline).
const L3T3_REG_FILL = { costa: "#e8b93a", sierra: "#8f5c2c", amazonia: "#2f8f45", insular: "#2e7ad8" };
// Cómo se nombra cada región DENTRO de una frase ("¿Qué encontramos en …?"). Sin esto
// salía "la región Amazonía", que está mal dicho.
const L3T3_REG_EN = { costa: "la Costa", sierra: "la Sierra", amazonia: "la Amazonía", insular: "la región Insular" };

// Emojis que NO APORTAN. Dos casos: (a) los comparten varios ítems — todas las ciudades
// son 🏙️, los ríos 🌊, los nevados 🏔️ — y entonces no distinguen nada (Quito y Riobamba
// salían idénticos); (b) no se entienden — 🌫️ para "Páramo" parecía niebla suelta (lo
// cazó la autora). En esas fichas se oculta el emoji y manda el NOMBRE, más grande. Donde
// el emoji sí es único y reconocible (🐆 jaguar, 🐢 tortuga, 🦅 cóndor, 🍌 banano…) se
// mantiene. Cuando exista la foto del lugar (`lugar-<slug>`), la foto gana sobre todo esto.
const L3T3_EMOJI_GENERICO = ["🏙️", "🌊", "🏔️", "🏖️", "🌫️"];
function l3t3Generico(e) { return L3T3_EMOJI_GENERICO.indexOf(e) !== -1; }

// Lugares/elementos → su región. TODO sale del texto del tema (grandes ciudades,
// ríos, productos agrícolas, nevados y fauna que el libro nombra en cada región).
// Se usa en R1 (parejas) y en R2 (lo que va al álbum del viaje).
// `slug` (opcional) = foto propia del lugar en `assets/lugar-<slug>.jpg|jpeg|png|webp`.
// Si el archivo no existe, la ficha cae al emoji sola → el juego funciona igual sin fotos.
const L3T3_LUGARES = [
  { t: "Guayaquil", e: "🏙️", reg: "costa", slug: "guayaquil" }, { t: "Manta", e: "🏙️", reg: "costa" }, { t: "Machala", e: "🏙️", reg: "costa" },
  { t: "Salinas", e: "🏖️", reg: "costa" }, { t: "Babahoyo", e: "🏙️", reg: "costa" }, { t: "Río Guayas", e: "🌊", reg: "costa", slug: "rio-guayas" },
  { t: "Río Jubones", e: "🌊", reg: "costa" }, { t: "Banano", e: "🍌", reg: "costa", slug: "banano" }, { t: "Arroz", e: "🌾", reg: "costa" },
  { t: "Manglares", e: "🌿", reg: "costa" }, { t: "Ballenas", e: "🐋", reg: "costa" }, { t: "Delfines", e: "🐬", reg: "costa", slug: "delfines" },
  { t: "Quito", e: "🏙️", reg: "sierra", slug: "quito" }, { t: "Cuenca", e: "🏙️", reg: "sierra" }, { t: "Ambato", e: "🏙️", reg: "sierra" },
  { t: "Riobamba", e: "🏙️", reg: "sierra" }, { t: "Ibarra", e: "🏙️", reg: "sierra" }, { t: "Cotopaxi", e: "🏔️", reg: "sierra", slug: "cotopaxi" },
  { t: "Chimborazo", e: "🏔️", reg: "sierra", slug: "chimborazo" }, { t: "Cayambe", e: "🏔️", reg: "sierra" }, { t: "Cóndor andino", e: "🦅", reg: "sierra", slug: "condor" },
  { t: "Páramo", e: "🌫️", reg: "sierra" },
  { t: "Puyo", e: "🏙️", reg: "amazonia", slug: "puyo" }, { t: "Nueva Loja", e: "🏙️", reg: "amazonia", slug: "nueva-loja" }, { t: "El Coca", e: "🏙️", reg: "amazonia" },
  { t: "Jaguar", e: "🐆", reg: "amazonia", slug: "jaguar" }, { t: "Selva virgen", e: "🌳", reg: "amazonia", slug: "selva" },
  { t: "Galápagos", e: "🏝️", reg: "insular", slug: "galapagos" }, { t: "Tortuga gigante", e: "🐢", reg: "insular", slug: "tortuga" }, { t: "Pingüino", e: "🐧", reg: "insular", slug: "pinguino" },
  { t: "Lobos marinos", e: "🦭", reg: "insular", slug: "lobos" }, { t: "Iguana", e: "🦎", reg: "insular" },
];

// R3 — límites del Ecuador (del "Aplico" del libro: "Ubica los límites de tu país…
// Al Norte / Al Sur / Al Este / Al Oeste"). Los vecinos van dibujados alrededor del mapa
// como CONTEXTO y lo que el niño coloca son los 4 PUNTOS CARDINALES: así cada ficha es
// única. (Al revés no funciona: Perú es límite al Sur Y al Este → habría 2 fichas iguales.)
const L3T3_CARDINALES = [
  { id: "norte", t: "NORTE", vecino: "Colombia" },
  { id: "sur", t: "SUR", vecino: "Perú" },
  { id: "este", t: "ESTE", vecino: "Perú" },
  { id: "oeste", t: "OESTE", vecino: "Océano Pacífico" },
];

const L3T3_R1_KEY = "edinun_juego6_l3t3_r1_v1";
const L3T3_R2_KEY = "edinun_juego6_l3t3_r2_v1";

// Anti-repetición: reusa el FIFO genérico del Tema 2 (l3t2Recent/l3t2Push por clave).
// R1 — un lugar por región, evitando los que salieron en las últimas partidas.
function l3t3BuildR1() {
  const recent = l3t2Recent(L3T3_R1_KEY);
  const picks = L3T2_REG_IDS.map((rid) => {
    const pool = L3T3_LUGARES.filter((x) => x.reg === rid);
    const fresh = pool.filter((x) => recent.indexOf(x.t) === -1);
    const arr = fresh.length ? fresh : pool;
    return arr[Math.floor(Math.random() * arr.length)];
  });
  picks.forEach((p) => l3t2Push(L3T3_R1_KEY, p.t, 12));
  // Baraja de 8: por cada región, la carta del LUGAR y la carta de la REGIÓN.
  const deck = [];
  picks.forEach((p) => {
    deck.push({ key: `lug-${p.reg}`, pid: p.reg, kind: "lugar", e: p.e, t: p.t, slug: p.slug });
    deck.push({ key: `reg-${p.reg}`, pid: p.reg, kind: "region", e: L3T2_REGIONES[p.reg].e, t: L3T2_REGIONES[p.reg].t });
  });
  return l3Shuffle(deck);
}

// R2 — sortea la región (rotando) y arma 2 correctas + 2 intrusas.
function l3t3BuildR2() {
  const recent = l3t2Recent(L3T3_R2_KEY);
  const fresh = L3T2_REG_IDS.filter((r) => recent.indexOf(r) === -1);
  const pool = fresh.length ? fresh : L3T2_REG_IDS;
  const target = pool[Math.floor(Math.random() * pool.length)];
  l3t2Push(L3T3_R2_KEY, target, 3);
  const buenas = l3Shuffle(L3T3_LUGARES.filter((x) => x.reg === target)).slice(0, 2);
  const malas = l3Shuffle(L3T3_LUGARES.filter((x) => x.reg !== target)).slice(0, 2);
  return { target, cards: l3Shuffle(buenas.concat(malas)) };
}

// Foto con respaldo EN CADENA: prueba cada candidato (`<prefijo>-<slug>`) con todas las
// extensiones y, si ninguna carga, muestra el emoji. Así el juego se ve completo aunque
// falten fotos: la postal intenta la del LUGAR, luego la de la REGIÓN, luego el emoji.
function L3T3Foto({ cands, fallback, w, h, radius = 10 }) {
  const [i, setI] = useStateG(0);
  const total = cands.length * L3_IMG_EXTS.length;
  const failed = i >= total;
  const c = cands[Math.floor(i / L3_IMG_EXTS.length)];
  // Sin foto y sin respaldo → no se dibuja NADA (la ficha se queda solo con su nombre,
  // que es lo que se quiere cuando el emoji no distingue: ver `l3t3Generico`).
  if (failed && !fallback) return null;
  return (
    <div style={{ width: w, height: h, borderRadius: radius, overflow: "hidden", background: "linear-gradient(180deg, #fff, #efe9dc)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {!failed && c ? (
        <img src={`assets/${c.p}-${c.s}.${L3_IMG_EXTS[i % L3_IMG_EXTS.length]}`} alt="" draggable="false" onError={() => setI((k) => k + 1)}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      ) : (<span style={{ fontSize: Math.round(Math.min(w, h) * 0.62), lineHeight: 1 }}>{fallback}</span>)}
    </div>
  );
}
// Foto de región PROPIA de este tema: `assets/t3-region-<slug>.<ext>`.
// ⚠ NO reusar `region-<slug>` (las del Tema 2): decisión de la autora — cada tema lleva
// su propio arte, si no el niño ve la misma foto en dos temas seguidos. Sin el archivo,
// la carta muestra el emoji de la región (y se ve bien igual).
function L3T3RegionFoto({ reg, w, h, radius = 10 }) {
  const R = L3T2_REGIONES[reg];
  return <L3T3Foto cands={[{ p: "t3-region", s: R.slug }]} fallback={R.e} w={w} h={h} radius={radius} />;
}

// ── R1: memoria — 4 parejas "lugar ↔ su región" (VOLTEAR) ──
// Calcado del patrón de juego-1 (deck/flipped/matched + lock). Al formar la pareja,
// la carta de REGIÓN se destapa con la FOTO real de la región (premio visual).
function R1Memoria({ onSolve, onStar }) {
  const [deck] = useStateG(() => l3t3BuildR1());
  const [flipped, setFlipped] = useStateG([]);
  const [matched, setMatched] = useStateG({});
  const lock = useRefG(false);
  const matchedRef = useRefG({});
  const logRef = useRefG([]);

  function tapCard(i) {
    if (lock.current) return;
    const card = deck[i];
    if (matchedRef.current[card.key] || flipped.indexOf(i) !== -1) return;
    const nf = flipped.concat([i]);
    setFlipped(nf);
    if (nf.length < 2) return;
    lock.current = true;
    const ca = deck[nf[0]], cb = deck[nf[1]];
    if (ca.pid === cb.pid) {
      setTimeout(() => {
        matchedRef.current[ca.key] = true; matchedRef.current[cb.key] = true;
        setMatched(Object.assign({}, matchedRef.current));
        setFlipped([]); lock.current = false;
        const lug = ca.kind === "lugar" ? ca : cb, R = L3T2_REGIONES[ca.pid];
        logRef.current.push({ emoji: lug.e, a: "Pareja encontrada", userAnswer: `${lug.t} · ${R.t}`, correctAnswer: `${lug.t} · ${R.t}`, isCorrect: true });
        onStar();   // ⭐ al instante, en cada pareja (si no, el contador no se mueve)
        if (Object.keys(matchedRef.current).length >= 8) {
          // La memoria siempre se completa: la ronda cuenta como acierto. Las ⭐ ya se
          // sumaron pareja a pareja (por eso va 0 aquí), pero el cartel muestra el total.
          setTimeout(() => onSolve(true, logRef.current.slice(), 0, logRef.current.length), 300);
        }
      }, 460);
    } else {
      setTimeout(() => { setFlipped([]); lock.current = false; }, 950);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", height: "100%", width: "100%" }}>
      <div style={{ textAlign: "center", pointerEvents: "none", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 19, color: "#fff", textShadow: "0 2px 6px rgba(0,0,0,0.55)" }}>
        Encuentra las 4 parejas: el lugar y su región.
      </div>
      {/* Cartas y fotos CUADRADAS (1:1): la autora genera las imágenes en cuadrado, así
          no se recorta nada. Ver `.planning/libro-3-tema-3-design.md` §Fotos. */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 112px)", gap: 12, justifyContent: "center" }}>
        {deck.map((card, i) => {
          const isMatched = !!matched[card.key], isUp = isMatched || flipped.indexOf(i) !== -1;
          const pal = L3T3_REG_COLOR[card.pid];
          return (
            <button key={card.key} onClick={() => tapCard(i)}
              style={{ width: 112, height: 134, borderRadius: 16, cursor: isUp ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 5, overflow: "hidden",
                border: `3px solid ${isMatched ? "#2ecc8f" : (isUp ? "rgba(242,194,96,0.7)" : "rgba(242,194,96,0.5)")}`,
                background: isUp ? (card.kind === "region" ? pal.grad : "linear-gradient(180deg,#fff8e6,#f7e3a8)") : "linear-gradient(160deg,#7b52e0,#3a1f8c)",
                boxShadow: isMatched ? "0 0 20px rgba(46,204,143,0.5), inset 0 1px 0 rgba(255,255,255,0.7)" : "inset 0 1px 0 rgba(255,255,255,0.35), 0 6px 14px rgba(0,0,0,0.35)",
                transition: "all 0.15s ease" }}>
              {isUp ? (
                card.kind === "region" ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    {isMatched
                      ? <L3T3RegionFoto reg={card.pid} w={94} h={94} />
                      : <span style={{ fontSize: 44, lineHeight: 1 }}>{card.e}</span>}
                    <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 13, color: pal.ink, lineHeight: 1.05, textAlign: "center" }}>{card.t}</span>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "0 3px" }}>
                    <L3T3Foto cands={card.slug ? [{ p: "lugar", s: card.slug }] : []} fallback={l3t3Generico(card.e) ? null : card.e} w={94} h={94} />
                    <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: l3t3Generico(card.e) ? 17 : 12, color: "#3a2608", lineHeight: 1.1, textAlign: "center" }}>{card.t}</span>
                  </div>
                )
              ) : (
                <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 48, lineHeight: 1, background: "linear-gradient(180deg, #fef3cf, #f2c260)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.45))" }}>?</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── R2: la ruleta del viaje (GIRAR + llevar al ÁLBUM) ──
// GIRAR sortea la región; luego el niño lleva al álbum las 2 tarjetas que sí son de
// ahí — ARRASTRÁNDOLAS o simplemente TOCÁNDOLAS (a los 7 años el arrastre falla mucho,
// así que el tap hace lo mismo). ¡VERIFICAR! vive en la columna de acciones.
function l3t3Sector(cx, cy, r, a1, a2) {
  const pt = (a) => { const rad = ((a - 90) * Math.PI) / 180; return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]; };
  const [x1, y1] = pt(a1), [x2, y2] = pt(a2);
  return `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
}

function R2Ruleta({ onSolve, verifyRef }) {
  const [built] = useStateG(() => l3t3BuildR2());
  const [angle, setAngle] = useStateG(0);
  const [spun, setSpun] = useStateG(false);
  const [spinning, setSpinning] = useStateG(false);
  const [inBag, setInBag] = useStateG({});
  const [verified, setVerified] = useStateG(false);
  const [drag, setDrag] = useStateG(null); // { t, dx, dy } — arrastrando HACIA el álbum
  const [dragOut, setDragOut] = useStateG(null); // { t, dx, dy } — sacando del álbum
  const startRef = useRefG({ x: 0, y: 0, moved: false });
  const outRef = useRefG({ x: 0, y: 0, moved: false, id: null });
  const bagRef = useRefG(null);
  const R = L3T2_REGIONES[built.target];
  const targetIdx = L3T2_REG_IDS.indexOf(built.target);

  function girar() {
    if (spinning || spun) return;
    setSpinning(true);
    // 4 vueltas completas y frena con el sector sorteado bajo el puntero de arriba.
    setAngle(360 * 4 - (targetIdx * 90 + 45));
    setTimeout(() => { setSpinning(false); setSpun(true); }, 1700);
  }

  function toggle(t) { if (verified || !spun) return; setInBag((p) => Object.assign({}, p, { [t]: !p[t] })); }
  function down(e, t) {
    if (verified || !spun || inBag[t]) return;
    startRef.current = { x: e.clientX, y: e.clientY, moved: false };
    setDrag({ t, dx: 0, dy: 0 });
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (er) {}
  }
  function move(e) {
    if (!drag) return;
    const dx = e.clientX - startRef.current.x, dy = e.clientY - startRef.current.y;
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) startRef.current.moved = true;
    setDrag((d) => (d ? { t: d.t, dx, dy } : d));
  }
  function up(e) {
    if (!drag) return;
    const t = drag.t, moved = startRef.current.moved;
    const bag = bagRef.current;
    let dentro = false;
    if (bag) { const r = bag.getBoundingClientRect(); dentro = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; }
    setDrag(null);
    if (dentro || !moved) toggle(t);      // soltada en el álbum, o simple toque
  }

  // ── Sacar del álbum ARRASTRANDO hacia afuera (además del toque) ──
  // Petición de la autora: si se arrepiente, tirar la ficha fuera del álbum la devuelve.
  // Igual que al meterla, solo cuenta si de verdad ARRASTRÓ; un toque simple también saca.
  function downOut(e, t) {
    if (verified) return;
    outRef.current = { x: e.clientX, y: e.clientY, moved: false };
    setDragOut({ t, dx: 0, dy: 0 });
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (er) {}
  }
  function moveOut(e) {
    if (!dragOut) return;
    const dx = e.clientX - outRef.current.x, dy = e.clientY - outRef.current.y;
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) outRef.current.moved = true;
    setDragOut((d) => (d ? { t: d.t, dx, dy } : d));
  }
  function upOut(e) {
    if (!dragOut) return;
    const t = dragOut.t, moved = outRef.current.moved;
    const bag = bagRef.current;
    let dentro = false;
    if (bag) { const r = bag.getBoundingClientRect(); dentro = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; }
    setDragOut(null);
    if (!moved || !dentro) toggle(t);   // toque = sacar; arrastrada FUERA = sacar
  }

  function verificar() {
    if (verified || !spun) return;
    setVerified(true);
    const buenas = built.cards.filter((c) => c.reg === built.target);
    const isCorrect = buenas.every((c) => inBag[c.t]) && built.cards.every((c) => (c.reg === built.target ? true : !inBag[c.t]));
    const metidas = built.cards.filter((c) => inBag[c.t]).map((c) => c.t);
    onSolve(isCorrect, [{ emoji: "🎡", a: `¿Qué es de la región ${R.t}?`, userAnswer: metidas.length ? metidas.join(" + ") : "nada en el álbum", correctAnswer: buenas.map((c) => c.t).join(" + "), isCorrect }], isCorrect ? 1 : 0);
  }
  verifyRef.current = verificar;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", height: "100%", width: "100%" }}>
      <div style={{ textAlign: "center", pointerEvents: "none", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 20, color: "#fff", textShadow: "0 2px 6px rgba(0,0,0,0.55)" }}>
        {spun ? (<>¿Qué encontramos en <span style={{ color: "#fce9a8", fontWeight: 800 }}>{L3T3_REG_EN[built.target]}</span>?</>) : "¿A qué región vamos de viaje?"}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 26 }}>
        {/* Ruleta */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ position: "relative", width: 148, height: 148 }}>
            <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "9px solid transparent", borderRight: "9px solid transparent", borderTop: "14px solid #fce9a8", filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.5))", zIndex: 2 }} />
            <div style={{ width: 148, height: 148, transform: `rotate(${angle}deg)`, transition: spinning ? "transform 1.7s cubic-bezier(0.15,0.85,0.2,1)" : "none" }}>
              <svg viewBox="0 0 148 148" width="148" height="148">
                {L3T2_REG_IDS.map((rid, i) => (
                  <path key={rid} d={l3t3Sector(74, 74, 70, i * 90, (i + 1) * 90)} fill={L3T3_REG_FILL[rid]} stroke="rgba(255,255,255,0.75)" strokeWidth="2" />
                ))}
                {L3T2_REG_IDS.map((rid, i) => {
                  const a = ((i * 90 + 45 - 90) * Math.PI) / 180;
                  return <text key={`e-${rid}`} x={74 + 46 * Math.cos(a)} y={74 + 46 * Math.sin(a) + 7} textAnchor="middle" style={{ fontSize: 21 }}>{L3T2_REGIONES[rid].e}</text>;
                })}
                <circle cx="74" cy="74" r="15" fill="#2b1c62" stroke="#f2c260" strokeWidth="3" />
              </svg>
            </div>
          </div>
          {!spun ? (
            <button className="ed-btn" onClick={girar} disabled={spinning}
              style={{ height: 40, padding: "0 26px", fontSize: 15, fontWeight: 800, letterSpacing: "0.06em", background: "linear-gradient(180deg, #ffc06e, #e4881a)", color: "#3a2608", border: "none", opacity: spinning ? 0.6 : 1, cursor: spinning ? "default" : "pointer" }}>GIRAR</button>
          ) : (
            <div style={{ height: 40, display: "flex", alignItems: "center", gap: 7, background: L3T3_REG_COLOR[built.target].grad, border: `2px solid ${L3T3_REG_COLOR[built.target].border}`, borderRadius: 999, padding: "0 16px" }}>
              <span style={{ fontSize: 17 }}>{R.e}</span>
              <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 14, color: L3T3_REG_COLOR[built.target].ink }}>{R.t}</span>
            </div>
          )}
        </div>

        {/* Maleta */}
        <div ref={bagRef} style={{ width: 176, height: 184, borderRadius: 16, border: `3px ${spun ? "solid" : "dashed"} rgba(242,194,96,0.75)`, background: "linear-gradient(180deg, rgba(255,248,230,0.18), rgba(247,227,168,0.10))", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, padding: 7 }}>
          {/* Álbum del viaje, NO maleta: la autora notó que la metáfora era falsa —
              nadie se lleva un pingüino ni un río en una maleta. Aquí se "guarda la foto"
              de lo que se encuentra, que sí funciona con animales, ríos y ciudades.
              ⚠ La altura (184) está calculada para el PEOR caso: el rótulo (36) + las 4
              pastillas (4×25 + 3×4 gap = 112). Con 132 se rompía la caja al meter las 4
              (tapaba el 📸 y se salía por el borde de abajo). Sigue por debajo de los
              196 px de la columna de la ruleta, así que la fila no crece. */}
          <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 1, opacity: Object.keys(inBag).filter((k) => inBag[k]).length ? 0.4 : 1, transition: "opacity 0.2s" }}>
            <span style={{ fontSize: 24, lineHeight: 1 }}>📸</span>
            <span className="ed-label" style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", letterSpacing: "0.06em" }}>mi álbum</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center", alignContent: "center" }}>
            {built.cards.filter((c) => inBag[c.t]).map((c) => {
              const okc = c.reg === built.target;
              return (
                <button key={c.t} onPointerDown={(e) => downOut(e, c.t)} onPointerMove={moveOut} onPointerUp={upOut} disabled={verified}
                  style={{ display: "flex", alignItems: "center", gap: 4, borderRadius: 999, padding: "3px 9px", border: `2px solid ${verified ? (okc ? "#2ecc8f" : "#ff6b6b") : "#e0a72c"}`, background: verified ? (okc ? "linear-gradient(180deg, rgba(72,224,154,0.95), rgba(26,143,95,0.92))" : "linear-gradient(180deg, rgba(255,139,139,0.92), rgba(178,47,47,0.9))") : "linear-gradient(180deg, #fff8e6, #f7e3a8)", cursor: verified ? "default" : "grab", touchAction: "none", userSelect: "none", transform: dragOut && dragOut.t === c.t ? `translate(${dragOut.dx}px, ${dragOut.dy}px) scale(1.06)` : "none", transition: dragOut && dragOut.t === c.t ? "none" : "transform 0.15s ease", zIndex: dragOut && dragOut.t === c.t ? 50 : 1, boxShadow: dragOut && dragOut.t === c.t ? "0 14px 26px rgba(0,0,0,0.5)" : "none" }}>
                  {!l3t3Generico(c.e) && <span style={{ fontSize: 13, flexShrink: 0 }}>{c.e}</span>}
                  {/* nowrap: si el nombre largo ("Tortuga gigante") partiera en 2 líneas la
                      pastilla crecería y el alto de la caja dejaría de ser predecible. */}
                  <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 12, color: verified ? (okc ? "#06381f" : "#fff") : "#3a2608", whiteSpace: "nowrap" }}>{c.t}</span>
                  {verified && <span style={{ fontSize: 12, fontWeight: 900, color: okc ? "#06381f" : "#fff" }}>{okc ? "✓" : "✗"}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tarjetas por llevar */}
      <div style={{ display: "flex", gap: 10, justifyContent: "center", touchAction: "none" }}>
        {built.cards.map((c) => {
          if (inBag[c.t]) return <div key={c.t} style={{ width: 110, height: 112, borderRadius: 14, border: "2px dashed rgba(255,255,255,0.22)" }} />;
          const dragging = drag && drag.t === c.t, falto = verified && c.reg === built.target;
          return (
            <button key={c.t} onPointerDown={(e) => down(e, c.t)} onPointerMove={move} onPointerUp={up} disabled={verified || !spun}
              style={{ position: "relative", width: 110, height: 112, borderRadius: 14, border: `3px ${falto ? "dashed" : "solid"} ${falto ? "#c98a1e" : "rgba(242,194,96,0.7)"}`, background: falto ? "linear-gradient(180deg, #fff2d0, #f4d693)" : "linear-gradient(180deg, #fff8e6, #f7e3a8)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, padding: "4px 5px", cursor: spun && !verified ? "grab" : "default", opacity: spun ? 1 : 0.45, touchAction: "none", userSelect: "none", boxShadow: dragging ? "0 16px 30px rgba(0,0,0,0.5)" : "inset 0 1px 0 rgba(255,255,255,0.6), 0 5px 12px rgba(0,0,0,0.28)", transform: dragging ? `translate(${drag.dx}px, ${drag.dy}px) scale(1.05)` : "none", transition: dragging ? "none" : "transform 0.15s ease", zIndex: dragging ? 50 : 1 }}>
              {falto && <span style={{ position: "absolute", top: -9, right: -7, background: "#c98a1e", color: "#fff", fontFamily: "var(--ed-font-ui)", fontWeight: 800, fontSize: 10, padding: "2px 8px", borderRadius: 999, boxShadow: "0 2px 6px rgba(0,0,0,0.4)" }}>faltó</span>}
              <L3T3Foto cands={c.slug ? [{ p: "lugar", s: c.slug }] : []} fallback={l3t3Generico(c.e) ? null : c.e} w={84} h={84} radius={9} />
              <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: l3t3Generico(c.e) ? 16 : 11, color: "#3a2608", lineHeight: 1.1, textAlign: "center" }}>{c.t}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── R3: los límites del Ecuador (ARRASTRAR los puntos cardinales al mapa) ──
// El mapa va en `assets/mapa-ecuador.<ext>` (lo genera la autora). Mientras no exista,
// cae a una placa "ECUADOR" y la ronda funciona igual. Alrededor del mapa quedan los
// vecinos del libro (Colombia · Perú · Océano Pacífico) como pista de contexto.
// Se puede ARRASTRAR la ficha al recuadro o TOCARLA y luego tocar el recuadro (a los
// 7 años el arrastre falla; las dos formas hacen lo mismo).
function L3T3MapaEcuador({ w, h }) {
  const [i, setI] = useStateG(0);
  const failed = i >= L3_IMG_EXTS.length;
  if (failed) {
    // Mientras no exista la imagen del mapa: placa con la BANDERA (amarillo/azul/rojo,
    // en sus proporciones reales) + el nombre. Se ve intencional, no un hueco roto — y
    // NO se dibuja una silueta inventada del país (sería un error de contenido escolar).
    return (
      <div style={{ width: w, height: h, borderRadius: 14, border: "3px solid #f2c260", background: "linear-gradient(180deg, #fff8e6, #f0dca8)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, flexShrink: 0, overflow: "hidden", boxShadow: "0 8px 20px rgba(0,0,0,0.35)" }}>
        <div style={{ width: w - 34, height: 54, borderRadius: 7, overflow: "hidden", border: "2px solid rgba(58,38,8,0.35)", boxShadow: "0 3px 8px rgba(0,0,0,0.3)" }}>
          <div style={{ height: "50%", background: "#ffdd00" }} />
          <div style={{ height: "25%", background: "#034ea2" }} />
          <div style={{ height: "25%", background: "#ed1c24" }} />
        </div>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 17, letterSpacing: "0.06em", color: "#3a2608" }}>ECUADOR</span>
      </div>
    );
  }
  return (
    // Marco dorado como el resto de fichas EDINUN: el mapa es un JPG opaco, sin marco
    // se veía como una calcomanía cuadrada pegada sobre el fieltro verde.
    <div style={{ width: w, height: h, borderRadius: 16, overflow: "hidden", border: "3px solid #f2c260", flexShrink: 0, boxShadow: "0 10px 24px rgba(0,0,0,0.45)", background: "#dfe9f2" }}>
      <img src={`assets/mapa-ecuador.${L3_IMG_EXTS[i]}`} alt="" draggable="false" onError={() => setI((k) => k + 1)}
        style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
    </div>
  );
}

function R3Mapa({ onSolve, verifyRef }) {
  const [bandeja] = useStateG(() => l3Shuffle(L3T3_CARDINALES.map((c) => c.id)));
  const [placed, setPlaced] = useStateG(() => ({}));   // { slotId: cardinalId }
  const [sel, setSel] = useStateG(null);               // ficha elegida (modo tocar)
  const [verified, setVerified] = useStateG(false);
  const [drag, setDrag] = useStateG(null);       // arrastrando una ficha HACIA un recuadro
  const [dragOut, setDragOut] = useStateG(null); // sacando una ficha YA colocada
  const slotRefs = useRefG({});
  const startRef = useRefG({ x: 0, y: 0, moved: false });
  const outRef = useRefG({ x: 0, y: 0, moved: false, id: null });
  const puestas = Object.keys(placed).map((k) => placed[k]);
  const CARD = {}; L3T3_CARDINALES.forEach((c) => { CARD[c.id] = c; });

  function poner(slotId, cid) {
    if (verified) return;
    setPlaced((prev) => {
      const n = {};
      Object.keys(prev).forEach((k) => { if (prev[k] !== cid) n[k] = prev[k]; }); // la ficha solo puede estar en un sitio
      n[slotId] = cid;
      return n;
    });
    setSel(null);
  }
  function quitarSlot(slotId) {
    setPlaced((prev) => { const n = Object.assign({}, prev); delete n[slotId]; return n; });
  }
  function tapSlot(slotId) {
    if (verified) return;
    if (placed[slotId]) { quitarSlot(slotId); return; }
    if (sel) poner(slotId, sel);
  }
  // ── Sacar del recuadro ARRASTRANDO hacia afuera (además del toque) ──
  // Mismo gesto que en el álbum de R2, para que el niño no tenga que aprender dos formas.
  // El gesto se sigue por REF (`outRef.id`), no por estado: al soltar hay que decidir con
  // datos del momento y el estado puede venir de un render viejo.
  function slotDown(e, slotId) {
    if (verified || !placed[slotId]) return;   // recuadro vacío → no hay nada que sacar
    outRef.current = { x: e.clientX, y: e.clientY, moved: false, id: slotId };
    setDragOut({ id: slotId, dx: 0, dy: 0 });
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (er) {}
  }
  function slotMove(e) {
    if (!outRef.current.id) return;
    const dx = e.clientX - outRef.current.x, dy = e.clientY - outRef.current.y;
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) outRef.current.moved = true;
    setDragOut({ id: outRef.current.id, dx, dy });
  }
  function slotUp(e, slotId) {
    if (verified) return;
    if (outRef.current.id !== slotId) { tapSlot(slotId); return; }   // vacío → recibe la elegida
    const moved = outRef.current.moved;
    // OJO: medir con `slotRefs`, NO con `e.currentTarget` — con pointer capture el
    // currentTarget no siempre es el recuadro y "¿soltó fuera?" salía siempre que no.
    const el = slotRefs.current[slotId];
    const r = el ? el.getBoundingClientRect() : { left: 0, right: 0, top: 0, bottom: 0 };
    const dentro = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    outRef.current = { x: 0, y: 0, moved: false, id: null };
    setDragOut(null);
    if (!moved || !dentro) quitarSlot(slotId);   // toque = sacar; arrastrada FUERA = sacar
  }
  // ── Soltar TOLERANTE (7 años) ──────────────────────────────────────────────
  // Antes solo valía si el cursor caía DENTRO del recuadro (96×42): si el niño soltaba
  // un poquito afuera no pasaba nada y la ficha se devolvía sin explicación. Ahora se
  // acepta el recuadro más cercano dentro de un margen generoso alrededor de su borde;
  // como solo hay 4 y están lejos entre sí, no hay riesgo de confundir el destino.
  function slotCercano(x, y) {
    let dentro = null, cerca = null, mejor = Infinity;
    L3T3_CARDINALES.forEach((c) => {
      const el = slotRefs.current[c.id];
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) { dentro = c.id; return; }
      const dx = Math.max(r.left - x, 0, x - r.right);
      const dy = Math.max(r.top - y, 0, y - r.bottom);   // distancia al BORDE, no al centro
      const d = Math.sqrt(dx * dx + dy * dy);
      // El margen se mide con el propio recuadro, así escala solo con el lienzo.
      if (d < mejor && d <= r.width * 0.62) { mejor = d; cerca = c.id; }
    });
    return dentro || cerca;
  }
  function down(e, cid) {
    if (verified) return;
    startRef.current = { x: e.clientX, y: e.clientY, moved: false };
    setDrag({ cid, dx: 0, dy: 0, sobre: null });
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (er) {}
  }
  function move(e) {
    if (!drag) return;
    const dx = e.clientX - startRef.current.x, dy = e.clientY - startRef.current.y;
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) startRef.current.moved = true;
    const sobre = startRef.current.moved ? slotCercano(e.clientX, e.clientY) : null;
    setDrag((d) => (d ? { cid: d.cid, dx, dy, sobre } : d));   // `sobre` ilumina el destino
  }
  function up(e) {
    if (!drag) return;
    const cid = drag.cid, moved = startRef.current.moved;
    setDrag(null);
    // Un TOQUE (sin mover) solo ELIGE la ficha. Ojo: no se puede buscar destino aquí —
    // la bandeja queda a ~60 px del recuadro de abajo y, con el margen tolerante, tocar
    // una ficha la mandaba sola al recuadro SUR. Solo se suelta si de verdad arrastró.
    if (!moved) { setSel((s) => (s === cid ? null : cid)); return; }
    const destino = slotCercano(e.clientX, e.clientY);
    if (destino) { poner(destino, cid); return; }
    // Arrastró pero soltó lejos: la ficha queda ELEGIDA, solo tiene que tocar el recuadro.
    // Antes se perdía el gesto entero y parecía que el juego no respondía.
    setSel(cid);
  }

  function verificar() {
    if (verified) return;
    setVerified(true);
    const isCorrect = L3T3_CARDINALES.every((c) => placed[c.id] === c.id);
    const mia = L3T3_CARDINALES.map((c) => `${c.vecino}: ${placed[c.id] ? CARD[placed[c.id]].t : "—"}`).join(" · ");
    onSolve(isCorrect, [{ emoji: "🧭", a: "Los límites del Ecuador", userAnswer: mia, correctAnswer: L3T3_CARDINALES.map((c) => `${c.vecino}: ${c.t}`).join(" · "), isCorrect }], isCorrect ? 1 : 0);
  }
  verifyRef.current = verificar;

  // Recuadro donde se suelta cada punto cardinal.
  // ⚠ Es una FUNCIÓN QUE DEVUELVE JSX, no un componente: declarar un componente dentro de
  // otro crea un tipo nuevo en cada render, y React desmonta y vuelve a montar el <div>.
  // Eso hacía perder el `setPointerCapture` a media arrastrada y el gesto de "sacar
  // arrastrando" nunca llegaba a su `pointerup`. Con una función normal el div es estable.
  function renderSlot(c) {
    const cid = placed[c.id], ok = verified && cid === c.id;
    // `apuntado` = el recuadro al que va a caer la ficha que se está arrastrando, o el
    // que recibirá la ficha ya elegida a toque. Se ilumina para que el niño lo vea ANTES
    // de soltar: sin esta pista el arrastre se sentía "que no responde".
    const apuntado = !verified && ((drag && drag.sobre === c.id) || (!drag && sel && !cid));
    const sacando = dragOut && dragOut.id === c.id;   // se está tirando la ficha hacia afuera
    let border = cid ? "#4fa0ff" : "rgba(242,194,96,0.75)", bg = cid ? "linear-gradient(180deg, #dcecff, #a9d0ff)" : "rgba(255,255,255,0.10)", ink = "#0f2a55";
    if (verified) {
      border = ok ? "#2ecc8f" : "#ff6b6b";
      bg = ok ? "linear-gradient(180deg, rgba(72,224,154,0.95), rgba(26,143,95,0.92))" : "linear-gradient(180deg, rgba(255,139,139,0.92), rgba(178,47,47,0.9))";
      ink = ok ? "#06381f" : "#fff";
    }
    const enfoque = drag && drag.sobre === c.id;
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
        <div className="ed-label" style={{ fontSize: 10, color: enfoque ? "#fce9a8" : "rgba(255,255,255,0.62)", letterSpacing: "0.05em", whiteSpace: "nowrap", transition: "color 0.12s" }}>{c.vecino}</div>
        <div ref={(el) => { slotRefs.current[c.id] = el; }}
          onPointerDown={(e) => slotDown(e, c.id)} onPointerMove={slotMove} onPointerUp={(e) => slotUp(e, c.id)}
          style={{ width: 96, height: 42, borderRadius: 12, border: `3px ${cid ? "solid" : "dashed"} ${enfoque ? "#fce9a8" : (apuntado ? "#7ab8ff" : border)}`, background: enfoque ? "rgba(252,233,168,0.28)" : (apuntado ? "rgba(122,184,255,0.18)" : bg), display: "flex", alignItems: "center", justifyContent: "center", gap: 5, cursor: verified ? "default" : (cid ? "grab" : "pointer"), touchAction: "none", userSelect: "none", transform: enfoque ? "scale(1.09)" : "none", transition: "transform 0.12s, background 0.12s, border-color 0.12s", boxShadow: enfoque ? "0 0 16px rgba(252,233,168,0.75)" : (cid ? "inset 0 1px 0 rgba(255,255,255,0.6), 0 5px 12px rgba(0,0,0,0.28)" : "none") }}>
          {verified && <span style={{ fontSize: 15, fontWeight: 900, color: ink }}>{ok ? "✓" : "✗"}</span>}
          <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 14, letterSpacing: "0.04em", color: cid ? ink : "rgba(255,255,255,0.35)", transform: sacando ? `translate(${dragOut.dx}px, ${dragOut.dy}px)` : "none", transition: sacando ? "none" : "transform 0.15s ease", pointerEvents: "none" }}>{cid ? CARD[cid].t : "?"}</span>
        </div>
        {/* Al fallar, revela cuál iba aquí (dorado, no verde: no lo acertó) */}
        {verified && !ok && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, background: "linear-gradient(180deg, #ffe6a1, #f1c153)", border: "2px solid #e0a72c", borderRadius: 9, padding: "1px 8px" }}>
            <span style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 800, fontSize: 8, letterSpacing: "0.06em", color: "rgba(90,61,10,0.7)" }}>VA</span>
            <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 12, color: "#5a3d0a" }}>{c.t}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", height: "100%", width: "100%" }}>
      <div style={{ textAlign: "center", pointerEvents: "none", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 20, color: "#fff", textShadow: "0 2px 6px rgba(0,0,0,0.55)" }}>
        ¿Dónde queda cada punto cardinal?
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "116px 172px 116px", gap: 8, alignItems: "center", justifyItems: "center" }}>
        <div />{renderSlot(L3T3_CARDINALES[0])}<div />
        {renderSlot(L3T3_CARDINALES[3])}
        <L3T3MapaEcuador w={168} h={168} />
        {renderSlot(L3T3_CARDINALES[2])}
        <div />{renderSlot(L3T3_CARDINALES[1])}<div />
      </div>

      {/* Fichas por colocar. Cuando ya están las 4, la fila de huecos vacíos no dice nada
          y justo ahí el niño necesita saber qué sigue → se reemplaza por el aviso de
          verificar (mismo alto, para que no salte el layout). */}
      {puestas.length === L3T3_CARDINALES.length ? (
        <div style={{ height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {!verified && (
            <div className="ed-float-soft" style={{ display: "flex", alignItems: "center", gap: 9, background: "linear-gradient(180deg, #ffe6a1, #f1c153)", border: "3px solid #e0a72c", borderRadius: 999, padding: "6px 20px", boxShadow: "0 6px 16px rgba(0,0,0,0.4)" }}>
              <span style={{ fontSize: 16 }}>👉</span>
              <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 15, color: "#5a3d0a" }}>¡Ya están los 4! Toca ¡VERIFICAR!</span>
            </div>
          )}
        </div>
      ) : (
      <div style={{ display: "flex", gap: 9, justifyContent: "center", touchAction: "none" }}>
        {bandeja.map((cid) => {
          if (puestas.indexOf(cid) !== -1) return <div key={cid} style={{ width: 92, height: 40, borderRadius: 12, border: "2px dashed rgba(255,255,255,0.2)" }} />;
          const dragging = drag && drag.cid === cid, elegida = sel === cid;
          return (
            <button key={cid} onPointerDown={(e) => down(e, cid)} onPointerMove={move} onPointerUp={up} disabled={verified}
              style={{ width: 92, height: 40, borderRadius: 12, border: `3px solid ${elegida ? "#4fa0ff" : "rgba(242,194,96,0.7)"}`, background: elegida ? "linear-gradient(180deg, #dcecff, #a9d0ff)" : "linear-gradient(180deg, #fff8e6, #f7e3a8)", cursor: verified ? "default" : "grab", touchAction: "none", userSelect: "none", boxShadow: dragging ? "0 16px 30px rgba(0,0,0,0.5)" : "inset 0 1px 0 rgba(255,255,255,0.6), 0 5px 12px rgba(0,0,0,0.28)", transform: dragging ? `translate(${drag.dx}px, ${drag.dy}px) scale(1.06)` : "none", transition: dragging ? "none" : "transform 0.15s ease", zIndex: dragging ? 50 : 1 }}>
              <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 14, letterSpacing: "0.05em", color: "#3a2608" }}>{CARD[cid].t}</span>
            </button>
          );
        })}
      </div>
      )}
    </div>
  );
}

// ── Orquestador de las 3 rondas ──
function ViajeGame({ app, setApp, go }) {
  const char = CHARACTERS.find((c) => c.id === app.character) || CHARACTERS[0];
  const catLabel = app.currentCatLabel || "Viajando por mi país";
  const TOTAL = 3;
  const [round, setRound] = useStateG(0);
  const [stars, setStars] = useStateG(0);
  const [results, setResults] = useStateG([]);   // acierto por RONDA (para los dots)
  const [log, setLog] = useStateG([]);           // filas del reporte (R1 aporta 4)
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
  const starsRef = useRefG(0);   // fuente de verdad de las ⭐ (R1 las suma pareja a pareja)

  useEffectG(() => { const t = setInterval(() => setElapsed(Math.floor((Date.now() - started.current) / 1000)), 500); return () => clearInterval(t); }, []);
  function formatTime(s) { const m = Math.floor(s / 60), ss = s % 60; return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`; }

  function addStars(n) {
    if (!n) return;
    starsRef.current += n; setStars(starsRef.current);
    setApp((s) => ({ ...s, stars: (s.stars || 0) + n }));
  }

  // entries = filas del reporte de esta ronda (R1 manda 4; R2/R3 mandan 1).
  // starsMsg = las ⭐ que anuncia el cartel cuando ya se sumaron antes (caso de R1).
  function onSolve(isCorrect, entries, starsGained, starsMsg) {
    if (advancing.current) return;
    advancing.current = true; setBusy(true);
    if (typeof markFirstAttempt === "function") markFirstAttempt();
    const rows = entries.map((e, i) => Object.assign({ idx: log.length + i + 1 }, e));
    const newLog = log.concat(rows);
    const newResults = results.concat([isCorrect]);
    setLog(newLog); setResults(newResults);
    addStars(starsGained);
    const shown = starsMsg != null ? starsMsg : starsGained;
    // Deja ver la respuesta ANTES del overlay: al fallar ~1.8 s (ve ✓/✗ y la correcta),
    // como en el resto de juegos EDINUN. Luego el overlay ~1 s y avanza solo.
    const showFbAt = isCorrect ? (round === 0 ? 500 : 0) : 1800;
    const advanceAt = showFbAt + (isCorrect ? 1250 : 1000);
    setTimeout(() => { setFeedback(isCorrect ? "ok" : "err"); setFeedbackMsg(isCorrect ? `+${shown} ⭐` : L3_ANIMOS[round % L3_ANIMOS.length]); }, showFbAt);
    setTimeout(() => {
      setFeedback(null); setFeedbackMsg("");
      if (round + 1 < TOTAL) { setRound((r) => r + 1); advancing.current = false; setBusy(false); }
      else {
        const solved = newLog.filter((e) => e.isCorrect).length;
        setApp((s) => ({ ...s, lastResult: { category: catLabel, solved, total: newLog.length, time: Math.floor((Date.now() - started.current) / 1000), starsEarned: starsRef.current, log: newLog } }));
        if (typeof incrementGamesCompleted === "function") incrementGamesCompleted();
        go("results");
      }
    }, advanceAt);
  }

  function confirmRestart() {
    setConfirmingRestart(false); advancing.current = false; setBusy(false);
    starsRef.current = 0;
    setRound(0); setStars(0); setResults([]); setLog([]); setFeedback(null); setFeedbackMsg(""); setRk((k) => k + 1);
    started.current = Date.now();
  }

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* HUD */}
      <div style={{ position: "absolute", top: 10, left: 16, right: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <EdinunLogoMini size={64} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.35)", borderRadius: 999, padding: "6px 12px", border: "1px solid rgba(242,194,96,0.4)", fontFamily: "var(--ed-font-mono)", fontSize: 13, color: "#fce9a8" }}>⏱ {formatTime(elapsed)}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.35)", borderRadius: 999, padding: "6px 12px", border: "1px solid rgba(242,194,96,0.4)", fontFamily: "var(--ed-font-display)", fontWeight: 600, color: "#fce9a8" }}>⭐ {stars}</div>
        </div>
      </div>

      {/* RONDA con dots — top:52 (§1.1) */}
      <div style={{ position: "absolute", top: 52, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 8 }}>
        <span className="ed-label" style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>Ronda</span>
        {Array.from({ length: TOTAL }).map((_, i) => {
          const done = i < results.length, ok = done && results[i];
          return <div key={i} style={{ width: 11, height: 11, borderRadius: "50%", background: done ? (ok ? "#fce9a8" : "#ff6b6b") : (i === round ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)"), boxShadow: done ? "0 0 8px currentColor" : "none", color: ok ? "#fce9a8" : "#ff6b6b" }} />;
        })}
      </div>

      {/* Personaje guía + bocadillo (CÓMO por ronda) */}
      <div style={{ position: "absolute", left: 8, bottom: 78, width: 220, pointerEvents: "none", textAlign: "center" }}>
        <div className="ed-float-soft" style={{ position: "absolute", left: 0, right: 0, bottom: "100%", display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative", display: "inline-block", maxWidth: 210, background: "linear-gradient(180deg, rgba(20,12,55,0.95), rgba(10,6,35,0.95))", border: "1.5px solid rgba(242,194,96,0.65)", borderRadius: 16, padding: "10px 14px", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 14, lineHeight: 1.3, color: "#fce9a8", textAlign: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}>
            {round === 0 ? (<>Voltea dos cartas y<br />busca la pareja.</>) : round === 1 ? (<>Gira la ruleta y<br />llena tu álbum.</>) : (<>Arrastra cada punto<br />a su lugar.</>)}
            <div style={{ position: "absolute", bottom: -10, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "9px solid transparent", borderRight: "9px solid transparent", borderTop: "10px solid rgba(20,12,55,0.95)", filter: "drop-shadow(0 1px 0 rgba(242,194,96,0.55))" }} />
          </div>
        </div>
        <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
          <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", width: 140, height: 16, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(242,194,96,0.45), transparent 70%)", filter: "blur(5px)" }} />
          <char.Component size={186} floating />
        </div>
        <div style={{ marginTop: -2, fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 14, color: "#fce9a8", letterSpacing: "0.04em", textShadow: "0 2px 6px rgba(0,0,0,0.6)" }}>{char.name}</div>
      </div>

      {/* Zona central: la ronda actual */}
      <div style={{ position: "absolute", top: 60, bottom: 18, left: 215, right: 215 }}>
        {round === 0 && <R1Memoria key={`r1-${rk}`} onSolve={onSolve} onStar={() => addStars(1)} />}
        {round === 1 && <R2Ruleta key={`r2-${rk}`} onSolve={onSolve} verifyRef={verifyRef} />}
        {round === 2 && <R3Mapa key={`r3-${rk}`} onSolve={onSolve} verifyRef={verifyRef} />}
      </div>

      {/* Acciones (¡VERIFICAR! verde arriba, solo en R2/R3) */}
      <div style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 12, width: 150 }}>
        {(round === 1 || round === 2) && !busy && (
          <button className="ed-btn" onClick={() => verifyRef.current && verifyRef.current()} style={{ fontSize: 15, padding: "0 10px", height: 56, fontWeight: 800, letterSpacing: "0.04em", background: "linear-gradient(180deg, #4fe08a, #1f9d57)", color: "#06381f", border: "none" }}>¡VERIFICAR!</button>
        )}
        <button className="ed-btn ed-btn-restart" onClick={() => setConfirmingRestart(true)} style={{ fontSize: 15, padding: "0 10px", height: 56, fontWeight: 800, letterSpacing: "0.04em" }}>REINICIAR</button>
        <button className="ed-btn ed-btn-ghost" onClick={() => setConfirmingExit(true)} style={{ fontSize: 15, padding: "0 10px", height: 56, fontWeight: 800, letterSpacing: "0.04em" }}>SALIR</button>
      </div>

      {/* Overlay acierto/fallo */}
      {feedback && (
        <PortalToBody>
          <div style={{ position: "fixed", inset: 0, zIndex: 1000, pointerEvents: "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)", animation: "ed-pop-in 0.3s" }}>
            <div style={{ fontFamily: "'Fredoka','Baloo 2',system-ui,sans-serif", fontWeight: 700, fontSize: "clamp(56px, 11vmin, 120px)", color: feedback === "ok" ? "#2ecc8f" : "#ff6b6b", textShadow: "0 4px 0 rgba(0,0,0,0.45), 0 0 60px currentColor" }}>{feedback === "ok" ? "¡EXCELENTE!" : "¡UPS!"}</div>
            {feedbackMsg && (<div style={{ fontFamily: "'Fredoka','Baloo 2',system-ui,sans-serif", fontWeight: 700, fontSize: "clamp(18px, 2.6vmin, 30px)", color: feedback === "ok" ? "#fce9a8" : "#fff", background: "rgba(0,0,0,0.55)", padding: "8px 26px", borderRadius: 999, textShadow: "0 2px 6px rgba(0,0,0,0.6)", textAlign: "center" }}>{feedback === "err" ? `${feedbackMsg} — ${char.name}` : feedbackMsg}</div>)}
          </div>
        </PortalToBody>
      )}

      {/* Modal SALIR */}
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

      {/* Modal REINICIAR */}
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
// Juego placeholder (mismo marco que cualquier juego EDINUN).
// ─────────────────────────────────────────────────────────────
function PlaceholderGame({ app, setApp, go }) {
  const char = CHARACTERS.find((c) => c.id === app.character) || CHARACTERS[0];
  const catLabel = app.currentCatLabel || "Tema";
  const [elapsed, setElapsed] = useStateG(0);
  const [confirmingExit, setConfirmingExit] = useStateG(false);
  const started = useRefG(Date.now());

  useEffectG(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - started.current) / 1000)), 500);
    return () => clearInterval(t);
  }, []);
  function formatTime(s) { const m = Math.floor(s / 60), ss = s % 60; return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`; }

  function verReporte() {
    setApp((s) => ({
      ...s,
      lastResult: { category: catLabel, solved: 0, total: 0, time: Math.floor((Date.now() - started.current) / 1000), starsEarned: 0, log: [] },
    }));
    if (typeof incrementGamesCompleted === "function") incrementGamesCompleted();
    go("results");
  }

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* HUD */}
      <div style={{ position: "absolute", top: 10, left: 16, right: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <EdinunLogoMini size={64} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.35)", borderRadius: 999, padding: "6px 12px", border: "1px solid rgba(242,194,96,0.4)", fontFamily: "var(--ed-font-mono)", fontSize: 13, color: "#fce9a8" }}>⏱ {formatTime(elapsed)}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.35)", borderRadius: 999, padding: "6px 12px", border: "1px solid rgba(242,194,96,0.4)", fontFamily: "var(--ed-font-display)", fontWeight: 600, color: "#fce9a8" }}>⭐ 0</div>
        </div>
      </div>

      {/* Personaje guía + bocadillo */}
      <div style={{ position: "absolute", left: 8, bottom: 78, width: 220, pointerEvents: "none", textAlign: "center" }}>
        <div className="ed-float-soft" style={{ position: "absolute", left: 0, right: 0, bottom: "100%", display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative", display: "inline-block", maxWidth: 210, background: "linear-gradient(180deg, rgba(20,12,55,0.95), rgba(10,6,35,0.95))", border: "1.5px solid rgba(242,194,96,0.65)", borderRadius: 16, padding: "10px 14px", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 14, lineHeight: 1.3, color: "#fce9a8", textAlign: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}>
            Aquí irá el juego<br />de este tema.
            <div style={{ position: "absolute", bottom: -10, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "9px solid transparent", borderRight: "9px solid transparent", borderTop: "10px solid rgba(20,12,55,0.95)", filter: "drop-shadow(0 1px 0 rgba(242,194,96,0.55))" }} />
          </div>
        </div>
        <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
          <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", width: 140, height: 16, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(242,194,96,0.45), transparent 70%)", filter: "blur(5px)" }} />
          <char.Component size={186} floating />
        </div>
        <div style={{ marginTop: -2, fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 14, color: "#fce9a8", letterSpacing: "0.04em", textShadow: "0 2px 6px rgba(0,0,0,0.6)" }}>{char.name}</div>
      </div>

      {/* Zona central: aviso "en construcción" */}
      <div style={{ position: "absolute", top: 60, bottom: 18, left: 215, right: 215, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <div style={{ fontSize: 68, lineHeight: 1 }}>🚧</div>
        <div style={{ textAlign: "center", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 24, color: "#fff", textShadow: "0 2px 6px rgba(0,0,0,0.55)" }}>En construcción</div>
        <div style={{
          padding: "12px 22px", borderRadius: 16, background: "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(240,235,225,0.9))",
          border: "3px solid #f2c260", boxShadow: "0 10px 24px rgba(0,0,0,0.4)",
          fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 20, color: "#3a2608",
        }}>{catLabel}</div>
        <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 600, fontSize: 14, color: "rgba(255,255,255,0.85)", textAlign: "center", maxWidth: 360 }}>
          Pronto jugarás el juego de este tema.
        </div>
      </div>

      {/* Acciones (derecha) */}
      <div style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 12, width: 150 }}>
        <button className="ed-btn ed-btn-primary" onClick={verReporte} style={{ fontSize: 14, padding: "0 10px", height: 56, fontWeight: 800, letterSpacing: "0.04em" }}>VER REPORTE →</button>
        <button className="ed-btn ed-btn-ghost" onClick={() => setConfirmingExit(true)} style={{ fontSize: 15, padding: "0 10px", height: 56, fontWeight: 800, letterSpacing: "0.04em" }}>SALIR</button>
      </div>

      {/* Modal SALIR */}
      {confirmingExit && (
        <PortalToBody>
          <div onClick={() => setConfirmingExit(false)} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.62)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "ed-pop-in 0.18s", padding: 16 }}>
            <div onClick={(e) => e.stopPropagation()} className="ed-card" style={{ padding: 24, maxWidth: 440, textAlign: "center", boxShadow: "var(--ed-shadow-card), 0 0 40px rgba(255,107,107,0.3)" }}>
              <div className="ed-label" style={{ color: "#ff8b8b", marginBottom: 6 }}>Salir del juego</div>
              <h2 className="ed-h1" style={{ fontSize: 22, lineHeight: 1.15, marginBottom: 8 }}>¿Volver al inicio?</h2>
              <p className="ed-body" style={{ marginBottom: 16, fontSize: 14 }}>Volverás a la pantalla de libros.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <button className="ed-btn ed-btn-ghost" onClick={() => setConfirmingExit(false)} style={{ height: 44, fontWeight: 800, letterSpacing: "0.04em" }}>SEGUIR AQUÍ</button>
                <button className="ed-btn ed-btn-primary" onClick={() => { setConfirmingExit(false); go("home"); }} style={{ height: 44, fontWeight: 800, letterSpacing: "0.04em" }}>SÍ, SALIR</button>
              </div>
            </div>
          </div>
        </PortalToBody>
      )}
    </div>
  );
}

// ═══════════════ RESULTS — reporte académico imprimible (estándar) ═══════════════
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
            {log.length === 0 && (<tr><td colSpan={5} style={{ padding: 24, textAlign: "center", color: "#888", fontStyle: "italic" }}>Sin ejercicios (tema en construcción).</td></tr>)}
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
  const res = app.lastResult || { category: "—", solved: 0, total: 0, time: 0, starsEarned: 0, log: [] };
  const mm = Math.floor(res.time / 60), ss = res.time % 60;
  const totalEx = res.total || 0;
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
            {attemptedCount > 0
              ? `"${app.studentName || "Campeón"}, acertaste ${res.solved} de ${totalEx}."`
              : `"${app.studentName || "Campeón"}, este tema está en construcción."`}
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
                {(res.log || []).length === 0 && (<tr><td colSpan={5} style={{ padding: "16px 8px", textAlign: "center", color: "var(--ed-ink-soft)", fontStyle: "italic" }}>Tema en construcción — todavía sin ejercicios.</td></tr>)}
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
            <button className="ed-btn ed-btn-primary" onClick={() => go("game")} style={{ padding: "0 10px", fontSize: 13, height: 44, fontWeight: 800, letterSpacing: "0.04em" }}>VOLVER AL JUEGO</button>
          </div>
        </div>
      </div>

      <PrintableReport studentName={app.studentName} res={res} dateStr={dateStr} mm={mm} ss={ss} attemptedCount={attemptedCount} accuracy={accuracy} />
    </div>
  );
}

// Pills de tema (arriba, centro) — saltar entre los temas del libro sin volver al Home.
// FORMATO CALCADO de edinun-language/juego-2 (chip oscuro; activo con el gradiente del
// tema por posición, GRAD_POS). Con modal de confirmación. Solo si el libro tiene 2+ temas.
// ═════════════════════════════════════════════════════════════════════════
// LIBRO 5 · TEMA 1 · "Región Interandina" (9 años) — 3 RONDAS DISTINTAS.
// Provincias de la Sierra (libro "Provincias de la región Interandina").
// R1 ¿de qué provincia es este lugar? (tocar 1 de 4)  · R2 ordena de NORTE a SUR
// (arrastrar, reusa el arrastre en vivo) · R3 empareja el pueblo con su provincia.
// Todo textual del libro. Anti-repetición por ronda. Ver design-doc.
// ═════════════════════════════════════════════════════════════════════════
const L5_PROVINCIAS = [
  { id: "carchi", t: "Carchi", e: "🌲" }, { id: "imbabura", t: "Imbabura", e: "🏞️" },
  { id: "pichincha", t: "Pichincha", e: "🏛️" }, { id: "cotopaxi", t: "Cotopaxi", e: "🌋" },
  { id: "tungurahua", t: "Tungurahua", e: "🌸" }, { id: "chimborazo", t: "Chimborazo", e: "🏔️" },
  { id: "bolivar", t: "Bolívar", e: "🧂" }, { id: "canar", t: "Cañar", e: "🏛️" },
  { id: "azuay", t: "Azuay", e: "⛪" }, { id: "loja", t: "Loja", e: "☕" },
];
const L5_ORDEN_NS = ["carchi", "imbabura", "pichincha", "cotopaxi", "tungurahua", "chimborazo", "bolivar", "canar", "azuay", "loja"];
function l5Prov(id) { return L5_PROVINCIAS.find((p) => p.id === id); }

// R1 — lugar/atractivo ÚNICO por provincia (textual del libro) → provincia.
// `slug` → foto en assets/l5-<slug>.(jpg|png|jpeg|webp). La autora pone FOTOS REALES
// (paisajes/monumentos, sin caras); prefijo l5- propio del Libro 5.
// `foto: true` = ese lugar YA tiene su archivo subido. La R1 SOLO pregunta por los que
// tienen `foto` (decisión de la autora: que siempre salga imagen, nunca emoji).
// ➜ Al subir una foto nueva, ponerle `foto: true` a ese lugar para que entre a la R1.
const L5_LUGARES = [
  { t: "Laguna Verde", e: "🏞️", prov: "carchi", slug: "laguna-verde" }, { t: "Bosque de Polylepis", e: "🌲", prov: "carchi", slug: "bosque-polylepis", foto: true },
  { t: "Mercado de ponchos de Otavalo", e: "🧶", prov: "imbabura", slug: "otavalo", foto: true }, { t: "Laguna de Mojanda", e: "🏞️", prov: "imbabura", slug: "mojanda" }, { t: "Cascada de Peguche", e: "💧", prov: "imbabura", slug: "peguche" },
  { t: "Mitad del Mundo", e: "🌐", prov: "pichincha", slug: "mitad-del-mundo", foto: true }, { t: "Centro histórico de Quito", e: "🏛️", prov: "pichincha", slug: "quito" }, { t: "Mindo", e: "🦋", prov: "pichincha", slug: "mindo" },
  { t: "Volcán Cotopaxi", e: "🌋", prov: "cotopaxi", slug: "cotopaxi" }, { t: "Laguna del Quilotoa", e: "🌋", prov: "cotopaxi", slug: "quilotoa", foto: true }, { t: "El Boliche", e: "🚂", prov: "cotopaxi", slug: "el-boliche" },
  { t: "Baños de Agua Santa", e: "♨️", prov: "tungurahua", slug: "banos", foto: true }, { t: "Fiesta de las Flores y las Frutas", e: "🌸", prov: "tungurahua", slug: "flores-frutas" }, { t: "Parque Nacional Sangay", e: "🌋", prov: "tungurahua", slug: "sangay" },
  { t: "Guano, capital artesanal", e: "🧵", prov: "chimborazo", slug: "guano" }, { t: "Laguna de Colta", e: "🏞️", prov: "chimborazo", slug: "colta", foto: true },
  { t: "Minas de sal de Salinas", e: "🧂", prov: "bolivar", slug: "salinas", foto: true }, { t: "Guaranda, las siete colinas", e: "⛰️", prov: "bolivar", slug: "guaranda" },
  { t: "Ruinas de Ingapirca", e: "🏛️", prov: "canar", slug: "ingapirca", foto: true }, { t: "Laguna de Culebrillas", e: "🏞️", prov: "canar", slug: "culebrillas" },
  { t: "Cuenca, Patrimonio Cultural", e: "⛪", prov: "azuay", slug: "cuenca", foto: true }, { t: "Parque Nacional Cajas", e: "🏞️", prov: "azuay", slug: "cajas" }, { t: "Chordeleg y sus artesanías", e: "💍", prov: "azuay", slug: "chordeleg" },
  { t: "Vilcabamba", e: "🌿", prov: "loja", slug: "vilcabamba", foto: true }, { t: "Virgen de El Cisne", e: "⛪", prov: "loja", slug: "el-cisne", foto: true }, { t: "Bosque petrificado de Puyango", e: "🪵", prov: "loja", slug: "puyango" },
];
const L5_IMG_EXTS = ["jpg", "png", "jpeg", "webp"];
function L5Foto({ slug, emoji, size = 140 }) {
  const [tryIdx, setTryIdx] = useStateG(0);
  const failed = !slug || tryIdx >= L5_IMG_EXTS.length;
  if (failed) return <span style={{ fontSize: Math.round(size * 0.42), lineHeight: 1 }}>{emoji}</span>;
  return <img src={`assets/l5-${slug}.${L5_IMG_EXTS[tryIdx]}`} alt="" draggable="false" onError={() => setTryIdx((i) => i + 1)} style={{ width: size, height: size, objectFit: "cover", borderRadius: 12, display: "block", boxShadow: "0 6px 16px rgba(0,0,0,0.3)" }} />;
}

// R3 — pueblo/nacionalidad de la Sierra (lista textual del libro). Se empareja la
// VESTIMENTA (foto real del traje, assets/l5-pueblo-<slug>.jpg) con su pueblo. `vest: true`
// = ese pueblo ya tiene foto de traje → la R3 SOLO usa esos (así siempre hay imagen). La
// provincia se muestra como ETIQUETA (dato del libro, no se pierde). "Cañari" queda fuera
// (el libro lo asigna a Cañar Y Azuay → ambiguo). ➜ Al subir una vestimenta nueva, poner
// `vest: true` a ese pueblo. Fotos REALES (no IA): la ropa tradicional es de culturas reales.
const L5_PUEBLOS = [
  { pueblo: "Otavalo", prov: "imbabura", slug: "otavalo", vest: true }, { pueblo: "Cayambi", prov: "pichincha", slug: "cayambi", vest: true },
  { pueblo: "Panzaleo", prov: "cotopaxi", slug: "panzaleo" }, { pueblo: "Salasaka", prov: "tungurahua", slug: "salasaka", vest: true },
  { pueblo: "Waranka", prov: "bolivar", slug: "waranka" }, { pueblo: "Puruwá", prov: "chimborazo", slug: "puruwa" },
  { pueblo: "Saraguro", prov: "loja", slug: "saraguro", vest: true },
];
const L5_PAIR_COLORS = [
  { dot: "#4f8fef", ring: "rgba(79,143,239,0.9)", bg: "linear-gradient(180deg, #dbeafe, #a9cbff)", ink: "#0f2a55" },
  { dot: "#e0a72c", ring: "rgba(224,167,44,0.9)", bg: "linear-gradient(180deg, #fff1c9, #f6cf72)", ink: "#5a3d0a" },
  { dot: "#9b7be8", ring: "rgba(155,123,232,0.9)", bg: "linear-gradient(180deg, #ecdcff, #c7a9ff)", ink: "#2a1657" },
];

const L5_R1_KEY = "edinun_juego6_l5t1_r1_v1";
const L5_R2_KEY = "edinun_juego6_l5t1_r2_v1";
const L5_R3_KEY = "edinun_juego6_l5t1_r3_v1";
function l5R1Build() {
  // Solo lugares CON foto (l.foto): así la R1 siempre muestra imagen, nunca emoji.
  const recent = new Set(l3t2Recent(L5_R1_KEY)), all = L5_LUGARES.map((l, i) => (l.foto ? i : -1)).filter((i) => i >= 0);
  const idx = l3Shuffle(all.filter((i) => !recent.has(i))).concat(l3Shuffle(all.filter((i) => recent.has(i))))[0];
  l3t2Push(L5_R1_KEY, idx, 6);
  const lugar = L5_LUGARES[idx], correct = lugar.prov;
  const distract = l3Shuffle(L5_PROVINCIAS.filter((p) => p.id !== correct)).slice(0, 3);
  const opts = l3Shuffle([l5Prov(correct)].concat(distract));
  return { lugar, correct, opts };
}
function l5R2Build() {
  const recent = new Set(l3t2Recent(L5_R2_KEY));
  let trio = null;
  for (let k = 0; k < 12; k++) {
    const pick = l3Shuffle(L5_ORDEN_NS.slice()).slice(0, 3).sort((a, b) => L5_ORDEN_NS.indexOf(a) - L5_ORDEN_NS.indexOf(b));
    trio = pick; if (!recent.has(pick.join(","))) break;
  }
  l3t2Push(L5_R2_KEY, trio.join(","), 4);
  return { cards: trio.map((id) => l5Prov(id)) }; // ya en orden N→S (índice 0 = más al norte)
}
function l5R3Build() {
  // Solo pueblos CON vestimenta (vest): empareja la foto del traje ↔ el pueblo.
  const withVest = L5_PUEBLOS.filter((p) => p.vest);
  const recent = new Set(l3t2Recent(L5_R3_KEY)), all = withVest.map((_, i) => i);
  const chosen = l3Shuffle(all.filter((i) => !recent.has(i))).concat(l3Shuffle(all.filter((i) => recent.has(i)))).slice(0, 3);
  chosen.forEach((i) => l3t2Push(L5_R3_KEY, i, 3));
  const trajes = chosen.map((i) => withVest[i]);   // panel izquierdo (vestimentas), en este orden
  const nombres = l3Shuffle(trajes.slice());        // panel derecho (nombres del pueblo), barajado
  return { trajes, nombres };
}

// ── R1: ¿de qué provincia es este lugar? (tocar 1 de 4) ──
function PR1Provincia({ onSolve }) {
  const [b] = useStateG(() => l5R1Build());
  const [picked, setPicked] = useStateG(null);
  const answered = picked !== null;
  function tap(pid) {
    if (answered) return;
    setPicked(pid);
    const chosen = l5Prov(pid), correct = l5Prov(b.correct);
    onSolve(pid === b.correct, { emoji: "📍", a: `¿De qué provincia es ${b.lugar.t}?`, userAnswer: `${chosen.e} ${chosen.t}`, correctAnswer: `${correct.e} ${correct.t}` });
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", height: "100%", width: "100%", paddingTop: 8 }}>
      <div style={{ pointerEvents: "none", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 22, color: "rgba(255,255,255,0.9)" }}>¿De qué provincia es...</span>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, minHeight: 0, width: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(240,235,225,0.92))", border: "3px solid #f2c260", borderRadius: 20, padding: "16px 28px", boxShadow: "0 12px 28px rgba(0,0,0,0.4)", maxWidth: 460 }}>
        <L5Foto slug={b.lugar.slug} emoji={b.lugar.e} size={196} />
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 22, color: "#3a2608", textAlign: "center", lineHeight: 1.1 }}>{b.lugar.t}</span>
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "nowrap" }}>
        {b.opts.map((p) => {
          const isCorrect = p.id === b.correct;
          let border = "#f2c260", bg = "linear-gradient(180deg, #fff8e6, #f7e3a8)", col = "#3a2608";
          if (answered) {
            if (isCorrect) { border = "#2ecc8f"; bg = "linear-gradient(180deg, rgba(72,224,154,0.95), rgba(26,143,95,0.92))"; col = "#06381f"; }
            else if (p.id === picked) { border = "#ff6b6b"; bg = "linear-gradient(180deg, rgba(255,139,139,0.92), rgba(178,47,47,0.9))"; col = "#fff"; }
            else bg = "linear-gradient(180deg, rgba(255,248,230,0.5), rgba(247,227,168,0.5))";
          }
          return (
            <button key={p.id} onClick={() => tap(p.id)} disabled={answered}
              style={{ position: "relative", width: 108, height: 60, borderRadius: 16, border: `3px solid ${border}`, background: bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 6px", cursor: answered ? "default" : "pointer", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7), 0 6px 14px rgba(0,0,0,0.3)" }}>
              {answered && (isCorrect || p.id === picked) && (
                <span style={{ position: "absolute", top: 4, right: 6, fontSize: 17, fontWeight: 900, lineHeight: 1, color: isCorrect ? "#06381f" : "#fff" }}>{isCorrect ? "✓" : "✗"}</span>
              )}
              <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 14, color: col, textAlign: "center", lineHeight: 1.05 }}>{p.t}</span>
            </button>
          );
        })}
      </div>
      </div>
    </div>
  );
}

// ── R2: ordena de NORTE a SUR (arrastrar en vivo) ──
function PR2OrdenNS({ onSolve, verifyRef }) {
  const [build] = useStateG(() => l5R2Build());
  const cards = build.cards;
  const [order, setOrder] = useStateG(() => { let o = l3Shuffle([0, 1, 2]); if (o[0] === 0 && o[1] === 1 && o[2] === 2) o = [o[1], o[0], o[2]]; return o; });
  const [verified, setVerified] = useStateG(false);
  const [revealSol, setRevealSol] = useStateG(false);
  const [dragPos, setDragPos] = useStateG(null);
  const [dxy, setDxy] = useStateG({ x: 0, y: 0 });
  const colRef = useRefG(null), startRef = useRefG({ x: 0, y: 0 }), slotCentersRef = useRefG([]);
  function down(e, pos) { if (verified) return; startRef.current = { x: e.clientX, y: e.clientY }; const col = colRef.current; slotCentersRef.current = col ? [...col.querySelectorAll("[data-slot]")].map((s) => { const r = s.getBoundingClientRect(); return r.top + r.height / 2; }) : []; setDragPos(pos); setDxy({ x: 0, y: 0 }); try { e.currentTarget.setPointerCapture(e.pointerId); } catch (er) {} }
  function move(e) { if (dragPos === null) return; const cy = slotCentersRef.current; let target = 0; for (let i = 0; i < cy.length; i++) if (e.clientY > cy[i] - 6) target = i; if (cy.length && target !== dragPos) { setOrder((prev) => { const a = prev.slice(); const [m] = a.splice(dragPos, 1); a.splice(target, 0, m); return a; }); startRef.current = { x: startRef.current.x, y: cy[target] }; setDragPos(target); setDxy({ x: e.clientX - startRef.current.x, y: e.clientY - cy[target] }); return; } setDxy({ x: e.clientX - startRef.current.x, y: e.clientY - startRef.current.y }); }
  function up(e) { if (dragPos === null) return; setDragPos(null); setDxy({ x: 0, y: 0 }); }
  function verificar() {
    if (verified) return;
    const isCorrect = order[0] === 0 && order[1] === 1 && order[2] === 2;
    setVerified(true);
    if (!isCorrect) setTimeout(() => setRevealSol(true), 1000);
    onSolve(isCorrect, { emoji: "🧭", a: "Ordena de NORTE a SUR", userAnswer: order.map((i) => cards[i].t).join(" › "), correctAnswer: cards.map((c) => c.t).join(" › ") });
  }
  verifyRef.current = verificar;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", height: "100%", width: "100%" }}>
      <div style={{ textAlign: "center", pointerEvents: "none" }}>
        <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 21, color: "#fff", textShadow: "0 2px 6px rgba(0,0,0,0.55)" }}>Ordena las provincias de NORTE a SUR</div>
        <div className="ed-label" style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, marginTop: 3 }}>Región Interandina (Sierra)</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div className="ed-label" style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>⬆ NORTE</div>
        <div ref={colRef} style={{ display: "flex", flexDirection: "column", gap: 18, touchAction: "none", transform: revealSol ? "translateX(-70px)" : "none", transition: "transform 0.3s ease" }}>
          {order.map((cardIdx, pos) => {
            const c = cards[cardIdx], dragging = dragPos === pos, okPos = verified && order[pos] === pos;
            const pal = L3T2_CARD_COLORS[cardIdx % 3];
            let border = pal.border, bg = pal.bg;
            if (verified) { border = okPos ? "#2ecc8f" : "#ff6b6b"; bg = okPos ? "linear-gradient(180deg, rgba(72,224,154,0.95), rgba(26,143,95,0.92))" : "linear-gradient(180deg, rgba(255,139,139,0.92), rgba(178,47,47,0.9))"; }
            const inkMain = verified ? (okPos ? "#06381f" : "#fff") : pal.ink;
            return (
              <div key={cardIdx} data-slot onPointerDown={(e) => down(e, pos)} onPointerMove={move} onPointerUp={up}
                style={{ position: "relative", width: 214, height: 60, borderRadius: 14, border: `3px solid ${border}`, background: bg, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: verified ? "default" : "grab", touchAction: "none", userSelect: "none", boxShadow: dragging ? "0 16px 30px rgba(0,0,0,0.5)" : "inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -3px 0 rgba(0,0,0,0.12), 0 6px 14px rgba(0,0,0,0.3)", transform: dragging ? `translate(${dxy.x}px, ${dxy.y}px) scale(1.04)` : "none", transition: dragging ? "none" : "transform 0.15s ease", zIndex: dragging ? 50 : 1 }}>
                <span style={{ fontSize: verified ? 22 : 17, fontWeight: 900, color: verified ? inkMain : pal.handle, width: 20, textAlign: "center", flexShrink: 0 }}>{verified ? (okPos ? "✓" : "✗") : "⠿"}</span>
                <span style={{ fontSize: 22, lineHeight: 1 }}>{c.e}</span>
                <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 16, color: inkMain }}>{c.t}</span>
                {revealSol && order[pos] !== pos && (
                  <div style={{ position: "absolute", left: "calc(100% + 12px)", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: 7, whiteSpace: "nowrap", background: "linear-gradient(180deg, #ffe6a1, #f1c153)", border: "2px solid #e0a72c", borderRadius: 12, padding: "4px 12px", boxShadow: "0 5px 12px rgba(0,0,0,0.4)" }}>
                    <span style={{ fontSize: 15, fontWeight: 900, color: "#1f8a54" }}>✓</span>
                    <div style={{ textAlign: "left", lineHeight: 1.05 }}>
                      <div style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 800, fontSize: 8, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(90,61,10,0.7)" }}>aquí va</div>
                      <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 13, color: "#5a3d0a" }}>{cards[pos].t}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="ed-label" style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>⬇ SUR</div>
      </div>
    </div>
  );
}

// ── R3: empareja el pueblo con su provincia (unir por color/número + VERIFICAR) ──
function PR3Empareja({ onSolve, verifyRef }) {
  const [build] = useStateG(() => l5R3Build());
  const trajes = build.trajes, nombres = build.nombres;
  const [sel, setSel] = useStateG(null);       // índice del TRAJE (izquierda) seleccionado
  const [pairs, setPairs] = useStateG({});      // trajeIdx -> slug del pueblo elegido
  const [verified, setVerified] = useStateG(false);
  const wrapRef = useRefG(null), trajeRefs = useRefG([]), puebloRefs = useRefG({});
  const [anchors, setAnchors] = useStateG(null); // {trajes:[{x,y}], pueblos:{slug:{x,y}}} en px lógicos (offset del bloque)
  useEffectG(() => {
    const tj = trajeRefs.current.map((el) => (el ? { x: el.offsetLeft + el.offsetWidth, y: el.offsetTop + el.offsetHeight / 2 } : null));
    const pb = {};
    Object.keys(puebloRefs.current).forEach((slug) => { const el = puebloRefs.current[slug]; if (el) pb[slug] = { x: el.offsetLeft, y: el.offsetTop + el.offsetHeight / 2 }; });
    setAnchors({ trajes: tj, pueblos: pb });
  }, []);
  function tapTraje(i) { if (verified) return; setSel(i === sel ? null : i); }
  function tapPueblo(slug) {
    if (verified || sel === null) return;
    setPairs((prev) => { const next = {}; Object.keys(prev).forEach((k) => { if (prev[k] !== slug) next[k] = prev[k]; }); next[sel] = slug; return next; });
    setSel(null);
  }
  function verificar() {
    if (verified) return;
    setVerified(true);
    const ok = trajes.every((t, i) => pairs[i] === t.slug);
    onSolve(ok, { emoji: "🧵", a: "Une la vestimenta con su pueblo", userAnswer: trajes.map((t, i) => `${t.pueblo}→${pairs[i] || "?"}`).join(", "), correctAnswer: trajes.map((t) => `${t.pueblo}→${t.pueblo}`).join(", ") });
  }
  verifyRef.current = verificar;
  function puebloPairedBy(slug) { const k = Object.keys(pairs).find((kk) => pairs[kk] === slug); return k === undefined ? null : Number(k); }
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", height: "100%", width: "100%", paddingTop: 14 }}>
      <div style={{ textAlign: "center", pointerEvents: "none" }}>
        <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 22, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>Une la vestimenta con su pueblo</div>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", minHeight: 0 }}>
      <div ref={wrapRef} style={{ position: "relative", display: "flex", alignItems: "center", gap: 40, justifyContent: "center" }}>
        {/* Líneas de enlace traje ↔ pueblo (por encima del gap, nunca sobre las tarjetas) */}
        {anchors && (
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }}>
            {Object.keys(pairs).map((k) => {
              const ti = Number(k), slug = pairs[k], a = anchors.trajes[ti], b = anchors.pueblos[slug];
              if (!a || !b) return null;
              const okPair = verified && slug === trajes[ti].slug;
              const color = verified ? (okPair ? "#2ecc8f" : "#ff6b6b") : L5_PAIR_COLORS[ti].dot;
              const cx = (b.x - a.x) * 0.5;
              const d = `M ${a.x} ${a.y} C ${a.x + cx} ${a.y} ${b.x - cx} ${b.y} ${b.x} ${b.y}`;
              return (
                <g key={k}>
                  <path d={d} stroke="rgba(0,0,0,0.30)" strokeWidth={8} fill="none" strokeLinecap="round" />
                  <path d={d} stroke={color} strokeWidth={5} fill="none" strokeLinecap="round" />
                  <circle cx={a.x} cy={a.y} r={5.5} fill={color} stroke="#fff" strokeWidth={2} />
                  <circle cx={b.x} cy={b.y} r={5.5} fill={color} stroke="#fff" strokeWidth={2} />
                </g>
              );
            })}
          </svg>
        )}
        {/* Izquierda: VESTIMENTAS (fotos reales del traje) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {trajes.map((t, i) => {
            const pal = L5_PAIR_COLORS[i], paired = pairs[i] !== undefined, selected = sel === i;
            const correct = verified && pairs[i] === t.slug, wrong = verified && !correct;
            let border = paired ? pal.dot : "#f2c260";
            if (verified) border = correct ? "#2ecc8f" : "#ff6b6b";
            return (
              <button key={i} ref={(el) => { trajeRefs.current[i] = el; }} onClick={() => tapTraje(i)} disabled={verified}
                style={{ position: "relative", width: 116, height: 116, borderRadius: 16, border: `3px solid ${border}`, background: "#fff", cursor: verified ? "default" : "pointer", padding: 0, overflow: "hidden", boxShadow: selected ? `0 0 0 3px ${pal.ring}, 0 6px 14px rgba(0,0,0,0.35)` : "inset 0 1px 0 rgba(255,255,255,0.7), 0 5px 12px rgba(0,0,0,0.28)", transform: selected ? "scale(1.04)" : "none", transition: "transform 0.12s ease" }}>
                <img src={`assets/l5-pueblo-${t.slug}.jpg`} alt="" draggable="false" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                {paired && <span style={{ position: "absolute", top: -9, left: -9, width: 24, height: 24, borderRadius: "50%", background: pal.dot, color: "#fff", fontFamily: "var(--ed-font-ui)", fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.4)" }}>{i + 1}</span>}
                {verified && <span style={{ position: "absolute", top: -9, right: -9, fontSize: 15, fontWeight: 900, color: correct ? "#1f8a54" : "#c0392b", background: "#fff", borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.35)" }}>{correct ? "✓" : "✗"}</span>}
                {wrong && <span style={{ position: "absolute", bottom: -11, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap", background: "linear-gradient(180deg,#ffe6a1,#f1c153)", border: "2px solid #e0a72c", borderRadius: 999, padding: "1px 9px", fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 10, color: "#5a3d0a", boxShadow: "0 3px 8px rgba(0,0,0,0.35)" }}>{t.pueblo}</span>}
              </button>
            );
          })}
        </div>
        {/* Derecha: PUEBLO (nombre + provincia como etiqueta del libro) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {nombres.map((p) => {
            const by = puebloPairedBy(p.slug), pal = by === null ? null : L5_PAIR_COLORS[by], canTap = sel !== null && !verified;
            let border = pal ? pal.dot : "#f2c260", bg = pal ? pal.bg : "linear-gradient(180deg, #fff8e6, #f7e3a8)", col = pal ? pal.ink : "#3a2608";
            return (
              <button key={p.slug} ref={(el) => { puebloRefs.current[p.slug] = el; }} onClick={() => tapPueblo(p.slug)} disabled={verified || sel === null}
                style={{ position: "relative", width: 200, height: 116, borderRadius: 16, border: `3px solid ${border}`, background: bg, cursor: canTap ? "pointer" : "default", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, boxShadow: canTap ? "inset 0 1px 0 rgba(255,255,255,0.7), 0 5px 12px rgba(0,0,0,0.28), 0 0 0 2px rgba(242,194,96,0.55)" : "inset 0 1px 0 rgba(255,255,255,0.7), 0 5px 12px rgba(0,0,0,0.28)" }}>
                <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 18, color: col }}>{p.pueblo}</span>
                <span style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 11, color: col, opacity: 0.82 }}>{l5Prov(p.prov).e} {l5Prov(p.prov).t}</span>
                {by !== null && <span style={{ position: "absolute", top: -9, left: -9, width: 24, height: 24, borderRadius: "50%", background: pal.dot, color: "#fff", fontFamily: "var(--ed-font-ui)", fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.4)" }}>{by + 1}</span>}
              </button>
            );
          })}
        </div>
      </div>
      </div>
    </div>
  );
}

function InterandinaGame({ app, setApp, go }) {
  const char = CHARACTERS.find((c) => c.id === app.character) || CHARACTERS[0];
  const catLabel = app.currentCatLabel || "Región Interandina";
  const TOTAL = 3;
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
    const showFbAt = isCorrect ? 0 : (round === 1 ? 2300 : 1800);
    const advanceAt = showFbAt + (isCorrect ? 1150 : 1000);
    setTimeout(() => { setFeedback(isCorrect ? "ok" : "err"); setFeedbackMsg(isCorrect ? "+1 ⭐" : L3_ANIMOS[round % L3_ANIMOS.length]); }, showFbAt);
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
            {round === 0 ? "Toca su provincia." : round === 1 ? (<>Ordena de<br />norte a sur.</>) : (<>Une el traje<br />con su pueblo.</>)}
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
        {round === 0 && <PR1Provincia key={`p1-${rk}`} onSolve={onSolve} />}
        {round === 1 && <PR2OrdenNS key={`p2-${rk}`} onSolve={onSolve} verifyRef={verifyRef} />}
        {round === 2 && <PR3Empareja key={`p3-${rk}`} onSolve={onSolve} verifyRef={verifyRef} />}
      </div>

      <div style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 12, width: 150 }}>
        {(round === 1 || round === 2) && !busy && (
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

function TemaPills({ temas, active, onSwitch }) {
  return (
    <div data-qa="hud-temas" style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 20, display: "flex", alignItems: "center", gap: 6 }}>
      {temas.map((t, i) => {
        const on = t.id === active;
        const g = (typeof GRAD_POS !== "undefined" && GRAD_POS[i]) || { grad: "linear-gradient(180deg, #ffe08a, #e0a92a)", ink: "#3a2608" };
        return (
          <button key={t.id} onClick={() => onSwitch(t)} title={on ? "Tema actual" : `Cambiar a "${t.label}"`}
            style={{ padding: "5px 12px", borderRadius: 999, background: on ? g.grad : "rgba(0,0,0,0.35)", color: on ? g.ink : "rgba(252,233,168,0.85)", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 11, letterSpacing: "0.02em", border: on ? "1px solid rgba(255,255,255,0.55)" : "1px solid rgba(242,194,96,0.35)", boxShadow: on ? "inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -2px 0 rgba(0,0,0,0.18), 0 0 12px rgba(255,255,255,0.18)" : "none", cursor: on ? "default" : "pointer", transition: "all 0.18s ease", whiteSpace: "nowrap" }}>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function SwitchTemaModal({ tema, onCancel, onConfirm }) {
  return (
    <PortalToBody>
      <div onClick={onCancel} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.62)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "ed-pop-in 0.18s", padding: 16 }}>
        <div onClick={(e) => e.stopPropagation()} className="ed-card" style={{ padding: 24, maxWidth: 460, textAlign: "center", boxShadow: "var(--ed-shadow-card), 0 0 40px rgba(148,120,255,0.3)" }}>
          <div className="ed-label" style={{ color: "#a78bfa", marginBottom: 6 }}>Cambiar de tema</div>
          <h2 className="ed-h1" style={{ fontSize: 22, lineHeight: 1.15, marginBottom: 8 }}>¿Ir a “{tema.label}”?</h2>
          <p className="ed-body" style={{ marginBottom: 16, fontSize: 14 }}>Vas a perder el progreso de esta ronda. No habrá reporte de esta sesión.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <button className="ed-btn ed-btn-ghost" onClick={onCancel} style={{ height: 44, fontWeight: 800, letterSpacing: "0.04em" }}>SEGUIR JUGANDO</button>
            <button className="ed-btn ed-btn-primary" onClick={onConfirm} style={{ height: 44, fontWeight: 800, letterSpacing: "0.04em" }}>SÍ, CAMBIAR</button>
          </div>
        </div>
      </div>
    </PortalToBody>
  );
}

// ═══════════════ Despachador ═══════════════
// Despacha por app.currentCategory. Los pills (arriba) saltan entre los temas del libro
// con modal de confirmación. Al implementar un tema nuevo: mapear su componente en `pick`.
function GameScreen({ app, setApp, go }) {
  const libro = typeof LIBROS !== "undefined" ? LIBROS.find((l) => l.id === app.libro) : null;
  const pick = { "l2-t1": ReconoceGame, "l3-t1": VentanasGame, "l3-t2": TerritorioGame, "l3-t3": ViajeGame, "l5-t1": InterandinaGame };
  const Game = pick[app.currentCategory] || PlaceholderGame;
  const [pendingTema, setPendingTema] = useStateG(null);
  function requestSwitch(t) { if (!libro || t.id === app.currentCategory) return; setPendingTema(t); }
  function confirmSwitch() {
    if (!pendingTema) return;
    setApp((s) => ({ ...s, currentCategory: pendingTema.id, currentCatLabel: `${libro.label} · ${pendingTema.label}` }));
    setPendingTema(null);
  }
  return (
    <React.Fragment>
      {libro && libro.temas.length > 1 && <TemaPills temas={libro.temas} active={app.currentCategory} onSwitch={requestSwitch} />}
      <Game key={app.currentCategory} app={app} setApp={setApp} go={go} />
      {pendingTema && <SwitchTemaModal tema={pendingTema} onCancel={() => setPendingTema(null)} onConfirm={confirmSwitch} />}
    </React.Fragment>
  );
}

Object.assign(window, { GameScreen, ResultsScreen });
