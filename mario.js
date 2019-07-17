console.log("Starting game...");

// background tiles
var bgTiles = new Image();
var bgTileWidth = 16, bgTileHeight = 16;
var bgTileSheetWidth = 20;

// player sprites
var actorTiles = new Image();

var viewportTileWidth  = 16;  // viewport is 16 tiles wide
var viewportTileHeight = 14;  // viewport is 14 tiles tall
var viewportPixelWidth = viewportTileWidth * bgTileWidth;
var viewportPixelHeight = viewportTileHeight * bgTileHeight;
var viewportOffsetX = 0;
var viewportOffsetY = 0;

var ctx;

var FRAME_RATE = 10;

var gravity = 0.25;

// player
var luigi = {
          x: 96,
          y: 242, // 272 
          gun: 0,
          maxSpeed: 2,
          isJumping: false,
          canJump: true,
          jumpHeight: -12,
          verticalSpeed: 0,
          dir: '',
          facing: 'right',
          moved: false,
          lastFired: Date.now(),
          
          gridX: function() { return Math.floor(this.x / bgTileWidth); },
          spriteLeftEdge: function() { return Math.floor((this.x - 6) / bgTileWidth); },
          spriteRightEdge: function() { return Math.floor((this.x + 6) / bgTileWidth); },
          gridY: function() { return Math.floor(this.y / bgTileHeight); },
          isCompletelyInGrid: function () { return ((this.y % bgTileHeight) == 0); }, // or standing on block
          isWallToLeft: function () {
			// this needs to be pixel accurate to 1/2 sprite width
            // if we are on a block we actually are on the block below
            // so check the block above and to the side
            if (this.isCompletelyInGrid()) {
              return getTileType(level[this.gridY()-1][this.spriteLeftEdge()]) == tileType.SOLID;
            } else {
              return getTileType(level[this.gridY()][this.spriteLeftEdge()]) == tileType.SOLID;
            }
          },
          isWallToRight: function () {
            if (this.isCompletelyInGrid()) {
              return getTileType(level[this.gridY()-1][this.spriteRightEdge()]) == tileType.SOLID;
            } else {
              return getTileType(level[this.gridY()][this.spriteRightEdge()]) == tileType.SOLID;
            }
          },
		  isLeftFootOnGround: function () {
            if (this.isCompletelyInGrid()) {
				// check the block below because we stand 'on' a block
              return getTileType(level[this.gridY()][this.spriteLeftEdge()]) == tileType.SOLID;
            } else {
              return false;
            }
		  },
		  isRightFootOnGround: function () {
            if (this.isCompletelyInGrid()) {
				// check the block below because we stand 'on' a block
              return getTileType(level[this.gridY()][this.spriteRightEdge()]) == tileType.SOLID;
            } else {
              return false;
            }
		  }
};

// camera (for scrolling), works in pixel coords
var cam = { x: 0, y: 8 * bgTileHeight};

// level is 64x21
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

bgTiles.onload = function() {
	console.log("loaded bgTiles");
	bgLoaded = 1;
}
bgTiles.src = "gfx/smb3-1-1-Tileset.png";

actorTiles.onload = function () {
	console.log("loaded actorTiles");
}
actorTiles.src = "gfx/luigi-small.png";

window.onload = function() {
	console.log(".onload()");
    var c=document.getElementById("screen");
    ctx=c.getContext("2d");

	setInterval(function() { gameLoop(); }, 1000/FRAME_RATE);

	console.log(bgTileWidth, bgTileHeight);
};

gameLoop = function() {
  luigi.moved = false;
	movePlayer(luigi);

  if (luigi.moved) {
	 adjustCamera();
  }
  drawLevel();
  drawPlayer(luigi);
	showDebugInfo();
}

drawLevel = function () {
    for (x = 0; x < 17; x++) {
		for (y = 0; y < 14; y++) {
			// convert pixel coords to tile coords
			tx = Math.floor(cam.x / bgTileWidth + x);
			ty = Math.floor(cam.y / bgTileHeight + y);
			drawOffsetBgTileId(level[ty][tx], x, y, viewportOffsetX, viewportOffsetY);
//			console.log("Tile:" + (level[ty][tx] - 1) + ', ' + x + ', ' + y);
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
		cam.x = cam.x + luigi.maxSpeed;
    // need to test for right edge of map
	} else if ( (cam.x > 0 ) && (luigi.x < (cam.x + 7 * bgTileWidth) ) ) {
    // scroll back left
		cam.x = cam.x - luigi.maxSpeed;
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
			" L:" + getTileType(level[luigi.gridY()-1][luigi.spriteLeftEdge()]) +
			" G:" + getTileType(level[luigi.gridY()-1][luigi.gridX()]) +
			" R:" + getTileType(level[luigi.gridY()-1][luigi.spriteRightEdge()]) +
			"";
	ctx.fillText(debugInfoString, 10, 14);
  //console.log(debugInfoString);
};

drawPlayer = function (o) {
	// console.log('drawing player at:' + (o.x-cam.x) + ", " + (o.y+cam.y));
   ctx.drawImage(actorTiles, 16, 0, 16, 16, 
  				(o.x-cam.x)-(bgTileWidth/2), (o.y-cam.y)-(bgTileHeight), bgTileWidth, bgTileHeight);

  // draw box at o.x, o.y - the true location of the player
  s = 1;
  ctx.beginPath();
  ctx.lineWidth="1";
  ctx.strokeStyle="orange";
  ctx.rect((o.x-cam.x)-(s/2), (o.y-cam.y)-(s/2), s+1, s+1);
  ctx.stroke();
};

movePlayer = function (o) {
//	console.log('moving player');
  o.canJump = false;

	switch (o.dir) {
    case 'right':
        if (luigi.isWallToRight()) {
          // hit wall on right
        } else if ((luigi.gridX()+1) >= level[0].length-1) {
          // hit right edge of map
        }
        else {
          // all clear move right
          o.x = o.x + o.maxSpeed;
          o.moved = true;
        }
      break;
    case 'left':
        if (luigi.isWallToLeft()) {
          // hit wall on left
        } else if (luigi.x <= bgTileWidth / 2) {
          // hit left edge of map
        }
        else {
          // all clear, moveleft
          o.x = o.x - o.maxSpeed;
          o.moved = true;
        }
      break;
  }

  //
  // gravity
  //
  if (o.isJumping == true) {
    console.log('jumping');

    if (o.verticalSpeed > 0) {
      o.y = o.y + o.verticalSpeed;
      o.verticalSpeed = o.verticalSpeed + gravity;
    } else {
      o.isJumping = false;
    }
  } else {
    // are we completely in a grid?
    if ((o.y % bgTileHeight) == 0) {
      //console.log("in a grid");
      // check the brick directly below us
	  //
	  //  CHECK BOTH 'FEET' +/- 6
	  //
      if (o.gridY() == level.length) {
        // falling out of the map we're probably dead
        console.log("we're falling out of the map");

      } else {
      //console.log("level[][] = " + o.gridX() + "," + o.gridY() );       
        switch ( getTileType(level[o.gridY()][o.gridX()]) ) {
          case tileType.PASSABLE:
            // fall a little bit
            o.verticalSpeed = o.verticalSpeed + gravity;
            o.y = o.y += o.verticalSpeed;
            o.moved = true;
//            console.log('passable');
          break;
          case tileType.TRAVERSABLE:
          case tileType.SOLID:
//          console.log('solid traversable');
            // we're on solid ground
            o.isJumping = false;
            o.canJump = true;
            o.verticalSpeed = 0;
          break;
          default:
          console.log("Alert: no idea what tile I'm on. Type: " + getTileType(level[o.gridY()+1][o.gridX()]));
        }
      }
    } else {  // we aren't completely in a grid
      console.log("not in grid");
      console.log("level[][] = " + (o.gridY()+1 ) + "," + o.gridX );
      switch ( getTileType(level[o.gridY()+1][o.gridX()]) ) {
        case tileType.PASSABLE:
          // fall a little bit
          o.verticalSpeed = o.verticalSpeed + gravity;
          o.y = o.y += o.verticalSpeed;
          o.moved = true;
//            console.log('passable');
        break;
        case tileType.TRAVERSABLE:
        case tileType.SOLID:
          // we're not completly in a grid so fall a little bit (verticalSpeed)
          // if brick is below us fall either verticalSpeed OR just enough to land on the brick - whichever is less
          o.verticalSpeed = o.verticalSpeed + gravity;
		  // o.y / bgTileHeight finds the 'tile' we're on
          diff = (Math.floor(o.gridY()+1) * bgTileHeight) - o.y;
          // console.log('Diff: ' + diff + ' verticalSpeed: ' + o.verticalSpeed + " O:" + o.x + "," + o.y);
          o.y = o.y += Math.min(o.verticalSpeed, diff);
          o.moved = true;
        break;
        default:
        console.log("Alert: no idea what tile I'm on");
      }
    }
  }  // end 'is jumping == true' else
}

$(document).bind('keydown', function(event) {
k = event.which
  switch (k) {
    case 90:
//                  jmanShoot();
      break;
    case 37:
      luigi.dir = luigi.facing = 'left';
      break;
    case 38: // up
      if (luigi.canJump == true) {
        luigi.verticalSpeed = luigi.jumpHeight;
        luigi.isJumping = true;
        luigi.canJump = false;
      }
      break;
    case 39:
      luigi.dir = luigi.facing = 'right';
      break;
    case 40:
//            luigi.dir = 'down';
      break;
  }
});

$(document).bind('keyup', function(event) {
k = event.which
switch (k) {
  case 37:
    if (luigi.dir = 'left') {
      luigi.dir = '';
    }
    break;
  case 38:
    if (luigi.verticalSpeed < -6) {
      luigi.verticalSpeed = -6; // minimum jump height
    }
    break;
  case 39:
    if (luigi.dir = 'right') {
      luigi.dir = '';
    }
    break;
  case 40:
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