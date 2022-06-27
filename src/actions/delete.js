import _ from 'lodash'

export default function (Entity, id) {
  Entity.dependentBelongsToRelations.forEach((relation) => {
    const { foreignKeyField, PrimaryEntity } = relation
    // disassociate (or delete) all objects related to the deleted instance;
    PrimaryEntity.idsByForeignKey[foreignKeyField][id]?.forEach?.((_id) => {
      if (relation.foreignKey.required) {
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
  Object.values(Entity.foreignKeysByFieldName)
    .forEach(({ fieldname }) => {
      _.remove(
        Entity.idsByForeignKey[fieldname][data[fieldname]],
        (_id) => _id === id
      )
    })
  delete Entity.dataById[id]
  const instance = new Entity(data)
  Entity?.onDelete?.(instance)
}
