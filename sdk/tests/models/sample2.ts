import { attribute, Model } from '../../src'

export class Sample2 extends Model {
  protected static tableName: string = 'sample2'
  @attribute({ primary: true, autoIndex: true, type: 'int' })
    id?: number

  @attribute({ type: 'string' })
    text?: string
}
