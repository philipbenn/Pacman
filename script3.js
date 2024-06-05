"use strict";

window.addEventListener("load", start);

function start() {
  console.log("start");
  playSound(startSound);
  addEventListeners();
  createGrid();
  displayGrid();
  spawnGhosts();
  requestAnimationFrame(tick);
}

//#region Controller
const updateInterval = 200;
let lastTimestamp = 0;
let score = 0;
let enemyMove = true;
function tick(timestamp) {

  if(timestamp - lastTimestamp > updateInterval){
    
    moveObject(pacman, getDirectionFromControls())
    displayEntityPosition(pacman);
    displayEntityAnimation(pacman);

    moveGhosts();
    lastTimestamp = timestamp;
    
  }

  powerUpCheck();

  displayGrid();

  gameOverCheck();

  requestAnimationFrame(tick);
}

function moveGhosts(){
  if(scatter){
    
    if(enemyMove){
    moveGhostsToScatter();
    enemyMove = false;
    } else {
      enemyMove = true;
    }
    
  } else {
    moveObject(aStarGhost, getDirectionForAStarGhost());
    
  }
  for(let ghost of ghosts){
    displayEntityPosition(ghost);
  }
}
  
//#region movement
function moveObject(entity, direction) {
  let inputDirection = direction
  let tempDirection = getDirection(inputDirection);


  let newPos = { x: entity.x, y: entity.y };
  newPos.x += tempDirection.x
  newPos.y += tempDirection.y

  
  if (canMoveTo(newPos)) {
    moveTo(entity, newPos, inputDirection);
    entity.lastDir = inputDirection;

  } else {
    tempDirection = getDirection(entity.lastDir);
    newPos = { x: entity.x, y: entity.y };
    newPos.x += tempDirection.x;
    newPos.y += tempDirection.y;

    if(canMoveTo(newPos)){
      moveTo(entity, newPos, entity.lastDir);

    } else {
      entity.moving = false;

    }

  }
}

function moveTo(entity, newpos, inputDirection){
  entity.x = newpos.x;
  entity.y = newpos.y;
  entity.moving = true;
  entity.direction = inputDirection;
  if(entity.name === "pacman"){
    checkForItems(entity.x, entity.y);
  }
}

function canMoveTo(pos){
  if(pos.x < 0 || pos.x > GRID_width - 1 || pos.y < 0 || pos.y > GRID_height - 1){
    return false;
  }
  if(getTileAtCoord({row: pos.y, col: pos.x}) === 1){
    return false;
  }
  return true;

}




//#endregion

//#endregion

//#region Model
function gameOverScreen() {
  console.log("Game Over");

  const gameOverScreen = document.createElement("div");
  gameOverScreen.classList.add("gameOverPopUp");
  gameOverScreen.innerHTML = `
    <h1>Game Over</h1>
    <button id="restartButton" style="font-family: Silkscreen">Restart</button>
  `;
  document.body.append(gameOverScreen);

  // Remove Pacman and ghosts from the screen
  despawnEntity(pacman);
  ghosts.forEach(ghost => despawnEntity(ghost));

  // Add an event listener to the restart button to reload the game
  document.getElementById("restartButton").addEventListener("click", () => {
    location.reload();
  });

  window.removeEventListener("keydown", keyDown);
}


//#endregion

//#region pacman
let gameOver = false;

function gameOverCheck() {
  for (let ghost of ghosts) {
    let collision = collisionCheck(ghost);
    if (powerUpActive && collision) {
      console.log("Ghost has been Eaten!");
      score += 200;
      updateScoreDisplay();
      playSound(eatGhostSound);
      ghosts.splice(ghosts.indexOf(ghost), 1);
      despawnEntity(ghost);

    } else if (!powerUpActive && collision) {
      if (!gameOver) {
        playSound(deathSound);
        gameOver = true;
        gameOverScreen();
      }
    }
  }
}


const pacman = {
  name: "pacman",
  x: 18,
  y: 8,
  moving: false,
  direction: undefined,
  lastDir: "right",
};
let powerUpActive = false;
let powerUpDuration = 0;

function eatPowerUp(){
  powerUpActive = true;
  powerUpDuration = 600;
  scatter = true;
  for (let ghost of ghosts) {
    addBlinkingEffect(ghost);
  }

  playPowerUpSound();
}

function powerUpCheck(){
  if (powerUpActive) {
    powerUpDuration--;
    if (powerUpDuration <= 0) {
      for (let ghost of ghosts) {
        removeBlinkingEffect(ghost);
      }
      scatter = false;
      powerUpActive = false;
      stopPowerUpSound();
    }
  }
}


//#endregion

//#region ghost
const aStarGhost = {
  name: "aStarGhost",
  x: 1,
  y: 1,
  moving: false,
  direction: undefined,
  lastDir: "right",
};



function getDirectionForAStarGhost(){
  const paths = getAStarPath({row: aStarGhost.y, col: aStarGhost.x}, {row: pacman.y, col: pacman.x});
  console.log(paths);
  let path = paths[1];
  if(paths.length === 1){
    path = paths[0];
  }
  if(path.row > aStarGhost.y){
    console.log("down")
    return "down";
  }
  if(path.row < aStarGhost.y){
    console.log("up")
    return "up";
  }
  if(path.col > aStarGhost.x){
    console.log("right")
    return "right";
  }
  if(path.col < aStarGhost.x){
    console.log("left")
    return "left";
  }
  
}

//#region A star
function getAStarPath(start, goal){
  return aStar(tiles, start, goal);
}

function createNode(row, col, walkable) {
  return {
      row: row,
      col: col,
      walkable: walkable,
      g: Infinity, // Cost from start to this node
      h: 0, // Heuristic cost to goal (only for A*)
      f: Infinity, // Total cost (only for A*)
      parent: null // To trace the path back
  };
}

function buildGraph(grid) {
  const graph = [];
  for (let row = 0; row < grid.length; row++) {
      graph[row] = [];
      for (let col = 0; col < grid[row].length; col++) {
          graph[row][col] = createNode(row, col, grid[row][col] !== 1);
      }
  }
  return graph;
}

function getNeighbors(graph, node) {
  const neighbors = [];
  const directions = [
      { row: -1, col: 0 }, // up
      { row: 1, col: 0 },  // down
      { row: 0, col: -1 }, // left
      { row: 0, col: 1 }   // right
  ];
  directions.forEach(dir => {
      const newRow = node.row + dir.row;
      const newCol = node.col + dir.col;
      if (newRow >= 0 && newRow < graph.length && newCol >= 0 && newCol < graph[0].length) {
          const neighbor = graph[newRow][newCol];
          if (neighbor.walkable) {
              neighbors.push(neighbor);
          }
      }
  });
  return neighbors;
}

function manhattanDistance(nodeA, nodeB) {
  return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
}

function reconstructPath(node) {
  const path = [];
  while (node !== null) {
      path.push({ row: node.row, col: node.col });
      node = node.parent;
  }
  return path.reverse();
}

function aStar(grid, startCoord, goalCoord) {
  const graph = buildGraph(grid);
  const startNode = graph[startCoord.row][startCoord.col];
  const goalNode = graph[goalCoord.row][goalCoord.col];
  const openSet = [];
  const closedSet = new Set();

  startNode.g = 0;
  startNode.h = manhattanDistance(startNode, goalNode);
  startNode.f = startNode.h;
  openSet.push(startNode);

      
  while (openSet.length > 0) {
      // Get the node with the lowest f cost
      openSet.sort((a, b) => a.f - b.f);
      const currentNode = openSet.shift();

      if (currentNode === goalNode) {
          return reconstructPath(currentNode);
      }

      closedSet.add(currentNode.row + "," + currentNode.col);
      const neighbors = getNeighbors(graph, currentNode);

neighbors.forEach(neighbor => {
          if (closedSet.has(neighbor.row + "," + neighbor.col)) {
              return;
          }

const tentativeG = currentNode.g + 1;

if (tentativeG < neighbor.g) {
              neighbor.parent = currentNode;
              neighbor.g = tentativeG;
              neighbor.h = manhattanDistance(neighbor, goalNode);
              neighbor.f = neighbor.g + neighbor.h;

if (!openSet.includes(neighbor)) {
                  openSet.push(neighbor);
              }
          }
      });
  }

return []; // No path found
}
//#endregion

const djikstraGhost = {
  name: "djikstraGhost",
  x: 1,
  y: 5, 
  moving: false,
  direction: undefined,
};

const gbfsGhost = {
  name: "gbfsGhost",
  x: 15,
  y: 5,
  moving: false,
  direction: undefined,
};

let ghosts = [aStarGhost];

function spawnGhosts(){
  const ghostContainer = document.querySelector("#ghosts");
  const ghostFrameHeight = 32;
  const ghostColors = 3;
  let ghostColorIncrement = 0;

  for(let ghost of ghosts){
    const visualGhost = document.createElement("div");
    visualGhost.classList.add("ghost");
    visualGhost.id = ghost.name;
    ghostContainer.append(visualGhost);
    visualGhost.style.backgroundPosition = `0px -${(ghostColorIncrement % ghostColors) * ghostFrameHeight}px`;
    ghostColorIncrement++;
  }
}

let scatter = false;

const initialAstarGhost = {x: aStarGhost.x, y: aStarGhost.y};
const initialDjikstraGhost = {x: djikstraGhost.x, y: djikstraGhost.y};
const initialgbfsGhost = {x: gbfsGhost.x, y: gbfsGhost.y};

function moveGhostsToScatter(){
    for(let ghost of ghosts){
      const initialPos = getInitialPos(ghost);
      console.log(initialPos)
      moveObject(ghost, getDirectionForScatter(ghost, initialPos));
    }
}

function getInitialPos(ghost){
  switch(ghost.name){
    case "aStarGhost":
      return initialAstarGhost;
    case "djikstraGhost":
      return initialDjikstraGhost;
  }
}

function getDirectionForScatter(ghost, initialPos){
  const paths = getAStarPath({row: ghost.y, col: ghost.x}, {row: initialPos.y, col: initialPos.x});
  let path = paths[1];
  if(paths.length === 1){
    path = paths[0];
  }
  if(path.row > ghost.y){
    console.log("down")
    return "down";
  }
  if(path.row < ghost.y){
    console.log("up")
    return "up";
  }
  if(path.col > ghost.x){
    console.log("right")
    return "right";
  }
  if(path.col < ghost.x){
    console.log("left")
    return "left";
  }

}

//#endregion

//#region level
const tiles = [
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 3, 3, 3, 2, 3, 3, 3, 3, 1],
  [1, 3, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 3, 1],
  [1, 3, 1, 2, 0, 1, 3, 1, 2, 0, 0, 1, 3, 1, 0, 2, 0, 1, 3, 1],
  [1, 3, 1, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1],
  [1, 3, 1, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1],
  [1, 3, 1, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1],
  [1, 3, 1, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1],
  [1, 3, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 3, 1],
  [1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const GRID_width = tiles[0].length;
const GRID_height = tiles.length;
const tile_size = 32;

//make the array into a graphs


//#endregion
//#endregion

//#region View
function createGrid(){
  const board = document.querySelector("#gameBoard");
  board.style.setProperty("--GRID_WIDTH", GRID_width);
  for(let row = 0; row < GRID_height; row++){
    for(let col = 0; col < GRID_width; col++){
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = row;
      cell.dataset.col = col;
      board.append(cell);
    }
  }
}

function addBlinkingEffect(entity){
  const visualEntity = document.querySelector(`#${entity.name}`);
  visualEntity.classList.add("blinking");

}

function removeBlinkingEffect(entity){
  const visualEntity = document.querySelector(`#${entity.name}`);
  visualEntity.classList.remove("blinking");

}

function despawnEntity(entity){
  const visualEntity = document.querySelector(`#${entity.name}`);
  visualEntity.remove();

}

function displayGrid(){
  const cells = document.querySelectorAll("#gameBoard .cell");
  cells.forEach((cell, index) => {
    const row = Math.floor(index / GRID_width);
    const col = index % GRID_width;
    const tile = getTileAtCoord({row, col});
    cell.classList.add(getClassForTileType(tile));
  });
}

function displayEntityPosition(entity) {
  const visualPlayer = document.querySelector(`#${entity.name}`);
  visualPlayer.style.transform = `translate(${entity.x * tile_size}px, ${entity.y * tile_size}px)`;
}

function displayEntityAnimation(entity) {
  const visualPlayer = document.querySelector(`#${entity.name}`);
  if (entity.direction && !visualPlayer.classList.contains(entity.direction)){
    visualPlayer.classList.remove("up", "down", "left", "right");
    visualPlayer.classList.add(`${entity.direction}`);
    if(!visualPlayer.classList.contains("animateVer") || !visualPlayer.classList.contains("animateHor")){
      if(entity.direction === "up" || entity.direction === "down"){
        visualPlayer.classList.remove("animateHor");
        visualPlayer.classList.add("animateVer");
      } else {
        visualPlayer.classList.remove("animateVer");
        visualPlayer.classList.add("animateHor");
      }
    }
  }   
}

function updateScoreDisplay() {
  const scoreDisplay = document.getElementById("score");
  scoreDisplay.textContent = `Score: ${score}`;
}


//#endregion

//#region Utility
function getDirection(direction) {
  if (direction === "up") {
    let temp = { x: 0, y: -1 };
    return temp;
  } else if (direction === "down") {
    let temp = { x: 0, y: 1 };
    return temp;
  } else if (direction === "left") {
    let temp = { x: -1, y: 0 };
    return temp;
  } else if (direction === "right") {
    let temp = { x: 1, y: 0 };
    return temp;
  }
  return { x: 0, y: 0 };
}

function collisionCheck(ghost){
  if(pacman.x === ghost.x && pacman.y === ghost.y){
    return true;
  }
}

function getTileAtCoord({ row, col }) {
  return tiles[row][col];
}

function getClassForTileType(tile) {
  switch (tile) {
    case 0:
      return "empty";
    case 1:
      return "wall";
    case 2:
      return "coin";
    case 3:
      return "xp";
  }
}

const controls = {
  up: false,
  down: false,
  left: false,
  right: false,
};

const aStarControls = {
  up: false,
  down: false,
  left: false,
  right: false,
};

const djikstraControls = {
  up: false,
  down: false,
  left: false,
  right: false,
};

const gbfsControls = {
  up: false,
  down: false,
  left: false,
  right: false,
 }

function getDirectionFromControls() {
  if (controls.up) {
    return "up";
  } else if (controls.down) {
    return "down";
  } else if (controls.left) {
    return "left";
  } else if (controls.right) {
    return "right";
  }
  return undefined;

}

function checkForItems(x, y) {
  const item = getItemFromGrid(x, y);

  if (item === 2) {
    console.log("coin");
    score += 50;
    eatPowerUp();
  }
  if (item === 3) {
    console.log("xp");
    score += 10;
    playSound(creditSound);
  }
  updateScoreDisplay();
  takeItem(x, y);
}

function getItemFromGrid(x, y) {
  return tiles[y][x];
}

function takeItem(col, row) {
  const visualItem = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
  visualItem.classList.remove(getClassForTileType(getItemFromGrid(col, row)));
  tiles[row][col] = 0;

}


//#endregion

//#region SOUND

let isPowerUpSoundPlaying = false;

const deathSound = document.querySelector("#death-sound");
const creditSound = document.querySelector("#credit-sound");
const startSound = document.querySelector("#start-sound");
const powerUpSound = document.querySelector("#power-sound");
const eatGhostSound = document.querySelector("#eat-ghost-sound");
const sirenSound = document.querySelector("#siren-sound");

function playSound(sound) {
  sound.play();
}


function playPowerUpSound() {
  powerUpSound.loop = true;
  powerUpSound.play();
}

function stopPowerUpSound() {
  powerUpSound.loop = false;
  powerUpSound.pause();
  powerUpSound.currentTime = 0; // reset
}

//#endregion

//#region Eventlisteners
function addEventListeners() {
  window.addEventListener("keydown", keyDown);
}

function keyDown(e) {
  controls.left = false;
  controls.right = false;
  controls.up = false;
  controls.down = false;

  if (e.key === "ArrowUp" || e.key === "w") {
    controls.up = true;
  } else if (e.key === "ArrowDown" || e.key === "s") {
    controls.down = true;
  } else if (e.key === "ArrowLeft" || e.key === "a") {
    controls.left = true;
  } else if (e.key === "ArrowRight" || e.key === "d") {
    controls.right = true;
  }
}
//#endregion
