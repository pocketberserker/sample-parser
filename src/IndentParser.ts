"use strict";
import parsimmon = require("parsimmon");
import IndentContext = require("./IndentContext");

class IndentParser {
  static get indent(): parsimmon.Parser<number> {
    return parsimmon.optWhitespace.map((w: string) => w.length);
  }

  sameLevel(context: IndentContext): parsimmon.Parser<void> {
    return context.currentLevel === context.newLevel ? parsimmon.succeed(null) : parsimmon.fail("indent don't same level");
  }

  static get newline(): parsimmon.Parser<string> {
    return parsimmon.string("\r\n").or(parsimmon.string("\n"));
  }

  endOfLine(context: IndentContext) {
    return parsimmon.eof.map((_: void) => context.updateNewLevel(0))
      .or(IndentParser.newline.then((_: string) =>
        IndentParser.indent.map((i: number) => context.updateNewLevel(i))));
  }

  openParen(level: number, context: IndentContext): parsimmon.Parser<IndentContext> {
    var body =
      (success: (index: number, value: IndentContext) => parsimmon.Result<IndentContext>,
        failure: (index: number, expexted: string) => parsimmon.Result<IndentContext>) => {
        return (stream: string, i: number) => {
          if (level < context.newLevel) return success(i, context.unshiftLevel(level).updateCurrentLevel(context.newLevel));
          return failure(i, "open paren error");
        };
      };
    return parsimmon.custom(body);
  }

  closeParen(level: number, context: IndentContext): parsimmon.Parser<IndentContext> {
    var body =
      (success: (index: number, value: IndentContext) => parsimmon.Result<IndentContext>,
        failure: (index: number, expexted: string) => parsimmon.Result<IndentContext>) => {
        return (stream: string, i: number) => {
          if (context.newLevel <= level) {
            let levels = context.levels.slice();
            let l = levels.shift();
            return success(i, context.updateLevels(levels).updateCurrentLevel(l));
          }
          return failure(i, "open paren error");
        };
      };
    return parsimmon.custom(body);
  }
}
export = IndentParser;
