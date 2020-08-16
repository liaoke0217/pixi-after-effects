"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const PIXI = __importStar(require("pixi.js"));
const element_1 = require("./element");
const JUSTIFICATION_TYPE = {
    LEFT: 0,
    RIGHT: 1,
    CENTER: 2,
};
const ALIGN_OF_JUSTIFICATION = {};
ALIGN_OF_JUSTIFICATION[JUSTIFICATION_TYPE.LEFT] = 'left';
ALIGN_OF_JUSTIFICATION[JUSTIFICATION_TYPE.RIGHT] = 'right';
ALIGN_OF_JUSTIFICATION[JUSTIFICATION_TYPE.CENTER] = 'center';
class TextElement extends element_1.Element {
    constructor(data) {
        super(data);
        if (data.text) {
            this.text = data.text;
            if (data.rawText) {
                this.rawText = data.rawText;
                this.text.text = data.rawText;
            }
            this.addChild(this.text);
            return;
        }
        if (data.t) {
            const properties = data.t.d.k[0].s;
            if (data.rawText) {
                properties.t = data.rawText;
            }
            this.setupText(properties);
        }
    }
    static toHex(c) {
        if (c <= 1) {
            c *= 255;
            c = Math.floor(c);
        }
        const hex = c.toString(16);
        return hex.length === 1 ? `0${hex}` : hex;
    }
    static toFontColor(data) {
        if (data.length > 0) {
            return parseInt(`0x${this.toHex(data[0])}${this.toHex(data[1])}${this.toHex(data[2])}`, 16);
        }
        return 0xffffff;
    }
    setupText(data) {
        if (this.text)
            return;
        this.fontFamily = data.f;
        this.fontColor = TextElement.toFontColor(data.fc);
        this.fontSize = data.s;
        this.rawText = data.t;
        this.baseLineHeight = data.lh;
        this.baseLineShift = data.ls;
        this.tracking = data.tr;
        this.justification = data.j;
        this.text = new PIXI.Text(this.rawText, {
            fontFamily: this.fontFamily,
            fontSize: this.fontSize,
            fill: this.fontColor,
            align: ALIGN_OF_JUSTIFICATION[this.justification],
        });
        if (this.justification === JUSTIFICATION_TYPE.LEFT) {
            this.text.anchor.x = 0;
        }
        else if (this.justification === JUSTIFICATION_TYPE.RIGHT) {
            this.text.anchor.x = 1;
        }
        else if (this.justification === JUSTIFICATION_TYPE.CENTER) {
            this.text.anchor.x = 0.5;
        }
        const dh = this.baseLineHeight - this.fontSize;
        this.text.y -= this.text.height - dh;
        this.addChild(this.text);
    }
}
exports.default = TextElement;
