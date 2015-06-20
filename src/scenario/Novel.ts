"use strict";
import Scenario = require("./Scenario");
import Scene = require("./Scene");

class Novel implements Scenario {
  private _background: string;
  private _scene: Scene[];
  // 次のシーン名からファイルの中身を取得する関数を渡して次のシーンを得る
  private _next: (read: (name: string) => string) => Scenario;

  get background() {
    return this._background;
  }

  get scene() {
    return this._scene;
  }

  get next() {
    return this._next;
  }

  constructor(background: string, scene: Scene[], next: (read: (next: string) => string) => Scenario) {
    this._background = background;
    this._scene = scene;
    this._next = next;
  }
}
export = Novel;
