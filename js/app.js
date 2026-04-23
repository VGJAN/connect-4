let currentPlayer = "yellow";

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

const possibleWins = [];
const configs = [
  { row: [0, 5], col: [0, 3], dr: 0, dc: 1 },
  { row: [0, 2], col: [0, 6], dr: 1, dc: 0 },
  { row: [3, 5], col: [0, 3], dr: -1, dc: 1 },
  { row: [0, 2], col: [0, 3], dr: 1, dc: 1 },
];
configs.forEach (({row, col, dr, dc}) => {
  for (let r = row[0]; r <= row[1]; r++) {
    for (let c = col[0]; c <= col[1]; c++) {
      let combo = [];
      for (let i = 0; i < 4; i++) {
        combo.push(`${r + i * dr}-${c + i * dc}`);
      }
      possibleWins.push(combo);
    }
  }
});

const activeDisc = createIcon("fa-circle");
activeDisc.id = "activeDisc";
activeDisc.classList.add("transparent");
headerRow.cells[0].appendChild(activeDisc);

const floatDisc = createIcon("fa-circle");
floatDisc.id = "floatDisc";
floatDisc.classList.add("transparent");
gameContainer.appendChild(floatDisc);

updateFloatDisc();

function createIcon(iconName) {
  const icon = document.createElement("i");
  icon.classList.add("fa-solid", iconName);
  return icon;
}

function updateFloatDisc() {
  const activeRect = activeDisc.getBoundingClientRect();
  const containerRect = gameContainer.getBoundingClientRect();
  const top = activeRect.top + activeRect.height / 2 - containerRect.top;
  const left = activeRect.left + activeRect.width / 2 - containerRect.left;

  floatDisc.style.top = top + "px";
  floatDisc.style.left = left + "px";
}

function updateActiveDisc() {
  const col = this.dataset.col;
  const headerCells = document.querySelectorAll("#gameTable thead th");

  headerCells.forEach((cell) => (cell.innerHTML = ""));
  headerCells[col].appendChild(activeDisc);

  floatDisc.classList.remove("transparent", "red", "yellow");
  floatDisc.classList.add(currentPlayer);

  updateFloatDisc();
}

function dropDisc() {
  const col = this.dataset.col;
  for (let row = tbody.rows.length - 1; row >= 0; row--) {
    const cell = tbody.rows[row].cells[col];
    if (!cell.innerHTML) {
      cell.className = currentPlayer;
      cell.appendChild(createIcon("fa-circle"));
      cell.setAttribute("style", "mask: unset");

      if (!checkWin()) {
        currentPlayer = currentPlayer === "red" ? "yellow" : "red";
        updateActiveDisc.call(this);
      } else {
        gameContainer.classList.add("gameOver");
        console.log("-------------- " + currentPlayer + " won --------------");
      }
      break;
    }
  }
}

function checkWin() {
  for (var i = 0; i < possibleWins.length; i++) {
    const cell1 = document.getElementById(possibleWins[i][0]);
    const cell2 = document.getElementById(possibleWins[i][1]);
    const cell3 = document.getElementById(possibleWins[i][2]);
    const cell4 = document.getElementById(possibleWins[i][3]);

    const cellClassCheck = [
      cell1.className === currentPlayer,
      cell2.className === currentPlayer,
      cell3.className === currentPlayer,
      cell4.className === currentPlayer,
    ];

    if (!cellClassCheck.includes(false)) {
      return true;
    }
  }
}

document.querySelectorAll("td").forEach((cell) => {
  cell.addEventListener("mouseover", updateActiveDisc);
  cell.addEventListener("click", dropDisc);
});
