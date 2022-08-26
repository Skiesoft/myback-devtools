/**
 * Help building matcher string
 */
export default class QueryBuilder {
  constructor() {
    this.constraints = {};
  }

  equal(k, v) {
    this.constraints[k] = v;
    return this;
  }

  setConstraints(k, c, v) {
    if (typeof this.constraints[k] !== 'object') this.constraints[k] = {};
    this.constraints[k][c] = v;
  }

  or( ...v){
    if (! Array.isArray(this.constraints['$or'])) this.constraints['$or'] = [];
    for (let i=0; i<v.length; i++) this.constraints['$or'].push(v[i].constraints);
    return this;
  }

  notEqual(k, v) {
    this.setConstraints(k, '$ne', v);
    return this;
  }

  lessThan(k, v) {
    this.setConstraints(k, '$lt', v);
    return this;
  }

  lessOrEqualThan(k, v) {
    this.setConstraints(k, '$le', v);
    return this;
  }

  greaterThan(k, v) {
    this.setConstraints(k, '$gt', v);
    return this;
  }

  greaterOrEqualThan(k, v) {
    this.setConstraints(k, '$ge', v);
    return this;
  }

  toString() {
    return JSON.stringify(this.constraints);
  }
}
