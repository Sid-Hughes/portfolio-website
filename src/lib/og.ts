// Build-time Open Graph image rendering: satori lays out the card as SVG, sharp rasterises it to PNG.
// Colours are read from src/styles/tokens.css (light theme), so the cards follow the site palette.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import satori from 'satori';
import sharp from 'sharp';

const WIDTH = 1200;
const HEIGHT = 630;
const root = process.cwd();

type Node = { type: string; props: Record<string, unknown> & { children?: unknown } };
const h = (type: string, style: Record<string, unknown>, ...children: unknown[]): Node => ({
  type,
  props: { style, children: children.length === 1 ? children[0] : children },
});

let assets: Promise<{ fonts: Parameters<typeof satori>[1]['fonts']; colours: Record<string, string> }> | undefined;

function loadAssets() {
  assets ??= (async () => {
    // satori needs woff/ttf (not woff2), so it uses the static Fontsource files.
    const font = (pkg: string, file: string) => readFile(path.join(root, 'node_modules/@fontsource', pkg, 'files', file));
    const [display, body, tokens] = await Promise.all([
      font('space-grotesk', 'space-grotesk-latin-600-normal.woff'),
      font('inter', 'inter-latin-400-normal.woff'),
      readFile(path.join(root, 'src/styles/tokens.css'), 'utf8'),
    ]);
    const lightTheme = tokens.slice(tokens.indexOf(':root'), tokens.indexOf('}'));
    const token = (name: string, fallback: string) =>
      lightTheme.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1].trim() ?? fallback;
    return {
      fonts: [
        { name: 'Display', data: display, weight: 600, style: 'normal' },
        { name: 'Body', data: body, weight: 400, style: 'normal' },
      ],
      colours: {
        bg: token('bg', '#fafaf9'),
        fg: token('fg', '#1c1917'),
        muted: token('muted', '#57534e'),
        accent: token('accent', '#4f46e5'),
        accentSoft: token('accent-soft', '#eef2ff'),
      },
    };
  })();
  return assets;
}

export async function renderOgImage({
  eyebrow,
  title,
  subtitle,
  siteTitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string | null;
  siteTitle: string;
}): Promise<Buffer> {
  const { fonts, colours } = await loadAssets();
  const titleSize = title.length > 60 ? 56 : title.length > 35 ? 68 : 80;

  const card = h(
    'div',
    {
      // Padding sits inside the 1200×630 card, not on top of it.
      width: WIDTH,
      height: HEIGHT,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '72px 80px',
      backgroundColor: colours.bg,
      backgroundImage: `radial-gradient(circle at 90% 10%, ${colours.accentSoft} 0%, ${colours.bg} 55%)`,
      color: colours.fg,
      fontFamily: 'Body',
    },
    h(
      'div',
      { display: 'flex', flexDirection: 'column', gap: 24 },
      h('div', { fontSize: 26, letterSpacing: 4, textTransform: 'uppercase', color: colours.accent }, eyebrow),
      h('div', { fontFamily: 'Display', fontSize: titleSize, lineHeight: 1.08, letterSpacing: -1.5 }, title),
      ...(subtitle ? [h('div', { fontSize: 30, lineHeight: 1.4, color: colours.muted, maxWidth: 940 }, subtitle)] : []),
    ),
    h(
      'div',
      { display: 'flex', alignItems: 'center', gap: 16, fontSize: 28, color: colours.muted },
      h('div', { width: 48, height: 6, borderRadius: 3, backgroundColor: colours.accent }, ''),
      siteTitle,
    ),
  );

  const svg = await satori(card as Parameters<typeof satori>[0], { width: WIDTH, height: HEIGHT, fonts });
  return sharp(Buffer.from(svg)).png().toBuffer();
}

/** Trim long text to fit the card, breaking at a word. */
export function clamp(text: string | null | undefined, max = 110) {
  if (!text || text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,.;:]+$/, '')}…`;
}
