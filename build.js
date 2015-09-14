var fs = require('fs');
var path = require('path');
var Uglify = require('uglify-js');

var join = path.join.bind(path, __dirname);


// deploy asset
if (process.argv.indexOf('--da') >= 0) {

  var map = require('./dist/map.json');
  var readme = fs.readFileSync(join('README.md')).toString();
  var result = [];

  map.reverse().forEach(function (src) {
    var name = path.basename(src);
    result.push('[' + name + '](' + src + ')');
  });

  readme = readme.replace(/(<!-- REPLACE_START -->)[\s\S]*?(<!-- REPLACE_END -->)/, function (raw, start, end) {
    return start + '\n\n' + result.join('\n\n') + '\n\n' + end;
  });

  fs.writeFileSync(join('README.md'), readme);

// dist
} else {
  var pkg = require('./package.json');
  var content = fs.readFileSync(join('src', 'x-eq.js'));

  fs.writeFileSync(join('dist', 'x-eq.' + pkg.version + '.js'), content);

  fs.writeFileSync(
      join('dist', 'x-eq.' + pkg.version + '.min.js'),
      Uglify.minify(join('src', 'x-eq.js')).code
  );

}
