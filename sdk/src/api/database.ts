import { HTTP_METHOD, SDK } from '../sdk'
import { Query } from '../query-builder'

function queryToMatcher (query: Query): string {
  return encodeURIComponent(JSON.stringify(query))
}

/**
 * Request a database on MyBack server.
 *
 */
export default {

  /**
   * Save the object to the database.
   *
   * @param id the id of the database.
   * @param tablename the name of the model.
   * @param properties the object to save.
   */
  async save (id: string, tablename: string, properties: object): Promise<any> {
    const res = await SDK.request(
      HTTP_METHOD.POST,
      `database/${id}/model/${tablename}/`,
      { data: properties }
    )
    return res.data.data
  },

  /**
   * Update the object in the database.
   *
   * @param id the id of the database.
   * @param tablename the name of the model.
   * @param query the query to specify replace constraints.
   * @param properties the object to save.
   */
  async update (id: string, tablename: string, query: Query, properties: object): Promise<any> {
    const res = await SDK.request(
      HTTP_METHOD.PUT,
      `database/${id}/model/${tablename}/?matcher=${queryToMatcher(query)}`,
      { data: properties }
    )
    return res.data.data
  },

  /**
   * Delete the object from the database.
   *
   * @param id the id of the database.
   * @param tablename the name of the model.
   * @param query the query to specify deletion constraints.
   */
  async destroy (id: string, tablename: string, query: Query): Promise<void> {
    await SDK.request(
      HTTP_METHOD.DELETE,
      `database/${id}/model/${tablename}/?matcher=${queryToMatcher(query)}`
    )
  },

  /**
   * Return the result by the given query with default paging.
   *
   * @param id the id of the database.
   * @param tablename the name of the model.
   * @param query query to filter result.
   * @param pageId the page number.
   * @param limit the maxmium limit of each page.
   */
  async find (id: string, tablename: string, query: Query | null = null, pageId: number | null = null, limit: number | null = null): Promise<any[]> {
    let uri = `database/${id}/model/${tablename}/?`
    if (query != null) uri += `&matcher=${queryToMatcher(query)}`
    if (pageId != null) uri += `&page=${pageId}`
    if (limit != null) uri += `&pageSize=${limit}`
    const res = await SDK.request(HTTP_METHOD.GET, uri)
    return res.data.data
  },

  /**
   * Return the number of matched results.
   *
   * @param id the id of the database.
   * @param tablename the name of the model.
   * @param query query to filter result.
   * @returns
   */
  async count (id: string, tablename: string, query: Query | null = null): Promise<Number> {
    let uri = `database/${id}/model/${tablename}/count`
    if (query != null) uri += `?matcher=${queryToMatcher(query)}`
    const res = await SDK.request(HTTP_METHOD.GET, uri)
    return Number(res.data.data)
  },

  /**
   * Return the sum of the column in matched rows.
   *
   * @param id the id of the database.
   * @param tablename the name of the model.
   * @param column the column to sum.
   * @param query query to filter result.
   * @returns
   */
  async sum (id: string, tablename: string, column: string, query: Query | null = null): Promise<Number> {
    let uri = `database/${id}/model/${tablename}/sum?column=${column}`
    if (query != null) uri += `&matcher=${queryToMatcher(query)}`
    const res = await SDK.request(HTTP_METHOD.GET, uri)
    return Number(res.data.data)
  },

  async findRelation (id: string, tablename: string, query: Query = {}): Promise<any> {
    const uri = `database/${id}/model/${tablename}/get-relation?matcher=${queryToMatcher(query)}`
    const res = await SDK.request(HTTP_METHOD.GET, uri)
    return res.data.data
  }
}
