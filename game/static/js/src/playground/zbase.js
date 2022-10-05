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
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "lightblue", this.height * 0.15, false));
        }
        this.start();
    }

    start() {}

    show() { // 显示游戏界面
        this.$playground.show();
    }

    hide() { // 关闭游戏界面
        this.$playground.hide();
    }
}
