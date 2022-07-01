import { beforeEach, describe, it, expect } from 'vitest'
import { defineStore, setActivePinia, createPinia } from 'pinia'
import { watch, nextTick } from 'vue'
import { normie } from '../src/normie'
import Entity from '../src/entity'
import { InvalidEntityError, InvalidForeignKeyError } from '../src/exceptions'

describe('entities', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('inherits static methods', () => {
    class E extends Entity {
      static id = 'e'
      static fields = {}
      static get first () {
        return this.read()[0]
      }
    }
    normie(defineStore, [E])
    E.create()
    expect(E.first).toBeTruthy()
  })

  it('ensures reactivity in static methods', async () => {
    class E extends Entity {
      static id = 'e'
      static fields = {}
      static get evens () {
        return this.read().filter((_, i) => i % 2 === 0)
      }
    }

    normie(defineStore, [E])

    let changed = 0
    watch(
      () => E.evens.length,
      () => changed++
    )
    E.create()
    await nextTick()
    E.create()
    await nextTick()
    E.create()
    await nextTick()
    expect(changed).toBe(2)
  })

  it('cannot create an entity with no id', () => {
    class NoId extends Entity {}
    expect(() => normie(defineStore, [NoId])).toThrowError(InvalidEntityError)
  })

  it('cannot create an entity with no fields', () => {
    class NoFields extends Entity {
      static id = 'noFields'
    }
    expect(() => normie(defineStore, [NoFields])).toThrowError(InvalidEntityError)
  })

  it('cannot link to a nonexistent entity in a foreign key', () => {
    class InvalidForeignKey extends Entity {
      static id = 'invalidForeignKey'
      static fields = {
        zoneId: this.foreignKey('zones')
      }
    }
    expect(() => normie(defineStore, [InvalidForeignKey])).toThrowError(InvalidEntityError)
  })

  it('cannot link to a nonexistent entity in a relation', () => {
    class InvalidParent extends Entity {
      static id = 'parent'
      static fields = {
        children: this.hasMany('child', 'parentId')
      }
    }
    expect(() => normie(defineStore, [InvalidParent])).toThrowError(InvalidEntityError)
  })

  it('cannot link to a nonexistent foreign key in a relation', () => {
    class InvalidParent extends Entity {
      static id = 'parent'
      static fields = {
        children: this.hasMany('child', 'parentId')
      }
    }
    class InvalidChild extends Entity {
      static id = 'child'
      static fields = {
        parentId: 'not a foreign key'
      }
    }
    expect(() => normie(defineStore, [InvalidParent, InvalidChild])).toThrowError(InvalidForeignKeyError)
  })

  it('calls onCreate', () => {
    class E extends Entity {
      static id = 'e'
      static fields = {}
      static created = false
      static onCreate (instance) {
        this.created = true
      }
    }

    normie(defineStore, [E])
    E.create()
    expect(E.created).toBe(true)
  })

  it('calls onUpdate', () => {
    class E extends Entity {
      static id = 'e'
      static fields = { field: 'value' }
      static updated = false
      static onCreate (instance) {
        this.updated = true
      }
    }

    normie(defineStore, [E])
    const instance = E.create()
    instance.field = 'other value'
    expect(E.updated).toBe(true)
  })

  it('calls onDelete', () => {
    class E extends Entity {
      static id = 'e'
      static fields = {}
      static deleted = false
      static onDelete (instance) {
        this.deleted = true
      }
    }

    normie(defineStore, [E])
    const instance = E.create()
    instance.$delete()
    expect(E.deleted).toBe(true)
  })
})
