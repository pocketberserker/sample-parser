"use strict";
import parsimmon = require("parsimmon");
import IndentContext = require("./IndentContext");
import IndentParser = require("./IndentParser");
import Result = require("./Result");
import TreeNode = require("./TreeNode");

class TreeParser {

  static get elementName() {
    return parsimmon.letter.or(parsimmon.digit).many()
      .map((ns: string[]) => ns.join(""));
  }

  static elems(context: IndentContext): parsimmon.Parser<Result<TreeNode[]>> {
    let empty: Result<TreeNode[]> = new Result([], context);
    return TreeParser.element(context)
      .chain((result: Result<TreeNode>) =>
        TreeParser.elems(result.context).map((res: Result<TreeNode[]>) => {
          let es = res.value.slice();
          es.unshift(result.value);
          return new Result(es, res.context);
        }))
      .or(parsimmon.succeed(empty));
  }

  static children(context: IndentContext): parsimmon.Parser<Result<TreeNode[]>> {
    var currentLevel = context.currentLevel;
    return IndentParser.openParen(currentLevel, context).chain((openCtx: IndentContext) =>
      parsimmon.lazy(() => TreeParser.elems(openCtx))
        .chain((result: Result<TreeNode[]>) => {
          return IndentParser.closeParen(currentLevel, result.context) .map((closeCtx: IndentContext) => {
            return new Result(result.value, closeCtx);
          });
        }));
  }

  static opt<T>(parser: parsimmon.Parser<T>): parsimmon.Parser<T> {
    return parser.or(parsimmon.succeed(null));
  }

  static element(context: IndentContext): parsimmon.Parser<Result<TreeNode>> {
    return IndentParser.sameLevel(context).then(
      TreeParser.elementName.chain((n: string) =>
        IndentParser.endOfLine(context).chain((eolCtx: IndentContext) =>
          parsimmon.lazy(() =>
            TreeParser.opt(TreeParser.children(eolCtx)).map((result: Result<TreeNode[]>) => {
              if (result) {
                return new Result(new TreeNode(n, result.value), result.context);
              } else {
                return new Result(new TreeNode(n), eolCtx);
              }
            })))));
  }
}
export = TreeParser;
