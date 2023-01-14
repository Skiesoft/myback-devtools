import { Model } from './model'

interface RelationType {
  in: any
  out: any
}

export class Relation {
  private readonly relations: RelationType

  /**
   * Constructor of the entity.
   *
   * @param relations the relationship information from API.
   */
  constructor (relations: RelationType | any) {
    this.relations = relations as RelationType
  }

  /**
   * Return all entities of a model with inbound (foreign key on that side) relation.
   *
   * @param T the related entity model to retrieve.
   * @returns
   */
  getInbound (T: typeof Model): any[] {
    return this.relations.in[T.name].map((data: any) => new T(data))
  }

  /**
   * Return all entities of a model with outbound (foreign key on this side) relation.
   *
   * @param T the related entity model to retrieve.
   * @returns
   */
  getOutbound (T: typeof Model): any[] {
    return this.relations.out[T.name].map((data: any) => new T(data))
  }
}
