"use strict";
import parsimmon = require("parsimmon");

module Helper {
  export var word: parsimmon.Parser<string> = parsimmon.regex(new RegExp("[^\r^\n]*"));
  export var comment: parsimmon.Parser<string> = parsimmon.string("#").then(word);
}
export = Helper;
