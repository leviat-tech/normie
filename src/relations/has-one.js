import _ from "lodash";
import Relation from "./relation";
import BelongsTo from "./belongs-to";


export default class HasOne extends Relation {
  get(instance) {
    const id =
      this.relatedEntity.idsByForeignKey[this.foreignKeyField]?.[instance.id]?.[0];
    if (!id) return; 
    const data = this.relatedEntity.dataById[id];
    return new this.relatedEntity(data);
  }
  onCreateWithRelated(data, related) {
    const foreignKey = related[this.foreignKeyField]
    if (foreignKey) {
      throw `relation's ${this.foreignKeyField} must be empty; is set to ${foreignKey}`;
    }
    if (!_.isPlainObject(related)) {
      throw `hasOne relation "${this.fieldname}" must be an object`;
    }
    this.relatedEntity.create({ ...related, [this.foreignKeyField]: data.id });
  }
  set(instance, value) {
    if (!(value instanceof this.relatedEntity) && value !== null) {
      throw `must set ${this.fieldname} to instance of ${this.relatedEntity.id}`;
    }
    this.relatedEntity.clearForeignKeyIndex(
      this.foreignKeyField,
      instance.id,
    );
    if (value) {
      this.relatedEntity.update(value.id, {
        [this.foreignKeyField]: instance.id,
      });
    }
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