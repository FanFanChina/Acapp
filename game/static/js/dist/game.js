class AcGameMenu {
    constructor(root) {
        this.root = root;
        this.$menu = $(`
			<div class="ac-game-menu">
			  <div class="ac-game-menu-field">
			    <div class="ac-game-menu-field-item ac-game-menu-field-item-single-mode">
				  单人模式
				</div>
				<br>
				<div class="ac-game-menu-field-item ac-game-menu-field-item-multi-mode">
				  多人模式
				</div>
				<br>
				<div class="ac-game-menu-field-item ac-game-menu-field-item-settings">
				  设置
				</div>
			  </div>
			</div>
		`);
		this.root.$ac_game.append(this.$menu);
    	this.$single_mode = this.$menu.find('.ac-game-menu-field-item-single-mode');
		this.$multi_mode = this.$menu.find('.ac-game-menu-field-item-multi-mode');
		this.$settings = this.$menu.find('.ac-game-menu-field-item-settings');
		this.start();
	}
	start() {
		this.add_listening_events();
	}

	add_listening_events() {
		// js中函数内部的this指的是函数本身
		// 所以需要先把外面的this保存下来
		let outer = this;
		this.$single_mode.click(function() {
			outer.hide();
			outer.root.playground.show();  
		});
		this.$multi_mode.click(function() {
			console.log("click multi mode");
		});
		this.$settings.click(function() {
			console.log("click settings");
		});
	}

	show() { // 显示menu界面
		this.$menu.show();
	}
	hide() { // 隐藏mune界面
		this.$menu.hide();
	}
}
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
class GameMap extends AcGameObject {
    constructor(playground) {
        // 调用基类构造函数
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`);
        // 获取画布内容(canvas是一个数组)
        this.ctx = this.$canvas[0].getContext('2d');
        // 设置画布高度和宽度(等同于playground页面的高度和宽度)
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        // 将画布html加入到playground对象的$playground标签中
        this.playground.$playground.append(this.$canvas);
    }

    start() {

    }

    update() {
        this.render();
    }

    render() {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}
class Particle extends AcGameObject {
    constructor(playground, x, y, radius, vx, vy, color, speed, move_length) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.friction = 0.9;
        this.eps = 3;
    }
    start() {}

    update() {
        if (this.move_length < this.eps || this.speed < this.eps) {
            this.destroy();
            return;
        }
        let moved = Math.min(this.move_length, this.speed / 1000 * this.timedelta);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;
        this.speed *= this.friction;
        this.render();
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, speed, is_me) {
        super();
        this.playground = playground;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.vx = 0;
        this.vy = 0;
        this.damage_x = 0;
        this.damage_y = 0;
        this.damage_speed = 0;
        this.speed = speed;
        this.is_me = is_me;
        this.move_length = 0;
        this.ctx = this.playground.game_map.ctx;
        // 浮点运算时小于eps就算0
        this.eps = 0.1;
        this.friction = 0.9;
        this.cur_skill = null;
        this.spent_time = 0;
        this.start();
    }

    start() {
        if(this.is_me) {
            this.add_listening_events();
        } else {
            let tx = Math.random() * this.playground.width;
            let ty = Math.random() * this.playground.height;
            this.move_to(tx, ty);
        }
    }

    // 事件监听函数
    add_listening_events() {
        let outer = this;
        // 去除右键菜单
        this.playground.game_map.$canvas.on("contextmenu", function() {
            return false;
        });
        // 监听鼠标
        this.playground.game_map.$canvas.mousedown(function(e) {
            // 鼠标右键
            if(e.which === 3) outer.move_to(e.clientX, e.clientY);
            // 鼠标左键
            if(e.which === 1){
                if(outer.cur_skill === "fireball") outer.shoot_fireball(e.clientX, e.clientY);
                outer.cur_skill = null;
            }
        });
        $(window).keydown(function(e) {
            // Q键
            if(e.which === 81) {
                outer.cur_skill = "fireball";
                return false;
            }
        });
    }

    // 发射火球
    shoot_fireball(tx, ty) {
        let x = this.x;
        let y = this.y;
        let radius = this.playground.height * 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle);
        let vy = Math.sin(angle);
        let color = "orange";
        let speed = this.playground.height * 0.5;
        let move_length = this.playground.height * 1;
        // 火球伤害
        let damage = this.playground.height * 0.01;
        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, damage);
    }

    // 求两点间距
    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // 移动到(tx, ty)
    move_to(tx, ty) {
        // 移动距离
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        // 移动角度
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    // 被攻击
    is_attacked(angle, damage) {
        // 击中粒子效果
        for(let i = 0; i < 20 + Math.random() * 10; i ++ ) {
            let x = this.x;
            let y = this.y;
            let radius = this.radius * Math.random() * 0.1;
            let angle = Math.random() * Math.PI * 2;
            let vx = Math.cos(angle);
            let vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 10;
            let move_length = this.radius * Math.random() * 6;
            new Particle(this.playground, x, y, radius, vx, vy, color, speed, move_length);
        }
        // 被攻击时半径减小
        this.radius -= damage;
        // 半径过小时死亡
        if(this.radius < 10) {
            this.destroy();
            return false;
        }
        // 击中弹性效果
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 88;
        this.speed *= 1.3;
    }

    update() {
        this.spent_time += this.timedelta / 1000;
        if (this.spent_time > 4 && Math.random() < 1 / 300.0 && !this.is_me) {
            let player = this.playground.players[0];
            this.shoot_fireball(player.x, player.y);
        }
        if (this.damage_speed > 10) {
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed / 1000 * this.timedelta;
            this.y += this.damage_y * this.damage_speed / 1000 * this.timedelta;
            this.damage_speed *= this.friction;
        } else {
            if (this.move_length < this.eps) {
                this.move_length = this.vx = this.vy = 0;
                if (!this.is_me) {
                    let tx = Math.random() * this.playground.width;
                    let ty = Math.random() * this.playground.height;
                    this.move_to(tx, ty);
                }
            }
            else {
                // 取min防止出界，speed指的是每秒的速度所以要除以1000，算出每毫秒的速度
                let moved = Math.min(this.move_length, this.speed / 1000 * this.timedelta);
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }
        this.render();
    }

    // 渲染函数
    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
class FireBall extends AcGameObject {
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length, damage) {
        super();
        this.playground = playground;
        this.player = player;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.damage = damage;
        this.ctx = this.playground.game_map.ctx;
        this.eps = 0.1;
        this.start();
    }
    start() {

    }

    update() {
        if (this.move_length < this.eps) {
            this.destroy();
            return false;
        }
        let moved = Math.min(this.move_length, this.speed / 1000 * this.timedelta);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;
        // 非本人 + 相交 == 攻击
        for(let i = 0; i < this.playground.players.length; i ++ ) {
            let player = this.playground.players[i];
            if(this.player !== player && this.is_collision(player)) this.attack(player);
        }
        this.render();
    }

    // 求(x1, y1) 到 (x2, y2)的距离
    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // 判断是否相交
    is_collision(obj) {
        let dist = this.get_dist(this.x, this.y, obj.x, obj.y);
        if(dist < this.radius + obj.radius) return true;
        return false;
    }

    // 攻击对方
    attack(player) {
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        player.is_attacked(angle, this.damage);
        this.destroy();
    }

    // 渲染函数
    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`
            <div class="ac-game-playground"></div>
        `);
        // this.hide();
        this.root.$ac_game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.players = [];
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.15, true));
        for(let i = 1; i <= 6; i ++ ) {
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, this.get_random_color(), this.height * 0.15, false));
        }
        this.start();
    }

    // 随机皮肤
    get_random_color() {
        let colors = ["lightblue", "pink", "grey", "green"];
        return colors[Math.floor(Math.random() * 5)];
    }

    start() {}

    show() { // 显示游戏界面
        this.$playground.show();
    }

    hide() { // 关闭游戏界面
        this.$playground.hide();
    }
}
export class AcGame {
    constructor(id) {
        this.id = id;
        this.$ac_game = $('#' + id);
        //this.menu = new AcGameMenu(this);
    	this.playground = new AcGamePlayground(this);
		this.start();
	}

	start() {
	
	}
}
