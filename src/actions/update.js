import { keys, remove, mergeWith, omit, isArray } from 'lodash-es';
import { UpdateError, DoesNotExistError } from '../exceptions';

export default function (Entity, id, patch, merge = true) {
  const previousPatchValues = {};
  keys(patch).forEach((key) => {
    if (
      Entity.fields[key] === undefined &&
      Entity.foreignKeysByFieldName[key] === undefined &&
      key !== 'id'
    ) {
      console.warn(`field ${key} not defined in ${Entity.id}`);
    } else if (!patch.id) {
      previousPatchValues[key] = { ...Entity.dataById[id][key] };
    }
  });
  if (patch.id) {
    throw new UpdateError("cannot change an instance's id");
  }
  const data = Entity.dataById[id];
  if (!data) {
    throw new DoesNotExistError(
      `cannot set property; id ${id} does not exist in ${Entity.id}`
    );
  }
  Entity.foreignKeys.forEach(
    ({ fieldname, onDeleteCascade, RelatedEntity }) => {
      const prevForeignKey = data[fieldname];
      const newForeignKey = patch[fieldname];
      // if foreign key has changed
      if (newForeignKey !== undefined && prevForeignKey !== newForeignKey) {
        if (!RelatedEntity.dataById[newForeignKey] && onDeleteCascade) {
          throw new DoesNotExistError(
            `${fieldname} of value ${newForeignKey} does not exist in ${RelatedEntity.id}`
          );
        }
        // disassociate from the old foreign key
        remove(
          Entity.idsByForeignKey[fieldname][prevForeignKey],
          (_id) => _id === id
        );
        if (newForeignKey) {
          Entity.idsByForeignKey[fieldname][newForeignKey] ??= [];
          Entity.idsByForeignKey[fieldname][newForeignKey].push(id);
        }
      }
    }
  );

  const relationFieldNames = keys(Entity.relationsByFieldName);

  Entity.beforeAll?.('update', data)

  const modifiedData =
    Entity.beforeUpdate?.(patch, id, previousPatchValues) || patch;

  function customizer (objValue, srcValue) {
    if (isArray(srcValue) || !merge) return srcValue
  }
  mergeWith(data, modifiedData, omit(patch, relationFieldNames), customizer);
  const instance = new Entity(data);
  Entity.afterUpdate?.(instance);
  Entity.afterAll?.('update', instance.data);
  return instance;
}
