import { reactive } from '@vue/reactivity'
import _ from 'lodash'
import HasOne from './relations/has-one'
import HasMany from './relations/has-many'
import BelongsTo from './relations/belongs-to'
import ManyToMany from './relations/many-to-many'

export default class Entity {
  constructor (props) {
    this.data = reactive(props)
    return new Proxy(this, {
      get (target, prop) {
        const EntityClass = target.constructor
        if (prop === 'constructor') {
          return Reflect.get(...arguments)
        }
        if (prop === '_data') {
          return target.data
        }
        const relation = EntityClass.relationsByFieldName[prop]
        if (relation?.get) {
          if (!EntityClass.dataById[target.data.id]) {
            throw new Error(`cannot set property; id ${target.data.id} does not exist in ${EntityClass.id}`)
          }
          return relation.get(target.data)
        }
        if (target.data[prop]) {
          return target.data[prop]
        }
        return Reflect.get(...arguments)
      },
      set (target, prop, value) {
        const EntityClass = target.constructor
        const relation = EntityClass.relationsByFieldName[prop]
        if (relation) {
          if (!EntityClass.dataById[target.data.id]) {
            throw new Error(`cannot set property; id ${target.data.id} does not exist in ${EntityClass.id}`)
          }
          relation.set(target.data, value)
          return true
        }
        if (!EntityClass.fields[prop] === undefined) {
          console.warn(`warning: property ${prop} not defined in ${EntityClass.id} fields`)
        }
        EntityClass.update(target.data.id, { [prop]: value })
        return true
      }
    })
  }

  static setStore (store) {
    this.store = store
  }

  static initialize () {
    this.relations = []
    this.dependentBelongsToRelations = []
    this.foreignKeys = []
  }

  static addBelongsToRelation (relations, relation) {
    // HasOne, HasMany etc create BelongsTo relations so there may be some duplicates
    // prioritize BelongsTo with fieldname
    const identicalBelongsTo = relations.find((_relation) => (_relation instanceof BelongsTo) &&
      _relation.PrimaryEntity.id === relation.PrimaryEntity.id &&
      _relation.RelatedEntity.id === relation.RelatedEntity.id &&
      _relation.foreignKeyField === relation.foreignKeyField)
    if (!identicalBelongsTo) {
      relations.push(relation)
    } else {
      if (relation.fieldname) {
        identicalBelongsTo.fieldname = relation.fieldname
      }
    }
  }

  static addRelation (relation) {
    if (relation instanceof BelongsTo) {
      this.addBelongsToRelation(this.relations, relation)
      relation.RelatedEntity.addDependentBelongsToRelation(relation)
    } else {
      this.relations.push(relation)
    }
  }

  static addDependentBelongsToRelation (belongsTo) {
    this.addBelongsToRelation(this.dependentBelongsToRelations, belongsTo)
  }

  static addForeignKey (foreignKey) {
    this.foreignKeys.push(foreignKey)
  }

  static get relationsByFieldName () {
    return _.mapValues(_.groupBy(this.relations, 'fieldname'), _.first)
  }

  static get foreignKeysByFieldName () {
    return _.mapValues(_.groupBy(this.foreignKeys, 'fieldname'), _.first)
  }

  static get dataById () {
    return this.store[this.id].dataById
  }

  static get idsByForeignKey () {
    return this.store[this.id].idsByForeignKey
  }

  static find (id) {
    return this(this.dataById[id])
  }

  static create (data = {}) {
    return this.store.create(this, data)
  }

  static read () {
    return Object.values(this.dataById).map((data) => new this(data))
  }

  static update (id, patch) {
    return this.store.update(this, id, patch)
  }

  static delete (id) {
    return this.store.delete(this, id)
  }

  static clearForeignKeyIndex (foreignKeyField, foreignKey) {
    return this.store.clearForeignKeyIndex(this, foreignKeyField, foreignKey)
  }

  $update (patch) {
    return this.constructor.update(this.id, patch)
  }

  $delete () {
    return this.constructor.delete(this.id)
  }

  $toJSON (path = '', context = null) {
    const serialize = (instance, path) => {
      if (!instance) return null
      const { relationsByFieldName, id: entityId, format } = instance.constructor
      const addRelationToJSON = (json, path) => {
        const periodIndex = path.indexOf('.')
        let childFieldName
        let remainingPath

        if (periodIndex === -1) {
          childFieldName = path
          remainingPath = null
        } else {
          childFieldName = path.slice(0, periodIndex)
          remainingPath = path.slice(periodIndex + 1)
        }

        if (!relationsByFieldName[childFieldName]) {
          throw new Error(`relation ${childFieldName} does not exist on ${entityId}`)
        }

        const child = instance[childFieldName]
        const childJSON = Array.isArray(child)
          ? child.map((_child) => serialize(_child, remainingPath))
          : serialize(child, remainingPath)

        return { ...json, [childFieldName]: childJSON }
      }

      const serialized = format?.(instance._data, context) || instance._data

      if (serialized && !_.isPlainObject(serialized)) {
        throw new Error(`custom serializer of ${entityId} must return an object`)
      }

      if (!path || !serialized) return serialized
      if (path.startsWith('[')) {
        return path.slice(1, -1).split(',')
          .map((str) => str.replaceAll(' ', ''))
          .reduce(addRelationToJSON, serialized)
      }
      if (path === '*') {
        return Object.keys(relationsByFieldName).reduce(addRelationToJSON, serialized)
      }
      return addRelationToJSON(serialized, path)
    }
    return serialize(this, path)
  }

  // RELATION STUFF
  static foreignKey (RelatedEntity, opts = {}) {
    return { RelatedEntity, required: opts.required, isForeignKey: true }
  }

  static belongsTo (RelatedEntity, foreignKeyField) {
    return {
      PrimaryEntity: this,
      RelatedEntity,
      foreignKeyField,
      RelationClass: BelongsTo
    }
  }

  static hasOne (RelatedEntity, foreignKeyField) {
    return {
      PrimaryEntity: this,
      RelatedEntity,
      foreignKeyField,
      RelationClass: HasOne
    }
  }

  static hasMany (RelatedEntity, foreignKeyField) {
    return {
      PrimaryEntity: this,
      RelatedEntity,
      foreignKeyField,
      RelationClass: HasMany
    }
  }

  static manyToMany (RelatedEntity, pivotEntity, primaryForeignKeyField, relatedForeignKeyField) {
    return {
      PrimaryEntity: this,
      RelatedEntity,
      pivotEntity,
      primaryForeignKeyField,
      relatedForeignKeyField,
      RelationClass: ManyToMany
    }
  }
}
