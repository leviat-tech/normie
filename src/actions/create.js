import _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'

export default function create (Entity, json) {
  const id = json.id || uuidv4()
  const relationFieldNames = Object.keys(Entity.relationsByFieldName)
  const nullForeignKeys = _.mapValues(Entity.foreignKeysByFieldName, () => null)
  const defaults = _.omit({ ...Entity.fields, ...nullForeignKeys }, relationFieldNames)

  const data = _.merge(defaults, { id, ...json })
  if (Entity.dataById[id]) {
    throw new Error(`id ${id} already exists in ${Entity.id}`)
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
  Entity.foreignKeys.forEach(({ fieldname, required, RelatedEntity }) => {
    const foreignKey = data[fieldname]
    if (foreignKey) {
      if (!RelatedEntity.dataById[foreignKey] && required) {
        throw new Error(`${fieldname} of value ${foreignKey} does not exist in ${RelatedEntity.id}`)
      }
      Entity.idsByForeignKey[fieldname][foreignKey] ??= []
      Entity.idsByForeignKey[fieldname][foreignKey].push(data.id)
    } else {
      if (required) {
        throw new Error(`foreign key ${fieldname} on ${Entity.id} is required`)
      }
    }
  })
  Entity.dataById[id] = data

  const instance = new Entity(data)
  Entity?.onCreate?.(instance)
  return instance
}
