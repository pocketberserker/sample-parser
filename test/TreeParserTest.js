"use strict";
var assert = require('power-assert');
var IndentContext = require('../build/parser/IndentContext');
var TreeParser = require('../build/parser/TreeParser');

describe('TreeParser', function() {
  var parser = TreeParser.element(IndentContext.initialize);
  it('should parse single node', function() {
    var input = 'node';
    var actual = parser.parse(input);
    assert(actual.status);
    assert(actual.value.value.name === 'node');
  });
  it('should parse single nested node', function() {
    var input = 'parent\n'
      + '  child';
    var actual = parser.parse(input);
    assert(actual.status);
    assert(actual.value.value.name === 'parent');
    assert(actual.value.value.children[0].name === 'child');
  });
  it('should parse multiple nested node', function() {
    var input = 'parent\n'
      + '  child1\n'
      + '  child2\n'
      + '    grandchild1\n'
      + '  child3';
    var actual = parser.parse(input);
    assert(actual.status);
    assert(actual.value.value.name === 'parent');
    assert(actual.value.value.children[0].name === 'child1');
    assert(actual.value.value.children[1].name === 'child2');
    assert(actual.value.value.children[1].children[0].name === 'grandchild1');
    assert(actual.value.value.children[2].name === 'child3');
  });
});
