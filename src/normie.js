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

  function getRelatedEntity (_RelatedEntity) {
    let RelatedEntity = _RelatedEntity
    if (typeof _RelatedEntity === 'string') {
      RelatedEntity = entitiesById[_RelatedEntity]
      if (!RelatedEntity) {
        throw new InvalidEntityError(`entity ${_RelatedEntity} has not been initialized`)
      }
    } else {
      validateEntity(RelatedEntity)
      if (!entitiesById[RelatedEntity.id]) {
        throw new InvalidEntityError(`entity ${_RelatedEntity.name} has not been initialized`)
      }
    }
    return RelatedEntity
  }

  EntityClasses.forEach((EntityClass) => {
    // FOREIGN KEY STUFF;
    Object.entries(EntityClass.fields)
      .filter(([, field]) => field?.isForeignKey)
      .forEach(([fieldname, { isForeignKey, ...foreignKey }]) => {
        const RelatedEntity = getRelatedEntity(foreignKey.RelatedEntity)
        EntityClass.addForeignKey({ ...foreignKey, RelatedEntity, fieldname })
      })

    Object.values(EntityClass.fields)
      .filter((field) => field?.RelationClass === BelongsTo)
      .filter(({ foreignKeyField }) => EntityClass.fields[foreignKeyField] === undefined)
      .forEach((belongsTo) => {
        const { foreignKeyField: fieldname, foreignKeyOpts: opts = {} } = belongsTo
        const RelatedEntity = getRelatedEntity(belongsTo.RelatedEntity)
        EntityClass.addForeignKey({ RelatedEntity, fieldname, opts })
      })
  })

  EntityClasses.forEach((EntityClass) => {
    // RELATION STUFF;
    const relations = Object.entries(EntityClass.fields)
      .filter(([, field]) => field?.RelationClass)
      .map(([fieldname, { RelationClass, ...props }]) => {
        const RelatedEntity = getRelatedEntity(props.RelatedEntity)
        return new RelationClass({ ...props, RelatedEntity, fieldname })
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

  const useEntityClassesStore = defineStore('entities', storeDefinition)
  const entitiesStore = useEntityClassesStore()

  EntityClasses.forEach((EntityClass) => EntityClass.setStore(entitiesStore))
}
