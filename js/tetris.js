class TetrisGame {
    constructor(rows, columns) {
        this.rows = rows;
        this.columns = columns;
        this.field = new Array(rows).fill().map(() => new Array(columns).fill(0));
        this.commandQueue = [];
    }

    moveLeft() {
        this.commandQueue.push("left");
    }

    moveRight() {
        this.commandQueue.push("right");
    }

    rotateLeft() {
        this.commandQueue.push("rotate-left");
    }

    rotateRight() {
        this.commandQueue.push("rotate-right");
    }

    moveDown() {
        this.commandQueue.push("down");
    }

    drop() {
        this.commandQueue.push("drop");
    }

    newFigure() {
        const figures = [
            [[1, 1], [1, 1]],
            [[0, 2, 0], [2, 2, 2]],
            [[0, 3, 3], [3, 3, 0]],
            [[4, 4, 0], [0, 4, 4]],
            [[0, 5, 0], [5, 5, 5,]],
            [[6, 6, 6, 6]],
            [[0, 7, 0, 0], [0, 7, 7, 7]],
        ];

        const figureIndex = Math.floor(Math.random() * figures.length);
        const figure = figures[figureIndex];
        const figureWidth = figure[0].length;
        const startX = Math.floor((this.columns - figureWidth) / 2);

        for (let i = 0; i < figure.length; i++) {
            for (let j = 0; j < figureWidth; j++) {
                this.field[i][startX + j] = figure[i][j];
            }
        }
    }

    step() {
        const command = this.commandQueue.shift();

        switch (command) {
            case "left":
                this.doMoveLeft();
                break;
            case "right":
                this.doMoveRight();
                break;
            case "rotate-left":
                this.doRotateLeft();
                break;
            case "rotate-right":
                this.doRotateRight();
                break;
            case "down":
                this.doMoveDown();
                break;
            case "drop":
                this.doDrop();
                break;
            default:
                break;
        }
    }

    doMoveLeft() {
        // TODO: Implement method to move the current figure one cell to the left
    }

    doMoveRight() {
        // TODO: Implement method to move the current figure one cell to the right
    }

    doRotateLeft() {
        // TODO: Implement method to rotate the current figure 90 degrees counterclockwise
    }

    doRotateRight() {
        // TODO: Implement method to rotate the current figure 90 degrees clockwise
    }

    doMoveDown() {
        // TODO: Implement method to move the current figure one cell down
    }

    doDrop() {
        // TODO: Implement method to drop the current figure to the bottom of the field
    }
}
