// ========================
// GAME LOGIC
// ========================
class Connect4 {
  constructor(rows = 6, cols = 7) {
    this.rows = rows;
    this.cols = cols;
    this.players = [
      {
        name: "Player 1",
        color: "yellow",
        score: 0
      },
      {
        name: "Player 2",
        color: "red",
        score: 0
      }
    ]
    this.board = this.createBoard();
    this.currentPlayerIndex = 0;
    this.roundStarter = this.currentPlayerIndex;
    this.moveCount = 0;
  }

  createBoard() {
    return Array.from({ length: this.rows }, () => 
      Array(this.cols).fill(null)
    );
  }

  switchPlayer() {
    this.currentPlayerIndex = this.currentPlayerIndex === 0 ? 1 : 0;
  }

  drop(col) {
    for (let row = this.rows - 1; row >= 0; row--) {
      if (!this.board[row][col]) {
        this.board[row][col] = this.players[this.currentPlayerIndex].color;
        this.moveCount++;
        return row;
      }
    }
    return null;
  }

  checkWin(winPatterns) {
    for (const pattern of winPatterns) {
      const cells = pattern.map(([r, c]) => this.board[r][c]);
      const isWinning = cells.every(
        (cell) => cell !== null && cell === this.players[this.currentPlayerIndex].color
      );

      if (isWinning) return pattern;
    }
    return null;
  }

  checkDraw() {
    return this.board.every(
      (row) => row.every((cell) => cell !== null)
    );
  }

  reset() {
    this.board = this.createBoard();
    this.moveCount = 0;
    
    this.roundStarter = this.roundStarter === 0 ? 1 : 0;
    this.currentPlayerIndex = this.roundStarter;
  }
}

// ========================
// DATA GENERATION
// ========================
function generateWinPatterns() {
  const winPatterns = [];
  const configs = [
    { rowRange: [0, 5], colRange: [0, 3], rowStep: 0, colStep: 1 },
    { rowRange: [0, 2], colRange: [0, 6], rowStep: 1, colStep: 0 },
    { rowRange: [3, 5], colRange: [0, 3], rowStep: -1, colStep: 1 },
    { rowRange: [0, 2], colRange: [0, 3], rowStep: 1, colStep: 1 },
  ];

  configs.forEach(({ rowRange, colRange, rowStep, colStep }) => {
    for (let r = rowRange[0]; r <= rowRange[1]; r++) {
      for (let c = colRange[0]; c <= colRange[1]; c++) {
        let pattern = [];
        for (let i = 0; i < 4; i++) {
          pattern.push([r + i * rowStep, c + i * colStep]);
        }
        winPatterns.push(pattern);
      }
    }
  });

  return winPatterns;
}

// ========================
// UI BUILDERS
// ========================
function createTable(rows, cols) {
  const table = document.createElement("table");
  const thead = table.createTHead();
  const tbody = table.createTBody();

  // Table Head
  const headerRow = thead.insertRow();
  for (let c = 0; c < cols; c++) {
    const th = document.createElement("th");
    headerRow.appendChild(th);
  }

  // Table Body
  for (let r = 0; r < rows; r++) {
    const row = tbody.insertRow();
    for (let c = 0; c < cols; c++) {
      const cell = row.insertCell();
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.className = "empty";
    }
  }

  return { table, tbody };
}

function createIcon(iconName, iconId) {
  const icon = document.createElement("i");
  icon.classList.add("fa-solid", iconName);
  if (iconId) icon.id = iconId;
  return icon;
}

// ========================
// INITIAL SETUP
// ========================
const game = new Connect4();
const winPatterns = generateWinPatterns();

const gameBoard = document.querySelector("#gameBoard");
const { table, tbody } = createTable(game.rows, game.cols);

gameBoard.appendChild(table);

const boardInput = {
  lock() {
    gameBoard.style.pointerEvents = "none";
  },
  
  unlock() {
    gameBoard.style.pointerEvents = "auto";
  }
};
const player1Name = document.querySelector("#player1Name");
const player2Name = document.querySelector("#player2Name");
const player1Score = document.querySelector("#player1Score");
const player2Score = document.querySelector("#player2Score");
const gameStatus = document.querySelector("#gameStatus");

const cursorDisc = createIcon("fa-circle", "cursorDisc");
gameBoard.appendChild(cursorDisc);
cursorDiscInit();

updateStatus("turn");

// ========================
// UI HELPERS
// ========================
function cursorDiscInit() {
  updateCursorColor("transparent");
  animateDisc(table.querySelector("th"), "hover");
}

function updateStatus(type) {
  const player = game.players[game.currentPlayerIndex].name;
  const messageTemplate = {
    turn: `${player}'s turn`,
    win: `${player} wins!`,
    draw: "Draw!"
  }

  gameStatus.textContent = messageTemplate[type];
  player1Score.textContent = game.players[0].score;
  player2Score.textContent = game.players[1].score;
}

function updateCellUI(cell, playerIndex) {
  cell.className = game.players[playerIndex].color;
  cell.style.mask = "unset";
}

function updateCursorColor(playerIndex) {
  const color = playerIndex === "transparent" ? playerIndex : game.players[playerIndex].color;
  cursorDisc.style.color = color;
}

function highlightWinner(winningCells) {
  const icons = table.querySelectorAll("td i");
  icons.forEach((icon) => {
    icon.style.opacity = "0.5";
  });

  winningCells.forEach((cell) => {
    const icon = cell.firstChild;
    icon.style.opacity = "1";
  });
}

function clearTable() {
  gameBoard.querySelectorAll("td").forEach((cell) => {
    cell.innerHTML = null;
    cell.className = "empty";
    cell.style.mask = "";
  })
}

// ========================
// ANIMATIONS
// ========================
function animateDisc(element, type) {
  const targetRect = element.getBoundingClientRect();
  const boardRect = gameBoard.getBoundingClientRect();
  const top = targetRect.top + targetRect.height / 2 - boardRect.top;
  const left = targetRect.left + targetRect.width / 2 - boardRect.left;

  const discAnimation = {
    hover: "top 0.25s ease, left 0.25s ease",
    drop: "top 0.5s var(--bounce), left 0.5s var(--bounce)"
  }

  cursorDisc.style.transition = discAnimation[type];
  cursorDisc.style.top = `${top}px`;
  cursorDisc.style.left = `${left}px`;
}

function animateHover() {
  const headerCells = document.querySelectorAll("th");
  const col = Number(this.dataset.col);
  const target = headerCells[col];
  
  animateDisc(target, "hover");

  if (game.moveCount === 0) {
    updateCursorColor(game.currentPlayerIndex);
  }
}

function animateDrop(cell) {
  animateDisc(cell.firstChild, "drop");
}

function waitForAnimationEnd(element, property = "top") {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      cleanup();
      resolve();
    }, 600);
    function cleanup() {
      element.removeEventListener("transitionend", handler);
      clearTimeout(timeout);
    }
    function handler(e) {
      if (e.propertyName === property) {
        cleanup();
        resolve();
      }
    }
    element.addEventListener("transitionend", handler);
  });
}

// ========================
// GAME FLOW
// ========================
function insertDiscElement(cell) {
  cell.appendChild(createIcon("fa-circle"));
  cell.className = "transparent";
}

async function dropDisc() {
  const col = Number(this.dataset.col);
  const row = game.drop(col);
  if (row === null) return;

  const cell = tbody.rows[row].cells[col];

  insertDiscElement(cell);
  boardInput.lock();
  
  animateDrop(cell);
  await waitForAnimationEnd(cursorDisc);

  updateCellUI(cell, game.currentPlayerIndex);
  updateCursorColor("transparent");

  const winningPattern = game.checkWin(winPatterns);

  if (winningPattern) {
    game.players[game.currentPlayerIndex].score++;
    highlightWinner(winningPattern.map(([r, c]) => tbody.rows[r].cells[c]));
    updateStatus("win");
    return;
  }
  
  if (game.checkDraw()) {
    updateStatus("draw");
    return;
  }

  game.switchPlayer();

  animateHover.call(this);
  await waitForAnimationEnd(cursorDisc);

  boardInput.unlock();
  updateCursorColor(game.currentPlayerIndex);
  updateStatus("turn");
}

// ========================
// EVENT LISTENERS
// ========================
gameBoard.querySelectorAll("td").forEach((cell) => {
  cell.addEventListener("mouseover", animateHover);
  cell.addEventListener("click", dropDisc);
});

document.querySelector("#resetBtn").addEventListener("click", () => {
  game.reset();
  clearTable();
  cursorDiscInit();
  updateStatus("turn");
  boardInput.unlock()
});