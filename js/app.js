let currentPlayer = "red";

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

const activeDisc = createIcon("fa-circle");
activeDisc.id = "activeDisc";
activeDisc.classList.add("transparent");
headerRow.cells[0].appendChild(activeDisc);

const floatDisc = createIcon("fa-circle");
floatDisc.id = "floatDisc";
gameContainer.appendChild(floatDisc);

updateFloatDisc()

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

  updateFloatDisc();
}

document.querySelectorAll("td").forEach((cell) => {
  cell.addEventListener("mouseover", updateActiveDisc);
});