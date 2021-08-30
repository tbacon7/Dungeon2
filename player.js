import Entity from "./entity.js"

export default class Player extends Entity {
  constructor(x, y) {
    super(x,y)
    this.tile = 3800
  }
  turn() {
    //this.done = true
    //this.move(1,1)
  }
}
