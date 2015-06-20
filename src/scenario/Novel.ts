"use strict";
import Scenario = require("./Scenario");
import Scene = require("./Scene");

class Novel implements Scenario {
  private _background: string;
  private _scene: Scene[];
  private _nextSceneName: string;
  // 次のシーン名からファイルの中身を取得する関数を渡して次のシーンを得る
  private _next: (read: (name: string) => string) => Scenario;

  get background() {
    return this._background;
  }

  get scene() {
    return this._scene;
  }

  get nextSceneName() {
    return this._nextSceneName;
  }

  get next() {
    return this._next;
  }

  getImages() {
    // TODO: 重複を考慮する
    let xs = this._scene.map((s: Scene) => s.getImages()).reduce((a: string[], b: string[]) => a.concat(b));
    xs.unshift(this._background);
    return xs;
  }

  constructor(background: string, scene: Scene[], name: string, next: (read: (next: string) => string) => Scenario) {
    this._background = background;
    this._scene = scene;
    this._nextSceneName = name;
    this._next = next;
  }
}
export = Novel;
