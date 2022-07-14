import { createApp } from 'vue'
import { createPinia, defineStore } from 'pinia'
import { normie } from '@crhio/normie'
import App from './App.vue'
import { User, Role, RoleUser } from './entities.js'
import './style.css'

const pinia = createPinia()
const app = createApp(App)
const useEntitiesStore = normie(defineStore, [User, Role, RoleUser])

app.use(pinia)

const users = ['lee', 'matt', 'dan', 'yaming', 'pete', 'calum']
const roles = ['cleric', 'bard', 'warlock', 'paladin', 'monk', 'ranger']
users.forEach(user => User.create({ name: user }))
roles.forEach(role => Role.create({ name: role }))

app.mount('#app')
