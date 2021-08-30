class Dungeon {
  constructor(config){
    this.c = {}
    this.c.level = {}
    this.c.level.numLevel = 1
    this.c.level.maxWidth = 100
    this.c.level.minWidth = 50
    this.c.level.maxHeight = 50
    this.c.level.minHeight = 100
    this.c.level.sizeBias = 1
    this.c.level.maxRoom = 41
    this.c.level.minRoom = 20
    this.c.level.roomBias = 1
    this.c.room = {}
    this.c.room.minWidth = 3
    this.c.room.maxWidth = 10
    this.c.room.minHeight = 3
    this.c.room.maxHeight = 10
    this.c.room.sizeBias = 0
    this.c.level.walkableList = [266]
    this.levels = []
    for (var i = this.c.level.numLevel; i>0; i--) {
      this.levels.push(new Level(this.c))
    }
  }
}

import Entity from "./entity.js"

class Level {
  constructor(config) {
    let c = config.level
    this.walkableList = c.walkableList
    this.entities = []
    this.width = Math.floor(Math.random()*(c.maxWidth-c.minWidth)+c.minWidth)
    this.height = Math.floor(Math.random()*(c.maxHeight-c.minHeight)+c.minHeight)
    this.floor = Array.from(Array(this.height), () => new Array(this.width))
    var roomTarget = Math.floor(Math.random()*(c.maxRoom-c.minRoom)+c.minRoom)
    this.rooms = []
    for (var i = roomTarget; i>0; i--) {
      var room = new Room(config)
      for (var l = 10; l>0; l--) { //Try to Find Placement 10 Times
        room.x = Math.floor(Math.random()*(this.width-room.width))
        room.y = Math.floor(Math.random()*(this.height-room.height))
        var overlap = false
        for (var r of this.rooms) { //Check for Overlap
          if (!(room.x-1 + room.width+2 < r.x || room.y-1 + room.height+2 < r.y || room.x-1 > r.x + r.width || room.y-1 > r.y + r.height)) overlap = true
        }
        if (!overlap) {
          for (var x = room.x; x<=room.x+room.width; x++) {//fill room
            for (var y = room.y; y<=room.y+room.height; y++) {
              this.floor[y][x] = 266
            }
          }
          //if (i==roomTarget) 
          this.entities.push(new Entity(room.x, room.y))
          room.cx = Math.floor(room.x+room.width/2)
          room.cy = Math.floor(room.y+room.height/2)
          this.rooms.push(room)
          l = 0

          //Connect New Room to Closet Room
          var r = room
          //Find Closest Room
          var rr = null; var distance = -1
          for (var r2 of this.rooms) {
            var d = (r.cx-r2.cx)*(r.cx-r2.cx)+(r.cy-r2.cy)*(r.cy-r2.cy)
            if (d!=0 && distance==-1) {distance = d; rr = r2}
            if (d!=0 && d<distance) {distance = d; rr = r2}
          }
          if (rr!=null) { //Skip 1st Room
            //Create Connection - Horizontal
            var x = r.cx; var y = r.cy; var dx = rr.cx; var dy = rr.cy
            if (dx<x) {x = rr.cx; y = rr.cy; dx = r.cx; dy = r.cy}
            for (var xx = x; xx<=dx; xx++) {
              this.floor[y][xx] = 266
            }
            //Create Connection - Vertical
            var x = xx; var y = r.cy; var dx = rr.cx; var dy = rr.cy
            if (dy<y) {x = xx; y = rr.cy; dx = r.cx; dy = r.cy}
            for (var yy = y; yy<=dy; yy++) {
              this.floor[yy][x] = 266
            }
          }
        }
      }
    }
  }
  addEntity(entity) {this.entities.push(entity)}
  getEntities(x,y) {
    var entities = []
    this.entities.forEach(e => {if (e.x == x && e.y == y) entities.push(e)})
    return entities
  }
  walkable(x,y) {
    return (this.walkableList.includes(this.floor[y][x])
      && this.getEntities(x,y).length == 0)
  }
  moveEntity(entity,x,y) {
    if (this.walkable(entity.x+x,entity.y+y)) {
      entity.move(x,y)
    }
  }
}

class Room {
  constructor(config) {
    let c = config.room
    this.width = Math.floor(Math.random()*(c.maxWidth-c.minWidth)+c.minWidth)
    this.height = Math.floor(Math.random()*(c.maxHeight-c.minHeight)+c.minHeight)
  }
}

export default Dungeon
