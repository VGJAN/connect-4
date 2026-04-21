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
