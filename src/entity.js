import { reactive } from '@vue/reactivity';
import fp from 'lodash/fp';
import HasOne from './relations/has-one';
import HasMany from './relations/has-many';
import BelongsTo from './relations/belongs-to';
import ManyToMany from './relations/many-to-many';

export default class Entity {

  constructor(props) {
    this.data = reactive(props);
    return new Proxy(this, {
      get(target, prop) {
        const dataById = target.constructor.dataById;
        if (!dataById[target.data.id]) {
          throw `instance with id ${target.data.id} does not exist.`
        }
        if (prop === 'constructor') {
          return Reflect.get(...arguments);
        }
        const relation = target.constructor.relationsByFieldName[prop];
        if (relation?.get) {
          return relation.get(target.data);
        }
        if (target.data[prop]) {
          return target.data[prop];
        }
        return Reflect.get(...arguments);
      },
      set(target, prop, value) {
        const dataById = target.constructor.dataById;
        if (!dataById[target.data.id]) {
          throw `instance with id ${target.data.id} does not exist.`
        }
        const relation = target.constructor.relationsByFieldName[prop];
        if (relation) {
          relation.set(target.data, value);
          return true;
        }
        target.constructor.update(target.data.id, { [prop]: value });
        return true;
      },
    });
  }

  static setStore(store) {
    this.store = store;
  }

  static resetRelations() {
    this.relations = [];
    this.dependentRelations = [];
  }

  static addBelongsToRelation(relations, relation) {
    const existingBelongsToEquivalent = relations.find((_relation) => 
      (_relation instanceof BelongsTo)
        && _relation.primaryEntity.id == relation.primaryEntity.id
        && _relation.relatedEntity.id == relation.relatedEntity.id
        && _relation.foreignKeyField == relation.foreignKeyField
    )
    if (!existingBelongsToEquivalent) {
      relations.push(relation);
    } else {
      if (relation.fieldname) {
        existingBelongsToEquivalent.fieldname = relation.fieldname;
      }
      if (relation.deleteCascade) {
        existingBelongsToEquivalent.deleteCascade = relation.deleteCascade;
      }
    }
  }

  static addRelation(relation) {
    if (relation instanceof BelongsTo) {
      this.addBelongsToRelation(this.relations, relation);
    } else {
      this.relations.push(relation);
    }
  }

  static addDependentRelation(relation) {
    if (relation instanceof BelongsTo) {
      this.addBelongsToRelation(this.dependentRelations, relation);
    }
  }

  static get foreignKeyFields() {
    // any relations that reference a foreign key on this entity
    return fp.flow(
      fp.filter((relation) => relation instanceof BelongsTo),
      fp.map('foreignKeyField'),
      fp.uniq(),
    )(this.relations);
  }

  static get relationsByFieldName() {
    return this.relations.reduce(
      (acc, relation) => relation.fieldname
        ? { ...acc, [relation.fieldname]: relation }
        : acc,
      {}
    );
  }

  static get dataById() {
    return this.store[this.id].dataById;
  }

  static get idsByForeignKey() {
    return this.store[this.id].idsByForeignKey;
  }

  static get read() {
    return Object.values(this.dataById).map((data) => new this(data));
  }

  static find(id) {
    return this(this.dataById[id]);
  }

  static create(data = {}) {
    return this.store.create(this, data);
  }

  static update(id, patch) {
    return this.store.update(this, id, patch);
  }

  static delete(id) {
    return this.store.delete(this, id);
  }

  static clearForeignKeyIndex(foreignKeyField, foreignKey) {
    return this.store.clearForeignKeyIndex(this, foreignKeyField, foreignKey);
  }

  $update(patch) {
    return this.constructor.update(this.id, patch);
  }

  $delete() {
    return this.constructor.delete(this.id);
  }

  $toJSON(string) {

  }

  // RELATION STUFF
  static belongsTo(relatedEntity, foreignKeyField, opts = {}) {
    return {
      primaryEntity: this,
      relatedEntity,
      foreignKeyField,
      deleteCascade: opts.deleteCascade,
      RelationClass: BelongsTo,
    };
  }

  static hasOne(relatedEntity, foreignKeyField, opts = {}) {
    return {
      primaryEntity: this,
      relatedEntity,
      foreignKeyField,
      deleteCascade: opts.deleteCascade,
      RelationClass: HasOne,
    };
  }

  static hasMany(relatedEntity, foreignKeyField, opts = {}) {
    return {
      primaryEntity: this,
      relatedEntity,
      foreignKeyField,
      deleteCascade: opts.deleteCascade,
      RelationClass: HasMany,
    };
  }

  static manyToMany(
    relatedEntity,
    pivotEntity,
    primaryForeignKeyField,
    relatedForeignKeyField,
    opts = {},
   ) {
    return {
      primaryEntity: this,
      relatedEntity,
      pivotEntity,
      primaryForeignKeyField,
      relatedForeignKeyField,
      deletePivot: opts.deletePivot, // remove the pivot instance if primary or related entity are deleted;
      RelationClass: ManyToMany,
    }
  }

}
