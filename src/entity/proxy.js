import { DoesNotExistError } from '../exceptions'
import { isPlainObject, set, cloneDeep } from 'lodash-es'

const mutationNames = ['shift', 'unshift', 'pop', 'push', 'splice', 'sort', 'reverse']

function getPatch (path, value) {
  const patch = {}
  set(patch, path, value)
  return patch
}

function createNestedProxy (target, update, path) {
  const handler = {
    get (target, prop) {
      if (Array.isArray(target[prop]) || isPlainObject(target[prop])) {
        return createNestedProxy(target[prop], update, [...path, prop])
      }
      if (Array.isArray(target) && mutationNames.includes(prop)) {
        return (...args) => {
          const clone = [...target]
          clone[prop](...args)
          const patch = getPatch(path, clone)
          update(patch, true)
        }
      }
      return Reflect.get(...arguments)
    },
    set (target, prop, value) {
      const patch = getPatch([...path, prop], value)
      update(patch, false)
      return true
    },
    deleteProperty (target, prop) {
      const clone = cloneDeep(target)
      delete clone[prop]
      const patch = getPatch(path, clone)
      update(patch, true)
      return true
    }
  }
  return new Proxy(target, handler)
}

const rootProxy = {
  get (target, prop) {
    const EntityClass = target.constructor
    if (prop === 'constructor') {
      return Reflect.get(...arguments)
    }
    if (prop === '_data') {
      // target.data is also a proxy - this converts it into an object
      return JSON.parse(JSON.stringify(target.data))
    }
    const relation = EntityClass.relationsByFieldName[prop]
    if (relation?.get) {
      if (!EntityClass.dataById[target.data.id]) {
        throw new DoesNotExistError(`cannot get property; id ${target.data.id} does not exist in ${EntityClass.id}`)
      }
      return relation.get(target.data)
    }
    if (Array.isArray(target.data[prop]) || isPlainObject(target.data[prop])) {
      return createNestedProxy(
        target.data[prop],
        (patch, overwrite) => EntityClass.update(target.data.id, patch, overwrite),
        [prop]
      )
    }
    if (target.data[prop] !== undefined) {
      return target.data[prop]
    }
    return Reflect.get(...arguments)
  },
  set (target, prop, value) {
    const EntityClass = target.constructor
    const relation = EntityClass.relationsByFieldName[prop]
    if (relation) {
      if (!EntityClass.dataById[target.data.id]) {
        throw new DoesNotExistError(`cannot set property; id ${target.data.id} does not exist in ${EntityClass.id}`)
      }
      relation.set(target.data, value)
      return true
    }
    if (!EntityClass.fields[prop] === undefined) {
      console.warn(`warning: property ${prop} not defined in ${EntityClass.name} fields`)
    }
    EntityClass.update(target.data.id, { [prop]: value }, true)
    return true
  },
  deleteProperty (target) {
    throw new Error(`cannot delete root level property of ${target.constructor.name} instance`)
  }
}

export default rootProxy
