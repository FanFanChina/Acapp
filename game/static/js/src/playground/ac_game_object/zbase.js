// 需要绘制的对象的数组
let AC_GAME_OBJECTS = [];

class AcGameObject {
	constructor() {
		AC_GAME_OBJECTS.push(this);
		this.has_called_start = false;  // 标记是否执行过start函数
		this.timedelta = 0; 			// 当前距离上一帧的事件间隔(ms)
	}

	start() { // 第一帧执行
		
	}
	update() { // 每一帧都执行
	
	}

	on_destroy() { // 临终遗言
		
	}

	// 在js中当一个对象没有被任何变量存储时，会被自动回收掉
	destroy() { // 销毁对象
		this.on_destroy();
		for(let i = 0; i < AC_GAME_OBJECTS.length; i ++ ) {
			if(AC_GAME_OBJECTS[i] === this) {
				AC_GAME_OBJECTS.splice(i, 1);
				break;
			}
		}
	}
}

let last_timestamp;
let AC_GAME_ANIMATION = function(timestamp) {
	for(let i = 0; i < AC_GAME_OBJECTS.length; i ++ ) {
		let obj = AC_GAME_OBJECTS[i];
		if(!obj.has_called_start) {
			obj.start();
			obj.has_called_start = true;
		}
		else {
			obj.timedelta = timestamp - last_timestamp;
			obj.update();
		}
	}
	last_timestamp = timestamp; 
	requestAnimationFrame(AC_GAME_ANIMATION);
}

requestAnimationFrame(AC_GAME_ANIMATION);

// 由浏览器调用该函数
// 执行时自动传入执行时间给 timestamp
// 实际上requestAnimationFrame是一个宏任务
// 此外次API专属于浏览器，不能在NodeJs环境运行（Node没有GUI，也就不会有此API）
