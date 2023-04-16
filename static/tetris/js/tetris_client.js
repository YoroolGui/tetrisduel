class TetrisClient {
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

    ctx;
    url;
    sse;
    cols;
    rows;
    field = null;
    preview = null;

    // Contructor accepts canvas
    constructor(canvas, url) {
        // Set canvas
        this.canvas = canvas;
        // Get context
        this.ctx = canvas.getContext('2d');
        this.url = url;
        this.cols = 0;
        this.rows = 0;
    }

    connect() {
        // Connect to server
        this.sse = new EventSource(this.url);
        this.sse.addEventListener('message', (event) => {
            var data = JSON.parse(event.data);
            this.cols = data.cols;
            this.rows = data.rows;
            this.field = data.field;
            this.preview = data.preview;
            this.draw();
        });
    }

    // Commands to send to server (to be implemented later)
    moveLeft() {
        console.log('moveLeft');
    }

    moveRight() {
        console.log('moveRight');
    }

    rotateLeft() {
        console.log('rotateLeft');
    }

    rotateRight() {
        console.log('rotateRight');
    }

    drop() {
        console.log('drop');
    }

    down() {
        console.log('down');
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
            }
        }
    }

    drawExplosion(x, y, h, w) {
        var ctx = self.ctx;
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
        let color = '#f2f2f2';
        const figureColors = new Map([
            [TetrisClient.CellTypeI, '#00FFFF'],
            [TetrisClient.CellTypeJ, '#0000FF'],
            [TetrisClient.CellTypeL, '#FFA500'],
            [TetrisClient.CellTypeO, '#FFFF00'],
            [TetrisClient.CellTypeS, '#00FF00'],
            [TetrisClient.CellTypeT, '#800080'],
            [TetrisClient.CellTypeZ, '#FF0000'],
        ]);
        if (figureColors.has(cellState)) {
            ctx.fillStyle = figureColors.get(cellState);
            ctx.fillRect(x * size + padding + offsetX, y * size + padding + offsetY, size - 2 * padding, size - 2 * padding);
        } else if (cellState === TetrisClient.CellTypeBlasted) {
            drawExplosion(ctx, x * size + offsetX, y * size + offsetY, size, size);
        }
    }

    draw() {
        const rows = this.rows;
        const cols = this.cols;
        const cellSize = Math.floor(ctx.canvas.height / (rows + 1));
        const gameWidth = cols * cellSize;
        const offsetX = Math.floor((ctx.canvas.width - gameWidth) / 2); // Calculate horizontal offset
        const offsetY = cellSize; // Add offset for the bottom wall

        ctx.fillStyle = '#333333';
        ctx.fillRect(offsetX - cellSize, 0, cellSize, ctx.canvas.height); // Adjust left wall position
        ctx.fillRect(offsetX + gameWidth, 0, cellSize, ctx.canvas.height); // Adjust right wall position
        ctx.fillRect(offsetX, ctx.canvas.height - offsetY, gameWidth, offsetY);

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cellState = this.field[row][col];
                this.drawCell(col, row, cellSize, cellState, offsetX, 0);
            }
        }
    }
}
