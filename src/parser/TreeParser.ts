"use strict";
import parsimmon = require("parsimmon");
import IndentContext = require("./IndentContext");
import IndentParser = require("./IndentParser");
import Result = require("./Result");
import TreeNode = require("../data/TreeNode");
import Helper = require("./Helper");

module TreeParser {

  var elementName: parsimmon.Parser<string> =
    parsimmon.letter.or(parsimmon.digit).many()
      .map((ns: string[]) => ns.join(""));

  function elems(context: IndentContext): parsimmon.Parser<Result<TreeNode[]>> {
    let empty: Result<TreeNode[]> = new Result([], context);
    return element(context)
      .chain((result: Result<TreeNode>) =>
        elems(result.context).map((res: Result<TreeNode[]>) => {
          let es = res.value.slice();
          es.unshift(result.value);
          return new Result(es, res.context);
        }))
      .or(parsimmon.succeed(empty));
  }

  export function children(context: IndentContext): parsimmon.Parser<Result<TreeNode[]>> {
    var currentLevel = context.currentLevel;
    return IndentParser.openParen(currentLevel, context).chain((openCtx: IndentContext) =>
      parsimmon.lazy(() => elems(openCtx))
        .chain((result: Result<TreeNode[]>) => {
          return IndentParser.closeParen(currentLevel, result.context) .map((closeCtx: IndentContext) => {
            return new Result(result.value, closeCtx);
          });
        }));
  }

  export function element(context: IndentContext): parsimmon.Parser<Result<TreeNode>> {
    return IndentParser.sameLevel(context).then(
      elementName.chain((n: string) =>
        IndentParser.endOfLine(context).chain((eolCtx: IndentContext) =>
          parsimmon.lazy(() =>
            Helper.opt(children(eolCtx)).map((result: Result<TreeNode[]>) => {
              if (result) {
                return new Result(new TreeNode(n, result.value), result.context);
              } else {
                return new Result(new TreeNode(n), eolCtx);
              }
            })))));
  }
}
export = TreeParser;
