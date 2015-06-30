"use strict";
import parsimmon = require("parsimmon");
import Helper = require("./Helper");
import IndentContext = require("./IndentContext");
import IndentParser = require("./IndentParser");
import IndentResult = require("./IndentResult");
import Novel = require("../scenario/Novel");
import Character = require("../scenario/Character");
import Scene = require("../scenario/Scene");
import Choice = require("../scenario/Choice");
import Choices = require("../scenario/Choices");
import EndingParser = require("./EndingParser");
import ScenarioResult = require("./ScenarioResult");
import ScenarioParser = require("./ScenarioParser");

module NovelParser {

  type LoadScene = (read: (name: string) => string) => ScenarioResult;

  function loadSceneFrom(name: string, f: (input: string) => ScenarioResult) {
    return (read: (name: string) => string) => f(read(name));
  }

  function choice(context: IndentContext): parsimmon.Parser<Choice[]> {
    let w = parsimmon.regex(new RegExp("[^:^\r^\n]*"));
    let next = (c: string) => Helper.keyValueString("next").map((s: string) =>
      new Choice(c.trim(), s, loadSceneFrom(s, parse)))
      .or(Helper.keyValueString("ending").map((s: string) =>
        new Choice(c.trim(), s, loadSceneFrom(s, EndingParser.parse))));
    return IndentParser.sameLevel(context)
      .then(w.chain((c: string) => Helper.lexeme(parsimmon.string(":")).then(next(c))))
      .chain((ch: Choice) =>
        parsimmon.lazy(() => IndentParser.endOfLine(context).chain((eolCtx: IndentContext) => choice(eolCtx)))
          .map((res: Choice[]) => {
            let xs = res.slice();
            xs.unshift(ch);
            return xs;
          }).or(parsimmon.succeed([ch]))
        );
  }

  function choicesBody(context: IndentContext): parsimmon.Parser<IndentResult<Scene>> {
    return ScenarioParser.backgroundOption(context).chain((b: IndentResult<string>) =>
      ScenarioParser.characters(b.context).chain((cs: IndentResult<Character[]>) =>
        choice(cs.context).map((ch: Choice[]) => new IndentResult(new Choices(b.value, cs.value, ch), cs.context))));
  }

  export function choices(context: IndentContext): parsimmon.Parser<IndentResult<Scene>> {
    return ScenarioParser.block(context, "choices", choicesBody);
  }

  export function scene(context: IndentContext): parsimmon.Parser<IndentResult<Scene[]>> {
    let empty: IndentResult<Scene[]> = new IndentResult([], context);
    return parsimmon.alt(ScenarioParser.monologue(context), ScenarioParser.line(context), choices(context))
      .chain((result: IndentResult<Scene>) =>
        parsimmon.lazy(() => scene(result.context)).map((res: IndentResult<Scene[]>) => {
          let es = res.value.slice();
          es.unshift(result.value);
          return new IndentResult(es, res.context);
        }))
      .or(parsimmon.succeed(empty));
  }

  function nextScene(context: IndentContext): parsimmon.Parser<[string, LoadScene]> {
    return ScenarioParser.comment(context)
      .then(IndentParser.sameLevel(context))
      .then(Helper.keyValueString("next")
        .map<[string, LoadScene]>((name: string) => [name, loadSceneFrom(name, parse)]))
      .or(Helper.keyValueString("ending").map((name: string) => [name, loadSceneFrom(name, EndingParser.parse)]));
  }

  export function novel(context: IndentContext): parsimmon.Parser<IndentResult<Novel>> {
    return ScenarioParser.scenarioInformation(context).chain((info: [string, string]) =>
      IndentParser.endOfLine(context).chain((eolCtx: IndentContext) =>
        scene(eolCtx).chain((result: IndentResult<Scene[]>) => {
          if (result.value[result.value.length - 1] instanceof Choices) {
            return parsimmon.succeed(new IndentResult(new Novel(info[0], info[1], result.value, undefined, undefined), result.context));
          }
          return nextScene(result.context).map((nf: [string, LoadScene]) =>
            new IndentResult(new Novel(info[0], info[1], result.value, nf[0], nf[1]), result.context));
        })));
  }

  export function parse(input: string) {
    let context = IndentContext.initialize;
    return new ScenarioResult(novel(context).parse(input.trim()));
  }
}
export = NovelParser;
