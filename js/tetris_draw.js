function drawCell(ctx, x, y, size, cellState) {
    let color = '#f2f2f2';
    const figureColors = new Map([
        [FIGURE_I, '#00FFFF'],
        [FIGURE_J, '#0000FF'],
        [FIGURE_L, '#FFA500'],
        [FIGURE_O, '#FFFF00'],
        [FIGURE_S, '#00FF00'],
        [FIGURE_T, '#800080'],
        [FIGURE_Z, '#FF0000']
    ]);
    if (figureColors.has(cellState)) {
        color = figureColors.get(cellState);
    }
    ctx.fillStyle = color;
    ctx.fillRect(x * size, y * size, size, size);
}

function drawTetrisGame(game, ctx) {
    const rows = game.getRows();
    const cols = game.getColumns();
    const cellSize = Math.floor(ctx.canvas.height / rows);

    ctx.fillStyle = '#333333';
    ctx.fillRect(0, 0, cellSize, ctx.canvas.height);
    ctx.fillRect((cols - 1) * cellSize, 0, cellSize, ctx.canvas.height);
    ctx.fillRect(cellSize, (rows - 1) * cellSize, (cols - 2) * cellSize, cellSize);

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const cellState = game.getCellState(row, col);
            drawCell(ctx, col, rows - 1 - row, cellSize, cellState);
        }
    }
}
