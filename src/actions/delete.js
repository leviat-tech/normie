import { remove } from 'lodash-es'

export default function (Entity, id) {
  Entity.dependentBelongsToRelations.forEach((belongsTo) => {
    const { foreignKeyField, PrimaryEntity } = belongsTo
    // disassociate (or delete) all objects related to the deleted instance;
    PrimaryEntity.idsByForeignKey[foreignKeyField][id]?.forEach?.((_id) => {
      if (belongsTo.foreignKey.onDeleteCascade) {
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
  delete Entity.dataById[id]
  const instance = new Entity(data)
  Entity?.onDelete?.(instance)
}
