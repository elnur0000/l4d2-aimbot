module.exports = {
  offsets: {
    viewAngleEntity: 0x004248EC,
    teamNum: 0xE4,
    hp: 0xE8,
    currentHp: 0xEC,
    entityList: 0x69CF04,
    boneMatrix: 0x6c0,
    localEntity: 0x14,
    lifeState: 0x144,
    x: 0x0C,
    y: 0x1C,
    z: 0x2C,
    pitch: 0x4AA4,
    yaw: 0x4AA8,
    IClientNetworkable: 0x8,
    GetClientClass: 0x4,
    clientClassStruct: 0x1,
    classId: 0x14,
    infectedLifeState: 0x11EC // dunno what this address is about but it's always 0 if infected is alive
  },
  boneIds: {
    jockey: 7,
    charger: 16,
    // infected: 29,
    infected: 14,
    tank: 12,
    boomer: 11,
    spitter: 3,
    hunter: 12,
    smoker: 19
  },
  classIds: {
    // 231: 'localPlayer',
    // 274: 'survivorBot',
    0: 'boomer',
    263: 'infected',
    275: 'tank',
    276: 'witch',
    264: 'jockey',
    271: 'spitter',
    99: 'charger',
    262: 'hunter',
    269: 'smoker'
  }
}
