class TetrisDisplay {
    // Accordingly to CellType enum in server
    static CellTypeEmpty = 0;
    static CellTypeBlasted = 1;
    static CellTypeI = 2;
    static CellTypeJ = 3;
    static CellTypeL = 4;
    static CellTypeO = 5;
    static CellTypeS = 6;
    static CellTypeT = 7;
    static CellTypeZ = 8;

    canvas;
    ctx;
    cols;
    rows;
    field = null;
    preview = null;

    // Contructor accepts canvas
    constructor(canvas, rows, cols) {
        // Set canvas
        this.canvas = canvas;
        // Get context
        this.ctx = canvas.getContext('2d');
        this.cols = cols;
        this.rows = rows;
    }

    update(data) {
        this.cols = data.cols;
        this.rows = data.rows;
        this.field = data.field;
        this.preview = data.preview;
        this.draw();
    }

    drawExplosion(x, y, h, w) {
        var ctx = self.ctx;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y, w, h);
        // Draw explosion
        ctx.fillStyle = '#ff9900';
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h / 2, w / 3, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h / 2, w / 5, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h / 2, w / 8, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h / 2, w / 15, 0, 2 * Math.PI);
        ctx.fill();
    }

    drawCell(x, y, size, cellState, offsetX, offsetY) {
        var ctx = this.ctx;
        const padding = 1;
        const figureColors = new Map([
            [TetrisDisplay.CellTypeEmpty, '#f2f2f2'],
            [TetrisDisplay.CellTypeI, '#00FFFF'],
            [TetrisDisplay.CellTypeJ, '#0000FF'],
            [TetrisDisplay.CellTypeL, '#FFA500'],
            [TetrisDisplay.CellTypeO, '#FFFF00'],
            [TetrisDisplay.CellTypeS, '#00FF00'],
            [TetrisDisplay.CellTypeT, '#800080'],
            [TetrisDisplay.CellTypeZ, '#FF0000'],
        ]);
        if (figureColors.has(cellState)) {
            ctx.fillStyle = figureColors.get(cellState);
            ctx.fillRect(x * size + padding + offsetX, y * size + padding + offsetY, size - 2 * padding, size - 2 * padding);
        } else if (cellState === TetrisDisplay.CellTypeBlasted) {
            this.drawExplosion(x * size + offsetX, y * size + offsetY, size, size);
        }
    }

    draw() {
        const rows = this.rows;
        const cols = this.cols;
        const cellSize = Math.floor(ctx.canvas.height / (rows + 1));
        const internalWidth = cols * cellSize;
        // const offsetX = Math.floor((ctx.canvas.width - gameWidth) / 2); // Calculate horizontal offset
        // const offsetY = cellSize; // Add offset for the bottom wall
        const fieldWidth = (cols + 2) * cellSize; // Add offset for the left and right walls
        const fieldHeight = (rows + 1) * cellSize; // Add offset for the bottom wall
        const offsetX = Math.floor((ctx.canvas.width - fieldWidth) / 2); // Calculate horizontal offset
        const offsetY = 0; // Add offset for the bottom wall
        const internalOffsetX = offsetX + cellSize; // Add offset for the left wall
        const internalOffsetY = offsetY; // Add offset for the top wall

        ctx.fillStyle = '#333333';
        // draw left wall
        ctx.fillRect(offsetX, 0, cellSize, (rows + 1) * cellSize);
        // draw right wall
        ctx.fillRect(offsetX + internalWidth + cellSize, 0, cellSize, (rows + 1) * cellSize);
        // draw bottom wall
        ctx.fillRect(offsetX + cellSize, offsetY + rows * cellSize, internalWidth, cellSize);

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cellState = this.field[row][col];
                this.drawCell(col, row, cellSize, cellState, internalOffsetX, 0);
            }
        }
    }

}

class TetrisClient {

    url;
    sse;
    display;

    // Contructor accepts canvas
    constructor(canvas, url) {
        this.url = url;
        this.display = new TetrisDisplay(canvas, 20, 10);
    }

    connect() {
        // Connect to server
        this.sse = new EventSource(this.url + '/sse');
        this.sse.addEventListener('message', (event) => {
            var data = JSON.parse(event.data);
            this.display.update(data.player);
        });
    }

    // Commands to send to server (to be implemented later)
    down() {
        window.fetch(this.url + '/down', { method: 'POST' });
    }

    moveLeft() {
        window.fetch(this.url + '/left', { method: 'POST' });
    }

    moveRight() {
        window.fetch(this.url + '/right', { method: 'POST' });
    }

    rotateLeft() {
        window.fetch(this.url + '/rotate_left', { method: 'POST' });
    }

    rotateRight() {
        window.fetch(this.url + '/rotate_right', { method: 'POST' });
    }

    drop() {
        window.fetch(this.url + '/drop', { method: 'POST' });
    }

    bottom_refill() {
        window.fetch(this.url + '/bottom_refill', { method: 'POST' });
    }

    bindButtons(left_id, rotate_left_id, down_id, rotate_right_id, right_id) {
        var self = this;
        document.getElementById(left_id).onclick = function () {
            self.moveLeft();
        }
        document.getElementById(rotate_left_id).onclick = function () {
            self.rotateLeft();
        }
        document.getElementById(down_id).onclick = function () {
            self.down();
        }
        document.getElementById(rotate_right_id).onclick = function () {
            self.rotateRight();
        }
        document.getElementById(right_id).onclick = function () {
            self.moveRight();
        }
    }

    bindKeys() {
        var self = this;
        document.onkeydown = (event) => {
            event.preventDefault();
            event.stopPropagation();
            switch (event.key) {
                case "ArrowLeft":
                case "a":
                    self.moveLeft();
                    break;
                case "ArrowUp":
                case "w":
                    self.rotateLeft();
                    break;
                case "ArrowRight":
                case "d":
                    self.moveRight();
                    break;
                case "ArrowDown":
                case "s":
                    self.down();
                    break;
                case " ":
                    self.drop();
                    break;
                case "Enter":
                    self.bottom_refill();
                    break;
            }
        }
    }

}
