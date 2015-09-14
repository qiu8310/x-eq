/* global jQuery */

'use strict';


(function () {
  // === polyfill

  if (!String.prototype.trim) {
    String.prototype.trim = function () {
      return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };
  }

  if (!Object.keys) {
    Object.keys = function (obj) {
      var result = [];
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) result.push(key);
      }
      return result;
    };
  }

  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement, fromIndex) {
      var k;

      var O = Object(this);
      var len = O.length;

      if (len === 0) return -1;

      var n = +fromIndex || 0;

      if (Math.abs(n) === Infinity) n = 0;

      if (n >= len) return -1;

      k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
      while (k < len) {
        if (k in O && O[k] === searchElement) return k;
        k++;
      }
      return -1;
    };
  }



  // === utils

  function _splitSelectorTextReplacer(w) { return new Array(w.length + 1).join('_'); }
  /**
   * 拆分 rule 的 selectorText
   *
   * @example
   *
   *  '.a .b, .a .c' => [['.a', '.b'], ['.a', '.c']]
   *
   * @param {String} selectorText
   * @returns {Array<Array<String>>}
   */
  function splitSelectorText(selectorText) {
    var result = [],
      muteCommaSelectorText = selectorText
        .replace(/(['"]).*?\1/g, _splitSelectorTextReplacer) // 换掉所有引号中的内容
        .replace(/\[.*?\]|\(.*?\)/g, _splitSelectorTextReplacer); // 换掉所有括号和中括号中的内容

    var selectorParts, subSelectorParts, i, j, selector, start = 0, part;
    selectorParts = muteCommaSelectorText.split(',');
    for (i = 0; i < selectorParts.length; i++) {
      selector = [];
      subSelectorParts = selectorParts[i].split(' ');
      for (j = 0; j < subSelectorParts.length; j++) {
        part = selectorText.substr(start, subSelectorParts[j].length).trim();
        if (part) selector.push(part);
        start += subSelectorParts[j].length + 1;
      }
      result.push(selector);
    }

    return result;
  }


  var rAttrNoValue = /\[\s*([\w\-]+)\s*\]/g,
    rAttrQuoted = /\[\s*([\w\-]+)([\*\^\$~]?=)(['"])(.*?)\3\s*\]/g,
    rAttrNoQuoted = /\[\s*([\w\-]+)([\*\^\$~]?=)([^\]]*?)\s*\]/g;

  /**
   *
   * @example
   *
   * @param {Array} splitSelector
   * @param {Array} attributeKeys
   * @returns {Array}
   * @private
   */
  function _extractSelector(splitSelector, attributeKeys) {
    var selector = '', part, replaced, attributes, result = [],
      replacer = function (raw, key, glue, quote, value) {
        if (attributeKeys.indexOf(key) < 0) return raw;

        if (typeof glue === 'number') { // no value
          glue = '';
          value = true;
        } else if (typeof value === 'number') { // no quote
          value = quote.trim();
        } else {
          value = value.trim();
        }

        replaced = true;
        attributes[key] = {glue: glue, value: value};

        return '';
      };

    for (var i = 0; i < splitSelector.length; i++) {
      attributes = {};
      replaced = false;

      part = splitSelector[i]
        .replace(rAttrNoValue, replacer)
        .replace(rAttrQuoted, replacer)
        .replace(rAttrNoQuoted, replacer).trim();

      if (part) {
        selector += part;
        if (replaced) {
          result.push({selector: selector, attributes: attributes});
        }
        selector += ' ';
      }
    }

    return result;
  }

  /**
   *
   *
   * @example
   * ('i[a=1][b=2] [c=3][d=4]', ['b', 'd'])
   * =>
   * [
   *    {selector: 'i[a=1]', attributes: {b: {glue: '=', value: '2'}}},
   *    {selector: 'i[a=1] [c=3]', attributes: {d: {glue: '=', value: '4'}}}
   * ]
   *
   * @param {String} selectorText
   * @param {Array} attributeKeys
   */
  function extractAttributesFromSelectorText(selectorText, attributeKeys) {
    var splitResult = splitSelectorText(selectorText);
    var result = [];
    for (var i = 0; i < splitResult.length; i++) {
      result.push.apply(result, _extractSelector(splitResult[i], attributeKeys));
    }
    return result;
  }

  function getEmSize(element) {
    if (!element) element = document.documentElement;
    if (getComputedStyle) return parseFloat(getComputedStyle(element, 'fontSize')) || 16;
    return 16;
  }

  /**
   * @param {Node} element
   * @param {String|Number} value
   * @returns {Number}
   */
  function convertToPx(element, value) {
    var units = value.replace(/[0-9]*/, '');
    value = parseFloat(value) || 0;
    switch (units) {
      case 'px':
        return value;
      case 'em':
        return value * getEmSize(element);
      case 'rem':
        return value * getEmSize();
      // Viewport units!
      // According to http://quirksmode.org/mobile/tableViewport.html
      // documentElement.clientWidth/Height gets us the most reliable info
      case 'vw':
        return value * document.documentElement.clientWidth / 100;
      case 'vh':
        return value * document.documentElement.clientHeight / 100;
      case 'vmin':
      case 'vmax':
        var vw = document.documentElement.clientWidth / 100;
        var vh = document.documentElement.clientHeight / 100;
        var chooser = Math[units === 'vmin' ? 'min' : 'max'];
        return value * chooser(vw, vh);
      default:
        return value;
      // for now, not supporting physical units (since they are just a set number of px)
      // or ex/ch (getting accurate measurements is hard)
    }
  }

  function _fetchAttribute(element, key) {
    var val = element.getAttribute(key);
    return val ? (' ' + val + ' ').replace(/[\t\r\n]/g, ' ') : ' ';
  }
  function addAttribute(element, key, value) {
    if (!value || element.nodeType !== 1) return false;
    if (value === true) return element.setAttribute(key, '');

    var current = _fetchAttribute(element, key);
    if (current.indexOf(' ' + value + ' ') < 0) {
      element.setAttribute(key, (current + value).trim());
    }
  }
  function removeAttribute(element, key, value) {
    if (!value || element.nodeType !== 1) return false;
    if (value === true) return element.removeAttribute(key);

    var current = _fetchAttribute(element, key),
      tmp = ' ' + value + ' ',
      updated = false;
    while (current.indexOf(tmp) >= 0) {
      current = current.replace(tmp, ' ');
      updated = true;
    }
    if (updated) {
      current = current.trim();
      if (!current) element.removeAttribute(key);
      else element.setAttribute(key, current);
    }
  }




  // === x-eq

  var installs = {}, lastRunKeys = [], inited, query, extractedData = [];

  if (document.querySelectorAll) query = function (selector) { return document.querySelectorAll(selector); };
  if (!query && 'undefined' !== typeof jQuery) query = jQuery;
  if (!query) throw 'No document.querySelectorAll or jQuery found.';


  function setupElement(element, attributes) {
    var key;
    for (key in attributes) {
      if (attributes.hasOwnProperty(key)) {
        var attr = attributes[key];
        if (attr.value !== true) {
          attr.numberValue = convertToPx(element, attr.value);
        }

        if (installs[key](element, attr)) {
          addAttribute(element, key, attr.value);
        } else {
          removeAttribute(element, key, attr.value);
        }
      }
    }
  }

  function processSelector(selectorText) {
    extractedData.push.apply(extractedData, extractAttributesFromSelectorText(selectorText, Object.keys(installs)));
  }

  function processStyleSheet(styleSheet) {

    var rules = styleSheet.cssRules || styleSheet.rules;
    if (rules && rules.length > 0) {

      var ownerNode = styleSheet.ownerNode || styleSheet.owningElement;
      if (ownerNode.getAttribute('data-xeq-bypass') === null) {

        var i, j, rule, mediaRules;

        for (i = 0; i < rules.length; i++) {
          rule = rules[i];
          if (rule.type === 4) {
            mediaRules = rule.cssRules || rule.rules;
            for (j = 0; j < mediaRules.length; j++) {
              processSelector(mediaRules[j].selectorText);
            }
          } else if (rule.selectorText) { // IE 8 下没有 type 这个属性
            processSelector(rule.selectorText);
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
      var currents = Object.keys(installs), needClean = false;
      for (var k = 0; k < lastRunKeys.length; k++) {
        if (currents.indexOf(lastRunKeys[k]) < 0) {
          needClean = true;
          break;
        }
      }

      if (!needClean) return false;

      var elements = query('[' + lastRunKeys.join('], [') + ']');
      for (var i = 0; i < elements.length; i++) {
        for (var j = 0; j < lastRunKeys.length; j++) {
          elements[i].removeAttribute(lastRunKeys[j]);
        }
      }
    }
  }

  function run() {
    clean(); // 清除上次设置的所有属性，因为用户可能删除或安装了新的 key
    extractedData.length = 0;
    for (var i = 0; i < document.styleSheets.length; i++) {
      processStyleSheet(document.styleSheets[i]);
    }

    lastRunKeys = Object.keys(installs);
    refresh();
  }

  function refresh() {
    var elements;
    for (var i = 0; i < extractedData.length; i++) {
      elements = query(extractedData[i].selector);
      for (var j = 0; j < elements.length; j++) {
        setupElement(elements[j], extractedData[i].attributes);
      }
    }

    if (!window.addEventListener && window.attachEvent) {
      // Force a repaint in IE7 and IE8
      var className = document.documentElement.className;
      document.documentElement.className = ' ' + className;
      document.documentElement.className = className;
    }
  }


  function _normalizeKey(key) { return key.replace(/[^\w\-]/g, '_'); }

  /**
   * @param {String} key
   * @param {Function} fn
   */
  function install(key, fn) { installs[_normalizeKey(key)] = fn; }

  /**
   * @param {String} key
   */
  function uninstall(key) { delete installs[_normalizeKey(key)]; }


  install('min-width', function (element, attribute) { return element.offsetWidth >= attribute.numberValue; });
  install('max-width', function (element, attribute) { return element.offsetWidth <= attribute.numberValue; });
  install('min-height', function (element, attribute) { return element.offsetHeight >= attribute.numberValue; });
  install('max-height', function (element, attribute) { return element.offsetHeight <= attribute.numberValue; });


  if (window.addEventListener) window.addEventListener('resize', refresh, false);
  else window.attachEvent('onresize', refresh);

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

  var xEQ = {install: install, uninstall: uninstall, refresh: refresh, run: run};

  window.xEQ = xEQ;
  if ( typeof module === 'object' && typeof module.exports === 'object' ) {
    module.exports = xEQ;
  }
})();





