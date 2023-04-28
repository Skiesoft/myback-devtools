import { AxiosResponse } from 'axios'
import { QueryBuilder } from '../'
import { HTTP_METHOD, SDK } from '../sdk'
import { Model } from './model'
import { Query, ValueType } from './query-builder'

/**
 * Represent a database in backend. Use for retrieve {@link Table}
 *
 */
export class Database {
  private readonly id: string

  /**
   * Constructor of the controller of resource.
   *
   */
  constructor () {
    this.id = SDK.config.DATABASE!
  }

  private queryToMatcher (query: Query): string {
    return encodeURIComponent(JSON.stringify(query))
  }

  private entityToMatcher<T extends Model>(entity: T): string {
    const props = entity.getOldProperties()
    if (props === null) throw new Error('Can not convert null entity to matcher, probably not saved yet.')
    const eqs = Object.entries(props).map(([attr, val]) => QueryBuilder.equal(attr, val as ValueType))
    return this.queryToMatcher(QueryBuilder.and(...eqs))
  }

  /**
   * Save the object to the database.
   *
   * @param CustomEntity the entity model.
   * @param entity the entity object to save.
   */
  async save<T extends Model>(CustomEntity: typeof Model, entity: T): Promise<void> {
    let res: any
    if (entity.getOldProperties() === null) {
      res = await this.request(CustomEntity, HTTP_METHOD.POST, '', { data: entity.getProperties() })
    } else {
      res = await this.request(CustomEntity, HTTP_METHOD.PUT, `?matcher=${this.entityToMatcher(entity)}`, { data: entity.getProperties() })
    }
    entity.loadOldData(res.data.data)
  }

  /**
   * Delete the object from the database.
   *
   * @param CustomEntity the entity model.
   * @param entity the entity object to destroy.
   */
  async destroy<T extends Model>(CustomEntity: typeof Model, entity: T): Promise<void> {
    await this.request(CustomEntity, HTTP_METHOD.DELETE, `?matcher=${this.entityToMatcher(entity)}`)
  }

  /**
   * Return the array of all entities.
   * Use with cautions since result might be massive!
   *
   * @param CustomEntity the entity model to fetch all rows.
   * @returns
   */
  async all (CustomEntity: typeof Model): Promise<any[]> {
    const res = await this.request(CustomEntity, HTTP_METHOD.GET, '')
    return res.data.data.map((properties: any) => Model.loadOldObject(CustomEntity, properties))
  }

  /**
   * Return the array of a page in the collection.
   *
   * @param CustomEntity the entity model to fetch data.
   * @returns
   */
  async page (CustomEntity: typeof Model, pageId: number, limit: number = 24): Promise<any[]> {
    const res = await this.request(CustomEntity, HTTP_METHOD.GET, `query?pageSize=${limit}&page=${pageId}`)
    return res.data.data.map((properties: any) => Model.loadOldObject(CustomEntity, properties))
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
  async find (CustomEntity: typeof Model, query: Query, pageId: number = 0, limit: number = 24): Promise<any[]> {
    const res = await this.request(CustomEntity, HTTP_METHOD.GET, `query?pageSize=${limit}&page=${pageId}&matcher=${this.queryToMatcher(query)}`)
    return res.data.data.map((properties: any) => Model.loadOldObject(CustomEntity, properties))
  }

  /**
   * Return the number of matched results.
   *
   * @param CustomEntity the entity model to count rows.
   * @param query the constraint to filter number.
   * @returns
   */
  async count (CustomEntity: typeof Model, query: Query = {}): Promise<Number> {
    const res = await this.request(CustomEntity, HTTP_METHOD.GET, `count?&matcher=${this.queryToMatcher(query)}`)
    return Number(res.data.data)
  }

  /**
   * Return the sum of the column in matched rows.
   *
   * @param CustomEntity the entity model to count rows.
   * @param column the column to sum.
   * @param query the constraint to filter number.
   * @returns
   */
  async sum (CustomEntity: typeof Model, column: string, query: Query = {}): Promise<Number> {
    const res = await this.request(CustomEntity, HTTP_METHOD.GET, `sum?column=${column}&matcher=${this.queryToMatcher(query)}`)
    return Number(res.data.data)
  }

  public async loadRelation<T extends Model>(CustomEntity: typeof Model, entity: T): Promise<any> {
    const res = await this.request(CustomEntity, HTTP_METHOD.GET, `get-relation?&matcher=${this.entityToMatcher(entity)}`)
    entity.loadOldData(res.data.data)
    return entity
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
  private async request (T: typeof Model, method: HTTP_METHOD, path: string, requestBody = {}): Promise<AxiosResponse> {
    return await SDK.request(method, `database/${this.id}/model/${T.getTableName()}/${path}`, requestBody)
  }
}
