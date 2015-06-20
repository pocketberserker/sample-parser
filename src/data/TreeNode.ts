"use strict";

class TreeNode {
  private _name: string;
  private _children: TreeNode[];

  get name() {
    return this._name;
  }

  get children() {
    return this._children;
  }

  constructor(name: string, children?: TreeNode[]) {
    this._name = name;
    this._children = children ? children : [];
  }

  static singleton(name: string) {
    return new TreeNode(name);
  }
}
export = TreeNode;
