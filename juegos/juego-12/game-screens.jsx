// game-screens.jsx — juego-12 (Estudios Sociales · multi-LIBRO).
// Juego MULTI-LIBRO: el Home tiene dos niveles (Libro → Tema) y `GameScreen` despacha
// por `app.currentCategory`, que es el id del tema. Cada tema trae su propio arreglo de
// rondas; el chrome EDINUN lo comparten todos vía `J12Game`.
//
// ESTRUCTURA FIJADA POR LA AUTORA: Libro 6 → 3 temas · Libro 7 → 4 temas (7 en total).
//
// LIBRO 6 · TEMA 1 · "Estado ecuatoriano en sus primeros años de vida" — 10 años —
// D.C.D. CS.3.1.30 / CS.3.1.31 / CS.3.1.32 — L6T1_ROUNDS:
//   R1 "El sello de ciudadanía" — DECIDIR con criterio: quién podía ser ciudadano en 1830
//   R2 "La pirámide"            — APILAR por jerarquía los grupos sociales de 1830
//   R3 "La línea del tiempo"     — ORDENAR los hechos de los primeros años
//
// LIBRO 6 · TEMA 2 · "Revolución Marcista" — 10 años — L6T2_ROUNDS:
//   R1 "La bandera de marzo"       — COMPONER: el símbolo se dibuja al tocar
//   R2 "El Ecuador partido"        — TOCAR EN EL MAPA (contorno real de Natural Earth)
//   R3 "La Carta de la Esclavitud" — RASGAR: se rompe pasando el dedo
//
// LIBRO 7 · TEMA 1 · "La Revolucion Liberal" — 11 años —
// D.C.D. CS.3.1.40 / CS.3.1.41 / CS.3.1.42 / CS.3.1.43 — L7T1_ROUNDS:
//   R1 "Tender la via"      — ORDENAR arrastrando sobre la via del ferrocarril
//   R2 "La balanza de 1897" — REPARTIR entre la Iglesia / cada persona / el Estado
//   R3 "Expediente abierto" — DESTAPAR pistas y apostar cuanto antes
//
// CONTRATO: GameScreen/ResultsScreen({app,setApp,go}) en window; markFirstAttempt() en la
// 1a respuesta; incrementGamesCompleted() al fin. Invariantes EDINUN: fallar NO baja el
// progreso; al fallar se revela la correcta en el lenguaje de la mecánica; salir/reiniciar
// con modal. Enunciado = QUE, bocadillo = COMO. Anti-repeticion por ronda.
//
// ⚠ DATOS: todo sale del tema del libro (pp. 72-77) y su cuaderno (pp. 65-70). No inventar
// cifras ni personajes históricos: es material escolar. Ver `.planning/juego-12-design.md`.

const { useState: useStateG, useEffect: useEffectG, useRef: useRefG } = React;

function PortalToBody({ children }) {
  return ReactDOM.createPortal(children, document.body);
}

const CAT_LABEL = "Los primeros años del Ecuador";

const ANIMOS = [
  "¡Casi! Sigue intentándolo.",
  "¡La próxima es tuya!",
  "Equivocarse también es aprender.",
];

// ── Anti-repeticion FIFO en localStorage (una clave por ronda) ──
function j12Recent(key) { try { const r = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(r) ? r : []; } catch (e) { return []; } }
function j12Push(key, id, cap) { try { const prev = j12Recent(key).filter((x) => x !== id); localStorage.setItem(key, JSON.stringify([id].concat(prev).slice(0, cap))); } catch (e) {} }
function j12Shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
// Devuelve k INDICES de `pool` evitando los recientes de `key`, sin registrarlos todavía
// (registrar luego con j12Commit). ⚠ Cap: para un SUBCONJUNTO de K, nunca cap = K — eso
// parte el banco en grupos fijos que alternan idéntico en cada recarga.
function j12PickIdx(pool, k, key) {
  const recent = new Set(j12Recent(key)), all = pool.map((_, i) => i);
  return j12Shuffle(all.filter((i) => !recent.has(i))).concat(j12Shuffle(all.filter((i) => recent.has(i)))).slice(0, k);
}
function j12Commit(key, idxs, cap) { idxs.forEach((i) => j12Push(key, i, cap)); }
// 25000 → "25 000" (espacio fino, como lo escribe el libro).
function j12Num(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " "); }

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║ LIBRO 6 · TEMA 1 · "Estado ecuatoriano en sus primeros años de vida"       ║
// ║ Edad objetivo: 10 años (la fija la autora).                                ║
// ║                                                                            ║
// ║ 3 rondas, 3 verbos distintos:                                              ║
// ║   R1 "El sello de ciudadanía" — DECIDIR con criterio                       ║
// ║   R2 "La pirámide"            — APILAR por jerarquía                       ║
// ║   R3 "La línea del tiempo"     — ORDENAR intercambiando                    ║
// ║                                                                            ║
// ║ ⭐ 4 + 3 + 4 = **11 máximo**.                                               ║
// ║                                                                            ║
// ║ ⚠ Fuera del juego, a propósito: la pena de muerte para los 72 opositores   ║
// ║ (es del libro, pero no se hace un juego con una ejecución) y las           ║
// ║ actividades de respuesta abierta del cuaderno (2, 7, 8, 10 y la grupal).   ║
// ╚════════════════════════════════════════════════════════════════════════════╝

// ══════════════════════════════════════════════════════════════════
// R1 · "El sello de ciudadanía" — DECIDIR con criterio.
// Cuatro personas a la vez y, para cada una, SÍ o NO; ¡VERIFICAR! valida las cuatro de
// una vez (una ronda = UNA jugada, nunca cuatro jugadas seguidas). ⭐ +1 por persona.
//
// ⚠ La LEY está siempre en pantalla: la ronda se resuelve leyendo, no recordando. Es la
// regla "una ronda se resuelve con lo que se ve" (nacida en juego-14).
//
// ⚠ Las personas NO son personajes históricos: son tipos sociales que el tema nombra
// (terrateniente criollo, jornalero indígena, artesano mestizo, montuvio, aguatero,
// barrendero, vendedora, clero, militar, comerciante). Sus datos aplican los requisitos
// del Art. 12 tal como los cita el libro; no se inventan biografías de personas reales.
//
// ⚠ El caso de la MUJER que cumple los cuatro requisitos y aun así queda fuera es el que
// mejor enseña el tema (la p. 76 dice que se excluía "a las mujeres en general").
//
// ⚠ Nada de verde ni rojo antes de ¡VERIFICAR!: lo elegido se marca en azul.
// ══════════════════════════════════════════════════════════════════
const J12_LEY = [
  "Ser casado o mayor de 22 años",
  "Tener propiedades",
  "Tener empleo",
  "Saber leer y escribir",
];

// ciu = si podía ser ciudadano · motivo = lo que se revela al verificar.
const J12_PERSONAS = [
  { id: "terrateniente", n: "Don Ramón", e: "🎩", edad: 42,
    l: ["Dueño de una hacienda en la Sierra.", "Sabe leer y escribir."],
    ciu: true, motivo: "Cumplía los cuatro requisitos." },
  { id: "hacendada", n: "Doña Mercedes", e: "👒", edad: 35,
    l: ["Dueña de una hacienda y de un negocio.", "Sabe leer y escribir."],
    ciu: false, motivo: "Cumplía todo, pero las mujeres no podían ser ciudadanas." },
  { id: "comerciante", n: "Don Tomás", e: "📦", edad: 28,
    l: ["Comerciante de cacao en Guayaquil.", "Tiene casa propia y sabe leer."],
    ciu: true, motivo: "Cumplía los cuatro requisitos." },
  { id: "militar", n: "Capitán Vargas", e: "🎖️", edad: 33,
    l: ["Militar del ejército de la República.", "Tiene tierras y sabe leer."],
    ciu: true, motivo: "Cumplía los cuatro requisitos." },
  { id: "clero", n: "Padre Ignacio", e: "⛪", edad: 50,
    l: ["Sacerdote de una parroquia.", "Sabe leer y escribir, y tiene bienes."],
    ciu: true, motivo: "Cumplía los cuatro requisitos." },
  { id: "artesano", n: "Don Julián", e: "🔨", edad: 26,
    l: ["Artesano orfebre en la ciudad.", "Sabe leer, pero no tiene propiedades."],
    ciu: false, motivo: "No tenía propiedades." },
  { id: "jornalero", n: "Manuel", e: "🌾", edad: 30,
    l: ["Jornalero en una hacienda.", "No sabe leer ni tiene propiedades."],
    ciu: false, motivo: "No sabía leer y no tenía propiedades." },
  { id: "montuvio", n: "Don Jacinto", e: "🪓", edad: 38,
    l: ["Montuvio con una chacra en la Costa.", "Tiene su tierra, pero no sabe leer."],
    ciu: false, motivo: "No sabía leer y escribir." },
  { id: "aguatero", n: "Pedro", e: "🏺", edad: 24,
    l: ["Aguatero: lleva agua por la ciudad.", "No sabe leer ni tiene propiedades."],
    ciu: false, motivo: "No sabía leer y no tenía propiedades." },
  { id: "barrendero", n: "Lucho", e: "🧹", edad: 29,
    l: ["Barrendero en las calles de Quito.", "No sabe leer ni escribir."],
    ciu: false, motivo: "No sabía leer y no tenía propiedades." },
  { id: "vendedora", n: "Rosa", e: "🧺", edad: 27,
    l: ["Vende frutas en el mercado.", "Sabe leer y tiene su puesto."],
    ciu: false, motivo: "Las mujeres no podían ser ciudadanas." },
  { id: "joven", n: "Carlitos", e: "📘", edad: 19,
    l: ["Hijo de un hacendado, soltero.", "Sabe leer y vive en la casa familiar."],
    ciu: false, motivo: "Era menor de 22 años y soltero." },
];

const J12_R1_KEY = "edinun_j12_l6t1_r1_v1";
function j12R1Build() {
  // 4 de 12 ⇒ cap < 8. Se re-sortea hasta que entren al menos un SÍ y un NO: con cuatro
  // iguales se acertaría sin leer la ley.
  let idx = [], guard = 0;
  do {
    idx = j12PickIdx(J12_PERSONAS, 4, J12_R1_KEY);
    guard++;
  } while (guard < 25 && !(idx.some((i) => J12_PERSONAS[i].ciu) && idx.some((i) => !J12_PERSONAS[i].ciu)));
  j12Commit(J12_R1_KEY, idx, 6);
  return { fichas: idx.map((i) => J12_PERSONAS[i]) };
}

// La ilustración la genera la autora; mientras no esté, va el emoji del oficio.
function J12Retrato({ p, ancho, alto }) {
  const [roto, setRoto] = useStateG(false);
  if (roto) return <span style={{ fontSize: Math.round(Math.min(ancho, alto) * 0.62), lineHeight: 1 }}>{p.e}</span>;
  // ⚠ `objectFit: cover` sobre una ilustración cuadrada recorta los lados y deja la figura
  // (que va de cuerpo entero y centrada) ocupando todo el alto. El `objectPosition` en
  // "center top" asegura que, si sobra, se recorte por los pies y nunca por la cabeza.
  return <img src={`assets/persona-${p.id}.jpg`} alt="" draggable={false} onError={() => setRoto(true)}
    style={{ width: ancho, height: alto, objectFit: "cover", objectPosition: "center top", borderRadius: 10, pointerEvents: "none", WebkitUserDrag: "none" }} />;
}

function L6T1R1Sello({ onSolve, verifyRef }) {
  const [b] = useStateG(() => j12R1Build());
  const [sel, setSel] = useStateG({});          // id -> true (sí) | false (no)
  const [verified, setVerified] = useStateG(false);
  const completas = b.fichas.every((f) => sel[f.id] !== undefined);

  function elegir(id, v) { if (verified) return; setSel((s) => Object.assign({}, s, { [id]: v })); }
  function verificar() {
    if (verified || !completas) return;
    setVerified(true);
    const aciertos = b.fichas.filter((f) => sel[f.id] === f.ciu).length;
    onSolve(aciertos === b.fichas.length, {
      emoji: "📜", a: "¿Quién podía ser ciudadano en 1830?",
      userAnswer: b.fichas.map((f) => `${f.n}: ${sel[f.id] ? "sí" : "no"}`).join(" · "),
      correctAnswer: b.fichas.map((f) => `${f.n}: ${f.ciu ? "sí" : "no"}`).join(" · "),
    }, aciertos);
  }
  verifyRef.current = verificar;

  function tarjeta(f) {
    const eleccion = sel[f.id], ok = verified && eleccion === f.ciu;
    let border = "#d9c48a";
    if (!verified && eleccion !== undefined) border = "#4fd8ff";
    if (verified) border = ok ? "#2ecc8f" : "#ff6b6b";
    function btn(valor, texto) {
      const puesto = eleccion === valor;
      const correcto = verified && valor === f.ciu;
      let bg = "linear-gradient(180deg,#fffdf6,#f6ecd2)", col = "#3a2608", bd = "#d9c48a";
      if (!verified && puesto) { bg = "linear-gradient(180deg,#eaf9ff,#cdeeff)"; bd = "#4fd8ff"; }
      if (verified && correcto) { bg = "linear-gradient(180deg,rgba(72,224,154,0.95),rgba(26,143,95,0.92))"; col = "#06381f"; bd = "#2ecc8f"; }
      else if (verified && puesto) { bg = "linear-gradient(180deg,rgba(255,139,139,0.92),rgba(178,47,47,0.9))"; col = "#fff"; bd = "#ff6b6b"; }
      return (
        <button onClick={() => elegir(f.id, valor)} disabled={verified}
          style={{ flex: 1, minWidth: 0, height: 26, borderRadius: 8, border: `2px solid ${bd}`, background: bg, color: col, fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 11, cursor: verified ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
          {texto}
          {verified && puesto && <span style={{ flexShrink: 0, width: 15, height: 15, borderRadius: "50%", background: correcto ? "#0f6b3f" : "#8e1f1f", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 9.5 }}>{correcto ? "✓" : "✗"}</span>}
        </button>
      );
    }
    return (
      <div key={f.id} style={{ position: "relative", width: 221, minHeight: 132, boxSizing: "border-box", borderRadius: 13, border: `3px solid ${border}`, background: "linear-gradient(180deg, rgba(255,253,246,0.97), rgba(240,232,214,0.94))", padding: "7px 8px 8px", display: "flex", flexDirection: "column", gap: 5, boxShadow: "0 5px 14px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ flexShrink: 0, width: 56, height: 72, borderRadius: 10, background: "rgba(224,167,44,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <J12Retrato p={f} ancho={56} alto={72} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 12.5, color: "#3a2608", lineHeight: 1.1 }}>{f.n}, {f.edad} años</div>
            {f.l.map((x, i) => (
              <div key={i} style={{ fontFamily: "var(--ed-font-ui)", fontSize: 9.5, lineHeight: 1.2, color: "#5a4420", marginTop: 1 }}>{x}</div>
            ))}
          </div>
        </div>
        {/* Franja reservada SIEMPRE para el motivo del revelado: así la tarjeta no crece
            al verificar y nada salta (mismo remedio que la R1 del Tema 1 de juego-10). */}
        {/* El sello ✓/✗ de la tarjeta va AQUÍ, no en la esquina de arriba: ahí se montaba
            sobre el final del nombre, y los tres nombres más largos (135 px) no caben si
            se les estrecha el hueco. La franja ya estaba reservada, así que el sello entra
            sin que la tarjeta crezca. */}
        <div style={{ minHeight: 15, display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ flexShrink: 0, width: 15, height: 15, borderRadius: "50%", background: !verified ? "transparent" : ok ? "#1f8a54" : "#c0392b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 10, boxShadow: verified ? "0 2px 5px rgba(0,0,0,0.3)" : "none" }}>{verified ? (ok ? "✓" : "✗") : ""}</span>
          {verified && (
            <div style={{ flex: 1, minWidth: 0, fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 8.5, lineHeight: 1.15, color: "#8a6410", background: "linear-gradient(180deg,#ffe6a1,#f1c153)", border: "1.5px solid #e0a72c", borderRadius: 7, padding: "1px 6px" }}>{f.motivo}</div>
          )}
        </div>
        <div style={{ display: "flex", gap: 6 }}>{btn(true, "SÍ")}{btn(false, "NO")}</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", height: "100%", width: "100%", paddingTop: 40 }}>
      <div style={{ pointerEvents: "none", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 20, color: "#fff" }}>Decide quién podía ser ciudadano en 1830.</span>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, minHeight: 0, width: "100%" }}>
        <div style={{ width: 452, boxSizing: "border-box", borderRadius: 12, border: "2.5px solid rgba(242,194,96,0.6)", background: "rgba(0,0,0,0.34)", padding: "5px 12px 6px", flexShrink: 0 }}>
          <div className="ed-label" style={{ color: "#fce9a8", fontSize: 9.5, textAlign: "center", marginBottom: 4 }}>Constitución de 1830 · Art. 12</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "center" }}>
            {J12_LEY.map((x) => (
              <span key={x} style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 9.5, color: "#fff", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 999, padding: "2px 9px" }}>{x}</span>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, flexShrink: 0 }}>
          {b.fichas.map((f) => tarjeta(f))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// R2 · "La pirámide" — APILAR por jerarquía.
// Los cuatro escalones de la pirámide social de la p. 74. UN escalón llega ya puesto
// como ancla (varía cuál en cada partida) y se colocan los otros tres ⇒ ⭐ +1 por
// escalón, hasta 3. Tocar un grupo y luego su escalón; tocar un escalón lleno lo saca.
//
// ⚠ El ancla es lo que da variedad SIN inventar contenido: la pirámide del libro es una
// sola. Mismo recurso que el artículo de la Constitución de juego-10 (cambia qué falta).
//
// ⚠ El escalón de abajo NO lleva ilustración de personas: va con un símbolo sobrio y el
// nombre textual del grupo. No se dibuja una caricatura de personas esclavizadas.
// ══════════════════════════════════════════════════════════════════
const J12_PIRAMIDE = [
  { id: "elite", e: "🎩", n: "Élite terrateniente y altos funcionarios", an: 172 },
  { id: "medios", e: "🎖️", n: "Militares, comerciantes y clero", an: 250 },
  { id: "populares", e: "🌾", n: "Indígenas, campesinos, montuvios y mujeres", an: 328 },
  { id: "base", e: "⛓️", n: "Afroamericanos esclavizados e indígenas de la Amazonía", an: 406 },
];

const J12_R2_KEY = "edinun_j12_l6t1_r2_v1";
function j12R2Build() {
  const a = j12PickIdx(J12_PIRAMIDE, 1, J12_R2_KEY)[0];
  // ⚠ cap 1, no 3: con un banco de 4 y cap 3 sale una ROTACIÓN exacta (1-2-3-4-1-2-3-4),
  // previsible. Con cap 1 solo se descarta el ancla de la partida anterior.
  j12Commit(J12_R2_KEY, [a], 1);
  const sueltos = J12_PIRAMIDE.map((_, i) => i).filter((i) => i !== a);
  return { ancla: a, fichas: j12Shuffle(sueltos).map((i) => J12_PIRAMIDE[i]) };
}

function L6T1R2Piramide({ onSolve, verifyRef }) {
  const [b] = useStateG(() => j12R2Build());
  const [puesto, setPuesto] = useStateG({});     // indice del escalón -> id de grupo
  const [sel, setSel] = useStateG(null);
  // ⚠ El mapa queda LIMPIO para el turno siguiente: solo se ve la marca del ÚLTIMO
  // verificado, y ninguna ciudad se bloquea. Antes la ciudad usada se quedaba marcada y
  // no se podía volver a elegir, aunque fuese la correcta para el segundo gobernante.
  const [ultimo, setUltimo] = useStateG(null);   // { pide, ciudad }
  const [verified, setVerified] = useStateG(false);
  const [drag, setDrag] = useStateG(null);
  const rootRef = useRefG(null);
  const escRefs = useRefG({});
  const dragInfo = useRefG(null);
  const libres = b.fichas.filter((f) => Object.keys(puesto).every((k) => puesto[k] !== f.id));
  const completas = b.fichas.length === Object.keys(puesto).length;

  // Mueve un grupo a un escalón (o a la bandeja si `idx` es null). Si el escalón ya tenía
  // otro grupo, ese vuelve a la bandeja: nunca se pierde una ficha.
  function ponerEn(id, idx) {
    setSel(null);
    setPuesto((prev) => {
      const n = {};
      Object.keys(prev).forEach((k) => { if (prev[k] !== id && Number(k) !== idx) n[k] = prev[k]; });
      if (idx !== null && idx !== undefined && idx !== b.ancla) n[idx] = id;
      return n;
    });
  }

  // ⚠ Arrastre (pedido de la autora el 2026-11-17: *"aquí debería poder arrastrar y si ya
  // lo coloqué también arrastrar luego"*). El toque sigue funcionando como respaldo.
  function hitEscalon(x, y) {
    for (let i = 0; i < J12_PIRAMIDE.length; i++) {
      if (i === b.ancla) continue;
      const el = escRefs.current[i]; if (!el) continue;
      const r = el.getBoundingClientRect(), pad = 12;
      if (x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad) return i;
    }
    return null;
  }
  function onDown(e, id, desdeEscalon) {
    if (verified) return;
    e.stopPropagation();
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
    const S = rootRef.current ? (rootRef.current.getBoundingClientRect().width / 470) || 1 : 1;
    dragInfo.current = { id, x0: e.clientX, y0: e.clientY, scale: S, desdeEscalon: desdeEscalon === true };
    setDrag({ id, dx: 0, dy: 0, over: null, cx: e.clientX, cy: e.clientY, desdeEscalon: desdeEscalon === true, movido: false });
  }
  function onMove(e) {
    const di = dragInfo.current; if (!di) return;
    const dx = e.clientX - di.x0, dy = e.clientY - di.y0, moved = Math.hypot(dx, dy) > 6;
    setDrag({ id: di.id, dx: dx / di.scale, dy: dy / di.scale, over: moved ? hitEscalon(e.clientX, e.clientY) : null, cx: e.clientX, cy: e.clientY, desdeEscalon: di.desdeEscalon, movido: moved });
  }
  function onUp(e) {
    const di = dragInfo.current; if (!di) return;
    const moved = Math.hypot(e.clientX - di.x0, e.clientY - di.y0) > 6;
    dragInfo.current = null; setDrag(null);
    if (verified) return;
    if (moved) { ponerEn(di.id, hitEscalon(e.clientX, e.clientY)); return; }
    // Toque simple: si estaba puesta, la saca y la deja elegida para el siguiente escalón.
    if (di.desdeEscalon) { ponerEn(di.id, null); setSel(di.id); return; }
    setSel((s) => (s === di.id ? null : di.id));
  }
  function endDrag() { dragInfo.current = null; setDrag(null); }
  function tapEscalon(i) {
    if (verified || i === b.ancla) return;
    if (sel) { ponerEn(sel, i); return; }
    if (puesto[i]) ponerEn(puesto[i], null);
  }

  function verificar() {
    if (verified || !completas) return;
    setVerified(true);
    const aciertos = J12_PIRAMIDE.filter((e, i) => i !== b.ancla && puesto[i] === e.id).length;
    const nom = (id) => (J12_PIRAMIDE.find((x) => x.id === id) || {}).n || "—";
    onSolve(aciertos === b.fichas.length, {
      emoji: "🔺", a: "La pirámide social de 1830",
      userAnswer: J12_PIRAMIDE.map((e, i) => (i === b.ancla ? `${e.n} (dado)` : nom(puesto[i]))).join(" · "),
      correctAnswer: J12_PIRAMIDE.map((e) => e.n).join(" · "),
    }, aciertos);
  }
  verifyRef.current = verificar;

  function escalon(e, i) {
    const esAncla = i === b.ancla;
    const id = esAncla ? e.id : puesto[i];
    const volando = drag && drag.movido && drag.desdeEscalon && drag.id === id && !esAncla;
    const grupo = id ? J12_PIRAMIDE.find((x) => x.id === id) : null;
    const ok = verified && !esAncla && id === e.id;
    const over = drag && drag.over === i && !verified;
    let border = "#9b86d8", bg = "rgba(0,0,0,0.3)", col = "rgba(255,255,255,0.5)";
    if (esAncla) { border = "#f2c260"; bg = "linear-gradient(180deg,rgba(255,230,161,0.95),rgba(241,193,83,0.92))"; col = "#5a3d0a"; }
    else if (grupo && !volando) { border = "#d9c48a"; bg = "linear-gradient(180deg,#fffdf6,#f6ecd2)"; col = "#3a2608"; }
    if (over) { border = "#4fd8ff"; bg = "rgba(205,238,255,0.85)"; col = "#3a2608"; }
    if (verified && !esAncla) {
      border = ok ? "#2ecc8f" : "#ff6b6b";
      bg = ok ? "linear-gradient(180deg,rgba(72,224,154,0.95),rgba(26,143,95,0.92))" : "linear-gradient(180deg,rgba(255,139,139,0.92),rgba(178,47,47,0.9))";
      col = ok ? "#06381f" : "#fff";
    }
    const arrastrando = drag && grupo && drag.id === grupo.id && !esAncla;
    return (
      <button key={e.id} ref={(el) => { escRefs.current[i] = el; }} onClick={() => tapEscalon(i)} disabled={verified || esAncla}
        style={{ position: "relative", width: e.an, minHeight: 50, boxSizing: "border-box", borderRadius: 10, border: `3px ${(grupo && !volando) ? "solid" : "dashed"} ${border}`, background: bg, color: col, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "4px 10px", cursor: (verified || esAncla) ? "default" : "pointer", boxShadow: over ? "0 0 18px rgba(79,216,255,0.6)" : ((grupo && !volando) ? "inset 0 1px 0 rgba(255,255,255,0.6), 0 3px 9px rgba(0,0,0,0.26)" : "none"), transition: "border-color 0.12s ease, background 0.12s ease" }}>
        {grupo ? (
          <span onPointerDown={(verified || esAncla) ? undefined : ((ev) => onDown(ev, grupo.id, true))}
            onPointerMove={(verified || esAncla) ? undefined : onMove} onPointerUp={(verified || esAncla) ? undefined : onUp} onPointerCancel={endDrag}
            onClick={(ev) => ev.stopPropagation()}
            style={{ position: "relative", display: "flex", alignItems: "center", gap: 7, touchAction: "none", cursor: (verified || esAncla) ? "default" : "grab", opacity: volando ? 0 : 1 }}>
            {verified && !esAncla && (
              <span style={{ flexShrink: 0, width: 18, height: 18, borderRadius: "50%", background: ok ? "#1f8a54" : "#c0392b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 11, boxShadow: "0 2px 5px rgba(0,0,0,0.35)" }}>{ok ? "✓" : "✗"}</span>
            )}
            <span style={{ flexShrink: 0, fontSize: 16, lineHeight: 1 }}>{grupo.e}</span>
            <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 10.5, lineHeight: 1.15, textAlign: "left" }}>{grupo.n}</span>
          </span>
        ) : (
          <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 10.5 }}>escalón libre</span>
        )}
        {esAncla && <span style={{ position: "absolute", top: -9, left: 8, fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 8, color: "#5a3d0a", background: "linear-gradient(180deg,#ffe6a1,#f1c153)", border: "1.5px solid #e0a72c", borderRadius: 999, padding: "0 7px" }}>ya está</span>}
        {/* ⚠ El revelado NO cuelga de cada escalón. Las pastillas "aquí va: …" quedaban
            entre dos escalones, pisaban el de abajo y rompían la forma de la pirámide; la
            autora lo rechazó el 2026-11-17 (*"no me agrada cómo se ven las respuestas
            correctas"*). Va en un PANEL aparte donde estaba la bandeja (ver más abajo),
            igual que el "IBAN ASÍ" de juego-10. */}
      </button>
    );
  }

  return (
    <div ref={rootRef} style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", height: "100%", width: "100%", paddingTop: 40 }}>
      <div style={{ pointerEvents: "none", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 20, color: "#fff" }}>Arma la pirámide social de 1830.</span>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, minHeight: 0, width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, flexShrink: 0 }}>
          <span className="ed-label" style={{ color: "rgba(255,255,255,0.6)", fontSize: 9.5 }}>Arriba, los que mandaban</span>
          {J12_PIRAMIDE.map((e, i) => escalon(e, i))}
        </div>
        {/* Al verificar, el orden correcto va en un CARTEL en el sitio que ocupaba la
            bandeja: las fichas ya no sirven y así nada se mueve ni se monta. */}
        {verified ? (
          <div style={{ width: 452, boxSizing: "border-box", borderRadius: 14, border: "2.5px solid #f2c260", background: "linear-gradient(180deg, rgba(0,0,0,0.42), rgba(0,0,0,0.3))", padding: "7px 12px 9px", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flexShrink: 0 }}>
            <span className="ed-label" style={{ color: "#fce9a8", fontSize: 10 }}>La pirámide va así</span>
            {J12_PIRAMIDE.map((e, i) => {
              const acerto = i === b.ancla || puesto[i] === e.id;
              return (
                <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 7, width: "100%" }}>
                  <span style={{ flexShrink: 0, width: 16, height: 16, borderRadius: "50%", background: acerto ? "#1f8a54" : "rgba(242,194,96,0.9)", color: acerto ? "#fff" : "#5a3d0a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--ed-font-mono)", fontWeight: 700, fontSize: 9.5 }}>{acerto ? "✓" : i + 1}</span>
                  <span style={{ flexShrink: 0, fontSize: 13, lineHeight: 1 }}>{e.e}</span>
                  <span style={{ flex: 1, minWidth: 0, fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 10.5, lineHeight: 1.15, color: acerto ? "#bff3d9" : "#fff" }}>{e.n}</span>
                </div>
              );
            })}
          </div>
        ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, justifyContent: "center", width: 452, minHeight: 44, alignContent: "flex-start", flexShrink: 0 }}>
          {libres.map((f) => {
            const elegida = sel === f.id, arrastrando = drag && drag.id === f.id;
            return (
              <button key={f.id} onPointerDown={(e) => onDown(e, f.id, false)} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={endDrag} disabled={verified}
                style={{ maxWidth: 212, minHeight: 40, borderRadius: 11, border: `2.5px solid ${(elegida || arrastrando) ? "#4fd8ff" : "#d9c48a"}`, background: (elegida || arrastrando) ? "linear-gradient(180deg,#eaf9ff,#cdeeff)" : "linear-gradient(180deg,#fffdf6,#f6ecd2)", color: "#3a2608", display: "flex", alignItems: "center", gap: 6, padding: "4px 9px", textAlign: "left", cursor: verified ? "default" : "grab", touchAction: "none", zIndex: arrastrando ? 60 : 1, transform: arrastrando ? `translate(${drag.dx}px, ${drag.dy}px) scale(1.04)` : (elegida ? "translateY(-2px)" : "none"), boxShadow: (elegida || arrastrando) ? "0 0 16px rgba(79,216,255,0.6)" : "inset 0 1px 0 rgba(255,255,255,0.7), 0 3px 8px rgba(0,0,0,0.25)", transition: "none" }}>
                <span style={{ flexShrink: 0, fontSize: 15, lineHeight: 1 }}>{f.e}</span>
                <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 10, lineHeight: 1.15 }}>{f.n}</span>
              </button>
            );
          })}
          {libres.length === 0 && (
            <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 11, color: "rgba(255,255,255,0.5)", alignSelf: "center" }}>Ya los colocaste todos. Toca ¡VERIFICAR!</span>
          )}
        </div>
        )}
      </div>
      {/* Ficha FANTASMA: lo que sigue al dedo mientras se arrastra un grupo que ya estaba
          en un escalón. Su escalón se ve libre durante el gesto, así que no hay dos
          textos montados. No recibe eventos: el puntero está capturado por el origen. */}
      {drag && drag.movido && drag.desdeEscalon && (() => {
        const grupo = J12_PIRAMIDE.find((x) => x.id === drag.id);
        const r = rootRef.current ? rootRef.current.getBoundingClientRect() : null;
        if (!grupo || !r) return null;
        const S = (r.width / 470) || 1;
        return (
          <div style={{ position: "absolute", left: (drag.cx - r.left) / S, top: (drag.cy - r.top) / S, transform: "translate(-50%, -50%) scale(1.04)", pointerEvents: "none", zIndex: 80, maxWidth: 240, borderRadius: 11, border: "2.5px solid #4fd8ff", background: "linear-gradient(180deg,#eaf9ff,#cdeeff)", color: "#3a2608", display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", boxShadow: "0 0 18px rgba(79,216,255,0.7), 0 6px 16px rgba(0,0,0,0.35)" }}>
            <span style={{ flexShrink: 0, fontSize: 15, lineHeight: 1 }}>{grupo.e}</span>
            <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 10.5, lineHeight: 1.15 }}>{grupo.n}</span>
          </div>
        );
      })()}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// R3 · "La línea del tiempo" — ORDENAR intercambiando (verbo nuevo en el tema).
// Cuatro hechos de los primeros años de la República, desordenados: se tocan DOS tarjetas
// para intercambiarlas y ¡VERIFICAR! valida las cuatro de una vez. ⭐ +1 por tarjeta en
// su sitio.
//
// ⚠ Las tarjetas NO muestran el año mientras se juega: deducir el orden ES el ejercicio.
// El año aparece al verificar, junto al ✓/✗ y, si está mal, el puesto que le tocaba —
// **sin reordenar la columna**, para que el niño siga viendo su respuesta (mismo criterio
// que la línea del tiempo de juego-10).
//
// ⚠ Banco de 5 hechos, todos con **año explícito en el material y todos distintos**: si
// dos compartieran año habría dos ordenaciones correctas. Entran 4 por partida y lo que
// cambia es **cuál se queda fuera** (FIFO de 1, para que no sea el mismo dos veces
// seguidas) más el barajado inicial.
//
// ⚠ SUSTITUYE a "El censo de 1830" (estirar barras de población), que la autora descartó
// el 2026-11-17: *"la tercera ronda no me agrada, cambiemos de mecánica, está como muy
// aburrida"*. Ya se le había avisado de que era la ronda con menos variedad del tema,
// porque el libro da un solo cuadro de cifras. Esas cifras (Quito 25 000 · Cuenca 18 000 ·
// Riobamba 7 600 · Guayaquil 6 000, p. 73) quedan libres para otro tema.
// ══════════════════════════════════════════════════════════════════
const J12_HITOS = [
  { id: "h1830", y: 1830, e: "📜", t: "La Asamblea se reúne en Riobamba y nace el Estado del Ecuador." },
  { id: "h1834", y: 1834, e: "🏁", t: "Termina el periodo constitucional de Juan José Flores." },
  { id: "h1835", y: 1835, e: "🏛️", t: "En Ambato se escribe la segunda Constitución y Rocafuerte llega a la presidencia." },
  { id: "h1839", y: 1839, e: "🤝", t: "El Congreso nombra otra vez presidente a Flores y a Rocafuerte gobernador del Guayas." },
  { id: "h1843", y: 1843, e: "✒️", t: "Flores reúne en Quito una nueva Asamblea; a su Constitución la llamaron “Carta de Esclavitud”." },
];

const J12_R3_KEY = "edinun_j12_l6t1_r3_v1";
function j12R3Build() {
  // Entran 4 de 5: lo que cambia es CUÁL se queda fuera (FIFO de 1 para no repetirlo dos
  // partidas seguidas) y el barajado inicial.
  const fuera = j12PickIdx(J12_HITOS, 1, J12_R3_KEY)[0];
  j12Commit(J12_R3_KEY, [fuera], 1);
  const juegan = J12_HITOS.filter((_, i) => i !== fuera).slice().sort((a, b) => a.y - b.y);
  let ini = j12Shuffle(juegan), guard = 0;
  // Nunca arranca ya ordenada: se ganaría sin jugar.
  while (guard++ < 30 && ini.every((h, i) => h.id === juegan[i].id)) ini = j12Shuffle(juegan);
  return { correcto: juegan, orden: ini };
}

function L6T1R3Linea({ onSolve, verifyRef }) {
  const [b] = useStateG(() => j12R3Build());
  const [st, setSt] = useStateG(() => ({ orden: b.orden, drag: null }));
  const orden = st.orden, drag = st.drag;
  const setOrden = (f) => setSt((s) => ({ ...s, orden: typeof f === "function" ? f(s.orden) : f }));
  const setDrag = (d) => setSt((s) => ({ ...s, drag: d }));
  const [sel, setSel] = useStateG(null);
  // ⚠ El mapa queda LIMPIO para el turno siguiente: solo se ve la marca del ÚLTIMO
  // verificado, y ninguna ciudad se bloquea. Antes la ciudad usada se quedaba marcada y
  // no se podía volver a elegir, aunque fuese la correcta para el segundo gobernante.
  const [ultimo, setUltimo] = useStateG(null);   // { pide, ciudad }         // índice de la tarjeta levantada
  const [verified, setVerified] = useStateG(false);
  const rootRef = useRefG(null);
  const cardRefs = useRefG([]);
  const dragInfo = useRefG(null);
  const vuelo = useRefG(null);

  function tap(i) {
    if (verified) return;
    if (sel === null) { setSel(i); return; }
    if (sel === i) { setSel(null); return; }
    setOrden((o) => { const n = o.slice(); const t = n[i]; n[i] = n[sel]; n[sel] = t; return n; });
    setSel(null);
  }

  // ⚠ Arrastre (pedido de la autora el 2026-11-17: *"aquí debo poder arrastrar para
  // colocar el orden correcto"*). Soltar una tarjeta sobre otra posición la **inserta**
  // ahí y corre las demás — que es como se ordena una línea del tiempo de verdad. El
  // toque-intercambio sigue funcionando como respaldo.
  // ⚠ ARRASTRE de la línea del tiempo. La autora lo pidió en dos pasos y el segundo
  // corrigió al primero:
  //   1. *"aquí debo poder arrastrar para colocar el orden correcto"*;
  //   2. *"quiero poder arrastrar la tarjeta, no como se baja de lugar sino arrastrar y
  //      luego yo colocarla"*.
  // Es decir: la tarjeta se **levanta y sigue al dedo**, las demás se **apartan** para
  // enseñar dónde va a caer, y solo al SOLTAR se reordena la lista. La versión que se
  // reordenaba en vivo mientras movías se sentía como que la tarjeta saltaba sola.
  //
  // ⚠ Las posiciones de referencia se CONGELAN al empezar el arrastre (`slots`): las
  // tarjetas se están apartando, así que medirlas en vivo daría un destino que baila.
  function destinoDe(y, slots) {
    let mejor = 0, d = Infinity;
    for (let i = 0; i < slots.length; i++) {
      const dist = Math.abs(y - slots[i]);
      if (dist < d) { d = dist; mejor = i; }
    }
    return mejor;
  }
  function onDown(e, i) {
    if (verified) return;
    // Si había una tarjeta aterrizando, se corta: el gesto del niño manda.
    if (vuelo.current) { vuelo.current.cortado = true; (vuelo.current.anims || []).forEach((a) => { try { a.cancel(); } catch (err) {} }); vuelo.current = null; }
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
    const S = rootRef.current ? (rootRef.current.getBoundingClientRect().width / 470) || 1 : 1;
    const slots = orden.map((_, k) => {
      const el = cardRefs.current[k];
      if (!el) return 0;
      const r = el.getBoundingClientRect();
      return r.top + r.height / 2;
    });
    const propio = cardRefs.current[i] ? cardRefs.current[i].getBoundingClientRect() : null;
    const alto = propio ? (propio.height / S) + 12 : 82;        // alto de la tarjeta + hueco
    dragInfo.current = { i, x0: e.clientX, y0: e.clientY, scale: S, slots, alto, movido: false };
    setDrag({ i, dy: 0, over: i, alto, slots, scale: S, movido: false });
  }
  function onMove(e) {
    const di = dragInfo.current; if (!di) return;
    const dy = e.clientY - di.y0;
    if (!di.movido && Math.hypot(e.clientX - di.x0, dy) <= 6) return;
    di.movido = true;
    setDrag({ i: di.i, dy: dy / di.scale, over: destinoDe(di.slots[di.i] + dy, di.slots), alto: di.alto, slots: di.slots, scale: di.scale, movido: true });
  }
  function onUp(e) {
    const di = dragInfo.current; if (!di) return;
    dragInfo.current = null;
    if (verified) { setDrag(null); return; }
    if (!di.movido) { setDrag(null); tap(di.i); return; }       // respaldo: toque = intercambio
    const destino = destinoDe(di.slots[di.i] + (e.clientY - di.y0), di.slots);
    if (destino === di.i) { setDrag(null); return; }
    // Dónde está AHORA cada tarjeta (la arrastrada, siguiendo al dedo).
    const antes = {};
    orden.forEach((h, k) => { const el = cardRefs.current[k]; if (el) antes[h.id] = el.getBoundingClientRect().top; });
    const nuevoOrden = orden.slice();
    const [x] = nuevoOrden.splice(di.i, 1);
    nuevoOrden.splice(destino, 0, x);
    setSt({ orden: nuevoOrden, drag: null });
    setSel(null);
    aterrizarTodas(antes, nuevoOrden, di.scale || 1);
  }
  function endDrag() { dragInfo.current = null; setDrag(null); }
  // ⚠ NINGUNA tarjeta se desplaza mientras arrastras: solo se MARCA el puesto de destino.
  // Apartarlas en vivo obligaba a que el desplazamiento y el reordenado se cancelaran al
  // píxel, y como las tarjetas no miden todas igual, al soltar **la de arriba saltaba**.
  // Ahora, al soltar, TODAS viajan suavemente de su sitio viejo al nuevo
  // (`aterrizarTodas`), así que no hay ningún salto posible.
  function aterrizarTodas(antes, nuevo, S) {
    const v = { cortado: false, anims: [] };
    vuelo.current = v;
    requestAnimationFrame(() => {
      if (v.cortado) return;
      nuevo.forEach((h, k) => {
        const el = cardRefs.current[k];
        if (!el || !el.animate || antes[h.id] === undefined) return;
        // ⚠ Cancelar lo que quede vivo en esa tarjeta: dos animaciones de `transform`
        // sobre el mismo elemento se pisan y una de ellas la deja clavada en destino
        // (se veía como que esa tarjeta saltaba mientras las demás viajaban).
        if (el.getAnimations) el.getAnimations().forEach((an) => { try { an.cancel(); } catch (err) {} });
        const salto = (antes[h.id] - el.getBoundingClientRect().top) / S;
        if (Math.abs(salto) < 1) return;
        v.anims.push(el.animate(
          [{ transform: `translateY(${salto}px)` }, { transform: "translateY(0px)" }],
          { duration: 150, easing: "ease-out", fill: "backwards" }
        ));
      });
    });
  }

  function verificar() {
    if (verified) return;
    setSel(null);
    setVerified(true);
    const aciertos = orden.filter((h, i) => h.id === b.correcto[i].id).length;
    onSolve(aciertos === orden.length, {
      emoji: "🕰️", a: "Los primeros años de la República, en orden",
      userAnswer: orden.map((h) => h.t.slice(0, 34)).join(" · "),
      correctAnswer: b.correcto.map((h) => `${h.y} ${h.t.slice(0, 28)}`).join(" · "),
    }, aciertos);
  }
  verifyRef.current = verificar;

  function puestoDe(h) { return b.correcto.findIndex((x) => x.id === h.id) + 1; }

  return (
    <div ref={rootRef} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", height: "100%", width: "100%", paddingTop: 40 }}>
      <div style={{ pointerEvents: "none", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 20, color: "#fff" }}>Ordena los hechos del más antiguo al más reciente.</span>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0, width: "100%" }}>
        <div style={{ display: "flex", alignItems: "stretch", gap: 10, width: 452 }}>
          {/* La flecha del tiempo: deja claro hacia dónde va "más reciente". */}
          <div style={{ flexShrink: 0, width: 26, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 4, paddingBottom: 4 }}>
            <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 8.5, color: "rgba(255,255,255,0.75)", letterSpacing: "0.06em" }}>ANTES</span>
            <div style={{ flex: 1, width: 4, margin: "4px 0", borderRadius: 999, background: "linear-gradient(180deg, rgba(242,194,96,0.8), rgba(155,123,232,0.8))" }} />
            <div style={{ width: 0, height: 0, borderLeft: "7px solid transparent", borderRight: "7px solid transparent", borderTop: "9px solid rgba(155,123,232,0.9)" }} />
            <span style={{ marginTop: 2, fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 8.5, color: "rgba(255,255,255,0.75)", letterSpacing: "0.06em" }}>DESPUÉS</span>
          </div>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {orden.map((h, i) => {
              const ok = verified && h.id === b.correcto[i].id;
              const elegida = sel === i;
              const arrastrando = drag && drag.i === i;
              const destino = drag && drag.movido && drag.over === i && drag.i !== i && !verified;
              let border = "#d9c48a", bg = "linear-gradient(180deg,#fffdf6,#f6ecd2)", col = "#3a2608";
              if (!verified && elegida) { border = "#4fd8ff"; bg = "linear-gradient(180deg,#eaf9ff,#cdeeff)"; }
              if (!verified && (arrastrando || destino)) { border = "#4fd8ff"; bg = "linear-gradient(180deg,#eaf9ff,#cdeeff)"; }
              if (verified) {
                border = ok ? "#2ecc8f" : "#ff6b6b";
                bg = ok ? "linear-gradient(180deg,rgba(72,224,154,0.95),rgba(26,143,95,0.92))" : "linear-gradient(180deg,rgba(255,139,139,0.92),rgba(178,47,47,0.9))";
                col = ok ? "#06381f" : "#fff";
              }
              return (
                <button key={h.id} ref={(el) => { cardRefs.current[i] = el; }}
                  onPointerDown={(e) => onDown(e, i)} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={endDrag} disabled={verified}
                  style={{ position: "relative", width: "100%", minHeight: 70, touchAction: "none", boxSizing: "border-box", borderRadius: 12, border: `3px solid ${border}`, background: bg, color: col, display: "flex", alignItems: "center", gap: 9, padding: "6px 10px", textAlign: "left", cursor: verified ? "default" : "pointer", transform: arrastrando ? `translateY(${drag.dy}px) scale(1.03)` : ((elegida && !verified) ? "translateX(4px) scale(1.02)" : "none"), zIndex: arrastrando ? 60 : 1, boxShadow: ((elegida || arrastrando || destino) && !verified) ? "0 0 18px rgba(79,216,255,0.6), inset 0 1px 0 rgba(255,255,255,0.7)" : "inset 0 1px 0 rgba(255,255,255,0.7), 0 4px 10px rgba(0,0,0,0.28)", transition: arrastrando ? "none" : "transform 0.16s ease" }}>
                  <span style={{ flexShrink: 0, width: 21, height: 21, borderRadius: "50%", background: "rgba(0,0,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--ed-font-mono)", fontWeight: 700, fontSize: 11 }}>{i + 1}</span>
                  <span style={{ flexShrink: 0, fontSize: 17, lineHeight: 1 }}>{h.e}</span>
                  <span style={{ flex: 1, minWidth: 0, fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 11.5, lineHeight: 1.25 }}>{h.t}</span>
                  {/* Al verificar aparece el año y, si está mal, el puesto que le tocaba.
                      La columna NO se reordena: el niño tiene que poder ver su respuesta. */}
                  {verified && (
                    <span style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ flexShrink: 0, width: 18, height: 18, borderRadius: "50%", background: ok ? "#1f8a54" : "#c0392b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 11, boxShadow: "0 2px 5px rgba(0,0,0,0.35)" }}>{ok ? "✓" : "✗"}</span>
                        <span style={{ fontFamily: "var(--ed-font-mono)", fontWeight: 700, fontSize: 12.5 }}>{h.y}</span>
                      </span>
                      {!ok && <span style={{ whiteSpace: "nowrap", background: "linear-gradient(180deg,#ffe6a1,#f1c153)", border: "1.5px solid #e0a72c", borderRadius: 999, padding: "0 6px", fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 8.5, color: "#5a3d0a" }}>va {puestoDe(h)}º</span>}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Arreglo de rondas del LIBRO 6 · TEMA 1 (3 verbos: decidir · arrastrar · ordenar) ──
const L6T1_ROUNDS = [
  { C: L6T1R1Sello, verify: true, bubble: (<>Lee la ficha<br />y elige sí o no.</>) },
  { C: L6T1R2Piramide, verify: true, bubble: (<>Arrastra cada grupo<br />a su escalón.</>) },
  { C: L6T1R3Linea, verify: true, bubble: (<>Arrastra cada tarjeta<br />hasta su lugar.</>) },
];

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║ LIBRO 6 · TEMA 2 · "Revolución Marcista"                                   ║
// ║ Edad objetivo: 10 años (la fija la autora).                                ║
// ║                                                                            ║
// ║ 3 rondas, 3 verbos que NO existen en el Tema 1 (allí se gastaron decidir    ║
// ║ sí/no, arrastrar a su sitio y ordenar):                                     ║
// ║   R1 "La bandera de marzo"      — COMPONER: el símbolo se dibuja al tocar   ║
// ║   R2 "El Ecuador partido"       — TOCAR EN EL MAPA                          ║
// ║   R3 "La Carta de la Esclavitud" — RASGAR: se rompe pasando el dedo         ║
// ║                                                                            ║
// ║ ⭐ 4 + 4 + 3 = **11 máximo**.                                               ║
// ║                                                                            ║
// ║ ⚠ Todo el contenido sale del tema del libro (ver §3.1 del design-doc). La   ║
// ║ autora aprobó uno por uno los renglones de la R3, redactados con hechos     ║
// ║ que el libro sí afirma, porque no dio el articulado de la Carta.            ║
// ╚════════════════════════════════════════════════════════════════════════════╝

const CAT_LABEL_T2 = "La Revolución Marcista";

function J12Puntos({ total, hechos }) {
  return (
    <span style={{ display: "inline-flex", gap: 4, alignItems: "center", marginLeft: 6 }}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: i < hechos ? "#f2c260" : "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.35)" }} />
      ))}
    </span>
  );
}

// ── R1 · "La bandera de marzo" ──────────────────────────────────────────────
// VERBO: componer. Se toca un color y entra solo en el siguiente cuartel vacío
// (izquierda → centro → derecha): no se "coloca" nada, se va pintando, y la bandera
// crece a la vista. Las estrellas se ponen con un contador, que es otro gesto.
// La bandera marcista del libro: tres cuarteles, dos blancos y uno AZUL al centro,
// con TRES estrellas (Quito, Guayaquil, Cuenca).
const J12_BAN_COLORES = [
  { id: "bla", t: "blanco", c: "#fdfaf0" },
  { id: "azu", t: "azul", c: "#1f4fa8" },
  { id: "roj", t: "rojo", c: "#c0392b" },
  { id: "ama", t: "amarillo", c: "#f1c40f" },
  { id: "ver", t: "verde", c: "#1f8a54" },
];
const J12_BAN_OK = ["bla", "azu", "bla"];
const J12_BAN_ESTRELLAS = 3;

function j12Estrella(cx, cy, r, key) {
  let p = "";
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.46;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    p += (i ? "L" : "M") + (cx + rad * Math.cos(a)).toFixed(1) + "," + (cy + rad * Math.sin(a)).toFixed(1);
  }
  return <path key={key} d={p + "Z"} fill="#fdfaf0" stroke="#c9a227" strokeWidth="0.8" />;
}

// Dibuja la bandera: `cuarteles` es un arreglo de 3 ids de color (o null) y `estrellas`
// cuántas van en el cuartel del centro. Sirve tanto para la que arma el niño como para
// el cartel del revelado.
function J12Bandera({ cuarteles, estrellas, ancho, alto }) {
  const w = ancho, h = alto, cw = w / 3;
  const col = (i) => { const c = J12_BAN_COLORES.find((x) => x.id === cuarteles[i]); return c ? c.c : "rgba(255,255,255,0.07)"; };
  const sep = h * 0.1;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ borderRadius: 6, boxShadow: "0 6px 16px rgba(0,0,0,0.4)" }}>
      <rect x="0" y="0" width={w} height={h} fill="rgba(0,0,0,0.3)" />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={i * cw} y="0" width={cw} height={h} fill={col(i)} style={{ transition: "fill 0.25s" }} />
      ))}
      {Array.from({ length: estrellas }).map((_, i) => {
        const n = estrellas, paso = cw / (n + 1);
        return j12Estrella(cw + paso * (i + 1), h / 2, Math.min(h * 0.17, paso * 0.52), i);
      })}
      {[1, 2].map((i) => <line key={i} x1={i * cw} y1="0" x2={i * cw} y2={h} stroke="rgba(0,0,0,0.18)" strokeWidth="1" />)}
      <rect x="0.75" y="0.75" width={w - 1.5} height={h - 1.5} fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="1.5" rx="4" />
      <rect x="0" y={h - sep} width={w} height="0" fill="none" />
    </svg>
  );
}

function L6T2R1Bandera({ onSolve, verifyRef, onClear }) {
  // Varía el ORDEN de la paleta en cada partida (la bandera, en cambio, es una sola:
  // es un símbolo histórico, no hay nada que sortear). Ver "variedad" en el design-doc.
  const [paleta] = useStateG(() => j12Shuffle(J12_BAN_COLORES));
  const [cuarteles, setCuarteles] = useStateG([null, null, null]);
  const [estrellas, setEstrellas] = useStateG(0);
  const [verified, setVerified] = useStateG(false);
  // ⚠ BORRAR deshace SOLO LO ÚLTIMO (igual que en la Carta): guarda una FOTO del estado
  // antes de cada cambio y vuelve a la anterior. Con fotos no hay que distinguir si lo
  // último fue un color o una estrella. Antes vaciaba la bandera entera.
  const [hist, setHist] = useStateG([]);
  const completa = cuarteles.every((c) => c !== null);
  const foto = () => setHist((h) => h.concat([{ cuarteles: cuarteles, estrellas: estrellas }]));

  function pintar(id) {
    if (verified) return;
    const i = cuarteles.indexOf(null);
    if (i === -1) return;
    foto();
    setCuarteles((cs) => { const n = cs.slice(); n[i] = id; return n; });
  }
  function borrar(i) {
    if (verified || cuarteles[i] === null) return;
    foto();
    // Al quitar un cuartel, los de su derecha se corren para que el siguiente toque
    // entre siempre en el primer hueco: así nunca quedan huecos salteados.
    setCuarteles((cs) => { const n = cs.filter((_, k) => k !== i); n.push(null); return n; });
  }
  function deshacer() {
    if (verified || !hist.length) return;
    const atras = hist[hist.length - 1];
    setCuarteles(atras.cuarteles); setEstrellas(atras.estrellas);
    setHist((h) => h.slice(0, -1));
  }
  // El botón vive en la columna de acciones (lo monta J12Game), como en la R3.
  useEffectG(() => {
    if (!onClear) return undefined;
    onClear(verified ? null : { fn: deshacer, puede: hist.length > 0 });
    return () => onClear(null);
  }, [verified, hist.length]);

  function verificar() {
    if (verified || !completa) return;
    setVerified(true);
    const bien = cuarteles.filter((c, i) => c === J12_BAN_OK[i]).length;
    const estrOk = estrellas === J12_BAN_ESTRELLAS;
    const ganadas = bien + (estrOk ? 1 : 0);
    const nombre = (id) => { const c = J12_BAN_COLORES.find((x) => x.id === id); return c ? c.t : "—"; };
    onSolve(bien === 3 && estrOk, {
      emoji: "🏴", a: "La bandera de la Revolución Marcista",
      userAnswer: cuarteles.map(nombre).join(" · ") + " · " + estrellas + (estrellas === 1 ? " estrella" : " estrellas"),
      correctAnswer: J12_BAN_OK.map(nombre).join(" · ") + " · 3 estrellas",
    }, ganadas);
  }
  verifyRef.current = verificar;

  const estrOk = estrellas === J12_BAN_ESTRELLAS;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", height: "100%", width: "100%", paddingTop: 40 }}>
      <div style={{ pointerEvents: "none", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 20, color: "#fff" }}>Arma la bandera de la Revolución Marcista.</span>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 11, minHeight: 0, width: "100%" }}>
        {/* ⚠ CÓMO ERA LA BANDERA, SIEMPRE A LA VISTA. La primera versión solo decía
            "Levanta la bandera del 6 de marzo" y no explicaba en ninguna parte cómo era:
            había que saberlo de memoria. La autora lo probó y no entendió qué hacer. La
            ronda se resuelve LEYENDO esto y aplicándolo, igual que el panel del Art. 12
            del Tema 1. Las estrellas no se dicen: se CUENTAN de la lista de ciudades. */}
        <div style={{ width: 452, boxSizing: "border-box", borderRadius: 12, border: "2.5px solid rgba(242,194,96,0.6)", background: "rgba(0,0,0,0.34)", padding: "5px 12px 7px", flexShrink: 0 }}>
          <div className="ed-label" style={{ color: "#fce9a8", fontSize: 9.5, textAlign: "center", marginBottom: 4 }}>Así era la bandera</div>
          <div style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 11, lineHeight: 1.3, color: "#fff", textAlign: "center" }}>
            Tres cuarteles: <b style={{ color: "#fdfaf0" }}>blancos los de los lados</b> y <b style={{ color: "#9fc4ff" }}>azul el del centro</b>.<br />
            En el del centro, <b>una estrella por cada ciudad que se levantó</b>:
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "center", marginTop: 4 }}>
            {["Quito", "Guayaquil", "Cuenca"].map((x) => (
              <span key={x} style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 9.5, color: "#fff", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 999, padding: "2px 9px" }}>{x}</span>
            ))}
          </div>
        </div>

        {/* El asta y la bandera */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 7, flexShrink: 0 }}>
          <div style={{ width: 7, height: 128, borderRadius: 4, background: "linear-gradient(180deg,#a9793a,#6b4a1e)", boxShadow: "0 4px 10px rgba(0,0,0,0.4)" }} />
          <div style={{ position: "relative" }}>
            <J12Bandera cuarteles={cuarteles} estrellas={estrellas} ancho={222} alto={128} />
            {/* Con la bandera en blanco no se ve que los cuarteles son tocables: el aviso
                dice dónde empieza todo y se va en cuanto entra el primer color. */}
            {cuarteles.every((c) => c === null) && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 12, color: "rgba(255,255,255,0.75)", textShadow: "0 2px 6px rgba(0,0,0,0.7)" }}>toca un color de abajo</span>
              </div>
            )}
            {/* Los tres cuarteles son tocables para vaciarlos (no hay "deshacer" escondido). */}
            {!verified && (
              <div style={{ position: "absolute", inset: 0, display: "flex" }}>
                {[0, 1, 2].map((i) => (
                  <button key={i} className="ed-btn-plain" onClick={() => borrar(i)} aria-label={`Vaciar cuartel ${i + 1}`}
                    style={{ flex: 1, background: "transparent", border: "none", cursor: cuarteles[i] ? "pointer" : "default", padding: 0 }} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Paleta de colores */}
        <div style={{ display: "flex", gap: 7, flexShrink: 0 }}>
          {paleta.map((c) => (
            <button key={c.id} onClick={() => pintar(c.id)} disabled={verified || completa}
              style={{ width: 62, height: 38, borderRadius: 9, border: "2.5px solid rgba(255,255,255,0.4)", background: c.c, cursor: verified || completa ? "default" : "pointer", opacity: verified || completa ? 0.45 : 1, boxShadow: "0 3px 8px rgba(0,0,0,0.35)", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 2 }}>
              <span style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 800, fontSize: 8.5, color: c.id === "bla" || c.id === "ama" ? "#3a2608" : "#fff", textShadow: c.id === "bla" || c.id === "ama" ? "none" : "0 1px 2px rgba(0,0,0,0.6)" }}>{c.t}</span>
            </button>
          ))}
        </div>

        {/* Contador de estrellas: otro gesto distinto, y se dibujan en vivo */}
        <div style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0, borderRadius: 11, border: `2.5px solid ${verified ? (estrOk ? "#2ecc8f" : "#ff6b6b") : "rgba(242,194,96,0.55)"}`, background: "rgba(0,0,0,0.34)", padding: "4px 11px" }}>
          <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 11.5, color: "#fce9a8" }}>Estrellas del centro</span>
          <button onClick={() => { if (!verified && estrellas > 0) { foto(); setEstrellas((n) => Math.max(0, n - 1)); } }} disabled={verified || estrellas === 0}
            style={{ width: 28, height: 28, borderRadius: 8, border: "2px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.12)", color: "#fff", fontFamily: "var(--ed-font-display)", fontWeight: 900, fontSize: 15, cursor: verified || estrellas === 0 ? "default" : "pointer", opacity: verified || estrellas === 0 ? 0.4 : 1 }}>−</button>
          <span style={{ minWidth: 20, textAlign: "center", fontFamily: "var(--ed-font-display)", fontWeight: 900, fontSize: 18, color: "#fff" }}>{estrellas}</span>
          <button onClick={() => { if (!verified && estrellas < 5) { foto(); setEstrellas((n) => Math.min(5, n + 1)); } }} disabled={verified || estrellas === 5}
            style={{ width: 28, height: 28, borderRadius: 8, border: "2px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.12)", color: "#fff", fontFamily: "var(--ed-font-display)", fontWeight: 900, fontSize: 15, cursor: verified || estrellas === 5 ? "default" : "pointer", opacity: verified || estrellas === 5 ? 0.4 : 1 }}>+</button>
        </div>

        {/* Revelado: la bandera correcta al lado, en su propio cartel (NUNCA colgando de
            la que armó el niño: eso tapaba lo que eligió). */}
        {verified && (
          <div style={{ display: "flex", alignItems: "center", gap: 11, flexShrink: 0, borderRadius: 12, border: "2.5px solid #f2c260", background: "rgba(0,0,0,0.5)", padding: "6px 12px" }}>
            <div className="ed-label" style={{ color: "#fce9a8", fontSize: 9 }}>IBA<br />ASÍ</div>
            <J12Bandera cuarteles={J12_BAN_OK} estrellas={J12_BAN_ESTRELLAS} ancho={78} alto={45} />
            <div style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 9.5, lineHeight: 1.25, color: "#fce9a8", maxWidth: 232 }}>Dos cuarteles blancos y uno azul al centro, con tres estrellas: Quito, Guayaquil y Cuenca.</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── R2 · "El Ecuador partido" ───────────────────────────────────────────────
// VERBO: tocar en el mapa. Crisis de 1859: cuatro gobiernos a la vez. Se pide un
// gobernante y el niño toca la ciudad donde manda; al tocar, la ciudad se queda con su
// rótulo y pasa el siguiente. Cuatro colocados → ¡VERIFICAR!
//
// ⚠ MAPA DE DATOS REALES: contorno del Ecuador continental de Natural Earth
// (ne_10m_admin_0_countries, dominio público), proyección plate carrée —sobre la línea
// equinoccial la deformación es despreciable— y simplificado con Douglas-Peucker
// (tolerancia 0.008°, 335 puntos). Las cuatro ciudades van en sus coordenadas reales.
// NUNCA dibujar un mapa a ojo ni generarlo como imagen: no sería tocable por lugar.
// Galápagos queda fuera del encuadre (el tema es la crisis continental de 1859).
const J12_ECU_W = 288, J12_ECU_H = 320.9;
const J12_ECU_D = "M108.7,0.0L111.7,2.0L116.9,8.3L120.0,8.5L121.6,11.9L123.1,11.4L125.8,12.0L132.6,18.8L137.5,20.6L144.0,25.5L146.1,26.6L149.6,26.7L154.0,27.9L154.8,30.0L157.5,31.1L164.8,29.4L166.2,30.6L166.6,34.2L167.6,35.7L172.7,38.7L176.5,39.0L178.1,49.8L180.0,52.1L189.5,54.8L193.9,53.6L195.6,54.0L197.5,56.2L202.5,57.1L205.6,59.4L209.8,59.0L213.0,59.8L212.9,57.8L213.5,57.6L218.3,58.5L221.4,60.6L229.2,58.7L228.8,51.4L231.3,51.1L234.6,48.4L238.4,51.1L242.8,51.6L243.6,53.9L246.9,53.3L250.9,58.9L251.9,61.2L258.6,66.4L261.8,67.8L268.1,67.5L276.2,73.4L285.2,76.7L282.8,78.6L279.3,78.7L277.9,79.5L272.5,77.4L268.3,76.7L267.3,77.8L268.5,80.4L270.5,80.5L275.2,83.7L276.8,89.3L279.1,93.4L280.6,94.6L282.0,94.8L286.3,98.4L286.6,102.5L284.7,104.6L284.5,108.6L286.8,117.9L288.0,119.7L282.0,119.9L279.1,116.9L270.8,147.9L245.0,177.4L215.5,199.5L156.6,220.2L152.9,223.4L147.9,230.2L144.8,232.9L142.6,236.8L140.2,238.8L140.2,239.9L142.2,242.1L141.8,244.5L138.7,246.0L137.2,241.1L134.4,240.0L132.5,240.1L132.0,241.1L131.9,245.1L130.0,250.3L130.0,254.6L128.8,255.0L129.1,260.1L126.1,263.0L125.2,268.0L122.0,269.5L121.3,275.5L117.3,285.0L116.0,286.8L116.5,290.5L118.3,292.2L116.6,295.1L116.5,297.9L114.2,300.0L107.5,303.0L105.2,305.1L103.8,307.7L105.2,312.5L104.6,313.5L101.2,314.0L99.7,318.3L97.0,320.9L95.0,319.3L85.1,318.4L83.2,315.5L81.4,314.6L80.5,312.7L77.8,310.8L75.4,303.4L73.9,301.3L75.1,298.2L75.0,297.0L72.4,296.2L67.5,292.3L60.6,294.6L58.7,294.3L55.2,290.4L51.3,289.9L46.5,285.9L43.4,284.6L40.2,285.3L37.7,289.8L31.4,294.2L30.1,294.3L27.0,292.7L25.9,291.1L33.2,280.4L27.0,281.1L26.0,278.9L26.2,277.0L24.8,274.7L25.9,271.2L27.2,269.9L29.1,269.6L34.2,271.3L35.3,270.8L37.5,267.7L42.2,265.0L41.0,263.4L40.8,261.6L39.2,258.0L39.7,252.2L39.2,250.2L38.0,249.5L38.5,246.3L36.9,244.9L37.2,242.0L33.5,240.3L33.4,239.1L35.1,236.7L34.5,238.4L34.8,239.4L36.2,236.7L37.5,238.1L43.7,237.0L47.4,230.9L48.6,231.1L48.4,234.7L52.8,230.6L53.7,226.5L56.7,221.0L56.3,219.0L58.7,211.1L61.6,203.8L64.0,200.5L63.1,195.4L60.9,194.9L58.4,189.7L58.4,181.4L57.0,179.0L57.7,176.9L57.3,176.3L59.5,174.9L60.1,173.2L61.7,172.3L62.1,171.2L58.8,173.1L58.7,174.4L56.7,174.7L55.8,176.7L55.3,180.2L57.2,185.7L56.5,195.4L55.6,198.0L53.7,199.8L50.5,201.2L49.7,200.3L47.3,199.7L47.0,198.9L49.1,197.1L50.3,194.9L51.7,194.7L53.2,195.8L53.9,195.1L53.6,194.0L53.4,195.0L51.5,193.7L48.7,194.5L48.6,192.8L50.0,188.8L51.5,188.2L52.9,186.2L51.3,187.2L49.8,187.2L48.8,188.2L46.6,193.7L41.7,200.2L40.1,200.9L38.9,202.2L37.0,201.1L36.5,201.4L36.5,203.3L38.2,205.2L37.7,207.3L34.5,206.3L30.7,203.3L27.1,201.7L17.7,191.6L10.4,189.6L7.4,187.3L4.9,186.8L3.9,183.9L0.5,180.6L0.0,179.3L3.2,180.2L4.1,181.8L7.1,181.1L11.6,178.1L13.3,176.1L13.7,173.1L12.5,169.7L13.9,168.7L14.1,167.4L12.6,160.9L7.8,150.5L9.8,148.7L9.6,146.1L10.6,145.1L12.1,145.0L12.4,140.6L13.5,139.5L13.4,138.3L8.9,132.7L6.5,128.4L4.8,124.4L5.1,123.4L9.8,118.5L11.2,118.7L14.5,117.7L14.4,118.2L16.0,118.7L17.9,117.3L18.4,118.0L19.7,118.3L22.1,116.8L23.2,115.6L25.7,105.9L28.1,101.6L29.4,101.2L30.2,103.6L31.6,104.1L35.5,104.4L35.5,103.8L30.9,102.5L29.7,100.0L28.7,99.1L27.9,95.1L25.7,90.4L28.9,88.3L31.9,82.5L33.0,82.1L34.3,80.0L35.2,80.8L38.9,78.4L45.1,71.0L45.5,69.4L47.1,68.8L47.9,66.9L48.6,62.6L48.0,55.6L48.6,53.6L50.2,55.2L50.9,53.2L48.3,48.6L48.3,46.4L49.6,43.6L48.6,40.3L45.9,38.9L45.0,36.8L45.0,34.7L46.7,30.8L48.1,29.6L51.4,30.0L53.1,28.8L57.3,27.8L60.7,25.5L62.1,23.9L67.6,21.4L67.8,22.4L66.8,25.5L69.6,29.3L67.9,26.2L68.7,22.3L69.6,21.8L71.7,22.4L78.5,17.7L82.1,18.0L86.7,17.0L87.8,17.6L92.0,16.7L97.4,10.8L99.6,12.0L100.6,15.7L102.1,14.4L102.5,11.3L103.7,9.5L104.2,10.1L105.1,9.9L106.6,7.2L109.5,7.8L109.2,7.1L106.4,6.4L106.1,5.7L108.5,2.6L108.7,0.0Z";
const J12_GOBIERNOS = [
  { id: "qui", ciudad: "Quito", jefe: "García Moreno", x: 126.7, y: 80.4 },
  { id: "gye", ciudad: "Guayaquil", jefe: "Guillermo Franco", x: 54.3, y: 179.5 },
  { id: "cue", ciudad: "Cuenca", jefe: "Jerónimo Carrión", x: 99.9, y: 215.8 },
  { id: "loj", ciudad: "Loja", jefe: "Manuel Carrión Pinzano", x: 90.0, y: 270.2 },
];
const J12_ZONA_COL = { qui: "#f1c40f", gye: "#4fd8ff", cue: "#b388ff", loj: "#ff9a6b" };

function L6T2R2Mapa({ onSolve, verifyRef, say }) {
  // ⚠ Se piden DOS gobernantes, no los cuatro: con cuatro la ronda se hacía larga y
  // repetitiva (lo pidió la autora jugando). El mapa sigue enseñando las cuatro ciudades,
  // que es lo que cuenta la historia; lo que se juega son dos.
  // Cuáles dos varía por partida. ⚠ Cap 1, nunca 2: para un SUBCONJUNTO de K, cap = K
  // parte el banco en parejas fijas que se alternan igual en cada recarga.
  const [b] = useStateG(() => {
    const idx = j12PickIdx(J12_GOBIERNOS, 2, "edinun_j12_l6t2_r2_v1");
    j12Commit("edinun_j12_l6t2_r2_v1", idx, 1);
    return { orden: j12Shuffle(idx.map((i) => J12_GOBIERNOS[i].id)) };
  });
  const orden = b.orden;
  // ⚠ SE VERIFICA UNO A UNO, no los dos al final: colocas el primero, pulsas ¡VERIFICAR!,
  // ves si acertaste, y recién entonces viene el segundo. Lo pidió así la autora.
  // `pasos` guarda lo ya verificado; `sel` es la ciudad elegida que aún no se ha validado.
  const [pasos, setPasos] = useStateG([]);     // [{ pide, ciudad }]
  const [sel, setSel] = useStateG(null);
  // ⚠ El mapa queda LIMPIO para el turno siguiente: solo se ve la marca del ÚLTIMO
  // verificado, y ninguna ciudad se bloquea. Antes la ciudad usada se quedaba marcada y
  // no se podía volver a elegir, aunque fuese la correcta para el segundo gobernante.
  const [ultimo, setUltimo] = useStateG(null);   // { pide, ciudad }
  const idx = pasos.length;
  const pendiente = orden[idx];
  const pedido = J12_GOBIERNOS.find((g) => g.id === pendiente);
  const terminado = idx >= orden.length;
  // Al terminar se enseñan las dos marcas; durante la ronda, solo la del turno anterior.
  const marcas = terminado ? pasos : (ultimo ? [ultimo] : []);

  function tocar(ciudadId) {
    if (terminado) return;
    setUltimo(null);                            // al elegir, el mapa se limpia
    setSel(ciudadId);                           // se puede cambiar de idea antes de verificar
    // ⚠ El acuse va POR EL BOCADILLO, no en la banda del pedido: lo pidió la autora.
    if (say) say(`Elegiste ${(J12_GOBIERNOS.find((g) => g.id === ciudadId) || {}).ciudad}.
Pulsa ¡VERIFICAR!`);
  }
  function verificar() {
    if (terminado || sel === null) return;
    const nuevo = pasos.concat([{ pide: pendiente, ciudad: sel }]);
    setPasos(nuevo); setSel(null); setUltimo({ pide: pendiente, ciudad: sel });
    if (nuevo.length < orden.length) {
      if (say) say(null);                       // quedan gobernantes: vuelve el CÓMO fijo
      return;
    }
    // ⚠ Ya no queda nada que tocar: el bocadillo NO puede seguir diciendo "toca en el
    // mapa". Son solo dos gobernantes y la autora lo marcó.
    if (say) say("¡Listo! Esos eran\nlos dos gobiernos.");
    const aciertos = nuevo.filter((p) => p.pide === p.ciudad).length;
    const nombre = (id) => (J12_GOBIERNOS.find((g) => g.id === id) || {}).jefe;
    const ciudad = (id) => (J12_GOBIERNOS.find((g) => g.id === id) || {}).ciudad;
    onSolve(aciertos === orden.length, {
      emoji: "🗺️", a: "1859: el país con cuatro gobiernos",
      userAnswer: nuevo.map((p) => `${nombre(p.pide)} en ${ciudad(p.ciudad)}`).join(" · "),
      correctAnswer: orden.map((id) => `${nombre(id)} en ${ciudad(id)}`).join(" · "),
    }, aciertos);
  }
  verifyRef.current = verificar;

  // ⚠ La marca del turno anterior se enseña un momento y SE BORRA SOLA: al cambiar de
  // gobernante el mapa tiene que salir limpio. Antes se quedaba hasta que el niño tocaba
  // otra ciudad, y parecía que seguía contando.
  useEffectG(() => {
    if (!ultimo || terminado) return undefined;
    const t = setTimeout(() => setUltimo(null), 1300);
    return () => clearTimeout(t);
  }, [ultimo, terminado]);

  const ESC = 1.05;  // el mapa ocupa el hueco: a 0,78 sobraba espacio por todos lados, y al
                     // quitar la tercera línea de la banda quedó sitio para agrandarlo
  const MW = J12_ECU_W * ESC, MH = J12_ECU_H * ESC;
  const nombreDe = (id) => (J12_GOBIERNOS.find((g) => g.id === id) || {}).jefe;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", height: "100%", width: "100%", paddingTop: 32 }}>
      <div style={{ pointerEvents: "none", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 20, color: "#fff" }}>En 1859 el país tuvo cuatro gobiernos a la vez.</span>
      </div>
      {/* ⚠ El pedido va en una BANDA sobre el mapa, centrada, como la consigna de la R3.
          Antes iba en una columna a la izquierda y dejaba un hueco grande y feo entre el
          cartel y el mapa. */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", gap: 8, minHeight: 0, width: "100%", paddingTop: 8 }}>
        <div style={{ width: 452, boxSizing: "border-box", borderRadius: 12, border: `2.5px solid ${terminado ? "#f2c260" : "#4fd8ff"}`, background: "rgba(0,0,0,0.45)", padding: "6px 12px", flexShrink: 0, minHeight: 50, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          {!terminado && (<>
            <span className="ed-label" style={{ color: "#9fe9ff", fontSize: 8.5 }}>¿Dónde mandaba?<J12Puntos total={orden.length} hechos={idx} /></span>
            <span data-qa="pedido" style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 14, lineHeight: 1.15, color: "#fff" }}>{pedido.jefe}</span>

          </>)}
          {terminado && (
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
              {pasos.map((p) => {
                const ok = p.pide === p.ciudad;
                const ciudadOk = (J12_GOBIERNOS.find((g) => g.id === p.pide) || {}).ciudad;
                return (
                  <div key={p.pide} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ flexShrink: 0, width: 15, height: 15, borderRadius: "50%", background: ok ? "#1f8a54" : "#c0392b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 10 }}>{ok ? "✓" : "✗"}</span>
                    <span style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 10, lineHeight: 1.2, color: "#fce9a8" }}>{nombreDe(p.pide)} mandaba en <b>{ciudadOk}</b></span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* El mapa */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <svg width={MW} height={MH} viewBox={`0 0 ${J12_ECU_W} ${J12_ECU_H}`} style={{ overflow: "visible" }}>
            <path d={J12_ECU_D} fill="rgba(255,253,246,0.1)" stroke="rgba(242,194,96,0.75)" strokeWidth="2" strokeLinejoin="round" />
            {/* La mancha de cada gobierno colocado. Es una zona de influencia alrededor de
                su ciudad, NO una frontera: el libro no da límites y no se inventan. */}
            {J12_GOBIERNOS.map((g) => {
              const p = marcas.find((x) => x.ciudad === g.id);
              const marca = p ? p.pide : (sel === g.id ? pendiente : null);
              if (!marca) return null;
              return <circle key={"z" + g.id} cx={g.x} cy={g.y} r="46" fill={J12_ZONA_COL[marca]} opacity={p && p.pide !== g.id ? 0.1 : 0.19} style={{ pointerEvents: "none" }} />;
            })}
            {J12_GOBIERNOS.map((g) => {
              const p = marcas.find((x) => x.ciudad === g.id);
              const elegida = sel === g.id;
              // Verde/rojo SOLO en las ciudades ya verificadas; la elegida va en celeste
              // mientras no se verifique, y las que no se juegan se quedan en blanco.
              let col = "#fdfaf0";
              if (p) col = p.pide === g.id ? "#2ecc8f" : "#ff6b6b";
              else if (elegida) col = "#4fd8ff";
              const jefe = p ? nombreDe(p.pide) : (elegida ? pedido.jefe : null);
              return (
                <g key={g.id} onClick={() => tocar(g.id)} style={{ cursor: terminado ? "default" : "pointer" }}>
                  <circle cx={g.x} cy={g.y} r="19" fill="transparent" />
                  {elegida && <circle cx={g.x} cy={g.y} r="12" fill="none" stroke="#4fd8ff" strokeWidth="2.5" />}
                  <circle cx={g.x} cy={g.y} r="7.5" fill={col} stroke="rgba(0,0,0,0.45)" strokeWidth="1.5" />
                  <text x={g.x + 12} y={g.y + 4} fontFamily="var(--ed-font-display)" fontWeight="800" fontSize="13" fill="#fff" stroke="rgba(0,0,0,0.65)" strokeWidth="2.8" paintOrder="stroke">{g.ciudad}</text>
                  {jefe && <text x={g.x + 12} y={g.y + 17} fontFamily="var(--ed-font-ui)" fontWeight="700" fontSize="10.5" fill={p ? (p.pide === g.id ? "#8cf0c0" : "#ffb3b3") : "#9fe9ff"} stroke="rgba(0,0,0,0.65)" strokeWidth="2.4" paintOrder="stroke">{jefe}</text>}
                  {p && <text x={g.x - 16} y={g.y + 5} fontFamily="var(--ed-font-display)" fontWeight="900" fontSize="13" textAnchor="middle" fill={p.pide === g.id ? "#8cf0c0" : "#ffb3b3"} stroke="rgba(0,0,0,0.7)" strokeWidth="2.6" paintOrder="stroke">{p.pide === g.id ? "✓" : "✗"}</text>}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}

// ── R3 · "La Carta de la Esclavitud" ────────────────────────────────────────
// VERBO: rasgar. Se pasa el dedo (o el ratón) por encima de un renglón y el papel se
// corta: el trozo se despega y cae. Lo que se piensa es CUÁL romper, y para saberlo hay
// que leer: la ronda se resuelve con lo que está en pantalla, no de memoria.
//
// ⚠ Los cuatro renglones los aprobó la autora uno por uno. El libro dice que la Carta
// de la Esclavitud cae, pero no da su articulado: están redactados SOLO con hechos que
// el libro sí afirma. No añadir renglones sin pasar por ella.
// El renglón de los esclavos NO se pide nunca: sobrevive al papel roto, y así se ve que
// la revolución no lo arregló todo de golpe (la manumisión llega en 1851, con Urbina).
const J12_CARTA = [
  { id: "flores", t: "El general Juan José Flores gobierna el Ecuador.", cayo: true },
  { id: "pesos", t: "Cada hombre paga tres pesos al año.", cayo: true },
  { id: "iglesia", t: "La Iglesia queda apartada de los asuntos del país.", cayo: true },
  // ⚠ Este NO cayó con la Revolución Marcista: la manumisión llega en 1851, con Urbina.
  { id: "esclavos", t: "Los esclavos siguen sin libertad.", cayo: false },
];
const J12_CARTA_PIDEN = J12_CARTA.filter((r) => r.cayo).map((r) => r.id);

function L6T2R3Carta({ onSolve, verifyRef, onClear }) {
  // Varía el orden de los renglones en el papel (4! = 24) y el orden de las tres
  // consignas (3! = 6). El renglón que sobrevive es siempre el mismo a propósito.
  const [b] = useStateG(() => ({
    renglones: j12Shuffle(J12_CARTA),
    consignas: j12Shuffle(J12_CARTA_PIDEN),
  }));
  // ⚠ EL ORDEN NO IMPORTA. Los TRES pedidos se enseñan juntos y el niño rompe los tres
  // renglones que cayeron, en el orden que quiera. Cada pedido se marca ✓ en cuanto su
  // renglón cae, así se ve lo que falta.
  // ⚠ Lo que se arrastra SE ROMPE y el agujero se queda; el veredicto de los tres llega
  // junto, al pulsar ¡VERIFICAR!.
  // Antes se pedían de UNO EN UNO y en un orden fijo: romper el renglón correcto en el
  // turno de otro pedido contaba como error, y el revelado decía "no era esta" sobre un
  // renglón que sí había caído. La autora lo cazó el 2026-11-19: *"si solo hay 1 [bueno]
  // entonces yo debería derogar solo 1, no las 3 opciones porque dos obviamente voy a
  // estar equivocada"*. Son TRES los renglones que cayeron, así que se rompen tres y el
  // único error posible es romper el de los esclavos.
  const [rotos, setRotos] = useStateG([]);            // ids rotos, en el orden que fuera
  const [corte, setCorte] = useStateG(null);          // { id, avance 0..1 }
  const [verified, setVerified] = useStateG(false);
  const refs = useRefG({});
  const cae = (id) => b.consignas.indexOf(id) >= 0;   // ¿este renglón cayó de verdad?
  // ⚠ NO hay tope de roturas ni turnos: el niño rompe las que crea y pulsa ¡VERIFICAR!
  // cuando quiera. Con el tope de tres, el único error posible era el renglón de los
  // esclavos y la ronda se volvía casi infallable.

  function rasgar(id) {
    if (verified || rotos.indexOf(id) >= 0) return;
    setCorte(null);
    setRotos((p) => p.concat([id]));
  }

  // ⚠ BORRAR deshace SOLO EL ÚLTIMO renglón roto, no el papel entero: lo pidió así la
  // autora el 2026-11-23. Pulsándolo varias veces se vuelve atrás renglón a renglón, que
  // es lo que se espera de un botón que repara lo que acabas de hacer.
  function borrar() {
    if (verified) return;
    setCorte(null);
    setRotos((p) => p.slice(0, -1));
  }

  // El botón BORRAR vive en la columna de acciones (lo monta J12Game). ⚠ Va SIEMPRE a la
  // vista, apagado mientras no haya nada roto: la autora no lo encontraba cuando solo
  // aparecía al romper el primer renglón.
  useEffectG(() => {
    if (!onClear) return undefined;
    onClear(verified ? null : { fn: borrar, puede: rotos.length > 0 });
    return () => onClear(null);
  }, [verified, rotos.length]);

  // El corte avanza con el gesto: se mide cuánto ha recorrido el puntero a lo ancho del
  // renglón desde que lo tocó. Al pasar del 72 % el renglón se rompe.
  function onDown(e, id) {
    if (verified || rotos.indexOf(id) >= 0) return;
    const el = refs.current[id];
    if (!el) return;
    try { el.setPointerCapture(e.pointerId); } catch (x) {}
    const r = el.getBoundingClientRect();
    setCorte({ id, x0: e.clientX, avance: 0, ancho: r.width });
  }
  function onMove(e, id) {
    if (!corte || corte.id !== id) return;
    const a = Math.min(1, Math.abs(e.clientX - corte.x0) / Math.max(1, corte.ancho * 0.72));
    if (a >= 1) { rasgar(id); return; }
    setCorte((c) => (c && c.id === id ? Object.assign({}, c, { avance: a }) : c));
  }
  function onUp(e, id) {
    if (!corte || corte.id !== id) return;
    setCorte(null);
  }

  function verificar() {
    if (verified) return;
    setVerified(true);
    const aciertos = rotos.filter(cae).length;
    const texto = (id) => (J12_CARTA.find((r) => r.id === id) || {}).t;
    onSolve(aciertos === b.consignas.length && rotos.length === b.consignas.length, {
      emoji: "📜", a: "Lo que cayó con la Revolución Marcista",
      userAnswer: rotos.map(texto).join(" · "),
      correctAnswer: b.consignas.map(texto).join(" · "),
    }, aciertos);
  }
  verifyRef.current = verificar;

  // ¿Qué debía romperse en el turno i? Para el revelado.
  const debia = {};
  b.consignas.forEach((id, i) => { debia[id] = i; });

  function renglon(r, i) {
    const roto = rotos.indexOf(r.id) >= 0;
    const acerto = roto && cae(r.id);
    const cortando = corte && corte.id === r.id ? corte.avance : 0;
    // Tras verificar: verde el que tocaba y se rompió, rojo el que se rompió de más,
    // y marcado en ámbar el que había que romper y sigue entero.
    let bd = "rgba(120,94,48,0.5)", bg = "rgba(255,253,246,0.93)";
    if (roto) { bd = "transparent"; }
    if (verified && roto) { bd = acerto ? "#2ecc8f" : "#ff6b6b"; }
    if (verified && !roto && debia[r.id] !== undefined) { bd = "#f2c260"; bg = "rgba(255,230,161,0.95)"; }
    return (
      <div key={r.id} style={{ position: "relative", height: 68, flexShrink: 0 }}>
        <div
          ref={(el) => { refs.current[r.id] = el; }}
          onPointerDown={(e) => onDown(e, r.id)}
          onPointerMove={(e) => onMove(e, r.id)}
          onPointerUp={(e) => onUp(e, r.id)}
          onPointerCancel={(e) => onUp(e, r.id)}
          style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 7,
            borderRadius: 7, border: `2px solid ${bd}`, background: roto ? "transparent" : bg,
            padding: "0 10px", boxSizing: "border-box", touchAction: "none",
            // Sin esto, rasgar SELECCIONA el texto del renglón y se ve el resaltado azul.
            userSelect: "none", WebkitUserSelect: "none",
            cursor: verified || roto ? "default" : "grab",
            opacity: roto ? 0 : 1, transition: "opacity 0.25s",
            boxShadow: roto ? "none" : "0 2px 6px rgba(0,0,0,0.2)",
          }}>
          <span style={{ flexShrink: 0, fontSize: 11, color: "#8a6410" }}>▸</span>
          <span style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 14.5, lineHeight: 1.25, color: "#3a2608" }}>{r.t}</span>
          {/* El corte dentado que avanza con el dedo */}
          {cortando > 0 && (
            <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: `${cortando * 100}%`, pointerEvents: "none", borderRight: "3px dashed #c0392b", background: "linear-gradient(90deg, rgba(192,57,43,0.06), rgba(192,57,43,0.16))" }} />
          )}
        </div>
        {/* Lo que asoma por el hueco cuando el renglón ya no está */}
        {roto && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 3, boxSizing: "border-box", background: "rgba(24,14,4,0.62)", boxShadow: "inset 0 3px 7px rgba(0,0,0,0.55)", overflow: "hidden" }}>
            {/* Los dientes del papel roto, arriba y abajo del hueco: sin ellos parecía una
                fila apagada, no un agujero. Van del color del papel, que es lo que queda
                a los lados del desgarrón. */}
            {["top", "bottom"].map((lado) => (
              <div key={lado} style={{ position: "absolute", left: 0, right: 0, [lado]: 0, height: 7, background: "repeating-linear-gradient(90deg, rgba(246,237,213,0.95) 0 5px, transparent 5px 10px)", WebkitMaskImage: `linear-gradient(${lado === "top" ? "180deg" : "0deg"}, #000, transparent)`, maskImage: `linear-gradient(${lado === "top" ? "180deg" : "0deg"}, #000, transparent)` }} />
            ))}
            <span style={{ position: "relative", fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 10.5, letterSpacing: "0.06em", color: verified ? (acerto ? "#8cf0c0" : "#ffb3b3") : "#fce9a8", padding: "0 10px", textAlign: "center" }}>
              {!verified && "DEROGADO · 1845"}
              {verified && acerto && "✓ DEROGADO · 1845"}
              {verified && !acerto && "✗ " + r.t + " — esta no cayó"}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, height: "100%", width: "100%", paddingBottom: 12 }}>
      {/* ⚠ Centrado VERTICAL del bloque entero (enunciado + cartel + papel): con un
          paddingTop fijo quedaba más aire debajo del papel que encima del enunciado. */}
      <div style={{ pointerEvents: "none", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)", flexShrink: 0 }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 20, color: "#fff" }}>¿Qué mandatos de la Carta cayeron en 1845?</span>
        <div style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 1 }}>Son tres.</div>
      </div>
      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, width: "100%" }}>
        {/* ⚠ Ya NO hay cuadro con los tres pedidos. Era casi un espejo del papel ("el
            impuesto que hizo estallar el 6 de marzo" ≈ "Cada hombre paga tres pesos al
            año"), así que la ronda se resolvía traduciendo línea por línea. Lo quitó la
            autora el 2026-11-23. Solo queda el cartel del REVELADO. */}

        {/* El papel. ⚠ `position: relative` porque el cartel del revelado cuelga de él en
            ABSOLUTO: si ocupara sitio en la columna, al reservarlo empujaría el enunciado
            hacia arriba (la autora: "el enunciado está muy arriba") y, sin reservarlo,
            el papel daría un salto al verificar. */}
        <div style={{ position: "relative", width: 452, boxSizing: "border-box", borderRadius: 10, border: "3px solid rgba(190,158,96,0.75)", background: "linear-gradient(180deg, rgba(255,251,236,0.96), rgba(238,226,198,0.94))", padding: "9px 11px 11px", flexShrink: 0, boxShadow: "0 8px 20px rgba(0,0,0,0.38)" }}>
          <div style={{ textAlign: "center", fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 11, letterSpacing: "0.08em", color: "#7a5a12", borderBottom: "2px solid rgba(190,158,96,0.5)", paddingBottom: 4, marginBottom: 7 }}>CARTA DE LA ESCLAVITUD · 1843</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {b.renglones.map((r, i) => renglon(r, i))}
          </div>
          {verified && (
            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: 8, boxSizing: "border-box", borderRadius: 12, border: "2.5px solid #f2c260", background: "rgba(10,30,22,0.92)", padding: "7px 12px", textAlign: "center" }}>
              <span style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 11, lineHeight: 1.25, color: "#fce9a8" }}>El renglón de los esclavos no cayó en 1845: hubo que esperar a 1851, con Urbina.</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

const L6T2_ROUNDS = [
  { C: L6T2R1Bandera, verify: true, bubble: (<>Pinta la bandera tocando<br />los colores de abajo.</>) },
  { C: L6T2R2Mapa, verify: true, bubble: (<>Toca en el mapa la<br />ciudad donde mandaba.</>) },
  { C: L6T2R3Carta, verify: true, bubble: (<>Arrastra a lo ancho<br />del renglón y se rompe.</>) },
];
// ╔════════════════════════════════════════════════════════════════════════════╗
// ║ LIBRO 7 · TEMA 1 · "La Revolución Liberal"                                 ║
// ║ Edad objetivo: 11 años (la fija la autora).                                ║
// ║ D.C.D. CS.3.1.40 · CS.3.1.41 · CS.3.1.42 · CS.3.1.43                       ║
// ║                                                                            ║
// ║ 3 rondas, 3 manos distintas:                                               ║
// ║   R1 "Tender la via"      — ORDENAR arrastrando sobre la via del tren      ║
// ║   R2 "La balanza de 1897" — REPARTIR en tres destinos, la viga se inclina  ║
// ║   R3 "Expediente abierto" — DESTAPAR pistas y apostar cuanto antes         ║
// ║                                                                            ║
// ║ ⭐ 4 + 2 + 2 = **8 maximo**.                                                ║
// ║                                                                            ║
// ║ ⚠ DATOS: todo sale del Libro 7 Tema 1 (pp. 10-15) y su cuaderno (pp.       ║
// ║ 11-14), que la autora entrego el 2026-11-23. No se inventa nada.           ║
// ║                                                                            ║
// ║ ⚠ Fuera del juego a proposito: la "hoguera barbara" como escena (es del    ║
// ║ libro, pero no se juega con un linchamiento). El hecho de 1912 entra en la ║
// ║ R1 redactado en seco, sin la escena.                                       ║
// ║                                                                            ║
// ║ ⚠ NINGUNA cara de persona real se dibuja. Alfaro y Matilde Hidalgo se      ║
// ║ nombran; no se ilustran.                                                   ║
// ╚════════════════════════════════════════════════════════════════════════════╝

// Imagen de `assets/` con respaldo de emoji: el tema entero se juega aunque las
// ilustraciones todavia no esten subidas (mismo criterio que J12Retrato).
function J12Img({ src, e, ancho, alto, radius, fit }) {
  const [roto, setRoto] = useStateG(false);
  if (roto) {
    return (
      <div style={{ width: ancho, height: alto, borderRadius: radius === undefined ? 10 : radius, background: "rgba(0,0,0,0.3)", border: "1.5px solid rgba(242,194,96,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.round(Math.min(ancho, alto) * 0.5), lineHeight: 1 }}>{e}</div>
    );
  }
  return <img src={`assets/${src}`} alt="" draggable={false} onError={() => setRoto(true)}
    style={{ width: ancho, height: alto, objectFit: fit || "cover", objectPosition: "center", borderRadius: radius === undefined ? 10 : radius, pointerEvents: "none", WebkitUserDrag: "none" }} />;
}

// ══════════════════════════════════════════════════════════════════
// R1 · "Tender la via" — ORDENAR arrastrando.
// Cuatro hechos de la Revolucion liberal, desordenados sobre la via del ferrocarril.
// Se arrastra la tarjeta (o se tocan dos para intercambiarlas) y ¡VERIFICAR! valida las
// cuatro de una vez. ⭐ +1 por tarjeta en su sitio.
//
// ⚠ El año NO se ve mientras se juega: deducir el orden ES el ejercicio. Aparece al
// verificar, junto al ✓/✗ y el puesto que le tocaba, SIN reordenar la columna.
//
// ⚠ El lenguaje del revelado es la VIA: el tren baja por los rieles y FRENA en la
// primera tarjeta fuera de sitio. Si estan las cuatro bien, llega hasta Quito.
//
// ⚠ Banco de 6 hechos con año explicito en el libro y TODOS distintos: si dos
// compartieran año habria dos ordenaciones correctas. Entran 4 por partida.
// ══════════════════════════════════════════════════════════════════
const J7T1_HITOS = [
  { id: "v1895", y: 1895, e: "📣", t: "Tras la “venta de la bandera”, el 5 de junio una Junta nombra a Alfaro jefe supremo." },
  { id: "v1897", y: 1897, e: "📜", t: "Una Asamblea en Quito aprueba una nueva Constitución y Alfaro llega a la presidencia." },
  { id: "v1902", y: 1902, e: "💍", t: "La Ley de Matrimonio Civil y del Divorcio saca el matrimonio de manos de la Iglesia." },
  { id: "v1906", y: 1906, e: "🏛️", t: "Alfaro implanta el Estado laico y se aprueba su segunda Constitución." },
  { id: "v1908", y: 1908, e: "🚂", t: "Se termina el ferrocarril que une Guayaquil con Quito: 452 km de vía." },
  { id: "v1912", y: 1912, e: "🕯️", t: "Alfaro es apresado y llevado a Quito; allí muere y termina la Revolución liberal." },
  { id: "v1900", y: 1900, e: "📒", t: "La Ley de Registro Civil pone en manos del Estado los nacimientos y las muertes." },
  { id: "v1904", y: 1904, e: "⚖️", t: "La Ley de Cultos ordena la relación entre el Estado y la Iglesia." },
  { id: "v1922", y: 1922, e: "📢", t: "El 15 de noviembre, una gran marcha obrera paraliza Guayaquil." },
];

const J7T1_R1_KEY = "edinun_j12_l7t1_r1_v1";
// ⚠ Alto FIJO de tarjeta + separacion. Las tarjetas se estiraron de 74 a 86 para que la
// columna llene el panel: sobraba un hueco muerto debajo de la ultima y la autora lo
// marco en rojo sobre una captura el 2026-11-23. De paso cabe letra mas grande.
const J7T1_ALTO = 86, J7T1_HUECO = 10;
function j7t1R1Build() {
  // ⚠ Se sortean LOS QUE JUEGAN (4 de 9), no los que se quedan fuera: con un banco grande,
  // sortear la exclusión deja la mayoría dentro siempre y la ronda se repite. 9 sobre 4
  // da 126 combinaciones. FIFO de 6, nunca cap = K.
  const dentro = j12PickIdx(J7T1_HITOS, 4, J7T1_R1_KEY);
  j12Commit(J7T1_R1_KEY, dentro, 6);
  const juegan = J7T1_HITOS.filter((_, i) => dentro.indexOf(i) !== -1).slice().sort((a, b) => a.y - b.y);
  let ini = j12Shuffle(juegan), guard = 0;
  while (guard++ < 30 && ini.every((h, i) => h.id === juegan[i].id)) ini = j12Shuffle(juegan);
  return { correcto: juegan, orden: ini };
}

function L7T1R1Via({ onSolve, verifyRef }) {
  const [b] = useStateG(() => j7t1R1Build());
  const [st, setSt] = useStateG(() => ({ orden: b.orden, drag: null }));
  const orden = st.orden, drag = st.drag;
  const setOrden = (f) => setSt((s) => ({ ...s, orden: typeof f === "function" ? f(s.orden) : f }));
  const setDrag = (d) => setSt((s) => ({ ...s, drag: d }));
  const [sel, setSel] = useStateG(null);
  const [verified, setVerified] = useStateG(false);
  const [tren, setTren] = useStateG(0);         // hasta que slot llego el tren (0 = en la salida)
  const rootRef = useRefG(null);
  const cardRefs = useRefG([]);
  const dragInfo = useRefG(null);
  const vuelo = useRefG(null);

  // Cuantas tarjetas seguidas, desde arriba, estan en su sitio: hasta ahi llega el tren.
  let tope = 0;
  while (tope < orden.length && orden[tope].id === b.correcto[tope].id) tope++;
  useEffectG(() => {
    if (!verified) return undefined;
    const t = setTimeout(() => setTren(tope), 120);
    return () => clearTimeout(t);
  }, [verified, tope]);

  function tap(i) {
    if (verified) return;
    if (sel === null) { setSel(i); return; }
    if (sel === i) { setSel(null); return; }
    setOrden((o) => { const n = o.slice(); const t = n[i]; n[i] = n[sel]; n[sel] = t; return n; });
    setSel(null);
  }

  // Arrastre con aterrizaje (mismo patron probado en la linea del tiempo del Libro 6:
  // la tarjeta sigue al dedo, nadie se desplaza en vivo, y al soltar TODAS viajan).
  // ⚠ El destino se mide por el CENTRO DE LA TARJETA ARRASTRADA, no por donde está el
  // dedo. Las tarjetas son altas (74 px): agarrando una por el borde, el dedo queda hasta
  // 37 px de su centro, así que la tarjeta ya cubría el hueco de abajo y el dedo seguía
  // más cerca del de arriba — se soltaba y volvía a su sitio. Lo reportó la autora:
  // *"si arrastro una opción debe poder colocarse en ese espacio, porque si no arrastro y
  // no se queda ahí"*.
  function destinoDe(y, slots) {
    let mejor = 0, d = Infinity;
    for (let i = 0; i < slots.length; i++) { const dist = Math.abs(y - slots[i]); if (dist < d) { d = dist; mejor = i; } }
    return mejor;
  }
  function onDown(e, i) {
    if (verified) return;
    if (vuelo.current) { vuelo.current.cortado = true; (vuelo.current.anims || []).forEach((a) => { try { a.cancel(); } catch (err) {} }); vuelo.current = null; }
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
    const S = rootRef.current ? (rootRef.current.getBoundingClientRect().width / 470) || 1 : 1;
    const slots = orden.map((_, k) => { const el = cardRefs.current[k]; if (!el) return 0; const r = el.getBoundingClientRect(); return r.top + r.height / 2; });
    dragInfo.current = { i, x0: e.clientX, y0: e.clientY, scale: S, slots, movido: false };
    setDrag({ i, dy: 0, over: i, movido: false });
  }
  function onMove(e) {
    const di = dragInfo.current; if (!di) return;
    const dy = e.clientY - di.y0;
    if (!di.movido && Math.hypot(e.clientX - di.x0, dy) <= 6) return;
    di.movido = true;
    setDrag({ i: di.i, dy: dy / di.scale, over: destinoDe(di.slots[di.i] + dy, di.slots), movido: true });
  }
  function onUp(e) {
    const di = dragInfo.current; if (!di) return;
    dragInfo.current = null;
    if (verified) { setDrag(null); return; }
    if (!di.movido) { setDrag(null); tap(di.i); return; }       // respaldo: toque = intercambio
    const destino = destinoDe(di.slots[di.i] + (e.clientY - di.y0), di.slots);
    if (destino === di.i) { setDrag(null); return; }
    const antes = {};
    orden.forEach((h, k) => { const el = cardRefs.current[k]; if (el) antes[h.id] = el.getBoundingClientRect().top; });
    const nuevoOrden = orden.slice();
    const quitada = nuevoOrden.splice(di.i, 1)[0];
    nuevoOrden.splice(destino, 0, quitada);
    setSt({ orden: nuevoOrden, drag: null });
    setSel(null);
    aterrizarTodas(antes, nuevoOrden, di.scale || 1);
  }
  function endDrag() { dragInfo.current = null; setDrag(null); }
  function aterrizarTodas(antes, nuevo, S) {
    const v = { cortado: false, anims: [] };
    vuelo.current = v;
    requestAnimationFrame(() => {
      if (v.cortado) return;
      nuevo.forEach((h, k) => {
        const el = cardRefs.current[k];
        if (!el || !el.animate || antes[h.id] === undefined) return;
        if (el.getAnimations) el.getAnimations().forEach((an) => { try { an.cancel(); } catch (err) {} });
        const salto = (antes[h.id] - el.getBoundingClientRect().top) / S;
        if (Math.abs(salto) < 1) return;
        v.anims.push(el.animate([{ transform: `translateY(${salto}px)` }, { transform: "translateY(0px)" }], { duration: 150, easing: "ease-out", fill: "backwards" }));
      });
    });
  }

  function verificar() {
    if (verified) return;
    setSel(null); setVerified(true);
    const aciertos = orden.filter((h, i) => h.id === b.correcto[i].id).length;
    onSolve(aciertos === orden.length, {
      emoji: "🚂", a: "La Revolución liberal, en orden",
      userAnswer: orden.map((h) => h.t.slice(0, 32)).join(" · "),
      correctAnswer: b.correcto.map((h) => `${h.y} ${h.t.slice(0, 26)}`).join(" · "),
    }, aciertos);
  }
  verifyRef.current = verificar;

  function puestoDe(h) { return b.correcto.findIndex((x) => x.id === h.id) + 1; }
  const altoVia = orden.length * J7T1_ALTO + (orden.length - 1) * J7T1_HUECO;
  // ⚠ En reposo el tren se para en el ARRANQUE DE LOS RIELES (top 0), no por encima:
  // a -16 se montaba sobre el rótulo GUAYAQUIL en los cinco tamaños de ventana.
  const trenY = tren === 0 ? 0 : (tren - 1) * (J7T1_ALTO + J7T1_HUECO) + J7T1_ALTO / 2 - 11;

  return (
    <div ref={rootRef} style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", height: "100%", width: "100%", paddingTop: 36 }}>
      {/* Fondo del ferrocarril, apagado: ambienta sin competir con el texto.
          ⚠ Va como background-image, nunca como <img> sobredimensionado.
          ⚠ Es TEXTURA, no una escena que se lea. El carril mide 470x462 (casi cuadrado)
          y la ilustración es 16:9, así que `cover` recorta los lados y el viaducto con el
          tren queda detrás de las tarjetas. Se probaron `contain` arriba y abajo: encajan
          la escena entera, pero dejan un BORDE HORIZONTAL duro a media pantalla que
          parece un defecto. Con las tarjetas ocupando 452 de 470 px no hay encuadre que
          enseñe el tren; si se quiere ver, hay que darle su propio hueco. */}
      <div style={{ position: "absolute", top: 22, left: 0, right: 0, bottom: 0, borderRadius: 16, opacity: 0.22, backgroundImage: "url(assets/j7t1-ferrocarril.jpg)", backgroundSize: "cover", backgroundPosition: "center", pointerEvents: "none" }} />
      <div style={{ position: "relative", pointerEvents: "none", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 19, color: "#fff" }}>Ordena los hechos del más antiguo al más reciente.</span>
      </div>
      <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0, width: "100%" }}>
        <div style={{ display: "flex", alignItems: "stretch", gap: 10, width: 452 }}>
          {/* La VÍA: rieles verticales, Guayaquil arriba y Quito abajo. El tren baja al
              verificar y frena en la primera tarjeta fuera de sitio. */}
          <div style={{ position: "relative", flexShrink: 0, width: 34, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 8, color: "rgba(255,255,255,0.85)", letterSpacing: "0.04em" }}>GUAYAQUIL</span>
            <div style={{ position: "relative", height: altoVia, width: 18, margin: "3px 0" }}>
              <div style={{ position: "absolute", left: 3, top: 0, bottom: 0, width: 3, borderRadius: 999, background: "rgba(242,194,96,0.55)" }} />
              <div style={{ position: "absolute", right: 3, top: 0, bottom: 0, width: 3, borderRadius: 999, background: "rgba(242,194,96,0.55)" }} />
              {Array.from({ length: orden.length * 3 }).map((_, k) => (
                <div key={k} style={{ position: "absolute", left: 0, right: 0, top: 8 + k * ((altoVia - 16) / (orden.length * 3 - 1)), height: 2, borderRadius: 2, background: "rgba(242,194,96,0.35)" }} />
              ))}
              {/* Tramo recorrido: se enciende hasta donde llegó el tren. */}
              {verified && tren > 0 && (
                <div style={{ position: "absolute", left: 3, right: 3, top: 0, height: trenY + 11, background: "linear-gradient(180deg, rgba(79,224,138,0.8), rgba(31,157,87,0.8))", borderRadius: 999, transition: "height 0.9s ease-out" }} />
              )}
              {/* ⚠ DÓNDE VA A CAER la tarjeta, mientras la arrastras. La tarjeta cae en el
                  hueco cuyo centro tiene más cerca; si se suelta sin pasar la mitad del
                  hueco, vuelve a su sitio — y nada lo avisaba, así que la autora lo leyó
                  como que el arrastre no funcionaba. La marca va EN LA VÍA porque ahí hay
                  sitio libre: dentro de las tarjetas taparía texto. */}
              {drag && drag.movido && !verified && (
                <div style={{ position: "absolute", left: -4, right: -4, top: drag.over * (J7T1_ALTO + J7T1_HUECO), height: J7T1_ALTO, borderRadius: 7, background: "rgba(79,216,255,0.3)", border: "2px solid #4fd8ff", boxShadow: "0 0 16px rgba(79,216,255,0.8)", pointerEvents: "none" }} />
              )}
              <div style={{ position: "absolute", left: "50%", top: trenY, transform: "translateX(-50%)", fontSize: 20, lineHeight: 1, transition: "top 0.9s ease-out", filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.6))", opacity: (drag && drag.movido && !verified) ? 0.25 : 1 }}>🚂</div>
            </div>
            <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 8, color: "rgba(255,255,255,0.85)", letterSpacing: "0.04em" }}>QUITO</span>
          </div>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: J7T1_HUECO }}>
            {orden.map((h, i) => {
              const ok = verified && h.id === b.correcto[i].id;
              const elegida = sel === i;
              const arrastrando = drag && drag.i === i;
              const destino = drag && drag.movido && drag.over === i && drag.i !== i && !verified;
              // ⚠ LAS DEMÁS SE APARTAN para abrir el hueco donde va a caer la arrastrada:
              // las de en medio suben o bajan un paso entero (74 + 10 px). Lo pidió la
              // autora el 2026-11-23: *"si quiero colocarla en algún espacio las dos
              // opciones deben de moverse, por ejemplo la una hacia arriba y la otra hacia
              // abajo"*. Sin esto no se veía dónde iba a entrar.
              // ⚠ Lo que la autora rechazó en el Libro 6 NO era esto, sino que se
              // reordenara la lista en vivo y la tarjeta arrastrada saltara sola. Aquí la
              // arrastrada sigue al dedo y la lista solo cambia AL SOLTAR.
              let empuje = 0;
              if (drag && drag.movido && !verified && !arrastrando) {
                const paso = J7T1_ALTO + J7T1_HUECO;
                if (drag.i < drag.over && i > drag.i && i <= drag.over) empuje = -paso;
                else if (drag.i > drag.over && i >= drag.over && i < drag.i) empuje = paso;
              }
              let border = "#d9c48a", bg = "linear-gradient(180deg,#fffdf6,#f6ecd2)", col = "#3a2608";
              if (!verified && (elegida || arrastrando || destino)) { border = "#4fd8ff"; bg = "linear-gradient(180deg,#eaf9ff,#cdeeff)"; }
              if (verified) {
                border = ok ? "#2ecc8f" : "#ff6b6b";
                bg = ok ? "linear-gradient(180deg,rgba(72,224,154,0.95),rgba(26,143,95,0.92))" : "linear-gradient(180deg,rgba(255,139,139,0.92),rgba(178,47,47,0.9))";
                col = ok ? "#06381f" : "#fff";
              }
              return (
                <button key={h.id} data-qa="via" ref={(el) => { cardRefs.current[i] = el; }}
                  onPointerDown={(e) => onDown(e, i)} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={endDrag} disabled={verified}
                  style={{ position: "relative", width: "100%", height: J7T1_ALTO, touchAction: "none", boxSizing: "border-box", borderRadius: 12, border: `3px solid ${border}`, background: bg, color: col, display: "flex", alignItems: "center", gap: 9, padding: "6px 10px", textAlign: "left", cursor: verified ? "default" : "pointer", transform: arrastrando ? `translateY(${drag.dy}px) scale(1.03)` : (empuje ? `translateY(${empuje}px)` : ((elegida && !verified) ? "translateX(4px) scale(1.02)" : "none")), zIndex: arrastrando ? 60 : 1, boxShadow: ((elegida || arrastrando || destino) && !verified) ? "0 0 18px rgba(79,216,255,0.6), inset 0 1px 0 rgba(255,255,255,0.7)" : "inset 0 1px 0 rgba(255,255,255,0.7), 0 4px 10px rgba(0,0,0,0.28)", transition: arrastrando ? "none" : "transform 0.16s ease" }}>
                  <span style={{ flexShrink: 0, width: 21, height: 21, borderRadius: "50%", background: "rgba(0,0,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--ed-font-mono)", fontWeight: 700, fontSize: 11 }}>{i + 1}</span>
                  <span style={{ flexShrink: 0, fontSize: 17, lineHeight: 1 }}>{h.e}</span>
                  <span style={{ flex: 1, minWidth: 0, fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 12.5, lineHeight: 1.25 }}>{h.t}</span>
                  {/* Al verificar aparece el año y, si está mal, el puesto que le tocaba.
                      La columna NO se reordena: el niño tiene que poder ver su respuesta. */}
                  {verified && (
                    <span style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ flexShrink: 0, width: 18, height: 18, borderRadius: "50%", background: ok ? "#1f8a54" : "#c0392b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 11, boxShadow: "0 2px 5px rgba(0,0,0,0.35)" }}>{ok ? "✓" : "✗"}</span>
                        <span style={{ fontFamily: "var(--ed-font-mono)", fontWeight: 700, fontSize: 12.5 }}>{h.y}</span>
                      </span>
                      {!ok && <span style={{ whiteSpace: "nowrap", background: "linear-gradient(180deg,#ffe6a1,#f1c153)", border: "1.5px solid #e0a72c", borderRadius: 999, padding: "0 6px", fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 8.5, color: "#5a3d0a" }}>va {puestoDe(h)}º</span>}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// R2 · "La balanza de 1897" — REPARTIR en tres destinos (mano nueva en el tema).
// Llega un asunto a la vez y se toca su destino: LA IGLESIA · CADA PERSONA · EL ESTADO.
// La viga se inclina en vivo segun como va quedando el reparto. ⭐ +1 por asunto bien
// colocado (maximo 2).
//
// ⚠ Entran DOS asuntos por partida y caen en destinos DISTINTOS.
// ⚠ Tres destinos, no dos: el libro dice que con el laicismo lo civil paso al Estado, que
// la Iglesia conservo lo suyo (cuaderno p. 13: el Carnaval, las procesiones, la Novena) y
// que la creencia quedo "en el ambito de la vida privada y de la conciencia individual"
// — ese es el tercer destino. Con solo dos, TODO caeria del lado del Estado y no habria
// ronda que jugar.
//
// ⚠ Ni verde ni rojo antes de ¡VERIFICAR!: lo colocado va en ambar. La viga que se
// inclina es un espejo de TU reparto, no una correccion.
//
// ⚠ BORRAR quita el ULTIMO asunto colocado, de uno en uno, y lo devuelve a la mano.
// ══════════════════════════════════════════════════════════════════
const J7T1_DESTINOS = [
  { id: "igl", nombre: "LA IGLESIA", img: "j7t1-iglesia.jpg", e: "⛪", col: "#f2b84b" },
  // ⚠ El emoji de respaldo NO puede ser 💭: es el mismo que lleva el asunto "En qué
  // religión cree cada uno", y al colocar esa ficha en otro platillo parecían la misma
  // cosa en dos sitios. La casa va con la idea de la vida privada y hace juego con los
  // dos edificios de al lado.
  { id: "per", nombre: "CADA PERSONA", img: "j7t1-persona.jpg", e: "🏠", col: "#b48aff" },
  { id: "est", nombre: "EL ESTADO", img: "j7t1-estado.jpg", e: "🏛️", col: "#4fd8ff" },
];
const J7T1_ASUNTOS = {
  est: [
    { id: "e1", e: "💍", t: "Registrar los matrimonios.", p: "Con la Ley de Matrimonio Civil de 1902, el matrimonio se registra ante el Estado." },
    { id: "e2", e: "📒", t: "Anotar quién nace y quién muere.", p: "La Ley de Registro Civil de 1900 puso esos registros en manos del Estado." },
    { id: "e3", e: "🏫", t: "Las escuelas y quién puede dar clases.", p: "La Ley de Instrucción Pública de 1897 separó al clero de la enseñanza." },
    { id: "e4", e: "⚖️", t: "Las leyes, que valen igual para todos.", p: "El Estado laico se maneja por leyes y normas jurídicas, no por dogmas." },
    { id: "e5", e: "🏥", t: "Los hospitales y las normas de sanidad.", p: "El Estado se ocupó de la salud pública y de las normas sanitarias." },
    { id: "e6", e: "🌾", t: "Las tierras que tenía la Iglesia.", p: "La Ley de Manos Muertas de 1908 las puso en manos del Estado para repartirlas." },
    { id: "e7", e: "🚢", t: "Quién puede entrar al país a enseñar.", p: "La Constitución de 1897 prohibió el ingreso de comunidades religiosas de enseñanza." },
    { id: "e8", e: "👩‍🏫", t: "Que las niñas estudien en escuelas laicas.", p: "Antes solo tenían la opción religiosa; el Estado creó escuelas para ellas." },
    { id: "e9", e: "🧰", t: "La jornada máxima y el salario mínimo de las mujeres.", p: "El Estado fijó esas condiciones al garantizar el derecho femenino al trabajo." },
  ],
  igl: [
    { id: "i1", e: "🕯️", t: "Las procesiones y la Novena a los Santos.", p: "El cuaderno dice que se siguieron celebrando igual que antes." },
    { id: "i2", e: "🎭", t: "El Carnaval y las fiestas religiosas.", p: "Siguieron siendo fiestas de la Iglesia y del pueblo." },
    { id: "i3", e: "⛪", t: "La misa y los bautizos.", p: "La religión siguió con sus propias celebraciones." },
    { id: "i4", e: "🙏", t: "La Novena a los Santos.", p: "El cuaderno la nombra entre las fiestas que siguieron celebrándose." },
  ],
  per: [
    { id: "p1", e: "💭", t: "En qué religión cree cada uno.", p: "La creencia quedó en la vida privada y en la conciencia individual." },
    { id: "p2", e: "🗣️", t: "Lo que una persona piensa y dice en público.", p: "Es la libertad de pensamiento, por la palabra o por la prensa." },
    { id: "p3", e: "🚶", t: "Si alguien va o no va a la iglesia.", p: "Es libertad de conciencia: la decide cada quien, no el Estado ni la Iglesia." },
    { id: "p4", e: "📰", t: "Lo que escriben los periódicos.", p: "La libertad de pensamiento se manifiesta también por la prensa." },
  ],
};
const J7T1_R2_KEYS = { est: "edinun_j12_l7t1_r2_est_v1", igl: "edinun_j12_l7t1_r2_igl_v1", per: "edinun_j12_l7t1_r2_per_v1" };
const J7T1_R2_CAP = { est: 6, igl: 3, per: 3 };
// Las tres parejas posibles de destinos. Se sortea UNA y entra un asunto de cada uno.
const J7T1_R2_PARES = [["est", "igl"], ["est", "per"], ["igl", "per"]];
const J7T1_R2_PAR_KEY = "edinun_j12_l7t1_r2_par_v1";
function j7t1R2Build() {
  // ⚠ SON DOS ASUNTOS, no cinco (lo pidio la autora el 2026-11-23 jugandolo: *"en esta
  // ronda solo quiero que sean 2 no 5"*). Con cinco se hacia larga.
  // ⚠ Los dos caen en destinos DISTINTOS: se sortea la pareja de destinos y se saca un
  // asunto de cada uno. Con dos del mismo lado la ronda no ensenaria el reparto, que es
  // justo lo que cuenta el tema.
  const pi = j12PickIdx(J7T1_R2_PARES, 1, J7T1_R2_PAR_KEY)[0];
  j12Commit(J7T1_R2_PAR_KEY, [pi], 2);
  function toma(grupo) {
    const pool = J7T1_ASUNTOS[grupo];
    const idx = j12PickIdx(pool, 1, J7T1_R2_KEYS[grupo]);
    j12Commit(J7T1_R2_KEYS[grupo], idx, J7T1_R2_CAP[grupo]);
    return Object.assign({}, pool[idx[0]], { d: grupo });
  }
  return { cartas: j12Shuffle(J7T1_R2_PARES[pi].map(toma)) };
}

// ⚠ VA FUERA de L7T1R2Balanza. Definido dentro, su identidad cambiaba en cada render y
// React desmontaba y volvía a montar el subárbol entero: el J12Img de "CADA PERSONA"
// —el único sin archivo todavía— reintentaba la carga, fallaba y volvía al emoji una y
// otra vez. Se veía como un PARPADEO, y así lo reportó la autora el 2026-11-23.
//
// ⚠ Con dos asuntos sobra sitio, así que las ilustraciones van GRANDES y casi cuadradas
// (las fuentes son 1:1, así se recortan lo mínimo).
//
// ⚠ Un platillo con ficha se nota desde lejos: marco ámbar grueso, halo y la etiqueta
// "YA COLOCASTE AQUÍ". En ÁMBAR, nunca en verde: es un acuse, no un veredicto.
function J7T1Platillo({ dest, fichas, faltan, vivo, verified, onPick }) {
  const lleno = fichas.length > 0;
  const fallo = verified && fichas.some((c) => c.mal);
  const acierto = verified && lleno && !fallo;
  // ⚠ EL MARCO DA EL VEREDICTO, no una fichita de 34 px perdida dentro: verde si lo que
  // pusiste aquí está bien, rojo si hay un error, ámbar a rayas si aquí faltaba algo.
  // La autora: *"cuando se ve si fue correcto o no, mejora eso, no me agrada cómo se ve"*.
  let marco = vivo ? dest.col : "rgba(255,255,255,0.28)", halo = vivo ? `0 0 16px ${dest.col}55` : "none";
  let fondo = "rgba(10,6,35,0.72)", trazo = "solid", grosor = 2.5;
  if (!verified && lleno) { marco = "#f2c260"; halo = "0 0 20px rgba(242,194,96,0.55)"; fondo = "rgba(60,42,10,0.75)"; grosor = 3.5; }
  if (fallo) { marco = "#ff6b6b"; halo = "0 0 22px rgba(255,107,107,0.6)"; fondo = "rgba(80,18,18,0.8)"; grosor = 4; }
  else if (acierto) { marco = "#2ecc8f"; halo = "0 0 22px rgba(46,204,143,0.6)"; fondo = "rgba(12,70,45,0.82)"; grosor = 4; }
  else if (verified && faltan.length) { marco = "#f2c260"; halo = "0 0 18px rgba(242,194,96,0.45)"; trazo = "dashed"; grosor = 3.5; }
  return (
    <button data-qa={"plat-" + dest.id} onClick={onPick} disabled={!vivo}
      style={{ position: "relative", width: 148, boxSizing: "border-box", borderRadius: 14, border: `${grosor}px ${trazo} ${marco}`, background: fondo, padding: "7px 6px 8px", cursor: vivo ? "pointer" : "default", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, boxShadow: halo }}>
      {/* El sello del veredicto, en la esquina de la ilustración: se ve de un vistazo
          cuál acertó y cuál no, sin tener que leer las fichas. */}
      {(fallo || acierto) && (
        <span style={{ position: "absolute", top: -11, right: -11, width: 30, height: 30, borderRadius: "50%", background: acierto ? "#1f8a54" : "#c0392b", border: "2.5px solid #fff", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 17, lineHeight: 1, boxShadow: "0 3px 8px rgba(0,0,0,0.5)" }}>{acierto ? "✓" : "✗"}</span>
      )}
      {dest.img
        ? <J12Img src={dest.img} e={dest.e} ancho={132} alto={118} radius={9} />
        : <div style={{ width: 132, height: 118, borderRadius: 9, background: "rgba(180,138,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 54, lineHeight: 1 }}>{dest.e}</div>}
      <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 11, letterSpacing: "0.05em", color: acierto ? "#bdf5da" : (fallo ? "#ffd4d4" : "#fce9a8") }}>{dest.nombre}</span>
      <div style={{ minHeight: 34, display: "flex", flexWrap: "wrap", gap: 5, alignItems: "center", justifyContent: "center" }}>
        {fichas.map((c) => (
          <span key={c.id} title={c.t} style={{ position: "relative", width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, lineHeight: 1, background: c.mal ? "rgba(192,57,43,0.95)" : (c.ok ? "rgba(31,138,84,0.95)" : "rgba(242,194,96,0.85)"), border: `2px solid ${c.mal ? "#ff6b6b" : (c.ok ? "#2ecc8f" : "#fce9a8")}`, boxShadow: "0 2px 6px rgba(0,0,0,0.4)" }}>{c.e}</span>
        ))}
        {/* ⚠ Lo que TENÍA que haber caído aquí, en hueco de rayas: así el revelado no solo
            dice "te equivocaste", enseña dónde iba, en el lenguaje de la mecánica. */}
        {verified && faltan.map((c) => (
          <span key={c.id} title={c.t} style={{ width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, lineHeight: 1, background: "rgba(242,194,96,0.18)", border: "2px dashed #f2c260", opacity: 0.95 }}>{c.e}</span>
        ))}
        {!verified && lleno && (
          <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 900, fontSize: 7.5, letterSpacing: "0.08em", color: "#3a2608", background: "#f2c260", borderRadius: 999, padding: "2px 6px" }}>YA COLOCASTE AQUÍ</span>
        )}
        {verified && faltan.length > 0 && (
          <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 900, fontSize: 7.5, letterSpacing: "0.08em", color: "#3a2608", background: "#f2c260", borderRadius: 999, padding: "2px 6px" }}>AQUÍ IBA</span>
        )}
      </div>
    </button>
  );
}

function L7T1R2Balanza({ onSolve, verifyRef, onClear }) {
  const [b] = useStateG(() => j7t1R2Build());
  const [puestos, setPuestos] = useStateG([]);     // [{ id, d }] en el orden en que se colocaron
  const [verified, setVerified] = useStateG(false);
  // ⚠ El acuse ("YA COLOCASTE AQUÍ" + la ficha) se ve un momento y SE BORRA SOLO, para que
  // el platillo salga limpio con el asunto siguiente. Mismo criterio que el mapa del
  // Libro 6. Lo pidió la autora el 2026-11-23: *"si voy a la segunda opción se debe borrar
  // lo que seleccioné en la primera opción"*.
  const [marca, setMarca] = useStateG(null);        // id del asunto recién colocado
  const cartas = b.cartas;
  const i = puestos.length;                         // la carta que está en la mano
  const actual = i < cartas.length ? cartas[i] : null;
  function puestoDe(id) { return puestos.find((p) => p.id === id) || null; }

  function colocar(d) {
    if (verified || !actual) return;
    setPuestos((ps) => ps.concat([{ id: actual.id, d: d }]));
    setMarca(actual.id);
  }
  function borrar() { if (!verified) { setPuestos((ps) => ps.slice(0, -1)); setMarca(null); } }
  useEffectG(() => {
    if (marca === null) return undefined;
    const t = setTimeout(() => setMarca(null), 1300);
    return () => clearTimeout(t);
  }, [marca]);

  useEffectG(() => {
    if (!onClear) return undefined;
    onClear(verified ? null : { fn: borrar, puede: puestos.length > 0 });
    return () => onClear(null);
  }, [puestos.length, verified]);

  const nEst = puestos.filter((p) => p.d === "est").length;
  const nIgl = puestos.filter((p) => p.d === "igl").length;
  // ⚠ La viga se inclina POCO a propósito: con 14° sus puntas bajaban 35 px y se metían
  // dentro de las ilustraciones de los platillos. Lo marcó la autora el 2026-11-23. El
  // detector de solapes no lo ve: la viga es un div decorativo, sin texto.
  const inclina = Math.max(-8, Math.min(8, (nEst - nIgl) * 5));

  function nombreDe(d) { const x = J7T1_DESTINOS.find((z) => z.id === d); return x ? x.nombre : "—"; }

  function verificar() {
    if (verified || puestos.length < cartas.length) return;
    setVerified(true);
    const aciertos = cartas.filter((c) => (puestoDe(c.id) || {}).d === c.d).length;
    onSolve(aciertos === cartas.length, {
      emoji: "⚖️", a: "Qué quedó en manos de quién con el Estado laico",
      userAnswer: cartas.map((c) => `${c.t.slice(0, 24)} → ${nombreDe((puestoDe(c.id) || {}).d)}`).join(" · "),
      correctAnswer: cartas.map((c) => `${c.t.slice(0, 24)} → ${nombreDe(c.d)}`).join(" · "),
    }, aciertos);
  }
  verifyRef.current = verificar;

  const fallos = verified ? cartas.filter((c) => (puestoDe(c.id) || {}).d !== c.d) : [];

  const vivo = !verified && !!actual;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%", width: "100%", paddingTop: 36 }}>
      <div style={{ pointerEvents: "none", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 18, color: "#fff" }}>Con el Estado laico, ¿en manos de quién quedó cada asunto?</span>
      </div>

      {/* LA BALANZA. La viga se inclina según tu reparto; es un espejo, no una corrección. */}
      <div style={{ position: "relative", width: 300, height: 44, marginTop: 8, flexShrink: 0 }}>
        <div style={{ position: "absolute", left: "50%", bottom: 0, transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "12px solid transparent", borderRight: "12px solid transparent", borderBottom: "20px solid rgba(242,194,96,0.7)" }} />
        <div style={{ position: "absolute", left: "50%", top: 14, width: 236, height: 6, marginLeft: -118, borderRadius: 999, background: "linear-gradient(90deg, rgba(242,184,75,0.95), rgba(180,138,255,0.9), rgba(79,216,255,0.95))", transform: `rotate(${inclina}deg)`, transformOrigin: "50% 50%", transition: "transform 0.35s ease", boxShadow: "0 2px 8px rgba(0,0,0,0.45)" }} />
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 5, flexShrink: 0 }}>
        {J7T1_DESTINOS.map((d) => (
          <J7T1Platillo key={d.id} dest={d} vivo={vivo} verified={verified} onPick={() => colocar(d.id)}
            fichas={cartas.filter((c) => (puestoDe(c.id) || {}).d === d.id && (verified || c.id === marca))
              .map((c) => Object.assign({}, c, { ok: verified && c.d === d.id, mal: verified && c.d !== d.id }))}
            faltan={verified ? cartas.filter((c) => c.d === d.id && (puestoDe(c.id) || {}).d !== d.id) : []} />
        ))}
      </div>

      {/* EN LA MANO: un asunto a la vez. Al terminar, ese sitio lo ocupa el revelado. */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", width: "100%", minHeight: 0, marginTop: 4 }}>
        {!verified && actual && (
          <div style={{ width: 448, boxSizing: "border-box", borderRadius: 14, border: "3px solid #d9c48a", background: "linear-gradient(180deg,#fffdf6,#f6ecd2)", color: "#3a2608", padding: "9px 12px", display: "flex", alignItems: "center", gap: 10, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7), 0 4px 10px rgba(0,0,0,0.28)" }}>
            <span style={{ flexShrink: 0, fontFamily: "var(--ed-font-mono)", fontWeight: 700, fontSize: 10, background: "rgba(0,0,0,0.1)", borderRadius: 999, padding: "2px 7px" }}>{i + 1}/{cartas.length}</span>
            <span style={{ flexShrink: 0, fontSize: 20, lineHeight: 1 }}>{actual.e}</span>
            <span data-qa="asunto" style={{ flex: 1, minWidth: 0, fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 12.5, lineHeight: 1.25 }}>{actual.t}</span>
          </div>
        )}
        {!verified && !actual && (
          <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 14, color: "#fce9a8", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>Ya colocaste los {cartas.length} asuntos.<br />Toca ¡VERIFICAR!</div>
        )}
        {/* Al revelar, la correcta GRITA: panel verde grande con dónde iba cada fallo. */}
        {verified && (
          <div style={{ width: 448, boxSizing: "border-box", borderRadius: 14, border: "3px solid #2ecc8f", background: "linear-gradient(180deg, rgba(46,204,143,0.96), rgba(22,120,80,0.96))", color: "#eafff4", padding: "8px 12px", boxShadow: "0 0 28px rgba(46,204,143,0.55)" }}>
            <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 900, fontSize: 11, letterSpacing: "0.1em", color: "#06381f", marginBottom: 4 }}>{fallos.length === 0 ? "¡LOS DOS EN SU SITIO!" : "LA RESPUESTA ERA"}</div>
            {fallos.length === 0 ? (
              <div style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 12, lineHeight: 1.3 }}>Con el laicismo el Estado tomó lo civil, la Iglesia conservó sus fiestas y la creencia quedó en manos de cada persona.</div>
            ) : fallos.slice(0, 3).map((c) => (
              <div key={c.id} style={{ display: "flex", gap: 7, alignItems: "flex-start", marginBottom: 3 }}>
                <span style={{ flexShrink: 0, fontSize: 14, lineHeight: 1.25 }}>{c.e}</span>
                <span style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 11, lineHeight: 1.25 }}>
                  <b>{nombreDe(c.d)}</b> — {c.p}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// R3 · "Expediente abierto" — DESTAPAR y apostar (mano nueva en el tema).
// UN expediente por partida: un solo intento. Llega con una foto y UNA pista; se pueden
// destapar dos mas, pero la estrella extra solo la gana quien acierta con la primera.
// ⭐ +1 por acierto, +1 mas si fue con la PRIMERA pista sola. Maximo 2.
//
// ⚠ El codigo sigue preparado para VARIOS expedientes (se verifican uno a uno y la
// pastilla ensena el numero y los puntos de avance): basta cambiar el 1 de j7t1R3Build.
//
// ⚠ Las pistas DAN los hechos: la ronda se resuelve leyendo lo que hay en pantalla, no
// de memoria. Destapar no quita nada de lo ya ganado, solo deja de sumar el extra.
//
// ⚠ Ni verde ni rojo antes de ¡VERIFICAR!: lo elegido se marca en azul. Y volver a tocar
// la opcion ya elegida NO la quita: quedarse con ella es una respuesta valida.
//
// ⚠ Las opciones falsas son nombres REALES de otros hechos del mismo tema: nada inventado.
// ══════════════════════════════════════════════════════════════════
const J7T1_CASOS = [
  { id: "cacao", img: "j7t1-cacao.jpg", e: "🫘", a: "La crisis cacaotera",
    pistas: ["La Primera Guerra Mundial cerró el mercado europeo y encareció el transporte.", "El quintal se desplomó de 26,76 a 5,75 sucres.", "En 1917 apareció la monilla, un hongo que arrasó las plantaciones."] },
  { id: "marcha", img: "j7t1-marcha.jpg", e: "📢", a: "La marcha obrera del 15 de noviembre de 1922",
    pistas: ["Guayaquil quedó paralizada por la protesta.", "Se sumaron obreros portuarios, artesanos y migrantes.", "Fue el hito inicial de la lucha laboral en el país."] },
  { id: "montonera", img: "j7t1-montonera.jpg", e: "🐴", a: "El levantamiento de Concha",
    pistas: ["Ocurrió entre 1913 y 1916, en la región Litoral.", "Lo lideró el coronel Carlos Concha Torres.", "Pedía cambios en la propiedad de la tierra y mejoras para los campesinos."] },
  { id: "escuela", img: "j7t1-escuela.jpg", e: "✏️", a: "La educación laica",
    pistas: ["En 1897 se prohibió el ingreso al país de comunidades religiosas de enseñanza.", "La Ley de Instrucción Pública separó al clero de las escuelas.", "Se crearon escuelas de artes y oficios para niñas."] },
  { id: "registro", img: "j7t1-registro.jpg", e: "✒️", a: "La Ley de Matrimonio Civil",
    pistas: ["Es de 1902.", "Desde entonces el matrimonio se registra ante un funcionario del Estado.", "Hizo que el sentido religioso quedara después de lo legal."] },
  { id: "estacion", img: "j7t1-estacion.jpg", e: "🚉", a: "El ferrocarril Guayaquil–Quito",
    pistas: ["Alfaro decía que sin él no había progreso posible.", "Se concluyó en 1908.", "Tiene 452 km y unió la Costa con la Sierra."] },
  { id: "laico", img: "j7t1-estado.jpg", e: "🏛️", a: "La implantación del Estado laico",
    pistas: ["Desde 1906 el país dejó de regirse por creencias religiosas.", "Las constituciones de 1897 y 1906 pusieron fin a la relación Estado–Iglesia.", "La religión quedó en la vida privada y en la conciencia individual."] },
  { id: "plutocracia", img: "j7t1-cacao.jpg", e: "💰", a: "El período plutocrático",
    pistas: ["Va de 1912 a 1925.", "La burguesía bancaria de Guayaquil ejercía su poder sobre el gobierno.", "El Banco Comercial y Agrícola prestaba dinero al Estado y decidía quién gobernaba."] },
];
const J7T1_R3_KEY = "edinun_j12_l7t1_r3_v1";
function j7t1R3Build() {
  // ⚠ UN solo expediente por partida: un único intento (lo pidió la autora el 2026-11-23:
  // *"en la ronda 3 solo quiero que haya un solo expediente, es decir que no hayan dos
  // intentos solo uno"*). La variedad la da cuál de los 6 toca.
  // ⚠ Cap 7 = banco − 1: para UN ítem es el máximo que no deja el sorteo sin opciones.
  // Con 8 expedientes hay que jugar 8 partidas seguidas para volver a ver el mismo.
  const idx = j12PickIdx(J7T1_CASOS, 1, J7T1_R3_KEY);
  j12Commit(J7T1_R3_KEY, idx, 7);
  const casos = idx.map((i) => {
    const c = J7T1_CASOS[i];
    const otros = j12Shuffle(J7T1_CASOS.filter((x) => x.id !== c.id)).slice(0, 2).map((x) => x.a);
    return Object.assign({}, c, { opciones: j12Shuffle([c.a].concat(otros)) });
  });
  return { casos };
}

function L7T1R3Expediente({ onSolve, verifyRef }) {
  const [b] = useStateG(() => j7t1R3Build());
  const casos = b.casos;
  const [activo, setActivo] = useStateG(0);
  const [abiertas, setAbiertas] = useStateG(() => casos.map(() => 1));   // pistas destapadas
  const [elegido, setElegido] = useStateG(() => casos.map(() => null));
  // ⚠ Se verifica UNO A UNO: ¡VERIFICAR! resuelve el expediente de turno, enseña la
  // respuesta y pasa al siguiente; el último cierra la ronda. Lo pidió la autora el
  // 2026-11-23: *"debo poner en verificar y se cambia al expediente 2"*. Es el mismo
  // criterio que el mapa del Libro 6.
  const [resuelto, setResuelto] = useStateG(() => casos.map(() => false));
  const [pasando, setPasando] = useStateG(false);
  const ganadas = useRefG(0);
  const c = casos[activo];
  const verified = resuelto[activo];

  function destapar() {
    if (verified || pasando) return;
    setAbiertas((a) => a.map((n, k) => (k === activo ? Math.min(3, n + 1) : n)));
  }
  function elegir(op) {
    if (verified || pasando) return;
    setElegido((e) => e.map((v, k) => (k === activo ? op : v)));
  }

  function verificar() {
    if (verified || pasando || elegido[activo] === null) return;
    const acerto = elegido[activo] === c.a;
    // ⭐ +1 por acierto y +1 más si fue con la PRIMERA pista sola.
    if (acerto) ganadas.current += (abiertas[activo] === 1 ? 2 : 1);
    setResuelto((r) => r.map((v, k) => (k === activo ? true : v)));
    setPasando(true);
    const ultimo = activo + 1 >= casos.length;
    setTimeout(() => {
      if (!ultimo) { setActivo((k) => k + 1); setPasando(false); return; }
      const aciertos = casos.filter((x, k) => elegido[k] === x.a).length;
      onSolve(aciertos === casos.length, {
        emoji: "🗂️", a: "Reconocer los hechos de la Revolución liberal",
        userAnswer: casos.map((x, k) => elegido[k]).join(" · "),
        correctAnswer: casos.map((x) => x.a).join(" · "),
      }, ganadas.current);
    }, ultimo ? 1500 : 1900);
  }
  verifyRef.current = verificar;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%", width: "100%", paddingTop: 36 }}>
      <div style={{ pointerEvents: "none", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 19, color: "#fff" }}>Descubre de qué hecho habla el expediente.</span>
      </div>

      {/* ⚠ SE VE UN SOLO EXPEDIENTE, el de turno, y bien grande. Antes estaban los dos a
          la vez y el activo casi no se distinguía del que faltaba; la autora pidió las dos
          cosas el 2026-11-23: *"lo que dice expediente 1 se vea más porque casi no se
          nota"* y *"solo quiero que se vea un expediente y ya"*.
          El avance va en PUNTOS (J12Puntos), que es como lo lleva el resto del juego: un
          "1 de 2" se lee de dos maneras. */}
      <div data-qa="exp" data-total={casos.length} style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, flexShrink: 0,
        borderRadius: 999, padding: "7px 18px",
        border: `2.5px solid ${verified ? (elegido[activo] === c.a ? "#2ecc8f" : "#ff6b6b") : "#fce9a8"}`,
        background: verified ? (elegido[activo] === c.a ? "rgba(26,143,95,0.92)" : "rgba(178,47,47,0.9)") : "rgba(0,0,0,0.5)",
        boxShadow: verified ? "none" : "0 0 18px rgba(242,194,96,0.35)" }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 900, fontSize: 14.5, letterSpacing: "0.06em", color: "#fce9a8" }}>
          EXPEDIENTE{casos.length > 1 ? " " + (activo + 1) : ""}{verified ? (elegido[activo] === c.a ? " ✓" : " ✗") : ""}
        </span>
        {/* Con un solo expediente no hay avance que contar: un punto suelto confunde. */}
        {casos.length > 1 && <J12Puntos total={casos.length} hechos={resuelto.filter(Boolean).length} />}
      </div>

      <div style={{ flex: 1, width: 452, display: "flex", flexDirection: "column", minHeight: 0, marginTop: 8 }}>
        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
          <J12Img src={c.img} e={c.e} ancho={140} alto={140} radius={12} />
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 5 }}>
            {[0, 1, 2].map((p) => {
              if (p < abiertas[activo]) {
                return (
                  <div key={p} style={{ borderRadius: 9, border: "1.5px solid rgba(242,194,96,0.55)", background: "rgba(0,0,0,0.42)", padding: "8px 9px", display: "flex", gap: 7 }}>
                    <span style={{ flexShrink: 0, fontFamily: "var(--ed-font-mono)", fontWeight: 700, fontSize: 9.5, color: "#fce9a8" }}>{p + 1}</span>
                    <span data-qa="pista" style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 600, fontSize: 11.5, lineHeight: 1.25, color: "#f6f1ff" }}>{c.pistas[p]}</span>
                  </div>
                );
              }
              // ⚠ La pista que todavía no toca se tiene que LEER. En gris flojo no se veía
              // y la autora lo marcó: sigue apagada respecto a la de arriba, pero legible.
              if (p > abiertas[activo] || verified) {
                return (
                  <div key={p} style={{ borderRadius: 9, border: "1.5px dashed rgba(252,233,168,0.5)", background: "rgba(0,0,0,0.3)", padding: "8px 9px", display: "flex", gap: 7, alignItems: "center" }}>
                    <span style={{ flexShrink: 0, fontFamily: "var(--ed-font-mono)", fontWeight: 700, fontSize: 9.5, color: "rgba(252,233,168,0.75)" }}>{p + 1}</span>
                    <span style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 11, lineHeight: 1.25, color: "rgba(252,233,168,0.75)" }}>Pista todavía tapada</span>
                  </div>
                );
              }
              // ⚠ El botón de destapar es la OTRA acción de la ronda: tiene que verse como
              // un botón, no como un renglón más. Ámbar sólido, letra oscura y un candado.
              return (
                <button key={p} data-qa="destapar" onClick={destapar}
                  style={{ borderRadius: 10, border: "2.5px solid #fce9a8", background: "linear-gradient(180deg,#ffd978,#e9a92a)", padding: "9px 10px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 3px 10px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.6)" }}>
                  <span style={{ flexShrink: 0, fontSize: 16, lineHeight: 1 }}>🔒</span>
                  <span style={{ flex: 1, minWidth: 0, fontFamily: "var(--ed-font-display)", fontWeight: 900, fontSize: 12.5, letterSpacing: "0.03em", color: "#3a2608", lineHeight: 1.15 }}>
                    DESTAPAR LA PISTA {p + 1}
                    <span style={{ display: "block", fontWeight: 700, fontSize: 9.5, letterSpacing: "0.02em", color: "#6b4a0c" }}>Pierdes la ⭐ extra</span>
                  </span>
                </button>
              );
            })}
            {abiertas[activo] === 1 && !verified && (
              <div style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 10, color: "rgba(252,233,168,0.9)", paddingLeft: 2 }}>Si aciertas con esta sola pista, ganas 2 ⭐.</div>
            )}
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 6, minHeight: 0, marginTop: 6 }}>
          {c.opciones.map((op) => {
            const mia = elegido[activo] === op;
            const esLa = op === c.a;
            let border = "rgba(242,194,96,0.5)", bg = "rgba(0,0,0,0.35)", col = "#f6f1ff";
            if (!verified && mia) { border = "#4fd8ff"; bg = "rgba(79,216,255,0.2)"; col = "#eaf9ff"; }
            if (verified && esLa) { border = "#2ecc8f"; bg = "linear-gradient(180deg, rgba(46,204,143,0.96), rgba(22,120,80,0.96))"; col = "#06381f"; }
            if (verified && mia && !esLa) { border = "#ff6b6b"; bg = "rgba(178,47,47,0.9)"; col = "#fff"; }
            return (
              <button key={op} data-qa="op" onClick={() => elegir(op)} disabled={verified || pasando}
                style={{ width: "100%", boxSizing: "border-box", borderRadius: 11, border: `2.5px solid ${border}`, background: bg, color: col, padding: "12px 12px", textAlign: "left", cursor: (verified || pasando) ? "default" : "pointer", fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 12.5, lineHeight: 1.2, display: "flex", alignItems: "center", gap: 8, boxShadow: (verified && esLa) ? "0 0 24px rgba(46,204,143,0.6)" : "none" }}>
                {verified && esLa && <span style={{ flexShrink: 0, fontFamily: "var(--ed-font-display)", fontWeight: 900, fontSize: 8.5, letterSpacing: "0.09em", background: "rgba(255,255,255,0.8)", color: "#06381f", borderRadius: 999, padding: "2px 6px" }}>ERA ESTA</span>}
                <span style={{ flex: 1, minWidth: 0 }}>{op}</span>
                {verified && mia && !esLa && <span style={{ flexShrink: 0, fontFamily: "var(--ed-font-display)", fontWeight: 900, fontSize: 8.5, letterSpacing: "0.09em", background: "rgba(0,0,0,0.35)", borderRadius: 999, padding: "2px 6px" }}>TU ELECCIÓN</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Arreglo de rondas del LIBRO 7 · TEMA 1 (3 manos: ordenar · repartir · destapar) ──
const L7T1_ROUNDS = [
  { C: L7T1R1Via, verify: true, bubble: (<>Arrastra cada tarjeta<br />hasta su lugar en la vía.</>) },
  // ⚠ Nada de "platillo": es la palabra del codigo, no la del chico, y la autora la
  // rechazo el 2026-11-23. El CÓMO dice que se lee abajo y se toca arriba.
  { C: L7T1R2Balanza, verify: true, bubble: (<>Lee el asunto y toca<br />quién se quedó con él.</>) },
  { C: L7T1R3Expediente, verify: true, bubble: (<>Lee la pista y elige.<br />Destapa solo si hace falta.</>) },
];

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║ LIBRO 7 · TEMA 2 · "Insurgencia, cambio social y velasquismo"              ║
// ║ Edad objetivo: 11 años (la fija la autora).                                ║
// ║ D.C.D. CS.3.1.45 · CS.3.1.46 · CS.3.1.47 · CS.3.1.48                       ║
// ║                                                                            ║
// ║ 3 rondas, 3 manos NUEVAS (ninguna se repite con el Tema 1, que gasto        ║
// ║ ordenar-arrastrando, repartir-en-destinos y destapar-pistas):              ║
// ║   R1 "El quintal se desploma" — DEFORMAR una curva arrastrando su nudo     ║
// ║   R2 "La imprenta sin respaldo" — PULSAR y FRENAR a tiempo                 ║
// ║   R3 "La pena del Grupo de Guayaquil" — TENDER un hilo de punto a punto    ║
// ║                                                                            ║
// ║ ⭐ 3 + 3 + 3 = **9 maximo**.                                                ║
// ║                                                                            ║
// ║ ⚠ DATOS: todo sale del Libro 7 Tema 2 (pp. 32-38) y su cuaderno (pp.       ║
// ║ 27-32), que la autora entrego el 2026-11-24. No se inventa nada.           ║
// ║                                                                            ║
// ║ ⚠ NINGUNA cifra historica inventada. En la R2 las marcas de la barra son   ║
// ║ un artefacto del juego, SIN numeros: el libro no da montos de emision, y   ║
// ║ poner "45 millones" seria inventarselo. Lo que si sale del libro es el     ║
// ║ hecho de cada tarjeta.                                                     ║
// ║                                                                            ║
// ║ ⚠ NINGUNA cara de persona real se dibuja. En la R3 lo ilustrado son las    ║
// ║ OBRAS; los autores van con su nombre y un icono.                           ║
// ╚════════════════════════════════════════════════════════════════════════════╝

// ══════════════════════════════════════════════════════════════════
// R1 · "El quintal se desploma" — DEFORMAR UNA CURVA (mano nueva).
// Sale un hecho con su año; el nudo de ese año se arrastra arriba o abajo y la linea se
// deforma pegada al dedo. La respuesta es CUANTO, no CUAL: no hay opciones que elegir.
// ⭐ +1 por nudo dentro de la tolerancia. Tres nudos por partida.
//
// ⚠ VARIEDAD: la autora pregunto como se garantiza (2026-11-24). Tres respuestas, y las
// tres estan aqui: (a) hay TRES curvas distintas, no solo la del cacao; (b) dentro de
// cada curva el banco trae hechos que SUBEN y hechos que BAJAN, asi que "arrastra abajo
// y aciertas" no funciona; (c) entran 3 de 6 hechos por partida. 3 curvas x 20
// combinaciones = 60 ejercicios, con FIFO para que no se repita el anterior.
//
// ⚠ La curva correcta NO se ve mientras se juega: aparece al verificar, en dorado
// punteado sobre la tuya. Ese es el lenguaje de la mecanica para revelar.
// ══════════════════════════════════════════════════════════════════
const J7T2_CURVAS = [
  {
    id: "cacao", e: "🫘",
    q: "¿Qué le pasó al cacao ecuatoriano?",
    eje: "PRECIO Y EXPORTACIÓN DEL CACAO",
    ini: { y: 1910, b: 2 },
    hechos: [
      { y: 1915, b: 3, e: "🚢", t: "El cacao sostiene la economía: es el gran producto de exportación del país." },
      { y: 1917, b: 2, e: "🍂", t: "La monilla y la escoba de bruja atacan gran parte de las plantaciones." },
      { y: 1920, b: 1, e: "📉", t: "Se devalúa el precio del quintal de cacao en Nueva York." },
      { y: 1922, b: 1, e: "🌍", t: "Brasil y Costa de Marfil aumentan su producción y venden más barato." },
      { y: 1929, b: 1, e: "🏦", t: "El mercado de valores de Wall Street se derrumba y Estados Unidos compra menos." },
      { y: 1930, b: 0, e: "⚓", t: "Se reducen notablemente el precio y el volumen de exportación del cacao." },
      { y: 1919, b: 3, e: "💰", t: "La burguesía comercial y la bancaria se benefician del auge del cacao." },
      { y: 1931, b: 0, e: "🏚️", t: "Quiebran instituciones bancarias y los negocios que giraban alrededor del cacao." },
    ],
  },
  {
    id: "sombrero", e: "👒",
    q: "¿Qué pasó con el sombrero de paja de la Sierra Sur?",
    eje: "PRODUCCIÓN DE SOMBREROS DE PAJA",
    ini: { y: 1918, b: 1 },
    hechos: [
      { y: 1922, b: 2, e: "📈", t: "En la Sierra Sur la producción de sombreros de paja experimenta un crecimiento." },
      { y: 1925, b: 3, e: "🧺", t: "La diversificación da productos para el consumo interno y trabajo a los campesinos." },
      { y: 1930, b: 1, e: "🌫️", t: "La crisis mundial golpea también a este sector de la economía." },
      { y: 1934, b: 0, e: "🪙", t: "La clase trabajadora percibe bajos salarios en todo el país." },
      { y: 1940, b: 2, e: "👒", t: "La producción de sombreros vuelve a crecer en los años cuarenta." },
      { y: 1945, b: 3, e: "🧶", t: "Los trabajadores campesinos pueden acceder a trabajo en varias actividades." },
      { y: 1928, b: 3, e: "🧵", t: "El crecimiento del sombrero de paja se mantiene durante los años veinte." },
      { y: 1936, b: 0, e: "📉", t: "La crisis de los años treinta afecta con fuerza a la clase trabajadora." },
    ],
  },
  {
    id: "bolsillo", e: "🪙",
    q: "¿Cuánto alcanzaba el sueldo de un trabajador?",
    eje: "LO QUE ALCANZA EL SUELDO",
    ini: { y: 1924, b: 2 },
    hechos: [
      { y: 1926, b: 3, e: "🏛️", t: "Se crea el Banco Central: será el único organismo que emita moneda en el país." },
      { y: 1928, b: 2, e: "🖨️", t: "Los bancos habían emitido dinero sin respaldo, sin reservas en oro que lo garanticen." },
      { y: 1930, b: 1, e: "💱", t: "Las devaluaciones de la moneda frente al dólar suben el costo de la vida." },
      { y: 1933, b: 0, e: "🏭", t: "La crisis afecta con fuerza a la clase trabajadora, que percibe bajos salarios." },
      { y: 1936, b: 0, e: "🩺", t: "A los bajos salarios se suma la carencia de seguridad social." },
      { y: 1938, b: 1, e: "📜", t: "El Código del Trabajo reconoce algunos derechos a los trabajadores." },
      { y: 1929, b: 2, e: "🏦", t: "El derrumbe de Wall Street reduce las exportaciones y el trabajo." },
      { y: 1940, b: 1, e: "⚖️", t: "La Ley de Control de Trabajo y Desocupación busca mejorar la situación obrera." },
    ],
  },
];

// ⚠ CUATRO ALTURAS CON NOMBRE, no una escala continua. La autora lo pidió el 2026-11-24
// jugándolo: *"aquí nunca vamos a tener una respuesta correcta porque nunca vamos a poner
// el nudo en el lugar exacto"*. Tenía razón: con una tolerancia de ±12 sobre 100 había
// que clavar el píxel, y un nudo que se veía bien salía ✗.
//
// Ella proponía solo ALTO/BAJO. Son cuatro y no dos porque con dos la curva pierde la
// forma —el auge y el desplome quedarían a la misma altura— y cada nudo sería una moneda
// al aire. Con cuatro, el gesto sigue siendo arrastrar y la curva sigue contando la
// historia, pero acertar depende de ENTENDER, no de la puntería: el nudo **se imanta** a
// la altura más cercana al soltarlo y los cuatro rieles se ven desde el principio.
const J7T2_BANDAS = ["MUY BAJO", "BAJO", "ALTO", "MUY ALTO"];
const J7T2_R1_CKEY = "edinun_j12_l7t2_r1c_v1";
// Geometria del grafico, en px del lienzo logico. X0 deja sitio a los rotulos de banda.
const J7T2_X0 = 72, J7T2_X1 = 450, J7T2_Y0 = 16, J7T2_Y1 = 262;
function j7t2Niv(b) { return 12.5 + b * 25; }                 // centro de la banda, 0-100
function j7t2Y(n) { return J7T2_Y1 - (n / 100) * (J7T2_Y1 - J7T2_Y0); }
function j7t2X(i, p) { return J7T2_X0 + (i * (J7T2_X1 - J7T2_X0)) / (p - 1); }
function j7t2Banda(n) { return Math.max(0, Math.min(3, Math.round((n - 12.5) / 25))); }

function j7t2R1Build() {
  // ⚠ Cap 2 = banco − 1 para UN item (la curva): nunca repite la de la partida anterior.
  const ci = j12PickIdx(J7T2_CURVAS, 1, J7T2_R1_CKEY);
  j12Commit(J7T2_R1_CKEY, ci, 2);
  const curva = J7T2_CURVAS[ci[0]];
  // ⚠ Cap 2 sobre un banco de 8, NO 4 sobre 6. Con 4 de 6 quedaban solo 2 libres, menos
  // que los 3 que entran: la partida siguiente sacaba el trío complementario entero y a
  // la tercera volvían los mismos. La autora lo vio: *"me salen las 3 mismas opciones ya
  // 2 veces"*. Lo que manda no es el cap, es cuántos quedan LIBRES: han de ser bastantes
  // más que K. Con 8 y cap 2 quedan 6 libres → 20 tríos por curva, 60 en total.
  const hk = "edinun_j12_l7t2_r1h_" + curva.id + "_v2";
  const hi = j12PickIdx(curva.hechos, 3, hk);
  j12Commit(hk, hi, 2);
  const juegan = curva.hechos.filter((_, i) => hi.indexOf(i) !== -1).slice().sort((a, b) => a.y - b.y);
  return { curva: curva, juegan: juegan };
}

function L7T2R1Curva({ onSolve, verifyRef }) {
  const [b] = useStateG(() => j7t2R1Build());
  const curva = b.curva, juegan = b.juegan;
  const P = juegan.length + 1;
  const [bandas, setBandas] = useStateG(() => juegan.map(() => null));
  const [arr, setArr] = useStateG(null);        // { i, n } mientras se arrastra (continuo)
  // ⚠ `foco` es el nudo que se está tocando (o el último tocado). Existe porque los nudos
  // YA COLOCADOS se pueden volver a mover: la tarjeta tiene que enseñar el hecho del año
  // que tienes en la mano, no el del turno.
  const [foco, setFoco] = useStateG(null);
  const [verified, setVerified] = useStateG(false);
  const cajaRef = useRefG(null);
  const di = useRefG(null);

  const puestos = bandas.filter((x) => x !== null).length;
  const activo = puestos < juegan.length ? puestos : -1;

  // Nivel que se DIBUJA para cada punto: el colocado, el que se esta arrastrando, o —si
  // todavia no se toco— el del punto anterior, para que el nudo se vea y se pueda agarrar.
  function nivelDe(i) {               // i = 0 es el punto de partida, fijo
    if (i === 0) return j7t2Niv(curva.ini.b);
    const k = i - 1;
    if (arr && arr.i === k) return arr.n;
    if (bandas[k] !== null) return j7t2Niv(bandas[k]);
    return nivelDe(i - 1);
  }

  function escala() {
    const r = cajaRef.current ? cajaRef.current.getBoundingClientRect() : null;
    return r && r.height ? r.height / (J7T2_Y1 + 26) : 1;
  }
  // ⚠ Se puede agarrar CUALQUIER nudo, esté colocado o no. Lo pidió la autora el
  // 2026-11-24 jugándolo: *"una vez que muevo los nudos me doy cuenta que me equivoqué,
  // debe dejarme mover, no así como se queda estático"*. Con eso, el BORRAR de esta ronda
  // sobra —lo quitó ella en la misma frase— porque rectificar es mover otra vez.
  function onDown(k, e) {
    if (verified) return;
    e.preventDefault();
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
    di.current = { k: k, y0: e.clientY, n0: nivelDe(k + 1), esc: escala() };
    setFoco(k);
    setArr({ i: k, n: di.current.n0 });
  }
  function onMove(e) {
    if (!di.current) return;
    const dy = (e.clientY - di.current.y0) / (di.current.esc || 1);
    const n = Math.max(2, Math.min(100, di.current.n0 - (dy / (J7T2_Y1 - J7T2_Y0)) * 100));
    setArr({ i: di.current.k, n: n });
  }
  function onUp() {
    if (!di.current) return;
    const n = arr ? arr.n : di.current.n0;
    const k = di.current.k;
    di.current = null;
    setArr(null);
    // ⚠ Soltar SIEMPRE coloca, aunque no se haya movido: "se quedó igual" es una
    // respuesta valida. Y el nudo se IMANTA a la altura mas cercana de las cuatro.
    setBandas((bs) => { const m = bs.slice(); m[k] = j7t2Banda(n); return m; });
    // ⚠ Al soltar se SUELTA TAMBIÉN EL FOCO: si no, la tarjeta se quedaba enseñando el
    //   hecho del año que acabas de colocar mientras el nudo encendido ya era el
    //   siguiente. Lo cazó la autora el 2026-11-24 ("una vez que arrastré el nudo, el
    //   texto del cuadro beige debe cambiarse porque vamos al siguiente nudo"). Mientras
    //   se arrastra, `foco` sigue mandando, así que volver a mover uno ya colocado sigue
    //   enseñando SU año.
    setFoco(null);
  }

  // ⚠ Esta ronda NO registra BORRAR: se rectifica moviendo el nudo otra vez, así que un
  // botón de deshacer sería un segundo camino para lo mismo.

  function verificar() {
    if (verified || puestos < juegan.length) return;
    setVerified(true);
    const aciertos = juegan.filter((h, k) => bandas[k] === h.b).length;
    onSolve(aciertos === juegan.length, {
      emoji: curva.e, a: curva.q,
      userAnswer: juegan.map((h, k) => `${h.y}: ${J7T2_BANDAS[bandas[k]]}`).join(" · "),
      correctAnswer: juegan.map((h) => `${h.y}: ${J7T2_BANDAS[h.b]}`).join(" · "),
    }, aciertos);
  }
  verifyRef.current = verificar;

  // El hecho que se enseña: el del nudo que tienes en la mano; si no hay ninguno, el del
  // año que todavía falta.
  const iCarta = foco !== null ? foco : activo;
  const actual = iCarta >= 0 ? juegan[iCarta] : null;
  const pts = [];
  for (let i = 0; i < P; i++) pts.push({ x: j7t2X(i, P), y: j7t2Y(nivelDe(i)) });
  const buenos = [{ x: j7t2X(0, P), y: j7t2Y(j7t2Niv(curva.ini.b)) }].concat(juegan.map((h, k) => ({ x: j7t2X(k + 1, P), y: j7t2Y(j7t2Niv(h.b)) })));
  const linea = (a) => a.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%", width: "100%", paddingTop: 30 }}>
      <div style={{ pointerEvents: "none", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 18, color: "#fff" }}>{curva.q}</span>
      </div>
      <div style={{ pointerEvents: "none", fontFamily: "var(--ed-font-mono)", fontWeight: 700, fontSize: 9.5, letterSpacing: "0.12em", color: "rgba(252,233,168,0.85)", marginTop: 2 }}>{curva.eje}</div>

      {/* ⚠ EL HECHO VA ARRIBA DEL GRAFICO, no debajo: lo pidió la autora el 2026-11-24
          (*"el texto que está en el recuadro beige debería estar encima de la gráfica"*).
          Se lee primero lo que pasó y después se mueve el nudo. El bloque tiene altura
          RESERVADA para que el grafico no salte cuando el revelado ocupa su sitio. */}
      <div style={{ width: "100%", minHeight: 78, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 5, flexShrink: 0 }}>
        {!verified && actual && (
          <div style={{ width: 448, boxSizing: "border-box", borderRadius: 14, border: "3px solid #d9c48a", background: "linear-gradient(180deg,#fffdf6,#f6ecd2)", color: "#3a2608", padding: "9px 12px", display: "flex", alignItems: "center", gap: 10, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7), 0 4px 10px rgba(0,0,0,0.28)" }}>
            <span style={{ flexShrink: 0, fontFamily: "var(--ed-font-mono)", fontWeight: 800, fontSize: 11, background: "rgba(0,0,0,0.1)", borderRadius: 999, padding: "2px 7px" }}>{actual.y}</span>
            <span style={{ flexShrink: 0, fontSize: 20, lineHeight: 1 }}>{actual.e}</span>
            <span data-qa="hecho" style={{ flex: 1, minWidth: 0, fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 12.5, lineHeight: 1.25 }}>{actual.t}</span>
          </div>
        )}
        {!verified && !actual && (
          <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 14, color: "#fce9a8", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>Ya moviste los {juegan.length} años.<br />Toca ¡VERIFICAR!</div>
        )}
        {verified && (
          <div style={{ width: 448, boxSizing: "border-box", borderRadius: 14, border: "3px solid #2ecc8f", background: "linear-gradient(180deg, rgba(46,204,143,0.96), rgba(22,120,80,0.96))", color: "#eafff4", padding: "6px 12px", boxShadow: "0 0 28px rgba(46,204,143,0.55)" }}>
            <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 900, fontSize: 11, letterSpacing: "0.1em", color: "#06381f", marginBottom: 2 }}>LA LÍNEA DORADA ES LA QUE PASÓ</div>
            {juegan.map((h, k) => (
              <div key={h.y} style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 1 }}>
                <span style={{ flexShrink: 0, fontSize: 11, lineHeight: 1.2 }}>{bandas[k] === h.b ? "✓" : "✗"}</span>
                <span style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 11, lineHeight: 1.2 }}>
                  <b>{h.y}</b> — {J7T2_BANDAS[h.b]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EL GRAFICO. El nudo del año activo sigue al dedo y se imanta al soltarlo. */}
      <div ref={cajaRef} style={{ position: "relative", width: J7T2_X1 + 8, height: J7T2_Y1 + 26, marginTop: 4, flexShrink: 0, touchAction: "none" }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${J7T2_X1 + 8} ${J7T2_Y1 + 26}`} style={{ display: "block", overflow: "visible" }}>
          <line x1={J7T2_X0 - 6} y1={J7T2_Y0} x2={J7T2_X0 - 6} y2={J7T2_Y1} stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
          <line x1={J7T2_X0 - 6} y1={J7T2_Y1} x2={J7T2_X1 + 6} y2={J7T2_Y1} stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
          {/* Los CUATRO RIELES, con su nombre: son las alturas a las que se imanta el nudo */}
          {J7T2_BANDAS.map((nom, bi) => (
            <g key={nom}>
              <line x1={J7T2_X0 - 6} y1={j7t2Y(j7t2Niv(bi))} x2={J7T2_X1 + 6} y2={j7t2Y(j7t2Niv(bi))} stroke="rgba(255,255,255,0.16)" strokeWidth="1.5" strokeDasharray="5 6" />
              <text x={J7T2_X0 - 12} y={j7t2Y(j7t2Niv(bi)) + 3.5} textAnchor="end" fill="rgba(255,255,255,0.6)" style={{ fontSize: 8.5, fontFamily: "var(--ed-font-mono)", fontWeight: 800, letterSpacing: "0.05em" }}>{nom}</text>
            </g>
          ))}
          {/* la curva correcta, solo al revelar: dorada y punteada SOBRE la tuya */}
          {verified && (<polyline points={linea(buenos)} fill="none" stroke="#f2c260" strokeWidth="3" strokeDasharray="7 5" strokeLinejoin="round" opacity="0.95" />)}
          <polyline points={linea(pts)} fill="none" stroke="#4fd8ff" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" />
          {pts.map((p, i) => {
            const k = i - 1;
            // ⚠ `k >= 0` es imprescindible: el punto de PARTIDA es i = 0, o sea k = -1, y
            // cuando ya están los tres colocados `activo` vale -1 — sin esta guarda se
            // encendía el punto fijo como si fuera el que hay que mover.
            const esActivo = !verified && k >= 0 && k === (foco !== null && arr ? foco : activo);
            const ok = verified && k >= 0 && bandas[k] === juegan[k].b;
            const col = i === 0 ? "#cfd6e4" : (verified ? (ok ? "#2ecc8f" : "#ff6b6b") : (esActivo ? "#ffe79a" : "#4fd8ff"));
            return (
              <g key={i}>
                {esActivo && (<circle cx={p.x} cy={p.y} r="17" fill="rgba(255,231,154,0.22)" />)}
                <circle cx={p.x} cy={p.y} r={esActivo ? 10 : 7} fill={col} stroke="rgba(0,0,0,0.45)" strokeWidth="1.5" />
                <text x={p.x} y={J7T2_Y1 + 17} textAnchor="middle" fill={esActivo ? "#ffe79a" : "rgba(255,255,255,0.65)"} style={{ fontSize: 10.5, fontFamily: "var(--ed-font-mono)", fontWeight: 800 }}>
                  {i === 0 ? curva.ini.y : juegan[k].y}
                </text>
              </g>
            );
          })}
        </svg>
        {/* zona de agarre del nudo activo: un cuadro invisible, generoso para un dedo */}
        {!verified && juegan.map((h, k) => (
          <div key={h.y} data-qa="nudo" onPointerDown={(e) => onDown(k, e)} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
            style={{ position: "absolute", left: j7t2X(k + 1, P) - 34, top: 0, width: 68, height: J7T2_Y1 + 4, cursor: "ns-resize", touchAction: "none" }} />
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// R2 · "La feria de juegos" — HACER EL GESTO con el que se juega (mano nueva).
// Aparece un juguete de los que nombra el libro y el chico hace con el dedo lo que haría
// con el de verdad: lanzar el trompo hacia abajo, tirar del hilo de la cometa hacia
// arriba, dar vueltas a la soga, estirar la liga de las pallas, mecer la muñeca de lado a
// lado o saltar la rayuela con dos toques. ⭐ +1 por juguete. Tres por partida.
//
// ⚠ SUSTITUYE a "La imprenta sin respaldo", que la autora descartó el 2026-11-24 jugándola:
// *"en esta ronda no entiendo nada de cómo se juega"*. El diagnóstico: pedía entender una
// idea abstracta —el respaldo en oro— ANTES de poder tocar nada, y eso no se arregla con
// dibujos. Esta ronda es lo contrario: se entiende sin leer, porque el gesto ES la
// respuesta.
//
// ⚠ NO hay menú de gestos a elegir. Ponerlo convertiría la ronda en una opción múltiple
// con seis botones, que es justo lo que no queremos. Si el trazo no se reconoce, no se
// pierde nada: se avisa y se vuelve a intentar.
//
// ⚠ El reconocedor es GENEROSO a propósito (25 px de trazo mínimo, 250° para dar por
// buena una vuelta, 90 px de margen en el vaivén): esto lo juega un niño de 11 con el
// dedo, no un ratón.
// ══════════════════════════════════════════════════════════════════
// ⚠ LOS GESTOS POSIBLES SE VEN. La autora lo pidió el 2026-11-24, jugándola: *"habíamos
// quedado que debería ser diferente porque si no, no se entiende qué movimientos se
// deberían realizar"*. Tenía razón y el problema era más hondo que el de la rayuela: el
// chico puede mover el dedo de mil maneras y solo cinco significan algo, así que estaba
// adivinando una convención nuestra.
//
// ⚠ Las tres tarjetas son UNA LEYENDA, no botones (`pointerEvents: none`): hay que HACER
// el movimiento. Si se pudieran tocar, la ronda sería una pregunta de tres botones y la
// mano dejaría de pintar nada.
//
// 📌 Se le dijo de frente el precio: con las tres a la vista la ronda se acerca a una
// opción múltiple. Lo eligió sabiéndolo, frente a cambiar de ronda —que además habría
// tirado las 5 ilustraciones de juguetes que acababa de generar.
const J7T2_FLECHAS = { abajo: "↓", arriba: "↑", circulo: "↻", atras: "←", vaiven: "↔" };
// ⚠ Cada tarjeta dice el NOMBRE y, debajo, QUÉ HACER con el dedo. Con solo el nombre, la
// autora no supo cómo se mecía la muñeca: *"el movimiento que se debe hacer con la muñeca
// no está nada claro"*. Y la flecha se MUEVE (Web Animations API, como el aterrizaje del
// arrastre): un dibujo del gesto vale más que la frase.
const J7T2_COMO = {
  abajo: "baja el dedo de golpe",
  arriba: "sube el dedo",
  circulo: "haz un círculo",
  atras: "lleva el dedo hacia atrás",
  vaiven: "mueve el dedo de un lado al otro",
};
const J7T2_NOMBRE = { abajo: "LANZAR", arriba: "TIRAR", circulo: "DAR VUELTAS", atras: "ESTIRAR", vaiven: "MECER" };
const J7T2_VAIVENES = {
  abajo: [{ transform: "translateY(-5px)" }, { transform: "translateY(5px)" }],
  arriba: [{ transform: "translateY(5px)" }, { transform: "translateY(-5px)" }],
  atras: [{ transform: "translateX(5px)" }, { transform: "translateX(-5px)" }],
  vaiven: [{ transform: "translateX(-5px)" }, { transform: "translateX(5px)" }, { transform: "translateX(-5px)" }],
  circulo: [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }],
};
function J7T2Flecha({ g }) {
  const ref = useRefG(null);
  useEffectG(() => {
    const el = ref.current;
    if (!el || !el.animate) return undefined;
    const a = el.animate(J7T2_VAIVENES[g], { duration: g === "circulo" ? 1600 : 900, iterations: Infinity, direction: g === "circulo" ? "normal" : "alternate", easing: "ease-in-out" });
    return () => { try { a.cancel(); } catch (e) {} };
  }, [g]);
  return (<span ref={ref} style={{ display: "inline-block", fontFamily: "var(--ed-font-mono)", fontWeight: 900, fontSize: 19, color: "#4fd8ff", lineHeight: 1 }}>{J7T2_FLECHAS[g]}</span>);
}
const J7T2_GESTOS = {
  abajo: "lanzar hacia abajo",
  arriba: "tirar hacia arriba",
  circulo: "dar vueltas",
  atras: "estirar hacia atrás",
  vaiven: "mecer de lado a lado",
};
const J7T2_JUEGOS = [
  { id: "trompo", img: "j7t2-trompo.jpg", e: "🪀", n: "EL TROMPO", g: "abajo",
    p: "El trompo es uno de los juegos tradicionales del Ecuador: se enrolla la piola y se lanza al suelo." },
  { id: "cometa", img: "j7t2-cometa.jpg", e: "🪁", n: "LA COMETA", g: "arriba",
    p: "La cometa se construía con tela y se elevaba tirando del hilo. Era otro juego tradicional." },
  { id: "soga", img: "j7t2-soga.jpg", e: "🪢", n: "LA SOGA", g: "circulo",
    p: "La soga se hacía girar sobre la cabeza y los pies. Niños y niñas jugaban a la soga." },
  { id: "pallas", img: "j7t2-pallas.jpg", e: "🎯", n: "LAS PALLAS", g: "atras",
    p: "Las pallas, o catas, eran ramas en forma de Y con un material elástico para lanzar piedras a larga distancia." },
  { id: "muneca", img: "j7t2-muneca.jpg", e: "🧸", n: "LA MUÑECA DE TRAPO", g: "vaiven",
    p: "La muñeca de trapo era el juguete favorito de las niñas; algunas tenían el rostro de porcelana." },
  // ⚠ LA RAYUELA SE QUEDÓ FUERA, aunque está en el libro. Lo cazó la autora jugándolo el
  // 2026-11-24: *"si juego rayuela, ¿cómo indico que se juega?"*. Los otros cinco gestos
  // salen solos —lanzar, tirar, dar vueltas, estirar, mecer—; saltar no se parece a nada
  // que se pueda hacer con el dedo, así que había que adivinar una convención nuestra, y
  // eso es justo lo que esta ronda no debe pedir. Mejor cinco juguetes honestos que seis
  // con uno arbitrario, aunque el banco baje de 20 tríos a 10.
];
const J7T2_R2_KEY = "edinun_j12_l7t2_r2_v2";
// ⚠ La zona ocupa TODO lo que sobra del carril (30+22+5+18+6+H+6+86 = 461 de 462): con
// 236 px quedaba un hueco muerto debajo, que es lo primero que marca la autora.
const J7T2_ZONA_W = 452, J7T2_ZONA_H = 280;

function j7t2R2Build() {
  // ⚠ DOS juguetes por partida, no tres: lo pidió la autora el 2026-11-24 (*"quiero que
  // sean solo 2 intentos no 3"*). Banco de 5 sobre 2 = 10 parejas; cap 2 deja 3 libres.
  const idx = j12PickIdx(J7T2_JUEGOS, 2, J7T2_R2_KEY);
  j12Commit(J7T2_R2_KEY, idx, 2);
  const claves = Object.keys(J7T2_GESTOS);
  const juegos = j12Shuffle(J7T2_JUEGOS.filter((_, i) => idx.indexOf(i) !== -1)).map((j) => {
    // El suyo más dos de los otros cuatro, barajados.
    const otros = j12Shuffle(claves.filter((g) => g !== j.g)).slice(0, 2);
    return Object.assign({}, j, { opciones: j12Shuffle([j.g].concat(otros)) });
  });
  return { juegos: juegos };
}

// Clasifica el trazo del dedo. Devuelve una clave de J7T2_GESTOS, "otro" si el trazo no
// se parece a ninguno, o null si casi no hubo movimiento.
function j7t2Clasifica(pts) {
  if (!pts || pts.length < 2) return null;
  let largo = 0;
  for (let i = 1; i < pts.length; i++) largo += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  if (largo < 25) return null;
  const dx = pts[pts.length - 1].x - pts[0].x, dy = pts[pts.length - 1].y - pts[0].y;
  // Vuelta: ángulo acumulado alrededor del centro del trazo.
  let cx = 0, cy = 0;
  pts.forEach((p) => { cx += p.x; cy += p.y; });
  cx /= pts.length; cy /= pts.length;
  let giro = 0, prev = null;
  for (let i = 0; i < pts.length; i++) {
    const a = Math.atan2(pts[i].y - cy, pts[i].x - cx);
    if (prev !== null) { let d = a - prev; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; giro += d; }
    prev = a;
  }
  if (Math.abs(giro) * 180 / Math.PI >= 250) return "circulo";
  // Vaivén: la mano cambia de sentido en horizontal al menos dos veces.
  let cambios = 0, signo = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = pts[i].x - pts[i - 1].x;
    if (Math.abs(d) < 5) continue;
    const s = d > 0 ? 1 : -1;
    if (signo && s !== signo) cambios++;
    signo = s;
  }
  if (cambios >= 2 && Math.abs(dy) < 90) return "vaiven";
  if (Math.abs(dy) > Math.abs(dx)) return dy > 0 ? "abajo" : "arriba";
  if (dx < 0) return "atras";
  return "otro";
}

function L7T2R2Feria({ onSolve, verifyRef, onClear, say }) {
  const [b] = useStateG(() => j7t2R2Build());
  const juegos = b.juegos;
  const [puestos, setPuestos] = useStateG([]);      // [{ id, g }]
  const [trazo, setTrazo] = useStateG(null);        // puntos mientras se dibuja
  const [aviso, setAviso] = useStateG(null);        // "no entendí el gesto"
  const [verified, setVerified] = useStateG(false);
  const zonaRef = useRefG(null);
  const di = useRefG(null);

  const i = puestos.length;
  const actual = i < juegos.length ? juegos[i] : null;

  function local(e) {
    const r = zonaRef.current.getBoundingClientRect();
    const esc = r.width / J7T2_ZONA_W;
    return { x: (e.clientX - r.left) / esc, y: (e.clientY - r.top) / esc };
  }
  function anota(g) {
    setPuestos((ps) => ps.concat([{ id: actual.id, g: g }]));
    setAviso(null);
  }
  function onDown(e) {
    if (verified || !actual) return;
    e.preventDefault();
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
    di.current = [local(e)];
    setTrazo(di.current.slice());
  }
  function onMove(e) {
    if (!di.current) return;
    di.current = di.current.concat([local(e)]);
    setTrazo(di.current.slice());
  }
  function onUp() {
    if (!di.current) return;
    const pts = di.current;
    di.current = null;
    setTrazo(null);
    const g = j7t2Clasifica(pts);
    // ⚠ Un toque suelto no anota nada: todos los gestos son trazos, así un roce
    // accidental no gasta un juguete.
    if (g === null) return;
    // ⚠ Y un movimiento que NO esté entre los tres de la leyenda tampoco: si se anotara,
    // el chico gastaría el juguete sin haber elegido nada de lo que se le ofrecía.
    if (g === "otro" || actual.opciones.indexOf(g) === -1) {
      setAviso("Ese no es ninguno de los tres. Mira los de abajo.");
      return;
    }
    anota(g);
  }

  useEffectG(() => {
    if (aviso === null) return undefined;
    const t = setTimeout(() => setAviso(null), 1800);
    return () => clearTimeout(t);
  }, [aviso]);

  function borrar() { if (!verified && puestos.length > 0) { setPuestos((ps) => ps.slice(0, -1)); setAviso(null); } }
  useEffectG(() => {
    if (!onClear) return undefined;
    onClear(verified ? null : { fn: borrar, puede: puestos.length > 0 });
    return () => onClear(null);
  }, [puestos.length, verified]);

  function verificar() {
    if (verified || puestos.length < juegos.length) return;
    setVerified(true);
    const aciertos = juegos.filter((j, k) => puestos[k].g === j.g).length;
    onSolve(aciertos === juegos.length, {
      emoji: "🪀", a: "Cómo se jugaba con los juguetes de los años treinta",
      userAnswer: juegos.map((j, k) => `${j.n}: ${J7T2_GESTOS[puestos[k].g] || "—"}`).join(" · "),
      correctAnswer: juegos.map((j) => `${j.n}: ${J7T2_GESTOS[j.g]}`).join(" · "),
    }, aciertos);
  }
  verifyRef.current = verificar;

  const muestra = actual || juegos[juegos.length - 1];
  const hecho = puestos.length > 0 ? puestos[puestos.length - 1] : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%", width: "100%", paddingTop: 30 }}>
      <div style={{ pointerEvents: "none", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 18, color: "#fff" }}>¿Cómo se jugaba con esto?</span>
      </div>
      <div style={{ marginTop: 5, flexShrink: 0 }}>
        <J12Puntos total={juegos.length} hechos={puestos.length} />
      </div>

      {/* LA ZONA DE JUEGO: el juguete y, encima, el rastro del dedo. */}
      <div ref={zonaRef} data-qa="zona"
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
        style={{ position: "relative", width: J7T2_ZONA_W, height: J7T2_ZONA_H, marginTop: 6, flexShrink: 0, borderRadius: 16, border: "3px solid rgba(242,194,96,0.45)", background: "linear-gradient(180deg, rgba(40,28,10,0.55), rgba(16,11,4,0.6))", touchAction: "none", cursor: verified ? "default" : "crosshair", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 7, pointerEvents: "none" }}>
          <J12Img src={muestra.img} e={muestra.e} ancho={140} alto={140} radius={14} />
          <span data-qa="juguete" style={{ fontFamily: "var(--ed-font-display)", fontWeight: 900, fontSize: 15, letterSpacing: "0.06em", color: "#fce9a8", textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}>{muestra.n}</span>
          <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
            {muestra.opciones.map((g) => (
              <div key={g} data-qa="opcion" data-g={g}
                style={{ width: 140, boxSizing: "border-box", borderRadius: 10, border: "2px solid rgba(255,255,255,0.3)", background: "rgba(8,14,34,0.72)", padding: "5px 7px", display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ flexShrink: 0, width: 22, textAlign: "center" }}><J7T2Flecha g={g} /></span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontFamily: "var(--ed-font-display)", fontWeight: 900, fontSize: 10.5, letterSpacing: "0.04em", lineHeight: 1.1, color: "#fce9a8" }}>{J7T2_NOMBRE[g]}</span>
                  <span style={{ display: "block", fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 9.5, lineHeight: 1.15, color: "rgba(255,255,255,0.85)" }}>{J7T2_COMO[g]}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
        {trazo && trazo.length > 1 && (
          <svg width="100%" height="100%" viewBox={`0 0 ${J7T2_ZONA_W} ${J7T2_ZONA_H}`} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <polyline points={trazo.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#4fd8ff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
          </svg>
        )}
      </div>

      {/* ACUSE / AVISO / REVELADO, con la altura reservada para que nada salte. */}
      <div style={{ width: "100%", minHeight: 86, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 6 }}>
        {!verified && aviso && (
          <div style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 800, fontSize: 13, color: "#ffd980", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>{aviso}</div>
        )}
        {!verified && !aviso && actual && (
          <div style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 12.5, color: "rgba(255,255,255,0.8)", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
            {hecho ? <>Con el anterior hiciste: <b style={{ color: "#fce9a8" }}>{J7T2_GESTOS[hecho.g]}</b>.<br /></> : null}
            {/* ⚠ Va en DOS PASOS NUMERADOS. Antes decía "dibuja el movimiento… las tarjetas
                solo te dicen cuáles valen: no se tocan" y la autora no sabía por dónde
                empezar (2026-11-24): *"debes decir primero ve las tarjetas y luego dibuja
                el movimiento"*. El orden tiene que estar escrito, no deducirse. */}
            <b style={{ color: "#fce9a8" }}>1.</b> Mira las tres tarjetas: son los movimientos que valen.<br />
            <b style={{ color: "#fce9a8" }}>2.</b> Dibuja uno con el dedo <b style={{ color: "#fce9a8" }}>encima del juguete</b>.
          </div>
        )}
        {!verified && !aviso && !actual && (
          <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 14, color: "#fce9a8", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>Ya jugaste con los {juegos.length}.<br />Toca ¡VERIFICAR!</div>
        )}
        {verified && (
          <div style={{ width: 448, boxSizing: "border-box", borderRadius: 14, border: "3px solid #2ecc8f", background: "linear-gradient(180deg, rgba(46,204,143,0.96), rgba(22,120,80,0.96))", color: "#eafff4", padding: "6px 12px", boxShadow: "0 0 28px rgba(46,204,143,0.55)" }}>
            <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 900, fontSize: 11, letterSpacing: "0.1em", color: "#06381f", marginBottom: 2 }}>ASÍ SE JUGABA</div>
            {juegos.map((j, k) => (
              <div key={j.id} style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 1 }}>
                <span style={{ flexShrink: 0, fontSize: 11, lineHeight: 1.2 }}>{puestos[k].g === j.g ? "✓" : "✗"}</span>
                <span style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 11, lineHeight: 1.2 }}><b>{j.n}</b> — {J7T2_GESTOS[j.g]}</span>
              </div>
            ))}
            {(() => {
              const f = juegos.find((j, k) => puestos[k].g !== j.g) || juegos[0];
              return (<div style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 10.5, lineHeight: 1.2, marginTop: 3, color: "#06381f" }}>{f.p}</div>);
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// R3 · "La peña del Grupo de Guayaquil" — TENDER UN HILO (mano nueva).
// Se arrastra desde el punto del autor hasta la obra y el hilo sigue al dedo. Tambien
// vale tocar autor y luego obra. ⭐ +1 por hilo bien tendido. Tres por partida.
//
// ⚠ NO se dibuja la cara de ningun autor: son personas reales (regla del repo). Lo
// ilustrado es la OBRA; el autor va con su nombre y un icono.
//
// ⚠ Un hilo nuevo desde el mismo autor REEMPLAZA al anterior, y colgar dos autores de la
// misma obra no se permite: el hilo viejo se suelta solo. Asi no hay estados imposibles.
// ══════════════════════════════════════════════════════════════════
const J7T2_OBRAS = [
  { id: "huasipungo", autor: "Jorge Icaza", ae: "✒️", obra: "Huasipungo", img: "j7t2-huasipungo.jpg", oe: "🏚️", p: "Mostró la explotación que vivía la población indígena en las haciendas de la Sierra." },
  { id: "pan", autor: "Enrique Gil Gilbert", ae: "🖋️", obra: "Nuestro Pan", img: "j7t2-nuestro-pan.jpg", oe: "🌾", p: "Del Grupo de Guayaquil, escritores de obras de corte social entre 1930 y 1940." },
  { id: "cruces", autor: "Joaquín Gallegos Lara", ae: "📘", obra: "Las cruces sobre el agua", img: "j7t2-cruces-agua.jpg", oe: "✝️", p: "Novela del Grupo de Guayaquil sobre la lucha de los trabajadores del puerto." },
  { id: "hoguera", autor: "Alfredo Pareja Diezcanseco", ae: "📗", obra: "La hoguera bárbara", img: "j7t2-hoguera.jpg", oe: "🔥", p: "Otro de los escritores del Grupo de Guayaquil." },
  { id: "sangurimas", autor: "José de la Cuadra", ae: "📙", obra: "Los Sangurimas", img: "j7t2-sangurimas.jpg", oe: "🛶", p: "Del Grupo de Guayaquil; su obra puso en escena al montuvio." },
  { id: "mitas", autor: "César Dávila Andrade", ae: "🕯️", obra: "Boletín y Elegía de las Mitas", img: "j7t2-mitas.jpg", oe: "⛏️", p: "Nacido en Cuenca en 1917; su poemario despertó un alto sentimiento nacional." },
  { id: "indio", autor: "Pío Jaramillo Alvarado", ae: "📕", obra: "El indio ecuatoriano", img: "j7t2-indio.jpg", oe: "🏔️", p: "Uno de los mayores representantes de la corriente indigenista." },
  { id: "plata", autor: "Fernando Chaves", ae: "📓", obra: "Plata y Bronce", img: "j7t2-plata-bronce.jpg", oe: "🔔", p: "Figura de la Sierra dentro de la narrativa social de la época." },
];
const J7T2_R3_KEY = "edinun_j12_l7t2_r3_v1";
// ⚠ FILA 92, no 102: con 102 la columna medía 336 px y al revelar el panel verde no
// cabía en lo que queda del carril y se montaba sobre las tarjetas de las obras. Lo cazó
// espacios-l7t2.js en los 5 viewports.
// 34 (padding) + 22 (enunciado) + 10 + 342 (filas) + 4 + 44 (revelado) = 456 de 462.
// ⚠ Las filas volvieron a 106 al quitarse el cartel verde del pie: sin él sobra sitio.
const J7T2_FILA = 106, J7T2_SEP = 12, J7T2_ANCHO = 470;
// ⚠ Un COLOR POR LÍNEA, no todas celestes: lo pidió la autora el 2026-11-24. Con tres
// hilos cruzados del mismo color no se sigue cuál sale de dónde. El color lo da el AUTOR
// (la fila de la izquierda), así que el hilo se lee desde su origen.
const J7T2_COLORES = ["#4fd8ff", "#ffb86b", "#b48aff"];
// ⚠ El pasillo de los hilos mide 66 px, no 44: al revelar conviven hasta SEIS hilos (el
// tuyo y el dorado de cada pareja) y en 44 px se trenzaban hasta no leerse.
const J7T2_XA = 160, J7T2_XB = 226;   // punto del autor / borde de la obra
function j7t2R3Build() {
  // ⚠ Cap 5, nunca 3 (= K). Banco de 8 sobre 3 = 56 trios distintos.
  const idx = j12PickIdx(J7T2_OBRAS, 3, J7T2_R3_KEY);
  j12Commit(J7T2_R3_KEY, idx, 5);
  const tres = J7T2_OBRAS.filter((_, i) => idx.indexOf(i) !== -1);
  const izq = j12Shuffle(tres);
  let der = j12Shuffle(tres), guard = 0;
  // Que la obra no quede enfrente de su autor: regalaria la respuesta por posicion.
  while (guard++ < 30 && der.some((o, k) => o.id === izq[k].id)) der = j12Shuffle(tres);
  return { izq: izq, der: der };
}

function L7T2R3Hilos({ onSolve, verifyRef, onClear }) {
  const [b] = useStateG(() => j7t2R3Build());
  const izq = b.izq, der = b.der;
  const [enlaces, setEnlaces] = useStateG(() => izq.map(() => null));   // indice de la obra
  const [sel, setSel] = useStateG(null);
  // ⚠ Se puede empezar por CUALQUIERA de los dos lados: tocar primero la obra y después
  //   el autor también une. Lo pidió la autora el 2026-11-24 ("si quiero unir tocando
  //   primero el huasipungo y luego Jorge Icaza se debe poder").
  const [selO, setSelO] = useStateG(null);     // la obra tocada primero
  const [drag, setDrag] = useStateG(null);     // { i, x, y }
  const [verified, setVerified] = useStateG(false);
  const cajaRef = useRefG(null);
  const di = useRefG(null);

  const alto = izq.length * J7T2_FILA + (izq.length - 1) * J7T2_SEP;
  const filaY = (k) => k * (J7T2_FILA + J7T2_SEP) + J7T2_FILA / 2;

  function unir(i, j) {
    setEnlaces((es) => {
      const n = es.slice();
      for (let k = 0; k < n.length; k++) if (n[k] === j) n[k] = null;   // una obra, un hilo
      n[i] = j;
      return n;
    });
    setSel(null);
    setSelO(null);
  }
  function local(e) {
    const r = cajaRef.current.getBoundingClientRect();
    const esc = r.width / J7T2_ANCHO;
    return { x: (e.clientX - r.left) / esc, y: (e.clientY - r.top) / esc };
  }
  function filaDe(y) {
    for (let k = 0; k < izq.length; k++) { const c = filaY(k); if (Math.abs(y - c) <= J7T2_FILA / 2 + J7T2_SEP / 2) return k; }
    return -1;
  }
  function onDown(i, e) {
    if (verified) return;
    e.preventDefault();
    // ⚠ Si ya había una OBRA tocada, este toque cierra la unión: no hace falta arrastrar
    //   ni empezar por el autor.
    if (selO !== null) { unir(i, selO); return; }
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
    const p = local(e);
    di.current = { i: i };
    setSel(i);
    setDrag({ i: i, x: p.x, y: p.y, movido: false });
  }
  function onMove(e) {
    if (!di.current) return;
    const p = local(e);
    setDrag({ i: di.current.i, x: p.x, y: p.y, movido: true });
  }
  function onUp(e) {
    if (!di.current) return;
    const i = di.current.i;
    const p = local(e);
    di.current = null;
    const movido = drag && drag.movido;
    setDrag(null);
    if (!movido) return;                       // fue un toque: queda seleccionado
    const k = p.x > J7T2_XB - 30 ? filaDe(p.y) : -1;
    if (k >= 0) unir(i, k); else setSel(null);
  }

  const hechos = enlaces.filter((x) => x !== null).length;
  // ⚠ Esta ronda NO lleva BORRAR: lo quitó la autora el 2026-11-24. No hace falta, porque
  //   un hilo nuevo desde el mismo autor reemplaza al anterior y una obra solo admite uno,
  //   así que todo se puede cambiar sin deshacer. `J12Game` solo pinta el botón si la
  //   ronda le registra algo con `onClear`, así que basta con no registrar nada.

  function verificar() {
    if (verified || hechos < izq.length) return;
    setVerified(true);
    const aciertos = izq.filter((a, i) => enlaces[i] !== null && der[enlaces[i]].id === a.id).length;
    onSolve(aciertos === izq.length, {
      emoji: "🧵", a: "De quién es cada obra de los años treinta",
      userAnswer: izq.map((a, i) => `${a.autor} → ${enlaces[i] === null ? "—" : der[enlaces[i]].obra}`).join(" · "),
      correctAnswer: izq.map((a) => `${a.autor} → ${a.obra}`).join(" · "),
    }, aciertos);
  }
  verifyRef.current = verificar;

  // ⚠ AL VERIFICAR, los hilos que se ven son LOS CORRECTOS, no los tuyos: son tres y no
  //   se trenzan, y enseñan de dónde a dónde iba cada obra. Lo que tú pusiste no
  //   desaparece — va escrito en la tarjeta de la obra que fallaste ("tú pusiste: …"),
  //   que es la regla del juego: revelar sin borrar lo que eligió el niño.
  //   Antes se veían los seis a la vez (los tuyos + los dorados) y era una maraña; luego
  //   solo los tuyos, y entonces no se entendía cuál era la buena. Las dos versiones las
  //   descartó la autora el 2026-11-24.
  const hilos = [];
  if (verified) {
    // PRIMERA PASADA · TUS hilos, al fondo: gruesos, verde si acertaste y rojo si no.
    izq.forEach((a, i) => {
      if (enlaces[i] === null) return;
      const ok = der[enlaces[i]].id === a.id;
      hilos.push({ i: i, j: enlaces[i], col: ok ? "#2ecc8f" : "#ff6b6b", ancho: 9, op: 0.85, dash: null });
    });
    // SEGUNDA PASADA · los hilos CORRECTOS, encima y más finos. Solo donde fallaste: si
    // acertaste, tu hilo verde ya es el bueno y dibujar el dorado encima lo taparía.
    // ⚠ Las dos pasadas van en este orden a propósito — lo pidió así la autora el
    //   2026-11-24: "mis líneas al fondo, verde o roja, y encima las correctas".
    izq.forEach((a, i) => {
      const j = der.findIndex((o) => o.id === a.id);
      if (enlaces[i] === j) return;
      hilos.push({ i: i, j: j, col: "#f2c260", ancho: 3.5, op: 1, dash: "7 5" });
    });
  } else {
    izq.forEach((a, i) => {
      if (enlaces[i] === null) return;
      hilos.push({ i: i, j: enlaces[i], col: J7T2_COLORES[i % J7T2_COLORES.length], ancho: 4, op: 0.95, dash: null });
    });
  }
  // ⚠ En el revelado se ven SOLO TUS HILOS: verde el acertado, rojo a rayas el fallado.
  //   Los hilos dorados con la respuesta buena se quitaron el 2026-11-24 a petición de la
  //   autora: con seis líneas cruzándose el revelado era una maraña y no se entendía nada
  //   ("eso que dice el hilo dorado es el que iba no me gusta"). Dónde iba cada obra se
  //   dice ahora EN TEXTO, una línea por error, debajo de las tarjetas.

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%", width: "100%", paddingTop: 34 }}>
      <div style={{ pointerEvents: "none", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 18, color: "#fff" }}>¿De quién es cada obra?</span>
      </div>

      <div ref={cajaRef} style={{ position: "relative", width: J7T2_ANCHO, height: alto, marginTop: 10, touchAction: "none" }}>
        {/* LOS HILOS, encima de todo pero sin robar el dedo */}
        <svg width="100%" height="100%" viewBox={`0 0 ${J7T2_ANCHO} ${alto}`} style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible", zIndex: 4 }}>
          {hilos.map((h, n) => (
            // El grosor y la opacidad los decide cada hilo: los tuyos van gruesos al
            // fondo y el dorado, fino y encima.
            <line key={n} x1={J7T2_XA} y1={filaY(h.i)} x2={J7T2_XB} y2={filaY(h.j)} stroke={h.col} strokeWidth={h.ancho} strokeLinecap="round" strokeDasharray={h.dash || undefined} opacity={h.op} />
          ))}
          {drag && drag.movido && (
            <line x1={J7T2_XA} y1={filaY(drag.i)} x2={drag.x} y2={drag.y} stroke={J7T2_COLORES[drag.i % J7T2_COLORES.length]} strokeWidth="4" strokeLinecap="round" opacity="0.95" />
          )}
          {izq.map((a, k) => (<circle key={a.id} cx={J7T2_XA} cy={filaY(k)} r={sel === k && !verified ? 7.5 : 6} fill={sel === k && !verified ? "#ffe79a" : J7T2_COLORES[k % J7T2_COLORES.length]} stroke="rgba(0,0,0,0.45)" strokeWidth="1.5" />))}
          {der.map((o, k) => (<circle key={o.id} cx={J7T2_XB} cy={filaY(k)} r={selO === k && !verified ? 7.5 : 5} fill={selO === k && !verified ? "#ffe79a" : "rgba(255,255,255,0.75)"} stroke="rgba(0,0,0,0.45)" strokeWidth="1.5" />))}
        </svg>

        {/* COLUMNA DE AUTORES — de aqui sale el hilo */}
        {izq.map((a, k) => (
          <div key={a.id} data-qa="autor" onPointerDown={(e) => onDown(k, e)} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
            style={{ position: "absolute", left: 0, top: k * (J7T2_FILA + J7T2_SEP), width: J7T2_XA - 10, height: J7T2_FILA, boxSizing: "border-box", borderRadius: 12, cursor: verified ? "default" : "grab", touchAction: "none", display: "flex", alignItems: "center", gap: 8, padding: "6px 9px", border: sel === k && !verified ? "3px solid #ffe79a" : "3px solid rgba(255,255,255,0.3)", background: "linear-gradient(180deg, rgba(14,22,48,0.92), rgba(8,14,34,0.92))", boxShadow: sel === k && !verified ? "0 0 18px rgba(255,231,154,0.5)" : "0 3px 8px rgba(0,0,0,0.3)" }}>
            {/* ⚠ Sin icono de libro delante del nombre (lo quitó la autora el 2026-11-24):
                eran cinco libros distintos que no significaban nada. Queda una barra del
                color de su hilo, que sí dice algo. */}
            <span style={{ flexShrink: 0, width: 5, alignSelf: "stretch", borderRadius: 999, background: J7T2_COLORES[k % J7T2_COLORES.length] }} />
            <span style={{ flex: 1, minWidth: 0, fontFamily: "var(--ed-font-ui)", fontWeight: 800, fontSize: 13, lineHeight: 1.2, color: "#fff" }}>{a.autor}</span>
          </div>
        ))}

        {/* COLUMNA DE OBRAS — aqui aterriza */}
        {der.map((o, k) => {
          const i = enlaces.indexOf(k);
          const ok = verified && i >= 0 && izq[i].id === o.id;
          const mal = verified && i >= 0 && izq[i].id !== o.id;
          return (
            <div key={o.id} data-qa="obra" onClick={() => { if (verified) return; if (sel !== null) { unir(sel, k); return; } setSelO(selO === k ? null : k); }}
              style={{ position: "absolute", left: J7T2_XB + 10, top: k * (J7T2_FILA + J7T2_SEP), width: J7T2_ANCHO - J7T2_XB - 10, height: J7T2_FILA, boxSizing: "border-box", borderRadius: 12, cursor: verified ? "default" : "pointer", display: "flex", alignItems: "center", gap: 9, padding: "6px 9px", border: `3px solid ${ok ? "#2ecc8f" : mal ? "#ff6b6b" : (selO === k && !verified ? "#ffe79a" : "rgba(242,194,96,0.45)")}`, background: "linear-gradient(180deg, rgba(40,28,10,0.92), rgba(22,15,5,0.92))", boxShadow: ok ? "0 0 18px rgba(46,204,143,0.5)" : (selO === k && !verified ? "0 0 18px rgba(255,231,154,0.5)" : "0 3px 8px rgba(0,0,0,0.3)") }}>
              <J12Img src={o.img} e={o.oe} ancho={96} alto={J7T2_FILA - 20} radius={11} />
              {/* ⚠ SIN el rótulo "TÚ PUSISTE: …": lo quitó la autora el 2026-11-24. Lo que
                  elegiste ya se ve —es tu hilo rojo, que sigue dibujado debajo del dorado—,
                  así que el rótulo repetía en texto lo que la línea ya dice. */}
              <span style={{ flex: 1, minWidth: 0, fontFamily: "var(--ed-font-ui)", fontWeight: 800, fontSize: 12.5, lineHeight: 1.2, color: "#fce9a8" }}>“{o.obra}”</span>
            </div>
          );
        })}
      </div>

      <div style={{ flex: 1, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center", width: "100%", marginTop: 4 }}>
        {!verified && (
          <div style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 12, color: "rgba(255,255,255,0.75)", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
            {hechos < izq.length ? (izq.length - hechos === 1 ? "Te falta unir 1." : `Te faltan ${izq.length - hechos} por unir.`) : `Ya uniste los ${izq.length}. Toca ¡VERIFICAR!`}
          </div>
        )}
        {/* ⚠ SIN cartel verde al pie: lo quitó la autora el 2026-11-24. La respuesta ya
            la dicen los hilos (los correctos) y el "TÚ PUSISTE" de cada obra fallada, así
            que el cartel repetía lo mismo en texto y se comía el espacio de abajo.
            Queda UNA línea suelta, sin recuadro, que explica qué es la línea dorada: sin
            ella, el color no significa nada para quien la ve por primera vez. */}
        {/* ⚠ Si están los tres bien, AQUÍ NO VA NADA. Antes salía siempre "la línea
            dorada lleva cada obra hasta su autor", y en una partida perfecta no hay
            ninguna línea dorada: el mensaje hablaba de algo que no estaba en pantalla.
            Lo cazó la autora el 2026-11-24. Ahora solo aparece lo que falta por saber:
            de quién era cada obra que se falló. */}
        {verified && (() => {
          const fallos = izq.filter((x, i) => !(enlaces[i] !== null && der[enlaces[i]].id === x.id));
          if (!fallos.length) return null;
          return (
            <div style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 12, lineHeight: 1.3, color: "rgba(255,255,255,0.85)", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.65)" }}>
              {fallos.map((x) => (
                <div key={x.id}>“{x.obra}” era de <b style={{ color: "#fce9a8" }}>{x.autor}</b>.</div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ── Arreglo de rondas del LIBRO 7 · TEMA 2 (3 manos: deformar · pulsar · tender) ──
const L7T2_ROUNDS = [
  { C: L7T2R1Curva, verify: true, bubble: (<>Arrastra cada nudo<br />hasta su altura.</>) },
  { C: L7T2R2Feria, verify: true, bubble: (<>Mira las tarjetas y<br />dibuja ese movimiento<br />encima del juguete.</>) },
  { C: L7T2R3Hilos, verify: true, lento: true, bubble: (<>Toca un autor<br />y luego su obra.</>) },
];


// ══════════════════════════════════════════════════════════════════
// ORQUESTADOR compartido por TODOS los temas — chrome EDINUN (HUD, personaje, acciones,
// overlay, modales). Recibe el arreglo de rondas del tema activo.
// ⭐ = +1 por ELEMENTO resuelto bien; `isCorrect` de la ronda = ronda perfecta. Fallar
// nunca resta.
// ══════════════════════════════════════════════════════════════════
function J12Game({ app, setApp, go, rounds }) {
  const char = CHARACTERS.find((c) => c.id === app.character) || CHARACTERS[0];
  const catLabel = app.currentCatLabel || CAT_LABEL;
  const ROUNDS = rounds || L6T1_ROUNDS;
  const TOTAL = ROUNDS.length;
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
  // Lo que la ronda quiera decir por el bocadillo (acuses del tipo "Elegiste Quito").
  // Si no dice nada, el bocadillo lleva el CÓMO fijo de la ronda.
  const [dice, setDice] = useStateG(null);
  // La ronda que tenga algo que borrar pasa aquí su función; si no, no hay botón.
  const [limpiar, setLimpiar] = useStateG(null);
  // Si la ronda pide esperar, ¡VERIFICAR! se apaga y el texto dice qué falta.
  const [falta, setFalta] = useStateG(null);
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
    // ⚠ El revelado dura MÁS SOLO EN LAS RONDAS QUE LO PIDEN, con  en su
    //   entrada del arreglo de rondas. Lo decidió así la autora el 2026-11-24: subirlo a
    //   todas alargaba partidas que ya estaban bien. Normal: 2 s acertando y 3,4 s
    //   fallando. Lenta: 4 s y 5,6 s.
    const lento = !!(ROUNDS[round] && ROUNDS[round].lento);
    const showFbAt = lento ? (isCorrect ? 1200 : 2600) : (isCorrect ? 900 : 2400);
    const advanceAt = showFbAt + (lento ? (isCorrect ? 2800 : 3000) : (isCorrect ? 1100 : 1000));
    // ⚠ En "¡UPS!" NUNCA se muestran estrellas, aunque la ronda haya dado algunas.
    setTimeout(() => { setFeedback(isCorrect ? "ok" : "err"); setFeedbackMsg(isCorrect ? `+${g} ⭐` : ANIMOS[round % ANIMOS.length]); }, showFbAt);
    setTimeout(() => {
      setFeedback(null); setFeedbackMsg("");
      // ⚠ Aquí, NO en un efecto con [round]: un efecto del padre corre después del efecto
      // del hijo y le borraba a la ronda recién montada su bocadillo y su botón BORRAR.
      setDice(null); setLimpiar(null); setFalta(null);
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
    setDice(null); setLimpiar(null); setFalta(null);
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

      <div style={{ position: "absolute", top: 52, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 8 }}>
        <span className="ed-label" style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>Ronda</span>
        {Array.from({ length: TOTAL }).map((_, i) => {
          const done = i < log.length, ok = done && log[i] && log[i].isCorrect;
          return <div key={i} style={{ width: 11, height: 11, borderRadius: "50%", background: done ? (ok ? "#fce9a8" : "#ff6b6b") : (i === round ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)"), boxShadow: done ? "0 0 8px currentColor" : "none", color: ok ? "#fce9a8" : "#ff6b6b" }} />;
        })}
      </div>

      <div style={{ position: "absolute", left: 8, bottom: 78, width: 220, pointerEvents: "none", textAlign: "center" }}>
        <div className="ed-float-soft" style={{ position: "absolute", left: 0, right: 0, bottom: "100%", display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative", display: "inline-block", maxWidth: 188, background: "linear-gradient(180deg, rgba(20,12,55,0.95), rgba(10,6,35,0.95))", border: "1.5px solid rgba(242,194,96,0.65)", borderRadius: 16, padding: "10px 14px", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 14, lineHeight: 1.3, color: "#fce9a8", textAlign: "center", whiteSpace: "pre-line", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}>
            {dice || ROUNDS[round].bubble}
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
        <Comp key={`r${round}-${rk}`} onSolve={onSolve} verifyRef={verifyRef} say={setDice} onClear={setLimpiar} listo={setFalta} />
      </div>

      <div style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 12, width: 150 }}>
        {ROUNDS[round].verify && !busy && (
          <button className="ed-btn" disabled={!!falta} onClick={() => { if (!falta && verifyRef.current) verifyRef.current(); }}
            style={{ fontSize: 15, padding: "0 10px", height: 56, fontWeight: 800, letterSpacing: "0.04em", background: "linear-gradient(180deg, #4fe08a, #1f9d57)", color: "#06381f", border: "none", opacity: falta ? 0.4 : 1, cursor: falta ? "default" : "pointer" }}>¡VERIFICAR!</button>
        )}
        <button className="ed-btn ed-btn-restart" onClick={() => setConfirmingRestart(true)} style={{ fontSize: 15, padding: "0 10px", height: 56, fontWeight: 800, letterSpacing: "0.04em" }}>REINICIAR</button>
        <button className="ed-btn ed-btn-ghost" onClick={() => setConfirmingExit(true)} style={{ fontSize: 15, padding: "0 10px", height: 56, fontWeight: 800, letterSpacing: "0.04em" }}>SALIR</button>
        {/* ⚠ BORRAR va AQUÍ, con los demás botones, no suelto bajo la mecánica: lo pidió
            la autora. Solo aparece cuando la ronda tiene algo que borrar. */}
        {limpiar && !busy && (
          <button className="ed-btn" onClick={() => limpiar.puede && limpiar.fn()} disabled={!limpiar.puede}
            style={{ fontSize: 13, padding: "0 10px", height: 40, fontWeight: 800, letterSpacing: "0.06em", background: "rgba(0,0,0,0.35)", color: "#fce9a8", border: "1.5px solid rgba(242,194,96,0.55)", opacity: limpiar.puede ? 1 : 0.35, cursor: limpiar.puede ? "pointer" : "default" }}>BORRAR</button>
        )}
      </div>

      {feedback && (
        <PortalToBody>
          <div style={{ position: "fixed", inset: 0, zIndex: 1000, pointerEvents: "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)", animation: "ed-pop-in 0.3s" }}>
            <div style={{ fontFamily: "'Fredoka','Baloo 2',system-ui,sans-serif", fontWeight: 700, fontSize: "clamp(56px, 11vmin, 120px)", color: feedback === "ok" ? "#2ecc8f" : "#ff6b6b", textShadow: "0 4px 0 rgba(0,0,0,0.45), 0 0 60px currentColor" }}>{feedback === "ok" ? "¡EXCELENTE!" : "¡UPS!"}</div>
            {feedbackMsg && (<div style={{ fontFamily: "'Fredoka','Baloo 2',system-ui,sans-serif", fontWeight: 700, fontSize: "clamp(18px, 2.6vmin, 30px)", color: feedback === "ok" ? "#fce9a8" : "#fff", background: "rgba(0,0,0,0.55)", padding: "8px 26px", borderRadius: 999, textShadow: "0 2px 6px rgba(0,0,0,0.6)", textAlign: "center" }}>{feedback === "err" && feedbackMsg.indexOf("⭐") === -1 ? `${feedbackMsg} — ${char.name}` : feedbackMsg}</div>)}
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
              <p className="ed-body" style={{ marginBottom: 16, fontSize: 14 }}>Vas a jugar las {TOTAL} rondas otra vez.</p>
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

// Despacho por TEMA. Los temas que faltan (el 3 del Libro 6 y los 3 ultimos del Libro 7)
// no
// están en el menú todavía, así que una categoría desconocida cae en el Tema 1 en vez de
// romperse.
// ══════════════════════════════════════════════════════════════════
// LIBRO 6 · TEMA 3 — "El preámbulo del siglo XX" (10 años)
// D.C.D. CS.3.1.37 · CS.3.1.38 · CS.3.1.39. Material: libro pp. 112-115 + cuaderno
// pp. 103-106, entregado por la autora el 2026-11-23.
//
// Tres verbos que NO existen en los otros temas del Libro 6 (allí se gastaron decidir
// sí/no, arrastrar a su sitio, ordenar, componer tocando, tocar en el mapa y rasgar):
//   R1 FROTAR para quitar la niebla · R2 GIRAR la ficha · R3 ESTAMPAR el sello.
//
// ⚠ Este tema NO toca el ferrocarril ni la lista de obras de Alfaro: eso es del
// Libro 7 · Tema 1. Aquí van las ideas liberales, los pensadores y la mujer.
// ══════════════════════════════════════════════════════════════════

// ── R1 · "Quitar la niebla" ─────────────────────────────────────────────────
// VERBO: frotar. La niebla se va por donde pasa el dedo y debajo aparece quien estaba
// "en el anonimato" (libro p. 115). Es una ronda de EXPLORAR: se descubre, no se acierta.
// Las frases son del libro; las ilustraciones las generó la autora (tipos de persona,
// NO personajes históricos: a Montalvo, Moncayo y Peralta no se les inventa el rostro).
// Las personas del tema. `voz: false` = de las que el libro dice que estaban "en el
// anonimato" y salieron a la luz con el liberalismo; `voz: true` = las que YA tenían voz
// y poder (élites latifundistas p. 104 · la Iglesia con la primacía educativa p. 112 ·
// la burguesía comercial y bancaria p. 115).
// ⚠ La SEÑORA de clase alta va entre las que NO tenían voz, aunque fuera rica: el libro
// dice que la mujer ecuatoriana "permanecía relegada al espacio doméstico" y el cuaderno
// (p. 104) lo repite para las señoras de clase media y alta. Ponerla como "ya tenía voz"
// sería enseñar algo falso. La autora la pidió como incorrecta; se le avisó del cambio.
const J6T3_GENTE = [
  { id: "maestra", voz: false, n: "Maestra", t: "El Estado abrió escuelas públicas y la enseñanza dejó de ser solo de la Iglesia." },
  { id: "alumna", voz: false, n: "Alumna", t: "Con las ideas liberales la mujer pudo entrar a la escuela." },
  { id: "costurera", voz: false, n: "Costurera", t: "Se crearon escuelas de prácticas y técnicas y colegios femeninos." },
  { id: "oficinista", voz: false, n: "Oficinista", t: "La mujer salió del espacio doméstico a los espacios públicos y laborales." },
  { id: "senora", voz: false, n: "Señora de ciudad", t: "Aun las señoras de clase alta vivían sujetas al papel de madre y esposa." },
  { id: "artesano", voz: false, n: "Artesano", t: "Los artesanos se unieron en asociaciones gremiales." },
  { id: "portuario", voz: false, n: "Trabajador del puerto", t: "Los trabajadores del puerto de Guayaquil fueron militantes alfaristas." },
  { id: "indigena", voz: false, n: "Hombre de la Sierra", t: "Los indígenas de la Sierra pusieron su esperanza en la revolución." },
  { id: "afro", voz: false, n: "Trabajador afroecuatoriano", t: "La cultura popular unió raíces andinas, españolas y afro." },
  { id: "hacendado", voz: true, n: "Hacendado", t: "Las élites latifundistas ya controlaban las ciudades y sus privilegios." },
  { id: "sacerdote", voz: true, n: "Sacerdote", t: "La Iglesia ya tenía la primacía en la educación y en los asuntos del país." },
  { id: "banquero", voz: true, n: "Banquero", t: "La burguesía bancaria de Guayaquil ya mandaba en el comercio y el dinero." },
];
const J6T3_COLS = 5, J6T3_FILAS = 7, J6T3_CELDAS = J6T3_COLS * J6T3_FILAS;

function L6T3R1Niebla({ onSolve, verifyRef, onClear, listo }) {
  // Cuatro personas por partida: DOS que no tenían voz y DOS que sí. Así hay algo que
  // elegir y la ronda se puede fallar (antes salían solo correctas y bastaba con
  // tocarlas todas; lo cazó la autora el 2026-11-23).
  // ⚠ Caps: para un subconjunto de K nunca cap = K. 2 de 9 → cap 4; 2 de 3 → cap 1.
  const [b] = useStateG(() => {
    const sin = J6T3_GENTE.filter((g) => !g.voz), con = J6T3_GENTE.filter((g) => g.voz);
    const iS = j12PickIdx(sin, 2, "edinun_j12_l6t3_r1s_v1"); j12Commit("edinun_j12_l6t3_r1s_v1", iS, 4);
    const iC = j12PickIdx(con, 2, "edinun_j12_l6t3_r1c_v1"); j12Commit("edinun_j12_l6t3_r1c_v1", iC, 1);
    // ⚠ Además de cambiar QUIÉNES salen, se evita repetir el MISMO ORDEN en pantalla:
    // la autora jugó dos veces seguidas y le aparecieron en los mismos sitios.
    const elegidas2 = iS.map((i) => sin[i]).concat(iC.map((i) => con[i]));
    const KEY = "edinun_j12_l6t3_r1pos_v1";
    let orden = j12Shuffle(elegidas2);
    try {
      const antes = localStorage.getItem(KEY);
      for (let k = 0; k < 8 && antes && orden.map((g) => g.id).join(",") === antes; k++) orden = j12Shuffle(elegidas2);
      localStorage.setItem(KEY, orden.map((g) => g.id).join(","));
    } catch (e) {}
    return { gente: orden };
  });
  const [frotado, setFrotado] = useStateG({});   // { id: [celdas marcadas] }
  const [elegidas, setElegidas] = useStateG([]);
  const [verified, setVerified] = useStateG(false);
  const limpia = (g) => (frotado[g.id] || []).length >= J6T3_CELDAS * 0.6;
  const descubiertas = b.gente.filter(limpia).length;
  const todas = descubiertas === b.gente.length;
  const correctas = b.gente.filter((g) => !g.voz).map((g) => g.id);

  // ⚠ Cada pasada limpia la celda que toca Y LAS DE ALREDEDOR (un bloque de 3×3): con
  // una sola celda había que repasar la foto muchas veces y se hacía lento (lo pidió la
  // autora). La rejilla sigue siendo fina para que el borrado se vea suave.
  function frotar(id, celda) {
    if (verified) return;
    const col = celda % J6T3_COLS, fila = Math.floor(celda / J6T3_COLS);
    const vecinas = [];
    for (let dc = -1; dc <= 1; dc++) for (let df = -1; df <= 1; df++) {
      const c = col + dc, f2 = fila + df;
      if (c >= 0 && c < J6T3_COLS && f2 >= 0 && f2 < J6T3_FILAS) vecinas.push(f2 * J6T3_COLS + c);
    }
    setFrotado((f) => {
      const ya = f[id] || [];
      const nuevas = vecinas.filter((k) => ya.indexOf(k) === -1);
      if (!nuevas.length) return f;
      const n = Object.assign({}, f);
      n[id] = ya.concat(nuevas);
      return n;
    });
  }
  function elegir(id) {
    if (verified) return;
    setElegidas((e) => (e.indexOf(id) >= 0 ? e.filter((x) => x !== id) : e.concat([id])));
  }
  function borrar() {
    if (verified) return;
    // Primero se deshace la última elección; si no hay ninguna, se vuelve a la niebla.
    if (elegidas.length) setElegidas((e) => e.slice(0, -1));
    else setFrotado({});
  }
  useEffectG(() => {
    if (!onClear) return undefined;
    onClear(verified ? null : { fn: borrar, puede: elegidas.length > 0 || Object.keys(frotado).length > 0 });
    return () => onClear(null);
  }, [verified, elegidas.length, Object.keys(frotado).length]);
  useEffectG(() => {
    if (!listo) return undefined;
    const falta = !todas ? "Descubre a las cuatro" : (elegidas.length !== 2 ? "Elige 2 (llevas " + elegidas.length + ")" : null);
    listo(verified ? null : falta);
    return () => listo(null);
  }, [verified, descubiertas, elegidas.length]);

  function verificar() {
    if (verified) return;
    setVerified(true);
    const aciertos = elegidas.filter((id) => correctas.indexOf(id) >= 0).length;
    const nombre = (id) => (J6T3_GENTE.find((g) => g.id === id) || {}).n;
    onSolve(aciertos === correctas.length && elegidas.length === correctas.length, {
      emoji: "🌫️", a: "Los que no tenían voz",
      userAnswer: elegidas.map(nombre).join(" · ") || "(ninguno)",
      correctAnswer: correctas.map(nombre).join(" · "),
    }, aciertos);
  }
  verifyRef.current = verificar;

  function figura(g) {
    const marcadas = frotado[g.id] || [];
    const vista = limpia(g) || verified;
    const elegida = elegidas.indexOf(g.id) >= 0;
    // ⚠ Mientras se juega solo se ve el NOMBRE: la frase explica si esa persona tenía voz
    // o no, así que enseñarla antes de ¡VERIFICAR! sería regalar la respuesta.
    const caso = !verified ? null : (elegida ? (g.voz ? "mal" : "bien") : (g.voz ? "ajena" : "falto"));
    let bd = vista ? "#f2c260" : "rgba(255,255,255,0.3)";
    if (!verified && elegida) bd = "#4fd8ff";
    if (verified) bd = caso === "bien" ? "#2ecc8f" : caso === "mal" ? "#ff6b6b" : caso === "falto" ? "#f2c260" : "rgba(242,194,96,0.4)";
    return (
      <div key={g.id} style={{ width: 210, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <div onClick={() => { if (vista) elegir(g.id); }}
          style={{
            position: "relative", flexShrink: 0, width: 120, height: 160, borderRadius: 10, overflow: "hidden",
            border: `${caso === "falto" ? 4 : 2.5}px solid ${bd}`, background: "#0d2a20", touchAction: "none",
            cursor: vista && !verified ? "pointer" : "default",
            boxShadow: elegida && !verified ? "0 0 0 3px rgba(79,216,255,0.35)" : caso === "falto" ? "0 0 0 3px rgba(242,194,96,0.35)" : "none",
            opacity: caso === "ajena" ? 0.72 : 1,
          }}>
          <img src={`assets/j6t3-${g.id}.jpg`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }} />
          {/* La niebla: una rejilla de celdas que se van borrando donde pasa el dedo. */}
          {!vista && Array.from({ length: J6T3_CELDAS }).map((_, k) => (
            <div key={k}
              // ⚠ Basta con PASAR POR ENCIMA: nada de apretar primero. Lo pidió la
              // autora, y en una tableta el dedo arrastrando dispara los mismos eventos.
              onPointerDown={(e) => { try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (x) {} frotar(g.id, k); }}
              onPointerMove={() => frotar(g.id, k)}
              onPointerEnter={() => frotar(g.id, k)}
              style={{
                position: "absolute", left: `${(k % J6T3_COLS) * (100 / J6T3_COLS)}%`, top: `${Math.floor(k / J6T3_COLS) * (100 / J6T3_FILAS)}%`,
                width: `${100 / J6T3_COLS}%`, height: `${100 / J6T3_FILAS}%`,
                background: marcadas.indexOf(k) >= 0 ? "transparent" : "rgba(214,228,226,0.97)",
                boxShadow: marcadas.indexOf(k) >= 0 ? "none" : "inset 0 0 10px rgba(255,255,255,0.8)",
                transition: "background 0.18s", cursor: "pointer",
              }} />
          ))}
          {/* La marca de elegido, mientras se juega */}
          {elegida && !verified && (
            <div style={{ position: "absolute", top: 4, right: 4, width: 22, height: 22, borderRadius: "50%", background: "#4fd8ff", color: "#05303c", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 13, boxShadow: "0 2px 6px rgba(0,0,0,0.4)" }}>✓</div>
          )}
          {verified && (caso === "bien" || caso === "mal") && (
            <div style={{ position: "absolute", top: 4, right: 4, width: 22, height: 22, borderRadius: "50%", background: caso === "bien" ? "#1f8a54" : "#c0392b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 13, boxShadow: "0 2px 6px rgba(0,0,0,0.4)" }}>{caso === "bien" ? "✓" : "✗"}</div>
          )}
          {verified && (
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, background: "rgba(8,22,18,0.82)", padding: "4px 6px" }}>
              <span style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 9, lineHeight: 1.2, color: caso === "ajena" ? "rgba(255,255,255,0.7)" : "#fff", display: "block", textAlign: "center" }}>{g.t}</span>
            </div>
          )}
          {!vista && !Object.keys(frotado).length && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
              <span style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 800, fontSize: 9.5, color: "#44605c", textAlign: "center", lineHeight: 1.2 }}>pasa el dedo<br />por encima</span>
            </div>
          )}
        </div>
        {/* Debajo solo el NOMBRE: la explicación aparece sobre la foto al verificar. */}
        <div style={{ minHeight: 18, width: "100%", textAlign: "center" }}>
          {vista && (
            <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 11, color: caso === "falto" ? "#f2c260" : "#fce9a8" }}>
              {caso === "falto" ? "TE FALTÓ: " + g.n : g.n}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, height: "100%", width: "100%", paddingBottom: 10, userSelect: "none", WebkitUserSelect: "none" }}>
      <div style={{ pointerEvents: "none", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)", flexShrink: 0 }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 19, color: "#fff" }}>¿Quiénes no tenían voz antes del liberalismo?</span>
        <div style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 11.5, color: "rgba(255,255,255,0.8)", marginTop: 1 }}>Son dos.</div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 16px", width: 440, justifyContent: "center", flexShrink: 0 }}>
        {b.gente.map(figura)}
      </div>
    </div>
  );
}

// ── R2 · "Tres plumas" ──────────────────────────────────────────────────────
// VERBO: girar. Seis fichas boca abajo; al tocarlas giran y enseñan un hecho. El niño
// DEJA destapadas las tres que hicieron los pensadores liberales y vuelve a tapar las
// otras. Los tres distractores también son del libro (Rocafuerte, García Moreno y
// Alfaro), así que se aprende quién hizo qué, no se descarta por descarte.
// ⚠ DOS hechos por persona, todos del libro (pp. 113-115 y cuaderno p. 105). Cada
// partida saca UNO de cada persona, así que las seis fichas nunca son las mismas: 2^6 =
// 64 combinaciones. Antes el banco era de seis fichas fijas y solo cambiaba el orden; lo
// cazó la autora el 2026-11-23 ("verifica si en cada ronda hay variedad").
// ⚠ Ojo con "el Viejo Luchador": en el libro es como llaman a ALFARO, y lo que dice es
// que Peralta se ganó SU admiración. No es un apodo de Peralta.
const J6T3_FICHAS = [
  { id: "mon1", ok: true, q: "Juan Montalvo", h: "Luchó con su periodismo contra los gobiernos despóticos." },
  { id: "mon2", ok: true, q: "Juan Montalvo", h: "Escribió El Cosmopolita y Las Catilinarias." },
  { id: "mcy1", ok: true, q: "Abelardo Moncayo", h: "Denunció la injusticia del concertaje con los indígenas." },
  { id: "mcy2", ok: true, q: "Abelardo Moncayo", h: "Aportó a la construcción del Estado laico." },
  { id: "per1", ok: true, q: "José Peralta", h: "Pensó la Carta Constitucional de 1896." },
  { id: "per2", ok: true, q: "José Peralta", h: "Defendió las posturas liberales en sus ensayos." },
  { id: "roc1", ok: false, q: "Vicente Rocafuerte", h: "Creó la Dirección General de Estudios." },
  { id: "roc2", ok: false, q: "Vicente Rocafuerte", h: "Dictó la primera Ley de Hacienda." },
  { id: "gar1", ok: false, q: "García Moreno", h: "Impulsó la educación, pero con visión religiosa." },
  { id: "gar2", ok: false, q: "García Moreno", h: "Construyó la Escuela Politécnica Nacional." },
  { id: "alf1", ok: false, q: "Eloy Alfaro", h: "Concluyó el ferrocarril que unía la Sierra con la Costa." },
  { id: "alf2", ok: false, q: "Eloy Alfaro", h: "Creó el Registro Civil." },
];
const J6T3_QUIENES = ["Juan Montalvo", "Abelardo Moncayo", "José Peralta", "Vicente Rocafuerte", "García Moreno", "Eloy Alfaro"];

function L6T3R2Plumas({ onSolve, verifyRef, onClear, listo }) {
  // Una ficha por persona: tres de los pensadores y tres de los otros.
  const [b] = useStateG(() => ({
    fichas: j12Shuffle(J6T3_QUIENES.map((q) => j12Shuffle(J6T3_FICHAS.filter((f) => f.q === q))[0])),
  }));
  const [giradas, setGiradas] = useStateG([]);
  const [verified, setVerified] = useStateG(false);
  const refs = useRefG({});

  function girar(id) {
    if (verified) return;
    const el = refs.current[id];
    // El giro va con element.animate(): una transición CSS no arranca, porque React
    // pinta el estado nuevo antes del primer frame (ya pasó en la R3 del Tema 1).
    if (el && el.animate) {
      try { el.animate([{ transform: "rotateY(0deg)" }, { transform: "rotateY(90deg)" }, { transform: "rotateY(0deg)" }], { duration: 260, easing: "ease-in-out" }); } catch (x) {}
    }
    setGiradas((g) => (g.indexOf(id) >= 0 ? g.filter((x) => x !== id) : g.concat([id])));
  }
  function borrar() {
    if (verified || !giradas.length) return;
    setGiradas((g) => g.slice(0, -1));
  }
  useEffectG(() => {
    if (!onClear) return undefined;
    onClear(verified ? null : { fn: borrar, puede: giradas.length > 0 });
    return () => onClear(null);
  }, [verified, giradas.length]);
  // ⚠ Nada de verificar con una o dos: la ronda pide TRES (lo pidió la autora).
  useEffectG(() => {
    if (!listo) return undefined;
    listo(verified || giradas.length === 3 ? null : "Deja 3 fichas destapadas (llevas " + giradas.length + ")");
    return () => listo(null);
  }, [verified, giradas.length]);

  const buenas = b.fichas.filter((f) => f.ok).map((f) => f.id);
  function verificar() {
    if (verified) return;
    setVerified(true);
    const aciertos = giradas.filter((id) => buenas.indexOf(id) >= 0).length;
    const nombre = (id) => (b.fichas.find((f) => f.id === id) || {}).q;
    onSolve(aciertos === buenas.length && giradas.length === buenas.length, {
      emoji: "✒️", a: "Los pensadores liberales",
      userAnswer: giradas.map(nombre).join(" · ") || "(ninguna)",
      correctAnswer: buenas.map(nombre).join(" · "),
    }, aciertos);
  }
  verifyRef.current = verificar;

  function ficha(f) {
    const abierta = giradas.indexOf(f.id) >= 0;
    // ⚠ Al VERIFICAR se abren TODAS: una ficha boca abajo no cuenta qué escondía, y el
    // niño se quedaba sin saber qué se perdió. "Bien tapada: no era de ellos" tampoco se
    // entendía sin ver el hecho (lo marcó la autora). Cuatro casos, cada uno con su
    // color y su rótulo:
    //   destapada y suya  → verde, ✓ y el nombre
    //   destapada y ajena → roja, ✗ y el nombre
    //   tapada y SUYA     → ÁMBAR, "ESTA TE FALTÓ" bien grande: es el error que enseña
    //   tapada y ajena    → apagada, "No era de ellos" (hizo bien en no tocarla)
    const caso = !verified ? "jugando" : (abierta ? (f.ok ? "bien" : "mal") : (f.ok ? "falto" : "ajena"));
    const COL = { bien: "#2ecc8f", mal: "#ff6b6b", falto: "#f2c260", ajena: "rgba(242,194,96,0.45)" };
    const bd = !verified ? (abierta ? "#4fd8ff" : "rgba(242,194,96,0.5)") : COL[caso];
    const papel = !verified ? abierta : true;
    const fondo = caso === "falto" ? "rgba(255,236,187,0.96)" : caso === "ajena" ? "rgba(236,233,224,0.72)" : "rgba(255,253,246,0.94)";
    return (
      <button key={f.id} className="ed-btn-plain" onClick={() => girar(f.id)}
        ref={(el) => { refs.current[f.id] = el; }}
        style={{
          width: 138, height: 172, borderRadius: 12,
          border: `${caso === "falto" ? 4 : 2.5}px solid ${bd}`,
          background: papel ? fondo : "linear-gradient(180deg, rgba(20,12,55,0.92), rgba(10,6,35,0.92))",
          padding: "6px 8px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3,
          cursor: verified ? "default" : "pointer",
          boxShadow: caso === "falto" ? "0 0 0 3px rgba(242,194,96,0.35), 0 3px 10px rgba(0,0,0,0.3)" : "0 3px 10px rgba(0,0,0,0.3)",
          opacity: caso === "ajena" ? 0.75 : 1,
        }}>
        {!papel && (<>
          <span style={{ fontSize: 20, lineHeight: 1 }}>✒️</span>
          <span style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 800, fontSize: 9, color: "rgba(255,255,255,0.6)" }}>toca para girar</span>
        </>)}
        {caso === "falto" && (
          <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 900, fontSize: 10, letterSpacing: "0.06em", color: "#8a6410", background: "rgba(242,194,96,0.55)", borderRadius: 999, padding: "1px 8px" }}>ESTA TE FALTÓ</span>
        )}
        {papel && (
          <span style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: caso === "falto" ? 11 : 12, lineHeight: 1.22, color: "#3a2608", textAlign: "center" }}>{f.h}</span>
        )}
        {verified && (
          <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 9.5, textAlign: "center", color: caso === "bien" ? "#1f8a54" : caso === "mal" ? "#c0392b" : caso === "falto" ? "#8a6410" : "#6b6356" }}>
            {caso === "bien" && "✓ " + f.q}
            {caso === "mal" && "✗ " + f.q}
            {caso === "falto" && "era de " + f.q}
            {caso === "ajena" && f.q}
          </span>
        )}
      </button>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, height: "100%", width: "100%", paddingBottom: 10 }}>
      <div style={{ pointerEvents: "none", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)", flexShrink: 0 }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 19, color: "#fff" }}>¿Qué hicieron Montalvo, Moncayo y Peralta?</span>
        <div style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 11.5, color: "rgba(255,255,255,0.8)", marginTop: 1 }}>Solo tres fichas son de ellos.</div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, width: 440, justifyContent: "center", flexShrink: 0 }}>
        {b.fichas.map(ficha)}
      </div>
    </div>
  );
}

// ── R3 · "El sello de Montalvo" ─────────────────────────────────────────────
// VERBO: estampar. Las frases son TEXTUALES del fragmento de "El Cosmopolita" que trae
// el cuaderno (p. 106). Se sella a quien Montalvo dice que NO pertenece al pueblo.
// ⚠ SIETE frases, todas del mismo fragmento del cuaderno (p. 106): cuatro de los que
// Montalvo deja fuera y tres del pueblo. Cada partida enseña 3 + 2, así que la Carta de
// respuestas cambia. Con cinco fijas, el ejercicio era idéntico en cada recarga.
const J6T3_MONTALVO = [
  { id: "tirano", fuera: true, t: "El tirano que se alza con la libertad de sus semejantes." },
  { id: "opulento", fuera: true, t: "El opulento que nada en oro y cierra la mano a la caridad." },
  { id: "soberbio", fuera: true, t: "El soberbio que anda el cuello erguido." },
  { id: "oprime", fuera: true, t: "El que oprime, el que maltrata, el que desdeña a sus hermanos." },
  { id: "sudor", fuera: false, t: "Tú que vives del sudor de tu frente: tú eres pueblo." },
  { id: "forja", fuera: false, t: "Tú que forjas los metales y construyes casas: tú eres pueblo." },
  { id: "tierra", fuera: false, t: "Tú que arrancas a la tierra los frutos para la vida: tú eres pueblo." },
];

function L6T3R3Sello({ onSolve, verifyRef, onClear, listo }) {
  // 3 de las 4 que quedan fuera + 2 de las 3 del pueblo. Cap 2 y cap 1: para un
  // subconjunto de K nunca se usa cap = K (saldría una rotación previsible).
  const [b] = useStateG(() => {
    const malas = J6T3_MONTALVO.filter((f) => f.fuera), buenas2 = J6T3_MONTALVO.filter((f) => !f.fuera);
    const iM = j12PickIdx(malas, 3, "edinun_j12_l6t3_r3m_v1"); j12Commit("edinun_j12_l6t3_r3m_v1", iM, 2);
    const iB = j12PickIdx(buenas2, 2, "edinun_j12_l6t3_r3b_v1"); j12Commit("edinun_j12_l6t3_r3b_v1", iB, 1);
    return { frases: j12Shuffle(iM.map((i) => malas[i]).concat(iB.map((i) => buenas2[i]))) };
  });
  const [sellados, setSellados] = useStateG([]);
  const [verified, setVerified] = useStateG(false);
  const refs = useRefG({});

  function sellar(id) {
    if (verified) return;
    const el = refs.current[id];
    if (el && el.animate) {
      try { el.animate([{ transform: "scale(1)" }, { transform: "scale(0.97)" }, { transform: "scale(1)" }], { duration: 180, easing: "ease-out" }); } catch (x) {}
    }
    setSellados((s) => (s.indexOf(id) >= 0 ? s.filter((x) => x !== id) : s.concat([id])));
  }
  function borrar() {
    if (verified || !sellados.length) return;
    setSellados((s) => s.slice(0, -1));
  }
  useEffectG(() => {
    if (!onClear) return undefined;
    onClear(verified ? null : { fn: borrar, puede: sellados.length > 0 });
    return () => onClear(null);
  }, [verified, sellados.length]);
  useEffectG(() => {
    if (!listo) return undefined;
    listo(verified || sellados.length === 3 ? null : "Sella 3 frases (llevas " + sellados.length + ")");
    return () => listo(null);
  }, [verified, sellados.length]);

  const fuera = b.frases.filter((f) => f.fuera).map((f) => f.id);
  function verificar() {
    if (verified) return;
    setVerified(true);
    const aciertos = sellados.filter((id) => fuera.indexOf(id) >= 0).length;
    const texto = (id) => (J6T3_MONTALVO.find((f) => f.id === id) || {}).t;   // banco entero: el reporte puede citar una que no salió
    onSolve(aciertos === fuera.length && sellados.length === fuera.length, {
      emoji: "🖋️", a: "Quién no pertenece al pueblo, según Montalvo",
      userAnswer: sellados.map(texto).join(" · ") || "(ninguna)",
      correctAnswer: fuera.map(texto).join(" · "),
    }, aciertos);
  }
  verifyRef.current = verificar;

  function frase(f) {
    const marcada = sellados.indexOf(f.id) >= 0;
    // ⚠ Al revelar hay que ver CUÁLES ERAN las correctas, no solo si acertaste: una
    // frase que había que sellar y se quedó sin sello sale en ÁMBAR con "ERA ESTA".
    // Antes llevaba una ✗ a secas y la autora no veía cuáles eran las buenas.
    const caso = !verified ? null : (marcada ? (f.fuera ? "bien" : "mal") : (f.fuera ? "falto" : "ajena"));
    let bd = marcada ? "#c0392b" : "rgba(120,94,48,0.5)";
    if (verified) bd = caso === "bien" ? "#2ecc8f" : caso === "mal" ? "#ff6b6b" : caso === "falto" ? "#f2c260" : "rgba(120,94,48,0.4)";
    return (
      <div key={f.id} data-qa="frase" ref={(el) => { refs.current[f.id] = el; }} onClick={() => sellar(f.id)}
        style={{
          position: "relative", width: "100%", boxSizing: "border-box", minHeight: 56, display: "flex", alignItems: "center", gap: 8,
          borderRadius: 8, border: `${caso === "falto" ? 3 : 2}px solid ${bd}`,
          background: caso === "falto" ? "rgba(255,236,187,0.96)" : "rgba(255,253,246,0.93)",
          boxShadow: caso === "falto" ? "0 0 0 3px rgba(242,194,96,0.3)" : "none",
          padding: "6px 10px", cursor: verified ? "default" : "pointer", userSelect: "none", WebkitUserSelect: "none",
          opacity: caso === "ajena" ? 0.8 : 1,
        }}>
        <span style={{ flexShrink: 0, fontSize: 11, color: "#8a6410" }}>▸</span>
        <span style={{ flex: 1, minWidth: 0, fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 13, lineHeight: 1.25, color: "#3a2608" }}>{f.t}</span>
        {marcada && (
          <span style={{ flexShrink: 0, transform: "rotate(-8deg)", border: "2.5px solid rgba(192,57,43,0.85)", borderRadius: 6, padding: "2px 7px", fontFamily: "var(--ed-font-display)", fontWeight: 900, fontSize: 9, letterSpacing: "0.06em", color: "rgba(192,57,43,0.9)", background: "rgba(192,57,43,0.08)" }}>NO ES PUEBLO</span>
        )}
        {caso === "falto" && (
          <span style={{ flexShrink: 0, borderRadius: 999, padding: "2px 9px", background: "rgba(242,194,96,0.55)", fontFamily: "var(--ed-font-display)", fontWeight: 900, fontSize: 9, letterSpacing: "0.06em", color: "#8a6410" }}>ERA ESTA</span>
        )}
        {verified && (
          <span style={{ flexShrink: 0, width: 17, height: 17, borderRadius: "50%", background: caso === "bien" ? "#1f8a54" : caso === "mal" ? "#c0392b" : caso === "falto" ? "#d8a32a" : "rgba(120,94,48,0.35)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 11 }}>
            {caso === "bien" ? "✓" : caso === "mal" ? "✗" : caso === "falto" ? "!" : "✓"}
          </span>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 9, height: "100%", width: "100%", paddingBottom: 10 }}>
      <div style={{ pointerEvents: "none", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)", flexShrink: 0 }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 19, color: "#fff" }}>¿A quién dejó Montalvo fuera del pueblo?</span>
        <div style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 11.5, color: "rgba(255,255,255,0.8)", marginTop: 1 }}>Son tres.</div>
      </div>
      <div style={{ width: 452, boxSizing: "border-box", borderRadius: 10, border: "3px solid rgba(190,158,96,0.75)", background: "linear-gradient(180deg, rgba(255,251,236,0.96), rgba(238,226,198,0.94))", padding: "8px 10px 10px", flexShrink: 0, boxShadow: "0 8px 20px rgba(0,0,0,0.38)" }}>
        <div style={{ textAlign: "center", fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 10.5, letterSpacing: "0.08em", color: "#7a5a12", borderBottom: "2px solid rgba(190,158,96,0.5)", paddingBottom: 4, marginBottom: 6 }}>EL COSMOPOLITA · JUAN MONTALVO</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {b.frases.map(frase)}
        </div>
      </div>
    </div>
  );
}

const L6T3_ROUNDS = [
  { C: L6T3R1Niebla, verify: true, bubble: (<>Pasa por encima<br />y la niebla se va.<br />Después elige tocando.</>) },
  { C: L6T3R2Plumas, verify: true, bubble: (<>Toca una ficha<br />y gira. Tócala otra<br />vez y se tapa.</>) },
  { C: L6T3R3Sello, verify: true, bubble: (<>Toca una frase<br />y queda sellada.</>) },
];

// ══════════════════════════════════════════════════════════════════
// LIBRO 7 · TEMA 3 — "Transformación agraria" (11 años)
// Material: libro pp. 52-58 + cuaderno pp. 49-52.
//
// El tema se llama así en el libro (Unidad 3, Tema 1) y el cuaderno lo confirma. Las
// rondas recorren el arco entero: los gobiernos de 1948-1972 (pp. 54-57) → el boom
// bananero (p. 55) → la Reforma Agraria de 1964 (pp. 56-57), que da nombre al tema.
//
// Tres gestos, y ninguno repetido en el juego:
//   R1 estirar el borde de una barra · R2 apilar · R3 encender/apagar
//
// ⚠ Las ilustraciones pueden no estar todavía. Cada figura cae a un emoji si el archivo
//    falta, para que el tema se pueda jugar y probar sin esperar a las imágenes.
// ══════════════════════════════════════════════════════════════════
function J7T3Fig({ src, emoji, w, h, radius }) {
  const [mal, setMal] = useStateG(false);
  if (mal) return <div style={{ width: w, height: h, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, lineHeight: 1 }}>{emoji}</div>;
  return <img src={src} alt="" onError={() => setMal(true)} style={{ width: w, height: h, objectFit: "cover", objectPosition: "center top", display: "block", borderRadius: radius || 6 }} />;
}

// ──────────────────────────────────────────────────────────────────
// R1 · "¿Cuánto le duró?" — ESTIRAR EL BORDE DE UNA BARRA (mano nueva).
// Tres gobiernos a la vez, cada uno con su año de inicio YA PUESTO y una frase de lo que
// hizo. Se estira el borde derecho de su barra hasta donde se cree que terminó.
// ⭐ +1 por gobierno que quede a un año o menos del real.
//
// ⚠ SUSTITUYE a "Uno contra ocho" (poner soldados en la fila): la autora no la entendió
// (2026-11-24) y tenía razón — la pantalla no decía por ningún lado que lo correcto fuera
// dejar UN soldado, así que solo se acertaba recordando la frase de la p.52.
// ⚠ También se descartaron tres versiones de "medir el territorio perdido" (tijeras,
// cinta métrica, doblar el mapa): los 200 000 km² son UN SOLO dato y la ronda habría sido
// idéntica en todas las partidas. Lo marcó la autora.
//
// ⚠ LA REGLA DE AÑOS EMPIEZA EN EL GOBIERNO MÁS ANTIGUO DE LA PARTIDA, no en 1948: con el
// 1948 fijo, una partida de los años sesenta dejaba media pantalla vacía a la izquierda.
// Lo marcó la autora. El paso de las marcas se calcula para que nunca pasen de siete.
// ──────────────────────────────────────────────────────────────────
const J7T3_FIN = 1972, J7T3_EJE = 356;
const J7T3_GOB = [
  { id: "plaza", q: "plaza", n: "Galo Plaza Lasso", ini: 1948, fin: 1952, o: "Construyó escuelas y combatió la malaria.", p: "Gobierno democrático y tolerante: escuelas, colegios técnicos y, en 1950, el Primer Censo Nacional." },
  { id: "velasco3", q: "velasco", n: "Velasco Ibarra · 3.er mandato", ini: 1952, fin: 1956, o: "Carreteras, puentes y colegios nuevos.", p: "El único de sus cinco mandatos que llegó al final: obras públicas y equipamiento de las Fuerzas Armadas." },
  { id: "ponce", q: "ponce", n: "Camilo Ponce Enríquez", ini: 1956, fin: 1960, o: "Levantó el Palacio Legislativo.", p: "Finanzas ordenadas y administración austera: el Palacio Legislativo y el Puente de la Unidad Nacional." },
  { id: "velasco4", q: "velasco", n: "Velasco Ibarra · 4.º mandato", ini: 1960, fin: 1961, o: "Declaró nulo el Protocolo de Río de Janeiro.", p: "La crisis fiscal y las protestas acabaron con él: el Congreso y las Fuerzas Armadas lo desconocieron." },
  { id: "arosemena", q: "arosemena", n: "Carlos Julio Arosemena Monroy", ini: 1961, fin: 1963, o: "Creó TAME y el decimotercer sueldo.", p: "Hizo carreteras, la ley de inquilinato y las universidades Laica y Católica; lo derrocaron los militares." },
  { id: "junta", q: "junta", n: "Primera Junta Militar", ini: 1963, fin: 1966, o: "Cuatro oficiales al mando del país.", p: "Dictaron la Reforma Agraria de 1964 y crearon el IERAC; cayeron con las paralizaciones de 1966." },
  { id: "otto", q: "otto", n: "Otto Arosemena Gómez", ini: 1966, fin: 1968, o: "Creó el Ministerio de Salud Pública.", p: "Obras para la educación, electrificación y carreteras; convocó las elecciones que ganó Velasco." },
  { id: "velasco5", q: "velasco", n: "Velasco Ibarra · 5.º mandato", ini: 1968, fin: 1972, o: "Se proclamó dictador y disolvió el Congreso.", p: "Dos años de agitación social; en febrero de 1972 el general Rodríguez Lara lo derrocó." },
];
// ⚠ Clemente Yerovi (marzo-noviembre de 1966) queda FUERA del banco a propósito: duró
// menos de un año y la barra se mide en años enteros, así que no tendría respuesta clara.
const J7T3_R1_KEY = "edinun_j12_l7t3_r1_v1";
function j7t3R1Build() {
  let idx = j12PickIdx(J7T3_GOB, 3, J7T3_R1_KEY);   // ⚠ cap 2: ver j12Commit de abajo
  // ⚠ NUNCA dos mandatos de la misma persona en la misma partida: salían el 3.er y el 4.º
  //   de Velasco juntos y la pantalla parecía repetida, aunque la respuesta fuera distinta.
  const usados = {}, libres = J7T3_GOB.map((_, i) => i).filter((i) => idx.indexOf(i) < 0);
  idx = idx.filter((i) => { const q = J7T3_GOB[i].q; if (usados[q]) return false; usados[q] = 1; return true; });
  while (idx.length < 3) {
    const k = libres.findIndex((i) => !usados[J7T3_GOB[i].q]);
    if (k < 0) break;
    const i = libres.splice(k, 1)[0];
    usados[J7T3_GOB[i].q] = 1;
    idx.push(i);
  }
  // ⚠ Cap 3 = los tres del juego anterior, para que NO pueda repetirse el trío exacto:
  // el relleno que evita dos mandatos de la misma persona reintroducía uno de los
  // anteriores y una de cada diez partidas salía idéntica. Con 8 en el banco quedan 5
  // libres, que siguen dando 10 tríos.
  j12Commit(J7T3_R1_KEY, idx, 3);
  const sel = J7T3_GOB.filter((_, i) => idx.indexOf(i) !== -1).sort((a, b) => a.ini - b.ini);
  const a0 = sel[0].ini;
  const span = J7T3_FIN - a0;
  const paso = Math.max(2, Math.ceil(span / 6 / 2) * 2);
  const marcas = [];
  for (let a = a0; a <= J7T3_FIN; a += paso) marcas.push(a);
  if (marcas[marcas.length - 1] !== J7T3_FIN) marcas.push(J7T3_FIN);
  return { gob: sel, a0: a0, marcas: marcas };
}

function L7T3R1Mandatos({ onSolve, verifyRef, listo }) {
  const [b] = useStateG(() => j7t3R1Build());
  const gob = b.gob, A0 = b.a0;
  const X = (a) => ((a - A0) / (J7T3_FIN - A0)) * J7T3_EJE;
  const [fin, setFin] = useStateG(() => { const o = {}; gob.forEach((g) => { o[g.id] = g.ini; }); return o; });
  const [ultimo, setUltimo] = useStateG(null);
  const [verified, setVerified] = useStateG(false);
  const ejes = useRefG({});

  // ⚠ El año se saca del ancho REAL del eje, no de los 322 lógicos: el lienzo va escalado
  //   con transform, así que getBoundingClientRect devuelve píxeles de pantalla.
  function anioEn(g, clientX) {
    const el = ejes.current[g.id];
    if (!el) return g.ini;
    const r = el.getBoundingClientRect();
    const a = A0 + ((clientX - r.left) / r.width) * (J7T3_FIN - A0);
    return Math.max(g.ini, Math.min(J7T3_FIN, Math.round(a)));
  }
  function mover(g, e) { if (verified) return; setFin((f) => { const o = Object.assign({}, f); o[g.id] = anioEn(g, e.clientX); return o; }); setUltimo(g.id); }
  function agarrar(g, e) { if (verified) return; e.currentTarget.setPointerCapture(e.pointerId); mover(g, e); }
  // Cuántas barras se han movido ya de su año de inicio.
  const estirados = gob.filter((g) => fin[g.id] > g.ini).length;
  // ⚠ Esta ronda NO registra BORRAR: cualquier barra se puede volver a estirar cuando
  // quieras, así que rectificar es mover otra vez (lo pidió la autora el 2026-11-24).
  useEffectG(() => {
    if (!listo) return undefined;
    listo(verified ? null : (estirados < gob.length ? "Estira las " + gob.length + " barras" : null));
    return () => listo(null);
  }, [fin, verified]);

  function verificar() {
    if (verified || estirados < gob.length) return;
    setVerified(true);
    const dur = (g) => fin[g.id] - g.ini;
    const bien = (g) => Math.abs(dur(g) - (g.fin - g.ini)) <= 1;
    const aciertos = gob.filter(bien).length;
    const anios = (n) => n + (n === 1 ? " año" : " años");
    onSolve(aciertos === gob.length, {
      emoji: "📅", a: "Cuánto le duró a cada gobierno",
      userAnswer: gob.map((g) => g.n + ": " + anios(dur(g))).join(" · "),
      correctAnswer: gob.map((g) => g.n + ": " + g.ini + "-" + g.fin + " (" + anios(g.fin - g.ini) + ")").join(" · "),
    }, aciertos);
  }
  verifyRef.current = verificar;

  const falla = verified ? gob.filter((g) => Math.abs((fin[g.id] - g.ini) - (g.fin - g.ini)) > 1)[0] : null;

  return (
    // ⚠ Bloque CENTRADO y cartel del revelado en ABSOLUTO: así nada se mueve al verificar
    //   y no queda un vacío grande debajo (lo marcó la autora en rojo sobre una captura).
    <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", width: "100%" }}>
      <div style={{ pointerEvents: "none", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 18, color: "#fff" }}>¿Hasta cuándo gobernó cada uno?</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14, width: 462, flexShrink: 0 }}>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 18 }}>
          {gob.map((g) => {
            const d = fin[g.id] - g.ini, real = g.fin - g.ini;
            const ok = verified && Math.abs(d - real) <= 1;
            const x0 = X(g.ini), x1 = X(fin[g.id]), xr = X(g.fin);
            return (
              <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                {/* EL RETRATO. Foto real o escudo: nunca una cara inventada.
                    ⚠ 84x98 es el TOPE: con 84x104 y 21 de separación, el bloque crece
                      hacia arriba (va centrado) y el enunciado se mete en el bloque
                      RONDA. Lo cazó  por 3 px. */}
                <div style={{ width: 84, height: 98, flexShrink: 0, borderRadius: 8, overflow: "hidden", border: "2px solid " + (verified ? (ok ? "#2ecc8f" : "#ff6b6b") : "rgba(255,255,255,0.28)"), background: "rgba(255,255,255,0.07)" }}>
                  <J7T3Fig src={"assets/j7t3-" + g.q + ".jpg"} emoji="🎖️" w="100%" h="100%" radius={6} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 12.5, color: verified ? (ok ? "#8fffcb" : "#ffb3b3") : "#fce9a8", textShadow: "0 2px 6px rgba(0,0,0,0.6)" }}>
                    {g.n}<span style={{ fontFamily: "var(--ed-font-mono)", fontWeight: 800, fontSize: 9, color: "rgba(255,255,255,0.6)", marginLeft: 6 }}>DESDE {g.ini}</span>
                  </span>
                  <span style={{ fontFamily: "var(--ed-font-mono)", fontWeight: 800, fontSize: 10, color: verified ? (ok ? "#8fffcb" : "#ffb3b3") : "#ffe79a", whiteSpace: "nowrap" }}>
                    {verified ? g.ini + "-" + g.fin : (d === 1 ? "1 año" : d + " años")}
                  </span>
                </div>
                {/* ⚠ La frase de lo que hizo NO lleva años: si los llevara regalaría la
                    respuesta. Está para que la ronda no sea una lista de nombres pelados. */}
                <div style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 9.5, color: "rgba(255,255,255,0.66)", marginBottom: 2 }}>{g.o}</div>
                <div ref={(el) => { ejes.current[g.id] = el; }}
                  data-qa="eje" onPointerDown={(e) => agarrar(g, e)} onPointerMove={(e) => { if (e.buttons) mover(g, e); }}
                  style={{ position: "relative", width: J7T3_EJE, height: 30, borderRadius: 9, background: "rgba(0,0,0,0.3)", border: "2px solid rgba(255,255,255,0.18)", cursor: verified ? "default" : "ew-resize", touchAction: "none" }}>
                  <div data-qa="barra" style={{ position: "absolute", left: x0, width: Math.max(0, x1 - x0), top: 3, bottom: 3, borderRadius: 5, background: verified ? (ok ? "linear-gradient(90deg,#2ecc8f,#17a06a)" : "linear-gradient(90deg,#ff8f8f,#d94b4b)") : "linear-gradient(90deg,#f2b84b,#ffe79a)" }} />
                  {!verified && (
                    <div style={{ position: "absolute", left: x1 - 6, top: -1, width: 15, height: 30, borderRadius: 5, background: "#4fd8ff", border: "2px solid #fff", boxShadow: "0 0 10px rgba(79,216,255,0.8)" }} />
                  )}
                  {verified && (
                    <div style={{ position: "absolute", left: xr - 2, top: -4, width: 4, height: 28, background: "#ffd980", borderRadius: 2, boxShadow: "0 0 10px rgba(255,217,128,0.9)" }} />
                  )}
                </div>
                </div>
              </div>
            );
          })}
          {/* LA REGLA DE AÑOS, una sola vez abajo */}
          <div style={{ position: "relative", width: J7T3_EJE, height: 12, marginLeft: 93 }}>
            {b.marcas.map((a) => (
              <span key={a} style={{ position: "absolute", left: X(a), transform: "translateX(-50%)", fontFamily: "var(--ed-font-mono)", fontWeight: 800, fontSize: 8.5, color: "rgba(255,255,255,0.55)" }}>{a}</span>
            ))}
          </div>
        </div>
      </div>

      {/* REVELADO: una línea, sin recuadro, solo para leer la raya dorada. */}
      <div style={{ width: 462, minHeight: 20, marginTop: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {verified && (
          <div style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 12, color: "rgba(255,255,255,0.85)", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.65)" }}>
            La raya <b style={{ color: "#ffd980" }}>dorada</b> marca dónde terminó de verdad cada gobierno.
          </div>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// R2 · "La bodega del banano" — APILAR (mano nueva).
// Cada año es una columna vacía: tocas y sube una caja; tocas una caja y la columna baja
// hasta ahí. Una caja = 100 mil toneladas, y las cifras son las de la tabla de la p.55.
// ⭐ +1 por año EXACTO.
//
// ⚠ PASARSE NO ES ACIERTO. Antes valía con quedar a una caja, de más o de menos, y la
// autora lo cazó jugando: *"solo cuando pongo los bananos correctos debe salir correcto,
// no cuando lo supero"*. Tiene razón: poner de más no es aproximarse, es equivocarse.
// ──────────────────────────────────────────────────────────────────
const J7T3_ANIOS = [
  { id: "a1948", y: 1948, v: "99", c: 1 },
  { id: "a1950", y: 1950, v: "169,6", c: 2 },
  { id: "a1955", y: 1955, v: "612,6", c: 6 },
  { id: "a1960", y: 1960, v: "895,1", c: 9 },
];
const J7T3_R2_KEY = "edinun_j12_l7t3_r2_v1";
// ⚠ El PASO (lo que sube cada caja) y el alto de la columna están calculados para que las
// diez quepan SIN dejar un hueco muerto debajo: el bloque va centrado y el cartel del
// revelado cuelga en absoluto, así que lo que sobre abajo se nota.
// ⚠ PASO 25 = alto de la caja: antes el paso era menor y cada caja tapaba un tercio de
// la de abajo. Con 26 la columna medía 278 y el año chocaba con el cartel del revelado.
const J7T3_MAXC = 10, J7T3_CW = 84, J7T3_PASO = 30, J7T3_CH = 30;
function j7t3R2Build() {
  // ⚠ Cap 2, nunca 3 (= K): con cap = K se alternarían dos grupos fijos.
  const idx = j12PickIdx(J7T3_ANIOS, 3, J7T3_R2_KEY);
  j12Commit(J7T3_R2_KEY, idx, 2);
  const sel = J7T3_ANIOS.filter((_, i) => idx.indexOf(i) !== -1);
  return { anios: sel.slice().sort((a, b) => a.y - b.y) };   // los años siempre en orden
}

function L7T3R2Banano({ onSolve, verifyRef, onClear, listo }) {
  const [b] = useStateG(() => j7t3R2Build());
  const anios = b.anios;
  const [pila, setPila] = useStateG(() => { const o = {}; anios.forEach((a) => { o[a.id] = 0; }); return o; });
  const [ultima, setUltima] = useStateG(null);
  const [verified, setVerified] = useStateG(false);

  function subir(id) { if (verified) return; setPila((p) => { if (p[id] >= J7T3_MAXC) return p; const o = Object.assign({}, p); o[id] = p[id] + 1; return o; }); setUltima(id); }
  function bajarHasta(id, k) { if (verified) return; setPila((p) => { const o = Object.assign({}, p); o[id] = k; return o; }); setUltima(id); }
  function borrar() {
    if (verified) return;
    const id = ultima && pila[ultima] > 0 ? ultima : (anios.map((a) => a.id).filter((x) => pila[x] > 0).pop() || null);
    if (id) bajarHasta(id, pila[id] - 1);
  }
  const algo = anios.some((a) => pila[a.id] > 0);
  useEffectG(() => {
    if (!onClear) return undefined;
    onClear(verified ? null : { fn: borrar, puede: algo });
    return () => onClear(null);
  }, [pila, verified, ultima]);
  useEffectG(() => {
    if (!listo) return undefined;
    const faltan = anios.filter((a) => pila[a.id] === 0).length;
    listo(verified ? null : (faltan ? "Sube cajas en los " + anios.length + " años" : null));
    return () => listo(null);
  }, [pila, verified]);

  function verificar() {
    if (verified || anios.some((a) => pila[a.id] === 0)) return;
    setVerified(true);
    const aciertos = anios.filter((a) => pila[a.id] === a.c).length;
    onSolve(aciertos === anios.length, {
      emoji: "🍌", a: "Cuánto banano salió del Ecuador",
      userAnswer: anios.map((a) => a.y + ": " + pila[a.id] + (pila[a.id] === 1 ? " caja" : " cajas")).join(" · "),
      correctAnswer: anios.map((a) => a.y + ": " + a.v + " mil toneladas").join(" · "),
    }, aciertos);
  }
  verifyRef.current = verificar;

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", paddingTop: 24, height: "100%", width: "100%" }}>
      <div style={{ pointerEvents: "none", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 18, color: "#fff" }}>¿Cuánto banano salió del Ecuador en cada año?</span>
      </div>
      <div style={{ fontFamily: "var(--ed-font-mono)", fontWeight: 800, fontSize: 9.5, color: "rgba(255,255,255,0.62)", letterSpacing: "0.08em", marginTop: 3, flexShrink: 0 }}>1 CAJA = 100 MIL TONELADAS</div>

      {/* LAS COLUMNAS */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 44, marginTop: 6, flexShrink: 0 }}>
        {anios.map((a) => {
          const n = pila[a.id];
          const ok = verified && n === a.c;
          return (
            <div key={a.id} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontFamily: "var(--ed-font-mono)", fontWeight: 800, fontSize: 11, color: verified ? (ok ? "#8fffcb" : "#ffb3b3") : "#ffe79a", marginBottom: 5, whiteSpace: "nowrap", textShadow: "0 2px 6px rgba(0,0,0,0.75)" }}>
                {verified ? a.v + " mil t" : n + (n === 1 ? " caja" : " cajas")}
              </div>
              <div data-qa="columna" onClick={() => subir(a.id)}
                style={{ position: "relative", width: J7T3_CW, height: J7T3_MAXC * J7T3_PASO + 18, cursor: verified ? "default" : "pointer", borderRadius: 10, border: "2px dashed " + (verified ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.2)"), background: "rgba(0,0,0,0.2)" }}>
                {Array.from({ length: n }).map((_, k) => (
                  <div key={k} data-qa="caja" onClick={(e) => { e.stopPropagation(); bajarHasta(a.id, k); }}
                    style={{ position: "absolute", left: 2, bottom: 4 + k * J7T3_PASO, width: J7T3_CW - 4, height: J7T3_CH }}>
                    <J7T3Fig src="assets/j7t3-caja-banano.jpg" emoji="📦" w="100%" h="100%" radius={6} />
                  </div>
                ))}
                {verified && (
                  <div style={{ position: "absolute", left: -5, right: -5, bottom: 4 + a.c * J7T3_PASO, height: 3, background: "#2ecc8f", boxShadow: "0 0 10px rgba(46,204,143,0.9)", borderRadius: 2 }} />
                )}
              </div>
              <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 900, fontSize: 13, letterSpacing: "0.03em", marginTop: 6, borderRadius: 999, padding: "2px 11px",
                color: verified ? "#0b1020" : "#0b1020",
                background: verified ? (ok ? "#2ecc8f" : "#ff6b6b") : "rgba(255,255,255,0.88)",
                boxShadow: "0 2px 6px rgba(0,0,0,0.35)" }}>{a.y}</div>
            </div>
          );
        })}
      </div>

      {/* ⚠ El revelado va AQUÍ, pegado a las columnas, no en un cartel al pie: abajo
          dejaba una franja vacía mientras se juega y la autora la marcó en rojo. Su
          altura está reservada, así que al verificar no salta nada. */}
      <div style={{ width: 468, minHeight: 32, marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {verified && (
          <div style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 11.5, lineHeight: 1.25, color: "rgba(255,255,255,0.88)", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.65)" }}>
            <b style={{ color: "#8fffcb" }}>El boom bananero:</b> entre 1948 y 1960 la exportación se multiplicó por nueve.<br />
            Con esa plata se hicieron carreteras y escuelas, y mucha gente de la Sierra bajó a la Costa.
          </div>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// R3 · "Lo que cambió y lo que no" — ENCENDER y APAGAR.
// Cinco frases sobre la Reforma Agraria de 1964: tres pasaron y dos no. Todas salen de
// las pp.56-57; las falsas son lo que el libro dice EXPRESAMENTE que no ocurrió.
// ⭐ +1 por cada frase verdadera encendida.
// ──────────────────────────────────────────────────────────────────
const J7T3_SI = [
  { id: "huasipungo", t: "Se eliminó el huasipungo en las haciendas.", p: "El IERAC se creó para eliminar las formas de trabajo serviles en las haciendas serranas." },
  { id: "tierras", t: "Se repartieron tierras de las haciendas del Estado.", p: "Tierras de colegios, universidades, bancos y la Caja del Seguro, que no eran precisamente agrícolas." },
  { id: "migracion", t: "Mucha gente tuvo que migrar a las ciudades.", p: "Su situación económica siguió siendo precaria y se vieron obligados a buscar empleo en las grandes ciudades." },
  { id: "produccion", t: "Bajó la producción de alimentos en el país.", p: "Hubo desabastecimiento, sobre todo en la Costa con la producción de arroz." },
  { id: "leche", t: "Las haciendas de la Sierra se tecnificaron.", p: "Se fueron desarrollando en la industria ganadera para producir leche y sus derivados." },
];
const J7T3_NO = [
  { id: "creditos", t: "Los campesinos recibieron créditos del gobierno.", p: "No recibieron apoyo del gobierno con créditos ni préstamos." },
  { id: "vida", t: "Los indígenas mejoraron su calidad de vida.", p: "La Reforma Agraria no brindó una mejor calidad de vida a los campesinos ni a las comunidades indígenas." },
  { id: "herramientas", t: "Pudieron comprar herramientas y frenar las plagas.", p: "No pudieron tecnificar sus herramientas de trabajo ni combatir las heladas o plagas." },
];
const J7T3_R3_SI = "edinun_j12_l7t3_r3si_v1", J7T3_R3_NO = "edinun_j12_l7t3_r3no_v1";
function j7t3R3Build() {
  // ⚠ Cap 1 en las dos: con 5 verdaderas y cap 2 quedaban 3 libres para elegir 3, así que
  // salía siempre el mismo trío; con cap 1 quedan 4 libres y hay 4 tríos posibles cada
  // vez. Con 3 falsas y cap 1 quedan 2 libres para elegir 2 — ahí el banco es el techo.
  const iS = j12PickIdx(J7T3_SI, 3, J7T3_R3_SI); j12Commit(J7T3_R3_SI, iS, 1);
  const iN = j12PickIdx(J7T3_NO, 2, J7T3_R3_NO); j12Commit(J7T3_R3_NO, iN, 1);
  const si = iS.map((i) => Object.assign({ si: true }, J7T3_SI[i]));
  const no = iN.map((i) => Object.assign({ si: false }, J7T3_NO[i]));
  return { frases: j12Shuffle(si.concat(no)) };
}

function L7T3R3Lamparas({ onSolve, verifyRef, onClear, listo }) {
  const [b] = useStateG(() => j7t3R3Build());
  const frases = b.frases;
  const [on, setOn] = useStateG([]);
  const [verified, setVerified] = useStateG(false);
  const CUANTAS = frases.filter((f) => f.si).length;

  function tocar(id) { if (verified) return; setOn((v) => (v.indexOf(id) >= 0 ? v.filter((x) => x !== id) : v.concat([id]))); }
  function borrar() { if (!verified) setOn((v) => v.slice(0, -1)); }
  useEffectG(() => {
    if (!onClear) return undefined;
    onClear(verified ? null : { fn: borrar, puede: on.length > 0 });
    return () => onClear(null);
  }, [on.length, verified]);
  useEffectG(() => {
    if (!listo) return undefined;
    listo(verified ? null : (on.length === CUANTAS ? null : "Enciende " + CUANTAS + " (llevas " + on.length + ")"));
    return () => listo(null);
  }, [on.length, verified]);

  function verificar() {
    if (verified || on.length !== CUANTAS) return;
    setVerified(true);
    const aciertos = frases.filter((f) => f.si && on.indexOf(f.id) >= 0).length;
    onSolve(aciertos === CUANTAS, {
      emoji: "💡", a: "Lo que de verdad cambió con la Reforma Agraria",
      userAnswer: frases.filter((f) => on.indexOf(f.id) >= 0).map((f) => f.t).join(" · ") || "(ninguna)",
      correctAnswer: frases.filter((f) => f.si).map((f) => f.t).join(" · "),
    }, aciertos);
  }
  verifyRef.current = verificar;

  return (
    // ⚠ Bloque CENTRADO, fichas grandes y cartel en absoluto: con las filas pequeñas
    //   sobraba media pantalla debajo y la autora lo marcó en rojo.
    <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", width: "100%" }}>
      <div style={{ pointerEvents: "none", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 18, color: "#fff" }}>La Reforma Agraria de 1964: ¿qué pasó de verdad?</span>
        <div style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 12.5, color: "#ffe79a", marginTop: 2 }}>Son {CUANTAS}.</div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12, width: 440, flexShrink: 0 }}>
        <div style={{ width: 160, height: 268, borderRadius: 12, overflow: "hidden", border: "2px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.07)", flexShrink: 0 }}>
          <J7T3Fig src="assets/j7t3-campesino.jpg" emoji="🧑‍🌾" w="100%" h="100%" radius={10} />
        </div>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {frases.map((f) => {
            const enc = on.indexOf(f.id) >= 0;
            const caso = !verified ? null : (enc ? (f.si ? "bien" : "mal") : (f.si ? "falto" : "fuera"));
            let bd = enc ? "#ffd980" : "rgba(255,255,255,0.26)";
            let bg = enc ? "linear-gradient(180deg,#fff6d8,#f6e3a8)" : "rgba(0,0,0,0.3)";
            let col = enc ? "#3a2608" : "rgba(255,255,255,0.86)";
            if (caso === "bien") { bd = "#2ecc8f"; bg = "linear-gradient(180deg,#d8ffee,#a8f0cf)"; col = "#06381f"; }
            if (caso === "mal") { bd = "#ff6b6b"; bg = "linear-gradient(180deg,#ffdede,#ffb3b3)"; col = "#4a0d0d"; }
            if (caso === "falto") { bd = "#f2b84b"; bg = "rgba(242,184,75,0.2)"; col = "#ffe79a"; }
            if (caso === "fuera") { bd = "rgba(255,255,255,0.16)"; bg = "rgba(0,0,0,0.26)"; col = "rgba(255,255,255,0.6)"; }
            return (
              <div key={f.id} data-qa="lampara" onClick={() => tocar(f.id)}
                style={{ display: "flex", alignItems: "center", gap: 9, boxSizing: "border-box", minHeight: 46, borderRadius: 11, border: "2px solid " + bd, background: bg, color: col, padding: "12px 10px", cursor: verified ? "default" : "pointer", boxShadow: enc && !verified ? "0 0 16px rgba(255,217,128,0.5)" : "none" }}>
                <span style={{ flexShrink: 0, fontSize: 17, lineHeight: 1, filter: enc ? "none" : "grayscale(1) brightness(0.7)" }}>💡</span>
                <span style={{ flex: 1, minWidth: 0, fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 12.5, lineHeight: 1.22 }}>
                  {f.t}
                  {caso === "falto" && <span style={{ fontFamily: "var(--ed-font-mono)", fontWeight: 800, fontSize: 8.5, background: "#f2b84b", color: "#2a1a00", borderRadius: 999, padding: "1px 6px", marginLeft: 6, whiteSpace: "nowrap" }}>ESTA SÍ PASÓ</span>}
                </span>
                {verified && (
                  <span data-qa="sello" style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 24, height: 24, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, lineHeight: 1,
                      background: caso === "bien" ? "#2ecc8f" : caso === "mal" ? "#ff6b6b" : caso === "falto" ? "#f2b84b" : "rgba(255,255,255,0.18)",
                      color: caso === "falto" ? "#2a1a00" : (caso === "fuera" ? "rgba(255,255,255,0.8)" : "#06381f"),
                      border: "2px solid rgba(0,0,0,0.25)" }}>{caso === "bien" || caso === "fuera" ? "✓" : "✗"}</span>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* REVELADO: una línea, sin recuadro. El ✓/✗ de cada ficha ya da el veredicto;
          esto solo añade POR QUÉ no pasó la primera que estaba apagada en el libro. */}
      <div style={{ width: 420, minHeight: 22, marginTop: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {verified && (
          <div style={{ fontFamily: "var(--ed-font-ui)", fontWeight: 700, fontSize: 11.5, lineHeight: 1.25, color: "rgba(255,255,255,0.85)", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.65)" }}>
            {(frases.filter((f) => !f.si)[0] || {}).p}
          </div>
        )}
      </div>
    </div>
  );
}

const L7T3_ROUNDS = [
  { C: L7T3R1Mandatos, verify: true, bubble: (<>Estira el borde<br />de cada barra.<br />Son tres gobiernos.</>) },
  { C: L7T3R2Banano, verify: true, bubble: (<>Toca una columna<br />y sube una caja.<br />Toca una caja y baja.</>) },
  { C: L7T3R3Lamparas, verify: true, bubble: (<>Toca una lámpara<br />y se enciende. Tócala<br />otra vez y se apaga.</>) },
];

const J12_ROUNDS_POR_TEMA = { "l6-t1": L6T1_ROUNDS, "l6-t2": L6T2_ROUNDS, "l6-t3": L6T3_ROUNDS, "l7-t1": L7T1_ROUNDS, "l7-t2": L7T2_ROUNDS, "l7-t3": L7T3_ROUNDS };
function GameScreen({ app, setApp, go }) {
  const cat = app.currentCategory || "l6-t1";
  const rounds = J12_ROUNDS_POR_TEMA[cat] || L6T1_ROUNDS;
  return <J12Game key={cat} app={app} setApp={setApp} go={go} rounds={rounds} />;
}

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

Object.assign(window, { GameScreen, ResultsScreen });
