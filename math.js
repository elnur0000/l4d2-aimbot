module.exports = {
  toDegrees (angle) {
    return angle * (180 / Math.PI)
  },
  distance (deltaVec) {
    return Math.sqrt(deltaVec.x ** 2 + deltaVec.y ** 2 + deltaVec.z ** 2)
  }
}
