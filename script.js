"use strict";

window.addEventListener("load", start);

function start() {
    console.log("start");
    setupGame();
}


//region controller
let gridwidth;
let gridheight;
let position = {x: 0, y: 0};

function setupGame(){
    gridwidth = 10;
    gridheight = 6;
    createModel();
    createView();

    document.addEventListener("keydown", keyDown)

    writeToCell(position.y, position.x, 1);

    startGame();

}

function startGame(){
    displayModel();
    tick();
}

function tick(){
    const run = setTimeout(tick, 500)

    writeToCell(position.y, position.x, 0);


    if(controls.left){
        if(canMoveTo(position.y, position.x - 1)){
        direction = "left";
        }
    } else if(controls.right){
        if(canMoveTo(position.y, position.x + 1)){
        direction = "right";
        }
    } else if(controls.up){
        if(canMoveTo(position.y - 1, position.x)){
        direction = "up";
        }
    } else if(controls.down){
        if(canMoveTo(position.y + 1, position.x)){
        direction = "down";
        }
    }
    //console.log(position.x, position.y)
    let nextPos = {x: position.x, y: position.y};
    nextPos = move(direction, nextPos);
    
    if(canMoveTo(nextPos.y, nextPos.x)){
    position = nextPos;
    }
    

    writeToCell(position.y, position.x, 1);


    displayModel();
}

function move(directionIn, nextPos){
    switch(directionIn){
        case "up":
            nextPos.y--;
            if(nextPos.y < 0){
                nextPos.y = gridheight - 1;
            }
            break;
        case "down":
            nextPos.y++;
            if(nextPos.y >= gridheight){
                nextPos.y = 0;
            }
            break;
        case "left":
            nextPos.x--;
            if(nextPos.x < 0){
                nextPos.x = gridwidth - 1;
            }
            break;
        case "right":
            nextPos.x++;
            if(nextPos.x >= gridwidth){
                nextPos.x = 0;
            }
            break;
    }
    return nextPos;
}

function canMoveTo(row, col){
    if(row < 0){
        row = gridheight - 1;
    }
    if(row >= gridheight){
        row = 0;
    }
    return model[row][col] !== 2;
}


function keyDown(event){

    controls.left = false;
    controls.right = false;
    controls.up = false;
    controls.down = false;

    switch(event.key){
        case "ArrowUp":
            controls.up = true;
            break;
        case "ArrowDown":
            controls.down = true;
            break;
        case "ArrowLeft":
            controls.left = true;
            break;
        case "ArrowRight":
            controls.right = true;
            break;
        case "w":
            controls.up = true;
            break;
        case "s":
            controls.down = true;
            break;
        case "a":
            controls.left = true;
            break;
        case "d":
            controls.right = true;
            break;
    }
}

//endregion

//region model
let model = [
[0,0,0,0,0,0,0,0,0,5],
[0,0,0,0,2,2,2,2,0,0],
[0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,3,3,3,0,0,0],
[0,0,0,0,0,0,3,0,0,0],
[5,0,0,0,0,4,0,0,0,5]
];

let direction = "right";

let controls = {
    up: false,
    down: false,
    left: false,
    right: false
}

function createModel(){
    for(let row = 0; row < gridheight; row++){
        const rowArray = [];
        for(let col = 0; col < gridwidth; col++){
            rowArray.push(0);
        }
        model.push(rowArray);
    }
}

function writeToCell(row, col, value){
    model[row][col] = value;
}

function readFromCell(row, col){
    return model[row][col];
}

//endregion

//region view


function createView(){
    const board = document.querySelector("#grid");
    board.style.setProperty("--GRID_WIDTH", gridwidth);
    for(let row = 0; row < gridheight; row++){
        for(let col = 0; col < gridwidth; col++){
            const cell = document.createElement("div");
            cell.classList.add("cell");
            board.appendChild(cell);
        }
    }
}

function displayModel(){
    const board = document.querySelector("#grid");
    const cells = board.querySelectorAll(".cell");
    cells.forEach((cell, index) => {
        const row = Math.floor(index / gridwidth);
        const col = index % gridwidth;
        clearCell(cell);
        cell.classList.add(getType(model[row][col]));
    });
}

function getType(value){
    switch(value){
        case 0:
            return "empty";
        case 1:
            return "pacman";
        case 2:
            return "wall";
        case 3:
            return "coin";
        case 4:
            return "food";
        case 5:
            return "power";
    }
}

function clearCell(cell){
    cell.classList.remove("pacman");
    cell.classList.remove("wall");
    cell.classList.add("empty");
    cell.classList.remove("coin");
    cell.classList.remove("food");
    cell.classList.remove("power");
}
//endregion