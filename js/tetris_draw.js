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
        [TetrisGame.BLASTED_CELL, '#FFFFFF']
    ]);
    if (figureColors.has(cellState)) {
        color = figureColors.get(cellState);
    }
    ctx.fillStyle = color;
    ctx.fillRect(x * size + padding + offsetX, y * size + padding + offsetY, size - 2 * padding, size - 2 * padding);
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
            const cellState = game.getCellState(row, col);
            drawCell(ctx, col, row, cellSize, cellState, offsetX, 0);
        }
    }
}
