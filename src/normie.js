import createStoreDefinition from "./create-store-definition";

export default function(defineStore, entities) {
  const entitiesByName = entities.reduce(
    (acc, entity) => ({ ...acc, [entity.id]: entity }),
    {}
  );

  entities.forEach((entity) => entity.resetRelations());

  entities.forEach((entity) => {
    Object.entries(entity.fields)
      .filter(([, field]) => field?.RelationClass)
      .map(([fieldname, { RelationClass, ...attributes }]) => {
        const relatedEntity =
          typeof attributes.relatedEntity === "string"
            ? entitiesByName[attributes.relatedEntity]
            : attributes.relatedEntity;
        // TODO: make sure that foreign key exists in entity;
        return new RelationClass({ ...attributes, relatedEntity, fieldname });
      })
      .forEach((relation) => {
        entity.addRelation(relation);
        relation.relatedEntity.addInverseRelation(relation);
      });
  });

  const storeDefinition = createStoreDefinition(entities);
  const useEntitiesStore = defineStore("entities", storeDefinition);
  const entitiesStore = useEntitiesStore();

  entities.forEach((entity) => entity.setStore(entitiesStore));
}
