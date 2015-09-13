/*
 * x-eq
 * https://github.com/qiu8310/x-eq
 *
 * Copyright (c) 2015 Zhonglei Qiu
 * Licensed under the MIT license.
 */
/* global jQuery */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _utilsJs = require('./utils.js');

var _utilsJs2 = _interopRequireDefault(_utilsJs);

var installs = {},
    lastRunKeys = [],
    inited = undefined,
    query = undefined,
    extractedData = [];

if (document.querySelectorAll) query = function (selector) {
  return document.querySelectorAll(selector);
};
if (!query && 'undefined' !== typeof jQuery) query = jQuery;
if (!query) throw 'No document.querySelectorAll or jQuery found.';

function setupElement(element, attributes) {
  var key = undefined;
  for (key in attributes) {
    if (attributes.hasOwnProperty(key)) {
      var attr = attributes[key];
      if (attr.value !== true) {
        attr.numberValue = _utilsJs2['default'].convertToPx(element, attr.value);
      }

      if (installs[key](element, attr)) {
        _utilsJs2['default'].addAttribute(element, key, attr.value);
      } else {
        _utilsJs2['default'].removeAttribute(element, key, attr.value);
      }
    }
  }
}

function processSelector(selectorText) {
  extractedData.push.apply(extractedData, _toConsumableArray(_utilsJs2['default'].extractAttributesFromSelectorText(selectorText, Object.keys(installs))));
}

function processStyleSheet(styleSheet) {

  var rules = styleSheet.cssRules || styleSheet.rules;

  if (rules && rules.length > 0) {

    var ownerNode = styleSheet.ownerNode || styleSheet.owningElement;
    if (ownerNode.getAttribute('data-xeq-bypass') === null) {

      var _i = undefined,
          j = undefined,
          rule = undefined,
          mediaRules = undefined;

      for (_i = 0; _i < rules.length; _i++) {
        rule = rules[_i];

        if (rule.type === 1) {
          processSelector(rule.selectorText);
        } else if (rule.type === 4) {
          mediaRules = rule.cssRules || rule.rules;
          for (j = 0; j < mediaRules.length; j++) {
            processSelector(mediaRules[j].selectorText);
          }
        }
      }
    }
  }
}

function init() {
  if (inited) return false;
  inited = true;

  run();
}

function clean() {
  if (lastRunKeys.length > 0) {
    var currents = Object.keys(installs),
        needClean = false;
    for (var k = 0; k < lastRunKeys.length; k++) {
      if (currents.indexOf(lastRunKeys[i]) < 0) {
        needClean = true;
        break;
      }
    }

    if (!needClean) return false;

    var elements = query('[' + lastRunKeys.join('], [') + ']');
    for (var _i2 = 0; _i2 < elements.length; _i2++) {
      for (var j = 0; j < lastRunKeys.length; j++) {
        elements[_i2].removeAttribute(lastRunKeys[j]);
      }
    }
  }
}

function run() {
  clean(); // 清除上次设置的所有属性，因为用户可能删除或安装了新的 key
  extractedData.length = 0;

  for (var _i3 = 0; _i3 < document.styleSheets.length; _i3++) {
    processStyleSheet(document.styleSheets[_i3]);
  }

  lastRunKeys = Object.keys(installs);
  refresh();
}

function refresh() {
  for (var _i4 = 0; _i4 < extractedData.length; _i4++) {
    var _extractedData$_i4 = extractedData[_i4];
    var selector = _extractedData$_i4.selector;
    var attributes = _extractedData$_i4.attributes;

    var elements = query(selector);
    for (var j = 0; j < elements.length; j++) {
      setupElement(elements[j], attributes);
    }
  }

  if (!window.addEventListener && window.attachEvent) {
    // Force a repaint in IE7 and IE8
    var className = document.documentElement.className;
    document.documentElement.className = ' ' + className;
    document.documentElement.className = className;
  }
}

function _normalizeKey(key) {
  return key.replace(/[^\w\-]/g, '_');
}

/**
 * @param {String} key
 * @param {Function} fn
 */
function install(key, fn) {
  installs[_normalizeKey(key)] = fn;
}

/**
 * @param {String} key
 */
function uninstall(key) {
  delete installs[_normalizeKey(key)];
}

install('min-width', function (element, attribute) {
  return element.offsetWidth >= attribute.numberValue;
});
install('max-width', function (element, attribute) {
  return element.offsetWidth <= attribute.numberValue;
});
install('min-height', function (element, attribute) {
  return element.offsetHeight >= attribute.numberValue;
});
install('max-height', function (element, attribute) {
  return element.offsetHeight <= attribute.numberValue;
});

if (window.addEventListener) window.addEventListener('resize', refresh, false);else window.attachEvent('onresize', refresh);

function autoRun() {
  if (window.addEventListener) {
    window.addEventListener('DOMContentLoaded', init, false);
    window.addEventListener('load', init, false);
  } else {
    window.attachEvent('onload', init);
  }
  if (document.readyState === 'complete') init();
}

if (!window.noAutoRunXEQ) autoRun();

exports['default'] = { install: install, uninstall: uninstall, refresh: refresh, run: run };
module.exports = exports['default'];