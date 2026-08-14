// characters.jsx — Personajes EDINUN GAMES (Estudios Sociales).
// Renderizan los PNG de assets/char-<id>.png.
// El componente expone la misma API que la versión SVG anterior
// (props `size`, `floating`) para no romper a los consumidores
// (GameScreen, CharacterScreen, ResultsScreen, CharacterAvatar).

// ─────────────────────────────────────────────────────────────
// Sparkles — chispas animadas alrededor del personaje. Sobreviven de
// la versión SVG porque dan vida y refuerzan la estética cósmica.
// ─────────────────────────────────────────────────────────────
function Sparkles({ color = "#fce9a8", count = 6, seed = 1 }) {
  const pts = Array.from({ length: count }, (_, i) => {
    const a = (i * 360) / count + seed * 37;
    const r = 70 + (i % 3) * 8;
    const x = 100 + Math.cos((a * Math.PI) / 180) * r;
    const y = 100 + Math.sin((a * Math.PI) / 180) * r;
    const s = 2 + (i % 3);
    return { x, y, s, delay: i * 0.35 };
  });
  return (
    <g>
      {pts.map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${p.y})`}>
          <circle r={p.s} fill={color} opacity="0.9">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" begin={`${p.delay}s`} repeatCount="indefinite" />
          </circle>
        </g>
      ))}
    </g>
  );
}

// ─────────────────────────────────────────────────────────────
// Fábrica de componentes — cada personaje es un PNG con sparkles
// superpuestos. Se exportan con los nombres que consume el resto
// de la app: DomiCharacter, SisaCharacter, etc.
// ─────────────────────────────────────────────────────────────
function makeCharacter(id, sparkleColor, sparkleSeed) {
  return function Character({ size = 200, floating = true }) {
    return (
      <div
        className={floating ? "ed-float-soft" : ""}
        style={{
          width: size, height: size,
          position: "relative",
          display: "inline-block",
          lineHeight: 0,
        }}
      >
        <img
          src={`assets/char-${id}.png`}
          alt=""
          draggable="false"
          style={{
            width: "100%", height: "100%",
            objectFit: "contain",
            display: "block",
            userSelect: "none",
            pointerEvents: "none",
          }}
        />
        {/* Sparkles overlay — viewBox 200×200 para mantener las posiciones
            relativas idénticas a la versión SVG previa. */}
        <svg
          viewBox="0 0 200 200"
          aria-hidden="true"
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            pointerEvents: "none",
            overflow: "visible",
          }}
        >
          <Sparkles color={sparkleColor} count={6} seed={sparkleSeed} />
        </svg>
      </div>
    );
  };
}

// Elenco por regiones del Ecuador (arte en assets/char-<id>.png).
const DomiCharacter = makeCharacter("domi", "#4fd8ff", 1); // Costa (montubia)
const SisaCharacter = makeCharacter("sisa", "#f2b84b", 2); // Sierra (kichwa otavaleña)
const YakuCharacter = makeCharacter("yaku", "#46d67f", 3); // Oriente (kichwa amazónico)
const AndiCharacter = makeCharacter("andi", "#ff6a4d", 4); // Ecuador (cóndor tricolor)

// ─────────────────────────────────────────────────────────────
// Avatar compacto (HUD / perfil / cards). Mantiene el marco circular
// dorado/violeta original y encuadra el PNG dentro.
// ─────────────────────────────────────────────────────────────
function CharacterAvatar({ char, size = 56 }) {
  const map = {
    domi: DomiCharacter,
    sisa: SisaCharacter,
    yaku: YakuCharacter,
    andi: AndiCharacter,
  };
  const C = map[char] || DomiCharacter;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "radial-gradient(circle at 30% 30%, rgba(138,90,242,.8), rgba(18,10,55,.95))",
      boxShadow: "inset 0 0 0 2px rgba(242,194,96,.8), 0 0 14px rgba(138,90,242,.45)",
      display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
    }}>
      <div style={{ transform: `translateY(${size * 0.06}px) scale(1.15)` }}>
        <C size={size} floating={false} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Catálogo de personajes (id, nombre, frase, componente)
// Los 4 representan las regiones del Ecuador + los símbolos patrios.
// ─────────────────────────────────────────────────────────────
const CHARACTERS = [
  {
    id: "domi",
    name: "Domi",
    title: "Historia y cultura",
    specialty: "Historia y cultura",
    quote: "¡Descubramos nuestro pasado!",
    Component: DomiCharacter,
  },
  {
    id: "sisa",
    name: "Sisa",
    title: "Geografía y mapas",
    specialty: "Geografía y mapas",
    quote: "¡Exploremos el mundo!",
    Component: SisaCharacter,
  },
  {
    id: "yaku",
    name: "Yaku",
    title: "Vida en comunidad",
    specialty: "Vida en comunidad",
    quote: "¡Aprendamos a vivir juntos!",
    Component: YakuCharacter,
  },
  {
    id: "andi",
    name: "Andi",
    title: "Nuestro Ecuador",
    specialty: "Nuestro Ecuador",
    quote: "¡Conozcamos nuestro país!",
    Component: AndiCharacter,
  },
];

Object.assign(window, {
  DomiCharacter,
  SisaCharacter,
  YakuCharacter,
  AndiCharacter,
  CharacterAvatar,
  CHARACTERS,
});
