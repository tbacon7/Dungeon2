
class RoomAddition{
	constructor(){
		this.level = []

		this.ROOM_MAX_SIZE = 18 // max height and width for cellular automata rooms
		this.ROOM_MIN_SIZE = 16 // min size in number of floor tiles, not height and width
		this.MAX_NUM_ROOMS = 30

		this.SQUARE_ROOM_MAX_SIZE = 12
		this.SQUARE_ROOM_MIN_SIZE = 6

		this.CROSS_ROOM_MAX_SIZE = 12
		this.CROSS_ROOM_MIN_SIZE = 6

		this.cavernChance = 0.40 // probability that the first room will be a cavern
		this.CAVERN_MAX_SIZE = 35 // max height an width

		this.wallProbability = 0.45
		this.neighbors = 4

		this.squareRoomChance = 0.2
		this.crossRoomChance = 0.15

		this.buildRoomAttempts = 500
		this.placeRoomAttempts = 20
		this.maxTunnelLength = 12

		this.includeShortcuts = 1 //true
		this.shortcutAttempts = 500
		this.shortcutLength = 5
		this.minPathfindingDistance = 50
  }

	generateLevel(mapWidth,mapHeight){
		this.rooms = []

    this.level = new Array(mapWidth).fill(new Array(mapHeight).fill(1))
		//this.level = [[1 ...Array(mapHeight).keys()] ...Array(mapWidth).keys()]

		// generate the first room
    console.log('GenerateRoom')
		var room = this.generateRoom()
    var roomWidth = this.getRoomDimensions(room)[0]
    var roomHeight = this.getRoomDimensions(room)[1]
		var roomX = Math.floor((mapWidth/2 - roomWidth/2)-1)
		var roomY = Math.floor((mapHeight/2 - roomHeight/2)-1)
    console.log('AddRoom')
		this.addRoom(roomX,roomY,room)

		// generate other rooms
		for (var i of [...Array(this.buildRoomAttempts).keys()]) {
      console.log(i)
			room = this.generateRoom()
			// try to position the room, get roomX and roomY
			roomX,roomY,wallTile,direction, tunnelLength = this.placeRoom(room,mapWidth,mapHeight)
			if (roomX && roomY) {
				this.addRoom(roomX,roomY,room)
				this.addTunnel(wallTile,direction,tunnelLength)
				if (len(this.rooms) >= this.MAX_NUM_ROOMS) {
					break
        }
      }
    }

		if (this.includeShortcuts == True) {
			this.addShortcuts(mapWidth,mapHeight)
    }

		return this.level
  }

	generateRoom() {
		// select a room type to generate
		// generate and return that room
		if (this.rooms) {
			//There is at least one room already
			var choice = Math.random()

			if (choice <this.squareRoomChance) {
				var room = this.generateRoomSquare()
      }
			else if (this.squareRoomChance <= choice < (this.squareRoomChance+this.crossRoomChance)) {
				var room = this.generateRoomCross()
      }
			else {
				var room = this.generateRoomCellularAutomata()
      }
    }

		else { //it's the first room
			var choice = Math.random()
			if (choice < this.cavernChance) room = this.generateRoomCavern()
			else var room = this.generateRoomSquare()
    }

		return room
  }

   generateRoomCross() {
		var roomHorWidth = (random.randint(this.CROSS_ROOM_MIN_SIZE+2,this.CROSS_ROOM_MAX_SIZE))/2*2
		var roomVirHeight = (random.randint(this.CROSS_ROOM_MIN_SIZE+2,this.CROSS_ROOM_MAX_SIZE))/2*2
		var roomHorHeight = (random.randint(this.CROSS_ROOM_MIN_SIZE,roomVirHeight-2))/2*2
		var roomVirWidth = (random.randint(this.CROSS_ROOM_MIN_SIZE,roomHorWidth-2))/2*2

    var room = new Array(roomHorWidth).fill(new Array(roomVirHeight).fill(1))
    //room = [[1 for (y of xrange(roomVirHeight))] for (x of xrange(roomHorWidth))]

		// Fill in horizontal space
		var virOffset = roomVirHeight/2 - roomHorHeight/2
		for (var y of [...Array(roomHorHeight).keys()].map(i => i + virOffset)) {
			for (var x of [...Array(roomHorWidth).keys()]) {
				room[x][y] = 0
      }
    }

		// Fill in virtical space
		var horOffset = roomHorWidth/2 - roomVirWidth/2
		for (var y of [...Array(roomVirHeight).keys()]) {
			for (var x of [...Array(roomVirWidth).keys()].map(i => i + horOffset)) {
				room[x][y] = 0
      }
    }

		return room
  }

	 generateRoomSquare(){
    var roomWidth = parseInt(Math.random()*(this.SQUARE_ROOM_MAX_SIZE-this.SQUARE_ROOM_MIN_SIZE)+this.SQUARE_ROOM_MIN_SIZE)
		//roomWidth = Math.randint(this.SQUARE_ROOM_MIN_SIZE,this.SQUARE_ROOM_MAX_SIZE)
    var roomHeight = parseInt(Math.random()*(Math.min(parseInt(roomWidth*1.5),this.SQUARE_ROOM_MAX_SIZE)-Math.max(parseInt(roomWidth*0.5),this.SQUARE_ROOM_MIN_SIZE))+Math.max(parseInt(roomWidth*0.5),this.SQUARE_ROOM_MIN_SIZE))
    //roomHeight = Math.randint(max(int(roomWidth*0.5),this.SQUARE_ROOM_MIN_SIZE),min(int(roomWidth*1.5),this.SQUARE_ROOM_MAX_SIZE))

    var room = new Array(roomWidth).fill(new Array(roomHeight).fill(1))
		//room = [[1 for (y of range(roomHeight))] for (x of range(roomWidth))]

    ///???
    room = new Array(roomWidth-1).fill(new Array(roomHeight-1).fill(0))
		//room = [[0 for (y of range(1,roomHeight-1))] for (x of range(1,roomWidth-1))]

		return room
  }

	 generateRoomCellularAutomata() {
		while (1) {
			// if a room is too small, generate another
      var room = new Array(this.ROOM_MAX_SIZE).fill(new Array(this.ROOM_MAX_SIZE).fill(1))
			//room = [[1 for (y of range(this.ROOM_MAX_SIZE))] for (x of range(this.ROOM_MAX_SIZE))]

			// random fill map
      for (var y of [...Array(this.ROOM_MAX_SIZE-2).keys()].map(i => i + 2)) {
      //for (y of range(2,this.ROOM_MAX_SIZE-2)) {
        for (var x of [...Array(this.ROOM_MAX_SIZE-2).keys()].map(i => i + 2)) {
        //for (x of range(2,this.ROOM_MAX_SIZE-2)) {
					if (Math.random() >= this.wallProbability) {
						room[x][y] = 0
          }
        }
      }

			// create distinctive regions
			for (var i of [...Array(4).keys()]) {
				for (var y of [...Array(this.ROOM_MAX_SIZE-1).keys()].map(i => i + 1)) {
					for (var x of [...Array(this.ROOM_MAX_SIZE-1).keys()].map(i => i + 1)) {

						// if the cell's neighboring walls > this.neighbors, set it to 1
						if (this.getAdjacentWalls(x,y,room) > this.neighbors) {
							room[x][y] = 1
            }
						// otherwise, set it to 0
						else if (this.getAdjacentWalls(x,y,room) < this.neighbors) {
							room[x][y] = 0
            }
          }
        }
      }

			// floodfill to remove small caverns
			room = this.floodFill(room)

			// start over if the room is completely filled in
      var roomWidth = this.getRoomDimensions(room)[0]
      var roomHeight = this.getRoomDimensions(room)[1]
			for (var x of [...Array(roomWidth).keys()]) {
				for (var y of [...Array(roomHeight).keys()]) {
					if (room[x][y] == 0) return room
        }
      }
    }
  }

	 generateRoomCavern() {
		while (1) {
			// if a room is too small, generate another
      room = new Array(this.CAVERN_MAX_SIZE).fill(new Array(this.CAVERN_MAX_SIZE).fill(1))
			//room = [[1 for (y of range(this.CAVERN_MAX_SIZE))] for (x of range(this.CAVERN_MAX_SIZE))]

			// random fill map
			for (var y of [...Array(this.CAVERN_MAX_SIZE-2).keys()].map(i => i + 2)) {
				for (var x of [...Array(this.CAVERN_MAX_SIZE-2).keys()].map(i => i + 2)) {
					if (Math.random() >= this.wallProbability) room[x][y] = 0
        }
      }

			// create distinctive regions
			for (var i of [...Array(4).keys()]) {
				for (var y of [...Array(this.CAVERN_MAX_SIZE-1).keys()].map(i => i + 1)) {
					for (var x of [...Array(this.CAVERN_MAX_SIZE-1).keys()].map(i => i + 1)) {
						// if the cell's neighboring walls > this.neighbors, set it to 1
						if (this.getAdjacentWalls(x,y,room) > this.neighbors) room[x][y] = 1
						// otherwise, set it to 0
						else if (this.getAdjacentWalls(x,y,room) < this.neighbors) room[x][y] = 0
          }
        }
      }
			// floodfill to remove small caverns
			room = this.floodFill(room)

			// start over if the room is completely filled in
      var roomWidth = this.getRoomDimensions(room)[0]
      var roomHeight = this.getRoomDimensions(room)[1]
			for (var x of [...Array(roomWidth).keys()]) {
				for (var y of [...Array(roomHeight).keys()]) {
					if (room[x][y] == 0) return room
        }
      }
    }
  }

	 floodFill(room){
		// Find the largest region. Fill in all other regions.
    var roomWidth = this.getRoomDimensions(room)[0]
    var roomHeight = this.getRoomDimensions(room)[1]
		var largestRegion = new Set()

		for (var x of [...Array(roomWidth).keys()]) {
			for (var y of [...Array(roomHeight).keys()]) {
				if (room[x][y] == 0) {
					var newRegion = new Set()
					var tile = [x,y]
					var toBeFilled = new Set([tile])
					while (toBeFilled.size>0) {
            var items = Array.from(toBeFilled)
            var tile = items[Math.floor(Math.random() * items.length)];
						toBeFilled.delete(tile)
            if (!newRegion.has(tile)) {
            //if (tile not in newRegion) {
							newRegion.add(tile)
							room[tile[0]][tile[1]] = 1
							// check adjacent cells
							var x = tile[0]
							var y = tile[1]
							var north = [x,((y-1)<0) ? roomHeight-1 : y-1]
							var south = [x,y+1]
							var east = [x+1,y]
							var west = [((x-1)<0) ? roomWidth-1 : x-1,y]
							for (var direction of [north,south,east,west]) {
								if (room[direction[0]][direction[1]] == 0) {
                  if (!toBeFilled.has(direction) && !newRegion.has(direction)) {
                  //if (direction not in toBeFilled && direction not in newRegion) {
										toBeFilled.add(direction)
                  }
                }
              }
            }
          }

					if (newRegion.length >= this.ROOM_MIN_SIZE) {
						if (newRegion.length > largestRegion.length) {
							largestRegion.clear()
							largestRegion.update(newRegion)
            }
          }
        }
      }
    }

		for (var tile of largestRegion) {
			room[tile[0]][tile[1]] = 0
    }

		return room
  }

	 placeRoom(room, mapWidth, mapHeight){ //(room,direction,)
		var roomX = None
		var roomY = None

    var roomWidth = this.getRoomDimensions(room)[0]
    var roomHeight = this.getRoomDimensions(room)[1]

		// try n times to find a wall that lets you build room in that direction
		for (var i of [...Array(this.placeRoomAttempts).keys()]) {
			// try to place the room against the tile, else connected by a tunnel of length i

			wallTile = None
			direction = this.getDirection()
			while (!wallTile) {
				/// randomly select tiles until you find a wall that has another wall in the chosen direction and has a floor in the opposite direction.
				//direction == tuple(dx,dy)
				tileX = random.randint(1,mapWidth-2)
				tileY = random.randint(1,mapHeight-2)
				if ((this.level[tileX][tileY] == 1) &&
					(this.level[tileX+direction[0]][tileY+direction[1]] == 1) &&
					(this.level[tileX-direction[0]][tileY-direction[1]] == 0)) {
					wallTile = (tileX,tileY)
        }
      }

			//spawn the room touching wallTile
			var startRoomX = None
			var startRoomY = None
			// TODO: replace this with a method that returns a
			// random floor tile instead of the top left floor tile
			while (!startRoomX && !startRoomY) {
				var x = random.randint(0,roomWidth-1)
				var y =  random.randint(0,roomHeight-1)
				if (room[x][y] == 0) {
					startRoomX = wallTile[0] - x
					startRoomY = wallTile[1] - y
        }
      }

			//then slide it until it doesn't touch anything
			for (var tunnelLength of [...Array(this.maxTunnelLength).keys()]) {
				var possibleRoomX = startRoomX + direction[0]*tunnelLength
				var possibleRoomY = startRoomY + direction[1]*tunnelLength

				var enoughRoom = this.getOverlap(room,possibleRoomX,possibleRoomY,mapWidth,mapHeight)

				if (enoughRoom) {
					roomX = possibleRoomX
					roomY = possibleRoomY

					// build connecting tunnel
					//Attempt 1
					//for i of range(tunnelLength+1):
					//	x = wallTile[0] + direction[0]*i
					//	y = wallTile[1] + direction[1]*i
					//	this.level[x][y] = 0
					// moved tunnel code into this.generateLevel()

					return roomX,roomY, wallTile, direction, tunnelLength
        }
      }
    }

		return None, None, None, None, None
  }

	 addRoom(roomX,roomY,room){
     var roomWidth = this.getRoomDimensions(room)[0]
     var roomHeight = this.getRoomDimensions(room)[1]
		for (var x of [...Array(roomWidth).keys()]) {
			for (var y of [...Array(roomHeight).keys()]) {
				if (room[x][y] == 0) {
          console.log(roomX, roomY, x, y)
					this.level[roomX+x][roomY+y] = 0
        }
      }
    }
		this.rooms.push(room)
  }

	 addTunnel(wallTile,direction,tunnelLength) {
		// carve a tunnel from a point in the room back to
		// the wall tile that was used in its original placement

		var startX = wallTile[0] + direction[0]*tunnelLength
		var startY = wallTile[1] + direction[1]*tunnelLength
		//this.level[startX][startY] = 1

		for (var i of [...Array(this.maxTunnelLength).keys()]) {
			var x = startX - direction[0]*i
			var y = startY - direction[1]*i
			this.level[x][y] = 0
			// If you want doors, this is where the code should go
			if ((x+direction[0]) == wallTile[0] &&
				(y+direction[1]) == wallTile[1]) {
				break
      }
    }
  }

	 getRoomDimensions(room){
		if (room) {
			var roomWidth = room.length
			var roomHeight = room[0].length
			return [roomWidth, roomHeight]
    }
		else {
			var roomWidth = 0
			var roomHeight = 0
			return [roomWidth, roomHeight]
    }
  }

	 getAdjacentWalls(tileX, tileY, room) { // finds the walls in 8 directions
		var wallCounter = 0
		for (var x of [...Array(tileX+2-tileX-1).keys()].map(i => i + tileX-1)) {
			for (var y of [...Array(tileX+2-tileX-1).keys()].map(i => i + tileX-1)) {
				if (room[x][y] == 1) {
					if ((x != tileX) || (y != tileY)) { // exclude (tileX,tileY)
						wallCounter += 1
          }
        }
      }
    }

		return wallCounter
  }

	 getDirection(){
		// direction = (dx,dy)
		var north = (0,-1)
		var south = (0,1)
		var east = (1,0)
		var west = (-1,0)

		direction = random.choice([north,south,east,west])
		return direction
  }

	 getOverlap(room,roomX,roomY,mapWidth,mapHeight) {
		//for each 0 in room, check the cooresponding tile in
		//this.level and the eight tiles around it. Though slow,
		//that should insure that there is a wall between each of
		//the rooms created in this way.
		//<> check for overlap with this.level
		//<> check for out of bounds
    var roomWidth = this.getRoomDimensions(room)[0]
    var roomHeight = this.getRoomDimensions(room)[1]
		for (var x of [...Array(roomWidth).keys()]) {
			for (var y of [...Array(roomHeight).keys()]) {
				if (room[x][y] == 0) {
					// Check to see if the room is out of bounds
					if ((1 <= (x+roomX) < mapWidth-1) &&
						(1 <= (y+roomY) < mapHeight-1)) {
						//Check for overlap with a one tile buffer
						if (this.level[x+roomX-1][y+roomY-1] == 0) // top left
							return False
						if (this.level[x+roomX][y+roomY-1] == 0) // top center
							return False
						if (this.level[x+roomX+1][y+roomY-1] == 0) // top right
							return False

						if (this.level[x+roomX-1][y+roomY] == 0) // left
							return False
						if (this.level[x+roomX][y+roomY] == 0) // center
							return False
						if (this.level[x+roomX+1][y+roomY] == 0) // right
							return False

						if (this.level[x+roomX-1][y+roomY+1] == 0) // bottom left
							return False
						if (this.level[x+roomX][y+roomY+1] == 0) // bottom center
							return False
						if (this.level[x+roomX+1][y+roomY+1] == 0) // bottom right
							return False
          }
					else { // room is out of bounds
						return False
          }
        }
      }
    }
		return True
  }

	 addShortcuts(mapWidth,mapHeight) {
		//I use libtcodpy's built in pathfinding here, since I'm
		//already using libtcodpy for the iu. At the moment,
		//the way I find the distance between
		//two points to see if I should put a shortcut there
		//is horrible, and its easily the slowest part of this
		//algorithm. If I think of a better way to do this in
		//the future, I'll implement it.

		//initialize the libtcodpy map
		var libtcodMap = libtcod.map_new(mapWidth,mapHeight)
		this.recomputePathMap(mapWidth,mapHeight,libtcodMap)

		for (var i of [...Array(this.shortcutAttempts).keys()]) {
			// check i times for places where shortcuts can be made
			while (1) {
				//Pick a random floor tile
				floorX = random.randint(this.shortcutLength+1,(mapWidth-this.shortcutLength-1))
				floorY = random.randint(this.shortcutLength+1,(mapHeight-this.shortcutLength-1))
				if (this.level[floorX][floorY] == 0) {
					if (this.level[floorX-1][floorY] == 1 ||
						this.level[floorX+1][floorY] == 1 ||
						this.level[floorX][floorY-1] == 1 ||
						this.level[floorX][floorY+1] == 1) {
						break
          }
        }
      }

			// look around the tile for other floor tiles
			for (var x of [...Array(3).keys()].map(i => i - 1)) {
				for (var y of [...Array(3).keys()].map(i => i - 1)) {
					if (x != 0 || y != 0) { // Exclude the center tile
						var newX = floorX + (x*this.shortcutLength)
						var newY = floorY + (y*this.shortcutLength)
						if (this.level[newX][newY] == 0) {
						  // run pathfinding algorithm between the two points
							//back to the libtcodpy nonesense
							var pathMap = libtcod.path_new_using_map(libtcodMap)
							libtcod.path_compute(pathMap,floorX,floorY,newX,newY)
							var distance = libtcod.path_size(pathMap)

							if (distance > this.minPathfindingDistance) {
								// make shortcut
								this.carveShortcut(floorX,floorY,newX,newY)
								this.recomputePathMap(mapWidth,mapHeight,libtcodMap)
              }
            }
          }
        }
      }
    }

		// destroy the path object
		libtcod.path_delete(pathMap)
  }

	 recomputePathMap(mapWidth,mapHeight,libtcodMap) {
		for (var x of [...Array(roomWidth).keys()]) {
			for (var y of [...Array(roomHeight).keys()]) {
				if (this.level[x][y] == 1) {
					libtcod.map_set_properties(libtcodMap,x,y,False,False)
        }
				else {
					libtcod.map_set_properties(libtcodMap,x,y,True,True)
        }
      }
    }
  }

	 carveShortcut(x1,y1,x2,y2) {
		if (x1-x2 == 0) {
			// Carve virtical tunnel
			for (var y of [...Array(Math.max(y1,y2)+1-Math.min(y1,y2)).keys()].map(i => i + Math.min(y1,y2)))
				this.level[x1][y] = 0
    }

		else if (y1-y2 == 0) {
			// Carve Horizontal tunnel
			for (var x of [...Array(Math.max(x1,x2)+1-Math.min(x1,x2)).keys()].map(i => i + Math.min(x1,x2)))
				this.level[x][y1] = 0
    }

		else if ((y1-y2)/(x1-x2) == 1) {
			// Carve NW to SE Tunnel
			x = min(x1,x2)
			y = min(y1,y2)
			while (x != max(x1,x2)) {
				x+=1
				this.level[x][y] = 0
				y+=1
				this.level[x][y] = 0
      }
    }

		else if ((y1-y2)/(x1-x2) == -1) {
			// Carve NE to SW Tunnel
			x = min(x1,x2)
			y = max(y1,y2)
			while (x != max(x1,x2)) {
				x += 1
				this.level[x][y] = 0
				y -= 1
				this.level[x][y] = 0
      }
    }
  }

  checkRoomExists(room) {
    var roomWidth = this.getRoomDimensions(room)[0]
    var roomHeight = this.getRoomDimensions(room)[1]
		for (var x of [...Array(roomWidth).keys()]) {
			for (var y of [...Array(roomHeight).keys()]) {
				if (room[x][y] == 0) return True
      }
    }
		return False
  }
}

var c = new RoomAddition()
console.log(c.generateLevel(20,20))
