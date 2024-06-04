"use strict";

window.addEventListener("load", start);

function start(){
    console.log("Js is running")
    
    document.addEventListener("keydown", keyPress);

    createTiles();
    displayTiles();
    spawnGhosts();
    requestAnimationFrame(tick);
}


//#region CONTROLLER 

let lastTimestamp = 0;
function tick(timestamp){
  requestAnimationFrame(tick);

  const deltatime = (timestamp - lastTimestamp) / 1000;
  lastTimestamp = timestamp;

  movePlayer(deltatime);

  displayPlayerposition();
  //showDebugging();
}

function keyPress(event) {
  const pacman = document.querySelector("#pacman");
  pacman.classList.remove("pacman-left", "pacman-right", "pacman-up", "pacman-down", "moving");
  
  controls.left = false;
  controls.right = false;
  controls.up = false;
  controls.down = false;

  if(event.key === "ArrowLeft") {
      controls.left = true;
      pacman.classList.add("pacman-left");
  } else if(event.key === "ArrowRight") {
      controls.right = true;
      pacman.classList.add("pacman-right");
  } else if(event.key === "ArrowUp") {
      controls.up = true;
      pacman.classList.add("pacman-up");
  } else if(event.key === "ArrowDown") {
      controls.down = true;
      pacman.classList.add("pacman-down");
  }

  if (controls.left || controls.right || controls.up || controls.down) {
      pacman.classList.add("moving");
  }
}


//#endregion CONTROLLER

//#region MODEL */

function movePlayer(deltatime){
    pacman.moving = false;
    const newPos = {
        x: pacman.x,
        y: pacman.y
    }

    if(controls.up){
        pacman.moving = true;
        pacman.direction = "up";
        pacman.speed = pacman.topspeed;
    }
    if(controls.down){
        pacman.moving = true;
        pacman.direction = "down";
        pacman.speed = pacman.topspeed;
    }
    if(controls.left){
        pacman.moving = true;
        pacman.direction = "left";
        pacman.speed = pacman.topspeed;
    }
    if(controls.right){
        pacman.moving = true;
        pacman.direction = "right";
        pacman.speed = pacman.topspeed;
    }

    if(pacman.speed > 0){
      if(controls.up){
        newPos.y -= pacman.speed * deltatime;
      }
      if(controls.down){
        newPos.y += pacman.speed * deltatime;
      }
      if(controls.left){
        newPos.x -= pacman.speed * deltatime;
      }
      if(controls.right){
        newPos.x += pacman.speed * deltatime;
      }
    }

    if(canMoveToMore(newPos)){
        pacman.x = newPos.x;
        pacman.y = newPos.y;
        checkForItems();
    } else {
        pacman.moving = false;
    }
    
    
}

function canMoveTo(pos){
  const {row, col} = coordFromPos(pos);

  if(row < 0 || row >= GRID_height||
     col < 0 || col >= GRID_width){
    return false;
  }
  
  const tileType = getTileAtCoord({row, col});
  switch(tileType){
    case 0:
    case 2:
    case 3:
      return true;
    case 1:
      return false;
  }
  return true;
}

function canMoveToMore(pos){
  let canMove = true;

  const positions = getPosForPlayer(pos);

  positions.forEach(position => {
    const {row, col} = coordFromPos(position);
    console.log(row, col)

    if(row < 0 || row >= GRID_height||
      col < 0 || col >= GRID_width){
     canMove = false;
   } else {
    const tileType = getTileAtCoord({row, col});
    switch(tileType){
      case 0:
      case 3:
        break;
      case 1:
        canMove = false;
        break;
    }
  }
  });

  return canMove;
}

function spawnGhosts() {
  const ghostContainer = document.querySelector("#ghosts");
  const numberOfGhosts = 2; // Adjust the number of ghosts to spawn
  const ghostColors = 10; // Total number of ghost colors in the sprite sheet
  const frameHeight = 32; // Height of each ghost frame

  const occupiedPositions = new Set(); // Track occupied positions

  for (let i = 0; i < numberOfGhosts; i++) {
    let ghostPos;
    do {
      ghostPos = getRandomEmptyPosition();
    } while (!canMoveTo(ghostPos) || occupiedPositions.has(`${ghostPos.x},${ghostPos.y}`));

    // Mark the position as occupied
    occupiedPositions.add(`${ghostPos.x},${ghostPos.y}`);

    const ghostElement = document.createElement("div");
    ghostElement.classList.add("ghost");

    // Randomize the ghost color by setting a random background-position-y
    const randomColorIndex = Math.floor(Math.random() * ghostColors);
    const backgroundPositionY = -randomColorIndex * frameHeight;
    ghostElement.style.backgroundPosition = `0px ${backgroundPositionY}px`;

    ghostElement.style.left = `${ghostPos.x}px`;
    ghostElement.style.top = `${ghostPos.y}px`;
    ghostContainer.appendChild(ghostElement);
  }
}

function getRandomEmptyPosition() {
  let x, y, row, col;
  do {
    x = Math.floor(Math.random() * GRID_width) * tile_size;
    y = Math.floor(Math.random() * GRID_height) * tile_size;
    ({ row, col } = coordFromPos({ x, y }));
  } while (tiles[row][col] === 1); // Ensure the ghost does not spawn in a wall

  return { x, y };
}


const ghost = {
   x: 15,
   y: 15,
    speed: 100,
   direction: undefined };

const pacman = {
    x: 20,
    y: 20,
    regX: 16,
    regY: 16,
    hitbox: {
      x: 1,
      y: 1,
      w: 31,
      h: 31
    },
    speed: 100,
    topspeed: 150,
    moving: false,
    direction: undefined,
}

const controls = {
    up: false,
    down: false,
    left: false,
    right: false,
    use: false
}

const tiles = [
    [0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 3, 0, 1, 0, 1, 0, 0, 0, 0, 3],
    [0, 0, 0, 3, 1, 1, 1, 0, 1, 0, 3, 0, 0, 0, 1, 1, 1, 0, 1, 3],
    [0, 0, 0, 3, 0, 0, 1, 0, 1, 0, 3, 0, 0, 0, 0, 2, 1, 0, 1, 3],
    [0, 0, 1, 3, 3, 3, 0, 0, 0, 0, 3, 3, 1, 0, 0, 0, 0, 0, 3, 3],
    [1, 0, 1, 1, 1, 3, 1, 1, 0, 0, 1, 3, 1, 1, 1, 0, 1, 1, 3, 3],
    [1, 0, 0, 0, 0, 3, 3, 3, 0, 1, 1, 3, 0, 0, 0, 0, 0, 0, 3, 1],
    [3, 0, 1, 0, 0, 0, 1, 3, 3, 3, 3, 3, 1, 0, 0, 0, 1, 0, 3, 3],
    [3, 0, 1, 0, 1, 0, 0, 3, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 1, 1, 1, 3, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 3],
    [3, 0, 0, 0, 0, 2, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 3],
    [3, 3, 1, 0, 3, 3, 3, 3, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 3, 3],
    [1, 3, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 3, 3],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 1, 0, 3, 3, 1, 0, 3, 3, 0, 3, 1, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 1, 0, 1, 3, 3, 3, 0, 3, 0, 3, 1, 0, 1, 2, 0, 0, 0, 0],
    [3, 0, 0, 0, 1, 1, 1, 3, 1, 3, 3, 3, 0, 0, 1, 1, 1, 0, 1, 0],
    [3, 0, 0, 0, 0, 2, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0],
    [3, 3, 1, 0, 0, 0, 0, 3, 3, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    [1, 3, 1, 1, 1, 0, 1, 1, 3, 0, 1, 0, 1, 1, 1, 0, 1, 1, 3, 3],
    [1, 3, 3, 3, 3, 0, 0, 0, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 1],
]

const GRID_width = tiles[0].length;
const GRID_height = tiles.length;
const tile_size = 32;

function getTileAtCoord({row, col}){
  /* const row = coord.row;
  const col = coord.col; */

  //const {row, col} = coord; // destructuring
  
  return tiles[row][col];
}

function getTilesUnderPLayer(pacman){
  const coords = [];

  const topLeft = {x: pacman.x - pacman.regX + pacman.hitbox.x, y: pacman.y};
  const topRight = {x: pacman.x - pacman.regX + pacman.hitbox.x + pacman.hitbox.w, y: pacman.y};
  const bottomLeft = {x: pacman.x - pacman.regX + pacman.hitbox.x, y: pacman.y + pacman.hitbox.h};
  const bottomRight = {x: pacman.x - pacman.regX + pacman.hitbox.x + pacman.hitbox.w, y: pacman.y + pacman.hitbox.h};
  
  const coordTopLeft = coordFromPos(topLeft);
  const coordTopRight = coordFromPos(topRight);
  const coordBottomLeft = coordFromPos(bottomLeft);
  const coordBottomRight = coordFromPos(bottomRight);
  

  coords.push(coordTopLeft);
  coords.push(coordTopRight);
  coords.push(coordBottomLeft);
  coords.push(coordBottomRight);

  return coords;
}

function getPosForPlayer(pos){
  const positions = [];

  const topLeft = {x: pos.x - pacman.regX + pacman.hitbox.x, y: pos.y};
  const topRight = {x: pos.x - pacman.regX + pacman.hitbox.x + pacman.hitbox.w, y: pos.y};
  const bottomLeft = {x: pos.x - pacman.regX + pacman.hitbox.x, y: pos.y + pacman.hitbox.h};
  const bottomRight = {x: pos.x - pacman.regX + pacman.hitbox.x + pacman.hitbox.w, y: pos.y + pacman.hitbox.h};

  positions.push(topLeft);
  positions.push(topRight);
  positions.push(bottomLeft);
  positions.push(bottomRight);

  return positions;
}


function coordFromPos( {x, y} ){
  const row = Math.floor(y / tile_size);
  const col = Math.floor(x / tile_size);
  return {row, col};
}

function posFromCoord( {row, col} ){
  const x = col * tile_size;
  const y = row * tile_size;
  return {x, y};
}

//#endregion MODEL

//#region VIEW */

function displayPlayerposition(){
    const visualPlayer = document.querySelector("#pacman");
    visualPlayer.style.translate = `${pacman.x - pacman.regX}px ${pacman.y - pacman.regY}px`;
}


function createTiles(){
  const gameField = document.querySelector("#gamefield");

  const background = document.querySelector("#background");

  for(let row = 0; row < GRID_height; row++){
    for(let col = 0; col < GRID_width; col++){
      const tile = document.createElement("div");
      tile.classList.add("tile");
    
      background.append(tile);

      
      }
  }
      background.style.setProperty("--GRID_WIDTH", GRID_width);
      background.style.setProperty("--GRID_HEIGHT", GRID_height);
      background.style.setProperty("--TILE_SIZE", tile_size + "px");

      gameField.style.setProperty("--GRID_WIDTH", GRID_width);
      gameField.style.setProperty("--GRID_HEIGHT", GRID_height);
      gameField.style.setProperty("--TILE_SIZE", tile_size + "px");
    
}


function getNameForItem(item){
  switch(item){
    case 1: return "coin";
  }
}

function displayTiles(){
  const visualTiles = document.querySelectorAll("#background .tile");

  for(let row = 0; row < GRID_height; row++){
    for(let col = 0; col < GRID_width; col++){
      const tile = getTileAtCoord({row, col});
      const visualTile = visualTiles[row * GRID_width + col];

      visualTile.classList.add(getClassForTileType(tile))
    }
  }
}

function getClassForTileType(tile){
  switch(tile){
    case 0: return "empty";
    case 1: return "wall";
    case 2: return "coin";
    case 3: return "xp";
  }
}

//#endregion VIEW

//#region DEBUGGING
function showDebugging(){
    //showDebugTileUnderPlayer();
    //showDebugMoreTiles();
    showPlayerHitbox();
    //showDebugPlayerRegPoint();
    showDebugPlayerHitbox();
  }
  
  let lastCoord = {row: 1, col: 1};
  function showDebugTileUnderPlayer(){
    const coord = coordFromPos(pacman);
  
    if(coord.row !== lastCoord.row || coord.col !== lastCoord.col){
      unhighlightTile(lastCoord);
      highlightTile(coord);
    }
  
    lastCoord = coord;
  }
  
  let lastCoords = [];
  function showDebugMoreTiles(){
    const coords = getTilesUnderPLayer(pacman);
  
    lastCoords.forEach(coord => {
      unhighlightTile(coord);
    });
    lastCoords = [];
    coords.forEach(coord => {
      highlightTile(coord);
      lastCoords.push(coord);
    });
  }
  
  function showPlayerHitbox(){
    const pacman = document.querySelector("#pacman");
    
    if(!pacman.classList.contains("show-rect")){
      pacman.classList.add("show-rect");
    }
  
  }
  
  function showDebugPlayerRegPoint(){
    const visualPlayer = document.querySelector("#pacman");
  
    if(!visualPlayer.classList.contains("show-reg-point")){
      visualPlayer.classList.add("show-reg-point");
    }
  
    visualPlayer.style.setProperty("--regX", pacman.regX + "px");
    visualPlayer.style.setProperty("--regY", pacman.regY + "px");
  }
  
  function showDebugPlayerHitbox(){
    const visualPlayer = document.querySelector("#pacman");
  
    if(!visualPlayer.classList.contains("show-hitbox")){
      visualPlayer.classList.add("show-hitbox");
    }
  
    visualPlayer.style.setProperty("--hitboxWidth", pacman.hitbox.w + "px");
    visualPlayer.style.setProperty("--hitboxHeight", pacman.hitbox.h + "px");
    visualPlayer.style.setProperty("--hitboxX", pacman.hitbox.x + "px");
    visualPlayer.style.setProperty("--hitboxY", pacman.hitbox.y + "px");
  
  }
  
  function highlightTile({row, col}){
    const visualTiles = document.querySelectorAll("#background .tile");
    const visualTile = visualTiles[row * GRID_width + col];
    visualTile.classList.add("highlight");
  }
  
  function unhighlightTile(coord){
    const visualTiles = document.querySelectorAll("#background .tile");
    const visualTile = visualTiles[coord.row * GRID_width + coord.col];
    visualTile.classList.remove("highlight");
  }
  
  //#endregion DEBUGGING


  function checkForItems(){
    const items = getItemsUnderPlayer();
  
    items.forEach(item => {
        takeItem(item);
        });
  }

  function takeItem({row, col}){
    const item = tiles[row][col];

    if(item === 3){
        tiles[row][col] = 0; 

        const visualItem = document.querySelector(`#background .tile:nth-child(${(row * GRID_width) + col + 1})`);
        visualItem.classList.remove(getClassForTileType(item));

        console.log("Took item", item);
    }
}


function getItemsUnderPlayer(){
    const coords = getTilesUnderPlayer(pacman);
    const items = [];

    coords.forEach(coord => {
        const item = tiles[coord.row][coord.col];
        if(item === 3){
            items.push({row: coord.row, col: coord.col});
        }
    });

    return items;
}

function getTilesUnderPlayer(pacman){
  const coords = [];

  const topLeft = {x: pacman.x - pacman.regX + pacman.hitbox.x, y: pacman.y};
  const topRight = {x: pacman.x - pacman.regX + pacman.hitbox.x + pacman.hitbox.w, y: pacman.y};
  const bottomLeft = {x: pacman.x - pacman.regX + pacman.hitbox.x, y: pacman.y + pacman.hitbox.h};
  const bottomRight = {x: pacman.x - pacman.regX + pacman.hitbox.x + pacman.hitbox.w, y: pacman.y + pacman.hitbox.h};
  
  const coordTopLeft = coordFromPos(topLeft);
  const coordTopRight = coordFromPos(topRight);
  const coordBottomLeft = coordFromPos(bottomLeft);
  const coordBottomRight = coordFromPos(bottomRight);
  

  coords.push(coordTopLeft);
  coords.push(coordTopRight);
  coords.push(coordBottomLeft);
  coords.push(coordBottomRight);

  return coords;
}