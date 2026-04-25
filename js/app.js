let currentPlayer = "yellow";
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
    cell.id = `${i}-${j}`;
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
        patterns.push(`${r + i * rowStep}-${c + i * colStep}`);
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

function switchPlayer() {
  if (currentPlayer === "red") {
    currentPlayer = "yellow";
  } else {
    currentPlayer = "red";
  }
}

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
    floatDisc.style.color = currentPlayer;
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

function getAvailableRow(col) {
  for (let row = tbody.rows.length - 1; row >= 0; row--) {
    const cell = tbody.rows[row].cells[col];
    if (!cell.innerHTML) return row;
  }
  return null;
}

function placeDisc(cell) {
  cell.appendChild(createIcon("fa-circle"));
  cell.className = "transparent";
  moves++;
  updateFloatDisc(cell.firstChild);
  console.log(`Placed in ${cell.id} by ${currentPlayer}`);
}

async function dropDisc() {
  const col = this.dataset.col;
  const row = getAvailableRow(col);
  if (row === null) return;

  const cell = tbody.rows[row].cells[col];

  gameContainer.style.pointerEvents = "none";
  await placeDisc(cell);
  await waitForTransition(floatDisc, "top");

  cell.className = currentPlayer;
  cell.style.mask = "unset";
  floatDisc.style.color = "transparent";

  const winningCells = checkWin();

  if (winningCells) {
    highlightWinner(winningCells);
    gameContainer.classList.add("gameOver");
    console.log("-------------- " + currentPlayer + " won --------------");
  } else if (checkDraw()) {
    gameContainer.classList.add("gameOver");
    console.log("-------------- It's a draw! --------------");
  } else {
    switchPlayer();
    aimDisc.call(this);
    await waitForTransition(floatDisc, "top");
    gameContainer.style.pointerEvents = "unset";
    floatDisc.style.color = currentPlayer;
  }
}

function checkWin() {
  for (let i = 0; i < winPatterns.length; i++) {
    const cells = winPatterns[i].map((id) => document.getElementById(id));
    const isWinningPattern = cells.every(
      (cell) => cell.className === currentPlayer,
    );

    if (isWinningPattern) return cells;
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
