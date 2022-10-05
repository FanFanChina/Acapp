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
