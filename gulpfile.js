const { src, dest, watch, series, parallel } = require('gulp');
const fileInclude = require('gulp-file-include');
const htmlmin = require('gulp-htmlmin');
const through2 = require('through2');

const paths = {
  html: 'src/index.html',
  components: 'src/components/**/*.html',
  css: 'src/styles.css',
  images: 'src/images/**/*',
  output: 'dist',
};

const TEST_REPLACEMENT = 'demo';

const fixLineHeights = (html) =>
  html
    .replace(/line-height:\s*NaN;?/gi, 'line-height: 1.2;')
    .replace(/mso-line-height-alt:\s*NaNpx;?/gi, 'mso-line-height-alt: 13px;');

const htmlMinifyOptions = {
  collapseWhitespace: true,
  removeComments: false, // preserve MSO conditional comments for email clients
  minifyCSS: true,
  minifyJS: true,
  keepClosingSlash: true,
  ignoreCustomFragments: [/{%[\s\S]*?%}/, /{{[\s\S]*?}}/],
};

function minifyTestOnly() {
  return through2.obj(function (file, _, cb) {
    const isTestFile = file.path.toLowerCase().endsWith('index-brevo.min.html');
    if (!isTestFile) {
      cb(null, file);
      return;
    }

    const minifier = htmlmin(htmlMinifyOptions);
    minifier.once('data', (minified) => cb(null, minified));
    minifier.once('error', cb);
    minifier.end(file);
  });
}

function minifyBrevoOnly() {
  return through2.obj(function (file, _, cb) {
    const isBrevoFile = file.path.toLowerCase().endsWith('index.min.html');
    if (!isBrevoFile) {
      cb(null, file);
      return;
    }

    const minifier = htmlmin(htmlMinifyOptions);
    minifier.once('data', (minified) => cb(null, minified));
    minifier.once('error', cb);
    minifier.end(file);
  });
}

function html() {
  return src(paths.html)
    .pipe(
      fileInclude({
        basepath: 'src',
        prefix: '@@',
        indent: true,
      })
    )
    // emit both the normal index.html and a cleaned index-test.html with placeholders stripped
    .pipe(
      through2.obj(function (file, _, cb) {
        const content = file.contents.toString();

        const mainFile = file.clone();
        mainFile.contents = Buffer.from(content);

        const testFile = file.clone();
        const sanitized = fixLineHeights(
          content
            // remove Liquid/templating blocks
            .replace(/{%[\s\S]*?%}/g, '')
            // neutralize double-brace placeholders (raw)
            .replace(/{{[^}]*}}/g, TEST_REPLACEMENT)
            // neutralize URL-encoded placeholders (including nested)
            .replace(/%7B%7B.*?%7D%7D/gi, TEST_REPLACEMENT)
            // drop stray encoded braces
            .replace(/%7B|%7D/gi, '')
            // strip leftover curly braces after replacement
            .replace(new RegExp(`${TEST_REPLACEMENT}\\}`, 'g'), TEST_REPLACEMENT)
        );

        testFile.contents = Buffer.from(sanitized);
        testFile.path = testFile.path.replace(/index\.html$/i, 'index-brevo.min.html');

        const brevoFile = file.clone();
        brevoFile.contents = Buffer.from(fixLineHeights(content));
        brevoFile.path = brevoFile.path.replace(/index\.html$/i, 'index.min.html');

        this.push(mainFile);
        this.push(testFile);
        this.push(brevoFile);
        cb();
      })
    )
    .pipe(minifyTestOnly())
    .pipe(minifyBrevoOnly())
    .pipe(dest(paths.output));
}

function images() {
  // Copy binaries without UTF-8 re-encoding (avoid corrupting PNGs)
  return src(paths.images, { encoding: false }).pipe(
    dest(`${paths.output}/images`)
  );
}

function watcher() {
  watch([paths.html, paths.components, paths.css], html);
  watch(paths.images, images);
}

exports.html = html;
exports.images = images;
exports.watch = series(parallel(html, images), watcher);
exports.default = parallel(html, images);

