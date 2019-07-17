console.log("Starting game...");

// background tiles
var bgTiles = new Image();
var bgTileWidth = 16, bgTileHeight = 16;
var bgTileSheetWidth = 20;

bgTiles.onload = function() {
  console.log("loaded bgTiles");
  bgLoaded = 1;
}
bgTiles.src = "gfx/smb3-1-1-Tileset.png";

// player sprites
var actorTiles = new Image();

actorTiles.onload = function () {
  console.log("loaded actorTiles");
}
actorTiles.src = "gfx/luigi-large.png";

var hit_det_overlay = new Image();
hit_det_overlay.onload = function () {};
hit_det_overlay.src = "gfx/hit_detect_overlay_16_24.png";

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


var viewportTileWidth  = 16;  // viewport is 16 tiles wide
var viewportTileHeight = 14;  // viewport is 14 tiles tall
var viewportPixelWidth = viewportTileWidth * bgTileWidth;
var viewportPixelHeight = viewportTileHeight * bgTileHeight;
var viewportOffsetX = 0;
var viewportOffsetY = 0;
var toggle = true;

var ctx;

var FRAME_RATE = 30;

var gravity = 0.25;

// player
var luigi = {
          x: 100,
          y: 80,
          width: 16,
          height: 32,
          frame: 0,
          maxSpeed: 4,
          speed: 2,
          isJumping: false,
          canJump: true,
          jumpHeight: -12,
          verticalSpeed: 0,
          maxVerticalSpeed: 8,
          maxFallSpeed: 8,
          dir: '',
          facing: 'right',
          moved: false,
          lastFired: Date.now(),
          
          gridX: function() { return Math.floor(this.x / bgTileWidth); },
          gridY: function() { return Math.floor(this.y / bgTileHeight); },
          gridYHigh: function() { return Math.floor((this.y-24) / bgTileHeight); },
          gridYLow: function() { return Math.floor((this.y-1) / bgTileHeight); },
          spriteLeftEdge: function() { return Math.floor((this.x - 5) / bgTileWidth); },
          spriteRightEdge: function() { return Math.floor((this.x + 4) / bgTileWidth); },
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
            return getTileType(level[this.gridYLow()][this.spriteLeftEdge()]) == tileType.SOLID;
          },
          isWallToRightLow: function () {
            return getTileType(level[this.gridYLow()][this.spriteRightEdge()]) == tileType.SOLID;
          },
          isWallToLeftHigh: function () {
            return getTileType(level[this.gridYHigh()][this.spriteLeftEdge()]) == tileType.SOLID;
          },
          isWallToRightHigh: function () {
            return getTileType(level[this.gridYHigh()][this.spriteRightEdge()]) == tileType.SOLID;
          },
    		  isLeftFootOnGround: function () {
            return getTileType(level[this.gridY()][this.spriteBottomLeftEdge()]) == tileType.SOLID;
    		  },
    		  isRightFootOnGround: function () {
            return getTileType(level[this.gridY()][this.spriteBottomRightEdge()]) == tileType.SOLID;
    		  },
};

// camera (for scrolling), works in pixel coords
var cam = { x: 0, y: 8 * bgTileHeight};

// level is 64x21  64x14
/*[7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,28,28,28,28,28,28,28,28,28],
[7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,28,28,28,28,28,28,28,28,28],
[7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,35,7,7,7,6,28,28,28,28,28,28,28,28,28],
[7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,60,60,60,60,60,60,60,7,6,28,28,28,28,28,28,28,28,28],
[7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,28,28,28,28,28,28,28,28,28],
[7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,28,28,28,28,28,28,28,28,28],
[7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,28,28,28,28,28,28,28,28,28],
[7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,28,28,28,28,28,28,28,28,28],
*/
var level = [
[7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,28,28,28,28,28,28,28,28,28],
[7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,0,4,5,7,7,7,7,6,28,28,28,28,28,28,28,28,28],
[7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,1,2,3,7,7,7,7,6,28,28,28,28,28,28,28,28,28],
[7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,28,28,28,28,28,28,28,28,28],
[7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,111,111,7,7,7,7,7,7,7,7,7,7,6,28,28,28,28,28,28,28,28,28],
[7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,28,28,28,28,28,28,28,28,28],
[7,7,0,4,4,5,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,28,28,28,28,28,28,28,28,28],
[7,7,1,2,2,3,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,28,28,28,28,28,28,28,28,28],
[7,7,7,7,7,7,107,7,7,107,7,7,7,7,26,25,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,28,28,28,28,28,28,28,28,28],
[7,7,7,7,7,7,107,107,107,107,7,7,7,26,20,21,7,7,7,7,7,7,7,7,7,7,111,111,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,28,28,89,109,28,28,28,28,28],
[7,7,7,7,7,7,72,73,74,7,7,7,7,22,21,21,7,7,107,106,107,7,7,7,7,7,89,109,7,7,7,7,7,7,69,70,70,71,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,28,28,90,110,91,114,114,114,114],
[7,7,7,7,7,7,13,15,14,7,7,7,7,22,24,20,25,7,7,7,7,7,7,7,7,7,90,110,7,7,7,34,34,7,44,45,45,47,7,7,7,7,7,7,7,7,27,27,7,7,7,7,7,7,6,28,28,90,110,115,116,116,116,116],
[7,27,27,27,7,7,41,42,43,7,7,7,7,22,22,21,21,7,7,7,7,7,7,7,7,91,114,114,114,114,114,114,114,114,114,114,114,114,114,112,7,7,7,7,7,7,91,114,114,114,114,114,114,114,114,114,112,90,110,115,116,116,116,116],
[91,114,114,114,114,114,114,114,114,114,114,114,114,114,114,114,114,114,114,114,114,114,114,114,112,115,116,116,116,116,116,116,116,116,116,116,116,116,116,116,92,7,7,7,7,7,115,116,116,116,116,116,116,116,116,116,113,90,110,115,116,116,116,116]
];

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
  luigi.moved = false;
	movePlayer(luigi);

//  if (luigi.moved) {
//	 adjustCamera();
//  }
  drawLevel();
  drawPlayer(luigi);
	showDebugInfo();
};

drawLevelCam = function () {
    for (x = 0; x < 17; x++) {
    for (y = 0; y < 14; y++) {
      // convert pixel coords to tile coords
      tx = Math.floor(cam.x / bgTileWidth + x);
      ty = Math.floor(cam.y / bgTileHeight + y);
      drawOffsetBgTileId(level[ty][tx], x, y, viewportOffsetX, viewportOffsetY);
//      console.log("Tile:" + (level[ty][tx] - 1) + ', ' + x + ', ' + y);
    }
  }
};

drawLevel = function () {
    for (x = 0; x < 17; x++) {
    for (y = 0; y < 14; y++) {
      // convert pixel coords to tile coords
      drawOffsetBgTileId(level[y][x], x, y, viewportOffsetX, viewportOffsetY);
//      console.log("Tile:" + (level[ty][tx] - 1) + ', ' + x + ', ' + y);
    }
  }
};

// keep the player somewhat centered on the screen relative to the camera

adjustCamera = function () {
  viewportOffsetX = luigi.x % 16;
  viewportOffsetY = 0; // we didn't implement vertical camera scrolling yet

/*
	16x14 viewport

	|     +           +      |

draw level relative to camera coords

draw player relative to camera coords

*/
	// scroll right
	if (luigi.x > (cam.x + (8 * bgTileWidth)) ) {
		cam.x = cam.x + luigi.speed;
    // need to test for right edge of map
	} else if ( (cam.x > 0 ) && (luigi.x < (cam.x + 7 * bgTileWidth) ) ) {
    // scroll back left
		cam.x = cam.x - luigi.speed;
	} else {
    // we're at the left edge of the map
    viewportOffsetX = 0;
  }
};

// draw background tile #id on screen at grid position x,y
drawBgTileId = function (tileId, dest_x, dest_y) {
	source_x = bgTileWidth * (tileId % bgTileSheetWidth);
	source_y = bgTileHeight * (Math.floor(tileId / bgTileSheetWidth));

//	console.log("Source: ", source_x, source_y);

  ctx.drawImage(bgTiles, source_x, source_y, bgTileWidth, bgTileHeight, 
    				bgTileWidth * dest_x, bgTileHeight * dest_y, bgTileWidth, bgTileHeight);
};

// draw background tile #id on screen at grid position x,y
// use offset for smooth scrolling effect
drawOffsetBgTileId = function (tileId, dest_x, dest_y, x_off, y_off) {
  source_x = bgTileWidth * (tileId % bgTileSheetWidth);
  source_y = bgTileHeight * (Math.floor(tileId / bgTileSheetWidth));

//  console.log("Source: ", source_x, source_y);

    ctx.drawImage(bgTiles, source_x, source_y, bgTileWidth, bgTileHeight, 
            (bgTileWidth * dest_x) - x_off, (bgTileHeight * dest_y) - y_off,
            bgTileWidth, bgTileHeight);
};

// draw background tile x, y on screen at grid position dest_x, dest_y
drawBgTileXY = function (tilesheet_x, tilesheet_y, dest_x, dest_y) {
	source_x = bgTileWidth * tilesheet_x;
	source_y = bgTileHeight * tilesheet_y;

//	console.log("Source: ", source_x, source_y);

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

	debugInfoString = "P:" + luigi.x + "," + luigi.y + 
						" Grid:" + luigi.gridX() + "," + luigi.gridY() +
            " Vspd:" + luigi.verticalSpeed +
						//" Cam:" + Math.floor(cam.x / bgTileWidth) + "," + Math.floor(cam.y / bgTileWidth) +
            // " Off:" + viewportOffsetX + "," + viewportOffsetY;
			" L:" + getTileType(level[luigi.gridY()][luigi.spriteLeftEdge()]) +
			" G:" + getTileType(level[luigi.gridY()][luigi.gridX()]) +
			" R:" + getTileType(level[luigi.gridY()][luigi.spriteRightEdge()]) +
			"";
	ctx.fillText(debugInfoString, 10, 14);
  //console.log(debugInfoString);
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
	// console.log('drawing player at:' + (o.x-cam.x) + ", " + (o.y+cam.y));
  ctx.drawImage(actorTiles, Math.floor(o.frame)*16, d*o.height, o.width, o.height, o.x-(o.width/2), o.y-(32), o.width, o.height);
//  				(o.x-cam.x)-(bgTileWidth/2), (o.y-cam.y)-(bgTileHeight), o.width, o.height);

  // draw box at o.x, o.y - the true location of the player
//  ctx.drawImage(hit_det_overlay, 0, 0, o.width, o.height, o.x-(o.width/2), o.y-(32), o.width, o.height);
//  console.log('dir = ' + d + ' frame = ' + o.frame + ' floor = ' + Math.floor(o.frame) + ' ceil = ' + Math.ceil(o.frame));

  // draw opaque box that player is 'in'
  // tx = 2; ty = 2;
  tx = o.gridX();
  ty = o.gridY();
  ctx.drawImage(opaque_tile, tx * bgTileWidth, ty * bgTileHeight);

  draw_hit_points = true;
  if (draw_hit_points) {
    // draw the actual location of x, y
    ctx.drawImage(blue_pixel, o.x, o.y, 2, 2);

    // draw left and right foot hit detectors
    if (o.isLeftFootOnGround()) {
      ctx.drawImage(blue_pixel, o.x-6, o.y, 2, 2);
    } else {
      ctx.drawImage(red_pixel, o.x-6, o.y, 2, 2);
    }
    if (o.isRightFootOnGround()) {
      ctx.drawImage(blue_pixel, o.x+5, o.y, 2, 2);
    } else {
      ctx.drawImage(red_pixel, o.x+5, o.y, 2, 2);
    }

    // draw left/right block hit detectors
    if (o.isWallToLeft()) {
      ctx.drawImage(blue_pixel, o.x-6, o.y-16, 2, 2);
    } else {
      ctx.drawImage(red_pixel, o.x-6, o.y-16, 2, 2);
    }
    if (o.isWallToRight()) {
      ctx.drawImage(blue_pixel, o.x+5, o.y-16, 2, 2);
    } else {
      ctx.drawImage(red_pixel, o.x+5, o.y-16, 2, 2);
    }

    // draw left/right head-level block hit detectors
    if (o.isWallToLeftHigh()) {
      ctx.drawImage(blue_pixel, o.x-6, o.y-24, 2, 2);
    } else {
      ctx.drawImage(red_pixel, o.x-6, o.y-24, 2, 2);
    }
    if (o.isWallToRightHigh()) {
      ctx.drawImage(blue_pixel, o.x+5, o.y-24, 2, 2);
    } else {
      ctx.drawImage(red_pixel, o.x+5, o.y-24, 2, 2);
    }

    // draw left/right foot-level block hit detectors
    if (o.isWallToLeftLow()) {
      ctx.drawImage(blue_pixel, o.x-6, o.y-2, 2, 2);
    } else {
      ctx.drawImage(red_pixel, o.x-6, o.y-2, 2, 2);
    }
    if (o.isWallToRightLow()) {
      ctx.drawImage(blue_pixel, o.x+5, o.y-2, 2, 2);
    } else {
      ctx.drawImage(red_pixel, o.x+5, o.y-2, 2, 2);
    }
  }
};

movePlayer = function (o) {
//	console.log('moving player');
  luigi.moved = false;
  s = o.isRunning ? 4 : 2;

	switch (o.dir) {
    case 'right':
      while (luigi.moved == false && s > 0) {
        luigi.x += s;
        // test if we can move here
        if (!o.isWallToRight() && !o.isWallToRightHigh() && !o.isWallToRightLow()) {
          console.log('right');
          luigi.moved = true;
          if (luigi.frame < 1) {
            luigi.frame += 1; 
          } else {
            luigi.frame += 0.5;
          }
          if (Math.floor(luigi.frame) > 2) { luigi.frame = 0; }
        } else {  // we can't move here, go back
          luigi.x -= s;
        }
        s--;
      }
      break;
    case 'left':
      while (luigi.moved == false && s > 0) {
        luigi.x -= s;
        // test if we can move here
        if (!o.isWallToLeft() && !o.isWallToLeftHigh() && !o.isWallToLeftLow()) {
          console.log('left');
          luigi.moved = true;
          if (luigi.frame < 1) {
            luigi.frame += 1; 
          } else {
            luigi.frame += 0.5;
          }
          if (Math.floor(luigi.frame) > 2) { luigi.frame = 0; }
        } else {
          luigi.x += s;
        }
        s--;
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
    // apply gravity
    if (o.isRightFootOnGround() || o.isLeftFootOnGround()) {
      // not falling
      console.log("SOLID");
      o.isJumping = false;
      o.canJump = true;
      o.verticalSpeed = 0;
    } else {
      o.canJump = false;  // can't jump while falling
      vs = o.verticalSpeed;
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
            o.isJumping = false;
            o.canJump = true;
            o.verticalSpeed = 0;
          }
        }
        vs--;
      }
    }
  }  // end 'isJumping == true' else
};

$(document).bind('keydown', function(event) {
k = event.which
  switch (k) {
    case 37: // left
      luigi.dir = luigi.facing = 'left';
      break;
    case 38: // up
      break;
    case 39: // right
      luigi.dir = luigi.facing = 'right';
      break;
    case 40: // down
      break;
  case 65:  // A
    if ((luigi.verticalSpeed == 0) && luigi.canJump && !luigi.isJumping) {
      luigi.verticalSpeed = luigi.isRunning ? 14 : 12;
      luigi.isJumping = true;
    }
    break;
  case 83:  // S
      luigi.isRunning = true;
    break;
  }
});

$(document).bind('keyup', function(event) {
k = event.which
switch (k) {
  case 37: // left
    if (luigi.dir = 'left') {
      luigi.dir = '';
      luigi.frame = 0;
    }
    break;
  case 39: // right
    if (luigi.dir = 'right') {
      luigi.dir = '';
      luigi.frame = 0;
    }
    break;
  case 65:  // A
    break;
  case 83:  // S
      luigi.isRunning = false;
    break;
}
});

// keyboard codes
//
// left  37
// up    38
// right 39
// down  40
// w     87
// a     65
// d     68
// s     83
// <     188
// >     190
//