# Relations

Normie stores data from different entities in separate namespaces. In order to define a nested data structure involving multiple entities, you can define relations in `fields()`.


## Belongs To

```js
class User extends Entity {
  static id = 'users'
  ...
}

class Post extends Entity {
  static id = 'posts'

  static get fields () {
    return {
      body: '',
      user: this.belongsTo(User, 'userId')
    }
  }
}
```

`belongsTo` is a relation, and is the building block for all other relations in Normie.  In the above example, the call to `belongsTo` will:

- create a field called `userId` in the `Post` entity that acts as a foreign key to `User`
- create a field called `user` that, when accessed, will return the user whose `id` is `userId`

If you want to create the foreign key to be referenced by another entity without creating the accessor to the other entity, you can use `this.foreignKey()`:

```js
static fields() {
  return {
    userId: this.foreignKey(User)
  }
}
```

> Parameters that reference an entity class can be substituted with that entity's `id`: in this case we can use `'users'` instead of `User`.

## Has Many

```js
class User extends Entity {
  static id = 'users'
  
  static get fields () {
    return {
      name: '',
      email: ''
      posts: this.hasMany('posts', 'postId')
    }
  }
}
```

The above call to `hasMany()` will create a field called `posts` in the `User`; calling `user.posts` will return all posts whose `userId` === `user.id`.  If the foreign key referenced in `hasMany()` (in this case, `postId`) does not exist on the corresponding model, Normie will throw an error.

## Has One

```js
class User extends Entity {
  static id = 'users'
  
  static get fields () {
    return {
      name: '',
      email: ''
      profile: this.hasOne('profiles', 'userId')
    }
  }
}

class Profile extends Entity {
  static id = 'profiles'

  static get fields () {
    return {
      thumbnailURL: '',
      user: this.belongsTo(User, 'userId')
    }
  }
}
```

`hasOne` is identical to `hasMany`- the only difference being that the accessor will only return one instance of the related entity as opposed to an array of.

## Many to Many

```js
export class User extends Entity {
  static id = 'users'

  static fields = {
    name: null,
    roles: this.manyToMany('roles', 'role_user', 'userId', 'roleId')
  }
}

export class Role extends Entity {
  static id = 'roles'

  static fields = {
    name: null,
    users: this.manyToMany('users', 'role_user', 'roleId', 'userId')
  }
}

export class RoleUser extends Entity {
  static id = 'role_user'

  static fields = {
    role: this.belongsTo(Role, 'roleId', { onDeleteCascade: true }),
    user: this.belongsTo(User, 'userId', { onDeleteCascade: true })
  }
}
```

In the above data model, users have many roles and inversely, roles have many users. This can be achieved by creating an intermediary model (as one would do in a database), and using `hasMany` and `belongsTo` / `foreignKey` as necessary.

