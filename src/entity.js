import _ from 'lodash';
import { reactive } from '@vue/reactivity';
import { HasOne, HasMany, BelongsTo } from "./relation";

export default class Entity {

  constructor(props) {
    this.data = reactive(props);

    return new Proxy(this, {
      get(target, prop) {
        const dataById = target.constructor.dataById;
        if (!dataById[target.data.id]) {
          // make it impossible to get or set from a deleted instance;
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
    this.inverseRelations = [];
  }

  static addRelation(relation) {
    this.relations.push(relation);
  }

  static addInverseRelation(inverseRelation) {
    this.inverseRelations.push(inverseRelation);
  }

  static get foreignKeyFields() {
    const foreignKeyFields = [
      ...this.relations.filter((relation) => relation instanceof BelongsTo),
      ...this.inverseRelations.filter(
        (relation) => relation instanceof HasOne || relation instanceof HasMany
      ),
    ].map((relation) => relation.foreignKeyField);
    return _.uniq(foreignKeyFields);
  }

  static get relationsByFieldName() {
    return this.relations.reduce(
      (acc, relation) => ({ ...acc, [relation.fieldname]: relation }),
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

  static resetForeignKey(foreignKeyField, foreignKey) {
    return this.store.resetForeignKey(this, foreignKeyField, foreignKey);
  }

  // RELATIONSHIP STUFF
  static hasOne(relatedEntity, foreignKeyField) {
    return {
      primaryEntity: this,
      relatedEntity,
      foreignKeyField,
      RelationClass: HasOne,
    };
  }

  static belongsTo(relatedEntity, foreignKeyField) {
    return {
      primaryEntity: this,
      relatedEntity,
      foreignKeyField,
      RelationClass: BelongsTo,
    };
  }

  static hasMany(relatedEntity, foreignKeyField) {
    return {
      primaryEntity: this,
      relatedEntity,
      foreignKeyField,
      RelationClass: HasMany,
    };
  }

  // static manyToMany(relatedEntity, join, selfForeignKey, relatedForeignKey) {
  // }

  $update(patch) {
    return this.constructor.update(this.id, patch);
  }

  $delete() {
    return this.constructor.delete(this.id);
  }

}
