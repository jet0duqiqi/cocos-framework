
/**
 * 自定义帧动画 chenbo
 */
const { ccclass, property } = cc._decorator;

@ccclass
export class FrameAnimation extends cc.Component {
    /**播放速率*/
    protected _frameRate: number=60;
    /**是否正在播放*/
    protected _isPlaying: boolean;
    protected _currentFrame: number;
    protected _startFrame: number;
    protected _endFrame: number;
    protected _totalFrames: number;
    /**循环记数*/
    protected _loopCount: number;
    /**循环次数*/
    protected _loops: number;
    public image: cc.Sprite;
    protected textures: Array<cc.SpriteFrame>;
    public static UPDATE: string = "update";
    public static COMPLETE: string = "complete";

    private static cacheAnimations = {}

    onLoad() {
        this.image = this.node.getComponent(cc.Sprite)
    }
    static createAnimation(frames, name: string) {
        this.cacheAnimations[name] = frames
    }
    /**
     *开始播放 从1开始
     * 
     */
    public play(startFrame: number, aniName: string, loopCount: number = -1): void {
        // if (!this._isPlaying) {
        this._isPlaying = true;
        this.textures = FrameAnimation.cacheAnimations[aniName]
        if (this.textures == null) {
            cc.warn('找不到动画' + aniName)
            this._isPlaying = false
            return
        }
        this._currentFrame = this._startFrame = startFrame
        this._totalFrames = this.textures.length
        this._loops = loopCount
        this._loopCount = 0
        this.animate()
        this.unscheduleAllCallbacks()
        this.schedule(this.onTimer.bind(this), 1 / this._frameRate)
        // }
    }

    /**
     *停止播放 
     * 
     */
    public stop(): void {
        if (this._isPlaying) {
            this._isPlaying = false;
            this.unscheduleAllCallbacks()
            this._loopCount = 0;
        }
    }


    /**
     *跳转到帧停止播放 
     * @param frame
     * 
     */
    public gotoAndStop(frame: number): void {
        this.goto(frame);
        this.stop();
    }
    /**
     *跳转到帧
     * @param frame 帧
     * 
     */
    protected goto(f: number): void {
        if (f < this._startFrame)
            f = this._startFrame;
        else if (f > this._endFrame)
            f = this._endFrame;
        this._currentFrame = f;

        this.animate();
    }
    /**
     *设置bitmapdata 
     * 
     */
    protected animate(): void {

        if (this.textures && this.image && this.image.spriteFrame != this.textures[this._currentFrame - 1]) {
            this.image.spriteFrame = this.textures[this._currentFrame - 1];
            this.node.emit(FrameAnimation.UPDATE)
        }
    }
    /**
     *播放头下移一帧 
     * 
     */
    public nextFrame(): void {
        this.stop();
        this.goto(this._currentFrame + 1);
    }

    /**
     *播放头后退一帧 
     * 
     */
    public prevFrame(): void {
        this.stop();
        this.goto(this._currentFrame - 1);
    }
    /**
     *timer处理 
     * @param e
     * 
     */
    public onTimer(): void {
        this._currentFrame++;
        if (this._currentFrame > this._totalFrames) {
            this._loopCount++;
            if (this._loopCount == this._loops && this._loops > 0) {
                this.node.emit(FrameAnimation.COMPLETE)
                this.stop();
                return;
            }
            this._currentFrame = this._startFrame;
        }
        this.animate();
    }

    /**
     *是否正在播放动画 
     * @return 
     * 
     */
    public isPlaying(): boolean {
        return this._isPlaying;
    }


    /**
     *播放帧频 
     * @return 
     * 
     */
    public get frameRate(): number {
        return this._frameRate;
    }
    @property()
    public set frameRate(value: number) {
        if (value > 0) {
            this._frameRate = value;
        }
    }

}
