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
    { t: "Provincia", nivel: "1ª · más grande" }, { t: "Cantón", nivel: "2º" }, { t: "Parroquia", nivel: "3ª · más pequeña" },
  ] },
  { id: "gobiernos", label: "Gobiernos seccionales autónomos", cards: [
    { t: "Consejo Provincial", nivel: "Provincia" }, { t: "Consejo Municipal", nivel: "Cantón" }, { t: "Junta Parroquial", nivel: "Parroquia" },
  ] },
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
  const correct = l3Shuffle(L3T2_PROVINCIAS[target]).slice(0, 3);
  const others = l3Shuffle(L3T2_REG_IDS.filter((r) => r !== target).flatMap((r) => L3T2_PROVINCIAS[r])).slice(0, 3);
  const shown = l3Shuffle(correct.map((n) => ({ name: n, ok: true })).concat(others.map((n) => ({ name: n, ok: false }))));
  return { target, shown };
}

// ── R1: ¿de qué región es? (tocar 1 de 4 + destapar imagen) ──
function R1Region({ onSolve }) {
  const item = useRefG(l3t2PickItem()).current;
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
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, height: "100%", width: "100%" }}>
      <div style={{ pointerEvents: "none", display: "flex", alignItems: "baseline", gap: 9, justifyContent: "center", flexWrap: "wrap", maxWidth: 480, textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 22, color: "rgba(255,255,255,0.9)" }}>¿De qué región {verbo}</span>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 28, color: "#fce9a8" }}>{frase}?</span>
      </div>
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
              style={{ width: 104, height: 94, borderRadius: 16, border: `3px solid ${border}`, background: bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, cursor: answered ? "default" : "pointer", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7), 0 6px 14px rgba(0,0,0,0.3)" }}>
              <span style={{ fontSize: 38, lineHeight: 1 }}>{rg.e}</span>
              <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 13, color: col }}>{rg.t}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── R2: ordena de mayor a menor (ARRASTRAR VERTICAL; rota entre los 3 regímenes) ──
// El ¡VERIFICAR! vive en la columna de acciones (TerritorioGame) → aquí se expone
// `verificar` vía verifyRef. Al verificar: ✓ verde en su sitio, ✗ rojo si está mal, y
// al fallar se reordena al correcto (revela).
function R2Orden({ onSolve, verifyRef }) {
  const regimen = useRefG(l3t2PickRegimen()).current;
  const [order, setOrder] = useStateG(() => { let o = l3Shuffle([0, 1, 2]); if (o[0] === 0 && o[1] === 1 && o[2] === 2) o = [o[1], o[0], o[2]]; return o; });
  const [verified, setVerified] = useStateG(false);
  const [dragPos, setDragPos] = useStateG(null);
  const [dxy, setDxy] = useStateG({ x: 0, y: 0 });
  const colRef = useRefG(null), startRef = useRefG({ x: 0, y: 0 });
  function down(e, pos) { if (verified) return; startRef.current = { x: e.clientX, y: e.clientY }; setDragPos(pos); setDxy({ x: 0, y: 0 }); try { e.currentTarget.setPointerCapture(e.pointerId); } catch (er) {} }
  function move(e) { if (dragPos === null) return; setDxy({ x: e.clientX - startRef.current.x, y: e.clientY - startRef.current.y }); }
  function up(e) {
    if (dragPos === null) return;
    let target = dragPos; const col = colRef.current;
    if (col) { const cy = [...col.querySelectorAll("[data-slot]")].map((s) => { const r = s.getBoundingClientRect(); return r.top + r.height / 2; }); target = 0; for (let i = 0; i < cy.length; i++) if (e.clientY > cy[i] - 1) target = i; }
    if (target !== dragPos) setOrder((prev) => { const a = prev.slice(); const [m] = a.splice(dragPos, 1); a.splice(target, 0, m); return a; });
    setDragPos(null); setDxy({ x: 0, y: 0 });
  }
  function verificar() {
    if (verified) return;
    const isCorrect = order[0] === 0 && order[1] === 1 && order[2] === 2;
    setVerified(true);
    if (!isCorrect) setTimeout(() => setOrder([0, 1, 2]), 650); // revela el orden correcto
    onSolve(isCorrect, { emoji: "🗂️", a: `Ordena: ${regimen.label}`, userAnswer: order.map((i) => regimen.cards[i].t).join(" › "), correctAnswer: regimen.cards.map((c) => c.t).join(" › ") });
  }
  verifyRef.current = verificar;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22, height: "100%", width: "100%" }}>
      <div style={{ textAlign: "center", pointerEvents: "none" }}>
        <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 21, color: "#fff", textShadow: "0 2px 6px rgba(0,0,0,0.55)" }}>Ordena de lo más grande a lo más pequeño</div>
        <div className="ed-label" style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, marginTop: 3 }}>{regimen.label}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
        <div className="ed-label" style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>⬆ más grande</div>
        <div ref={colRef} style={{ display: "flex", flexDirection: "column", gap: 9, touchAction: "none" }}>
          {order.map((cardIdx, pos) => {
            const c = regimen.cards[cardIdx], dragging = dragPos === pos, okPos = verified && order[pos] === pos;
            let border = "#f2c260", bg = "linear-gradient(180deg, #fff8e6, #f7e3a8)";
            if (verified) { border = okPos ? "#2ecc8f" : "#ff6b6b"; bg = okPos ? "linear-gradient(180deg, rgba(72,224,154,0.95), rgba(26,143,95,0.92))" : "linear-gradient(180deg, rgba(255,139,139,0.92), rgba(178,47,47,0.9))"; }
            const inkMain = verified ? (okPos ? "#06381f" : "#fff") : "#3a2608";
            return (
              <div key={cardIdx} data-slot onPointerDown={(e) => down(e, pos)} onPointerMove={move} onPointerUp={up}
                style={{ position: "relative", width: 300, height: 66, borderRadius: 14, border: `3px solid ${border}`, background: bg, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: verified ? "default" : "grab", touchAction: "none", userSelect: "none", boxShadow: dragging ? "0 16px 30px rgba(0,0,0,0.5)" : "inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -3px 0 rgba(0,0,0,0.12), 0 6px 14px rgba(0,0,0,0.3)", transform: dragging ? `translate(${dxy.x}px, ${dxy.y}px) scale(1.04)` : "none", transition: dragging ? "none" : "transform 0.2s ease", zIndex: dragging ? 50 : 1 }}>
                <span style={{ fontSize: verified ? 24 : 18, fontWeight: 900, color: verified ? inkMain : "#c39a3e", width: 26, textAlign: "center" }}>{verified ? (okPos ? "✓" : "✗") : "⠿"}</span>
                <div style={{ textAlign: "center", lineHeight: 1.05 }}>
                  <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 16, color: inkMain }}>{c.t}</div>
                  <div style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 11, color: verified ? (okPos ? "rgba(6,56,31,0.75)" : "rgba(255,255,255,0.85)") : "#8a5a1a" }}>{c.nivel}</div>
                </div>
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
  const built = useRefG(l3t2BuildR3()).current, R = L3T2_REGIONES[built.target];
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
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22, height: "100%", width: "100%" }}>
      <div style={{ textAlign: "center", pointerEvents: "none" }}>
        <div className="ed-label" style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, marginBottom: 3 }}>Toca las provincias que sí son de la</div>
        <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 24, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>{R.e} Región {R.t}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, width: "100%", maxWidth: 470 }}>
        {built.shown.map((p) => {
          const sel = !!selected[p.name];
          let border = sel ? "#4fa0ff" : "rgba(242,194,96,0.7)", bg = sel ? "linear-gradient(180deg, #dcecff, #a9d0ff)" : "linear-gradient(180deg, #fff8e6, #f7e3a8)", col = "#3a2608", mark = sel ? "●" : "○", markCol = sel ? "#2773d8" : "rgba(58,38,8,0.35)";
          if (verified) {
            if (p.ok) { border = "#2ecc8f"; bg = "linear-gradient(180deg, rgba(72,224,154,0.95), rgba(26,143,95,0.92))"; col = "#06381f"; mark = "✓"; markCol = "#06381f"; }
            else if (sel) { border = "#ff6b6b"; bg = "linear-gradient(180deg, rgba(255,139,139,0.92), rgba(178,47,47,0.9))"; col = "#fff"; mark = "✗"; markCol = "#fff"; }
            else { bg = "linear-gradient(180deg, rgba(255,248,230,0.35), rgba(247,227,168,0.35))"; mark = "○"; markCol = "rgba(58,38,8,0.25)"; }
          }
          return (
            <button key={p.name} onClick={() => toggle(p.name)} disabled={verified}
              style={{ height: 60, borderRadius: 14, border: `3px solid ${border}`, background: bg, cursor: verified ? "default" : "pointer", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6), 0 5px 12px rgba(0,0,0,0.28)", padding: "0 8px", display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 7 }}>
              <span style={{ fontSize: verified ? 19 : 15, fontWeight: 900, color: markCol, flexShrink: 0, width: 20, textAlign: "center" }}>{mark}</span>
              <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 13, color: col, textAlign: "left", lineHeight: 1.05 }}>{p.name}</span>
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
    const showFbAt = isCorrect ? (round === 0 ? 800 : 0) : 1800;
    const advanceAt = showFbAt + (isCorrect ? 1250 : 1000);
    setTimeout(() => { setFeedback(isCorrect ? "ok" : "err"); setFeedbackMsg(isCorrect ? "" : L3_ANIMOS[round % L3_ANIMOS.length]); }, showFbAt);
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
          <div style={{ position: "fixed", inset: 0, zIndex: 1000, pointerEvents: "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)", animation: "ed-pop-in 0.3s" }}>
            <div style={{ fontFamily: "'Fredoka','Baloo 2',system-ui,sans-serif", fontWeight: 700, fontSize: "clamp(56px, 11vmin, 120px)", color: feedback === "ok" ? "#2ecc8f" : "#ff6b6b", textShadow: "0 4px 0 rgba(0,0,0,0.45), 0 0 60px currentColor" }}>{feedback === "ok" ? "¡EXCELENTE!" : "¡UPS!"}</div>
            {feedbackMsg && (<div style={{ fontFamily: "'Fredoka','Baloo 2',system-ui,sans-serif", fontWeight: 700, fontSize: "clamp(18px, 2.6vmin, 30px)", color: "#fff", background: "rgba(0,0,0,0.55)", padding: "8px 26px", borderRadius: 999, textShadow: "0 2px 6px rgba(0,0,0,0.6)", textAlign: "center" }}>{`${feedbackMsg} — ${char.name}`}</div>)}
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
            <button className="ed-btn ed-btn-primary" onClick={() => go("home")} style={{ padding: "0 10px", fontSize: 13, height: 44, fontWeight: 800, letterSpacing: "0.04em" }}>VOLVER A LOS LIBROS</button>
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
  const pick = { "l2-t1": ReconoceGame, "l3-t1": VentanasGame, "l3-t2": TerritorioGame };
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
