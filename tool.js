var fs = require('fs');
var path = require('path');
var Uglify = require('uglify-js');

var pkg = require('./package.json');

var join = path.join.bind(path, __dirname);

var content = fs.readFileSync(join('dist', 'x-eq.js'));


fs.writeFileSync(join('dist', 'x-eq.' + pkg.version + '.js'), content);

fs.writeFileSync(
  join('dist', 'x-eq.' + pkg.version + '.min.js'),
  Uglify.minify(join('dist', 'x-eq.js')).code
);
