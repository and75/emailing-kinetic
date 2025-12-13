const { src, dest, watch, series } = require('gulp');
const fileInclude = require('gulp-file-include');

const paths = {
  template: 'src/template.html',
  components: 'src/components/**/*.html',
  output: 'src',
};

function html() {
  return src(paths.template)
    .pipe(
      fileInclude({
        basepath: 'src/components',
        prefix: '@@',
        indent: true,
      })
    )
    .pipe(dest(paths.output));
}

function watcher() {
  watch([paths.template, paths.components], html);
}

exports.html = html;
exports.watch = series(html, watcher);
exports.default = html;
