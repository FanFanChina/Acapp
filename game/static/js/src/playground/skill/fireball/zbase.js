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
    is_collision(player) {
        let dist = this.get_dist(this.x, this.y, player.x, player.y);
        if(dist < this.radius + player.radius) return true;
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
        this.ctx.arc(this.x, this.y, this.radius, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
