import { beforeEach, describe, it, expect } from 'vitest'
import { defineStore, setActivePinia, createPinia } from 'pinia'
import { watch, nextTick } from 'vue'
import { Zone, Assembly, Segment, Section } from '../entities'
import normie from '../../src/normie'
import { UpdateError, DoesNotExistError } from '../../src/exceptions'

describe('update', () => {
  let zone
  let assembly

  beforeEach(() => {
    setActivePinia(createPinia())
    normie(defineStore, [Zone, Assembly, Segment, Section])
    zone = Zone.create()
    assembly = Assembly.create({ profile: { radius: 0.01 } })
  })

  it('can update properties with a setter', () => {
    assembly.zone = zone
    zone.assemblies[0].profile.radius = 0.001
    expect(zone.assemblies[0].profile.radius).toBe(0.001)
    expect(assembly.profile.radius).toBe(0.001)
  })

  it('can update multiple properties with $.update', () => {
    assembly.zone = zone
    const patch = {
      profile: { width: 0.09 },
      position: 0.5
    }
    zone.assemblies[0].$update(patch)
    expect(zone.assemblies[0].profile.width).toBe(0.09)
    expect(assembly.position).toBe(0.5)
    expect(assembly.profile.radius).toBe(0.01)
  })

  it('ensures updating properties is reactive', async () => {
    let changed = 0
    assembly.zone = zone
    watch(
      () => assembly.profile.radius,
      () => changed++
    )
    assembly.profile.radius = 0.02
    await nextTick()
    zone.assemblies[0].profile.radius = 0.03
    await nextTick()
    expect(changed).toBe(2)
  })

  it("cannot update an instance's id", () => {
    expect(() => {
      assembly.id = 'oh no'
    }).toThrowError(UpdateError)
  })

  it('cannot update properties on a deleted instance', () => {
    assembly.$delete()
    expect(() => {
      assembly.position = 0.5
    }).toThrowError(DoesNotExistError)
  })
})
