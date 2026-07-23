// screens.jsx — juego-6 (Estudios Sociales) · MENÚ DE 2 NIVELES.
// Home = 4 botones de LIBRO (2 · 3 · 5 · 6). Al tocar un libro se abre su pantalla
// de TEMAS (Libro 2 → 1 tema, Libro 3 → 3 temas, Libro 5 → 2 temas, Libro 6 → 1 tema).
// Elegir tema + nombre → ENTRAR → CharacterScreen → juego (placeholder por ahora).
//
// Nota: es un 2º nivel de menú propio de juego-6; NO toca el shell compartido
// (app.jsx sigue enrutando home → character → game → results). El nivel "libro"
// vive DENTRO del route "home" (estado interno de HomeScreen).

const { useState, useEffect, useRef, useMemo } = React;

// ─────────────────────────────────────────────────────────────
// Fondo cósmico + glifos (temática: libros / estudios sociales).
// ─────────────────────────────────────────────────────────────
function CosmosBg({ variant = "cosmic", glyphSize }) {
  const glyphsStyle = glyphSize ? { fontSize: glyphSize + "px" } : undefined;
  if (variant === "chalkboard") {
    return (
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, #3a9b7a 0%, #1d6b53 55%, #0b3a2d 100%)", overflow: "hidden" }}>
        <div className="ed-glyphs" style={{ color: "rgba(255,255,255,0.10)", ...glyphsStyle }}>
          <span style={{ left: "6%", top: "12%", "--rot": "-8deg", fontSize: "0.6em" }}>📚</span>
          <span style={{ left: "82%", top: "16%", "--rot": "6deg", fontSize: "0.6em" }}>📖</span>
          <span style={{ left: "10%", top: "78%", "--rot": "12deg", fontSize: "0.6em" }}>✏️</span>
          <span style={{ left: "88%", top: "72%", "--rot": "-10deg", fontSize: "0.6em" }}>🗺️</span>
          <span style={{ left: "45%", top: "8%", "--rot": "4deg", fontSize: "0.5em" }}>⭐</span>
          <span style={{ left: "3%", top: "45%", "--rot": "-4deg", fontSize: "0.6em" }}>🌎</span>
          <span style={{ left: "92%", top: "45%", "--rot": "8deg", fontSize: "0.6em" }}>🏛️</span>
          <span style={{ left: "30%", top: "55%", "--rot": "-6deg", fontSize: "0.5em" }}>🤝</span>
          <span style={{ left: "70%", top: "62%", "--rot": "8deg", fontSize: "0.5em" }}>📝</span>
          <span style={{ left: "55%", top: "30%", "--rot": "-4deg", fontSize: "0.5em" }}>🧭</span>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="ed-cosmos" />
      <div className="ed-glyphs" style={glyphsStyle}>
        <span style={{ left: "5%", top: "10%", "--rot": "-8deg", fontSize: "0.72em" }}>📚</span>
        <span style={{ left: "84%", top: "6%", "--rot": "6deg", fontSize: "0.64em" }}>📖</span>
        <span style={{ left: "92%", top: "72%", "--rot": "-12deg", fontSize: "0.62em" }}>✏️</span>
        <span style={{ left: "3%", top: "82%", "--rot": "12deg", fontSize: "0.64em" }}>🌎</span>
        <span style={{ left: "46%", top: "4%", "--rot": "-4deg", fontSize: "0.5em" }}>⭐</span>
        <span style={{ left: "7%", top: "46%", "--rot": "-4deg", fontSize: "0.6em" }}>🗺️</span>
        <span style={{ left: "88%", top: "40%", "--rot": "8deg", fontSize: "0.56em" }}>🏛️</span>
        <span style={{ left: "22%", top: "22%", "--rot": "10deg", fontSize: "0.52em" }}>📝</span>
        <span style={{ left: "70%", top: "24%", "--rot": "-6deg", fontSize: "0.58em" }}>🤝</span>
        <span style={{ left: "32%", top: "70%", "--rot": "8deg", fontSize: "0.56em" }}>🧭</span>
        <span style={{ left: "62%", top: "78%", "--rot": "-10deg", fontSize: "0.52em" }}>📚</span>
        <span style={{ left: "18%", top: "58%", "--rot": "14deg", fontSize: "0.5em" }}>🌎</span>
        <span style={{ left: "78%", top: "56%", "--rot": "-8deg", fontSize: "0.5em" }}>📖</span>
        <span style={{ left: "50%", top: "88%", "--rot": "4deg", fontSize: "0.52em" }}>⭐</span>
        <span style={{ left: "40%", top: "38%", "--rot": "-6deg", fontSize: "0.5em" }}>✏️</span>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Contador de visitas — endpoint PHP con fallback localStorage. NO PERSONALIZAR.
// ─────────────────────────────────────────────────────────────
const VISITOR_ENDPOINT = "counter.php";
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
function writeLocalVisitorCount(n) { localStorage.setItem(VISITOR_KEY, String(n)); }
function useVisitorCount() {
  const [n, setN] = useState(() => readLocalVisitorCount());
  useEffect(() => {
    let cancelled = false;
    fetchVisitorCount().then((count) => { if (cancelled) return; setN(count); writeLocalVisitorCount(count); }).catch(() => {});
    function onUpdate(ev) {
      const value = ev && ev.detail && ev.detail.count;
      if (typeof value === "number") setN(value); else setN(readLocalVisitorCount());
    }
    window.addEventListener("edinun:visitors-updated", onUpdate);
    return () => { cancelled = true; window.removeEventListener("edinun:visitors-updated", onUpdate); };
  }, []);
  return n;
}
function markFirstAttempt() {
  if (sessionStorage.getItem(VISITOR_SESSION_FLAG) === "1") return;
  sessionStorage.setItem(VISITOR_SESSION_FLAG, "1");
  fetchVisitorCount({ increment: true })
    .then((count) => { writeLocalVisitorCount(count); window.dispatchEvent(new CustomEvent("edinun:visitors-updated", { detail: { count } })); })
    .catch(() => { const next = readLocalVisitorCount() + 1; writeLocalVisitorCount(next); window.dispatchEvent(new CustomEvent("edinun:visitors-updated", { detail: { count: next } })); });
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
// LIBROS y sus TEMAS. Los temas están por definir (contenido del libro):
// aquí solo arma la NAVEGACIÓN. Al llegar el contenido, se reemplaza cada
// `label`/`desc` y se implementa su mecánica en game-screens.jsx.
// Gradiente del botón por POSICIÓN (1º naranja · 2º amarillo · 3º azul · 4º violeta).
// ─────────────────────────────────────────────────────────────
const GRAD_POS = [
  { grad: "linear-gradient(180deg, #ffc06e, #e4881a)", ink: "#3a2608" }, // 1º naranja
  { grad: "linear-gradient(180deg, #ffe97a, #d7b12a)", ink: "#3a2608" }, // 2º amarillo
  { grad: "linear-gradient(180deg, #7ab8ff, #2773d8)", ink: "#08264d" }, // 3º azul
  { grad: "linear-gradient(180deg, #b48aff, #6f3fe0)", ink: "#1a0a3d" }, // 4º violeta
];
const LIBROS = [
  { id: "libro-2", label: "Libro 2", temas: [{ id: "l2-t1", label: "Reconociendo mi país" }] },
  { id: "libro-3", label: "Libro 3", temas: [{ id: "l3-t1", label: "Tema 1" }, { id: "l3-t2", label: "Tema 2" }, { id: "l3-t3", label: "Tema 3" }] },
  { id: "libro-5", label: "Libro 5", temas: [{ id: "l5-t1", label: "Tema 1" }, { id: "l5-t2", label: "Tema 2" }] },
  { id: "libro-6", label: "Libro 6", temas: [{ id: "l6-t1", label: "Tema 1" }] },
];

function MenuButton({ label, grad, ink, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "14px 6px", minHeight: 60, borderRadius: 16, border: "none", background: grad, color: ink,
      fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 15, letterSpacing: "0.02em",
      lineHeight: 1.1, textAlign: "center", cursor: "pointer",
      boxShadow: active ? "0 0 0 3px rgba(255,255,255,0.85), 0 6px 16px rgba(0,0,0,0.3)" : "0 4px 12px rgba(0,0,0,0.25)",
      transform: active ? "translateY(-2px)" : "none", transition: "all 0.15s ease",
    }}>{label}</button>
  );
}

// ─────────────────────────────────────────────────────────────
// 1. HOME — nivel 1 (libros) / nivel 2 (temas del libro elegido)
// ─────────────────────────────────────────────────────────────
function HomeScreen({ app, setApp, go }) {
  const visitors = useVisitorCount();
  const [name, setName] = useState(app.studentName || "");
  const [libroId, setLibroId] = useState(null);
  const [temaId, setTemaId] = useState(null);
  const libro = LIBROS.find((l) => l.id === libroId) || null;

  function openLibro(l) { setLibroId(l.id); setTemaId(l.temas.length === 1 ? l.temas[0].id : null); }
  function backToLibros() { setLibroId(null); setTemaId(null); }
  function start() {
    if (!name.trim() || !libro) return;
    const tema = libro.temas.find((t) => t.id === temaId) || (libro.temas.length === 1 ? libro.temas[0] : null);
    if (!tema) return;
    setApp((s) => ({
      ...s, studentName: name.trim(), libro: libro.id,
      currentCategory: tema.id, currentCatLabel: `${libro.label} · ${tema.label}`,
      sessionStart: Date.now(),
    }));
    go("character");
  }

  const gradText = { background: "linear-gradient(180deg,#fce9a8,#d9a441)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 600 };

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* pill de visitas */}
      <div style={{ position: "absolute", bottom: 18, right: 22, display: "flex", alignItems: "center", gap: 8, background: "rgba(10,6,35,0.55)", border: "1px solid rgba(242,194,96,0.3)", borderRadius: 999, padding: "6px 12px", backdropFilter: "blur(8px)", zIndex: 3 }}>
        <PeopleIcon size={16} color="#fce9a8" />
        <div style={{ fontFamily: "var(--ed-font-mono)", fontSize: 11, color: "#f2c260", letterSpacing: "0.06em" }}>
          {visitors.toLocaleString("es-CO")}<span style={{ color: "rgba(246,241,255,0.55)", marginLeft: 6 }}>visitas</span>
        </div>
      </div>

      <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "1fr 1.15fr", alignItems: "center", padding: "40px 56px", gap: 40 }}>
        <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <EdinunLogo size={300} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 540 }}>
          {!libro ? (
            /* ── Nivel 1: LIBROS ── */
            <>
              <div>
                <div className="ed-label" style={{ color: "#4fd8ff", marginBottom: 8 }}>EDINUN · Estudios Sociales</div>
                <h1 className="ed-h1" style={{ fontSize: 42, lineHeight: 1.05 }}>¡Elige tu <span style={gradText}>libro!</span></h1>
              </div>
              <div className="ed-label">Toca un libro para ver sus temas</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {LIBROS.map((l, i) => (
                  <MenuButton key={l.id} label={l.label} grad={GRAD_POS[i].grad} ink={GRAD_POS[i].ink} onClick={() => openLibro(l)} />
                ))}
              </div>
              <div style={{ padding: "12px 16px", borderRadius: 14, background: "rgba(10,6,35,0.55)", border: "1px solid rgba(148,120,255,0.3)", fontFamily: "var(--ed-font-display)", fontWeight: 600, fontSize: 14, lineHeight: 1.4, color: "#fce9a8", textAlign: "center" }}>
                Cada libro tiene sus propios temas para jugar.
              </div>
            </>
          ) : (
            /* ── Nivel 2: TEMAS del libro ── */
            <>
              <button className="ed-btn ed-btn-ghost" onClick={backToLibros} style={{ alignSelf: "flex-start", padding: "6px 14px", fontWeight: 800, letterSpacing: "0.04em" }}>← Libros</button>
              <div>
                <div className="ed-label" style={{ color: "#4fd8ff", marginBottom: 8 }}>EDINUN · {libro.label}</div>
                <h1 className="ed-h1" style={{ fontSize: 36, lineHeight: 1.05 }}>¡Bienvenido/a, <span style={gradText}>Estudiante!</span></h1>
              </div>

              {libro.temas.length > 1 && (
                <div>
                  <div className="ed-label" style={{ marginBottom: 10 }}>Elige un tema</div>
                  <div style={{ display: "grid", gridTemplateColumns: libro.temas.length === 3 ? "1fr 1fr 1fr" : "1fr 1fr", gap: libro.temas.length === 3 ? 10 : 12 }}>
                    {libro.temas.map((t, i) => (
                      <MenuButton key={t.id} label={t.label} grad={GRAD_POS[i].grad} ink={GRAD_POS[i].ink} active={temaId === t.id} onClick={() => setTemaId(t.id)} />
                    ))}
                  </div>
                </div>
              )}

              <div style={{ padding: "10px 16px", borderRadius: 14, background: "rgba(10,6,35,0.55)", border: "1px solid rgba(148,120,255,0.3)", fontFamily: "var(--ed-font-display)", fontWeight: 600, fontSize: 14, lineHeight: 1.4, color: "#fce9a8", textAlign: "center" }}>
                {libro.temas.length === 1
                  ? `${libro.temas[0].label}.`
                  : (temaId ? `${libro.temas.find((t) => t.id === temaId).label}.` : `Este libro tiene ${libro.temas.length} temas. Elige uno arriba.`)}
              </div>

              <div>
                <div className="ed-label" style={{ marginBottom: 10 }}>Escribe tu nombre y entra</div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <input className="ed-input" placeholder="Escribe tu nombre" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && start()} style={{ flex: 1 }} />
                  <button className="ed-btn ed-btn-primary" onClick={start} disabled={!name.trim() || (libro.temas.length > 1 && !temaId)}
                    style={{ height: 50, padding: "0 26px", fontSize: 15, opacity: (name.trim() && (libro.temas.length === 1 || temaId)) ? 1 : 0.5 }}>
                    ENTRAR →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. SELECCIÓN DE PERSONAJE (estándar). La categoría/tema ya viene del Home.
// ─────────────────────────────────────────────────────────────
function CharacterScreen({ app, setApp, go }) {
  const [sel, setSel] = useState(app.character || "domi");
  const current = CHARACTERS.find((c) => c.id === sel) || CHARACTERS[0];

  function choose() {
    setApp((s) => ({ ...s, character: sel }));
    go("game");
  }

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 18, left: 24, right: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button className="ed-btn ed-btn-ghost" onClick={() => go("home")} style={{ padding: "8px 14px" }}>← VOLVER</button>
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
            <div className="ed-body" style={{ marginTop: 6, maxWidth: 320, fontStyle: "italic", fontSize: 13, lineHeight: 1.35 }}>"{current.quote}"</div>
          </div>
        </div>

        <div>
          <div className="ed-label" style={{ marginBottom: 10 }}>Elige tu guía</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {CHARACTERS.map((c) => {
              const active = sel === c.id;
              return (
                <button key={c.id} onClick={() => setSel(c.id)} className="ed-card" style={{ padding: 12, textAlign: "left", cursor: "pointer", transform: active ? "translateY(-2px)" : "none", boxShadow: active ? "var(--ed-shadow-card), 0 0 0 2px rgba(79,216,255,0.7), 0 0 30px rgba(79,216,255,0.35)" : "var(--ed-shadow-card)", transition: "all 0.18s ease" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 68, height: 68, flexShrink: 0 }}><c.Component size={68} floating={false} /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 600, fontSize: 18 }}>{c.name}</div>
                      <div className="ed-label" style={{ fontSize: 10, color: "#4fd8ff" }}>{c.specialty}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <button onClick={choose} className="ed-btn ed-btn-primary" style={{ marginTop: 20, width: "100%", height: 52, fontSize: 17 }}>
            ¡VAMOS, {current.name.toUpperCase()}! →
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { HomeScreen, CharacterScreen, CosmosBg, incrementGamesCompleted, useVisitorCount, markFirstAttempt });
