import _ from 'lodash'
import Entity from './entity'
import create from './actions/create'
import update from './actions/update'
import _delete from './actions/delete'
import BelongsTo from './relations/belongs-to'

function normie (defineStore, EntityClasses) {
  EntityClasses.forEach((EntityClass) => {
    if (typeof EntityClass.id !== 'string') {
      throw new Error(`entity class ${EntityClass.name} must have id defined as a string`)
    }
    if (!_.isPlainObject(EntityClass.fields)) {
      throw new Error(`entity class "${EntityClass.id}" must have fields defined as an object`)
    }
    EntityClass.initialize()
  })

  const entitiesById = _.mapValues(_.groupBy(EntityClasses, 'id'), _.first)

  EntityClasses.forEach((EntityClass) => {
    // FOREIGN KEY STUFF;
    Object.entries(EntityClass.fields)
      .filter(([, field]) => field?.isForeignKey)
      .forEach(([fieldname, { isForeignKey, ...foreignKey }]) => {
        const RelatedEntity = typeof foreignKey.RelatedEntity === 'string'
          ? entitiesById[foreignKey.RelatedEntity]
          : foreignKey.RelatedEntity
        if (!RelatedEntity) {
          throw new Error(`entity ${foreignKey.RelatedEntity} has not been initialized`)
        }
        EntityClass.addForeignKey({ ...foreignKey, RelatedEntity, fieldname })
      })

    Object.values(EntityClass.fields)
      .filter((field) => field?.RelationClass === BelongsTo)
      .filter(({ foreignKeyField }) => EntityClass.fields[foreignKeyField] === undefined)
      .forEach((belongsTo) => {
        const { foreignKeyField: fieldname, foreignKeyOpts: opts = {} } = belongsTo
        const RelatedEntity = typeof belongsTo.RelatedEntity === 'string'
          ? entitiesById[belongsTo.RelatedEntity]
          : belongsTo.RelatedEntity
        if (!RelatedEntity) {
          throw new Error(`entity ${belongsTo.RelatedEntity} has not been initialized`)
        }
        EntityClass.addForeignKey({ RelatedEntity, fieldname, opts })
      })
  })

  EntityClasses.forEach((EntityClass) => {
    // RELATION STUFF;
    const relations = Object.entries(EntityClass.fields)
      .filter(([, field]) => field?.RelationClass)
      .map(([fieldname, { RelationClass, ...props }]) => {
        const RelatedEntity = typeof props.RelatedEntity === 'string'
          ? entitiesById[props.RelatedEntity]
          : props.RelatedEntity
        if (!RelatedEntity) {
          throw new Error(`entity ${props.RelatedEntity} has not been initialized`)
        }
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

export { normie, Entity }
