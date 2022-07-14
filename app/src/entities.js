import { Entity } from '@crhio/normie'

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
