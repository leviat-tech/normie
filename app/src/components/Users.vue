<script setup>
import { ref, computed } from 'vue';
import { User, Role, RoleUser } from '../entities';

const userNameToAdd = ref('')
const roleIdsToAdd = ref({})

const users = computed(() => User.read())
const roles = computed(() => Role.read())

function addUser() {
  if (!users.value.find(user => user.name === userNameToAdd.value)) {
    const user = User.create({ name: userNameToAdd.value })
    userNameToAdd.value = '';
  }      
}

function addRoleToUser({ id: userId }) {
  if (roleIdsToAdd.value[userId]) {
    RoleUser.create({ userId, roleId: roleIdsToAdd.value[userId] })
  }
}

function removeRoleFromUser({ id: roleId }, { id: userId }) {
  RoleUser.read()
    .find(roleUser => roleUser.roleId === roleId && roleUser.userId === userId)
    .$delete()
}

function removeUser({ id }) {
  User.delete(id)
}

</script>

<template>
  <div class="flex flex-col">
    <h1> users </h1>
    <div class="mt-2 mb-2 flex">
      <input
        class="text-gray-500 mr-2 w-24"
        v-model="userNameToAdd"
      />
      <button class="h-6 flex items-center cursor-pointer" @click="addUser"> add user </button>
    </div>
  </div>
  <div>
    <div
      v-for="user in users"
      :key="user.name"
    >
      <div class="text-2xl">
        {{ user.name }}
        <span class="cursor-pointer ml-2" @click="removeUser(user)"> x </span>
      </div>
      <div class="flex"> 
        <select
          class="text-gray-500 w-24"
          v-model="roleIdsToAdd[user.id]"
        >
          <option disabled value="">please select one</option>
          <option
            v-for="role in roles.filter(role => !user.roles.find(_role => _role.id === role.id))"
            :key="role.id"
            :value="role.id"
          >
            {{ role.name }}
          </option>
        </select>
        <button class="h-6 flex items-center cursor-pointer ml-2" @click="addRoleToUser(user)"> add role </button>
      </div>
      <div
        class="flex flex-col"
        v-for="role in user.roles"
        :key="role.name"
      >
        <div>
          {{ role.name }}
          <span class="cursor-pointer ml-2" @click="removeRoleFromUser(role, user)"> x </span>
        </div>
      </div>
    </div>
  </div>
</template>
