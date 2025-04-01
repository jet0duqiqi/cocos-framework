
import GameEvent from "../event/GameEvent";
import Utils from "../../utils/Utils";


const { ccclass, property } = cc._decorator;

@ccclass
export default class BaseUI extends cc.Component {
    events = [];

    // @property({ displayName: "自动注册点击" })
    // addClickEvent: boolean = true;

    // @property({ type: cc.Node, displayName: "需要跳过按钮注册的节点" })
    // skipNode: cc.Node[] = [];

     onBtnClicked(event, customEventData) {

    }

    onLoad() {
        this.events = [];
        // if (this.addClickEvent)

        this.autoBindProperty(this.node, this)
        
        if (this.node.getComponent(cc.Button)) {
            Utils.addClickEvent(this.node, this.node, cc.js.getClassName(this), "onBtnClicked", this.node.getComponent(cc.Button).target);
        }

        this._addClickEvent(this.node);

        // if (this.addClickEvent)
        // console.log(this.node.name)
        this._create_time = Utils.getServerTime();
    }
    public _create_time: number = 0;

    private _findInChildren(node: cc.Node, name: string): cc.Node {
        var x = node.getChildByName(name);
        if (x) return x;
        if (node.childrenCount == 0) return null;

        for (var i = 0; i < node.childrenCount; ++i) {
            var tmp = this._findInChildren(node.children[i], name);
            if (tmp) return tmp;
        }
        return null;
    }

    private m_objects: Map<string, cc.Node> = new Map<string, cc.Node>();


    public GetGameObjectFromCanvas(name: string)
    {
        return cc.find("Canvas").getComponent(BaseUI).GetGameObject(name);
    }
    
    public SetSpriteUrl(name: string, url: string) {
        if (url && url != "") {
            var tmp = this.GetGameObject(name);
            if (tmp) {
                cc.loader.load({ url, type: 'jpg' }, (err, tex) => {
                    if (!err) {
                        if (!cc.isValid(tmp)) return;
                        tmp.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(tex);
                    }
                });
            }
        }
        else {
            if (this.GetSprite(name))
                this.GetSprite(name).spriteFrame = null;
        }
    }

    autoBindProperty(node: cc.Node, context) {
        let name = node.name
        let nameList = name.split('_')
        if (nameList.length > 1) {
            let prex = nameList[0]
            if (prex == 'sp') {
                this[name] = node.getComponent(cc.Sprite);
            } else if (prex == 'txt') {
                this[name] = node.getComponent(cc.Label);
            } else if (prex == 'btn') {
                this[name] = node.getComponent(cc.Button);
                if (this[name]) {
                    var eventHandler = new cc.Component.EventHandler();
                    eventHandler.target = this.node;
                    eventHandler.component = cc.js.getClassName(context);
                    eventHandler.handler = "onBtnClicked";
                    eventHandler.customEventData = name;

                    var clickEvents = node.getComponent(cc.Button).clickEvents;
                    clickEvents.push(eventHandler);
                }
            } else if (prex == 'progress' || prex == "bar") {
                this[name] = node.getComponent(cc.ProgressBar);
            } else if (prex == 'sv' || prex == "scrollview" || prex == "scrollView" || prex == "scroll") {
                this[name] = node.getComponent(cc.ScrollView);
            } else if (prex == 'skel' || prex == 'spine') {
                this[name] = node.getComponent(sp.Skeleton);
            } else if (prex == 'page') {
                this[name] = node.getComponent(cc.PageView);

            } else if (prex == 'node') {
                this[name] = node
            } else if (prex == 'toggle') {
                this[name] = node.getComponent(cc.Toggle)
            } else if (prex == 'toggleContainer') {
                this[name] = node.getComponent(cc.ToggleContainer)
            } else if (prex == 'rich') {
                this[name] = node.getComponent(cc.RichText)
            } else if (prex == 'edit') {
                this[name] = node.getComponent(cc.EditBox)
            } else if (prex == 'layout') {
                this[name] = node.getComponent(cc.Layout)
            }
        } else {
            // this[name] = node
        }
        if (node.childrenCount == 0) return
        for (var i = 0; i < node.childrenCount; ++i) {
            var tmp = node.children[i]
            this.autoBindProperty(tmp, context)
        }
    }


    public GetGameObject(name: string, refind: boolean = false): cc.Node {
        if (!cc.isValid(this.node)) return null;
        if (!refind) {
            if (this.m_objects && this.m_objects.has(name)) return this.m_objects[name];
            if (name == this.node.name) return this.node;
        }

        if (name.indexOf("/") != -1) {
            var tmp = cc.find(name, this.node);
            if (tmp) this.m_objects[name] = tmp;
            return tmp;
        }
        else {
            var tmp = this._findInChildren(this.node, name);
            if (tmp) this.m_objects[name] = tmp;
            return tmp;
        }
    }

    public GetSkeleton(name: string): sp.Skeleton {
        if (this.m_objects && this.m_objects.has(name)) return this.m_objects[name].getComponent(sp.Skeleton);
        var tmp = this.GetGameObject(name);
        if (tmp) return tmp.getComponent(sp.Skeleton);
        return null;
    }

    public GetSprite(name: string): cc.Sprite {
        if (this.m_objects && this.m_objects.has(name)) return this.m_objects[name].getComponent(cc.Sprite);
        var tmp = this.GetGameObject(name);
        if (tmp) return tmp.getComponent(cc.Sprite);
        return null;
    }

    public async SetSprite(name: string, filepath: string) {
        return new Promise((resolve, reject) => {
            var tmp = this.GetSprite(name);
            if (tmp) {
                Utils.loadRes(filepath, cc.SpriteFrame).then((ret: cc.SpriteFrame) => {
                    if (cc.isValid(this.node)) {
                        tmp.spriteFrame = ret;
                        resolve(ret)
                    }
                })
            }
        })
    }

    public GetText(name: string): cc.Label {
        if (this.m_objects && this.m_objects.has(name)) return this.m_objects[name].getComponent(cc.Label);
        var tmp = this.GetGameObject(name);
        if (tmp) return tmp.getComponent(cc.Label);
        return null;
    }

    public GetProgressBar(name: string): cc.ProgressBar {
        if (this.m_objects && this.m_objects.has(name)) return this.m_objects[name].getComponent(cc.ProgressBar);
        var tmp = this.GetGameObject(name);
        if (tmp) return tmp.getComponent(cc.ProgressBar);
        return null;
    }

    public GetButton(name: string): cc.Button {
        if (this.m_objects && this.m_objects.has(name)) return this.m_objects[name].getComponent(cc.Button);
        var tmp = this.GetGameObject(name);
        if (tmp) return tmp.getComponent(cc.Button);
        return null;
    }

    public GetInputField(name: string): cc.EditBox {
        if (this.m_objects && this.m_objects.has(name)) return this.m_objects[name].getComponent(cc.EditBox);
        var tmp = this.GetGameObject(name);
        if (tmp) return tmp.getComponent(cc.EditBox);
        return null;
    }

    public GetSlider(name: string): cc.Slider {
        if (this.m_objects && this.m_objects.has(name)) return this.m_objects[name].getComponent(cc.Slider);
        var tmp = this.GetGameObject(name);
        if (tmp) return tmp.getComponent(cc.Slider);
        return null;
    }

    public SetText(TextID: string, content: string) {
        if (this.GetText(TextID))
            this.GetText(TextID).string = content;
    }

    public SetInputText(TextID: string, content: string) {
        if (this.GetInputField(TextID))
            this.GetInputField(TextID).string = content;
    }

    public SetProgressBar(TextID: string, p: number) {
        if (this.GetProgressBar(TextID))
            this.GetProgressBar(TextID).progress = p;
    }

    _isSkipNode(node: cc.Node): boolean {
        if (this.node == node) {
            return false;
        }
        let b = node.getComponent(BaseUI);
        return b != null;
    }

    _addClickEvent(node) {
        if (this._isSkipNode(node)) return;
        for (var i = 0; i < node.childrenCount; ++i) {
            var tmp = node.children[i];
            if (this._isSkipNode(tmp)) continue;
            if (tmp.getComponent(cc.Button)) {
                Utils.addClickEvent(tmp, this.node, cc.js.getClassName(this), "onBtnClicked", tmp.getComponent(cc.Button).target);
            }
            this._addClickEvent(tmp);
        }
    }

    getChildByName(path, node) {
        return cc.find(path, node || this.node);
    }

    onDestroy() {
        for (var i = 0; i < this.events.length; ++i)
            GameEvent.Instance().unregister(this, this.events[i]);
    }

    register(type: string, callFunc: Function) {
        this.events.push(type);
        GameEvent.Instance().register(this, type, callFunc);
    }
    unregister(type: string) {
        GameEvent.Instance().unregister(this, type);
    }

    dispatch(type: string, ...data) {
        GameEvent.Instance().dispatch(type, ...data);
    }

    async playSkAni(file: string, name: string, parent: cc.Node, pos: cc.Vec2, removetime: number = -1) {
        var node = new cc.Node();
        node.parent = parent;
        node.position = pos;
        var skd = node.addComponent(sp.Skeleton);

        var data = await Utils.loadRes(file, sp.SkeletonData) as sp.SkeletonData;
        skd.skeletonData = data;
        skd.premultipliedAlpha = false;
        skd.setAnimation(0, name, false);
        if (removetime != -1) {
            node.runAction(cc.sequence(cc.delayTime(removetime), cc.callFunc(() => {
                node.parent = null;
            })))
        }
        return node;
    }
}