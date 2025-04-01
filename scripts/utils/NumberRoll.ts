import BaseUI from "../core/component/BaseUI";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NumberRoll extends BaseUI {

    private label: cc.Label;
    start() {
        this.label = this.node.getComponent(cc.Label);
    }

    private _cur: number = 0;
    private _target: number = 0;

    public prefix:string = "";

    private _offset: number = 0;
    public set vaule(n: number) {
        this._target = n;
        this._offset = Math.floor((this._target - this._cur) / Math.min(30, Math.abs(this._target - this._cur)));
    }

    public set text(str:string)
    {
        this._cur = Number(str)
        this._target = Number(str)
        this.label.string = str;
    }

    update(dt: number) {
        if (this._cur != this._target) {
            this._cur += this._offset;

            if (this._offset > 0 && this._cur > this._target) {
                this._cur = this._target
            }
            if (this._offset < 0 && this._cur < this._target) {
                this._cur = this._target
            }
        }

        this.label.string = this.prefix + this._cur + "";
    }
}