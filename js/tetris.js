class TetrisGame {
    constructor(rows, columns) {
        this.rows = rows;
        this.columns = columns;
        this.field = new Array(rows).fill().map(() => new Array(columns).fill(0));
        this.commandQueue = [];
        this.currentFigure = null;
        this.currentFigureX = 0;
        this.currentFigureY = 0;
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

        this.currentFigure = figure;
        this.currentFigureX = startX;
        this.currentFigureY = 0;

        for (let i = 0; i < figure.length; i++) {
            for (let j = 0; j < figureWidth; j++) {
                this.field[i][startX + j] = figure[i][j];
            }
        }
    }

    clearFigureFromField(figure, x, y) {
        for (let i = 0; i < figure.length; i++) {
            for (let j = 0; j < figure[0].length; j++) {
                const row = y + i;
                const col = x + j;

                if (figure[i][j]) {
                    this.field[row][col] = 0;
                }
            }
        }
    }

    drawFigureToField(figure, x, y) {
        for (let i = 0; i < figure.length; i++) {
            for (let j = 0; j < figure[0].length; j++) {
                const row = y + i;
                const col = x + j;

                if (figure[i][j]) {
                    this.field[row][col] = figure[i][j];
                }
            }
        }
    }

    doesFigureOverlap(figure, x, y) {
        for (let i = 0; i < figure.length; i++) {
            for (let j = 0; j < figure[0].length; j++) {
                const row = y + i;
                const col = x + j;

                if (figure[i][j] && this.field[row][col]) {
                    return true;
                }
            }
        }

        return false;
    }

    isFigureOutOfBounds(figure, x, y) {
        for (let i = 0; i < figure.length; i++) {
            for (let j = 0; j < figure[0].length; j++) {
                const row = y + i;
                const col = x + j;

                if (figure[i][j] && (row < 0 || row >= this.rows || col < 0 || col >= this.columns)) {
                    return true;
                }
            }
        }

        return false;
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

    doMoveSide(isRight) {
        const { currentFigure, currentFigureX, currentFigureY } = this;
        const newFigureX = isRight ? currentFigureX + 1 : currentFigureX - 1;

        if (this.isFigureOutOfBounds(currentFigure, newFigureX, currentFigureY) || this.doesFigureOverlap(currentFigure, newFigureX, currentFigureY)) {
            return false;
        }

        this.clearFigure(currentFigure, currentFigureX, currentFigureY);
        this.drawFigure(currentFigure, newFigureX, currentFigureY);
        this.currentFigureX = newFigureX;

        return true;
    }

    doMoveLeft() {
        return this.doMoveSide(false);
    }

    doMoveRight() {
        return this.doMoveSide(true);
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
