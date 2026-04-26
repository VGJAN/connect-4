class Connect4 {
  constructor(rows = 6, cols = 7) {
    this.rows = rows;
    this.cols = cols;
    this.currentPlayer = "yellow";
    this.board = this.createBoard();
  }

  createBoard() {
    console.log("=> Player " + this.currentPlayer + " turn");
    return Array.from({ length: this.rows }, () =>
      Array(this.cols).fill(null)
    );
  }

  switchPlayer() {
    this.currentPlayer = this.currentPlayer === "red" ? "yellow" : "red";
    console.log("=> Player " + this.currentPlayer + " turn")
  }

  drop(col) {
    for (let row = this.rows - 1; row >= 0; row--) {
      if (!this.board[row][col]) {
        this.board[row][col] = this.currentPlayer
        return row;
      }
    }
    return null;
  }

  checkWin(patterns) {
    for (const pattern of patterns) {
      const cells = pattern.map(([r, c]) => this.board[r][c]);
      const isWinning = cells.every(
        (cell) => cell && cell === this.currentPlayer
      );

      if (isWinning) return pattern;
    }
    return null;
  }
}

const game = new Connect4();

let moves = 0;

const gameContainer = document.getElementById("gameContainer");

const gameTable = document.createElement("table");
gameTable.id = "gameTable";

const thead = gameTable.createTHead();
const headerRow = thead.insertRow();
for (let i = 0; i < 7; i++) {
  const th = document.createElement("th");
  headerRow.appendChild(th);
}

const tbody = gameTable.createTBody();
for (let i = 0; i < 6; i++) {
  const row = tbody.insertRow();
  for (let j = 0; j < 7; j++) {
    const cell = row.insertCell();
    cell.setAttribute("data-row", i);
    cell.setAttribute("data-col", j);
    cell.className = "empty";
  }
}

gameContainer.appendChild(gameTable);

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
      let patterns = [];
      for (let i = 0; i < 4; i++) {
        patterns.push([r + i * rowStep, c + i * colStep]);
      }
      winPatterns.push(patterns);
    }
  }
});

const activeDisc = createIcon("fa-circle");
activeDisc.id = "activeDisc";
activeDisc.style.color = "transparent";
headerRow.cells[0].appendChild(activeDisc);

const floatDisc = createIcon("fa-circle");
floatDisc.id = "floatDisc";
floatDisc.style.color = "transparent";
gameContainer.appendChild(floatDisc);

updateFloatDisc(activeDisc);

function createIcon(iconName) {
  const icon = document.createElement("i");
  icon.classList.add("fa-solid", iconName);
  return icon;
}

function updateFloatDisc(element) {
  const discRect = element.getBoundingClientRect();
  const containerRect = gameContainer.getBoundingClientRect();
  const top = discRect.top + discRect.height / 2 - containerRect.top;
  const left = discRect.left + discRect.width / 2 - containerRect.left;

  if (element.id === "activeDisc") {
    floatDisc.style.transition = "top 0.25s ease, left 0.25s ease";
  } else {
    floatDisc.style.transition = "top 0.5s var(--bounce), left 0.5s var(--bounce)";
  }

  floatDisc.style.top = top + "px";
  floatDisc.style.left = left + "px";
}

function updateActiveDisc() {
  const col = this.dataset.col;
  const headerCells = document.querySelectorAll("#gameTable thead th");

  headerCells.forEach((cell) => (cell.innerHTML = ""));
  headerCells[col].appendChild(activeDisc);
}

function aimDisc() {
  updateActiveDisc.call(this);
  updateFloatDisc(activeDisc);

  if (moves === 0) {
    floatDisc.style.color = game.currentPlayer;
  }
}

function waitForTransition(element, property = "top") {
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

function placeDisc(cell) {
  cell.appendChild(createIcon("fa-circle"));
  cell.className = "transparent";
  moves++;
  updateFloatDisc(cell.firstChild);
  console.log(`Placed by ${game.currentPlayer}`);
}

async function dropDisc() {
  const col = this.dataset.col;
  const row = game.drop(col);
  if (row === null) return;

  const cell = tbody.rows[row].cells[col];

  gameContainer.style.pointerEvents = "none";
  await placeDisc(cell);
  await waitForTransition(floatDisc, "top");

  cell.className = game.currentPlayer;
  cell.style.mask = "unset";
  floatDisc.style.color = "transparent";

  const winningPattern = game.checkWin(winPatterns);

  if (winningPattern) {
    highlightWinner(winningPattern.map(([r, c]) => tbody.rows[r].cells[c]));
    gameContainer.classList.add("gameOver");
    console.log("-------------- " + game.currentPlayer + " won --------------");
  } else if (checkDraw()) {
    gameContainer.classList.add("gameOver");
    console.log("-------------- It's a draw! --------------");
  } else {
    game.switchPlayer();
    aimDisc.call(this);
    await waitForTransition(floatDisc, "top");
    gameContainer.style.pointerEvents = "unset";
    floatDisc.style.color = game.currentPlayer;
  }
}

function checkDraw() {
  const cells = document.querySelectorAll("td");
  const isDraw = Array.from(cells).every((cell) => cell.innerHTML);

  return isDraw;
}

function highlightWinner(winningCells) {
  const icons = gameTable.querySelectorAll("td i");
  icons.forEach((icon) => {
    icon.style.opacity = "0.5";
  });

  winningCells.forEach((cell) => {
    const icon = cell.firstChild;
    icon.style.opacity = "1";
  });
}

document.querySelectorAll("td").forEach((cell) => {
  cell.addEventListener("mouseover", aimDisc);
  cell.addEventListener("click", dropDisc);
});
