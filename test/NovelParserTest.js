"use strict";
var assert = require('power-assert');
var parsimmon = require('parsimmon');
var Helper = require('../build/parser/Helper');
var IndentContext = require('../build/parser/IndentContext');
var NovelParser = require('../build/parser/NovelParser');

describe('NovelParser', function() {
  describe('character', function() {
    var check = function(label, pos) {
      var input = label + '\n'
        + '  image: hoge\n'
        + '  frames: [0]\n'
        + '  width: 1\n'
        + '  height: 2';
      var parser = NovelParser.characters(IndentContext.initialize);
      var actual = parser.parse(input);
      assert(actual.status);
      assert(actual.value.value[0].image === 'hoge');
      assert(actual.value.value[0].position === pos);
      assert.deepEqual(actual.value.value[0].frames, [0]);
      assert(actual.value.value[0].width === 1);
      assert(actual.value.value[0].height === 2);
    };
    it('left', function() { check('left', 0); });
    it('center', function() { check('center', 1); });
    it('right', function() { check('right', 2); });
    it('all', function() {
      var input = 'left\n'
        + '  image: hoge\n'
        + '  frames: [0]\n'
        + '  width: 1\n'
        + '  height: 2\n'
        + 'center\n'
        + '  image: duke\n'
        + '  frames: [0, 1]\n'
        + '  width: 3\n'
        + '  height: 4\n'
        + 'right\n'
        + '  image: scala\n'
        + '  frames: [1,2]\n'
        + '  width: 5\n'
        + '  height: 6';
      var parser = NovelParser.characters(IndentContext.initialize);
      var actual = parser.parse(input);

      assert(actual.status);

      assert(actual.value.value[0].image === 'hoge');
      assert(actual.value.value[0].position === 0);
      assert.deepEqual(actual.value.value[0].frames, [0]);
      assert(actual.value.value[0].width === 1);
      assert(actual.value.value[0].height === 2);

      assert(actual.value.value[1].image === 'duke');
      assert(actual.value.value[1].position === 1);
      assert.deepEqual(actual.value.value[1].frames, [0, 1]);
      assert(actual.value.value[1].width === 3);
      assert(actual.value.value[1].height === 4);

      assert(actual.value.value[2].image === 'scala');
      assert(actual.value.value[2].position === 2);
      assert.deepEqual(actual.value.value[2].frames, [1, 2]);
      assert(actual.value.value[2].width === 5);
      assert(actual.value.value[2].height === 6);
    });
  });
  describe('monologue', function() {
    it('one word', function() {
      var input = 'monologue\n'
        + '  test';
      var parser = NovelParser.monologue(IndentContext.initialize);
      var actual = parser.parse(input);
      assert(actual.status);
      assert.deepEqual(actual.value.value.words, ['test']);
    });
    it('multiple word', function() {
      var input = 'monologue\n'
        + '  test\n'
        + '  test2';
      var parser = NovelParser.monologue(IndentContext.initialize);
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
      var parser = NovelParser.monologue(IndentContext.initialize);
      var actual = parser.parse(input);
      assert(actual.status);
      assert.deepEqual(actual.value.value.words, ['test', 'test2']);
    });
    it('with character', function() {
      var input = 'monologue\n'
        + '  left\n'
        + '    image: hoge\n'
        + '    frames: [0]\n'
        + '    width: 1\n'
        + '    height: 2\n'
        + '  test';
      var parser = NovelParser.monologue(IndentContext.initialize);
      var actual = parser.parse(input);

      assert(actual.status);
      assert.deepEqual(actual.value.value.words, ['test']);

      assert(actual.value.value.characters[0].image === 'hoge');
      assert(actual.value.value.characters[0].position === 0);
      assert.deepEqual(actual.value.value.characters[0].frames, [0]);
      assert(actual.value.value.characters[0].width === 1);
      assert(actual.value.value.characters[0].height === 2);
    });
    it('background option', function() {
      var input = '# this is comment\n'
        + 'monologue\n'
        + '  background: fuga\n'
        + '  test';
      var parser = NovelParser.monologue(IndentContext.initialize);
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
      var parser = NovelParser.monologue(IndentContext.initialize);
      var actual = parser.parse(input);
      assert(actual.status);
      assert.deepEqual(actual.value.value.words, ['test']);
    });
    it('nested', function() {
      var input = '# this is comment\n'
        + 'monologue\n'
        + '  # nested comment\n'
        + '  test';
      var parser = NovelParser.monologue(IndentContext.initialize);
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
      var parser = NovelParser.line(IndentContext.initialize);
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
      var parser = NovelParser.line(IndentContext.initialize);
      var actual = parser.parse(input);
      assert(actual.status);
      assert(actual.value.value.background('defaultValue') === 'fuga');
      assert(actual.value.value.name === 'hoge');
      assert.deepEqual(actual.value.value.words, ['test']);
    });
  });
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
