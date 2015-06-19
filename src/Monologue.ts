"use strict";
import Scenario = require("./Scenario");

class Monologue implements Scenario {
  private _words: string;

  get words() {
    return this._words;
  }

  constructor(words: string) {
    this._words = words;
  }
}
export = Monologue;
