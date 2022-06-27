import _ from 'lodash'
import Entity from './entity'
import create from './actions/create'
import update from './actions/update'
import _delete from './actions/delete'

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

  const entitiesById = EntityClasses.reduce(
    (acc, EntityClass) => ({ ...acc, [EntityClass.id]: EntityClass }),
    {}
  )

  EntityClasses.forEach((EntityClass) => {
    // FOREIGN KEY STUFF;
    Object.entries(EntityClass.fields)
      .filter(([, value]) => value?.isForeignKey)
      .forEach(([fieldname, { isForeignKey, ...foreignKey }]) => {
        const RelatedEntity = typeof foreignKey.RelatedEntity === 'string'
          ? entitiesById[foreignKey.RelatedEntity]
          : foreignKey.RelatedEntity
        if (!RelatedEntity) {
          throw new Error(`entity ${foreignKey.RelatedEntity} has not been initialized`)
        }
        EntityClass.addForeignKey(fieldname, { ...foreignKey, RelatedEntity })
      })

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
      relation.PrimaryEntity.addRelation(relation)
    })
  })

  // STORE STUFF;
  const getInitialEntityState = (EntityClass) => ({
    dataById: {},
    idsByForeignKey: Object.values(EntityClass.foreignKeysByFieldName)
      .reduce(
        (acc, { fieldname }) => ({ ...acc, [fieldname]: {} }),
        {}
      )
  })

  const initialState = EntityClasses.reduce(
    (acc, EntityClass) => ({ ...acc, [EntityClass.id]: getInitialEntityState(EntityClass) }),
    {}
  )

  const storeDefinition = {
    state: () => initialState,
    actions: { create, update, delete: _delete }
  }

  const useEntityClassesStore = defineStore('entities', storeDefinition)
  const entitiesStore = useEntityClassesStore()

  EntityClasses.forEach((EntityClass) => EntityClass.setStore(entitiesStore))
}

export { normie, Entity }
