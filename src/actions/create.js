import _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import { CreateError, DoesNotExistError } from '../exceptions'

export default function create (Entity, json) {
  _.keys(json).forEach(key => {
    if (Entity.fields[key] === undefined && Entity.foreignKeysByFieldName[key] === undefined && key !== 'id') {
      console.warn(`field ${key} not defined in ${Entity.id}`)
    }
  })
  const id = json.id || uuidv4()
  const relationFieldNames = Object.keys(Entity.relationsByFieldName)
  const nullForeignKeys = _.mapValues(Entity.foreignKeysByFieldName, () => null)
  const defaults = _.omit({ ...Entity.fields, ...nullForeignKeys }, relationFieldNames)

  const data = _.merge(defaults, { id, ...json })
  if (Entity.dataById[id]) {
    throw new CreateError(`id ${id} already exists in ${Entity.id}`)
  }
  // putting data in the store before relations are created will prevent validation errors
  Entity.dataById[id] = data

  _.entries(Entity.relationsByFieldName).forEach(([fieldname, relation]) => {
    const related = json[fieldname]
    if (related) {
      // if relations are passed in, create them separately
      relation.onCreateWithRelated(data, related)
    }
  })
  Entity.foreignKeys.forEach(({ fieldname, RelatedEntity }) => {
    const foreignKey = data[fieldname]
    if (foreignKey) {
      if (!RelatedEntity.dataById[foreignKey]) {
        throw new DoesNotExistError(`${fieldname} of value ${foreignKey} does not exist in ${RelatedEntity.id}`)
      }
      Entity.idsByForeignKey[fieldname][foreignKey] ??= []
      Entity.idsByForeignKey[fieldname][foreignKey].push(data.id)
    }
  })
  Entity.dataById[id] = data

  const instance = new Entity(data)
  Entity?.onCreate?.(instance)
  return instance
}