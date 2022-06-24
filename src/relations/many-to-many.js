import _ from "lodash";
import Relation from "./relation";
import BelongsTo from "./belongs-to";


export default class ManyToMany extends Relation {
  get(instance) {
    const pivotDataById = this.pivotEntity.dataById;
    const pivotIdsByForeignKey = this.pivotEntity.idsByForeignKey;
    const pivotIds = pivotIdsByForeignKey[this.primaryForeignKeyField][instance.id];
    const pivotData = _.pick(pivotDataById, pivotIds);
    const relatedIds = _.values(pivotData).map((data) => data[this.relatedForeignKeyField]);
    const relatedData = _.pick(this.relatedEntity.dataById, relatedIds);
    return _.values(relatedData).map(data => new this.relatedEntity(data));
  }
  expand() {
    return [
      new BelongsTo({
        primaryEntity: this.pivotEntity,
        relatedEntity: this.primaryEntity,
        foreignKeyField: this.primaryForeignKeyField,
        deleteCascade: this.deletePivot,
      }),
      new BelongsTo({
        primaryEntity: this.pivotEntity,
        relatedEntity: this.relatedEntity,
        foreignKeyField: this.relatedForeignKeyField,
        deleteCascade: this.deletePivot,
      }),
    ];
  }
};