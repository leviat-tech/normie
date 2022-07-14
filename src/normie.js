import _ from 'lodash'
import Entity from './entity'
import { create, update, _delete } from './actions'
import { BelongsTo } from './relations'
import { InvalidEntityError } from './exceptions'

function validateEntity (EntityClass) {
  if (typeof EntityClass.id !== 'string') {
    throw new InvalidEntityError(`entity class ${EntityClass.name} must have id defined as a string`)
  }
  if (!_.isPlainObject(EntityClass.fields)) {
    throw new InvalidEntityError(`entity class "${EntityClass.name}" must have fields defined as an object`)
  }
  if (!(EntityClass.prototype instanceof Entity)) {
    throw new InvalidEntityError(`entity class ${EntityClass.name} must be instance of Entity`)
  }
}

export default function normie (defineStore, EntityClasses) {
  EntityClasses.forEach((EntityClass) => {
    validateEntity(EntityClass)
    EntityClass.initialize()
  })

  const entitiesById = _.mapValues(_.groupBy(EntityClasses, 'id'), _.first)

  function getEntity (_Entity) {
    let Entity = _Entity
    if (typeof _Entity === 'string') {
      Entity = entitiesById[_Entity]
      if (!Entity) {
        throw new InvalidEntityError(`entity ${_Entity} has not been initialized`)
      }
    } else {
      validateEntity(Entity)
      if (!entitiesById[Entity.id]) {
        throw new InvalidEntityError(`entity ${_Entity.name} has not been initialized`)
      }
    }
    return Entity
  }

  EntityClasses.forEach((EntityClass) => {
    // FOREIGN KEY STUFF;
    Object.entries(EntityClass.fields)
      .filter(([, field]) => field?.isForeignKey)
      .forEach(([fieldname, { isForeignKey, ...foreignKey }]) => {
        const RelatedEntity = getEntity(foreignKey.RelatedEntity)
        EntityClass.addForeignKey({ ...foreignKey, RelatedEntity, fieldname })
      })

    Object.values(EntityClass.fields)
      .filter((field) => field?.RelationClass === BelongsTo)
      .filter(({ foreignKeyField }) => EntityClass.fields[foreignKeyField] === undefined)
      .forEach((belongsTo) => {
        const { foreignKeyField: fieldname, foreignKeyOpts: opts = {} } = belongsTo
        const RelatedEntity = getEntity(belongsTo.RelatedEntity)
        EntityClass.addForeignKey({ RelatedEntity, fieldname, opts })
      })
  })

  EntityClasses.forEach((EntityClass) => {
    // RELATION STUFF;
    const relations = Object.entries(EntityClass.fields)
      .filter(([, field]) => field?.RelationClass)
      .map(([fieldname, { RelationClass, ...props }]) => {
        const _props = _.mapValues(props, (v, k) => k.includes('Entity') ? getEntity(v) : v)
        return new RelationClass({ ..._props, fieldname })
      })

    relations.forEach((relation) => {
      // handle ManyToMany and HasManyThrough, which are made of multiple relations;
      relation.expand?.()?.forEach?.((subrelation) => relations.push(subrelation))
    })

    relations.forEach((relation) => {
      EntityClass.addRelation(relation)
    })
  })

  // STORE STUFF;
  const getInitialEntityState = (EntityClass) => ({
    dataById: {},
    idsByForeignKey: _.mapValues((EntityClass.foreignKeysByFieldName), () => ({}))
  })

  const initialState = _.mapValues(entitiesById, getInitialEntityState)

  const storeDefinition = {
    state: () => initialState,
    actions: { create, update, delete: _delete }
  }

  const useEntitiesStore = defineStore('entities', storeDefinition)

  EntityClasses.forEach((EntityClass) => {
    EntityClass.useStore = useEntitiesStore
  })

  return useEntitiesStore
}
