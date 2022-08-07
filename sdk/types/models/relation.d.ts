import RelationCollectionModel from "./relation-collections";

export default class RelationModel {
  constructor(resourceId: number, collectionId: string, res: any);
  getInboundRelationships(): RelationCollectionModel;
  getOutboundRelationships(): RelationCollectionModel;
}