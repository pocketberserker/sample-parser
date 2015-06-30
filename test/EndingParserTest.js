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
});
