"use strict";
import parsimmon = require("parsimmon");

module Helper {
  export var word: parsimmon.Parser<string> = parsimmon.regex(new RegExp("[^\r^\n]*"));
  export var comment: parsimmon.Parser<string> = parsimmon.string("#").then(word);
  export function lexeme<T>(p: parsimmon.Parser<T>) {
    return p.skip(parsimmon.optWhitespace);
  }
  function keyValue<T>(key: string, p: parsimmon.Parser<T>): parsimmon.Parser<T> {
    return lexeme(parsimmon.string(key))
      .then(lexeme(parsimmon.string(":")))
      .then(p);
  }
  export function keyValueString(key: string): parsimmon.Parser<string> {
    return keyValue(key, word);
  }
  export function array<T>(parser: parsimmon.Parser<T>): parsimmon.Parser<T[]> {
    var sepBy = (p: parsimmon.Parser<T>) => lexeme(parsimmon.string(",")).then(lexeme(p)).many();
    return lexeme(parsimmon.string("["))
      .then(lexeme(parser)
        .chain((x: T) => sepBy(parser).map((xs: T[]) => {
          let xxs = xs.slice();
          xxs.unshift(x);
          return xxs;
        }))
        .or(parsimmon.succeed([])))
      .chain((result: T[]) => parsimmon.string("]").result(result));
  }
  export function keyValueArray<T>(key: string, p: parsimmon.Parser<T>): parsimmon.Parser<T[]> {
    return keyValue(key, array(p));
  }
  export var int: parsimmon.Parser<number> = parsimmon.digits.chain((n: string) => {
    let res = parseInt(n, 10);
    if (isNaN(res)) {
      return parsimmon.fail<number>(n + " is not number.");
    } else {
      return parsimmon.succeed(res);
    }
  });
  // 本当にこの実装でいいの？
  export function opt<T>(parser: parsimmon.Parser<T>): parsimmon.Parser<T> {
    return parser.or(parsimmon.succeed(null));
  }
}
export = Helper;
