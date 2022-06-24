export default function (entity, foreignKeyField, foreignKey) {
  const { dataById, idsByForeignKey } = this[entity.id];
  idsByForeignKey[foreignKeyField][foreignKey]?.forEach?.((id) => {
    dataById[id][foreignKeyField] = null;
  });
  idsByForeignKey[foreignKeyField][foreignKey] = [];
}