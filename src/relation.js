import _ from "lodash";
import fp from "lodash/fp";

export class Relation {
  constructor(props) {
    Object.entries(props).forEach(([key, value]) => {
      this[key] = value;
    });
  }
}

export class HasOne extends Relation {
  // called when relation.fieldname is called as a getter by instance;
  get(instance) {
    const id =
      this.relatedEntity.idsByForeignKey[this.foreignKeyField]?.[instance.id]?.[0];
    if (!id) return; 
    const data = this.relatedEntity.dataById[id];
    return new this.relatedEntity(data);
  }
  // called when an instance of primaryEntity is being created with a relation
  onCreate(data, related) {
    const foreignKey = related[this.foreignKeyField]
    if (foreignKey) {
      throw `relation's ${this.foreignKeyField} must be empty; is set to ${foreignKey}`;
    }
    if (!_.isPlainObject(related)) {
      throw `hasOne relation "${this.fieldname}" must be an object`;
    }
    this.relatedEntity.create({ ...related, [this.foreignKeyField]: data.id });
  }
  // called when relation.fieldname is called as a setter by instance;
  set(instance, value) {
    if (!(value instanceof this.relatedEntity) && value !== null) {
      throw `must set ${this.fieldname} to instance of ${this.relatedEntity.id}`;
    }
    this.relatedEntity.resetForeignKey(
      this.foreignKeyField,
      instance.id,
    );
    if (value) {
      this.relatedEntity.update(value.id, {
        [this.foreignKeyField]: instance.id,
      });
    }
  }
}

export class HasMany extends Relation {
  get(instance) {
    const ids =
      this.relatedEntity.idsByForeignKey[this.foreignKeyField][instance.id];
    return fp.flow(
      fp.pick(ids),
      fp.values(),
      fp.map(data => new this.relatedEntity(data)),
    )(this.relatedEntity.dataById);
  }
  onCreate(data, related) {
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
    this.relatedEntity.resetForeignKey(
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
}

export class BelongsTo extends Relation {
  get(instance) {
    const foreignKey = instance[this.foreignKeyField];
    if (!foreignKey) return;
    const data = this.relatedEntity.dataById[foreignKey];
    return new this.relatedEntity(data);
  }
  onCreate(data, related) {
    if (data[this.foreignKeyField]) {
      throw `cannot create relation when data has existing foreign key ${this.foreignKeyField}`;
    }
    if (!_.isPlainObject(related)) {
      throw `belongsTo relation "${this.fieldname}" must be an object`;
    }
    const { id } = this.relatedEntity.create(related);
    data[this.foreignKeyField] = id;
  }
  set(instance, value) {
    if (!(value instanceof this.relatedEntity) && value !== null) {
      throw `must set ${this.fieldname} to instance of ${this.relatedEntity.id}`;
    }
    this.primaryEntity.update(instance.id, {
      [this.foreignKeyField]: value?.id || null,
    });
  }
}

// export class ManyToMany extends Relation {
//   get(instance) {

//   }
//   onCreate(primaryJSON, relatedJSON) {

//   }
// };

// export class ManyToManyPivot extends Relation {

// }
