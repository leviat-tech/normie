import { beforeEach, describe, it, expect } from 'vitest'
import { defineStore, setActivePinia, createPinia } from 'pinia'
import { watch, nextTick } from 'vue'
import { Zone, Assembly, Segment, Section } from '../entities'
import { normie } from '../../src/normie'

describe('Many to Many', () => {
  let zone
  let segment
  let section

  beforeEach(() => {
    setActivePinia(createPinia())
    normie(defineStore, [Zone, Assembly, Segment, Section])
    zone = Zone.create()
    segment = Segment.create()
    section = Section.create()
  })

  it('can set / remove using foreign key', () => {
    segment.sectionId = section.id
    segment.zoneId = zone.id
    expect(section.zones.length).toBe(1)
    segment.zoneId = null
    expect(section.zones.length).toBe(0)
  })

  it('removes relations upon deletion', () => {
    segment.sectionId = section.id
    segment.zoneId = zone.id
    expect(section.zones.length).toBe(1)
    Segment.delete(segment.id)
    expect(section.zones.length).toBe(0)

    const segment2 = Segment.create()
    segment2.sectionId = section.id
    segment2.zoneId = zone.id
    expect(section.zones.length).toBe(1)
    zone.$delete()
    expect(section.zones.length).toBe(0)
  })

  it('is reactive', async () => {
    let changed = 0
    watch(
      () => section.zones.length,
      () => changed++
    )
    segment.sectionId = section.id
    segment.zoneId = zone.id
    await nextTick()
    Segment.delete(segment.id)
    await nextTick()
    expect(changed).toBe(2)
  })
})
