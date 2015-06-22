"use strict";
import parsimmon = require("parsimmon");
import Helper = require("./Helper");
import IndentContext = require("./IndentContext");
import IndentParser = require("./IndentParser");
import IndentResult = require("./IndentResult");
import Monologue = require("../scenario/Monologue");
import Line = require("../scenario/Line");
import Scene = require("../scenario/Scene");
import Ending = require("../scenario/Ending");
import ScenarioParser = require("./ScenarioParser");
import ScenarioResult = require("./ScenarioResult");

module EndingParser {

  export function scene(context: IndentContext): parsimmon.Parser<IndentResult<Scene[]>> {
    let empty: IndentResult<Scene[]> = new IndentResult([], context);
    return parsimmon.alt(monologue(context), line(context))
      .chain((result: IndentResult<Scene>) =>
        parsimmon.lazy(() => scene(result.context)).map((res: IndentResult<Scene[]>) => {
          let es = res.value.slice();
          es.unshift(result.value);
          return new IndentResult(es, res.context);
        }))
      .or(parsimmon.succeed(empty));
  }

  function monologueBody(context: IndentContext): parsimmon.Parser<IndentResult<Scene>> {
    return ScenarioParser.backgroundOption(context).chain((b: IndentResult<string>) =>
      IndentParser.sameLevel(b.context)
        .then(ScenarioParser.text(b.context).map((ws: string[]) =>
          new IndentResult(new Monologue(ws, [], b.value), b.context))));
  }

  export function monologue(context: IndentContext): parsimmon.Parser<IndentResult<Scene>> {
    return ScenarioParser.block(context, "monologue", monologueBody);
  }

  var name: parsimmon.Parser<string> = Helper.keyValueString("name");

  function lineBody(context: IndentContext): parsimmon.Parser<IndentResult<Scene>> {
    return ScenarioParser.backgroundOption(context).chain((b: IndentResult<string>) =>
      IndentParser.sameLevel(b.context).then(name).chain((n: string) =>
        IndentParser.endOfLine(b.context).chain((eolCtx: IndentContext) =>
          IndentParser.sameLevel(eolCtx)
            .then(ScenarioParser.text(eolCtx).map((ws: string[]) =>
              new IndentResult(new Line(n, ws, [], b.value), eolCtx))))));
  }

  export function line(context: IndentContext): parsimmon.Parser<IndentResult<Scene>> {
    return ScenarioParser.block(context, "line", lineBody);
  }

  export function ending(context: IndentContext): parsimmon.Parser<IndentResult<Ending>> {
    return ScenarioParser.scenarioInformation(context).chain((info: [string, string]) =>
        IndentParser.endOfLine(context)
        .chain((eolCtx: IndentContext) =>
          scene(eolCtx).map((result: IndentResult<Scene[]>) =>
              new IndentResult(new Ending(info[0], info[1], result.value), result.context)
            )
        ));
  }

  export function parse(input: string) {
    let context = IndentContext.initialize;
    return new ScenarioResult(ending(context).parse(input.trim()));
  }
}
export = EndingParser;
