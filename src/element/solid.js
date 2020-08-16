"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const element_1 = require("./element");
class SolidElement extends element_1.Element {
    constructor(data) {
        super(data);
        this.color = data.sc || '';
        this.colorNumber = data.sc || 0;
        this.sw = data.sw || 0;
        this.sh = data.sh || 0;
        if (this.color.startsWith('#')) {
            this.color = `0x${this.color.substr(1)}`;
            this.colorNumber = parseInt(this.color, 16);
        }
    }
    __updateWithFrame(frame) {
        super.__updateWithFrame(frame);
        this.clear();
        this.beginFill(this.colorNumber, this.opacity);
        this.drawRect(0, 0, this.sw * this.scaleX, this.sh * this.scaleY);
        this.endFill();
        return true;
    }
}
exports.default = SolidElement;
