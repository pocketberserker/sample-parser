"use strict";
import Scene = require("./Scene");
import Scenario = require("./Scenario");

class Ending implements Scenario {
  private _background: string;
  private _scene: Scene[];
  
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
  
  constructor(background: string, scene: Scene[]) {
    this._background = background;
    this._scene = scene;
  }
}
export = Ending;
