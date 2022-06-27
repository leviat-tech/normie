import { beforeEach, describe, it, expect } from 'vitest'
import { defineStore, setActivePinia, createPinia } from 'pinia'
import { normie } from '../src/normie'
import Entity from '../src/entity'

class Parent extends Entity {
  static id = 'parent'
  static fields = {
    children: this.hasMany('child', 'parentId')
  }
}
class Child extends Entity {
  static id = 'child'
  static fields = {
    parentId: this.foreignKey('parent', { required: true }),
    parent: this.belongsTo('parent', 'parentId')
  }
}

describe('foreign key validations', () => {
  let parent
  let child
  beforeEach(() => {
    setActivePinia(createPinia())
    normie(defineStore, [Parent, Child])
    parent = Parent.create({ child: {} })
    child = Child.read()[0]
  })

  it('cascades deletion if a foreign key is required', () => {
    parent.$delete()
    expect(Child.read().length).toBe(0)
  })

  it('cannot assign a nonexistent id to a foreign key on create', () => {
    expect(() => Child.create({ parentId: 'uh oh' })).toThrowError()
  })

  it('cannot assign a nonexistent id to a foreign key on create', () => {
    expect(() => child.parentId = 'ahh!').toThrowError()
  })
})
