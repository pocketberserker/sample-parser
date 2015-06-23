"use strict";
import Scene = require("./Scene");
import Scenario = require("./Scenario");

class Ending implements Scenario {
  private _title: string;
  private _background: string;
  private _scene: Scene[];
  private _fin: string;

  get title() {
    return this._title;
  }

  get background() {
    return this._background;
  }

  get scene() {
    return this._scene;
  }

  get fin() {
    return this._fin;
  }

  getImages() {
    // TODO: 重複を考慮する
    let xs = this._scene.map((s: Scene) => s.getImages()).reduce((a: string[], b: string[]) => a.concat(b));
    return xs.concat([this._background, this._fin]);
  }

  constructor(title: string, background: string, scene: Scene[], fin: string) {
    this._title = title;
    this._background = background;
    this._scene = scene;
    this._fin = fin;
  }
}
export = Ending;
