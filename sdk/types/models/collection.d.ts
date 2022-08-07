export default class CollectionModel extends SDKInterface {
    /**
     * Constructor of the controller of resource.
     *
     * @param {string} apiKey
     * @param {number} resourceId must be an integer.
     * @param {string} collectionId
     */
    constructor(apiKey: string, resourceId: number, collectionId: string);
    resourceId: number;
    collectionId: string;
    /**
     * Return the array of a page in the collection.
     *
     * @param {number} pageId must be an integer.
     * @param {number} limit must be an integer.
     * @returns {ObjectModel[]}
     */
    getPage(pageId?: number, limit?: number): ObjectModel[];
    /**
     * Return the newly created object.
     *
     * @param {object} properties object the properties for the new object.
     * @returns {ObjectModel}
     */
    createObject(properties: object): ObjectModel;
    /**
     * Return the result by the given query.
     *
     * @param {QueryBuilder} querybuilder query to filter the output.
     * @param {number} pageId must be an integer.
     * @param {number} limit must be an integer.
     * @returns {ObjectModel[]}
     */
    query(querybuilder: QueryBuilder, pageId?: number, query?: number): ObjectModel[];
}
import SDKInterface from "../interface";
import ObjectModel from "./object";
import QueryBuilder from "./query-builder";
