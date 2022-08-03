import _ from 'lodash'
import { UpdateError, DoesNotExistError } from '../exceptions'

export default function (Entity, id, patch) {
  _.keys(patch).forEach(key => {
    if (Entity.fields[key] === undefined && Entity.foreignKeysByFieldName[key] === undefined && key !== 'id') {
      console.warn(`field ${key} not defined in ${Entity.id}`)
    }
  })
  if (patch.id) {
    throw new UpdateError("cannot change an instance's id")
  }
  const data = Entity.dataById[id]
  if (!data) {
    throw new DoesNotExistError(`cannot set property; id ${id} does not exist in ${Entity.id}`)
  }
  Entity.foreignKeys.forEach(({ fieldname, onDeleteCascade, RelatedEntity }) => {
    const prevForeignKey = data[fieldname]
    const newForeignKey = patch[fieldname]
    // if foreign key has changed
    if (newForeignKey !== undefined && prevForeignKey !== newForeignKey) {
      if (!RelatedEntity.dataById[newForeignKey] && onDeleteCascade) {
        throw new DoesNotExistError(`${fieldname} of value ${newForeignKey} does not exist in ${RelatedEntity.id}`)
      }
      // disassociate from the old foreign key
      _.remove(
        Entity.idsByForeignKey[fieldname][prevForeignKey],
        (_id) => _id === id
      )
      if (newForeignKey) {
        Entity.idsByForeignKey[fieldname][newForeignKey] ??= []
        Entity.idsByForeignKey[fieldname][newForeignKey].push(id)
      }
    }
  })

  const relationFieldNames = _.keys(Entity.relationsByFieldName)
  const newData = _.merge(data, _.omit(patch, relationFieldNames))
  const instance = new Entity(newData)
  Entity?.onUpdate?.(instance)
  return instance
}