import { beforeEach, describe, it, expect } from 'vitest'
import { defineStore, setActivePinia, createPinia } from 'pinia';
import { watch, nextTick } from 'vue';
import { Zone, Assembly, Segment, Section } from '../entities';
import normie from '../../src/normie';

describe('Has One', () => {
  let zone;
  let segment;

  beforeEach(() => {
    setActivePinia(createPinia());
    normie(defineStore, [Zone, Assembly, Segment, Section]);
    zone = Zone.create();
    segment = Segment.create();
  })

  it('can set / remove using foreign key', () => {
    segment.zoneId = zone.id;
    expect(zone.segment).toBeTruthy();
    segment.zoneId = null;
    expect(zone.segment).toBeFalsy();
  })

  it('can set / remove directly', () => {
    segment.zone = zone;
    expect(zone.segment).toBeTruthy();
    segment.zone = null;
    expect(zone.segment).toBeFalsy();
  })

  it('removes relations upon deletion', () => {
    segment.zone = zone;
    expect(zone.segment).toBeTruthy();
    Segment.delete(segment.id)
    expect(zone.segment).toBeFalsy();
  })

  it('can create relations upon creation', () => {
    const zone = Zone.create({ segment: {} });
    expect(zone.segment).toBeTruthy();
  })

  it('is reactive', async () => {
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

});