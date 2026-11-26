import { continueRender, delayRender, staticFile } from 'remotion';

const FACES: [string, string, string, string][] = [
  ['Aref Ruqaa', 'fonts/ArefRuqaa-700-arabic.woff2', '700', 'U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF, U+200C-200E'],
  ['Aref Ruqaa', 'fonts/ArefRuqaa-700-latin.woff2', '700', 'U+0000-00FF, U+2026'],
  ['El Messiri', 'fonts/ElMessiri-700-arabic.woff2', '400 700', 'U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF, U+200C-200E'],
  ['El Messiri', 'fonts/ElMessiri-700-latin.woff2', '400 700', 'U+0000-00FF, U+2026'],
  ['Cormorant Garamond', 'fonts/CormorantGaramond-600-latin.woff2', '600', 'U+0000-00FF'],
];

let loaded = false;
export const loadFonts = () => {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const h = delayRender('fonts');
  Promise.all(
    FACES.map(([fam, file, weight, range]) => {
      const f = new FontFace(fam, `url(${staticFile(file)}) format('woff2')`, { weight, unicodeRange: range });
      document.fonts.add(f);
      return f.load();
    }),
  )
    .then(() => document.fonts.ready)
    .then(() => continueRender(h))
    .catch((e) => { console.error(e); continueRender(h); });
};

export const RUQAA = "'Aref Ruqaa', serif";
export const MESSIRI = "'El Messiri', sans-serif";
export const SERIF = "'Cormorant Garamond', serif";
