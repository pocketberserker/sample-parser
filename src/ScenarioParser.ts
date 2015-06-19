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
            parsimmon.fail("indent don't equal");
          }
        })
        .then(parsimmon.lazy(() => words(context)))
        .map((ls: string) => first + "\n" + ls))
        .or(parsimmon.succeed(first))
    );
  }

  export function pre(context: IndentContext): parsimmon.Parser<string> {
    var symbol = parsimmon.string("```");
    return symbol.then(IndentParser.newline)
      .then(parsimmon.regex(new RegExp("(^(```))*")))
      .chain((text: string) =>
        IndentParser.newline
          .then(IndentParser.indent.chain((i: number) => {
            // TODO: i === context.levels.sum
            if (i === context.currentLevel) {
              return parsimmon.succeed(null);
            } else {
              return parsimmon.fail("indent don't equal close pre");
            }
          }))
          .then(symbol).result(text));
  }

  export function text(context: IndentContext): parsimmon.Parser<string> {
    return words(context).or(pre(context));
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
