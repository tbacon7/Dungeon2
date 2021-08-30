import world from "./world.js"
import gameOver from "./gameover.js"

const config = {
    type: Phaser.AUTO,
    width: 80 * 16,
    height: 50 * 16,
    backgroundColor: "#000000",
    parent: "game",
    pixelArt: true,
    zoom: 1,
    scene: [world],
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 }
        }
    }
}

const game = new Phaser.Game(config)
