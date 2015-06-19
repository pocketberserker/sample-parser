"use strict";
import parsimmon = require("parsimmon");
import Helper = require("./Helper");
import IndentContext = require("./IndentContext");
import IndentParser = require("./IndentParser");
import Result = require("./Result");
import Scenario = require("./Scenario");
import Monologue = require("./Monologue");

module ScenarioParser {

  export function words(context: IndentContext): parsimmon.Parser<string> {
    return Helper.word.chain((first: string) =>
      IndentParser.newline.then(IndentParser.indent
        .chain((i: number) => {
          if (i === context.currentLevel) {
            return parsimmon.succeed(null);
          } else {
            return parsimmon.fail("indent don't equal");
          }
        })
        .then(parsimmon.lazy(() => words(context)))
        .map((ls: string) => first + "\n" + ls))
        .or(parsimmon.succeed(first))
    );
  }

  function sum(xs: number[]) {
    if (xs.length <= 0) {
      return 0;
    }
    else if (xs.length == 1) {
      return xs[0];
    }
    return xs.reduce((a: number, b: number) => a + b);
  }

  function stringOfLength(s: string, n: number) {
    if (n <= 0) {
      return "";
    }
    return new Array(n + 1).join(s);
  }

  export function pre(context: IndentContext): parsimmon.Parser<string> {
    var symbol = parsimmon.string("```");
    var endSymbol = IndentParser.indent
      .chain((i: number) => {
        if (i === context.currentLevel) {
          return parsimmon.succeed(null);
        } else {
          return parsimmon.fail("indent don't equal");
        }
      })
      .then(symbol);
    var lp = Helper.word.chain((w: string) => IndentParser.newline.result(w));
    return symbol.then(IndentParser.newline)
      .then(endSymbol.or(lp).many().map((ws: string[]) =>
        ws.filter((w: string) => w !== stringOfLength(" ", sum(context.levels)) + "```")
          .join("\n")));
  }

  export function text(context: IndentContext): parsimmon.Parser<string> {
    return pre(context).or(words(context));
  }

  export function monologue(context: IndentContext): parsimmon.Parser<Result<Scenario>> {
    return (parsimmon.optWhitespace.then(Helper.comment).then(IndentParser.newline)).many()
      .then(IndentParser.sameLevel(context))
      .then(parsimmon.string("monologue"))
      .then(IndentParser.endOfLine(context))
      .chain((eolCtx: IndentContext) => {
        var currentLevel = eolCtx.currentLevel;
        return IndentParser.openParen(currentLevel, eolCtx).chain((openCtx: IndentContext) =>
          text(openCtx).chain((ws: string) =>
            IndentParser.endOfLine(openCtx).chain((closeEolCtx: IndentContext) =>
              IndentParser.closeParen(currentLevel, closeEolCtx)
                .map((closeCtx: IndentContext) => new Result(new Monologue(ws), closeCtx))
            )));
      });
  }

  export function line(context: IndentContext): parsimmon.Parser<Result<Scenario>> {
    // TODO: implement
    return parsimmon.fail<Result<Scenario>>("not implemented");
  }

  export function scenarios(context: IndentContext): parsimmon.Parser<Result<Scenario[]>> {
    let empty: Result<Scenario[]> = new Result([], context);
    return monologue(context)
      .or(line(context))
      .chain((result: Result<Scenario[]>) =>
        ScenarioParser.scenarios(result.context).map((res: Result<Scenario[]>) => {
          let es = res.value.slice();
          es.unshift(result.value);
          return new Result(es, res.context);
        }))
      .or(parsimmon.succeed(empty));
  }

  export function parse(input: string) {
    let context = IndentContext.initialize;
    return scenarios(context).parse(input);
  }
}
export = ScenarioParser;
