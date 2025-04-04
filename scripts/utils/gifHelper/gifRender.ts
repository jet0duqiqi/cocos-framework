import { _decorator, Component, ImageAsset, Sprite, SpriteFrame, assetManager, resources } from 'cc';
import { parseGIF, decompressFrames } from './gif';
const { ccclass, property, requireComponent } = _decorator;

function createCanvas() {
    if(globalThis.tt && globalThis.tt.createCanvas) {
        return globalThis.tt.createCanvas()
    }
    if(globalThis.wx && globalThis.wx.createCanvas) {
        return globalThis.wx.createCanvas()
    }
    if(document && document.createElement) {
        return document.createElement("canvas");
    }
    return null
}

/**
 * 从指定资源地址获取arraybuffer
 * @param url 资源地址，可以是远程地址，也可以是本地 resources 目录中的资源
 */
function getArrayBuffer(url: string): Promise<ArrayBuffer | null> {
    if(!url) {
        return Promise.resolve(null);
    }
    if(/^https?:\/\//i.test(url) || /^\//.test(url)) {
        return getArrayBufferFromRemote(url)
    }
    return new Promise(resolve => {
        // 资源地址不能包含后缀，需要删除文件后缀
        resources.load(url.replace(/\.gif$/i, ""), function(error, asset) {
            if(error) {
                return resolve(null)
            }
            getArrayBufferFromRemote(asset.nativeUrl).then(resolve);
        })
    })
}

/**
 * 从远程资源获取arraybuffer数据
 * @param url 远程资源地址
 */
function getArrayBufferFromRemote(url: string): Promise<ArrayBuffer | null> {
    return new Promise(function (resolve) {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                resolve(xhr.response);
            }
        };
        xhr.onerror = function (err) {
            console.error("xhr error", err);
            resolve(null)
        };
        xhr.send(null);
        setTimeout(function () {
            resolve(null)
        }, 10 * 10000);
    })
}

/**
 * 从指定的资源地址获取图片精灵对象
 * @param url 资源地址，可以是远程地址，也可以是本地 resources 目录中的资源
 */
function getImageSpirteFrame(url: string): Promise<SpriteFrame | null> {
    if(!url) {
        return Promise.resolve(null);
    }
    if(/^https?:\/\//i.test(url) || /^\//.test(url)) {
        return new Promise(function(resolve) {
            assetManager.loadRemote(url, function(error, asset: ImageAsset) {
                resolve(error ? null : SpriteFrame.createWithImage(asset))
            })
        })
    }
    return new Promise(resolve => {
        // 资源地址不能包含后缀，需要删除文件后缀
        resources.load(url.replace(/\.(?:gif|png|jpg|webp|jpeg)$/i, ""), ImageAsset, function(error, asset) {
            resolve(error ? null : SpriteFrame.createWithImage(asset))
        })
    })
}

interface IFrameConfig {
    delay: number,
    disposalType: number,
    dims: { left: number, top: number, width: number, height: number },
    patch: ArrayLike<number>,
    transparentIndex?: number,
}
interface IGifCacheItem {
    refs: string[],
    frames: IFrameConfig[]
}
const gifDataCache: {
    [url: string]: IGifCacheItem
} = {};

@ccclass('gifRender')
@requireComponent(Sprite)
export class gifRender extends Component {
    private _url: string = "";
    private _sprite: Sprite = null;
    private _mainCavas = null;
    private _mainCtx = null;
    private _tmpCavas = null;
    private _tmpCtx = null;

    @property({
        displayName: "图片资源",
        tooltip: "如果是远程地址，则需要 http:// 或者 https:// 开头\n否则从本地 assets/resources 中寻找"
    })
    public initUrl: string = "";

    // 如果是动态修改url地址，可以修改设置 url 属性即可
    public get url() {
        return this._url
    }
    public set url(value: string) {
        if(this._url === value) {
            return
        }
        if(this._url) {
            this.releaseURL(this._url);
        }
        this._url = value;
        this._renderImage()
    }

    onLoad() {
        this._url = this._url || this.initUrl;
        this._sprite = this.node.getComponent(Sprite);

        this._mainCavas = createCanvas();
        this._tmpCavas = createCanvas();
        if(!this._mainCavas) {
            console.error("[gifRender] init canvas error")
            return
        }
        this._mainCtx = this._mainCavas.getContext('2d');
        this._tmpCtx = this._tmpCavas.getContext("2d");
    }

    onEnable() {
        this._renderImage()
    }

    onDisable() {
        this.unscheduleAllCallbacks()
    }

    onDestroy() {
        this.releaseURL(this._url)
    }

    private async _prepareCacheData(): Promise<void> {
        const cachedData = gifDataCache[this._url];
        if(cachedData) {
            return
        }
        const arrayBuffer = await getArrayBuffer(this._url);
        if(!arrayBuffer) {
            return
        }
        let frames = []
        try {
            frames = decompressFrames(parseGIF(arrayBuffer), true);
        }catch(e) {
            console.error("[gifRender] read gif frame error", e);
            return
        }
        if(frames.length === 0) {
            return
        }
        gifDataCache[this._url] = {
            refs: [],
            frames
        }
    }

    private async _renderImage() {
        if(!this._sprite) {
            return
        }
        this.unscheduleAllCallbacks();
        if(!this._url) {
            this._sprite.spriteFrame = null;
            return
        }
        if(!this._mainCavas) {
            this._renderAsNormalImage()
            return
        }
        console.log("[gifRender] render image:", this._url)
        await this._prepareCacheData();
        const cache = gifDataCache[this._url]
        if(!cache) {
            this._renderAsNormalImage()
            return
        }
        // 至此，所有准备数据有了，准备绘制
        this._needsDisposal = true;
        this._frameIndex = 0;
        this._frameWidth = 9999;
        this._frameHeight = 9999;
        this._frameData = null;
        this._mainCavas.width = cache.frames[0].dims.width;
        this._mainCavas.height = cache.frames[0].dims.height;
        // 检查引用信息
        if(cache.refs.indexOf(this.uuid) < 0) {
            cache.refs.push(this.uuid)
        }
        // 开始绘制
        this._draw()
    }

    private releaseURL(url: string) {
        const cache = gifDataCache[url];
        if(!cache) {
            return
        }
        const idx = cache.refs.indexOf(url)
        if(idx >= 0) {
            cache.refs.splice(idx, 1)
        }
        if(cache.refs.length === 0) {
            delete gifDataCache[url]
        }
    }

    private _status = "init"
   
    private _needsDisposal = false;
    private _frameIndex = 0;
    private _frameWidth = 0;
    private _frameHeight = 0;
    private _frameData:ImageData = null;
    private _draw() {
        const cache = gifDataCache[this._url];
        const frame = cache.frames[this._frameIndex];
        const start = Date.now();
        if(this._needsDisposal) {
            this._mainCtx.clearRect(0, 0, this._frameWidth, this._frameHeight);
            this._needsDisposal = false;
        }

        const dims = frame.dims;
        if(!this._frameData || dims.width !== this._frameData.width || dims.height !== this._frameData.height) {
            this._tmpCavas.width = dims.width;
            this._tmpCavas.height = dims.height;
            this._frameData = this._mainCtx.createImageData(dims.width, dims.height);
        }
        this._frameData.data.set(frame.patch);
        this._tmpCtx.putImageData(this._frameData, 0, 0);
        this._mainCtx.drawImage(this._tmpCavas, dims.left, dims.top);

        this._frameIndex ++;
        if (this._frameIndex >= cache.frames.length) {
            this._frameIndex = 0
        }
        if (frame.disposalType === 2) {
            this._needsDisposal = true
        }

        this._sprite.spriteFrame = SpriteFrame.createWithImage(new ImageAsset(this._mainCavas));
        
        const diff = Date.now() - start;
        this.scheduleOnce(() => {
            this._draw()
        }, Math.max(0, Math.floor(frame.delay - diff)) / 1000)
    }

    private async _renderAsNormalImage() {
        this._sprite.spriteFrame = null;
        const sp = await getImageSpirteFrame(this._url);
        this._sprite && (this._sprite.spriteFrame = sp);
    }
}
