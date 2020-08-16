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
const bezier_easing_1 = __importDefault(require("bezier-easing"));
const AfterEffects_1 = require("../AfterEffects");
const finder_1 = __importDefault(require("./finder"));
const player_1 = __importDefault(require("./player"));
const delta_player_1 = __importDefault(require("./delta_player"));
const TRACK_MATTE_TYPE = {
    ALPHA: 1,
    ALPHA_INVERTED: 2,
    LUMA: 3,
    LUMA_INVERTED: 4,
};
class Element extends PIXI.Graphics {
    constructor(data) {
        super();
        this.finder = new finder_1.default();
        if (!data)
            return;
        this.name = data.nm;
        this.referenceId = data.refId;
        this.type = data.ty;
        this.isCompleted = data.completed;
        this.index = data.ind;
        this.hasParent = Object.prototype.hasOwnProperty.call(data, 'parent');
        this.parentIndex = data.parent;
        this.inFrame = data.ip;
        this.outFrame = data.op;
        this.stretch = data.sr || 1;
        this.startTime = data.st;
        this.hasMask = data.hasMask;
        this.setupProperties(data.ks);
        this.blendMode = Element.toPIXIBlendMode(data.bm);
        if (data.bmPIXI) {
            this.blendMode = data.bmPIXI;
        }
        if (data.tt) {
            this.hasTrackMatteType = true;
            this.trackMatteType = data.tt;
        }
        else if (data.td) {
            this.isTrackMatteData = true;
        }
        this.player = new player_1.default(0, 0, this.outFrame, (frame) => {
            this.updateWithFrameBySelfPlayer(frame);
        }, () => {
            this.emit('completed', this);
        });
        this.deltaPlayer = new delta_player_1.default(0, 0, this.outFrame, (frame) => {
            this.updateWithFrameBySelfPlayer(frame);
        }, () => {
            this.emit('completed', this);
        });
        if (data.masksProperties) {
            this.masksProperties = data.masksProperties;
        }
        if (data.events) {
            Object.keys(data.events).forEach((eventName) => {
                if (this.isInteractiveEvent(eventName))
                    this.interactive = true;
                this.on(eventName, data.events[eventName]);
            });
        }
    }
    static toPIXIBlendMode(mode) {
        switch (mode) {
            case 0:
                return PIXI.BLEND_MODES.NORMAL;
            case 1:
                return PIXI.BLEND_MODES.MULTIPLY;
            case 2:
                return PIXI.BLEND_MODES.SCREEN;
            case 3:
                return PIXI.BLEND_MODES.OVERLAY;
            case 4:
                return PIXI.BLEND_MODES.DARKEN;
            case 5:
                return PIXI.BLEND_MODES.LIGHTEN;
            case 6:
                return PIXI.BLEND_MODES.COLOR_DODGE;
            case 7:
                return PIXI.BLEND_MODES.COLOR_BURN;
            case 8:
                return PIXI.BLEND_MODES.HARD_LIGHT;
            case 9:
                return PIXI.BLEND_MODES.SOFT_LIGHT;
            case 10:
                return PIXI.BLEND_MODES.DIFFERENCE;
            case 11:
                return PIXI.BLEND_MODES.EXCLUSION;
            case 12:
                return PIXI.BLEND_MODES.HUE;
            case 13:
                return PIXI.BLEND_MODES.SATURATION;
            case 14:
                return PIXI.BLEND_MODES.COLOR;
            case 15:
                return PIXI.BLEND_MODES.LUMINOSITY;
            default:
                break;
        }
        return PIXI.BLEND_MODES.NORMAL;
    }
    __root(node) {
        if (node instanceof AfterEffects_1.AfterEffects)
            return node;
        if (node.parent)
            return this.__root(node.parent);
        return null;
    }
    root() {
        return this.__root(this);
    }
    addChild(...children) {
        const o = super.addChild(...children);
        if (this.isInvertedMask) {
            children.forEach((child) => {
                const container = child;
                container.isInvertedMask = true;
            });
        }
        return o;
    }
    isInvertTrackMatteType() {
        return (this.trackMatteType === TRACK_MATTE_TYPE.ALPHA_INVERTED
            || this.trackMatteType === TRACK_MATTE_TYPE.LUMA_INVERTED);
    }
    set frameRate(value) {
        if (this.player) {
            this.player.frameRate = value;
        }
        if (this.deltaPlayer) {
            this.deltaPlayer.frameRate = value;
        }
    }
    set opt(value) {
        Object.keys(value).forEach((key) => {
            this[key] = value[key];
        });
    }
    isInteractiveEvent(eventName) {
        if (!this.interactiveEventMap) {
            const interactiveEvents = [
                'click',
                'mousedown',
                'mousemove',
                'mouseout',
                'mouseover',
                'mouseup',
                'mouseupoutside',
                'pointercancel',
                'pointerdown',
                'pointermove',
                'pointerout',
                'pointerover',
                'pointertap',
                'pointerup',
                'pointerupoutside',
                'removed',
                'rightclick',
                'rightdown',
                'rightup',
                'rightupoutside',
                'tap',
                'touchcancel',
                'touchend',
                'touchendoutside',
                'touchmove',
                'touchstart',
            ];
            this.interactiveEventMap = {};
            interactiveEvents.forEach((event) => {
                this.interactiveEventMap[event] = true;
            });
        }
        return this.interactiveEventMap[eventName];
    }
    find(name) {
        return this.finder.findByName(name, this);
    }
    isCompType() {
        return this.type === 0;
    }
    isImageType() {
        return this.type === 2;
    }
    setupProperties(data) {
        if (!data)
            return;
        this.setupPosition(data.p);
        this.setupAnchorPoint(data.a);
        this.setupOpacity(data.o);
        this.setupRotation(data.r);
        this.setupScale(data.s);
    }
    updateAnimationFrameByBaseFrame(animBaseFrame) {
        if (this.hasAnimatedAnchorPoint) {
            this.animatedAnchorPoints.forEach((animData) => {
                animData.startFrame += animBaseFrame;
                animData.endFrame += animBaseFrame;
            });
        }
        if (this.hasAnimatedOpacity) {
            this.animatedOpacities.forEach((animData) => {
                animData.startFrame += animBaseFrame;
                animData.endFrame += animBaseFrame;
            });
        }
        if (this.hasAnimatedPosition) {
            this.animatedPositions.forEach((animData) => {
                animData.startFrame += animBaseFrame;
                animData.endFrame += animBaseFrame;
            });
        }
        if (this.hasAnimatedSeparatedPosition) {
            const animation = this.animatedPositions;
            animation.x.forEach((animData) => {
                animData.startFrame += animBaseFrame;
                animData.endFrame += animBaseFrame;
            });
            animation.y.forEach((animData) => {
                animData.startFrame += animBaseFrame;
                animData.endFrame += animBaseFrame;
            });
        }
        if (this.hasAnimatedRotation) {
            this.animatedRotations.forEach((animData) => {
                animData.startFrame += animBaseFrame;
                animData.endFrame += animBaseFrame;
            });
        }
        if (this.hasAnimatedScale) {
            this.animatedScales.forEach((animData) => {
                animData.startFrame += animBaseFrame;
                animData.endFrame += animBaseFrame;
            });
        }
    }
    setupAnchorPoint(data) {
        const anchorPoint = Element.createAnchorPoint(data);
        const animData = anchorPoint;
        if (animData.length > 0) {
            this.hasAnimatedAnchorPoint = true;
            this.animatedAnchorPoints = anchorPoint;
        }
        else {
            this.pivot = anchorPoint;
        }
    }
    static createAnchorPoint(data) {
        if (typeof data.k[0] === 'number') {
            const point = data.k;
            return new PIXI.Point(point[0], point[1]);
        }
        return Element.createAnimatedAnchorPoint(data.k);
    }
    static createAnchorPointEasing(animData) {
        if (animData.i && animData.o) {
            return bezier_easing_1.default(animData.o.x, animData.o.y, animData.i.x, animData.i.y);
        }
        return (x) => x;
    }
    static createAnimatedAnchorPoint(data) {
        const lastIndex = data.length - 1;
        return data.map((animData, index) => {
            const d = {
                name: animData.n,
                startFrame: animData.t,
                endFrame: lastIndex > index ? data[index + 1].t : animData.t,
                easing: Element.createAnchorPointEasing(animData),
                fromAnchorPoint: animData.s,
                toAnchorPoint: animData.e,
            };
            return d;
        });
    }
    setupOpacity(data) {
        const opacity = Element.createOpacity(data);
        const anim = opacity;
        if (anim.length > 0) {
            this.hasAnimatedOpacity = true;
            this.animatedOpacities = opacity;
        }
        else {
            this.alpha = opacity;
        }
    }
    static createOpacity(data) {
        const opacity = data.k;
        if (typeof opacity === 'number') {
            return opacity / 100.0;
        }
        return Element.createAnimatedOpacity(data.k);
    }
    static createOpacityEasing(animData) {
        if (animData.i && animData.o) {
            return bezier_easing_1.default(animData.o.x[0], animData.o.y[0], animData.i.x[0], animData.i.y[0]);
        }
        return (x) => x;
    }
    static createAnimatedOpacity(data) {
        const lastIndex = data.length - 1;
        return data.map((animData, index) => {
            let fromOpacity;
            let toOpacity;
            if (animData.s && animData.e) {
                fromOpacity = animData.s[0];
                toOpacity = animData.e[0];
            }
            else if (animData.s && !animData.e) {
                fromOpacity = animData.s[0];
                toOpacity = fromOpacity;
            }
            const d = {
                name: animData.n,
                startFrame: animData.t,
                endFrame: lastIndex > index ? data[index + 1].t : animData.t,
                easing: Element.createOpacityEasing(animData),
                fromOpacity: fromOpacity !== undefined ? fromOpacity / 100.0 : undefined,
                toOpacity: toOpacity !== undefined ? toOpacity / 100.0 : undefined,
            };
            return d;
        });
    }
    setupPosition(data) {
        const pos = Element.createPosition(data);
        const spAnim = pos;
        const posAnim = pos;
        if (spAnim.x && spAnim.y && spAnim.x.length > 0 && spAnim.y.length > 0) {
            this.hasAnimatedSeparatedPosition = true;
            this.animatedPositions = pos;
        }
        else if (posAnim.length > 0) {
            this.hasAnimatedPosition = true;
            this.animatedPositions = pos;
        }
        else {
            this.position = pos;
        }
    }
    static createPosition(data) {
        const posData = data;
        if (!posData.k && data.x && data.y) {
            if (typeof data.x.k === 'number') {
                return new PIXI.Point(posData.x.k, posData.y.k);
            }
            const spData = data;
            const p = {
                x: Element.createAnimatedSeparatedPosition(spData.x.k),
                y: Element.createAnimatedSeparatedPosition(spData.y.k),
            };
            return p;
        }
        const pos = posData.k;
        if (typeof pos[0] === 'number') {
            const point = posData.k;
            return new PIXI.Point(point[0], point[1]);
        }
        return Element.createAnimatedPosition(posData.k);
    }
    static createSeparatedPositionEasing(animData) {
        if (animData.i && animData.o) {
            return bezier_easing_1.default(animData.o.x[0], animData.o.y[0], animData.i.x[0], animData.i.y[0]);
        }
        return (x) => x;
    }
    static createAnimatedSeparatedPosition(data) {
        const lastIndex = data.length - 1;
        return data.map((animData, index) => {
            const d = {
                name: animData.n,
                startFrame: animData.t,
                endFrame: lastIndex > index ? data[index + 1].t : animData.t,
                easing: Element.createSeparatedPositionEasing(animData),
                fromPosition: animData.s ? animData.s[0] : undefined,
                toPosition: animData.e ? animData.e[0] : undefined,
            };
            return d;
        });
    }
    static createPositionEasing(animData) {
        if (!animData.i || !animData.o) {
            return (x) => x;
        }
        if (typeof animData.i.x === 'number') {
            animData = animData;
            return bezier_easing_1.default(animData.o.x, animData.o.y, animData.i.x, animData.i.y);
        }
        animData = animData;
        return bezier_easing_1.default(animData.o.x[0], animData.o.y[0], animData.i.x[0], animData.i.y[0]);
    }
    static createAnimatedPosition(data) {
        const lastIndex = data.length - 1;
        return data.map((animData, index) => {
            const d = {
                name: animData.n,
                startFrame: animData.t,
                endFrame: lastIndex > index ? data[index + 1].t : animData.t,
                easing: Element.createPositionEasing(animData),
                fromPosition: animData.s,
                toPosition: animData.e ? animData.e : animData.s,
            };
            return d;
        });
    }
    setupRotation(data) {
        if (!data)
            return; // not 'r' property at z rotation pattern
        const rotation = Element.createRotation(data);
        const anim = rotation;
        if (anim.length > 0) {
            this.hasAnimatedRotation = true;
            this.animatedRotations = rotation;
        }
        else {
            this.rotation = rotation;
        }
    }
    static createRotation(data) {
        const rotation = data.k;
        if (typeof rotation === 'number') {
            return (Math.PI * rotation) / 180.0;
        }
        return Element.createAnimatedRotation(data.k);
    }
    static createRotationEasing(animData) {
        if (animData.i && animData.o) {
            return bezier_easing_1.default(animData.o.x[0], animData.o.y[0], animData.i.x[0], animData.i.y[0]);
        }
        return (x) => x;
    }
    static createAnimatedRotation(data) {
        const lastIndex = data.length - 1;
        return data.map((animData, index) => {
            const d = {
                name: animData.n,
                startFrame: animData.t,
                endFrame: lastIndex > index ? data[index + 1].t : animData.t,
                easing: Element.createRotationEasing(animData),
                fromRotation: animData.s
                    ? (Math.PI * animData.s[0]) / 180.0
                    : undefined,
                toRotation: animData.e ? (Math.PI * animData.e[0]) / 180.0 : undefined,
            };
            return d;
        });
    }
    setupScale(data) {
        const scale = Element.createScale(data);
        const anim = scale;
        if (anim.length > 0) {
            this.hasAnimatedScale = true;
            this.animatedScales = scale;
        }
        else {
            const scalePoint = scale;
            this.scaleX = scalePoint.x;
            this.scaleY = scalePoint.y;
            this.scale = scalePoint;
        }
    }
    static createScale(data) {
        const scale = data.k;
        if (typeof scale[0] === 'number') {
            const scaleData = scale;
            const scaleX = scaleData[0] / 100.0;
            const scaleY = scaleData[1] / 100.0;
            return new PIXI.Point(scaleX, scaleY);
        }
        return Element.createAnimatedScale(data.k);
    }
    static createScaleEasing(animData) {
        if (animData.i && animData.o) {
            return bezier_easing_1.default(animData.o.x[0], animData.o.y[1], animData.i.x[0], animData.i.y[1]);
        }
        return (x) => x;
    }
    static createAnimatedScale(data) {
        const lastIndex = data.length - 1;
        return data.map((animData, index) => {
            const d = {
                name: animData.n,
                startFrame: animData.t,
                endFrame: lastIndex > index ? data[index + 1].t : animData.t,
                easing: Element.createScaleEasing(animData),
                fromScale: animData.s,
                toScale: animData.e ? animData.e : animData.s,
            };
            return d;
        });
    }
    animateAnchorPoint(frame) {
        let isAnimated = false;
        if (frame < this.animatedAnchorPoints[0].startFrame) {
            const anchorPoint = this.animatedAnchorPoints[0].fromAnchorPoint;
            if (anchorPoint) {
                this.pivot = new PIXI.Point(anchorPoint[0], anchorPoint[1]);
            }
        }
        this.animatedAnchorPoints.some((animData) => {
            if (animData.startFrame === animData.endFrame) {
                return false;
            }
            if (animData.startFrame <= frame && frame <= animData.endFrame) {
                if (animData.toAnchorPoint === undefined)
                    return false;
                if (animData.fromAnchorPoint === undefined)
                    return false;
                const anchorPointDiffX = animData.toAnchorPoint[0] - animData.fromAnchorPoint[0];
                const anchorPointDiffY = animData.toAnchorPoint[1] - animData.fromAnchorPoint[1];
                const totalFrame = animData.endFrame - animData.startFrame;
                const playFrame = (frame - animData.startFrame) * 1.0;
                const playRatio = playFrame / totalFrame;
                const posRatio = animData.easing(playRatio);
                const anchorPointX = posRatio * anchorPointDiffX + animData.fromAnchorPoint[0];
                const anchorPointY = posRatio * anchorPointDiffY + animData.fromAnchorPoint[1];
                this.pivot = new PIXI.Point(anchorPointX, anchorPointY);
                isAnimated = true;
                return true;
            }
            return false;
        });
        if (!isAnimated
            && frame
                > this.animatedAnchorPoints[this.animatedAnchorPoints.length - 1].endFrame) {
            const anchorPoint = this.animatedAnchorPoints[this.animatedAnchorPoints.length - 2].toAnchorPoint;
            if (anchorPoint) {
                this.pivot = new PIXI.Point(anchorPoint[0], anchorPoint[1]);
            }
        }
        return isAnimated;
    }
    animateOpacity(frame) {
        let isAnimated = false;
        if (frame < this.animatedOpacities[0].startFrame) {
            const opacity = this.animatedOpacities[0].fromOpacity;
            if (opacity !== undefined) {
                this.alpha = opacity;
            }
        }
        this.animatedOpacities.some((animData) => {
            if (animData.startFrame === animData.endFrame) {
                return false;
            }
            if (animData.startFrame <= frame && frame <= animData.endFrame) {
                if (animData.toOpacity === undefined)
                    return false;
                if (animData.fromOpacity === undefined)
                    return false;
                const opacityDiff = animData.toOpacity - animData.fromOpacity;
                const totalFrame = animData.endFrame - animData.startFrame;
                const playFrame = (frame - animData.startFrame) * 1.0;
                const playRatio = playFrame / totalFrame;
                const opacityRatio = animData.easing(playRatio);
                const opacity = opacityDiff * opacityRatio + animData.fromOpacity;
                this.alpha = opacity;
                isAnimated = true;
                return true;
            }
            return false;
        });
        if (!isAnimated
            && frame > this.animatedOpacities[this.animatedOpacities.length - 1].endFrame) {
            const opacity = this.animatedOpacities[this.animatedOpacities.length - 2]
                .toOpacity;
            if (opacity !== undefined) {
                this.alpha = opacity;
            }
        }
        return isAnimated;
    }
    animatePosition(frame) {
        let isAnimated = false;
        const animation = this.animatedPositions;
        if (frame < animation[0].startFrame) {
            const position = animation[0].fromPosition;
            if (position) {
                this.position = new PIXI.Point(position[0], position[1]);
            }
        }
        animation.some((animData) => {
            if (animData.startFrame === animData.endFrame) {
                return false;
            }
            if (animData.startFrame <= frame && frame <= animData.endFrame) {
                if (animData.toPosition === undefined)
                    return false;
                if (animData.fromPosition === undefined)
                    return false;
                const posDiffX = animData.toPosition[0] - animData.fromPosition[0];
                const posDiffY = animData.toPosition[1] - animData.fromPosition[1];
                const totalFrame = animData.endFrame - animData.startFrame;
                const playFrame = (frame - animData.startFrame) * 1.0;
                const playRatio = playFrame / totalFrame;
                const posRatio = animData.easing(playRatio);
                const posX = posDiffX * posRatio;
                const posY = posDiffY * posRatio;
                this.x = animData.fromPosition[0] + posX;
                this.y = animData.fromPosition[1] + posY;
                isAnimated = true;
                return true;
            }
            return false;
        });
        if (!isAnimated && frame > animation[animation.length - 1].endFrame) {
            const position = animation[animation.length - 2].toPosition;
            if (position) {
                this.position = new PIXI.Point(position[0], position[1]);
            }
        }
        return isAnimated;
    }
    animateSeparatedPosition(frame) {
        const animation = this.animatedPositions;
        const animatedPositionX = animation.x;
        const animatedPositionY = animation.y;
        if (frame < animatedPositionX[0].startFrame) {
            this.x = animatedPositionX[0].fromPosition || 0;
        }
        if (frame < animatedPositionY[0].startFrame) {
            this.y = animatedPositionY[0].fromPosition || 0;
        }
        animatedPositionX.some((animData) => {
            if (animData.startFrame === animData.endFrame) {
                return false;
            }
            if (animData.startFrame <= frame && frame <= animData.endFrame) {
                if (animData.toPosition === undefined)
                    return false;
                if (animData.fromPosition === undefined)
                    return false;
                const posDiff = animData.toPosition - animData.fromPosition;
                const totalFrame = animData.endFrame - animData.startFrame;
                const playFrame = (frame - animData.startFrame) * 1.0;
                const playRatio = playFrame / totalFrame;
                const posRatio = animData.easing(playRatio);
                this.x = posDiff * posRatio + animData.fromPosition;
                return true;
            }
            return false;
        });
        animatedPositionY.some((animData) => {
            if (animData.startFrame === animData.endFrame) {
                return false;
            }
            if (animData.startFrame <= frame && frame <= animData.endFrame) {
                if (animData.toPosition === undefined)
                    return false;
                if (animData.fromPosition === undefined)
                    return false;
                const posDiff = animData.toPosition - animData.fromPosition;
                const totalFrame = animData.endFrame - animData.startFrame;
                const playFrame = (frame - animData.startFrame) * 1.0;
                const playRatio = playFrame / totalFrame;
                const posRatio = animData.easing(playRatio);
                this.y = posDiff * posRatio + animData.fromPosition;
                return true;
            }
            return false;
        });
        if (frame > animatedPositionX[animatedPositionX.length - 1].endFrame) {
            const x = animatedPositionX[animatedPositionX.length - 2].toPosition;
            const y = animatedPositionY[animatedPositionY.length - 2].toPosition;
            this.position = new PIXI.Point(x, y);
        }
    }
    animateRotation(frame) {
        let isAnimated = false;
        if (frame < this.animatedRotations[0].startFrame) {
            const rotation = this.animatedRotations[0].fromRotation;
            if (rotation !== undefined) {
                this.rotation = rotation;
            }
        }
        this.animatedRotations.some((animData) => {
            if (animData.startFrame === animData.endFrame) {
                return false;
            }
            if (animData.startFrame <= frame && frame <= animData.endFrame) {
                if (animData.toRotation === undefined)
                    return false;
                if (animData.fromRotation === undefined)
                    return false;
                const rotDiff = animData.toRotation - animData.fromRotation;
                const totalFrame = animData.endFrame - animData.startFrame;
                const playFrame = (frame - animData.startFrame) * 1.0;
                const playRatio = playFrame / totalFrame;
                const rotRatio = animData.easing(playRatio);
                this.rotation = rotDiff * rotRatio + animData.fromRotation;
                isAnimated = true;
                return true;
            }
            return false;
        });
        if (!isAnimated
            && frame > this.animatedRotations[this.animatedRotations.length - 1].endFrame) {
            const rotation = this.animatedRotations[this.animatedRotations.length - 2]
                .toRotation;
            if (rotation !== undefined) {
                this.rotation = rotation;
            }
        }
        return isAnimated;
    }
    animateScale(frame) {
        let isAnimated = false;
        if (frame < this.animatedScales[0].startFrame) {
            const scale = this.animatedScales[0].fromScale;
            if (scale !== undefined) {
                this.scale = new PIXI.Point(scale[0] / 100.0, scale[1] / 100.0);
            }
        }
        this.animatedScales.some((animData) => {
            if (animData.startFrame === animData.endFrame) {
                return false;
            }
            if (animData.startFrame <= frame && frame <= animData.endFrame) {
                if (animData.toScale === undefined)
                    return false;
                if (animData.fromScale === undefined)
                    return false;
                const scaleDiffX = animData.toScale[0] - animData.fromScale[0];
                const scaleDiffY = animData.toScale[1] - animData.fromScale[1];
                const totalFrame = animData.endFrame - animData.startFrame;
                const playFrame = (frame - animData.startFrame) * 1.0;
                const playRatio = playFrame / totalFrame;
                const scaleRatio = animData.easing(playRatio);
                const scaleX = scaleDiffX * scaleRatio + animData.fromScale[0];
                const scaleY = scaleDiffY * scaleRatio + animData.fromScale[1];
                this.scaleX = scaleX / 100.0;
                this.scaleY = scaleY / 100.0;
                this.scale = new PIXI.Point(this.scaleX, this.scaleY);
                isAnimated = true;
                return true;
            }
            return false;
        });
        if (!isAnimated
            && frame > this.animatedScales[this.animatedScales.length - 1].endFrame) {
            const scale = this.animatedScales[this.animatedScales.length - 2].toScale;
            if (scale !== undefined) {
                this.scale = new PIXI.Point(scale[0] / 100.0, scale[1] / 100.0);
            }
        }
        return isAnimated;
    }
    hasAnimateProperty() {
        return (this.hasAnimatedAnchorPoint
            || this.hasAnimatedOpacity
            || this.hasAnimatedPosition
            || this.hasAnimatedRotation
            || this.hasAnimatedScale
            || this.hasAnimatedSeparatedPosition);
    }
    update(nowTime) {
        if (!this.player)
            return;
        this.player.update(nowTime);
    }
    updateByDelta(deltaTime) {
        if (!this.deltaPlayer)
            return;
        this.deltaPlayer.update(deltaTime);
    }
    // called from self player
    updateWithFrameBySelfPlayer(frame) {
        this.__updateWithFrame(frame);
    }
    // called from parent layer. if self player is playing, stop it.
    updateWithFrame(frame) {
        if (this.player && this.player.isPlaying) {
            this.player.stop();
        }
        if (this.deltaPlayer && this.deltaPlayer.isPlaying) {
            this.deltaPlayer.stop();
        }
        this.__updateWithFrame(frame);
    }
    __updateWithFrame(frame) {
        if (this.inFrame <= frame && frame <= this.outFrame) {
            this.visible = true;
        }
        else {
            this.visible = false;
        }
        if (!this.visible || !this.hasAnimateProperty()) {
            return true;
        }
        if (this.hasAnimatedAnchorPoint)
            this.animateAnchorPoint(frame);
        if (this.hasAnimatedOpacity)
            this.animateOpacity(frame);
        if (this.hasAnimatedPosition)
            this.animatePosition(frame);
        if (this.hasAnimatedRotation)
            this.animateRotation(frame);
        if (this.hasAnimatedScale)
            this.animateScale(frame);
        if (this.hasAnimatedSeparatedPosition)
            this.animateSeparatedPosition(frame);
        return true;
    }
    play(isLoop) {
        if (this.player) {
            this.player.play(isLoop);
        }
        if (this.deltaPlayer) {
            this.deltaPlayer.play(isLoop);
        }
    }
    pause() {
        if (this.player) {
            this.player.pause();
        }
        if (this.deltaPlayer) {
            this.deltaPlayer.pause();
        }
    }
    resume() {
        if (this.player) {
            this.player.resume();
        }
        if (this.deltaPlayer) {
            this.deltaPlayer.resume();
        }
    }
    stop() {
        if (this.player) {
            this.player.stop();
        }
        if (this.deltaPlayer) {
            this.deltaPlayer.stop();
        }
    }
}
exports.Element = Element;
