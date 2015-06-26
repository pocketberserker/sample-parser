"use strict";
import Position = require("./Position");

class Character {
  private _image: string;
  private _frames: number[];
  private _position: Position;
  private _width: number;
  private _height: number;

  get image() {
    return this._image;
  }

  get frames() {
    return this._frames;
  }

  get position() {
    return this._position;
  }

  get width() {
    return this._width;
  }

  get height() {
    return this._height;
  }

  constructor(image: string, frames: number[], position: Position, width: number, height: number) {
    this._image = image;
    this._frames = frames;
    this._position = position;
    this._width = width;
    this._height = height;
  }
}
export = Character;
