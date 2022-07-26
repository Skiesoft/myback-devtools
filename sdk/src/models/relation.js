import SDKInterface from '../interface';
import RelationCollectionModel from './relation-collection';

export default class RelationModel extends SDKInterface {
  constructor(resourceId, collectionId, res) {
    super();
    this.resourceId = resourceId;
    this.collectionId = collectionId;
    this.response = res;
  }

  getInboundRelationships() {
    return Object.entries(this.response.in).map((ele) => {
      const [collection, { data }] = ele;
      return new RelationCollectionModel(this.resourceId, collection, data);
    });
  }

  getOutboundRelationships() {
    return Object.entries(this.response.out).map((ele) => {
      const [collection, { data }] = ele;
      return new RelationCollectionModel(this.resourceId, collection, data);
    });
  }
}
