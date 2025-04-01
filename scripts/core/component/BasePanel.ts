import GameConst from "../common/GameConst";
import { Core } from "../Core";
import BaseUI from "./BaseUI";

export default class BasePanel extends BaseUI
{
    layer:number=GameConst.WIN_LAYER.POPUP;
    winType:number=GameConst.WIN_TYPE.NORMAL;
    
    destroyAfterClose:boolean=false//关闭后销毁资源
    
    public show(data:any)
    {
    }

    public close()
    {
       Core.winManager.removeWin(this.node.name)
    }

    onBtnClicked(event, customEventData) {
        var btnName = event.target.name;
        switch (btnName) {
            case "btn_close":
                this.close();
                break;
        }
    }
}