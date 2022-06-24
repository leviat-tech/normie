import _ from "lodash";
import fp from "lodash/fp";
import Relation from "./relation";
import BelongsTo from "./belongs-to";


export default class HasMany extends Relation {
  get(instance) {
    const ids =
      this.relatedEntity.idsByForeignKey[this.foreignKeyField][instance.id];
    return fp.flow(
      fp.pick(ids),
      fp.values(),
      fp.map(data => new this.relatedEntity(data)),
    )(this.relatedEntity.dataById);
  }
  onCreateWithRelated(data, related) {
    if (!Array.isArray(related) || related.find(_related => !_.isPlainObject(_related))) {
      throw `hasMany relation "${this.fieldname}" must be an array of objects`;
    } 
    related.forEach((_related) => {
      const foreignKey = _related[this.foreignKeyField];
      if (foreignKey) {
        throw `relation's ${this.foreignKeyField} must be empty; is set to ${foreignKey}`;
      }
      this.relatedEntity.create({
        ..._related,
        [this.foreignKeyField]: data.id,
      });
    });
  }
  set(instance, value) {
    this.relatedEntity.clearForeignKeyIndex(
      this.foreignKeyField,
      instance.id
    );
    if (
      !Array.isArray(value)
      || value.find(related => !(related instanceof this.relatedEntity))
    ) {
      throw `${this.relatedEntity.fieldname} requires an array of ${this.relatedEntity.id} instances`;
    }
    value.forEach((related) => {
      this.relatedEntity.update(related.id, {
        [this.foreignKeyField]: instance.id,
      });
    });
  }
  expand() {
    return [
      new BelongsTo({
        primaryEntity: this.relatedEntity,
        relatedEntity: this.primaryEntity,
        deleteCascade: this.deleteCascade,
        foreignKeyField: this.foreignKeyField,
      }),
    ];
  }
}