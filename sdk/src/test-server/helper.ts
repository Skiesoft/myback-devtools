import Database from 'better-sqlite3'
import { Constaints, Query } from 'src/api/query-builder'

export const db: Database.Database = new Database('./data/default.db')

/**
 * Helper function to encode parameter into sql statement
 *
 * @param val
 */
export function b (val: any): string {
  if (val === null) return 'NULL'
  if (typeof val === 'string') return `'${val}'`
  else return val as string
}

function WhereParser (where: Constaints): string {
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
      return `${where.key} ${ref[where.op]} ${b(where.value)}`
    case 'and':
      return '(' + where.and.map((e) => WhereParser(e)).join(' AND ') + ')'
    case 'or':
      return '(' + where.or.map((e) => WhereParser(e)).join(' OR ') + ')'
  }
}

/**
 * Translate query object into SQL statement.
 *
 * @param query the query object
 * @returns
 */
export function QueryParser (query: Query): string {
  let stmt: string = ''
  if (query.where !== undefined) {
    stmt += `WHERE ${WhereParser(query.where)} `
  }
  if (query.orderBy !== undefined) {
    stmt += `ORDER BY ${query.orderBy.column} ${query.orderBy.order} `
  }
  return stmt
}
