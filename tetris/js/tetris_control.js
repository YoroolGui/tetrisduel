class TetrisControl {
    game;
    canvas;
    ctx;

    constructor(canvas, rows, columns) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.game = new TetrisGame(rows, columns);
    }

    redraw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        drawTetrisGame(this.game, this.ctx);
    }

    start() {
        this.bindEvent();
        var self = this;

        setInterval(function () {
            if (self.game.isLocked()) {
                if (!self.game.newFigure()) {
                    alert("Game Over");
                    self.game = new TetrisGame(20, 10);
                }
            } else {
                self.game.moveDown();
            }
        }, 1000);

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
                    // self.game.drop();
                    break;
            }
        }
    }
}

