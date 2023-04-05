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
// - blast() - blasts filled rows
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
    locked;
    falling;
    blasted;

    constructor(rows, columns) {
        this.rows = rows;
        this.columns = columns;
        this.field = Array(rows).fill().map(() => Array(columns).fill(TetrisGame.EMPTY_CELL));
        this.commandQueue = [];
        this.currentFigure = null;
        this.currentFigureX = 0;
        this.currentFigureY = 0;
        this.locked = false;
        this.falling = false;
        this.blasted = false;
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

    getCellStateWithFigure(row, column) {
        if (row >= 0 && row < this.rows && column >= 0 && column < this.columns) {
            // Check if the cell is part of the current falling figure
            if (row >= this.currentFigureY && row < this.currentFigureY + this.currentFigure.length &&
                column >= this.currentFigureX && column < this.currentFigureX + this.currentFigure[0].length) {
                // Calculate the relative coordinates of the cell within the current figure
                let figureRow = row - this.currentFigureY;
                let figureColumn = column - this.currentFigureX;

                // If the current figure cell is not empty, return its value
                if (this.currentFigure[figureRow][figureColumn] !== 0) {
                    return this.currentFigure[figureRow][figureColumn];
                }
            }

            // Return the field cell value if the cell is not part of the current figure
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

    fall() {
        this.commandQueue.push("fall");
    }

    blast() {
        this.commandQueue.push("blast");
    }

    clearBlast() {
        this.commandQueue.push("clear-blast");
    }

    newFigure() {
        this.locked = false;

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

        return !this._doesFigureOverlap(this.currentFigure, this.currentFigureX, this.currentFigureY);
    }

    _drawFigure(figure, x, y) {
        for (let i = 0; i < figure.length; i++) {
            for (let j = 0; j < figure[i].length; j++) {
                if (figure[i][j] !== 0) {
                    this.field[y + i][x + j] = figure[i][j];
                }
            }
        }
    }

    _doesFigureOverlap(figure, x, y) {
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
        if (this.locked) {
            return;
        }
        const command = this.commandQueue.shift();
        var res = undefined;
        switch (command) {
            case "left":
                res = this._doMoveLeft();
                break;
            case "right":
                res = this._doMoveRight();
                break;
            case "rotate-left":
                res = this._doRotateLeft();
                break;
            case "rotate-right":
                res = this._doRotateRight();
                break;
            case "down":
                res = this._doMoveDown();
                if (!res) {
                    this._drawFigure(this.currentFigure, this.currentFigureX, this.currentFigureY);
                    this.locked = true;
                    this.commandQueue = [];
                }
                break;
            case "fall":
                if (this.falling) {
                    this.falling = this._doFall();
                }
                break;
            case "blast":
                this.blasted = this._doBlastFilledRows() > 0;
                break;
            case "clear-blast":
                if (this.blasted) {
                    this._doClearBlast()
                    this.blasted = false;
                    this.falling = true;
                }
                break;
            default:
                break;
        }
    }

    _doMoveSide(isRight) {
        const { currentFigure, currentFigureX, currentFigureY } = this;
        const newFigureX = isRight ? currentFigureX + 1 : currentFigureX - 1;

        if (this._isFigureOutOfBounds(currentFigure, newFigureX, currentFigureY)) {
            return false;
        }

        const isOverlap = this._doesFigureOverlap(currentFigure, newFigureX, currentFigureY);
        if (!isOverlap) this.currentFigureX = newFigureX;

        return !isOverlap;
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
        if (this._isFigureOutOfBounds(newFigure, currentFigureX, currentFigureY)) {
            return false;
        }
        let res = !this._doesFigureOverlap(newFigure, currentFigureX, currentFigureY)
        if (res) this.currentFigure = newFigure;
        return res;
    }

    _doMoveDown() {
        const { currentFigure, currentFigureX, currentFigureY } = this;
        const newFigureY = currentFigureY + 1;
        if (this._isFigureOutOfBounds(currentFigure, currentFigureX, newFigureY)) {
            return false;
        }
        const isOverlap = this._doesFigureOverlap(currentFigure, currentFigureX, newFigureY);
        if (!isOverlap) this.currentFigureY = newFigureY;
        return !isOverlap;
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

    isLocked() {
        return this.locked;
    }

    isFalling() {
        return this.falling;
    }

    isBlasted() {
        return this.blasted;
    }

    _doBlastFilledRows() {
        let count = 0;
        for (let i = 0; i < this.rows; i++) {
            if (this.field[i].every(cell => cell !== 0)) {
                this.field[i].fill(TetrisGame.BLASTED_CELL);
                count++;
            }
        }
        return count;
    }

    _doClearBlast() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                if (this.field[i][j] === TetrisGame.BLASTED_CELL) {
                    this.field[i][j] = TetrisGame.EMPTY_CELL;
                }
            }
        }
    }

    _doFall() {
        let moved = false;
        // Create groups of connected cells
        let groups = getConnectedNonZeroCoords(this.field);

        // Move each group down as a whole one row at a time
        for (let group of groups) {
            sortBottomToTop(group);
            let canMove = group[0][0] < this.rows - 1;
            if (canMove) {
                moved = true;
                for (let [i, j] of group) {
                    this.field[i + 1][j] = this.field[i][j];
                    this.field[i][j] = TetrisGame.EMPTY_CELL;
                }
            }
        }

        return moved;
    }
}

function sortBottomToTop(arr) {
    return arr.sort(function (a, b) {
        return b[0] - a[0];
    });
}

function getConnectedNonZeroCoords(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    const groups = [];

    function isValid(x, y) {
        return x >= 0 && x < rows && y >= 0 && y < cols;
    }

    const neighbors = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
    ];

    function dfs(x, y, group) {
        visited[x][y] = true;
        group.push([x, y]);

        for (const [dx, dy] of neighbors) {
            const newX = x + dx;
            const newY = y + dy;

            if (isValid(newX, newY) && !visited[newX][newY] && matrix[newX][newY] !== 0) {
                dfs(newX, newY, group);
            }
        }
    }

    for (let x = 0; x < rows; x++) {
        for (let y = 0; y < cols; y++) {
            if (!visited[x][y] && matrix[x][y] !== 0) {
                const group = [];
                dfs(x, y, group);
                groups.push(group);
            }
        }
    }

    return groups;
}
