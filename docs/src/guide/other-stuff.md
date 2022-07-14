# Other Stuff

## Serialization

`instance.$toJSON()` will, unsurprisingly, retrieve a JSON representation of an instance. By default, this won't serialize any nested relations - this because relations are normally retrieved lazily through javascript proxies.  We can include nested relations by supplying a path to `$toJSON()`.

```js
  zone.$toJSON('*')
  segment.$toJSON('section.[zones.*, presets]')
```

- `*` will retrieve all first level relations
- use `[]` to retrieve multiple relations
- use dot notation to retrieve nested relations

## Lifecycle Methods

Normie exposes the following lifecycle hooks:

- `onCreate(instance)`
- `onUpdate(instance)`
- `onDelete(instance)`

These can be defined in any class that extends Normie's `Entity`, and they're called _after_ creating, updating, or deleting the corresponding instance.