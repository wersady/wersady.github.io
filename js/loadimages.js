//Variables
var canvas = document.getElementById("cvs");
var cxt = canvas.getContext("2d");

var spritePaths = ["img/dev.jpg", "img/grass.jpg", "img/player.jpg"];
var sprites = [];
var backgroundPaths = ["img/background.jpg"];
var backgrounds = [];
var images = spritePaths.concat(backgroundPaths);
console.log(images);

//Images
for(var i = 0; i < spritePaths.length; i++) {
	sprites[i] = new Image();
	sprites[i].src = spritePaths[i];
}

for(var i = 0; i < backgroundPaths.length; i++) {
	backgrounds[i] = new Image();
	backgrounds[i].src = backgroundPaths[i];
}