import { beforeEach, describe, it, expect } from 'vitest'
import { defineStore, setActivePinia, createPinia } from 'pinia';
import { watch, nextTick } from 'vue';
import { Zone, Assembly, Segment } from './entities';
import normie from '../src/normie';

describe('Entities Store', () => {
  let zone;
  let assembly;
  let assembly2;
  let segment;

  beforeEach(() => {
    setActivePinia(createPinia());
    normie(defineStore, [Zone, Assembly, Segment]);
    zone = Zone.create();
    assembly = Assembly.create({ profile: { radius: 0.01 }});
    assembly2 = Assembly.create({ profile: { radius: 0.02 }});
    segment = Segment.create();
  })

  it('can set / remove belongsTo using foreign key', () => {
    assembly.zoneId = zone.id;
    expect(assembly.zone).toBeTruthy();
    assembly.zoneId = null;
    expect(assembly.zone).toBeFalsy();
  })

  it('can set / remove belongsTo directly', () => {
    assembly.zone = zone;
    expect(assembly.zone).toBeTruthy();
    assembly.zone = null;
    expect(assembly.zone).toBeFalsy();
  })

  it('removes belongsTo relations upon deletion', () => {
    assembly.zone = zone;
    expect(assembly.zone).toBeTruthy();
    Zone.delete(zone.id);
    expect(assembly.zone).toBeFalsy();
  })

  it('can create belongsTo relations upon creation', () => {
    const assembly = Assembly.create({ zone: {} });
    expect(assembly.zone).toBeTruthy();
  })

  it('ensures belongsTo is reactive', async () => {
    let changed = 0;
    watch(
      () => assembly.zone?.id,
      () => changed++,
    )
    assembly.zone = zone;
    await nextTick();
    assembly.zone = null;
    await nextTick();
    assembly.zoneId = zone.id;
    await nextTick();
    expect(changed).toBe(3);
  })

  it('can set / remove hasOne using foreign key', () => {
    segment.zoneId = zone.id;
    expect(zone.segment).toBeTruthy();
    segment.zoneId = null;
    expect(zone.segment).toBeFalsy();
  })

  it('can set / remove hasOne directly', () => {
    segment.zone = zone;
    expect(zone.segment).toBeTruthy();
    segment.zone = null;
    expect(zone.segment).toBeFalsy();
  })

  it('removes hasOne relations upon deletion', () => {
    segment.zone = zone;
    expect(zone.segment).toBeTruthy();
    Segment.delete(segment.id)
    expect(zone.segment).toBeFalsy();
  })

  it('can create hasOne relations upon creation', () => {
    const zone = Zone.create({ segment: {} });
    expect(zone.segment).toBeTruthy();
  })

  it('ensures hasOne is reactive', async () => {
    let changed = 0;
    watch(
      () => zone.segment?.id,
      () => changed++,
    )
    zone.segment = segment;
    await nextTick();
    zone.segment = null;
    await nextTick();
    segment.zoneId = zone.id;
    await nextTick();
    expect(changed).toBe(3);
  })

  it('can set / remove hasMany using foreign key', () => {
    assembly.zoneId = zone.id;
    assembly2.zoneId = zone.id;
    expect(zone.assemblies.length).toBe(2);
    assembly.zoneId = null;
    expect(zone.assemblies.length).toBe(1);
  })

  it('can set / remove hasMany directly', () => {
    zone.assemblies = [assembly, assembly2];
    expect(zone.assemblies.length).toBe(2);
    zone.assemblies = [assembly];
    expect(zone.assemblies.length).toBe(1);
  })

  it('removes hasMany relations upon deletion', () => {
    zone.assemblies = [assembly, assembly2];
    Assembly.delete(assembly2.id);
    expect(zone.assemblies.length).toBe(1);
  })

  it('can create hasMany relations upon creation', () => {
    const zone = Zone.create({ assemblies: [{}, {}]});
    expect(zone.assemblies.length).toBe(2);
  })

  it('ensures hasMany is reactive', async () => {
    let changed = 0;
    watch(
      () => zone.assemblies.length,
      () => changed++,
    )
    assembly.zoneId = zone.id;
    await nextTick();
    assembly2.zoneId = zone.id;
    await nextTick();
    assembly.$delete();
    await nextTick();
    expect(changed).toBe(3);
  });

  it('can set properties with a setter', () => {
    assembly.zone = zone;
    zone.assemblies[0].profile.radius = 0.001;
    expect(zone.assemblies[0].profile.radius).toBe(0.001);
    expect(assembly.profile.radius).toBe(0.001);
  })

  it('can set multiple properties with $.update', () => {
    assembly.zone = zone;
    const patch = {
      profile: { width: 0.09 },
      position: 0.5,
    }
    zone.assemblies[0].$update(patch);
    expect(zone.assemblies[0].profile.width).toBe(0.09);
    expect(assembly.position).toBe(0.5);
    expect(assembly.profile.radius).toBe(0.01); // maintain values in nested objects;
  })

  it('ensures updating properties is reactive', async () => {
    let changed = 0;
    assembly.zone = zone;
    watch(
      () => assembly.profile.radius,
      () => changed++,
    )
    assembly.profile.radius = 0.02;
    await nextTick();
    zone.assemblies[0].profile.radius = 0.03
    await nextTick();
    expect(changed).toBe(2);
  })

  // get / set properties on deleted instance;
  // create / update with id;

});