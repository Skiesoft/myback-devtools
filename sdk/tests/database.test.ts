import { beforeAll, expect, test } from '@jest/globals'
import { Database, QueryBuilder, SDK } from '../src'
import { createSQLiteDatabase } from '../src/test-server/process-config'
import { Sample1 } from './models/sample1'
import { Sample2 } from './models/sample2'

SDK.init({
  API_TOKEN: 'NOT_REQUIRE_FOR_TESTER',
  ENDPOINT: 'http://localhost:3000',
  VERSION: 'v1',
  DATABASE: 'default'
})

beforeAll(async () => {
  await createSQLiteDatabase({
    name: 'test',
    description: 'testing',
    models: [Sample1, Sample2]
  })
})

const db = new Database()
const s1 = new Sample1()
const s2 = new Sample1()

test('Test save object', async () => {
  s1.name = 'Test#& name'
  s1.age = 20
  s1.date = new Date()
  s1.datetime = new Date()
  await db.save(Sample1, s1)
  s2.name = 'Another name'
  s2.age = 90
  s2.date = new Date()
  s2.datetime = new Date()
  await db.save(Sample1, s2)
})

test('Test all method', async () => {
  expect(await db.all(Sample1)).toStrictEqual([s1, s2])
})

test('Test find object', async () => {
  let query = QueryBuilder.greaterThan('age', 100)
  expect((await db.find(Sample1, query)).length).toBe(0)
  query = QueryBuilder.orderBy(QueryBuilder.lessOrEqualThan('age', 50), 'age')
  expect((await db.find(Sample1, query)).length).toBe(1)
  query = QueryBuilder.like('name', '%Test%')
  expect((await db.find(Sample1, query)).length).toBe(1)
})

test('Test order by', async () => {
  let query = QueryBuilder.orderBy(QueryBuilder.greaterThan('age', 0), 'age', 'asc')
  expect(await db.find(Sample1, query)).toStrictEqual([s1, s2])
  query = QueryBuilder.orderBy(QueryBuilder.greaterThan('age', 0), 'age', 'desc')
  expect(await db.find(Sample1, query)).toStrictEqual([s2, s1])
})

test('Test save relation', async () => {
  const tmp = new Sample2()
  tmp.text = 'random'
  await db.save(Sample2, tmp)
  s1.belongsTo = tmp
  await db.save(Sample1, s1)
  const query = QueryBuilder.equal('belongsTo', tmp.id ?? 1)
  expect((await db.find(Sample1, query))).toStrictEqual([s1])
})

test('Test load relation', async () => {
  const tmp: Sample1 = (await db.find(Sample1, QueryBuilder.equal('id', s1.id ?? 1)))[0]
  await db.loadRelation(Sample1, tmp)
  expect(tmp.belongsTo?.text).toBe('random')
})

test('Test page method', async () => {
  expect((await db.page(Sample1, 0, 0)).length).toBe(0)
  expect((await db.page(Sample1, 0, 1)).length).toBe(1)
  expect((await db.page(Sample1, 0, 4)).length).toBe(2)
})

test('Test count method', async () => {
  expect((await db.count(Sample1))).toBe(2)
})

test('Test sum method', async () => {
  expect(await db.sum(Sample1, 'age')).toBe(110)
})

test('Test update object', async () => {
  s1.age = 30
  await db.save(Sample1, s1)
  const vals = await db.all(Sample1)
  expect(vals[0].age).toBe(30)
})

test('Test delete object', async () => {
  await db.destroy(Sample1, s1)
  expect(await db.all(Sample1)).toStrictEqual([s2])
})
