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
            // 预判玩家方向，射向玩家pre_time秒后的位置
            let pre_time = 0.2;
            let tx = player.x + player.speed / 1000 * this.vx * this.timedelta * pre_time;
            let ty = player.y + player.speed / 1000 * this.vy * this.timedelta * pre_time;
            this.shoot_fireball(tx, ty);
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

    on_destroy() {
        for (let i = 0; i < this.playground.players.length; i ++ ) {
            if(this.playground.players[i] === this) this.playground.players.splice(i, 1);
        }
    }
}
