import { isPlainObject } from 'lodash-es'
import { SerializationError } from '../exceptions'

export default function serialize (instance, path, context) {
  if (!instance) return null
  const { relationsByFieldName, id: entityId, format } = instance.constructor
  const addRelationToJSON = (json, path) => {
    const periodIndex = path.indexOf('.')
    let childFieldName
    let remainingPath

    if (periodIndex === -1) {
      childFieldName = path
      remainingPath = null
    } else {
      childFieldName = path.slice(0, periodIndex)
      remainingPath = path.slice(periodIndex + 1)
    }

    if (!relationsByFieldName[childFieldName]) {
      throw new SerializationError(`relation ${childFieldName} does not exist on ${entityId}`)
    }

    const child = instance[childFieldName]
    const childJSON = Array.isArray(child)
      ? child.map((_child) => serialize(_child, remainingPath, context))
      : serialize(child, remainingPath, context)

    return { ...json, [childFieldName]: childJSON }
  }

  const serialized = format?.(instance._data, context) || instance._data

  if (serialized && !isPlainObject(serialized)) {
    throw new SerializationError(`custom serializer of ${entityId} must return an object`)
  }

  if (!path || !serialized) return serialized
  if (path.startsWith('[')) {
    return path.slice(1, -1).split(',')
      .map((str) => str.replaceAll(' ', ''))
      .reduce(addRelationToJSON, serialized)
  }
  if (path === '*') {
    return Object.keys(relationsByFieldName).reduce(addRelationToJSON, serialized)
  }
  return addRelationToJSON(serialized, path)
}
