"use strict";
var assert = require('power-assert');
var parsimmon = require('parsimmon');
var Helper = require('../build/parser/Helper');
var IndentContext = require('../build/parser/IndentContext');
var EndingParser = require('../build/parser/EndingParser');

describe('EndingParser', function() {
  it('minimal', function() {
      var input = 'title: title\n'
      + 'background: black\n'
      + 'line\n'
      + '  name: hoge\n'
      + '  test\n'
      + 'fin: black';
    var actual = EndingParser.parse(input);
    assert(actual.status);
    assert(actual.value.title === 'title')
    assert(actual.value.background === 'black');
    assert(actual.value.scene[0].name === 'hoge');
    assert.deepEqual(actual.value.scene[0].words, ['test']);
  });
  it('scene', function() {
    var input = 'line\n'
      + '  name: hoge\n'
      + '  test\n'
      + 'monologue\n'
      + '  test2';
    var parser = EndingParser.scene(IndentContext.initialize);
    var actual = parser.parse(input);
    assert(actual.status);
    assert(actual.value.value[0].name === 'hoge');
    assert.deepEqual(actual.value.value[0].words, ['test']);
    assert.deepEqual(actual.value.value[1].words, ['test2']);
  });
  it('pre and text', function() {
    var input = 'line\n'
      + '  name: hoge\n'
      + '  ```\n'
      + 'test\n'
      + '  ```\n'
      + 'monologue\n'
      + '  test2';
    var parser = EndingParser.scene(IndentContext.initialize);
    var actual = parser.parse(input);
    assert(actual.status);
    assert(actual.value.value[0].name === 'hoge');
    assert.deepEqual(actual.value.value[0].words, ['test']);
    assert.deepEqual(actual.value.value[1].words, ['test2']);
  });
  describe('monologue', function() {
    it('background option', function() {
      var input = 'monologue\n'
        + '  background: hoge\n'
        + '  test';
      var parser = EndingParser.monologue(IndentContext.initialize);
      var actual = parser.parse(input);
      assert(actual.status);
      assert(actual.value.value.background('defaultValue') === 'hoge');
      assert.deepEqual(actual.value.value.words, ['test']);
    });
  });
  describe('line', function() {
    it('background option', function() {
      var input = 'line\n'
        + '  background: hoge\n'
        + '  name: fuga\n'
        + '  test';
      var parser = EndingParser.line(IndentContext.initialize);
      var actual = parser.parse(input);
      assert(actual.status);
      assert(actual.value.value.background('defaultValue') === 'hoge');
      assert.deepEqual(actual.value.value.name, 'fuga');
      assert.deepEqual(actual.value.value.words, ['test']);
    });
  });
});
