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
class ImageElement extends element_1.Element {
    constructor(data) {
        super(data);
        if (data.bmPIXI) {
            this.blendMode = data.bmPIXI;
        }
        if (data.image) {
            this.image = data.image;
            if (this.blendMode !== PIXI.BLEND_MODES.NORMAL) {
                this.image.blendMode = this.blendMode;
            }
            this.addChild(this.image);
        }
    }
    setupImage(assetMap) {
        if (this.image)
            return;
        if (!this.referenceId)
            return;
        const asset = assetMap[this.referenceId];
        if (!asset)
            return;
        if (asset.blendMode) {
            this.blendMode = asset.blendMode;
        }
        this.image = new PIXI.Sprite(asset.texture);
        this.image.blendMode = this.blendMode;
        this.addChild(this.image);
    }
}
exports.default = ImageElement;
