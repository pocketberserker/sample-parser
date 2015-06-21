"use strict";
import parsimmon = require("parsimmon");
import IndentContext = require("./IndentContext");
import IndentParser = require("./IndentParser");
import IndentResult = require("./IndentResult");
import TreeNode = require("../data/TreeNode");
import Helper = require("./Helper");

module TreeParser {

  var elementName: parsimmon.Parser<string> =
    parsimmon.letter.or(parsimmon.digit).many()
      .map((ns: string[]) => ns.join(""));

  function elems(context: IndentContext): parsimmon.Parser<IndentResult<TreeNode[]>> {
    let empty: IndentResult<TreeNode[]> = new IndentResult([], context);
    return element(context)
      .chain((result: IndentResult<TreeNode>) =>
        elems(result.context).map((res: IndentResult<TreeNode[]>) => {
          let es = res.value.slice();
          es.unshift(result.value);
          return new IndentResult(es, res.context);
        }))
      .or(parsimmon.succeed(empty));
  }

  export function children(context: IndentContext): parsimmon.Parser<IndentResult<TreeNode[]>> {
    var currentLevel = context.currentLevel;
    return IndentParser.openParen(currentLevel, context).chain((openCtx: IndentContext) =>
      parsimmon.lazy(() => elems(openCtx))
        .chain((result: IndentResult<TreeNode[]>) => {
          return IndentParser.closeParen(currentLevel, result.context) .map((closeCtx: IndentContext) => {
            return new IndentResult(result.value, closeCtx);
          });
        }));
  }

  export function element(context: IndentContext): parsimmon.Parser<IndentResult<TreeNode>> {
    return IndentParser.sameLevel(context).then(
      elementName.chain((n: string) =>
        IndentParser.endOfLine(context).chain((eolCtx: IndentContext) =>
          parsimmon.lazy(() =>
            Helper.opt(children(eolCtx)).map((result: IndentResult<TreeNode[]>) => {
              if (result) {
                return new IndentResult(new TreeNode(n, result.value), result.context);
              } else {
                return new IndentResult(new TreeNode(n), eolCtx);
              }
            })))));
  }
}
export = TreeParser;
