// screens.jsx — JUEGO-4 · "Mi escuela y mi barrio" (Estudios Sociales · 6 años).
// Juego MULTI-TEMA: el Home muestra N BOTONES = N temas del libro (patrón EDINUN).
// El niño elige un tema (chip) + su nombre → CharacterScreen (Andi preseleccionado) →
// GameScreen lee app.currentCategory para saber qué mini-juego montar.
// Aquí sólo se personalizan textos/glifos y la config de temas (LEVELS_CFG).
// La lógica del contador de visitas NO se toca (idéntica en todos los juegos).

const { useState, useEffect, useRef, useMemo } = React;

// ─────────────────────────────────────────────────────────────
// Config de TEMAS (un botón por entrada). Cada tema define su chip y el
// catLabel que GameScreen/ResultsScreen leen. `enabled:false` = "Próximamente".
//   · emergencias → TEMA 1 "Estar preparados" (mecánica ORDENAR, implementado).
//   · tema2/tema3 → placeholders; se activarán cuando la autora mande sus láminas.
// ─────────────────────────────────────────────────────────────
const LEVELS_CFG = [
  {
    id: "emergencias",
    label: "Estar preparados",
    grad: "linear-gradient(180deg, #ffd27a, #e0842a)",
    ink: "#3a2205",
    description: "Ordena qué hacer en una emergencia.",
    catLabel: "Estar preparados",
    enabled: true,
  },
  {
    id: "tema2",
    label: "Tema 2",
    grad: "linear-gradient(180deg, #ffe97a, #d7b12a)",
    ink: "#3a2608",
    description: "Próximamente.",
    catLabel: "Tema 2",
    enabled: false,
  },
  {
    id: "tema3",
    label: "Tema 3",
    grad: "linear-gradient(180deg, #7ab8ff, #2773d8)",
    ink: "#08264d",
    description: "Próximamente.",
    catLabel: "Tema 3",
    enabled: false,
  },
];

// ─────────────────────────────────────────────────────────────
// Fondo cósmico + glifos flotantes — temática "cuido mi entorno" (reciclaje/naturaleza).
// ─────────────────────────────────────────────────────────────
function CosmosBg({ variant = "cosmic", glyphSize }) {
  const glyphsStyle = glyphSize ? { fontSize: glyphSize + "px" } : undefined;
  if (variant === "chalkboard") {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, #3a9b7a 0%, #1d6b53 55%, #0b3a2d 100%)",
          overflow: "hidden",
        }}
      >
        <div className="ed-glyphs" style={{ color: "rgba(255,255,255,0.10)", ...glyphsStyle }}>
          <span style={{ left: "6%", top: "12%", "--rot": "-8deg", fontSize: "0.62em" }}>🏫</span>
          <span style={{ left: "82%", top: "16%", "--rot": "6deg", fontSize: "0.6em" }}>🚸</span>
          <span style={{ left: "10%", top: "78%", "--rot": "12deg", fontSize: "0.6em" }}>🧯</span>
          <span style={{ left: "88%", top: "72%", "--rot": "-10deg", fontSize: "0.6em" }}>🎒</span>
          <span style={{ left: "45%", top: "8%", "--rot": "4deg", fontSize: "0.5em" }}>★</span>
          <span style={{ left: "3%", top: "45%", "--rot": "-4deg", fontSize: "0.6em" }}>🗺️</span>
          <span style={{ left: "92%", top: "45%", "--rot": "8deg", fontSize: "0.6em" }}>🛡️</span>
          <span style={{ left: "30%", top: "55%", "--rot": "-6deg", fontSize: "0.5em" }}>⛑️</span>
          <span style={{ left: "70%", top: "62%", "--rot": "8deg", fontSize: "0.5em" }}>📋</span>
          <span style={{ left: "55%", top: "30%", "--rot": "-4deg", fontSize: "0.5em" }}>🚦</span>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="ed-cosmos" />
      <div className="ed-glyphs" style={glyphsStyle}>
        <span style={{ left: "5%", top: "10%", "--rot": "-8deg", fontSize: "0.72em" }}>🏫</span>
        <span style={{ left: "84%", top: "6%", "--rot": "6deg", fontSize: "0.66em" }}>🚸</span>
        <span style={{ left: "92%", top: "72%", "--rot": "-12deg", fontSize: "0.64em" }}>🧯</span>
        <span style={{ left: "3%", top: "82%", "--rot": "12deg", fontSize: "0.66em" }}>🎒</span>
        <span style={{ left: "46%", top: "4%", "--rot": "-4deg", fontSize: "0.5em" }}>★</span>
        <span style={{ left: "7%", top: "46%", "--rot": "-4deg", fontSize: "0.6em" }}>🗺️</span>
        <span style={{ left: "88%", top: "40%", "--rot": "8deg", fontSize: "0.56em" }}>🛡️</span>
        <span style={{ left: "22%", top: "22%", "--rot": "10deg", fontSize: "0.52em" }}>⛑️</span>
        <span style={{ left: "70%", top: "24%", "--rot": "-6deg", fontSize: "0.58em" }}>📋</span>
        <span style={{ left: "32%", top: "70%", "--rot": "8deg", fontSize: "0.56em" }}>🚦</span>
        <span style={{ left: "62%", top: "78%", "--rot": "-10deg", fontSize: "0.52em" }}>🧭</span>
        <span style={{ left: "18%", top: "58%", "--rot": "14deg", fontSize: "0.5em" }}>★</span>
        <span style={{ left: "78%", top: "56%", "--rot": "-8deg", fontSize: "0.5em" }}>🎒</span>
        <span style={{ left: "50%", top: "88%", "--rot": "4deg", fontSize: "0.52em" }}>🚸</span>
        <span style={{ left: "40%", top: "38%", "--rot": "-6deg", fontSize: "0.5em" }}>🏫</span>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Contador de visitas — endpoint PHP del lado servidor con fallback localStorage.
// NO PERSONALIZAR: idéntico en todos los juegos del repo.
// ─────────────────────────────────────────────────────────────
const VISITOR_ENDPOINT = "counter.php"; // relativo a index.html del juego
const VISITOR_KEY = "edinun_visitors_v1";
const VISITOR_SESSION_FLAG = "edinun_visit_counted_v1";

async function fetchVisitorCount(opts) {
  const inc = opts && opts.increment;
  const url = inc ? VISITOR_ENDPOINT + "?inc=1" : VISITOR_ENDPOINT;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("counter http " + res.status);
  const text = (await res.text()).trim();
  let count;
  try {
    const data = JSON.parse(text);
    count = data && typeof data.count === "number" ? data.count : Number(data);
  } catch (e) {
    count = Number(text);
  }
  if (!Number.isFinite(count)) throw new Error("counter invalid payload");
  return count;
}

function readLocalVisitorCount() {
  const raw = localStorage.getItem(VISITOR_KEY);
  const v = raw ? parseInt(raw, 10) : 0;
  return isNaN(v) ? 0 : v;
}

function writeLocalVisitorCount(n) {
  localStorage.setItem(VISITOR_KEY, String(n));
}

function useVisitorCount() {
  const [n, setN] = useState(() => readLocalVisitorCount());

  useEffect(() => {
    let cancelled = false;
    fetchVisitorCount()
      .then((count) => {
        if (cancelled) return;
        setN(count);
        writeLocalVisitorCount(count);
      })
      .catch(() => { /* fallback localStorage ya cargado en el initializer */ });

    function onUpdate(ev) {
      const value = ev && ev.detail && ev.detail.count;
      if (typeof value === "number") setN(value);
      else setN(readLocalVisitorCount());
    }
    window.addEventListener("edinun:visitors-updated", onUpdate);
    return () => {
      cancelled = true;
      window.removeEventListener("edinun:visitors-updated", onUpdate);
    };
  }, []);

  return n;
}

function markFirstAttempt() {
  if (sessionStorage.getItem(VISITOR_SESSION_FLAG) === "1") return;
  sessionStorage.setItem(VISITOR_SESSION_FLAG, "1");

  fetchVisitorCount({ increment: true })
    .then((count) => {
      writeLocalVisitorCount(count);
      window.dispatchEvent(new CustomEvent("edinun:visitors-updated", { detail: { count } }));
    })
    .catch(() => {
      const next = readLocalVisitorCount() + 1;
      writeLocalVisitorCount(next);
      window.dispatchEvent(new CustomEvent("edinun:visitors-updated", { detail: { count: next } }));
    });
}

function PeopleIcon({ size = 18, color = "#fce9a8" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="8" cy="7" r="3" fill={color} />
      <circle cx="16" cy="7" r="3" fill={color} opacity="0.85" />
      <path d="M2 20c0-3.3 2.7-6 6-6s6 2.7 6 6v1H2v-1z" fill={color} />
      <path d="M14 20c0-2 -.7-3.8-1.8-5.2 1-.5 2.1-.8 3.3-.8 3.3 0 6 2.7 6 6v1H14v-1z" fill={color} opacity="0.85" />
    </svg>
  );
}

function incrementGamesCompleted() {
  const KEY = "edinun_games_completed_v1";
  const raw = localStorage.getItem(KEY);
  const next = (raw ? parseInt(raw, 10) : 0) + 1;
  localStorage.setItem(KEY, String(next));
  window.dispatchEvent(new Event("edinun:games-updated"));
  return next;
}

// ─────────────────────────────────────────────────────────────
// 1. PANTALLA DE INICIO — 2 botones de tema + nombre + ENTRAR.
// El niño debe elegir un tema HABILITADO y escribir su nombre para entrar.
// ─────────────────────────────────────────────────────────────
function HomeScreen({ app, setApp, go }) {
  const visitors = useVisitorCount();
  const [name, setName] = useState(app.studentName || "");
  const initial = app.level && LEVELS_CFG.some((l) => l.id === app.level && l.enabled) ? app.level : "emergencias";
  const [level, setLevel] = useState(initial);

  const currentCfg = LEVELS_CFG.find((l) => l.id === level) || null;
  const canStart = !!name.trim() && !!currentCfg && currentCfg.enabled;

  function start() {
    if (!canStart) return;
    setApp((s) => ({ ...s, studentName: name.trim(), level, sessionStart: Date.now() }));
    go("character");
  }

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* Contador de visitantes */}
      <div style={{ position: "absolute", bottom: 18, right: 22, display: "flex", alignItems: "center", gap: 8, background: "rgba(10,6,35,0.55)", border: "1px solid rgba(242,194,96,0.3)", borderRadius: 999, padding: "6px 12px", backdropFilter: "blur(8px)" }}>
        <PeopleIcon size={16} color="#fce9a8" />
        <div style={{ fontFamily: "var(--ed-font-mono)", fontSize: 11, color: "#f2c260", letterSpacing: "0.06em" }}>
          {visitors.toLocaleString("es-CO")}
          <span style={{ color: "rgba(246,241,255,0.55)", marginLeft: 6 }}>visitas</span>
        </div>
      </div>

      <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "1fr 1.15fr", alignItems: "center", padding: "34px 52px", gap: 34 }}>
        {/* Izquierda — logo */}
        <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <EdinunLogo size={300} />
        </div>

        {/* Derecha — saludo + temas + descripción + nombre */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 520 }}>
          <div>
            <div className="ed-label" style={{ color: "#4fd8ff", marginBottom: 6 }}>
              EDINUN · Mi escuela y mi barrio
            </div>
            <h1 className="ed-h1" style={{ fontSize: 38, lineHeight: 1.05 }}>
              ¡Bienvenido/a,{" "}
              <span style={{ background: "linear-gradient(180deg,#fce9a8,#d9a441)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 600 }}>
                Estudiante!
              </span>
            </h1>
          </div>

          {/* Botones de tema (chips) */}
          <div>
            <div className="ed-label" style={{ marginBottom: 8 }}>Elige un tema para jugar</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {LEVELS_CFG.map((lv) => {
                const active = level === lv.id && lv.enabled;
                return (
                  <button
                    key={lv.id}
                    onClick={() => { if (lv.enabled) setLevel(lv.id); }}
                    disabled={!lv.enabled}
                    title={lv.enabled ? lv.label : "Próximamente"}
                    style={{
                      padding: "14px 6px", minHeight: 60,
                      borderRadius: 16,
                      background: lv.grad,
                      color: lv.ink,
                      fontFamily: "var(--ed-font-display)", fontWeight: 800,
                      fontSize: 15, letterSpacing: "0.02em", lineHeight: 1.1, textAlign: "center",
                      textShadow: "0 1px 0 rgba(255,255,255,0.35)",
                      border: "none",
                      cursor: lv.enabled ? "pointer" : "not-allowed",
                      opacity: lv.enabled ? 1 : 0.72,
                      filter: lv.enabled ? "none" : "grayscale(0.15)",
                      boxShadow: active
                        ? "inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -3px 0 rgba(0,0,0,0.2), 0 0 0 3px rgba(255,255,255,0.85), 0 0 26px rgba(255,255,255,0.35)"
                        : "inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -3px 0 rgba(0,0,0,0.18), 0 6px 14px -4px rgba(0,0,0,0.45)",
                      transform: active ? "translateY(-2px)" : "none",
                      transition: "all 0.18s ease",
                    }}
                  >
                    {lv.label}
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 12, background: "rgba(10,6,35,0.55)", border: "1px solid rgba(148,120,255,0.3)", fontFamily: "var(--ed-font-display)", fontWeight: 600, fontSize: 14, lineHeight: 1.3, color: "#fce9a8", textAlign: "center" }}>
              {currentCfg ? currentCfg.description : "Elige un tema para empezar."}
            </div>
          </div>

          {/* Nombre + ENTRAR */}
          <div>
            <div className="ed-label" style={{ marginBottom: 8 }}>Escribe tu nombre y entra</div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ flex: 1, position: "relative" }}>
                <input
                  className="ed-input"
                  placeholder="Escribe tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && start()}
                />
              </div>
              <button className="ed-btn ed-btn-primary" onClick={start} disabled={!canStart}
                title={!name.trim() ? "Escribe tu nombre" : "Elige un tema"}
                style={{ height: 50, padding: "0 26px", fontSize: 15, opacity: canStart ? 1 : 0.5, cursor: canStart ? "pointer" : "not-allowed" }}>
                ENTRAR →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. SELECCIÓN DE PERSONAJE — Sisa preseleccionada (orden Domi→Yaku→Sisa→Andi).
// Mapea el tema elegido en Home a currentCategory/currentCatLabel que usa GameScreen.
// ─────────────────────────────────────────────────────────────
function CharacterScreen({ app, setApp, go }) {
  const [sel, setSel] = useState("andi"); // ← Andi preseleccionado (personaje destacado de juego-4)
  const current = CHARACTERS.find((c) => c.id === sel) || CHARACTERS[0];

  function choose() {
    const lvCfg = LEVELS_CFG.find((l) => l.id === app.level) || LEVELS_CFG[0];
    setApp((s) => ({
      ...s,
      character: sel,
      currentCategory: lvCfg.id,
      currentCatLabel: lvCfg.catLabel,
    }));
    go("game");
  }

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 18, left: 24, right: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button className="ed-btn ed-btn-ghost" onClick={() => go("home")} style={{ padding: "8px 14px" }}>
          ← VOLVER
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 700, color: "#fce9a8", fontSize: 20, textShadow: "0 2px 6px rgba(0,0,0,0.45)" }}>
            Hola, {app.studentName || "Estudiante"} 👋
          </div>
          <EdinunLogoMini size={64} />
        </div>
      </div>

      <div style={{ position: "absolute", inset: "92px 32px 24px 32px", display: "grid", gridTemplateColumns: "1fr 1.05fr", gap: 24, alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, minWidth: 0 }}>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)", width: 220, height: 28, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(242,194,96,0.45), transparent 70%)", filter: "blur(5px)" }} />
            <current.Component size={280} floating />
          </div>
          <div style={{ textAlign: "center", marginTop: 4 }}>
            <h2 className="ed-h1" style={{ fontSize: 28, lineHeight: 1 }}>{current.name}</h2>
            <div className="ed-label" style={{ color: "#fce9a8", marginTop: 2, fontSize: 10 }}>{current.title}</div>
            <div className="ed-body" style={{ marginTop: 6, maxWidth: 320, fontStyle: "italic", fontSize: 13, lineHeight: 1.35 }}>
              "{current.quote}"
            </div>
          </div>
        </div>

        <div>
          <div className="ed-label" style={{ marginBottom: 10 }}>Elige tu guía</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {CHARACTERS.map((c) => {
              const active = sel === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSel(c.id)}
                  className="ed-card"
                  style={{
                    padding: 12,
                    textAlign: "left",
                    cursor: "pointer",
                    transform: active ? "translateY(-2px)" : "none",
                    boxShadow: active
                      ? "var(--ed-shadow-card), 0 0 0 2px rgba(79,216,255,0.7), 0 0 30px rgba(79,216,255,0.35)"
                      : "var(--ed-shadow-card)",
                    transition: "all 0.18s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 68, height: 68, flexShrink: 0 }}>
                      <c.Component size={68} floating={false} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 600, fontSize: 18 }}>
                        {c.name}
                      </div>
                      <div className="ed-label" style={{ fontSize: 10, color: "#4fd8ff" }}>
                        {c.specialty}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <button
            onClick={choose}
            className="ed-btn ed-btn-primary"
            style={{ marginTop: 20, width: "100%", height: 52, fontSize: 17 }}
          >
            ¡VAMOS, {current.name.toUpperCase()}! →
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { HomeScreen, CharacterScreen, CosmosBg, incrementGamesCompleted, useVisitorCount, markFirstAttempt, LEVELS_CFG });
