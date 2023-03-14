import express from 'express'
import { concatExpression, db, ParamType, QueryParser } from '../helper'

const router = express.Router()

router.get('/', (req, res) => {
  const stmt = db.prepare("SELECT name FROM sqlite_schema WHERE type ='table' AND name NOT LIKE 'sqlite_%'")
  const result = stmt.all()
  res.send({ data: result.map((row) => ({ id: row.name })) })
})

router.get('/:model', (req, res) => {
  const stmt = db.prepare(`SELECT * FROM ${req.params.model}`)
  const result = stmt.all()
  res.send({ data: result })
})

router.post('/:model', (req, res) => {
  if (req.body === undefined) {
    res.status(400).send({ data: { error: 'Missing Body' } })
    return
  }
  const columns: string = Object.keys(req.body.data).join(',')
  const placeholder: string = Object.keys(req.body.data).map(() => '?').join(',')
  const { model } = req.params
  let stmt = db.prepare(`INSERT INTO ${model} (${columns}) VALUES (${placeholder})`)
  let values = Object.values(req.body.data)
  values = values.map((v) => (typeof v === 'boolean' ? Number(v) : v))
  stmt.run(...values)
  stmt = db.prepare('SELECT last_insert_rowid() AS rowid')
  const { rowid } = stmt.get()
  stmt = db.prepare(`SELECT * FROM ${model} WHERE rowid=?`)
  const result = stmt.get(rowid)
  res.send({ data: result })
})

router.put('/:model', (req, res) => {
  if (req.body.data === undefined) {
    res.status(400).send({ error: 'Missing Body' })
    return
  }
  if (req.query.matcher === undefined) {
    res.status(400).send({ error: 'Missing Matcher' })
    return
  }
  const { model } = req.params
  const matcher = JSON.parse(req.query.matcher as string)
  const { data } = req.body
  const expr = QueryParser(matcher)
  const res2: (object | undefined) = db.prepare(`SELECT rowid FROM ${model} ${expr.query}`).get(...expr.params)
  if (res2 === undefined) {
    res.status(404).send({ error: 'No match' })
    return
  }
  const id = Object.values(res2)[0] as number
  const setter = Object.entries(data).map(([k, v]) => ({ query: `${k}=?`, params: [v as ParamType] }))
  const expr2 = concatExpression(setter, `UPDATE ${model} SET `, ' WHERE rowid=?', ',')
  expr2.params.push(id)
  db.prepare(expr2.query).run(...expr2.params)
  res.send({ data: db.prepare(`SELECT * FROM ${model} WHERE rowid=?`).get(id) })
})

router.delete('/:model', (req, res) => {
  if (req.query.matcher === undefined) {
    res.status(400).send({ error: 'Missing Matcher' })
    return
  }
  const { model } = req.params
  const matcher = JSON.parse(req.query.matcher as string)
  const expr = QueryParser(matcher)
  if (db.prepare(`SELECT * FROM ${model} ${expr.query}`).get(...expr.params) == null) {
    res.status(404).send({ error: 'No match' })
    return
  }
  db.prepare(`DELETE FROM ${model} ${expr.query} LIMIT 1`).run(...expr.params)
  res.status(200).send('Deleted')
})

router.get('/:model/query', (req, res) => {
  const page = Number(req.query.page ?? 0)
  const pageSize = Number(req.query.pageSize ?? 24)
  if (req.query.matcher === null) {
    res.status(400).send({ error: 'Missing Matcher' })
    return
  }
  const { model } = req.params
  const matcher = JSON.parse((req.query.matcher ?? '{}') as string)
  const expr = QueryParser(matcher)
  const stmt = db.prepare(`SELECT * FROM ${model} ${expr.query} LIMIT ${pageSize} OFFSET ${page * pageSize}`)
  const result = stmt.all(...expr.params)
  res.send({ data: result })
})

router.get('/:model/get-relation', (req, res) => {
  if (req.query.matcher === undefined) {
    res.status(400).send({ error: 'Missing Matcher' })
    return
  }

  const { model } = req.params
  const matcher = JSON.parse(req.query.matcher as string)
  const expr = QueryParser(matcher)
  const row = db.prepare(`SELECT * FROM ${model} ${expr.query}`).get(...expr.params)
  if (row == null) {
    res.status(404).send({ error: 'No match' })
    return
  }

  const foreignKeys = db.prepare(`SELECT * FROM pragma_foreign_key_list('${model}')`).all()
  const relations: any = {}
  for (const { from, to, table } of foreignKeys) {
    const data = db.prepare(`SELECT * FROM ${table as string} WHERE ${to as string}=?`).get(row[from])
    relations[from] = data
  }
  res.send({ data: relations })
})

router.get('/:model/count', (req, res) => {
  const { model } = req.params
  const matcher = JSON.parse(req.query.matcher as string)
  const expr = QueryParser(matcher)
  const count = (db.prepare(`SELECT COUNT(*) FROM ${model} ${expr.query}`).get(...expr.params))['COUNT(*)']
  res.send({ data: count })
})

router.get('/:model/sum', (req, res) => {
  const { model } = req.params
  const column = req.query.column as string
  const matcher = JSON.parse(req.query.matcher as string)
  const expr = QueryParser(matcher)
  const sum = (db.prepare(`SELECT SUM(${column}) AS ANS FROM ${model} ${expr.query}`).get(...expr.params)).ANS
  res.send({ data: sum })
})

export default router
