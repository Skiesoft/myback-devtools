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
    const resources = await this.getResources();
    if (id < 0) return undefined;
    return resources[id];
  }

  async getResourceByName(name) {
    return (await this.getResources()).find((ele) => ele.name === name.toString());
  }
}

export default {
  SDK,
  QueryBuilder,
};
