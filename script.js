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
const totalRocks = 5;
let confettiContainer = null;

function createBoard() {
  // Start every tile as dirt.
  board = Array.from({ length: boardSize }, () => Array(boardSize).fill("dirt"));

  // Place the water droplet in the top center square.
  // In a 0-based array, the middle column is index 2.
  board[0][2] = "water";

  // Add random rocks that block the flow of water.
  placeRocks();
}

function placeRocks() {
  let rocksPlaced = 0;

  while (rocksPlaced < totalRocks) {
    const row = Math.floor(Math.random() * boardSize);
    const col = Math.floor(Math.random() * boardSize);

    // Only place rocks on dirt cells so the start tile stays clear.
    if (board[row][col] === "dirt") {
      board[row][col] = "rock";
      rocksPlaced += 1;
    }
  }
}

// Reset the game to its starting state.
function resetGame() {
  // Clear any old confetti before a new round begins.
  clearConfetti();

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

// Move the water droplet downward, and let it flow left or right
// when the path below is blocked by a rock or another obstacle.
function applyGravity() {
  let moved = true;

  while (moved) {
    moved = false;
    const waterPosition = findWaterPosition();

    if (!waterPosition) {
      return;
    }

    const { row, col } = waterPosition;

    // First try to continue down.
    if (row + 1 < boardSize && board[row + 1][col] === "empty") {
      board[row][col] = "empty";
      board[row + 1][col] = "water";
      renderBoard();
      moved = true;
      continue;
    }

    // If a path below is blocked, try moving left.
    if (col > 0 && board[row][col - 1] === "empty") {
      board[row][col] = "empty";
      board[row][col - 1] = "water";
      renderBoard();
      moved = true;
      continue;
    }

    // If left is blocked, try moving right.
    if (col + 1 < boardSize && board[row][col + 1] === "empty") {
      board[row][col] = "empty";
      board[row][col + 1] = "water";
      renderBoard();
      moved = true;
    }
  }
}

// Create a container for the confetti pieces.
function createConfettiContainer() {
  if (confettiContainer) {
    return;
  }

  confettiContainer = document.createElement("div");
  confettiContainer.className = "confetti-container";
  document.body.appendChild(confettiContainer);
}

// Launch a simple confetti effect when the player wins.
function launchConfetti() {
  createConfettiContainer();

  const colors = ["#FFC907", "#77A8BB", "#ffffff", "#ff6b6b", "#4ecdc4"];

  for (let i = 0; i < 40; i += 1) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = `${Math.random() * 0.2}s`;
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    confettiContainer.appendChild(piece);

    window.setTimeout(() => {
      piece.remove();
    }, 2400);
  }
}

function clearConfetti() {
  if (!confettiContainer) {
    return;
  }

  confettiContainer.innerHTML = "";
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
      } else if (cellType === "rock") {
        cell.classList.add("rock");
        cell.setAttribute("aria-label", "Rock");
        cell.textContent = "🪨";
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
      } else if (cellType === "rock") {
        cell.style.background = "linear-gradient(145deg, #7d7d7d, #525252)";
        cell.style.border = "2px solid #585858";
        cell.style.fontSize = "1.2rem";
        cell.style.display = "flex";
        cell.style.alignItems = "center";
        cell.style.justifyContent = "center";
      } else if (cellType === "empty") {
        cell.style.background = "linear-gradient(145deg, #f7e9c2, #e7cf9a)";
        cell.style.border = "2px solid #e2d4a9";
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
      launchConfetti();
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
