class TetrisGame {
    constructor(rows, columns) {
        this.rows = rows;
        this.columns = columns;
        this.field = new Array(rows).fill().map(() => new Array(columns).fill(0));
        this.commandQueue = [];
        this.currentFigure = null;
        this.currentFigureX = 0;
        this.currentFigureY = 0;
        this.newFigure();
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

    newFigure() {
        if (this.currentFigure !== null) {
            this.lockFigure(this.currentFigure, this.currentFigureX, this.currentFigureY);
        }

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

    clearFigure(figure, x, y) {
        for (let i = 0; i < figure.length; i++) {
            for (let j = 0; j < figure[i].length; j++) {
                if (figure[i][j] !== 0) {
                    this.field[y + i][x + j] = 0;
                }
            }
        }
    }

    drawFigure(figure, x, y) {
        for (let i = 0; i < figure.length; i++) {
            for (let j = 0; j < figure[i].length; j++) {
                if (figure[i][j] !== 0) {
                    this.field[y + i][x + j] = figure[i][j];
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

    doRotate(isRight) {
        const { currentFigure, currentFigureX, currentFigureY } = this;
        const newFigure = isRight ? this.rotateFigureRight(currentFigure) : this.rotateFigureLeft(currentFigure);

        if (this.isFigureOutOfBounds(newFigure, currentFigureX, currentFigureY) || this.doesFigureOverlap(newFigure, currentFigureX, currentFigureY)) {
            return false;
        }

        this.clearFigure(currentFigure, currentFigureX, currentFigureY);
        this.drawFigure(newFigure, currentFigureX, currentFigureY);
        this.currentFigure = newFigure;

        return true;
    }

    doMoveDown() {
        const { currentFigure, currentFigureX, currentFigureY } = this;
        const newFigureY = currentFigureY + 1;

        if (this.isFigureOutOfBounds(currentFigure, currentFigureX, newFigureY) || this.doesFigureOverlap(currentFigure, currentFigureX, newFigureY)) {
            return false;
        }

        this.clearFigure(currentFigure, currentFigureX, currentFigureY);
        this.drawFigure(currentFigure, currentFigureX, newFigureY);
        this.currentFigureY = newFigureY;

        return true;
    }

    doMoveLeft() {
        return this.doMoveSide(false);
    }

    doMoveRight() {
        return this.doMoveSide(true);
    }

    doRotateLeft() {
        return this.doRotate(false);
    }

    doRotateRight() {
        return this.doRotate(true);
    }

    doMoveDown() {
        return this.doMoveDown();
    }

    blastFilledRows() {
        let count = 0;

        for (let i = this.rows - 1; i >= 0; i--) {
            if (this.field[i].every(cell => cell !== 0)) {
                this.field[i].fill(-1);
                count++;
            }
        }

        return count;
    }

    clearBlast() {
        for (let i = 0; i < this.field.length; i++) {
            for (let j = 0; j < this.field[i].length; j++) {
                if (this.field[i][j] === -1) {
                    this.field[i][j] = 0;
                }
            }
        }
    }
}

