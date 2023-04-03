// The Tetris game logic
// Interface methods and constants are defined in the TetrisGame class:
//
// Constants:
// - EMPTY_CELL - the value of an empty cell
// - BLASTED_CELL - the value of a cell that has been blasted
// - FIGURE_CELL_BASE - the base value of a cell that contains a figure
// - FIGURE_I - the value of a cell that contains a figure of type I
// - FIGURE_J - the value of a cell that contains a figure of type J
// - FIGURE_L - the value of a cell that contains a figure of type L
// - FIGURE_O - the value of a cell that contains a figure of type O
// - FIGURE_S - the value of a cell that contains a figure of type S
// - FIGURE_T - the value of a cell that contains a figure of type T
// - FIGURE_Z - the value of a cell that contains a figure of type Z
//
// Functions:
// - getRows() - returns the number of rows in the game field
// - getColumns() - returns the number of columns in the game field
// - getCellState(row, column) - returns the state of the cell at the specified position
// - moveLeft() - moves the current figure to the left
// - moveRight() - moves the current figure to the right
// - rotateLeft() - rotates the current figure to the left
// - rotateRight() - rotates the current figure to the right
// - moveDown() - moves the current figure down
// - step() - performs one game step
// - newFigure() - creates a new figure
// - blastFilledRows() - blasts filled rows and returns the number of blasted rows
// - clearBlast() - replaces all BLASTED_CELL cells with EMPTY_CELL cells
// - fall() - drops groups of cells down to fill the gaps created by blasting rows

class TetrisGame {
    // Constants
    static EMPTY_CELL = 0;
    static BLASTED_CELL = -1;
    static FIGURE_CELL_BASE = 1;
    static FIGURE_I = 1;
    static FIGURE_J = 2;
    static FIGURE_L = 3;
    static FIGURE_O = 4;
    static FIGURE_S = 5;
    static FIGURE_T = 6;
    static FIGURE_Z = 7;

    field;
    rows;
    columns;
    currentFigure;
    currentFigureX;
    currentFigureY;
    commandQueue;

    constructor(rows, columns) {
        this.rows = rows;
        this.columns = columns;
        this.field = Array(rows).fill().map(() => Array(columns).fill(TetrisGame.EMPTY_CELL));
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
        if (row >= 0 && row < this.rows && column >= 0 && column < this.columns) {
            return this.field[row][column];
        }
        return null;
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
            this._drawFigure(this.currentFigure, this.currentFigureX, this.currentFigureY);
        }

        const figures = [
            { id: TetrisGame.FIGURE_I, shape: [[1, 1, 1, 1]] },
            { id: TetrisGame.FIGURE_J, shape: [[1, 1, 1], [0, 0, 1]] },
            { id: TetrisGame.FIGURE_L, shape: [[0, 0, 1], [1, 1, 1]] },
            { id: TetrisGame.FIGURE_O, shape: [[1, 1], [1, 1]] },
            { id: TetrisGame.FIGURE_S, shape: [[0, 1, 1], [1, 1, 0]] },
            { id: TetrisGame.FIGURE_T, shape: [[1, 1, 1], [0, 1, 0]] },
            { id: TetrisGame.FIGURE_Z, shape: [[1, 1, 0], [0, 1, 1]] },
        ];

        const figureIndex = Math.floor(Math.random() * figures.length);
        const { id, shape } = figures[figureIndex];
        const figureWidth = shape[0].length;
        const startX = Math.floor((this.columns - figureWidth) / 2);

        this.currentFigure = shape.map(row => row.map(cell => cell * id));
        this.currentFigureX = startX;
        this.currentFigureY = 0;

        if (this._doesFigureOverlap(this.currentFigure, this.currentFigureX, this.currentFigureY)) {
            return false;
        } else {
            this._drawFigure(this.currentFigure, this.currentFigureX, this.currentFigureY);
            return true;
        }
    }

    _clearFigure(figure, x, y) {
        for (let i = 0; i < figure.length; i++) {
            for (let j = 0; j < figure[i].length; j++) {
                if (figure[i][j] !== 0) {
                    this.field[y + i][x + j] = 0;
                }
            }
        }
    }

    _drawFigure(figure, x, y) {
        console.log("drawFigure", x, y);
        for (let i = 0; i < figure.length; i++) {
            for (let j = 0; j < figure[i].length; j++) {
                if (figure[i][j] !== 0) {
                    console.log("draw", y + i, x + j, figure[i][j]);
                    this.field[y + i][x + j] = figure[i][j];
                }
            }
        }
    }

    _doesFigureOverlap(figure, x, y) {
        console.log("doesFigureOverlap", x, y);
        for (let i = 0; i < figure.length; i++) {
            for (let j = 0; j < figure[0].length; j++) {
                const row = y + i;
                const col = x + j;
                console.log("fig", i, j, figure[i][j]);
                console.log("fld", row, col, this.field[row][col]);

                if (figure[i][j] && this.field[row][col]) {
                    console.log("overlap");
                    return true;
                }
            }
        }
        console.log("no overlap");
        return false;
    }

    _isFigureOutOfBounds(figure, x, y) {
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
                this._doMoveLeft();
                break;
            case "right":
                this._doMoveRight();
                break;
            case "rotate-left":
                this._doRotateLeft();
                break;
            case "rotate-right":
                this._doRotateRight();
                break;
            case "down":
                this._doMoveDown();
                break;
            default:
                break;
        }
    }

    _doMoveSide(isRight) {
        const { currentFigure, currentFigureX, currentFigureY } = this;
        const newFigureX = isRight ? currentFigureX + 1 : currentFigureX - 1;

        if (this._isFigureOutOfBounds(currentFigure, newFigureX, currentFigureY) || this._doesFigureOverlap(currentFigure, newFigureX, currentFigureY)) {
            return false;
        }

        this._clearFigure(currentFigure, currentFigureX, currentFigureY);
        this._drawFigure(currentFigure, newFigureX, currentFigureY);
        this.currentFigureX = newFigureX;

        return true;
    }

    _rotateFigure(arr, isRight) {
        const numRows = arr.length;
        const numCols = arr[0].length;
        const result = new Array(numCols);

        for (let col = 0; col < numCols; col++) {
            result[col] = new Array(numRows);
            for (let row = 0; row < numRows; row++) {
                if (isRight) {
                    result[col][row] = arr[numRows - row - 1][col];
                } else {
                    result[col][row] = arr[row][numCols - col - 1];
                }
            }
        }
        return result;
    }

    _doRotate(isRight) {
        const { currentFigure, currentFigureX, currentFigureY } = this;
        const newFigure = this._rotateFigure(currentFigure, isRight);

        if (this._isFigureOutOfBounds(newFigure, currentFigureX, currentFigureY) || this._doesFigureOverlap(newFigure, currentFigureX, currentFigureY)) {
            return false;
        }

        this._clearFigure(currentFigure, currentFigureX, currentFigureY);
        this._drawFigure(newFigure, currentFigureX, currentFigureY);
        this.currentFigure = newFigure;

        return true;
    }

    _doMoveDown() {
        const { currentFigure, currentFigureX, currentFigureY } = this;
        const newFigureY = currentFigureY + 1;

        if (this._isFigureOutOfBounds(currentFigure, currentFigureX, newFigureY) || this._doesFigureOverlap(currentFigure, currentFigureX, newFigureY)) {
            return false;
        }

        this._clearFigure(currentFigure, currentFigureX, currentFigureY);
        this._drawFigure(currentFigure, currentFigureX, newFigureY);
        this.currentFigureY = newFigureY;

        return true;
    }

    _doMoveLeft() {
        return this._doMoveSide(false);
    }

    _doMoveRight() {
        return this._doMoveSide(true);
    }

    _doRotateLeft() {
        return this._doRotate(false);
    }

    _doRotateRight() {
        return this._doRotate(true);
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