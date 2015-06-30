"use strict";
import parsimmon = require("parsimmon");
import IndentContext = require("./IndentContext");
import IndentResult = require("./IndentResult");
import IndentParser = require("./IndentParser");
import Helper = require("./Helper");
import Character = require("../scenario/Character");
import Position = require("../scenario/Position");
import Monologue = require("../scenario/Monologue");
import Line = require("../scenario/Line");
import Scene = require("../scenario/Scene");

module ScenarioParser {

  export function words(context: IndentContext): parsimmon.Parser<string[]> {
    return Helper.word.chain((first: string) =>
      IndentParser.newline.then(IndentParser.indent
        .chain((i: number) => {
          if (i === context.currentLevel) {
            return parsimmon.succeed(undefined);
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
          return parsimmon.succeed(undefined);
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

  export function comment(context: IndentContext) {
    return (parsimmon.optWhitespace.then(Helper.comment).then(IndentParser.newline)).many();
  }

  export function block<T>(
    context: IndentContext,
    label: string, body: (ctx: IndentContext) => parsimmon.Parser<IndentResult<T>>)
    : parsimmon.Parser<IndentResult<T>> {
    return comment(context)
      .then(IndentParser.sameLevel(context))
      .then(parsimmon.string(label))
      .then(IndentParser.endOfLine(context).chain((eolCtx: IndentContext) => {
        var currentLevel = eolCtx.currentLevel;
        return IndentParser.openParen(currentLevel, eolCtx).chain((openCtx: IndentContext) =>
          comment(openCtx).then(body(openCtx)).chain((ch: IndentResult<T>) =>
            IndentParser.endOfLine(ch.context).chain((closeEolCtx: IndentContext) =>
              IndentParser.closeParen(currentLevel, closeEolCtx).map((closeCtx: IndentContext) =>
                new IndentResult(ch.value, closeCtx)))));
      }));
  }

  function newLineWith<T>(context: IndentContext, p: parsimmon.Parser<T>) {
    return IndentParser.newline.then(ScenarioParser.comment(context)).then(
      IndentParser.indent.chain((i: number) => {
        if (i === context.currentLevel) {
          return parsimmon.succeed(undefined);
        } else {
          return parsimmon.fail("indent don't equal");
        }
      })
      .then(p));
  }

  function image(context: IndentContext, p: Position): parsimmon.Parser<Character> {
    return Helper.keyValueString("image").chain((image: string) =>
        newLineWith(context, Helper.keyValueArray("frames", Helper.int)).chain((frames: number[]) =>
          newLineWith(context, Helper.keyValueInt("width")).chain((w: number) =>
            newLineWith(context, Helper.keyValueInt("height")).map((h: number) =>
              new Character(image, frames, p, w, h)))));
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

  function character(position: string, context: IndentContext): parsimmon.Parser<IndentResult<Character>> {
    return ScenarioParser.block(
      context,
      position,
      (ctx: IndentContext) => image(ctx, stringToPos(position)).map((c: Character) => new IndentResult(c, ctx)));
  }

  // 手抜きのため順序固定
  // TODO: 重複を許さず3回まで出現を許容する
  export function characters(context: IndentContext): parsimmon.Parser<IndentResult<Character[]>> {
    var empty: IndentResult<Character[]> = new IndentResult([], context);
    return parsimmon.alt(character("left", context), character("center", context), character("right", context))
      .chain((res: IndentResult<Character>) =>
        parsimmon.lazy(() => characters(res.context)).map((result: IndentResult<Character[]>) => {
          let xs = result.value.slice();
          xs.unshift(res.value);
          return new IndentResult(xs, result.context);
        }))
      .or(parsimmon.succeed(empty));
  }

  function monologueBody(context: IndentContext): parsimmon.Parser<IndentResult<Scene>> {
    return ScenarioParser.backgroundOption(context).chain((b: IndentResult<string>) =>
      ScenarioParser.characters(b.context).chain((cs: IndentResult<Character[]>) =>
        IndentParser.sameLevel(cs.context)
          .then(ScenarioParser.text(cs.context).map((ws: string[]) =>
            new IndentResult(new Monologue(ws, cs.value, b.value), cs.context))
      )));
  }

  export function monologue(context: IndentContext): parsimmon.Parser<IndentResult<Scene>> {
    return ScenarioParser.block(context, "monologue", monologueBody);
  }

  var name: parsimmon.Parser<string> = Helper.keyValueString("name");

  function lineBody(context: IndentContext): parsimmon.Parser<IndentResult<Scene>> {
    return ScenarioParser.backgroundOption(context).chain((b: IndentResult<string>) =>
      ScenarioParser.characters(b.context).chain((cs: IndentResult<Character[]>) =>
        name.chain((n: string) =>
          IndentParser.endOfLine(cs.context).chain((eolCtx: IndentContext) =>
            IndentParser.sameLevel(eolCtx)
              .then(ScenarioParser.text(eolCtx).map((ws: string[]) =>
                new IndentResult(new Line(n, ws, cs.value, b.value), eolCtx))
            )))));
  }

  export function line(context: IndentContext): parsimmon.Parser<IndentResult<Scene>> {
    return ScenarioParser.block(context, "line", lineBody);
  }

  function scenarioTitle(context: IndentContext) {
    return comment(context).then(IndentParser.sameLevel(context)).then(Helper.keyValueString("title"));
  }

  export function backgroundOption(context: IndentContext): parsimmon.Parser<IndentResult<string>> {
    return background(context).chain((b: string) =>
      IndentParser.endOfLine(context).map((ctx: IndentContext) => new IndentResult(b, ctx)))
      .or(parsimmon.succeed(new IndentResult(undefined, context)));
  }

  function background(context: IndentContext) {
    return comment(context)
      .then(IndentParser.sameLevel(context)).then(Helper.keyValueString("background"));
  }

  export function scenarioInformation(context: IndentContext): parsimmon.Parser<[string, string]> {
    return scenarioTitle(context).chain((name: string) =>
      IndentParser.endOfLine(context).chain((eolCtx: IndentContext) =>
        background(eolCtx).map<[string, string]>((b: string) => [name, b])));
  }
}
export = ScenarioParser;
