import { beforeEach, describe, it, expect } from 'vitest'
import { defineStore, setActivePinia, createPinia } from 'pinia';
import { watch, nextTick } from 'vue';
import { Zone, Assembly, Segment, Section } from './entities';
import normie from '../src/normie';

describe('Entities Store', () => {
  let zone;
  let assembly;
  let segment;
  let section;

  beforeEach(() => {
    setActivePinia(createPinia());
    normie(defineStore, [Zone, Assembly, Segment, Section]);
    zone = Zone.create();
    segment = Segment.create();
    section = Section.create();
    assembly = Assembly.create({ profile: { radius: 0.01 }});
  })

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

  it('prevents getting / setting properties on a deleted instance', () => {
    assembly.$delete();
    expect(() => assembly.position).toThrowError();
    expect(() => assembly.position = 0.5).toThrowError();
  })

  it('prevents creating an instance with an id', () => {
    expect(() => Assembly.create({ id: 'uh oh' })).toThrowError();
  })

  it("prevents changing an instance's id", () => {
    expect(() => assembly.id = 'oh no').toThrowError();
  })

  it("correctly serializes to JSON", () => {
    assembly.zone = zone;
    zone.segment = segment;
    segment.section = section;
    console.log(segment.$toJSON('*'));
  })

});