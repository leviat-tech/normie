import _ from 'lodash'
import fp from 'lodash/fp'
import Relation from './relation'
import BelongsTo from './belongs-to'

export default class HasMany extends Relation {
  get foreignKey () {
    return this.RelatedEntity.foreignKeysByFieldName[this.foreignKeyField]
  }

  get (instance) {
    const ids = this.RelatedEntity.idsByForeignKey[this.foreignKeyField][instance.id]
    return fp.flow(
      fp.pick(ids),
      fp.values(),
      fp.map((data) => new this.RelatedEntity(data))
    )(this.RelatedEntity.dataById)
  }

  onCreateWithRelated (data, related) {
    if (!Array.isArray(related) || related.find((_related) => !_.isPlainObject(_related))) {
      throw new Error(`hasMany relation "${this.fieldname}" must be an array of objects`)
    }
    related.forEach((_related) => {
      const foreignKey = _related[this.foreignKeyField]
      if (foreignKey) {
        throw new Error(`relation's ${this.foreignKeyField} must be empty; is set to ${foreignKey}`)
      }
      this.RelatedEntity.create({ ..._related, [this.foreignKeyField]: data.id })
    })
  }

  set (instance, value) {
    if (
      !Array.isArray(value) ||
      value.find((related) => !(related instanceof this.RelatedEntity))
    ) {
      throw new Error(`${this.fieldname} requires an array of ${this.RelatedEntity.id}`)
    }
    const { required } = this.foreignKey
    const existingIds = new Set(this.RelatedEntity.idsByForeignKey[this.foreignKeyField][instance.id])
    const newIds = new Set(value.map(({ id }) => id))

    existingIds.forEach((existingId) => {
      if (!newIds.has(existingId)) {
        if (required) {
          this.RelatedEntity.delete(existingId)
        } else {
          this.RelatedEntity.update(existingId, { [this.foreignKeyField]: null })
        }
      }
    })

    newIds.forEach((newId) => {
      if (!existingIds.has(newId)) {
        this.RelatedEntity.update(newId, { [this.foreignKeyField]: instance.id })
      }
    })
  }

  expand () {
    return [
      new BelongsTo({
        PrimaryEntity: this.RelatedEntity,
        RelatedEntity: this.PrimaryEntity,
        foreignKeyField: this.foreignKeyField
      })
    ]
  }
}
