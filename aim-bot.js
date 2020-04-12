const mem = require('memoryjs')
const aks = require('asynckeystate')
const procName = 'left4dead2.exe'
const { offsets, classIds, boneIds } = require('./config')
const LocalPlayer = require('./local-player')

try {
  var proc = mem.openProcess(procName)
  var clientModule = mem.findModule('client.dll', proc.th32ProcessID)
  var engineModule = mem.findModule('engine.dll', proc.th32ProcessID)
  var { handle } = mem.openProcess(proc.th32ProcessID)
} catch (err) {
  console.log(err)
  console.log('unable to find process or module')
  process.exit()
}
const cDLL = clientModule.modBaseAddr
const eDLL = engineModule.modBaseAddr

const localPlayer = new LocalPlayer(eDLL, cDLL, handle)

function getClassId (target) {
  const IClientNetworkable = mem.readMemory(handle, target + offsets.IClientNetworkable, 'int') // IClientNetworkable vtable
  const GetClientClass = mem.readMemory(handle, IClientNetworkable + offsets.GetClientClass, 'int') // 2nd function in the vtable (GetClientClass)
  const clientClass = mem.readMemory(handle, GetClientClass + offsets.clientClassStruct, 'int') // pointer to the ClientClass struct out of the mov eax
  return mem.readMemory(handle, clientClass + offsets.classId, 'int')
}

function isAlive (target, classId) {
  if (classId === 263) {
    // infected zombies don't have lifestate or health address so i had to find workaround to determine if he actually died or not
    const infectedLifeState = mem.readMemory(handle, target + offsets.infectedLifeState, 'int')
    if (infectedLifeState !== 0) return
  } else {
    const lifeState = mem.readMemory(handle, target + offsets.lifeState, 'int')
    const currentHp = mem.readMemory(handle, target + offsets.currentHp, 'int')
    if (lifeState !== 2 || currentHp < 1) {
      return
    }
  }
  return true
}

function getBestTargetVec () {
  const entityList = mem.readMemory(handle, cDLL + offsets.entityList, 'int')

  let closestDistance = Infinity
  let bestTargetVec = {
    x: null,
    y: null,
    z: null
  }
  // choose closest one from all possible targets
  for (let i = 0x24; i < (0x10 * 1000); i += 0x10) { // 1000 is pretty random, I have to find an address to determine max entity count 
    const target = mem.readMemory(handle, entityList + i, 'int')
    if (!target) continue

    const classId = getClassId(target)

    // check if it's what i want to aim at
    if (!(classId in classIds)) {
      continue
    }

    if (!isAlive(target, classId)) {
      continue
    }
    const boneIndex = boneIds[classIds[classId]]
    const boneMatrix = mem.readMemory(handle, target + offsets.boneMatrix, 'int')
    const targetVec = {
      x: mem.readMemory(handle, boneMatrix + 0x30 * boneIndex + offsets.x, 'float'),
      y: mem.readMemory(handle, boneMatrix + 0x30 * boneIndex + offsets.y, 'float'),
      z: mem.readMemory(handle, boneMatrix + 0x30 * boneIndex + offsets.z, 'float')
    }
    const {distance} = localPlayer.distanceBetween(targetVec)
    if (distance < closestDistance) {
      closestDistance = distance
      bestTargetVec = targetVec
    }
  }
  return bestTargetVec
}

function aimbot () {
  if (aks.getAsyncKeyState(0x01)) {
    const targetVec = getBestTargetVec()

    if (!targetVec.x) return

    localPlayer.aimAt(targetVec)
  }
}

setInterval(aimbot, 50)
