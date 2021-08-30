//Adds Tile Aligned Positioning to a Container
class tileContainer extends Phaser.GameObjects.Container {
  constructor(scene,x,y) {
		super(scene,(x+.5)*tileContainer.tileSize,(y+.5)*tileContainer.tileSize)
	}
  get tY() {return this.y/tileContainer.tileSize}
  get tX() {return this.x/tileContainer.tileSize}
}
tileContainer.tileSize = 32

export default class Entity {
  constructor(x, y) {
    this.name = "Entity"
    this.x = x
    this.y = y
    this.tile = 4157
    this.type = "None"
    this.walkable = false
    this.done = false
  }
  init(scene) {
    this.world = scene
    scene.add.existing(this.container = new tileContainer(scene, this.x, this.y))
    let sprite = new Phaser.GameObjects.Sprite(scene, 0, 0, "tiles", this.tile)
    sprite.name = 'tile'
    this.container.add(sprite)
  }
  deinit(scene) {
    this.sprite = undefined
    //destory container all children destoried
    this.container.destroy(); this.container = undefined
  }
  move(x,y) {
    this.x+=x; this.y+=y
    this.world.tweens.add({ //Move as a Tween!
      targets: this.container,
      x:this.container.x+x*tileContainer.tileSize,
      y:this.container.y+y*tileContainer.tileSize,
      duration: 500,
    })
    //this.container.x+=x*tileContainer.tileSize; this.container.y+=y*tileContainer.tileSize
  }
  turn() {
    this.done = true
    this.world.level.moveEntity(this,1,0)
  }
}
