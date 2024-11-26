# Other Stuff

## Serialization

`instance.$toJSON()` will, unsurprisingly, retrieve a JSON representation of an instance. By default, this won't serialize any nested relations - this because relations are normally retrieved lazily through javascript proxies. We can include nested relations by supplying a path to `$toJSON()`.

```js
zone.$toJSON('*');
segment.$toJSON('section.[zones.*, presets]');
```

- `*` will retrieve all first level relations
- use `[]` to retrieve multiple relations
- use dot notation to retrieve nested relations

## Lifecycle Methods

Normie exposes the following lifecycle hooks, which can be defined as static methods in any class that extends Normie's `Entity`:

- `beforeCreate(instance)`
- `afterCreate(instance)`
- `beforeUpdate(patch, id?, previousData?)`
- `afterUpdate(instance)`
- `beforeDelete(instance)`
- `afterDelete(instance)`
- `beforeAll(actionType, data)` - called before all create, update and delete actions
- `afterAll(actionType, data)` - called after all create, update and delete actions

::: danger Please Note
Updating the instance in the `afterUpdate` hook results in an infinite loop due to the hook being constantly retriggered. Any changes to the instance itself should be done in the `beforeUpdate` handler.

beforeUpdate methods must include patch but do not need to include id (the Entity ID) nor previousData (the pre-patched object/property).
:::
