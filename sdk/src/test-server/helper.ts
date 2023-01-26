import Database from 'better-sqlite3'

export const db: Database.Database = new Database('./data/default.db')

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
    if (typeof val !== 'object') {
      // full match
      whereArray.push(`${key}='${val as string}'`)
    } else {
      // advance match
      // k is advance matcher key, v is match value
      Object.keys(val).forEach((k: string) => {
        let v: string | null = val[k]
        if (v == null) v = 'NULL'
        if (k === '$like') { // $text query looks a little different then other querys
          whereArray.push(`${key} LIKE '%${v}%'`)
        } else {
          whereArray.push(`${key}${ref[k as keyof typeof ref]}'${v}'`)
        }
      })
    }
  })
  // join all condition statements with AND
  const sqlStatement = `WHERE (${whereArray.join(' AND ')})`
  return sqlStatement
}
