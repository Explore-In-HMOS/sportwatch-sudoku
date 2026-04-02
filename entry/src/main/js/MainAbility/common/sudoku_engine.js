const SIZE = 6;
const BOX_ROWS = 2;
const BOX_COLS = 3;

export function isValidPlacement(grid, row, col, val) {
    for (let c = 0; c < SIZE; c++) {
        if (grid[row][c] === val) {
            return false;
        }
    }
    for (let r = 0; r < SIZE; r++) {
        if (grid[r][col] === val) {
            return false;
        }
    }
    const boxRow = Math.floor(row / BOX_ROWS) * BOX_ROWS;
    const boxCol = Math.floor(col / BOX_COLS) * BOX_COLS;
    for (let r = boxRow; r < boxRow + BOX_ROWS; r++) {
        for (let c = boxCol; c < boxCol + BOX_COLS; c++) {
            if (grid[r][c] === val) {
                return false;
            }
        }
    }
    return true;
}

export function checkConflicts(board) {
    board.forEach(cell => cell.isError = false);

    for (let i = 0; i < 36; i++) {
        const val = board[i].value;
        if (val === 0) {
            continue;
        }

        const r = Math.floor(i / SIZE);
        const c = i % SIZE;

        let simpleGrid = [];
        for (let j = 0; j < 6; j++) {
            simpleGrid.push(board.slice(j * 6, j * 6 + 6).map(x => x.value));
        }

        const backup = simpleGrid[r][c];
        simpleGrid[r][c] = 0;

        if (!isValidPlacement(simpleGrid, r, c, backup)) {
            board[i].isError = true;
        }
    }
    return board;
}

export function checkWin(board) {
    for (let i = 0; i < 36; i++) {
        if (board[i].value === 0 || board[i].isError) {
            return false;
        }
    }
    return true;
}