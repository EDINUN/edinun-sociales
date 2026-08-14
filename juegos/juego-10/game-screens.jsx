// game-screens.jsx — juego-10 (Estudios Sociales · Tema 1 para 8 años).
// Juego MULTI-TEMA: `GameScreen` despacha por `app.currentCategory` y cada tema tiene su
// propio arreglo de rondas; el chrome EDINUN lo comparten todos vía `J10Game`.
//
// TEMA 1 · "Recursos naturales y los derechos de la Tierra" (Tema 2 del libro) — J10_ROUNDS:
//   R1 "Mapa vivo"               — ARRASTRAR 4 especies a su región natural + ¡VERIFICAR!
//   R2 "El ascensor del Ecuador" — TOCAR la franja del territorio que se describe (2 veces)
//   R3 "Ficha del descubrimiento"— ELEGIR la opción correcta en 3 huecos + ¡VERIFICAR!
//
// TEMAS 2 y 3: sin material todavía (botones en "Próximamente" en el Home).
//
// CONTRATO: GameScreen/ResultsScreen({app,setApp,go}) en window; markFirstAttempt() en la
// 1a respuesta; incrementGamesCompleted() al fin. Invariantes EDINUN: fallar NO baja el
// progreso; al fallar se revela la correcta en el lenguaje de la mecánica; salir/reiniciar
// con modal. Enunciado = QUE, bocadillo = COMO. Anti-repeticion por ronda.
//
// ⚠ DATOS: todo sale TEXTUAL del tema del libro (pp. 78-79 + cuaderno pp. 69-72).
// No inventar cifras: es material escolar. Ver `.planning/juego-10-design.md`.

const { useState: useStateG, useEffect: useEffectG, useRef: useRefG } = React;

function PortalToBody({ children }) {
  return ReactDOM.createPortal(children, document.body);
}

const CAT_LABEL = "Recursos naturales y los derechos de la Tierra";
const TOTAL = 3;

const ANIMOS = [
  "¡Casi! Sigue intentándolo.",
  "¡La próxima es tuya!",
  "Equivocarse también es aprender.",
];

// ── Anti-repeticion FIFO en localStorage (una clave por ronda) ──
function j10Recent(key) { try { const r = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(r) ? r : []; } catch (e) { return []; } }
function j10Push(key, id, cap) { try { const prev = j10Recent(key).filter((x) => x !== id); localStorage.setItem(key, JSON.stringify([id].concat(prev).slice(0, cap))); } catch (e) {} }
function j10Shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
// Devuelve k INDICES de `pool` evitando los recientes de `key` (sin registrarlos todavía:
// así se puede re-sortear sin ensuciar la memoria). Registrar luego con j10Commit.
// OJO cap: para elegir un SUBCONJUNTO usar cap < pool.length - k (si no, parte el banco en
// grupos fijos que alternan idéntico cada recarga). Para elegir 1 de N, cap alto (N-1).
function j10PickIdx(pool, k, key) {
  const recent = new Set(j10Recent(key)), all = pool.map((_, i) => i);
  return j10Shuffle(all.filter((i) => !recent.has(i))).concat(j10Shuffle(all.filter((i) => recent.has(i)))).slice(0, k);
}
function j10Commit(key, idxs, cap) { idxs.forEach((i) => j10Push(key, i, cap)); }

// Las 4 regiones naturales del Ecuador (cuadro resumen de la p. 72).
// ⚠ Los colores NO salen del libro (su cuadro no fija paleta): son los 4 del ecosistema
// EDINUN, los mismos que usa juego-13 para los continentes.
const J10_REGIONES = [
  { id: "galapagos", n: "GALÁPAGOS", col: "#3f8ee0" },
  { id: "costa", n: "COSTA", col: "#e4881a" },
  { id: "sierra", n: "SIERRA", col: "#9b6fe0" },
  { id: "amazonia", n: "AMAZONÍA", col: "#2ecc8f" },
];
function j10Reg(id) { return J10_REGIONES.find((r) => r.id === id) || J10_REGIONES[0]; }

// ══════════════════════════════════════════════════════════════════
// BANCO DE ESPECIES (R1) — del cuadro resumen de flora y fauna (p. 72) y de los textos
// "Flora y fauna de la Sierra / de la Costa / de las islas Galápagos / de la Amazonía".
//
// ⚠ EXCLUIDOS POR AMBIGÜEDAD (tendrían DOS respuestas correctas; misma regla que los
// montes Urales en juego-13): cedro · laurel · caoba (Costa y Amazonía) · palo santo
// (Costa y Galápagos) · cacao y palma africana (Costa y Amazonía) · soya (Costa y Sierra)
// · monos · loros · papagayos (Costa y Amazonía) · curiquingues y buitres (Sierra y
// Amazonía) · arveja y garbanzo (Sierra y Amazonía) · atún y corvina (Costa y Galápagos)
// · ganado vacuno y caballar (Costa y Sierra) · cabras (Costa y Sierra) · manglares
// (Costa y Galápagos) · líquenes y musgos (Sierra y Galápagos) · culebras, lagartijas,
// lagartos y serpientes (en tres regiones).
//
// ⚠ FUERA TAMBIÉN por confusión a los 8 años: naranja / mandarina junto a naranjilla, y
// plátano junto a banano.
//
// ⚠ REGLA DEL EMOJI (2026-08-13, tras el reporte de la autora: "¿por qué Gallinazos está
// con un corazón negro? Eso está mal, ¿en qué se relaciona?"). El emoji es DECORATIVO pero
// no puede contradecir al nombre:
//   · Si existe el emoji de la especie, se usa (🦙 llamas · 🐢 tortuga · 🌵 cactus).
//   · Si NO existe, va el de su GRUPO: 🐦 ave · 🦅 ave rapaz o carroñera · 🦜 lorífero ·
//     🐟 pez · 🐾 mamífero · 🌳 árbol · 🌿 planta · 🌸 flor · 🥔 tubérculo · 🌾 cereal.
//   · NUNCA un "parecido" que nombre otra cosa. Eliminados por eso:
//     🖤 gallinazos (no relaciona nada) · 🐜 oso hormiguero (¡esa es su presa!) ·
//     🌶️ achiote (parece ají) · 🐍 anguilas (parece culebra) · 🕊️ fragatas y albatros
//     (paloma blanca) · 🐤 piqueros (pollito) · 🪶 águilas arpías (una pluma suelta) ·
//     🎋 caña de azúcar (bambú de Tanabata) · 🪵 caucho (un tronco cortado).
//   · Y quedan FUERA DEL BANCO tres especies cuyo único emoji posible mentía:
//     **papaya** y **taxos** (🍈 es un melón) y **pepino de mar** (🥒 es la verdura).
// ══════════════════════════════════════════════════════════════════
const J10_ESPECIES = [
  // ── COSTA (12) ──
  { t: "Arroz", e: "🌾", c: "costa" },
  { t: "Banano", e: "🍌", c: "costa" },
  { t: "Caña de azúcar", e: "🌿", c: "costa" },
  { t: "Mango", e: "🥭", c: "costa" },
  { t: "Piña", e: "🍍", c: "costa" },
  { t: "Ceibos", e: "🌳", c: "costa" },
  { t: "Conchas", e: "🐚", c: "costa" },
  { t: "Camarón", e: "🦐", c: "costa" },
  { t: "Oso hormiguero", e: "🐾", c: "costa" },
  { t: "Tigrillo", e: "🐆", c: "costa" },
  { t: "Gaviotas", e: "🐦", c: "costa" },
  { t: "Pargo", e: "🐟", c: "costa" },
  // ── SIERRA (14) ──
  { t: "Chuquiragua", e: "🌸", c: "sierra" },
  { t: "Pajonales", e: "🌿", c: "sierra" },
  { t: "Helechos", e: "🌿", c: "sierra" },
  { t: "Papas", e: "🥔", c: "sierra" },
  { t: "Mellocos", e: "🥔", c: "sierra" },
  { t: "Ocas", e: "🥔", c: "sierra" },
  { t: "Maíz", e: "🌽", c: "sierra" },
  { t: "Trigo", e: "🌾", c: "sierra" },
  { t: "Capulíes", e: "🍒", c: "sierra" },
  { t: "Moras", e: "🫐", c: "sierra" },
  { t: "Llamas", e: "🦙", c: "sierra" },
  { t: "Cóndor", e: "🦅", c: "sierra" },
  { t: "Borregos", e: "🐑", c: "sierra" },
  { t: "Mirlos", e: "🐦", c: "sierra" },
  // ── AMAZONÍA (15) ──
  { t: "Orquídeas", e: "🌺", c: "amazonia" },
  { t: "Naranjilla", e: "🍊", c: "amazonia" },
  { t: "Limones", e: "🍋", c: "amazonia" },
  { t: "Balsa", e: "🌳", c: "amazonia" },
  { t: "Canela", e: "🌿", c: "amazonia" },
  { t: "Caucho", e: "🌳", c: "amazonia" },
  { t: "Achiote", e: "🌿", c: "amazonia" },
  { t: "Café", e: "☕", c: "amazonia" },
  { t: "Guacamayos", e: "🦜", c: "amazonia" },
  { t: "Pericos", e: "🦜", c: "amazonia" },
  { t: "Águilas arpías", e: "🦅", c: "amazonia" },
  { t: "Quilicos", e: "🦅", c: "amazonia" },
  { t: "Gallinazos", e: "🦅", c: "amazonia" },
  { t: "Anguilas", e: "🐟", c: "amazonia" },
  { t: "Pirañas", e: "🐟", c: "amazonia" },
  // ── GALÁPAGOS (13) ──
  { t: "Cactus espinosos", e: "🌵", c: "galapagos" },
  { t: "Árboles margarita", e: "🌼", c: "galapagos" },
  { t: "Tortuga gigante", e: "🐢", c: "galapagos" },
  { t: "Iguana marina", e: "🦎", c: "galapagos" },
  { t: "Pinzones de Darwin", e: "🐦", c: "galapagos" },
  { t: "Piqueros de patas azules", e: "🐦", c: "galapagos" },
  { t: "Fragatas", e: "🐦", c: "galapagos" },
  { t: "Albatros", e: "🐦", c: "galapagos" },
  { t: "Pingüinos", e: "🐧", c: "galapagos" },
  { t: "Rabijuncos", e: "🐦", c: "galapagos" },
  { t: "Cormoranes", e: "🐦", c: "galapagos" },
  { t: "Lobos marinos", e: "🦭", c: "galapagos" },
  { t: "Murciélagos", e: "🦇", c: "galapagos" },
];

// ══════════════════════════════════════════════════════════════════
// R1 · "Mapa vivo" — clasificar arrastrando sobre el mapa (patrón 8).
// 4 fichas → 4 zonas del mapa (GALÁPAGOS insular + COSTA · SIERRA · AMAZONÍA) + ¡VERIFICAR!
// Reparto VARIABLE: se exige que las 4 fichas NO sean todas de la misma región (si no, se
// resolvería por descarte). Tampoco se reparte una por región, por el mismo motivo.
// ══════════════════════════════════════════════════════════════════
const J10_R1_KEY = "edinun_j10_r1_v1";
function j10R1Build() {
  let idxs = j10PickIdx(J10_ESPECIES, 4, J10_R1_KEY);
  for (let t = 0; t < 6 && new Set(idxs.map((i) => J10_ESPECIES[i].c)).size < 2; t++) {
    idxs = j10PickIdx(J10_ESPECIES, 4, J10_R1_KEY);
  }
  j10Commit(J10_R1_KEY, idxs, 14);
  return { items: idxs.map((i, n) => ({ ...J10_ESPECIES[i], id: n })) };
}

function R1Mapa({ onSolve, verifyRef }) {
  const [b] = useStateG(() => j10R1Build());
  const [placed, setPlaced] = useStateG({});   // id -> región
  const [sel, setSel] = useStateG(null);       // respaldo tap: ficha seleccionada
  const [verified, setVerified] = useStateG(false);
  const [drag, setDrag] = useStateG(null);
  const rootRef = useRefG(null);
  const boxRefs = useRefG({});
  const dragInfo = useRefG(null);
  const allPlaced = b.items.every((it) => placed[it.id]);

  function setZone(id, c) { setPlaced((s) => { const n = Object.assign({}, s); if (c) n[id] = c; else delete n[id]; return n; }); setSel(null); }
  // Margen de tolerancia al soltar. El VERTICAL es generoso (22 px) porque una zona vacía
  // mide solo 38 px de alto y a los 8 años atinar ahí es difícil; el HORIZONTAL se queda
  // corto (8 px) a propósito: las zonas están a 7 px una de otra y un margen ancho las
  // solaparía, soltando la ficha en la de al lado.
  function hitBox(x, y) {
    for (const r of J10_REGIONES) {
      const el = boxRefs.current[r.id]; if (!el) continue;
      const rc = el.getBoundingClientRect(), padX = 8, padY = 22;
      if (x >= rc.left - padX && x <= rc.right + padX && y >= rc.top - padY && y <= rc.bottom + padY) return r.id;
    }
    return null;
  }
  function onDown(e, id) {
    if (verified) return;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
    const S = rootRef.current ? (rootRef.current.getBoundingClientRect().width / 470) || 1 : 1;
    dragInfo.current = { id, x0: e.clientX, y0: e.clientY, scale: S };
    setDrag({ id, dx: 0, dy: 0, moved: false, over: null });
  }
  function onMove(e) {
    const di = dragInfo.current; if (!di) return;
    const sdx = e.clientX - di.x0, sdy = e.clientY - di.y0, moved = Math.hypot(sdx, sdy) > 6;
    setDrag({ id: di.id, dx: sdx / di.scale, dy: sdy / di.scale, moved, over: moved ? hitBox(e.clientX, e.clientY) : null });
  }
  function onUp(e) {
    const di = dragInfo.current; if (!di) return;
    const sdx = e.clientX - di.x0, sdy = e.clientY - di.y0, moved = Math.hypot(sdx, sdy) > 6, id = di.id;
    dragInfo.current = null; setDrag(null);
    if (verified) return;
    if (moved) { setZone(id, hitBox(e.clientX, e.clientY)); return; }  // soltar fuera = vuelve a la bandeja
    // Toque simple (respaldo del arrastre). Si ya había OTRA ficha seleccionada y esta está
    // dentro de una zona, el toque vale como "tocar esa zona": si no, la ficha ya colocada
    // se comería el toque y la zona llena dejaría de aceptar fichas (bug cazado en juego-13).
    if (sel !== null && sel !== id) {
      const zone = placed[id] || hitBox(e.clientX, e.clientY);
      if (zone) { setZone(sel, zone); return; }
    }
    setSel((cur) => (cur === id ? null : id));
  }
  function endDrag() { dragInfo.current = null; setDrag(null); }
  function tapZone(c) { if (verified || sel === null) return; setZone(sel, c); }

  function verificar() {
    if (verified || !allPlaced) return;
    setVerified(true);
    const okCount = b.items.filter((it) => placed[it.id] === it.c).length;
    onSolve(okCount === b.items.length, {
      emoji: "🗺️", a: "¿En qué región natural vive cada especie?",
      userAnswer: b.items.map((it) => `${it.t}=${j10Reg(placed[it.id]).n}`).join(", "),
      correctAnswer: b.items.map((it) => `${it.t}=${j10Reg(it.c).n}`).join(", "),
    }, okCount);
  }
  verifyRef.current = verificar;

  // Ficha: en la bandeja (grande) o dentro de una zona del mapa (miniatura).
  function chip(it, mini) {
    const isSel = sel === it.id, dragging = drag && drag.id === it.id;
    const ok = verified && placed[it.id] === it.c;
    let border = "#f2c260";
    if (!verified && isSel) border = "#4fd8ff";
    if (verified) border = ok ? "#2ecc8f" : "#ff6b6b";
    return (
      <button key={it.id} onPointerDown={(e) => onDown(e, it.id)} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={endDrag}
        onClick={(e) => e.stopPropagation()} disabled={verified}
        style={{ position: "relative", width: mini ? "100%" : 104, minHeight: mini ? 58 : 62, borderRadius: mini ? 11 : 14, border: `${mini ? 2 : 3}px solid ${border}`, background: "linear-gradient(180deg,#fff8e6,#f7e3a8)", color: "#3a2608", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1, padding: mini ? "2px 3px 12px" : "6px 5px", cursor: verified ? "default" : "grab", touchAction: "none", zIndex: dragging ? 60 : 1, transform: dragging ? `translate(${drag.dx}px, ${drag.dy}px) scale(1.06)` : (isSel ? "scale(1.04)" : "none"), boxShadow: (dragging || isSel) ? "0 0 18px rgba(79,216,255,0.65)" : "inset 0 1px 0 rgba(255,255,255,0.7), 0 4px 10px rgba(0,0,0,0.26)", transition: dragging ? "none" : "transform 0.12s ease" }}>
        {/* ⚠ La miniatura conserva la MISMA forma que la ficha de la bandeja —emoji arriba,
            nombre abajo— porque la autora pidió que al arrastrarla no cambie de aspecto.
            Se probó ponerlos en fila (emoji al lado) para ahorrar alto y, además de no
            gustarle, dejaba el nombre en ~60 px y las palabras largas se partían.
            Apilados, el nombre dispone del ancho completo (~82 px) y entra a cuerpo 10. */}
        <span style={{ fontSize: mini ? 16 : 22, lineHeight: 1, flexShrink: 0 }}>{it.e}</span>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: mini ? 11 : 10.5, lineHeight: mini ? 1.05 : 1.1, textAlign: "center", minWidth: 0, overflowWrap: "anywhere" }}>{it.t}</span>
        {/* ⚠ El ✓/✗ y la región correcta van POSICIONADOS DENTRO de la ficha, sobre la
            franja de 12 px que el `paddingBottom` reserva SIEMPRE (también sin verificar).
            Así el alto de la ficha —y con él el del cajón— es el mismo antes y después de
            verificar: nada salta. En el flujo normal sumaban una línea y obligaban a
            reservar 20 px extra por ficha; colgando por fuera del borde se montaban sobre
            la ficha vecina. */}
        {verified && (
          <span style={{ position: "absolute", left: 2, right: 2, bottom: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 3, minWidth: 0 }}>
            <span style={{ flexShrink: 0, fontSize: mini ? 8.5 : 11, fontWeight: 900, color: "#fff", background: ok ? "#1f8a54" : "#c0392b", borderRadius: "50%", width: mini ? 13 : 19, height: mini ? 13 : 19, display: "flex", alignItems: "center", justifyContent: "center" }}>{ok ? "✓" : "✗"}</span>
            {!ok && (
              <span style={{ minWidth: 0, whiteSpace: "nowrap", background: "linear-gradient(180deg,#ffe6a1,#f1c153)", border: "1.5px solid #e0a72c", borderRadius: 999, padding: "0 4px", fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: mini ? 7.5 : 8, letterSpacing: "-0.01em", color: "#5a3d0a" }}>{j10Reg(it.c).n}</span>
            )}
          </span>
        )}
      </button>
    );
  }

  // Zona del mapa. Galápagos va con ancho fijo (recuadro insular); las 3 bandas del
  // continente se reparten el resto.
  // Alto COMPARTIDO por las 4 zonas: cajón grande de arranque (118, el tamaño que tenían
  // antes de que crecieran) + 26 px por cada ficha del cajón MÁS lleno. Como la fila va con
  // `alignItems: flex-end` y el panel está anclado abajo, ese crecimiento va HACIA ARRIBA.
  // ⚠ Tres intentos hasta acertar, todos reportados por la autora:
  //   · `minHeight: 126` fijo → no crecía nunca.
  //   · base 62 + 26 por ficha → crecía, pero el cajón vacío quedaba como una tira pegada
  //     al rótulo ("los cuadritos deben ser más grandes").
  //   · el alto por zona (cada una con SUS fichas) → los cuatro cajones quedaban de alturas
  //     distintas y se veía desprolijo ("no debe crecer solo uno, deberían crecer todos").
  // Tope: con las 4 fichas en un mismo cajón el panel llega a 236 px y todavía cabe encima
  // la bandeja llena (132 px) dentro de los ~380 disponibles.
  // Alto COMPARTIDO por las 4 zonas: base + 62 px por cada ficha del cajón MÁS lleno.
  // El paso es el MISMO antes y después de verificar (el ✓/✗ y la pastilla van absolutos
  // sobre la franja que el `paddingBottom` de la ficha ya reserva), así que al verificar
  // nada salta.
  // ⚠ La base fue bajando (118 → 96 → 84) a medida que la ficha colocada crecía: base y
  // tamaño de ficha compiten por el MISMO espacio. El techo lo pone el peor caso —las 4
  // fichas en un mismo cajón— que debe seguir cabiendo con la bandeja encima.
  const maxEnZona = J10_REGIONES.reduce((m, r) => Math.max(m, b.items.filter((it) => placed[it.id] === r.id).length), 0);
  const altoZona = 84 + maxEnZona * 62;

  function zona(r, fixedW) {
    const inside = b.items.filter((it) => placed[it.id] === r.id);
    const over = drag && drag.over === r.id && !verified;
    const on = (sel !== null || over) && !verified;
    return (
      <div key={r.id} ref={(el) => { boxRefs.current[r.id] = el; }} onClick={() => tapZone(r.id)}
        style={{ width: fixedW || "auto", flex: fixedW ? "0 0 auto" : "1 1 0", minWidth: 0, minHeight: altoZona, borderRadius: 12, border: `3px ${on ? "solid" : "dashed"} ${r.col}`, background: over ? "rgba(255,255,255,0.22)" : (on ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.24)"), cursor: (sel !== null && !verified) ? "pointer" : "default", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "5px 3px 7px", boxShadow: over ? `0 0 22px ${r.col}` : "none", transform: over ? "scale(1.02)" : "none", transition: "all 0.14s ease" }}>
        <div style={{ pointerEvents: "none", textAlign: "center", width: "100%" }}>
          <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 10.5, color: "#fff", letterSpacing: "0.02em", lineHeight: 1.1 }}>{r.n}</span>
          <div style={{ height: 4, borderRadius: 999, background: r.col, marginTop: 3, boxShadow: `0 0 8px ${r.col}` }} />
        </div>
        {inside.map((it) => chip(it, true))}
      </div>
    );
  }

  const tray = b.items.filter((it) => !placed[it.id]);
  return (
    <div ref={rootRef} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", height: "100%", width: "100%", paddingTop: 58 }}>
      <div style={{ pointerEvents: "none", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 20, color: "#fff" }}>Ubica cada especie en la región donde vive.</span>
      </div>
      {/* El mapa va ANCLADO ABAJO y la bandeja centrada en lo que queda arriba: así, cada
          vez que cae una ficha, la zona (y con ella el panel) CRECE HACIA ARRIBA en vez de
          empujar hacia abajo — pedido de la autora. Por eso las zonas arrancan en
          `minHeight: 38` (solo el rótulo) y no grandes y vacías. */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", minHeight: 0, width: "100%" }}>
        {/* Bandeja: las fichas todavía sin ubicar, en rejilla 2×2, centrada en el hueco
            libre por encima del mapa. */}
        <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, justifyContent: "center", justifyItems: "center", alignContent: "center" }}>
            {tray.map((it) => chip(it, false))}
            {tray.length === 0 && !verified && <span style={{ gridColumn: "1 / -1", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>¡Todas ubicadas! Toca ¡VERIFICAR!</span>}
          </div>
        </div>
        {/* Mapa esquemático: recuadro insular + 3 bandas del continente, sobre "mar".
            El canal de mar entre Galápagos y la Costa es lo que hace que el bloque se lea
            como un MAPA y no como cuatro cajones en fila.
            `alignItems: flex-end` = todas las zonas apoyan en la misma línea de base y cada
            una sube por su cuenta al llenarse. */}
        {/* Panel de 468 px (casi todo el ancho de la zona, que son 470) y los 4 cajones del
            MISMO ancho (~104). Con 456 y Galápagos aparte quedaban a ~99 y los nombres de
            una sola palabra larga ("Chuquiragua", "Murciélagos", "Gallinazos") no entraban.
            El canal de mar bajó a 10 px para ganar ese espacio. */}
        <div style={{ flexShrink: 0, marginTop: 12, width: 468, boxSizing: "border-box", display: "flex", gap: 7, alignItems: "flex-end", padding: 7, borderRadius: 16, border: "3px solid rgba(242,194,96,0.75)", background: "linear-gradient(180deg, rgba(26,78,124,0.55), rgba(11,38,66,0.62))", boxShadow: "0 10px 24px rgba(0,0,0,0.4)" }}>
          {zona(J10_REGIONES[0])}
          <div style={{ flex: "0 0 auto", alignSelf: "stretch", width: 10, borderRadius: 999, background: "linear-gradient(180deg, rgba(79,216,255,0.42), rgba(63,142,224,0.22))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, lineHeight: 1 }}>🌊</div>
          {J10_REGIONES.slice(1).map((r) => zona(r))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// R2 · "El ascensor del Ecuador" — TOCAR la franja del territorio (patrón 5).
// Las 6 zonas y sus definiciones son LITERALES del cuaderno (p. 69, "Lee el texto sobre
// las otras regiones que pertenecen a nuestro país"). UNA definición por ronda.
// Valida AL TOCAR, sin ¡VERIFICAR!. Sin marcadores inventados.
// ══════════════════════════════════════════════════════════════════
const J10_ZONAS = [
  { id: "orbita", n: "Órbita geoestacionaria", e: "🛰️", d: "Espacio circular sobre el territorio nacional, en el cual nuestro país puede colocar satélites para comunicaciones e investigación." },
  { id: "aereo", n: "Espacio aéreo", e: "✈️", d: "Se halla sobre el territorio nacional. Las aeronaves extranjeras requieren autorización para sobrevolar en este espacio." },
  { id: "mar", n: "Mar territorial", e: "🌊", d: "Extensión del océano comprendida hasta 200 millas, medidas desde las partes más salientes de nuestras costas." },
  { id: "plataforma", n: "Plataforma submarina", e: "🐟", d: "Declive que va desde la playa hasta el lecho del mar a unos 200 m de profundidad; espacio donde se desarrolla la flora." },
  { id: "subsuelo", n: "Subsuelo", e: "⛏️", d: "Estrato que se halla debajo del suelo que pisamos; tiene un gran potencial minero." },
  { id: "antartida", n: "Zona Antártida", e: "🐧", d: "Área de 323 000 km² en la Antártida para realizar investigaciones. Ecuador tiene allí la estación científica «Pedro Vicente Maldonado»." },
];
function j10Zona(id) { return J10_ZONAS.find((z) => z.id === id) || J10_ZONAS[0]; }
// Las 5 primeras forman el corte vertical (de arriba abajo); la Antártida NO es una capa
// del corte, va en su propio recuadro al costado.
const J10_CORTE = ["orbita", "aereo", "mar", "plataforma", "subsuelo"];

const J10_R2_KEY = "edinun_j10_r2_v1";
function j10R2Build() {
  // UNA zona por ronda (para elegir 1 de N, cap alto = máxima variedad al recargar).
  const i = j10PickIdx(J10_ZONAS, 1, J10_R2_KEY)[0];
  j10Commit(J10_R2_KEY, [i], 5);
  return { zona: J10_ZONAS[i] };
}

// ⚠ Una ronda = UNA jugada. El primer intento encadenaba DOS definiciones seguidas "para
// que la ronda no quedara corta" y la autora lo cazó: va contra la regla del repo (nació
// del error de juego-4, que repetía la actividad N veces dentro de la misma ronda). Como
// la ronda se resuelve con un solo toque, vale ⭐ +3 —igual que las otras dos— siguiendo
// el criterio de la calculadora de juego-13 (Tema 2, R2).
function R2Ascensor({ onSolve }) {
  const [b] = useStateG(() => j10R2Build());
  const [picked, setPicked] = useStateG(null);
  const target = b.zona;

  function tap(id) {
    if (picked !== null) return;
    setPicked(id);
    const ok = id === target.id;
    // Se llama a onSolve YA: el revelado sigue en pantalla mientras el orquestador espera
    // sus 900/2400 ms antes del overlay.
    onSolve(ok, {
      emoji: "🛰️", a: "¿Qué zona del territorio es?",
      userAnswer: j10Zona(id).n,
      correctAnswer: target.n,
    }, ok ? 3 : 0);
  }

  function franja(z, alto, sep) {
    const esCorrecta = picked !== null && z.id === target.id;
    const esFallo = picked === z.id && z.id !== target.id;
    // ⚠ Las franjas van con relleno CREMA OPACO, como las fichas de la R1 y las opciones
    // de la R3. El primer intento las pintó con blanco translúcido (rgba blanco al 14 %)
    // sobre el fondo verde y la autora reportó que "casi no se notan, se ven muy
    // brillantes": sin opacidad no hay contraste con el lienzo.
    let border = "#d9c48a", bg = "linear-gradient(180deg,#fffdf6,#f6ecd2)", col = "#3a2608";
    if (esCorrecta) { border = "#2ecc8f"; bg = "linear-gradient(180deg, rgba(72,224,154,0.95), rgba(26,143,95,0.92))"; col = "#06381f"; }
    else if (esFallo) { border = "#ff6b6b"; bg = "linear-gradient(180deg, rgba(255,139,139,0.92), rgba(178,47,47,0.9))"; col = "#fff"; }
    return (
      <button key={z.id} onClick={() => tap(z.id)} disabled={picked !== null}
        style={{ position: "relative", width: "100%", height: alto, marginTop: sep || 0, borderRadius: 10, border: `2.5px solid ${border}`, background: bg, color: col, display: "flex", alignItems: "center", gap: 8, padding: "0 12px", cursor: picked === null ? "pointer" : "default", boxShadow: esCorrecta ? "0 0 20px rgba(46,204,143,0.55)" : "inset 0 1px 0 rgba(255,255,255,0.75), 0 3px 8px rgba(0,0,0,0.22)", transition: "all 0.15s ease" }}>
        <span style={{ fontSize: 18, lineHeight: 1 }}>{z.e}</span>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 12.5, lineHeight: 1.1, textAlign: "left" }}>{z.n}</span>
        {(esCorrecta || esFallo) && (
          <span style={{ position: "absolute", top: -8, right: -7, fontSize: 11, fontWeight: 900, color: "#fff", background: esCorrecta ? "#1f8a54" : "#c0392b", borderRadius: "50%", width: 19, height: 19, display: "flex", alignItems: "center", justifyContent: "center" }}>{esCorrecta ? "✓" : "✗"}</span>
        )}
      </button>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", height: "100%", width: "100%", paddingTop: 58 }}>
      <div style={{ pointerEvents: "none", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 20, color: "#fff" }}>Encuentra la zona del territorio que se describe.</span>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, minHeight: 0, width: "100%" }}>
        {/* Tarjeta con la definición (literal del cuaderno) */}
        <div style={{ width: 446, boxSizing: "border-box", borderRadius: 14, border: "3px solid #f2c260", background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(240,235,225,0.92))", padding: "9px 13px", boxShadow: "0 10px 24px rgba(0,0,0,0.4)", fontFamily: "var(--ed-font-ui)", fontSize: 12.5, lineHeight: 1.3, color: "#3a2608", textAlign: "center" }}>
          {target.d}
        </div>
        {/* Corte vertical, de la órbita al subsuelo. La zona Antártida cierra la lista
            con un poco más de aire arriba: no es una capa del corte, pero sacarla a un
            recuadro al costado se veía mal (reportado por la autora). */}
        {/* 300 px de ancho, no 380: la autora pidió las franjas más angostas. La tarjeta de
            la definición sí se queda en 446 — es el enunciado, no una opción tocable. */}
        <div style={{ width: 300, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 5 }}>
          {J10_CORTE.map((id) => franja(j10Zona(id), 36))}
          {franja(j10Zona("antartida"), 36, 7)}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// R3 · "Ficha del descubrimiento" — ELEGIR en los huecos (patrón 6).
// Ficha de UNA especie emblemática con 3 huecos; cada hueco muestra sus 2 opciones y el
// niño toca la correcta. ¡VERIFICAR! valida los 3 de una vez (una ronda = una jugada) y
// solo se habilita con los 3 contestados.
//
// ⚠ CRITERIO DE DISTRACTORES: el dato correcto (`ok`) es SIEMPRE textual del libro. El
// distractor (`no`) sale también del libro (de otra región u otra ficha) siempre que exista
// una alternativa real; donde el libro no ofrece ninguna, es una negación evidente del dato
// —nunca una cifra inventada— y va marcada con `// negación`.
// ══════════════════════════════════════════════════════════════════
const J10_FICHAS = [
  {
    id: "cutin", n: "Cutín", e: "🐸",
    campos: [
      { k: "Apareció en el año", ok: "2010", no: "1990" },                                       // negación
      { k: "Lo encontraron en", ok: "la cordillera del Cóndor", no: "las islas Galápagos" },
      { k: "Su nombre significa", ok: "pequeño cóndor", no: "pequeño puma" },                    // negación
      { k: "Es más pequeño que", ok: "una moneda de un centavo", no: "una pelota de fútbol" },   // negación
      { k: "El iris de su ojo es", ok: "rojo intenso", no: "azul claro" },                       // negación
      { k: "Su vientre es", ok: "algo transparente", no: "de color negro" },                     // negación
      { k: "Para llamar a la hembra, el macho infla", ok: "una bolsa que resuena", no: "las alas para volar" }, // negación
    ],
  },
  {
    id: "tortuga", n: "Tortuga de Galápagos", e: "🐢",
    campos: [
      { k: "Dio su nombre oficial a", ok: "las islas Galápagos", no: "la cordillera del Cóndor" },
      { k: "Se la encuentra en el", ok: "volcán Alcedo", no: "volcán Cotopaxi" },
      { k: "En las islas hay", ok: "1 900 especies de animales", no: "8 200 especies de animales" },
      { k: "Plantas endémicas de las islas", ok: "220", no: "399" },
      { k: "Endémico quiere decir", ok: "propio de cierta región", no: "traído de otro país" },
    ],
  },
  {
    id: "condor", n: "Cóndor", e: "🦅",
    campos: [
      { k: "Para el Ecuador es nuestra", ok: "ave símbolo", no: "flor símbolo" },                // negación
      { k: "Vive en las grandes alturas de", ok: "los Andes", no: "los manglares" },
      { k: "Hoy se encuentra", ok: "en peligro de extinción", no: "fuera de peligro" },          // negación
      { k: "Le hace daño la contaminación de", ok: "los ríos", no: "las montañas" },             // negación
      { k: "También lo perjudica", ok: "la cacería", no: "la lluvia" },                          // negación
      { k: "Para protegerlo se trabaja con", ok: "la comunidad", no: "los turistas" },           // negación
    ],
  },
  {
    id: "chuquiragua", n: "Chuquiragua", e: "🌸",
    campos: [
      { k: "Es un", ok: "arbusto con flor", no: "árbol muy grande" },
      { k: "Su corteza es", ok: "dura", no: "blanda" },                                          // negación
      { k: "Se la conoce como", ok: "la flor del andinista", no: "la flor del manglar" },        // negación
      { k: "Crece en", ok: "los páramos", no: "los manglares" },
      { k: "Junto a ella hay gran cantidad de", ok: "pajonales", no: "cactus espinosos" },
    ],
  },
];

const J10_R3FIC_KEY = "edinun_j10_r3fic_v1";
function j10R3CampoKey(id) { return "edinun_j10_r3_" + id + "_v1"; }
function j10R3Build() {
  // Ficha: 1 de 4, cap = banco−1 (para 1 solo ítem, cap alto = máxima variedad).
  const fi = j10PickIdx(J10_FICHAS, 1, J10_R3FIC_KEY)[0];
  j10Commit(J10_R3FIC_KEY, [fi], 3);
  const fic = J10_FICHAS[fi];
  // Campos: SUBCONJUNTO de 3 → cap < pool−3 para no partir el banco en grupos fijos.
  // Dos campos no pueden ofrecer el MISMO par de opciones (se vería como fila repetida).
  const ck = j10R3CampoKey(fic.id);
  const firma = (c) => [c.ok, c.no].slice().sort().join("|");
  const vistas = new Set(), ci = [];
  j10PickIdx(fic.campos, fic.campos.length, ck).forEach((i) => {
    if (ci.length >= 3) return;
    const f = firma(fic.campos[i]);
    if (vistas.has(f)) return;
    vistas.add(f); ci.push(i);
  });
  j10Commit(ck, ci, 2);
  const filas = ci.map((i, n) => {
    const c = fic.campos[i];
    return { id: n, k: c.k, ok: c.ok, opts: j10Shuffle([c.ok, c.no]) };
  });
  return { fic, filas };
}

function R3Ficha({ onSolve, verifyRef }) {
  const [b] = useStateG(() => j10R3Build());
  const [sel, setSel] = useStateG({});          // filaId -> texto elegido
  const [verified, setVerified] = useStateG(false);
  const completas = b.filas.every((f) => sel[f.id] !== undefined);

  function pick(fid, txt) { if (verified) return; setSel((s) => Object.assign({}, s, { [fid]: txt })); }
  function verificar() {
    if (verified || !completas) return;
    setVerified(true);
    const aciertos = b.filas.filter((f) => sel[f.id] === f.ok).length;
    onSolve(aciertos === b.filas.length, {
      emoji: b.fic.e, a: `Ficha de: ${b.fic.n}`,
      userAnswer: b.filas.map((f) => `${f.k} ${sel[f.id]}`).join(" · "),
      correctAnswer: b.filas.map((f) => `${f.k} ${f.ok}`).join(" · "),
    }, aciertos);
  }
  verifyRef.current = verificar;

  function optBtn(f, o) {
    const chosen = sel[f.id] === o, isOk = o === f.ok;
    let border = "#d9c48a", bg = "linear-gradient(180deg,#fffdf6,#f6ecd2)", col = "#3a2608", badge = null;
    if (!verified && chosen) { border = "#4fd8ff"; bg = "linear-gradient(180deg,#eaf9ff,#cdeeff)"; }
    if (verified) {
      if (isOk) { border = "#2ecc8f"; bg = "linear-gradient(180deg,rgba(72,224,154,0.95),rgba(26,143,95,0.92))"; col = "#06381f"; badge = "✓"; }
      else if (chosen) { border = "#ff6b6b"; bg = "linear-gradient(180deg,rgba(255,139,139,0.92),rgba(178,47,47,0.9))"; col = "#fff"; badge = "✗"; }
      else { bg = "linear-gradient(180deg,rgba(255,253,246,0.45),rgba(246,236,210,0.45))"; col = "rgba(58,38,8,0.4)"; }
    }
    return (
      <button key={o} onClick={() => pick(f.id, o)} disabled={verified}
        style={{ position: "relative", flex: 1, minWidth: 0, minHeight: 42, borderRadius: 11, border: `2.5px solid ${border}`, background: bg, color: col, fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 12.5, lineHeight: 1.15, padding: "5px 7px", cursor: verified ? "default" : "pointer", transform: (!verified && chosen) ? "translateY(-1px)" : "none", boxShadow: (!verified && chosen) ? "0 0 14px rgba(79,216,255,0.5), inset 0 1px 0 rgba(255,255,255,0.7)" : "inset 0 1px 0 rgba(255,255,255,0.7), 0 3px 8px rgba(0,0,0,0.22)", transition: "transform 0.12s ease" }}>
        {o}
        {badge && <span style={{ position: "absolute", top: -9, right: -7, fontSize: 11, fontWeight: 900, color: "#fff", background: badge === "✓" ? "#1f8a54" : "#c0392b", borderRadius: "50%", width: 19, height: 19, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 5px rgba(0,0,0,0.35)" }}>{badge}</span>}
      </button>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", height: "100%", width: "100%", paddingTop: 58 }}>
      <div style={{ pointerEvents: "none", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 20, color: "#fff" }}>Completa la ficha de la especie.</span>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0, width: "100%" }}>
        <div style={{ width: 442, boxSizing: "border-box", background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(240,235,225,0.92))", border: "3px solid #f2c260", borderRadius: 18, padding: "11px 15px 13px", boxShadow: "0 12px 28px rgba(0,0,0,0.4)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, borderBottom: "2px solid rgba(224,167,44,0.55)", paddingBottom: 7, marginBottom: 9 }}>
            <span style={{ fontSize: 22, lineHeight: 1 }}>{b.fic.e}</span>
            {/* Solo el nombre de la especie: sin rótulos decorativos inventados. */}
            <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 14.5, letterSpacing: "0.03em", color: "#3a2608" }}>{b.fic.n.toUpperCase()}</span>
          </div>
          {b.filas.map((f, n) => (
            <div key={f.id} style={{ marginTop: n === 0 ? 0 : 9 }}>
              <div style={{ fontFamily: "var(--ed-font-ui)", fontSize: 10.5, letterSpacing: "0.07em", textTransform: "uppercase", color: "#7a5c1e", marginBottom: 3 }}>{f.k}</div>
              <div style={{ display: "flex", gap: 8 }}>{f.opts.map((o) => optBtn(f, o))}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Arreglo de rondas del TEMA 1 (3 rondas, 3 verbos: arrastrar · tocar · elegir) ──
const J10_ROUNDS = [
  // ⚠ El bocadillo decía "sobre el mapa" y la autora preguntó "¿a qué mapa se refiere?":
  // el panel son 4 zonas de color, no una silueta reconocible del Ecuador. El CÓMO no
  // puede nombrar algo que el niño no ve en pantalla.
  { C: R1Mapa, verify: true, bubble: (<>Arrastra la ficha<br />hasta su región.</>) },
  // ⚠ Decía "Toca la franja en el dibujo" cuando la R2 era un corte con la Antártida al
  // costado. Ahora son seis opciones en lista: ya no hay "dibujo" que tocar. Misma regla
  // que el "mapa" de la R1 y el "hueco" de la R3 — el bocadillo solo nombra lo que se ve.
  { C: R2Ascensor, verify: false, bubble: (<>Toca la que creas<br />correcta.</>) },
  // ⚠ Decía "Toca la opción correcta en cada hueco" y la autora lo rechazó: "hueco" es
  // vocabulario de diseño (el slot vacío de un formulario), no de un niño de 8 años. El
  // bocadillo no puede nombrar la mecánica con jerga interna. Cortado en 3 renglones para
  // que el más largo sea corto y el globo no se acerque tanto a la ficha.
  { C: R3Ficha, verify: true, bubble: (<>Toca las tres<br />respuestas<br />correctas.</>) },
];

// ══════════════════════════════════════════════════════════════════
// ORQUESTADOR compartido por TODOS los temas — chrome EDINUN (HUD, personaje, acciones,
// overlay, modales). Recibe el arreglo de rondas del tema activo.
// ⭐ = +1 por ELEMENTO resuelto bien (R1 hasta 4 fichas · R3 hasta 3 huecos) y +3 de una
// vez en la R2, que se resuelve con un solo toque → **10 máximo**. `isCorrect` de la ronda
// = ronda perfecta. Fallar nunca resta.
// ══════════════════════════════════════════════════════════════════
function J10Game({ app, setApp, go, rounds }) {
  const char = CHARACTERS.find((c) => c.id === app.character) || CHARACTERS[0];
  const ROUNDS = rounds || J10_ROUNDS;
  const total = ROUNDS.length;
  const [round, setRound] = useStateG(0);
  const [stars, setStars] = useStateG(0);
  const [log, setLog] = useStateG([]);
  const [elapsed, setElapsed] = useStateG(0);
  const [feedback, setFeedback] = useStateG(null);
  const [feedbackMsg, setFeedbackMsg] = useStateG("");
  const [confirmingExit, setConfirmingExit] = useStateG(false);
  const [confirmingRestart, setConfirmingRestart] = useStateG(false);
  const [pendingTema, setPendingTema] = useStateG(null);   // id del tema al que se quiere saltar
  const [rk, setRk] = useStateG(0);
  const [busy, setBusy] = useStateG(false);
  const started = useRefG(Date.now());
  const advancing = useRefG(false);
  const verifyRef = useRefG(null);

  useEffectG(() => { const t = setInterval(() => setElapsed(Math.floor((Date.now() - started.current) / 1000)), 500); return () => clearInterval(t); }, []);
  function formatTime(s) { const m = Math.floor(s / 60), ss = s % 60; return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`; }

  function onSolve(isCorrect, entry, gained) {
    if (advancing.current) return;
    advancing.current = true; setBusy(true);
    if (typeof markFirstAttempt === "function") markFirstAttempt();
    const g = typeof gained === "number" ? gained : (isCorrect ? 1 : 0);
    const newLog = [...log, { idx: round + 1, isCorrect, ...entry }];
    const newStars = stars + g;
    setLog(newLog); setStars(newStars);
    if (g > 0) setApp((s) => ({ ...s, stars: (s.stars || 0) + g }));
    const showFbAt = isCorrect ? 900 : 2400;
    const advanceAt = showFbAt + (isCorrect ? 1100 : 1000);
    // ⚠ En "¡UPS!" NUNCA se muestran estrellas, aunque la ronda haya dado algunas: se veía
    // "¡UPS!" con "+2 ⭐" debajo, que es contradictorio. Convención de todo el repo:
    // acierto → "+N ⭐" · fallo → frase de ánimo. Lo ganado igual sube en el ⭐ del HUD.
    setTimeout(() => { setFeedback(isCorrect ? "ok" : "err"); setFeedbackMsg(isCorrect ? `+${g} ⭐` : ANIMOS[round % ANIMOS.length]); }, showFbAt);
    setTimeout(() => {
      setFeedback(null); setFeedbackMsg("");
      if (round + 1 < total) { setRound((r) => r + 1); advancing.current = false; setBusy(false); }
      else {
        const solved = newLog.filter((e) => e.isCorrect).length;
        setApp((s) => ({ ...s, stars: newStars, lastResult: { category: app.currentCatLabel || CAT_LABEL, solved, total, time: Math.floor((Date.now() - started.current) / 1000), starsEarned: newStars, log: newLog } }));
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

  const Comp = ROUNDS[round].C;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 10, left: 16, right: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <EdinunLogoMini size={64} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.35)", borderRadius: 999, padding: "6px 12px", border: "1px solid rgba(242,194,96,0.4)", fontFamily: "var(--ed-font-mono)", fontSize: 13, color: "#fce9a8" }}>⏱ {formatTime(elapsed)}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.35)", borderRadius: 999, padding: "6px 12px", border: "1px solid rgba(242,194,96,0.4)", fontFamily: "var(--ed-font-display)", fontWeight: 600, color: "#fce9a8" }}>⭐ {stars}</div>
        </div>
      </div>

      {/* Pastillas de TEMA en el HUD (patrón de juego-13): permiten saltar de tema SIN
          volver al Home. Mientras los temas 2 y 3 estén sin material, se ve una sola
          pastilla y funciona como la pastilla estática de catLabel (§1). */}
      <div style={{ position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 8 }}>
        {LEVELS_CFG.filter((lv) => lv.enabled).map((lv) => {
          const activo = lv.id === (app.currentCategory || "recursos");
          return (
            <button key={lv.id} onClick={() => { if (!activo && !busy) setPendingTema(lv.id); }} disabled={activo}
              style={{ padding: "6px 13px", borderRadius: 999, background: activo ? lv.grad : "rgba(0,0,0,0.32)", color: activo ? lv.ink : "rgba(255,255,255,0.82)", fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 11.5, letterSpacing: "0.04em", border: activo ? "2px solid rgba(255,255,255,0.55)" : "2px solid rgba(255,255,255,0.2)", boxShadow: activo ? "0 0 14px rgba(252,233,168,0.45)" : "none", cursor: activo ? "default" : "pointer", transition: "all 0.15s ease" }}>
              {lv.short || lv.label}
            </button>
          );
        })}
      </div>

      {/* ⚠ El bloque Ronda va SIEMPRE centrado en `top: 52` (estandar-visual §1.1, y el
          format-lint lo verifica). Las pastillas van encima, en `top: 14`. */}
      <div style={{ position: "absolute", top: 52, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 8 }}>
        <span className="ed-label" style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>Ronda</span>
        {Array.from({ length: total }).map((_, i) => {
          const done = i < log.length, ok = done && log[i] && log[i].isCorrect;
          return <div key={i} style={{ width: 11, height: 11, borderRadius: "50%", background: done ? (ok ? "#fce9a8" : "#ff6b6b") : (i === round ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)"), boxShadow: done ? "0 0 8px currentColor" : "none", color: ok ? "#fce9a8" : "#ff6b6b" }} />;
        })}
      </div>

      <div style={{ position: "absolute", left: 8, bottom: 78, width: 220, pointerEvents: "none", textAlign: "center" }}>
        <div className="ed-float-soft" style={{ position: "absolute", left: 0, right: 0, bottom: "100%", display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative", display: "inline-block", maxWidth: 210, background: "linear-gradient(180deg, rgba(20,12,55,0.95), rgba(10,6,35,0.95))", border: "1.5px solid rgba(242,194,96,0.65)", borderRadius: 16, padding: "10px 14px", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 14, lineHeight: 1.3, color: "#fce9a8", textAlign: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}>
            {ROUNDS[round].bubble}
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
        <Comp key={`r${round}-${rk}`} onSolve={onSolve} verifyRef={verifyRef} />
      </div>

      <div style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 12, width: 150 }}>
        {ROUNDS[round].verify && !busy && (
          <button className="ed-btn" onClick={() => verifyRef.current && verifyRef.current()} style={{ fontSize: 15, padding: "0 10px", height: 56, fontWeight: 800, letterSpacing: "0.04em", background: "linear-gradient(180deg, #4fe08a, #1f9d57)", color: "#06381f", border: "none" }}>¡VERIFICAR!</button>
        )}
        <button className="ed-btn ed-btn-restart" onClick={() => setConfirmingRestart(true)} style={{ fontSize: 15, padding: "0 10px", height: 56, fontWeight: 800, letterSpacing: "0.04em" }}>REINICIAR</button>
        <button className="ed-btn ed-btn-ghost" onClick={() => setConfirmingExit(true)} style={{ fontSize: 15, padding: "0 10px", height: 56, fontWeight: 800, letterSpacing: "0.04em" }}>SALIR</button>
      </div>

      {feedback && (
        <PortalToBody>
          <div style={{ position: "fixed", inset: 0, zIndex: 1000, pointerEvents: "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)", animation: "ed-pop-in 0.3s" }}>
            <div style={{ fontFamily: "'Fredoka','Baloo 2',system-ui,sans-serif", fontWeight: 700, fontSize: "clamp(56px, 11vmin, 120px)", color: feedback === "ok" ? "#2ecc8f" : "#ff6b6b", textShadow: "0 4px 0 rgba(0,0,0,0.45), 0 0 60px currentColor" }}>{feedback === "ok" ? "¡EXCELENTE!" : "¡UPS!"}</div>
            {feedbackMsg && (<div style={{ fontFamily: "'Fredoka','Baloo 2',system-ui,sans-serif", fontWeight: 700, fontSize: "clamp(18px, 2.6vmin, 30px)", color: feedback === "ok" ? "#fce9a8" : "#fff", background: "rgba(0,0,0,0.55)", padding: "8px 26px", borderRadius: 999, textShadow: "0 2px 6px rgba(0,0,0,0.6)", textAlign: "center" }}>{feedback === "err" && feedbackMsg.indexOf("⭐") === -1 ? `${feedbackMsg} — ${char.name}` : feedbackMsg}</div>)}
          </div>
        </PortalToBody>
      )}

      {pendingTema && (() => {
        const cfg = LEVELS_CFG.find((l) => l.id === pendingTema) || LEVELS_CFG[0];
        return (
          <PortalToBody>
            <div onClick={() => setPendingTema(null)} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.62)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "ed-pop-in 0.18s", padding: 16 }}>
              <div onClick={(e) => e.stopPropagation()} className="ed-card" style={{ padding: 24, maxWidth: 440, textAlign: "center", boxShadow: "var(--ed-shadow-card), 0 0 40px rgba(79,216,255,0.28)" }}>
                <div className="ed-label" style={{ color: "#4fd8ff", marginBottom: 6 }}>Cambiar de tema</div>
                <h2 className="ed-h1" style={{ fontSize: 22, lineHeight: 1.15, marginBottom: 8 }}>¿Ir a "{cfg.label}"?</h2>
                <p className="ed-body" style={{ marginBottom: 16, fontSize: 14 }}>Vas a perder lo de esta ronda.</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <button className="ed-btn ed-btn-ghost" onClick={() => setPendingTema(null)} style={{ height: 44, fontWeight: 800, letterSpacing: "0.04em" }}>SEGUIR AQUÍ</button>
                  {/* Cambiar `currentCategory` basta: GameScreen monta J10Game con key={cat},
                      así que el tema nuevo entra con el estado en cero (ronda 1, sin ⭐). */}
                  <button className="ed-btn ed-btn-primary" onClick={() => { setPendingTema(null); setApp((s) => ({ ...s, currentCategory: cfg.id, currentCatLabel: cfg.catLabel })); }} style={{ height: 44, fontWeight: 800, letterSpacing: "0.04em" }}>SÍ, CAMBIAR</button>
                </div>
              </div>
            </div>
          </PortalToBody>
        );
      })()}

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
              <p className="ed-body" style={{ marginBottom: 16, fontSize: 14 }}>Vas a jugar las {total} rondas otra vez.</p>
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

// Despacho por tema (estandar-visual §8: N botones = N mini-juegos con mecánicas
// distintas). Hoy solo el Tema 1 tiene material; los otros dos están deshabilitados en el
// Home, así que nunca llegan aquí.
function GameScreen({ app, setApp, go }) {
  const cat = app.currentCategory || "recursos";
  const rounds = J10_ROUNDS;
  // `key={cat}`: al saltar de tema desde las pastillas del HUD, J10Game se REMONTA y el
  // tema nuevo arranca limpio (ronda 1, sin ⭐ ni log de la partida anterior).
  return <J10Game key={cat} app={app} setApp={setApp} go={go} rounds={rounds} />;
}

// ─────────────────────────────────────────────────────────────
// RESULTS — reporte académico imprimible (genérico, lee res.log).
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
  const res = app.lastResult || { category: CAT_LABEL, solved: 0, total: TOTAL, time: 0, starsEarned: 0, log: [] };
  const mm = Math.floor(res.time / 60), ss = res.time % 60;
  const totalEx = res.total || TOTAL;
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

Object.assign(window, { GameScreen, ResultsScreen });
