"use strict";

interface Scene {
  background(defaultValue: string): string;
  getImages(): string[];
}
export = Scene;
