
const { ccclass, property } = cc._decorator;
@ccclass
export default class PoolManager {

    pools: any = {};

    get(key: string, prefab: cc.Prefab):cc.Node {
        if (this.pools[key] == null) {
            this.pools[key] = new cc.NodePool()
        }
        if (this.pools[key].size() > 0) {
            return this.pools[key].get()
        }
        return cc.instantiate(prefab)

    }
    recover(key: string, node: cc.Node) {
        if (this.pools[key] == null) {
            this.pools[key] = new cc.NodePool()
        }
        this.pools[key].put(node)
    }


}


