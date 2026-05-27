let boardState = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let isGameActive = false;
let gameMode = "2players";

// Variables pour gérer l'alternance du premier joueur
let firstPlayerOfMatch = "X"; 

const winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Lignes
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colonnes
    [0, 4, 8], [2, 4, 6]             // Diagonales
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
    firstPlayerOfMatch = "X"; // Au tout début, X commence toujours
    resetGame();
});

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartBtn.addEventListener('click', () => {
    // Quand on clique sur Recommencer, on alterne le joueur qui commence la partie
    firstPlayerOfMatch = firstPlayerOfMatch === "X" ? "O" : "X";
    resetGame();
});

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

    // Si c'est au tour de l'IA de jouer
    if (gameMode === "ai" && currentPlayer === "O" && isGameActive) {
        setTimeout(aiMove, 400);
    }
}

function makeMove(index, player) {
    boardState[index] = player;
    cells[index].innerText = player;
}

function aiMove() {
    let availSpots = boardState.map((val, i) => val === "" ? i : null).filter(val => val !== null);
    if (availSpots.length === 0 || !isGameActive) return;

    let moveToMake = -1;

    // 1. STRATÉGIE OFFENSIVE : L'IA regarde si elle peut gagner immédiatement
    for (let spot of availSpots) {
        let boardCopy = [...boardState];
        boardCopy[spot] = "O";
        if (checkWin(boardCopy, "O")) {
            moveToMake = spot;
            break;
        }
    }

    // 2. STRATÉGIE DÉFENSIVE : Si elle ne peut pas gagner, elle regarde si elle doit TE bloquer
    if (moveToMake === -1) {
        for (let spot of availSpots) {
            let boardCopy = [...boardState];
            boardCopy[spot] = "X"; // Elle imagine que tu joues là
            if (checkWin(boardCopy, "X")) {
                moveToMake = spot; // Elle te contre !
                break;
            }
        }
    }

    // 3. Par défaut, si pas de danger ni de victoire immédiate, elle choisit le centre ou un coin
    if (moveToMake === -1) {
        if (availSpots.includes(4)) {
            moveToMake = 4; // Le centre est stratégique
        } else {
            moveToMake = availSpots[Math.floor(Math.random() * availSpots.length)];
        }
    }

    makeMove(moveToMake, "O");

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

function checkWin(board, player) {
    return winConditions.some(cond => cond.every(idx => board[idx] === player));
}

function endGame(message, winner) {
    isGameActive = false;
    setTimeout(() => alert(message), 100);
    
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
    currentPlayer = firstPlayerOfMatch; // Applique le joueur qui doit commencer
    cells.forEach(cell => cell.innerText = "");

    // Si c'est l'IA ("O") qui doit commencer la partie
    if (gameMode === "ai" && currentPlayer === "O") {
        setTimeout(aiMove, 400);
    }
}
