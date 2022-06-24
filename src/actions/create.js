import _ from 'lodash';
import fp from 'lodash/fp';
import { v4 as uuidv4 } from 'uuid';


export default function (entity, json) {
  if (json.id) {
    throw "cannot create an instance with a manually set id";
  }
  const id = uuidv4();
  const relationFieldNames = _.keys(entity.relationsByFieldName);
  const data = fp.flow(
    fp.merge(entity.fields), // merge in defaults;
    fp.omit(relationFieldNames),
  )({ id, ...json });

  _.entries(entity.relationsByFieldName).forEach(([fieldname, relation]) => {
    const related = json[fieldname];
    if (related) {
      // if relations are passed in, create them separately
      relation.onCreateWithRelated(data, related);
    }
  });
  const { dataById, idsByForeignKey } = this[entity.id];
  entity.foreignKeyFields.forEach((foreignKeyField) => {
    const foreignKey = data[foreignKeyField];
    if (foreignKey) {
      idsByForeignKey[foreignKeyField][foreignKey] ??= [];
      // for every foreign key field the created in
      idsByForeignKey[foreignKeyField][foreignKey].push(data.id);
    }
  });
  dataById[id] = data;
  return new entity(data);
}