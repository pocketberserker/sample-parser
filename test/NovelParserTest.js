"use strict";
var assert = require('power-assert');
var parsimmon = require('parsimmon');
var Helper = require('../build/parser/Helper');
var IndentContext = require('../build/parser/IndentContext');
var NovelParser = require('../build/parser/NovelParser');

describe('NovelParser', function() {
  describe('choices', function() {
    it('single next choice', function() {
      var input = 'choices\n'
        + '  test:next: scenario';
      var parser = NovelParser.choices(IndentContext.initialize);
      var actual = parser.parse(input);
      assert(actual.status);
      assert(actual.value.value.choices[0].choice === 'test');
      assert(actual.value.value.choices[0].scenario === 'scenario');
    });
    it('single ending choice', function() {
      var input = 'choices\n'
        + '  test:ending: scenario';
      var parser = NovelParser.choices(IndentContext.initialize);
      var actual = parser.parse(input);
      assert(actual.status);
      assert(actual.value.value.choices[0].choice === 'test');
      assert(actual.value.value.choices[0].scenario === 'scenario');
    });
    it('background option', function() {
      var input = '# this is comment\n'
        + 'choices\n'
        + '  background: fuga\n'
        + '  test:next: scenario';
      var parser = NovelParser.choices(IndentContext.initialize);
      var actual = parser.parse(input);
      assert(actual.status);
      assert(actual.value.value.background('defaultValue') === 'fuga');
      assert(actual.value.value.choices[0].choice === 'test');
      assert(actual.value.value.choices[0].scenario === 'scenario');
    });
  });
  describe('novel', function() {
    it('background', function() {
      var input = 'title: title\n'
        + 'background: black\n'
        + 'line\n'
        + '  name: hoge\n'
        + '  test\n'
        + 'ending: end';
      var actual = NovelParser.parse(input);
      assert(actual.status);
      assert(actual.value.title === 'title')
      assert(actual.value.background === 'black');
      assert(actual.value.scene[0].name === 'hoge');
      assert.deepEqual(actual.value.scene[0].words, ['test']);
    });
    it('next scene', function() {
      var input = 'title: title\n'
        + 'background: black\n'
        + 'line\n'
        + '  name: hoge\n'
        + '  test\n'
        + 'next: another';
      var actual = NovelParser.parse(input);
      assert(actual.status);
      assert(actual.value.title === 'title')
      assert(actual.value.background === 'black');
      assert(actual.value.scene[0].name === 'hoge');
      assert.deepEqual(actual.value.scene[0].words, ['test']);
      assert(actual.value.nextScenarioName === 'another');
    });
    it('choice', function() {
      var input = 'title: title\n'
        + 'background: black\n'
        + 'choices\n'
        + '  hoge:next: fuga';
      var actual = NovelParser.parse(input);
      assert(actual.status);
      assert(actual.value.title === 'title')
      assert(actual.value.background === 'black');
      assert(actual.value.scene[0].choices[0].choice === 'hoge');
      assert(actual.value.scene[0].choices[0].scenario === 'fuga');
    });
  });
  it('scene', function() {
    var input = 'line\n'
      + '  name: hoge\n'
      + '  test\n'
      + 'monologue\n'
      + '  test2';
    var parser = NovelParser.scene(IndentContext.initialize);
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
    var parser = NovelParser.scene(IndentContext.initialize);
    var actual = parser.parse(input);
    assert(actual.status);
    assert(actual.value.value[0].name === 'hoge');
    assert.deepEqual(actual.value.value[0].words, ['test']);
    assert.deepEqual(actual.value.value[1].words, ['test2']);
  });
});
