import _ from "lodash";
import Relation from "./relation";


export default class BelongsTo extends Relation {
  constructor(props) {
    super(props);
    if (this.primaryEntity.fields[this.foreignKeyField] === undefined) {
      throw `"${this.foreignKeyField}" referenced as foreign key does not exist`
    }
  }
  // called when relation.fieldname is called as a getter by instance;
  get(instance) {
    const foreignKey = instance[this.foreignKeyField];
    if (!foreignKey) return;
    const data = this.relatedEntity.dataById[foreignKey];
    return new this.relatedEntity(data);
  }
  // called when an instance of primaryEntity is being created with a relation
  onCreateWithRelated(data, related) {
    if (data[this.foreignKeyField]) {
      throw `cannot create relation when data has existing foreign key ${this.foreignKeyField}`;
    }
    if (!_.isPlainObject(related)) {
      throw `belongsTo relation "${this.fieldname}" must be an object`;
    }
    const { id } = this.relatedEntity.create(related);
    data[this.foreignKeyField] = id;
  }
  // called when relation.fieldname is called as a setter by instance;
  set(instance, value) {
    if (!(value instanceof this.relatedEntity) && value !== null) {
      throw `must set ${this.fieldname} to instance of ${this.relatedEntity.id}`;
    }
    this.primaryEntity.update(instance.id, {
      [this.foreignKeyField]: value?.id || null,
    });
  }
}