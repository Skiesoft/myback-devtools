export default class SDK extends SDKInterface {
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
    getResourceById(id: number): ResourceModel;
    getResourceByName(name: string): ResourceModel;
}
import SDKInterface from "./interface";
import ResourceModel from "./models/resource";
