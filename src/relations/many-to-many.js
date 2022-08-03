import _ from 'lodash'
import Relation from './relation'
import BelongsTo from './belongs-to'

export default class ManyToMany extends Relation {
  get (instance) {
    const pivotDataById = this.PivotEntity.dataById
    const pivotIdsByForeignKey = this.PivotEntity.idsByForeignKey
    const pivotIds = pivotIdsByForeignKey[this.primaryForeignKeyField][instance.id]
    const pivotData = _.pick(pivotDataById, pivotIds)
    const relatedIds = _.values(pivotData).map((data) => data[this.relatedForeignKeyField])
    const relatedData = _.pick(this.RelatedEntity.dataById, relatedIds)
    return _.values(relatedData).map((data) => new this.RelatedEntity(data))
  }

  expand () {
    return [
      new BelongsTo({
        PrimaryEntity: this.PivotEntity,
        RelatedEntity: this.PrimaryEntity,
        foreignKeyField: this.primaryForeignKeyField
      }),
      new BelongsTo({
        PrimaryEntity: this.PivotEntity,
        RelatedEntity: this.RelatedEntity,
        foreignKeyField: this.relatedForeignKeyField
      })
    ]
  }
}