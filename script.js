import { db } from "./firebase.js";
import {
    ref,
    set,
    get,
    update,
    remove,
    onValue
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// ======================================================
// TIC TAC TOE PRO V3
// DOM ELEMENTS
// ======================================================

// SCREENS
const homeScreen = document.getElementById("homeScreen");
const difficultyScreen = document.getElementById("difficultyScreen");
const onlineScreen = document.getElementById("onlineScreen");
const gameScreen = document.getElementById("gameScreen");

// HOME BUTTONS
const playFriend = document.getElementById("playFriend");
const playAI = document.getElementById("playAI");
const onlineBtn = document.getElementById("onlineBtn");

// AI BUTTONS
const easyBtn = document.getElementById("easyBtn");
const mediumBtn = document.getElementById("mediumBtn");
const hardBtn = document.getElementById("hardBtn");
const backBtn = document.getElementById("backBtn"); // Fixed: Missing Variable Added

// GAME BUTTONS
const restartBtn = document.getElementById("restart");
const homeBtn = document.getElementById("homeBtn");
const resetScoreBtn = document.getElementById("resetScoreBtn");
const themeBtn = document.getElementById("themeBtn");

// ONLINE BUTTONS
const createRoomBtn = document.getElementById("createRoomBtn");
const joinRoomBtn = document.getElementById("joinRoomBtn");
const copyRoomBtn = document.getElementById("copyRoomBtn");
const backFromOnlineBtn = document.getElementById("backFromOnlineBtn");

// ROOM
const roomCode = document.getElementById("roomCode");
const roomInfo = document.getElementById("roomInfo");
const roomCodeText = document.getElementById("roomCodeText");

// CHAT
const chatContainer = document.getElementById("chatContainer");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendChatBtn = document.getElementById("sendChatBtn");

// BOARD & UI
const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const scoreX = document.getElementById("scoreX");
const scoreO = document.getElementById("scoreO");
const xTimerText = document.getElementById("xTimer");
const oTimerText = document.getElementById("oTimer");
const gameStartOverlay = document.getElementById("gameStartOverlay");
const gameModeText = document.getElementById("gameModeText");

// SPEECH BUBBLES
const bubbleX = document.getElementById("bubbleX");
const bubbleO = document.getElementById("bubbleO");

// ======================================================
// GAME VARIABLES
// ======================================================

let board = ["", "", "", "", "", "", "", "", ""];
let running = false;
let currentPlayer = "X";
let gameMode = "friend"; // friend / ai / online
let aiDifficulty = "easy";

// TIMER
const TURN_TIME = 15;
let timer = TURN_TIME;
let timerInterval = null;
let xTimer = TURN_TIME;
let oTimer = TURN_TIME;

// SCORE
let xScore = Number(localStorage.getItem("xScore")) || 0;
let oScore = Number(localStorage.getItem("oScore")) || 0;

// ONLINE
let currentRoom = "";
let mySymbol = "";
let lastTurnPlayer = "";
let gameStarted = false;
let timerX = null;
let timerO = null;

// ======================================================
// SAFE AUDIO SYSTEM (Error Free)
// ======================================================
const clickSound = new Audio("assets/sounds/click.mp3");
const winSound = new Audio("assets/sounds/win.mp3");
const drawSound = new Audio("assets/sounds/draw.mp3");

clickSound.volume = 0.5;
winSound.volume = 0.7;
drawSound.volume = 0.6;

function safePlaySound(sound) {
    if (sound && sound.readyState >= 1) {
        sound.currentTime = 0;
        sound.play().catch(err => console.log("Audio block/missing:", err));
    }
}

// WIN PATTERNS
const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

// INITIAL SETUP
scoreX.textContent = xScore;
scoreO.textContent = oScore;
statusText.textContent = "Player X Turn";
gameModeText.textContent = "Mode : Friend";
xTimerText.textContent = "⏱️15";
oTimerText.textContent = "⏱️15";

// ======================================================
// HOME & UI NAVIGATION
// ======================================================

playFriend.addEventListener("click", () => {
    gameMode = "friend";
    gameModeText.textContent = "Mode : Friend";
    homeScreen.style.display = "none";
    gameScreen.style.display = "block";
    restartGame();
});

playAI.addEventListener("click", () => {
    homeScreen.style.display = "none";
    difficultyScreen.style.display = "flex";
});

easyBtn.addEventListener("click", () => { startAIMode("easy"); });
mediumBtn.addEventListener("click", () => { startAIMode("medium"); });
hardBtn.addEventListener("click", () => { startAIMode("hard"); });

function startAIMode(diff) {
    aiDifficulty = diff;
    gameMode = "ai";
    gameModeText.textContent = `Mode : AI (${diff.toUpperCase()})`;
    difficultyScreen.style.display = "none";
    gameScreen.style.display = "block";
    restartGame();
}

if (backBtn) {
    backBtn.addEventListener("click", () => {
        difficultyScreen.style.display = "none";
        homeScreen.style.display = "flex";
    });
}

// ======================================================
// UTILITIES
// ======================================================

function updateScore() {
    scoreX.textContent = xScore;
    scoreO.textContent = oScore;
    localStorage.setItem("xScore", xScore);
    localStorage.setItem("oScore", oScore);
}

function clearBoard() {
    board = ["", "", "", "", "", "", "", "", ""];
    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove("win");
    });
}

function resetBoard() {
    clearBoard();
    currentPlayer = "X";
    running = true;
    statusText.textContent = "Player X Turn";
}

function resetTimers() {
    timer = TURN_TIME;
    xTimer = TURN_TIME;
    oTimer = TURN_TIME;
    xTimerText.textContent = "⏱️15";
    oTimerText.textContent = "⏱️15";
}

function stopTimer() {
    clearInterval(timerInterval);
}

// ======================================================
// TIMER ENGINE
// ======================================================

function updateTimer() {
    if (currentPlayer === "X") {
        xTimerText.textContent = "⏱️" + timer;
        oTimerText.textContent = "⏱️15";
    } else {
        oTimerText.textContent = "⏱️" + timer;
        xTimerText.textContent = "⏱️15";
    }
}

function startTimer() {
    if (gameMode === "friend") return;
    clearInterval(timerInterval);
    timer = TURN_TIME;
    updateTimer();

    timerInterval = setInterval(() => {
        timer--;
        updateTimer();
        if (timer <= 0) {
            clearInterval(timerInterval);
            autoRandomMove();
        }
    }, 1000);
}

function autoRandomMove() {
    if (!running || gameMode === "friend") return;
    let empty = [];
    board.forEach((val, idx) => { if (val === "") empty.push(idx); });

    if (empty.length === 0) return;
    const randomCell = empty[Math.floor(Math.random() * empty.length)];

    if (gameMode === "online" && currentPlayer === mySymbol) {
        onlineMove(randomCell);
    } else if (gameMode === "ai") {
        updateCell(randomCell);
    }
}

function changePlayer() {
    if (!running) return;
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusText.textContent = "Player " + currentPlayer + " Turn";

    if (gameMode === "ai" || gameMode === "online") {
        startTimer();
    } else {
        stopTimer();
        xTimerText.textContent = "⏱️15";
        oTimerText.textContent = "⏱️15";
    }

    if (gameMode === "ai" && currentPlayer === "O") {
        setTimeout(() => { aiMove(); }, 500);
    }
}

// ======================================================
// GAME CONTROLS & BOARD EVENTS
// ======================================================

cells.forEach(cell => cell.addEventListener("click", cellClicked));

function cellClicked() {
    const index = Number(this.dataset.index);
    if (!running || board[index] !== "") return;

    if (gameMode === "online") {
        onlineMove(index);
        return;
    }
    updateCell(index);
}

function updateCell(index) {
    board[index] = currentPlayer;
    cells[index].textContent = currentPlayer;
    safePlaySound(clickSound);
    checkWinner();
}

function checkWinner() {
    let won = false;
    let winPattern = [];

    for (let pattern of winPatterns) {
        const a = board[pattern[0]];
        const b = board[pattern[1]];
        const c = board[pattern[2]];
        if (a === "") continue;
        if (a === b && b === c) {
            won = true;
            winPattern = pattern;
            break;
        }
    }

    if (won) {
        running = false;
        stopTimer();
        winPattern.forEach(index => cells[index].classList.add("win"));
        statusText.textContent = "🎉 Player " + currentPlayer + " Wins!";
        safePlaySound(winSound);

        if (currentPlayer === "X") xScore++;
        else oScore++;
        updateScore();
        return;
    }

    if (!board.includes("")) {
        running = false;
        stopTimer();
        statusText.textContent = "🤝 Match Draw";
        safePlaySound(drawSound);
        return;
    }

    changePlayer();
}

function restartGame() {
    clearBoard();
    resetTimers();
    running = true;
    currentPlayer = "X";
    statusText.textContent = "Player X Turn";
    if (gameMode === "ai" || gameMode === "online") startTimer();
}

// ======================================================
// AI LOGIC (MINIMAX HARD)
// ======================================================

function aiMove() {
    if (!running || currentPlayer !== "O") return;
    let move = -1;

    if (aiDifficulty === "easy") move = getRandomMove();
    else if (aiDifficulty === "medium") {
        move = findWinningMove("O");
        if (move === -1) move = findWinningMove("X");
        if (move === -1 && board[4] === "") move = 4;
        if (move === -1) move = getRandomMove();
    } else {
        move = getBestMove();
    }

    if (move !== -1) updateCell(move);
}

function getRandomMove() {
    let empty = [];
    board.forEach((val, idx) => { if (val === "") empty.push(idx); });
    return empty.length === 0 ? -1 : empty[Math.floor(Math.random() * empty.length)];
}

function findWinningMove(player) {
    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        const values = [board[a], board[b], board[c]];
        if (values.filter(x => x === player).length === 2 && values.includes("")) {
            if (board[a] === "") return a;
            if (board[b] === "") return b;
            if (board[c] === "") return c;
        }
    }
    return -1;
}

function checkWinnerForBoard(tempBoard) {
    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (tempBoard[a] !== "" && tempBoard[a] === tempBoard[b] && tempBoard[a] === tempBoard[c]) {
            return tempBoard[a];
        }
    }
    return !tempBoard.includes("") ? "draw" : null;
}

function getEmptyCells(tempBoard) {
    let empty = [];
    tempBoard.forEach((val, idx) => { if (val === "") empty.push(idx); });
    return empty;
}

function minimax(tempBoard, isMax) {
    let result = checkWinnerForBoard(tempBoard);
    if (result === "O") return 10;
    if (result === "X") return -10;
    if (result === "draw") return 0;

    if (isMax) {
        let best = -Infinity;
        for (let index of getEmptyCells(tempBoard)) {
            tempBoard[index] = "O";
            best = Math.max(best, minimax(tempBoard, false));
            tempBoard[index] = "";
        }
        return best;
    } else {
        let best = Infinity;
        for (let index of getEmptyCells(tempBoard)) {
            tempBoard[index] = "X";
            best = Math.min(best, minimax(tempBoard, true));
            tempBoard[index] = "";
        }
        return best;
    }
}

function getBestMove() {
    let bestScore = -Infinity;
    let move = -1;
    for (let index of getEmptyCells(board)) {
        board[index] = "O";
        let score = minimax(board, false);
        board[index] = "";
        if (score > bestScore) {
            bestScore = score;
            move = index;
        }
    }
    return move;
}

// ======================================================
// ONLINE MULTIPLAYER
// ======================================================

onlineBtn.addEventListener("click", () => {
    homeScreen.style.display = "none";
    onlineScreen.style.display = "flex";
});

backFromOnlineBtn.addEventListener("click", () => {
    onlineScreen.style.display = "none";
    homeScreen.style.display = "flex";
});

createRoomBtn.addEventListener("click", createRoom);

async function createRoom() {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    currentRoom = roomId;
    mySymbol = "X";

    await set(ref(db, "rooms/" + roomId), {
        board: ["", "", "", "", "", "", "", "", ""],
        currentPlayer: "X",
        playerX: true,
        playerO: false,
        gameStarted: false,
        winner: ""
    });

    gameMode = "online";
    gameModeText.textContent = "Mode : Online";
    onlineScreen.style.display = "none";
    gameScreen.style.display = "block";
    chatContainer.style.display = "block";
    roomInfo.style.display = "block";
    roomCodeText.textContent = roomId;
    copyRoomBtn.style.display = "inline-block";

    resetBoard();
    running = false;
    statusText.textContent = "⏳ Waiting for Player 2";

    startRoomListener();
    startChatListener();
}

joinRoomBtn.addEventListener("click", joinRoom);

async function joinRoom() {
    const roomId = roomCode.value.trim().toUpperCase();
    if (roomId === "") { alert("Enter Room Code"); return; }

    const roomRef = ref(db, "rooms/" + roomId);
    const snapshot = await get(roomRef);

    if (!snapshot.exists()) { alert("Room Not Found"); return; }
    if (snapshot.val().playerO) { alert("Room Full"); return; }

    await update(roomRef, { playerO: true, gameStarted: true });

    currentRoom = roomId;
    mySymbol = "O";
    gameMode = "online";
    gameModeText.textContent = "Mode : Online";
    onlineScreen.style.display = "none";
    gameScreen.style.display = "block";
    chatContainer.style.display = "block";
    roomInfo.style.display = "block";
    roomCodeText.textContent = roomId;
    copyRoomBtn.style.display = "inline-block";

    resetBoard();
    startRoomListener();
    startChatListener();
}

function startRoomListener() {
    if (!currentRoom) return;
    const roomRef = ref(db, "rooms/" + currentRoom);

    onValue(roomRef, (snapshot) => {
        if (!snapshot.exists()) return;
        const data = snapshot.val();

        if (!data.gameStarted) {
            running = false;
            stopTimer();
            resetTimers();
            statusText.textContent = "⏳ Waiting for Player 2...";
            return;
        }

        if (!gameStarted && data.gameStarted) {
            gameStarted = true;
            gameStartOverlay.style.display = "flex";
            running = false;
            stopTimer();
            setTimeout(() => {
                gameStartOverlay.style.display = "none";
                running = true;
                currentPlayer = data.currentPlayer;
                startTimer();
            }, 2000);
        }

        board = [...data.board];
        currentPlayer = data.currentPlayer;

        for (let i = 0; i < 9; i++) cells[i].textContent = board[i];

        if ((mySymbol === "X" && !data.playerO) || (mySymbol === "O" && !data.playerX)) {
            running = false;
            stopTimer();
            statusText.textContent = "❌ Opponent Left";
            setTimeout(() => {
                alert("Opponent Left The Room");
                gameScreen.style.display = "none";
                homeScreen.style.display = "flex";
                currentRoom = "";
                mySymbol = "";
            }, 1500);
            return;
        }

        let winner = "";
        let winCells = [];
        for (let pattern of winPatterns) {
            const a = board[pattern[0]], b = board[pattern[1]], c = board[pattern[2]];
            if (a !== "" && a === b && b === c) {
                winner = a;
                winCells = pattern;
                break;
            }
        }

        if (winner !== "") {
            running = false;
            stopTimer();
            statusText.textContent = "🏆 Player " + winner + " Wins!";
            winCells.forEach(idx => cells[idx].classList.add("win"));
            safePlaySound(winSound);
            return;
        }

        if (!board.includes("")) {
            running = false;
            stopTimer();
            statusText.textContent = "🤝 Match Draw";
            safePlaySound(drawSound);
            return;
        }

        statusText.textContent = "Player " + currentPlayer + " Turn";
        if (running && currentPlayer !== lastTurnPlayer) {
            lastTurnPlayer = currentPlayer;
            startTimer();
        }
    });
}

async function onlineMove(index) {
    if (currentPlayer !== mySymbol || board[index] !== "") return;
    let newBoard = [...board];
    newBoard[index] = mySymbol;
    let nextPlayer = mySymbol === "X" ? "O" : "X";

    await update(ref(db, "rooms/" + currentRoom), {
        board: newBoard,
        currentPlayer: nextPlayer
    });
}

// ======================================================
// CHAT & SPEECH BUBBLES
// ======================================================

function showSpeechBubble(sender, text) {
    const bubble = sender === "X" ? bubbleX : bubbleO;
    if (!bubble) return;

    bubble.textContent = text;
    bubble.style.display = "block";

    if (sender === "X") {
        clearTimeout(timerX);
        timerX = setTimeout(() => { bubble.style.display = "none"; }, 3500);
    } else {
        clearTimeout(timerO);
        timerO = setTimeout(() => { bubble.style.display = "none"; }, 3500);
    }
}

sendChatBtn.addEventListener("click", sendChat);
chatInput.addEventListener("keypress", (e) => { if (e.key === "Enter") sendChat(); });

async function sendChat() {
    const message = chatInput.value.trim();
    if (message === "" || !currentRoom) return;

    const msgId = "msg_" + Date.now();
    await set(ref(db, "rooms/" + currentRoom + "/chat/" + msgId), {
        sender: mySymbol,
        text: message
    });
    chatInput.value = "";
}

function startChatListener() {
    if (!currentRoom) return;
    onValue(ref(db, "rooms/" + currentRoom + "/chat"), (snapshot) => {
        chatMessages.innerHTML = "";
        if (snapshot.exists()) {
            const chats = snapshot.val();
            const msgList = Object.values(chats);

            msgList.forEach((msg) => {
                if (!msg || !msg.text) return;
                const msgElement = document.createElement("div");
                msgElement.style.margin = "4px 0";
                msgElement.style.padding = "4px 8px";
                msgElement.style.borderRadius = "4px";

                if (msg.sender === mySymbol) {
                    msgElement.style.textAlign = "right";
                    msgElement.style.color = "#007bff";
                    msgElement.textContent = "You: " + msg.text;
                } else {
                    msgElement.style.textAlign = "left";
                    msgElement.style.color = "#28a745";
                    msgElement.textContent = "Player " + msg.sender + ": " + msg.text;
                }
                chatMessages.appendChild(msgElement);
            });

            chatMessages.scrollTop = chatMessages.scrollHeight;
            const lastMsg = msgList[msgList.length - 1];
            if (lastMsg && lastMsg.sender && lastMsg.text) {
                showSpeechBubble(lastMsg.sender, lastMsg.text);
            }
        }
    });
}

copyRoomBtn.addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(currentRoom);
        alert("✅ Room Code Copied");
    } catch {
        prompt("Copy Room Code", currentRoom);
    }
});

restartBtn.addEventListener("click", () => {
    if (gameMode === "friend" || gameMode === "ai") {
        restartGame();
    } else if (gameMode === "online") {
        update(ref(db, "rooms/" + currentRoom), {
            board: ["", "", "", "", "", "", "", "", ""],
            currentPlayer: "X"
        });
    }
});
