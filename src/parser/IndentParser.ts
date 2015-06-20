"use strict";
import parsimmon = require("parsimmon");
import IndentContext = require("./IndentContext");
import Helper = require("./Helper");

module IndentParser {

  export var indent: parsimmon.Parser<number> =
    parsimmon.optWhitespace.map((w: string) => w.length);

  export function sameLevel(context: IndentContext): parsimmon.Parser<void> {
    return context.currentLevel === context.newLevel ? parsimmon.succeed(null) : parsimmon.fail("indent don't same level");
  }

  export var newline: parsimmon.Parser<string> =
    parsimmon.string("\r\n").or(parsimmon.string("\n"));

  export function endOfLine(context: IndentContext): parsimmon.Parser<IndentContext> {
    return parsimmon.eof.map((_: void) => context.updateNewLevel(0))
      .or(newline.then(
        indent.map((i: number) => context.updateNewLevel(i))
          .chain((ctx: IndentContext) =>
            Helper.comment.then(endOfLine(ctx)).or(parsimmon.succeed(ctx))
          )
        ));
  }

  export function openParen(level: number, context: IndentContext): parsimmon.Parser<IndentContext> {
    let body =
      (success: (index: number, value: IndentContext) => parsimmon.Result<IndentContext>,
        failure: (index: number, expexted: string) => parsimmon.Result<IndentContext>) => {
        return (stream: string, i: number) => {
          if (level < context.newLevel) return success(i, context.unshiftLevel(level).updateCurrentLevel(context.newLevel));
          return failure(i, "open paren error");
        };
      };
    return parsimmon.custom(body);
  }

  export function closeParen(level: number, context: IndentContext): parsimmon.Parser<IndentContext> {
    let body =
      (success: (index: number, value: IndentContext) => parsimmon.Result<IndentContext>,
        failure: (index: number, expexted: string) => parsimmon.Result<IndentContext>) => {
        return (stream: string, i: number) => {
          if (context.newLevel <= level) {
            let levels = context.levels.slice();
            let l = levels.shift();
            return success(i, context.updateLevels(levels).updateCurrentLevel(l));
          }
          return failure(i, "close paren error");
        };
      };
    return parsimmon.custom(body);
  }
}
export = IndentParser;
