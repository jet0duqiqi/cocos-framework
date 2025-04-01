export default class BezierUtil {

    //  对外变量
    private static p0: cc.Vec2;					// 起点
    private static p1: cc.Vec2;					// 贝塞尔点
    private static p2: cc.Vec2;					// 终点
    private static step: number;					// 分割份数

    //  辅助变量
    private static ax: number;
    private static ay: number;
    private static bx: number;
    private static by: number;

    private static A: number;
    private static B: number;
    private static C: number;

    private static total_length: number;			// 长度

    //  =====================================  方法


    //  速度函数
    private static s(t: number): number {
        return Math.sqrt(BezierUtil.A * t * t + BezierUtil.B * t + BezierUtil.C);
    }


    //  长度函数
    private static L(t: number): number {
        var temp1: number = Math.sqrt(BezierUtil.C + t * (BezierUtil.B + BezierUtil.A * t));
        var temp2: number = (2 * BezierUtil.A * t * temp1 + BezierUtil.B * (temp1 - Math.sqrt(BezierUtil.C)));
        var temp3: number = Math.log(BezierUtil.B + 2 * Math.sqrt(BezierUtil.A) * Math.sqrt(BezierUtil.C));
        var temp4: number = Math.log(BezierUtil.B + 2 * BezierUtil.A * t + 2 * Math.sqrt(BezierUtil.A) * temp1);
        var temp5: number = 2 * Math.sqrt(BezierUtil.A) * temp2;
        var temp6: number = (BezierUtil.B * BezierUtil.B - 4 * BezierUtil.A * BezierUtil.C) * (temp3 - temp4);

        return (temp5 + temp6) / (8 * Math.pow(BezierUtil.A, 1.5));
    }


    //  长度函数反函数，使用牛顿切线法求解
    private static InvertL(t: number, l: number): number {
        var t1: number = t;
        var t2: number;
        do {
            t2 = t1 - (BezierUtil.L(t1) - l) / BezierUtil.s(t1);
            if (Math.abs(t1 - t2) < 0.000001) break;
            t1 = t2;
        } while (true);
        return t2;
    }



    //  =====================================  封装


    //  返回所需总步数
    public static init($p0: cc.Vec2, $p1: cc.Vec2, $p2: cc.Vec2, $speed: number): number {
        BezierUtil.p0 = $p0;
        BezierUtil.p1 = $p1;
        BezierUtil.p2 = $p2;
        //step = 30;

        BezierUtil.ax = BezierUtil.p0.x - 2 * BezierUtil.p1.x + BezierUtil.p2.x;
        BezierUtil.ay = BezierUtil.p0.y - 2 * BezierUtil.p1.y + BezierUtil.p2.y;
        BezierUtil.bx = 2 * BezierUtil.p1.x - 2 * BezierUtil.p0.x;
        BezierUtil.by = 2 * BezierUtil.p1.y - 2 * BezierUtil.p0.y;

        BezierUtil.A = 4 * (BezierUtil.ax * BezierUtil.ax + BezierUtil.ay * BezierUtil.ay);
        BezierUtil.B = 4 * (BezierUtil.ax * BezierUtil.bx + BezierUtil.ay * BezierUtil.by);
        BezierUtil.C = BezierUtil.bx * BezierUtil.bx + BezierUtil.by * BezierUtil.by;

        //  计算长度
        BezierUtil.total_length = BezierUtil.L(1);

        //  计算步数
        BezierUtil.step = Math.floor(BezierUtil.total_length / $speed);
        if (BezierUtil.total_length % $speed > $speed / 2) BezierUtil.step++;

        return BezierUtil.step;
    }


    // 根据指定nIndex位置获取锚点：返回坐标和角度
    public static getAnchorPoint(nIndex: number): Array<number> {
        if (nIndex >= 0 && nIndex <= BezierUtil.step) {
            var t: number = nIndex / BezierUtil.step;
            //  如果按照线行增长，此时对应的曲线长度
            var l: number = t * BezierUtil.total_length;
            //  根据L函数的反函数，求得l对应的t值
            t = BezierUtil.InvertL(t, l);

            //  根据贝塞尔曲线函数，求得取得此时的x,y坐标
            var xx: number = (1 - t) * (1 - t) * BezierUtil.p0.x + 2 * (1 - t) * t * BezierUtil.p1.x + t * t * BezierUtil.p2.x;
            var yy: number = (1 - t) * (1 - t) * BezierUtil.p0.y + 2 * (1 - t) * t * BezierUtil.p1.y + t * t * BezierUtil.p2.y;

            //  获取切线
            var Q0: cc.Vec2 = new cc.Vec2((1 - t) * BezierUtil.p0.x + t * BezierUtil.p1.x, (1 - t) * BezierUtil.p0.y + t * BezierUtil.p1.y);
            var Q1: cc.Vec2 = new cc.Vec2((1 - t) * BezierUtil.p1.x + t * BezierUtil.p2.x, (1 - t) * BezierUtil.p1.y + t * BezierUtil.p2.y);

            //  计算角度
            var dx: number = Q1.x - Q0.x;
            var dy: number = Q1.y - Q0.y;
            var radians: number = Math.atan2(dy, dx);
            var degrees: number = radians * 180 / Math.PI;

            return new Array(xx, yy, degrees);
        }
        else {
            return [];
        }
    }

}