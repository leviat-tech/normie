import _ from 'lodash';


export default function (entity, id, patch) {
  if (patch.id) {
    throw "cannot change an instance's id";
  }
  const { dataById, idsByForeignKey } = this[entity.id];
  const data = dataById[id];
  entity.foreignKeyFields.forEach((foreignKeyField) => {
    const prevForeignKey = data[foreignKeyField];
    const newForeignKey = patch[foreignKeyField];
    // if foreign key has changed
    if (newForeignKey !== undefined && prevForeignKey !== newForeignKey) {
      // disassociate from the old foreign key
      _.remove(
        idsByForeignKey[foreignKeyField][prevForeignKey],
        (_id) => _id === id
      );
      if (newForeignKey) {
        idsByForeignKey[foreignKeyField][newForeignKey] ??= [];
        idsByForeignKey[foreignKeyField][newForeignKey].push(id);
      }
    }
  });

  const relationFieldNames = _.keys(entity.relationsByFieldName);
  _.merge(data, _.omit(patch, relationFieldNames));
}