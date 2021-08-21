//Variables

//Get the canvas
var canvas = document.getElementById("cvs");
var cxt = canvas.getContext("2d");

//Currently held inputs
var inputs = [];

//Array of tiles
var tiles = [];

//Array of objects
var objects = [];

//Array for the collision map
var collisions = [];

var currentColliders = [];

//Lerp function https://github.com/mattdesl/lerp
function lerp(v0, v1, t) {
    return v0 * (1 - t) + v1 * t
}

//Base function for tiles
var tile = function(image, x, y) {
	return {
		image: image,
		x: x,
		y: y
	};
}

//Draw the tile
function drawTile(image, x, y) {
	cxt.drawImage(image, x, y);	
}

//Base functions for objects
var player = function(x, y) {
	return {
		x: x,
		y: y,
		gravity: 0,
		gravityMax: 7,
		gravityForce: 0.5,
		speed: 2,
		canJump: false,
		jumpHeight: 10,
		acc: 0,
		accRate: 0.1,
		decRate: 0.2
	}
}

var collision = function(x, y, w, h) {
	return {
		x: x,
		y: y,
		w: w,
		h: h
	}
}

var cameraX = 0;

//Level
var level = [
"11111000000000000000000000000001000000000000",
"10000000000000000000000000000000000000000000",
"10000000000000000000000000000000000000000000",
"10000000000000000000000000000000000000000000",
"10000000000000000000000000000000000000000000",
"10000000000000000000000000000000000000000000",
"10011100000000000000000000000000000000000000",
"10000000000000000000000000000000000000000000",
"10000000000000000000000000000000000000000000",
"10000011000000000000000000000000000000000000",
"10000000000000000000000000000000000000000000",
"11110000100000000000000000000000000000000000",
"00A00000100000000000000000000000000000000000",
"11111111100000000000000000000000000000000000",
"00000000000000000000000000000000000000000000",
"00000000000000000000000000000000000000000001",
"00000000011111110000000000000000000000000001",
"00000000000100000000000000000000000000000001",
"00000000000100000000000000000000000000000001",
"11111111111111111111111111111111111111111111"];

//Check all of the level collisions at the given x and y
function checkLevelCollisions(x, y, w, h) {
	currentColliders = [];
	for(var i = 0; i < collisions.length; i++) {
		var collider = collisions[i];
		if(checkCollision(x, y, w, h, collider.x, collider.y, collider.w, collider.h)) {
			currentColliders.push(collider);
		}
	}
	if(currentColliders.length > 0) {
		return true;
	}
}

//Check a single collision
function checkCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
	if(x1 + w1 >= x2 && x1 <= x2 + w2 && y1 + h1 >= y2 && y1 <= y2 + h2) {
		return true;
	}	
}

//Draw the player
function drawPlayer(x, y) {
	cxt.drawImage(sprites[2], x, y);
}

//Update the player
function updatePlayer(player) {
	//Gravity
	player.gravity += player.gravityForce;

	//Cap gravity
	if(player.gravity > player.gravityMax) {
		player.gravity = player.gravityMax;
	}

	//Check for keyboard inputs and move the player
	if(inputs[37]) {
		player.x -= player.speed*player.acc;
	}
	if(inputs[39]) {
		player.x += player.speed*player.acc;
	}
	if(inputs[38] && player.canJump) {
		player.y -= 2;
		player.gravity = -player.jumpHeight;
	}

	//Manage acceleration
	if(inputs[37] || inputs[39]) {
		player.acc += player.accRate;
		if(player.acc > 1) {
			player.acc = 1;
		}
	} else {
		player.acc -= player.decRate;
		if(player.acc < 0) {
			player.acc = 0;
		}
	}

	//Make it so the player can't jump unless grounded
	player.canJump = false;

	//Check if the player is colliding with anything
	if(checkLevelCollisions(player.x, player.y, 32, 32)) {
		//If so, loop through everything the player is colliding with and check which side they're colliding with
		for(var i = 0; i < currentColliders.length; i++) {
			//Horizontal
			if(player.y + 31 > currentColliders[i].y && player.y < currentColliders[i].y + 32) {
				//Left
				if(player.x + 31 > currentColliders[i].x && player.x + 31 < currentColliders[i].x + 8) {
					player.x = currentColliders[i].x - 32;					
				}
				//Right
				if(player.x < currentColliders[i].x + 31 && player.x > currentColliders[i].x + 24) {
					player.x = currentColliders[i].x + 32;
				}
			}
			//Vertical
			if(player.x + 31 > currentColliders[i].x && player.x < currentColliders[i].x + 31) {
				//Top
				if(player.y + 24 < currentColliders[i].y) {
					player.gravity = 0;
					player.y = currentColliders[i].y - 32;
					player.canJump = true;					
				}
				//Bottom
				if(player.y > currentColliders[i].y + 24) {
					player.y = currentColliders[i].y + 32;
					player.gravity = 1;					
				}
			}						
		}
	}

	//Make the player fall
	player.y += player.gravity;

	updateCamera(player);
}

function updateCamera(player) {
	cameraX = lerp(cameraX, player.x - 1024/2, 0.2);
	if(cameraX < 0) {
		cameraX = 0;
	}
	if(cameraX > level[0].length * 32 - 1024) {
		cameraX = level[0].length * 32 - 1024;
	}
}

//Draw the level
function createLevel() {
	for(var i = 0; i < level.length; i++) {
		for(var j = 0; j < level[i].length; j++) {
			//Static tiles
			if(level[i].charAt(j) === "1") { //Dev tile
				tiles.push(tile(sprites[0], j*32, i*32));
				collisions.push(collision(j*32, i*32, 32, 32));
			}

			//Non-static objects			
			if(level[i].charAt(j) === "A") { //Player
				objects.push(player(j*32, i*32));
				objects[objects.length-1].typeid = "Player";
				//console.log(objects);
			}
			
		}
	}
}

//Update the level
function updateLevel() {
	//Loop through all the tiles
	for(var i = 0; i < tiles.length; i++) {
		drawTile(tiles[i].image, tiles[i].x - cameraX, tiles[i].y);
	}
}

//Update the objects
function updateObjects() {
	//Loop through all the objects
	for(var i = 0; i < objects.length; i++) {
		if(objects[i].typeid === "Player") {
			drawPlayer(objects[i].x - cameraX, objects[i].y);
			updatePlayer(objects[i]);		
		}
	}
}

createLevel();

//Loop through functions
setInterval(function(){
	//Draw the background
	cxt.drawImage(backgrounds[0], 0, 0);

	//updateCamera();

	//Update the level
	updateLevel();

	//Update all the objects
    updateObjects();
}, 1000/60);

//Check for keyboard input
document.addEventListener("keydown", function(event) {
    inputs[event.keyCode] = true;
});

document.addEventListener("keyup", function(event) {
    inputs[event.keyCode] = false;
});
