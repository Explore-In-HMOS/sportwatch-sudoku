import router from '@system.router';

export default {
    data: {
        board: [],
        initialState: [],
        solution: [],
        timeText: "00:00",
        difficultyName: "EASY",
        selectedLevel: 1,
        seconds: 0,
        timerRef: null,
        isWon: false
    },
    onInit() {
        if (this.selectedLevel === undefined) {
            this.selectedLevel = 1;
        }

        const levelNames = ["", "EASY", "MEDIUM", "HARD"];
        this.difficultyName = levelNames[this.selectedLevel] || "EASY";

        this.startNewGame();
    },

    isValid(grid, row, col, val) {
        for (let i = 0; i < 6; i++) {
            if (grid[row][i] === val || grid[i][col] === val) {
                return false;
            }
        }
        const startRow = Math.floor(row / 2) * 2;
        const startCol = Math.floor(col / 3) * 3;
        for (let r = startRow; r < startRow + 2; r++) {
            for (let c = startCol; c < startCol + 3; c++) {
                if (grid[r][c] === val) {
                    return false;
                }
            }
        }
        return true;
    },

    fillGrid(grid) {
        for (let i = 0; i < 36; i++) {
            const row = Math.floor(i / 6);
            const col = i % 6;
            if (grid[row][col] === 0) {
                const numbers = [1, 2, 3, 4, 5, 6].sort(function () {
                    return Math.random() - 0.5
                });
                for (let n = 0; n < 6; n++) {
                    const num = numbers[n];
                    if (this.isValid(grid, row, col, num)) {
                        grid[row][col] = num;
                        if (this.fillGrid(grid)) {
                            return true;
                        }
                        grid[row][col] = 0;
                    }
                }
                return false;
            }
        }
        return true;
    },

    startNewGame() {
        if (this.timerRef) {
            clearInterval(this.timerRef);
        }
        this.seconds = 0;
        this.timeText = "00:00";
        this.isWon = false;

        const matrix = [];
        for (let r = 0; r < 6; r++) {
            matrix[r] = [0, 0, 0, 0, 0, 0];
        }
        this.fillGrid(matrix);

        const solvedFlat = [];
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 6; j++) {
                solvedFlat.push(matrix[i][j]);
            }
        }

        this.solution = [];
        for (let s = 0; s < 36; s++) {
            this.solution.push({ value: solvedFlat[s], isFixed: true, isError: false });
        }

        let threshold = 0.6;
        if (this.selectedLevel === 2) {
            threshold = 0.45;
        }
        if (this.selectedLevel === 3) {
            threshold = 0.3;
        }

        const puzzleBoard = [];
        for (let k = 0; k < 36; k++) {
            const val = solvedFlat[k];
            const isVisible = Math.random() < threshold;
            puzzleBoard.push({
                value: isVisible ? val : 0,
                isFixed: isVisible,
                isError: false
            });
        }
        this.board = puzzleBoard;
        this.initialState = JSON.parse(JSON.stringify(puzzleBoard));
        this.startTimer();
    },

    checkBoardConflicts() {
        const list = JSON.parse(JSON.stringify(this.board));
        for (let a = 0; a < 36; a++) {
            list[a].isError = false;
        }
        for (let i = 0; i < 36; i++) {
            const val = list[i].value;
            if (val === 0) {
                continue;
            }
            const r = Math.floor(i / 6), c = i % 6;
            for (let j = 0; j < 36; j++) {
                if (i === j || list[j].value !== val) {
                    continue;
                }
                const r2 = Math.floor(j / 6), c2 = j % 6;
                const bR1 = Math.floor(r / 2), bC1 = Math.floor(c / 3);
                const bR2 = Math.floor(r2 / 2), bC2 = Math.floor(c2 / 3);
                if (r === r2 || c === c2 || (bR1 === bR2 && bC1 === bC2)) {
                    list[i].isError = true;
                }
            }
        }
        this.board = list;
    },

    handleTap(index) {
        if (this.board[index].isFixed || this.isWon) {
            return;
        }
        const currentBoard = JSON.parse(JSON.stringify(this.board));
        const nextVal = currentBoard[index].value + 1;
        currentBoard[index].value = nextVal > 6 ? 0 : nextVal;
        this.board = currentBoard;
        const self = this;
        setTimeout(function () {
            self.checkBoardConflicts();
            self.checkWinCondition();
        }, 50);
    },

    checkWinCondition() {
        let complete = true;
        for (let i = 0; i < 36; i++) {
            if (this.board[i].value === 0 || this.board[i].isError) {
                complete = false;
                break;
            }
        }
        if (complete) {
            this.isWon = true;
            if (this.timerRef) {
                clearInterval(this.timerRef);
            }
        }
    },

    startTimer() {
        const self = this;
        this.timerRef = setInterval(function () {
            self.seconds++;
            const m = Math.floor(self.seconds / 60);
            const s = self.seconds % 60;
            const displayMin = m < 10 ? `0${m}` : `${m}`;
            const displaySec = s < 10 ? `0${s}` : `${s}`;
            self.timeText = `${displayMin}:${displaySec}`;
        }, 1000);
    },

    clearSudoku() {
        if (this.isWon) {
            return;
        }
        this.board = JSON.parse(JSON.stringify(this.initialState));
    },

    finishSudoku() {
        if (this.timerRef) {
            clearInterval(this.timerRef);
        }
        router.replace({ uri: 'pages/level/level' });
    }
}