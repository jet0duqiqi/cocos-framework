import { Core } from "./core/Core";
/**
 * 游戏入口
 */
const {ccclass, property} = cc._decorator;

// cc.dynamicAtlasManager.enabled=true
// cc.macro.CLEANUP_IMAGE_CACHE =false
@ccclass
export default class GameEntry extends cc.Component {

    @property(cc.Node)
    container: cc.Node = null;

     onLoad()
     {
         Core.init(this.node)  
         Core.soundManager.loadSounds()    
         Core.winManager.register(this.container)
     }

    start () {
        // Core.winManager.open('LoadingWin')
    }
}
