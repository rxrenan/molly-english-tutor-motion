import React from 'react';
import {AbsoluteFill, Img, spring, staticFile, useCurrentFrame} from 'remotion';
import {FONT} from './tokens';
import {HomeScreen, MollyHome, MSG, Footer, useFonts} from './TutoraV1';

// v2: grammar da referencia. fundo claro 0-16s, corte seco para outro escuro.
export const DURATION_V2 = 600;
const FPS = 30;
const BG = '#F4F7FB', INK = '#0B0B0F', LAV = '#A99BE6', MUTE = '#6B7080';
const M = 96;
const OUTRO = 480;

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

// ---------- grokbot vetorial ----------
const BLINKS = [40, 130, 205, 330, 420, 520, 575];
const Bot: React.FC<{x: number; y: number; size: number; morph: number; rot?: number; impact?: number; f: number; idle?: number}> = ({x, y, size, morph, rot = 0, impact = 0, f, idle = 1}) => {
  const ph = f / 9;
  const float = Math.sin(ph) * 14 * idle;
  const vel = Math.cos(ph) * idle; // subindo -> estica, embaixo -> achata
  const sy = (0.78 + 0.22 * morph) * (1 + 0.06 * -vel) * (1 - 0.22 * impact);
  const sx = (1.3 - 0.3 * morph) * (1 + 0.05 * vel) * (1 + 0.18 * impact);
  const tilt = -14 * (1 - morph) + rot;
  let eye = 1;
  for (const b of BLINKS) { const d = Math.abs(f - b); if (d < 2) eye = d === 0 ? 0.05 : 0.4; }
  return (
    <div style={{position: 'absolute', left: x - size / 2, top: y - size / 2 + float, width: size, height: size, transform: `rotate(${tilt}deg) scale(${sx}, ${sy})`, transformOrigin: '50% 100%'}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: '#000'}} />
      {[0.56, 0.74].map((ex, i) => (
        <div key={i} style={{position: 'absolute', left: size * ex - size * 0.055, top: size * 0.3, width: size * 0.11, height: size * 0.22, borderRadius: '50%', background: '#fff', transform: `scaleY(${eye})`}} />
      ))}
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

// ---------- cartao, chatot, chips ----------
const Card: React.FC<{f: number}> = ({f}) => {
  if (f < 396 || f > 470) return null;
  const x = stack(f, [[396, 330], [416, 760]]);
  const y = stack(f, [[396, -200], [397, 540], [416, 660], [436, 1110]]);
  const gone = smooth(f, 448);
  return (
    <div style={{position: 'absolute', left: x - 200, top: y - 50 - gone * 60, width: 400, transform: `scale(${1 - gone})`, background: '#fff', borderRadius: 26, padding: '20px 24px', boxShadow: 'none', border: '2px solid #E3E7EE', display: 'flex', gap: 14, alignItems: 'center', ...Sans}}>
      <span style={{fontSize: 30, fontWeight: 600, color: INK}}>transcrição</span>
      {['13h', '21h'].map((h, i) => (
        <span key={h} style={{...Mono, fontSize: 28, color: INK, background: LAV, borderRadius: 12, padding: '4px 12px', transform: `scale(${pop(f, 404 + i * 6)})`, display: 'inline-block'}}>{h}</span>
      ))}
    </div>
  );
};
const Chatot: React.FC<{f: number}> = ({f}) => {
  if (f < 410 || f >= OUTRO) return null;
  const k = pop(f, 412);
  const land = sp(f, 442, 8, 220) - sp(f, 448, 8, 220);
  return (
    <div style={{position: 'absolute', left: 760 - 190, top: 1120 + (1 - Math.min(k, 1)) * 600, width: 380, height: 380, transform: `scale(${1 - 0.12 * land}, ${1 + 0.0 * land - 0.1 * land})`, transformOrigin: '50% 100%'}}>
      <Img src={staticFile('chatot.png')} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
    </div>
  );
};
const Chips: React.FC<{f: number}> = ({f}) => (
  <div style={{position: 'absolute', left: M, top: 1560, display: 'flex', gap: 18}}>
    {['lição', 'quiz', 'missão'].map((s, i) => {
      const k = pop(f, 446 + i * 6);
      return k > 0.001 && f < OUTRO ? (
        <div key={s} style={{...Sans, fontSize: 48, fontWeight: 600, color: '#fff', background: INK, borderRadius: 999, padding: '14px 34px', transform: `scale(${k})`}}>{s}</div>
      ) : null;
    })}
  </div>
);

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

// ---------- pose do bot por cena ----------
const botPose = (f: number) => {
  const x = stack(f, [[0, 540], [86, 860], [190, 540], [298, 900], [384, 330], [416, 760], [470, 540]]);
  const y = stack(f, [[0, 620], [86, 300], [190, PHONE_TOP + 44], [298, 1560], [384, 700], [416, 820], [470, 640]]);
  const size = stack(f, [[0, 0], [4, 380], [86, 210], [190, 54], [298, 190], [384, 260], [416, 220], [470, 300]], 'pop');
  const morph = stack(f, [[0, 0], [30, 1], [86, 0], [120, 1], [384, 0], [400, 1], [470, 0], [500, 1]]);
  return {x, y, size, morph};
};

export const TutoraV2: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const dark = f >= OUTRO;
  const b = botPose(f);
  // bot some dentro da ilha (200-226) e reaparece no canto do telefone (300) para soltar as bolhas
  const inIsland = f >= 214 && f < 300;
  const impact = (sp(f, 404, 8, 240) - sp(f, 410, 8, 240)) + (sp(f, 492, 8, 240) - sp(f, 498, 8, 240));
  const shake = f >= 548 && f < 572 ? 15 * Math.sin((f - 548) * 1.1) * (1 - (f - 548) / 24) : 0;
  const L = {position: 'absolute' as const, left: M, right: M};
  return (
    <AbsoluteFill style={{background: BG}}>
      {dark && <Outro f={f} />}
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
              <Line t={232} size={56} color={'#6A5BC4'}>voz da elevenlabs.</Line>
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
              <Line t={394} size={58}>o grokbot leva as transcrições</Line>
              <Line t={400} size={58} color={'#6A5BC4'}>às 13h e às 21h.</Line>
            </>
          ) : (
            <>
              <Line t={440} size={58}>o chatot, meu professor,</Line>
              <Line t={446} size={58} color={'#6A5BC4'}>vira tudo em lição, quiz e missão.</Line>
            </>
          )}
        </div>
      )}
      <Chatot f={f} />
      <Card f={f} />
      <Chips f={f} />
      {/* bot anfitriao */}
      {!inIsland && (
        <Bot f={f} x={b.x} y={b.y} size={b.size} morph={b.morph} impact={impact} rot={shake} idle={f > 190 && f < 214 ? 0.2 : 1} />
      )}
      {/* 16-20s outro */}
      {dark && (
        <>
          <div style={{...L, top: 900}}>
            <Line t={OUTRO + 14} size={124} color="#F1F3F6">menos telas.</Line>
            <Line t={OUTRO + 34} size={54} color="#B8BEC7" weight={400} style={{marginTop: 40}}>não construí um app de inglês.</Line>
            <Line t={OUTRO + 44} size={54} color="#F1F3F6" weight={500}>montei um tutor de voz que</Line>
            <Line t={OUTRO + 50} size={54} color={LAV} weight={500}>aprende com os meus erros.</Line>
          </div>
          <div style={{position: 'absolute', inset: 0, transform: `translateY(${160 + (1 - smooth(f, OUTRO + 60)) * 200}px)`}}><Footer /></div>
        </>
      )}
    </AbsoluteFill>
  );
};
