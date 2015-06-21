"use strict";
import parsimmon = require("parsimmon");
import Helper = require("./Helper");
import IndentContext = require("./IndentContext");
import IndentParser = require("./IndentParser");
import Result = require("./Result");
import Scenario = require("../scenario/Scenario");
import Monologue = require("../scenario/Monologue");
import Line = require("../scenario/Line");
import Novel = require("../scenario/Novel");
import Character = require("../scenario/Character");
import Position = require("../scenario/Position");
import Scene = require("../scenario/Scene");
import Choice = require("../scenario/Choice");
import Choices = require("../scenario/Choices");
import EndingParser = require("./EndingParser");

module ScenarioParser {

  export function comment(context: IndentContext) {
    return (parsimmon.optWhitespace.then(Helper.comment).then(IndentParser.newline)).many();
  }

  export function words(context: IndentContext): parsimmon.Parser<string[]> {
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
        .map((ls: string[]) => {
          let xs = ls.slice();
          xs.unshift(first);
          return xs;
        }))
        .or(parsimmon.succeed([first]))
    );
  }

  function sum(xs: number[]) {
    if (xs.length <= 0) {
      return 0;
    } else if (xs.length === 1) {
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

  var preSymbol = parsimmon.string("```");

  function wordsEndSymbol(context: IndentContext, end: boolean, res: string[]): parsimmon.Parser<string[]> {
    let endSymbol = IndentParser.indent
      .chain((i: number) => {
        if (i === context.currentLevel) {
          return parsimmon.succeed(null);
        } else {
          return parsimmon.fail("indent don't equal");
        }
      })
      .then(preSymbol);
    let lp = Helper.word.chain((w: string) => IndentParser.newline.result(w));
    if (end) {
      return parsimmon.succeed(res);
    } else {
      return endSymbol.then(wordsEndSymbol(context, true, res))
        .or(lp.chain((s: string) => {
          let xs = res.slice();
          xs.push(s);
          return parsimmon.lazy(() => wordsEndSymbol(context, false, xs));
        }));
    }
  }

  export function pre(context: IndentContext): parsimmon.Parser<string[]> {
    return preSymbol.then(IndentParser.newline)
      .then(wordsEndSymbol(context, false, [])).map((ws: string[]) =>
        ws.filter((w: string) => w !== stringOfLength(" ", sum(context.levels)) + "```")
        );
  }

  export function text(context: IndentContext): parsimmon.Parser<string[]> {
    return comment(context).then(pre(context).or(words(context)));
  }

  function image(context: IndentContext, p: Position): parsimmon.Parser<Character> {
    return Helper.keyValueString("image").chain((image: string) =>
      IndentParser.newline.then(comment(context)).then(IndentParser.indent
        .chain((i: number) => {
          if (i === context.currentLevel) {
            return parsimmon.succeed(null);
          } else {
            return parsimmon.fail("indent don't equal");
          }
        })
        .then(Helper.keyValueArray("frames", Helper.int))
        .map((frames: number[]) => new Character(image, frames, p))
      ));
  }

  function stringToPos(p: string) {
    if (p === "left") {
      return Position.Left;
    } else if (p === "center") {
      return Position.Center;
    } else {
      return Position.Right;
    }
  }

  export function block<T>(context: IndentContext, label: string, body: (ctx: IndentContext) => parsimmon.Parser<Result<T>>)
    : parsimmon.Parser<Result<T>> {
    return comment(context)
      .then(IndentParser.sameLevel(context))
      .then(parsimmon.string(label))
      .then(IndentParser.endOfLine(context).chain((eolCtx: IndentContext) => {
        var currentLevel = eolCtx.currentLevel;
        return IndentParser.openParen(currentLevel, eolCtx).chain((openCtx: IndentContext) =>
          comment(openCtx).then(body(openCtx)).chain((ch: Result<T>) =>
            IndentParser.endOfLine(ch.context).chain((closeEolCtx: IndentContext) =>
              IndentParser.closeParen(currentLevel, closeEolCtx).map((closeCtx: IndentContext) =>
                new Result(ch.value, closeCtx)))))
      }));
  }

  function character(position: string, context: IndentContext): parsimmon.Parser<Result<Character>> {
    return block(context, position,
      (ctx: IndentContext) => image(ctx, stringToPos(position)).map((c: Character) => new Result(c, ctx)));
  }

  // 手抜きのため順序固定
  // TODO: 重複を許さず3回まで出現を許容する
  export function characters(context: IndentContext): parsimmon.Parser<Result<Character[]>> {
    var empty: Result<Character[]> = new Result([], context);
    return parsimmon.alt(character("left", context), character("center", context), character("right", context))
      .chain((res: Result<Character>) =>
        parsimmon.lazy(() => characters(res.context)).map((result: Result<Character[]>) => {
          let xs = result.value.slice();
          xs.unshift(res.value);
          return new Result(xs, result.context);
        }))
      .or(parsimmon.succeed(empty));
  }

  function backgroundOption(context: IndentContext): parsimmon.Parser<Result<string>> {
    return background(context).chain((b: string) =>
      IndentParser.endOfLine(context).map((ctx: IndentContext) => new Result(b, ctx)))
      .or(parsimmon.succeed(new Result(null, context)));
  }

  function monologueBody(context: IndentContext): parsimmon.Parser<Result<Scene>> {
    return backgroundOption(context).chain((b: Result<string>) =>
      characters(b.context).chain((cs: Result<Character[]>) =>
        IndentParser.sameLevel(cs.context)
          .then(text(cs.context).map((ws: string[]) => new Result(new Monologue(ws, cs.value, b.value), cs.context))
      )));
  }

  export function monologue(context: IndentContext): parsimmon.Parser<Result<Scene>> {
    return block(context, "monologue", monologueBody);
  }

  var name: parsimmon.Parser<string> = Helper.keyValueString("name");

  function lineBody(context: IndentContext): parsimmon.Parser<Result<Scene>> {
    return backgroundOption(context).chain((b: Result<string>) =>
      characters(b.context).chain((cs: Result<Character[]>) =>
        name.chain((n: string) =>
          IndentParser.endOfLine(cs.context).chain((eolCtx: IndentContext) =>
            IndentParser.sameLevel(eolCtx)
              .then(text(eolCtx).map((ws: string[]) => new Result(new Line(n, ws, cs.value, b.value), eolCtx))
            )))));
  }

  export function line(context: IndentContext): parsimmon.Parser<Result<Scene>> {
    return block(context, "line", lineBody);
  }

  function choice(context: IndentContext): parsimmon.Parser<Choice[]> {
    let w = parsimmon.regex(new RegExp("[^:^\r^\n]*"));
    return IndentParser.sameLevel(context)
      .then(w.chain((c: string) =>
        Helper.lexeme(parsimmon.string(":")).then(Helper.word.map((s: string) => new Choice(c.trim(), s)))))
      .chain((ch: Choice) =>
        parsimmon.lazy(() => IndentParser.endOfLine(context).chain((eolCtx: IndentContext) => choice(eolCtx)))
          .map((res: Choice[]) => {
            let xs = res.slice();
            xs.unshift(ch);
            return xs;
          }).or(parsimmon.succeed([ch]))
        );
  }
  
  function choicesBody(context: IndentContext): parsimmon.Parser<Result<Scene>> { 
    return backgroundOption(context).chain((b: Result<string>) =>
      characters(b.context).chain((cs: Result<Character[]>) =>
        choice(cs.context).map((ch: Choice[]) => new Result(new Choices(b.value, cs.value, ch), cs.context))));
  }

  export function choices(context: IndentContext): parsimmon.Parser<Result<Scene>> {
    return block(context, "choices", choicesBody);
  }

  export function scene(context: IndentContext): parsimmon.Parser<Result<Scene[]>> {
    let empty: Result<Scene[]> = new Result([], context);
    return parsimmon.alt(monologue(context), line(context), choices(context))
      .chain((result: Result<Scene>) =>
        parsimmon.lazy(() => scene(result.context)).map((res: Result<Scene[]>) => {
          let es = res.value.slice();
          es.unshift(result.value);
          return new Result(es, res.context);
        }))
      .or(parsimmon.succeed(empty));
  }

  type LoadScene = (read: (name: string) => string) => Scenario;

  function nextScene(context: IndentContext): parsimmon.Parser<[string, LoadScene]> {
    return comment(context)
      .then(IndentParser.sameLevel(context))
      .then(Helper.keyValueString("next")
        .map<[string, LoadScene]>((name: string) => [name, (read: (name: string) => string) => parse(read(name))]))
      .or(Helper.keyValueString("ending")
        .map((name: string) => [name, (read: (name: string) => string) => EndingParser.parse(read(name))]));
  }

  function background(context: IndentContext) {
    return comment(context).then(IndentParser.sameLevel(context)).then(Helper.keyValueString("background"));
  }

  function scenarioTitle(context: IndentContext) {
    return comment(context).then(IndentParser.sameLevel(context)).then(Helper.keyValueString("title"));
  }

  export function scenarioInfomation(context: IndentContext): parsimmon.Parser<[string, string]> {
    return scenarioTitle(context).chain((name: string) =>
      IndentParser.endOfLine(context).chain((eolCtx: IndentContext) =>
        background(eolCtx).map<[string, string]>((b: string) => [name, b])));
  }

  export function novel(context: IndentContext): parsimmon.Parser<Result<Novel>> {
    return scenarioInfomation(context).chain((info: [string, string]) =>
      IndentParser.endOfLine(context).chain((eolCtx: IndentContext) =>
        scene(eolCtx).chain((result: Result<Scene[]>) =>
          nextScene(result.context).map((nf: [string, LoadScene]) =>
            new Result(new Novel(info[0], info[1], result.value, nf[0], nf[1]), result.context)))));
  }

  export function parse(input: string) {
    let context = IndentContext.initialize;
    return novel(context).parse(input.trim());
  }
}
export = ScenarioParser;
