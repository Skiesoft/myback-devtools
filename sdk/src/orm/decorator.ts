import 'reflect-metadata'
import { Model } from './model'

export interface AttributeProperty {
  primary?: boolean
  unique?: boolean
  autoIndex?: boolean
  nullable?: boolean
  type: 'int' | 'float' | 'string' | 'boolean' | 'date' | 'datetime' | 'relation'
}

/**
 * Property decorator to define an attribute in entity model.
 *
 * @param target the entity model that extend {@link Model} class.
 * @param propertyName the attribute name in the entity a
 */
export function attribute (properties: AttributeProperty) {
  return (target: Model, propertyKey: string) => {
    const attributes: string[] = Reflect.getMetadata('attributes', target) ?? []
    attributes.push(propertyKey)

    Reflect.defineMetadata('attributes', attributes, target)
    Reflect.defineMetadata('property', properties, target, propertyKey)
    if (properties.primary === true) {
      Reflect.defineMetadata('primaryKey', propertyKey, target)
    }
  }
}
