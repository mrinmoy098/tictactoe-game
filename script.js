import { db } from "./firebase.js";
import {
    ref,
    set,
    get,
    update,
    remove,
    onValue,
    onDisconnect
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// ফোনের ব্রাউজারে সরাসরি সাউন্ড ফাইল আনলক করার কোড
document.addEventListener("touchstart", function() {
    ["click.mp3", "draw.mp3", "win.mp3"].forEach(file => {
        const a = new Audio(file);
        a.play().then(() => {
            a.pause();
            a.currentTime = 0;
        }).catch(() => {});
    });
}, { once: true });

// ======================================================
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
const backBtn = document.getElementById("backBtn"); // Fixed Missing Variable

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

// ROOM ELEMENTS
const roomCode = document.getElementById("roomCode");
const roomInfo = document.getElementById("roomInfo");
const roomCodeText = document.getElementById("roomCodeText");

// CHAT ELEMENTS
const chatContainer = document.getElementById("chatContainer");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendChatBtn = document.getElementById("sendChatBtn");

// BOARD & STATUS
const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");

// SCORE & TIMERS
const scoreX = document.getElementById("scoreX");
const scoreO = document.getElementById("scoreO");
const xTimerText = document.getElementById("xTimer");
const oTimerText = document.getElementById("oTimer");

// OVERLAYS & TEXTS
const gameStartOverlay = document.getElementById("gameStartOverlay");
const gameModeText = document.getElementById("gameModeText");

// ======================================================
// GAME VARIABLES
// ======================================================

let board = ["", "", "", "", "", "", "", "", ""];
let running = false;
let currentPlayer = "X";
let gameMode = "friend"; // friend / ai / online
let aiDifficulty = "easy";

const TURN_TIME = 15;
let timer = TURN_TIME;
let timerInterval = null;
let xTimer = TURN_TIME;
let oTimer = TURN_TIME;

let xScore = Number(localStorage.getItem("xScore")) || 0;
let oScore = Number(localStorage.getItem("oScore")) || 0;

let currentRoom = "";
let mySymbol = "";
let lastTurnPlayer = "";
let gameStarted = false;

// SOUNDS
const clickSound = new Audio("click.mp3");
const winSound = new Audio("win.mp3");
const drawSound = new Audio("draw.mp3");

clickSound.volume = 0.5;
winSound.volume = 0.7;
drawSound.volume = 0.6;

const winPatterns = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
];

// ======================================================
// INITIAL SETUP
// ======================================================

scoreX.textContent = xScore;
scoreO.textContent = oScore;
statusText.textContent = "Player X Turn";
gameModeText.textContent = "Mode : Friend";
xTimerText.textContent = "⏱️15";
oTimerText.textContent = "⏱️15";

// ======================================================
// EVENT LISTENERS & SCREEN NAVIGATION
// ======================================================

playFriend.addEventListener("click", () => {
    history.pushState({ inGame: true }, "");
    gameMode = "friend";
    gameModeText.textContent = "Mode : Friend";
    homeScreen.style.display = "none";
    gameScreen.style.display = "block";
    if (chatContainer) chatContainer.style.display = "none";
    if (roomInfo) roomInfo.style.display = "none";
    restartGame();
});

playAI.addEventListener("click", () => {
    history.pushState({ inGame: true }, "");
    homeScreen.style.display = "none";
    difficultyScreen.style.display = "flex";
});

easyBtn.addEventListener("click", () => {
    startAIGame("easy");
});

mediumBtn.addEventListener("click", () => {
    startAIGame("medium");
});

hardBtn.addEventListener("click", () => {
    startAIGame("hard");
});

function startAIGame(diff) {
    history.pushState({ inGame: true }, "");
    aiDifficulty = diff;
    gameMode = "ai";
    gameModeText.textContent = `Mode : AI (${diff.toUpperCase()})`;
    difficultyScreen.style.display = "none";
    gameScreen.style.display = "block";
    if (chatContainer) chatContainer.style.display = "none";
    if (roomInfo) roomInfo.style.display = "none";
    restartGame();
}

if (backBtn) {
    backBtn.addEventListener("click", () => {
        difficultyScreen.style.display = "none";
        homeScreen.style.display = "flex";
    });
}

// GAME ACTION BUTTONS (RESTART, HOME, RESET SCORE, THEME)
if (restartBtn) {
    restartBtn.addEventListener("click", () => {
        if (gameMode === "online" && currentRoom) {
            update(ref(db, "rooms/" + currentRoom), {
                board: ["", "", "", "", "", "", "", "", ""],
                currentPlayer: "X"
            });
        } else {
            restartGame();
        }
    });
}

if (homeBtn) {
    homeBtn.addEventListener("click", () => {
        stopTimer();
        running = false;
        gameScreen.style.display = "none";
        if (chatContainer) chatContainer.style.display = "none";
        if (roomInfo) roomInfo.style.display = "none";
        homeScreen.style.display = "flex";
    });
}

if (resetScoreBtn) {
    resetScoreBtn.addEventListener("click", () => {
        xScore = 0;
        oScore = 0;
        updateScore();
    });
}

if (themeBtn) {
    themeBtn.addEventListener("click", () => {
        document.body.classList.toggle("light-mode");
    });
}

// ======================================================
// UTILITY & TIMER ENGINE
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
    board.forEach((value, index) => {
        if (value === "") empty.push(index);
    });

    if (empty.length === 0) return;
    const randomCell = empty[Math.floor(Math.random() * empty.length)];

    if (gameMode === "online") {
        if (currentPlayer === mySymbol) {
            onlineMove(randomCell);
        }
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
        setTimeout(() => {
            aiMove();
        }, 500);
    }
}

// ======================================================
// CELL CLICK & GAME LOGIC
// ======================================================

cells.forEach(cell => {
    cell.addEventListener("click", cellClicked);
});

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

    clickSound.currentTime = 0;
    clickSound.play().catch(e => console.log(e));

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

        winPattern.forEach(index => {
            cells[index].classList.add("win");
        });

        statusText.textContent = "🎉 Player " + currentPlayer + " Wins!";

        winSound.currentTime = 0;
        winSound.play().catch(e => console.log(e));

        if (currentPlayer === "X") {
            xScore++;
        } else {
            oScore++;
        }
        updateScore();
        return;
    }

    if (!board.includes("")) {
        running = false;
        stopTimer();
        statusText.textContent = "🤝 Match Draw";

        drawSound.currentTime = 0;
        drawSound.play().catch(e => console.log(e));
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

    if (gameMode === "ai" || gameMode === "online") {
        startTimer();
    }
}

// ======================================================
// AI ENGINE (EASY, MEDIUM, HARD - MINIMAX)
// ======================================================

function aiMove() {
    if (!running || currentPlayer !== "O") return;

    let move = -1;

    if (aiDifficulty === "easy") {
        move = getRandomMove();
    } else if (aiDifficulty === "medium") {
        move = findWinningMove("O");
        if (move === -1) move = findWinningMove("X");
        if (move === -1 && board[4] === "") move = 4;
        if (move === -1) move = getRandomMove();
    } else {
        move = getBestMove();
    }

    if (move !== -1) {
        updateCell(move);
    }
}

function getRandomMove() {
    let empty = [];
    board.forEach((val, idx) => { if (val === "") empty.push(idx); });
    if (empty.length === 0) return -1;
    return empty[Math.floor(Math.random() * empty.length)];
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
    if (!tempBoard.includes("")) return "draw";
    return null;
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
            let score = minimax(tempBoard, false);
            tempBoard[index] = "";
            best = Math.max(best, score);
        }
        return best;
    } else {
        let best = Infinity;
        for (let index of getEmptyCells(tempBoard)) {
            tempBoard[index] = "X";
            let score = minimax(tempBoard, true);
            tempBoard[index] = "";
            best = Math.min(best, score);
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
    history.pushState({ inGame: true }, "");
    homeScreen.style.display = "none";
    onlineScreen.style.display = "flex";
});

backFromOnlineBtn.addEventListener("click", () => {
    onlineScreen.style.display = "none";
    homeScreen.style.display = "flex";
});

createRoomBtn.addEventListener("click", createRoom);

async function createRoom() {
    history.pushState({ inGame: true }, "");
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    currentRoom = roomId;
    mySymbol = "X";

    const roomRef = ref(db, "rooms/" + roomId);
    await set(roomRef, {
        board: ["", "", "", "", "", "", "", "", ""],
        currentPlayer: "X",
        playerX: true,
        playerO: false,
        gameStarted: false,
        winner: ""
    });

    onDisconnect(ref(db, `rooms/${roomId}/playerX`)).set(false);

    gameMode = "online";
    gameModeText.textContent = "Mode : Online";
    onlineScreen.style.display = "none";
    gameScreen.style.display = "block";
    if (chatContainer) chatContainer.style.display = "block";
    if (roomInfo) roomInfo.style.display = "block";
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
    history.pushState({ inGame: true }, "");
    const roomId = roomCode.value.trim().toUpperCase();

    if (roomId === "") {
        alert("Enter Room Code");
        return;
    }

    const roomRef = ref(db, "rooms/" + roomId);
    const snapshot = await get(roomRef);

    if (!snapshot.exists()) {
        alert("Room Not Found");
        return;
    }

    const data = snapshot.val();
    if (data.playerO) {
        alert("Room Full");
        return;
    }

    await update(roomRef, {
        playerO: true,
        gameStarted: true
    });

    onDisconnect(ref(db, `rooms/${roomId}/playerO`)).set(false);

    currentRoom = roomId;
    mySymbol = "O";
    gameMode = "online";
    gameModeText.textContent = "Mode : Online";

    onlineScreen.style.display = "none";
    gameScreen.style.display = "block";
    if (chatContainer) chatContainer.style.display = "block";
    if (roomInfo) roomInfo.style.display = "block";
    roomCodeText.textContent = roomId;
    copyRoomBtn.style.display = "inline-block";

    resetBoard();
    startRoomListener();
    startChatListener();
}

function startRoomListener() {
    if (!currentRoom) return;

    const roomRef = ref(db, "rooms/" + currentRoom);
    onValue(roomRef, async (snapshot) => {
        if (!snapshot.exists()) return;
        const data = snapshot.val();

        if (roomInfo) roomInfo.style.display = "block";
        roomCodeText.textContent = currentRoom;
        copyRoomBtn.style.display = "inline-block";

        if (!data.gameStarted) {
            running = false;
            stopTimer();
            resetTimers();
            statusText.textContent = "⏳ Waiting for Player 2...";
            return;
        }

        if (!gameStarted && data.gameStarted) {
            gameStarted = true;
            if (gameStartOverlay) gameStartOverlay.style.display = "flex";
            running = false;
            stopTimer();

            setTimeout(() => {
                if (gameStartOverlay) gameStartOverlay.style.display = "none";
                running = true;
                currentPlayer = data.currentPlayer;
                startTimer();
            }, 2000);
        }

        board = [...data.board];
        currentPlayer = data.currentPlayer;

        for (let i = 0; i < 9; i++) {
            cells[i].textContent = board[i];
        }

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
            const a = board[pattern[0]];
            const b = board[pattern[1]];
            const c = board[pattern[2]];

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

            winCells.forEach(index => cells[index].classList.add("win"));
            winSound.currentTime = 0;
            winSound.play().catch(e => console.log(e));
            return;
        }

        if (!board.includes("")) {
            running = false;
            stopTimer();
            statusText.textContent = "🤝 Match Draw";
            drawSound.currentTime = 0;
            drawSound.play().catch(e => console.log(e));
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
// CHAT & SPEECH BUBBLE ENGINE
// ======================================================

const bubbleX = document.getElementById("bubbleX");
const bubbleO = document.getElementById("bubbleO");
let timerX = null, timerO = null;

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

if (sendChatBtn) sendChatBtn.addEventListener("click", sendChat);
if (chatInput) {
    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendChat();
    });
}

async function sendChat() {
    const message = chatInput.value.trim();
    if (message === "" || !currentRoom) return;

    const msgId = "msg_" + Date.now();
    const chatRef = ref(db, "rooms/" + currentRoom + "/chat/" + msgId);

    await set(chatRef, {
        sender: mySymbol,
        text: message
    });

    chatInput.value = "";
}

function startChatListener() {
    if (!currentRoom) return;
    const chatRef = ref(db, "rooms/" + currentRoom + "/chat");

    onValue(chatRef, (snapshot) => {
        if (!chatMessages) return;
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
