console.log("Starting game...");

// background tiles
var bgTiles = new Image();
var bgTileWidth = 16, bgTileHeight = 16;
var bgTileSheetWidth = 20;

// camera (for scrolling), works in pixel coords
var cam = { x: 0, y: 8  * bgTileHeight};

var viewportTileWidth  = 16;  // viewport is 16 tiles wide
var viewportTileHeight = 14;  // viewport is 14 tiles tall
var viewportPixelWidth = viewportTileWidth * bgTileWidth;
var viewportPixelHeight = viewportTileHeight * bgTileHeight;
var viewportOffsetX = 0;
var viewportOffsetY = 0;

var ctx;

var FRAME_RATE = 30;

bgTiles.onload = function() {
  console.log("loaded bgTiles");
  bgLoaded = 1;
};
bgTiles.src = "gfx/smb3-1-1-Tileset.png";

// player sprites
var actorTiles = new Image();

actorTiles.onload = function () {
  console.log("loaded actorTiles");
};
actorTiles.src = "gfx/mario-large.png";

var opaque_tile = new Image();
opaque_tile.onload = function () {};
opaque_tile.src = "gfx/opaque_8_8.png";

var blue_pixel = new Image();
blue_pixel.onload = function () {};
blue_pixel.src = "gfx/blue_pixel.png";

var red_pixel = new Image();
red_pixel.onload = function () {};
red_pixel.src = "gfx/red_pixel.png";

var green_pixel = new Image();
green_pixel.onload = function () {};
green_pixel.src = "gfx/green_pixel.png";

// player
var actor = {
          x: 72,
          y: 336,
          width: 16,
          height: 32,
          isSuperSize: true,
          frame: 0,
          maxSpeed: 4,
          speed: 2,
          isJumping: false,
          isDucking: false,
          canJump: true,
          jumpReleased: true,
          verticalSpeed: 0,
          maxFallSpeed: 6,
          dir: '',
          facing: 'right',
          movedHoriz: false,
          movedVert: false,
          lastMovedHoriz: 0,
          lastMovedVert: 0,
          lastFired: Date.now(),
          
          gridX: function() { return Math.floor(this.x / bgTileWidth); },
          gridY: function() { return Math.floor(this.y / bgTileHeight); },
          gridYHigh: function() { return Math.floor((this.y-24) / bgTileHeight); },
          gridYLow: function() { return Math.floor((this.y-1) / bgTileHeight); },
          spriteLeftEdge: function() { return Math.floor((this.x - 4) / bgTileWidth); },
          spriteRightEdge: function() { return Math.floor((this.x + 3) / bgTileWidth); },
          spriteBottomLeftEdge: function() { return Math.floor((this.x - 4) / bgTileWidth); },
          spriteBottomRightEdge: function() { return Math.floor((this.x + 3) / bgTileWidth); },
          isCompletelyInGrid: function () { return ((this.y % bgTileHeight) == 0); }, // or standing on block
          isWallToLeft: function () {
            return getTileType(level[this.gridY()-1][this.spriteLeftEdge()]) == tileType.SOLID;
          },
          isWallToRight: function () {
            return getTileType(level[this.gridY()-1][this.spriteRightEdge()]) == tileType.SOLID;
          },
          isWallToLeftLow: function () {
            t = getTileType(level[this.gridYLow()][this.spriteLeftEdge()]);
            if (t == tileType.SOLID || t == tileType.TRAVERSABLE) {
              return true;
            } else  {
              return false;
            }
          },
          isWallToRightLow: function () {
            t = getTileType(level[this.gridYLow()][this.spriteRightEdge()]);
            if (t == tileType.SOLID || t == tileType.TRAVERSABLE) {
              return true;
            } else  {
              return false;
            }
          },
          isWallToLeftHigh: function () {
            return getTileType(level[this.gridYHigh()][this.spriteLeftEdge()]) == tileType.SOLID;
          },
          isWallToRightHigh: function () {
            return getTileType(level[this.gridYHigh()][this.spriteRightEdge()]) == tileType.SOLID;
          },
    		  isLeftFootOnGround: function () {
            t = getTileType(level[this.gridY()][this.spriteBottomLeftEdge()]);
            if (t == tileType.SOLID || t == tileType.TRAVERSABLE) {
              return true;
            } else  {
              return false;
            }
    		  },
    		  isRightFootOnGround: function () {
            t = getTileType(level[this.gridY()][this.spriteBottomRightEdge()]);
            if (t == tileType.SOLID || t == tileType.TRAVERSABLE) {
              return true;
            } else  {
              return false;
            }
    		  },
};

// level is 64x21  64x14
var level = [
[7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,28,28,28,28,28,28,28,28,28],
[7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,28,28,28,28,28,28,28,28,28],
[7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,35,7,7,7,6,28,28,28,28,28,28,28,28,28],
[7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,60,60,60,60,60,60,60,7,6,28,28,28,28,28,28,28,28,28],
[7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,28,28,28,28,28,28,28,28,28],
[7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,28,28,28,28,28,28,28,28,28],
[7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,28,28,28,28,28,28,28,28,28],
[7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,28,28,28,28,28,28,28,28,28],
[7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,28,28,28,28,28,28,28,28,28],
[7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,0,4,5,7,7,7,7,6,28,28,28,28,28,28,28,28,28],
[7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,1,2,3,7,7,7,7,6,28,28,28,28,28,28,28,28,28],
[7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,28,28,28,28,28,28,28,28,28],
[7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,111,111,7,7,7,7,7,7,7,7,7,7,6,28,28,28,28,28,28,28,28,28],
[7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,28,28,28,28,28,28,28,28,28],
[7,7,0,4,4,5,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,28,28,28,28,28,28,28,28,28],
[7,7,1,2,2,3,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,28,28,28,28,28,28,28,28,28],
[7,7,7,7,7,7,7,7,7,107,7,7,7,7,26,25,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,28,28,28,28,28,28,28,28,28],
[7,7,7,7,7,7,7,107,107,107,7,7,7,26,20,21,7,7,7,7,7,7,7,7,7,7,111,111,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,28,28,89,109,28,28,28,28,28],
[7,7,7,7,7,7,72,73,74,7,7,7,7,22,21,21,7,7,107,106,107,7,7,7,7,7,89,109,7,7,7,7,7,7,69,70,70,71,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,28,28,90,110,91,114,114,114,114],
[7,7,7,7,7,7,13,15,14,7,7,7,7,22,24,20,25,7,7,7,7,7,7,7,7,7,90,110,7,7,7,34,34,7,44,45,45,47,7,7,7,7,7,7,7,7,27,27,7,7,7,7,7,7,6,28,28,90,110,115,116,116,116,116],
[7,27,27,27,7,7,41,42,43,7,7,7,7,22,22,21,21,7,7,7,7,7,7,7,7,91,114,114,114,114,114,114,114,114,114,114,114,114,114,112,7,7,7,7,7,7,91,114,114,114,114,114,114,114,114,114,112,90,110,115,116,116,116,116],
[91,114,114,114,114,114,114,114,114,114,114,114,114,114,114,114,114,114,114,114,114,114,114,114,112,115,116,116,116,116,116,116,116,116,116,116,116,116,116,116,92,92,92,7,7,7,115,116,116,116,116,116,116,116,116,116,113,90,110,115,116,116,116,116]
];

var levelHeight = level.length;
var levelWidth = level[0].length;
console.log("Level is " + levelWidth + " x " + levelHeight);

// tile sheet is 20 tiles wide
// 0-59 passable tile
// 60-79 passable from below, solid on top
// 80-? solid tiles

var tileType = {
	// needs:
	// spiky/lava
	// water
	// ice
	UNKNOWN: 		-1,
	PASSABLE: 		1,
	TRAVERSABLE: 	2,
	SOLID: 			3
};

getTileType = function(tileId) {
	switch (true) {
    	case (tileId < 60):
    		return tileType.PASSABLE;
    	break;
    	case (tileId < 80):
    		return tileType.TRAVERSABLE;
    	break;
    	case (tileId < 120):
    		return tileType.SOLID;
    	break;
    	default:
    		return tileType.UNKNOWN;
    }
};

window.onload = function() {
	console.log(".onload()");
    var c=document.getElementById("screen");
    ctx=c.getContext("2d");

	setInterval(function() { gameLoop(); }, 1000/FRAME_RATE);
};

gameLoop = function() {
  processKeys();

	movePlayer(actor);

  if (actor.movedHoriz || actor.movedVert) {
	 adjustCamera();
  }
  drawLevelCam();
  drawPlayer(actor);
	showDebugInfo();
};

drawLevelCam = function () {
  for (x = 0; x < 17; x++) {
    for (y = 0; y < 14; y++) {
      // convert pixel coords to tile coords
      tx = Math.floor(cam.x / bgTileWidth) + x;
      ty = Math.floor(cam.y / bgTileHeight) + y;
      drawOffsetBgTileId(level[ty][tx], x, y, viewportOffsetX, viewportOffsetY);
    }
  }
//  console.log("grid x, y: " + tx + "," + ty + " vox: " + viewportOffsetX + " x: " + actor.x);
};

drawLevel = function () {
    for (x = 0; x < 17; x++) {
    for (y = 0; y < 14; y++) {
      // convert pixel coords to tile coords
      drawOffsetBgTileId(level[y][x], x, y, viewportOffsetX, viewportOffsetY);
    }
  }
};

// keep the player somewhat centered on the screen relative to the camera
adjustCamera = function () {
  // the amount of pixels the player is 'off' the grid
  // s = actor.isRunning ? 4 : 2; // speed of player
  s = actor.lastMovedHoriz;

/*
	16x14 viewport

	|     +           +      |

  if the player moves outside of columns 7 or 9, scroll the camera over 
  the same number of pixels as the player moved
*/
	// scroll right
	if ((actor.x) > (cam.x + (9 * bgTileWidth)) && (actor.x < ((levelWidth - 7) * bgTileWidth) )) {
  	cam.x = cam.x + s;
    viewportOffsetX = actor.x % 16;
    viewportOffsetY = 0; // we didn't implement vertical camera scrolling yet
    // need to test for right edge of map
	} else if ( (cam.x > 0 ) && ((actor.x) < (cam.x + 7 * bgTileWidth) ) ) {
    // scroll back left
    cam.x = cam.x - s;
    if (cam.x < 0) { cam.x = 0; } // don't scroll off screen left
    viewportOffsetX = actor.x % 16;
    viewportOffsetY = 0; // we didn't implement vertical camera scrolling yet

	} else {
    // we're in the center of the screen and not pushing a scroling boundary
    // don't scroll left or right
  }
};

// draw background tile #id on screen at grid position x,y
drawBgTileId = function (tileId, dest_x, dest_y) {
	source_x = bgTileWidth * (tileId % bgTileSheetWidth);
	source_y = bgTileHeight * (Math.floor(tileId / bgTileSheetWidth));

  ctx.drawImage(bgTiles, source_x, source_y, bgTileWidth, bgTileHeight, 
    				bgTileWidth * dest_x, bgTileHeight * dest_y, bgTileWidth, bgTileHeight);
};

// draw background tile #id on screen at grid position x,y
// use offset for smooth scrolling effect
drawOffsetBgTileId = function (tileId, dest_x, dest_y, x_off, y_off) {
  source_x = bgTileWidth * (tileId % bgTileSheetWidth);
  source_y = bgTileHeight * (Math.floor(tileId / bgTileSheetWidth));

    ctx.drawImage(bgTiles, source_x, source_y, bgTileWidth, bgTileHeight, 
            (bgTileWidth * dest_x) - x_off, (bgTileHeight * dest_y) - y_off,
            bgTileWidth, bgTileHeight);
};

// draw background tile x, y on screen at grid position dest_x, dest_y
drawBgTileXY = function (tilesheet_x, tilesheet_y, dest_x, dest_y) {
	source_x = bgTileWidth * tilesheet_x;
	source_y = bgTileHeight * tilesheet_y;

  ctx.drawImage(bgTiles, source_x, source_y, bgTileWidth, bgTileHeight, 
    				bgTileWidth * dest_x, bgTileHeight * dest_y, bgTileWidth, bgTileHeight);
};

showDebugInfo = function () {
	ctx.beginPath();
    ctx.rect(8, 4, 240, 14);
    ctx.fillStyle = '#303030';
    ctx.fill();

    ctx.font = "9px Monaco";
	ctx.fillStyle = "yellow";

	debugInfoString = "P:" + actor.x + "," + actor.y + 
						" Grid:" + actor.gridX() + "," + actor.gridY() +
            " Vspd:" + actor.verticalSpeed +
            // " Off:" + viewportOffsetX + "," + viewportOffsetY;
			" L:" + getTileType(level[actor.gridY()][actor.spriteLeftEdge()]) +
			" G:" + getTileType(level[actor.gridY()][actor.gridX()]) +
			" R:" + getTileType(level[actor.gridY()][actor.spriteRightEdge()]) +
			"";
	ctx.fillText(debugInfoString, 10, 14);
//  console.log("Camera: " + cam.x + ", " + cam.y + " Off: " + viewportOffsetX + ", " + viewportOffsetY);
};

/*
void ctx.drawImage(image, dx, dy);
void ctx.drawImage(image, dx, dy, dWidth, dHeight);
void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
*/

drawPlayer = function (o) {
  if (o.facing == 'right') {
    d = 0;
  } else {
    d = 1;
  }

  if (o.isJumping) {
    o.frame = 4;
  }

  if (o.isDucking) {
    o.frame = 5;
  }
//  ctx.drawImage(actorTiles, Math.floor(o.frame)*16, d*o.height, o.width, o.height, o.x-(o.width/2), o.y-(32), o.width, o.height);
  ctx.drawImage(actorTiles, Math.floor(o.frame)*16, d*o.height, o.width, o.height, (o.x-cam.x)-(bgTileWidth/2), (o.y-cam.y)-(o.height), o.width, o.height);

  // draw opaque box that player is 'in'
  // tx = 2; ty = 2;
  tx = o.gridX();
  ty = o.gridY();
//  ctx.drawImage(opaque_tile, tx * bgTileWidth, ty * bgTileHeight);
//  ctx.drawImage(opaque_tile, ((tx*16)-cam.x), ((ty*16)-cam.y));// tx * bgTileWidth, ty * bgTileHeight);

  draw_hit_points = false;
  // hpx = o.x; hpy = o.y;
  hpx = o.x-cam.x;
  hpy = o.y-cam.y;

  if (draw_hit_points) {
    // draw the actual location of x, y
    ctx.drawImage(blue_pixel, hpx, hpy, 2, 2);

    // draw left and right foot hit detectors
    if (o.isLeftFootOnGround()) {
      ctx.drawImage(blue_pixel, hpx-6, hpy, 2, 2);
    } else {
      ctx.drawImage(red_pixel, hpx-6, hpy, 2, 2);
    }
    if (o.isRightFootOnGround()) {
      ctx.drawImage(blue_pixel, hpx+5, hpy, 2, 2);
    } else {
      ctx.drawImage(red_pixel, hpx+5, hpy, 2, 2);
    }

    // draw left/right block hit detectors
    if (o.isWallToLeft()) {
      ctx.drawImage(blue_pixel, hpx-6, hpy-16, 2, 2);
    } else {
      ctx.drawImage(red_pixel, hpx-6, hpy-16, 2, 2);
    }
    if (o.isWallToRight()) {
      ctx.drawImage(blue_pixel, hpx+5, hpy-16, 2, 2);
    } else {
      ctx.drawImage(red_pixel, hpx+5, hpy-16, 2, 2);
    }

    // draw left/right head-level block hit detectors
    if (o.isWallToLeftHigh()) {
      ctx.drawImage(blue_pixel, hpx-6, hpy-24, 2, 2);
    } else {
      ctx.drawImage(red_pixel, hpx-6, hpy-24, 2, 2);
    }
    if (o.isWallToRightHigh()) {
      ctx.drawImage(blue_pixel, hpx+5, hpy-24, 2, 2);
    } else {
      ctx.drawImage(red_pixel, hpx+5, hpy-24, 2, 2);
    }

    // draw left/right foot-level block hit detectors
    if (o.isWallToLeftLow()) {
      ctx.drawImage(blue_pixel, hpx-6, hpy-2, 2, 2);
    } else {
      ctx.drawImage(red_pixel, hpx-6, hpy-2, 2, 2);
    }
    if (o.isWallToRightLow()) {
      ctx.drawImage(blue_pixel, hpx+5, hpy-2, 2, 2);
    } else {
      ctx.drawImage(red_pixel, hpx+5, hpy-2, 2, 2);
    }
  }
};

movePlayer = function (o) {
  actor.movedHoriz = actor.movedVert = false;
  s = o.isRunning ? 4 : 2;

	switch (o.dir) {
    case 'right':
      while (actor.movedHoriz == false && s > 0 && !actor.isDucking) {
        actor.x += s;
        // test if we can move here
        if (!o.isWallToRight() && !o.isWallToRightHigh() && !o.isWallToRightLow() && (o.x < (levelWidth*bgTileWidth)) ) {
          actor.movedHoriz = true;
          o.lastMovedHoriz = s;  // we need to adjust the camera by this amount in case we move < actor.speed
          if (actor.frame < 1) {
            actor.frame += 1; 
          } else {
            actor.frame += 0.5;
          }
          if (Math.floor(actor.frame) > 2) { actor.frame = 0; }
        } else {  // we can't move here, go back
          actor.x -= s;
        }
        s = s-2;
      }
      break;
    case 'left':
      while (actor.movedHoriz == false && s > 0 && !actor.isDucking) {
        actor.x -= s;
        // test if we can move here
        if (!o.isWallToLeft() && !o.isWallToLeftHigh() && !o.isWallToLeftLow() && o.x > 0) {
          actor.movedHoriz = true;
          o.lastMovedHoriz = s;
          if (actor.frame < 1) {
            actor.frame += 1; 
          } else {
            actor.frame += 0.5;
          }
          if (Math.floor(actor.frame) > 2) { actor.frame = 0; }
        } else {
          actor.x += s;
        }
        s = s-2;
      }
      break;
  }
  // vertical movement
  if (o.isJumping == true) {
    // JUMP UP
    hit_head = false;
    vs = o.verticalSpeed;
    while (hit_head == false && vs > 0) {
      o.y -= vs;

      if (o.isWallToLeftHigh() || o.isWallToRightHigh()) {
        o.y += vs;
        vs--;
      } else {
        hit_head = true;
        if (vs < o.verticalSpeed) {  // did we not go up as high as we could have? 
          o.isJumping = false;
          o.canJump = false;
          o.verticalSpeed = 1;
        }
      }
    }

    if (o.verticalSpeed > 0) {  // nothing blocked us, keep flying up
      o.verticalSpeed--;
    } else {                    // we ran out of 'jump', fall back down
      o.canJump = false;
      o.isJumping = false;
      o.verticalSpeed = 1;
    }
  } else {
    vs = o.verticalSpeed;
    // apply gravity
    if (o.isRightFootOnGround() || o.isLeftFootOnGround()) {
      // not falling
      o.isJumping = false;
      o.canJump = true;
      o.verticalSpeed = 0;
    } else {
      o.canJump = false;  // can't jump while falling
      if (o.verticalSpeed < o.maxFallSpeed) {
        o.verticalSpeed++;
      }

      landed = false;
      while (landed == false && vs > 0) {
        o.y += vs; // need to check if we can even fall this far
        if (o.isRightFootOnGround() || o.isLeftFootOnGround()) {
          if (o.isWallToRightLow() || o.isWallToLeftLow()) {
            o.y -= vs; // can't fall this far, go back
          } else {
            landed = true;
            o.frame = 0;
            o.isJumping = false;
            o.canJump = true;
            o.verticalSpeed = 0;
          }
        }
        vs--;
      }
    }
    o.lastMovedVert = vs;
  }  // end 'isJumping == true' else
};

//
// KEYBOARD HANDLING
//(num % 2) == 1
var keys = function () {
  var keyMap = {
    '37': 'left',
    '39': 'right', // arrows
    '38': 'up',
    '40': 'down',
    '65': 'jump',
    '83': 'run' // A, S
  },
  kInfo = {
    'left': 0,
    'right': 0,
    'up': 0,
    'down': 0,
    'run': 0,
    'jump': 0
  },
  key;

  $(document).bind('keydown keyup', function (event) {
    key = '' + event.which;
    if (keyMap[key] !== undefined) {
      kInfo[keyMap[key]] = (event.type === 'keydown' ? 1 : 0);
      return false;
    }
  });

  return kInfo;
}();

processKeys = function () {
  // keyups
  if (!keys.left) {
    if (actor.dir == 'left') {
      actor.dir = '';
      actor.frame = 0;
    }    
  }

  if (!keys.right) {
    if (actor.dir == 'right') {
      actor.dir = '';
      actor.frame = 0;
    }
  }

  if (!keys.jump) {
      actor.jumpReleased = true;
  }

  if (!keys.run) {
    actor.isRunning = false;
  }

  if (!keys.down) {
    actor.isDucking = false;
    if (actor.frame == 5) { // don't get stuck in ducking frame
      actor.frame = 0;
    }
  }

  // keydowns
  if (keys.left) {
    actor.dir = actor.facing = 'left';
  }
  if (keys.right) {
    actor.dir = actor.facing = 'right';
  }
  if (keys.down) {
    actor.isDucking = true;
  }
  if (keys.jump) {
    if (actor.jumpReleased) {
      if ((actor.verticalSpeed == 0) && actor.canJump && !actor.isJumping) {
        actor.verticalSpeed = actor.isRunning ? 14 : 12;
        actor.isJumping = true;
        actor.jumpReleased = false;
      }
    }
  }
  if (keys.run) {
    actor.isRunning = true;
  }
};
