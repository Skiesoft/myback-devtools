import { Entity } from './entity'

/**
 * Property decorator to define an attribute in entity model.
 *
 * @param target the entity model that extend {@link Entity} class.
 * @param propertyName the attribute name in the entity a
 */
export function attribute (target: any, propertyName: string): void {
  if (target.attributes === undefined) {
    target.attributes = []
  }
  target.attributes.push(propertyName)
}
