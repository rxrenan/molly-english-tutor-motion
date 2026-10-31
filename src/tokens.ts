// Deep Field v2.2: valores copiados de deep-field/tokens.json e guia/motion.json
export const C = {
  void: '#08090B',
  deep: '#0E0F12',
  hull: '#17191D',
  line: '#24272D',
  starlight: '#F1F3F6',
  titanium: '#B8BEC7',
  steel: '#858B95',
  dust: '#5A6069',
  accent: '#A99BE6', // lavanda grokbot/molly, acento unico
  star: 'rgba(241,243,246,0.55)',
};
export const FONT = {
  sans: '"Geist", "Helvetica Neue", Arial, sans-serif',
  mono: '"Geist Mono", ui-monospace, "SFMono-Regular", Menlo, monospace',
};
// motion.json: easing "sai" cubic-bezier(.2,.7,.2,1), entrada 600ms, subida 14px,
// fio 500ms (0 a 72px), atrasos 0/120/260/420/600ms
export const EASE_OUT: [number, number, number, number] = [0.2, 0.7, 0.2, 1];
export const EASE_IO: [number, number, number, number] = [0.4, 0, 0.2, 1];
export const ms = (v: number, fps = 30) => (v / 1000) * fps;
