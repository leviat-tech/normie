import Entity from '../src/entity';

export class Zone extends Entity {
  static id = 'sections';

  static fields = {
    materialPreferences: {
      paintCoat: 'P1',
      ralColor: 'STD',
    },
    assemblies: this.hasMany('assemblies', 'zoneId'),
    segment: this.hasOne('segments', 'zoneId'),
  };
}

export class Assembly extends Entity {
  static id = 'assemblies';

  static fields = {
    position: 0,
    profile: {
      radius: 0.005,
      width: 0.07,
      height: 0.05,
    },
    zoneId: null,
    zone: this.belongsTo(Zone, 'zoneId'),
  };
}

export class Segment extends Entity {
  static id = 'segments';
  
  static fields = {
    length: 0,
    zoneId: null,
    zone: this.belongsTo(Zone, 'zoneId'),
  }
}