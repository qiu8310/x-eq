'use strict';


/*
  ASSERT:
    ok(value, [message])
    equal(actual, expected, [message])
    notEqual(actual, expected, [message])
    deepEqual(actual, expected, [message])
    notDeepEqual(actual, expected, [message])
    strictEqual(actual, expected, [message])
    notStrictEqual(actual, expected, [message])
    throws(block, [error], [message])
    doesNotThrow(block, [error], [message])
    ifError(value)

  SHOULD.JS:
    http://shouldjs.github.io/

  Some test frameworks:
    sinon:  function spy
    nock: mock http request
    supertest: test http server
    rewire: modify the behaviour of a module such that you can easily inject mocks and manipulate private variables

  More on http://www.clock.co.uk/blog/tools-for-unit-testing-and-quality-assurance-in-node-js
*/


import utils from '../src/utils.js';
import assert from 'should';

describe('cssUtils', () => {
  context('splitSelectorText', () => {
    let split;
    before(() => split = utils.splitSelectorText);

    it('split basic selector', () => {
      assert.deepEqual([['.a', '.b']], split('.a .b'));
      assert.deepEqual([['.a'], ['.b']], split('.a, .b'));
      assert.deepEqual([['.a'], ['.b'], ['.c'], ['.d', '.e']], split('.a, .b, .c, .d .e'));
      assert.deepEqual([['.a', '.b'], ['.c', '.b']], split('.a .b, .c .b'));
    });

    it('split attr selector', () => {
      assert.deepEqual([['.a[foo="f,o o"]']], split('.a[foo="f,o o"]'));
      assert.deepEqual([['.a[foo="f,o o"]', '[a=\' x , y \']']], split('.a[foo="f,o o"] [a=\' x , y \']'));
    });

    it('split complicate selector', () => {
      assert.deepEqual([['.a:not( .b)'], ['.c']], split('.a:not( .b), .c'));

      assert.deepEqual([['a:hover'], ['b:after'], ['c:nth-child(3)[foo = "a b"]']],
        split('a:hover, b:after, c:nth-child(3)[foo = "a b"]'));
    });
  });

  context('extractAttributesFromSelectorText', () => {
    let extract;

    before(() => extract = utils.extractAttributesFromSelectorText);

    it('extract basic selector', () => {
      let expect = [{selector: 'i[b=3]', attributes: {a: {glue: '', value: true}}}];
      assert.deepEqual(expect, extract('i[a][b=3]', ['a']));


      expect = [
        {selector: 'i', attributes: {a: {glue: '', value: true}, b: {glue: '=', value: '3'}}}
      ];
      assert.deepEqual(expect, extract('i[a][b=3]', ['a', 'b']));


      expect = [{selector: 'i[a]', attributes: {b: {glue: '^=', value: '3'}}}];
      assert.deepEqual(expect, extract('i[a][b^=3]', ['b']));
    });

    it('extract selector', () => {
      let expect = [{selector: 'x y', attributes: {b: {glue: '=', value: '2'}}}];
      assert.deepEqual(expect, extract('x y[b=2]', ['a', 'b']));

      expect = [{selector: 'x', attributes: {a: {glue: '', value: true}}}];
      assert.deepEqual(expect, extract('x[a] y', ['a', 'b']));

      expect = [
        {selector: 'x', attributes: {a: {glue: '', value: true}}},
        {selector: 'x y', attributes: {b: {glue: '=', value: '2'}}}
      ];
      assert.deepEqual(expect, extract('x[a] y[b=2]', ['a', 'b']));
    });

    it('extract multiple selector', () => {
      let expect = [];
      assert.deepEqual(expect, extract('x[a], y[b]', []));

      expect = [{selector: 'x', attributes: {a: {glue: '', value: true}}}];
      assert.deepEqual(expect, extract('x[a], y[b]', ['a']));

      expect = [{selector: 'y', attributes: {b: {glue: '', value: true}}}];
      assert.deepEqual(expect, extract('x[a], y[b]', ['b']));

      expect = [
        {selector: 'x', attributes: {a: {glue: '', value: true}}},
        {selector: 'y', attributes: {b: {glue: '', value: true}}}
      ];
      assert.deepEqual(expect, extract('x[a], y[b]', ['a', 'b']));
    });
  })
});


