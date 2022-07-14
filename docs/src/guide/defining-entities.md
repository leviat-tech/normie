# Defining Entities

To define an Entity, create a class that extends Normie's `Entity`.

```js
import { Entity } from '@crhio/normie'

export class User extends Entity {
  static id = 'users'

  static get fields() {
    return {
      name: null,
      email: null,
      isAdmin: false,
      createdAt: Date.now()
    }
  }
}
```

## ID

`static id` acts as a unique identifier for the entity. In this case, any data belonging to the `User` entity will be namespaced under `users` within the `entities` store.

## Fields

`static get fields()` defines default values for instances of the entity (in the above example, instances of `User`). You can also define a custom ID by including an `id` in `fields()` that calls a function (UUID is used by default) like so:

```js
  ...
  static get fields() {
    return {
      id: Math.random()
    }
  }
```

### Validation

Normie does not enforce data types or requiredness of fields - you can [beef up your entity classes] if you want to incorporate validation. However, Normie will warn you if a property not defined in `fields()` is added to an instance.

### Relationships

You can define a relationship between different models by relational attributes such as `this.hasMany()` or `this.belongsTo()`. We'll go over this in the next section.