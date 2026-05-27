let boardState = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let isGameActive = false;
let gameMode = "2players";
let winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

const cells = document.querySelectorAll('.cell');
const modeSelect = document.getElementById('mode');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const boardEl = document.getElementById('board');
const setupEl = document.getElementById('setup');
const scoreboardEl = document.getElementById('scoreboard');

startBtn.addEventListener('click', () => {
    gameMode = modeSelect.value;
    setupEl.classList.add('hidden');
    boardEl.classList.remove('hidden');
    scoreboardEl.classList.remove('hidden');
    restartBtn.classList.remove('hidden');
    resetGame();
});

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartBtn.addEventListener('click', resetGame);

function handleCellClick(e) {
    const index = parseInt(e.target.getAttribute('data-index'));
    if (boardState[index] !== "" || !isGameActive) return;

    makeMove(index, currentPlayer);

    if (checkWin(boardState, currentPlayer)) {
        endGame(`${currentPlayer} a gagné !`, currentPlayer);
        return;
    }
    if (boardState.every(cell => cell !== "")) {
        endGame("Match nul !", null);
        return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";

    if (gameMode === "ai" && currentPlayer === "O" && isGameActive) {
        setTimeout(aiMove, 300);
    }
}

function makeMove(index, player) {
    boardState[index] = player;
    cells[index].innerText = player;
}

function aiMove() {
    let availSpots = boardState.map((val, i) => val === "" ? i : null).filter(val => val !== null);
    if (availSpots.length > 0) {
        // IA simple (aléatoire) pour tester rapidement sans bug de calcul
        let randomMove = availSpots[Math.floor(Math.random() * availSpots.length)];
        makeMove(randomMove, "O");

        if (checkWin(boardState, "O")) {
            endGame("L'IA a gagné !", "O");
            return;
        }
        if (boardState.every(cell => cell !== "")) {
            endGame("Match nul !", null);
            return;
        }
        currentPlayer = "X";
    }
}

function checkWin(board, player) {
    return winConditions.some(cond => cond.every(idx => board[idx] === player));
}

function endGame(message, winner) {
    isGameActive = false;
    alert(message);
    if (winner) {
        fetch('/api/scores/gagnant', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ joueur: winner })
        })
        .then(res => res.json())
        .then(data => {
            document.getElementById('score-x').innerText = data.scores.victoiresX;
            document.getElementById('score-o').innerText = data.scores.victoiresO;
        });
    }
}

function resetGame() {
    boardState = ["", "", "", "", "", "", "", "", ""];
    isGameActive = true;
    currentPlayer = "X";
    cells.forEach(cell => cell.innerText = "");
}
