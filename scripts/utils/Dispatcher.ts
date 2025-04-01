/**
 * Description:事件派发器
 * @author chenbo
 * @version 1.0
 */
const { ccclass, property } = cc._decorator;

@ccclass
export default class Dispatcher {

	dict: Object
	constructor() {

		this.dict = new Object();
	}
	//添加一个回调函数
	on(type: string, callback: Function, thisObj: any) {
		var callbacks = this.dict[type];
		if (callbacks) {
			if (this.getIndex(callbacks, callback, thisObj) != -1)
				return;
		}
		else {
			callbacks = new Array();
			this.dict[type] = callbacks;
		}
		callbacks.push({ 'callback': callback, 'thisObj': thisObj });
	}
	getIndex(array, callback, thisObj) {
		for (var i = 0; i < array.length; i++) {
			var data = array[i];
			if (data['callback'] == callback && data['thisObj'] == thisObj) {
				return i;
			}
		}
		return -1;
	}
	//删除一个回调函数
	off(type, callback, thisObj) {
		//没有该类型的数组
		if (!this.dict[type]) {
			return;
		}
		var callbacks = this.dict[type];
		if (!callbacks) {
			return;
		}
		var index = this.getIndex(callbacks, callback, thisObj);
		if (index != -1) {
			callbacks.splice(index, 1);
		}
		if (callbacks.length <= 0) {
			delete this.dict[type];
		}
	}
	offByTarget(target) {
		for (var type in this.dict) {
			var callbacks = this.dict[type];
			for (var i = 0; i < callbacks.length; i++) {
				var data = callbacks[i];
				var thisObj = data['thisObj']

				if (thisObj == target) {
					callbacks.splice(i, 1)
					i--
				}
			}
		}
	}
	//执行回调
	execute(type, params = null) {
		var callbacks = this.dict[type];
		if (callbacks == undefined) return;

		for (var i = 0; i < callbacks.length; i++) {
			var data = callbacks[i];
			var callback = data['callback']
			var thisObj = data['thisObj']

			callback.apply(thisObj, params)
		}
	}

}