export default class Cell {
  constructor(
    img,
    width,
    height,
    { x, y, z, r, a, vX, vY, vZ, vR, vA, aX, aY, aZ, aR, aA }
  ) {
    this.img = img
    this.width = width
    this.height = height
    this.x = x
    this.y = y
    this.z = z
    this.r = r
    this.a = a
    this.vX = vX
    this.vY = vY
    this.vZ = vZ
    this.vR = vR
    this.vA = vA
    this.aX = aX
    this.aY = aY
    this.aZ = aZ
    this.aR = aR
    this.aA = aA
  }

  tick(duration) {
    this.x += this.vX * duration
    this.y += this.vY * duration
    this.z += this.vZ * duration
    this.r += this.vR * duration
    this.a = Math.min(1, Math.max(0, this.a + this.vA * duration))
    this.vX += this.aX * duration
    this.vY += this.aY * duration
    this.vZ += this.aZ * duration
    this.vR += this.aR * duration
    this.vA += this.aA * duration
  }
}
