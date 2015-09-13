/*
 * x-eq
 * https://github.com/qiu8310/x-eq
 *
 * Copyright (c) 2015 Zhonglei Qiu
 * Licensed under the MIT license.
 */
/* global jQuery */

'use strict';

import utils from './utils.js';

let installs = {}, lastRunKeys = [], inited, query, extractedData = [];

if (document.querySelectorAll) query = (selector) => document.querySelectorAll(selector);
if (!query && 'undefined' !== typeof jQuery) query = jQuery;
if (!query) throw 'No document.querySelectorAll or jQuery found.';


function setupElement(element, attributes) {
  let key;
  for (key in attributes) {
    if (attributes.hasOwnProperty(key)) {
      let attr = attributes[key];
      if (attr.value !== true) {
        attr.numberValue = utils.convertToPx(element, attr.value);
      }

      if (installs[key](element, attr)) {
        utils.addAttribute(element, key, attr.value);
      } else {
        utils.removeAttribute(element, key, attr.value);
      }
    }
  }
}

function processSelector(selectorText) {
  extractedData.push(...utils.extractAttributesFromSelectorText(selectorText, Object.keys(installs)));
}

function processStyleSheet(styleSheet) {

  let rules = styleSheet.cssRules || styleSheet.rules;

  if (rules && rules.length > 0) {

    let ownerNode = styleSheet.ownerNode || styleSheet.owningElement;
    if (ownerNode.getAttribute('data-xeq-bypass') === null) {

      let i, j, rule, mediaRules;

      for (i = 0; i < rules.length; i++) {
        rule = rules[i];

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
    let currents = Object.keys(installs), needClean = false;
    for (let k = 0; k < lastRunKeys.length; k++) {
      if (currents.indexOf(lastRunKeys[i]) < 0) {
        needClean = true;
        break;
      }
    }

    if (!needClean) return false;

    let elements = query('[' + lastRunKeys.join('], [') + ']');
    for (let i = 0; i < elements.length; i++) {
      for (let j = 0; j < lastRunKeys.length; j++) {
        elements[i].removeAttribute(lastRunKeys[j]);
      }
    }
  }
}

function run() {
  clean(); // 清除上次设置的所有属性，因为用户可能删除或安装了新的 key
  extractedData.length = 0;

  for (let i = 0; i < document.styleSheets.length; i++) {
    processStyleSheet(document.styleSheets[i]);
  }

  lastRunKeys = Object.keys(installs);
  refresh();
}

function refresh() {
  for (let i = 0; i < extractedData.length; i++) {
    let {selector, attributes} = extractedData[i];
    let elements = query(selector);
    for (let j = 0; j < elements.length; j++) {
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


function _normalizeKey (key) { return key.replace(/[^\w\-]/g, '_'); }

/**
 * @param {String} key
 * @param {Function} fn
 */
function install(key, fn) { installs[_normalizeKey(key)] = fn; }

/**
 * @param {String} key
 */
function uninstall(key) { delete installs[_normalizeKey(key)]; }


install('min-width', (element, attribute) => element.offsetWidth >= attribute.numberValue);
install('max-width', (element, attribute) => element.offsetWidth <= attribute.numberValue);
install('min-height', (element, attribute) => element.offsetHeight >= attribute.numberValue);
install('max-height', (element, attribute) => element.offsetHeight <= attribute.numberValue);


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


export default {install, uninstall, refresh, run};

