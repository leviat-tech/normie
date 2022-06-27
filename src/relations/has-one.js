import _ from 'lodash'
import Relation from './relation'
import BelongsTo from './belongs-to'

export default class HasOne extends Relation {
  get foreignKey () {
    return this.RelatedEntity.foreignKeysByFieldName[this.foreignKeyField]
  }

  get (instance) {
    const id = this.RelatedEntity.idsByForeignKey[this.foreignKeyField]?.[instance.id]?.[0]
    if (!id) return null
    const data = this.RelatedEntity.dataById[id]
    return new this.RelatedEntity(data)
  }

  onCreateWithRelated (data, related) {
    const foreignKey = related[this.foreignKeyField]
    if (foreignKey) {
      throw new Error(`relation's ${this.foreignKeyField} must be empty; is set to ${foreignKey}`)
    }
    if (!_.isPlainObject(related)) {
      throw new Error(`hasOne relation "${this.fieldname}" must be an object`)
    }
    this.RelatedEntity.create({ ...related, [this.foreignKeyField]: data.id })
  }

  set (instance, value) {
    if (!(value instanceof this.RelatedEntity) && value !== null) {
      throw new Error(`must set ${this.fieldname} to instance of ${this.RelatedEntity.id}`)
    }
    const { required } = this.foreignKey
    const existingId = this.RelatedEntity.idsByForeignKey[this.foreignKeyField][instance.id]?.[0]

    if (existingId && existingId !== value?.id) {
      if (required) {
        this.RelatedEntity.delete(existingId)
      } else {
        this.RelatedEntity.update(existingId, { [this.foreignKeyField]: null })
      }
    }

    if (value && value.id !== existingId) {
      this.RelatedEntity.update(value.id, {
        [this.foreignKeyField]: instance.id
      })
    }
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
