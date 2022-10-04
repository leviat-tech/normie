import { beforeEach, describe, it, expect } from 'vitest'
import { defineStore, setActivePinia, createPinia } from 'pinia'
import normie from '../src/normie'
import Entity from '../src/entity'
import { DoesNotExistError } from '../src/exceptions'

class Parent extends Entity {
  static id = 'parent'
  static fields = {
    children: this.hasMany('child', 'parentId')
  }
}
class Child extends Entity {
  static id = 'child'
  static fields = {
    parent: this.belongsTo(Parent, 'parentId', { onDeleteCascade: true })
  }
}

class Layer extends Entity {
  static id = 'layer'

  static get fields () {
    return {
      ...this.baseFields,
      name: 'Project Layer',
      parent: this.belongsTo(Layer, 'parentId', { onDeleteCascade: true }),
      layers: this.hasMany(Layer, 'parentId')
    }
  }
}

describe('foreign key validations', () => {
  let parent
  let child
  beforeEach(() => {
    setActivePinia(createPinia())
    normie(defineStore, [Parent, Child, Layer])
    parent = Parent.create({ children: [{}] })
    child = Child.read()[0]
  })

  it('cascades deletion if a foreign key is onDeleteCascade', () => {
    parent.$delete()
    expect(Child.read().length).toBe(0)

    const layer1 = Layer.create({})
    const layer2 = Layer.create({ parentId: layer1.id })
    layer1.$delete()
    expect(Layer.find(layer2.id)).toBe(undefined)
  })

  it('cannot assign a nonexistent id to a foreign key on create', () => {
    expect(() => Child.create({ parentId: 'uh oh' })).toThrowError(DoesNotExistError)
  })

  it('cannot assign a nonexistent id to a foreign key on update', () => {
    expect(() => child.parentId = 'ahh!').toThrowError(DoesNotExistError)
  })
})
