"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const element_1 = require("./element");
const comp_1 = __importDefault(require("./comp"));
const image_1 = __importDefault(require("./image"));
const solid_1 = __importDefault(require("./solid"));
const text_1 = __importDefault(require("./text"));
const shape_1 = __importDefault(require("./shape"));
const ELEMENT_TYPE = {
    COMP: 0,
    SOLID: 1,
    IMAGE: 2,
    NULL: 3,
    SHAPE: 4,
    TEXT: 5,
    VIDEO: 9,
    CAMERA: 13,
};
class ElementFactory {
    static create(data) {
        let elem = null;
        switch (data.ty) {
            case ELEMENT_TYPE.COMP:
                elem = new comp_1.default(data);
                break;
            case ELEMENT_TYPE.SOLID:
                elem = new solid_1.default(data);
                break;
            case ELEMENT_TYPE.IMAGE:
                elem = new image_1.default(data);
                break;
            case ELEMENT_TYPE.SHAPE:
                elem = new shape_1.default(data);
                break;
            case ELEMENT_TYPE.TEXT:
                elem = new text_1.default(data);
                break;
            case ELEMENT_TYPE.CAMERA:
                break;
            case ELEMENT_TYPE.NULL:
                elem = new comp_1.default(data);
                break;
            case ELEMENT_TYPE.VIDEO:
                elem = new element_1.Element(data);
                break;
            default:
                break;
        }
        return elem;
    }
}
exports.default = ElementFactory;
