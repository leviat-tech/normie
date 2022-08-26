import { isPlainObject, chain } from 'lodash-es'
import Relation from './relation'
import BelongsTo from './belongs-to'
import { CreateError, UpdateError } from '../exceptions'

export default class HasMany extends Relation {
  get foreignKey () {
    return this.RelatedEntity.foreignKeysByFieldName[this.foreignKeyField]
  }

  get (instance) {
    const ids = this.RelatedEntity.idsByForeignKey[this.foreignKeyField][instance.id]
    return chain(this.RelatedEntity.dataById)
      .pick(ids)
      .values()
      .map(data => new this.RelatedEntity(data))
      .value()
  }

  onCreateWithRelated (data, related) {
    if (!Array.isArray(related) || related.find((_related) => !isPlainObject(_related))) {
      throw new CreateError(`hasMany relation "${this.fieldname}" must be an array of objects`)
    }
    related.forEach((_related) => {
      const foreignKey = _related[this.foreignKeyField]
      if (foreignKey) {
        throw new CreateError(`relation's ${this.foreignKeyField} must be empty; is set to ${foreignKey}`)
      }
      this.RelatedEntity.create({ ..._related, [this.foreignKeyField]: data.id })
    })
  }

  set (instance, value) {
    if (
      !Array.isArray(value) ||
      value.find((related) => !(related instanceof this.RelatedEntity))
    ) {
      throw new UpdateError(`${this.fieldname} requires an array of ${this.RelatedEntity.name}`)
    }
    const { onDeleteCascade } = this.foreignKey
    const existingIds = new Set(this.RelatedEntity.idsByForeignKey[this.foreignKeyField][instance.id])
    const newIds = new Set(value.map(({ id }) => id))

    existingIds.forEach((existingId) => {
      if (!newIds.has(existingId)) {
        if (onDeleteCascade) {
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
