import SDKInterface from '../interface';
import ObjectModel from './object';

/**
 * Collection model represent a table/collection in backend.
 * Can use for creating {@link ObjectModel}.
 *
 * @extends SDKInterface
 */
export default class CollectionModel extends SDKInterface {
  /**
   * Constructor of the controller of resource.
   *
   * @param {number} resourceId must be an integer.
   * @param {string} collectionId
   */
  constructor(resourceId, collectionId) {
    super();
    this.resourceId = resourceId;
    this.collectionId = collectionId;
  }

  /**
   * Return the array of a page in the collection.
   *
   * @param {number} pageId must be an integer.
   * @param {number} limit must be an integer.
   * @returns {ObjectModel[]}
 */
  async getPage(pageId = 0, limit = 24) {
    const { resourceId, collectionId } = this;
    let uri = `resource/${resourceId}`;
    uri += `/collection/${collectionId}`;
    uri += `/object?pageSize=${limit}&page=${pageId}`;
    const res = await this.request(SDKInterface.HTTP_GET, uri);
    return res.data.data.map((properties) => new ObjectModel(resourceId, collectionId, properties));
  }

  /**
   * Return the newly created object.
   *
   * @param {object} properties object the properties for the new object.
   * @returns {ObjectModel}
   */
  async createObject(properties) {
    const { resourceId, collectionId } = this;
    let uri = `resource/${resourceId}`;
    uri += `/collection/${collectionId}`;
    uri += '/object';
    const res = await this.request(SDKInterface.HTTP_POST, uri, { data: properties });
    return new ObjectModel(resourceId, collectionId, res.data.data);
  }

  /**
   * Return the result by the given query.
   *
   * @param {QueryBuilder} querybuilder query to filter the output.
   * @param {number} pageId must be an integer.
   * @param {number} limit must be an integer.
   * @returns {ObjectModel[]}
   */
  async query(querybuilder, pageId = 0, limit = 24) {
    const { resourceId, collectionId } = this;
    let uri = `resource/${resourceId}`;
    uri += `/collection/${collectionId}`;
    uri += `/object/query?pageSize=${limit}&page=${pageId}&matcher=${querybuilder.toString()}`;
    const res = await this.request(SDKInterface.HTTP_GET, uri);
    return res.data.data.map((properties) => new ObjectModel(resourceId, collectionId, properties));
  }

  async count(querybuilder) {
    const { resourceId, collectionId } = this;
    let uri = `resource/${resourceId}`;
    uri += `/collection/${collectionId}`;
    uri += `/object/count?matcher=${querybuilder.toString()}`;
    const res = await this.request(SDKInterface.HTTP_GET, uri);
    return res.data.data;
  }
}
