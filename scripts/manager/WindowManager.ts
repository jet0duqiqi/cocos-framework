import Utils from "../utils/Utils";
import GameConst from "../core/common/GameConst";
import BasePanel from "../core/component/BasePanel";

/**
 *窗口管理器
 *chenbo
 */
export default class WindowManager {
    private static instance: WindowManager;
    private _windowContainer: cc.Node;

    private _windows: Array<cc.Node> = []
    private _showlist: Object = {};
    private _prefabMap: Object = {}
    // public static get ins(): WindowManager {
    //     if (!WindowManager.instance) {
    //         WindowManager.instance = new WindowManager();
    //     }
    //     return WindowManager.instance;
    // }


    /**
     * 注册窗口容器
     * @param container 
     */
    public register(container: cc.Node): void {
        this._windowContainer = container
    }

    public open(name: string, showData: any = null, closeOther:Boolean=false,cb: Function = null): void {
      

        if (this._showlist[name]) {
            cb && cb(null);
            return
        }
        this._showlist[name] = true
        let path = GameConst.WinPath[name]
       
        // BusyLoadingManager.ins.addBusy(BUSY_TYPE.RES)
      
      
      
        cc.resources.load(path, cc.Prefab, (err: Error, res: cc.Prefab) => {
            if (err) {
                console.log('加载错误', path)
                this._showlist[name] = false
                cb && cb(null);
                return
            }
            cc.log('2222')
            if (this._showlist[name] == false) {
                cb && cb(null);
                return
            }
            console.log('打开窗口 ', name)
            let win = cc.instantiate(res)
            win.name = name
            win.parent = this._windowContainer;
            this.addWin(win)
            this.sortWins()

            this._prefabMap[path] = res

            let basePanel = win.getComponent(name)
            if (basePanel) {
                basePanel.show(showData)
                // BusyLoadingManager.ins.removeBusy(BUSY_TYPE.RES)
                if(closeOther)
                {
                    this.removeAll([name])
                }
            }

            cb && cb(basePanel);
        })

    }
    private addWin(win: cc.Node): void {
        var winPanel: BasePanel = win.getComponent(win.name)
        var layer: number = winPanel.layer
        var index: number = 0
        for (let i = this._windows.length - 1; i >= 0; i--) {
            let tempWin = this._windows[i]
            let tempWinPanel: BasePanel = tempWin.getComponent(tempWin.name)
            if (tempWinPanel.layer <= layer) {
                index = i + 1
                break
            }
        }
        this._windows.splice(index, 0, win);
    }
    private sortWins(): void {
        var bol: boolean = false
        for (var i = this._windows.length - 1; i >= 0; i--) {
            var win = this._windows[i]
            win.zIndex = i
            var winComp: BasePanel = win.getComponent(BasePanel);
            if (!winComp) {
                debugger;
            }
            if (bol) {
                win.active = false
            } else {
                win.active = true
                bol = winComp.winType == GameConst.WIN_TYPE.FULLSCREEN
            }
        }


    }


    public removeWin(name: string): void {
        if (this._showlist[name]) {
            delete this._showlist[name]
        }
        for (var i = this._windows.length - 1; i >= 0; i--) {
            var win = this._windows[i]
            if (win.name == name) {
                var winComp: BasePanel = win.getComponent(win.name)
                if (winComp.winType != GameConst.WIN_TYPE.PERMANENT) {
                    win.destroy()
                    win = null
                    if (winComp.destroyAfterClose) {
                        //to fix
                        if (this._prefabMap[name])
                            cc.loader.release(this._prefabMap[name])
                    }
                    this._windows.splice(i, 1)
                    break
                }
            }
        }
        this.sortWins()
    }
    public removeAll(exclude: string[] = null) {
        for (var i = this._windows.length - 1; i >= 0; i--) {
            var win = this._windows[i]
            if (exclude && exclude.indexOf(win.name)!=-1)
                continue
            this.removeWin(win.name)

        }
    }

    public isOpen(name: string) {
        // return this._showlist[name] == true;
        return this.getWin(name) != null
    }

    public isShow(name: string) {
        return this._showlist[name] == true;
    }

    public getWinCount() {
        return Utils.count(this._showlist)
    }
    public getWin(name: string) {
        for (var i = this._windows.length - 1; i >= 0; i--) {
            var win = this._windows[i]
            if (win.name == name)
                return win

        }
        return null
    }
    get container() {
        return this._windowContainer
    }


    //大杀器 切场景调用
    public clearAll() {
        this._windows = []
        this._showlist = {};
    }
}