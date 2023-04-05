function drawExplosion(ctx, x, y, h, w) {
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

function drawCell(ctx, x, y, size, cellState, offsetX, offsetY) {
    const padding = 1;
    let color = '#f2f2f2';
    const figureColors = new Map([
        [TetrisGame.FIGURE_I, '#00FFFF'],
        [TetrisGame.FIGURE_J, '#0000FF'],
        [TetrisGame.FIGURE_L, '#FFA500'],
        [TetrisGame.FIGURE_O, '#FFFF00'],
        [TetrisGame.FIGURE_S, '#00FF00'],
        [TetrisGame.FIGURE_T, '#800080'],
        [TetrisGame.FIGURE_Z, '#FF0000'],
    ]);
    if (figureColors.has(cellState)) {
        ctx.fillStyle = figureColors.get(cellState);
        ctx.fillRect(x * size + padding + offsetX, y * size + padding + offsetY, size - 2 * padding, size - 2 * padding);
    } else if (cellState === TetrisGame.BLASTED_CELL) {
        drawExplosion(ctx, x * size + offsetX, y * size + offsetY, size, size);
    }
}

function drawTetrisGame(game, ctx) {
    const rows = game.getRows();
    const cols = game.getColumns();
    const cellSize = Math.floor(ctx.canvas.height / (rows + 1));
    const offsetX = cellSize; // Add offset for the left wall
    const offsetY = cellSize; // Add offset for the bottom wall

    ctx.fillStyle = '#333333';
    ctx.fillRect(0, 0, offsetX, ctx.canvas.height);
    ctx.fillRect((cols * cellSize) + offsetX, 0, offsetX, ctx.canvas.height);
    ctx.fillRect(offsetX, ctx.canvas.height - offsetY, cols * cellSize, offsetY);

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const cellState = game.getCellStateWithFigure(row, col);
            drawCell(ctx, col, row, cellSize, cellState, offsetX, 0);
        }
    }
}
