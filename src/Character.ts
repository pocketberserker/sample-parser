"use strict";
import Position = require("./Position");

class Character {
  private _image: string;
  private _frames: number[];
  private _position: Position;

  get image() {
    return this._image;
  }

  get frames() {
    return this._frames;
  }

  get position() {
    return this._position;
  }

  constructor(image: string, frames: number[], position: Position) {
    this._image = image;
    this._frames = frames;
    this._position = position;
  }
}
export = Character;
