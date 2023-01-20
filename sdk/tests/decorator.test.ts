import { expect, test } from '@jest/globals'
import { Database, Model, attribute } from '../src'

test('define model with decorators', () => {
  class Sample extends Model {
    @attribute()
      name: string = ''
  }

  const sample = new Sample()
  const props = sample.getProperties()
  expect(JSON.stringify(props)).toBe(JSON.stringify({ name: '' }))
})
