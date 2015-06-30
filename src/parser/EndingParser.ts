"use strict";
import parsimmon = require("parsimmon");
import Helper = require("./Helper");
import IndentContext = require("./IndentContext");
import IndentParser = require("./IndentParser");
import IndentResult = require("./IndentResult");
import Scene = require("../scenario/Scene");
import Ending = require("../scenario/Ending");
import ScenarioParser = require("./ScenarioParser");
import ScenarioResult = require("./ScenarioResult");

module EndingParser {

  export function scene(context: IndentContext): parsimmon.Parser<IndentResult<Scene[]>> {
    let empty: IndentResult<Scene[]> = new IndentResult([], context);
    return parsimmon.alt(ScenarioParser.monologue(context), ScenarioParser.line(context))
      .chain((result: IndentResult<Scene>) =>
        parsimmon.lazy(() => scene(result.context)).map((res: IndentResult<Scene[]>) => {
          let es = res.value.slice();
          es.unshift(result.value);
          return new IndentResult(es, res.context);
        }))
      .or(parsimmon.succeed(empty));
  }

  function fin(context: IndentContext) {
    return ScenarioParser.comment(context)
      .then(IndentParser.sameLevel(context))
      .then(Helper.keyValueString("fin"));
  }

  export function ending(context: IndentContext): parsimmon.Parser<IndentResult<Ending>> {
    return ScenarioParser.scenarioInformation(context).chain((info: [string, string]) =>
      IndentParser.endOfLine(context).chain((eolCtx: IndentContext) =>
        scene(eolCtx).chain((result: IndentResult<Scene[]>) =>
          fin(result.context).map((f: string) =>
            new IndentResult(new Ending(info[0], info[1], result.value, f), result.context)))));
  }

  export function parse(input: string) {
    let context = IndentContext.initialize;
    return new ScenarioResult(ending(context).parse(input.trim()));
  }
}
export = EndingParser;
