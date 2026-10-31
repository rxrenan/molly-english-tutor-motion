import React from 'react';
import {AbsoluteFill, Img, spring, staticFile, useCurrentFrame, delayRender, continueRender, interpolate} from 'remotion';
import {C, FONT} from './tokens';

export const DURATION_V1 = 600;
const FPS = 30;
const M = 96;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const sp = (f: number, t: number, damping = 18, mass = 0.9) =>
  f < t ? 0 : spring({frame: f - t, fps: FPS, config: {damping, mass, stiffness: 120}});
// soma de molas por mudanca de alvo
const stack = (f: number, keys: [number, number][], d = 18) => {
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++) v += (keys[i][1] - keys[i - 1][1]) * sp(f, keys[i][0], d);
  return v;
};
const Mono: React.CSSProperties = {fontFamily: FONT.mono, letterSpacing: '0.04em'};
const Sans: React.CSSProperties = {fontFamily: FONT.sans, letterSpacing: '-0.02em'};

// ---------- texto que sobe por mascara (nao e fade) ----------
const Line: React.FC<{t: number; out?: number; size?: number; color?: string; weight?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({t, out = 9999, size = 72, color = C.starlight, weight = 500, children, style}) => {
  const f = useCurrentFrame();
  const y = (1 - sp(f, t, 20)) * 110 - sp(f, out, 22) * 110;
  return (
    <div style={{overflow: 'hidden', ...style}}>
      <div style={{...Sans, fontSize: size, fontWeight: weight, color, lineHeight: 1.12, transform: `translateY(${y}%)`}}>{children}</div>
    </div>
  );
};
const Tag: React.FC<{children: React.ReactNode; color?: string; size?: number}> = ({children, color = C.steel, size = 28}) => (
  <span style={{...Mono, fontSize: size, color}}>{children}</span>
);

// ---------- poses do telefone (container unico) ----------
const POSE: {t: number; x: number; y: number; s: number; r: number}[] = [
  {t: 0, x: 260, y: 1110, s: 0.56, r: 6},
  {t: 64, x: 230, y: 1090, s: 0.62, r: 2},
  {t: 118, x: 290, y: 1060, s: 0.5, r: -4},
  {t: 236, x: 0, y: 740, s: 0.92, r: 0},
  {t: 386, x: -205, y: 900, s: 0.66, r: -3},
  {t: 478, x: 0, y: 1110, s: 0.44, r: 0},
  {t: 572, x: 260, y: 1110, s: 0.56, r: 6},
];
const pose = (f: number) => {
  const k = (p: 'x' | 'y' | 's' | 'r') => stack(f, POSE.map((q) => [q.t, q[p]] as [number, number]), 22);
  return {x: k('x'), y: k('y'), s: k('s'), r: k('r')};
};
const PW = 640, PH = 1310;

// ---------- telas ----------
const GenericLesson: React.FC<{f: number}> = ({f}) => {
  const strike = interpolate(f, [34, 56], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: '#F4F4F6', padding: '120px 44px', ...Sans, color: '#111'}}>
      <div style={{...Mono, fontSize: 26, color: '#777'}}>curso de inglês · aula 12</div>
      <div style={{fontSize: 52, fontWeight: 600, marginTop: 24}}>present simple</div>
      {['the same lesson', 'for every student', 'same exercises', 'same feedback'].map((s, i) => (
        <div key={i} style={{marginTop: 26, height: 84, borderRadius: 20, background: '#E3E3E8', display: 'flex', alignItems: 'center', padding: '0 28px', fontSize: 32, color: '#555'}}>{s}</div>
      ))}
      <div style={{position: 'absolute', left: 44, right: 44, top: 640, height: 150, border: '6px solid #111', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 50, fontWeight: 700, whiteSpace: 'nowrap', transform: `rotate(-6deg) scale(${1.6 - 0.6 * sp(f, 34, 12)})`, opacity: f < 34 ? 0 : 1, background: '#F4F4F6'}}>
        aula por ia genérica
        <div style={{position: 'absolute', left: 20, top: '50%', height: 6, width: `${strike * 92}%`, background: '#111'}} />
      </div>
    </AbsoluteFill>
  );
};

export const HomeScreen: React.FC<{f: number}> = ({f}) => {
  const press = 1 - 0.14 * (sp(f, 266, 30) - sp(f, 274, 30));
  const ring = interpolate(f, [266, 290], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: '#3A3A3C', ...Sans}}>
      <div style={{position: 'absolute', top: 40, left: 70, fontSize: 34, fontWeight: 600, color: '#fff'}}>15:20</div>
      <div style={{position: 'absolute', top: 220, left: 66, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
        <div style={{width: 150, height: 150, borderRadius: 36, overflow: 'hidden', transform: `scale(${press})`, background: '#9D7FD8'}}>
          <Img src={staticFile('molly-icon-v2-180.png')} style={{width: '100%', height: '100%'}} />
        </div>
        <div style={{color: '#fff', fontSize: 28}}>Molly</div>
        {ring > 0 && ring < 1 && (
          <div style={{position: 'absolute', top: 75 - 120 * ring, left: 75 - 120 * ring, width: 240 * ring, height: 240 * ring, borderRadius: '50%', border: `4px solid rgba(255,255,255,${1 - ring})`}} />
        )}
      </div>
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div key={i} style={{position: 'absolute', top: 220 + Math.floor(i / 4) * 230, left: 66 + (i % 4) * 133, width: 108, height: 108, borderRadius: 28, background: 'rgba(255,255,255,0.10)'}} />
      ))}
    </AbsoluteFill>
  );
};

export const Pill: React.FC = () => (
  <div style={{position: 'absolute', right: 30, bottom: 40, display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 999, padding: '12px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.12)'}}>
    <Img src={staticFile('molly-icon-v2-180.png')} style={{width: 56, height: 56, borderRadius: '50%'}} />
    <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
      <div style={{display: 'flex', gap: 8}}>
        <div style={{background: '#000', color: '#fff', borderRadius: 999, padding: '10px 20px', fontSize: 22, fontWeight: 600}}>✆ Call</div>
        <div style={{border: '2px solid #ddd', borderRadius: 999, width: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22}}>💬</div>
      </div>
      <div style={{fontSize: 14, color: '#888', textAlign: 'center'}}>Powered by ElevenAgents</div>
    </div>
  </div>
);

export const MollyHome: React.FC<{f: number}> = ({f}) => (
  <AbsoluteFill style={{background: '#fff', ...Sans, letterSpacing: 0, color: '#111', alignItems: 'center', paddingTop: 300}}>
    <Img src={staticFile('molly-icon-v2-512.png')} style={{width: 260, height: 260, borderRadius: '50%'}} />
    <div style={{fontSize: 40, fontWeight: 700, marginTop: 40}}>Molly · English Tutor</div>
    <div style={{fontSize: 26, color: '#666', marginTop: 20, textAlign: 'center', width: 500, lineHeight: 1.4}}>Toque no botão abaixo, permita o microfone e comece a conversar com a Molly. 🎧</div>
    <Pill />
  </AbsoluteFill>
);

export const MSG: [boolean, string][] = [
  [true, "I go home and make my coffee."],
  [false, "Nice! Now, let's try a standup phrase. What did you do yesterday at work?"],
  [true, "Uh, I don't remember."],
  [false, 'No problem! Just make one up. Try: "Yesterday I worked on a project." Please repeat it.'],
  [true, 'Yesterday I worked on a project.'],
  [false, 'Great! Now, what will you do today?'],
  [true, "Uh, today, I'm lazy."],
  [false, 'Ha, that\'s honest! Try this: "Today I\'ll work on my tasks." Please repeat it.'],
  [true, 'Today I will work on my tasks.'],
  [false, 'Good! Now, are you blocked by anything today?'],
];
const Conversation: React.FC<{f: number}> = ({f}) => {
  const t0 = 318, gap = 7;
  const shown = Math.max(0, Math.min(MSG.length, Math.floor((f - t0) / gap) + 1));
  const scroll = stack(f, MSG.map((_, i) => [t0 + i * gap, Math.max(0, i - 4) * 118] as [number, number]), 24);
  return (
    <AbsoluteFill style={{background: '#fff', ...Sans, letterSpacing: 0, color: '#111'}}>
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 190, background: '#fff', zIndex: 2, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 16, paddingBottom: 20, borderBottom: '1px solid #eee'}}>
        <Img src={staticFile('molly-icon-v2-180.png')} style={{width: 72, height: 72, borderRadius: '50%'}} />
        <div style={{background: '#111', color: '#fff', borderRadius: 999, padding: '10px 22px', fontSize: 24, display: 'flex', alignItems: 'center', gap: 10}}>
          <span style={{width: 12, height: 12, borderRadius: '50%', background: '#3BD16F', opacity: 0.5 + 0.5 * Math.abs(Math.sin(f / 6))}} /> Listening
        </div>
      </div>
      <div style={{position: 'absolute', top: 230, left: 36, right: 36, transform: `translateY(${-scroll}px)`, display: 'flex', flexDirection: 'column', gap: 26}}>
        {MSG.slice(0, shown).map(([me, s], i) => {
          const k = sp(f, t0 + i * gap, 16);
          return me ? (
            <div key={i} style={{alignSelf: 'flex-end', background: '#000', color: '#fff', borderRadius: 30, padding: '18px 26px', fontSize: 28, maxWidth: 440, transform: `translateY(${(1 - k) * 40}px) scale(${0.9 + 0.1 * k})`, transformOrigin: 'right bottom'}}>{s}</div>
          ) : (
            <div key={i} style={{textAlign: 'center', fontSize: 28, lineHeight: 1.35, color: '#222', padding: '0 20px', transform: `translateY(${(1 - k) * 40}px)`}}>{s}</div>
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

// tela por wipe vertical (clip-path), nao fade
const Wipe: React.FC<{f: number; t: number; children: React.ReactNode}> = ({f, t, children}) => {
  if (f < t) return null;
  const k = sp(f, t, 26);
  return <AbsoluteFill style={{clipPath: `inset(${(1 - k) * 100}% 0 0 0)`}}>{children}</AbsoluteFill>;
};

const Phone: React.FC = () => {
  const f = useCurrentFrame();
  const p = pose(f);
  return (
    <div style={{position: 'absolute', left: 540 - PW / 2, top: 0, width: PW, height: PH, transform: `translate(${p.x}px, ${p.y - PH / 2}px) rotate(${p.r}deg) scale(${p.s})`, borderRadius: 92, background: '#000', padding: 18, boxShadow: `0 0 0 2px ${C.line}`}}>
      <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 76, overflow: 'hidden', background: '#fff'}}>
        {(f < 300 || f >= 560) && <GenericLesson f={f >= 560 ? 0 : f} />}
        <Wipe f={f} t={236}><HomeScreen f={f} /></Wipe>
        <Wipe f={f} t={282}><MollyHome f={f} /></Wipe>
        <Wipe f={f} t={306}><Conversation f={f} /></Wipe>
        {f >= 560 && <Wipe f={f} t={560}><GenericLesson f={0} /></Wipe>}
        <div style={{position: 'absolute', top: 18, left: '50%', marginLeft: -90, width: 180, height: 50, borderRadius: 999, background: '#000', zIndex: 5}} />
      </div>
    </div>
  );
};

// ---------- personagens ----------
const Grok: React.FC = () => {
  const f = useCurrentFrame();
  const k = sp(f, 388, 14) - sp(f, 478, 24);
  if (k <= 0.001) return null;
  const bob = Math.sin(f / 9) * 10;
  return (
    <div style={{position: 'absolute', left: 520, top: 250, width: 620, height: 620, transform: `translate(${(1 - k) * 500}px, ${bob}px) rotate(${(1 - k) * 30}deg)`}}>
      <Img src={staticFile('grokbot_ready_cut.png')} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
    </div>
  );
};
const Chatot: React.FC = () => {
  const f = useCurrentFrame();
  const k = sp(f, 432, 13) * (1 - sp(f, 478, 24)) + (f > 478 && f < 500 ? 0.01 : 0);
  if (k <= 0.001) return null;
  return (
    <div style={{position: 'absolute', left: 640, top: 900, width: 340, height: 340, transform: `translate(${sp(f, 478, 24) * 600}px, ${(1 - sp(f, 432, 13)) * 700}px) scale(${0.6 + 0.4 * sp(f, 432, 13)})`}}>
      <Img src={staticFile('chatot.png')} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
    </div>
  );
};
// cartao de transcricao: telefone -> grokbot -> chatot
const Transcript: React.FC = () => {
  const f = useCurrentFrame();
  if (f < 398 || f > 486) return null;
  const x = stack(f, [[398, 300], [400, 560], [436, 560]], 20);
  const y = stack(f, [[398, 900], [400, 760], [436, 1260]], 20);
  const gone = sp(f, 452, 20);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `scale(${(1 - gone) * sp(f, 398, 16)})`, transformOrigin: 'left top', background: C.hull, border: `2px solid ${C.line}`, borderRadius: 22, padding: '18px 24px', display: 'flex', gap: 16, alignItems: 'center'}}>
      <Img src={staticFile('grokbot.png')} style={{width: 48, height: 48, borderRadius: '50%'}} /><Tag color={C.starlight} size={28}>transcrição</Tag>
      {['13h', '21h'].map((h, i) => (
        <span key={h} style={{...Mono, fontSize: 28, color: C.void, background: C.accent, borderRadius: 10, padding: '4px 12px', transform: `scale(${sp(f, 410 + i * 10, 12)})`, display: 'inline-block'}}>{h}</span>
      ))}
    </div>
  );
};
const Chips: React.FC = () => {
  const f = useCurrentFrame();
  const out = sp(f, 478, 24);
  return (
    <div style={{position: 'absolute', left: 620, top: 1250, display: 'flex', gap: 14}}>
      {['lição', 'quiz', 'missão'].map((s, i) => {
        const k = sp(f, 440 + i * 6, 13) * (1 - out);
        return k > 0.001 ? (
          <div key={s} style={{...Sans, fontSize: 40, fontWeight: 500, color: C.starlight, border: `2px solid ${C.accent}`, borderRadius: 999, padding: '10px 26px', transform: `translateY(${(1 - k) * 60}px) scale(${k})`}}>{s}</div>
        ) : null;
      })}
    </div>
  );
};

// ---------- rodape copiado de outro projeto do portfólio ----------
export const Footer: React.FC = () => (
  <div style={{position: 'absolute', left: M, right: M, top: 1534, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
      <svg width={40} height={40} viewBox="0 0 9 9">
        <path fill={C.starlight} d="M0 0H3V1H1V3H0Z M6 0H9V3H8V1H6Z M0 6H1V8H3V9H0Z M9 6V9H6V8H8V6Z M5 3H6V4H5Z" />
      </svg>
      <span style={{fontFamily: FONT.sans, fontWeight: 500, fontSize: 28, letterSpacing: '0.02em', color: C.starlight}}>renan rosa</span>
    </div>
    <span style={{...Mono, fontSize: 22, color: C.steel}}>linkedin.com/in/renanrrosa</span>
  </div>
);

export const useFonts = () => {
  const [h] = React.useState(() => delayRender('fonts'));
  React.useEffect(() => {
    const a = new FontFace('Geist', `url(${staticFile('fonts/Geist.ttf')})`, {weight: '100 900'});
    const b = new FontFace('Geist Mono', `url(${staticFile('fonts/GeistMono.ttf')})`, {weight: '100 900'});
    Promise.all([a.load(), b.load()]).then((x) => { x.forEach((y) => document.fonts.add(y)); continueRender(h); });
  }, [h]);
};

export const TutoraV1: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const L = {position: 'absolute' as const, left: M, right: M};
  return (
    <AbsoluteFill style={{background: C.void}}>
      {/* beat 1 */}
      {f < 130 && (
        <div style={{...L, top: 200}}>
          <Line t={4} out={116}><Tag size={30}>01 · o problema</Tag></Line>
          <Line t={8} out={116} style={{marginTop: 28}}>eu pagava um curso</Line>
          <Line t={14} out={116}>de inglês.</Line>
          <Line t={28} out={116} color={C.accent} style={{marginTop: 24}}>quem dava a aula</Line>
          <Line t={34} out={116} color={C.accent}>era uma ia genérica.</Line>
        </div>
      )}
      {/* beat 2 */}
      {f >= 118 && f < 250 && (
        <div style={{...L, top: 200}}>
          <Line t={122} out={236}><Tag size={30}>02 · o que eu queria de verdade</Tag></Line>
          {[['personalização', 'aprender com os meus erros reais'], ['sem atrito', 'falar na hora, sem abrir mais um app'], ['constância', 'um motivo para voltar todo dia']].map(([a, b], i) => (
            <div key={a} style={{marginTop: 44, display: 'flex', gap: 28}}>
              <Line t={134 + i * 18} out={236 - (2 - i) * 4}><Tag size={30} color={C.accent}>{`0${i + 1}`}</Tag></Line>
              <div>
                <Line t={134 + i * 18} out={236 - (2 - i) * 4} size={70}>{a}</Line>
                <Line t={140 + i * 18} out={236 - (2 - i) * 4} size={36} color={C.titanium} weight={400}>{b}</Line>
              </div>
            </div>
          ))}
        </div>
      )}
      <Phone />
      {/* beat 3 legendas */}
      {f >= 240 && f < 392 && (
        <div style={{...L, top: 1400}}>
          <Line t={244} out={300} size={40} style={{position: 'absolute', top: 0}}>um toque no atalho do iphone.</Line>
          <Line t={300} out={386} size={40} style={{position: 'absolute', top: 0}}>e eu só falo com a molly.</Line>
          <Line t={290} out={386} style={{position: 'absolute', top: 58}} size={28}><Tag size={26} color={C.accent}>voz: elevenlabs · sarah · eleven_flash_v2</Tag></Line>
        </div>
      )}
      {f >= 386 && f < 490 && (
        <div style={{...L, top: 120}}>
          <Line t={392} out={432} size={56} style={{position: 'absolute', top: 0}}>o grokbot leva as transcrições</Line>
          <Line t={398} out={432} size={56} color={C.accent} style={{position: 'absolute', top: 66}}>às 13h e às 21h.</Line>
          <Line t={436} out={480} size={56} style={{position: 'absolute', top: 0}}>o chatot, meu professor,</Line>
          <Line t={442} out={480} size={56} color={C.accent} style={{position: 'absolute', top: 66}}>vira tudo em lição, quiz e missão.</Line>
        </div>
      )}
      <Grok />
      <Transcript />
      <Chatot />
      <Chips />
      {/* beat 4 */}
      {f >= 480 && (
        <div style={{...L, top: 180}}>
          <Line t={484} out={574}><Tag size={30}>04 · a tese</Tag></Line>
          <Line t={488} out={574} size={110} style={{marginTop: 20}}>menos telas.</Line>
          <Line t={512} out={574} size={52} color={C.titanium} weight={400} style={{marginTop: 40}}>não construí um app de inglês.</Line>
          <Line t={522} out={574} size={52} weight={500}>montei um tutor de voz que</Line>
          <Line t={528} out={574} size={52} color={C.accent}>aprende com os meus erros.</Line>
        </div>
      )}
      <Footer />
    </AbsoluteFill>
  );
};
