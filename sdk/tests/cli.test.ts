import { createSQLiteDatabase, launchFakeAPI } from '../src/cli'
import { expect, test } from '@jest/globals'
import { attribute, Database, Model, SDK } from '../src'

test('launch fake api server', async () => {
  class Sample extends Model {
    protected static tableName: string = 'sample'
    @attribute()
      name: string = ''
  }

  const server = await launchFakeAPI()
  await createSQLiteDatabase({
    name: 'test',
    description: 'testing',
    models: [Sample]
  })

  SDK.init({
    API_KEY: 'NOT_REQUIRE_FOR TESTER',
    ENDPOINT: 'http://localhost:3000',
    VERSION: 'v1',
    DATABASE: 'default'
  })

  const db = new Database()
  const res = await db.all<Sample>(Sample)
  expect(JSON.stringify(res)).toBe(JSON.stringify([]))
  server.close()
})
