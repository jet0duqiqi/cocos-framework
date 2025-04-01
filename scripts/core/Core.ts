//游戏核心封装
import Timer from "../utils/Timer";
import Dispatcher from "../utils/Dispatcher";
import WindowManager from "../manager/WindowManager";
import AudioMgr from "../utils/AudioMgr";
import PoolManager from "../manager/PoolManager";

export class Core
{
    public static timer:Timer=new Timer()
    public static dispather:Dispatcher=new Dispatcher()
    public static winManager:WindowManager=new WindowManager()
    public static soundManager:AudioMgr=new AudioMgr()
    public static pool:PoolManager=new PoolManager()
    static init(node)
    {
        Core.timer.initSchedule(node.addComponent(cc.Sprite))
    }
}