import { beforeEach, describe, it, expect } from 'vitest'
import { defineStore, setActivePinia, createPinia } from 'pinia'
import normie from '../src/normie'
import Entity from '../src/entity'
import { InvalidEntityError, InvalidForeignKeyError } from '../src/exceptions'

describe('entities', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('can query', () => {
    class E extends Entity {
      static id = 'e'
      static fields = {}
    }
    normie(defineStore, [E])

    E.create({ id: 1 })
    E.create({ id: 2 })

    expect(E.find(1).id).toBe(1)
    expect(E.read().length).toBe(2)
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
    class ForeignKey extends Entity {
      static id = 'ForeignKey'
      static fields = {
        zoneId: this.foreignKey('zones')
      }
    }
    expect(() => normie(defineStore, [ForeignKey])).toThrowError(InvalidEntityError)
  })

  it('cannot link to a nonexistent entity in a relation', () => {
    class Parent extends Entity {
      static id = 'parent'
      static fields = {
        children: this.hasMany('child', 'parentId')
      }
    }
    expect(() => normie(defineStore, [Parent])).toThrowError(InvalidEntityError)
  })

  it('cannot link to a nonexistent foreign key in a relation', () => {
    class Parent extends Entity {
      static id = 'parent'
      static fields = {
        children: this.hasMany('child', 'parentId')
      }
    }
    class Child extends Entity {
      static id = 'child'
      static fields = {
        parentId: 'not a foreign key'
      }
    }
    expect(() => normie(defineStore, [Parent, Child])).toThrowError(InvalidForeignKeyError)
  })

  it('calls beforeCreate', () => {
    class E extends Entity {
      static id = 'e'
      static fields = {
        getSiblings: () => this.read()
      }

      static created = false
      static beforeCreate (instance) {
        expect(instance.getSiblings()).toHaveLength(0)
        this.created = true
      }
    }

    normie(defineStore, [E])
    E.create()
    expect(E.created).toBe(true)
  })

  it('calls afterCreate', () => {
    class E extends Entity {
      static id = 'e'
      static fields = {
        getSiblings: () => this.read()
      }

      static created = false
      static afterCreate (instance) {
        expect(instance.getSiblings()).toHaveLength(1);
        this.created = true
      }
    }

    normie(defineStore, [E])
    E.create()
    expect(E.created).toBe(true)
  })

  it('calls beforeUpdate', () => {
    class E extends Entity {
      static id = 'e'
      static fields = { field: 'value', updated: false }
      static beforeUpdate (data) {
        return { ...data, updated: true }
      }
    }

    normie(defineStore, [E])
    const instance = E.create()
    instance.field = 'other value'
    expect(instance.field).toBe('other value')
    expect(instance.updated).toBe(true)
  })

  it('calls afterUpdate', () => {
    class E extends Entity {
      static id = 'e'
      static updated = false
      static fields = { field: 'value', updated: false }
      static afterUpdate (instance) {
        this.updated = true
      }
    }

    normie(defineStore, [E])
    const instance = E.create()
    instance.field = 'other value'
    expect(instance.field).toBe('other value')
    expect(E.updated).toBe(true)
  })

  it('calls beforeDelete', () => {
    class E extends Entity {
      static id = 'e'
      static fields = {
        getSiblings: () => this.read()
      }
      static deleted = false
      static beforeDelete (instance) {
        expect(instance.getSiblings()).toHaveLength(1)
        this.deleted = true
      }
    }

    normie(defineStore, [E])
    const instance = E.create()
    instance.$delete()
    expect(E.deleted).toBe(true)
  })

  it('calls afterDelete', () => {
    class E extends Entity {
      static id = 'e'
      static fields = {
        getSiblings: () => this.read()
      }
      static deleted = false
      static afterDelete (instance) {
        expect(instance.getSiblings()).toHaveLength(0)
        this.deleted = true
      }
    }

    normie(defineStore, [E])
    const instance = E.create()
    instance.$delete()
    expect(E.deleted).toBe(true)
  })
})
