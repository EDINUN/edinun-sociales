// game-screens.jsx — JUEGO-3 · "Cuido mi entorno" (Estudios Sociales · TEMA 3 · 2º EGB · 6 años).
// Juego MULTI-TEMA (2 botones en Home). Este archivo implementa el TEMA 1.
//
// TEMA 1 · "Clasifica la basura" (categoría "reciclaje"):
//   Mecánica ARRASTRAR + VERIFICAR: se muestran TODOS los objetos de la ronda a la vez;
//   el niño ARRASTRA cada uno hasta el tacho del color correcto (azul = papel/cartón ·
//   amarillo = plástico/latas · café = orgánico) y al final toca VERIFICAR. Cada objeto
//   correcto sale con ✓ verde; los incorrectos con ✗ y se ilumina el tacho correcto.
//   Ronda de 6 objetos elegidos del banco (anti-repetición FIFO + al menos 1 de cada tacho).
//   Solo objetos INEQUÍVOCOS (nada de vaso/tapa que podrían ser vidrio/metal/plástico).
//
// Arrastre: pointer events (mouse + touch). La posición se calcula en coords lógicas del
// lienzo 900×540 dividiendo el desplazamiento de pantalla por la escala real (medida del
// contenedor), y el "soltar" se resuelve por hit-test con getBoundingClientRect de cada
// tacho — así funciona sin importar cuánto escale el lienzo al viewport.
//
// CONTRATO: GameScreen/ResultsScreen({app,setApp,go}) en window; markFirstAttempt() en la
// 1ª acción; incrementGamesCompleted() al terminar. Salir/reiniciar con modal.
// El TEMA 2 se añadirá como otra categoría cuando la autora mande su lámina.

const { useState: useStateG, useEffect: useEffectG, useRef: useRefG } = React;

function PortalToBody({ children }) {
  return ReactDOM.createPortal(children, document.body);
}

const CAT_LABEL = "Clasifica la basura";
const RECENT_KEY = "edinun_juego3_reciclaje_recientes_v1";
const ROUND = 6;        // objetos por partida (todos a la vez)
const RECENT_CAP = 6;   // memoria FIFO → dos partidas seguidas casi no comparten objetos

// Los 3 contenedores (tachos) — arte recortado de tachos-lamina.png.
const BINS = [
  { id: "azul",     label: "Papel y cartón",   img: "tacho-azul.png",     ring: "#57b0f5" },
  { id: "amarillo", label: "Plástico y latas", img: "tacho-amarillo.png", ring: "#f2c94c" },
  { id: "cafe",     label: "Orgánico",         img: "tacho-cafe.png",     ring: "#c98a5e" },
];

// Banco de 18 objetos INEQUÍVOCOS (arte recortado de las 7 láminas). emoji: solo reporte.
const OBJECTS = [
  // 🔵 Azul — papel y cartón
  { id: "periodico",      label: "Periódico",          bin: "azul",     emoji: "📰" },
  { id: "caja",           label: "Caja de cartón",     bin: "azul",     emoji: "📦" },
  { id: "carton-huevos",  label: "Cartón de huevos",   bin: "azul",     emoji: "🥚" },
  { id: "papel-arrugado", label: "Hoja de papel",      bin: "azul",     emoji: "📄" },
  { id: "revista",        label: "Revista",            bin: "azul",     emoji: "📖" },
  { id: "tubo-carton",    label: "Tubo de cartón",     bin: "azul",     emoji: "🧻" },
  // 🟡 Amarillo — plástico, latas y tetra pack
  { id: "botella",        label: "Botella de agua",    bin: "amarillo", emoji: "💧" },
  { id: "lata",           label: "Lata de gaseosa",    bin: "amarillo", emoji: "🥤" },
  { id: "lata-atun",      label: "Lata de atún",       bin: "amarillo", emoji: "🥫" },
  { id: "tetrapak",       label: "Tetra pack",         bin: "amarillo", emoji: "🧃" },
  { id: "funda",          label: "Funda de plástico",  bin: "amarillo", emoji: "🛍️" },
  { id: "cepillo",        label: "Cepillo de dientes", bin: "amarillo", emoji: "🪥" },
  // 🟤 Café — orgánico
  { id: "platano",        label: "Cáscara de plátano", bin: "cafe",     emoji: "🍌" },
  { id: "manzana",        label: "Manzana",            bin: "cafe",     emoji: "🍎" },
  { id: "naranja",        label: "Cáscara de naranja", bin: "cafe",     emoji: "🍊" },
  { id: "espina",         label: "Espina de pescado",  bin: "cafe",     emoji: "🐟" },
  { id: "huevo",          label: "Cáscara de huevo",   bin: "cafe",     emoji: "🥚" },
  { id: "mazorca",        label: "Mazorca",            bin: "cafe",     emoji: "🌽" },
];
const OBJ = {};
OBJECTS.forEach((o) => { OBJ[o.id] = o; });

// Geometría (lienzo 900×540).
const GRID_X = [300, 450, 600];  // 3 columnas de la bandeja (centradas en x=450, alineadas)
const GRID_Y = [136, 244];       // 2 filas (3 arriba + 3 abajo) — repartidas para llenar el espacio hasta los tachos
const BIN_CX = [290, 450, 610];  // amarillo al CENTRO (x=450); azul y café simétricos a los lados
const BIN_TOPS = [312, 312, 312]; // los 3 tachos a la MISMA altura (fila plana)
const BIN_HIT_PAD = 22;   // margen extra para soltar (dedos de niño)
const PLACED_STEP = 44;

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}
function binIndexOf(binId) { return BINS.findIndex((b) => b.id === binId); }
function readRecent() {
  try { const a = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); return Array.isArray(a) ? a : []; }
  catch (e) { return []; }
}
function writeRecent(ids) {
  try {
    const prev = readRecent();
    const merged = [];
    ids.concat(prev).forEach((x) => { if (merged.indexOf(x) === -1) merged.push(x); });
    localStorage.setItem(RECENT_KEY, JSON.stringify(merged.slice(0, RECENT_CAP)));
  } catch (e) { /* sin localStorage: sin anti-repetición, no crítico */ }
}
function pickFresh(ids, recent, n, exclude) {
  const avail = ids.filter((id) => exclude.indexOf(id) === -1);
  const fresh = shuffle(avail.filter((id) => recent.indexOf(id) === -1));
  const stale = shuffle(avail.filter((id) => recent.indexOf(id) !== -1));
  return fresh.concat(stale).slice(0, n);
}
// Ronda de ROUND objetos: 1 garantizado por tacho + resto al azar, evitando recientes.
function buildRound() {
  const recent = readRecent();
  const chosen = [];
  BINS.forEach((b) => {
    const ofBin = OBJECTS.filter((o) => o.bin === b.id).map((o) => o.id);
    const pick = pickFresh(ofBin, recent, 1, chosen);
    if (pick.length) chosen.push(pick[0]);
  });
  const rest = pickFresh(OBJECTS.map((o) => o.id), recent, ROUND - chosen.length, chosen);
  rest.forEach((id) => chosen.push(id));
  const final = shuffle(chosen).slice(0, ROUND);
  writeRecent(final);
  return final;
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
// Se muestra en TODAS las pantallas de juego (Tema 1 y las rondas del Tema 2).
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

function BasuraGame({ app, setApp, go }) {
  const char = CHARACTERS.find((c) => c.id === app.character) || CHARACTERS[0];
  const catLabel = app.currentCatLabel || CAT_LABEL;

  const rootRef = useRefG(null);
  const binRefs = useRefG([null, null, null]);

  const initRef = useRefG(null);
  if (!initRef.current) initRef.current = buildRound();

  const [round, setRound] = useStateG(initRef.current);
  const [placement, setPlacement] = useStateG({}); // objId -> binId
  const [dragId, setDragId] = useStateG(null);
  const [dragXY, setDragXY] = useStateG({ x: 0, y: 0 });
  const [verdict, setVerdict] = useStateG(null);    // objId -> 'ok' | 'wrong'
  const [revealBin, setRevealBin] = useStateG({});  // binId -> true (tacho correcto de un fallo)
  const [banner, setBanner] = useStateG(null);     // "ok" | "err" (tipo de feedback)
  const [bannerMsg, setBannerMsg] = useStateG("");  // pastilla: "+N ⭐" o frase de ánimo
  const [done, setDone] = useStateG(false);
  const [confirmingExit, setConfirmingExit] = useStateG(false);
  const [confirmingRestart, setConfirmingRestart] = useStateG(false);

  const roundRef = useRefG(initRef.current);
  const placeRef = useRefG({});
  useEffectG(() => { roundRef.current = round; }, [round]);
  useEffectG(() => { placeRef.current = placement; }, [placement]);

  const started = useRefG(Date.now());
  const firstDone = useRefG(false);
  const endedRef = useRefG(false);
  const logRef = useRefG([]);
  const dragRef = useRefG(null);

  // Objetos colocados dentro del tacho: 1–2 en una sola fila; a partir de la 3ª se
  // arma una rejilla de 2 columnas que crece HACIA ABAJO (dentro del cuerpo del tacho),
  // nunca hacia la bandeja. Así se mantienen grandes, ordenadas y sin salirse.
  function placedGrid(n) {
    // Máximo 2 filas: 1–2 en una fila; 3–4 en 2 columnas; 5–6 en 3 columnas.
    const cols = n <= 2 ? Math.max(1, n) : Math.ceil(n / 2);
    const rows = Math.ceil(n / cols) || 1;
    let size, cell;
    if (cols <= 1) { size = 54; cell = 80; }
    else if (cols === 2) { size = 44; cell = 70; }
    else { size = 32; cell = 49; }
    const badge = Math.max(19, Math.round(size * 0.58));
    const rowStep = size + 20; // deja aire para el círculo y la insignia (no se enciman)
    return { cols, rows, cell, rowStep, size, badge };
  }

  // En la PANTALLA DE VERIFICACIÓN las cosas de cada tacho suben en una columna
  // vertical (aprovechan el espacio vacío de arriba) → cada una con aire para su
  // círculo y su pista ➜ tacho, sin encimarse.
  function verifyCol(n) {
    let step = n <= 3 ? 68 : (n === 4 ? 62 : 56);
    step = Math.min(step, 250 / Math.max(1, n - 1)); // no rebasar el enunciado de arriba
    const size = Math.max(30, step - 16);
    return { size, step };
  }

  // Posición de reposo (coords lógicas) de un objeto: en su tacho (si está colocado) o
  // en su casillero de la bandeja.
  function restPos(id) {
    const bin = placement[id];
    if (bin) {
      const bi = binIndexOf(bin);
      const inBin = round.filter((x) => placement[x] === bin);
      const k = inBin.indexOf(id);
      const n = inBin.length;
      if (verdict) {
        // Verificación: columna vertical que sube desde la boca del tacho.
        const c = verifyCol(n);
        return { x: BIN_CX[bi], y: (BIN_TOPS[bi] + 18) - k * c.step };
      }
      // Jugando: rejilla compacta y baja dentro del tacho (no choca con la bandeja).
      const g = placedGrid(n);
      const row = Math.floor(k / g.cols);
      const inRow = Math.min(g.cols, n - row * g.cols); // cuántos hay en ESTA fila (última puede ir incompleta → centrada)
      const col = k - row * g.cols;
      const cx = BIN_CX[bi] - ((inRow - 1) * g.cell) / 2 + col * g.cell;
      const cy = (BIN_TOPS[bi] + 62) - ((g.rows - 1) * g.rowStep) / 2 + row * g.rowStep;
      return { x: cx, y: cy };
    }
    const ti = round.indexOf(id);
    const col = ti % 3, rowN = Math.floor(ti / 3);
    return { x: GRID_X[col] != null ? GRID_X[col] : 330, y: GRID_Y[rowN] != null ? GRID_Y[rowN] : 126 };
  }

  function onPointerDown(e, id) {
    if (done || verdict) return;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
    const rect = rootRef.current ? rootRef.current.getBoundingClientRect() : { width: 900 };
    const scale = rect.width / 900 || 1;
    const cur = restPos(id);
    dragRef.current = { id, sx: e.clientX, sy: e.clientY, cx: cur.x, cy: cur.y, scale, moved: false };
    setDragId(id);
    setDragXY(cur);
    if (!firstDone.current) { firstDone.current = true; if (typeof markFirstAttempt === "function") markFirstAttempt(); }
  }
  function onPointerMove(e) {
    const d = dragRef.current;
    if (!d) return;
    if (Math.abs(e.clientX - d.sx) + Math.abs(e.clientY - d.sy) > 4) d.moved = true;
    setDragXY({ x: d.cx + (e.clientX - d.sx) / d.scale, y: d.cy + (e.clientY - d.sy) / d.scale });
  }
  function onPointerUp(e) {
    const d = dragRef.current;
    if (!d) return;
    dragRef.current = null;
    setDragId(null);
    const id = d.id;
    let hit = null;
    for (let i = 0; i < 3; i++) {
      const el = binRefs.current[i];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (e.clientX >= r.left - BIN_HIT_PAD && e.clientX <= r.right + BIN_HIT_PAD &&
          e.clientY >= r.top - BIN_HIT_PAD && e.clientY <= r.bottom + BIN_HIT_PAD) { hit = BINS[i].id; break; }
    }
    if (hit) {
      setPlacement((p) => ({ ...p, [id]: hit }));
    } else if (d.moved) {
      setPlacement((p) => { const n = { ...p }; delete n[id]; return n; }); // vuelve a la bandeja
    }
  }

  const allPlaced = round.every((id) => placement[id]);

  function onVerify() {
    if (!allPlaced || verdict || done) return;
    const vd = {}, rb = {};
    round.forEach((id) => {
      const ok = placement[id] === OBJ[id].bin;
      vd[id] = ok ? "ok" : "wrong";
      if (!ok) rb[OBJ[id].bin] = true;
      logRef.current.push({ idx: logRef.current.length + 1, id, label: OBJ[id].label, emoji: OBJ[id].emoji, binLabel: BINS[binIndexOf(OBJ[id].bin)].label, ok });
    });
    const aciertos = round.filter((id) => placement[id] === OBJ[id].bin).length;
    const perfecto = aciertos === round.length;
    setVerdict(vd); setRevealBin(rb);
    setApp((s) => ({ ...s, stars: aciertos }));
    endedRef.current = true;
    // 1) Pantalla de VERIFICACIÓN limpia (✓/✗, círculos, ➜ tacho), SIN cartel, para
    //    que el niño estudie qué estuvo mal. 2) RECIÉN DESPUÉS aparece el cartel
    //    ¡PERFECTO!/¡UPS! como reacción breve. 3) Luego pasa al reporte. (Patrón CCNN.)
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
          category: catLabel, solved: aciertos, total: round.length,
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
    const r = buildRound();
    roundRef.current = r; setRound(r);
    setPlacement({}); placeRef.current = {};
    setDragId(null); setVerdict(null); setRevealBin({}); setDone(false); setBanner(null); setBannerMsg("");
    firstDone.current = false; endedRef.current = false; dragRef.current = null;
    logRef.current = [];
    started.current = Date.now();
  }

  const placedCount = round.filter((id) => placement[id]).length;

  return (
    <div ref={rootRef} className="ed-noselect" style={{ position: "absolute", inset: 0, overflow: "hidden", WebkitTapHighlightColor: "transparent" }}>
      <style>{GAME_CSS}</style>
      <TemaChipsBar app={app} setApp={setApp} />

      {/* ── HUD ── */}
      <div style={{ position: "absolute", top: 10, left: 16, right: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <EdinunLogoMini size={60} />
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.4)", border: "1px solid rgba(242,194,96,0.45)", borderRadius: 999, padding: "6px 16px", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 14, color: "#fce9a8", letterSpacing: "0.04em" }}>
          ♻️ {placedCount} / {ROUND}
        </div>
      </div>

      {/* ── Enunciado (QUÉ) ── */}
      <div style={{ position: "absolute", left: 150, right: 150, top: 44, textAlign: "center", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 20, color: "#fff", textShadow: "0 2px 6px rgba(0,0,0,0.55)", pointerEvents: "none" }}>
        Coloca cada cosa en su tacho de basura.
      </div>

      {/* ── Los 3 tachos ── */}
      {BINS.map((b, i) => {
        return (
          <div key={b.id} ref={(el) => { binRefs.current[i] = el; }}
            style={{ position: "absolute", left: BIN_CX[i], top: BIN_TOPS[i], transform: "translateX(-50%)", width: 150, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, zIndex: 3, pointerEvents: "none" }}>
            <div style={{ position: "relative" }}>
              <img src={`assets/${b.img}`} alt="" draggable="false" style={{ height: 150, width: "auto", display: "block", margin: "0 auto", filter: "drop-shadow(0 5px 7px rgba(0,0,0,0.32))" }} />
            </div>
            <div style={{ background: "rgba(10,6,35,0.72)", border: "2px solid rgba(255,255,255,0.35)", borderRadius: 999, padding: "3px 12px", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 12.5, color: "#fff", whiteSpace: "nowrap" }}>{b.label}</div>
          </div>
        );
      })}

      {/* ── Objetos (bandeja arriba / colocados en el tacho) ── */}
      {round.map((id) => {
        const o = OBJ[id];
        const dragging = dragId === id;
        const placed = !!placement[id] && !dragging;
        const pos = dragging ? dragXY : restPos(id);
        const nBin = placed ? round.filter((x) => placement[x] === placement[id]).length : 0;
        const inVerify = placed && !!verdict;
        const ps = !placed ? 96 : (inVerify ? verifyCol(nBin).size : placedGrid(nBin).size);
        const maxW = placed ? ps : 96;
        const maxH = placed ? ps : 80;
        const v = verdict && verdict[id];
        const okBin = BINS[binIndexOf(o.bin)]; // tacho correcto de este objeto
        const locked = done || !!verdict;
        return (
          <div key={id}
            onPointerDown={(e) => onPointerDown(e, id)}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onDragStart={(e) => e.preventDefault()}
            style={{
              position: "absolute", left: pos.x, top: pos.y, transform: "translate(-50%,-50%)",
              zIndex: dragging ? 60 : (v === "wrong" ? 20 : (placed ? 12 : 15)),
              touchAction: "none", cursor: locked ? "default" : (dragging ? "grabbing" : "grab"),
              transition: dragging ? "none" : "left 0.18s ease, top 0.18s ease",
              filter: dragging ? "drop-shadow(0 10px 12px rgba(0,0,0,0.4))" : "drop-shadow(0 5px 7px rgba(0,0,0,0.3))",
            }}>
            <div style={{ position: "relative", width: maxW, height: maxH, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {v === "wrong" && (
                <div style={{ position: "absolute", inset: -7, borderRadius: "50%", background: "rgba(231,76,60,0.12)", boxShadow: "0 0 0 3px #e74c3c", zIndex: 0, pointerEvents: "none" }} />
              )}
              <img src={`assets/${id}.png`} alt={o.label} draggable="false" style={{ position: "relative", zIndex: 1, maxWidth: maxW, maxHeight: maxH, width: "auto", height: "auto", objectFit: "contain", display: "block", pointerEvents: "none" }} />
              {v === "ok" && (
                <div className="ed-checkPop" style={{ position: "absolute", top: -8, right: -8, width: 24, height: 24, borderRadius: "50%", background: "#2ecc71", color: "#fff", fontWeight: 900, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 5px rgba(0,0,0,0.45)", border: "2px solid rgba(255,255,255,0.9)", zIndex: 2 }}>✓</div>
              )}
              {v === "wrong" && (
                <div className="ed-checkPop" title={`Va en: ${okBin.label}`} style={{ position: "absolute", left: "100%", top: "50%", transform: "translateY(-50%)", marginLeft: 5, display: "flex", alignItems: "center", gap: 2, pointerEvents: "none", whiteSpace: "nowrap", zIndex: 3 }}>
                  <span style={{ fontSize: 19, fontWeight: 900, color: "#ffd27a", textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}>➜</span>
                  <img src={`assets/${okBin.img}`} alt="" draggable="false" style={{ height: 44, width: "auto", display: "block", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))" }} />
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* ── Personaje guía + bocadillo (izquierda, tamaño estándar EDINUN) ── */}
      <div style={{ position: "absolute", left: 8, bottom: 78, width: 220, pointerEvents: "none", textAlign: "center" }}>
        <div className="ed-float-soft" style={{ position: "absolute", left: 0, right: 0, bottom: "100%", display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative", display: "inline-block", maxWidth: 176, background: "linear-gradient(180deg, rgba(20,12,55,0.95), rgba(10,6,35,0.95))", border: "1.5px solid rgba(242,194,96,0.65)", borderRadius: 16, padding: "10px 14px", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 14, lineHeight: 1.3, color: "#fce9a8", textAlign: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}>
            Arrastra y suelta<br />en su tacho.
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
              <p className="ed-body" style={{ marginBottom: 16, fontSize: 14 }}>Salen otras cosas para clasificar.</p>
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
  const pcols = res.cols || ["Objeto", "Contenedor correcto"];
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
          <div style={{ ...printStyles.cell, ...printStyles.cellEmp }}><div style={printStyles.cellL}>Tema</div><div style={printStyles.cellV}>{res.themeEmoji || "♻️"}</div></div>
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
  const cols = res.cols || ["Objeto", "Contenedor"]; // encabezados de la tabla según la mecánica
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
            {`"${app.studentName || "Campeón"}, ${res.praise || "¡cuidaste el planeta clasificando la basura!"}"`}
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
            <SummaryCell label="Tema" value={res.themeEmoji || "♻️"} tone="#fce9a8" emphasis />
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

// ══════════════════════════════════════════════════════════════
// TEMA 2 · "Cambio climático" (9 años). Se jugará en 3 rondas/mecánicas.
// RONDA 1 lista: "¿Qué pasa si...?" (causa y efecto, formato "Mira y toca").
// (Rondas 2 "El termómetro del planeta" y 3 "¿Qué clima es?" se agregan luego.)
// Reutiliza shuffle() y ANIMOS ya definidos arriba.
// ══════════════════════════════════════════════════════════════
const CLIMA_LABEL = "Cambio climático";
const ROUNDS_CLIMA = 1; // Reto 1 = 1 sola pregunta de causa-efecto
const RECENT_KEY_CLIMA = "edinun_juego3_clima_causaefecto_recientes_v1";
const OPTION_COLORS = ["#ef5a5a", "#4fa0ff", "#2ecc8f"];

const PREGUNTAS_CLIMA = [
  { ctx: "🏭", enunciado: "Si quemamos mucho carbón y petróleo, ¿qué pasa?", pista: "Sube un gas que calienta la Tierra.",
    opciones: [{ e: "🧊", t: "Hace más frío" }, { e: "🌡️", t: "El planeta se calienta" }, { e: "💨", t: "El aire se limpia" }], correcta: 1 },
  { ctx: "🌳", enunciado: "Si talamos los bosques, ¿qué ocurre?", pista: "Los árboles nos dan oxígeno.",
    opciones: [{ e: "🫁", t: "Queda menos oxígeno" }, { e: "🐾", t: "Hay más animales" }, { e: "🌧️", t: "Llueve más" }], correcta: 0 },
  { ctx: "🚗", enunciado: "Si hay demasiados autos con humo, ¿qué pasa?", pista: "El humo tiene gases que calientan.",
    opciones: [{ e: "🌡️", t: "Más gases que calientan" }, { e: "🌻", t: "Más flores" }, { e: "🔇", t: "Menos ruido" }], correcta: 0 },
  { ctx: "💧", enunciado: "Si malgastamos el agua, ¿qué puede pasar?", pista: "El agua se puede acabar.",
    opciones: [{ e: "🌊", t: "Más ríos" }, { e: "🏜️", t: "Sequías y falta de agua" }, { e: "🐟", t: "Más peces" }], correcta: 1 },
  { ctx: "🐄", enunciado: "La ganadería con muchas vacas produce mucho…", pista: "Un gas que también sale de la basura.",
    opciones: [{ e: "💎", t: "Diamantes" }, { e: "🫧", t: "Gas metano" }, { e: "🍫", t: "Chocolate" }], correcta: 1 },
  { ctx: "🔥", enunciado: "Si el planeta se calienta mucho, ¿qué aumenta?", pista: "Pasa con mucha sequía y calor.",
    opciones: [{ e: "❄️", t: "Las nevadas" }, { e: "🔥", t: "Los incendios" }, { e: "🎈", t: "Los globos" }], correcta: 1 },
  { ctx: "🧊", enunciado: "Con el calentamiento global, los glaciares…", pista: "El hielo con calor se derrite.",
    opciones: [{ e: "🧊", t: "Se derriten" }, { e: "⬆️", t: "Crecen" }, { e: "🎨", t: "Cambian de color" }], correcta: 0 },
  { ctx: "🌱", enunciado: "Plantar árboles ayuda a…", pista: "Los árboles limpian el aire.",
    opciones: [{ e: "🫁", t: "Dar más oxígeno" }, { e: "🌡️", t: "Calentar más" }, { e: "🗑️", t: "Hacer basura" }], correcta: 0 },
];

function getRecentClima() {
  try { const r = JSON.parse(localStorage.getItem(RECENT_KEY_CLIMA) || "[]"); return Array.isArray(r) ? r : []; } catch (e) { return []; }
}
function pushRecentClima(ids) {
  const prev = getRecentClima().filter((id) => ids.indexOf(id) === -1);
  const next = ids.concat(prev).slice(0, 8);
  try { localStorage.setItem(RECENT_KEY_CLIMA, JSON.stringify(next)); } catch (e) {}
}
function pickRoundsClima(n) {
  const recent = new Set(getRecentClima());
  const all = PREGUNTAS_CLIMA.map((_, i) => i);
  const fresh = shuffle(all.filter((i) => !recent.has(i)));
  const stale = shuffle(all.filter((i) => recent.has(i)));
  return fresh.concat(stale).slice(0, n);
}

function CausaEfectoRound({ app, setApp, go, onDone, onRestart, reto }) {
  const char = CHARACTERS.find((c) => c.id === app.character) || CHARACTERS[0];

  const [rounds, setRounds] = useStateG(() => pickRoundsClima(ROUNDS_CLIMA));
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

  useEffectG(() => { pushRecentClima(rounds); }, []);
  useEffectG(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - started.current) / 1000)), 500);
    return () => clearInterval(id);
  }, []);

  const q = PREGUNTAS_CLIMA[rounds[idx]];
  const answered = picked !== null;
  const correcta = q.opciones[q.correcta];

  function formatTime(s) { const m = Math.floor(s / 60), ss = s % 60; return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`; }

  function confirmRestart() {
    setConfirmingRestart(false);
    advancing.current = false;
    const nuevas = pickRoundsClima(ROUNDS_CLIMA);
    pushRecentClima(nuevas);
    setRounds(nuevas);
    setIdx(0); setPicked(null); setFeedback(null); setFeedbackMsg("");
    setAciertos(0); setStars(0); setLog([]);
    started.current = Date.now(); exerciseStart.current = Date.now();
  }

  function answerTap(i) {
    if (answered || advancing.current) return;
    if (typeof markFirstAttempt === "function") markFirstAttempt();
    setPicked(i);
    const isCorrect = i === q.correcta;
    const entry = { idx: idx + 1, emoji: q.ctx, label: q.enunciado, binLabel: `${q.opciones[i].e} ${q.opciones[i].t}`, ok: isCorrect };
    const newLog = [...log, entry];
    const newAciertos = aciertos + (isCorrect ? 1 : 0);
    const newStars = stars + (isCorrect ? 1 : 0);
    const isLast = idx + 1 >= ROUNDS_CLIMA;
    setLog(newLog); setAciertos(newAciertos); setStars(newStars);
    advancing.current = true;
    if (isCorrect) {
      setApp((s) => ({ ...s, stars: (s.stars || 0) + 1 }));
      setFeedback("ok"); setFeedbackMsg("+1 ⭐");
      setTimeout(() => advance(newLog, newAciertos, newStars, isLast), 1050);
    } else {
      setTimeout(() => { setFeedback("err"); setFeedbackMsg(ANIMOS[idx % ANIMOS.length]); }, 2000);
      setTimeout(() => advance(newLog, newAciertos, newStars, isLast), 2700);
    }
  }

  function advance(newLog, newAciertos, newStars, isLast) {
    setFeedback(null); setFeedbackMsg("");
    if (!isLast) {
      setIdx((i) => i + 1); setPicked(null);
      exerciseStart.current = Date.now(); advancing.current = false;
    } else {
      onDone({ log: newLog, stars: newStars, aciertos: newAciertos, total: ROUNDS_CLIMA });
    }
  }

  return (
    <div className="ed-noselect" style={{ position: "absolute", inset: 0, overflow: "hidden", WebkitTapHighlightColor: "transparent" }}>
      <style>{GAME_CSS}</style>
      <TemaChipsBar app={app} setApp={setApp} />

      {/* ── HUD ── */}
      <div style={{ position: "absolute", top: 10, left: 16, right: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <EdinunLogoMini size={60} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.35)", borderRadius: 999, padding: "6px 12px", border: "1px solid rgba(242,194,96,0.4)", fontFamily: "var(--ed-font-mono)", fontSize: 13, color: "#fce9a8" }}>⏱ {formatTime(elapsed)}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.35)", borderRadius: 999, padding: "6px 12px", border: "1px solid rgba(242,194,96,0.4)", fontFamily: "var(--ed-font-display)", fontWeight: 600, color: "#fce9a8" }}>⭐ {stars}</div>
        </div>
      </div>

      {/* ── RONDA con dots ── */}
      <div style={{ position: "absolute", top: 52, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 8 }}>
        <span className="ed-label" style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>Ronda</span>
        {Array.from({ length: reto.total }).map((_, i) => (
          <div key={i} style={{ width: 11, height: 11, borderRadius: "50%", background: i < reto.index ? "#fce9a8" : (i === reto.index ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)"), boxShadow: i < reto.index ? "0 0 8px currentColor" : "none", color: "#fce9a8" }} />
        ))}
      </div>

      {/* ── Personaje guía + bocadillo (pista) ── */}
      <div style={{ position: "absolute", left: 8, bottom: 78, width: 220, pointerEvents: "none", textAlign: "center" }}>
        <div className="ed-float-soft" style={{ position: "absolute", left: 0, right: 0, bottom: "100%", display: "flex", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{ position: "relative", display: "inline-block", maxWidth: 210, background: "linear-gradient(180deg, rgba(20,12,55,0.95), rgba(10,6,35,0.95))", border: "1.5px solid rgba(242,194,96,0.65)", borderRadius: 16, padding: "10px 14px", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 14, lineHeight: 1.3, color: "#fce9a8", textAlign: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}>
            {q.pista || "Toca la correcta."}
            <div style={{ position: "absolute", bottom: -10, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "9px solid transparent", borderRight: "9px solid transparent", borderTop: "10px solid rgba(20,12,55,0.95)", filter: "drop-shadow(0 1px 0 rgba(242,194,96,0.55))" }} />
          </div>
        </div>
        <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
          <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", width: 140, height: 16, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(242,194,96,0.45), transparent 70%)", filter: "blur(5px)" }} />
          <char.Component size={186} floating />
        </div>
        <div style={{ marginTop: -2, fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 14, color: "#fce9a8", letterSpacing: "0.04em", textShadow: "0 2px 6px rgba(0,0,0,0.6)" }}>{char.name}</div>
      </div>

      {/* ── Zona central ── */}
      <div style={{ position: "absolute", top: 78, bottom: 22, left: 215, right: 215, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly" }}>
        <div style={{ textAlign: "center", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 25, lineHeight: 1.18, color: "#fff", textShadow: "0 2px 6px rgba(0,0,0,0.55)", pointerEvents: "none", maxWidth: 470 }}>{q.enunciado}</div>
        <div style={{ width: 156, height: 146, borderRadius: 22, background: "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(240,235,225,0.9))", border: "3px solid #f2c260", boxShadow: "0 12px 28px rgba(0,0,0,0.45), 0 0 0 1px rgba(242,194,96,0.35), inset 0 -4px 0 rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 104, lineHeight: 1 }}>{q.ctx}</div>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "nowrap" }}>
          {q.opciones.map((op, i) => {
            const correctOne = i === q.correcta; const baseColor = OPTION_COLORS[i % OPTION_COLORS.length];
            let borderColor = baseColor; let bg = "linear-gradient(180deg, #fff8e6 0%, #f7e3a8 100%)"; let nameColor = "#3a2608";
            if (answered) {
              if (correctOne) { borderColor = "#2ecc8f"; bg = "linear-gradient(180deg, rgba(72,224,154,0.95), rgba(26,143,95,0.92))"; nameColor = "#06381f"; }
              else if (i === picked) { borderColor = "#ff6b6b"; bg = "linear-gradient(180deg, rgba(255,139,139,0.92), rgba(178,47,47,0.9))"; nameColor = "#fff"; }
              else { bg = "linear-gradient(180deg, rgba(255,248,230,0.5), rgba(247,227,168,0.5))"; }
            }
            return (
              <button key={i} onClick={() => answerTap(i)} disabled={answered} title="Toca para responder"
                style={{ position: "relative", width: 146, height: 146, borderRadius: 20, border: `3px solid ${borderColor}`, background: bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, cursor: answered ? "default" : "pointer", boxShadow: answered && correctOne ? "0 0 22px rgba(46,204,143,0.6), inset 0 1px 0 rgba(255,255,255,0.4)" : "inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -3px 0 rgba(0,0,0,0.12), 0 6px 14px rgba(0,0,0,0.3)", transform: answered && correctOne ? "translateY(-4px)" : "none", transition: "all 0.15s ease" }}>
                <span style={{ fontSize: 72, lineHeight: 1, filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.3))" }}>{op.e}</span>
                <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 16, color: nameColor }}>{op.t}</span>
                {answered && correctOne && (<div className="ed-checkPop" style={{ position: "absolute", top: -12, right: -12, width: 34, height: 34, borderRadius: "50%", background: "#2ecc71", color: "#fff", fontWeight: 900, fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.45)", border: "3px solid rgba(255,255,255,0.95)" }}>✓</div>)}
                {answered && !correctOne && i === picked && (<div className="ed-checkPop" style={{ position: "absolute", top: -12, right: -12, width: 34, height: 34, borderRadius: "50%", background: "#e74c3c", color: "#fff", fontWeight: 900, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.45)", border: "3px solid rgba(255,255,255,0.95)" }}>✗</div>)}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Acciones (derecha) ── */}
      <div style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 12, width: 150 }}>
        <button className="ed-btn ed-btn-restart" onClick={() => setConfirmingRestart(true)} style={{ fontSize: 15, padding: "0 10px", height: 56, fontWeight: 800, letterSpacing: "0.04em" }}>REINICIAR</button>
        <button className="ed-btn ed-btn-ghost" onClick={() => setConfirmingExit(true)} style={{ fontSize: 15, padding: "0 10px", height: 56, fontWeight: 800, letterSpacing: "0.04em" }}>SALIR</button>
      </div>

      {/* ── Overlay de feedback (estándar EDINUN) ── */}
      {feedback && (
        <PortalToBody>
          <div style={{ position: "fixed", inset: 0, zIndex: 1000, pointerEvents: "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)", animation: "ed-pop-in 0.3s" }}>
            <div style={{ fontFamily: "'Fredoka','Baloo 2',system-ui,sans-serif", fontWeight: 700, fontSize: "clamp(56px, 11vmin, 120px)", color: feedback === "ok" ? "#2ecc8f" : "#ff6b6b", textShadow: "0 4px 0 rgba(0,0,0,0.45), 0 0 60px currentColor" }}>{feedback === "ok" ? "¡EXCELENTE!" : "¡UPS!"}</div>
            {feedbackMsg && (
              <div style={{ fontFamily: "'Fredoka','Baloo 2',system-ui,sans-serif", fontWeight: 700, fontSize: "clamp(18px, 2.6vmin, 30px)", color: feedback === "ok" ? "#fce9a8" : "#fff", background: "rgba(0,0,0,0.55)", padding: "8px 26px", borderRadius: 999, textShadow: "0 2px 6px rgba(0,0,0,0.6)", textAlign: "center" }}>{feedback === "err" ? `${feedbackMsg} — ${char.name}` : feedbackMsg}</div>
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
                <button className="ed-btn ed-btn-primary" onClick={() => { setConfirmingRestart(false); onRestart(); }} style={{ height: 44, fontWeight: 800, letterSpacing: "0.04em" }}>SÍ, REINICIAR</button>
              </div>
            </div>
          </div>
        </PortalToBody>
      )}
    </div>
  );
}

// ── RONDA 2: "El termómetro del planeta" ──
// El niño toca acciones que CUIDAN el planeta para enfriarlo (termómetro baja,
// la Tierra pasa de 🔴 a 🟢). Las que DAÑAN se marcan y no ayudan (no baja el progreso).
// (Planeta TEMPORAL con emoji+CSS; se cambiará por assets/tierra-estados.png.)
const CLIMA_ACCIONES_BUENAS = [
  { id: "arboles", e: "🌳", t: "Plantar árboles" },
  { id: "solar", e: "☀️", t: "Energía solar" },
  { id: "eolica", e: "🌬️", t: "Energía del viento" },
  { id: "bici", e: "🚲", t: "Usar la bici" },
  { id: "reciclar", e: "♻️", t: "Reciclar" },
  { id: "agua", e: "💧", t: "Ahorrar agua" },
];
const CLIMA_ACCIONES_MALAS = [
  { id: "talar", e: "🪓", t: "Talar árboles" },
  { id: "fabrica", e: "🏭", t: "Fábrica con humo" },
  { id: "autos", e: "🚗", t: "Muchos autos" },
  { id: "quemar", e: "🔥", t: "Quemar basura" },
  { id: "desperdiciar", e: "🚰", t: "Desperdiciar agua" },
];
function buildTermoTray() {
  const buenas = shuffle(CLIMA_ACCIONES_BUENAS).slice(0, 4).map((a) => ({ ...a, good: true }));
  const malas = shuffle(CLIMA_ACCIONES_MALAS).slice(0, 2).map((a) => ({ ...a, good: false }));
  return shuffle(buenas.concat(malas));
}

function TermometroRound({ app, setApp, go, onDone, onRestart, reto }) {
  const char = CHARACTERS.find((c) => c.id === app.character) || CHARACTERS[0];
  const trayRef = useRefG(null);
  if (!trayRef.current) trayRef.current = buildTermoTray();
  const [tray] = useStateG(trayRef.current);
  const [tapped, setTapped] = useStateG({});
  const [banner, setBanner] = useStateG(null);
  const [bannerMsg, setBannerMsg] = useStateG("");
  const [elapsed, setElapsed] = useStateG(0);
  const [confirmingExit, setConfirmingExit] = useStateG(false);
  const [confirmingRestart, setConfirmingRestart] = useStateG(false);
  const started = useRefG(Date.now());
  const firstDone = useRefG(false);
  const endedRef = useRefG(false);
  const logRef = useRefG([]);

  const totalBuenas = tray.filter((a) => a.good).length;
  const foundBuenas = tray.filter((a) => a.good && tapped[a.id] === "ok").length;
  const temp = Math.max(0, Math.round(100 - (foundBuenas / totalBuenas) * 100));
  const aura = temp > 66 ? "#ff6b4a" : (temp > 33 ? "#ffcf5a" : "#57d98a");
  const planetImg = temp > 66 ? "tierra-caliente.png" : (temp > 33 ? "tierra-media.png" : "tierra-feliz.png");

  useEffectG(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - started.current) / 1000)), 500);
    return () => clearInterval(id);
  }, []);
  function fmt(s) { const m = Math.floor(s / 60), ss = s % 60; return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`; }

  function tapAction(a) {
    if (endedRef.current || tapped[a.id]) return;
    if (!firstDone.current) { firstDone.current = true; if (typeof markFirstAttempt === "function") markFirstAttempt(); }
    setTapped((p) => ({ ...p, [a.id]: a.good ? "ok" : "bad" }));
    logRef.current.push({ emoji: a.e, label: a.t, binLabel: a.good ? "Cuida el planeta 🌱" : "Daña el planeta 🏭", ok: a.good });
    if (a.good) {
      setApp((s) => ({ ...s, stars: (s.stars || 0) + 1 }));
      const nowFound = foundBuenas + 1;
      if (nowFound >= totalBuenas) {
        endedRef.current = true;
        setTimeout(() => { setBanner("ok"); setBannerMsg(`+${totalBuenas} ⭐`); }, 600);
        setTimeout(() => {
          setBanner(null); setBannerMsg("");
          const log = logRef.current.slice();
          const ok = log.filter((e) => e.ok).length;
          onDone({ log, stars: ok, aciertos: ok, total: log.length });
        }, 2200);
      }
    }
  }

  return (
    <div className="ed-noselect" style={{ position: "absolute", inset: 0, overflow: "hidden", WebkitTapHighlightColor: "transparent" }}>
      <style>{GAME_CSS}</style>
      <TemaChipsBar app={app} setApp={setApp} />

      {/* ── HUD ── */}
      <div style={{ position: "absolute", top: 10, left: 16, right: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <EdinunLogoMini size={60} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.35)", borderRadius: 999, padding: "6px 12px", border: "1px solid rgba(242,194,96,0.4)", fontFamily: "var(--ed-font-mono)", fontSize: 13, color: "#fce9a8" }}>⏱ {fmt(elapsed)}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.35)", borderRadius: 999, padding: "6px 12px", border: "1px solid rgba(242,194,96,0.4)", fontFamily: "var(--ed-font-display)", fontWeight: 600, color: "#fce9a8" }}>⭐ {foundBuenas}</div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 52, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 8 }}>
        <span className="ed-label" style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>Ronda</span>
        {Array.from({ length: reto.total }).map((_, i) => (
          <div key={i} style={{ width: 11, height: 11, borderRadius: "50%", background: i < reto.index ? "#fce9a8" : (i === reto.index ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)"), boxShadow: i < reto.index ? "0 0 8px currentColor" : "none", color: "#fce9a8" }} />
        ))}
      </div>

      {/* ── Personaje guía + bocadillo ── */}
      <div style={{ position: "absolute", left: 8, bottom: 78, width: 220, pointerEvents: "none", textAlign: "center" }}>
        <div className="ed-float-soft" style={{ position: "absolute", left: 0, right: 0, bottom: "100%", display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative", display: "inline-block", maxWidth: 200, background: "linear-gradient(180deg, rgba(20,12,55,0.95), rgba(10,6,35,0.95))", border: "1.5px solid rgba(242,194,96,0.65)", borderRadius: 16, padding: "10px 14px", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 14, lineHeight: 1.3, color: "#fce9a8", textAlign: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}>
            Toca las acciones<br />que lo cuidan.
            <div style={{ position: "absolute", bottom: -10, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "9px solid transparent", borderRight: "9px solid transparent", borderTop: "10px solid rgba(20,12,55,0.95)", filter: "drop-shadow(0 1px 0 rgba(242,194,96,0.55))" }} />
          </div>
        </div>
        <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
          <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", width: 140, height: 16, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(242,194,96,0.45), transparent 70%)", filter: "blur(5px)" }} />
          <char.Component size={186} floating />
        </div>
        <div style={{ marginTop: -2, fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 14, color: "#fce9a8", letterSpacing: "0.04em", textShadow: "0 2px 6px rgba(0,0,0,0.6)" }}>{char.name}</div>
      </div>

      {/* ── Zona central: enunciado + planeta/termómetro + acciones ── */}
      <div style={{ position: "absolute", top: 74, bottom: 16, left: 210, right: 210, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ textAlign: "center", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 23, color: "#fff", textShadow: "0 2px 6px rgba(0,0,0,0.55)", pointerEvents: "none" }}>Enfría el planeta.</div>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* termómetro */}
          <div style={{ width: 26, height: 148, borderRadius: 14, background: "rgba(255,255,255,0.14)", border: "2px solid rgba(255,255,255,0.45)", position: "relative", overflow: "hidden", boxShadow: "inset 0 2px 6px rgba(0,0,0,0.35)" }}>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${temp}%`, background: aura, transition: "height 0.45s ease, background 0.45s ease" }} />
          </div>
          {/* planeta (imagen según la temperatura) */}
          <div style={{ width: 172, height: 172, display: "flex", alignItems: "center", justifyContent: "center", filter: `drop-shadow(0 0 16px ${aura})`, transition: "filter 0.45s ease" }}>
            <img src={`assets/${planetImg}`} alt="" draggable="false" style={{ maxWidth: 172, maxHeight: 172, width: "auto", height: "auto", display: "block" }} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, width: "100%", maxWidth: 440 }}>
          {tray.map((a) => {
            const st = tapped[a.id];
            const border = st === "ok" ? "#2ecc8f" : (st === "bad" ? "#ff6b6b" : "#f2c260");
            const bg = st === "ok" ? "linear-gradient(180deg, rgba(72,224,154,0.95), rgba(26,143,95,0.92))" : (st === "bad" ? "linear-gradient(180deg, rgba(255,139,139,0.92), rgba(178,47,47,0.9))" : "linear-gradient(180deg, #fff8e6, #f7e3a8)");
            return (
              <button key={a.id} onClick={() => tapAction(a)} disabled={!!st || endedRef.current}
                style={{ height: 66, borderRadius: 14, border: `3px solid ${border}`, background: bg, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, cursor: st ? "default" : "pointer", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7), 0 5px 12px rgba(0,0,0,0.3)", padding: "0 8px" }}>
                <span style={{ fontSize: 28, lineHeight: 1 }}>{a.e}</span>
                <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 13, color: st === "bad" ? "#fff" : "#3a2608", textAlign: "left", lineHeight: 1.05 }}>{a.t}</span>
                {st === "ok" && <span style={{ fontSize: 15, color: "#06381f", fontWeight: 900 }}>✓</span>}
                {st === "bad" && <span style={{ fontSize: 15, color: "#fff", fontWeight: 900 }}>✗</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Acciones (derecha) ── */}
      <div style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 12, width: 150 }}>
        <button className="ed-btn ed-btn-restart" onClick={() => setConfirmingRestart(true)} style={{ fontSize: 15, padding: "0 10px", height: 56, fontWeight: 800, letterSpacing: "0.04em" }}>REINICIAR</button>
        <button className="ed-btn ed-btn-ghost" onClick={() => setConfirmingExit(true)} style={{ fontSize: 15, padding: "0 10px", height: 56, fontWeight: 800, letterSpacing: "0.04em" }}>SALIR</button>
      </div>

      {/* ── Overlay de feedback ── */}
      {banner && (
        <PortalToBody>
          <div style={{ position: "fixed", inset: 0, zIndex: 1000, pointerEvents: "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)", animation: "ed-pop-in 0.3s" }}>
            <div style={{ fontFamily: "'Fredoka','Baloo 2',system-ui,sans-serif", fontWeight: 700, fontSize: "clamp(56px, 11vmin, 120px)", color: "#2ecc8f", textShadow: "0 4px 0 rgba(0,0,0,0.45), 0 0 60px currentColor" }}>¡EXCELENTE!</div>
            {bannerMsg && (<div style={{ fontFamily: "'Fredoka','Baloo 2',system-ui,sans-serif", fontWeight: 700, fontSize: "clamp(18px, 2.6vmin, 30px)", color: "#fce9a8", background: "rgba(0,0,0,0.55)", padding: "8px 26px", borderRadius: 999, textShadow: "0 2px 6px rgba(0,0,0,0.6)", textAlign: "center" }}>{bannerMsg}</div>)}
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
              <p className="ed-body" style={{ marginBottom: 16, fontSize: 14 }}>Vas a empezar el tema desde el principio.</p>
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

// ── RONDA 3: "¿Qué clima es?" (El Niño / Neutral / La Niña) ──
// Arrastrar-y-clasificar 6 tarjetas de clima en 3 paneles + VERIFICAR.
// Mismo motor del Tema 1 (arrastre por pointer, verificación limpia → cartel), con emojis.
const CLIMA3_BINS = [
  { id: "nino",    label: "El Niño", e: "🌧️", ring: "#5aa9f5", tint: "rgba(90,169,245,0.20)" },
  { id: "neutral", label: "Neutral", e: "🌤️", ring: "#f2c94c", tint: "rgba(242,201,76,0.18)" },
  { id: "nina",    label: "La Niña", e: "❄️", ring: "#7fd8e8", tint: "rgba(127,216,232,0.20)" },
];
const CLIMA3_CARTAS = [
  { id: "lluvia",     e: "🌧️", bin: "nino",    label: "Mucha lluvia" },
  { id: "inundacion", e: "🌊", bin: "nino",    label: "Inundación" },
  { id: "soleado",    e: "☀️", bin: "neutral", label: "Día soleado" },
  { id: "templado",   e: "⛅", bin: "neutral", label: "Clima normal" },
  { id: "frio",       e: "🥶", bin: "nina",    label: "Mucho frío" },
  { id: "nieve",      e: "❄️", bin: "nina",    label: "Heladas" },
];
const CLIMA3 = {};
CLIMA3_CARTAS.forEach((c) => { CLIMA3[c.id] = c; });
function clima3BinIndex(id) { return CLIMA3_BINS.findIndex((b) => b.id === id); }
function buildRoundClima3() { return shuffle(CLIMA3_CARTAS.map((c) => c.id)); }

function ClimaRound({ app, setApp, go, onDone, onRestart, reto }) {
  const char = CHARACTERS.find((c) => c.id === app.character) || CHARACTERS[0];
  const rootRef = useRefG(null);
  const binRefs = useRefG([null, null, null]);
  const initRef = useRefG(null);
  if (!initRef.current) initRef.current = buildRoundClima3();

  const [round] = useStateG(initRef.current);
  const [placement, setPlacement] = useStateG({});
  const [dragId, setDragId] = useStateG(null);
  const [dragXY, setDragXY] = useStateG({ x: 0, y: 0 });
  const [verdict, setVerdict] = useStateG(null);
  const [revealBin, setRevealBin] = useStateG({});
  const [banner, setBanner] = useStateG(null);
  const [bannerMsg, setBannerMsg] = useStateG("");
  const [done] = useStateG(false);
  const [confirmingExit, setConfirmingExit] = useStateG(false);
  const [confirmingRestart, setConfirmingRestart] = useStateG(false);

  const started = useRefG(Date.now());
  const firstDone = useRefG(false);
  const endedRef = useRefG(false);
  const logRef = useRefG([]);
  const dragRef = useRefG(null);

  function placedGrid(n) {
    const cols = n <= 2 ? Math.max(1, n) : Math.ceil(n / 2);
    const rows = Math.ceil(n / cols) || 1;
    let size, cell;
    if (cols <= 1) { size = 54; cell = 80; }
    else if (cols === 2) { size = 44; cell = 70; }
    else { size = 32; cell = 49; }
    const rowStep = size + 20;
    return { cols, rows, cell, rowStep, size };
  }
  function verifyCol(n) {
    let step = n <= 3 ? 68 : (n === 4 ? 62 : 56);
    step = Math.min(step, 250 / Math.max(1, n - 1));
    const size = Math.max(30, step - 16);
    return { size, step };
  }
  function restPos(id) {
    const bin = placement[id];
    if (bin) {
      const bi = clima3BinIndex(bin);
      const inBin = round.filter((x) => placement[x] === bin);
      const k = inBin.indexOf(id);
      const n = inBin.length;
      if (verdict) { const c = verifyCol(n); return { x: BIN_CX[bi], y: (BIN_TOPS[bi] + 18) - k * c.step }; }
      const g = placedGrid(n);
      const row = Math.floor(k / g.cols);
      const inRow = Math.min(g.cols, n - row * g.cols);
      const col = k - row * g.cols;
      const cx = BIN_CX[bi] - ((inRow - 1) * g.cell) / 2 + col * g.cell;
      const cy = (BIN_TOPS[bi] + 60) - ((g.rows - 1) * g.rowStep) / 2 + row * g.rowStep;
      return { x: cx, y: cy };
    }
    const ti = round.indexOf(id);
    const col = ti % 3, rowN = Math.floor(ti / 3);
    return { x: GRID_X[col] != null ? GRID_X[col] : 330, y: (rowN === 0 ? 162 : 258) }; // bandeja propia del Reto 3 (espacio parejo bajo el enunciado)
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
    let hit = null;
    for (let i = 0; i < 3; i++) {
      const el = binRefs.current[i]; if (!el) continue;
      const r = el.getBoundingClientRect();
      if (e.clientX >= r.left - BIN_HIT_PAD && e.clientX <= r.right + BIN_HIT_PAD &&
          e.clientY >= r.top - BIN_HIT_PAD && e.clientY <= r.bottom + BIN_HIT_PAD) { hit = CLIMA3_BINS[i].id; break; }
    }
    if (hit) { setPlacement((p) => ({ ...p, [id]: hit })); }
    else if (d.moved) { setPlacement((p) => { const n = { ...p }; delete n[id]; return n; }); }
  }

  const allPlaced = round.every((id) => placement[id]);
  const placedCount = round.filter((id) => placement[id]).length;

  function onVerify() {
    if (!allPlaced || verdict || done) return;
    const vd = {}, rb = {};
    round.forEach((id) => {
      const ok = placement[id] === CLIMA3[id].bin;
      vd[id] = ok ? "ok" : "wrong";
      if (!ok) rb[CLIMA3[id].bin] = true;
      logRef.current.push({ idx: logRef.current.length + 1, emoji: CLIMA3[id].e, label: CLIMA3[id].label, binLabel: CLIMA3_BINS[clima3BinIndex(CLIMA3[id].bin)].label, ok });
    });
    const aciertos = round.filter((id) => placement[id] === CLIMA3[id].bin).length;
    const perfecto = aciertos === round.length;
    setVerdict(vd); setRevealBin(rb);
    endedRef.current = true;
    const revealMs = perfecto ? 900 : 5000; // Reto 3: 5 s para revisar las 6 tarjetas + ➜
    setTimeout(() => {
      if (perfecto) { setBanner("ok"); setBannerMsg(`+${aciertos} ⭐`); }
      else { setBanner("err"); setBannerMsg(ANIMOS[Math.floor(Math.random() * ANIMOS.length)]); }
    }, revealMs);
    setTimeout(() => {
      setBanner(null); setBannerMsg("");
      onDone({ log: logRef.current.slice(), stars: aciertos, aciertos, total: round.length });
    }, revealMs + 1700);
  }

  return (
    <div ref={rootRef} className="ed-noselect" style={{ position: "absolute", inset: 0, overflow: "hidden", WebkitTapHighlightColor: "transparent" }}>
      <style>{GAME_CSS}</style>
      <TemaChipsBar app={app} setApp={setApp} />

      {/* ── HUD ── */}
      <div style={{ position: "absolute", top: 10, left: 16, right: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <EdinunLogoMini size={60} />
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.4)", border: "1px solid rgba(242,194,96,0.45)", borderRadius: 999, padding: "6px 16px", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 14, color: "#fce9a8", letterSpacing: "0.04em" }}>🌦️ {placedCount} / {round.length}</div>
      </div>
      <div style={{ position: "absolute", top: 52, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 8, zIndex: 4 }}>
        <span className="ed-label" style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>Ronda</span>
        {Array.from({ length: reto.total }).map((_, i) => (
          <div key={i} style={{ width: 11, height: 11, borderRadius: "50%", background: i < reto.index ? "#fce9a8" : (i === reto.index ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)"), boxShadow: i < reto.index ? "0 0 8px currentColor" : "none", color: "#fce9a8" }} />
        ))}
      </div>

      {/* ── Enunciado (QUÉ) ── */}
      <div style={{ position: "absolute", left: 150, right: 150, top: 88, textAlign: "center", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 20, color: "#fff", textShadow: "0 2px 6px rgba(0,0,0,0.55)", pointerEvents: "none" }}>
        Coloca cada clima en su lugar.
      </div>

      {/* ── Los 3 paneles de clima ── */}
      {CLIMA3_BINS.map((b, i) => (
        <div key={b.id} style={{ position: "absolute", left: BIN_CX[i], top: BIN_TOPS[i], transform: "translateX(-50%)", width: 150, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, zIndex: 3, pointerEvents: "none" }}>
          <div ref={(el) => { binRefs.current[i] = el; }} style={{ position: "relative", width: 150, height: 164, borderRadius: 18, background: b.tint, border: `3px solid ${b.ring}`, boxShadow: "inset 0 2px 12px rgba(0,0,0,0.25), 0 6px 14px rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <span style={{ fontSize: 74, opacity: 0.22, lineHeight: 1 }}>{b.e}</span>
          </div>
          <div style={{ background: "rgba(10,6,35,0.72)", border: `2px solid ${b.ring}`, borderRadius: 999, padding: "3px 12px", fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 12.5, color: "#fff", whiteSpace: "nowrap" }}>{b.e} {b.label}</div>
        </div>
      ))}

      {/* ── Tarjetas de clima (bandeja / colocadas) ── */}
      {round.map((id) => {
        const c = CLIMA3[id];
        const dragging = dragId === id;
        const placed = !!placement[id] && !dragging;
        const pos = dragging ? dragXY : restPos(id);
        const nBin = placed ? round.filter((x) => placement[x] === placement[id]).length : 0;
        const inVerify = placed && !!verdict;
        const ps = !placed ? 84 : (inVerify ? verifyCol(nBin).size : placedGrid(nBin).size);
        const maxW = placed ? ps : 84;
        const maxH = placed ? ps : 84;
        const v = verdict && verdict[id];
        const okBin = CLIMA3_BINS[clima3BinIndex(c.bin)];
        const locked = done || !!verdict;
        return (
          <div key={id} onPointerDown={(e) => onPointerDown(e, id)} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onDragStart={(e) => e.preventDefault()}
            style={{ position: "absolute", left: pos.x, top: pos.y, transform: "translate(-50%,-50%)", zIndex: dragging ? 60 : (v === "wrong" ? 20 : (placed ? 12 : 15)), touchAction: "none", cursor: locked ? "default" : (dragging ? "grabbing" : "grab"), transition: dragging ? "none" : "left 0.18s ease, top 0.18s ease", filter: dragging ? "drop-shadow(0 10px 12px rgba(0,0,0,0.4))" : "drop-shadow(0 5px 7px rgba(0,0,0,0.3))" }}>
            <div style={{ position: "relative", width: maxW, height: maxH, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {v === "wrong" && (<div style={{ position: "absolute", inset: -7, borderRadius: "50%", background: "rgba(231,76,60,0.12)", boxShadow: "0 0 0 3px #e74c3c", zIndex: 0, pointerEvents: "none" }} />)}
              <div style={{ position: "relative", zIndex: 1, width: maxW, height: maxH, borderRadius: 14, background: "linear-gradient(180deg, #fff8e6, #f7e3a8)", border: "2px solid #f2c260", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 5px 12px rgba(0,0,0,0.3)", overflow: "hidden", padding: 2 }}>
                <span style={{ fontSize: Math.round(maxH * (placed ? 0.6 : 0.46)), lineHeight: 1 }}>{c.e}</span>
                {!placed && (<span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 11, color: "#3a2608", marginTop: 2, textAlign: "center", lineHeight: 1.05 }}>{c.label}</span>)}
              </div>
              {v === "ok" && (<div className="ed-checkPop" style={{ position: "absolute", top: -8, right: -8, width: 24, height: 24, borderRadius: "50%", background: "#2ecc71", color: "#fff", fontWeight: 900, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 5px rgba(0,0,0,0.45)", border: "2px solid rgba(255,255,255,0.9)", zIndex: 2 }}>✓</div>)}
              {v === "wrong" && (
                <div className="ed-checkPop" title={`Va en: ${okBin.label}`} style={{ position: "absolute", left: "100%", top: "50%", transform: "translateY(-50%)", marginLeft: 2, display: "flex", alignItems: "center", gap: 1, pointerEvents: "none", whiteSpace: "nowrap", zIndex: 3 }}>
                  <span style={{ fontSize: 16, fontWeight: 900, color: "#ffd27a", textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}>➜</span>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: "50%", background: "#fff", border: `3px solid ${okBin.ring}`, boxShadow: "0 2px 5px rgba(0,0,0,0.45)" }}>
                    <span style={{ fontSize: 18, lineHeight: 1 }}>{okBin.e}</span>
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
            Arrastra y suelta<br />en su clima.
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
        <button className="ed-btn ed-btn-verify" onClick={onVerify} disabled={!allPlaced || !!verdict} style={{ height: 56, fontSize: 16, fontWeight: 800, letterSpacing: "0.04em", opacity: (allPlaced && !verdict) ? 1 : 0.5, cursor: (allPlaced && !verdict) ? "pointer" : "not-allowed" }}>¡VERIFICAR!</button>
        <button className="ed-btn ed-btn-restart" onClick={() => setConfirmingRestart(true)} style={{ fontSize: 14, height: 48, fontWeight: 800, letterSpacing: "0.04em" }}>REINICIAR</button>
        <button className="ed-btn ed-btn-ghost" onClick={() => setConfirmingExit(true)} style={{ fontSize: 14, height: 48, fontWeight: 800, letterSpacing: "0.04em" }}>SALIR</button>
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
              <p className="ed-body" style={{ marginBottom: 16, fontSize: 14 }}>Vas a empezar el tema desde el principio.</p>
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

// ── Controlador del TEMA 2: encadena las rondas y arma el reporte combinado ──
function Tema2Controller({ app, setApp, go }) {
  const RETOS = [
    { key: "causa", Comp: CausaEfectoRound },
    { key: "termometro", Comp: TermometroRound },
    { key: "clima", Comp: ClimaRound },
  ];
  const [reto, setReto] = useStateG(0);
  const acc = useRefG({ log: [], stars: 0, aciertos: 0, total: 0 });
  const startedAll = useRefG(Date.now());

  function onRestart() {
    acc.current = { log: [], stars: 0, aciertos: 0, total: 0 };
    startedAll.current = Date.now();
    setReto(0);
  }
  function onDone(r) {
    const a = acc.current;
    const base = a.log.length;
    (r.log || []).forEach((e, i) => a.log.push({ ...e, idx: base + i + 1 }));
    a.stars += r.stars || 0; a.aciertos += r.aciertos || 0; a.total += r.total || 0;
    if (reto + 1 >= RETOS.length) {
      setApp((s) => ({
        ...s, stars: a.stars,
        lastResult: {
          category: CLIMA_LABEL, solved: a.aciertos, total: a.total,
          time: Math.floor((Date.now() - startedAll.current) / 1000),
          starsEarned: a.stars, log: a.log.slice(),
          cols: ["Actividad", "Tu respuesta"], themeEmoji: "🌍",
          praise: "¡aprendiste cómo cuidar el planeta!",
        },
      }));
      if (typeof incrementGamesCompleted === "function") incrementGamesCompleted();
      go("results");
    } else {
      setReto(reto + 1);
    }
  }

  const cur = RETOS[reto];
  const Comp = cur.Comp;
  return <Comp key={cur.key} app={app} setApp={setApp} go={go} onDone={onDone} onRestart={onRestart} reto={{ index: reto, total: RETOS.length, key: cur.key }} />;
}

// Repartidor: monta la mecánica según el tema elegido en el Home.
function GameScreen(props) {
  const cat = props.app && props.app.currentCategory;
  if (cat === "cambioclimatico") return <Tema2Controller {...props} />;
  return <BasuraGame {...props} />;
}

Object.assign(window, { GameScreen, ResultsScreen });
