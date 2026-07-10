// game-screens.jsx — JUEGO-1 · "Memoria de la familia" (Estudios Sociales · La familia · 6 años).
// Mecánica MEMORIA: cartas boca abajo. El niño voltea 2; una pareja = la FOTO de un
// miembro + la carta con su NOMBRE (ej. 👶 + "Bebé"). Si emparejan, quedan; si no,
// se voltean de nuevo. 1 sola ronda de 4 pares (banco de 8 miembros). Enseña a reconocer
// y leer a los miembros de la familia (TEMA 1, CS.2.1.1).
//
// CONTRATO: GameScreen/ResultsScreen({app,setApp,go}) en window; markFirstAttempt()
// en la 1ª volteada; incrementGamesCompleted() al terminar. Salir/reiniciar con modal.
// Fotos en assets/<id>.png (fondo transparente).

const { useState: useStateG, useEffect: useEffectG, useRef: useRefG } = React;

function PortalToBody({ children }) {
  return ReactDOM.createPortal(children, document.body);
}

const CAT_LABEL = "La familia";
const ROUNDS = 1;           // una sola ronda (edad 6)
const PAIRS = 4;            // parejas de la ronda (8 cartas)

const FAMILIA = [
  { id: "abuela",  t: "Abuela"  },
  { id: "abuelo",  t: "Abuelo"  },
  { id: "mama",    t: "Mamá"    },
  { id: "papa",    t: "Papá"    },
  { id: "hermana", t: "Hermana" },
  { id: "hermano", t: "Hermano" },
  { id: "bebe",    t: "Bebé"    },
  { id: "tio",     t: "Tío"     },
];

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function has(arr, id) { return arr.some((m) => m.id === id); }
function bothPT(arr) { return has(arr, "papa") && has(arr, "tio"); } // Papá + Tío juntos = confuso

// Anti-repetición: recuerda los miembros de la última ronda para que al RECARGAR/REINICIAR
// salgan OTROS (con banco de 8 y ronda de 4, la siguiente usa casi siempre los 4 restantes).
const RECENT_KEY = "edinun_juego1_familia_recientes_v1";
const RECENT_CAP = 4;
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

// 1 sola ronda: 4 miembros del banco de 8, prefiriendo los NO vistos recientemente.
// Regla: Papá y Tío NUNCA en la misma ronda (se parecen y confunden).
function buildRounds() {
  const recent = readRecent();
  const fresh = shuffle(FAMILIA.filter((m) => recent.indexOf(m.id) === -1));
  const stale = shuffle(FAMILIA.filter((m) => recent.indexOf(m.id) !== -1));
  const ordered = fresh.concat(stale);   // frescos primero, azar dentro de cada grupo
  const r = [];
  for (const m of ordered) {
    if (r.length >= 4) break;
    if ((m.id === "tio" && has(r, "papa")) || (m.id === "papa" && has(r, "tio"))) continue; // no Papá+Tío
    r.push(m);
  }
  if (r.length < 4) for (const m of ordered) { if (r.length >= 4) break; if (!has(r, m.id)) r.push(m); }
  writeRecent(r.map((m) => m.id));
  return [r];
}

// Baraja de una ronda: por cada miembro, una carta FOTO y una carta NOMBRE.
function buildDeck(members) {
  const cards = [];
  members.forEach((m) => {
    cards.push({ key: m.id + "-p", id: m.id, t: m.t, type: "photo" });
    cards.push({ key: m.id + "-n", id: m.id, t: m.t, type: "name" });
  });
  return shuffle(cards);
}

function GameScreen({ app, setApp, go }) {
  const char = CHARACTERS.find((c) => c.id === app.character) || CHARACTERS[0];

  const roundsRef = useRefG(null);
  if (!roundsRef.current) roundsRef.current = buildRounds();
  const rounds = roundsRef.current;

  const [deck, setDeck] = useStateG(() => buildDeck(rounds[0]));
  const [flipped, setFlipped] = useStateG([]);   // índices volteados (0..2)
  const [matched, setMatched] = useStateG({});   // { cardKey: true } (para render)
  const [stars, setStars] = useStateG(0);
  const [elapsed, setElapsed] = useStateG(0);
  const [banner, setBanner] = useStateG(null);      // "ok" | "err" (estándar EDINUN)
  const [bannerMsg, setBannerMsg] = useStateG("");   // pastilla: "+N ⭐" o frase de ánimo
  const [confirmingExit, setConfirmingExit] = useStateG(false);
  const [confirmingRestart, setConfirmingRestart] = useStateG(false);

  const started = useRefG(Date.now());
  const firstDone = useRefG(false);
  const lock = useRefG(false);
  const matchedRef = useRefG({});
  const logRef = useRefG([]);
  const attemptsRef = useRefG(0);

  useEffectG(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - started.current) / 1000)), 500);
    return () => clearInterval(id);
  }, []);

  function fmt(s) { const m = Math.floor(s / 60), ss = s % 60; return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`; }

  // Bocadillo ESTÁTICO = CÓMO se juega (instrucción corta, en 2 renglones, sin emojis).
  function bubbleText() {
    return (<>Voltea dos cartas y<br />busca la pareja.</>);
  }

  function tapCard(i) {
    if (lock.current) return;
    const card = deck[i];
    if (matchedRef.current[card.key]) return;
    if (flipped.includes(i)) return;
    if (!firstDone.current) { firstDone.current = true; if (typeof markFirstAttempt === "function") markFirstAttempt(); }

    const nf = [...flipped, i];
    setFlipped(nf);

    if (nf.length < 2) return;

    lock.current = true;
    attemptsRef.current += 1;
    const ca = deck[nf[0]], cb = deck[nf[1]];

    if (ca.id === cb.id) {
      setTimeout(() => {
        matchedRef.current[ca.key] = true;
        matchedRef.current[cb.key] = true;
        setMatched({ ...matchedRef.current });
        setFlipped([]);
        lock.current = false;
        setStars((s) => s + 1);
        setApp((s) => ({ ...s, stars: (s.stars || 0) + 1 }));
        const m = FAMILIA.find((x) => x.id === ca.id);
        logRef.current.push({ idx: logRef.current.length + 1, emoji: "👪", a: "Pareja encontrada", userAnswer: m.t, correctAnswer: m.t, isCorrect: true });
        if (Object.keys(matchedRef.current).length >= PAIRS * 2) finishRound();
      }, 480);
    } else {
      setTimeout(() => { setFlipped([]); lock.current = false; }, 980);
    }
  }

  function finishRound() {
    lock.current = true;
    const pairs = logRef.current.length;
    setBanner("ok"); setBannerMsg(`+${pairs} ⭐`);
    setTimeout(() => {
      setBanner(null); setBannerMsg("");
      const acc = attemptsRef.current > 0 ? Math.round((pairs / attemptsRef.current) * 100) : 100;
      setApp((s) => ({
        ...s,
        lastResult: {
          category: CAT_LABEL, solved: pairs, total: ROUNDS * PAIRS,
          time: Math.floor((Date.now() - started.current) / 1000),
          starsEarned: pairs, accuracy: acc, attempts: attemptsRef.current, log: logRef.current.slice(),
        },
      }));
      if (typeof incrementGamesCompleted === "function") incrementGamesCompleted();
      go("results");
    }, 1150);
  }

  function confirmRestart() {
    setConfirmingRestart(false);
    lock.current = false; firstDone.current = false;
    matchedRef.current = {}; logRef.current = []; attemptsRef.current = 0;
    roundsRef.current = buildRounds();
    setMatched({}); setFlipped([]); setStars(0);
    setDeck(buildDeck(roundsRef.current[0]));
    started.current = Date.now();
  }

  const matchedCount = Object.keys(matched).length / 2; // parejas resueltas (0..PAIRS)

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* ── HUD ── */}
      <div style={{ position: "absolute", top: 10, left: 16, right: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <EdinunLogoMini size={60} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.35)", borderRadius: 999, padding: "6px 12px", border: "1px solid rgba(242,194,96,0.4)", fontFamily: "var(--ed-font-mono)", fontSize: 13, color: "#fce9a8" }}>⏱ {fmt(elapsed)}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.35)", borderRadius: 999, padding: "6px 12px", border: "1px solid rgba(242,194,96,0.4)", fontFamily: "var(--ed-font-display)", fontWeight: 600, color: "#fce9a8" }}>⭐ {stars}</div>
        </div>
      </div>

      {/* ── PAREJAS (arriba y centrado, en el lugar donde antes iba "Ronda") ── */}
      <div style={{ position: "absolute", top: 46, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 9 }}>
        <span className="ed-label" style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, letterSpacing: "0.06em" }}>Parejas</span>
        {Array.from({ length: PAIRS }).map((_, i) => (
          <div key={i} style={{ width: 13, height: 13, borderRadius: "50%", background: i < matchedCount ? "#fce9a8" : "rgba(255,255,255,0.22)", boxShadow: i < matchedCount ? "0 0 8px #f2c260" : "none", transition: "all 0.2s" }} />
        ))}
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 13, color: "#fce9a8", marginLeft: 2 }}>{matchedCount}/{PAIRS}</span>
      </div>

      {/* ── Personaje guía + bocadillo ── */}
      <div style={{ position: "absolute", left: 8, bottom: 78, width: 220, pointerEvents: "none", textAlign: "center" }}>
        <div className="ed-float-soft" style={{ position: "absolute", left: 0, right: 0, bottom: "100%", display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative", display: "inline-block", maxWidth: 210, background: "linear-gradient(180deg, rgba(20,12,55,0.95), rgba(10,6,35,0.95))", border: "1.5px solid rgba(242,194,96,0.65)", borderRadius: 16, padding: "10px 14px", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 14, lineHeight: 1.3, color: "#fce9a8", textAlign: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}>
            {bubbleText()}
            <div style={{ position: "absolute", bottom: -10, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "9px solid transparent", borderRight: "9px solid transparent", borderTop: "10px solid rgba(20,12,55,0.95)", filter: "drop-shadow(0 1px 0 rgba(242,194,96,0.55))" }} />
          </div>
        </div>
        <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
          <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", width: 140, height: 16, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(242,194,96,0.45), transparent 70%)", filter: "blur(5px)" }} />
          <char.Component size={186} floating />
        </div>
        <div style={{ marginTop: -2, fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 14, color: "#fce9a8", letterSpacing: "0.04em", textShadow: "0 2px 6px rgba(0,0,0,0.6)" }}>{char.name}</div>
      </div>

      {/* ── Centro: tablero de memoria ── */}
      <div style={{ position: "absolute", top: 64, left: 236, right: 160, bottom: 12, display: "flex", flexDirection: "column", justifyContent: "space-evenly", alignItems: "center" }}>
        {/* Enunciado = QUÉ hacer (el objetivo) */}
        <div style={{ textAlign: "center", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 19, color: "#fff", textShadow: "0 2px 6px rgba(0,0,0,0.55)", pointerEvents: "none" }}>
          Encuentra las 4 parejas de la familia.
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, justifyItems: "center" }}>
          {deck.map((card, i) => {
            const isMatched = !!matched[card.key];
            const isUp = isMatched || flipped.includes(i);
            return (
              <button
                key={card.key}
                onClick={() => tapCard(i)}
                style={{
                  width: 112, height: 132, borderRadius: 16, cursor: isUp ? "default" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", padding: 6,
                  border: `3px solid ${isMatched ? "#2ecc8f" : (isUp ? "rgba(242,194,96,0.7)" : "rgba(242,194,96,0.5)")}`,
                  background: isUp
                    ? (isMatched ? "linear-gradient(180deg,#c9f6df,#8fe3bd)" : "linear-gradient(180deg,#fff8e6,#f7e3a8)")
                    : "linear-gradient(160deg,#7b52e0,#3a1f8c)",
                  boxShadow: isMatched ? "0 0 20px rgba(46,204,143,0.5), inset 0 1px 0 rgba(255,255,255,0.7)" : "inset 0 1px 0 rgba(255,255,255,0.35), 0 6px 14px rgba(0,0,0,0.35)",
                  transition: "all 0.15s ease",
                }}
              >
                {isUp ? (
                  card.type === "photo" ? (
                    <img src={`assets/${card.id}.png`} alt="" draggable="false" style={{ width: 92, height: 112, objectFit: "contain", pointerEvents: "none", filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.25))" }} />
                  ) : (
                    <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 22, color: "#3a2608" }}>{card.t}</span>
                  )
                ) : (
                  <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 62, height: 62 }}>
                    <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle, rgba(252,233,168,0.30), transparent 68%)" }} />
                    <span style={{
                      position: "relative",
                      fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 50, lineHeight: 1,
                      background: "linear-gradient(180deg, #fef3cf, #f2c260)",
                      WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent",
                      filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.45))",
                    }}>?</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Acciones ── */}
      <div style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 12, width: 150 }}>
        <button className="ed-btn ed-btn-restart" onClick={() => setConfirmingRestart(true)} style={{ fontSize: 15, height: 56, fontWeight: 800, letterSpacing: "0.04em" }}>REINICIAR</button>
        <button className="ed-btn ed-btn-ghost" onClick={() => setConfirmingExit(true)} style={{ fontSize: 15, height: 56, fontWeight: 800, letterSpacing: "0.04em" }}>SALIR</button>
      </div>

      {/* ── Overlay de feedback (estándar EDINUN: ¡EXCELENTE!/¡UPS!) ── */}
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
              <p className="ed-body" style={{ marginBottom: 16, fontSize: 14 }}>Vas a perder esta ronda.</p>
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
              <p className="ed-body" style={{ marginBottom: 16, fontSize: 14 }}>Vas a jugar con otras caritas.</p>
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
// RESULTS — reporte académico imprimible.
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
  thC: { textAlign: "center" }, thR: { textAlign: "right" },
  tr: { borderBottom: "1px solid #ccc" },
  td: { padding: "9px 8px", fontFamily: "'Nunito',sans-serif" },
  tdNum: { color: "#888", width: 36, fontFamily: "ui-monospace,Consolas,monospace" },
  tdOk: { color: "#1e8a5d", textAlign: "center", fontWeight: 700 },
  summary: { marginTop: 16, borderTop: "2px solid #d9a441", paddingTop: 12, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 },
  cell: { padding: 10, borderRadius: 6, border: "1px solid #ddd", textAlign: "center" },
  cellEmp: { background: "#faf3df", borderColor: "#d9a441" },
  cellL: { fontSize: "8pt", textTransform: "uppercase", letterSpacing: "0.08em", color: "#666" },
  cellV: { fontSize: "18pt", fontWeight: 800, marginTop: 4 },
  foot: { marginTop: 16, fontSize: "9pt", color: "#888", textAlign: "center" },
};

function PrintableReport({ studentName, res, dateStr, mm, ss, pairs, attempts, accuracy }) {
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
              <th style={printStyles.th}>Pareja</th>
              <th style={{ ...printStyles.th, ...printStyles.thC }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {log.map((e) => (
              <tr key={e.idx} style={printStyles.tr}>
                <td style={{ ...printStyles.td, ...printStyles.tdNum }}>{e.idx}</td>
                <td style={{ ...printStyles.td, fontWeight: 700 }}>{e.emoji} {e.correctAnswer}</td>
                <td style={{ ...printStyles.td, ...printStyles.tdOk }}>Encontrada</td>
              </tr>
            ))}
            {log.length === 0 && (<tr><td colSpan={3} style={{ padding: 24, textAlign: "center", color: "#888", fontStyle: "italic" }}>Sin parejas.</td></tr>)}
          </tbody>
        </table>
        <div style={printStyles.summary}>
          <div style={printStyles.cell}><div style={printStyles.cellL}>Parejas</div><div style={printStyles.cellV}>{pairs} / {res.total}</div></div>
          <div style={printStyles.cell}><div style={printStyles.cellL}>Intentos</div><div style={printStyles.cellV}>{attempts}</div></div>
          <div style={printStyles.cell}><div style={printStyles.cellL}>Estrellas</div><div style={printStyles.cellV}>{res.starsEarned}</div></div>
          <div style={{ ...printStyles.cell, ...printStyles.cellEmp }}><div style={printStyles.cellL}>Puntería</div><div style={printStyles.cellV}>{accuracy}%</div></div>
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
  const res = app.lastResult || { category: CAT_LABEL, solved: 0, total: ROUNDS * PAIRS, time: 0, starsEarned: 0, accuracy: 0, log: [] };
  const mm = Math.floor(res.time / 60), ss = res.time % 60;
  const pairs = (res.log || []).length;
  const attempts = res.attempts != null ? res.attempts : pairs;
  const accuracy = res.accuracy != null ? res.accuracy : (attempts > 0 ? Math.round((pairs / attempts) * 100) : 0);
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
            "{app.studentName || "Campeón"}, encontraste a toda la familia."
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
            <ReportField label="Tiempo" value={`${String(mm).padStart(2,"0")}:${String(ss).padStart(2,"0")}`} />
          </div>

          <div style={{ flex: 1, minHeight: 0, overflow: "auto", marginBottom: 10 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--ed-font-ui)", fontSize: 12 }}>
              <thead>
                <tr style={{ fontWeight: 700, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ed-ink-dim)", borderBottom: "1px solid rgba(148,120,255,0.3)" }}>
                  <th style={{ textAlign: "left", padding: "6px 8px", width: 30 }}>#</th>
                  <th style={{ textAlign: "left", padding: "6px 8px" }}>Pareja</th>
                  <th style={{ textAlign: "center", padding: "6px 8px" }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {(res.log || []).map((e) => (
                  <tr key={e.idx} style={{ borderBottom: "1px solid rgba(148,120,255,0.18)" }}>
                    <td style={{ padding: "7px 8px", color: "var(--ed-ink-soft)" }}>{e.idx}</td>
                    <td style={{ padding: "7px 8px", fontWeight: 600 }}>{e.emoji} {e.correctAnswer}</td>
                    <td style={{ padding: "7px 8px", textAlign: "center", fontFamily: "var(--ed-font-display)", fontWeight: 700, color: "#2ecc8f" }}>✓</td>
                  </tr>
                ))}
                {(res.log || []).length === 0 && (<tr><td colSpan={3} style={{ padding: "16px 8px", textAlign: "center", color: "var(--ed-ink-soft)", fontStyle: "italic" }}>Sin parejas.</td></tr>)}
              </tbody>
            </table>
          </div>

          <div style={{ borderTop: "2px solid rgba(242,194,96,0.45)", paddingTop: 10, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, fontFamily: "var(--ed-font-ui)", fontSize: 11 }}>
            <SummaryCell label="Parejas" value={`${pairs} / ${res.total}`} />
            <SummaryCell label="Intentos" value={`${attempts}`} tone="#4fd8ff" />
            <SummaryCell label="Estrellas" value={`${res.starsEarned}`} tone="#fce9a8" />
            <SummaryCell label="Puntería" value={`${accuracy}%`} tone="#fce9a8" emphasis />
          </div>

          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button className="ed-btn ed-btn-ghost" onClick={() => window.print()} style={{ padding: "0 10px", fontSize: 13, height: 44, fontWeight: 800, letterSpacing: "0.04em" }}>IMPRIMIR REPORTE</button>
            <button className="ed-btn ed-btn-primary" onClick={() => go("game")} style={{ padding: "0 10px", fontSize: 13, height: 44, fontWeight: 800, letterSpacing: "0.04em" }}>JUGAR OTRA VEZ</button>
          </div>
        </div>
      </div>

      <PrintableReport studentName={app.studentName} res={res} dateStr={dateStr} mm={mm} ss={ss} pairs={pairs} attempts={attempts} accuracy={accuracy} />
    </div>
  );
}

Object.assign(window, { GameScreen, ResultsScreen });
