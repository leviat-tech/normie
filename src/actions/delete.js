import _ from 'lodash';


export default function (entity, id) {
  entity.dependentRelations.forEach((relation) => {
    const { foreignKeyField, primaryEntity, deleteCascade } = relation;
    const { dataById, idsByForeignKey } = this[primaryEntity.id];
    // disassociate (or delete) all objects related to the deleted instance;
    idsByForeignKey[foreignKeyField][id]?.forEach?.((_id) => {
      if (deleteCascade) {
        this.delete(primaryEntity, _id);
      } else {
        dataById[_id][foreignKeyField] = null;
      }
    });
    // remove the foreign key index
    delete idsByForeignKey[foreignKeyField][id];
  });
  
  const { dataById, idsByForeignKey } = this[entity.id];
  const data = dataById[id];
  // remove this id from all foreign key indexes;
  entity.foreignKeyFields.forEach((foreignKeyField) => {
    _.remove(
      idsByForeignKey[foreignKeyField][data[foreignKeyField]],
      (_id) => _id === id
    );
  });
  delete dataById[id];
}