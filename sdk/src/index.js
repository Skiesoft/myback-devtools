import SDKInterface from './interface';
import ResourceModel from './models/resource';
import QueryBuilder from './models/query-builder';

/**
 * Use for getting all available resource model.
 *
 * @extends SDKInterface
 */
export class SDK extends SDKInterface {
  /**
   * Return the array of resource models.
   *
   * @returns {ResourceModel[]}
   */
  async getResources() {
    const res = await this.request(SDKInterface.HTTP_GET, 'resource/');
    return res.data.data.map(({ id }) => new ResourceModel(id));
  }

  async getResourceById(id) {
    return new ResourceModel(id);
  }
}

export default {
  SDK,
  QueryBuilder,
};
