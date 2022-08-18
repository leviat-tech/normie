import { pick, values } from 'lodash-es'
import Relation from './relation'
import BelongsTo from './belongs-to'

export default class ManyToMany extends Relation {
  get (instance) {
    const pivotDataById = this.PivotEntity.dataById
    const pivotIdsByForeignKey = this.PivotEntity.idsByForeignKey
    const pivotIds = pivotIdsByForeignKey[this.primaryForeignKeyField][instance.id]
    const pivotData = pick(pivotDataById, pivotIds)
    const relatedIds = values(pivotData).map((data) => data[this.relatedForeignKeyField])
    const relatedData = pick(this.RelatedEntity.dataById, relatedIds)
    return values(relatedData).map((data) => new this.RelatedEntity(data))
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
