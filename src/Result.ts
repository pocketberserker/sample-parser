"use strict";
import IndentContext = require("./IndentContext");

class Result<T> {
  private _value: T;
  private _context: IndentContext;

  get value() {
    return this._value;
  }

  get context() {
    return this._context;
  }

  constructor(value: T, context: IndentContext) {
    this._value = value;
    this._context = context;
  }
}
export = Result;
