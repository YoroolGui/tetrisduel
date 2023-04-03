function drawCell(game, ctx, x, y, size, cellState) {
    let color = '#f2f2f2';
    const figureColors = new Map([
        [game.FIGURE_I, '#00FFFF'],
        [game.FIGURE_J, '#0000FF'],
        [game.FIGURE_L, '#FFA500'],
        [game.FIGURE_O, '#FFFF00'],
        [game.FIGURE_S, '#00FF00'],
        [game.FIGURE_T, '#800080'],
        [game.FIGURE_Z, '#FF0000']
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
            drawCell(game, ctx, col, rows - 1 - row, cellSize, cellState);
        }
    }
}
