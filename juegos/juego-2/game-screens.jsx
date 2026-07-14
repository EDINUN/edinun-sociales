// game-screens.jsx — JUEGO-2 · "El camino a casa" (Estudios Sociales · Reconozco el camino
// para llegar a mi casa · 2º EGB · 6 años).
// Mecánica CAMINO/ORIENTACIÓN: un croquis del barrio en CUADRÍCULA 3x3 con lugares. El niño
// mueve un MUÑEQUITO simple y neutral con FLECHAS ← ↑ ↓ → LIBREMENTE por las calles (puede
// ir y volver en cualquier dirección) y ELIGE el camino que quiera hasta la CASA. Al caminar
// mueve las piernas. La casa brilla como destino. El muñequito es neutral porque el niño
// elige su personaje guía.
// VARIEDAD: en cada partida (recargar / reiniciar) los 9 lugares se BARAJAN en la cuadrícula,
// así el barrio y el camino a casa son distintos cada vez (escuela y casa nunca pegadas).
//
// CONTRATO: GameScreen/ResultsScreen({app,setApp,go}) en window; markFirstAttempt() en el
// 1er movimiento; incrementGamesCompleted() al terminar. Salir/reiniciar con modal.

const { useState: useStateG, useEffect: useEffectG, useRef: useRefG } = React;

function PortalToBody({ children }) {
  return ReactDOM.createPortal(children, document.body);
}

const CAT_LABEL = "El camino a casa";

// Mapa lógico (px).
const MAP_W = 494, MAP_H = 382;
const COLS = [90, 247, 404];
const ROWS = [60, 191, 322];

const META = {
  casa:     { t: "Casa",     e: "🏠", d: "a su casa" },
  escuela:  { t: "Escuela",  e: "🏫", d: "a la escuela" },
  parque:   { t: "Parque",   e: "🌳", d: "al parque" },
  puente:   { t: "Puente",   e: "🌉", d: "al puente" },
  semaforo: { t: "Semáforo", e: "🚦", d: "al semáforo" },
  mercado:  { t: "Mercado",  e: "🏪", d: "al mercado" },
  iglesia:  { t: "Iglesia",  e: "⛪", d: "a la iglesia" },
  hospital: { t: "Hospital", e: "🏥", d: "al hospital" },
  arbol:    { t: "Árbol",    e: "🌳", d: "al árbol" },
};
const ALL_IDS = ["casa", "escuela", "parque", "puente", "semaforo", "mercado", "iglesia", "hospital", "arbol"];
// Destinos VÁLIDOS (lugares a los que se "va"). El semáforo, el puente y el árbol NO:
// son puntos de referencia de paso, no destinos. La escuela es el inicio.
const DEST_IDS = ["casa", "parque", "mercado", "iglesia", "hospital"];
const DELTA = { left: [0, -1], right: [0, 1], up: [-1, 0], down: [1, 0] };

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}
function cellIn(grid, id) { for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) if (grid[r][c] === id) return { r, c }; return { r: 0, c: 0 }; }

// Anti-repetición: recuerda los últimos destinos para que al RECARGAR/REINICIAR no salga
// el mismo lugar-meta dos partidas seguidas (además la cuadrícula ya se baraja cada vez).
const RECENT_KEY = "edinun_juego2_camino_destinos_v1";
const RECENT_CAP = 2;
function readRecentDest() {
  try { const a = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); return Array.isArray(a) ? a : []; }
  catch (e) { return []; }
}
function writeRecentDest(id) {
  try {
    const prev = readRecentDest().filter((d) => d !== id);
    localStorage.setItem(RECENT_KEY, JSON.stringify([id].concat(prev).slice(0, RECENT_CAP)));
  } catch (e) { /* sin localStorage: sin anti-repetición, no crítico */ }
}

// Baraja los 9 lugares en la cuadrícula 3x3. La escuela (inicio) y la casa (meta) nunca
// quedan pegadas: se asegura una distancia de al menos 3 para que haya un recorrido.
function buildBarrio() {
  // El niño arranca en la ESCUELA (nunca en el centro, para que siempre haya recorrido).
  let grid = null, start = null;
  for (let tries = 0; tries < 80; tries++) {
    const s = shuffle(ALL_IDS);
    const g = [[s[0], s[1], s[2]], [s[3], s[4], s[5]], [s[6], s[7], s[8]]];
    const st = cellIn(g, "escuela");
    if (!(st.r === 1 && st.c === 1)) { grid = g; start = st; break; }
  }
  if (!grid) { const s = shuffle(ALL_IDS); grid = [[s[0], s[1], s[2]], [s[3], s[4], s[5]], [s[6], s[7], s[8]]]; start = cellIn(grid, "escuela"); }
  // Destino VARIADO: un lugar (≠ escuela) lejos (distancia ≥3). NO siempre es la casa.
  const cands = DEST_IDS.map((id) => {
    const cell = cellIn(grid, id);
    return { id, cell, d: Math.abs(cell.r - start.r) + Math.abs(cell.c - start.c) };
  });
  const far = cands.filter((c) => c.d >= 3);
  const maxD = Math.max.apply(null, cands.map((x) => x.d));
  const pool = far.length ? far : cands.filter((c) => c.d === maxD);
  // Evita repetir el destino reciente; si todos los candidatos son recientes, usa el pool completo.
  const recent = readRecentDest();
  let choicePool = pool.filter((c) => recent.indexOf(c.id) === -1);
  if (!choicePool.length) choicePool = pool;
  const pick = choicePool[Math.floor(Math.random() * choicePool.length)];
  writeRecentDest(pick.id);
  const timeLimit = 18; // segundos fijos para llegar al destino
  const places = {};
  grid.forEach((row, r) => row.forEach((id, c) => { places[id] = Object.assign({}, META[id], { x: COLS[c], y: ROWS[r] }); }));
  const edges = [];
  grid.forEach((row, r) => row.forEach((id, c) => { if (c < 2) edges.push([id, grid[r][c + 1]]); if (r < 2) edges.push([id, grid[r + 1][c]]); }));
  return { grid, places, edges, start, goal: pick.cell, destId: pick.id, timeLimit };
}

function cellsPoints(cells) {
  return cells.map((p) => COLS[p.c] + "," + ROWS[p.r]).join(" ");
}

// CSS del muñequito (piernas/brazos que se mueven), el pulso de la casa y el rebote.
const WALKER_CSS = `
.ed-walker{ position:relative; width:34px; height:52px; }
.ed-walker .head{ position:absolute; top:0; left:7px; width:20px; height:20px; border-radius:50%; background:#f7cfa2; box-shadow:inset 0 -2px 0 rgba(0,0,0,0.06); }
.ed-walker .head::after{ content:""; position:absolute; top:-3px; left:-1px; width:22px; height:11px; border-radius:11px 11px 3px 3px; background:#4a2f1c; }
.ed-walker .eyes{ position:absolute; top:9px; left:11px; width:12px; height:4px; }
.ed-walker .eyes i{ position:absolute; top:0; width:3px; height:3px; border-radius:50%; background:#3a2a1a; }
.ed-walker .eyes i:first-child{ left:0; } .ed-walker .eyes i:last-child{ right:0; }
.ed-walker .body{ position:absolute; top:15px; left:6px; width:22px; height:22px; border-radius:9px; background:#4fb0e6; box-shadow:inset 0 2px 0 rgba(255,255,255,0.3); }
.ed-walker .leg{ position:absolute; top:33px; width:7px; height:17px; border-radius:4px; background:#33285e; transform-origin:50% 0%; }
.ed-walker .legL{ left:9px; } .ed-walker .legR{ left:18px; background:#26204a; }
.ed-walker .arm{ position:absolute; top:18px; width:6px; height:15px; border-radius:3px; background:#2f97cf; transform-origin:50% 0%; }
.ed-walker .armL{ left:1px; } .ed-walker .armR{ left:27px; }
@keyframes edLegA{ 0%,100%{transform:rotate(26deg)} 50%{transform:rotate(-26deg)} }
@keyframes edLegB{ 0%,100%{transform:rotate(-26deg)} 50%{transform:rotate(26deg)} }
@keyframes edArmA{ 0%,100%{transform:rotate(-22deg)} 50%{transform:rotate(22deg)} }
@keyframes edArmB{ 0%,100%{transform:rotate(22deg)} 50%{transform:rotate(-22deg)} }
@keyframes edBob{ 0%,100%{transform:translateY(0)} 50%{transform:translateY(-2px)} }
.ed-walker.walk{ animation:edBob .46s linear infinite; }
.ed-walker.walk .legL{ animation:edLegA .46s linear infinite; }
.ed-walker.walk .legR{ animation:edLegB .46s linear infinite; }
.ed-walker.walk .armL{ animation:edArmA .46s linear infinite; }
.ed-walker.walk .armR{ animation:edArmB .46s linear infinite; }
@keyframes edShake{ 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }
.ed-walker.shake{ animation:edShake .34s; }
@keyframes edPulse{ 0%{transform:translate(-50%,-50%) scale(.7); opacity:.65} 100%{transform:translate(-50%,-50%) scale(1.5); opacity:0} }
.ed-pulse{ animation:edPulse 1.35s ease-out infinite; }
`;

function Walker({ walking, shake }) {
  return (
    <div className={"ed-walker" + (walking ? " walk" : "") + (shake ? " shake" : "")}>
      <div className="leg legL" />
      <div className="leg legR" />
      <div className="arm armL" />
      <div className="arm armR" />
      <div className="body" />
      <div className="head"><div className="eyes"><i /><i /></div></div>
    </div>
  );
}

// Flecha bonita (SVG). Se dibuja apuntando a la derecha y se rota según la dirección.
function ArrowIcon({ dir, size = 34 }) {
  const rot = { right: 0, down: 90, left: 180, up: 270 }[dir] || 0;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", transform: `rotate(${rot}deg)`, filter: "drop-shadow(0 2px 1px rgba(0,0,0,0.35))" }} aria-hidden="true">
      <path d="M4 12 H16" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M12.5 5.5 L19 12 L12.5 18.5" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Frases de ánimo para el ¡UPS! (firmadas por el personaje), estándar EDINUN.
const ANIMOS = [
  "¡Casi! Sigue intentándolo.",
  "¡La próxima es tuya!",
  "Equivocarse también es aprender.",
  "¡Vamos, tú puedes!",
];

function GameScreen({ app, setApp, go }) {
  const char = CHARACTERS.find((c) => c.id === app.character) || CHARACTERS[0];

  const initRef = useRefG(null);
  if (!initRef.current) initRef.current = buildBarrio();

  const [barrio, setBarrio] = useStateG(initRef.current);
  const [pos, setPos] = useStateG(initRef.current.start);   // celda actual {r,c}
  const [path, setPath] = useStateG([initRef.current.start]); // rastro de celdas visitadas
  const [walking, setWalking] = useStateG(false);
  const [shake, setShake] = useStateG(false);
  const [stars, setStars] = useStateG(0);
  const [elapsed, setElapsed] = useStateG(0);
  const [banner, setBanner] = useStateG(null);      // "ok" | "err" (estándar EDINUN)
  const [bannerMsg, setBannerMsg] = useStateG("");   // pastilla: "+N ⭐" o frase de ánimo
  const [done, setDone] = useStateG(false);
  const [confirmingExit, setConfirmingExit] = useStateG(false);
  const [confirmingRestart, setConfirmingRestart] = useStateG(false);

  const { grid, places, edges, goal, destId, timeLimit } = barrio;

  const started = useRefG(Date.now());
  const firstDone = useRefG(false);
  const lock = useRefG(false);
  const endedRef = useRefG(false);
  const movesRef = useRefG(0);
  const visitedRef = useRefG(new Set(["escuela"]));
  const logRef = useRefG([{ idx: 1, place: META.escuela.t, id: "escuela", emoji: META.escuela.e }]);

  useEffectG(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - started.current) / 1000)), 400);
    return () => clearInterval(id);
  }, []);

  // Cuenta regresiva: si se acaba el tiempo antes de llegar al destino, termina la partida.
  useEffectG(() => {
    if (!endedRef.current && elapsed >= timeLimit) { endedRef.current = true; handleTimeout(); }
  }, [elapsed]);

  function fmt(s) { const m = Math.floor(s / 60), ss = s % 60; return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`; }

  function onArrow(dir) {
    if (lock.current || done) return;
    if (!firstDone.current) { firstDone.current = true; if (typeof markFirstAttempt === "function") markFirstAttempt(); }
    const [dr, dc] = DELTA[dir];
    const nr = pos.r + dr, nc = pos.c + dc;
    if (nr < 0 || nr > 2 || nc < 0 || nc > 2) { // no hay calle por ahí
      setShake(true); setTimeout(() => setShake(false), 340);
      return;
    }
    lock.current = true;
    setWalking(true);
    movesRef.current += 1;
    const npos = { r: nr, c: nc };
    setPos(npos);
    setPath((p) => [...p, npos]);
    setTimeout(() => {
      if (endedRef.current) return; // ya terminó (p. ej. se acabó el tiempo)
      setWalking(false);
      lock.current = false;
      const pid = grid[nr][nc];
      if (!visitedRef.current.has(pid)) {
        visitedRef.current.add(pid);
        logRef.current.push({ idx: logRef.current.length + 1, place: META[pid].t, id: pid, emoji: META[pid].e });
        setStars((s) => s + 1);
        setApp((s) => ({ ...s, stars: (s.stars || 0) + 1 }));
      }
      if (nr === goal.r && nc === goal.c) finish();
    }, 640);
  }

  function finish() {
    lock.current = true; endedRef.current = true;
    setDone(true);
    setBanner("ok"); setBannerMsg(`+${Math.max(0, logRef.current.length - 1)} ⭐`);
    setTimeout(() => {
      setBanner(null); setBannerMsg("");
      const visited = logRef.current.length;
      setApp((s) => ({
        ...s,
        lastResult: {
          category: CAT_LABEL, solved: visited, total: 9,
          time: Math.floor((Date.now() - started.current) / 1000),
          starsEarned: Math.max(0, visited - 1), moves: movesRef.current, log: logRef.current.slice(),
          dest: META[destId].t, destD: META[destId].d, destE: META[destId].e, success: true,
        },
      }));
      if (typeof incrementGamesCompleted === "function") incrementGamesCompleted();
      go("results");
    }, 1200);
  }

  function handleTimeout() {
    lock.current = true;
    setDone(true);
    setBanner("err"); setBannerMsg(ANIMOS[Math.floor(Math.random() * ANIMOS.length)]);
    setTimeout(() => {
      setBanner(null); setBannerMsg("");
      const visited = logRef.current.length;
      setApp((s) => ({
        ...s,
        lastResult: {
          category: CAT_LABEL, solved: visited, total: 9, time: timeLimit,
          starsEarned: Math.max(0, visited - 1), moves: movesRef.current, log: logRef.current.slice(),
          dest: META[destId].t, destD: META[destId].d, destE: META[destId].e, success: false,
        },
      }));
      go("results");
    }, 1900);
  }

  function confirmRestart() {
    setConfirmingRestart(false);
    const nb = buildBarrio();
    lock.current = false; firstDone.current = false; endedRef.current = false;
    movesRef.current = 0; visitedRef.current = new Set(["escuela"]);
    logRef.current = [{ idx: 1, place: META.escuela.t, id: "escuela", emoji: META.escuela.e }];
    setBarrio(nb);
    setPos(nb.start); setPath([nb.start]);
    setWalking(false); setShake(false); setStars(0); setDone(false); setElapsed(0);
    started.current = Date.now();
  }

  const cx = COLS[pos.c], cy = ROWS[pos.r];
  const remaining = Math.max(0, timeLimit - elapsed);
  const low = remaining <= 10;
  const arrows = ["left", "up", "down", "right"];

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <style>{WALKER_CSS}</style>

      {/* ── HUD ── */}
      <div style={{ position: "absolute", top: 10, left: 16, right: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <EdinunLogoMini size={60} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: low ? "rgba(120,0,0,0.4)" : "rgba(0,0,0,0.35)", borderRadius: 999, padding: "6px 12px", border: `1px solid ${low ? "rgba(255,90,90,0.85)" : "rgba(242,194,96,0.4)"}`, fontFamily: "var(--ed-font-mono)", fontSize: 13, fontWeight: low ? 800 : 400, color: low ? "#ff9b9b" : "#fce9a8" }}>⏱ {fmt(remaining)}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.35)", borderRadius: 999, padding: "6px 12px", border: "1px solid rgba(242,194,96,0.4)", fontFamily: "var(--ed-font-display)", fontWeight: 600, color: "#fce9a8" }}>⭐ {stars}</div>
        </div>
      </div>

      {/* ── Enunciado (QUÉ hacer) ── */}
      <div style={{ position: "absolute", left: 236, right: 210, top: 26, textAlign: "center", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 20, color: "#fff", textShadow: "0 2px 6px rgba(0,0,0,0.55)", pointerEvents: "none" }}>
        Lleva al niño {META[destId].d}.
      </div>

      {/* ── Personaje guía + bocadillo (a la izquierda) ── */}
      <div style={{ position: "absolute", left: 8, bottom: 78, width: 220, pointerEvents: "none", textAlign: "center" }}>
        <div className="ed-float-soft" style={{ position: "absolute", left: 0, right: 0, bottom: "100%", display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative", display: "inline-block", maxWidth: 208, background: "linear-gradient(180deg, rgba(20,12,55,0.95), rgba(10,6,35,0.95))", border: "1.5px solid rgba(242,194,96,0.65)", borderRadius: 16, padding: "9px 12px", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 14, lineHeight: 1.3, color: "#fce9a8", textAlign: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}>
            Toca las flechas para mover al niño.
            <div style={{ position: "absolute", bottom: -10, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "9px solid transparent", borderRight: "9px solid transparent", borderTop: "10px solid rgba(20,12,55,0.95)", filter: "drop-shadow(0 1px 0 rgba(242,194,96,0.55))" }} />
          </div>
        </div>
        <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
          <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", width: 140, height: 16, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(242,194,96,0.45), transparent 70%)", filter: "blur(5px)" }} />
          <char.Component size={186} floating />
        </div>
        <div style={{ marginTop: -2, fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 14, color: "#fce9a8", letterSpacing: "0.04em", textShadow: "0 2px 6px rgba(0,0,0,0.6)" }}>{char.name}</div>
      </div>

      {/* ── Croquis del barrio (cuadrícula barajada) ── */}
      <div style={{ position: "absolute", top: 64, left: 236, width: MAP_W, height: MAP_H, transform: "scale(0.92)", transformOrigin: "top left", borderRadius: 20, overflow: "hidden", backgroundColor: "#4d9c58", backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1.5px, transparent 1.6px), radial-gradient(rgba(20,80,35,0.10) 1.5px, transparent 1.6px), radial-gradient(circle at 50% 35%, #86cc80, #4d9c58 82%)", backgroundSize: "22px 22px, 22px 22px, 100% 100%", backgroundPosition: "0 0, 11px 11px, 0 0", boxShadow: "inset 0 0 0 3px rgba(255,255,255,0.15), 0 10px 26px rgba(0,0,0,0.35)" }}>
        {/* calles + rastro */}
        <svg width={MAP_W} height={MAP_H} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {/* arbustos decorativos en el pasto (dan aire de barrio) */}
          {[[36, 30], [458, 30], [34, 352], [460, 352], [33, 196], [461, 196]].map(([bx, by], i) => (
            <g key={"bush" + i}>
              <circle cx={bx - 7} cy={by + 2} r="9" fill="#4f9a51" />
              <circle cx={bx + 7} cy={by + 2} r="9" fill="#58aa5b" />
              <circle cx={bx} cy={by - 6} r="9" fill="#61b264" />
            </g>
          ))}
          {/* aceras (borde claro de las calles) */}
          {edges.map(([a, b], i) => (
            <line key={"acera" + i} x1={places[a].x} y1={places[a].y} x2={places[b].x} y2={places[b].y} stroke="#efe8d6" strokeWidth="34" strokeLinecap="round" />
          ))}
          {/* calles */}
          {edges.map(([a, b], i) => (
            <line key={i} x1={places[a].x} y1={places[a].y} x2={places[b].x} y2={places[b].y} stroke="#cdbf9e" strokeWidth="22" strokeLinecap="round" />
          ))}
          {path.length > 1 && (
            <polyline points={cellsPoints(path)} fill="none" stroke="#39d17f" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
          )}
        </svg>

        {/* brillo del destino (varía cada partida) */}
        <div style={{ position: "absolute", left: places[destId].x, top: places[destId].y, width: 122, height: 122, transform: "translate(-50%,-50%)", borderRadius: "50%", background: "radial-gradient(circle, rgba(252,233,168,0.55), transparent 66%)", pointerEvents: "none" }} />

        {/* lugares del barrio (cuadrícula 3x3) */}
        {Object.keys(places).map((id) => (
          <img key={id} src={`assets/${id}.png`} alt="" draggable="false"
            style={{ position: "absolute", left: places[id].x, top: places[id].y, width: id === "arbol" ? 64 : 72, transform: "translate(-50%,-50%)", pointerEvents: "none", filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.28))", zIndex: 2 }} />
        ))}

        {/* pulso del destino (varía cada partida) */}
        {!done && (
          <div className="ed-pulse" style={{ position: "absolute", left: places[destId].x, top: places[destId].y, width: 74, height: 74, borderRadius: "50%", border: "3px solid rgba(252,233,168,0.9)", pointerEvents: "none", zIndex: 3 }} />
        )}

        {/* muñequito que camina */}
        <div style={{ position: "absolute", left: cx, top: cy + 8, transform: "translate(-50%,-100%)", transition: "left 0.62s ease, top 0.62s ease", zIndex: 6 }}>
          <Walker walking={walking} shake={shake} />
        </div>
      </div>

      {/* ── Flechas ── */}
      <div style={{ position: "absolute", left: 236, right: 210, top: 448, display: "flex", justifyContent: "center", gap: 18 }}>
        {arrows.map((d) => (
          <button key={d} onClick={() => onArrow(d)} disabled={done} aria-label={d}
            style={{
              width: 70, height: 66, borderRadius: 18, cursor: done ? "default" : "pointer",
              border: "none", padding: 0,
              background: "linear-gradient(180deg,#cbb6ff 0%,#9d78ff 46%,#8a5af2 100%)",
              boxShadow: "inset 0 3px 2px rgba(255,255,255,0.75), inset 0 -4px 5px rgba(74,40,160,0.55), 0 7px 0 #5a34c0, 0 10px 16px rgba(0,0,0,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: done ? 0.5 : 1, transition: "transform 0.08s",
            }}
            onMouseDown={(e) => { if (!done) e.currentTarget.style.transform = "translateY(4px)"; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = "none"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}
          >
            <ArrowIcon dir={d} size={34} />
          </button>
        ))}
      </div>

      {/* ── Acciones ── */}
      <div style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 12, width: 150 }}>
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
              <p className="ed-body" style={{ marginBottom: 16, fontSize: 14 }}>Vas a perder este camino.</p>
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
              <p className="ed-body" style={{ marginBottom: 16, fontSize: 14 }}>Sale un barrio nuevo (otras posiciones).</p>
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

function PrintableReport({ studentName, res, dateStr, mm, ss, visited, moves }) {
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
              <th style={printStyles.th}>Lugar del recorrido</th>
              <th style={{ ...printStyles.th, ...printStyles.thC }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {log.map((e, i) => (
              <tr key={e.idx} style={printStyles.tr}>
                <td style={{ ...printStyles.td, ...printStyles.tdNum }}>{e.idx}</td>
                <td style={{ ...printStyles.td, fontWeight: 700 }}>{e.emoji} {e.place}{i === 0 ? " (inicio)" : (i === log.length - 1 ? " (meta)" : "")}</td>
                <td style={{ ...printStyles.td, ...printStyles.tdOk }}>Visitado</td>
              </tr>
            ))}
            {log.length === 0 && (<tr><td colSpan={3} style={{ padding: 24, textAlign: "center", color: "#888", fontStyle: "italic" }}>Sin recorrido.</td></tr>)}
          </tbody>
        </table>
        <div style={printStyles.summary}>
          <div style={printStyles.cell}><div style={printStyles.cellL}>Lugares visitados</div><div style={printStyles.cellV}>{visited} / {res.total}</div></div>
          <div style={printStyles.cell}><div style={printStyles.cellL}>Movimientos</div><div style={printStyles.cellV}>{moves}</div></div>
          <div style={printStyles.cell}><div style={printStyles.cellL}>Estrellas</div><div style={printStyles.cellV}>{res.starsEarned}</div></div>
          <div style={{ ...printStyles.cell, ...printStyles.cellEmp }}><div style={printStyles.cellL}>Meta</div><div style={printStyles.cellV}>{res.destE || "🏠"}</div></div>
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
  const res = app.lastResult || { category: CAT_LABEL, solved: 0, total: 9, time: 0, starsEarned: 0, moves: 0, log: [] };
  const mm = Math.floor(res.time / 60), ss = res.time % 60;
  const visited = res.solved != null ? res.solved : (res.log || []).length;
  const moves = res.moves != null ? res.moves : 0;
  const ok = res.success !== false; // false = se acabó el tiempo
  const dateStr = new Date().toLocaleDateString("es-EC", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 14, left: 24, right: 24, display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
        <button className="ed-btn ed-btn-ghost" onClick={() => go("home")} style={{ padding: "8px 14px", fontWeight: 800, letterSpacing: "0.04em" }}>← VOLVER AL INICIO</button>
      </div>

      <div style={{ position: "absolute", inset: "70px 32px 20px 32px", display: "grid", gridTemplateColumns: "0.85fr 1.4fr", gap: 24, alignItems: "stretch" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 34, background: "linear-gradient(180deg, #fce9a8, #d9a441)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1, marginBottom: 4 }}>{ok ? "¡Muy bien!" : "¡Casi!"}</div>
          <char.Component size={176} />
          <div className="ed-body" style={{ fontStyle: "italic", textAlign: "center", maxWidth: 240, fontSize: 13 }}>
            {ok
              ? `"${app.studentName || "Campeón"}, ¡llegaste ${res.destD || "a tu casa"}!"`
              : `"${app.studentName || "Campeón"}, se acabó el tiempo. ¡Inténtalo otra vez!"`}
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
                  <th style={{ textAlign: "left", padding: "6px 8px" }}>Lugar del recorrido</th>
                  <th style={{ textAlign: "center", padding: "6px 8px" }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {(res.log || []).map((e, i) => (
                  <tr key={e.idx} style={{ borderBottom: "1px solid rgba(148,120,255,0.18)" }}>
                    <td style={{ padding: "7px 8px", color: "var(--ed-ink-soft)" }}>{e.idx}</td>
                    <td style={{ padding: "7px 8px", fontWeight: 600 }}>{e.emoji} {e.place}{i === 0 ? " (inicio)" : (i === (res.log || []).length - 1 ? " (meta)" : "")}</td>
                    <td style={{ padding: "7px 8px", textAlign: "center", fontFamily: "var(--ed-font-display)", fontWeight: 700, color: "#2ecc8f" }}>✓</td>
                  </tr>
                ))}
                {(res.log || []).length === 0 && (<tr><td colSpan={3} style={{ padding: "16px 8px", textAlign: "center", color: "var(--ed-ink-soft)", fontStyle: "italic" }}>Sin recorrido.</td></tr>)}
              </tbody>
            </table>
          </div>

          <div style={{ borderTop: "2px solid rgba(242,194,96,0.45)", paddingTop: 10, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, fontFamily: "var(--ed-font-ui)", fontSize: 11 }}>
            <SummaryCell label="Lugares" value={`${visited} / ${res.total}`} />
            <SummaryCell label="Movimientos" value={`${moves}`} tone="#4fd8ff" />
            <SummaryCell label="Estrellas" value={`${res.starsEarned}`} tone="#fce9a8" />
            <SummaryCell label="Meta" value={res.destE || "🏠"} tone="#fce9a8" emphasis />
          </div>

          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button className="ed-btn ed-btn-ghost" onClick={() => window.print()} style={{ padding: "0 10px", fontSize: 13, height: 44, fontWeight: 800, letterSpacing: "0.04em" }}>IMPRIMIR REPORTE</button>
            <button className="ed-btn ed-btn-primary" onClick={() => go("game")} style={{ padding: "0 10px", fontSize: 13, height: 44, fontWeight: 800, letterSpacing: "0.04em" }}>JUGAR OTRA VEZ</button>
          </div>
        </div>
      </div>

      <PrintableReport studentName={app.studentName} res={res} dateStr={dateStr} mm={mm} ss={ss} visited={visited} moves={moves} />
    </div>
  );
}

Object.assign(window, { GameScreen, ResultsScreen });
