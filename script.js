// script.js - PvP + PvAI with mode selection

const cells = Array.from(document.querySelectorAll(".cell"));
const statusText = document.getElementById("status");
const resetBtn = document.getElementById("reset");

const pvpBtn = document.getElementById("pvp-btn");
const pvaiBtn = document.getElementById("pvai-btn");

let vsAI = false; // default: Player vs Player
let currentPlayer = "X";
let gameActive = true;
let board = ["", "", "", "", "", "", "", "", ""];

const winningCombinations = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

// Mode selection
pvpBtn.addEventListener("click", () => {
    vsAI = false;
    pvpBtn.classList.add("selected");
    pvaiBtn.classList.remove("selected");
    resetGame();
});

pvaiBtn.addEventListener("click", () => {
    vsAI = true;
    pvaiBtn.classList.add("selected");
    pvpBtn.classList.remove("selected");
    resetGame();
});

// Attach cell click listeners
cells.forEach(cell => cell.addEventListener("click", handleClick));
resetBtn.addEventListener("click", resetGame);

   function handleClick(e) {
    const index = parseInt(e.target.getAttribute("data-index"), 10);

    // Prevent click if game over or cell filled
    if (!gameActive || board[index] !== "" || (vsAI && currentPlayer === "O")) return;

    makeMove(index, currentPlayer);

    const winInfo = checkWinner();
    if (winInfo.won) {
        gameActive = false;
        statusText.innerText = currentPlayer === "O" && vsAI ? "AI Wins!" : `Player ${currentPlayer} Wins!`;
        winInfo.combo.forEach(i => cells[i].classList.add("win"));
        return;
    }
    if (winInfo.draw) {
        gameActive = false;
        statusText.innerText = "Draw Game!";
        return;
    }

    // Switch turn
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusText.innerText = `Player ${currentPlayer}'s Turn`;

    // AI move
    if (vsAI && currentPlayer === "O" && gameActive) {
        setTimeout(() => {
            aiMove();
        }, 300);
    }
}



function makeMove(index, player) {
    board[index] = player;
    cells[index].innerText = player;
}

    function aiMove() {
    // 1. Check if AI can win
    let move = findBestMove("O");
    // 2. If not, block player if they can win next
    if (move === null) move = findBestMove("X");
    // 3. If neither, pick random
    if (move === null) {
        const emptyIndices = board.map((v,i) => v === "" ? i : null).filter(v => v !== null);
        move = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }

    makeMove(move, "O");

    const winInfo = checkWinner();
    if (winInfo.won) {
        gameActive = false;
        statusText.innerText = "AI Wins!";
        winInfo.combo.forEach(i => cells[i].classList.add("win"));
        return;
    }
    if (winInfo.draw) {
        gameActive = false;
        statusText.innerText = "Draw Game!";
        return;
    }

    currentPlayer = "X";
    statusText.innerText = `Player ${currentPlayer}'s Turn`;
}

// helper: check for immediate win or block
function findBestMove(player) {
    for (let combo of winningCombinations) {
        const [a,b,c] = combo;
        const values = [board[a], board[b], board[c]];
        if (values.filter(v => v === player).length === 2 && values.includes("")) {
            return combo[values.indexOf("")]; // return empty index to win/block
        }
    }
    return null;
}



function checkWinner() {
    for (let combo of winningCombinations) {
        const [a,b,c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return { won: true, combo: combo, draw: false };
        }
    }
    if (!board.includes("")) return { won: false, combo: null, draw: true };
    return { won: false, combo: null, draw: false };
}

function resetGame() {
    board = ["", "", "", "", "", "", "", "", ""];
    gameActive = true;
    currentPlayer = "X";
    statusText.innerText = "Player X's Turn";
    cells.forEach(cell => {
        cell.innerText = "";
        cell.classList.remove("win");
    });
}
