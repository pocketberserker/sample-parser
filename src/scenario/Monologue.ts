"use strict";
import Scene = require("./Scene");
import Character = require("./Character");

class Monologue implements Scene {
  private _words: string[];
  private _characters: Character[];
  private _background: string;

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

  constructor(words: string[], characters: Character[], background: string) {
    this._words = words;
    this._characters = characters;
    this._background = background;
  }
}
export = Monologue;
