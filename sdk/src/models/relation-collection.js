import SDKInterface from '../interface';
import ObjectModel from './object';

export default class RelationCollectionModel extends SDKInterface {
  constructor(resourceId, relatedCollectionId, data) {
    super();
    this.resourceId = resourceId;
    this.collectionId = relatedCollectionId;
    this.data = data;
  }

  getObjects() {
    return this.data.map((element) => new ObjectModel(this.resourceId, this.collectionId, element));
  }
}
