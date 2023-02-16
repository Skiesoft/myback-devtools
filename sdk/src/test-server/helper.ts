import Database from 'better-sqlite3'
import { Constaints, Query } from 'src/api/query-builder'

export const db: Database.Database = new Database('./data/default.db')

export type ParamType = number | string | null
interface Expression {
  query: string
  params: ParamType[]
}

export function concatExpression (exprs: Expression[], prefix: string = '', suffix: string = '', delimiter: string = ' '): Expression {
  return {
    query: prefix + exprs.map((e) => e.query).join(delimiter) + suffix,
    params: Array<any>().concat(...exprs.map((e) => e.params))
  }
}

export function WhereParser (where: Constaints): Expression {
  const ref = {
    eq: '=',
    ne: '!=',
    lt: '<',
    le: '<=',
    gt: '>',
    ge: '<=',
    like: 'LIKE'
  }
  switch (where.type) {
    case 'comp':
      if (where.value === null) {
        return {
          query: `${where.key} IS ${where.op === 'ne' ? 'NOT' : ''} NULL`,
          params: []
        }
      } else {
        return {
          query: `${where.key} ${ref[where.op]} ?`,
          params: [where.value as ParamType]
        }
      }
    case 'and':
      return concatExpression(where.and.map((e) => WhereParser(e)), '(', ')', ' AND ')
    case 'or':
      return concatExpression(where.or.map((e) => WhereParser(e)), '(', ')', ' OR ')
  }
}

/**
 * Translate query object into SQL statement.
 *
 * @param query the query object
 * @returns
 */
export function QueryParser (query: Query): Expression {
  let expr: Expression = {
    query: '',
    params: []
  }
  if (query.where !== undefined) {
    expr = concatExpression([WhereParser(query.where)], ' WHERE ')
  }
  if (query.orderBy !== undefined) {
    expr.query += ` ORDER BY ${query.orderBy.column} ${query.orderBy.order} `
  }
  return expr
}
