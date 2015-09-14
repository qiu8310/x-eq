# x-eq
[![NPM version](https://badge.fury.io/js/x-eq.svg)](https://npmjs.org/package/x-eq)
[![GitHub version][git-tag-image]][project-url]
<!--
[![Build Status][travis-image]][travis-url]
[![Dependency Status][daviddm-url]][daviddm-image]
[![Code Climate][climate-image]][climate-url]
[![Coverage Status][coveralls-image]][coveralls-url]
-->

x Element Query.

## Install


### Node

```bash
npm install --save x-eq
```


### Browser CDN

* 未压缩版：[http://7rylsh.com1.z0.glb.clouddn.com/x-eq.0.0.1.js](http://7rylsh.com1.z0.glb.clouddn.com/x-eq.0.0.1.js)
* 压缩版：[http://7rylsh.com1.z0.glb.clouddn.com/x-eq.0.0.1.min.js](http://7rylsh.com1.z0.glb.clouddn.com/x-eq.0.0.1.min.js)


## Usage

新添加了四个 element query: `max-width`, `max-height`, `min-width`, `min-height`

```css
div[max-width~=800px] {
  /* ... */
}

div[max-width~=600px] {
  /* ... */
}
```

## Example

* [Basic](./examples/basic.html)
* [Custom](./examples/custom.html)


## Notice
* 因为需要用到属性选择器，所以最低支持到 IE7；另外 IE7 需要引入 jQuery 1.x.x，而且 IE7 中只能支持 px 单位，其它单位不支持
* **跨域的 stylesheet** 不会处理，带 **`data-xeq-bypass` 属性的 stylesheet**  也不会处理
* 如果不想要脚本自动运行（通常 install/uninstall 之前需要禁止脚本自动运行），需要要引用此脚本之前设置 `window.noAutoRunXEQ = true;`


## API

### install(key, fn)

安装一个 key, fn 的参数是 `(element, attribute)`；

attribute 是一个 Object，包含下面几个属性

* glue: 可以是 `''`、`'='`, `'*='`, `'^='`, `'$='`, `'~='`
* value: 当只有属性名时，此值是 `true`，否则是指定的字符串
* numberValue: 如果 value 是个单位值，此值会将 value 转化成 px 单位，并只返回数字部分

当 fn 返回 `true`，表示需要添加此 attribute；否则删除此 attribute

### uninstall(key)

删除安装了的 key


### refresh()

当浏览器 resize 事件后，自动会执行 refresh；如果程序中有改变 DOM 大小，需要手动运行 refresh

### run()

如果禁用了自动运行，或者有新的 key install，或有旧的 key uninstall，都需要重新 run



## Reference
* [media-queries-are-not-the-answer-element-query-polyfill](http://www.smashingmagazine.com/2013/06/media-queries-are-not-the-answer-element-query-polyfill/)
* [beyond-media-queries-time-get-elemental](http://www.sitepoint.com/beyond-media-queries-time-get-elemental/)
* [https://github.com/Snugug/eq.js](https://github.com/Snugug/eq.js)
* [https://github.com/marcj/css-element-queries/](https://github.com/marcj/css-element-queries/)


## History

[CHANGELOG](CHANGELOG.md)


## License

Copyright (c) 2015 Zhonglei Qiu. Licensed under the MIT license.



[project-url]: https://github.com/qiu8310/x-eq
[git-tag-image]: http://img.shields.io/github/tag/qiu8310/x-eq.svg
[climate-url]: https://codeclimate.com/github/qiu8310/x-eq
[climate-image]: https://codeclimate.com/github/qiu8310/x-eq/badges/gpa.svg
[travis-url]: https://travis-ci.org/qiu8310/x-eq
[travis-image]: https://travis-ci.org/qiu8310/x-eq.svg?branch=master
[daviddm-url]: https://david-dm.org/qiu8310/x-eq.svg?theme=shields.io
[daviddm-image]: https://david-dm.org/qiu8310/x-eq
[coveralls-url]: https://coveralls.io/r/qiu8310/x-eq
[coveralls-image]: https://coveralls.io/repos/qiu8310/x-eq/badge.png

