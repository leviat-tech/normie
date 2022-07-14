# Getting Started

Normie is heavily inspired by [vuex-orm](https://github.com/vuex-orm/vuex-orm) and was created for the same purpose (but using [pinia](https://pinia.vuejs.org/) for state management instead of [vuex](https://vuex.vuejs.org/)). Big thanks to [@kiaking](https://github.com/kiaking) and other contributors of vuex-orm.

## Installation

using yarn:

`yarn add @leviat-tech/normie`

or with npm:

`npm install @leviat-tech/normie`

## Initialization

```js
import { createPinia, defineStore } from 'pinia'
import { normie } from '@crhio/normie'
import App from './App.vue'
import { User, Role, RoleUser } from './entities.js'

const pinia = createPinia()
const app = createApp(App)
const useEntitiesStore = normie(defineStore, [User, Role, RoleUser])

app.use(pinia)
```
