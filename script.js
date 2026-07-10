// Step 1: Build the game board in JavaScript.
// We create a 6x6 grid and store it in an array so it is easy to render.

const boardSize = 6;
const boardElement = document.getElementById("board");
const scoreElement = document.getElementById("score");
const movesElement = document.getElementById("moves");
const messageElement = document.getElementById("game-message");
const restartButton = document.getElementById("restart-btn");

// Create a 2D array filled with dirt blocks.
// Each cell will be rendered as a div on the page.
let board = [];
let score = 0;
let moves = 20;
let gameOver = false;

function createBoard() {
  // Start every tile as dirt.
  board = Array.from({ length: boardSize }, () => Array(boardSize).fill("dirt"));

  // Place the water droplet in the top center square.
  // In a 0-based array, the middle column is index 2.
  board[0][2] = "water";
}

// Reset the game to its starting state.
function resetGame() {
  // Clear the score and move counters.
  score = 0;
  moves = 20;
  gameOver = false;

  // Rebuild the board and place the water back at the top.
  createBoard();

  // Refresh the visible stats and message.
  updateHud();
  updateMessage("Clear dirt blocks to guide the water to the reservoir.");
  renderBoard();
}

// Update the score and move counters shown on the page.
function updateHud() {
  scoreElement.textContent = score;
  movesElement.textContent = moves;
}

// Show the current message to the player.
function updateMessage(text) {
  messageElement.textContent = text;
}

// Check whether the water has reached the bottom row.
function hasReachedReservoir() {
  const waterPosition = findWaterPosition();

  if (!waterPosition) {
    return false;
  }

  return waterPosition.row === boardSize - 1;
}

// Find the current location of the water droplet on the board.
function findWaterPosition() {
  for (let row = 0; row < boardSize; row += 1) {
    for (let col = 0; col < boardSize; col += 1) {
      if (board[row][col] === "water") {
        return { row, col };
      }
    }
  }

  return null;
}

// Move the water droplet straight downward while the space below is empty.
function applyGravity() {
  const waterPosition = findWaterPosition();

  if (!waterPosition) {
    return;
  }

  let { row, col } = waterPosition;

  // Keep moving while there is empty space directly beneath the water.
  while (row + 1 < boardSize && board[row + 1][col] === "empty") {
    // Leave the old water spot empty.
    board[row][col] = "empty";

    // Move the water one row down.
    row += 1;
    board[row][col] = "water";

    // Re-render the board after each movement so the board stays in sync.
    renderBoard();
  }
}

// Render the board into the HTML container.
// This turns the array into visible div elements.
function renderBoard() {
  boardElement.innerHTML = "";

  board.forEach((row, rowIndex) => {
    row.forEach((cellType, colIndex) => {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = rowIndex;
      cell.dataset.col = colIndex;

      // Give the dirt blocks a clickable feel.
      if (cellType === "dirt") {
        cell.classList.add("dirt");
        cell.setAttribute("role", "button");
        cell.setAttribute("tabindex", "0");
        cell.setAttribute("aria-label", `Dirt block at row ${rowIndex + 1}, column ${colIndex + 1}`);
        cell.style.cursor = "pointer";
      } else if (cellType === "water") {
        cell.classList.add("water");
        cell.setAttribute("aria-label", "Water droplet");
        cell.textContent = "💧";
      }

      // Add simple visual styles directly in JavaScript.
      if (cellType === "dirt") {
        cell.style.background = "linear-gradient(145deg, #9a5a2b, #6f3f1d)";
        cell.style.border = "2px solid #7a4520";
      } else if (cellType === "water") {
        cell.style.background = "linear-gradient(145deg, #77A8BB, #3f7a8d)";
        cell.style.border = "2px solid #5f8ea5";
        cell.style.fontSize = "1.4rem";
        cell.style.display = "flex";
        cell.style.alignItems = "center";
        cell.style.justifyContent = "center";
      }

      boardElement.appendChild(cell);
    });
  });
}

// When the player clicks a dirt block, remove it, update the counters, and let gravity work.
function handleCellClick(event) {
  if (gameOver) {
    return;
  }

  const clickedCell = event.target.closest(".cell");

  if (!clickedCell) {
    return;
  }

  const row = Number(clickedCell.dataset.row);
  const col = Number(clickedCell.dataset.col);

  // Only dirt blocks can be removed.
  if (board[row][col] !== "dirt") {
    return;
  }

  // Give the clicked dirt block a small fade-out effect before the board updates.
  clickedCell.classList.add("is-removing");
  clickedCell.style.pointerEvents = "none";

  window.setTimeout(() => {
    // Use one move for each click.
    moves -= 1;
    score += 10;

    // Change the clicked tile into an empty space.
    board[row][col] = "empty";

    // Refresh the displayed score and moves.
    updateHud();

    // Make the water fall downward after the click.
    applyGravity();

    // Render the board one last time so the final state is shown.
    renderBoard();

    // Check for the win condition after the water has moved.
    if (hasReachedReservoir()) {
      gameOver = true;
      updateMessage("🎉 Clean Water Delivered!");
      return;
    }

    // Check for the loss condition when moves run out.
    if (moves <= 0) {
      gameOver = true;
      updateMessage("Game Over. The village still needs clean water.");
    }
  }, 180);
}

// Add the click listener to the board container.
boardElement.addEventListener("click", handleCellClick);

// Start a fresh game when the restart button is clicked.
restartButton.addEventListener("click", resetGame);

// Start the game by creating and showing the board.
resetGame();
