import { remove } from 'lodash-es'

export default function (Entity, id) {
  Entity.dependentBelongsToRelations.forEach((belongsTo) => {
    const { foreignKey, foreignKeyField, PrimaryEntity } = belongsTo

    // Create a clone of the ids array to prevent the array from mutation during the iteration
    const idsToDelete = PrimaryEntity.idsByForeignKey[foreignKeyField][id]?.map(_id => _id)

    // disassociate (or delete) all objects related to the deleted instance;
    idsToDelete?.forEach?.((_id) => {
      if (foreignKey.onDeleteCascade) {
        this.delete(PrimaryEntity, _id)
      } else {
        PrimaryEntity.dataById[_id][foreignKeyField] = null
      }
    })
    // remove the foreign key index
    delete PrimaryEntity.idsByForeignKey[foreignKeyField][id]
  })

  const data = Entity.dataById[id]
  // remove this id from all foreign key indexes;
  Entity.foreignKeys.forEach(({ fieldname }) => {
    remove(
      Entity.idsByForeignKey[fieldname][data[fieldname]],
      (_id) => _id === id
    )
  })
  const instance = new Entity(data)
  Entity.beforeAll?.('delete', data)
  Entity.beforeDelete?.(instance)
  delete Entity.dataById[id]
  Entity.afterAll?.('delete', data)
  Entity.afterDelete?.(instance)
}
