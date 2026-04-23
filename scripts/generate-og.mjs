import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const sharp = (await import('sharp')).default;

const W = 1200, H = 630;

const CORNSILK = '#FEFAE0';
const BRONZE = '#D4A373';
const CHARCOAL = '#2B2B2B';
const PAPAYA = '#FAEDCD';
const BEIGE = '#E9EDC9';
const TEA = '#CCD5AE';

const svgFinal = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDFCF5"/>
      <stop offset="55%" stop-color="#FEFAE0"/>
      <stop offset="100%" stop-color="#FAEDCD"/>
    </linearGradient>
    <linearGradient id="spineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="rgba(150,105,60,0.75)"/>
      <stop offset="45%" stop-color="rgba(212,163,115,0.55)"/>
      <stop offset="100%" stop-color="rgba(212,163,115,0.25)"/>
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="6" dy="12" stdDeviation="16" flood-color="rgba(43,43,43,0.14)" flood-opacity="1"/>
    </filter>
    <filter id="softBlur">
      <feGaussianBlur stdDeviation="55"/>
    </filter>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feBlend in="SourceGraphic" mode="overlay" result="blend"/>
      <feComposite in="blend" in2="SourceGraphic" operator="in"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="url(#bgGrad)"/>

  <!-- Grain overlay -->
  <rect width="${W}" height="${H}" opacity="0.04" filter="url(#grain)"/>

  <!-- Warm glows -->
  <ellipse cx="${W}" cy="-50" rx="580" ry="320" fill="#FAEDCD" filter="url(#softBlur)" opacity="0.7"/>
  <ellipse cx="-100" cy="${H}+50" rx="450" ry="280" fill="#E9EDC9" filter="url(#softBlur)" opacity="0.5"/>

  <!-- ── BOOK ── -->
  <g transform="translate(70, 95)" filter="url(#shadow)">
    <rect x="0" y="0" width="350" height="440" rx="18" fill="#FDFCF5" stroke="rgba(212,163,115,0.3)" stroke-width="1.5"/>
    <rect x="0" y="0" width="38" height="440" rx="18" fill="url(#spineGrad)"/>
    <rect x="0" y="0" width="3" height="440" rx="1" fill="rgba(255,248,220,0.6)"/>
    <line x1="0" y1="88" x2="38" y2="88" stroke="rgba(100,65,35,0.18)" stroke-width="1.5"/>
    <line x1="0" y1="176" x2="38" y2="176" stroke="rgba(100,65,35,0.18)" stroke-width="1.5"/>
    <line x1="0" y1="264" x2="38" y2="264" stroke="rgba(100,65,35,0.18)" stroke-width="1.5"/>
    <line x1="0" y1="352" x2="38" y2="352" stroke="rgba(100,65,35,0.18)" stroke-width="1.5"/>
    <rect x="342" y="18" width="9" height="404" rx="4" fill="rgba(232,226,205,0.85)"/>

    <line x1="52" y1="40" x2="316" y2="40" stroke="rgba(212,163,115,0.35)" stroke-width="1.5"/>
    <line x1="52" y1="42" x2="316" y2="42" stroke="rgba(212,163,115,0.15)" stroke-width="0.5"/>

    <g transform="translate(165, 58)">
      <path d="M11 2C11 2 3 7 3 13C3 17.4 6.6 20 11 20C15.4 20 19 17.4 19 13C19 7 11 2 11 2Z" fill="${BRONZE}" fill-opacity="0.45"/>
      <path d="M11 8C11 8 6 11 6 14.5C6 16.99 8.24 18.5 11 18.5C13.76 18.5 16 16.99 16 14.5C16 11 11 8 11 8Z" fill="${BRONZE}"/>
    </g>

    <text x="184" y="108" text-anchor="middle" font-family="Arial,sans-serif" font-size="10" font-weight="700" letter-spacing="3" fill="${BRONZE}">A MEMORY BOOK</text>
    <text x="184" y="138" text-anchor="middle" font-family="Georgia,serif" font-size="20" font-weight="500" fill="${CHARCOAL}">The Family Story</text>

    <line x1="80" y1="156" x2="250" y2="156" stroke="rgba(212,163,115,0.2)" stroke-width="0.75"/>
    <circle cx="184" cy="156" r="4" fill="none" stroke="rgba(212,163,115,0.3)" stroke-width="0.75"/>
    <line x1="118" y1="156" x2="162" y2="156" stroke="rgba(212,163,115,0.2)" stroke-width="0.75"/>
    <line x1="206" y1="156" x2="250" y2="156" stroke="rgba(212,163,115,0.2)" stroke-width="0.75"/>

    <rect x="65" y="174" width="220" height="4" rx="2" fill="rgba(212,163,115,0.22)"/>
    <rect x="65" y="186" width="245" height="4" rx="2" fill="rgba(212,163,115,0.18)"/>
    <rect x="65" y="198" width="175" height="4" rx="2" fill="rgba(204,213,174,0.4)"/>
    <rect x="65" y="210" width="235" height="4" rx="2" fill="rgba(212,163,115,0.16)"/>
    <rect x="65" y="222" width="155" height="4" rx="2" fill="rgba(212,163,115,0.2)"/>
    <rect x="65" y="234" width="200" height="4" rx="2" fill="rgba(212,163,115,0.14)"/>
    <rect x="65" y="246" width="170" height="4" rx="2" fill="rgba(204,213,174,0.3)"/>
    <rect x="65" y="258" width="130" height="4" rx="2" fill="rgba(212,163,115,0.18)"/>

    <rect x="65" y="280" width="72" height="80" rx="10" fill="rgba(212,163,115,0.07)"/>
    <rect x="145" y="280" width="72" height="80" rx="10" fill="rgba(204,213,174,0.1)"/>
    <rect x="225" y="280" width="72" height="80" rx="10" fill="rgba(212,163,115,0.06)"/>
  </g>

  <!-- Decorative leaves -->
  <g opacity="0.3">
    <path d="M0 0 C6 -10 18 -7 24 0 C18 7 6 10 0 0Z" fill="${BRONZE}" transform="translate(1060, 25) rotate(20)"/>
    <path d="M0 0 C4 -7 14 -5 18 0 C14 5 4 7 0 0Z" fill="${BRONZE}" transform="translate(1110, 65) rotate(-10)"/>
    <path d="M0 0 C5 -8 15 -6 20 0 C15 6 5 8 0 0Z" fill="${BRONZE}" transform="translate(1075, 565) rotate(50)"/>
    <path d="M0 0 C3 -5 10 -3 14 0 C10 3 3 5 0 0Z" fill="${BRONZE}" transform="translate(60, 595) rotate(-25)"/>
    <path d="M0 0 C3 -5 10 -3 14 0 C10 3 3 5 0 0Z" fill="${BRONZE}" transform="translate(445, 22) rotate(8)"/>
  </g>

  <!-- Text section -->
  <text x="480" y="170" font-family="Arial,sans-serif" font-size="13" font-weight="700" letter-spacing="3" fill="${BRONZE}">A KEEPSAKE FOR GENERATIONS</text>
  <line x1="480" y1="184" x2="620" y2="184" stroke="${BRONZE}" stroke-width="2.5" stroke-linecap="round"/>
  <text x="480" y="275" font-family="Georgia,serif" font-size="68" font-weight="400" fill="${CHARCOAL}" letter-spacing="-1.5">Write Your</text>
  <text x="480" y="360" font-family="Georgia,serif" font-size="68" font-weight="400" font-style="italic" fill="${CHARCOAL}" letter-spacing="-1.5">Family's Story</text>
  <text x="480" y="400" font-family="Arial,sans-serif" font-size="26" font-weight="400" fill="#6A6A5A">Print it to last.</text>
  <line x1="480" y1="422" x2="560" y2="422" stroke="${BRONZE}" stroke-width="2.5" stroke-linecap="round"/>
  <text x="480" y="455" font-family="Georgia,serif" font-size="20" fill="#6A6A5A">Free to start · Printed books from $99</text>

  <!-- Branding -->
  <g transform="translate(480, 545)">
    <path d="M11 2C11 2 3 7 3 13C3 17.4 6.6 20 11 20C15.4 20 19 17.4 19 13C19 7 11 2 11 2Z" fill="${BRONZE}" fill-opacity="0.5" transform="translate(0,2)"/>
    <path d="M11 8C11 8 6 11 6 14.5C6 16.99 8.24 18.5 11 18.5C13.76 18.5 16 16.99 16 14.5C16 11 11 8 11 8Z" fill="${BRONZE}" transform="translate(0,2)"/>
    <text x="30" y="20" font-family="Arial,sans-serif" font-size="17" font-weight="700" fill="#6A6A5A">MemoryProject.com</text>
  </g>

  <!-- Bronze circles bottom-right -->
  <circle cx="1140" cy="580" r="40" fill="${BRONZE}" opacity="0.08"/>
  <circle cx="1140" cy="580" r="28" fill="${BRONZE}" opacity="0.06"/>
</svg>`;

async function main() {
  const svgPath = '/tmp/og-image.svg';
  writeFileSync(svgPath, svgFinal);
  const svgBuffer = readFileSync(svgPath);

  const pngBuffer = await sharp(svgBuffer, { density: 144 })
    .resize(W, H)
    .png()
    .toBuffer();

  const outPath = join(process.cwd(), 'public/og-image.png');
  writeFileSync(outPath, pngBuffer);
  console.log('Written OG image:', pngBuffer.length, 'bytes');
}

main().catch(e => { console.error(e); process.exit(1); });
