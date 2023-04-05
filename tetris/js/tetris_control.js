class TetrisControl {
    game;
    canvas;
    ctx;
    fall_figure_interval_ms = 1000;
    fall_figure_interval_counter = 0;

    constructor(canvas, rows, columns) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.game = new TetrisGame(rows, columns);
    }

    redraw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        drawTetrisGame(this.game, this.ctx);
    }

    _set_fall_figure_interval(ms) {
        this.fall_figure_interval_ms = ms;
    }

    _fall_figure() {
        this.fall_figure_interval_counter += 10;
        if (this.fall_figure_interval_counter >= this.fall_figure_interval_ms) {
            this.fall_figure_interval_counter = 0;
            if (this.game.isLocked()) {
                if (this.game.newFigure()) {
                    this._set_fall_figure_interval(1000);
                } else {
                    alert("Game Over");
                    this.game = new TetrisGame(20, 10);
                }
            } else {
                this.game.moveDown();
            }
        }
    }

    start() {
        this.bindEvent();
        var self = this;

        setInterval(function () { self._fall_figure(); }, 10);

        setInterval(function () {
            self.game.blast();
        }, 100);

        setInterval(function () {
            self.game.fall();
        }, 300);

        setInterval(function () {
            self.game.step();
            if (self.game.isBlasted()) {
                setTimeout(function () {
                    self.game.clearBlast();
                }, 500);
            }
            self.redraw();
        }, 10);
    }

    bindEvent() {
        var self = this;
        document.onkeydown = (event) => {
            event.preventDefault();
            event.stopPropagation();
            switch (event.key) {
                case "ArrowLeft":
                case "a":
                    self.game.moveLeft();
                    break;
                case "ArrowUp":
                case "w":
                    self.game.rotateRight();
                    break;
                case "ArrowRight":
                case "d":
                    self.game.moveRight();
                    break;
                case "ArrowDown":
                case "s":
                    self.game.moveDown();
                    break;
                case " ":
                    this._set_fall_figure_interval(100);
                    break;
            }
        }
    }
}

