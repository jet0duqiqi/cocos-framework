import BigNumber from "./BigNumber";
import { Shake } from "./Shake";
export default class Utils {

    //检查是否同一天
    public static checkIsToDay(time:number): boolean {

        var date = new Date(time);
        var dateNow = new Date(Utils.getServerTime());
        let bSameDay = false;

        if (date.getFullYear() == dateNow.getFullYear() &&
            date.getMonth() == dateNow.getMonth() &&
            date.getDate() == dateNow.getDate()
        ) {
            bSameDay = true;
        }
        return bSameDay;
    }

    
    static createPrefab(filepath: string, parent: cc.Node = null, callback: Function = null, pos: cc.Vec2 = null) {
        return new Promise((resolve, reject) => {
            Utils.loadRes(filepath, cc.Prefab, (err, ret) => {
                if (err) {
                    console.error(err)
                    reject();
                    return;
                }

                if (parent == null) {
                    parent = cc.find("Canvas")
                }

                var tmp: cc.Node = cc.instantiate(ret);
                tmp.opacity = 0;
                tmp.runAction(cc.sequence(cc.delayTime(0.01), cc.callFunc(() => {
                    tmp.opacity = 255;
                })))
                tmp.parent = parent;
                if (pos) {
                    tmp.position = pos;
                }
                if (callback) callback(tmp);
                
                resolve(tmp);
            })
        })
    }


    public static getRandom(lower, upper): number {
        return Math.random() * (upper - lower) + lower;
    };

    public static getRandomInt(lower, upper): number {
        return Math.floor(Math.random() * (upper - lower)) + lower;
    };

    public static seed: number = 5;

    public static seedRandom(): number {
        return Utils.getRandom(0, 1);
        // this.seed = (this.seed * 9301 + 49297) % 233280;
        // return this.seed / 233280.0;
    }

    public static seedRandomInt(lower, upper): number {
        return Utils.getRandomInt(lower, upper);
        // return Math.floor(Utils.seedRandom() * (upper - lower)) + lower;
    }

    private static rnd(seed) {
        seed = (seed * 9301 + 49297) % 233280; //为何使用这三个数?
        return seed / (233280.0);
    };

    public static formatNumber(num: number, afterdot: number = 1) {
        num = Math.floor(num);
        return BigNumber.getLargeString(num);
    };
    public static getPowNum(p) {
        return Math.pow(10, p);
    };

    public static setServerTime(time: number) {
        Utils.timeOffset = time - new Date().getTime();
        cc.log("timeOffset:", Utils.timeOffset)
    }

    public static timeOffset: number = 0;
    public static getServerTime() {
        return new Date().getTime() + Utils.timeOffset;
    }

    public static Shake(duration: number, strength_x: number, strength_y: number) {
        let camera = cc.find("Canvas/Main Camera");
        camera.x = 0;
        camera.y = 0;
        camera.stopAllActions();
        camera.runAction(Shake.create(duration, strength_x, strength_y));
    }

    public static addClickEvent(node, target, component, handler, customEventData) {
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;               
        if (customEventData) eventHandler.customEventData = customEventData;

        var clickEvents = node.getComponent(cc.Button).clickEvents;
        if (clickEvents.length > 0) {
           // if (!CC_EDITOR)
                //cc.warn("按钮已经存在绑定，跳过自动绑定", node.name);
            return;
        }
        // console.log(node.name,target.name,component)
        clickEvents.push(eventHandler);
    }

    static formatDate(t) {
        var date = new Date(t);
        var YY = date.getFullYear() + '-';
        var MM = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
        var DD = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate());
        var hh = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
        var mm = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
        var ss = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
        return YY + MM + DD + " " + hh + mm + ss;
    }

    public static cloneObj(obj: any) {
        obj = JSON.stringify(obj);
        obj = JSON.parse(obj);
        return obj;
    }

    public static getTimeStrByS(second: number) {
        second = Math.floor(second);
        if (second < 0) second = 0;
        var d = Math.floor(second / 3600 / 24);
        second -= d * 3600 * 24;
        var h = Math.floor(second / 3600);
        second -= h * 3600;
        var m = Math.floor(second / 60);
        second -= m * 60;
        var front = "00";
        if (h > 9) {
            front = "" + h;
        } else {
            front = "0" + h;
        }
        var mid = "00";
        if (m > 9) {
            mid = "" + m;
        } else {
            mid = "0" + m;
        }
        var back = "00";
        if (second > 9) {
            back = "" + second;
        } else {
            back = "0" + second;
        }

        if (d > 0) {
            return d + "天" + h + "时" + m + "分";
        }
        else {
            var longTime = h > 0;
            if (longTime) {
                return front + ":" + mid ;
            } else {
                return mid + ":" + back ;//+ '秒';
            }
        }
    }

    public static getClockStrByS(second: number,showsecond:boolean = true,showhour:boolean = true) {
        second = Math.floor(second);
        if (second < 0) second = 0;
        var h = Math.floor(second / 3600);
        second -= h * 3600;
        var m = Math.floor(second / 60);
        second -= m * 60;
        var front = "00";
        if (h > 9) {
            front = "" + h;
        } else {
            front = "0" + h;
        }
        var mid = "00";
        if (m > 9) {
            mid = "" + m;
        } else {
            mid = "0" + m;
        }

        let str = ""
        if(showhour)
        {
            str += front;
            str += ":" 
        }
        str += mid;
    
        if(showsecond)
            str += ":" + (second<10?"0":"")+second;

            return str
    }

    public static checkObjEmpty(obj: any) {
        if (obj) {
            for (var i in obj) {
                return false;
            }
            return true;
        } else {
            return true;
        }
    }

    public static checkOrderOver(orderTime: number) {
        var date = new Date(orderTime);
        var dateNow = new Date(Utils.getServerTime());

        if (date.getFullYear() == dateNow.getFullYear() &&
            date.getMonth() == dateNow.getMonth() &&
            date.getDate() == dateNow.getDate()
        ) {
            return false;
        } else {
            return true;
        }
    }





    public static loadRes(path: string, type: typeof cc.Asset,callback:Function=null) {
        return new Promise((resolve, reject) => {
         

            let ret = cc.resources.get(path,type);
            if(ret)
            {
                if(callback)
                    callback(null,ret);
                resolve(ret);
                return;
            }

            // console.log(bundel,path);
            cc.resources.load(path,type,(err,ret)=>{
                if (err) {
                    cc.error(path, err);
                    callback(err,null);
                    reject(null);
                }
                else {
                    if(callback)
                        callback(null,ret);
                    resolve(ret);
                }
            });
        })
    }

    public static weight(v: number[]): number {
        var mTotalWeight = 0;
        for (var i = 0; i < v.length; ++i) {
            mTotalWeight += v[i];
        }
        if (mTotalWeight <= 0) return -1;
        var randnum = Math.round(Math.random() * Number.MAX_VALUE) % mTotalWeight;
        for (var i = 0; i < v.length; ++i) {
            if (randnum < v[i]) {
                return i;
            }
            else {
                randnum -= v[i];
            }
        }
        return -1;
    }

    public static shuffle(arr) {
        for (let i = arr.length - 1; i >= 0; i--) {
            let rIndex = Math.floor(Math.random() * (i + 1));
            let temp = arr[rIndex];
            arr[rIndex] = arr[i];
            arr[i] = temp;
        }
        return arr;
    }

    public static getDate(time: number): string {
        var now = new Date(time),
            y = now.getFullYear(),
            m = now.getMonth() + 1,
            d = now.getDate();
        return y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d) + " " + now.toTimeString().substr(0, 8);
    }

    //货币进位
    public static goldCrarryBit(gold: number): string {

        var array = [
            [100000000, 'N'],
            [10000000, 'T'],
            [1000000, 'G'],
            [100000, 'M'],
            [10000, 'K'],
            [1000, 'B'],
        ];
        for (var i = 0; i < array.length; i++) {
            var value = gold / (array[i][0] as number);
            if (value > 1) {
                return '' + value.toFixed(1) + array[i][1];
            }
        }
        return gold.toString();
    }
    //定点数
    public static fixFloat(val: number, count: number = 2) {
        var a =Math.pow(10,count)
        return Math.floor(val * a) / a;
    }

    //     this.initPool("basechip", ret, 10);
    //     this.initPool("dianchi", ret, 10);
    //     this.initPool("enery", ret, 10);
    //     this.initPool("gem", ret, 10);

    

    static formatString(s: string, ...arg) {

        for (var i = 0; i < arg.length; i++) {
            var reg = new RegExp("\\{" + i + "\\}", "gm");
            s = s.replace(reg, arg[i]);
        }
        return s;
    }
    static convetOtherNodeSpaceAR(sourceNode:cc.Node, targetNode:cc.Node)
    {
      //  if(!sourceNode)
       //     debugger;
        var worldP:cc.Vec2=sourceNode.convertToWorldSpaceAR(cc.v2(0,0))        
        return targetNode.convertToNodeSpaceAR(worldP)
    }
    static count(obj) {
        if (!obj) return 0;
        var num = 0;
        for (var k in obj) {
            num++;
        }
        return num;
    };
    static copy(obj) {
        var newObj = Object.create(obj);
        Object.assign(newObj, obj);
        return newObj;
    }
    static setGray(icon:cc.Sprite, isGray:boolean) {
        if (isGray) {
            icon.setMaterial(0, cc.Material.getBuiltinMaterial('2d-gray-sprite'));
        } else {
            icon.setMaterial(0, cc.Material.getBuiltinMaterial('2d-sprite'));
        }
    }
    static setSpriteFrame(sp:cc.Sprite,path:string,bundle:string='resources',callback=null):void
    {
        let loader=cc.assetManager.getBundle(bundle)
        loader.load(path,cc.SpriteFrame,(error,assets:cc.SpriteFrame)=>
        {
            if(error)
            {
                cc.log('error',path)
                return
            }
            sp.spriteFrame=assets
            callback&&callback()
        })
    }
   
};