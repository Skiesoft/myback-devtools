import 'reflect-metadata'
import { Model } from './model'

export interface AttributeProperty {
  primary?: boolean
  autoIndex?: boolean
  nullable?: boolean
  type: 'int' | 'float' | 'string' | 'boolean'
}

/**
 * Property decorator to define an attribute in entity model.
 *
 * @param target the entity model that extend {@link Model} class.
 * @param propertyName the attribute name in the entity a
 */
export function attribute (properties: AttributeProperty) {
  return (target: Model, propertyKey: string) => {
    const attributeKey = 'attributes'
    const attributes: string[] = Reflect.getMetadata(attributeKey, target) ?? []
    attributes.push(propertyKey)

    Reflect.defineMetadata(attributeKey, attributes, target)
    Reflect.defineMetadata('property', properties, target, propertyKey)
  }
}
