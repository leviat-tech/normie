import _ from 'lodash'

export default function (Entity, id, patch) {
  if (patch.id) {
    throw new Error("cannot change an instance's id")
  }
  const data = Entity.dataById[id]
  if (!data) {
    throw new Error(`cannot set property; id ${id} does not exist in ${Entity.id}`)
  }
  Entity.foreignKeys.forEach(({ fieldname, required, RelatedEntity }) => {
    const prevForeignKey = data[fieldname]
    const newForeignKey = patch[fieldname]
    // if foreign key has changed
    if (newForeignKey !== undefined && prevForeignKey !== newForeignKey) {
      if (!RelatedEntity.dataById[newForeignKey] && required) {
        throw new Error(`${fieldname} of value ${newForeignKey} does not exist in ${RelatedEntity.id}`)
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
