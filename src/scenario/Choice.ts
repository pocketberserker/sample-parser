"use strict";
import ScenarioResult = require("../parser/ScenarioResult");

class Choice {
  private _choice: string;
  private _scenario: string;
  // 次のシーン名からファイルの中身を取得する関数を渡して次のシーンを得る
  private _next: (read: (name: string) => string) => ScenarioResult;

  get choice() {
      return this._choice;
  }

  get scenario() {
      return this._scenario;
  }

  get next() {
    return this._next;
  }

  constructor(
    choice: string,
    scenario: string,
    next: (read: (next: string) => string) => ScenarioResult) {
      this._choice = choice;
      this._scenario = scenario;
      this._next = next;
  }
}
export = Choice;
