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
    return res.data.mapped.data.concat(res.data.original.data).map(({ id }) => new ResourceModel(id));
  }

  /**
   * Return the array of original resource models.
   *
   * @returns {ResourceModel[]}
   */
  async getOriginalResources() {
    const res = await this.request(SDKInterface.HTTP_GET, 'resource/');
    return res.data.original.data.map(({ id }) => new ResourceModel(id));
  }

  /**
   * Return the array of mapped resource models.
   *
   * @returns {ResourceModel[]}
   */
  async getMappedResources() {
    const res = await this.request(SDKInterface.HTTP_GET, 'resource/');
    return res.data.mapped.data.map(({ id }) => new ResourceModel(id));
  }

  /**
   * Return reousrce model with given name.
   *
   * @param {string} id Id of the resource
   * @returns {ResourceModel}
   */
  getResourceById(id) {
    return new ResourceModel(id);
  }
}

export default {
  SDK,
  QueryBuilder,
};
