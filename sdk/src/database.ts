import { AxiosResponse } from 'axios'
import { HTTP_METHOD, SDK } from './sdk'
import { Entity } from './entity'
import { QueryBuilder } from './query-builder'
import { Relation } from './relation'

/**
 * Represent a database in backend. Use for retrieve {@link Table}
 *
 */
export class Database {
  private readonly id: string

  /**
   * Constructor of the controller of resource.
   *
   * @param id the identifier of the database.
   */
  constructor (id: string = 'default') {
    this.id = id
  }

  /**
   * Save the object to the database.
   *
   * @param CustomEntity the entity model.
   * @param entity the entity object to save.
   */
  async save<T extends Entity>(CustomEntity: typeof Entity, entity: T): Promise<void> {
    await this.request(CustomEntity, HTTP_METHOD.PUT, `object?matcher=${JSON.stringify(entity.getOldProperties())}`, { data: entity.getProperties() })
    entity.updateOldProperties()
  }

  /**
   * Delete the object from the database.
   *
   * @param CustomEntity the entity model.
   * @param entity the entity object to destroy.
   */
  async destroy<T extends Entity>(CustomEntity: typeof Entity, entity: T): Promise<void> {
    await this.request(CustomEntity, HTTP_METHOD.DELETE, `object?matcher=${JSON.stringify(entity.getOldProperties())}`)
  }

  /**
   * Return the relationship of the specific collection.
   *
   * @param CustomEntity the entity model.
   * @param entity the entity object to fetch relationships.
   * @returns
   */
  async relation<T extends Entity>(CustomEntity: typeof Entity, entity: T): Promise<Relation> {
    const res = await this.request(CustomEntity, HTTP_METHOD.GET, `relation?matcher=${JSON.stringify(entity.getOldProperties())}`)
    return new Relation(res.data)
  }

  /**
   * Return the array of all entities.
   * Use with cautions since result might be massive!
   *
   * @param CustomEntity the entity model to fetch all rows.
   * @returns
   */
  async all<T extends Entity>(CustomEntity: typeof Entity): Promise<T[]> {
    const res = await this.request(CustomEntity, HTTP_METHOD.GET, 'object/')
    return res.data.data.map((properties: any) => new CustomEntity(properties))
  }

  /**
   * Return the array of a page in the collection.
   *
   * @param CustomEntity the entity model to fetch data.
   * @returns
   */
  async page<T extends Entity>(CustomEntity: typeof Entity, pageId: number, limit: number = 24): Promise<T[]> {
    const res = await this.request(CustomEntity, HTTP_METHOD.GET, `object/page?pageSize=${limit}&page=${pageId}`)
    return res.data.data.map((properties: any) => new CustomEntity(properties))
  }

  /**
   * Return the result by the given query with default paging.
   *
   * @param CustomEntity the entity model to fetch data.
   * @param query query to filter result.
   * @param pageId the page number.
   * @param limit the maxmium limit of each page.
   * @returns
   */
  async find<T extends Entity>(CustomEntity: typeof Entity, query: QueryBuilder, pageId: number = 0, limit: number = 24): Promise<T[]> {
    const res = await this.request(CustomEntity, HTTP_METHOD.GET, `query?pageSize=${limit}&page=${pageId}&matcher=${query.toString()}`)
    return res.data.data.map((properties: any) => new CustomEntity(properties))
  }

  /**
   * Return the number of matched results.
   *
   * @param CustomEntity the entity model to count rows.
   * @param query the constraint to filter number.
   * @returns
   */
  async count (CustomEntity: typeof Entity, query: QueryBuilder): Promise<Number> {
    const res = await this.request(CustomEntity, HTTP_METHOD.GET, `/count?matcher=${query.toString()}`)
    return Number(res.data.data)
  }

  /**
   * API request helper function.
   *
   * @param T the entity model to access.
   * @param method the HTTP method for the requst.
   * @param path the API path in the entity level.
   * @param requestBody optional payload.
   * @returns
   */
  private async request (T: typeof Entity, method: HTTP_METHOD, path: string, requestBody = {}): Promise<AxiosResponse> {
    return await SDK.request(method, `database/${this.id}/CustomEntity/${T._tableName}/${path}`, requestBody)
  }
}
