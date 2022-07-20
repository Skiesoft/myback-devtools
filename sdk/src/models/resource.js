import SDKInterface from '../interface';
import CollectionModel from './collection';

/**
 * Represent a database in backend. Use for retrieve {@link CollectionModel}
 *
 * @extends SDKInterface
 */
export default class ResourceModel extends SDKInterface {
  /**
   * Constructor of the controller of resource.
   *
   * @param {number} resourceId must be an integer.
   */
  constructor(resourceId) {
    super();
    this.resourceId = resourceId;
  }

  /**
   * Return the array of collection models in specified resource.
   *
   * @returns {CollectionModel[]}
   */
  async getCollections() {
    const { resourceId } = this;
    const res = await this.request(SDKInterface.HTTP_GET, `resource/${resourceId}`);
    return res.data.data.map(({ id }) => new CollectionModel(resourceId, id));
  }
}
