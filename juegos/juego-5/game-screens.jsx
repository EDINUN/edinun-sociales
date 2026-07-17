// game-screens.jsx — JUEGO-5 · Tema "Aprendiendo" (Estudios Sociales · 6 años).
// Mecánica "Mira y toca" con TARJETAS DE DIBUJO (patrón 5 de la biblioteca):
// sale una pregunta "¿Quién…?" del banco PERSONAS y 3 tarjetas (dibujo + nombre);
// el niño TOCA a la persona correcta directamente (no hay VERIFICAR/BORRAR).
// HUD (logo + RONDA con dots + tiempo + estrellas), personaje guía (Domi) con
// bocadillo (CÓMO), overlay "¡EXCELENTE!/¡UPS!" y reporte académico imprimible.
//
// Cada partida son ROUNDS (3, pedido de la autora) preguntas elegidas al azar,
// evitando las vistas recientemente (localStorage) → recargar NO repite.
// Los 2 distractores de cada pregunta se sortean del mismo banco (todas las
// opciones son personas, así el sorteo siempre es coherente).
//
// IMÁGENES: assets/persona-<id>.png (las genera la autora; prompts en
// .planning/juego-5-design.md). Mientras el PNG no exista, la tarjeta cae al
// emoji placeholder (onError) — se enchufan con solo copiar los archivos.
//
// CONTRATO: GameScreen/ResultsScreen({app,setApp,go}) expuestos en window;
// markFirstAttempt() en la 1ª respuesta; incrementGamesCompleted() al fin.
// Invariantes EDINUN: fallar NO baja progreso; al fallar se revela la correcta
// (verde) dejando ver lo que tocó el niño (rojo); salir/reiniciar con modal.

const { useState: useStateG, useEffect: useEffectG, useRef: useRefG } = React;

function PortalToBody({ children }) {
  return ReactDOM.createPortal(children, document.body);
}

const CAT_LABEL = "Aprendiendo";   // chip del tema (elegido por la autora)
const ROUNDS = 3;                  // 3 rondas por sesión (pedido de la autora)

// ─────────────────────────────────────────────────────────────
// Banco: 12 personas que trabajan en la escuela — 6 del libro (TEMA 3
// "Aprendiendo con mis compañeros…") + 6 aprobadas por la autora (2026-07-16).
// ⚠ NO INVENTAR ítems nuevos: para ampliar, pedir material a la autora.
// El emoji es el PLACEHOLDER de la tarjeta hasta que llegue su PNG, y el icono
// de la fila en el reporte.
// ─────────────────────────────────────────────────────────────
const PERSONAS = [
  { id: "directora",     nombre: "Directora",     emoji: "👩‍💼", pregunta: "¿Quién dirige y organiza la escuela?" },
  { id: "docente",       nombre: "Docente",       emoji: "👨‍🏫", pregunta: "¿Quién enseña a los niños y niñas en el aula?" },
  { id: "conserje",      nombre: "Conserje",      emoji: "🧹", pregunta: "¿Quién mantiene limpia la escuela?" },
  { id: "guardian",      nombre: "Guardián",      emoji: "🛡️", pregunta: "¿Quién cuida la entrada de la escuela?" },
  { id: "cocinera",      nombre: "Cocinera",      emoji: "👩‍🍳", pregunta: "¿Quién prepara los alimentos en la escuela?" },
  { id: "secretaria",    nombre: "Secretaria",    emoji: "🗂️", pregunta: "¿Quién organiza los documentos de la escuela?" },
  { id: "bibliotecario", nombre: "Bibliotecario", emoji: "📚", pregunta: "¿Quién cuida los libros de la biblioteca?" },
  { id: "inspectora",    nombre: "Inspectora",    emoji: "🔔", pregunta: "¿Quién cuida el orden en los recreos?" },
  { id: "enfermero",     nombre: "Enfermero",     emoji: "🩹", pregunta: "¿Quién te atiende cuando te sientes mal?" },
  { id: "psicologa",     nombre: "Psicóloga",     emoji: "💬", pregunta: "¿Quién te escucha y ayuda con tus emociones?" },
  { id: "chofer",        nombre: "Chofer",        emoji: "🚌", pregunta: "¿Quién te lleva a la escuela en la buseta?" },
  { id: "jardinera",     nombre: "Jardinera",     emoji: "🌻", pregunta: "¿Quién cuida las plantas del patio?" },
];

// Memoria de preguntas recientes (localStorage) para no repetir entre cargas/
// niños en el mismo navegador. FIFO de 6 = ⌊12/2⌋ → 4 partidas sin repetir.
const RECENT_KEY = "edinun_juego5_aprendiendo_recientes_v1";

function getRecent() {
  try {
    const r = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    return Array.isArray(r) ? r : [];
  } catch (e) { return []; }
}

function pushRecent(ids) {
  const prev = getRecent().filter((id) => ids.indexOf(id) === -1);
  const next = ids.concat(prev).slice(0, 6);
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch (e) {}
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

// Elige n índices del banco: primero los NO vistos recientemente (barajados),
// completando con los vistos si hiciera falta. Garantiza variación al recargar.
function pickRounds(n) {
  const recent = new Set(getRecent());
  const all = PERSONAS.map((_, i) => i);
  const fresh = shuffle(all.filter((i) => !recent.has(i)));
  const stale = shuffle(all.filter((i) => recent.has(i)));
  return fresh.concat(stale).slice(0, n);
}

// Arma las rondas de la partida: para cada persona sorteada, 2 distractores al
// azar del mismo banco y las 3 opciones barajadas (la posición de la correcta
// varía sola). Se construye UNA vez por partida para que no cambie al re-render.
function buildRounds(n) {
  return pickRounds(n).map((pi) => {
    const others = shuffle(PERSONAS.map((_, i) => i).filter((i) => i !== pi)).slice(0, 2);
    const opciones = shuffle([pi].concat(others));
    return { p: pi, opciones, correcta: opciones.indexOf(pi) };
  });
}

const ANIMOS = [
  "¡Casi! Sigue intentándolo.",
  "¡La próxima es tuya!",
  "Equivocarse también es aprender.",
  "¡Vamos a la siguiente!",
];

// Colores de borde para las fichas de opción.
const OPTION_COLORS = ["#ef5a5a", "#4fa0ff", "#2ecc8f"];

// Dibujo de la persona dentro de la tarjeta. Usa assets/persona-<id>.png; si el
// PNG todavía no existe (la autora los está generando), cae al emoji placeholder
// vía onError. Va con key={persona.id} en el llamador para que el estado
// `broken` no se arrastre entre rondas.
function PersonaImg({ persona }) {
  const [broken, setBroken] = useStateG(false);
  if (broken) {
    return (
      <span style={{ fontSize: 58, lineHeight: 1, filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.3))" }}>
        {persona.emoji}
      </span>
    );
  }
  return (
    <img
      src={"assets/persona-" + persona.id + ".jpg"}
      alt=""
      draggable={false}
      onError={() => setBroken(true)}
      style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
    />
  );
}

// ═══════════════ TEMA 1 · "Mi escuela" — ¿Quién? (tocar) ═══════════════
function PersonasGame({ app, setApp, go }) {
  const char = CHARACTERS.find((c) => c.id === app.character) || CHARACTERS[0];

  const [rounds, setRounds] = useStateG(() => buildRounds(ROUNDS));
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

  // Registrar las preguntas de esta partida como recientes (una sola vez).
  useEffectG(() => { pushRecent(rounds.map((r) => r.p)); }, []);

  useEffectG(() => {
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - started.current) / 1000));
    }, 500);
    return () => clearInterval(id);
  }, []);

  const q = rounds[idx];                       // { p, opciones, correcta }
  const persona = PERSONAS[q.p];               // la persona correcta (y su pregunta)
  const answered = picked !== null;

  function formatTime(s) {
    const m = Math.floor(s / 60), ss = s % 60;
    return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  }

  function confirmRestart() {
    setConfirmingRestart(false);
    advancing.current = false;
    const nuevas = buildRounds(ROUNDS);
    pushRecent(nuevas.map((r) => r.p));
    setRounds(nuevas);
    setIdx(0); setPicked(null); setFeedback(null); setFeedbackMsg("");
    setAciertos(0); setStars(0); setLog([]);
    started.current = Date.now();
    exerciseStart.current = Date.now();
  }

  function answerTap(i) {
    if (answered || advancing.current) return;
    if (typeof markFirstAttempt === "function") markFirstAttempt();
    setPicked(i);
    const isCorrect = i === q.correcta;
    const exSec = Math.max(0, Math.floor((Date.now() - exerciseStart.current) / 1000));
    const entry = {
      idx: idx + 1,
      emoji: persona.emoji,
      a: persona.pregunta,
      userAnswer: PERSONAS[q.opciones[i]].nombre,
      correctAnswer: persona.nombre,
      isCorrect,
      time: exSec,
    };

    // Calcular valores nuevos aquí (el setTimeout captura este closure).
    const newLog = [...log, entry];
    const newAciertos = aciertos + (isCorrect ? 1 : 0);
    const newStars = stars + (isCorrect ? 1 : 0);
    const isLast = idx + 1 >= ROUNDS;

    setLog(newLog);
    setAciertos(newAciertos);
    setStars(newStars);
    advancing.current = true;

    if (isCorrect) {
      setApp((s) => ({ ...s, stars: (s.stars || 0) + 1 }));
      setFeedback("ok");
      setFeedbackMsg("+1 ⭐");
      setTimeout(() => advance(newLog, newAciertos, newStars, isLast), 1050);
    } else {
      // Caso ERROR: la revelación LIMPIA (correcta en VERDE, erróneas en ROJO,
      // bocadillo "¡Casi! Mira la respuesta") se ve 2 s ENTERAS y SIN overlay,
      // para que el niño alcance a estudiar cuál era la correcta. RECIÉN DESPUÉS
      // aparece el "¡UPS!" como reacción breve y se avanza.
      setTimeout(() => {
        setFeedback("err");
        setFeedbackMsg(ANIMOS[idx % ANIMOS.length]);
      }, 2000);
      setTimeout(() => advance(newLog, newAciertos, newStars, isLast), 2700);
    }
  }

  function advance(newLog, newAciertos, newStars, isLast) {
    setFeedback(null);
    setFeedbackMsg("");
    if (!isLast) {
      setIdx((i) => i + 1);
      setPicked(null);
      exerciseStart.current = Date.now();
      advancing.current = false;
    } else {
      setApp((s) => ({
        ...s,
        stars: newStars,
        lastResult: {
          category: app.currentCatLabel || CAT_LABEL,
          solved: newAciertos,
          total: ROUNDS,
          time: Math.floor((Date.now() - started.current) / 1000),
          starsEarned: newStars,
          log: newLog,
        },
      }));
      if (typeof incrementGamesCompleted === "function") incrementGamesCompleted();
      go("results");
    }
  }

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <TemaChipsBar app={app} setApp={setApp} />

      {/* ── HUD: logo izq, tiempo + estrellas der ── */}
      <div style={{ position: "absolute", top: 10, left: 16, right: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <EdinunLogoMini size={64} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.35)", borderRadius: 999, padding: "6px 12px", border: "1px solid rgba(242,194,96,0.4)", fontFamily: "var(--ed-font-mono)", fontSize: 13, color: "#fce9a8" }}>
            ⏱ {formatTime(elapsed)}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.35)", borderRadius: 999, padding: "6px 12px", border: "1px solid rgba(242,194,96,0.4)", fontFamily: "var(--ed-font-display)", fontWeight: 600, color: "#fce9a8" }}>
            ⭐ {stars}
          </div>
        </div>
      </div>

      {/* ── RONDA con dots (sin chip de tema: aún 1 solo tema) — top:52 (§1.1) ── */}
      <div style={{ position: "absolute", top: 52, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 8 }}>
        <span className="ed-label" style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>Ronda</span>
        {Array.from({ length: ROUNDS }).map((_, i) => {
          const done = i < log.length;
          const ok = done && log[i] && log[i].isCorrect;
          return (
            <div key={i} style={{
              width: 11, height: 11, borderRadius: "50%",
              background: done ? (ok ? "#fce9a8" : "#ff6b6b") : (i === idx ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)"),
              boxShadow: done ? "0 0 8px currentColor" : "none",
              color: ok ? "#fce9a8" : "#ff6b6b",
            }} />
          );
        })}
      </div>

      {/* ── Personaje guía + bocadillo de pista (izquierda) ── */}
      <div style={{ position: "absolute", left: 8, bottom: 78, width: 220, pointerEvents: "none", textAlign: "center" }}>
        <div className="ed-float-soft" style={{ position: "absolute", left: 0, right: 0, bottom: "100%", display: "flex", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{
            position: "relative", display: "inline-block", maxWidth: 210,
            background: "linear-gradient(180deg, rgba(20,12,55,0.95), rgba(10,6,35,0.95))",
            border: "1.5px solid rgba(242,194,96,0.65)", borderRadius: 16, padding: "10px 14px",
            fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 14, lineHeight: 1.3,
            color: "#fce9a8", textAlign: "center",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
          }}>
            {answered ? (picked === q.correcta ? "¡Muy bien!" : "¡Casi! Mira la respuesta.") : (<>Toca a la<br />persona correcta.</>)}
            <div style={{ position: "absolute", bottom: -10, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "9px solid transparent", borderRight: "9px solid transparent", borderTop: "10px solid rgba(20,12,55,0.95)", filter: "drop-shadow(0 1px 0 rgba(242,194,96,0.55))" }} />
          </div>
        </div>
        <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
          <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", width: 140, height: 16, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(242,194,96,0.45), transparent 70%)", filter: "blur(5px)" }} />
          <char.Component size={186} floating />
        </div>
        <div style={{ marginTop: -2, fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 14, color: "#fce9a8", letterSpacing: "0.04em", textShadow: "0 2px 6px rgba(0,0,0,0.6)" }}>{char.name}</div>
      </div>

      {/* ── Zona central: enunciado + cartel + opciones, repartidos parejo ──
          Márgenes IGUALES (215/215) para centrar el bloque en el eje X del
          lienzo (900): el personaje vive en el margen izquierdo y los botones
          en el derecho. */}
      <div style={{ position: "absolute", top: 60, bottom: 18, left: 215, right: 215, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly" }}>
        {/* Enunciado (QUÉ): la pregunta del banco ES el enunciado */}
        <div style={{ textAlign: "center", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 23, lineHeight: 1.15, color: "#fff", textShadow: "0 2px 6px rgba(0,0,0,0.55)", pointerEvents: "none", maxWidth: 470 }}>
          {persona.pregunta}
        </div>

        {/* Opciones — 3 tarjetas grandes con dibujo + nombre (sin cartel de
            contexto: el dibujo de cada tarjeta ES el contenido visual).
            Las escenas de la autora son CUADRADAS (2048×2048 → jpg 640): el área
            de imagen va cuadrada y muestra la escena completa sin recortar. */}
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "nowrap" }}>
          {q.opciones.map((oi, i) => {
            const op = PERSONAS[oi];
            const correctOne = i === q.correcta;
            const baseColor = OPTION_COLORS[i % OPTION_COLORS.length];
            let borderColor = baseColor;
            let bg = "linear-gradient(180deg, #fff8e6 0%, #f7e3a8 100%)";
            let nameColor = "#3a2608";
            if (answered) {
              if (correctOne) {
                borderColor = "#2ecc8f";
                bg = "linear-gradient(180deg, rgba(72,224,154,0.95), rgba(26,143,95,0.92))";
                nameColor = "#06381f";
              } else if (i === picked) {
                borderColor = "#ff6b6b";
                bg = "linear-gradient(180deg, rgba(255,139,139,0.92), rgba(178,47,47,0.9))";
                nameColor = "#fff";
              } else {
                bg = "linear-gradient(180deg, rgba(255,248,230,0.5), rgba(247,227,168,0.5))";
              }
            }
            return (
              <button
                key={i}
                onClick={() => answerTap(i)}
                disabled={answered}
                style={{
                  width: 156, height: 194, borderRadius: 18,
                  border: `3px solid ${borderColor}`,
                  background: bg,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", gap: 6,
                  padding: 8,
                  cursor: answered ? "default" : "pointer",
                  boxShadow: answered && correctOne
                    ? "0 0 22px rgba(46,204,143,0.6), inset 0 1px 0 rgba(255,255,255,0.4)"
                    : "inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -3px 0 rgba(0,0,0,0.12), 0 6px 14px rgba(0,0,0,0.3)",
                  transform: answered && correctOne ? "translateY(-4px)" : "none",
                  transition: "all 0.15s ease",
                }}
                title="Toca para responder"
              >
                <div style={{ width: "100%", flex: 1, minHeight: 0, borderRadius: 12, overflow: "hidden", background: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <PersonaImg key={op.id} persona={op} />
                </div>
                <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 16, color: nameColor, whiteSpace: "nowrap" }}>{op.nombre}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Acciones (derecha): REINICIAR · SALIR ── */}
      <div style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 12, width: 150 }}>
        <button className="ed-btn ed-btn-restart" onClick={() => setConfirmingRestart(true)} title="Empezar de nuevo" style={{ fontSize: 15, padding: "0 10px", height: 56, fontWeight: 800, letterSpacing: "0.04em" }}>
          REINICIAR
        </button>
        <button className="ed-btn ed-btn-ghost" onClick={() => setConfirmingExit(true)} title="Salir al inicio" style={{ fontSize: 15, padding: "0 10px", height: 56, fontWeight: 800, letterSpacing: "0.04em" }}>
          SALIR
        </button>
      </div>

      {/* ── Overlay de feedback ── */}
      {feedback && (
        <PortalToBody>
          <div style={{
            position: "fixed", inset: 0, zIndex: 1000, pointerEvents: "none",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14,
            background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)", animation: "ed-pop-in 0.3s",
          }}>
            <div style={{
              fontFamily: "'Fredoka','Baloo 2',system-ui,sans-serif", fontWeight: 700,
              fontSize: "clamp(56px, 11vmin, 120px)",
              color: feedback === "ok" ? "#2ecc8f" : "#ff6b6b",
              textShadow: "0 4px 0 rgba(0,0,0,0.45), 0 0 60px currentColor",
            }}>
              {feedback === "ok" ? "¡EXCELENTE!" : "¡UPS!"}
            </div>
            {feedbackMsg && (
              <div style={{
                fontFamily: "'Fredoka','Baloo 2',system-ui,sans-serif", fontWeight: 700,
                fontSize: "clamp(18px, 2.6vmin, 30px)",
                color: feedback === "ok" ? "#fce9a8" : "#fff",
                background: "rgba(0,0,0,0.55)", padding: "8px 26px", borderRadius: 999,
                textShadow: "0 2px 6px rgba(0,0,0,0.6)", textAlign: "center",
              }}>
                {feedback === "err" ? `${feedbackMsg} — ${char.name}` : feedbackMsg}
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
              <p className="ed-body" style={{ marginBottom: 16, fontSize: 14 }}>Vas a perder lo de esta ronda.</p>
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

// ═══════════════════════════════════════════════════════════════════════
// Barra de chips de tema (arriba, centrada) — cambiar de tema SIN volver al
// Home. Es destructivo (se pierde el avance) → modal de confirmación.
// ═══════════════════════════════════════════════════════════════════════
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
              title={active ? "Tema actual" : `Cambiar a "${lv.label}"`}
              style={{ padding: "5px 12px", borderRadius: 999, background: active ? lv.grad : "rgba(0,0,0,0.35)", color: active ? lv.ink : "rgba(252,233,168,0.85)", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 11, letterSpacing: "0.02em", border: active ? "1px solid rgba(255,255,255,0.55)" : "1px solid rgba(242,194,96,0.35)", boxShadow: active ? "inset 0 1px 0 rgba(255,255,255,0.45), 0 0 12px rgba(255,255,255,0.18)" : "none", cursor: (lv.enabled && !active) ? "pointer" : "default", whiteSpace: "nowrap" }}>
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

// ═══════════════ TEMA 2 · "Medios de transporte" — clasificar ═══════════════
// Arrastrar transportes (emoji) a su vía: tierra / agua / aire + ¡VERIFICAR!
// 3 rondas (pedido de la autora); 4 transportes por ronda (1 por vía + 1 extra).
// Emojis: los medios de transporte se leen clarísimo → NO hacen falta imágenes.
const ROUNDS_T = 3;
const T_PER_ROUND = 4;
const RECENT_KEY_T = "edinun_juego5_transporte_recientes_v1";
const T_RECENT_CAP = 8;

const VIAS = [
  { id: "tierra", label: "Tierra", e: "🛣️", ring: "#e4a03a", tint: "rgba(228,160,58,0.18)" },
  { id: "agua",   label: "Agua",   e: "🌊", ring: "#5aa9f5", tint: "rgba(90,169,245,0.18)" },
  { id: "aire",   label: "Aire",   e: "☁️", ring: "#8fd0e8", tint: "rgba(143,208,232,0.18)" },
];
// Banco de transportes (emoji + vía). Los del libro: bus, camión, taxi, moto,
// tren, avión, helicóptero, canoa, barco… Clasificar por vía NO es dato inventado.
const TRANSPORTES = [
  { id: "auto",        e: "🚗",  via: "tierra", label: "Auto" },
  { id: "bus",         e: "🚌",  via: "tierra", label: "Bus" },
  { id: "taxi",        e: "🚕",  via: "tierra", label: "Taxi" },
  { id: "bomberos",    e: "🚒",  via: "tierra", label: "Bomberos" },
  { id: "ambulancia",  e: "🚑",  via: "tierra", label: "Ambulancia" },
  { id: "moto",        e: "🏍️", via: "tierra", label: "Moto" },
  { id: "camion",      e: "🚚",  via: "tierra", label: "Camión" },
  { id: "tren",        e: "🚂",  via: "tierra", label: "Tren" },
  { id: "bici",        e: "🚲",  via: "tierra", label: "Bicicleta" },
  { id: "velero",      e: "⛵",  via: "agua",   label: "Velero" },
  { id: "barco",       e: "🚢",  via: "agua",   label: "Barco" },
  { id: "canoa",       e: "🛶",  via: "agua",   label: "Canoa" },
  { id: "lancha",      e: "🚤",  via: "agua",   label: "Lancha" },
  { id: "avion",       e: "✈️", via: "aire",   label: "Avión" },
  { id: "helicoptero", e: "🚁",  via: "aire",   label: "Helicóptero" },
  { id: "globo",       e: "🎈",  via: "aire",   label: "Globo" },
];
const TMAP = {}; TRANSPORTES.forEach((t) => { TMAP[t.id] = t; });
function viaIndex(id) { return VIAS.findIndex((v) => v.id === id); }

// Geometría (lienzo 900×540) — bandeja arriba (fila de 4) · 3 vías abajo.
// Bandeja y cajones acercados (antes sobraba una banda vacía entre ambos).
const T_BIN_CX = [290, 450, 610];
const T_BIN_TOP = 286;
const T_BIN_W = 150, T_BIN_H = 170;
const T_HIT_PAD = 24;
const T_TRAY_X = [255, 385, 515, 645];   // 4 tarjetas en fila, centradas en x=450
const T_TRAY_Y = 202;

const GAME_CSS_T = `
.ed-noselect, .ed-noselect *{ -webkit-user-select:none; -moz-user-select:none; user-select:none; -webkit-user-drag:none; -webkit-touch-callout:none; -webkit-tap-highlight-color:transparent; }
@keyframes edCheckPopT{ 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }
.ed-checkPopT{ animation:edCheckPopT .34s cubic-bezier(.2,.9,.3,1.4); }
`;

function tReadRecent() { try { const a = JSON.parse(localStorage.getItem(RECENT_KEY_T) || "[]"); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
function tWriteRecent(ids) {
  try {
    const prev = tReadRecent(); const merged = [];
    ids.concat(prev).forEach((x) => { if (merged.indexOf(x) === -1) merged.push(x); });
    localStorage.setItem(RECENT_KEY_T, JSON.stringify(merged.slice(0, T_RECENT_CAP)));
  } catch (e) { /* sin localStorage: sin anti-repetición, no crítico */ }
}
function tPickFresh(ids, recent, n, exclude) {
  const avail = ids.filter((id) => exclude.indexOf(id) === -1);
  const fresh = shuffle(avail.filter((id) => recent.indexOf(id) === -1));
  const stale = shuffle(avail.filter((id) => recent.indexOf(id) !== -1));
  return fresh.concat(stale).slice(0, n);
}
// Un tablero: 1 transporte garantizado por vía + 1 extra, evitando recientes y ya usados.
function tBuildBoard(recent, used) {
  const chosen = [];
  VIAS.forEach((v) => {
    const ofVia = TRANSPORTES.filter((t) => t.via === v.id).map((t) => t.id);
    const pick = tPickFresh(ofVia, recent, 1, chosen.concat(used));
    if (pick.length) chosen.push(pick[0]);
  });
  const rest = tPickFresh(TRANSPORTES.map((t) => t.id), recent, T_PER_ROUND - chosen.length, chosen.concat(used));
  rest.forEach((id) => chosen.push(id));
  return shuffle(chosen).slice(0, T_PER_ROUND);
}
// Los 3 tableros de la partida (sin repetir transporte entre ellos).
function tBuildPartida() {
  const recent = tReadRecent(); const used = []; const boards = [];
  for (let r = 0; r < ROUNDS_T; r++) { const b = tBuildBoard(recent, used); b.forEach((id) => used.push(id)); boards.push(b); }
  tWriteRecent(used);
  return boards;
}
function tPlacedGrid(n) {
  const cols = n <= 2 ? Math.max(1, n) : Math.ceil(n / 2);
  const rows = Math.ceil(n / cols) || 1;
  let size, cell;
  if (cols <= 1) { size = 54; cell = 80; } else if (cols === 2) { size = 46; cell = 68; } else { size = 34; cell = 50; }
  return { cols, rows, cell, rowStep: size + 18, size };
}
function tVerifyCol(n) {
  let step = n <= 2 ? 66 : (n === 3 ? 58 : 50);
  step = Math.min(step, 240 / Math.max(1, n - 1));
  return { size: Math.max(30, step - 16), step };
}

function TransporteGame({ app, setApp, go }) {
  const char = CHARACTERS.find((c) => c.id === app.character) || CHARACTERS[0];
  const rootRef = useRefG(null);
  const binRefs = useRefG([null, null, null]);
  const boardsRef = useRefG(null);
  if (!boardsRef.current) boardsRef.current = tBuildPartida();

  const [roundIdx, setRoundIdx] = useStateG(0);
  const [placement, setPlacement] = useStateG({});
  const [dragId, setDragId] = useStateG(null);
  const [dragXY, setDragXY] = useStateG({ x: 0, y: 0 });
  const [verdict, setVerdict] = useStateG(null);
  const [revealBin, setRevealBin] = useStateG({});
  const [banner, setBanner] = useStateG(null);
  const [bannerMsg, setBannerMsg] = useStateG("");
  const [stars, setStars] = useStateG(0);
  const [elapsed, setElapsed] = useStateG(0);
  const [confirmingExit, setConfirmingExit] = useStateG(false);
  const [confirmingRestart, setConfirmingRestart] = useStateG(false);

  const started = useRefG(Date.now());
  const firstDone = useRefG(false);
  const advancing = useRefG(false);
  const logRef = useRefG([]);
  const dragRef = useRefG(null);

  const round = boardsRef.current[roundIdx];

  useEffectG(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - started.current) / 1000)), 500);
    return () => clearInterval(id);
  }, []);

  function formatTime(s) { const m = Math.floor(s / 60), ss = s % 60; return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`; }

  function restPos(id) {
    const bin = placement[id];
    if (bin) {
      const bi = viaIndex(bin);
      const inBin = round.filter((x) => placement[x] === bin);
      const k = inBin.indexOf(id); const n = inBin.length;
      if (verdict) { const c = tVerifyCol(n); return { x: T_BIN_CX[bi], y: (T_BIN_TOP + 16) - k * c.step }; }
      const g = tPlacedGrid(n);
      const row = Math.floor(k / g.cols);
      const inRow = Math.min(g.cols, n - row * g.cols);
      const col = k - row * g.cols;
      const cx = T_BIN_CX[bi] - ((inRow - 1) * g.cell) / 2 + col * g.cell;
      const cy = (T_BIN_TOP + 58) - ((g.rows - 1) * g.rowStep) / 2 + row * g.rowStep;
      return { x: cx, y: cy };
    }
    const ti = round.indexOf(id);
    return { x: T_TRAY_X[ti] != null ? T_TRAY_X[ti] : 450, y: T_TRAY_Y };
  }

  function onPointerDown(e, id) {
    if (verdict || advancing.current) return;
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
    const id = d.id; let hit = null;
    for (let i = 0; i < 3; i++) {
      const el = binRefs.current[i]; if (!el) continue;
      const r = el.getBoundingClientRect();
      if (e.clientX >= r.left - T_HIT_PAD && e.clientX <= r.right + T_HIT_PAD &&
          e.clientY >= r.top - T_HIT_PAD && e.clientY <= r.bottom + T_HIT_PAD) { hit = VIAS[i].id; break; }
    }
    if (hit) setPlacement((p) => ({ ...p, [id]: hit }));
    else if (d.moved) setPlacement((p) => { const n = { ...p }; delete n[id]; return n; });
  }

  const allPlaced = round.every((id) => placement[id]);
  const placedCount = round.filter((id) => placement[id]).length;

  function confirmRestart() {
    setConfirmingRestart(false);
    advancing.current = false;
    boardsRef.current = tBuildPartida();
    logRef.current = [];
    setRoundIdx(0); setPlacement({}); setVerdict(null); setRevealBin({});
    setBanner(null); setBannerMsg(""); setStars(0);
    started.current = Date.now();
  }

  function finalize(finalStars) {
    const solved = logRef.current.filter((e) => e.isCorrect).length;
    setApp((s) => ({
      ...s,
      stars: (s.stars || 0) + finalStars,
      lastResult: {
        category: app.currentCatLabel || "Medios de transporte",
        solved,
        total: logRef.current.length,
        time: Math.floor((Date.now() - started.current) / 1000),
        starsEarned: finalStars,
        log: logRef.current.slice(),
      },
    }));
    if (typeof incrementGamesCompleted === "function") incrementGamesCompleted();
    go("results");
  }

  function onVerify() {
    if (!allPlaced || verdict || advancing.current) return;
    const vd = {}, rb = {}; let ac = 0;
    round.forEach((id) => {
      const ok = placement[id] === TMAP[id].via;
      vd[id] = ok ? "ok" : "wrong";
      if (ok) ac++; else rb[TMAP[id].via] = true;
      const okVia = VIAS[viaIndex(TMAP[id].via)];
      const chosen = VIAS[viaIndex(placement[id])];
      logRef.current.push({
        idx: logRef.current.length + 1, emoji: TMAP[id].e, a: TMAP[id].label,
        userAnswer: chosen ? `${chosen.e} ${chosen.label}` : "—",
        correctAnswer: `${okVia.e} ${okVia.label}`, isCorrect: ok, time: 0,
      });
    });
    const perfecto = ac === round.length;
    const newStars = stars + ac;
    setVerdict(vd); setRevealBin(rb); setStars(newStars);
    advancing.current = true;
    const isLast = roundIdx + 1 >= ROUNDS_T;
    const revealMs = perfecto ? 950 : 3600;
    setTimeout(() => {
      if (perfecto) { setBanner("ok"); setBannerMsg(`+${ac} ⭐`); }
      else { setBanner("err"); setBannerMsg(ANIMOS[Math.floor(Math.random() * ANIMOS.length)]); }
    }, revealMs);
    setTimeout(() => {
      setBanner(null); setBannerMsg("");
      if (isLast) { finalize(newStars); }
      else { setRoundIdx((i) => i + 1); setPlacement({}); setVerdict(null); setRevealBin({}); advancing.current = false; }
    }, revealMs + 1600);
  }

  return (
    <div ref={rootRef} className="ed-noselect" style={{ position: "absolute", inset: 0, overflow: "hidden", WebkitTapHighlightColor: "transparent" }}>
      <style>{GAME_CSS_T}</style>
      <TemaChipsBar app={app} setApp={setApp} />

      {/* ── HUD: logo izq, tiempo + estrellas der ── */}
      <div style={{ position: "absolute", top: 10, left: 16, right: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <EdinunLogoMini size={64} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.35)", borderRadius: 999, padding: "6px 12px", border: "1px solid rgba(242,194,96,0.4)", fontFamily: "var(--ed-font-mono)", fontSize: 13, color: "#fce9a8" }}>⏱ {formatTime(elapsed)}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.35)", borderRadius: 999, padding: "6px 12px", border: "1px solid rgba(242,194,96,0.4)", fontFamily: "var(--ed-font-display)", fontWeight: 600, color: "#fce9a8" }}>⭐ {stars}</div>
        </div>
      </div>

      {/* ── RONDA con dots — top:52 (§1.1) ── */}
      <div style={{ position: "absolute", top: 52, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 8, zIndex: 4 }}>
        <span className="ed-label" style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>Ronda</span>
        {Array.from({ length: ROUNDS_T }).map((_, i) => (
          <div key={i} style={{ width: 11, height: 11, borderRadius: "50%", background: i < roundIdx ? "#fce9a8" : (i === roundIdx ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)"), boxShadow: i < roundIdx ? "0 0 8px currentColor" : "none", color: "#fce9a8" }} />
        ))}
      </div>

      {/* ── Enunciado (QUÉ) ── */}
      <div style={{ position: "absolute", left: 150, right: 150, top: 88, textAlign: "center", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 22, color: "#fff", textShadow: "0 2px 6px rgba(0,0,0,0.55)", pointerEvents: "none" }}>
        Lleva cada transporte a su camino.
      </div>

      {/* ── Los 3 paneles de vía ── */}
      {VIAS.map((b, i) => (
        <div key={b.id} style={{ position: "absolute", left: T_BIN_CX[i], top: T_BIN_TOP, transform: "translateX(-50%)", width: T_BIN_W, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, zIndex: 3, pointerEvents: "none" }}>
          <div ref={(el) => { binRefs.current[i] = el; }} style={{ position: "relative", width: T_BIN_W, height: T_BIN_H, borderRadius: 18, background: b.tint, border: `3px solid ${b.ring}`, boxShadow: "inset 0 2px 12px rgba(0,0,0,0.25), 0 6px 14px rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <span style={{ fontSize: 74, opacity: 0.22, lineHeight: 1 }}>{b.e}</span>
          </div>
          <div style={{ background: "rgba(10,6,35,0.72)", border: `2px solid ${b.ring}`, borderRadius: 999, padding: "3px 14px", fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 13, color: "#fff", whiteSpace: "nowrap" }}>{b.e} {b.label}</div>
        </div>
      ))}

      {/* ── Tarjetas de transporte (bandeja / colocadas) ── */}
      {round.map((id) => {
        const t = TMAP[id];
        const dragging = dragId === id;
        const placed = !!placement[id] && !dragging;
        const pos = dragging ? dragXY : restPos(id);
        const nBin = placed ? round.filter((x) => placement[x] === placement[id]).length : 0;
        const inVerify = placed && !!verdict;
        const ps = !placed ? 86 : (inVerify ? tVerifyCol(nBin).size : tPlacedGrid(nBin).size);
        const v = verdict && verdict[id];
        const okVia = VIAS[viaIndex(t.via)];
        const locked = !!verdict;
        return (
          <div key={id} onPointerDown={(e) => onPointerDown(e, id)} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onDragStart={(e) => e.preventDefault()}
            style={{ position: "absolute", left: pos.x, top: pos.y, transform: "translate(-50%,-50%)", zIndex: dragging ? 60 : (v === "wrong" ? 20 : (placed ? 12 : 15)), touchAction: "none", cursor: locked ? "default" : (dragging ? "grabbing" : "grab"), transition: dragging ? "none" : "left 0.18s ease, top 0.18s ease", filter: dragging ? "drop-shadow(0 10px 12px rgba(0,0,0,0.4))" : "drop-shadow(0 5px 7px rgba(0,0,0,0.3))" }}>
            <div style={{ position: "relative", width: ps, height: ps, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {v === "wrong" && (<div style={{ position: "absolute", inset: -7, borderRadius: "50%", background: "rgba(231,76,60,0.12)", boxShadow: "0 0 0 3px #e74c3c", zIndex: 0, pointerEvents: "none" }} />)}
              <div style={{ position: "relative", zIndex: 1, width: ps, height: ps, borderRadius: 14, background: "linear-gradient(180deg, #fff8e6, #f7e3a8)", border: "2px solid #f2c260", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 5px 12px rgba(0,0,0,0.3)", overflow: "hidden", padding: 2 }}>
                <span style={{ fontSize: Math.round(ps * (placed ? 0.62 : 0.44)), lineHeight: 1 }}>{t.e}</span>
                {!placed && (<span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 11, color: "#3a2608", marginTop: 2, textAlign: "center", lineHeight: 1.05 }}>{t.label}</span>)}
              </div>
              {v === "ok" && (<div className="ed-checkPopT" style={{ position: "absolute", top: -8, right: -8, width: 24, height: 24, borderRadius: "50%", background: "#2ecc71", color: "#fff", fontWeight: 900, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 5px rgba(0,0,0,0.45)", border: "2px solid rgba(255,255,255,0.9)", zIndex: 2 }}>✓</div>)}
              {v === "wrong" && (
                <div className="ed-checkPopT" title={`Va en: ${okVia.label}`} style={{ position: "absolute", left: "100%", top: "50%", transform: "translateY(-50%)", marginLeft: 2, display: "flex", alignItems: "center", gap: 1, pointerEvents: "none", whiteSpace: "nowrap", zIndex: 3 }}>
                  <span style={{ fontSize: 16, fontWeight: 900, color: "#ffd27a", textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}>➜</span>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: "50%", background: "#fff", border: `3px solid ${okVia.ring}`, boxShadow: "0 2px 5px rgba(0,0,0,0.45)" }}>
                    <span style={{ fontSize: 18, lineHeight: 1 }}>{okVia.e}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* ── Personaje guía + bocadillo ── */}
      <div style={{ position: "absolute", left: 8, bottom: 78, width: 220, pointerEvents: "none", textAlign: "center" }}>
        <div className="ed-float-soft" style={{ position: "absolute", left: 0, right: 0, bottom: "100%", display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative", display: "inline-block", maxWidth: 176, background: "linear-gradient(180deg, rgba(20,12,55,0.95), rgba(10,6,35,0.95))", border: "1.5px solid rgba(242,194,96,0.65)", borderRadius: 16, padding: "10px 14px", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 14, lineHeight: 1.3, color: "#fce9a8", textAlign: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}>
            Arrastra y suelta<br />en su vía.
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
      <div style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 12, width: 150 }}>
        <button className="ed-btn ed-btn-verify" onClick={onVerify} disabled={!allPlaced || !!verdict} style={{ height: 56, fontSize: 16, fontWeight: 800, letterSpacing: "0.04em", opacity: (allPlaced && !verdict) ? 1 : 0.5, cursor: (allPlaced && !verdict) ? "pointer" : "not-allowed" }}>¡VERIFICAR!</button>
        <button className="ed-btn ed-btn-restart" onClick={() => setConfirmingRestart(true)} style={{ fontSize: 15, padding: "0 10px", height: 56, fontWeight: 800, letterSpacing: "0.04em" }}>REINICIAR</button>
        <button className="ed-btn ed-btn-ghost" onClick={() => setConfirmingExit(true)} style={{ fontSize: 15, padding: "0 10px", height: 56, fontWeight: 800, letterSpacing: "0.04em" }}>SALIR</button>
      </div>

      {/* ── Overlay de feedback ── */}
      {banner && (
        <PortalToBody>
          <div style={{ position: "fixed", inset: 0, zIndex: 1000, pointerEvents: "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)", animation: "ed-pop-in 0.3s" }}>
            <div style={{ fontFamily: "'Fredoka','Baloo 2',system-ui,sans-serif", fontWeight: 700, fontSize: "clamp(56px, 11vmin, 120px)", color: banner === "ok" ? "#2ecc8f" : "#ff6b6b", textShadow: "0 4px 0 rgba(0,0,0,0.45), 0 0 60px currentColor" }}>{banner === "ok" ? "¡EXCELENTE!" : "¡UPS!"}</div>
            {bannerMsg && (<div style={{ fontFamily: "'Fredoka','Baloo 2',system-ui,sans-serif", fontWeight: 700, fontSize: "clamp(18px, 2.6vmin, 30px)", color: banner === "ok" ? "#fce9a8" : "#fff", background: "rgba(0,0,0,0.55)", padding: "8px 26px", borderRadius: 999, textShadow: "0 2px 6px rgba(0,0,0,0.6)", textAlign: "center" }}>{banner === "err" ? `${bannerMsg} — ${char.name}` : bannerMsg}</div>)}
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
              <p className="ed-body" style={{ marginBottom: 16, fontSize: 14 }}>Vas a perder lo de esta ronda.</p>
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
              <p className="ed-body" style={{ marginBottom: 16, fontSize: 14 }}>Vas a jugar con transportes nuevos.</p>
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

// ═══════════════ Despachador por tema ═══════════════
function GameScreen({ app, setApp, go }) {
  if (app.currentCategory === "transporte") return <TransporteGame app={app} setApp={setApp} go={go} />;
  return <PersonasGame app={app} setApp={setApp} go={go} />;
}

Object.assign(window, { GameScreen, ResultsScreen });
