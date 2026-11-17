// game-screens.jsx — juego-15 "Rumbo a la independencia" (Estudios Sociales · 13 años).
// Tema del libro: "El proceso de independencia en Sudamérica" (D.C.D. CS.4.1.36).
// 3 rondas encadenadas, cada una con una mecánica DISTINTA (orquestador SOC_ROUNDS):
//   R1 "La ruta libertadora"  — tocar un territorio en el mapa SVG + ¡VERIFICAR!
//   R2 "El despacho sin firma" — destapar pistas y deducir el protagonista + ¡VERIFICAR!
//   R3 "La cinta de la independencia" — arrastrar cada hecho a su año + ¡VERIFICAR!
//
// CONTRATO: GameScreen/ResultsScreen({app,setApp,go}) en window; markFirstAttempt() en la
// 1a respuesta; incrementGamesCompleted() al fin. Invariantes EDINUN: fallar NO baja el
// progreso; al fallar se revela la correcta en el lenguaje de la mecánica; salir/reiniciar
// con modal. Enunciado = QUE, bocadillo = COMO. Anti-repeticion por ronda.
//
// Todos los datos salen TEXTUALES del libro entregado por la autora: no hay cifras,
// fechas ni nombres inventados.

const { useState: useStateG, useEffect: useEffectG, useRef: useRefG } = React;

function PortalToBody({ children }) {
  return ReactDOM.createPortal(children, document.body);
}

const CAT_LABEL = "El proceso de independencia en Sudamérica";
const TOTAL = 3;

const ANIMOS = [
  "¡Casi! Revisa el dato y sigue.",
  "¡La próxima es tuya!",
  "Equivocarse también es aprender.",
];

// ── Anti-repeticion FIFO en localStorage (una clave por ronda) ──
function j15Recent(key) { try { const r = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(r) ? r : []; } catch (e) { return []; } }
function j15Push(key, id, cap) { try { const prev = j15Recent(key).filter((x) => x !== id); localStorage.setItem(key, JSON.stringify([id].concat(prev).slice(0, cap))); } catch (e) {} }
function j15Shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
// Elige k elementos de `pool` evitando los recientes de `key` y los registra.
// OJO cap: para elegir 1 de N, cap = N - 1 (maxima variedad). Para subconjuntos,
// NUNCA cap = k (partiria el banco en grupos fijos que alternan identico).
function j15Pick(pool, k, key, cap) {
  const recent = new Set(j15Recent(key)), all = pool.map((_, i) => i);
  const chosen = j15Shuffle(all.filter((i) => !recent.has(i))).concat(j15Shuffle(all.filter((i) => recent.has(i)))).slice(0, k);
  chosen.forEach((i) => j15Push(key, i, cap));
  return chosen.map((i) => pool[i]);
}

// ══════════════════════════════════════════════════════════════════
// R1 · "La ruta libertadora" — el niño TOCA en el mapa el territorio del hecho.
// Mapa SVG con los contornos reales de cada país (Natural Earth). Al acertar se
// pinta el territorio y se dibuja la flecha de avance de esa campaña.
// ══════════════════════════════════════════════════════════════════
// Contornos REALES de Natural Earth (ne_50m_admin_0_countries, dominio público),
// proyección plate carrée y simplificados con Douglas-Peucker. NO están dibujados
// a mano: el mapa anterior lo era y las formas estaban mal.
// Lienzo del mapa: 240×351.
const J15_MAPA_W = 240, J15_MAPA_H = 351;
const J15_MAPA = [
  { id: "ven", t: "Venezuela", lx: 78, ly: 27.4, d: "M110,20L110.8,21.5L106.3,25.2L108.2,27.9L104.1,29.5L104.2,32L102.9,33.4L106.8,38.8L102,41.9L96.1,43.3L95.3,45.5L92.8,43.7L89.3,43.8L85.4,42L88.3,45.6L89.2,51.2L92.6,51.6L92.5,52.6L81.4,60.5L80.9,59.1L77.5,60.2L74.6,57.8L72.9,51.7L69.5,49.7L72.3,46.4L69.5,40.8L71.5,32.2L61.4,32.5L57.8,28.2L48.1,27.8L45.7,25.3L46.1,21.3L44,17.1L41.1,16.6L44.6,8.2L48.4,3.9L51.7,2.9L48.4,4.4L50.2,9.1L47.6,13.4L49.8,17.3L52.1,16.8L53,14L50.8,9.7L50.9,7.5L59.5,4.9L59.4,3.9L57.5,4.1L57,2.8L58.5,1.2L60.4,4.8L64.5,5.1L66.7,6.5L68.1,9.9L77.8,9.2L79.9,11.2L83.6,12.1L90.8,9.9L87.9,9.2L100.4,8.7L95,9.7L95.9,12.2L96.9,11.4L98.1,13.6L99.3,12.6L101.1,14.4L101.9,13L106,15.8L103.6,19.7L101.7,19.7L103.3,20.7L110,20Z" },
  { id: "col", t: "Colombia", lx: 42.7, ly: 43.9, d: "M51.7,2.9L48.4,3.9L44.6,8.2L41.1,16.6L44,17.1L46.1,21.3L45.7,25.3L48.1,27.8L57.8,28.2L61.4,32.5L71.5,32.2L69.5,40.8L72.3,46.4L69.5,49.7L72.9,51.7L74.5,57.1L73.5,57.9L71.9,53.1L69.1,55L67.8,53.8L67.9,55.2L59.3,55.2L59.2,58.6L62,58.6L62.8,60.7L58.2,61.1L58.1,64.8L60.4,66.7L61.6,70.2L58.6,85.9L56.7,83.7L54.7,83.6L58,77.8L53.5,75.4L43.3,76.4L39.6,70.5L36.6,69.1L33.7,65.1L26.1,61.8L25,62.8L20.3,62L18.7,59.7L11.9,55.7L14.2,54.9L14.2,51.9L18.2,50L22,43.9L19.7,42.3L20.9,39.7L19.6,35.5L21.1,34.2L19.9,32.2L20.5,30.1L17.7,26.8L18.4,24.4L19.6,25L21.4,22.9L20.3,19.5L23.5,23.2L22.8,19.8L27.4,15.8L29.4,15.3L29.9,11.4L29,11.7L33.5,6.8L36.1,7.3L35.8,8.5L37.1,5.7L41.4,5.8L49.6,0L52,0.4L52.6,1.9L51.7,2.9Z" },
  { id: "ecu", t: "Ecuador", lx: 20, ly: 71, d: "M31.2,64.6L29.5,64.7L31.3,67.1L29.7,72L24,77.3L17.9,79.4L16.4,81.9L15.4,81.6L13.7,87.6L11.9,89.7L10.3,89.5L8.8,87L6.2,86.2L4.4,86.9L4.4,84.7L6,84.1L5.2,81.5L7.1,80.3L8.3,77.4L7.7,74.7L7.3,77.2L6.9,76.2L5.4,78L2.1,75.8L3,74L2.2,69.6L5.4,67.3L4.4,66L6.7,63.3L6.7,59.8L12.6,57.8L12.8,56.6L18.7,59.7L20.3,62L25,62.8L26.1,61.8L31.2,64.6Z" },
  { id: "per", t: "Perú", lx: 35.9, ly: 111.3, d: "M58.6,85.9L54.3,85.6L43.6,90.5L41.8,95.5L42.3,97.4L39.1,99.7L39.3,101.8L37.8,103L43.1,110.4L41.9,112.6L46.2,113.1L47.2,115.7L52.1,115.5L55.7,112.7L55.2,120.8L60.6,120.5L65.3,128.5L63.7,130.5L63.2,134.6L64.3,137.1L61.8,140.4L62.7,142.6L61.5,144.7L62.5,147.4L64.4,148.3L60.4,152.8L61,154.4L59.2,155.4L58.9,158L56.3,158.7L51.6,155.3L50.6,153.3L32.1,143.6L27.9,139.5L25.6,135.6L26.4,133L19.1,122.3L13.3,108.5L6.9,99L1,95.3L2.3,93.1L0,88.1L0.5,85.9L5.2,81.5L6,84.1L4.4,84.7L4.4,86.9L6.2,86.2L8.8,87L10.3,89.5L11.9,89.7L13.7,87.6L15.4,81.6L16.4,81.9L17.9,79.4L24,77.3L29.7,72L31.3,67.1L29.5,64.7L31.5,64.3L39.6,70.5L43.3,76.4L53.5,75.4L58,77.8L54.7,83.6L56.7,83.7L58.6,85.9Z" },
  { id: "bol", t: "Bolivia", lx: 86, ly: 150.3, d: "M61,154.4L60.4,152.8L64.4,148.3L62.5,147.4L61.5,144.7L62.7,142.6L61.8,140.4L64.3,137.1L63.2,134.6L63.7,130.5L65.3,128.5L60.6,120.5L65.6,121.4L76.1,115.1L82.2,114.2L82.3,122.1L84.3,125.8L87.3,128.2L94.2,129.4L100.8,133.8L104.5,133.6L107.4,135.2L108.6,141.9L107,141.9L108.8,143.9L109.1,148L118.6,148.1L118.3,153L121.2,154.4L123,158L119.7,165.9L121.1,167.1L119.9,168L119.4,166.3L114.7,163.5L101,165.4L98.3,170.1L96.4,178.7L95.4,177.5L89.8,177.7L87.7,181.8L86.3,178.7L80.3,178L78,176.5L72.9,181.8L70.3,182.1L69.4,181.8L67.8,173.9L64.9,169.4L66.4,164.2L63.8,161.9L63.1,157.2L61,154.4Z" },
  { id: "bra", t: "Brasil", lx: 145.6, ly: 119.9, d: "M74.6,57.8L77.3,60.1L80.7,59L81.8,60.5L83.7,58.3L88.4,56.2L89.4,54.1L92.3,52.9L92.6,51.6L89.2,51.2L88.3,45.6L85.4,42L89.3,43.8L92.8,43.7L95.3,45.5L96.1,43.3L104.9,40.7L106.8,38.8L106.7,37.1L110.1,37.8L109.3,40.7L111.6,41.5L112.4,43.8L110.8,45.6L110.1,50.2L111.8,55.1L115.9,57.9L124.9,53.7L130.9,54.5L130,52.4L130.9,51.1L136,50.7L140.3,53.1L142.2,51.9L146.3,52.8L154.1,41.8L155.3,42.9L157.9,53.1L161.9,55.5L162.2,58.1L155,64.5L151.4,71.1L147.9,72.1L151.6,72.2L157,68.9L158.1,73.1L159.5,74.5L165.2,73L163.5,77.8L165.7,73.9L168.3,71.7L170.1,71.7L169.6,70L171.4,67.9L175.7,67.4L185.1,71.1L185.7,72.9L187,71.6L189.2,73.1L189.8,74.6L188.7,75.7L190.3,75.2L190.6,76.3L188.8,80.6L191.4,76.8L191.6,78.6L195.8,76.3L205.6,79.1L213.4,78.8L221.1,83.2L227.8,89.4L236.2,90.5L237.8,92.8L240,101.7L239.2,107.4L235.9,113.3L226.8,122.1L222.3,130.3L220.9,130.9L220,129.2L219.1,130L217.9,134.1L219,145.9L217.6,155.4L215,158.2L214.3,165L208.3,173.6L208,177.5L204.4,179.1L202.7,182.4L197.9,182.5L196.9,181.3L196.6,182.6L189.3,183L189.6,184.1L185,186.8L182.4,186.8L177.8,189.1L172,193.2L170.9,195.2L168.2,194.9L169.9,196.1L168.1,199.5L169.1,204.3L167.8,211.4L162.9,215.5L156.9,225.3L151.1,229.7L151,228.2L155.1,226.4L158.6,221.1L158.7,220.1L156.3,220.7L154.9,219L155,222.7L151.5,225.9L147.9,235L144.2,238.1L143.4,235.2L145.5,232.9L142.2,229.4L132.7,223.2L130.7,224.4L130.5,222.8L126.4,219.3L122.4,219.8L131.2,210.4L132.3,210.4L132.1,209.5L141.8,203.9L142.7,199.3L140.9,196L137.8,196L139.8,188.1L137.8,186.9L133.7,187.6L131.7,179.4L128.4,177.9L125.8,178.9L120.4,177.8L121.2,172.4L119.5,168.1L121.1,167.1L119.7,165.9L123,158L121.2,154.4L118.3,153L118.6,148.1L109.1,148L108.8,143.9L107,141.9L108.6,141.9L107.4,135.2L104.5,133.6L100.8,133.8L94.2,129.4L87.3,128.2L84.3,125.8L82.3,122.1L82.2,114.2L76.1,115.1L65.6,121.4L55.2,120.8L55.7,112.7L52.1,115.5L47.2,115.7L46.2,113.1L41.9,112.6L43.1,110.4L37.8,103L39.3,101.8L39.1,99.7L42.3,97.4L41.8,95.5L43.6,90.5L54.3,85.6L58.6,86.2L61.6,70.2L60.4,66.7L58.1,64.8L58.2,61.1L62.8,60.7L62,58.6L59.2,58.6L59.3,55.2L67.9,55.2L67.8,53.8L69.1,55L71.9,53.1L73.5,57.9L74.6,57.8ZM163.5,65.2L169.9,65.6L167.6,71.2L164.2,71.9L162.6,73.3L159,73.3L157.7,70.5L158.7,69.7L157.5,68.7L158.3,65.5L163.5,65.2ZM152.2,71.5L153.7,67.4L155.2,66.9L155,69.3L152.2,71.5Z" },
  { id: "par", t: "Paraguay", lx: 118.4, ly: 184, d: "M119.5,168.1L121.2,172.4L120.6,178.1L125.8,178.9L128.4,177.9L131.5,179.1L133.7,187.6L137.8,186.9L139.8,188.1L137.1,200.9L132.2,205.5L129.8,205L128.4,206.2L117.2,204.9L119.8,199.1L122.6,195.8L122.2,194.7L110.6,188.3L104.7,186.6L96.4,178.7L98.3,170.1L101,165.4L114.7,163.5L119.4,166.3L119.5,168.1Z" },
  { id: "chi", t: "Chile", lx: 22, ly: 258, d: "M56.3,158.7L58.9,158L59.2,155.4L61,154.4L63.1,157.2L63.8,161.9L66.4,164.3L65.2,165.8L65.9,167L64.9,169.4L67.8,173.9L69.4,181.8L73.9,182.7L72.1,188L67.5,189.9L65.9,191.7L66.8,193.5L65.7,195.2L66.7,199L65.7,200.6L67.1,203.2L64.4,204.1L62.7,208.1L60.2,210.6L58.3,215.3L59.3,219.7L57.7,220.7L55.8,224.7L55.5,226.9L57.2,228.9L58,235.3L59.4,235.7L59.2,240.6L55.6,245.9L56.4,250.1L52.3,254.1L52.5,258.8L54.1,262.9L51.2,264.9L50.5,268.3L49.6,268.5L49.7,272.1L48.5,274.4L49.4,280.9L47.6,282L47.4,283.7L47.6,286.2L49.4,287.1L48.6,287.6L49.8,290.6L49.1,293L52.5,293.9L52,294.9L47.8,295L51.5,297.4L49.5,299.1L50.1,301.1L48.8,302.1L49.7,304.7L45.5,311L46.6,312.8L45,315.7L40,319.8L42.2,325.8L46.4,325.5L46.1,329.9L48.3,332.1L58.7,332.3L66.4,333.8L62.4,333.3L54.4,336.2L53.3,341.4L51.8,342L47.3,340.7L46,339.2L48.5,338.6L49.2,339.9L52.1,336.4L46.7,338.1L45.3,339.8L42.7,338.7L44.4,336.2L50.7,335.4L44.5,335L42.4,337.8L39.7,336.6L42.4,334.8L37.8,335.6L36.5,332.8L38.7,333.5L44.1,332L45.2,333.3L44.5,334.1L45.5,333.6L45.4,330.8L42.1,329.5L45.1,331.2L40.3,332.5L36.8,330.6L38.2,330.3L38.2,328.5L33.6,327.4L32.2,325.5L34.3,325.4L34.5,323.8L38.8,326.8L39.6,324.5L38,326.2L36.8,325.1L38.1,324.6L34.6,323L38.1,321.9L36.2,320.8L36.3,319.9L38.7,319.9L37.4,319L38.2,316.9L36.7,319.4L36,318.9L36.1,314.7L37.8,314.1L35.4,314L34.8,311.6L41,312.4L39.3,309.9L36.7,311.5L34.5,310.1L37.1,309.5L35.4,308.7L37,307.4L36.2,305.4L32.7,305.1L32.8,304L29.9,304.9L30.5,306.1L29,305L33.1,302.1L32.3,300.7L37,300.1L38.1,298.2L37.7,301.6L35.8,302.4L38,302.1L39.2,300.3L38.6,304.2L39.9,300.8L39.2,298.6L43.3,298.5L40.9,296.7L44.6,294.1L41.6,291.9L43,289.1L42.6,287.5L44.2,286.1L44.2,282L46,282.7L45.6,280.6L43.9,280.2L46.5,278.1L45.4,279.1L43.2,278.2L41.8,279.6L39.2,279.4L39.8,278.5L37.9,275.4L41.8,266.4L39.6,256.7L41.9,255.8L44.9,247.6L47,245.1L49.9,237.6L49.5,234.8L51,232.5L49.7,222L51.7,217L50.6,213.3L52.4,210.4L55.1,199.9L56.4,185.6L55.4,184L58,174.9L56.3,158.7ZM65.5,335.6L65.4,347L48.7,345.7L54.4,344.3L56.9,345.3L54,343.2L55.7,340.7L56.5,342.5L55.2,342.6L55.7,343.3L62.3,345.5L63.4,344.7L57.7,342L61.8,339.6L56.8,339.4L56.2,337.9L57.8,337.1L56.5,336.1L58.8,336.5L61.5,334.8L65.5,335.6ZM39,287.6L35.8,287L37.7,279.6L40.3,280.2L40.8,281.7L40.6,283.1L38.9,283.7L40.7,285.5L39,287.6ZM35.4,317.6L34.8,322L33.3,320.5L34.1,319L32.3,321.2L29.8,320.9L31.1,319.3L30.3,318.6L32.2,318.2L31.6,317.6L33.2,315.4L35,315.6L35.4,317.6ZM60,347.3L66.4,347.5L65.6,348.5L67.3,349.1L68.5,351.1L62.6,348.6L61.8,349.3L62.7,350.2L61.5,350L58.6,348.5L59.1,347.1L60,347.3ZM39.2,293L37.8,294.1L39.1,297.5L37.3,297.8L34.7,294.3L37.9,291.7L39.2,293ZM43.4,339.9L47.1,341.6L43.8,343.2L44.2,341.9L41.9,342.5L41.4,341.2L38.6,340.2L43.4,339.9ZM51.3,342.8L53.2,343.2L52.6,344.5L48.4,344.1L47.1,342.8L48.2,342L51.3,342.8ZM34.9,314.7L33.1,314.9L31.4,311.8L33.6,310.9L34.9,314.7ZM73.5,348.5L68.4,348.9L67.2,347.6L72.7,347.6L73.5,348.5ZM30.1,315.6L29.3,314.7L30.7,311.7L31.9,314.8L30.1,315.6ZM33.6,330.4L35.1,332.1L34.3,333.7L32.1,331.2L33.6,330.4ZM43.1,295L41,295L41.7,292.8L44.2,293.6L43.1,295Z" },
  { id: "arg", t: "Argentina", lx: 97, ly: 250, d: "M122.4,219.8L119.4,228.7L119.5,234.1L118.2,234.8L117.7,241L118.9,243L124.6,246.5L123.6,249.2L127,251.7L126.9,254.7L122.7,260.5L119.4,262.3L104.3,265.2L98,264.2L98.2,266.5L99.5,267.1L97.7,271.4L98.5,273.9L97.7,275L91.4,276.4L83.9,274.5L84.3,281.2L87.3,282.9L90.5,281.3L91.4,284.3L89.2,285.2L86.9,283.3L84.4,284.1L87.8,285.7L83,288.8L82.9,292.4L80.9,294.4L81,296.2L78.1,296L74.2,297.5L70.9,301.6L71.3,303.6L75.1,306.5L79.9,307.3L80.3,309.4L77.9,310.7L80.1,311.3L71.5,316.5L69.2,321.9L67.5,322.5L65.3,320.7L65.4,321.6L63.7,322L66.6,322.8L63.9,323.9L61.8,327.3L62.6,327.1L63.3,329.9L61.2,330.1L63.8,330.6L66.8,333.9L58.7,332.3L48.3,332.1L46.1,329.9L46.4,325.5L42.2,325.8L40,319.8L45,315.7L46.6,312.8L45.5,311L49.7,304.7L48.8,302.1L50.1,301.1L49.5,299.1L51.5,297.4L47.8,295L52,294.9L52.5,293.9L49.1,293L49.8,290.6L48.6,287.6L49.4,287.1L47.4,285.8L47.6,282L49.4,280.9L48.5,273.9L51.2,264.9L54,263.2L52.5,258.8L52.3,254.1L56.4,250.1L55.6,245.9L59.2,240.6L59.4,235.7L58,235.3L55.6,225.6L57.6,220.8L59.3,219.7L58.3,215.3L60.2,210.6L62.7,208.1L64.4,204.1L67.1,203.2L65.7,200.6L66.7,199L65.7,195.5L66.8,193.5L66.2,191.1L72.1,188L73.9,182.7L72.9,181.8L78,176.5L80.3,178L86.3,178.7L87.7,181.8L89.8,177.7L95.4,177.5L104.7,186.6L110.6,188.3L122.2,194.7L122.6,195.8L119.8,199.1L117.2,204.9L128.4,206.2L129.8,205L132.2,205.5L136.7,201.5L137.8,196L140.9,196L142.7,199.3L141.8,203.9L132.1,209.5L132.3,210.4L131.2,210.4L122.4,219.8ZM65.4,347L65.5,335.6L67.5,337.8L66.3,338.8L68,339L72.4,342.8L77.9,345.3L83.3,346.1L81.8,347.3L76.5,347.9L65.4,347Z" },
  { id: "uru", t: "Uruguay", lx: 152, ly: 236, d: "M144.2,238.1L142.1,241.4L136.3,244.2L129.4,244.1L124.6,241.8L121,241.7L118.1,238L118.5,235.2L119.9,234.1L119.4,228.7L122.2,220L126.4,219.3L130.5,222.8L130.7,224.4L132.7,223.2L142.2,229.4L145.5,232.9L143.4,235.2L144.2,238.1Z" },
];
// Territorios que completan la silueta pero no entran en el juego (no se tocan).
const J15_MAPA_INERTE = [
  { id: "guy", d: "M106.2,37.2L102.9,33.4L104.2,32L104.1,29.5L108.2,27.9L106.3,25.2L110.8,21.5L110,20L114.2,22.4L117.9,26.3L116.9,31.1L118.8,28.6L124.5,32.6L124.4,37.3L121,38.9L120.1,42.9L122.2,46.6L124,46.6L124.5,49.3L128.2,54L123.9,53.9L116.1,57.9L114,57L111.8,55.1L110.1,50.2L110.8,45.6L112.4,43.8L111.6,41.5L109.3,40.7L110.1,37.8L109.3,37L106.2,37.2Z" },
  { id: "sur", d: "M140.2,36.4L138.7,38.2L138.7,40.9L141,45.5L138.9,51.4L137.6,52.1L136,50.7L130.9,51.1L130,52.4L130.9,54.5L127,53.6L124,46.6L122.2,46.6L120.2,43.4L121,38.9L123.9,38L125.7,33.1L131.2,34.7L131.6,33.3L139.2,33.6L140.7,34.1L140.2,36.4Z" },
  { id: "guf", d: "M137.8,52.1L140,49.5L141,45.5L139.2,43.1L138.6,38.7L141.4,34.3L146.7,36.1L151,39.7L151.3,41.6L152.2,40.2L153.1,43.1L147.7,51.9L146.1,52.8L142.2,51.9L140.3,53.1L137.8,52.1Z" },
];

const J15_HECHOS_MAPA = [
  { h: "El 7 de agosto de 1819, Bolívar liberó este territorio, entonces llamado Nueva Granada.", pais: "col", desde: "ven" },
  { h: "Aquí se firmó el acta de independencia de 1811, donde Bolívar ganó notoriedad.", pais: "ven", desde: "ven" },
  { h: "La Batalla de Pichincha, el 24 de mayo de 1822, marcó el fin del dominio español en este territorio.", pais: "ecu", desde: "col" },
  { h: "El Grito de Ipiranga, el 7 de septiembre de 1822, conmemora la independencia de este país.", pais: "bra", desde: "bra" },
  { h: "José de San Martín libró batallas desde 1812 por la independencia de este territorio.", pais: "arg", desde: "arg" },
  { h: "La campaña de San Martín tuvo como consecuencia la liberación de este país en 1817.", pais: "chi", desde: "arg" },
  { h: "En 1824, tras la Batalla de Ayacucho, Bolívar y Sucre lograron liberar este territorio.", pais: "per", desde: "ecu" },
  { h: "En 1825, Sucre liberó el Alto Perú, que pasaría a llamarse República de Bolívar.", pais: "bol", desde: "per" },
  { h: "José Artigas y Antonio Lavalleja llevaron a cabo, entre 1811 y 1828, la independencia de este país.", pais: "uru", desde: "uru" },
  { h: "Fulgencio Yegros y José Rodríguez de Francia protagonizaron, de 1811 a 1842, la independencia de este país.", pais: "par", desde: "par" },
];
const J15_R1_KEY = "edinun_juego15_r1_v1";

function R1Mapa({ onSolve, verifyRef }) {
  const [b] = useStateG(() => ({ item: j15Pick(J15_HECHOS_MAPA, 1, J15_R1_KEY, 9)[0] }));
  const [sel, setSel] = useStateG(null);
  const [verified, setVerified] = useStateG(false);
  const ok = sel === b.item.pais;
  const origen = J15_MAPA.find((p) => p.id === b.item.desde);
  const destino = J15_MAPA.find((p) => p.id === b.item.pais);
  function verificar() {
    if (verified || sel === null) return;
    setVerified(true);
    const elegido = J15_MAPA.find((p) => p.id === sel);
    onSolve(sel === b.item.pais, {
      emoji: "🗺️", a: `¿Dónde ocurrió? ${b.item.h}`,
      userAnswer: elegido ? elegido.t : "—", correctAnswer: destino ? destino.t : "—",
    });
  }
  verifyRef.current = verificar;
  function fill(p) {
    if (!verified) return sel === p.id ? "rgba(79,216,255,0.75)" : "rgba(255,248,230,0.26)";
    if (p.id === b.item.pais) return "#2ecc8f";
    if (p.id === sel) return "#e23b3b";
    return "rgba(255,248,230,0.10)";
  }
  function stroke(p) {
    if (verified && p.id === b.item.pais) return "#06301c";
    if (verified && p.id === sel) return "#5c0b0b";
    return sel === p.id ? "#4fd8ff" : "rgba(242,194,96,0.75)";
  }
  // Rotulo SIEMPRE visible (la lección es el hecho histórico, no adivinar el país
  // en un mapa mudo). Al verificar, el correcto pasa a verde sólido y el elegido
  // mal a rojo — nunca antes.
  function rotulo(p) {
    let fill = "#f6f1e0", stroke = "rgba(0,0,0,0.6)", size = 9, weight = 700;
    if (verified && p.id === b.item.pais) { fill = "#04301a"; stroke = "#ffffff"; size = 13; weight = 800; }
    else if (verified && p.id === sel) { fill = "#5c0b0b"; stroke = "#ffffff"; size = 13; weight = 800; }
    else if (!verified && p.id === sel) { fill = "#06243a"; stroke = "rgba(255,255,255,0.9)"; size = 10; weight = 800; }
    return (
      <text key={`t-${p.id}`} x={p.lx} y={p.ly} textAnchor="middle" dominantBaseline="middle"
        style={{ fontFamily: "var(--ed-font-display)", fontWeight: weight, fontSize: size, fill, paintOrder: "stroke", stroke, strokeWidth: 3, pointerEvents: "none" }}>{p.t}</text>
    );
  }
  const elegido = sel ? J15_MAPA.find((p) => p.id === sel) : null;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", height: "100%", width: "100%", paddingTop: 28 }}>
      <div style={{ pointerEvents: "none", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 20, color: "#fff" }}>Ubica en el mapa el territorio de este hecho.</span>
      </div>
      <div style={{ marginTop: 34, maxWidth: 440, background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(240,235,225,0.92))", border: "3px solid #f2c260", borderRadius: 16, padding: "9px 16px", boxShadow: "0 10px 24px rgba(0,0,0,0.38)", fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 14, lineHeight: 1.25, color: "#3a2608", textAlign: "center" }}>
        {b.item.h}
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0, width: "100%", paddingTop: 12 }}>
        <svg viewBox={`0 0 ${J15_MAPA_W} ${J15_MAPA_H}`} width="194" height="283" style={{ overflow: "visible" }}>
          <defs>
            <marker id="j15arrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
              <polygon points="0,0 7,3.5 0,7" fill="#fce9a8" />
            </marker>
          </defs>
          {J15_MAPA_INERTE.map((p) => (
            <path key={p.id} d={p.d} fill="rgba(255,248,230,0.14)" stroke="rgba(242,194,96,0.45)" strokeWidth="1" strokeLinejoin="round" />
          ))}
          {J15_MAPA.map((p) => (
            <path key={p.id} d={p.d} fill={fill(p)} stroke={stroke(p)} strokeWidth={verified && (p.id === b.item.pais || p.id === sel) ? 1.6 : (sel === p.id ? 2 : 1)} strokeLinejoin="round"
              filter={verified && p.id === b.item.pais ? "drop-shadow(0 0 9px rgba(46,204,143,0.95))" : (verified && p.id === sel ? "drop-shadow(0 0 8px rgba(226,59,59,0.9))" : undefined)}
              onClick={() => { if (!verified) setSel(p.id); }}
              style={{ cursor: verified ? "default" : "pointer", transition: "fill 0.14s ease" }} />
          ))}
          {verified && ok && origen && destino && origen.id !== destino.id && (
            <line x1={origen.lx} y1={origen.ly} x2={destino.lx} y2={destino.ly} stroke="#fce9a8" strokeWidth="2.4" strokeDasharray="6 4" markerEnd="url(#j15arrow)" opacity="0.95" />
          )}
          {J15_MAPA.map((p) => rotulo(p))}
        </svg>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// R2 · "El despacho sin firma" — parte de campaña + 3 pistas destapables.
// El niño puede acertar sin destapar ninguna. ¡VERIFICAR! revela el correcto.
// Las escenas (assets/indep-*.png) son de epoca y SIN rostros; si falta el
// archivo, la tarjeta cae a un sello y el nombre, que es lo que identifica.
// ══════════════════════════════════════════════════════════════════
// Retratos históricos REALES (óleos del s. XIX en dominio público, vía Wikimedia
// Commons). No son caras generadas — esa es la regla — y además identifican al
// prócer de un vistazo, que es justo lo que la ronda pide.
const J15_PERSONAS = {
  bolivar: { t: "Simón Bolívar", img: "assets/retrato-bolivar.jpg" },
  sucre: { t: "Antonio José de Sucre", img: "assets/retrato-sucre.jpg" },
  sanmartin: { t: "José de San Martín", img: "assets/retrato-sanmartin.jpg" },
  pedro: { t: "Pedro I", img: "assets/retrato-pedro.jpg" },
  artigas: { t: "José Artigas", img: "assets/retrato-artigas.jpg" },
  lavalleja: { t: "Antonio Lavalleja", img: "assets/retrato-lavalleja.jpg" },
  yegros: { t: "Fulgencio Yegros", img: "assets/retrato-yegros.jpg" },
  francia: { t: "José Rodríguez de Francia", img: "assets/retrato-francia.jpg" },
};

const J15_PARTES = [
  { fecha: "24 de mayo de 1822", texto: "Hoy ha terminado el dominio español en el actual territorio ecuatoriano.", quien: "sucre",
    pistas: ["Soy general de Simón Bolívar.", "La victoria se consiguió en la Batalla de Pichincha.", "En 1825 liberaría el Alto Perú."] },
  { fecha: "7 de agosto de 1819", texto: "Nueva Granada queda liberada; el camino hacia la Gran Colombia está abierto.", quien: "bolivar",
    pistas: ["Me llaman El Libertador.", "Me desplacé por Sudamérica entre 1812 y 1819.", "Sería nombrado presidente de la Gran Colombia."] },
  { fecha: "7 de septiembre de 1822", texto: "Rompemos hoy los lazos que nos unían a Portugal.", quien: "pedro",
    pistas: ["Soy el príncipe heredero de Portugal.", "Fui nombrado emperador en 1821.", "El país que proclamo es Brasil."] },
  { fecha: "1817", texto: "Hemos cruzado la cordillera y Chile queda liberado.", quien: "sanmartin",
    pistas: ["Libro batallas desde 1812.", "En Chile cedí el mando al brigadier Bernardo O’Higgins.", "Mi campaña empezó en el actual territorio argentino."] },
  { fecha: "julio de 1822, Guayaquil", texto: "He cedido mis tropas para que la campaña continúe hacia el Perú.", quien: "sanmartin",
    pistas: ["Me reuní con Bolívar en Guayaquil.", "No fui yo quien liberaría Perú y Bolivia.", "Antes conseguí la liberación de Chile."] },
  { fecha: "1821", texto: "Venezuela alcanza hoy su independencia definitiva.", quien: "bolivar",
    pistas: ["El primer intento, el de 1811, duró apenas dos años.", "Soy conocido como El Libertador.", "Constituiría la República de la Gran Colombia."] },
  { fecha: "1825", texto: "El Alto Perú pasará a llamarse República de Bolívar.", quien: "sucre",
    pistas: ["El nombre es un homenaje al Libertador.", "Antes vencí en la Batalla de Pichincha.", "Ese territorio es la actual Bolivia."] },
  { fecha: "1811", texto: "Comienza en la Banda Oriental la lucha por la independencia.", quien: "artigas",
    pistas: ["El proceso se llevó a cabo entre 1811 y 1828.", "Lo encabecé junto a Antonio Lavalleja.", "El territorio es el actual Uruguay."] },
  { fecha: "1825", texto: "Reanudamos la lucha en la Banda Oriental.", quien: "lavalleja",
    pistas: ["El territorio es el actual Uruguay.", "Actué junto a José Artigas.", "El proceso oriental se extendió de 1811 a 1828."] },
  { fecha: "1811", texto: "Paraguay inicia hoy su propio camino.", quien: "yegros",
    pistas: ["El proceso paraguayo duró de 1811 a 1842.", "Lo protagonicé junto a José Rodríguez de Francia.", "Mi nombre de pila es Fulgencio."] },
];
const J15_R2_KEY = "edinun_juego15_r2_v1";

function j15R2Build() {
  const parte = j15Pick(J15_PARTES, 1, J15_R2_KEY, 9)[0];
  const otros = j15Shuffle(Object.keys(J15_PERSONAS).filter((k) => k !== parte.quien)).slice(0, 3);
  return { parte, ops: j15Shuffle([parte.quien].concat(otros)) };
}

function PersonaImg({ src }) {
  const [bad, setBad] = useStateG(false);
  if (bad) return (
    <div style={{ width: "100%", height: 94, borderRadius: 10, background: "linear-gradient(180deg, rgba(60,40,15,0.9), rgba(30,18,6,0.9))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, color: "rgba(242,194,96,0.85)" }}>⚜</div>
  );
  return <img src={src} alt="" draggable={false} onError={() => setBad(true)} style={{ width: "100%", height: 94, objectFit: "cover", objectPosition: "center top", borderRadius: 10, display: "block", WebkitUserDrag: "none", userSelect: "none", pointerEvents: "none" }} />;
}

function R2Despacho({ onSolve, verifyRef }) {
  const [b] = useStateG(() => j15R2Build());
  const [abiertas, setAbiertas] = useStateG({});
  const [sel, setSel] = useStateG(null);
  const [verified, setVerified] = useStateG(false);
  function verificar() {
    if (verified || sel === null) return;
    setVerified(true);
    onSolve(sel === b.parte.quien, {
      emoji: "📜", a: `¿Quién dijo esto, el ${b.parte.fecha}?`,
      userAnswer: J15_PERSONAS[sel].t, correctAnswer: J15_PERSONAS[b.parte.quien].t,
    });
  }
  verifyRef.current = verificar;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", height: "100%", width: "100%", paddingTop: 34 }}>
      <div style={{ pointerEvents: "none", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 20, color: "#fff" }}>Descubre quién dijo esto.</span>
      </div>
      {/* El bloque se centra en el alto disponible (antes colgaba arriba y
          quedaba todo el hueco abajo). */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", width: "100%", paddingBottom: 10 }}>
      <div style={{ marginTop: 0, width: 440, backgroundColor: "#f3e8cd", backgroundImage: "linear-gradient(180deg, rgba(253,246,227,0.80), rgba(239,227,198,0.84)), url('assets/fondo-parte.jpg')", backgroundSize: "auto, 170% auto", backgroundPosition: "center, center", border: "3px solid #c9a86a", borderRadius: 14, padding: "9px 16px 11px", boxShadow: "0 10px 24px rgba(0,0,0,0.38)", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 10, color: "#9a7a3e", letterSpacing: "0.1em", textTransform: "uppercase" }}>Frase dicha el</div>
        <div style={{ fontFamily: "var(--ed-font-mono)", fontSize: 12, color: "#6b5120", letterSpacing: "0.04em" }}>{b.parte.fecha}</div>
        <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 15, lineHeight: 1.25, color: "#3a2608", marginTop: 3 }}>«{b.parte.texto}»</div>
      </div>
      <div style={{ marginTop: 10, display: "flex", gap: 10, justifyContent: "center", alignItems: "stretch" }}>
        {b.parte.pistas.map((p, i) => {
          const open = !!abiertas[i];
          return (
            <button key={i} onClick={() => { if (!verified && !open) setAbiertas((s) => Object.assign({}, s, { [i]: true })); }} disabled={verified || open}
              style={{ width: 140, height: 54, borderRadius: 12, border: `2px ${open ? "solid" : "dashed"} ${open ? "#f2c260" : "rgba(242,194,96,0.6)"}`, background: open ? "rgba(255,248,230,0.92)" : "rgba(0,0,0,0.3)", color: open ? "#3a2608" : "#fce9a8", fontFamily: "var(--ed-font-display)", fontWeight: open ? 700 : 800, fontSize: open ? 11 : 12, lineHeight: 1.2, padding: "6px 8px", cursor: (verified || open) ? "default" : "pointer", textAlign: "center" }}>
              {open ? p : `PISTA ${i + 1}`}
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 32, display: "flex", gap: 14, justifyContent: "center" }}>
        {b.ops.map((k) => {
          const per = J15_PERSONAS[k], isSel = sel === k, esCorrecta = k === b.parte.quien;
          let border = "#f2c260", bg = "linear-gradient(180deg,#fff8e6,#f7e3a8)", col = "#3a2608", badge = null;
          if (!verified && isSel) border = "#4fd8ff";
          if (verified) {
            if (esCorrecta) { border = "#2ecc8f"; bg = "linear-gradient(180deg,rgba(72,224,154,0.95),rgba(26,143,95,0.92))"; col = "#06381f"; badge = "✓"; }
            else if (isSel) { border = "#ff6b6b"; bg = "linear-gradient(180deg,rgba(255,139,139,0.92),rgba(178,47,47,0.9))"; col = "#fff"; badge = "✗"; }
            else { bg = "linear-gradient(180deg,rgba(255,248,230,0.45),rgba(247,227,168,0.45))"; }
          }
          return (
            <button key={k} onClick={() => { if (!verified) setSel(k); }} disabled={verified}
              style={{ position: "relative", width: 104, borderRadius: 14, border: `3px solid ${border}`, background: bg, color: col, padding: 6, cursor: verified ? "default" : "pointer", boxShadow: (verified && esCorrecta) ? "0 0 0 3px rgba(46,204,143,0.55), 0 0 26px rgba(46,204,143,0.85)" : ((!verified && isSel) ? "0 0 16px rgba(79,216,255,0.55)" : "inset 0 1px 0 rgba(255,255,255,0.7), 0 5px 12px rgba(0,0,0,0.28)"), transform: (verified && esCorrecta) ? "scale(1.04)" : ((!verified && isSel) ? "scale(1.05)" : "none"), transition: "transform 0.12s ease" }}>
              <PersonaImg src={per.img} />
              <span style={{ display: "block", marginTop: 4, fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 11, lineHeight: 1.15 }}>{per.t}</span>
              {badge && <span style={{ position: "absolute", top: -10, right: -8, fontSize: 14, fontWeight: 900, color: "#fff", background: badge === "✓" ? "#1f8a54" : "#c0392b", borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>{badge}</span>}
            </button>
          );
        })}
      </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// R3 · "El candado del archivo" — DESCIFRAR el año y abrir el candado.
// Tres documentos siempre visibles (no se destapan: ese gesto ya es R2) que,
// cruzados, dan un año: uno nombra el hecho, otro lo ancla a una fecha conocida
// y el tercero lo cruza con otro suceso del mismo año. El niño compone el año
// girando las dos últimas ruedas del candado (el 1 y el 8 vienen puestos) y
// toca ¡VERIFICAR! para abrirlo.
// Resoluble con lo que se ve · sin verde ni rojo antes de verificar · al fallar
// se revela la combinación correcta en grande junto a la que puso el niño.
// ══════════════════════════════════════════════════════════════════
const J15_HECHOS = {
  haiti: { t: "Independencia de Haití", y: 1804, img: "assets/indep-haiti.jpg" },
  actaven: { t: "Acta de independencia de Venezuela", y: 1811, img: "assets/indep-acta-venezuela.jpg" },
  chile: { t: "Independencia de Chile", y: 1817, img: "assets/indep-chile.jpg" },
  granada: { t: "Liberación de Nueva Granada", y: 1819, img: "assets/indep-nueva-granada.jpg" },
  vendef: { t: "Independencia definitiva de Venezuela", y: 1821, img: "assets/indep-acta-venezuela.jpg" },
  pichincha: { t: "Batalla de Pichincha", y: 1822, img: "assets/indep-pichincha.jpg" },
  ipiranga: { t: "Grito de Ipiranga", y: 1822, img: "assets/indep-ipiranga.jpg" },
  guayaquil: { t: "Entrevista de Guayaquil", y: 1822, img: "assets/indep-guayaquil.jpg" },
  ayacucho: { t: "Batalla de Ayacucho", y: 1824, img: "assets/indep-ayacucho.jpg" },
  bolivia: { t: "República de Bolívar", y: 1825, img: "assets/indep-bolivia.jpg" },
};

// Pintura del hecho. Si el archivo no está, no se dibuja nada: el juego nunca
// depende de las imágenes. `draggable={false}` porque el arrastre nativo de
// imágenes del navegador dispara pointercancel y mata cualquier gesto propio.
function HechoImg({ src, h }) {
  const [bad, setBad] = useStateG(false);
  if (bad) return null;
  return <img src={src} alt="" draggable={false} onError={() => setBad(true)} style={{ width: "100%", height: h, objectFit: "cover", borderRadius: 7, display: "block", marginBottom: 3, WebkitUserDrag: "none", userSelect: "none", pointerEvents: "none" }} />;
}

// Los tres documentos de cada caso. Todos los datos salen del Tema 3 del libro.
const J15_CASOS = [
  { id: "pichincha", docs: [
    "La batalla se libró en las faldas del volcán Pichincha, el 24 de mayo.",
    "Ocurrió dos años antes de la Batalla de Ayacucho, que fue en 1824.",
    "Ese mismo año, el 7 de septiembre, se dio el Grito de Ipiranga en Brasil."] },
  { id: "granada", docs: [
    "Bolívar liberó, el 7 de agosto, el territorio llamado entonces Nueva Granada.",
    "Fue dos años antes de la independencia definitiva de Venezuela, que ocurrió en 1821.",
    "Bolívar se desplazó por Sudamérica desde 1812 hasta este año, librando batallas."] },
  { id: "actaven", docs: [
    "En Venezuela se firmó el acta que pretendía poner fin al vínculo con España.",
    "Ese primer intento independentista duró apenas dos años.",
    "Fue ocho años antes de la liberación de Nueva Granada, que ocurrió en 1819."] },
  { id: "vendef", docs: [
    "Venezuela alcanzó su independencia definitiva.",
    "Fue dos años después de la liberación de Nueva Granada, que ocurrió en 1819.",
    "Al año siguiente, Bolívar se dirigió a Quito para ampliar la Gran Colombia."] },
  { id: "ipiranga", docs: [
    "El 7 de septiembre, Pedro I rompió los lazos que unían Brasil a Portugal.",
    "Fue un año después de que Pedro I fuera nombrado emperador, en 1821.",
    "Ese mismo año, la Batalla de Pichincha acabó con el dominio español en el actual Ecuador."] },
  { id: "guayaquil", docs: [
    "En julio, Bolívar y San Martín se encontraron en Guayaquil.",
    "San Martín cedió sus tropas para que la campaña continuara hacia el Perú.",
    "Ese mismo año, el 24 de mayo, se libró la Batalla de Pichincha."] },
  { id: "ayacucho", docs: [
    "Tras esta batalla, Bolívar y Sucre lograron liberar el Perú.",
    "Fue un año antes de la liberación del Alto Perú, que ocurrió en 1825.",
    "Dos años antes, en 1822, se había librado la Batalla de Pichincha."] },
  { id: "bolivia", docs: [
    "Sucre liberó el Alto Perú, que pasaría a llamarse República de Bolívar.",
    "Fue un año después de la Batalla de Ayacucho, que ocurrió en 1824.",
    "Ese territorio es la actual Bolivia."] },
  { id: "chile", docs: [
    "La campaña de San Martín tuvo como consecuencia la liberación de Chile.",
    "Fue dos años antes de la liberación de Nueva Granada, que ocurrió en 1819.",
    "San Martín cedió el mando al brigadier chileno Bernardo O’Higgins."] },
  { id: "haiti", docs: [
    "Fue el primer país de América Latina y el Caribe en independizarse.",
    "Se liberó del dominio colonial francés.",
    "Ocurrió trece años antes de la independencia de Chile, que fue en 1817."] },
];
const J15_R3_KEY = "edinun_juego15_r3c_v1";

function j15R3Build() {
  const caso = j15Pick(J15_CASOS, 1, J15_R3_KEY, 9)[0];
  const h = J15_HECHOS[caso.id];
  return { caso, hecho: h, anio: String(h.y) };
}

function R3Candado({ onSolve, verifyRef }) {
  const [b] = useStateG(() => j15R3Build());
  const [ruedas, setRuedas] = useStateG([0, 0]);   // las dos últimas cifras
  const [verified, setVerified] = useStateG(false);
  const puesto = "18" + ruedas[0] + ruedas[1];
  const ok = puesto === b.anio;

  function girar(i, d) {
    if (verified) return;
    setRuedas((r) => { const n = r.slice(); n[i] = (n[i] + d + 10) % 10; return n; });
  }
  function verificar() {
    if (verified) return;
    setVerified(true);
    onSolve(puesto === b.anio, {
      emoji: "🔒", a: `¿En qué año ocurrió: ${b.hecho.t}?`,
      userAnswer: puesto, correctAnswer: b.anio,
    });
  }
  verifyRef.current = verificar;

  function rueda(valor, i, fija) {
    const col = verified ? (ok ? "#06381f" : "#7a1414") : "#3a2608";
    const bg = verified
      ? (ok ? "linear-gradient(180deg,rgba(72,224,154,0.95),rgba(26,143,95,0.92))" : "linear-gradient(180deg,rgba(255,139,139,0.92),rgba(178,47,47,0.9))")
      : (fija ? "linear-gradient(180deg,#efe3c6,#d9c79b)" : "linear-gradient(180deg,#fff8e6,#f7e3a8)");
    return (
      <div key={fija ? "f" + i : "r" + i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
        <button onClick={() => girar(i, 1)} disabled={fija || verified}
          style={{ width: 30, height: 20, border: "none", background: "transparent", color: (fija || verified) ? "transparent" : "#fce9a8", fontSize: 15, lineHeight: 1, cursor: (fija || verified) ? "default" : "pointer", padding: 0 }}>▲</button>
        <div style={{ width: 52, height: 66, borderRadius: 9, border: `3px solid ${verified ? (ok ? "#2ecc8f" : "#ff6b6b") : (fija ? "#c9a86a" : "#f2c260")}`, background: bg, color: col, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--ed-font-mono)", fontWeight: 700, fontSize: 34, boxShadow: "inset 0 2px 6px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.6)" }}>
          {valor}
        </div>
        <button onClick={() => girar(i, -1)} disabled={fija || verified}
          style={{ width: 30, height: 20, border: "none", background: "transparent", color: (fija || verified) ? "transparent" : "#fce9a8", fontSize: 15, lineHeight: 1, cursor: (fija || verified) ? "default" : "pointer", padding: 0 }}>▼</button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", height: "100%", width: "100%", paddingTop: 46 }}>
      <div style={{ pointerEvents: "none", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
        <span style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 20, color: "#fff" }}>Descubre el año y abre el candado.</span>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", justifyContent: "space-evenly", alignItems: "center", width: "100%", paddingTop: 4, paddingBottom: 6 }}>
        {/* Los tres documentos, siempre a la vista */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", alignItems: "stretch" }}>
          {b.caso.docs.map((d, i) => (
            <div key={i} style={{ width: 148, minHeight: 112, background: "linear-gradient(180deg, #fdf6e3, #efe3c6)", border: "2px solid #c9a86a", borderRadius: 11, padding: "7px 9px", boxShadow: "0 6px 16px rgba(0,0,0,0.32)", display: "flex", flexDirection: "column", gap: 3 }}>
              <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 9, color: "#9a7a3e", letterSpacing: "0.08em", textTransform: "uppercase" }}>Documento {i + 1}</div>
              <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 700, fontSize: 11.5, lineHeight: 1.3, color: "#3a2608", textAlign: "left" }}>{d}</div>
            </div>
          ))}
        </div>

        {/* El candado */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, background: "linear-gradient(180deg, rgba(20,12,55,0.55), rgba(10,6,35,0.55))", border: "3px solid rgba(242,194,96,0.6)", borderRadius: 18, padding: "10px 16px", boxShadow: verified && ok ? "0 0 30px rgba(46,204,143,0.7)" : "0 10px 26px rgba(0,0,0,0.4)" }}>
          <div style={{ textAlign: "center", width: 62 }}>
            <div style={{ fontSize: 30, lineHeight: 1 }}>{verified && ok ? "🔓" : "🔒"}</div>
            <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 9, color: "rgba(252,233,168,0.85)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>Archivo</div>
          </div>
          <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
            {rueda(1, 0, true)}
            {rueda(8, 1, true)}
            {rueda(ruedas[0], 0, false)}
            {rueda(ruedas[1], 1, false)}
          </div>
          {/* Al abrirlo aparece el documento; al fallar, la combinación correcta */}
          {verified && (
            <div style={{ width: 96, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              {ok ? (
                <React.Fragment>
                  <HechoImg src={b.hecho.img} h={44} />
                  <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 10, lineHeight: 1.15, color: "#fce9a8", textAlign: "center" }}>{b.hecho.t}</div>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 9, color: "rgba(255,255,255,0.7)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Era</div>
                  <div style={{ fontFamily: "var(--ed-font-mono)", fontWeight: 700, fontSize: 30, color: "#2ecc8f", textShadow: "0 0 18px rgba(46,204,143,0.8)" }}>{b.anio}</div>
                  <div style={{ fontFamily: "var(--ed-font-display)", fontWeight: 800, fontSize: 10, lineHeight: 1.15, color: "#fce9a8", textAlign: "center" }}>{b.hecho.t}</div>
                </React.Fragment>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Arreglo de rondas (cada mecánica distinta) ──
const SOC_ROUNDS = [
  { C: R1Mapa, verify: true, bubble: (<>Toca el país<br />en el mapa.</>) },
  { C: R2Despacho, verify: true, bubble: (<>Toca una pista<br />si la necesitas.</>) },
  { C: R3Candado, verify: true, bubble: (<>Gira las ruedas<br />y abre el candado.</>) },
];


// ══════════════════════════════════════════════════════════════════
// ORQUESTADOR — chrome EDINUN compartido (HUD, personaje, acciones, overlay, modales).
// ══════════════════════════════════════════════════════════════════
function GameScreen({ app, setApp, go }) {
  const char = CHARACTERS.find((c) => c.id === app.character) || CHARACTERS[0];
  const ROUNDS = SOC_ROUNDS;
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
  const started = useRefG(Date.now());
  const advancing = useRefG(false);
  const verifyRef = useRefG(null);

  useEffectG(() => { const t = setInterval(() => setElapsed(Math.floor((Date.now() - started.current) / 1000)), 500); return () => clearInterval(t); }, []);
  function formatTime(s) { const m = Math.floor(s / 60), ss = s % 60; return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`; }

  function onSolve(isCorrect, entry) {
    if (advancing.current) return;
    advancing.current = true; setBusy(true);
    if (typeof markFirstAttempt === "function") markFirstAttempt();
    const newLog = [...log, { idx: round + 1, isCorrect, ...entry }];
    const newStars = stars + (isCorrect ? 1 : 0);
    setLog(newLog); setStars(newStars);
    if (isCorrect) setApp((s) => ({ ...s, stars: (s.stars || 0) + 1 }));
    const showFbAt = isCorrect ? 0 : (ROUNDS[round].verify ? 2200 : 1800);
    const advanceAt = showFbAt + (isCorrect ? 1100 : 1000);
    setTimeout(() => { setFeedback(isCorrect ? "ok" : "err"); setFeedbackMsg(isCorrect ? "+1 ⭐" : ANIMOS[round % ANIMOS.length]); }, showFbAt);
    setTimeout(() => {
      setFeedback(null); setFeedbackMsg("");
      if (round + 1 < TOTAL) { setRound((r) => r + 1); advancing.current = false; setBusy(false); }
      else {
        const solved = newLog.filter((e) => e.isCorrect).length;
        setApp((s) => ({ ...s, stars: newStars, lastResult: { category: CAT_LABEL, solved, total: TOTAL, time: Math.floor((Date.now() - started.current) / 1000), starsEarned: newStars, log: newLog } }));
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

      <div style={{ position: "absolute", top: 52, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 8 }}>
        <span className="ed-label" style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>Ronda</span>
        {Array.from({ length: TOTAL }).map((_, i) => {
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
            {feedbackMsg && (<div style={{ fontFamily: "'Fredoka','Baloo 2',system-ui,sans-serif", fontWeight: 700, fontSize: "clamp(18px, 2.6vmin, 30px)", color: feedback === "ok" ? "#fce9a8" : "#fff", background: "rgba(0,0,0,0.55)", padding: "8px 26px", borderRadius: 999, textShadow: "0 2px 6px rgba(0,0,0,0.6)", textAlign: "center" }}>{feedback === "err" ? `${feedbackMsg} — ${char.name}` : feedbackMsg}</div>)}
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
              <p className="ed-body" style={{ marginBottom: 16, fontSize: 14 }}>Vas a jugar las 3 rondas otra vez.</p>
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
              <th style={printStyles.th}>Ronda</th>
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
          <div style={printStyles.cell}><div style={printStyles.cellL}>Rondas</div><div style={printStyles.cellV}>{attemptedCount} / {res.total}</div></div>
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
            ¡Juego completo!
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
                  <th style={{ textAlign: "left", padding: "6px 8px" }}>Ronda</th>
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
                {(res.log || []).length === 0 && (<tr><td colSpan={5} style={{ padding: "16px 8px", textAlign: "center", color: "var(--ed-ink-soft)", fontStyle: "italic" }}>Sin rondas.</td></tr>)}
              </tbody>
            </table>
          </div>

          <div style={{ borderTop: "2px solid rgba(242,194,96,0.45)", paddingTop: 10, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, fontFamily: "var(--ed-font-ui)", fontSize: 11 }}>
            <SummaryCell label="Rondas" value={`${attemptedCount} / ${totalEx}`} />
            <SummaryCell label="Correctas" value={`${res.solved}`} tone="#2ecc8f" />
            <SummaryCell label="Estrellas" value={`${res.starsEarned}`} tone="#fce9a8" />
            <SummaryCell label="Precisión" value={`${accuracy}%`} tone="#fce9a8" emphasis />
          </div>

          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button className="ed-btn ed-btn-ghost" onClick={() => window.print()} style={{ padding: "0 10px", fontSize: 13, height: 44, fontWeight: 800, letterSpacing: "0.04em" }}>IMPRIMIR REPORTE</button>
            <button className="ed-btn ed-btn-primary" onClick={() => go("game")} style={{ padding: "0 10px", fontSize: 13, height: 44, fontWeight: 800, letterSpacing: "0.04em" }}>JUGAR OTRA VEZ</button>
          </div>
        </div>
      </div>

      <PrintableReport studentName={app.studentName} res={res} dateStr={dateStr} mm={mm} ss={ss} attemptedCount={attemptedCount} accuracy={accuracy} />
    </div>
  );
}

Object.assign(window, { GameScreen, ResultsScreen });
