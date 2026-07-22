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
            {<>Toca a la<br />persona correcta.</>}
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
          {res.score != null && (
            <div style={{ display: "flex", gap: 8, marginTop: 2, flexWrap: "wrap", justifyContent: "center" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(242,194,96,0.15)", border: "1px solid rgba(242,194,96,0.5)", borderRadius: 999, padding: "5px 12px", fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 14, color: "#fce9a8" }}>🏆 {res.score} pts</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,120,40,0.15)", border: "1px solid rgba(255,150,60,0.5)", borderRadius: 999, padding: "5px 12px", fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 14, color: "#ffd27a" }}>🔥 Racha máx {res.maxRacha}</span>
            </div>
          )}
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
const ROUNDS_T = 1;         // 1 sola ronda (decisión de la autora: 3 idénticas aburren; y es para 6 años)
const T_PER_ROUND = 6;      // 6 transportes (2 por vía) en un solo tablero completo
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
  { id: "teleferico",  e: "🚡",  via: "aire",   label: "Teleférico" },
];
const TMAP = {}; TRANSPORTES.forEach((t) => { TMAP[t.id] = t; });
function viaIndex(id) { return VIAS.findIndex((v) => v.id === id); }

// Geometría (lienzo 900×540) — bandeja arriba (2 filas de 3) · 3 vías abajo.
// Cajones bajados un poco para dar aire a las 2 filas de tarjetas.
const T_BIN_CX = [290, 450, 610];
const T_BIN_TOP = 320;
const T_BIN_W = 150, T_BIN_H = 170;
const T_HIT_PAD = 24;
const T_TRAY_COLS = [290, 450, 610];   // 3 columnas alineadas con los cajones (arregla el desfase)
const T_TRAY_ROWS = [143, 253];        // 2 filas de 3 (con aire entre ellas)
const T_TRAY_MID = 198;                // centro vertical de la bandeja (para el aviso "completo")

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
    const pick = tPickFresh(ofVia, recent, 2, chosen.concat(used));  // 2 por vía → 6 en total
    pick.forEach((id) => chosen.push(id));
  });
  if (chosen.length < T_PER_ROUND) {   // relleno de seguridad si alguna vía tuvo <2 frescos
    const rest = tPickFresh(TRANSPORTES.map((t) => t.id), recent, T_PER_ROUND - chosen.length, chosen.concat(used));
    rest.forEach((id) => chosen.push(id));
  }
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
      const cy = (T_BIN_TOP + T_BIN_H / 2) - ((g.rows - 1) * g.rowStep) / 2 + row * g.rowStep;
      return { x: cx, y: cy };
    }
    const ti = round.indexOf(id);
    return { x: T_TRAY_COLS[ti % 3], y: T_TRAY_ROWS[Math.floor(ti / 3)] };  // 2 filas de 3
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

      {/* ── RONDA con dots — top:52 (§1.1). Con 1 sola ronda se oculta. ── */}
      {ROUNDS_T > 1 && (
      <div style={{ position: "absolute", top: 52, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 8, zIndex: 4 }}>
        <span className="ed-label" style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>Ronda</span>
        {Array.from({ length: ROUNDS_T }).map((_, i) => (
          <div key={i} style={{ width: 11, height: 11, borderRadius: "50%", background: i < roundIdx ? "#fce9a8" : (i === roundIdx ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)"), boxShadow: i < roundIdx ? "0 0 8px currentColor" : "none", color: "#fce9a8" }} />
        ))}
      </div>
      )}

      {/* ── Enunciado (QUÉ) ── */}
      <div style={{ position: "absolute", left: 150, right: 150, top: 64, textAlign: "center", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 22, color: "#fff", textShadow: "0 2px 6px rgba(0,0,0,0.55)", pointerEvents: "none" }}>
        Lleva cada transporte a su camino.
      </div>

      {/* ── Aviso "completo" en el hueco de la bandeja cuando ya no quedan transportes arriba ── */}
      {allPlaced && !verdict && (
        <div style={{ position: "absolute", left: 150, right: 180, top: T_TRAY_MID - 20, textAlign: "center", pointerEvents: "none", zIndex: 5 }}>
          <span className="ed-checkPopT" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(46,204,143,0.18)", border: "2px solid #2ecc8f", borderRadius: 999, padding: "9px 22px", fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 18, color: "#8affce", textShadow: "0 1px 3px rgba(0,0,0,0.55)" }}>✅ ¡Todo en su lugar!</span>
        </div>
      )}

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
              <div style={{ position: "relative", zIndex: 1, width: ps, height: ps, borderRadius: 14, background: "linear-gradient(180deg, #fbf2d6, #efdcaa)", border: "2px solid #d9a441", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 6px 13px rgba(0,0,0,0.42)", overflow: "hidden", padding: 2 }}>
                <span style={{ fontSize: Math.round(ps * (placed ? 0.62 : 0.66)), lineHeight: 1 }}>{t.e}</span>
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

// ═══════════════════════════════════════════════════════════════════════
// TEMA 3 · "Economía" — 3 RONDAS ENCADENADAS (cada una mecánica distinta):
//   R1 SectoresRound  · quiz "¿a qué sector?" (tocar 1 de 4)
//   R2 ServiciosRound · multi-selección: toca todos los servicios (¡LISTO!)
//   R3 CadenaRound    · ordenar: arrastra 1·2·3 la cadena productiva (imágenes)
// Contenido TEXTUAL del libro (TEMA 2 "Economía y transporte en nuestro país").
// EconomiaGame orquesta las fases, acumula ⭐ + log y hace go("results").
// ⚠ NO INVENTAR contenido escolar: los bancos derivan del libro (los ejemplos
// de relleno se pueden ajustar con la autora).
// ═══════════════════════════════════════════════════════════════════════

// ---- Sectores (4, del diagrama del libro) ----
const SECTORES = [
  { id: "primario",    label: "Primario",    sub: "naturaleza",  ring: "#3a9e2f", grad: "linear-gradient(180deg,#8fe06a,#3a9e2f)", bright: "#8fe06a", tint: "rgba(143,224,106,0.15)" },
  { id: "secundario",  label: "Secundario",  sub: "transforma",  ring: "#e0940f", grad: "linear-gradient(180deg,#ffd07a,#e0940f)", bright: "#ffc24d", tint: "rgba(255,194,77,0.15)" },
  { id: "terciario",   label: "Terciario",   sub: "servicios",   ring: "#2160c4", grad: "linear-gradient(180deg,#6fb4ff,#2160c4)", bright: "#6fb4ff", tint: "rgba(111,180,255,0.17)" },
  { id: "cuaternario", label: "Cuaternario", sub: "intelectual", ring: "#7b3ff2", grad: "linear-gradient(180deg,#c79bff,#7b3ff2)", bright: "#c79bff", tint: "rgba(199,155,255,0.15)" },
];
const SMAP = {}; SECTORES.forEach((s) => { SMAP[s.id] = s; });

// ---- R1: actividades por sector (emoji; ejemplos del diagrama del libro) ----
const ACTIVIDADES = [
  { id: "agricultura",   e: "🌾", label: "Agricultura",   sector: "primario" },
  { id: "ganaderia",     e: "🐄", label: "Ganadería",     sector: "primario" },
  { id: "pesca",         e: "🎣", label: "Pesca",         sector: "primario" },
  { id: "mineria",       e: "⛏️", label: "Minería",       sector: "primario" },
  { id: "industria",     e: "🏭", label: "Industria",     sector: "secundario" },
  { id: "construccion",  e: "🏗️", label: "Construcción",  sector: "secundario" },
  { id: "energia",       e: "⚡", label: "Energía",       sector: "secundario" },
  { id: "artesania",     e: "🏺", label: "Artesanía",     sector: "secundario" },
  { id: "transporteT",   e: "🚚", label: "Transporte",    sector: "terciario" },
  { id: "comunicacion",  e: "📡", label: "Comunicación",  sector: "terciario" },
  { id: "turismo",       e: "🏖️", label: "Turismo",       sector: "terciario" },
  { id: "educacion",     e: "🏫", label: "Educación",     sector: "terciario" },
  { id: "bancoT",        e: "🏦", label: "Bancos",        sector: "terciario" },
  { id: "investigacion", e: "🔬", label: "Investigación", sector: "cuaternario" },
  { id: "arte",          e: "🎨", label: "Arte",          sector: "cuaternario" },
];
const AMAP = {}; ACTIVIDADES.forEach((a) => { AMAP[a.id] = a; });

// ---- R2: banco bienes / servicios (emoji; conceptos y ejemplos base del libro) ----
const COSAS = [
  { id: "policia",     e: "👮", label: "Policía",      tipo: "servicio" },
  { id: "luz",         e: "💡", label: "Luz",          tipo: "servicio" },
  { id: "agua",        e: "🚰", label: "Agua",         tipo: "servicio" },
  { id: "busserv",     e: "🚌", label: "Transporte",   tipo: "servicio" },
  { id: "escuela",     e: "🏫", label: "Educación",    tipo: "servicio" },
  { id: "salud",       e: "🩺", label: "Salud",        tipo: "servicio" },
  { id: "bancoserv",   e: "🏦", label: "Banco",        tipo: "servicio" },
  { id: "internet",    e: "📱", label: "Comunicación", tipo: "servicio" },
  { id: "pan",         e: "🍞", label: "Pan",          tipo: "bien" },
  { id: "ropa",        e: "👕", label: "Ropa",         tipo: "bien" },
  { id: "juguete",     e: "🧸", label: "Juguete",      tipo: "bien" },
  { id: "manzana",     e: "🍎", label: "Manzana",      tipo: "bien" },
  { id: "casa",        e: "🏠", label: "Casa",         tipo: "bien" },
  { id: "zapatos",     e: "👟", label: "Zapatos",      tipo: "bien" },
  { id: "leche",       e: "🥛", label: "Leche",        tipo: "bien" },
  { id: "pelota",      e: "⚽", label: "Pelota",       tipo: "bien" },
];
const CMAP = {}; COSAS.forEach((c) => { CMAP[c.id] = c; });

// ---- R3: cadenas productivas. Imagen assets/cadena-<slug>-<n>.jpg (n = paso 1/2/3);
// si falta, cae al emoji del paso. El flujo por sectores (naturaleza→transforma→
// vende) es del libro; los productos concretos son ilustración (ajustables). ----
const CADENAS = [
  { slug: "cafe",      title: "el café",      steps: [ { e: "🌱", label: "Cultivo" },  { e: "🏭", label: "Tostado" },     { e: "🏪", label: "Cafetería" } ] },
  { slug: "queso",     title: "el queso",     steps: [ { e: "🐄", label: "Leche" },    { e: "🏭", label: "Fábrica" },     { e: "🏪", label: "Tienda" } ] },
  { slug: "ropa",      title: "la ropa",      steps: [ { e: "🌿", label: "Algodón" },  { e: "🧵", label: "Costura" },     { e: "🛍️", label: "Tienda" } ] },
  { slug: "pan",       title: "el pan",       steps: [ { e: "🌾", label: "Trigo" },    { e: "🏭", label: "Panadería" },   { e: "🏪", label: "Venta" } ] },
  { slug: "mueble",    title: "el mueble",    steps: [ { e: "🌲", label: "Madera" },   { e: "🪚", label: "Carpintería" }, { e: "🛒", label: "Mueblería" } ] },
  { slug: "jugo",      title: "el jugo",      steps: [ { e: "🍊", label: "Naranja" },  { e: "🧃", label: "Fábrica" },     { e: "🏪", label: "Tienda" } ] },
];

// ---- Anti-repetición FIFO por ronda (localStorage) → recargar da otros ejercicios ----
const ECO_K_SEC = "edinun_juego5_eco_sectores_v1";
const ECO_K_SERV = "edinun_juego5_eco_servicios_v1";
const ECO_K_CAD = "edinun_juego5_eco_cadena_v1";
const ECO_Q = 1;   // preguntas de la Ronda 1 (1 = una sola jugada, como R2 y R3)

function ecoRecent(key) { try { const a = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
function ecoPush(key, ids, cap) {
  try { const prev = ecoRecent(key); const merged = []; ids.concat(prev).forEach((x) => { if (merged.indexOf(x) === -1) merged.push(x); }); localStorage.setItem(key, JSON.stringify(merged.slice(0, cap))); } catch (e) { /* sin localStorage: sin anti-repetición */ }
}
function ecoPickFresh(ids, recent, n, exclude) {
  const avail = ids.filter((id) => exclude.indexOf(id) === -1);
  const fresh = shuffle(avail.filter((id) => recent.indexOf(id) === -1));
  const stale = shuffle(avail.filter((id) => recent.indexOf(id) !== -1));
  return fresh.concat(stale).slice(0, n);
}

// R1: elige ECO_Q actividad(es) sin repetir las recientes. Si ECO_Q ≥ 4 garantiza
// 1 por sector + relleno; si es menos (p. ej. 1), sortea directo del banco.
function ecoBuildQuiz() {
  const recent = ecoRecent(ECO_K_SEC);
  let chosen = [];
  if (ECO_Q >= SECTORES.length) {
    SECTORES.forEach((sec) => {
      const ofSec = ACTIVIDADES.filter((a) => a.sector === sec.id).map((a) => a.id);
      const p = ecoPickFresh(ofSec, recent, 1, chosen);
      if (p.length) chosen.push(p[0]);
    });
    const extra = ecoPickFresh(ACTIVIDADES.map((a) => a.id), recent, ECO_Q - chosen.length, chosen);
    extra.forEach((id) => chosen.push(id));
  } else {
    chosen = ecoPickFresh(ACTIVIDADES.map((a) => a.id), recent, ECO_Q, []);
  }
  ecoPush(ECO_K_SEC, chosen, 7);
  return shuffle(chosen).map((id) => AMAP[id]);
}

// R2: baraja de ECO_DECK cartas (siempre mezcla de bienes y servicios) para deslizar.
const ECO_DECK = 3;
function ecoBuildDeck() {
  const recent = ecoRecent(ECO_K_SERV);
  const nServ = 1 + Math.floor(Math.random() * 2); // 1..2 → siempre hay al menos 1 bien y 1 servicio
  const servIds = COSAS.filter((c) => c.tipo === "servicio").map((c) => c.id);
  const bienIds = COSAS.filter((c) => c.tipo === "bien").map((c) => c.id);
  const cs = ecoPickFresh(servIds, recent, nServ, []);
  const cb = ecoPickFresh(bienIds, recent, ECO_DECK - cs.length, []);
  const ids = shuffle(cs.concat(cb));
  ecoPush(ECO_K_SERV, ids, 8);
  return ids.map((id) => CMAP[id]);
}

// R3: una cadena por partida (sin repetir la reciente).
function ecoPickCadena() {
  const recent = ecoRecent(ECO_K_CAD);
  const p = ecoPickFresh(CADENAS.map((c) => c.slug), recent, 1, []);
  const slug = p[0] || CADENAS[0].slug;
  ecoPush(ECO_K_CAD, [slug], 5);
  return CADENAS.find((c) => c.slug === slug);
}

// Imagen de un paso de la cadena; cae al emoji del paso si el .jpg no existe.
function CadenaImg({ slug, n, emoji }) {
  const [broken, setBroken] = useStateG(false);
  if (broken) return <span style={{ fontSize: 52, lineHeight: 1, filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.3))" }}>{emoji}</span>;
  return <img src={"assets/cadena-" + slug + "-" + n + ".jpg"} alt="" draggable={false} onError={() => setBroken(true)} style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />;
}

// Geometría R3 (lienzo 900×540): bandeja arriba · 3 huecos ordenados abajo.
const CAD_SLOT_CX = [300, 450, 600];
const CAD_SLOT_TOP = 330;
const CAD_SLOT_W = 132, CAD_SLOT_H = 150;
const CAD_HIT_PAD = 22;
const CAD_TRAY_Y = 202;
const CAD_CARD = 126, CAD_CARD_PLACED = 118;

// ═══════════════ Marco compartido de las 3 rondas (HUD, personaje, acciones) ═══════════════
function EcoFrame({ app, setApp, go, char, elapsed, starsShown, stage, enunciado, bocadillo, extraAction, feedback, feedbackMsg, onRestart, rootRef, extraClass, actionsRight = 18, children }) {
  const [confirmingExit, setConfirmingExit] = useStateG(false);
  const [confirmingRestart, setConfirmingRestart] = useStateG(false);
  function formatTime(s) { const m = Math.floor(s / 60), ss = s % 60; return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`; }
  return (
    <div ref={rootRef} className={extraClass || ""} style={{ position: "absolute", inset: 0, overflow: "hidden", WebkitTapHighlightColor: "transparent" }}>
      <TemaChipsBar app={app} setApp={setApp} />

      {/* HUD */}
      <div style={{ position: "absolute", top: 10, left: 16, right: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <EdinunLogoMini size={64} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.35)", borderRadius: 999, padding: "6px 12px", border: "1px solid rgba(242,194,96,0.4)", fontFamily: "var(--ed-font-mono)", fontSize: 13, color: "#fce9a8" }}>⏱ {formatTime(elapsed)}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.35)", borderRadius: 999, padding: "6px 12px", border: "1px solid rgba(242,194,96,0.4)", fontFamily: "var(--ed-font-display)", fontWeight: 600, color: "#fce9a8" }}>⭐ {starsShown}</div>
        </div>
      </div>

      {/* RONDA (3 etapas) */}
      <div style={{ position: "absolute", top: 52, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 8, zIndex: 4 }}>
        <span className="ed-label" style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>Ronda</span>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 11, height: 11, borderRadius: "50%", background: i < stage ? "#fce9a8" : (i === stage ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)"), boxShadow: i < stage ? "0 0 8px currentColor" : "none", color: "#fce9a8" }} />
        ))}
      </div>

      {/* Enunciado (QUÉ) */}
      <div style={{ position: "absolute", left: 150, right: 150, top: 86, textAlign: "center", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 22, color: "#fff", textShadow: "0 2px 6px rgba(0,0,0,0.55)", pointerEvents: "none", zIndex: 2 }}>
        {enunciado}
      </div>

      {/* Zona de juego (cada ronda inyecta la suya) */}
      {children}

      {/* Personaje guía + bocadillo (CÓMO) */}
      <div style={{ position: "absolute", left: 8, bottom: 78, width: 220, pointerEvents: "none", textAlign: "center" }}>
        <div className="ed-float-soft" style={{ position: "absolute", left: 0, right: 0, bottom: "100%", display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative", display: "inline-block", maxWidth: 210, background: "linear-gradient(180deg, rgba(20,12,55,0.95), rgba(10,6,35,0.95))", border: "1.5px solid rgba(242,194,96,0.65)", borderRadius: 16, padding: "10px 14px", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 14, lineHeight: 1.3, color: "#fce9a8", textAlign: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}>
            {bocadillo}
            <div style={{ position: "absolute", bottom: -10, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "9px solid transparent", borderRight: "9px solid transparent", borderTop: "10px solid rgba(20,12,55,0.95)", filter: "drop-shadow(0 1px 0 rgba(242,194,96,0.55))" }} />
          </div>
        </div>
        <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
          <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", width: 140, height: 16, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(242,194,96,0.45), transparent 70%)", filter: "blur(5px)" }} />
          <char.Component size={186} floating />
        </div>
        <div style={{ marginTop: -2, fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 14, color: "#fce9a8", letterSpacing: "0.04em", textShadow: "0 2px 6px rgba(0,0,0,0.6)" }}>{char.name}</div>
      </div>

      {/* Acciones (derecha): [extra] · REINICIAR · SALIR */}
      <div style={{ position: "absolute", right: actionsRight, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 12, width: 150 }}>
        {extraAction}
        <button className="ed-btn ed-btn-restart" onClick={() => setConfirmingRestart(true)} style={{ fontSize: 15, padding: "0 10px", height: 56, fontWeight: 800, letterSpacing: "0.04em" }}>REINICIAR</button>
        <button className="ed-btn ed-btn-ghost" onClick={() => setConfirmingExit(true)} style={{ fontSize: 15, padding: "0 10px", height: 56, fontWeight: 800, letterSpacing: "0.04em" }}>SALIR</button>
      </div>

      {/* Overlay de feedback */}
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
              <p className="ed-body" style={{ marginBottom: 16, fontSize: 14 }}>Vas a perder lo de este tema.</p>
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
              <p className="ed-body" style={{ marginBottom: 16, fontSize: 14 }}>Vas a empezar el tema desde la Ronda 1.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <button className="ed-btn ed-btn-ghost" onClick={() => setConfirmingRestart(false)} style={{ height: 44, fontWeight: 800, letterSpacing: "0.04em" }}>SEGUIR JUGANDO</button>
                <button className="ed-btn ed-btn-primary" onClick={() => { setConfirmingRestart(false); onRestart(); }} style={{ height: 44, fontWeight: 800, letterSpacing: "0.04em" }}>SÍ, REINICIAR</button>
              </div>
            </div>
          </div>
        </PortalToBody>
      )}
    </div>
  );
}

// ═══════════════ R1 · Sectores (quiz, tocar 1 de 4) ═══════════════
function SectoresRound({ app, setApp, go, char, elapsed, starsSoFar, stage, onRoundDone, onRestart }) {
  const [quiz] = useStateG(() => ecoBuildQuiz());
  const [idx, setIdx] = useStateG(0);
  const [picked, setPicked] = useStateG(null);
  const [feedback, setFeedback] = useStateG(null);
  const [feedbackMsg, setFeedbackMsg] = useStateG("");
  const [roundStars, setRoundStars] = useStateG(0);
  const roundLog = useRefG([]);
  const roundStarsRef = useRefG(0);
  const advancing = useRefG(false);
  const exStart = useRefG(Date.now());

  const act = quiz[idx];
  const answered = picked !== null;

  function answerTap(secId) {
    if (answered || advancing.current) return;
    if (typeof markFirstAttempt === "function") markFirstAttempt();
    setPicked(secId);
    const isCorrect = secId === act.sector;
    const t = Math.max(0, Math.floor((Date.now() - exStart.current) / 1000));
    roundLog.current.push({ emoji: act.e, a: act.label, userAnswer: SMAP[secId].label, correctAnswer: SMAP[act.sector].label, isCorrect, time: t });
    advancing.current = true;
    const isLast = idx + 1 >= ECO_Q;
    if (isCorrect) {
      roundStarsRef.current += 1; setRoundStars(roundStarsRef.current);
      setFeedback("ok"); setFeedbackMsg("+1 ⭐");
      setTimeout(() => next(isLast), 1050);
    } else {
      setTimeout(() => { setFeedback("err"); setFeedbackMsg(ANIMOS[idx % ANIMOS.length]); }, 1500);
      setTimeout(() => next(isLast), 2300);
    }
  }
  function next(isLast) {
    setFeedback(null); setFeedbackMsg("");
    if (isLast) { onRoundDone(roundLog.current.slice(), roundStarsRef.current); return; }
    setIdx((i) => i + 1); setPicked(null); exStart.current = Date.now(); advancing.current = false;
  }

  const enunciado = (<>¿A qué sector pertenece?{ECO_Q > 1 ? <span style={{ opacity: 0.8, fontSize: 15 }}> ({idx + 1}/{ECO_Q})</span> : null}</>);
  const bocadillo = (<>Toca el sector<br />correcto.</>);

  return (
    <EcoFrame app={app} setApp={setApp} go={go} char={char} elapsed={elapsed} starsShown={starsSoFar + roundStars} stage={stage} enunciado={enunciado} bocadillo={bocadillo} feedback={feedback} feedbackMsg={feedbackMsg} onRestart={onRestart}>
      <div style={{ position: "absolute", top: 120, bottom: 18, left: 215, right: 215, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", zIndex: 2 }}>
        {/* Actividad grande */}
        <div style={{ width: 190, minHeight: 148, borderRadius: 20, border: "3px solid #f2c260", background: "linear-gradient(180deg,#fff8e6 0%,#f7e3a8 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, padding: "14px 12px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 18px rgba(0,0,0,0.32)" }}>
          <span style={{ fontSize: 76, lineHeight: 1, filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.25))" }}>{act.e}</span>
          <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 22, color: "#3a2608" }}>{act.label}</span>
        </div>
        {/* 4 sectores */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "nowrap" }}>
          {SECTORES.map((sec) => {
            const correctOne = sec.id === act.sector;
            let bg = "linear-gradient(180deg,#fff8e6 0%,#f7e3a8 100%)", borderColor = sec.ring, nameColor = sec.ring, subColor = "#6b5836";
            if (answered) {
              if (correctOne) { borderColor = "#2ecc8f"; bg = "linear-gradient(180deg, rgba(72,224,154,0.95), rgba(26,143,95,0.92))"; nameColor = "#06381f"; subColor = "#06381f"; }
              else if (sec.id === picked) { borderColor = "#ff6b6b"; bg = "linear-gradient(180deg, rgba(255,139,139,0.92), rgba(178,47,47,0.9))"; nameColor = "#fff"; subColor = "rgba(255,255,255,0.9)"; }
              else { bg = "linear-gradient(180deg, rgba(255,248,230,0.5), rgba(247,227,168,0.5))"; nameColor = "rgba(58,38,8,0.45)"; subColor = "rgba(58,38,8,0.4)"; }
            }
            return (
              <button key={sec.id} onClick={() => answerTap(sec.id)} disabled={answered}
                style={{ width: 104, height: 88, borderRadius: 16, border: `3px solid ${borderColor}`, background: bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, padding: "6px 4px", cursor: answered ? "default" : "pointer",
                  boxShadow: answered && correctOne ? "0 0 22px rgba(46,204,143,0.6), inset 0 1px 0 rgba(255,255,255,0.4)" : "inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -3px 0 rgba(0,0,0,0.12), 0 6px 14px rgba(0,0,0,0.3)",
                  transform: answered && correctOne ? "translateY(-4px)" : "none", transition: "all 0.15s ease" }}
                title="Toca este sector">
                <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 15, color: nameColor, lineHeight: 1.05, whiteSpace: "nowrap" }}>{sec.label}</span>
                <span style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 600, fontSize: 10, color: subColor, lineHeight: 1.05 }}>{sec.sub}</span>
                {answered && correctOne && (<span style={{ fontSize: 14, fontWeight: 900, color: "#eafff4", marginTop: 1 }}>✓</span>)}
                {answered && sec.id === picked && !correctOne && (<span style={{ fontSize: 14, fontWeight: 900, color: "#fff", marginTop: 1 }}>✗</span>)}
              </button>
            );
          })}
        </div>
      </div>
    </EcoFrame>
  );
}

// ═══════════════ R2 · Servicios (deslizar cartas: izq=Bien, der=Servicio) ═══════════════
// Sale UNA carta a la vez al centro; se arrastra a la zona izquierda (📦 Bien) o
// derecha (🛎️ Servicio). Valida al soltar. Baraja de ECO_DECK cartas.
const SW_ZONES = [
  { id: "bien",     label: "Bien",     e: "📦", ring: "#f2b34a", tint: "rgba(242,179,74,0.17)", cx: 320 },
  { id: "servicio", label: "Servicio", e: "🛎️", ring: "#6fb4ff", tint: "rgba(111,180,255,0.17)", cx: 640 },
];
const SW_ZONE_TOP = 180, SW_ZONE_W = 176, SW_ZONE_H = 228, SW_HIT_PAD = 26;
const SW_CARD_X = 480, SW_CARD_Y = 294;

function ServiciosRound({ app, setApp, go, char, elapsed, starsSoFar, stage, onRoundDone, onRestart }) {
  const [deck] = useStateG(() => ecoBuildDeck());
  const [idx, setIdx] = useStateG(0);
  const [landed, setLanded] = useStateG(null);      // { side, correct }
  const [dragging, setDragging] = useStateG(false);
  const [dragXY, setDragXY] = useStateG({ x: SW_CARD_X, y: SW_CARD_Y });
  const [roundStars, setRoundStars] = useStateG(0);
  const rootRef = useRefG(null);
  const zoneRefs = useRefG([null, null]);
  const dragRef = useRefG(null);
  const roundStarsRef = useRefG(0);
  const roundLog = useRefG([]);
  const advancing = useRefG(false);
  const firstDone = useRefG(false);

  const card = deck[idx];

  function cardPos() {
    if (landed) { const z = SW_ZONES.find((zz) => zz.id === landed.side); return { x: z.cx, y: SW_ZONE_TOP + SW_ZONE_H / 2 }; }
    if (dragging) return dragXY;
    return { x: SW_CARD_X, y: SW_CARD_Y };
  }
  function onPointerDown(e) {
    if (landed || advancing.current) return;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
    const rect = rootRef.current ? rootRef.current.getBoundingClientRect() : { width: 900 };
    const scale = rect.width / 900 || 1;
    dragRef.current = { sx: e.clientX, sy: e.clientY, scale, moved: false };
    setDragging(true); setDragXY({ x: SW_CARD_X, y: SW_CARD_Y });
    if (!firstDone.current) { firstDone.current = true; if (typeof markFirstAttempt === "function") markFirstAttempt(); }
  }
  function onPointerMove(e) {
    const d = dragRef.current; if (!d) return;
    if (Math.abs(e.clientX - d.sx) + Math.abs(e.clientY - d.sy) > 4) d.moved = true;
    setDragXY({ x: SW_CARD_X + (e.clientX - d.sx) / d.scale, y: SW_CARD_Y + (e.clientY - d.sy) / d.scale });
  }
  function onPointerUp(e) {
    const d = dragRef.current; if (!d) return;
    dragRef.current = null; setDragging(false);
    let hit = null;
    for (let i = 0; i < 2; i++) {
      const el = zoneRefs.current[i]; if (!el) continue;
      const r = el.getBoundingClientRect();
      if (e.clientX >= r.left - SW_HIT_PAD && e.clientX <= r.right + SW_HIT_PAD && e.clientY >= r.top - SW_HIT_PAD && e.clientY <= r.bottom + SW_HIT_PAD) { hit = SW_ZONES[i].id; break; }
    }
    if (hit == null) { setDragXY({ x: SW_CARD_X, y: SW_CARD_Y }); return; }
    commit(hit);
  }
  function commit(side) {
    const correct = side === card.tipo;
    roundLog.current.push({ emoji: card.e, a: card.label, userAnswer: side === "servicio" ? "Servicio" : "Bien", correctAnswer: card.tipo === "servicio" ? "Servicio" : "Bien", isCorrect: correct, time: 0 });
    if (correct) { roundStarsRef.current += 1; setRoundStars(roundStarsRef.current); }
    setLanded({ side, correct });
    advancing.current = true;
    const isLast = idx + 1 >= deck.length;
    setTimeout(() => {
      if (isLast) { onRoundDone(roundLog.current.slice(), roundStarsRef.current); return; }
      setIdx((i) => i + 1); setLanded(null); setDragXY({ x: SW_CARD_X, y: SW_CARD_Y }); advancing.current = false;
    }, correct ? 900 : 1900);
  }

  const enunciado = (<>¿Es un bien o un servicio?</>);
  const bocadillo = (<>Desliza la carta<br />al lado correcto.</>);
  const pos = cardPos();

  return (
    <EcoFrame app={app} setApp={setApp} go={go} char={char} elapsed={elapsed} starsShown={starsSoFar + roundStars} stage={stage} enunciado={enunciado} bocadillo={bocadillo} onRestart={onRestart} rootRef={rootRef} extraClass="ed-noselect" actionsRight={8}>
      <style>{GAME_CSS_T}</style>
      {/* Zonas Bien / Servicio */}
      {SW_ZONES.map((z, i) => {
        const revealCorrect = landed && !landed.correct && z.id === card.tipo;
        return (
          <div key={z.id} style={{ position: "absolute", left: z.cx, top: SW_ZONE_TOP, transform: "translateX(-50%)", width: SW_ZONE_W, zIndex: 3, pointerEvents: "none" }}>
            <div ref={(el) => { zoneRefs.current[i] = el; }} style={{ width: SW_ZONE_W, height: SW_ZONE_H, borderRadius: 20, background: revealCorrect ? "rgba(46,204,143,0.2)" : z.tint, border: `4px ${revealCorrect ? "solid #2ecc8f" : "dashed " + z.ring}`, boxShadow: `inset 0 2px 12px rgba(0,0,0,0.2), 0 0 16px ${revealCorrect ? "#2ecc8f66" : z.ring + "40"}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <span style={{ fontSize: 58, opacity: 0.5, lineHeight: 1 }}>{z.e}</span>
              <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 17, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>{i === 0 ? "← " : ""}{z.label}{i === 1 ? " →" : ""}</span>
              {revealCorrect && (<span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 900, fontSize: 15, color: "#8affce" }}>✓ va aquí</span>)}
            </div>
          </div>
        );
      })}
      {/* Carta actual */}
      {card && (
        <div onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onDragStart={(e) => e.preventDefault()}
          style={{ position: "absolute", left: pos.x, top: pos.y, transform: "translate(-50%,-50%)", zIndex: dragging ? 60 : 25, touchAction: "none", cursor: landed ? "default" : (dragging ? "grabbing" : "grab"), transition: dragging ? "none" : "left 0.2s ease, top 0.2s ease", filter: dragging ? "drop-shadow(0 12px 14px rgba(0,0,0,0.42))" : "drop-shadow(0 6px 9px rgba(0,0,0,0.32))" }}>
          <div style={{ position: "relative", width: 120, height: 144, borderRadius: 18, background: landed ? (landed.correct ? "linear-gradient(180deg, rgba(72,224,154,0.95), rgba(26,143,95,0.92))" : "linear-gradient(180deg, rgba(255,139,139,0.92), rgba(178,47,47,0.9))") : "linear-gradient(180deg,#fff8e6,#f7e3a8)", border: `3px solid ${landed ? (landed.correct ? "#2ecc8f" : "#e74c3c") : "#f2c260"}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7), 0 6px 14px rgba(0,0,0,0.3)" }}>
            <span style={{ fontSize: 56, lineHeight: 1 }}>{card.e}</span>
            <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 16, color: landed ? "#fff" : "#3a2608" }}>{card.label}</span>
            {landed && (<span className="ed-checkPopT" style={{ position: "absolute", top: -8, right: -8, width: 26, height: 26, borderRadius: "50%", background: landed.correct ? "#2ecc71" : "#e74c3c", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 15, border: "2px solid #fff", boxShadow: "0 2px 5px rgba(0,0,0,0.4)" }}>{landed.correct ? "✓" : "✗"}</span>)}
          </div>
        </div>
      )}
    </EcoFrame>
  );
}

// ═══════════════ R3 · Cadena productiva (ordenar, arrastrar 1·2·3) ═══════════════
function CadenaRound({ app, setApp, go, char, elapsed, starsSoFar, stage, onRoundDone, onRestart }) {
  const [chain] = useStateG(() => ecoPickCadena());
  const cardsRef = useRefG(null);
  if (!cardsRef.current) {
    const arr = chain.steps.map((st, i) => ({ orig: i, e: st.e, label: st.label }));
    cardsRef.current = shuffle(arr).map((c, ti) => ({ ...c, tray: ti }));
  }
  const cards = cardsRef.current;

  const rootRef = useRefG(null);
  const slotRefs = useRefG([null, null, null]);
  const [placement, setPlacement] = useStateG({});   // orig -> slotIndex
  const [dragId, setDragId] = useStateG(null);
  const [dragXY, setDragXY] = useStateG({ x: 0, y: 0 });
  const [verdict, setVerdict] = useStateG(null);      // orig -> "ok"/"wrong"
  const [feedback, setFeedback] = useStateG(null);
  const [feedbackMsg, setFeedbackMsg] = useStateG("");
  const [roundStars, setRoundStars] = useStateG(0);
  const advancing = useRefG(false);
  const dragRef = useRefG(null);
  const firstDone = useRefG(false);

  function restPos(orig) {
    const slot = placement[orig];
    if (slot != null) return { x: CAD_SLOT_CX[slot], y: CAD_SLOT_TOP + CAD_SLOT_H / 2 };
    const c = cards.find((x) => x.orig === orig);
    return { x: CAD_SLOT_CX[c.tray], y: CAD_TRAY_Y };
  }
  function onPointerDown(e, orig) {
    if (verdict || advancing.current) return;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
    const rect = rootRef.current ? rootRef.current.getBoundingClientRect() : { width: 900 };
    const scale = rect.width / 900 || 1;
    const cur = restPos(orig);
    dragRef.current = { orig, sx: e.clientX, sy: e.clientY, cx: cur.x, cy: cur.y, scale, moved: false };
    setDragId(orig); setDragXY(cur);
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
    const orig = d.orig; let hit = null;
    for (let i = 0; i < 3; i++) {
      const el = slotRefs.current[i]; if (!el) continue;
      const r = el.getBoundingClientRect();
      if (e.clientX >= r.left - CAD_HIT_PAD && e.clientX <= r.right + CAD_HIT_PAD && e.clientY >= r.top - CAD_HIT_PAD && e.clientY <= r.bottom + CAD_HIT_PAD) { hit = i; break; }
    }
    if (hit != null) setPlacement((p) => { const n = {}; Object.keys(p).forEach((k) => { if (p[k] !== hit) n[k] = p[k]; }); n[orig] = hit; return n; });
    else if (d.moved) setPlacement((p) => { const n = { ...p }; delete n[orig]; return n; });
  }

  const allPlaced = cards.every((c) => placement[c.orig] != null);

  function onVerify() {
    if (!allPlaced || verdict || advancing.current) return;
    const vd = {}; let ok = 0; const log = [];
    cards.forEach((c) => {
      const correct = placement[c.orig] === c.orig;
      vd[c.orig] = correct ? "ok" : "wrong";
      if (correct) ok++;
      log.push({ emoji: c.e, a: `${chain.title} · ${c.label}`, userAnswer: SECTORES[placement[c.orig]].label, correctAnswer: SECTORES[c.orig].label, isCorrect: correct, time: 0 });
    });
    const perfect = ok === cards.length;
    setVerdict(vd); setRoundStars(ok); advancing.current = true;
    const revealMs = perfect ? 950 : 2800;
    setTimeout(() => { if (perfect) { setFeedback("ok"); setFeedbackMsg(`+${ok} ⭐`); } else { setFeedback("err"); setFeedbackMsg(ANIMOS[Math.floor(Math.random() * ANIMOS.length)]); } }, revealMs);
    setTimeout(() => { setFeedback(null); setFeedbackMsg(""); onRoundDone(log, ok); }, revealMs + 1600);
  }

  const enunciado = (<>Ordena cómo llega <b>{chain.title}</b> hasta ti.</>);
  const bocadillo = (<>Arrastra a su<br />lugar.</>);
  const extraAction = (<button className="ed-btn ed-btn-verify" onClick={onVerify} disabled={!allPlaced || !!verdict} style={{ height: 56, fontSize: 16, fontWeight: 800, letterSpacing: "0.04em", opacity: (allPlaced && !verdict) ? 1 : 0.5, cursor: (allPlaced && !verdict) ? "pointer" : "not-allowed" }}>¡VERIFICAR!</button>);

  return (
    <EcoFrame app={app} setApp={setApp} go={go} char={char} elapsed={elapsed} starsShown={starsSoFar + roundStars} stage={stage} enunciado={enunciado} bocadillo={bocadillo} extraAction={extraAction} feedback={feedback} feedbackMsg={feedbackMsg} onRestart={onRestart} rootRef={rootRef} extraClass="ed-noselect">
      <style>{GAME_CSS_T}</style>
      {/* Aviso "completo" en el hueco de la bandeja cuando ya no quedan cartas arriba */}
      {allPlaced && !verdict && (
        <div style={{ position: "absolute", left: 150, right: 180, top: CAD_TRAY_Y - 20, textAlign: "center", pointerEvents: "none", zIndex: 5 }}>
          <span className="ed-checkPopT" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(46,204,143,0.18)", border: "2px solid #2ecc8f", borderRadius: 999, padding: "9px 22px", fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 18, color: "#8affce", textShadow: "0 1px 3px rgba(0,0,0,0.55)" }}>✅ ¡Todo en su lugar!</span>
        </div>
      )}
      {/* Huecos ordenados (1·2·3 = primario/secundario/terciario) */}
      {SECTORES.slice(0, 3).map((sec, i) => (
        <div key={i} style={{ position: "absolute", left: CAD_SLOT_CX[i], top: CAD_SLOT_TOP, transform: "translateX(-50%)", width: CAD_SLOT_W, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, zIndex: 3, pointerEvents: "none" }}>
          <div ref={(el) => { slotRefs.current[i] = el; }} style={{ position: "relative", width: CAD_SLOT_W, height: CAD_SLOT_H, borderRadius: 18, background: sec.tint, border: `4px dashed ${sec.bright}`, boxShadow: `inset 0 2px 12px rgba(0,0,0,0.2), 0 0 16px ${sec.bright}44`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 900, fontSize: 40, color: "rgba(255,255,255,0.22)" }}>{i + 1}</span>
          </div>
          <div style={{ background: "rgba(10,6,35,0.72)", border: `2px solid ${sec.ring}`, borderRadius: 999, padding: "3px 12px", fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 12, color: "#fff", whiteSpace: "nowrap" }}>{i + 1}. {sec.label}</div>
        </div>
      ))}
      {/* Tarjetas (imagen + etiqueta) */}
      {cards.map((c) => {
        const dragging = dragId === c.orig;
        const placed = placement[c.orig] != null && !dragging;
        const pos = dragging ? dragXY : restPos(c.orig);
        const v = verdict && verdict[c.orig];
        const size = placed ? CAD_CARD_PLACED : CAD_CARD;
        const locked = !!verdict;
        return (
          <div key={c.orig} onPointerDown={(e) => onPointerDown(e, c.orig)} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onDragStart={(e) => e.preventDefault()}
            style={{ position: "absolute", left: pos.x, top: pos.y, transform: "translate(-50%,-50%)", zIndex: dragging ? 60 : (v === "wrong" ? 20 : (placed ? 12 : 15)), touchAction: "none", cursor: locked ? "default" : (dragging ? "grabbing" : "grab"), transition: dragging ? "none" : "left 0.18s ease, top 0.18s ease", filter: dragging ? "drop-shadow(0 10px 12px rgba(0,0,0,0.4))" : "drop-shadow(0 5px 7px rgba(0,0,0,0.3))" }}>
            <div style={{ position: "relative", width: size, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ position: "relative", width: size, height: size, borderRadius: 14, overflow: "hidden", background: "linear-gradient(180deg,#fff8e6,#f7e3a8)", border: `3px solid ${v === "ok" ? "#2ecc8f" : (v === "wrong" ? "#e74c3c" : "#f2c260")}`, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7), 0 5px 12px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CadenaImg slug={chain.slug} n={c.orig + 1} emoji={c.e} />
                {v === "ok" && (<div className="ed-checkPopT" style={{ position: "absolute", top: 4, right: 4, width: 24, height: 24, borderRadius: "50%", background: "#2ecc71", color: "#fff", fontWeight: 900, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 5px rgba(0,0,0,0.45)", border: "2px solid #fff" }}>✓</div>)}
                {v === "wrong" && (<div className="ed-checkPopT" style={{ position: "absolute", top: 4, right: 4, width: 24, height: 24, borderRadius: "50%", background: "#e74c3c", color: "#fff", fontWeight: 900, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 5px rgba(0,0,0,0.45)", border: "2px solid #fff" }}>✗</div>)}
              </div>
              <span style={{ marginTop: 2, fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 12, color: "#fce9a8", textShadow: "0 1px 3px rgba(0,0,0,0.7)", whiteSpace: "nowrap" }}>{c.label}</span>
              {v === "wrong" && (<span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 11, color: "#ffd27a", textShadow: "0 1px 3px rgba(0,0,0,0.8)", whiteSpace: "nowrap" }}>➜ {c.orig + 1}. {SECTORES[c.orig].label}</span>)}
            </div>
          </div>
        );
      })}
    </EcoFrame>
  );
}

// ═══════════════ Orquestador del Tema 3 (encadena R1 → R2 → R3) ═══════════════
function EconomiaGame({ app, setApp, go }) {
  const char = CHARACTERS.find((c) => c.id === app.character) || CHARACTERS[0];
  const [phase, setPhase] = useStateG(0);         // 0=sectores · 1=servicios · 2=cadena
  const [starsAcc, setStarsAcc] = useStateG(0);
  const [elapsed, setElapsed] = useStateG(0);
  const [restartId, setRestartId] = useStateG(0);
  const started = useRefG(Date.now());
  const logRef = useRefG([]);

  useEffectG(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - started.current) / 1000)), 500);
    return () => clearInterval(id);
  }, []);

  function onRoundDone(roundLog, roundStars) {
    const base = logRef.current.length;
    roundLog.forEach((e, i) => { e.idx = base + i + 1; });
    logRef.current = logRef.current.concat(roundLog);
    const newStars = starsAcc + roundStars;
    setStarsAcc(newStars);
    if (phase >= 2) finalize(newStars);
    else setPhase((p) => p + 1);
  }
  function finalize(finalStars) {
    const solved = logRef.current.filter((e) => e.isCorrect).length;
    setApp((s) => ({
      ...s, stars: (s.stars || 0) + finalStars,
      lastResult: {
        category: app.currentCatLabel || "Economía",
        solved, total: logRef.current.length,
        time: Math.floor((Date.now() - started.current) / 1000),
        starsEarned: finalStars, log: logRef.current.slice(),
      },
    }));
    if (typeof incrementGamesCompleted === "function") incrementGamesCompleted();
    go("results");
  }
  function restartTheme() {
    logRef.current = []; setStarsAcc(0); started.current = Date.now();
    setPhase(0); setRestartId((x) => x + 1);
  }

  const shared = { app, setApp, go, char, elapsed, starsSoFar: starsAcc, stage: phase, onRoundDone, onRestart: restartTheme };
  if (phase === 0) return <SectoresRound key={"r1-" + restartId} {...shared} />;
  if (phase === 1) return <ServiciosRound key={"r2-" + restartId} {...shared} />;
  return <CadenaRound key={"r3-" + restartId} {...shared} />;
}

// ═══════════════════════════════════════════════════════════════════════
// TEMA 4 · "Transporte y movilidad" — TRIVIA RUSH (opción múltiple · 13 años)
// Preguntas del libro (TEMA 4 "Transporte y movilidad en Ecuador"): la respuesta
// correcta sale del TEXTO; los distractores son opciones plausibles incorrectas
// (igual que el propio ejercicio V/F del libro). Cronómetro + RACHA 🔥 + puntos
// → rápido, adictivo, replayable. ⚠ NO inventar datos: la correcta es del libro.
// ═══════════════════════════════════════════════════════════════════════
const TRIVIA_N = 4;   // preguntas por partida
const TRIVIA_K = "edinun_juego5_movilidad_recientes_v1";
const PREGUNTAS_MOV = [
  { q: "¿Cuántos vehículos había en Ecuador en 2021?", ok: "2,3 millones", op: ["2,3 millones", "1 millón", "5 millones", "10 millones"] },
  { q: "En 2021, ¿qué porcentaje de los vehículos eran carros particulares?", ok: "90 %", op: ["90 %", "50 %", "70 %", "30 %"] },
  { q: "¿En qué año Ecuador impulsó la Política Nacional de Movilidad Urbana Sostenible?", ok: "2023", op: ["2023", "2021", "2030", "2050"] },
  { q: "¿Con el apoyo de quién se impulsó esa política?", ok: "La Unión Europea", op: ["La Unión Europea", "Naciones Unidas", "Estados Unidos", "El Banco Mundial"] },
  { q: "Según la ONU, ¿cuánto crecerá la población de las ciudades para 2030?", ok: "68 %", op: ["68 %", "30 %", "90 %", "50 %"] },
  { q: "¿Hasta qué año se prevé cumplir los objetivos de esa política?", ok: "2050", op: ["2050", "2030", "2025", "2040"] },
  { q: "¿Qué artículo de la Constitución garantiza la libertad de transporte?", ok: "Artículo 394", op: ["Artículo 394", "Artículo 66", "Artículo 100", "Artículo 200"] },
  { q: "¿Cuál de estas NO busca atender la Política de Movilidad Sostenible?", ok: "Las ventas ambulantes", op: ["Las ventas ambulantes", "Los accidentes de tránsito", "El acoso sexual", "Los tiempos de viaje"] },
  { q: "Según el artículo 394, ¿qué transporte debe promover el Estado?", ok: "El transporte público masivo", op: ["El transporte público masivo", "Solo el transporte privado", "Solo el transporte aéreo", "El transporte de lujo"] },
  { q: "¿Cuál es un inconveniente del transporte que menciona el libro?", ok: "La contaminación", op: ["La contaminación", "El exceso de bicicletas", "La falta de aviones", "El bajo número de autos"] },
  { q: "La Política de Movilidad Sostenible busca la evitación de…", ok: "el acoso sexual", op: ["el acoso sexual", "el transporte público", "las bicicletas", "los semáforos"] },
  { q: "¿Qué garantiza el artículo 394 sobre el transporte?", ok: "Libertad de transporte, sin privilegios", op: ["Libertad de transporte, sin privilegios", "Transporte solo para el Estado", "Transporte solo de pago", "Prohibir el transporte privado"] },
  { q: "¿Qué tipos de transporte nombra el artículo 394?", ok: "Terrestre, aéreo, marítimo y fluvial", op: ["Terrestre, aéreo, marítimo y fluvial", "Solo terrestre", "Solo aéreo y marítimo", "Solo el público"] },
  { q: "Según el texto, ¿qué genera mayores presiones sobre el transporte?", ok: "El crecimiento de la población", op: ["El crecimiento de la población", "La falta de aviones", "El exceso de bicicletas", "La bajada de los precios"] },
  { q: "¿De qué depende la capacidad de movilizarse de las personas?", ok: "Del acceso a los medios de transporte", op: ["Del acceso a los medios de transporte", "Del color del auto", "De la edad de la persona", "Del clima del día"] },
  { q: "Según el artículo 394, ¿qué debe hacer el Estado con las tarifas?", ok: "Establecer tarifas diferenciadas", op: ["Establecer tarifas diferenciadas", "Cobrar lo mismo a todos", "No cobrar nada", "Prohibir el pago"] },
  { q: "¿Cuál es un objetivo de la Política de Movilidad Sostenible?", ok: "Reducir los tiempos de viaje", op: ["Reducir los tiempos de viaje", "Aumentar los accidentes", "Subir la contaminación", "Reducir el transporte público"] },
  { q: "Según el texto, ¿quiénes deben poder acceder al transporte público?", ok: "Toda la población", op: ["Toda la población", "Solo los adultos", "Solo quienes tienen auto", "Solo en las ciudades"] },
];
function triviaBuild() {
  const recent = ecoRecent(TRIVIA_K);
  const chosen = ecoPickFresh(PREGUNTAS_MOV.map((_, i) => i), recent, TRIVIA_N, []);
  ecoPush(TRIVIA_K, chosen, 10);
  return chosen.map((i) => { const p = PREGUNTAS_MOV[i]; const op = shuffle(p.op); return { q: p.q, op, correcta: op.indexOf(p.ok), ok: p.ok }; });
}

function TriviaGame({ app, setApp, go }) {
  const char = CHARACTERS.find((c) => c.id === app.character) || CHARACTERS[0];
  const [quiz, setQuiz] = useStateG(() => triviaBuild());
  const [idx, setIdx] = useStateG(0);
  const [picked, setPicked] = useStateG(null);
  const [feedback, setFeedback] = useStateG(null);
  const [feedbackMsg, setFeedbackMsg] = useStateG("");
  const [racha, setRacha] = useStateG(0);
  const [score, setScore] = useStateG(0);
  const [elapsed, setElapsed] = useStateG(0);
  const [confirmingExit, setConfirmingExit] = useStateG(false);
  const [confirmingRestart, setConfirmingRestart] = useStateG(false);
  const started = useRefG(Date.now());
  const exStart = useRefG(Date.now());
  const advancing = useRefG(false);
  const logRef = useRefG([]);
  const rachaRef = useRefG(0);
  const maxRachaRef = useRefG(0);
  const scoreRef = useRefG(0);
  const correctRef = useRefG(0);

  const q = quiz[idx];
  const answered = picked !== null;

  useEffectG(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - started.current) / 1000)), 500);
    return () => clearInterval(id);
  }, []);

  function formatTime(s) { const m = Math.floor(s / 60), ss = s % 60; return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`; }

  function confirmRestart() {
    setConfirmingRestart(false); advancing.current = false;
    setQuiz(triviaBuild());
    setIdx(0); setPicked(null); setFeedback(null); setFeedbackMsg(""); setRacha(0); setScore(0);
    rachaRef.current = 0; maxRachaRef.current = 0; scoreRef.current = 0; correctRef.current = 0; logRef.current = [];
    started.current = Date.now(); exStart.current = Date.now();
  }

  function answerTap(i) {
    if (answered || advancing.current) return;
    if (typeof markFirstAttempt === "function") markFirstAttempt();
    setPicked(i);
    const isCorrect = i === q.correcta;
    const t = Math.max(0, Math.floor((Date.now() - exStart.current) / 1000));
    logRef.current.push({ emoji: "🚦", a: q.q, userAnswer: q.op[i], correctAnswer: q.ok, isCorrect, time: t });
    advancing.current = true;
    const isLast = idx + 1 >= quiz.length;
    if (isCorrect) {
      rachaRef.current += 1;
      if (rachaRef.current > maxRachaRef.current) maxRachaRef.current = rachaRef.current;
      const pts = 100 + (rachaRef.current - 1) * 20;
      scoreRef.current += pts; correctRef.current += 1;
      setRacha(rachaRef.current); setScore(scoreRef.current);
      setApp((s) => ({ ...s, stars: (s.stars || 0) + 1 }));
      setFeedback("ok");
      setFeedbackMsg(rachaRef.current >= 2 ? `+${pts} · ¡Racha ${rachaRef.current}! 🔥` : `+${pts}`);
      setTimeout(() => next(isLast), 1000);
    } else {
      rachaRef.current = 0; setRacha(0);
      setTimeout(() => { setFeedback("err"); setFeedbackMsg("¡Se cortó la racha! Mira la correcta."); }, 1400);
      setTimeout(() => next(isLast), 2200);
    }
  }
  function next(isLast) {
    setFeedback(null); setFeedbackMsg("");
    if (isLast) { finalize(); return; }
    setIdx((n) => n + 1); setPicked(null); exStart.current = Date.now(); advancing.current = false;
  }
  function finalize() {
    setApp((s) => ({
      ...s,
      lastResult: {
        category: app.currentCatLabel || "Transporte y movilidad",
        solved: correctRef.current, total: quiz.length,
        time: Math.floor((Date.now() - started.current) / 1000),
        starsEarned: correctRef.current, log: logRef.current.slice(),
        score: scoreRef.current, maxRacha: maxRachaRef.current,
      },
    }));
    if (typeof incrementGamesCompleted === "function") incrementGamesCompleted();
    go("results");
  }

  const OPT_BADGE = ["#7b3ff2", "#2773d8", "#e0940f", "#2ecc8f"];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <TemaChipsBar app={app} setApp={setApp} />

      {/* HUD: logo · ⏱ · 🔥 racha · 🏆 puntos */}
      <div style={{ position: "absolute", top: 10, left: 16, right: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <EdinunLogoMini size={64} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.35)", borderRadius: 999, padding: "6px 12px", border: "1px solid rgba(242,194,96,0.4)", fontFamily: "var(--ed-font-mono)", fontSize: 13, color: "#fce9a8" }}>⏱ {formatTime(elapsed)}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: racha >= 2 ? "rgba(255,120,40,0.28)" : "rgba(0,0,0,0.35)", borderRadius: 999, padding: "6px 12px", border: `1px solid ${racha >= 2 ? "rgba(255,150,60,0.85)" : "rgba(242,194,96,0.4)"}`, fontFamily: "var(--ed-font-display)", fontWeight: 700, color: racha >= 2 ? "#ffd27a" : "#fce9a8" }}>🔥 {racha}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.35)", borderRadius: 999, padding: "6px 12px", border: "1px solid rgba(242,194,96,0.4)", fontFamily: "var(--ed-font-display)", fontWeight: 700, color: "#fce9a8" }}>🏆 {score}</div>
        </div>
      </div>

      {/* Progreso */}
      <div style={{ position: "absolute", top: 52, left: "50%", transform: "translateX(-50%)", fontFamily: "var(--ed-font-ui)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)" }}>
        Pregunta {idx + 1} / {quiz.length}
      </div>

      {/* Enunciado = la pregunta (QUÉ) */}
      <div style={{ position: "absolute", left: 200, right: 190, top: 100, textAlign: "center", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 22, lineHeight: 1.18, color: "#fff", textShadow: "0 2px 6px rgba(0,0,0,0.55)", pointerEvents: "none" }}>
        {q.q}
      </div>

      {/* 4 opciones (2×2 · tamaño medio, centradas verticalmente, tipo Kahoot) */}
      <div style={{ position: "absolute", left: 225, right: 180, top: 132, bottom: 22, display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 14, rowGap: 28, alignContent: "center" }}>
        {q.op.map((opt, i) => {
          const correctOne = i === q.correcta;
          let bg = "linear-gradient(180deg,#fff8e6,#f7e3a8)", border = "#f2c260", color = "#3a2608", badge = OPT_BADGE[i];
          if (answered) {
            if (correctOne) { bg = "linear-gradient(180deg, rgba(72,224,154,0.95), rgba(26,143,95,0.92))"; border = "#2ecc8f"; color = "#06381f"; badge = "#1a8f5f"; }
            else if (i === picked) { bg = "linear-gradient(180deg, rgba(255,139,139,0.92), rgba(178,47,47,0.9))"; border = "#ff6b6b"; color = "#fff"; badge = "#b22f2f"; }
            else { bg = "linear-gradient(180deg, rgba(255,248,230,0.45), rgba(247,227,168,0.45))"; color = "rgba(58,38,8,0.5)"; badge = "rgba(90,90,90,0.5)"; }
          }
          return (
            <button key={i} className="ed-optbtn" onClick={() => answerTap(i)} disabled={answered}
              style={{ display: "flex", alignItems: "center", minHeight: 104, gap: 13, padding: "10px 18px", borderRadius: 18, border: `3px solid ${border}`, background: bg, cursor: answered ? "default" : "pointer", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6), 0 6px 14px rgba(0,0,0,0.3)", textAlign: "left", transition: "all 0.14s ease" }}>
              <span style={{ flexShrink: 0, width: 36, height: 36, borderRadius: "50%", background: badge, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 18 }}>{"ABCD"[i]}</span>
              <span style={{ flex: 1, fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 17, color, lineHeight: 1.16 }}>{opt}</span>
              {answered && correctOne && (<span style={{ fontSize: 22, fontWeight: 900, color: "#eafff4" }}>✓</span>)}
              {answered && i === picked && !correctOne && (<span style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>✗</span>)}
            </button>
          );
        })}
      </div>

      {/* Personaje guía + bocadillo (CÓMO, fijo) */}
      <div style={{ position: "absolute", left: 8, bottom: 78, width: 210, pointerEvents: "none", textAlign: "center" }}>
        <div className="ed-float-soft" style={{ position: "absolute", left: 0, right: 0, bottom: "100%", display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative", display: "inline-block", maxWidth: 200, background: "linear-gradient(180deg, rgba(20,12,55,0.95), rgba(10,6,35,0.95))", border: "1.5px solid rgba(242,194,96,0.65)", borderRadius: 16, padding: "10px 14px", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 14, lineHeight: 1.3, color: "#fce9a8", textAlign: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}>
            Toca la respuesta<br />correcta.
            <div style={{ position: "absolute", bottom: -10, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "9px solid transparent", borderRight: "9px solid transparent", borderTop: "10px solid rgba(20,12,55,0.95)", filter: "drop-shadow(0 1px 0 rgba(242,194,96,0.55))" }} />
          </div>
        </div>
        <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
          <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", width: 130, height: 16, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(242,194,96,0.45), transparent 70%)", filter: "blur(5px)" }} />
          <char.Component size={172} floating />
        </div>
        <div style={{ marginTop: -2, fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 14, color: "#fce9a8", letterSpacing: "0.04em", textShadow: "0 2px 6px rgba(0,0,0,0.6)" }}>{char.name}</div>
      </div>

      {/* Acciones (bajadas para alinear con el bloque de respuestas) */}
      <div style={{ position: "absolute", right: 18, top: "60%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 12, width: 150 }}>
        <button className="ed-btn ed-btn-restart" onClick={() => setConfirmingRestart(true)} style={{ fontSize: 15, padding: "0 10px", height: 56, fontWeight: 800, letterSpacing: "0.04em" }}>REINICIAR</button>
        <button className="ed-btn ed-btn-ghost" onClick={() => setConfirmingExit(true)} style={{ fontSize: 15, padding: "0 10px", height: 56, fontWeight: 800, letterSpacing: "0.04em" }}>SALIR</button>
      </div>

      {/* Overlay */}
      {feedback && (
        <PortalToBody>
          <div style={{ position: "fixed", inset: 0, zIndex: 1000, pointerEvents: "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)", animation: "ed-pop-in 0.3s" }}>
            <div style={{ fontFamily: "'Fredoka','Baloo 2',system-ui,sans-serif", fontWeight: 700, fontSize: "clamp(52px, 10vmin, 110px)", color: feedback === "ok" ? "#2ecc8f" : "#ff6b6b", textShadow: "0 4px 0 rgba(0,0,0,0.45), 0 0 60px currentColor" }}>{feedback === "ok" ? "¡CORRECTO!" : "¡UPS!"}</div>
            {feedbackMsg && (<div style={{ fontFamily: "'Fredoka','Baloo 2',system-ui,sans-serif", fontWeight: 700, fontSize: "clamp(18px, 2.6vmin, 30px)", color: feedback === "ok" ? "#ffd27a" : "#fff", background: "rgba(0,0,0,0.55)", padding: "8px 26px", borderRadius: 999, textShadow: "0 2px 6px rgba(0,0,0,0.6)", textAlign: "center" }}>{feedbackMsg}</div>)}
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
              <p className="ed-body" style={{ marginBottom: 16, fontSize: 14 }}>Vas a perder tu puntaje de esta partida.</p>
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

// ═══════════════ Despachador por tema ═══════════════
function GameScreen({ app, setApp, go }) {
  if (app.currentCategory === "transporte") return <TransporteGame app={app} setApp={setApp} go={go} />;
  if (app.currentCategory === "economia") return <EconomiaGame app={app} setApp={setApp} go={go} />;
  if (app.currentCategory === "movilidad") return <TriviaGame app={app} setApp={setApp} go={go} />;
  return <PersonasGame app={app} setApp={setApp} go={go} />;
}

Object.assign(window, { GameScreen, ResultsScreen });
