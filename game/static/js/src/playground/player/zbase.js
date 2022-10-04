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
        this.speed = speed;
        this.is_me = is_me;
        this.move_length = 0;
        this.ctx = this.playground.game_map.ctx;
        // 浮点运算时小于eps就算0
        this.eps = 0.1;
        this.cur_skill = null;
        this.start();
    }

    start() {
        if(this.is_me) {
            this.add_listening_events();
        }
    }

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
        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length);
    }

    // 求两点间距
    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    move_to(tx, ty) {
        // 移动距离
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        // 移动角度
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    update() {
        if(this.move_length < this.eps) this.move_length = this.vx = this.vy = 0;
        else {
            // 取min防止出界，speed指的是每秒的速度所以要除以1000，算出每毫秒的速度
            let moved = Math.min(this.move_length, this.speed / 1000 * this.timedelta);
            this.x += this.vx * moved;
            this.y += this.vy * moved;
            this.move_length -= moved;
        }
        this.render();
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
