import { beforeEach, describe, it, expect } from 'vitest'
import { defineStore, setActivePinia, createPinia } from 'pinia'
import { watch, nextTick } from 'vue'
import { Zone, Assembly, Segment, Section } from '../entities'
import { normie } from '../../src/normie'
import { InvalidCreateError } from '../../src/exceptions'

describe('create', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    normie(defineStore, [Zone, Assembly, Segment, Section])
  })

  it('ensures creating instances is reactive', async () => {
    let changed = 0
    watch(
      () => Assembly.read().length,
      () => changed++
    )
    Assembly.create()
    await nextTick()
    Assembly.create()
    await nextTick()
    expect(changed).toBe(2)
  })

  it('cannot create an instance with an existing id', () => {
    const assembly = Assembly.create()
    expect(() => {
      Assembly.create({ id: assembly.id })
    }).toThrowError(InvalidCreateError)
  })
})
