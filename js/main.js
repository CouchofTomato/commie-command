"use strict";

const theCanvas = document.getElementById("canvas")
const c = theCanvas.getContext("2d")
let turrets
let buildings
let background
let attackMissiles
let defenceMissiles = []
let targets

const canvas = {
  width: 800,
  height: 500
}

const createImage = (imageSrc) => {
  let image = new Image()
  image.src = imageSrc
  return image
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
  
  draw() {
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
  
  draw() {
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
  constructor(theX, theY, theTarget, theSpeed) {
    this.startX = theX
    this.startY = theY
    this.x = theX
    this.y = theY
    this.speed = theSpeed
    this.target = theTarget
    this.targetX = theTarget[0]
    this.targetY = theTarget[1]
  }
  
  draw(colour) {
    c.fillStyle = colour
    c.beginPath()
    c.moveTo(this.startX, this.startY)
    c.lineTo(this.x, this.y)
    c.closePath()
    c.strokeStyle = "red"
    c.lineWidth = 2
    c.stroke()
    c.fillStyle = "yellow"
    c.fillRect(this.x, this.y, 2, 2)
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
}

const createTurrets = (num, start, offset) => {
  let turrets = (Array.from(Array(num))).map(_ => {
    let tur = new Turret(start, 400, 10, "images/turret.png")
    start += offset
    return tur
  })
  return turrets
}

const createBuildings = (num, start, offset) => {
  let buildings = (Array.from(Array(num))).map(_ => {
    let building = new Building(start, 410, "images/tower_lightning.png")
    start += offset
    return building
  })
  return buildings
}

const createBackground = (theSrc) => {
  let background = new Image()
  background.src = theSrc
  return background
}

const getRandomX = () => {
  return Math.floor(Math.random() * canvas.width)
}

const getTargetCords = (target) => {
  return [(target.x + (target.width/2)), (target.y + (target.height/2))]
}

const createMissiles = (num, targets) => {
  const speeds = [0.5, 0.7, 1]
  let missiles = (Array.from(Array(num))).map(_ => {
    let target = targets[Math.floor(Math.random() * targets.length)]
    let missileSpeed = speeds[Math.floor(Math.random() * speeds.length)]
    return new Missile(getRandomX(), 0, getTargetCords(target), missileSpeed)
  })
  return missiles
}

turrets = createTurrets(3, 10, ((canvas.width/2)-45))
buildings = createBuildings(6, 80, ((canvas.width/6)-17))
background = createBackground("images/wastel11.jpg")
targets = turrets.concat(buildings)
attackMissiles = createMissiles(10, targets)

const drawTurrets = () => {
  turrets.forEach(turret => {
    turret.draw()
  })
}

const drawBuildings = () => {
  buildings.forEach(building => {
    building.draw()
  })
}

const drawDefenceMissilesLeft = () => {
  c.fillStyle = "white"
  c.font = 14 + "pt Trebuchet MS"
  turrets.forEach(turret => {
    c.fillText(turret.missiles, (turret.x + 25), (turret.y + 95))
  })
}

const drawBackground = () => {
  //c.drawImage(background,0,0, canvas.width, canvas.height)
  c.fillStyle = "black"
  c.fillRect(0,0,canvas.width,canvas.height)
}

const drawAttackMissiles = () => {
  attackMissiles.forEach(missile => {
    missile.draw("red")
    missile.move()
  })
}

const drawDefenceMissiles = () => {
  defenceMissiles.forEach(missile => {
    missile.draw("blue")
    missile.move()
  })
}

const getNearestTurret = (mouseCords) => {
  let x = mouseCords[0]
  let turret = turrets.filter(turret => turret.missiles > 0)
  if (turret.length === 0) return
  turret = turret.reduce((a, b, i, arr) => {
        let acc = Math.abs(a.x-x)
        let cur = Math.abs(b.x-x)
        return acc < cur ? a : b
      })
  return turret
}

const addMissile = (e) => {
  let rect = theCanvas.getBoundingClientRect()
  let mouse = [e.clientX - rect.left, e.clientY - rect.top]
  let turret = getNearestTurret(mouse)
  if (!turret) return
  let turretX = turret.x + (turret.width / 2)
  let missile = new Missile(turretX, turret.y, mouse, 3)
  defenceMissiles.push(missile)
  turret.missiles -= 1
}

const fireDefenceMissile = () => {
  c.addEventListener('click', addMissile)
}

const drawGame = () => {
  window.requestAnimationFrame(drawGame)
  drawBackground()
  drawTurrets()
  drawDefenceMissilesLeft()
  drawBuildings()
  drawAttackMissiles()
  drawDefenceMissiles()
}

document.addEventListener('DOMContentLoaded', function() {
  theCanvas.addEventListener('click', addMissile, false)
  window.requestAnimationFrame(drawGame);
});