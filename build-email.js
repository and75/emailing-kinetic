const fs = require('fs');
const path = require('path');
const inlineCss = require('inline-css');

const SRC_HTML = path.join(__dirname, 'src', 'index.html');
const SRC_CSS = path.join(__dirname, 'src', 'styles.css');
const DIST_DIR = path.join(__dirname, 'dist');
const DIST_HTML = path.join(DIST_DIR, 'index.html');

async function build() {
  const html = fs.readFileSync(SRC_HTML, 'utf8');
  const css = fs.existsSync(SRC_CSS) ? fs.readFileSync(SRC_CSS, 'utf8') : '';

  // Rimuovi il link di dev per evitare riferimenti esterni nell'email finale.
  const withoutDevLink = html
    .replace(/<!--DEV-LINK-->[\s\S]*?<!--\/DEV-LINK-->/g, '')
    // Rimuovi i toggle di preview (solo uso browser)
    .replace(/<!--DEV-TOGGLE-->[\s\S]*?<!--\/DEV-TOGGLE-->/g, '')
    // Rimuovi toggle lingua (solo preview browser)
    .replace(/<!--DEV-LANG-->[\s\S]*?<!--\/DEV-LANG-->/g, '');

  // Inject styles inside the placeholder comment in the <style> block.
  const withStyles = withoutDevLink.replace('/*@@STYLES@@*/', css);

  // Inline what can be inlined, but keep the <style> tag for kinetic CSS.
  const inlined = await inlineCss(withStyles, {
    url: `file://${path.join(__dirname, 'src')}/`,
    removeStyleTags: false,
    applyLinkTags: false,
  });

  fs.mkdirSync(DIST_DIR, { recursive: true });
  fs.writeFileSync(DIST_HTML, inlined, 'utf8');
  console.log(`Build completata: ${DIST_HTML}`);
}

build().catch((err) => {
  console.error('Errore durante la build:', err);
  process.exit(1);
});
