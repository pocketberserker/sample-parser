"use strict";
var assert = require('power-assert');
var Helper = require('../build/parser/Helper');
var IndentParser = require('../build/parser/IndentParser');

describe('ScenarioParser', function() {
  it('parse word', function() {
    var input = 'あa\n';
    var actual = Helper.word.skip(IndentParser.newline.many()).parse(input);
    assert(actual.status);
    assert(actual.value === 'あa');
  });
  describe('array', function() {
    var check = function(input, expected) {
      var actual = Helper.array(Helper.int).parse(input);
      assert(actual.status);
      assert.deepEqual(actual.value, expected);
    };
    it('empty', function() { check('[]', []); });
    it('singleton', function() { check('[1]', [1]); });
    it('some values', function() { check('[1, 2]', [1, 2]); });
  });
});
