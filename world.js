import Dungeon from "./dungeon.js"
import Entity from "./entity.js"
import Player from "./player.js"

export default class World extends Phaser.Scene {
	constructor() {
		super("HudScene");
	}

  preload() {
    this.load.spritesheet('tiles', 'assets/tiles.png', { frameWidth: 32, frameHeight: 32, spacing: 0 })
  }

  create() {
    this.input.keyboard.addCapture(["SPACE", "UP","DOWN","LEFT","RIGHT"])
    this.input.keyboard.on("keyup", (event) => {
        this.processKeys(event)
        event.stopPropagation()
    });

    this.tileSize = 32
    this.dungeon = new Dungeon()
    this.level = this.dungeon.levels[0]
    this.player = new Player(this.level.rooms[0].x,this.level.rooms[0].y)
    this.level.addEntity(this.player)

    this.cameras.main.setZoom(1);
    var rect = this.add.rectangle(0, 0, 80 * 16, 50 * 16 , 0x110044)
    rect.displayOriginX = 0; rect.displayOriginY = 0
    var rect = this.add.rectangle(0, 0, this.level.width*this.tileSize, this.level.height*this.tileSize, 0x446789)
    rect.displayOriginX = 0; rect.displayOriginY = 0

    const map = this.make.tilemap({data: this.level.floor, tileWidth: this.tileSize, tileHeight: this.tileSize})
    const tileset = map.addTilesetImage('tiles', 'tiles', this.tileSize, this.tileSize, 0, 0)
    const ground = map.createStaticLayer(0, tileset, 0, 0)
    this.level.entities.forEach(entity => entity.init(this))
    this.cameras.main.startFollow(this.player.container);
    this.turn = 0
  }

  processKeys(event) {
    let key = event.key
    if (this.player.done) return
    if (key == "ArrowLeft") {
      this.level.moveEntity(this.player,-1,0)
    }
    if (key == "ArrowRight") {
      this.level.moveEntity(this.player,1,0)
    }
    if (key == "ArrowUp") {
      this.level.moveEntity(this.player,0,-1)
    }
    if (key == "ArrowDown") {
      this.level.moveEntity(this.player,0,1)
    }
    if (key == "d") {
      this.player.done = true
    }
  }

  update() {
    if (this.level.entities[this.turn].done) { //If Turn Over
      this.turn++; if (this.turn==this.level.entities.length) this.turn = 0;
      this.level.entities[this.turn].done = false
    } else {
      this.level.entities[this.turn].turn()
    }
  }

  loadLevel(level) {
    //Create TileMap
    //Create Entities
  }
  SaveLevel(level) {

  }
}
