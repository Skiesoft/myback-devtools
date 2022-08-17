export { SDK, QueryBuilder };
import QueryBuilder from "./models/query-builder";
import SDKInterface from "./interface";
import ResourceModel from "./models/resource";

declare class SDK extends SDKInterface {
    /**
     * Constructor of the controller of resource.
     *
     * @param {string} apiKey
     */
    constructor(apiKey: string);
    /**
     * Return the array of resource models.
     *
     * @returns {ResourceModel[]}
     */
    getResources(): ResourceModel[];
    getOriginalResources(): ResourceModel[];
    getMappedResources(): ResourceModel[];
    getResourceById(id: string): ResourceModel;
}


