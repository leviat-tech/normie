import { beforeEach, describe, it, expect } from 'vitest'
import { defineStore, setActivePinia, createPinia } from 'pinia'
import { watch, nextTick } from 'vue'
import { Zone, Assembly, Segment, Section } from '../entities'
import normie from '../../src/normie'
import { CreateError } from '../../src/exceptions'

describe('Has Many', () => {
  let zone
  let assembly
  let assembly2

  beforeEach(() => {
    setActivePinia(createPinia())
    normie(defineStore, [Zone, Assembly, Segment, Section])
    zone = Zone.create()
    assembly = Assembly.create({ profile: { radius: 0.01 } })
    assembly2 = Assembly.create({ profile: { radius: 0.02 } })
  })

  it('can set / remove using foreign key', () => {
    assembly.zoneId = zone.id
    assembly2.zoneId = zone.id
    expect(zone.assemblies.length).toBe(2)
    assembly.zoneId = null
    expect(zone.assemblies.length).toBe(1)
  })

  it('can set / remove directly', () => {
    zone.assemblies = [assembly, assembly2]
    expect(zone.assemblies.length).toBe(2)
    zone.assemblies = [assembly]
    expect(zone.assemblies.length).toBe(1)
  })

  it('removes relations upon deletion', () => {
    zone.assemblies = [assembly, assembly2]
    Assembly.delete(assembly2.id)
    expect(zone.assemblies.length).toBe(1)
  })

  it('can create relations upon creation', () => {
    const zone = Zone.create({ assemblies: [{}, {}] })
    expect(zone.assemblies.length).toBe(2)
  })

  it('is reactive', async () => {
    let changed = 0
    watch(
      () => zone.assemblies.length,
      () => changed++
    )
    assembly.zoneId = zone.id
    await nextTick()
    assembly2.zoneId = zone.id
    await nextTick()
    assembly.$delete()
    await nextTick()
    expect(changed).toBe(3)
  })

  it('cannot create a relation when a foreign key is defined on the relation', () => {
    expect(() => Zone.create({ assemblies: [{ zoneId: 'oh no' }] })).toThrowError(CreateError)
  })
})
