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

  // Inject styles inside the placeholder comment in the <style> block.
  const withStyles = html.replace('/*@@STYLES@@*/', css);

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
