"use strict";
var assert = require('power-assert');
var IndentContext = require('../build/IndentContext');
var TreeParser = require('../build/TreeParser');

describe('TreeParser', function() {
  it('should parse single node', function() {
    var input = 'node';
    var parser = TreeParser.element(IndentContext.initialize);
    assert(parser.parse(input).status);
  });
  it('should parse single nested node', function() {
    var input = 'parent\n'
      + '  child';
    var parser = TreeParser.element(IndentContext.initialize);
    assert(parser.parse(input).status);
  });
  it('should parse multiple nested node', function() {
    var input = 'parent\n'
      + '  child1\n'
      + '  child2\n'
      + '    grandchild1\n'
      + '  child3';
    var parser = TreeParser.element(IndentContext.initialize);
    assert(parser.parse(input).status);
  });
});
