"use strict";
import Scene = require("./Scene");
import Character = require("./Character");

class Monologue implements Scene {
  private _words: string;
  private _characters: Character[];

  get words() {
    return this._words;
  }

  get characters() {
    return this._characters;
  }

  constructor(words: string, characters: Character[]) {
    this._words = words;
    this._characters = characters;
  }
}
export = Monologue;
