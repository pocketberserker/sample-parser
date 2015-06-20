"use strict";
var assert = require('power-assert');
var IndentParser = require('../build/parser/IndentParser');

describe('IndentParser', function() {
  describe('newline', function() {
    it('should parse lf', function() {
      assert(IndentParser.newline.parse('\n').status);
    });
  });
});
