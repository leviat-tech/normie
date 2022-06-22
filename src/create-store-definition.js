import _ from "lodash";
import fp from 'lodash/fp';
import { v4 as uuidv4 } from 'uuid';
import { BelongsTo } from "./relation";

export default function (entities) {
  const getInitialEntityState = (entity) => ({
    dataById: {},
    idsByForeignKey: entity.foreignKeyFields.reduce(
      (acc, field) => ({ ...acc, [field]: {} }),
      {}
    ),
  });

  const initialState = entities.reduce(
    (acc, entity) => ({ ...acc, [entity.id]: getInitialEntityState(entity) }),
    {}
  );

  return {
    state: () => initialState,
    actions: {
      create(entity, json) {
        if (json.id) {
          throw "cannot create an instance with a manually set id";
        }
        const id = uuidv4();
        const relationFieldNames = entity.relations.map(
          (relation) => relation.fieldname
        );
        const data = fp.flow(
          fp.merge(entity.fields), // merge in defaults;
          fp.omit(relationFieldNames),
        )({ id, ...json });

        entity.relations.forEach((relation) => {
          const related = json[relation.fieldname];
          if (related) {
            // if relations are passed in, create them separately
            relation.onCreate(data, related);
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
      },
      update(entity, id, patch) {
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

        const relationFieldNames = entity.relations.map(
          (relation) => relation.fieldname
        );
        _.merge(data, _.omit(patch, relationFieldNames));
      },
      delete(entity, id) {
        entity.inverseRelations
          .filter((relation) => relation instanceof BelongsTo)
          .forEach((relation) => {
            const { deleteCascade, foreignKeyField, primaryEntity } = relation;
            const { dataById, idsByForeignKey } = this[primaryEntity.id];
            // disassociate (or delete) all objects related to the deleted instance;
            idsByForeignKey[foreignKeyField][id]?.forEach?.((_id) => {
              if (deleteCascade) {
                delete dataById[_id];
              } else {
                dataById[_id][foreignKeyField] = null;
              }
            });
            // remove the foreign key index
            delete idsByForeignKey[foreignKeyField][id];
          });
        
        const { dataById, idsByForeignKey } = this[entity.id];
        const data = dataById[id];
        entity.foreignKeyFields.forEach((foreignKeyField) => {
          _.remove(
            idsByForeignKey[foreignKeyField][data[foreignKeyField]],
            (_id) => _id === id
          );
        });
        delete dataById[id];
      },
      resetForeignKey(entity, foreignKeyField, foreignKey) {
        const { dataById, idsByForeignKey } = this[entity.id];
        idsByForeignKey[foreignKeyField][foreignKey]?.forEach?.((id) => {
          dataById[id][foreignKeyField] = null;
        });
        idsByForeignKey[foreignKeyField][foreignKey] = [];
      },
    },
  };
}
