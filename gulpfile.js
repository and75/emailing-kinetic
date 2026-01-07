const { src, dest, watch, series, parallel } = require('gulp');
const fileInclude = require('gulp-file-include');
const htmlmin = require('gulp-htmlmin');

const paths = {
  html: 'src/index.html',
  components: 'src/components/**/*.html',
  css: 'src/styles.css',
  images: 'src/images/**/*',
  output: 'dist',
};

function html() {
  return src(paths.html)
    .pipe(
      fileInclude({
        basepath: 'src',
        prefix: '@@',
        indent: true,
      })
    )
    // .pipe(
    //   htmlmin({
    //     collapseWhitespace: true,
    //     removeComments: true,
    //     minifyCSS: true,
    //     minifyJS: true,
    //     ignoreCustomFragments: [/{%[\s\S]*?%}/, /{{[\s\S]*?}}/],
    //   })
    // )
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
