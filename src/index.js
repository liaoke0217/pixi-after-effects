"use strict";
/**
 * @namespace PIXI
 */
Object.defineProperty(exports, "__esModule", { value: true });
const AfterEffects_1 = require("./AfterEffects");
const loader_1 = require("./loader");
const interceptor_1 = require("./interceptor");
window.PIXI.AfterEffects = AfterEffects_1.AfterEffects;
window.PIXI.AEDataLoader = loader_1.AEDataLoader;
window.PIXI.AEDataInterceptor = interceptor_1.AEDataInterceptor;
