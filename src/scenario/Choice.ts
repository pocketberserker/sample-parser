"use strict";

class Choice {
  private _choice: string;
  private _scenario: string;

  get choice() {
      return this._choice;
  }

  get scenario() {
      return this._scenario;
  }

  constructor(choice: string, scenario: string) {
      this._choice = choice;
      this._scenario = scenario;
  }
}
export = Choice;
