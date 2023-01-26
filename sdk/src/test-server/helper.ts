import Database from 'better-sqlite3'

export const db: Database.Database = new Database('./data/default.db')

/**
 * Helper function to encode parameter into sql statement
 *
 * @param val
 */
export function b (val: any): string {
  if (typeof val === null) return 'NULL'
  if (typeof val === 'string') return `'${val}'`
  else return val as string
}

/**
 * Translate a mongodb like query object into SQL statement.
 *
 * @param query the query object
 * @returns
 */
export function whereParser (query: any): string {
  const ref = {
    $lt: '<',
    $le: '<=',
    $gt: '>',
    $ge: '<=',
    $ne: '!='
  }
  const whereArray: string[] = []
  // key is field name, val may be a string as full match or a object to do advance match
  Object.keys(query).forEach((key: string) => {
    const val: any = query[key]
    if (typeof val !== 'object' || val === null) {
      // full match
      if (val === null) whereArray.push(`${key} IS NULL`)
      else whereArray.push(`${key}=${b(val)}`)
    } else {
      // advance match
      // k is advance matcher key, v is match value
      Object.keys(val).forEach((k: string) => {
        const v: string | null = val[k]
        if (k === '$like') { // $text query looks a little different then other querys
          whereArray.push(`${key} LIKE '%${v}%'`)
        } else {
          whereArray.push(`${key}${ref[k as keyof typeof ref]}${b(v)}`)
        }
      })
    }
  })
  // join all condition statements with AND
  const sqlStatement = `WHERE (${whereArray.join(' AND ')})`
  return sqlStatement
}
