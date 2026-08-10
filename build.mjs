/**
 * Erzeugt die statische index.html aus dem Artefakt Challiot.dc.html.
 *
 *   node build.mjs
 *
 * Das Artefakt braucht zur Laufzeit support.js (React-Runtime). Die
 * ausgelieferte Seite soll das nicht: hier werden <helmet> und <x-dc>
 * ausgepackt, die Assets auf lokale Dateien umgebogen und die Logik durch
 * assets/site.js ersetzt (Vanilla-Port derselben Interaktionen).
 */
import { readFileSync, writeFileSync } from 'node:fs';

const SRC = 'Challiot.dc.html';
const OUT = 'index.html';

const src = readFileSync(SRC, 'utf8');

const pick = (re, label) => {
  const m = re.exec(src);
  if (!m) throw new Error(`${label} nicht gefunden in ${SRC}`);
  return m[1];
};

let head = pick(/<helmet>([\s\S]*?)<\/helmet>/, '<helmet>').trim();
let body = pick(/<x-dc>([\s\S]*?)<\/x-dc>/, '<x-dc>').trim();

/* ---------- Assets: Webflow-CDN -> lokale Dateien ---------------------- */

const CDN = 'https://cdn.prod.website-files.com/6204b8cffa0a212ec05ff34f/';
const assets = {
  '6204bb6bd42ac9cc3f4407e7_logo.png': 'assets/brand/challiot-logo.png',
  '6204c63856aafd15187840ce_Challiot%20Video-transcode.mp4': 'assets/brand/hero.mp4',
  '62f3b9647d04302916fe0830_challiot-ausstellung.jpg': 'assets/brand/ausstellung.jpg',
  '62f3b9fcdf9145bba62047ba_challiot-fuer-sie-vor-ort.jpg': 'assets/brand/vor-ort.jpg',
  '62fa133a0045ed482b510cf2_dorma-logo.png': 'assets/partners/dorma.png',
  '628346bc081a58f0499d2e30_KL-megla_logo_654c.png': 'assets/partners/kl-megla.png',
  '628346b1378ef55c6fbc0187_pauli-sohn-gmbh-logo-vector.png': 'assets/partners/pauli-sohn.png',
  '628346d33aea710b4a749922_marchio-logotipo-madras-2019-black-web_immagini_DInUf.png': 'assets/partners/madras.png',
  '628346de3906462e49e9b765_MWE-Edelstahlmanufaktur-GmbH-Logo.jpeg': 'assets/partners/mwe.jpg',
  '62fa131c7accc72dbf4b6388_bohle-logo.jpg': 'assets/partners/bohle.jpg',
  '6892f703ea529aa38c9e709a_Hesse_(Hamm)_logo.svg': 'assets/partners/hesse.svg',
  '62fa138f02b2f7598f136fdc_doerken-logo.png': 'assets/partners/doerken.png',
  '630f3df3c4aaa1d1188659fa_Logo_freigestellt_Magna_Glaskeramik.png': 'assets/partners/magna.png',
};
for (const [remote, local] of Object.entries(assets)) {
  const before = body;
  body = body.split(CDN + remote).join(local);
  if (before === body) throw new Error(`Asset-Referenz nicht gefunden: ${remote}`);
}

/* ---------- Bildplatzhalter fuellen ----------------------------------- */

// Jede Sortiments-Zeile bekommt ihr Vorschaubild (Stockfotos, Unsplash).
const pics = {
  '01': 'assets/img/01-duschabtrennungen.jpg',
  '02': 'assets/img/02-spiegel.jpg',
  '03': 'assets/img/03-kuechenrueckwaende.jpg',
  '04': 'assets/img/04-ganzglastueren.jpg',
  '05': 'assets/img/05-glasmoebel.jpg',
  '06': 'assets/img/06-reparaturservice.jpg',
  '07': 'assets/img/07-glasvordaecher.jpg',
  '08': 'assets/img/08-glasbruestungen.jpg',
  '09': 'assets/img/09-windfanganlagen.jpg',
  '10': 'assets/img/10-farben-lacke.jpg',
};
let tagged = 0;
body = body.replace(/(<div data-prod data-i=")(\d\d)(")/g, (m, a, i, b) => {
  if (!pics[i]) throw new Error(`Kein Bild fuer Sortiment ${i}`);
  tagged++;
  return `${a}${i}${b} data-pic="${pics[i]}"`;
});
if (tagged !== Object.keys(pics).length) {
  throw new Error(`${tagged} Sortiments-Zeilen getaggt, erwartet ${Object.keys(pics).length}`);
}

// Aus dem leeren "BILDPLATZ 4:5"-Kasten wird eine echte Bildbuehne.
const stage =
  '<img data-pvimg data-img src="assets/img/01-duschabtrennungen.jpg" ' +
  'alt="Duschabtrennungen von Ernst Challiot &amp; Sohn" ' +
  'style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:1;transition:opacity .4s cubic-bezier(.22,1,.36,1);" />' +
  '<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(13,17,20,.62) 0%,rgba(13,17,20,.08) 30%,rgba(13,17,20,.90) 100%);"></div>';

const glowTag = '<div data-pvglow';
if (!body.includes(glowTag)) throw new Error('Vorschau-Kasten nicht gefunden');
body = body.replace(glowTag, stage + glowTag);

// Das Platzhalter-Label wird nicht mehr gebraucht.
const label = /<div style="position:absolute;top:18px;right:20px;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:\.16em;opacity:\.34;">BILDPLATZ 4:5<\/div>/;
if (!label.test(body)) throw new Error('Platzhalter-Label BILDPLATZ 4:5 nicht gefunden');
body = body.replace(label, '');

/* ---------- Hero: Poster + lazy Bilder -------------------------------- */

body = body.replace(
  '<video data-herovid autoplay muted loop playsinline preload="metadata"',
  '<video data-herovid autoplay muted loop playsinline preload="metadata" poster="assets/brand/ausstellung.jpg" aria-hidden="true"'
);
body = body.replace(/(<img (?=[^>]*assets\/(?:brand\/ausstellung|brand\/vor-ort|partners\/)))/g, '$1loading="lazy" decoding="async" ');

/* ---------- FAQ-Buttons: Zustand fuer Screenreader -------------------- */

body = body.split('<button data-fq').join('<button type="button" aria-expanded="false" data-fq');

/* ---------- Head anreichern ------------------------------------------- */

const meta = `
<meta name="description" content="Ernst Challiot &amp; Sohn GmbH — Glaserei in Mönchengladbach-Rheydt seit vier Generationen. Duschabtrennungen, Spiegel, Küchenrückwände, Ganzglastüren, Glasmöbel und Reparaturservice. Beratung, Aufmaß, eigene Werkstatt, Montage." />
<meta name="theme-color" content="#0D1114" />
<link rel="icon" href="assets/brand/challiot-wordmark.png" />
<link rel="apple-touch-icon" href="assets/brand/challiot-wordmark.png" />
<meta property="og:type" content="website" />
<meta property="og:locale" content="de_DE" />
<meta property="og:title" content="Ernst Challiot &amp; Sohn GmbH — Ihre Glaserei in Mönchengladbach" />
<meta property="og:description" content="Duschabtrennungen, Spiegel, Küchenrückwände, Ganzglastüren und Glasmöbel — beraten, gemessen, in eigener Werkstatt gefertigt und montiert." />
<meta property="og:image" content="assets/brand/ausstellung.jpg" />
<meta name="twitter:card" content="summary_large_image" />`.trim();

head = head.replace('<link rel="preconnect"', meta + '\n<link rel="preconnect"');

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'GlassRepairShop',
  name: 'Ernst Challiot & Sohn GmbH',
  description: 'Glaserei in Mönchengladbach-Rheydt seit vier Generationen.',
  telephone: '+49 2166 49007',
  email: 'info@challiot.de',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Limitenstr. 81–87',
    postalCode: '41236',
    addressLocality: 'Mönchengladbach',
    addressCountry: 'DE',
  },
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'], opens: '07:30', closes: '17:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Friday', opens: '07:30', closes: '16:30' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '08:30', closes: '13:00' },
  ],
  sameAs: [
    'https://www.instagram.com/challiot_glaserei_mg/',
    'https://www.facebook.com/challiot/',
  ],
};

/* ---------- Zusammensetzen -------------------------------------------- */

const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8" />
<!-- Generiert von build.mjs aus ${SRC} — nicht direkt bearbeiten. -->
${head}
<script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
</${'script'}>
</head>
<body>
${body}
<script src="assets/site.js" defer></${'script'}>
</body>
</html>
`;

writeFileSync(OUT, html, 'utf8');
console.log(`${OUT} geschrieben — ${html.length} Zeichen, ${tagged} Sortiments-Bilder verknüpft.`);
