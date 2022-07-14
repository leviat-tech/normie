import { reactive } from '@vue/reactivity'
import _ from 'lodash'
import fp from 'lodash/fp'
import { HasOne, HasMany, BelongsTo, ManyToMany } from '../relations'
import proxy from './proxy'
import serialize from './serialize'

export default class Entity {
  constructor (props) {
    this.data = reactive(props)
    return new Proxy(this, proxy)
  }

  static get store () {
    return this.useStore()
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
    const data = this.dataById[id]
    return data && new this(data)
  }

  static create (data = {}) {
    return this.store.create(this, data)
  }

  static read () {
    return _.values(this.dataById).map((data) => new this(data))
  }

  static update (id, patch) {
    return this.store.update(this, id, patch)
  }

  static delete (id) {
    return this.store.delete(this, id)
  }

  static whereForeignKey (foreignKeyField, foreignKey) {
    const idsByForeignKey = this.idsByForeignKey[foreignKeyField][foreignKey]
    return fp.flow(
      fp.pick(idsByForeignKey),
      fp.values(),
      fp.map(data => new this(data))
    )(this.dataById)
  }

  $update (patch) {
    return this.constructor.update(this.id, patch)
  }

  $delete () {
    return this.constructor.delete(this.id)
  }

  $toJSON (path = '', context = null) {
    return serialize(this, path, context)
  }

  // RELATION STUFF
  static foreignKey (RelatedEntity, opts = {}) {
    return { RelatedEntity, isForeignKey: true, ...opts }
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

  static manyToMany (RelatedEntity, PivotEntity, primaryForeignKeyField, relatedForeignKeyField) {
    return {
      PrimaryEntity: this,
      RelatedEntity,
      PivotEntity,
      primaryForeignKeyField,
      relatedForeignKeyField,
      RelationClass: ManyToMany
    }
  }
}
