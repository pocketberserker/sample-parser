"use strict";
var assert = require('power-assert');
var parsimmon = require('parsimmon');
var Helper = require('../build/parser/Helper');
var IndentContext = require('../build/parser/IndentContext');
var ScenarioParser = require('../build/parser/ScenarioParser');

describe('ScenarioParser', function() {
  describe('character', function() {
    var check = function(label, pos) {
      var input = label + '\n'
        + '  image: hoge\n'
        + '  frames: [0]';
      var parser = ScenarioParser.characters(IndentContext.initialize);
      var actual = parser.parse(input);
      assert(actual.status);
      assert(actual.value.value[0].image === 'hoge');
      assert(actual.value.value[0].position === pos);
      assert.deepEqual(actual.value.value[0].frames, [0]);
    };
    it('left', function() { check('left', 0); });
    it('center', function() { check('center', 1); });
    it('right', function() { check('right', 2); });
    it('all', function() {
      var input = 'left\n'
        + '  image: hoge\n'
        + '  frames: [0]\n'
        + 'center\n'
        + '  image: duke\n'
        + '  frames: [0, 1]\n'
        + 'right\n'
        + '  image: scala\n'
        + '  frames: [1,2]';
      var parser = ScenarioParser.characters(IndentContext.initialize);
      var actual = parser.parse(input);

      assert(actual.status);

      assert(actual.value.value[0].image === 'hoge');
      assert(actual.value.value[0].position === 0);
      assert.deepEqual(actual.value.value[0].frames, [0]);

      assert(actual.value.value[1].image === 'duke');
      assert(actual.value.value[1].position === 1);
      assert.deepEqual(actual.value.value[1].frames, [0, 1]);

      assert(actual.value.value[2].image === 'scala');
      assert(actual.value.value[2].position === 2);
      assert.deepEqual(actual.value.value[2].frames, [1, 2]);
    });
  });
  describe('monologue', function() {
    it('one word', function() {
      var input = 'monologue\n'
        + '  test';
      var parser = ScenarioParser.monologue(IndentContext.initialize);
      var actual = parser.parse(input);
      assert(actual.status);
      assert.deepEqual(actual.value.value.words, ['test']);
    });
    it('multiple word', function() {
      var input = 'monologue\n'
        + '  test\n'
        + '  test2';
      var parser = ScenarioParser.monologue(IndentContext.initialize);
      var actual = parser.parse(input);
      assert(actual.status);
      assert.deepEqual(actual.value.value.words, ['test', 'test2']);
    });
    it('pre', function() {
      var input = 'monologue\n'
        + '   ```\n'
        + 'test\n'
        + 'test2\n'
        + '   ```';
      var parser = ScenarioParser.monologue(IndentContext.initialize);
      var actual = parser.parse(input);
      assert(actual.status);
      assert.deepEqual(actual.value.value.words, ['test', 'test2']);
    });
    it('with character', function() {
      var input = 'monologue\n'
        + '  left\n'
        + '    image: hoge\n'
        + '    frames: [0]\n'
        + '  test';
      var parser = ScenarioParser.monologue(IndentContext.initialize);
      var actual = parser.parse(input);

      assert(actual.status);
      assert.deepEqual(actual.value.value.words, ['test']);

      assert(actual.value.value.characters[0].image === 'hoge');
      assert(actual.value.value.characters[0].position === 0);
      assert.deepEqual(actual.value.value.characters[0].frames, [0]);
    });
    it('background option', function() {
      var input = '# this is comment\n'
        + 'monologue\n'
        + '  background: fuga\n'
        + '  test';
      var parser = ScenarioParser.monologue(IndentContext.initialize);
      var actual = parser.parse(input);
      assert(actual.status);
      assert(actual.value.value.background("defaultValue") === 'fuga');
      assert.deepEqual(actual.value.value.words, ['test']);
    });
  });
  describe('comment', function() {
    it('single', function() {
      var input = '# this is comment\n'
        + 'monologue\n'
        + '  test';
      var parser = ScenarioParser.monologue(IndentContext.initialize);
      var actual = parser.parse(input);
      assert(actual.status);
      assert.deepEqual(actual.value.value.words, ['test']);
    });
    it('nested', function() {
      var input = '# this is comment\n'
        + 'monologue\n'
        + '  # nested comment\n'
        + '  test';
      var parser = ScenarioParser.monologue(IndentContext.initialize);
      var actual = parser.parse(input);
      assert(actual.status);
      assert.deepEqual(actual.value.value.words, ['test']);
    });
  });
  describe('line', function() {
    it('one word', function() {
      var input = 'line\n'
        + '  name: hoge\n'
        + '  test';
      var parser = ScenarioParser.line(IndentContext.initialize);
      var actual = parser.parse(input);
      assert(actual.status);
      assert(actual.value.value.name === 'hoge');
      assert.deepEqual(actual.value.value.words, ['test']);
    });
    it('background option', function() {
      var input = '# this is comment\n'
        + 'line\n'
        + '  background: fuga\n'
        + '  name: hoge\n'
        + '  test';
      var parser = ScenarioParser.line(IndentContext.initialize);
      var actual = parser.parse(input);
      assert(actual.status);
      assert(actual.value.value.background("defaultValue") === 'fuga');
      assert(actual.value.value.name === 'hoge');
      assert.deepEqual(actual.value.value.words, ['test']);
    });
  });
  describe('choices', function() {
    it('single choice', function() {
      var input = 'choices\n'
        + '  test: scenario';
      var parser = ScenarioParser.choices(IndentContext.initialize);
      var actual = parser.parse(input);
      assert(actual.status);
      assert(actual.value.value.choices[0].choice === 'test');
      assert(actual.value.value.choices[0].scenario === 'scenario');
    });
    it('background option', function() {
      var input = '# this is comment\n'
        + 'choices\n'
        + '  background: fuga\n'
        + '  test: scenario';
      var parser = ScenarioParser.choices(IndentContext.initialize);
      var actual = parser.parse(input);
      assert(actual.status);
      assert(actual.value.value.background("defaultValue") === 'fuga');
      assert(actual.value.value.choices[0].choice === 'test');
      assert(actual.value.value.choices[0].scenario === 'scenario');
    });
  });
  describe('novel', function() {
    it('background', function() {
      var input = 'background: black\n'
        + 'line\n'
        + '  name: hoge\n'
        + '  test\n'
        + 'ending: end';
      var actual = ScenarioParser.parse(input);
      assert(actual.status);
      assert(actual.value.value.background === 'black');
      assert(actual.value.value.scene[0].name === 'hoge');
      assert.deepEqual(actual.value.value.scene[0].words, ['test']);
    });
    it('next scene', function() {
      var input = 'background: black\n'
        + 'line\n'
        + '  name: hoge\n'
        + '  test\n'
        + 'next: another';
      var actual = ScenarioParser.parse(input);
      assert(actual.status);
      assert(actual.value.value.background === 'black');
      assert(actual.value.value.scene[0].name === 'hoge');
      assert.deepEqual(actual.value.value.scene[0].words, ['test']);
      assert(actual.value.value.nextScenarioName === 'another');
    });
  });
  it('scene', function() {
    var input = 'line\n'
      + '  name: hoge\n'
      + '  test\n'
      + 'monologue\n'
      + '  test2';
    var parser = ScenarioParser.scene(IndentContext.initialize);
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
    var parser = ScenarioParser.scene(IndentContext.initialize);
    var actual = parser.parse(input);
    assert(actual.status);
    assert(actual.value.value[0].name === 'hoge');
    assert.deepEqual(actual.value.value[0].words, ['test']);
    assert.deepEqual(actual.value.value[1].words, ['test2']);
  });
});
