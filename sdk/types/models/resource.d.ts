export default class ResourceModel extends SDKInterface {
    /**
     * Constructor of the controller of resource.
     *
     * @param {string} apiKey
     * @param {number} resourceId must be an integer.
     */
    constructor(apiKey: string, resourceId: number);
    resourceId: number;
    /**
     * Return the array of collection models in specified resource.
     *
     * @returns {CollectionModel[]}
     */
    getCollections(): CollectionModel[];
    getCollectionById(id: string): CollectionModel;
}
import SDKInterface from "../interface";
import CollectionModel from "./collection";
