const { offsets } = require('./config')
const mem = require('memoryjs')
const math = require('./math')
const exactMath = require('exact-math')

module.exports = class LocalPlayer {
  constructor (eDLL, cDLL, handle) {
    this.cDLL = cDLL
    this.eDLL = eDLL
    this.handle = handle
    this.headBoneIndex = 14
    this.viewAngleEntity = mem.readMemory(handle, eDLL + offsets.viewAngleEntity, 'int')
    this.entityList = mem.readMemory(handle, cDLL + offsets.entityList, 'int')
    this.localEntity = mem.readMemory(handle, this.entityList + offsets.localEntity, 'int')
  }

  getHeadVec () {
    const boneMatrix = mem.readMemory(this.handle, this.localEntity + offsets.boneMatrix, 'int')
    return {
      x: mem.readMemory(this.handle, boneMatrix + 0x30 * this.headBoneIndex + offsets.x, 'float'),
      y: mem.readMemory(this.handle, boneMatrix + 0x30 * this.headBoneIndex + offsets.y, 'float'),
      z: mem.readMemory(this.handle, boneMatrix + 0x30 * this.headBoneIndex + offsets.z, 'float')
    }
  }

  setViewAngleTo (pitch, yaw) {
    mem.writeMemory(this.handle, this.viewAngleEntity + 8 + offsets.pitch, pitch, 'float')
    mem.writeMemory(this.handle, this.viewAngleEntity + 8 + offsets.yaw, yaw, 'float')
  }

  distanceBetween (targetVec) {
    const headVec = this.getHeadVec()
    const deltaVec = {
      x: targetVec.x - headVec.x,
      y: targetVec.y - headVec.y,
      z: targetVec.z - headVec.z
    }
    return {
      distance: math.distance(deltaVec),
      deltaVec
    }
  }

  aimAt (targetVec) {
    const { distance, deltaVec } = this.distanceBetween(targetVec)
    const pitch = math.toDegrees(-Math.sin(exactMath.div(deltaVec.z, distance)))
    const yaw = math.toDegrees(Math.atan2(deltaVec.y, deltaVec.x))
    this.setViewAngleTo(pitch, yaw)
  }
}
