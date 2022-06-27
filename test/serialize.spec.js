import { beforeEach, describe, expect, it } from 'vitest'
import { defineStore, setActivePinia, createPinia } from 'pinia'
import { Zone, Assembly, Segment, Section } from './entities'
import { normie } from '../src/normie'

describe('serialization', () => {
  let zone
  let assembly
  let segment
  let section

  beforeEach(() => {
    setActivePinia(createPinia())
    normie(defineStore, [Zone, Assembly, Segment, Section])
    zone = Zone.create({ id: 1 })
    assembly = Assembly.create({ id: 1, profile: { radius: 0.01 } })
    segment = Segment.create({ id: 1 })
    section = Section.create({ id: 1 })
    assembly.zone = zone
    zone.segment = segment
    segment.section = section
  })

  it('serializes * to JSON', () => {
    const expected = {
      length: 0,
      zoneId: 1,
      sectionId: 1,
      id: 1,
      zone: {
        materialPreferences: { paintCoat: 'P1', ralColor: 'STD' },
        id: 1
      },
      section: {
        description: '',
        masonry: { material: '', thickness: 0.1 },
        id: 1
      }
    }
    expect(segment.$toJSON('*')).toEqual(expected)
  })

  it('serializes nested properties to JSON', () => {
    const expected = {
      length: 0,
      zoneId: 1,
      sectionId: 1,
      id: 1,
      section: {
        description: '',
        masonry: { material: '', thickness: 0.1 },
        id: 1,
        zones: [{
          materialPreferences: { paintCoat: 'P1', ralColor: 'STD' },
          id: 1,
          assemblies: [{
            position: 0,
            profile: { radius: 0.01, width: 0.07, height: 0.05 },
            zoneId: 1,
            id: 1
          }]
        }],
        segment: { length: 0, zoneId: 1, sectionId: 1, id: 1 }
      }
    }
    expect(segment.$toJSON('section.[zones.assemblies, segment]')).toEqual(expected)
  })

  it('cannot serialize a nonexistent property', () => {
    expect(() => segment.$toJSON('oops')).toThrowError()
  })
})
