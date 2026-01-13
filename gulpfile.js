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
        testFile.contents = Buffer.from(
          content
            .replace(/{%[\s\S]*?%}/g, '') // remove template tags
            .replace(/{{[\s\S]*?}}/g, 'TEST') // neutralize double-brace placeholders
        );
        testFile.path = testFile.path.replace(/index\.html$/i, 'index-test.html');

        this.push(mainFile);
        this.push(testFile);
        cb();
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
