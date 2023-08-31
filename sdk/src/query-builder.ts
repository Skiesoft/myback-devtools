export type ValueType = number | string | null
export type Comparators = 'eq' | 'ne' | 'lt' | 'le' | 'gt' | 'ge' | 'like'
export interface CompareType {
  type: 'comp'
  key: string
  op: Comparators
  value: ValueType
}
export interface AndType {
  type: 'and'
  and: Constaints[]
}
export interface OrType {
  type: 'or'
  or: Constaints[]
}
export type Constaints = CompareType | OrType | AndType
export interface OrderBy {
  column: string
  order: 'asc' | 'desc'
}
export interface Query {
  where?: Constaints
  orderBy?: OrderBy
}

export function compare (k: string, c: Comparators, v: ValueType): Query {
  const res: CompareType = {
    type: 'comp',
    key: k,
    op: c,
    value: v
  }
  return { where: res }
}

export function and (...v: Query[]): Query {
  const res: AndType = {
    type: 'and',
    and: v.map((e) => {
      if (e.where === undefined) throw new Error('AND operator can not have empty query input.')
      return e.where
    })
  }
  return { where: res }
}

export function or (...v: Query[]): Query {
  const res: OrType = {
    type: 'or',
    or: v.map((e) => {
      if (e.where === undefined) throw new Error('OR operator can not have empty query input.')
      return e.where
    })
  }
  return { where: res }
}

export function equal (k: string, v: ValueType): Query {
  return compare(k, 'eq', v)
}

export function notEqual (k: string, v: ValueType): Query {
  return compare(k, 'ne', v)
}

export function lessThan (k: string, v: ValueType): Query {
  return compare(k, 'lt', v)
}

export function lessOrEqualThan (k: string, v: ValueType): Query {
  return compare(k, 'le', v)
}

export function greaterThan (k: string, v: ValueType): Query {
  return compare(k, 'gt', v)
}

export function greaterOrEqualThan (k: string, v: ValueType): Query {
  return compare(k, 'ge', v)
}

export function like (k: string, v: ValueType): Query {
  return compare(k, 'like', v)
}

export function orderBy (q: Query, k: string, order: 'asc' | 'desc' = 'asc'): Query {
  q.orderBy = {
    column: k,
    order
  }
  return q
}
