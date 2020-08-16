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
const element = __importStar(require("./element"));
const mask_1 = require("./element/mask");
const loader_1 = require("./loader");
/**
 * @example
 * // create base container object
 * const stage = new PIXI.Container();
 * // create the AfterEffects instance from json path
 * PIXI.AfterEffects.fromJSONPath('bodymovin.json').then((ae) => {
 *   // add AfterEffects to stage
 *   stage.addChild(ae);
 *   // start AfterEffects animation
 *   ae.play();
 * });
 *
 * @class AfterEffects
 * @extends PIXI.Container
 * @memberof PIXI
 */
class AfterEffects extends PIXI.Container {
    constructor() {
        super();
        this.finder = new element.ElementFinder();
    }
    /**
     * Create PIXI.AfterEffects instance from JSON url
     *
     * @memberof PIXI.AfterEffects
     * @static
     * @param {string} - The JSON url
     * @param {object} [opt] - The animation option parameters
     * @param {boolean} [opt.noreplay] - enables no repeat mode. if enabled this option, instantly destroy already played component.
     * @return {Promise}
     */
    static fromJSONPath(jsonPath, opt) {
        return new loader_1.AEDataLoader().loadJSON(jsonPath).then((data) => {
            const ae = new AfterEffects();
            ae.setup(data, opt || {});
            return ae;
        });
    }
    /**
     * Create PIXI.AfterEffects instance from object created by AEDataLoader
     *
     * @memberof PIXI.AfterEffects
     * @static
     * @param {object} - The Object loaded by AEDataLoader
     * @param {object} [opt] - The animation option parameters
     * @param {boolean} [opt.noreplay] - enables no repeat mode. if enabled this option, instantly destroy already played component.
     * @return {PIXI.AfterEffects} The newly created AfterEffects
     */
    static fromData(data, opt) {
        const ae = new AfterEffects();
        ae.setup(data, opt || {});
        return ae;
    }
    /**
     * @memberof PIXI.AfterEffects#
     * @private
     * @param {object} - The Object loaded by AEDataLoader
     * @param {object} - The option ( `noreplay` ) for AfterEffects
     */
    setup(data, opt) {
        this.width = data.w;
        this.height = data.h;
        this.inFrame = data.ip;
        this.outFrame = data.op;
        this.frameRate = data.fr;
        this.version = data.v;
        this.layers = data.layers;
        this.textures = data.assets
            .filter(asset => !!asset.texture)
            .map(asset => asset.texture);
        this.textureCacheIds = this.textures
            .filter(texture => texture.textureCacheIds && texture.textureCacheIds.length > 0)
            .map(texture => texture.textureCacheIds[0]);
        this.player = new element.ElementPlayer(this.frameRate, this.inFrame, this.outFrame, (frame) => {
            this.updateWithFrame(frame);
        }, () => {
            this.emit('completed', this);
        });
        this.deltaPlayer = new element.ElementDeltaPlayer(this.frameRate, this.inFrame, this.outFrame, (frame) => {
            this.updateWithFrame(frame);
        }, () => {
            this.emit('completed', this);
        });
        Object.keys(opt).forEach((key) => {
            this[key] = opt[key];
        });
        const layerIndexMap = {};
        this.layers.forEach((layer) => {
            layerIndexMap[layer.index] = layer;
        });
        this.layers.reverse().forEach((layer) => {
            layer.frameRate = this.frameRate;
            layer.opt = opt;
            if (layer.hasMask) {
                if (!this.masks)
                    this.masks = [];
                const maskLayer = new mask_1.MaskElement(layer);
                this.addChild(layer);
                layer.addChild(maskLayer);
                this.masks.push({
                    maskTargetLayer: layer,
                    maskLayer,
                });
            }
            else if (layer.hasParent) {
                const parentLayer = layerIndexMap[layer.parentIndex];
                parentLayer.addChild(layer);
            }
            else {
                this.addChild(layer);
            }
        });
        this.player.showFirstFrame();
        this.deltaPlayer.showFirstFrame();
    }
    /**
     * Find element by name
     *
     * @memberof PIXI.AfterEffects#
     * @param {string} - The name of element
     * @return {Element} - The found Element
     */
    find(name) {
        return this.finder.findByName(name, this);
    }
    /**
     * Update mask element by frame
     *
     * @private
     * @memberof PIXI.AfterEffects#
     * @param {number} - The current frame number
     */
    updateMask(frame) {
        this.masks.forEach((maskData) => {
            const drawnMask = maskData.maskLayer.__updateWithFrame(frame);
            if (drawnMask) {
                maskData.maskTargetLayer.mask = maskData.maskLayer;
            }
            else {
                maskData.maskTargetLayer.mask = null;
            }
        });
    }
    /**
     * Update by current time
     *
     * @memberof PIXI.AfterEffects#
     * @param {number} - The current time
     */
    update(nowTime) {
        if (!this.layers)
            return;
        this.player.update(nowTime);
        this.layers.forEach((layer) => {
            layer.update(nowTime);
        });
    }
    /**
     * Update by delta time
     *
     * @memberof PIXI.AfterEffects#
     * @param {number} - The delta time
     */
    updateByDelta(deltaTime) {
        if (!this.layers)
            return;
        this.deltaPlayer.update(deltaTime);
        this.layers.forEach((layer) => {
            layer.updateByDelta(deltaTime);
        });
    }
    /**
     * Update by frame
     *
     * @memberof PIXI.AfterEffects#
     * @param {number} - The current frame number
     */
    updateWithFrame(frame) {
        if (this.masks) {
            this.updateMask(frame);
        }
        if (this.noreplay) {
            this.layers = this.layers.filter((layer) => {
                if (layer.outFrame < frame) {
                    this.removeChild(layer);
                    layer.destroy();
                    return false;
                }
                layer.updateWithFrame(frame);
                return true;
            });
        }
        else {
            this.layers.forEach((layer) => {
                layer.updateWithFrame(frame);
            });
        }
    }
    /**
     * Start AfterEffects animation
     *
     * @memberof PIXI.AfterEffects#
     * @param {boolean} - Enable Loop playing
     */
    play(isLoop) {
        this.player.play(isLoop);
        this.deltaPlayer.play(isLoop);
    }
    /**
     * Pause AfterEffects animation
     *
     * @memberof PIXI.AfterEffects#
     */
    pause() {
        this.player.pause();
        this.deltaPlayer.pause();
    }
    /**
     * Resume AfterEffects animation
     *
     * @memberof PIXI.AfterEffects#
     */
    resume() {
        this.player.resume();
        this.deltaPlayer.resume();
    }
    /**
     * Stop AfterEffects animation
     *
     * @memberof PIXI.AfterEffects#
     */
    stop() {
        this.player.stop();
        this.deltaPlayer.stop();
    }
}
exports.AfterEffects = AfterEffects;
