import { SDK } from '../sdk'
import DatabaseAPI from '../api/database'
import { Model } from './model'
import * as QueryBuilder from '../query-builder'
import { Query, ValueType } from '../query-builder'

function entityToQuery<T extends Model> (entity: T): Query {
  const props = entity.getOldProperties()
  if (props === null) throw new Error('Can not convert null entity to matcher, probably not saved yet.')
  const eqs = Object.entries(props).map(([attr, val]) => QueryBuilder.equal(attr, val as ValueType))
  return QueryBuilder.and(...eqs)
}

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
    if (SDK.config.DATABASE === undefined) {
      throw new Error('Undefined database in SDK configuration.')
    }
    this.id = SDK.config.DATABASE
  }

  /**
   * Save the object to the database.
   *
   * @param CustomEntity the entity model.
   * @param entity the entity object to save.
   */
  async save<T extends Model>(CustomEntity: typeof Model, entity: T): Promise<void> {
    const tablename = CustomEntity.getTableName()
    let data: any
    if (entity.getOldProperties() === null) {
      data = await DatabaseAPI.save(this.id, tablename, entity.getProperties())
    } else {
      data = await DatabaseAPI.update(this.id, tablename, entityToQuery(entity), entity.getProperties()
      )
    }
    entity.loadOldData(data)
  }

  /**
   * Delete the object from the database.
   *
   * @param CustomEntity the entity model.
   * @param entity the entity object to destroy.
   */
  async destroy<T extends Model>(CustomEntity: typeof Model, entity: T): Promise<void> {
    await DatabaseAPI.destroy(this.id, CustomEntity.getTableName(), entityToQuery(entity))
  }

  /**
   * @deprecated Please directly use find() instead
   *
   * Return the array of all entities.
   * Use with cautions since result might be massive!
   *
   * @param CustomEntity the entity model to fetch all rows.
   * @returns
   */
  async all (CustomEntity: typeof Model): Promise<any[]> {
    const res = await DatabaseAPI.find(this.id, CustomEntity.getTableName())
    return res.map((properties: any) => Model.loadOldObject(CustomEntity, properties))
  }

  /**
   * @deprecated Please directly use find() instead
   * Return the array of a page in the collection.
   *
   * @param CustomEntity the entity model to fetch data.
   * @returns
   */
  async page (CustomEntity: typeof Model, pageId: number, limit: number = 24): Promise<any[]> {
    const res = await DatabaseAPI.find(this.id, CustomEntity.getTableName(), null, pageId, limit)
    return res.map((properties: any) => Model.loadOldObject(CustomEntity, properties))
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
  async find (CustomEntity: typeof Model, query: Query | null = null, pageId: number = 0, limit: number = 24): Promise<any[]> {
    const res = await DatabaseAPI.find(this.id, CustomEntity.getTableName(), query, pageId, limit)
    return res.map((properties: any) => Model.loadOldObject(CustomEntity, properties))
  }

  /**
   * Return the number of matched results.
   *
   * @param CustomEntity the entity model to count rows.
   * @param query the constraint to filter number.
   * @returns
   */
  async count (CustomEntity: typeof Model, query: Query | null = null): Promise<Number> {
    return await DatabaseAPI.count(this.id, CustomEntity.getTableName(), query)
  }

  /**
   * Return the sum of the column in matched rows.
   *
   * @param CustomEntity the entity model to count rows.
   * @param column the column to sum.
   * @param query the constraint to filter number.
   * @returns
   */
  async sum (CustomEntity: typeof Model, column: string, query: Query | null = null): Promise<Number> {
    return await DatabaseAPI.sum(this.id, CustomEntity.getTableName(), column, query)
  }

  public async loadRelation<T extends Model>(CustomEntity: typeof Model, entity: T): Promise<any> {
    const data = await DatabaseAPI.findRelation(this.id, CustomEntity.getTableName(), entityToQuery(entity))
    entity.loadOldData(data)
    return entity
  }
}
