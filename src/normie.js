import create from "./actions/create";
import update from "./actions/update";
import _delete from "./actions/delete";
import clearForeignKeyIndex from "./actions/clear-fk-index";

export default function (defineStore, entities) {
  // RELATION STUFF;
  const entitiesById = entities.reduce(
    (acc, entity) => ({ ...acc, [entity.id]: entity }),
    {}
  );

  entities.forEach((entity) => entity.resetRelations());

  entities.forEach((entity) => {
    const relations = Object.entries(entity.fields)
      .filter(([, field]) => field?.RelationClass)
      .map(([fieldname, { RelationClass, ...props }]) => {
        const relatedEntity =
          typeof props.relatedEntity === "string"
            ? entitiesById[props.relatedEntity]
            : props.relatedEntity;
        return new RelationClass({ ...props, relatedEntity, fieldname });
      })

    relations
      .filter((relation) => relation.expand)
      .forEach((relation) => {
        // handle ManyToMany and HasManyThrough, which are made of multiple relations;
        const subrelations = relation.expand();
        subrelations.forEach((subrelation) => relations.push(subrelation));
      })

    relations.forEach((relation) => {
      relation.primaryEntity.addRelation(relation);
      relation.relatedEntity.addDependentRelation(relation);
    });
  });

  // STORE STUFF;
  const getInitialEntityState = (entity) => ({
    dataById: {},
    idsByForeignKey: entity.foreignKeyFields.reduce(
      (acc, field) => ({ ...acc, [field]: {} }),
      {}
    ),
  });

  const initialState = entities.reduce(
    (acc, entity) => ({ ...acc, [entity.id]: getInitialEntityState(entity) }),
    {}
  );

  const storeDefinition = {
    state: () => initialState,
    actions: { create, update, delete: _delete, clearForeignKeyIndex },
  };

  const useEntitiesStore = defineStore("entities", storeDefinition);
  const entitiesStore = useEntitiesStore();

  entities.forEach((entity) => entity.setStore(entitiesStore));
}
