"use strict";
import Character = require("./Character");

interface Scene {
  characters: Character[];
  background(defaultValue: string): string;
  getImages(): string[];
}
export = Scene;
