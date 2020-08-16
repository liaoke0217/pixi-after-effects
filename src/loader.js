"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PIXI = __importStar(require("pixi.js"));
const element = __importStar(require("./element"));
const asset_1 = require("./asset");
const versionHelper_1 = __importDefault(require("./versionHelper"));
/**
 * Create assets and layers, also load all images includes AfterEffects animation.
 *
 * @class AEDataLoader
 * @memberof PIXI
 * @prop {function} imagePathProxy - Callback with image path before load image. If modify image path before load image, override this member and return newly path
 * @prop {function} createImageLoader - Create PIXI.loader.Loader for loading image. If create PIXI.loader.Loader for you want, override this member and can return another loader
 */
class AEDataLoader {
    constructor() {
        this.imagePathProxy = path => path;
        this.createImageLoader = versionHelper_1.default.select((imageAssets) => {
            const loader = new PIXI.loaders.Loader();
            return loader('', imageAssets.length); /* for v4 API */
        }, (imageAssets) => {
            return new PIXI.Loader('', imageAssets.length); /* for v5 API */
        });
    }
    /**
     * Load JSON data by url
     *
     * @memberof PIXI.AEDataLoader#
     * @param {string} - The JSON url
     * @return {Promise}
     */
    loadJSON(jsonPath) {
        return new Promise((resolve, reject) => {
            fetch(jsonPath)
                .then((res) => {
                return res.json();
            })
                .then((json) => {
                if (!json) {
                    return reject();
                }
                const data = json;
                return this.load(data, jsonPath, null)
                    .then(() => {
                    resolve(data);
                })
                    .catch((e) => {
                    reject(e);
                });
            });
        });
    }
    /**
     * Load JSON data by url with PIXI.AEDataInterceptor
     *
     * @memberof PIXI.AEDataLoader#
     * @param {string} - The JSON url
     * @param {PIXI.AEDataInterceptor} - The AEDataInterceptor instance
     * @return {Promise}
     */
    loadJSONWithInterceptor(jsonPath, interceptor) {
        return new Promise((resolve, reject) => {
            if (!interceptor) {
                return reject(new Error('required interceptor parameter'));
            }
            return fetch(jsonPath)
                .then((res) => {
                return res.json();
            })
                .then((json) => {
                const data = json;
                return this.load(data, jsonPath, interceptor)
                    .then(() => {
                    resolve(data);
                })
                    .catch((e) => {
                    reject(e);
                });
            });
        });
    }
    static loadLayers(data, interceptor) {
        return data.layers
            .map((layer) => {
            if (interceptor)
                interceptor.intercept(layer);
            return element.ElementFactory.create(layer);
        })
            .filter((layer) => layer !== null);
    }
    loadAssets(data, jsonPath, interceptor) {
        const baseName = jsonPath
            .split('/')
            .slice(0, -1)
            .join('/');
        const assets = data.assets.map((asset) => {
            if (interceptor)
                interceptor.intercept(asset);
            return new asset_1.Asset(this, asset, baseName);
        });
        const imageAssets = assets.filter((asset) => {
            return !!asset.imagePath;
        });
        if (imageAssets.length === 0) {
            return new Promise((resolve) => resolve(assets));
        }
        return this.loadImages(imageAssets).then(() => assets);
    }
    loadImages(imageAssets) {
        return new Promise((resolve, reject) => {
            const loader = this.createImageLoader(imageAssets);
            // if override createImageLoader and use shared PIXI.Loaders,
            // possibly loader.resources has already loaded resource
            const requiredLoadAssets = imageAssets.filter(asset => !loader.resources[asset.imagePath]);
            if (requiredLoadAssets.length === 0) {
                imageAssets.forEach((asset) => {
                    asset.texture = loader.resources[asset.imagePath].texture;
                });
                return resolve();
            }
            requiredLoadAssets.forEach((asset) => {
                loader.add(asset.imagePath, asset.imagePath);
            });
            loader.onError.add((error) => {
                reject(error);
            });
            return loader.load((_, resources) => {
                imageAssets.forEach(asset => (asset.texture = resources[asset.imagePath].texture));
                resolve();
            });
        });
    }
    static resolveReference(layers, assets) {
        const assetMap = {};
        assets.forEach((asset) => {
            assetMap[asset.id] = asset;
        });
        layers.forEach((layer) => {
            if (layer.isCompType()) {
                layer.setupReference(assetMap);
            }
            else if (layer.isImageType()) {
                layer.setupImage(assetMap);
            }
        });
    }
    load(data, jsonPath, interceptor) {
        return this.loadAssets(data, jsonPath, interceptor).then((assets) => {
            const layers = AEDataLoader.loadLayers(data, interceptor);
            AEDataLoader.resolveReference(layers, assets);
            data.assets = assets;
            data.layers = layers;
        });
    }
}
exports.AEDataLoader = AEDataLoader;
