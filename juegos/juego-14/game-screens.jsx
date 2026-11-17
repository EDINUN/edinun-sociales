// game-screens.jsx — juego-14 "Las culturas posclásicas de Mesoamérica".
// Estudios Sociales 8.º · Unidad 6 · Tema 3 (libro págs. 134-136 · cuaderno 90-92).
// Audiencia: 12 años. Guía: Yaku. Detalle en .planning/juego-14-design.md
//
// TRES RONDAS, TRES VERBOS DISTINTOS (una jugada cada una, validada con ¡VERIFICAR!):
//   R1 "Dial de los siglos" — recorrer el tiempo y ubicar 4 ciudades mayas (4 ⭐)
//   R2 "Estela maya"        — componer un número vigesimal y verlo cambiar (2 ⭐)
//   R3 "Códice azteca"      — detectar y corregir 4 palabras de una crónica (4 ⭐)
// Total 10 ⭐. Fallar NO resta; al fallar se revela la correcta.
//
// CONTRATO: GameScreen/ResultsScreen({app,setApp,go}) expuestos en window;
// markFirstAttempt() en la 1ª respuesta; incrementGamesCompleted() al fin.
// Ningún cierre literal de etiqueta script en este archivo (rompería el bundle).

const { useState: useStateG, useEffect: useEffectG, useRef: useRefG } = React;

function PortalToBody({ children }) {
  return ReactDOM.createPortal(children, document.body);
}

const CAT_LABEL = "Las culturas posclásicas de Mesoamérica";
const ROUNDS = 3;

// ═════════════════════════════════════════════════════════════
// BANCOS — todo el contenido sale del libro / cuaderno de 8.º.
// ═════════════════════════════════════════════════════════════

// R1 · Ciudades mayas y su época (cuaderno pág. 92, ej. 4 — textual).
// x/y = posición normalizada (0..1) sobre el mapa de Mesoamérica.
// Coordenadas calibradas sobre assets/mapa-mesoamerica.jpg (1376×768, ratio 1.792).
// El contenedor conserva ese ratio, así que NO hay recorte y 0..1 mapea 1:1.
// Posiciones CALCULADAS, no estimadas a ojo. Se midió el mapa píxel a píxel
// (.planning/mapa-grid.js saca una rejilla mar/tierra) y se ajustó la escala
// geográfica con dos anclas: la costa norte de Yucatán (21.6 N) en y=0.132 y
// la costa este del Caribe (87.0 W) en x=0.696. De ahí:
//     y = 0.132 + (21.6 - lat) / 11.25      x = 0.696 - (lon - 87.0) / 19.57
// Comprobado contra la rejilla: las 12 caen en tierra. Antes estaban puestas
// "en filas" y varias salían al mar — lo cazó la autora.
// xf / yf = posición sobre la imagen COMPLETA (0..1). Es la fuente de verdad y
// la que comprueba .planning/ciudades-en-tierra.js.
const CIUDADES = [
  // clásicas — selvas del sur (Chiapas · Petén · Honduras)
  { n: "Palenque",     e: "clasico",    xf: 0.438, yf: 0.498, lat: 17.48, lon: 92.05 },
  { n: "Calakmul",     e: "clasico",    xf: 0.552, yf: 0.443, lat: 18.10, lon: 89.81 },
  { n: "Tikal",        e: "clasico",    xf: 0.562, yf: 0.521, lat: 17.22, lon: 89.62 },
  { n: "Toniná",       e: "clasico",    xf: 0.440, yf: 0.550, lat: 16.90, lon: 92.01 },
  { n: "Bonampak",     e: "clasico",    xf: 0.488, yf: 0.568, lat: 16.70, lon: 91.07 },
  { n: "Copán",        e: "clasico",    xf: 0.587, yf: 0.733, lat: 14.84, lon: 89.14 },
  // posclásicas — península de Yucatán
  { n: "Chichén Itzá", e: "posclasico", xf: 0.616, yf: 0.214, lat: 20.68, lon: 88.57 },
  { n: "Mayapán",      e: "posclasico", xf: 0.570, yf: 0.218, lat: 20.63, lon: 89.46 },
  { n: "Cobá",         e: "posclasico", xf: 0.659, yf: 0.231, lat: 20.49, lon: 87.73 },
  { n: "Uxmal",        e: "posclasico", xf: 0.555, yf: 0.242, lat: 20.36, lon: 89.77 },
  { n: "Tulum",        e: "posclasico", xf: 0.674, yf: 0.256, lat: 20.21, lon: 87.43 },
  { n: "Edzná",        e: "posclasico", xf: 0.531, yf: 0.310, lat: 19.60, lon: 90.23 },
];

// RECORTE: no se muestra el mapa entero, sino la ventana que contiene las 12
// ciudades. Así se ven AL DOBLE de tamaño y dejan de amontonarse (idea de la
// autora). En píxeles del archivo (1376×768): x 350..1180, y 136..591.
const CROP = { x0: 350 / 1376, x1: 1180 / 1376, y0: 136 / 768, y1: 591 / 768 };
CIUDADES.forEach((c) => {
  c.x = (c.xf - CROP.x0) / (CROP.x1 - CROP.x0);
  c.y = (c.yf - CROP.y0) / (CROP.y1 - CROP.y0);
});


const EPOCAS = {
  clasico:    { label: "CLÁSICO",    rango: "300 – 900 d. C.",  color: "#4fa0ff" },
  posclasico: { label: "POSCLÁSICO", rango: "900 – 1519 d. C.", color: "#f2a24a" },
};

// R2 · Números para la estela. Todos de EXACTAMENTE dos niveles (20..260),
// ocho de ellos con 0 unidades para que entre el caracol.
// Regla del libro (cuaderno pág. 92, ej. 5): punto = 1, barra = 5, caracol = 0,
// sistema posicional de base veinte.
const NUMEROS = [27, 33, 40, 52, 60, 73, 85, 99, 100, 120, 135, 148, 160, 185, 200, 215, 240, 260];

// R3 · Crónicas con palabras manchadas. La nº 1 es la del cuaderno (pág. 91,
// ej. 7) textual; las otras tres intercambian términos del propio libro.
// Cada hueco es { mal, bien }: `mal` es SIEMPRE lo que aparece manchado en el
// párrafo (si se mostrara a veces la correcta, la consigna "estas cuatro están
// mal" sería mentira), y el orden de las dos opciones del selector se baraja en
// cada partida para que no se pueda acertar siempre tocando el mismo lado.
const CRONICAS = [
  {
    fuente: "cuaderno pág. 91",
    partes: [
      "Los aztecas fueron uno de los tres pueblos de familia lingüística ",
      { mal: "quechua", bien: "náhuatl" },
      " que invadieron sucesivamente la meseta mexicana. Los toltecas iniciaron este proceso en el siglo V y permanecieron hasta el siglo ",
      { mal: "VII", bien: "XIII" },
      ", momento en el que fueron conquistados por los ",
      { mal: "mayas", bien: "chichimecas" },
      ". Cien años más tarde llegaron los aztecas, se apoderaron del lago ",
      { mal: "Titicaca", bien: "Texcoco" },
      " y construyeron su majestuosa capital, Tenochtitlán.",
    ],
  },
  {
    fuente: "libro pág. 136",
    partes: [
      "A mediados del siglo XVI, los aztecas formaron una confederación que incluyó a las ciudades de Tenochtitlán, Tlacopán y ",
      { mal: "Tikal", bien: "Tlatelolco" },
      ". Durante el gobierno de ",
      { mal: "Quetzalcóatl", bien: "Moctezuma II" },
      ", los pueblos sometidos se sublevaron. El gran ",
      { mal: "pochtecatl", bien: "Tlatoani" },
      " presidía la confederación y ejercía las funciones de jefe militar y supremo juez. El ",
      { mal: "mayeque", bien: "calpulli" },
      " era la unidad productiva de la sociedad azteca.",
    ],
  },
  {
    fuente: "libro pág. 135",
    partes: [
      "Si bien cada ciudad maya era independiente, todas compartían una estructura jerárquica en la que los ",
      { mal: "comerciantes", bien: "sacerdotes" },
      " ocupaban la cima de la pirámide. Su principal actividad económica era el cultivo del ",
      { mal: "trigo", bien: "maíz" },
      ". No conocieron el regadío, las acequias ni el cultivo en ",
      { mal: "invernaderos", bien: "terrazas" },
      ". Los sacerdotes mayas crearon el ",
      { mal: "alfabeto", bien: "calendario" },
      " más exacto de cuantos se conocen antes del siglo XVI.",
    ],
  },
  {
    fuente: "libro págs. 134 y 136",
    partes: [
      "La historia de los mayas ha sido dividida en dos períodos: clásico y ",
      { mal: "neolítico", bien: "posclásico" },
      ". Los mayas clásicos habitaron las selvas entre los años 300 y ",
      { mal: "1500", bien: "900" },
      " d. C. En el nuevo escenario, posiblemente por la influencia del pueblo ",
      { mal: "inca", bien: "tolteca" },
      ", los mayas se transformaron en guerreros. El ",
      { mal: "Códice Florentino", bien: "Popol Vuh" },
      " es uno de los pocos textos literarios precolombinos que relata el origen del universo desde la cultura maya.",
    ],
  },
];

// ═════════════════════════════════════════════════════════════
// Anti-repetición — un buffer FIFO por ronda. Recargar NO repite.
// ═════════════════════════════════════════════════════════════
const RECENT_CIUDADES = "edinun_soc_j14_ciudades_v1";
const RECENT_NUMEROS = "edinun_soc_j14_numeros_v1";
const RECENT_CRONICAS = "edinun_soc_j14_cronicas_v1";

function getRecent(key) {
  try {
    const r = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(r) ? r : [];
  } catch (e) { return []; }
}

function pushRecent(key, ids, cap) {
  const prev = getRecent(key).filter((id) => ids.indexOf(id) === -1);
  const next = ids.concat(prev).slice(0, cap);
  try { localStorage.setItem(key, JSON.stringify(next)); } catch (e) {}
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

// Elige n índices de un universo evitando los recientes.
function pickFresh(universo, recientes, n) {
  const set = new Set(recientes);
  const fresh = shuffle(universo.filter((i) => !set.has(i)));
  const stale = shuffle(universo.filter((i) => set.has(i)));
  return fresh.concat(stale).slice(0, n);
}

// R1: 2 ciudades clásicas + 2 posclásicas, barajadas.
function pickCiudades() {
  const rec = getRecent(RECENT_CIUDADES);
  const cla = CIUDADES.map((c, i) => i).filter((i) => CIUDADES[i].e === "clasico");
  const pos = CIUDADES.map((c, i) => i).filter((i) => CIUDADES[i].e === "posclasico");
  const sel = pickFresh(cla, rec, 2).concat(pickFresh(pos, rec, 2));
  pushRecent(RECENT_CIUDADES, sel, 6);
  return shuffle(sel);
}

function pickNumero() {
  const rec = getRecent(RECENT_NUMEROS);
  const sel = pickFresh(NUMEROS.map((_, i) => i), rec, 1);
  pushRecent(RECENT_NUMEROS, sel, 17);
  return sel[0];
}

function pickCronica() {
  const rec = getRecent(RECENT_CRONICAS);
  const sel = pickFresh(CRONICAS.map((_, i) => i), rec, 1);
  pushRecent(RECENT_CRONICAS, sel, 3);
  return sel[0];
}

// Palabra que se muestra de entrada en cada hueco. UNA o DOS de las cuatro ya
// vienen CORRECTAS: si todas estuvieran mal, pedir "revisa" sería mentira y
// además obligaría a tocar las cuatro aunque no haya que cambiarlas. Dejar una
// palabra como está es una respuesta válida.
function nuevaCronica() {
  const cronica = pickCronica();
  return { cronica, cronicaIni: inicialCronica(cronica) };
}

function inicialCronica(idx) {
  const huecos = CRONICAS[idx].partes.filter((p) => typeof p !== "string");
  const yaBien = huecos.map(() => Math.random() < 0.3);
  const cuantas = () => yaBien.filter(Boolean).length;
  if (cuantas() === 0) yaBien[Math.floor(Math.random() * huecos.length)] = true;
  while (cuantas() > 2) {
    const puestas = yaBien.map((v, i) => (v ? i : -1)).filter((i) => i >= 0);
    yaBien[puestas[Math.floor(Math.random() * puestas.length)]] = false;
  }
  return huecos.map((p, i) => (yaBien[i] ? p.bien : p.mal));
}

const ANIMOS = [
  "¡Casi! Fíjate en la respuesta.",
  "Equivocarse también es aprender.",
  "¡La próxima es tuya!",
];

// Descompone un dígito maya (0..19) en sus símbolos.
function simbolos(d) {
  if (d === 0) return ["caracol"];
  const out = [];
  for (let i = 0; i < Math.floor(d / 5); i++) out.push("barra");
  for (let i = 0; i < d % 5; i++) out.push("punto");
  return out;
}

function valorDe(pieces) {
  return pieces.reduce((s, p) => s + (p === "barra" ? 5 : p === "punto" ? 1 : 0), 0);
}

// ═════════════════════════════════════════════════════════════
// Piezas visuales reutilizables
// ═════════════════════════════════════════════════════════════

// Imagen del tema con respaldo: si el archivo aún no existe, se queda el SVG
// o el degradado de debajo.
function TemaImg({ src, alt, style }) {
  const [falla, setFalla] = useStateG(false);
  if (falla) return null;
  return <img src={src} alt={alt || ""} onError={() => setFalla(true)} style={style} />;
}

// Imagen AMPLIADA Y RECORTADA a una ventana. Va como fondo CSS y no como <img>:
// un <img> más grande que su marco sobresale de la caja aunque se vea recortado,
// y el QA lo cuenta como que la mecánica invade la columna de botones.
function TemaFondo({ src, w, h, left, top, radius }) {
  return (
    <div style={{
      position: "absolute", inset: 0, borderRadius: radius || 0,
      backgroundImage: `url(${src})`,
      backgroundSize: `${w}px ${h}px`,
      backgroundPosition: `${left}px ${top}px`,
      backgroundRepeat: "no-repeat",
    }} />
  );
}

// Punto / barra / caracol mayas dibujados en SVG.
function Glifo({ tipo, size = 26, color = "#3a2608" }) {
  if (tipo === "barra") {
    return (
      <svg width={size * 1.9} height={size * 0.55} viewBox="0 0 38 11" aria-hidden="true">
        <rect x="0.5" y="0.5" width="37" height="10" rx="3" fill={color} />
      </svg>
    );
  }
  if (tipo === "caracol") {
    return (
      <svg width={size * 1.5} height={size} viewBox="0 0 30 20" aria-hidden="true">
        <ellipse cx="15" cy="10" rx="13.5" ry="8.5" fill="none" stroke={color} strokeWidth="2.4" />
        <path d="M22 10a7 7 0 1 1-7-6.4" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="15" cy="10" r="2.2" fill={color} />
      </svg>
    );
  }
  return (
    <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 12 12" aria-hidden="true">
      <circle cx="6" cy="6" r="5.2" fill={color} />
    </svg>
  );
}

// Fila de glifos de un nivel de la estela.
function FilaGlifos({ pieces, color, onQuitar }) {
  if (!pieces.length) return null;
  const barras = pieces.filter((p) => p === "barra");
  const puntos = pieces.filter((p) => p === "punto");
  const caracol = pieces.indexOf("caracol") !== -1;
  // Los puntos SE REPARTEN EN VARIAS FILAS: en una sola línea se salían de la
  // estela en cuanto pasaban de media docena (reportado por la autora con 13).
  const puntoSize = puntos.length > 10 ? 19 : puntos.length > 6 ? 22 : 26;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, maxWidth: "100%" }}>
      {puntos.length > 0 && (
        <div style={{
          display: "flex", gap: 6, alignItems: "center", justifyContent: "center",
          flexWrap: "wrap", maxWidth: "100%",
        }}>
          {puntos.map((p, i) => (
            <span key={"p" + i} onClick={onQuitar ? () => onQuitar("punto") : undefined}
              style={{ cursor: onQuitar ? "pointer" : "default", display: "flex" }}>
              <Glifo tipo="punto" size={puntoSize} color={color} />
            </span>
          ))}
        </div>
      )}
      {barras.map((b, i) => (
        <span key={"b" + i} onClick={onQuitar ? () => onQuitar("barra") : undefined}
          style={{ cursor: onQuitar ? "pointer" : "default", display: "flex" }}>
          <Glifo tipo="barra" color={color} />
        </span>
      ))}
      {caracol && (
        <span onClick={onQuitar ? () => onQuitar("caracol") : undefined}
          style={{ cursor: onQuitar ? "pointer" : "default", display: "flex" }}>
          <Glifo tipo="caracol" color={color} />
        </span>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// RONDA 1 — Las dos regiones mayas
//
// Antes esta ronda traía un DIAL del año que iluminaba la región viva. La
// autora entró, no entendió qué había que hacer, y tenía razón: el juego pedía
// un dato que NO se podía averiguar mirando la pantalla (si no te sabías que
// Tulum es posclásica, no había de dónde sacarlo). Ahora la regla del libro
// (pág. 134: los clásicos vivieron en las selvas del sur y en el año 900
// emigraron a Yucatán) está ROTULADA SOBRE EL MAPA, con sus fechas. Así la
// respuesta se lee en pantalla y, de paso, se aprende la regla.
// ═════════════════════════════════════════════════════════════

// Recuadros de las dos regiones sobre el mapa (% del contenedor), con el centro
// del foco que usa la barra de los años.
const REGIONES = [
  // Recuadros ajustados a las ciudades reales. El rótulo va en mar abierto
  // (lx, ly = su centro), donde no tapa nada.
  // Ceñidos a las ciudades que contienen (antes sobraba muchísimo recuadro,
  // sobre todo el celeste: la autora lo reportó). Coordenadas sobre el RECORTE.
  // El nombre va EN DOS LÍNEAS para que el rótulo sea estrecho: ancho, se
  // montaba sobre el nombre de Mayapán. (lx, ly) = centro del rótulo.
  { e: "posclasico", nombre: "PENÍNSULA DE\nYUCATÁN", left: "42%", top: "2%",  width: "32%", height: "26%", lx: 14, ly: 16, fx: 58, fy: 14 },
  { e: "clasico",    nombre: "SELVAS\nDEL SUR",       left: "26%", top: "40%", width: "33%", height: "58%", lx: 14, ly: 80, fx: 42, fy: 69 },
];

const ANIO_MIN = 300, ANIO_MAX = 1519, ANIO_CORTE = 900;
// Tamaño del mapa en el lienzo. El RECORTE (830×455 px del archivo) se escala
// a 420×230: factor 0.506, así que la imagen completa se dibuja a 696×389 y se
// desplaza (-177,-69) para que la ventana quede al ras.
const MAPA_W = 420, MAPA_H = 230;
const IMG_W = 696, IMG_H = 389, IMG_LEFT = -177, IMG_TOP = -69;

function RondaDial({ ids, asign, setAsign, revealed, anio, setAnio }) {
  const [sel, setSel] = useStateG(null);        // respaldo tap: ficha elegida
  const [drag, setDrag] = useStateG(null);      // arrastre en curso
  const zonaRef = useRefG({});
  const animRef = useRefG(null);
  const dragRef = useRefG(null);
  const justDragged = useRefG(false);

  const pendientes = ids.filter((id) => !asign[id]);   // asign guarda strings, nunca 0

  // Los rótulos van AL LADO del punto, no debajo: las ciudades mayas están muy
  // juntas de verdad (Mayapán y Uxmal, a 40 km) y debajo no se distinguía qué
  // nombre era de qué punto. De las dos de cada región, la de más a la
  // izquierda saca su nombre hacia la izquierda y la otra hacia la derecha, así
  // los nombres se separan en vez de amontonarse.
  const ladoRotulo = {};
  ["clasico", "posclasico"].forEach((reg) => {
    ids.filter((id) => CIUDADES[id].e === reg)
      .sort((a, b) => CIUDADES[a].x - CIUDADES[b].x)
      .forEach((id, i) => { ladoRotulo[id] = i === 0 ? "izq" : "der"; });
  });

  const epoca = anio < ANIO_CORTE ? "clasico" : "posclasico";
  const foco = REGIONES.find((r) => r.e === epoca);
  const pct = (anio - ANIO_MIN) / (ANIO_MAX - ANIO_MIN);

  // Suelta la ficha `id` en la zona `z`, animando el viaje desde donde quedó el dedo.
  function soltar(id, z, fromRect) {
    if (animRef.current) { try { animRef.current.cancel(); } catch (e) {} animRef.current = null; }
    setAsign((a) => ({ ...a, [id]: z }));
    setSel(null);
    const destino = zonaRef.current[z];
    if (!destino || !fromRect) return;
    const to = destino.getBoundingClientRect();
    requestAnimationFrame(() => {
      const chip = document.querySelector(`[data-chip="${id}"]`);
      if (!chip) return;
      const now = chip.getBoundingClientRect();
      const dx = fromRect.left - now.left, dy = fromRect.top - now.top;
      if (!dx && !dy) return;
      try {
        animRef.current = chip.animate(
          [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0,0)" }],
          { duration: 190, easing: "ease-out", fill: "backwards" }
        );
      } catch (e) {}
    });
  }

  function zonaEn(x, y) {
    for (const z of ["clasico", "posclasico"]) {
      const el = zonaRef.current[z];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return z;
    }
    return null;
  }

  // El estado del arrastre vive en un REF además de en el state: en el primer
  // gesto, el `pointerup` corre con el closure del render anterior y `drag`
  // todavía valía null, así que el gesto se perdía.
  function onChipDown(ev, id, colocada) {
    if (revealed) return;
    const r = ev.currentTarget.getBoundingClientRect();
    if (!colocada) setSel(id);                  // una ficha ya colocada no se "coge" con el tap
    const d = { id, colocada, x: ev.clientX, y: ev.clientY, ox: ev.clientX - r.left, oy: ev.clientY - r.top, moved: false };
    dragRef.current = d;
    setDrag(d);
    try { ev.currentTarget.setPointerCapture(ev.pointerId); } catch (e) {}
  }
  function onChipMove(ev) {
    const d = dragRef.current;
    if (!d) return;
    const next = { ...d, x: ev.clientX, y: ev.clientY, moved: true };
    dragRef.current = next;
    setDrag(next);
  }
  function onChipUp(ev) {
    const d = dragRef.current;
    dragRef.current = null;
    setDrag(null);
    if (!d) return;
    if (!d.moved) return;                       // fue un tap: lo resuelve el onClick
    justDragged.current = true;                 // que el click posterior no deshaga el arrastre
    setTimeout(() => { justDragged.current = false; }, 0);
    const z = zonaEn(ev.clientX, ev.clientY);
    if (z) soltar(d.id, z, { left: d.x - d.ox, top: d.y - d.oy });
    else if (d.colocada) devolver(d.id);        // sacada fuera de las cajas: vuelve a la bandeja
  }

  // Saca una ciudad ya colocada y la devuelve a la bandeja. Sin esto la ronda
  // es una trampa: una ficha mal puesta no se podía corregir.
  function devolver(id) {
    if (revealed) return;
    setAsign((a) => { const n = { ...a }; delete n[id]; return n; });
    // Queda ELEGIDA (resaltada, como recién sacada de la bandeja), lista para
    // soltarla tocando la otra caja. Así mover una ciudad de una caja a otra
    // son dos toques y se ve lo que llevas en la mano.
    setSel(id);
  }

  function tocarZona(z) {
    // OJO: `!sel` NO sirve — la ciudad 0 (Copán) es un índice falsy y el
    // respaldo tap se quedaba muerto justo con ella.
    if (revealed || sel === null) return;
    soltar(sel, z, null);
  }

  return (
    <>
      {/* Mapa de Mesoamérica con los marcadores de las 4 ciudades en juego */}
      <div style={{
        position: "absolute", left: 240, top: 134, width: MAPA_W, height: MAPA_H,
        borderRadius: 14, overflow: "hidden",
        border: "2px solid rgba(242,194,96,0.55)",
        background: "linear-gradient(180deg, #0e4a52 0%, #14626a 100%)",
        boxShadow: "0 10px 24px rgba(0,0,0,0.4)",
      }}>
        {/* Respaldo si el mapa faltara: queda el mar + dos masas de tierra. */}
        <svg viewBox="0 0 420 230" width="420" height="230" style={{ position: "absolute", inset: 0 }} aria-hidden="true">
          <path d="M150 115 L150 20 L250 12 L282 40 L270 100 L220 112 Z" fill="#dcc08a" opacity="0.9" />
          <path d="M60 170 L120 120 L200 118 L260 150 L300 200 L200 215 L110 205 Z" fill="#7e9a5e" opacity="0.85" />
        </svg>
        {/* Ampliada y recortada a la ventana de las 12 ciudades (ver CROP). */}
        <TemaFondo src="assets/mapa-mesoamerica.jpg" w={IMG_W} h={IMG_H} left={IMG_LEFT} top={IMG_TOP} />

        {/* La barra de los años aclara el sector que estaba vivo y oscurece el
            otro. La autora la pidió de vuelta: es lo que da vida al mapa. Ahora
            convive con los rótulos, que son los que hacen la ronda resoluble. */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
          background: `radial-gradient(ellipse 34% 40% at ${foco.fx}% ${foco.fy}%,`
            + " rgba(2,8,18,0) 0%, rgba(2,8,18,0) 54%, rgba(2,8,18,0.68) 100%)",
          transition: "background 0.4s ease",
        }} />

        {/* Las dos regiones, rotuladas con su nombre y sus fechas: aquí está la
            respuesta, a la vista. */}
        {REGIONES.map((r) => {
          const ep = EPOCAS[r.e];
          return (
            <React.Fragment key={r.e}>
              <div style={{
                position: "absolute", left: r.left, top: r.top, width: r.width, height: r.height,
                border: `2.5px dashed ${ep.color}`, borderRadius: 14,
                background: `${ep.color}22`, pointerEvents: "none", zIndex: 2,
              }} />
              <div style={{
                position: "absolute", left: `${r.lx}%`, top: `${r.ly}%`, transform: "translate(-50%,-50%)",
                background: "rgba(6,12,26,0.88)", borderRadius: 8, padding: "3px 9px", zIndex: 3,
                border: `1.5px solid ${ep.color}`, textAlign: "center", lineHeight: 1.15,
                pointerEvents: "none",
              }}>
                <div style={{
                  fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 9.5,
                  letterSpacing: "0.07em", color: ep.color, whiteSpace: "pre-line",
                }}>
                  {r.nombre}
                </div>
                <div style={{ fontFamily: "var(--ed-font-mono)", fontSize: 9, color: "#fce9a8" }}>
                  {ep.rango}
                </div>
              </div>
            </React.Fragment>
          );
        })}


        {ids.map((id) => {
          const c = CIUDADES[id];
          const puesta = asign[id];
          const bien = revealed && puesta === c.e;
          const mal = revealed && puesta && puesta !== c.e;
          return (
            <div key={id} style={{
              position: "absolute", left: `${c.x * 100}%`, top: `${c.y * 100}%`,
              transform: "translate(-50%,-50%)", width: 11, height: 11,
              pointerEvents: "none", zIndex: 4,
            }}>
              <div style={{
                width: 11, height: 11, borderRadius: "50%",
                background: mal ? "#ff6b6b" : bien ? "#2ecc8f" : "#fce9a8",
                border: "2px solid rgba(0,0,0,0.6)", boxShadow: "0 0 10px rgba(0,0,0,0.7)",
              }} />
              <div style={{
                position: "absolute", top: "50%", transform: "translateY(-50%)",
                ...(ladoRotulo[id] === "izq"
                  ? { right: "calc(100% + 6px)" }
                  : { left: "calc(100% + 6px)" }),
                fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 10.5,
                color: "#fff", background: "rgba(0,0,0,0.82)", padding: "2px 7px", borderRadius: 999,
                whiteSpace: "nowrap", textShadow: "0 1px 2px rgba(0,0,0,0.9)",
                border: "1px solid rgba(255,255,255,0.35)",
              }}>{c.n}</div>
            </div>
          );
        })}
      </div>

      {/* La barra de los años — aclara el sector que estaba vivo en el mapa */}
      <div style={{ position: "absolute", left: 240, top: 368, width: 420, height: 36 }}>
        <input
          type="range" min={ANIO_MIN} max={ANIO_MAX} value={anio}
          onChange={(e) => setAnio(parseInt(e.target.value, 10))}
          aria-label="Año"
          style={{ width: "100%", accentColor: EPOCAS[epoca].color, cursor: "pointer" }}
        />
        <div style={{
          position: "absolute", left: `${pct * 100}%`, top: 19, transform: "translateX(-50%)",
          fontFamily: "var(--ed-font-mono)", fontSize: 11.5, color: "#fce9a8", whiteSpace: "nowrap",
          background: "rgba(0,0,0,0.55)", padding: "1px 8px", borderRadius: 999,
        }}>{anio} d. C.</div>
      </div>

      {/* Las dos cajas de época — aquí caen las ciudades */}
      <div style={{ position: "absolute", left: 240, top: 410, width: 420, height: 58, display: "flex", gap: 10 }}>
        {["clasico", "posclasico"].map((z) => {
          const ep = EPOCAS[z];
          const activo = sel !== null;        // resalta los dos destinos posibles
          const dentro = ids.filter((id) => asign[id] === z);
          return (
            <div key={z}
              ref={(el) => { zonaRef.current[z] = el; }}
              onClick={() => tocarZona(z)}
              style={{
                flex: 1, borderRadius: 12, padding: "5px 8px",
                border: `2px ${activo ? "solid" : "dashed"} ${activo ? ep.color : "rgba(242,194,96,0.45)"}`,
                background: activo ? `${ep.color}22` : "rgba(10,6,35,0.45)",
                cursor: sel !== null && !revealed ? "pointer" : "default",
                transition: "all 0.25s ease", display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              }}>
              <div style={{
                fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 10,
                letterSpacing: "0.04em", color: ep.color, whiteSpace: "nowrap",
              }}>
                {ep.label} <span style={{ color: "rgba(255,255,255,0.62)", fontWeight: 600, fontSize: 9.5 }}>{ep.rango}</span>
              </div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "center" }}>
                {dentro.map((id) => {
                  const c = CIUDADES[id];
                  const bien = revealed && c.e === z;
                  return (
                    <div key={id} data-chip={id}
                      // Se puede ARRASTRAR a la otra caja (o fuera, para
                      // devolverla). Y si el niño trae una ciudad en la mano,
                      // la ficha NO intercepta: el toque cae en la caja.
                      onPointerDown={(e) => { if (!revealed && sel === null) onChipDown(e, id, true); }}
                      onPointerMove={onChipMove}
                      onPointerUp={onChipUp}
                      onClick={(e) => {
                        if (revealed || sel !== null) return;
                        e.stopPropagation();
                        if (justDragged.current) return;   // ya lo resolvió el arrastre
                        devolver(id);
                      }}
                      title={revealed || sel !== null ? undefined : "Arrástrala a la otra caja, o tócala para devolverla"}
                      style={{
                        cursor: revealed ? "default" : "grab",
                        touchAction: "none",
                        opacity: drag && drag.id === id && drag.moved ? 0.35 : 1,
                      fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 11.5,
                      padding: "2px 8px", borderRadius: 999,
                      background: revealed ? (bien ? "#2ecc8f" : "#ff6b6b") : "linear-gradient(180deg, #fff8e6, #f7e3a8)",
                      color: revealed ? (bien ? "#06381f" : "#fff") : "#3a2608",
                      border: "1.5px solid rgba(0,0,0,0.25)",
                    }}>{c.n}{revealed ? (bien ? " ✓" : " ✗") : ""}</div>
                  );
                })}
                {/* Al fallar, se revela aquí la ciudad que SÍ correspondía a este tramo */}
                {/* La correcta tiene que GRITAR: es lo que hay que aprender.
                    En translúcido con borde punteado casi no se veía. */}
                {revealed && ids.filter((id) => CIUDADES[id].e === z && asign[id] !== z).map((id) => (
                  <div key={"r" + id} style={{
                    fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 12.5,
                    padding: "3px 10px", borderRadius: 999,
                    background: "linear-gradient(180deg,#5cf0ac,#15a86b)",
                    color: "#04301a", border: "2px solid #eafff5",
                    boxShadow: "0 0 18px rgba(46,204,143,0.95), 0 2px 6px rgba(0,0,0,0.4)",
                  }}>{CIUDADES[id].n} ✓</div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bandeja de ciudades por ubicar */}
      <div style={{ position: "absolute", left: 240, top: 474, width: 420, minHeight: 44,
        display: "flex", gap: 8, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
        {pendientes.map((id) => {
          const c = CIUDADES[id];
          const activa = sel === id;
          return (
            <button key={id} data-chip={id} data-sel={activa ? "1" : "0"}
              onPointerDown={(e) => onChipDown(e, id, false)}
              onPointerMove={onChipMove}
              onPointerUp={onChipUp}
              disabled={revealed}
              style={{
                fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 13,
                padding: "8px 14px", borderRadius: 12, touchAction: "none",
                background: "linear-gradient(180deg, #fff8e6 0%, #f7e3a8 100%)",
                color: "#3a2608", cursor: revealed ? "default" : "grab",
                border: `2.5px solid ${activa ? "#4fd8ff" : "#f2c260"}`,
                boxShadow: activa ? "0 0 16px rgba(79,216,255,0.6)" : "inset 0 1px 0 rgba(255,255,255,0.8), 0 5px 12px rgba(0,0,0,0.3)",
                opacity: drag && drag.id === id ? 0.35 : 1,
              }}>{c.n}</button>
          );
        })}
        {pendientes.length === 0 && !revealed && (
          <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 13, color: "#fce9a8" }}>
            Ya ubicaste las cuatro. Toca ¡VERIFICAR!
          </div>
        )}
      </div>


      {/* Fantasma que sigue al dedo mientras se arrastra */}
      {drag && drag.moved && (
        <PortalToBody>
          <div style={{
            position: "fixed", left: drag.x - drag.ox, top: drag.y - drag.oy, zIndex: 1200, pointerEvents: "none",
            fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 13, padding: "8px 14px", borderRadius: 12,
            background: "linear-gradient(180deg, #fff8e6 0%, #f7e3a8 100%)", color: "#3a2608",
            border: "2.5px solid #4fd8ff", boxShadow: "0 10px 24px rgba(0,0,0,0.5)",
          }}>{CIUDADES[drag.id].n}</div>
        </PortalToBody>
      )}
    </>
  );
}

// ═════════════════════════════════════════════════════════════
// RONDA 2 — Estela maya
// ═════════════════════════════════════════════════════════════
// Los símbolos se guardan como una LISTA EN ORDEN de colocación, para que
// BORRAR pueda quitar el último uno a uno (la autora pidió deshacer paso a
// paso, no vaciar de golpe).
function nivelesDe(puestos) {
  return {
    veintes: puestos.filter((p) => p.nivel === "veintes").map((p) => p.tipo),
    unidades: puestos.filter((p) => p.nivel === "unidades").map((p) => p.tipo),
  };
}

function RondaEstela({ numero, puestos, setPuestos, revealed }) {
  const objetivo = NUMEROS[numero];
  const okVeintes = Math.floor(objetivo / 20);
  const okUnidades = objetivo % 20;
  const [nivelSel, setNivelSel] = useStateG("veintes");
  const niveles = nivelesDe(puestos);

  const vV = valorDe(niveles.veintes);
  const vU = valorDe(niveles.unidades);
  const tieneCaracolV = niveles.veintes.indexOf("caracol") !== -1;
  const tieneCaracolU = niveles.unidades.indexOf("caracol") !== -1;
  const leido = (tieneCaracolV ? 0 : vV) * 20 + (tieneCaracolU ? 0 : vU);

  function poner(tipo) {
    if (revealed) return;
    setPuestos((ps) => {
      // El caracol (cero) es exclusivo: ocupa el nivel él solo.
      let next = tipo === "caracol"
        ? ps.filter((p) => p.nivel !== nivelSel)
        : ps.filter((p) => !(p.nivel === nivelSel && p.tipo === "caracol"));
      next = next.concat({ nivel: nivelSel, tipo });
      const nv = nivelesDe(next);
      if (valorDe(nv[nivelSel]) > 19) return ps;   // un nivel maya no pasa de 19
      return next;
    });
  }

  // BORRAR quita el ÚLTIMO símbolo colocado, uno a uno (la autora pidió
  // deshacer paso a paso, no vaciar el nivel entero de golpe).
  function borrar() {
    if (revealed) return;
    setPuestos((ps) => ps.slice(0, -1));
  }

  // Tocar un símbolo ya puesto también lo quita.
  function quitar(nivel, tipo) {
    if (revealed) return;
    setPuestos((ps) => {
      for (let i = ps.length - 1; i >= 0; i--) {
        if (ps[i].nivel === nivel && ps[i].tipo === tipo) {
          return ps.slice(0, i).concat(ps.slice(i + 1));
        }
      }
      return ps;
    });
  }

  function Registro({ nivel, titulo, esperado }) {
    const pieces = niveles[nivel];
    const valor = pieces.indexOf("caracol") !== -1 ? 0 : valorDe(pieces);
    const bien = revealed && valor === esperado && pieces.length > 0;
    const mal = revealed && !bien;
    const activo = nivelSel === nivel;
    return (
      <div data-nivel={nivel} onClick={() => !revealed && setNivelSel(nivel)} style={{
        flex: 1, borderRadius: 10, padding: "4px 8px", minHeight: 74,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
        border: `2px ${activo && !revealed ? "solid" : "dashed"} ${mal ? "#c0392b" : bien ? "#1e8a5d" : activo ? "#2b8fb5" : "rgba(58,38,8,0.35)"}`,
        background: mal ? "rgba(255,107,107,0.38)" : bien ? "rgba(46,204,143,0.38)" : activo ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.28)",
        cursor: revealed ? "default" : "pointer", transition: "all 0.18s ease",
      }}>
        {/* El título es el BOTÓN para elegir dónde escribir: tiene que verse
            que se puede tocar (la autora no encontró cómo cambiar de nivel). */}
        <div style={{
          fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 9.5,
          letterSpacing: "0.08em", padding: "2px 10px", borderRadius: 999,
          background: activo && !revealed ? "linear-gradient(180deg,#8fe3ff,#2b8fb5)" : "rgba(58,38,8,0.14)",
          color: activo && !revealed ? "#04293a" : "#5a4420",
          border: `1.5px solid ${activo && !revealed ? "#2b8fb5" : "rgba(58,38,8,0.35)"}`,
          boxShadow: activo && !revealed ? "0 0 12px rgba(79,216,255,0.6)" : "none",
        }}>
          {titulo}
        </div>
        <FilaGlifos pieces={pieces} color="#3a2608" onQuitar={(t) => quitar(nivel, t)} />
        {/* La respuesta correcta YA NO se mete aquí dentro: no cabía y quedaba
            ilegible. Va en un panel grande a la derecha (ver más abajo). */}
      </div>
    );
  }

  return (
    <>
      {/* La estela — 178×319 conserva el ratio 0.558 del archivo (768×1376). El
          panel tallado del centro ocupa x 22-78 % e y 14-85 % de la imagen: ahí
          van los dos registros. */}
      <div style={{
        position: "absolute", left: 238, top: 134, width: 196, height: 352,
        borderRadius: 12, overflow: "hidden",
        border: "2px solid rgba(242,194,96,0.55)",
        boxShadow: "0 10px 24px rgba(0,0,0,0.4)",
        background: "linear-gradient(180deg, #e8e3d5 0%, #cfc8b6 100%)",
      }}>
        <TemaImg src="assets/estela-maya.jpg" alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "fill" }} />
        <div style={{
          position: "absolute", left: "22%", right: "22%", top: "14%", bottom: "15%",
          display: "flex", flexDirection: "column", gap: 6,
        }}>
          <Registro nivel="veintes" titulo="VEINTES" esperado={okVeintes} />
          <Registro nivel="unidades" titulo="UNIDADES" esperado={okUnidades} />
        </div>
      </div>

      {/* Lectura en vivo de lo que lleva escrito */}
      <div style={{
        position: "absolute", left: 450, top: 143, width: 212, display: "flex", justifyContent: "center",
      }}>
        {/* NEUTRA siempre: si se pusiera verde al coincidir con el número
            pedido, estaría dando la respuesta antes de ¡VERIFICAR!. */}
        <div data-lectura={leido} style={{
          display: "flex", alignItems: "center", gap: 10, padding: "6px 18px", borderRadius: 999,
          background: "rgba(10,6,35,0.6)", border: "1.5px solid rgba(242,194,96,0.5)",
          fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 14, color: "#fce9a8",
        }}>
          <span style={{ fontFamily: "var(--ed-font-mono)", fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
            20 × {tieneCaracolV ? 0 : vV} + {tieneCaracolU ? 0 : vU}
          </span>
          <span style={{ color: "#fce9a8", fontSize: 18 }}>= {leido}</span>
        </div>
      </div>

      {/* Al revelar, la columna derecha deja de ser bandeja y muestra LA
          RESPUESTA en grande. Antes se metía dentro de la estela, apretada
          entre los dos registros, y no se leía. */}
      {revealed && (
        <div style={{
          position: "absolute", left: 450, top: 195, width: 212, padding: "14px 10px",
          borderRadius: 16, textAlign: "center",
          background: "linear-gradient(180deg, rgba(92,240,172,0.96), rgba(21,168,107,0.96))",
          border: "2.5px solid #eafff5", boxShadow: "0 0 26px rgba(46,204,143,0.8), 0 8px 20px rgba(0,0,0,0.45)",
        }}>
          <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 11, letterSpacing: "0.08em", color: "#04301a" }}>
            LA RESPUESTA ERA
          </div>
          {[["VEINTES", okVeintes], ["UNIDADES", okUnidades]].map(([t, d]) => (
            <div key={t} style={{
              marginTop: 8, padding: "6px 8px", borderRadius: 10,
              background: "rgba(255,255,255,0.72)", border: "1.5px solid rgba(4,48,26,0.35)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            }}>
              <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 9.5, letterSpacing: "0.08em", color: "#04301a" }}>{t}</div>
              <FilaGlifos pieces={simbolos(d)} color="#0b3d24" />
            </div>
          ))}
          <div style={{
            marginTop: 10, fontFamily: "var(--ed-font-mono)", fontSize: 13, fontWeight: 700, color: "#04301a",
          }}>
            20 × {okVeintes} + {okUnidades} = {objetivo}
          </div>
        </div>
      )}

      {/* Bandeja de símbolos — columna a la derecha de la estela */}
      {!revealed && (
      <div style={{
        position: "absolute", left: 450, top: 195, width: 212,
        display: "flex", flexDirection: "column", gap: 10,
      }}>
        {[
          { t: "punto", n: "PUNTO", v: "1" },
          { t: "barra", n: "BARRA", v: "5" },
          { t: "caracol", n: "CARACOL", v: "0" },
        ].map((s) => (
          <button key={s.t} onClick={() => poner(s.t)} disabled={revealed}
            style={{
              width: "100%", height: 68, borderRadius: 14,
              background: "linear-gradient(180deg, #fff8e6 0%, #f7e3a8 100%)",
              border: "2.5px solid #f2c260", cursor: revealed ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 14,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 5px 12px rgba(0,0,0,0.3)",
              opacity: revealed ? 0.55 : 1,
            }}>
            <Glifo tipo={s.t} />
            <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 12, letterSpacing: "0.06em", color: "#3a2608" }}>
              {s.n} = {s.v}
            </span>
          </button>
        ))}
      </div>
      )}

      {/* BORRAR — quita el último símbolo (patrón 1 de mechanics-design.md) */}
      {!revealed && (
      <div style={{ position: "absolute", left: 450, top: 433, width: 212 }}>
        <button onClick={borrar} disabled={revealed || puestos.length === 0}
          style={{
            width: "100%", height: 44, borderRadius: 14,
            fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 14, letterSpacing: "0.04em",
            background: "rgba(10,6,35,0.6)", color: "#ffb4b4",
            border: "2px solid rgba(255,107,107,0.65)",
            cursor: revealed || puestos.length === 0 ? "not-allowed" : "pointer",
            opacity: revealed || puestos.length === 0 ? 0.4 : 1,
          }}>
          BORRAR
        </button>
      </div>
      )}
    </>
  );
}

// ═════════════════════════════════════════════════════════════
// RONDA 3 — Códice azteca
// ═════════════════════════════════════════════════════════════
function RondaCodice({ cronica, elegidas, setElegidas, revealed }) {
  const c = CRONICAS[cronica];
  const [abierto, setAbierto] = useStateG(null);
  // Solo para el color: marca las que el estudiante ya revisó (las abrió y
  // decidió), aunque haya dejado la misma palabra. No influye en la nota.
  const [revisadas, setRevisadas] = useStateG([false, false, false, false]);
  // Orden de las dos opciones de cada hueco, barajado una vez por partida.
  const [orden] = useStateG(() =>
    c.partes.filter((p) => typeof p !== "string").map(() => Math.random() < 0.5));

  let hueco = -1;
  const nodos = c.partes.map((p, i) => {
    if (typeof p === "string") return <span key={i}>{p}</span>;
    hueco++;
    const h = hueco;
    const opciones = orden[h] ? [p.bien, p.mal] : [p.mal, p.bien];
    const elec = elegidas[h];                 // guarda la PALABRA elegida, no un índice
    const bien = revealed && elec === p.bien;
    const mal = revealed && elec !== null && elec !== p.bien;
    // Sin elegir: ÁMBAR (resaltador), nunca rojo — el rojo le diría al
    // estudiante "esta está mal" antes de que decida, y no es lo que se le
    // pide: se le pide revisarlas.  Ya elegida: azul (respondida, sin juicio).
    // Solo al verificar aparecen el verde y el rojo.
    let bg = "rgba(242,194,96,0.45)", bd = "#a8762a", col = "#4a3410", deco = "none";
    if (revisadas[h] && !revealed) { bg = "rgba(79,160,255,0.32)"; bd = "#2b6fb5"; col = "#10304f"; }
    if (bien) { bg = "rgba(46,204,143,0.42)"; bd = "#1e8a5d"; col = "#06381f"; }
    if (mal) { bg = "rgba(255,107,107,0.42)"; bd = "#c0392b"; col = "#6b1111"; deco = "line-through"; }
    return (
      <span key={i} style={{ position: "relative", display: "inline-block" }}>
        <span
          data-hueco={h}
          onClick={() => !revealed && setAbierto(abierto === h ? null : h)}
          style={{
            display: "inline-block", padding: "0 6px", borderRadius: 6, margin: "0 1px",
            background: bg, border: `1.5px solid ${bd}`, color: col, textDecoration: deco,
            fontWeight: 800, cursor: revealed ? "default" : "pointer",
          }}>
          {elec === null ? p.mal : elec}
        </span>
        {mal && (
          <span style={{
            display: "inline-block", padding: "1px 8px", borderRadius: 6, marginLeft: 5,
            background: "linear-gradient(180deg,#5cf0ac,#15a86b)",
            border: "2px solid #0a6b43", color: "#04301a", fontWeight: 800,
            boxShadow: "0 0 14px rgba(46,204,143,0.85)",
          }}>{p.bien} ✓</span>
        )}
        {abierto === h && !revealed && (
          <span style={{
            // Los dos últimos huecos abren HACIA ARRIBA: abriendo siempre hacia
            // abajo, el selector tapaba el renglón siguiente (y el hueco 4).
            position: "absolute", left: "50%", transform: "translateX(-50%)",
            ...(h >= 2 ? { bottom: "calc(100% + 6px)" } : { top: "calc(100% + 6px)" }),
            zIndex: 30, display: "flex", gap: 6, padding: 6, borderRadius: 10,
            background: "rgba(10,6,35,0.96)", border: "1.5px solid rgba(242,194,96,0.7)",
            boxShadow: "0 10px 24px rgba(0,0,0,0.55)", whiteSpace: "nowrap",
          }}>
            {opciones.map((o, oi) => (
              <button key={oi} data-op={oi}
                onClick={() => {
                  setElegidas((e) => { const n = e.slice(); n[h] = o; return n; });
                  setRevisadas((r) => { const n = r.slice(); n[h] = true; return n; });
                  setAbierto(null);
                }}
                style={{
                  fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 13,
                  padding: "5px 12px", borderRadius: 8, cursor: "pointer",
                  background: elec === o ? "linear-gradient(180deg,#48e09a,#1a8f5f)" : "linear-gradient(180deg,#fff8e6,#f7e3a8)",
                  color: elec === o ? "#06381f" : "#3a2608", border: "2px solid #f2c260",
                }}>{o}</button>
            ))}
          </span>
        )}
      </span>
    );
  });


  return (
    <>
      {/* Bloque centrado en el alto libre (104..520): 52 px de aire arriba y
          abajo. Antes el papel quedaba pegado al enunciado y sobraba un hueco
          grande debajo. */}
      <div data-fuente={c.fuente} style={{
        position: "absolute", left: 238, top: 134, width: 424, height: 342,
        borderRadius: 10, boxShadow: "0 10px 24px rgba(0,0,0,0.45)",
        background: "linear-gradient(180deg, #efe2c6 0%, #ddcba6 100%)",
      }}>
        {/* El archivo trae el papel sobre un fondo gris. Se amplía y se recorta
            para que SOLO se vea la hoja: ocupa x 4-97.5 % e y 20.5-79 % de la
            imagen, así que 637×476 desplazada (-111,-98) la deja al ras. */}
        <TemaFondo src="assets/papel-amate.jpg" w={783} h={585} left={-185} top={-120} radius={10} />
        <div style={{
          position: "relative", padding: "20px 22px",
          fontFamily: "var(--ed-font-ui)", fontSize: 14, lineHeight: 2.0, color: "#2d2113",
          textAlign: "justify",
        }}>
          {nodos}
        </div>
      </div>

      <div style={{
        position: "absolute", left: 238, top: 492, width: 424, textAlign: "center",
        fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 13, color: "#fce9a8",
      }}>
        {revealed ? "" : "Si alguna ya está bien, déjala así."}
      </div>
    </>
  );
}

// ═════════════════════════════════════════════════════════════
// GAME SCREEN
// ═════════════════════════════════════════════════════════════
const META = [
  { emoji: "🗺️", estrellas: 4,
    enunciado: "Arrastra cada ciudad a la época en que floreció.",
    pista: <>Mira en qué región<br />está en el mapa.</> },
  { emoji: "🔢", estrellas: 2,
    enunciado: "Escribe el número en la estela maya.",
    pista: <>Toca VEINTES o<br />UNIDADES y luego<br />un símbolo.</> },
  { emoji: "📜", estrellas: 4,
    enunciado: "Revisa las cuatro palabras resaltadas de la crónica.",
    pista: <>Toca una palabra<br />resaltada y elige<br />la correcta.</> },
];

function GameScreen({ app, setApp, go }) {
  const char = CHARACTERS.find((c) => c.id === app.character) || CHARACTERS[0];

  // Se sortea UNA sola vez al montar → recargar no repite (anti-repetición FIFO).
  const [datos, setDatos] = useStateG(() => ({
    ciudades: pickCiudades(), numero: pickNumero(), ...nuevaCronica(),
  }));

  const [idx, setIdx] = useStateG(0);
  const [revealed, setRevealed] = useStateG(false);
  const [feedback, setFeedback] = useStateG(null);
  const [feedbackMsg, setFeedbackMsg] = useStateG("");
  const [aciertos, setAciertos] = useStateG(0);
  const [stars, setStars] = useStateG(0);
  const [elapsed, setElapsed] = useStateG(0);
  const [log, setLog] = useStateG([]);
  const [confirmingExit, setConfirmingExit] = useStateG(false);
  const [confirmingRestart, setConfirmingRestart] = useStateG(false);

  // Respuestas de cada ronda
  const [asign, setAsign] = useStateG({});
  const [anio, setAnio] = useStateG(620);
  const [puestos, setPuestos] = useStateG([]);
  const [elegidas, setElegidas] = useStateG(() => datos.cronicaIni.slice());

  const started = useRefG(Date.now());
  const exerciseStart = useRefG(Date.now());
  const advancing = useRefG(false);

  useEffectG(() => {
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - started.current) / 1000));
    }, 500);
    return () => clearInterval(id);
  }, []);

  const meta = META[idx];

  function formatTime(s) {
    const m = Math.floor(s / 60), ss = s % 60;
    return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  }

  // `dd` solo se pasa al reiniciar, cuando ya hay datos nuevos; en el paso
  // normal de ronda se usan los de la partida en curso.
  function resetRondas(dd) {
    const dz = dd || datos;
    setAsign({}); setAnio(620);
    setPuestos([]);
    setElegidas(dz.cronicaIni.slice());
  }

  function confirmRestart() {
    setConfirmingRestart(false);
    advancing.current = false;
    const d = { ciudades: pickCiudades(), numero: pickNumero(), ...nuevaCronica() };
    setDatos(d);
    setIdx(0); setRevealed(false); setFeedback(null); setFeedbackMsg("");
    setAciertos(0); setStars(0); setLog([]);
    resetRondas(d);
    started.current = Date.now();
    exerciseStart.current = Date.now();
  }

  // ¿Está la ronda lista para verificar?
  function completa() {
    if (idx === 0) return datos.ciudades.every((id) => asign[id]);
    // R2: basta con haber escrito ALGO. Exigir los dos registros llenos dejaba
    // ¡VERIFICAR! apagado sin explicar por qué y parecía que solo se habilitaba
    // al acertar. Un registro vacío simplemente cuenta como fallo y se revela.
    if (idx === 1) return puestos.length > 0;
    return true;   // R3: todas las palabras ya traen una opción puesta
  }

  // Corrige la ronda actual y devuelve { got, total, userAnswer, correctAnswer }.
  function corregir() {
    if (idx === 0) {
      const got = datos.ciudades.filter((id) => asign[id] === CIUDADES[id].e).length;
      return {
        got, total: 4,
        userAnswer: datos.ciudades.map((id) => `${CIUDADES[id].n} → ${EPOCAS[asign[id]].label}`).join(" · "),
        correctAnswer: datos.ciudades.map((id) => `${CIUDADES[id].n} → ${EPOCAS[CIUDADES[id].e].label}`).join(" · "),
      };
    }
    if (idx === 1) {
      const objetivo = NUMEROS[datos.numero];
      const okV = Math.floor(objetivo / 20), okU = objetivo % 20;
      const niveles = nivelesDe(puestos);
      const vV = niveles.veintes.indexOf("caracol") !== -1 ? 0 : valorDe(niveles.veintes);
      const vU = niveles.unidades.indexOf("caracol") !== -1 ? 0 : valorDe(niveles.unidades);
      // Un registro VACÍO nunca cuenta como acierto: si no, un nivel que vale 0
      // se daría por bueno sin haber puesto el caracol.
      const got = (niveles.veintes.length > 0 && vV === okV ? 1 : 0)
        + (niveles.unidades.length > 0 && vU === okU ? 1 : 0);
      return {
        got, total: 2,
        userAnswer: `20 × ${vV} + ${vU} = ${vV * 20 + vU}`,
        correctAnswer: `20 × ${okV} + ${okU} = ${objetivo}`,
      };
    }
    const c = CRONICAS[datos.cronica];
    const huecos = c.partes.filter((p) => typeof p !== "string");
    const got = huecos.filter((p, i) => elegidas[i] === p.bien).length;
    return {
      got, total: 4,
      userAnswer: elegidas.join(" · "),
      correctAnswer: huecos.map((p) => p.bien).join(" · "),
    };
  }

  function verificar() {
    if (revealed || advancing.current || !completa()) return;
    if (typeof markFirstAttempt === "function") markFirstAttempt();

    const r = corregir();
    const perfecta = r.got === r.total;
    const exSec = Math.max(0, Math.floor((Date.now() - exerciseStart.current) / 1000));

    const entry = {
      idx: idx + 1,
      emoji: meta.emoji,
      a: idx === 1 ? `Escribe el número ${NUMEROS[datos.numero]} en la estela maya.` : meta.enunciado,
      userAnswer: r.userAnswer,
      correctAnswer: r.correctAnswer,
      isCorrect: perfecta,
      time: exSec,
    };

    const newLog = [...log, entry];
    const newAciertos = aciertos + (perfecta ? 1 : 0);
    const newStars = stars + r.got;            // fallar NO resta lo ya ganado
    const isLast = idx + 1 >= ROUNDS;

    setRevealed(true);
    setLog(newLog);
    setAciertos(newAciertos);
    setStars(newStars);
    advancing.current = true;

    if (perfecta) {
      setFeedback("ok");
      setFeedbackMsg(`+${r.got} ⭐`);
      setTimeout(() => advance(newLog, newAciertos, newStars, isLast), 1400);
    } else {
      // La revelación limpia se ve 2.2 s SIN overlay, para alcanzar a estudiarla.
      setTimeout(() => {
        setFeedback("err");
        setFeedbackMsg(r.got > 0 ? `+${r.got} ⭐` : ANIMOS[idx % ANIMOS.length]);
      }, 2200);
      setTimeout(() => advance(newLog, newAciertos, newStars, isLast), 3100);
    }
  }

  function advance(newLog, newAciertos, newStars, isLast) {
    setFeedback(null);
    setFeedbackMsg("");
    if (!isLast) {
      setIdx((i) => i + 1);
      setRevealed(false);
      resetRondas();
      exerciseStart.current = Date.now();
      advancing.current = false;
    } else {
      setApp((s) => ({
        ...s,
        stars: newStars,
        lastResult: {
          category: CAT_LABEL,
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

  const enunciado = idx === 1
    ? `Escribe el número ${NUMEROS[datos.numero]} en la estela maya.`
    : meta.enunciado;

  const listo = completa() && !revealed;

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
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

      {/* ── RONDA con dots (juego de 1 solo nivel, sin pastillas) — top: 52 (§1.1) ── */}
      <div style={{ position: "absolute", top: 52, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 8 }}>
        <span className="ed-label" style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, letterSpacing: "0.06em" }}>Ronda</span>
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

      {/* ── Enunciado (QUÉ hacer) ── */}
      <div style={{
        position: "absolute", top: 86, left: 150, right: 150, textAlign: "center",
        fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 19, lineHeight: 1.15,
        color: "#fff", textShadow: "0 2px 6px rgba(0,0,0,0.55)", pointerEvents: "none",
      }}>
        {enunciado}
      </div>

      {/* ── Mecánica de la ronda ── */}
      {idx === 0 && (
        <RondaDial ids={datos.ciudades} asign={asign} setAsign={setAsign}
          revealed={revealed} anio={anio} setAnio={setAnio} />
      )}
      {idx === 1 && (
        <RondaEstela numero={datos.numero} puestos={puestos} setPuestos={setPuestos} revealed={revealed} />
      )}
      {idx === 2 && (
        <RondaCodice cronica={datos.cronica} elegidas={elegidas} setElegidas={setElegidas} revealed={revealed} />
      )}

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
            {revealed ? (log.length && log[log.length - 1].isCorrect ? "¡Muy bien!" : <>¡Casi! Mira<br />la respuesta.</>) : meta.pista}
            <div style={{ position: "absolute", bottom: -10, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "9px solid transparent", borderRight: "9px solid transparent", borderTop: "10px solid rgba(20,12,55,0.95)", filter: "drop-shadow(0 1px 0 rgba(242,194,96,0.55))" }} />
          </div>
        </div>
        <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
          <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", width: 140, height: 16, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(242,194,96,0.45), transparent 70%)", filter: "blur(5px)" }} />
          <char.Component size={186} floating />
        </div>
        <div style={{ marginTop: -2, fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 14, color: "#fce9a8", letterSpacing: "0.04em", textShadow: "0 2px 6px rgba(0,0,0,0.6)" }}>{char.name}</div>
      </div>

      {/* ── Acciones (derecha): ¡VERIFICAR! · REINICIAR · SALIR ── */}
      <div style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 12, width: 150 }}>
        <button className="ed-btn ed-btn-verify" onClick={verificar} disabled={!listo}
          title="Revisar la respuesta"
          style={{ fontSize: 16, padding: "0 10px", height: 56, fontWeight: 800, letterSpacing: "0.04em", opacity: listo ? 1 : 0.45, cursor: listo ? "pointer" : "not-allowed" }}>
          ¡VERIFICAR!
        </button>
        <button className="ed-btn ed-btn-restart" onClick={() => setConfirmingRestart(true)} title="Empezar de nuevo"
          style={{ fontSize: 14, padding: "0 10px", height: 48, fontWeight: 800, letterSpacing: "0.04em" }}>
          REINICIAR
        </button>
        <button className="ed-btn ed-btn-ghost" onClick={() => setConfirmingExit(true)} title="Salir al inicio"
          style={{ fontSize: 14, padding: "0 10px", height: 48, fontWeight: 800, letterSpacing: "0.04em" }}>
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
                {feedbackMsg}
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
              <p className="ed-body" style={{ marginBottom: 16, fontSize: 14 }}>Vas a jugar con ejercicios nuevos.</p>
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
              <th style={printStyles.th}>Ejercicio</th>
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
          <div style={printStyles.cell}><div style={printStyles.cellL}>Ejercicios</div><div style={printStyles.cellV}>{attemptedCount} / {res.total}</div></div>
          <div style={printStyles.cell}><div style={printStyles.cellL}>Correctos</div><div style={printStyles.cellV}>{res.solved}</div></div>
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
          <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 700,
            fontSize: 34,
            background: "linear-gradient(180deg, #fce9a8, #d9a441)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1, marginBottom: 4 }}>
            ¡Ronda completa!
          </div>
          <char.Component size={176} />
          <div className="ed-body" style={{ fontStyle: "italic", textAlign: "center", maxWidth: 240, fontSize: 13 }}>
            "{app.studentName || "Campeón"}, ganaste {res.starsEarned} de 10 estrellas."
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
                  <th style={{ textAlign: "left", padding: "6px 8px" }}>Ejercicio</th>
                  <th style={{ textAlign: "right", padding: "6px 8px" }}>Respondió</th>
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
                {(res.log || []).length === 0 && (<tr><td colSpan={5} style={{ padding: "16px 8px", textAlign: "center", color: "var(--ed-ink-soft)", fontStyle: "italic" }}>Sin ejercicios.</td></tr>)}
              </tbody>
            </table>
          </div>

          <div style={{ borderTop: "2px solid rgba(242,194,96,0.45)", paddingTop: 10, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, fontFamily: "var(--ed-font-ui)", fontSize: 11 }}>
            <SummaryCell label="Ejercicios" value={`${attemptedCount} / ${totalEx}`} />
            <SummaryCell label="Correctos" value={`${res.solved}`} tone="#2ecc8f" />
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
