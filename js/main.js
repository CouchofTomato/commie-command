"use strict";

let game

// load fonts
const distress = new FontFace('Distress', 'url(fonts/Distress.ttf.woff)', { style: 'normal', weight: 'normal'} )
document.fonts.add(distress)
distress.load()

const theCanvas = document.getElementById("canvas")
const canvas = { width: 800, height: 500 }

const createImage = (imageSrc) => {
  let image = new Image()
  image.src = imageSrc
  return image
}

const getRandomX = () => {
  return Math.floor(Math.random() * canvas.width)
}

const getTargetCords = (target) => {
  return [(target.x + (target.width/2)), (target.y + (target.height/2))]
}

const createBackground = (theSrc) => {
  let background = new Image()
  background.src = theSrc
  return background
}

class Turret {
  constructor(theX, theY, theMissiles, theSrc){
    this.x = theX
    this.y = theY
    this.missiles = theMissiles
    this.src = theSrc
    this.image = createImage(this.src)
    this.width = 70
    this.height = 90
  }
  
  draw(c) {
    c.drawImage(
      this.image,
      0,
      193,
      177,
      222,
      this.x,
      this.y,
      this.width,
      this.height
    )
  }
}

class Building {
  constructor(theX, theY, theSrc) {
    this.x = theX
    this.y = theY
    this.src = theSrc
    this.image = createImage(this.src)
    this.width = 50
    this.height = 80
  }
  
  draw(c) {
    c.drawImage(
      this.image,
      this.x,
      this.y,
      this.width,
      this.height
      )
  }
}

class Missile {
  constructor(theX, theY, targetCords, theSpeed) {
    this.startX = theX
    this.startY = theY
    this.x = theX
    this.y = theY
    this.speed = theSpeed
    this.targetX = targetCords[0]
    this.targetY = targetCords[1]
  }
  
  draw(c) {
    c.beginPath()
    c.moveTo(this.startX, this.startY)
    c.lineTo(this.x, this.y)
    c.closePath()
    c.strokeStyle = this.colour
    c.lineWidth = 2
    c.stroke()
  }
  
  move() {
    let toPlayerX = this.targetX - this.x
    let toPlayerY = this.targetY - this.y
    let toPlayerLength = Math.sqrt(toPlayerX * toPlayerX + toPlayerY * toPlayerY)
    toPlayerX = toPlayerX / toPlayerLength
    toPlayerY = toPlayerY / toPlayerLength
    this.x += toPlayerX * this.speed
    this.y += toPlayerY * this.speed
  }
  
  atTarget() {
    return Math.abs(this.x - this.targetX) < 4 && Math.abs(this.y - this.targetY) < 4
  }
}

class defenceMissile extends Missile {
  constructor(theX, theY, theTarget, theSpeed) {
    super(theX, theY, theTarget, theSpeed)
    this.colour = "blue"
  }
}

class attackMissile extends Missile {
  constructor(theX, theY, targetCords, theSpeed, theTarget) {
    super(theX, theY, targetCords, theSpeed)
    this.colour = "red"
    this.target = theTarget
  }
}

class Explosion {
  constructor(theX, theY) {
    this.x = theX
    this.y = theY
    this.radius = 4
    this.maxRadius = 30
  }
  
  draw(c) {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    c.fillStyle = 'yellow';
    c.fill();
    c.lineWidth = 5;
    c.strokeStyle = 'yellow';
    c.stroke();
    this.radius += 1
  }
}

class Game {
  constructor() {
    this.c = theCanvas.getContext("2d")
  }
  
  welcomeScreen() {
    const width = theCanvas.width/2
    const height = theCanvas.height
    this.c.fillStyle = "black"
    this.c.fillRect(0, 0, theCanvas.width, theCanvas.height)
    this.c.fillStyle = "#fc0000"
    this.c.font = "3em distress"
    this.c.textAlign = "center"
    this.c.fillText("MISSILE COMMAND", width, 100)
    this.c.font = "1.5em arial"
    this.c.fillText("Click To Play", width, 300)
    this.c.fillStyle = "white"
    this.c.fillText("THE COMMIES ARE COMING.", width, 150)
    this.c.fillText("FIGHT BACK NOW!", width, 200)
  }
  
  setup() {
    this.level = 1
    this.numberOfAttackMissiles = 10
    this.numberOfDefenceMissiles = 10
    this.score = 0
    this.turrets = this.createTurrets(3, 10, ((canvas.width/2)-45))
    this.buildings = this.createBuildings(6, 80, ((canvas.width/6)-17))
    this.targets = this.turrets.concat(this.buildings)
    this.numberOfAttackMissiles = 10
    this.attackMissiles = this.createAttackMissiles(this.numberOfAttackMissiles, this.targets)
    this.attackMissilesFired = []
    this.friendlyObjects = this.turrets.concat(this.buildings)
    this.startGameHandler = this.start.bind(this)
    this.drawGameHandler = this.drawGame.bind(this)
    this.explosions = []
    this.defenceMissiles = []
    this.count = 0
    this.defenceMissileHandler = this.createDefenceMissile.bind(this)
    theCanvas.addEventListener('click', this.startGameHandler, false)
  }
  
  start() {
    theCanvas.removeEventListener('click', this.startGameHandler, false)
    theCanvas.addEventListener('click', this.defenceMissileHandler, false)
    this.gameRunning = window.requestAnimationFrame(this.drawGameHandler)
  }
  
  drawGame() {
    this.gameRunning = window.requestAnimationFrame(this.drawGameHandler)
    this.drawBackground()
    this.drawScore()
    this.drawFriendlyBuildings()
    this.drawTurretMissilesLeft()
    this.drawExplosions()
    this.addAttackMissiles()
    this.drawAttackMissiles()
    this.drawDefenceMissiles()
    this.checkMissileLocation()
    this.detectCollisions()
    this.removeExplosions()
    this.checkGameOver()
    this.checkLevelState()
    this.count += 1
  }
  
  drawScore() {
    this.c.font = "1.5em arial"
    this.c.fillStyle = "white"
    this.c.fillText(this.score, 750, 20)
  }
  
  checkGameOver() {
    if (this.friendlyObjects.length === 0) {
      window.cancelAnimationFrame(this.gameRunning)
      this.gameOverDisplay()
      theCanvas.removeEventListener('click', this.startGameHandler, false)
      theCanvas.removeEventListener('click', this.defenceMissileHandler, false)
      this.resetHandler = this.resetGame.bind(this)
      theCanvas.addEventListener('click', this.resetHandler, false)
    }
  }
  
  checkLevelState() {
    if (this.attackMissiles.length === 0 && this.attackMissilesFired.length === 0 && this.explosions.length === 0) {
      theCanvas.removeEventListener('click', this.defenceMissileHandler, false)
      window.cancelAnimationFrame(this.gameRunning)
      this.level += 1
      let missilesLeft = this.getDefenceMissilesRemaining()
      this.score += (missilesLeft * 10)
      this.score += (this.friendlyObjects.length * 10)
      this.updateLevelDisplay()
      if (this.level > 10) {
        window.cancelAnimationFrame(this.gameRunning)
        this.gameOverDisplay()
        theCanvas.removeEventListener('click', this.startGameHandler, false)
        theCanvas.removeEventListener('click', this.defenceMissileHandler, false)
        this.resetHandler = this.resetGame.bind(this)
        theCanvas.addEventListener('click', this.resetHandler, false)
      }
      this.nextLevelHandler = this.nextLevel.bind(this)
      setTimeout(this.nextLevelHandler, 5000)
    }
  }
  
  updateLevelDisplay() {
    const width = theCanvas.width/2
    const height = theCanvas.height
    this.c.fillStyle = "black"
    this.c.fillRect(0, 0, canvas.width, canvas.height)
    this.c.fillStyle = "#fc0000"
    this.c.font = "3em distress"
    this.c.textAlign = "center"
    this.c.fillText("LEVEL COMPLETE", width, 100)
    this.c.fillStyle = "white"
    this.c.font = "1.5em arial"
    this.c.fillText(this.getDefenceMissilesRemaining() + " Missiles Remaining: " + (this.getDefenceMissilesRemaining() * 10), width, 200)
    this.c.fillText(this.friendlyObjects.length + " Friendly Buildings Saved: " + (this.friendlyObjects.length * 10), width, 300)
    this.c.fillText("SCORE: " + this.score, width, 400)
  }
  
  getDefenceMissilesRemaining() {
    let missiles = 0
    this.turrets.forEach(turret => {
      missiles += turret.missiles
    })
    return missiles
  }
  
  nextLevel() {
    this.numberOfAttackMissiles += (this.level * 2)
    this.numberOfDefenceMissiles += 2
    this.turrets = this.createTurrets(3, 10, ((canvas.width/2)-45))
    this.buildings = this.createBuildings(6, 80, ((canvas.width/6)-17))
    this.targets = this.turrets.concat(this.buildings)
    this.attackMissiles = this.createAttackMissiles(this.numberOfAttackMissiles, this.targets)
    this.attackMissilesFired = []
    this.friendlyObjects = this.turrets.concat(this.buildings)
    this.explosions = []
    this.defenceMissiles = []
    this.count = 0
    theCanvas.addEventListener('click', this.defenceMissileHandler, false)
    this.gameRunning = window.requestAnimationFrame(this.drawGameHandler)
  }
  
  gameOverDisplay() {
    const width = theCanvas.width/2
    const height = theCanvas.height
    this.c.fillStyle = "black"
    this.c.fillRect(0, 0, canvas.width, canvas.height)
    this.c.fillStyle = "#fc0000"
    this.c.font = "3em distress"
    this.c.textAlign = "center"
    this.c.fillText("GAME OVER", width, 100)
    this.c.font = "1.5em arial"
    this.c.fillText("SCORE: " + this.score, width, 200)
    this.c.fillStyle = "white"
    this.c.fillText("Click to play again", width, 300)
  }
  
  addAttackMissiles() {
    if (this.count % 60 == 0) {
      let missiles = this.attackMissiles.splice(0, Math.floor(Math.random() * 2 + 1))
      missiles.forEach(missile => this.attackMissilesFired.push(missile))
    }
  }
  
  drawFriendlyBuildings() {
    this.friendlyObjects.forEach(object => {
      object.draw(this.c)
    })
  }
  
  createTurrets(num, start, offset) {
    const turrets = (Array.from(Array(num))).map(_ => {
      let tur = new Turret(start, 400, this.numberOfDefenceMissiles, "images/turret.png")
      start += offset
      return tur
    })
    return turrets
  }
  
  createBuildings(num, start, offset) {
    const buildings = (Array.from(Array(num))).map(_ => {
      let building = new Building(start, 410, "images/tower_lightning.png")
      start += offset
      return building
    })
    return buildings
  }
  
  createAttackMissiles(num, targets) {
    const speeds = [0.5, 0.7, 1]
    let missiles = (Array.from(Array(num))).map(_ => {
      let target = this.targets[Math.floor(Math.random() * this.targets.length)]
      let missileSpeed = speeds[Math.floor(Math.random() * speeds.length)]
      return new attackMissile(getRandomX(), 0, getTargetCords(target), missileSpeed, target)
    })
    return missiles
  }
  
  createDefenceMissile(e) {
    let rect = theCanvas.getBoundingClientRect()
    let mouse = [e.clientX - rect.left, e.clientY - rect.top]
    let turret = this.getNearestTurret(mouse)
    if (!turret) return
    let turretX = turret.x + (turret.width / 2)
    let missile = new defenceMissile(turretX, turret.y, mouse, 5)
    this.defenceMissiles.push(missile)
    turret.missiles -= 1
  }
  
  getNearestTurret(mouseCords) {
    let x = mouseCords[0]
    let turret = this.turrets.filter(turret => turret.missiles > 0)
    if (turret.length === 0) return
    return turret.reduce((a, b, i, arr) => {
          let acc = Math.abs(a.x-x)
          let cur = Math.abs(b.x-x)
          return acc < cur ? a : b
        })
  }
  
  drawAttackMissiles() {
    this.attackMissilesFired.forEach(missile => {
      missile.draw(this.c)
      missile.move()
    })
  }
  
  drawDefenceMissiles() {
    this.defenceMissiles.forEach(missile => {
      missile.draw(this.c)
      missile.move()
    })
  }
  
  checkMissileLocation() {
    let missiles = this.attackMissilesFired.concat(this.defenceMissiles)
    missiles.forEach(missile => {
      let collision = missile.atTarget()
      if(collision) this.explode(missile)
    })
  }
  
  explode(missile) {
    let explosion = new Explosion(missile.targetX, missile.targetY)
    this.explosions.push(explosion)
    let attackIndex = this.attackMissilesFired.findIndex(attackMissile => attackMissile === missile)
    let defenceIndex = this.defenceMissiles.findIndex(defenceMissile => defenceMissile === missile)
    let index = Math.max(attackIndex, defenceIndex)
    if (attackIndex < 0) {
      this.defenceMissiles.splice(defenceIndex, 1)
    } else {
      let target = missile.target.constructor.name
      this.attackMissilesFired.splice(attackIndex, 1)
      let targetIndex = this.friendlyObjects.findIndex(object => object === missile.target)
      if (targetIndex >= 0) this.friendlyObjects.splice(targetIndex, 1)
      if (target === "Turret") {
        let index = this.turrets.findIndex(turret => turret === missile.target)
        this.turrets.splice(index, 1)
      }
    }
  }
  
  drawExplosions() {
    this.explosions.forEach(explosion => explosion.draw(this.c))
  }
  
  detectCollisions() {
    this.explosions.forEach(explosion => {
      this.attackMissilesFired.forEach(missile => {
        if(this.collided(missile.x, missile.y, explosion.x, explosion.y, explosion.radius)) {
          let explosion = new Explosion(missile.x, missile.y)
          this.explosions.push(explosion)
          let attackIndex = this.attackMissilesFired.findIndex(aMissile => aMissile === missile)
          this.attackMissilesFired.splice(attackIndex, 1)
        }
      })
    })
  }
  
  collided (x, y, cx, cy, radius) {
    let distancesquared = (x - cx) * (x - cx) + (y - cy) * (y - cy);
    return distancesquared <= radius * radius;
  }
  
  removeExplosions() {
    this.explosions.forEach(explosion => {
      if (explosion.radius >= explosion.maxRadius) {
        let explosionIndex = this.explosions.findIndex(thisExplosion => thisExplosion === explosion)
        this.explosions.splice(explosionIndex, 1)
      }
    })
  }
  
  drawTurretMissilesLeft() {
    this.c.fillStyle = "white"
    this.c.font = 14 + "pt Trebuchet MS"
    this.turrets.forEach(turret => {
      this.c.fillText(turret.missiles, (turret.x + 25), (turret.y + 95))
    })
  }
  
  drawBackground() {
    this.c.fillStyle = "black"
    this.c.fillRect(0,0,canvas.width,canvas.height)
  }
  
  resetGame() {
    theCanvas.removeEventListener('click', this.resetHandler, false)
    this.welcomeScreen()
    this.setup()
  }
}

document.addEventListener('DOMContentLoaded', function() {
  distress.loaded.then((fontface) => {
    game = new Game()
    game.welcomeScreen()
    game.setup()
  })
});