import _ from 'lodash'
import Relation from './relation'
import { InvalidForeignKeyError, CreateError, UpdateError } from '../exceptions'

export default class BelongsTo extends Relation {
  constructor (props) {
    super(props)
    if (!this.PrimaryEntity.foreignKeysByFieldName[this.foreignKeyField]) {
      throw new InvalidForeignKeyError(`${this.foreignKeyField} is not a foreign key on ${this.PrimaryEntity.name}`)
    }
  }

  get foreignKey () {
    return this.PrimaryEntity.foreignKeysByFieldName[this.foreignKeyField]
  }

  // called when relation.fieldname is called as a getter by instance;
  get (instance) {
    const foreignKey = instance[this.foreignKeyField]
    if (!foreignKey) return null
    const data = this.RelatedEntity.dataById[foreignKey]
    return new this.RelatedEntity(data)
  }

  // called when an instance of PrimaryEntity is being created with a relation
  onCreateWithRelated (data, related) {
    if (data[this.foreignKeyField]) {
      throw new CreateError(`cannot create relation when data has existing foreign key ${this.foreignKeyField}`)
    }
    if (!_.isPlainObject(related)) {
      throw new CreateError(`belongsTo relation "${this.fieldname}" must be an object`)
    }
    const { id } = this.RelatedEntity.create(related)
    data[this.foreignKeyField] = id
  }

  // called when relation.fieldname is called as a setter by instance;
  set (instance, value) {
    if (!(value instanceof this.RelatedEntity) && value !== null) {
      throw new UpdateError(`must set ${this.fieldname} to instance of ${this.RelatedEntity.name}`)
    }
    this.PrimaryEntity.update(instance.id, {
      [this.foreignKeyField]: value?.id || null
    })
  }
}
