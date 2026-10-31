import React from 'react';
import {AbsoluteFill, Easing, Img, spring, staticFile, useCurrentFrame} from 'remotion';
import {FONT} from './tokens';
import {HomeScreen, MollyHome, MSG, Footer, useFonts} from './TutoraV1';

// v2: grammar da referencia. fundo claro 0-16s, corte seco para outro escuro.
export const DURATION = 600;
const FPS = 30;
const BG = '#F4F7FB', INK = '#0B0B0F', LAV = '#A99BE6', MUTE = '#6B7080';
const M = 96;
const OUTRO = 520;

// ---------- molas ----------
const sp = (f: number, t: number, damping = 12, stiffness = 140, mass = 0.8) =>
  f < t ? 0 : spring({frame: f - t, fps: FPS, config: {damping, stiffness, mass}});
const smooth = (f: number, t: number) => sp(f, t, 200, 90, 1); // sem overshoot (texto)
const pop = (f: number, t: number) => sp(f, t, 9, 170, 0.7); // com overshoot (ui)
const stack = (f: number, keys: [number, number][], kind: 'smooth' | 'pop' = 'smooth') => {
  const g = kind === 'pop' ? pop : smooth;
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++) v += (keys[i][1] - keys[i - 1][1]) * g(f, keys[i][0]);
  return v;
};
// rolagem de cena: entra subindo de baixo; sai com antecipacao (desce um pouco) e dispara pra cima
const scrollY = (f: number, tin: number, tout = 99999) =>
  (1 - smooth(f, tin)) * 700 + 36 * (sp(f, tout, 30, 220) - sp(f, tout + 5, 30, 220)) - 1900 * smooth(f, tout + 5);

const Sans: React.CSSProperties = {fontFamily: FONT.sans, letterSpacing: '-0.025em'};
const Mono: React.CSSProperties = {fontFamily: FONT.mono, letterSpacing: '0.03em'};

const Line: React.FC<{t: number; size?: number; color?: string; weight?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({t, size = 76, color = INK, weight = 600, children, style}) => {
  const f = useCurrentFrame();
  const k = smooth(f, t);
  return (
    <div style={{overflow: 'hidden', paddingBottom: 6, ...style}}>
      <div style={{...Sans, fontSize: size, fontWeight: weight, color, lineHeight: 1.1, transform: `translateY(${(1 - k) * 115}%)`}}>{children}</div>
    </div>
  );
};

// ---------- grokbot vetorial (spec de movimento da referencia) ----------
const IO3 = Easing.bezier(0.65, 0, 0.35, 1); // power3.inOut
const O2 = Easing.out(Easing.quad); // power2.out
const BACK = Easing.out(Easing.back(1.2));
const cl = (v: number) => Math.max(0, Math.min(1, v));
// piscadas semeadas: intervalo 75-120 frames (2,5-4s)
const BLINKS: number[] = (() => { const a: number[] = []; let s = 7, t = 28; while (t < 600) { a.push(t); s = (s * 9301 + 49297) % 233280; t += 75 + Math.floor((s / 233280) * 46); } return a; })();
const blinkY = (f: number) => { for (const b of BLINKS) { const d = f - b; if (d === 0) return 0.1; if (d === 1) return 0; } return 1; };
// alvo do olhar (direcao unitaria aproximada), dardo de 10 frames power2.out
const LOOK: [number, number, number][] = [[0, 0, 0], [18, -0.35, 0.95], [46, -0.5, 0.9], [92, -0.9, 0.45], [172, 0, 1], [300, -0.8, -0.55], [392, -0.3, -0.95], [406, 0, -1], [440, 0, 1], [466, 0, 1], [484, -0.5, 0.9], [500, 0.4, 0.9], [530, -0.5, 0.85], [550, 0.3, 0.95], [575, -0.4, 0.9], [590, 0.2, 0.6]];
const look = (f: number) => {
  let x = 0, y = 0;
  for (let i = 1; i < LOOK.length; i++) { const k = O2(cl((f - LOOK[i][0]) / 10)); x += (LOOK[i][1] - LOOK[i - 1][1]) * k; y += (LOOK[i][2] - LOOK[i - 1][2]) * k; }
  return {x, y};
};
const IMPACTS = [46, 404, 444, 448, 454, 460, 470, 502, OUTRO + 48];
const impact = (f: number) => {
  let t = -1; for (const x of IMPACTS) if (f >= x) t = x;
  if (t < 0) return {sx: 1, sy: 1};
  const s = spring({frame: f - t, fps: FPS, config: {damping: 9, stiffness: 300, mass: 0.5}});
  return {sx: 1.1 - 0.1 * s, sy: 0.85 + 0.15 * s};
};
const SHAKE = 566;
const shake = (f: number) => {
  const k: [number, number][] = [[SHAKE - 3, 0], [SHAKE, -15], [SHAKE + 4, 12], [SHAKE + 9, -5], [SHAKE + 14, 0]];
  for (let i = 1; i < k.length; i++) if (f < k[i][0]) { const u = cl((f - k[i - 1][0]) / (k[i][0] - k[i - 1][0])); return k[i - 1][1] + (k[i][1] - k[i - 1][1]) * IO3(u); }
  return 0;
};
// caminho: circulo vs feijao (4 ancoras cubicas), viewBox 100
type P = number[];
const CIRCLE: P = [50, 10, 72, 10, 90, 28, 90, 50, 90, 72, 72, 90, 50, 90, 28, 90, 10, 72, 10, 50, 10, 28, 28, 10];
const BEAN: P = [58, 20, 68, 18, 82, 30, 84, 46, 86, 66, 72, 92, 46, 92, 18, 92, 4, 76, 6, 58, 8, 36, 40, 22];
const path = (m: number) => {
  const p = CIRCLE.map((c, i) => BEAN[i] + (c - BEAN[i]) * m);
  const q = (i: number) => `${p[i * 2]},${p[i * 2 + 1]}`;
  return `M${q(0)} C${q(1)} ${q(2)} ${q(3)} C${q(4)} ${q(5)} ${q(6)} C${q(7)} ${q(8)} ${q(9)} C${q(10)} ${q(11)} ${q(0)}Z`;
};
const Bot: React.FC<{x: number; y: number; size: number; f: number}> = ({x, y, size, f}) => {
  const th = (2 * Math.PI * f) / 60; // periodo 2s
  const h = (1 - Math.cos(th)) / 2; // 0 vale, 1 apice
  const wt = Math.max(0, Math.cos(th)), wv = Math.abs(Math.sin(th));
  let sx = 1 + 0.04 * wt - 0.03 * wv, sy = 1 - 0.06 * wt + 0.04 * wv;
  const im = impact(f); sx *= im.sx; sy *= im.sy;
  const mu = BACK(cl((f - 2) / 15));
  const m = Math.min(mu, 1);
  const wide = 1 + 0.08 * Math.max(0, mu - 1) * 10; // passa um pouco mais largo e volta
  sx *= wide; sy /= wide;
  const rot = -28 * (1 - mu) + shake(f);
  const e = look(f), eb = blinkY(f);
  const ex = e.x * 7.5, ey = e.y * 7.5; // ~18% do raio
  return (
    <div style={{position: 'absolute', left: x - size / 2, top: y - size / 2 - h * 0.13 * size, width: size, height: size, transform: `rotate(${rot}deg) scale(${sx}, ${sy})`, transformOrigin: '50% 90%'}}>
      <svg viewBox="0 0 100 100" width={size} height={size} style={{overflow: 'visible'}}>
        <path d={path(m)} fill="#000" stroke={f >= OUTRO ? "rgba(169,155,230,0.45)" : "none"} strokeWidth={1.2} />
        {[58, 74].map((cx) => (
          <ellipse key={cx} cx={cx + ex} cy={42 + ey} rx={5.5} ry={11 * eb} fill="#fff" />
        ))}
      </svg>
    </div>
  );
};

// ---------- telefone ----------
const PW = 640, PH = 1300;
const Wave: React.FC<{f: number; n?: number; h?: number; color?: string}> = ({f, n = 18, h = 46, color = '#fff'}) => (
  <div style={{display: 'flex', gap: 5, alignItems: 'center', height: h}}>
    {Array.from({length: n}).map((_, i) => {
      const a = 0.25 + 0.75 * Math.abs(Math.sin(f / 4 + i * 0.9) * Math.sin(f / 7 + i * 0.37));
      return <div key={i} style={{width: 6, height: h * a, borderRadius: 3, background: color}} />;
    })}
  </div>
);
const Island: React.FC<{f: number}> = ({f}) => {
  const open = pop(f, 222); // ilha -> chamada recebida
  const active = pop(f, 252); // chamada ativa
  const close = smooth(f, 300);
  const w = 180 + (560 - 180) * open - (560 - 180) * close;
  const h = 52 + 90 * open - 90 * close;
  return (
    <div style={{position: 'absolute', top: 18, left: PW / 2 - 18 - w / 2, width: w, height: h, borderRadius: 999, background: '#000', zIndex: 5, overflow: 'hidden', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16}}>
      {open > 0.5 && close < 0.5 && (
        <>
          <Img src={staticFile('molly-icon-v2-180.png')} style={{width: 92, height: 92, borderRadius: '50%', transform: `scale(${Math.min(1.2, pop(f, 226))})`}} />
          <div style={{flex: 1, ...Sans, letterSpacing: 0, color: '#fff'}}>
            <div style={{fontSize: 28, fontWeight: 600}}>Molly · English Tutor</div>
            <div style={{...Mono, fontSize: 20, color: active > 0.5 ? LAV : '#aaa', marginTop: 4}}>{active > 0.5 ? 'elevenlabs · sarah' : 'chamando...'}</div>
          </div>
          {active > 0.5 ? <Wave f={f} n={7} h={40} color={LAV} /> : <div style={{width: 56, height: 56, borderRadius: '50%', background: '#34C759', transform: `scale(${1 + 0.08 * Math.sin(f / 3)})`}} />}
        </>
      )}
    </div>
  );
};
const Conversation: React.FC<{f: number}> = ({f}) => {
  const t0 = 306, gap = 8;
  const shown = Math.max(0, Math.min(MSG.length, Math.floor((f - t0) / gap) + 1));
  const scroll = stack(f, MSG.map((_, i) => [t0 + i * gap, Math.max(0, i - 4) * 118] as [number, number]));
  return (
    <AbsoluteFill style={{background: '#fff', ...Sans, letterSpacing: 0, color: '#111'}}>
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 190, background: '#fff', zIndex: 2, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 16, paddingBottom: 20, borderBottom: '1px solid #eee'}}>
        <Img src={staticFile('molly-icon-v2-180.png')} style={{width: 72, height: 72, borderRadius: '50%'}} />
        <div style={{background: '#111', color: '#fff', borderRadius: 999, padding: '10px 22px', fontSize: 24, display: 'flex', alignItems: 'center', gap: 10}}>
          <span style={{width: 12, height: 12, borderRadius: '50%', background: '#3BD16F'}} /> Listening
        </div>
      </div>
      <div style={{position: 'absolute', top: 230, left: 36, right: 36, transform: `translateY(${-scroll}px)`, display: 'flex', flexDirection: 'column', gap: 26}}>
        {MSG.slice(0, shown).map(([me, s], i) => {
          const k = pop(f, t0 + i * gap);
          return me ? (
            <div key={i} style={{alignSelf: 'flex-end', background: '#000', color: '#fff', borderRadius: 30, padding: '18px 26px', fontSize: 28, maxWidth: 440, transform: `scale(${k})`, transformOrigin: '100% 100%'}}>{s}</div>
          ) : (
            <div key={i} style={{textAlign: 'center', fontSize: 28, lineHeight: 1.35, color: '#222', padding: '0 20px', transform: `scale(${k})`, transformOrigin: '50% 100%'}}>{s}</div>
          );
        })}
      </div>
      <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: 150, background: '#fff', borderTop: '1px solid #eee', display: 'flex', alignItems: 'center', padding: '0 28px', gap: 14}}>
        <div style={{flex: 1, border: '2px solid #e2e2e2', borderRadius: 999, padding: '20px 26px', fontSize: 26, color: '#999'}}>Send a message...</div>
        <div style={{width: 64, height: 64, borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28}}>🎙</div>
        <div style={{width: 64, height: 64, borderRadius: '50%', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28}}>🎙</div>
      </div>
    </AbsoluteFill>
  );
};
const Wipe: React.FC<{f: number; t: number; children: React.ReactNode}> = ({f, t, children}) => {
  if (f < t) return null;
  const k = smooth(f, t);
  return <AbsoluteFill style={{clipPath: `inset(${(1 - k) * 100}% 0 0 0)`}}>{children}</AbsoluteFill>;
};
const PHONE_TOP = 330;
const Phone: React.FC<{f: number}> = ({f}) => {
  const y = scrollY(f, 172, 384);
  if (f < 168 || f > 420) return null;
  return (
    <div style={{position: 'absolute', left: 540 - PW / 2, top: PHONE_TOP, width: PW, height: PH, transform: `translateY(${y}px)`, borderRadius: 92, background: '#000', padding: 18}}>
      <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 76, overflow: 'hidden', background: '#3A3A3C'}}>
        <HomeScreen f={0} />
        <Wipe f={f} t={256}><MollyHome f={f} /></Wipe>
        <Wipe f={f} t={298}><Conversation f={f} /></Wipe>
        <Island f={f} />
      </div>
    </div>
  );
};

// ---------- cartao e chips (saem do grokbot) ----------
const Card: React.FC<{f: number; bx: number; by: number; bs: number}> = ({f, bx, by, bs}) => {
  if (f < 394 || f >= 448) return null;
  const fall = Easing.in(Easing.quad)(cl((f - 394) / 10));
  const top = by - bs / 2 - 70;
  const y = -150 + (top + 150) * fall;
  const gone = IO3(cl((f - 440) / 6));
  return (
    <div style={{position: 'absolute', left: bx - 200, top: y + gone * (bs / 2), width: 400, transform: `scale(${1 - gone})`, background: '#fff', borderRadius: 26, padding: '18px 24px', border: '2px solid #E3E7EE', display: 'flex', gap: 14, alignItems: 'center', justifyContent: 'center', ...Sans}}>
      <span style={{fontSize: 30, fontWeight: 600, color: INK}}>transcrição</span>
      {['13h', '21h'].map((hh, i) => (
        <span key={hh} style={{...Mono, fontSize: 28, color: INK, background: LAV, borderRadius: 12, padding: '4px 12px', transform: `scale(${pop(f, 408 + i * 6)})`, display: 'inline-block'}}>{hh}</span>
      ))}
    </div>
  );
};
const Chips: React.FC<{f: number; bx: number; by: number}> = ({f, bx, by}) => (
  <>
    {['lição', 'quiz', 'missão'].map((s, i) => {
      const t = 448 + i * 6;
      const k = pop(f, t) * (1 - smooth(f, 464));
      if (f < t || f >= 490) return null;
      const tx = [250, 540, 830][i], ty = 1300;
      const cx = bx + (tx - bx) * k, cy = by + (ty - by) * k;
      return (
        <div key={s} style={{position: 'absolute', left: cx, top: cy, transform: `translate(-50%, -50%) scale(${Math.max(0, k)})`, ...Sans, fontSize: 50, fontWeight: 600, color: '#fff', background: INK, borderRadius: 999, padding: '14px 34px', whiteSpace: 'nowrap'}}>{s}</div>
      );
    })}
  </>
);

// ---------- selo da stack, nome do bot, jogo ----------
const StackTag: React.FC<{f: number; t: number; fromX: number; fromY: number; toX: number; toY: number; dark?: boolean; dy?: number}> = ({f, t, fromX, fromY, toX, toY, dark, dy = 0}) => {
  if (f < t) return null;
  const k = pop(f, t);
  const x = fromX + (toX - fromX) * Math.min(1, smooth(f, t)), y = fromY + (toY - fromY) * Math.min(1, smooth(f, t)) + dy;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `scale(${Math.max(0, k)})`, transformOrigin: '0 50%', display: 'flex', alignItems: 'center', gap: 12, background: dark ? 'rgba(169,155,230,0.12)' : '#fff', border: `2px solid ${dark ? 'rgba(169,155,230,0.45)' : '#E3E7EE'}`, borderRadius: 999, padding: '12px 26px 12px 14px', whiteSpace: 'nowrap'}}>
      <span style={{width: 36, height: 36, borderRadius: '50%', background: dark ? LAV : '#000', display: 'inline-block'}} />
      <span style={{...Mono, fontSize: 30, color: dark ? '#F1F3F6' : INK}}>feito com grok bot + elevenlabs</span>
    </div>
  );
};
const NameTag: React.FC<{f: number; x: number; y: number}> = ({f, x, y}) => {
  const k = pop(f, 22) * (1 - smooth(f, 80));
  if (f < 22 || f > 100) return null;
  return <div style={{position: 'absolute', left: x, top: y, transform: `translateX(-50%) scale(${Math.max(0, k)})`, ...Mono, fontSize: 28, color: '#fff', background: INK, borderRadius: 999, padding: '6px 18px'}}>grok bot</div>;
};
const Flame: React.FC<{s: number}> = ({s}) => (
  <svg width={70} height={84} viewBox="0 0 70 84" style={{transform: `scale(${s})`, transformOrigin: '50% 100%'}}>
    <path d="M35 4 C44 22 64 32 62 56 C60 74 48 82 35 82 C20 82 8 72 8 56 C8 42 18 34 22 22 C28 32 30 38 34 40 C36 28 34 16 35 4Z" fill="#F0A63C" />
    <path d="M35 44 C40 54 48 58 46 68 C44 76 39 78 35 78 C29 78 24 74 24 67 C24 60 30 56 35 44Z" fill="#FFE1A6" />
  </svg>
);
const Game: React.FC<{f: number}> = ({f}) => {
  if (f < 466 || f >= OUTRO) return null;
  const y = scrollY(f, 466);
  const xp = smooth(f, 482);
  const tick = pop(f, 500);
  const row: React.CSSProperties = {display: 'flex', alignItems: 'center', gap: 28, background: '#fff', border: '2px solid #E3E7EE', borderRadius: 32, padding: '22px 30px'};
  return (
    <div style={{position: 'absolute', left: M, right: M, top: 960, transform: `translateY(${y}px)`, display: 'flex', flexDirection: 'column', gap: 22}}>
      <div style={row}>
        <Flame s={Math.max(0, pop(f, 470)) * (1 + 0.04 * Math.sin(f / 3))} />
        <div style={{display: 'flex', gap: 16}}>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => {
            const k = pop(f, 474 + i * 3);
            return <div key={i} style={{width: 52, height: 52, borderRadius: '50%', border: '3px solid #E3E7EE', background: k > 0.3 ? '#F0A63C' : '#fff', transform: `scale(${f >= 474 + i * 3 ? 0.7 + 0.3 * k : 1})`}} />;
          })}
        </div>
      </div>
      <div style={row}>
        <span style={{...Mono, fontSize: 40, fontWeight: 700, color: '#6A5BC4', width: 70}}>xp</span>
        <div style={{flex: 1, height: 34, borderRadius: 999, background: '#ECEFF4', overflow: 'hidden'}}>
          <div style={{width: `${xp * 100}%`, height: '100%', borderRadius: 999, background: LAV}} />
        </div>
      </div>
      <div style={row}>
        <div style={{width: 62, height: 62, borderRadius: 16, border: '4px solid #0B0B0F', background: tick > 0.3 ? INK : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          {f >= 500 && <svg width={40} height={40} viewBox="0 0 40 40" style={{transform: `scale(${tick})`}}><path d="M7 21 L16 30 L33 10" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        </div>
        <span style={{...Sans, fontSize: 44, fontWeight: 600, color: INK}}>missão do dia</span>
      </div>
    </div>
  );
};

// ---------- outro escuro ----------
const Outro: React.FC<{f: number}> = ({f}) => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 35%, #1A1726 0%, #0B0B0F 55%, #050507 100%)'}}>
    <svg width="1080" height="1920" style={{position: 'absolute', inset: 0}}>
      <defs>
        <pattern id="dots" width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="9" cy="9" r="1.6" fill="rgba(169,155,230,0.16)" />
        </pattern>
      </defs>
      <rect width="1080" height="1920" fill="url(#dots)" />
    </svg>
  </AbsoluteFill>
);

// ---------- pose do bot: movimentos de 20 frames power3.inOut, antecipacao e arco ----------
const MOVES: [number, number, number, number][] = [
  [0, 540, 620, 380], [86, 860, 300, 210], [190, 540, PHONE_TOP + 44, 54], [298, 900, 1560, 190],
  [384, 540, 820, 260], [466, 540, 700, 220], [510, 540, 640, 300],
];
const MOVE_DUR = 20;
const botPose = (f: number) => {
  let x = MOVES[0][1], y = MOVES[0][2], size = MOVES[0][3], dip = 0, arc = 0;
  for (let i = 1; i < MOVES.length; i++) {
    const [t, mx, my, ms] = MOVES[i], [, px, py, ps] = MOVES[i - 1];
    const u = cl((f - t) / MOVE_DUR), e = IO3(u);
    x += (mx - px) * e; y += (my - py) * e; size += (ms - ps) * e;
    const pre = cl((f - (t - 6)) / 6);
    if (f >= t - 6 && f < t + MOVE_DUR) dip = 0.2 * ps * (f < t ? IO3(pre) : 1 - e);
    if (u > 0 && u < 1) arc = -Math.min(110, 0.12 * Math.hypot(mx - px, my - py)) * Math.sin(Math.PI * u);
  }
  const intro = Easing.out(Easing.cubic)(cl(f / 8));
  return {x, y: y + dip + arc, size: size * intro};
};

export const Tutora: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const dark = f >= OUTRO;
  const b = botPose(f);
  // bot some dentro da ilha (200-226) e reaparece no canto do telefone (300) para soltar as bolhas
  const inIsland = f >= 214 && f < 300;
  const L = {position: 'absolute' as const, left: M, right: M};
  return (
    <AbsoluteFill style={{background: BG}}>
      {dark && <Outro f={f} />}
      {f < 120 && <StackTag f={f} t={46} fromX={b.x} fromY={b.y} toX={290} toY={895} dy={scrollY(f, -60, 82)} />}
      {/* 0-3s gancho */}
      {f < 120 && (
        <div style={{...L, top: 980, transform: `translateY(${scrollY(f, -60, 82) }px)`}}>
          <Line t={14} size={34} color={MUTE} weight={500}><span style={Mono}>01 · o problema</span></Line>
          <Line t={18} style={{marginTop: 24}}>eu pagava um curso</Line>
          <Line t={24}>de inglês dado por</Line>
          <Line t={30} color={'#6A5BC4'}>uma ia genérica.</Line>
        </div>
      )}
      {/* 3-6s pilares */}
      {f >= 82 && f < 200 && (
        <div style={{...L, top: 560, transform: `translateY(${scrollY(f, 88, 166)}px)`}}>
          <Line t={92} size={34} color={MUTE} weight={500}><span style={Mono}>02 · o que eu queria</span></Line>
          {[['personalização', 'aprender com os meus erros reais'], ['sem atrito', 'falar na hora, sem abrir mais um app'], ['constância', 'um motivo para voltar todo dia']].map(([a, d], i) => (
            <div key={a} style={{marginTop: 46, transform: `scale(${Math.max(0, pop(f, 100 + i * 14))})`, transformOrigin: '0 50%', background: '#fff', border: '2px solid #E3E7EE', borderRadius: 32, padding: '28px 34px'}}>
              <div style={{...Sans, fontSize: 64, fontWeight: 600, color: INK}}><span style={{...Mono, fontSize: 30, color: '#6A5BC4', marginRight: 20}}>{`0${i + 1}`}</span>{a}</div>
              <div style={{...Sans, letterSpacing: 0, fontSize: 34, color: MUTE, marginTop: 8}}>{d}</div>
            </div>
          ))}
        </div>
      )}
      {/* legendas cena telefone/conversa */}
      {f >= 168 && f < 400 && (
        <div style={{...L, top: 120, height: 180, transform: `translateY(${scrollY(f, 172, 384) * 0}px)`}}>
          {f < 310 && (
            <div style={{position: 'absolute', top: 0, transform: `translateY(${scrollY(f, -60, 290)}px)`}}>
              <Line t={176} size={56}>um toque no atalho do iphone.</Line>
              <Line t={232} size={56} color={'#6A5BC4'}>voz: elevenlabs · sarah.</Line>
            </div>
          )}
          {f >= 296 && (
            <div style={{position: 'absolute', top: 0, transform: `translateY(${scrollY(f, -60, 378)}px)`}}>
              <Line t={300} size={56}>eu só falo. a molly corrige</Line>
              <Line t={306} size={56} color={'#6A5BC4'}>na hora, em inglês.</Line>
            </div>
          )}
        </div>
      )}
      <Phone f={f} />
      {/* 13-16s cartao */}
      {f >= 388 && f < OUTRO && (
        <div style={{...L, top: 140}}>
          {f < 440 ? (
            <>
              <Line t={394} size={58}>o grok bot leva as transcrições</Line>
              <Line t={400} size={58} color={'#6A5BC4'}>às 13h e às 21h.</Line>
            </>
          ) : f < 468 ? (
            <>
              <Line t={440} size={58}>e as transcrições viram</Line>
              <Line t={446} size={58} color={'#6A5BC4'}>lição, quiz e missão.</Line>
            </>
          ) : (
            <>
              <Line t={468} size={58}>e vira jogo: sequência, xp</Line>
              <Line t={474} size={58} color={'#6A5BC4'}>e missões diárias.</Line>
            </>
          )}
        </div>
      )}
      <Card f={f} bx={b.x} by={b.y} bs={b.size} />
      <Game f={f} />
      <Chips f={f} bx={b.x} by={b.y} />
      {/* bot anfitriao */}
      {!inIsland && (
        <Bot f={f} x={b.x} y={b.y} size={b.size} />
      )}
      {f < 120 && <NameTag f={f} x={b.x} y={b.y + b.size / 2 + 34} />}
      {f >= OUTRO && <StackTag f={f} t={OUTRO + 48} fromX={540} fromY={640} toX={M} toY={1570} dark />}
      {/* 16-20s outro */}
      {dark && (
        <>
          <div style={{...L, top: 900}}>
            <Line t={OUTRO + 14} size={124} color="#F1F3F6">menos telas.</Line>
            <Line t={OUTRO + 34} size={54} color="#B8BEC7" weight={400} style={{marginTop: 40}}>não construí um app de inglês.</Line>
            <Line t={OUTRO + 44} size={54} color="#F1F3F6" weight={500}>montei um tutor de voz que</Line>
            <Line t={OUTRO + 50} size={54} color={LAV} weight={500}>aprende com os meus erros.</Line>
          </div>
          <div style={{position: 'absolute', inset: 0, transform: `translateY(${160 + (1 - smooth(f, OUTRO + 40)) * 200}px)`}}><Footer /></div>
        </>
      )}
    </AbsoluteFill>
  );
};
