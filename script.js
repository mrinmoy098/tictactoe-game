import { db } from "./firebase.js";
import {
    ref,
    set,
    get,
    update,
    remove,
    onValue
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
// TIC TAC TOE PRO V3
// PART-1
// DOM ELEMENTS
// ======================================================


// ==============================
// HOME SCREEN
// ==============================

const homeScreen =
document.getElementById("homeScreen");

const difficultyScreen =
document.getElementById("difficultyScreen");

const onlineScreen =
document.getElementById("onlineScreen");

const gameScreen =
document.getElementById("gameScreen");


// ==============================
// HOME BUTTONS
// ==============================

const playFriend =
document.getElementById("playFriend");

const playAI =
document.getElementById("playAI");

const onlineBtn =
document.getElementById("onlineBtn");


// ==============================
// AI BUTTONS
// ==============================

const easyBtn =
document.getElementById("easyBtn");

const mediumBtn =
document.getElementById("mediumBtn");

const hardBtn =
document.getElementById("hardBtn");


// ==============================
// GAME BUTTONS
// ==============================

const restartBtn =
document.getElementById("restart");

const homeBtn =
document.getElementById("homeBtn");

const resetScoreBtn =
document.getElementById("resetScoreBtn");

const themeBtn =
document.getElementById("themeBtn");


// ==============================
// ONLINE BUTTONS
// ==============================

const createRoomBtn =
document.getElementById("createRoomBtn");

const joinRoomBtn =
document.getElementById("joinRoomBtn");

const copyRoomBtn =
document.getElementById("copyRoomBtn");

const backFromOnlineBtn =
document.getElementById("backFromOnlineBtn");


// ==============================
// ROOM
// ==============================

const roomCode =
document.getElementById("roomCode");

const roomInfo =
document.getElementById("roomInfo");

const roomCodeText =
document.getElementById("roomCodeText");


// ==============================
// CHAT
// ==============================

const chatContainer =
document.getElementById("chatContainer");

const chatMessages =
document.getElementById("chatMessages");

const chatInput =
document.getElementById("chatInput");

const sendChatBtn =
document.getElementById("sendChatBtn");


// ==============================
// BOARD
// ==============================

const cells =
document.querySelectorAll(".cell");

const statusText =
document.getElementById("status");


// ==============================
// SCORE
// ==============================

const scoreX =
document.getElementById("scoreX");

const scoreO =
document.getElementById("scoreO");


// ==============================
// TIMER
// ==============================

const xTimerText =
document.getElementById("xTimer");

const oTimerText =
document.getElementById("oTimer");


// ==============================
// GAME START OVERLAY
// ==============================

const gameStartOverlay =
document.getElementById("gameStartOverlay");


// ==============================
// MODE TEXT
// ==============================

const gameModeText =
document.getElementById("gameModeText");

// ======================================================
// GAME VARIABLES
// ======================================================


// ==============================
// GAME BOARD
// ==============================

// 3×3 Board
let board = [
    "", "", "",
    "", "", "",
    "", "", ""
];


// ==============================
// GAME STATUS
// ==============================

// Game চলছে কি না
let running = false;

// কার Turn
let currentPlayer = "X";

// Current Game Mode
// friend / ai / online
let gameMode = "friend";

// AI Difficulty
let aiDifficulty = "easy";


// ==============================
// TIMER
// ==============================

// প্রতি Turn 15 Second
const TURN_TIME = 15;

// Current Timer
let timer = TURN_TIME;

// Timer Interval
let timerInterval = null;

// আলাদা Timer
let xTimer = TURN_TIME;
let oTimer = TURN_TIME;


// ==============================
// SCORE
// ==============================

// Local Storage থেকে Score Load

let xScore =
Number(localStorage.getItem("xScore")) || 0;

let oScore =
Number(localStorage.getItem("oScore")) || 0;


// ==============================
// ONLINE
// ==============================

// Current Room ID
let currentRoom = "";

// আমি X না O
let mySymbol = "";

let lastTurnPlayer = "";


// Game Start হয়েছে?
let gameStarted = false;

// Animation চলছে?
let gameStartAnimation = false;


// ==============================
// SOUND
// ==============================

// Click Sound
const clickSound =
new Audio("click.mp3");

// Win Sound
const winSound =
new Audio("win.mp3");

// Draw Sound
const drawSound =
new Audio("draw.mp3");


// Volume
clickSound.volume = 0.5;
winSound.volume = 0.7;
drawSound.volume = 0.6;


// ==============================
// WIN PATTERNS
// ==============================

const winPatterns = [

    [0,1,2],
    [3,4,5],
    [6,7,8],

    [0,3,6],
    [1,4,7],
    [2,5,8],

    [0,4,8],
    [2,4,6]

];
// ======================================================
// INITIAL SETUP
// ======================================================

// Score Screen-এ দেখাও
scoreX.textContent = xScore;
scoreO.textContent = oScore;

// Default Status
statusText.textContent = "Player X Turn";

// Default Mode
gameModeText.textContent = "Mode : Friend";

// Default Timer
xTimerText.textContent = "⏱️15";
oTimerText.textContent = "⏱️15";

// ======================================================
// HOME SCREEN BUTTON EVENTS
// ======================================================

// -----------------------------
// Play With Friend
// -----------------------------

playFriend.addEventListener("click", () => {

    gameMode = "friend";

    gameModeText.textContent = "Mode : Friend";

    homeScreen.style.display = "none";
    gameScreen.style.display = "block";

    restartGame();

});


// -----------------------------
// Play vs AI
// -----------------------------

playAI.addEventListener("click", () => {

    homeScreen.style.display = "none";
    difficultyScreen.style.display = "flex";

});


// -----------------------------
// AI Difficulty
// -----------------------------

easyBtn.addEventListener("click", () => {

    aiDifficulty = "easy";
    gameMode = "ai";

    difficultyScreen.style.display = "none";
    gameScreen.style.display = "block";

    restartGame();

});

mediumBtn.addEventListener("click", () => {

    aiDifficulty = "medium";
    gameMode = "ai";

    difficultyScreen.style.display = "none";
    gameScreen.style.display = "block";

    restartGame();

});

hardBtn.addEventListener("click", () => {

    aiDifficulty = "hard";
    gameMode = "ai";

    difficultyScreen.style.display = "none";
    gameScreen.style.display = "block";

    restartGame();

});


// -----------------------------
// Back Button
// -----------------------------

backBtn.addEventListener("click", () => {

    difficultyScreen.style.display = "none";
    homeScreen.style.display = "flex";

});

// ======================================================
// UTILITY FUNCTIONS
// ======================================================


// ------------------------------
// Update Score
// ------------------------------

function updateScore() {

    scoreX.textContent = xScore;
    scoreO.textContent = oScore;

    localStorage.setItem("xScore", xScore);
    localStorage.setItem("oScore", oScore);

}


// ------------------------------
// Clear Board
// ------------------------------

function clearBoard() {

    board = [
        "", "", "",
        "", "", "",
        "", "", ""
    ];

    cells.forEach(cell => {

        cell.textContent = "";

        // Winning Color Remove
        cell.classList.remove("win");

    });

}


// ------------------------------
// Reset Board
// ------------------------------

function resetBoard() {

    clearBoard();

    currentPlayer = "X";

    running = true;

    statusText.textContent = "Player X Turn";

}


// ------------------------------
// Reset Timers
// ------------------------------

function resetTimers() {

    timer = TURN_TIME;

    xTimer = TURN_TIME;

    oTimer = TURN_TIME;

    xTimerText.textContent = "⏱️15";

    oTimerText.textContent = "⏱️15";

}


// ------------------------------
// Stop Timer
// ------------------------------

function stopTimer() {

    clearInterval(timerInterval);

}
// ======================================================
// TIMER ENGINE (ONLY FOR AI & ONLINE)
// ======================================================

// ------------------------------
// Update Timer UI
// ------------------------------
function updateTimer() {
    if (currentPlayer === "X") {
        xTimerText.textContent = "⏱️" + timer;
        oTimerText.textContent = "⏱️15"; // Opponent Fixed at 15
    } else {
        oTimerText.textContent = "⏱️" + timer;
        xTimerText.textContent = "⏱️15"; // Opponent Fixed at 15
    }
}

// ------------------------------
// Start Timer
// ------------------------------
function startTimer() {
    // Friend Mode হলে টাইমার চলবে না
    if (gameMode === "friend") return;

    // আগের যেকোনো টাইমার ক্লিয়ার করা
    clearInterval(timerInterval);

    // টাইমার ১৫ সেকেন্ডে রিফ্রেশ করা
    timer = TURN_TIME; // 15
    updateTimer();

    timerInterval = setInterval(() => {
        timer--;
        updateTimer();

        // ১৫ সেকেন্ড শেষ হলে Auto Move হবে
        if (timer <= 0) {
            clearInterval(timerInterval);
            autoRandomMove();
        }
    }, 1000);
}

// ------------------------------
// Auto Random Move (Timer Expired)
// ------------------------------
function autoRandomMove() {
    if (!running || gameMode === "friend") return;

    // ফাঁকা Cell খোঁজা
    let empty = [];
    board.forEach((value, index) => {
        if (value === "") {
            empty.push(index);
        }
    });

    if (empty.length === 0) return;

    // একটি Random ফাঁকা Cell নির্বাচন
    const randomCell = empty[Math.floor(Math.random() * empty.length)];

    // Online Mode হলে
    if (gameMode === "online") {
        if (currentPlayer === mySymbol) {
            onlineMove(randomCell);
        }
    } 
    // AI Mode হলে
    else if (gameMode === "ai") {
        updateCell(randomCell);
    }
}

// ------------------------------
// Change Player
// ------------------------------
function changePlayer() {
    if (!running) return;

    // প্লেয়ার পরিবর্তন
    currentPlayer = currentPlayer === "X" ? "O" : "X";

    // Status Text Update
    statusText.textContent = "Player " + currentPlayer + " Turn";

    // AI বা Online Mode হলে নতুন ১৫ সেকেন্ডের টাইমার শুরু হবে
    if (gameMode === "ai" || gameMode === "online") {
        startTimer();
    } else {
        // Friend Mode হলে টাইমার বন্ধ থাকবে এবং UI-তে 15 স্থির দেখাবে
        stopTimer();
        xTimerText.textContent = "⏱️15";
        oTimerText.textContent = "⏱️15";
    }

    // AI Mode-এ O-এর চাল
    if (gameMode === "ai" && currentPlayer === "O") {
        setTimeout(() => {
            aiMove();
        }, 500);
    }
}// --------------------------------
// Add Click Event
// --------------------------------

cells.forEach(cell => {

    cell.addEventListener("click", cellClicked);

});


// --------------------------------
// Cell Click
// --------------------------------

function cellClicked() {

    // কোন Cell এ Click হয়েছে

    const index = Number(this.dataset.index);

    // Game Stop থাকলে Return

    if (!running) return;

    // Cell আগে থেকেই Filled হলে Return

    if (board[index] !== "") return;

    // Online Mode এখানে Handle হবে

    if (gameMode === "online") {

        onlineMove(index);

        return;

    }

    // Cell Update

    updateCell(index);

}


// --------------------------------
// Update Cell
// --------------------------------

function updateCell(index) {

    // Board Update
    board[index] = currentPlayer;

    // Screen Update
    cells[index].textContent = currentPlayer;

    // Click Sound
    const clickSound = document.getElementById("clickSound");
    if (clickSound) {
        clickSound.currentTime = 0;
        clickSound.play().catch(e => console.log(e));
    }

    // Winner Check
    checkWinner();
}
// --------------------------------
// Winner Check
// --------------------------------

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

    // যদি Win হয়

    if (won) {

        running = false;

        stopTimer();

        // Highlight

        winPattern.forEach(index => {

            cells[index].classList.add("win");

        });

        // Status

        statusText.textContent =
        "🎉 Player " + currentPlayer + " Wins!";

        // Sound

     const winSound = document.getElementById("winSound");
        if (winSound) {
            winSound.currentTime = 0;
            winSound.play().catch(e => console.log(e));
        }
        // Score

        if (currentPlayer === "X") {

            xScore++;

        }

        else {

            oScore++;

        }

        updateScore();

        return;

    }

    // যদি Draw হয়

   if (!board.includes("")) {

    running = false;

    stopTimer();

    statusText.textContent = 
    "🤝 Match Draw";

    const drawSound = document.getElementById("drawSound");
    if (drawSound) {
        drawSound.currentTime = 0;
        drawSound.play().catch(e => console.log(e));
    }

    return;

}
    // পরের Player

    changePlayer();

}
// --------------------------------
// Restart Game
// --------------------------------

function restartGame() {

    // Board Clear

    clearBoard();

    // Timer Reset

    resetTimers();

    // Game Start

    running = true;

    currentPlayer = "X";

    // Status

    statusText.textContent =
    "Player X Turn";

    // Friend ছাড়া Timer

    if (
        gameMode === "ai" ||
        gameMode === "online"
    ) {

        startTimer();

    }

}
// ======================================================
// AI ENGINE - PART 6A
// Easy + Medium AI
// ======================================================


// --------------------------------
// AI Move
// --------------------------------

function aiMove() {

    // Game শেষ হলে Return

    if (!running) return;

    // AI শুধুমাত্র O হবে

    if (currentPlayer !== "O") return;

    let move = -1;

    // =============================
    // EASY AI
    // =============================

    if (aiDifficulty === "easy") {

        move = getRandomMove();

    }

    // =============================
    // MEDIUM AI
    // =============================

    else if (aiDifficulty === "medium") {

        // আগে Win Try করবে

        move = findWinningMove("O");

        // না পেলে Block করবে

        if (move === -1) {

            move = findWinningMove("X");

        }

        // Center নেবে

        if (move === -1 && board[4] === "") {

            move = 4;

        }

        // শেষে Random

        if (move === -1) {

            move = getRandomMove();

        }

    }

    // Hard পরে হবে

    else {

        move = getBestMove();

    }

    // Move পাওয়া না গেলে Return

    if (move === -1) return;

    // Board Update

    updateCell(move);

}
// --------------------------------
// Random Move
// --------------------------------

function getRandomMove() {

    let empty = [];

    board.forEach((value, index) => {

        if (value === "") {

            empty.push(index);

        }

    });

    if (empty.length === 0) {

        return -1;

    }

    return empty[
        Math.floor(Math.random() * empty.length)
    ];

}
// --------------------------------
// Winning Move Finder
// --------------------------------

function findWinningMove(player) {

    for (let pattern of winPatterns) {

        const [a, b, c] = pattern;

        const values = [

            board[a],
            board[b],
            board[c]

        ];

        // দুইটা একই হলে

        if (

            values.filter(x => x === player).length === 2 &&

            values.includes("")

        ) {

            if (board[a] === "") return a;

            if (board[b] === "") return b;

            if (board[c] === "") return c;

        }

    }

    return -1;

}
// ======================================================
// AI ENGINE - PART 6B
// HARD AI (MINIMAX)
// ======================================================


// --------------------------------
// Check Winner For Minimax
// --------------------------------

function checkWinnerForBoard(tempBoard){

    for(let pattern of winPatterns){

        const [a,b,c]=pattern;

        if(

            tempBoard[a]!=="" &&

            tempBoard[a]===tempBoard[b] &&

            tempBoard[a]===tempBoard[c]

        ){

            return tempBoard[a];

        }

    }

    if(!tempBoard.includes("")){

        return "draw";

    }

    return null;

}


// --------------------------------
// Empty Cells
// --------------------------------

function getEmptyCells(tempBoard){

    let empty=[];

    tempBoard.forEach((value,index)=>{

        if(value===""){

            empty.push(index);

        }

    });

    return empty;

}
// --------------------------------
// Minimax
// --------------------------------

function minimax(tempBoard,isMax){

    let result=
    checkWinnerForBoard(tempBoard);

    if(result==="O") return 10;

    if(result==="X") return -10;

    if(result==="draw") return 0;

    if(isMax){

        let best=-Infinity;

        for(let index of getEmptyCells(tempBoard)){

            tempBoard[index]="O";

            let score=
            minimax(tempBoard,false);

            tempBoard[index]="";

            best=Math.max(best,score);

        }

        return best;

    }

    else{

        let best=Infinity;

        for(let index of getEmptyCells(tempBoard)){

            tempBoard[index]="X";

            let score=
            minimax(tempBoard,true);

            tempBoard[index]="";

            best=Math.min(best,score);

        }

        return best;

    }

}
// --------------------------------
// Best Move
// --------------------------------

function getBestMove(){

    let bestScore=-Infinity;

    let move=-1;

    for(let index of getEmptyCells(board)){

        board[index]="O";

        let score=
        minimax(board,false);

        board[index]="";

        if(score>bestScore){

            bestScore=score;

            move=index;

        }

    }

    return move;

}
// ======================================================
// ONLINE MULTIPLAYER
// PART-7A
// ======================================================


// ======================================
// ONLINE BUTTON EVENTS
// ======================================

// Home → Online Screen
onlineBtn.addEventListener("click", () => {

    homeScreen.style.display = "none";

    onlineScreen.style.display = "flex";

});


// Online → Home
backFromOnlineBtn.addEventListener("click", () => {

    onlineScreen.style.display = "none";

    homeScreen.style.display = "flex";

});


// ======================================
// CREATE ROOM
// ======================================

createRoomBtn.addEventListener("click", createRoom);


// Create Room Function

async function createRoom() {

    // Random Room Code

    const roomId =

        Math.random()

        .toString(36)

        .substring(2,8)

        .toUpperCase();

    currentRoom = roomId;

    mySymbol = "X";

    // Firebase Room

    await set(

        ref(db,"rooms/"+roomId),

        {

            board:[
                "","","",
                "","","",
                "","",""
            ],

            currentPlayer:"X",

            playerX:true,

            playerO:false,

            gameStarted:false,

            winner:"",

            playAgainX:false,

            playAgainO:false

        }

    );

    // Screen Change

    gameMode="online";

    gameModeText.textContent="Mode : Online";

    onlineScreen.style.display="none";

    gameScreen.style.display="block";

    chatContainer.style.display="block";

    roomInfo.style.display="block";

    roomCodeText.textContent=roomId;

    copyRoomBtn.style.display="inline-block";

    resetBoard();

    running=false;

    statusText.textContent="⏳ Waiting for Player 2";

    startRoomListener();
    startChatListener();

}
// ======================================
// COPY ROOM
// ======================================

copyRoomBtn.addEventListener("click",()=>{

    navigator.clipboard.writeText(currentRoom);

    alert("Room Code Copied");

});
// ======================================
// JOIN ROOM
// ======================================

joinRoomBtn.addEventListener("click",joinRoom);


async function joinRoom(){

    const roomId=

    roomCode.value

    .trim()

    .toUpperCase();

    if(roomId===""){

        alert("Enter Room Code");

        return;

    }

    const roomRef=

    ref(db,"rooms/"+roomId);

    const snapshot=

    await get(roomRef);

    if(!snapshot.exists()){

        alert("Room Not Found");

        return;

    }

    const data=

    snapshot.val();

    if(data.playerO){

        alert("Room Full");

        return;

    }

    await update(roomRef,{

        playerO:true,

        gameStarted:true

    });

    currentRoom=roomId;

    mySymbol="O";

    gameMode="online";

    gameModeText.textContent="Mode : Online";

    onlineScreen.style.display="none";

    gameScreen.style.display="block";

    chatContainer.style.display="block";

    roomInfo.style.display="block";

    roomCodeText.textContent=roomId;

    copyRoomBtn.style.display="inline-block";

    resetBoard();

    startRoomListener();
    startChatListener();

}
// ======================================================
// ONLINE LISTENER
// PART-7B-1
// ======================================================

function startRoomListener() {

    // Room না থাকলে Return

    if(currentRoom==="") return;

    // Firebase Reference

    const roomRef=

    ref(db,"rooms/"+currentRoom);

    // Live Listener

    onValue(roomRef,async(snapshot)=>{

        // Room Delete হলে Return

        if(!snapshot.exists()) return;

        // Room Data

        const data=snapshot.val();

        // ----------------------------
        // Room Info
        // ----------------------------

        roomInfo.style.display="block";

        roomCodeText.textContent=currentRoom;

        copyRoomBtn.style.display="inline-block";

        // ----------------------------
        // Waiting Screen
        // ----------------------------

        if(!data.gameStarted){

            running=false;

            stopTimer();

            resetTimers();

            statusText.textContent=

            "⏳ Waiting for Player 2...";

            return;

        }

        // ----------------------------
        // Game Start Animation
        // ----------------------------

        if(

            !gameStarted &&

            data.gameStarted

        ){

            gameStarted=true;

            gameStartOverlay.style.display="flex";

            running=false;

            stopTimer();

            setTimeout(()=>{

                gameStartOverlay.style.display="none";

                running=true;

                currentPlayer=

                data.currentPlayer;

                startTimer();

            },2000);

        }

        // ----------------------------
        // Board Sync
        // ----------------------------

        board=[...data.board];

        currentPlayer=

        data.currentPlayer;

        // Board Update

        for(

            let i=0;

            i<9;

            i++

        ){

            cells[i].textContent=

            board[i];

        }
                // ----------------------------
        // Opponent Left
        // ----------------------------

        if (

            (mySymbol === "X" && !data.playerO) ||

            (mySymbol === "O" && !data.playerX)

        ) {

            running = false;

            stopTimer();

            statusText.textContent =
            "❌ Opponent Left";

            setTimeout(() => {

                alert("Opponent Left The Room");

                gameScreen.style.display = "none";

                homeScreen.style.display = "flex";

                currentRoom = "";

                mySymbol = "";

            },1500);

            return;

        }


        // ----------------------------
        // Winner Check
        // ----------------------------

        let winner = "";

        let winCells = [];


        for (let pattern of winPatterns) {

            const a = board[pattern[0]];

            const b = board[pattern[1]];

            const c = board[pattern[2]];


            if (

                a !== "" &&

                a === b &&

                b === c

            ) {

                winner = a;

                winCells = pattern;

                break;

            }

        }


        // Winner

        if (winner !== "") {

            running = false;

            stopTimer();

            statusText.textContent =
            "🏆 Player " + winner + " Wins!";


            winCells.forEach(index => {

                cells[index].classList.add("win");

            });


            winSound.currentTime = 0;

            winSound.play();


            return;

        }


        // ----------------------------
        // Draw
        // ----------------------------

        if (!board.includes("")) {

            running = false;

            stopTimer();

            statusText.textContent =
            "🤝 Match Draw";

            drawSound.currentTime = 0;

            drawSound.play();

            return;

        }


        // ----------------------------
        // Current Turn
        // ----------------------------

        statusText.textContent = "Player " + currentPlayer + " Turn";

        // কেবল প্লেয়ার পরিবর্তন হলেই টাইমার ক্লিয়ার হয়ে নতুন ১৫ সেকেন্ড চালু হবে
        if (running && currentPlayer !== lastTurnPlayer) {
            lastTurnPlayer = currentPlayer;
            startTimer();
        }

    });

}
// ======================================================
// ONLINE MULTIPLAYER
// PART-7C
// ======================================================


// =====================================
// ONLINE MOVE
// =====================================

async function onlineMove(index){

    // নিজের Turn না হলে কিছু করবে না

    if(currentPlayer!==mySymbol) return;

    // Cell Filled হলে Return

    if(board[index]!="") return;

    // Board Copy

    let newBoard=[...board];

    // Move

    newBoard[index]=mySymbol;

    // Next Player

    let nextPlayer=

    mySymbol==="X" ? "O" : "X";

    // Firebase Update

    await update(

        ref(db,"rooms/"+currentRoom),

        {

            board:newBoard,

            currentPlayer:nextPlayer

        }

    );

}

// ======================================================
// CHAT & SPEECH BUBBLE ENGINE (DIRECT SYNC)
// ======================================================

const bubbleX = document.getElementById("bubbleX");
const bubbleO = document.getElementById("bubbleO");

let timerX = null;
let timerO = null;

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

chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendChat();
});

async function sendChat() {
    const message = chatInput.value.trim();
    if (message === "" || !currentRoom) return;

    const msgId = "msg_" + Date.now();
    const chatRef = ref(db, "rooms/" + currentRoom + "/chat/" + msgId);

    // মেসেজ ডাটা সেভ
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
        chatMessages.innerHTML = "";

        if (snapshot.exists()) {
            const chats = snapshot.val();
            const msgList = Object.values(chats);

            // ১. চ্যাট বক্সে মেসেজ তৈরি
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

            // ২. প্লেয়ারের ওপর পপ-আপ বাবল প্রদর্শন
            const lastMsg = msgList[msgList.length - 1];
            if (lastMsg && lastMsg.sender && lastMsg.text) {
                showSpeechBubble(lastMsg.sender, lastMsg.text);
            }
        }
    });
}
// =====================================
// COPY ROOM
// =====================================

copyRoomBtn.addEventListener("click", async () => {

    try {

        await navigator.clipboard.writeText(currentRoom);

        alert("✅ Room Code Copied");

    }

    catch {

        prompt("Copy Room Code", currentRoom);

    }

});
// =====================================
// LEAVE ROOM
// =====================================

window.addEventListener(

"beforeunload",

async()=>{

    if(

        currentRoom===""

    ) return;

    if(mySymbol==="X"){

        await update(

            ref(db,"rooms/"+currentRoom),

            {

                playerX:false

            }

        );

    }

    else{

        await update(

            ref(db,"rooms/"+currentRoom),

            {

                playerO:false

            }

        );

    }

});
// ======================================================
// FINAL CONTROLS
// PART-8A
// ======================================================


// =======================================
// Restart Button
// =======================================

restartBtn.addEventListener("click", () => {
    console.log("Restart Button Clicked");

    // Friend Mode

    if (gameMode === "friend") {

        restartGame();

    }

    // AI Mode

    else if (gameMode === "ai") {

        restartGame();

    }

    // Online Mode

    else {

        playAgainOnline();

    }

});
// =======================================
// Play Again Online
// =======================================

async function playAgainOnline() {

    if (currentRoom === "") return;

    let roomRef =

    ref(db, "rooms/" + currentRoom);

    if (mySymbol === "X") {

        await update(roomRef, {

            playAgainX: true

        });

    }

    else {

        await update(roomRef, {

            playAgainO: true

        });

    }

}
// =======================================
// Home Button
// =======================================

homeBtn.addEventListener("click", async () => {

    stopTimer();

    gameScreen.style.display = "none";

    difficultyScreen.style.display = "none";

    onlineScreen.style.display = "none";

    homeScreen.style.display = "flex";

    chatContainer.style.display = "none";

    roomInfo.style.display = "none";

    currentRoom = "";

    mySymbol = "";

    gameMode = "friend";

});
// =======================================
// Reset Score
// =======================================

resetScoreBtn.addEventListener("click", () => {

    xScore = 0;

    oScore = 0;

    updateScore();

});
// =======================================
// Theme
// =======================================

themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark");

});
// ======================================================
// FINAL STARTUP
// PART-8B
// ======================================================


// =======================================
// Page Load
// =======================================

window.addEventListener("load", () => {

    // Score Load

    updateScore();

    // Timer Reset

    resetTimers();

    // Board Reset

    clearBoard();

    // Game Stop

    running = false;

    // Default Status

    statusText.textContent =
    "Select Game Mode";

});


// =======================================
// Theme Load
// =======================================

const savedTheme =

localStorage.getItem("theme");

if (savedTheme === "dark") {

    document.body.classList.add("dark");

}


// =======================================
// Theme Save
// =======================================

themeBtn.addEventListener("click", () => {

    if (

        document.body.classList.contains("dark")

    ) {

        localStorage.setItem(

            "theme",

            "dark"

        );

    }

    else {

        localStorage.setItem(

            "theme",

            "light"

        );

    }

});


// =======================================
// Auto Scroll Chat
// =======================================

function scrollChatBottom() {

    chatMessages.scrollTop =

    chatMessages.scrollHeight;

}


// =======================================
// Disable Text Selection
// =======================================

document.addEventListener(

    "selectstart",

    (e) => {

        e.preventDefault();

    }

);


// =======================================
// Disable Right Click (Optional)
// =======================================

document.addEventListener(

    "contextmenu",

    (e) => {

        e.preventDefault();

    }

);


// =======================================
// Console Message
// =======================================

console.log(

    "🎮 Tic Tac Toe Pro V3 Loaded Successfully"

);
// ==========================================
// AUDIO SYSTEM FOR MOBILE BROWSERS
// ==========================================

// সাউন্ড প্লে করার মূল ফাংশন
function playSound(audioId) {
    const sound = document.getElementById(audioId);
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(err => console.log("Audio play error:", err));
    }
}

// ফোনের ব্রাউজারে প্রথম ক্লিকেই সব সাউন্ড পারমিশন আনলক করার কোড
document.addEventListener('click', () => {
    ['clickSound', 'winSound', 'drawSound'].forEach(id => {
        const sound = document.getElementById(id);
        if (sound) {
            sound.play().then(() => {
                sound.pause();
                sound.currentTime = 0;
            }).catch(() => {});
        }
    });
}, { once: true });
// =========================
// LIGHT / DARK MODE TOGGLE
// =========================
const themeBtn = document.getElementById('themeBtn');

if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        
        if (document.body.classList.contains('light-mode')) {
            themeBtn.innerText = '☀️ Light Mode';
        } else {
            themeBtn.innerText = '🌙 Dark Mode';
        }
    });
}
