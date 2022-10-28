import { DoesNotExistError } from '../exceptions'

export default {
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
        throw new DoesNotExistError(`cannot set property; id ${target.data.id} does not exist in ${EntityClass.id}`)
      }
      return relation.get(target.data)
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
    EntityClass.update(target.data.id, { [prop]: value }, false)
    return true
  }
}
