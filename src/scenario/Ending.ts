"use strict";
import Scene = require("./Scene");
import Scenario = require("./Scenario");

class Ending implements Scenario {
  private _title: string;
  private _background: string;
  private _scene: Scene[];

  get title() {
    return this._title;
  }

  get background() {
    return this._background;
  }

  get scene() {
    return this._scene;
  }

  getImages() {
    // TODO: 重複を考慮する
    let xs = this._scene.map((s: Scene) => s.getImages()).reduce((a: string[], b: string[]) => a.concat(b));
    xs.unshift(this._background);
    return xs;
  }

  constructor(title: string, background: string, scene: Scene[]) {
    this._title = title;
    this._background = background;
    this._scene = scene;
  }
}
export = Ending;
