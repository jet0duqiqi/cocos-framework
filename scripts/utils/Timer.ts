export class TimerUnit {
    method: Function
    interval: number
    repeatCount: number = -1
    caller: any
    params: any
    currentCount: number = 0
    time: number = 0
}
/**
 * 自定义timer
 * 诚诚工作室
 */
export default class Timer {
    private timerList: TimerUnit[] = []
    private _intervalID: number
    private _pause:boolean=false
    constructor() {

       
    }
    initSchedule(component:cc.Component)
    {
        component.schedule(this.update.bind(this))
    }
    register(interval: number, caller: any, method: Function, repeatCount: number = -1, ...args) {
        let unit = new TimerUnit()
        unit.interval = interval
        unit.caller = caller 
        unit.method = method
        unit.repeatCount = repeatCount
        unit.params = args
        unit.currentCount = 0
        this.timerList.push(unit)
    }
    clear(caller: any, method: Function) {
        for (let i = 0; i < this.timerList.length; i++) {
            let unit = this.timerList[i]
            if (unit.caller == caller && unit.method== method)
            {
                this.timerList.splice(i, 1)
                break
            }
        }
    }
    clearAll(caller: any) {
        for (let i = 0; i < this.timerList.length; i++) {
            let unit = this.timerList[i]
            if (unit.caller == caller) {
                this.timerList.splice(i, 1)
                i--
            }
        }
    }
    update(dt: number) {
        if(this._pause)return
        for (let i = 0; i < this.timerList.length; i++) {
            let unit = this.timerList[i]
            unit.time += dt
            if (unit.time >= unit.interval) {
                unit.time -= unit.interval
                unit.currentCount++
                unit.method && unit.method.apply(unit.caller, unit.params)
                if (unit.currentCount >= unit.repeatCount && unit.repeatCount > 0) {
                    this.timerList.splice(i, 1)
                    i--
                }
            }
        }
    }
    pause()
    {
        this._pause=true
    }
    resume()
    {
        this._pause=false
    }
}