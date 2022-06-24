import { beforeEach, describe, it, expect } from 'vitest'
import { defineStore, setActivePinia, createPinia } from 'pinia';
import { watch, nextTick } from 'vue';
import { Zone, Assembly, Segment, Section } from '../entities';
import normie from '../../src/normie';


describe('Belongs To', () => {
  let zone;
  let assembly;

  beforeEach(() => {
    setActivePinia(createPinia());
    normie(defineStore, [Zone, Assembly, Segment, Section]);
    zone = Zone.create();
    assembly = Assembly.create({ profile: { radius: 0.01 }});
  })

  it('can set / remove using foreign key', () => {
    assembly.zoneId = zone.id;
    expect(assembly.zone).toBeTruthy();
    assembly.zoneId = null;
    expect(assembly.zone).toBeFalsy();
  })

  it('can set / remove directly', () => {
    assembly.zone = zone;
    expect(assembly.zone).toBeTruthy();
    assembly.zone = null;
    expect(assembly.zone).toBeFalsy();
  })

  it('removes relations upon deletion', () => {
    assembly.zone = zone;
    expect(assembly.zone).toBeTruthy();
    Zone.delete(zone.id);
    expect(assembly.zone).toBeFalsy();
  })

  it('can create relations upon creation', () => {
    const assembly = Assembly.create({ zone: {} });
    expect(assembly.zone).toBeTruthy();
  })

  it('is reactive', async () => {
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

})