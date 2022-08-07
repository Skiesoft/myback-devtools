export default class RelationCollectionModel {
  constructor(resoruceId: string, relatedCollectionId: string, data: object);
  getObjects(): ObjectModel[];
}
import ObjectModel from "./object";