"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Char {
    constructor(data) {
        this.ch = data.ch;
        this.fontFamily = data.fFamily;
        this.fontSize = data.size;
        this.fontStyle = data.style;
        this.width = data.w;
        this.shapes = data.data.shapes;
    }
}
exports.default = Char;
