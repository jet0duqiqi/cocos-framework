
import Utils from './Utils';
import BaseUI from "../core/component/BaseUI";
const { ccclass, property } = cc._decorator;

class Grid {
    x: number;
    y: number;
    f: number;
    g: number;
    h: number;
    parent: any;
    type: number;

    constructor() {
        this.x = 0;
        this.y = 0;
        this.f = 0;
        this.g = 0;
        this.h = 0;
        this.parent = null;
        this.type = 0; // -1障碍物， 0正常， 1起点， 2目的点
    }

    clear() {
        this.f = 0;
        this.g = 0;
        this.h = 0;
        this.parent = null;
    }
}

enum GridType {
    NONE = 0,
    OBSTACLE = -1,
    START = 1,
    END = 2
}

var TILE_SIZE_WIDTH = 60;
var TILE_SIZE_HEIGHT = 60;


@ccclass
export default class AStar extends BaseUI {

    _gridW: number;
    _gridH: number;
    mapH: number;
    mapW: number;
    is8dir: boolean = false;

    onLoad() {
        super.onLoad();
        var tilemap = this.node.getComponent(cc.TiledMap);
        this._cashpath = {};

        this._gridW = tilemap.getTileSize().width; // 单元格子宽度
        this._gridH = tilemap.getTileSize().height; // 单元格子高度
        this.mapH = tilemap.getMapSize().height; // 纵向格子数量
        this.mapW = tilemap.getMapSize().width; // 横向格子数量
        this.is8dir = false; // 是否8方向寻路
        this.initMap();

    }

    drawPaths = [];

    openList;
    closeList;
    path: Array<cc.Vec2> = [];
    gridsList;

    //设置障碍点
    setMapData(x: number, y: number, bObstacle: boolean) {
        this.gridsList[x][y].type = bObstacle ? GridType.OBSTACLE : GridType.NONE;
    }

    initMap() {
        this.openList = [];
        this.closeList = [];
        this.path = [];
        // 初始化格子二维数组
        this.gridsList = new Array(this.mapW + 1);
        for (let col = 0; col < this.gridsList.length; col++) {
            this.gridsList[col] = new Array(this.mapH + 1);
        }

        for (let col = 0; col <= this.mapW; col++) {
            for (let row = 0; row <= this.mapH; row++) {
                this.addGrid(col, row, GridType.NONE);
            }
        }
    }

    addGrid(x, y, type) {
        let grid = new Grid();
        grid.x = x;
        grid.y = y;
        grid.type = type;
        this.gridsList[x][y] = grid;
    }

    _sortFunc(x, y) {
        return x.f - y.f;
    }

    generatePath(grid: Grid) {
        this.path.push(cc.v2(grid.x, grid.y));
        while (grid.parent) {
            grid = grid.parent;
            this.path.push(cc.v2(grid.x, grid.y));
        }
    }

    _cashpath: {};

    findPath(start: cc.Vec2, end: cc.Vec2) {
        // cc.log("findPath...................")
        this.openList = [];
        this.closeList = [];
        this.path = [];

        var startPos = cc.v2(Math.floor(start.x / TILE_SIZE_WIDTH), Math.floor(start.y / TILE_SIZE_HEIGHT));
        var endPos = cc.v2(Math.floor(end.x / TILE_SIZE_WIDTH), Math.floor(end.y / TILE_SIZE_HEIGHT));

        var key = "sx" + startPos.x + "sy" + startPos.y + "ex" + endPos.x + "ey" + endPos.y;
        if (this._cashpath[key]) {
            this.path = this._cashpath[key];
            // console.log("寻路复用")
            return;
        }

        for (let col = 0; col <= this.mapW; col++) {
            for (let row = 0; row <= this.mapH; row++) {
                this.gridsList[col][row].clear();

                if (this.gridsList[col][row].type == GridType.START ||
                    this.gridsList[col][row].type == GridType.END) {
                    this.gridsList[col][row].type = GridType.NONE;
                }
            }
        }

        this.gridsList[startPos.x][startPos.y].type = GridType.START;
        let startGrid = this.gridsList[startPos.x][startPos.y];
        this.gridsList[endPos.x][endPos.y].type = GridType.END;

        // this.draw(startPos.x, startPos.y, cc.Color.YELLOW);
        // this.draw(endPos.x, endPos.y, cc.Color.BLUE);

        if (startGrid.type == GridType.END) {
            this.path = [cc.v2(startGrid.x, startGrid.y)];
            // cc.log("已经是终点");
            return;
        }

        this.openList.push(startGrid);
        let curGrid = this.openList[0];
        while (this.openList.length > 0 && curGrid.type != GridType.END) {
            // 每次都取出f值最小的节点进行查找
            curGrid = this.openList[0];
            if (curGrid.type == GridType.END) {
                // cc.log("find path success.");
                this.generatePath(curGrid);

                var key = "sx" + startPos.x + "sy" + startPos.y + "ex" + endPos.x + "ey" + endPos.y;
                this._cashpath[key] = JSON.parse(JSON.stringify(this.path));
                return;
            }

            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (i != 0 || j != 0) {
                        let col = curGrid.x + i;
                        let row = curGrid.y + j;
                        if (col >= 0 && row >= 0 && col <= this.mapW && row <= this.mapH &&
                            this.gridsList[col][row].type != -1 &&
                            this.closeList.indexOf(this.gridsList[col][row]) < 0) {
                            if (this.is8dir) {
                                // 8方向 斜向走动时要考虑相邻的是不是障碍物
                                if (this.gridsList[col - i][row].type == -1 || this.gridsList[col][row - j].type == -1) {
                                    continue;
                                }
                            } else {
                                // 四方形行走
                                if (Math.abs(i) == Math.abs(j)) {
                                    continue;
                                }
                            }

                            // 计算g值
                            let g = curGrid.g + Math.sqrt(Math.pow(i * 10, 2) + Math.pow(j * 10, 2));
                            if (this.gridsList[col][row].g == 0 || this.gridsList[col][row].g > g) {
                                this.gridsList[col][row].g = g;
                                // 更新父节点
                                this.gridsList[col][row].parent = curGrid;
                            }
                            // 计算h值 manhattan估算法
                            this.gridsList[col][row].h = Math.abs(endPos.x - col) + Math.abs(endPos.y - row);
                            // 更新f值
                            this.gridsList[col][row].f = this.gridsList[col][row].g + this.gridsList[col][row].h;
                            // 如果不在开放列表里则添加到开放列表里
                            if (this.openList.indexOf(this.gridsList[col][row]) < 0) {
                                this.openList.push(this.gridsList[col][row]);
                            }
                            // // 重新按照f值排序（升序排列)
                            // this.openList.sort(this._sortFunc);
                        }
                    }
                }
            }
            // 遍历完四周节点后把当前节点加入关闭列表
            this.closeList.push(curGrid);
            // 从开放列表把当前节点移除
            this.openList.splice(this.openList.indexOf(curGrid), 1);
            if (this.openList.length <= 0) {
                cc.log("find path failed.");
            }

            // 重新按照f值排序（升序排列)
            this.openList.sort(this._sortFunc);
        }
    }

}

export { Grid };


