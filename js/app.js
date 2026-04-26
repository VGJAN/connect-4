// ========================
// GAME LOGIC
// ========================
class Connect4 {
  constructor(rows = 6, cols = 7) {
    this.rows = rows;
    this.cols = cols;
    this.currentPlayer = "yellow";
    this.moveCount = 0;
    this.board = this.createBoard();
  }

  createBoard() {
    return Array.from({ length: this.rows }, () => 
      Array(this.cols).fill(null)
    );
  }

  switchPlayer() {
    this.currentPlayer = this.currentPlayer === "red" ? "yellow" : "red";
  }

  drop(col) {
    for (let row = this.rows - 1; row >= 0; row--) {
      if (!this.board[row][col]) {
        this.board[row][col] = this.currentPlayer;
        return row;
      }
    }
    return null;
  }

  checkWin(winPatterns) {
    for (const pattern of winPatterns) {
      const cells = pattern.map(([r, c]) => this.board[r][c]);
      const isWinning = cells.every(
        (cell) => cell && cell === this.currentPlayer
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
    this.switchPlayer()
    this.moves = 0;
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
function createTable() {
  const table = document.createElement("table");
  const thead = table.createTHead();
  const tbody = table.createTBody();

  // Table Head
  const headerRow = thead.insertRow();
  for (let i = 0; i < 7; i++) {
    const th = document.createElement("th");
    headerRow.appendChild(th);
  }

  // Table Body
  for (let i = 0; i < 6; i++) {
    const row = tbody.insertRow();
    for (let j = 0; j < 7; j++) {
      const cell = row.insertCell();
      cell.dataset.row = i;
      cell.dataset.col = j;
      cell.className = "empty";
    }
  }

  return { table, tbody };
}

function createIcon(iconName) {
  const icon = document.createElement("i");
  icon.classList.add("fa-solid", iconName);
  return icon;
}

// ========================
// INITIAL SETUP
// ========================
const game = new Connect4();

const gameBoard = document.getElementById("gameBoard");
const boardInput = {
  lock() {
    gameBoard.style.pointerEvents = "none"
  },
  
  unlock() {
    gameBoard.style.pointerEvents = "auto"
  }
}
const status = document.getElementById("status");
const { table, tbody } = createTable();

gameBoard.appendChild(table);

const winPatterns = generateWinPatterns();

const cursorDisc = createIcon("fa-circle");
cursorDisc.id = "cursorDisc";
updateCursorColor("transparent");
gameBoard.appendChild(cursorDisc);

animateDisc(table.querySelector("th"), "hover");

updateStatus("turn");

// ========================
// UI HELPERS
// ========================
function updateStatus(type) {
  const player = game.currentPlayer.toUpperCase();
  const messageTemplate = {
    turn: `${player}'s turn`,
    win: `${player} wins!`,
    draw: "Draw!"
  }

  status.textContent = messageTemplate[type];
}

function updateCellUI(cell, player) {
  cell.className = player;
  cell.style.mask = "unset";
}

function updateCursorColor(color) {
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

// ========================
// ANIMATIONS
// ========================
function animateDisc(element, type) {
  const targetRect = element.getBoundingClientRect();
  const containerRect = gameBoard.getBoundingClientRect();
  const top = targetRect.top + targetRect.height / 2 - containerRect.top;
  const left = targetRect.left + targetRect.width / 2 - containerRect.left;

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
    updateCursorColor(game.currentPlayer);
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
function placeDisc(cell) {
  cell.appendChild(createIcon("fa-circle"));
  cell.className = "transparent";
  game.moveCount++;
}

async function dropDisc() {
  const col = Number(this.dataset.col);
  const row = game.drop(col);
  if (row === null) return;

  const cell = tbody.rows[row].cells[col];

  placeDisc(cell);
  boardInput.lock();
  
  animateDrop(cell);
  await waitForAnimationEnd(cursorDisc);

  updateCellUI(cell, game.currentPlayer);
  updateCursorColor("transparent");

  const winningPattern = game.checkWin(winPatterns);

  if (winningPattern) {
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
  updateCursorColor(game.currentPlayer);
  updateStatus("turn");
}

// ========================
// EVENT LISTENERS
// ========================
document.querySelectorAll("td").forEach((cell) => {
  cell.addEventListener("mouseover", animateHover);
  cell.addEventListener("click", dropDisc);
});
