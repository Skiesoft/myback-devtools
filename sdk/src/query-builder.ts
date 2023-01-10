/**
 * Help building matcher string
 */
export class QueryBuilder {
  private constraints: any = {}

  equal (k: string, v: string): QueryBuilder {
    this.constraints[k] = v
    return this
  }

  setConstraints (k: string, c: string, v: string): void {
    if (typeof this.constraints[k] !== 'object') {
      this.constraints[k] = {}
    }
    this.constraints[k][c] = v
  }

  or (...v: QueryBuilder[]): QueryBuilder {
    if (!Array.isArray(this.constraints.$or)) this.constraints.$or = []
    for (let i = 0; i < v.length; i++) this.constraints.$or.push(v[i].constraints)
    return this
  }

  notEqual (k: string, v: string): QueryBuilder {
    this.setConstraints(k, '$ne', v)
    return this
  }

  lessThan (k: string, v: string): QueryBuilder {
    this.setConstraints(k, '$lt', v)
    return this
  }

  lessOrEqualThan (k: string, v: string): QueryBuilder {
    this.setConstraints(k, '$le', v)
    return this
  }

  greaterThan (k: string, v: string): QueryBuilder {
    this.setConstraints(k, '$gt', v)
    return this
  }

  greaterOrEqualThan (k: string, v: string): QueryBuilder {
    this.setConstraints(k, '$ge', v)
    return this
  }

  toString (): string {
    return JSON.stringify(this.constraints)
  }
}
