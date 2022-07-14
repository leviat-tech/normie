<script>
import { User, Role, RoleUser } from '../entities';

export default {
  data() {
    return {
      roleNameToAdd: '',
      userIdsToAdd: {}
    }
  },
  computed: {
    users() { 
      return User.read();
    },
    roles() {
      return Role.read();
    }
  },
  methods: {
    addRole() {
      if (!this.roles.find(role => role.name === this.roleNameToAdd)) {
        Role.create({ name: this.roleNameToAdd })
        this.roleNameToAdd = '';
      }      
    },
    addUserToRole({ id: roleId }) {
      if (this.userIdsToAdd[roleId]) {
        RoleUser.create({ roleId, userId: this.userIdsToAdd[roleId] })
      }
    },
    removeUserFromRole({ id: userId }, { id: roleId }) {
      RoleUser.read()
        .find(roleUser => roleUser.roleId === roleId && roleUser.userId === userId)
        .$delete()
    },
    removeRole({ id }) {
      Role.delete(id)
    }
  }
}
</script>

<template>
  <div class="flex flex-col">
    <h1> roles </h1>
    <div class="mt-2 mb-2 flex">
      <input
        class="text-gray-500 mr-2 w-24"
        v-model="roleNameToAdd"
      />
      <button class="h-6 flex items-center cursor-pointer" @click="addRole"> add role </button>
    </div>
  </div>
  <div class="flex flex-col">
    <div
      v-for="role in roles"
      :key="role.name"
    >
      <div class="text-2xl">
        {{ role.name }}
        <span class="cursor-pointer ml-2" @click="removeRole(role)"> x </span>
      </div>
      <div class="flex"> 
        <select
          class="text-gray-500 w-24"
          v-model="userIdsToAdd[role.id]"
        >
          <option disabled value="">please select one</option>
          <option
            v-for="user in users.filter(user => !role.users.find(_user => _user.id === user.id))"
            :key="user.id"
            :value="user.id"
          >
            {{ user.name }}
          </option>
        </select>
        <button class="h-6 flex items-center cursor-pointer ml-2" @click="addUserToRole(role)"> add user </button>
      </div>
      <div
        class="flex flex-col"
        v-for="user in role.users"
        :key="user.name"
      >
        <div>
          {{ user.name }}
          <span class="cursor-pointer ml-2" @click="removeUserFromRole(user, role)"> x </span>
        </div>
      </div>
    </div>
  </div>
</template>