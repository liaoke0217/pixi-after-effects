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
const pixiVersionHelper = {
    version: PIXI.VERSION,
    semanticVersion() {
        const semVer = this.version.match(/([0-9]+)\.([0-9]+)\.([0-9]+)/);
        if (!semVer || semVer.length < 3) {
            return { major: 0, minor: 0, patch: 0 };
        }
        const major = parseInt(semVer[1], 10);
        const minor = parseInt(semVer[2], 10);
        const patch = parseInt(semVer[3], 10);
        return { major, minor, patch };
    },
    major() {
        return this.semanticVersion().major;
    },
    minor() {
        return this.semanticVersion().minor;
    },
    patch() {
        return this.semanticVersion().patch;
    },
    isV4() {
        return this.major() === 4;
    },
    isV5() {
        return this.major() === 5;
    },
    select(v4func, v5func) {
        if (this.isV4() && v4func !== undefined) {
            return v4func;
        }
        if (this.isV5() && v5func !== undefined) {
            return v5func;
        }
        return () => { };
    },
};
exports.default = pixiVersionHelper;
