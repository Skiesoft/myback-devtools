import express from 'express'
import { b, db, QueryParser } from '../helper'

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
  const values: string = Object.values<number | string>(req.body.data).map((v) => (typeof v === 'string' ? `'${v}'` : `${v}`)).join(',')
  const { model } = req.params
  let stmt = db.prepare(`INSERT INTO ${model} (${columns}) VALUES (${values})`)
  stmt.run()
  stmt = db.prepare('SELECT last_insert_rowid() AS rowid')
  const { rowid } = stmt.get()
  stmt = db.prepare(`SELECT * FROM ${model} WHERE rowid=${rowid as string}`)
  const result = stmt.get()
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
  const res2: (object | undefined) = db.prepare(`SELECT rowid FROM ${model} ${QueryParser(matcher)}`).get()
  if (res2 === undefined) {
    res.status(404).send({ error: 'No match' })
    return
  }
  const id = Object.values(res2)[0] as number
  const setter = Object.entries(data).map(([k, v]) => `${k}=${b(v)}`).join(', ')
  db.prepare(`UPDATE ${model} SET ${setter} WHERE rowid=${id}`).run()
  res.send({ data: db.prepare(`SELECT * FROM ${model} WHERE rowid=${id}`).get() })
})

router.delete('/:model', (req, res) => {
  if (req.query.matcher === undefined) {
    res.status(400).send({ error: 'Missing Matcher' })
    return
  }
  const { model } = req.params
  const matcher = JSON.parse(req.query.matcher as string)
  if (db.prepare(`SELECT * FROM ${model} ${QueryParser(matcher)}`).get() == null) {
    res.status(404).send({ error: 'No match' })
    return
  }
  db.prepare(`DELETE FROM ${model} ${QueryParser(matcher)} LIMIT 1`).run()
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
  const stmt = db.prepare(`SELECT * FROM ${model} ${QueryParser(matcher)} LIMIT ${pageSize} OFFSET ${page * pageSize}`)
  const result = stmt.all()
  res.send({ data: result })
})

router.get('/:model/relation', (req, res) => {
  if (req.query.matcher === undefined) {
    res.status(400).send({ error: 'Missing Matcher' })
    return
  }

  const { model } = req.params
  const matcher = JSON.parse(req.query.matcher as string)
  const row = db.prepare(`SELECT * FROM ${model} ${QueryParser(matcher)}`).get()
  if (row == null) {
    res.status(404).send({ error: 'No match' })
    return
  }

  const outForeignKeys = db.prepare(`SELECT * FROM pragma_foreign_key_list('${model}')`).all()
  const outboundRelation: any = {}
  for (const { from, to, table } of outForeignKeys) {
    const data = db.prepare(`SELECT * FROM ${table as string} WHERE ${to as string}=${row[from] as string}`).all()
    outboundRelation[table] = { data }
  }
  const tables = (db.prepare("SELECT name FROM sqlite_schema WHERE type ='table' AND name NOT LIKE 'sqlite_%'").all())
    .filter(({ name }) => name !== model)
  const inboundRelation: any = {}
  for (const { name } of tables) {
    const foreignKeys = db.prepare(`SELECT * FROM pragma_foreign_key_list('${name as string}')`).all()
    for (const { from, to, table } of foreignKeys) {
      if (table !== model) { continue }
      const data = db.prepare(`SELECT * FROM ${name as string} WHERE ${from as string}=${row[to] as string}`).all()
      inboundRelation[name] = { data: (inboundRelation[name]?.data ?? []).concat(data) }
    }
  }
  res.send({ in: inboundRelation, out: outboundRelation })
})

router.get('/:model/count', (req, res) => {
  const { model } = req.params
  const matcher = JSON.parse(req.query.matcher as string)
  const count = (db.prepare(`SELECT COUNT(*) FROM ${model} ${QueryParser(matcher)}`).get())['COUNT(*)']
  res.send({ data: count })
})

router.get('/:model/sum', (req, res) => {
  const { model } = req.params
  const column = req.query.column as string
  const matcher = JSON.parse(req.query.matcher as string)
  const sum = (db.prepare(`SELECT SUM(${column}) AS ANS FROM ${model} ${QueryParser(matcher)}`).get()).ANS
  res.send({ data: sum })
})

export default router
