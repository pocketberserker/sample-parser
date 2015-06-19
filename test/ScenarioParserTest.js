"use strict";
var assert = require('power-assert');
var parsimmon = require('parsimmon');
var Helper = require('../build/Helper');
var IndentContext = require('../build/IndentContext');
var IndentParser = require('../build/IndentParser');
var ScenarioParser = require('../build/ScenarioParser');

describe('ScenarioParser', function() {
  it('parse word', function() {
    var input = 'あa\n';
    var actual = Helper.word.skip(IndentParser.newline.many()).parse(input);
      assert(actual.status);
      assert(actual.value === 'あa');
  });
  it('parse pre', function() {
    var input = '```\n'
      + 'test\n'
      + 'test2\n'
      + '```';
    var parser = ScenarioParser.pre(IndentContext.initialize);
    var actual = parser.parse(input);
      assert(actual.status);
      assert(actual.value === 'test\ntest2');
  });
  describe('monologue', function() {
    it('one word', function() {
      var input = 'monologue\n'
        + '  test';
      var parser = ScenarioParser.monologue(IndentContext.initialize);
      var actual = parser.parse(input);
      assert(actual.status);
      assert(actual.value.value.words === 'test');
    });
    it('multiple word', function() {
      var input = 'monologue\n'
        + '  test\n'
        + '  test2';
      var parser = ScenarioParser.monologue(IndentContext.initialize);
      var actual = parser.parse(input);
      assert(actual.status);
      assert(actual.value.value.words === 'test\ntest2');
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
      assert(actual.value.value.words === 'test\ntest2');
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
      assert(actual.value.value.words === 'test');
    });
    it('nested', function() {
      var input = '# this is comment\n'
        + 'monologue\n'
        + '  # nested comment\n'
        + '  test';
      var parser = ScenarioParser.monologue(IndentContext.initialize);
      var actual = parser.parse(input);
      assert(actual.status);
      assert(actual.value.value.words === 'test');
    });
  });
});
