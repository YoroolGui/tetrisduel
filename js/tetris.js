class TetrisGame {
    // Constants
    static FIGURE_TYPES = ["I", "O", "T", "S", "Z", "J", "L"];
    static EMPTY_CELL = 0;
    static BLASTED_CELL = -1;

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

    // Getters
    getRows() {
        return this.rows;
    }

    getColumns() {
        return this.columns;
    }

    getCellState(row, column) {
        const cellValue = this.field[row][column];
        if (cellValue === TetrisGame.EMPTY_CELL) {
            return "Empty";
        } else if (cellValue === TetrisGame.BLASTED_CELL) {
            return "Blast";
        } else {
            return `Figure${this.currentFigure.type}`;
        }
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
        for (let i = 0; i < this.rows; i++) {
            if (this.field[i].every(cell => cell !== 0)) {
                this.field[i].fill(TetrisGame.BLASTED_CELL);
                count++;
            }
        }
        return count;
    }

    clearBlast() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                if (this.field[i][j] === TetrisGame.BLASTED_CELL) {
                    this.field[i][j] = TetrisGame.EMPTY_CELL;
                }
            }
        }
    }

    fall() {
        let distance = 0;
        const groups = [];

        // Create groups of connected cells
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                if (this.field[i][j] !== TetrisGame.EMPTY_CELL) {
                    const neighbors = [];
                    let belongsToGroup = false;

                    // Check if the cell is touching any existing group
                    for (let group of groups) {
                        if (group.some(([x, y]) => Math.abs(x - i) + Math.abs(y - j) === 1)) {
                            group.push([i, j]);
                            belongsToGroup = true;
                            break;
                        }
                    }

                    // If the cell is not touching any existing group, create a new group
                    if (!belongsToGroup) {
                        groups.push([[i, j]]);
                    }
                }
            }
        }

        // Move each group down as a whole until it reaches the bottom of the field or overlaps with non-empty cells
        for (let group of groups) {
            let canMove = true;
            while (canMove) {
                for (let [i, j] of group) {
                    if (i + distance + 1 >= this.rows || this.field[i + distance + 1][j] !== TetrisGame.EMPTY_CELL) {
                        canMove = false;
                        break;
                    }
                }
                if (canMove) {
                    distance++;
                }
            }

            // Update the field with the new positions of the cells in the group
            for (let [i, j] of group) {
                this.field[i + distance][j] = this.field[i][j];
                this.field[i][j] = TetrisGame.EMPTY_CELL;
            }

            // Update the total distance that the cells were moved down
            distance = Math.max(distance, 0);
            distance += group.some(([i, j]) => i + distance === this.rows - 1) ? 0 : 1;
        }

        return distance;
    }
}