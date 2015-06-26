"use strict";
import Scene = require("./Scene");
import Character = require("./Character");

class Line implements Scene {
  private _name: string;
  private _words: string[];
  private _characters: Character[];
  private _background: string;

  get name() {
    return this._name;
  }

  get words() {
    return this._words;
  }

  get characters() {
    return this._characters;
  }

  background(defaultValue: string) {
    if (this._background) {
      return this._background;
    } else {
      return defaultValue;
    }
  }

  getImages() {
    if (this._background) {
      let xs = this._characters.map((c: Character) => c.image);
      xs.unshift(this._background);
      return xs;
    } else {
      return this._characters.map((c: Character) => c.image);
    }
  }

  constructor(name: string, words: string[], characters: Character[], background: string) {
    this._name = name;
    this._words = words;
    this._characters = characters;
    this._background = background;
  }
}
export = Line;
