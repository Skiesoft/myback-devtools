import { attribute, Model } from '../../src'
import { Sample2 } from './sample2'

export class Sample1 extends Model {
  protected static tableName: string = 'sample1'
  @attribute({ primary: true, autoIndex: true, type: 'int' })
    id?: number

  @attribute({ type: 'string', unique: true })
    name?: string

  @attribute({ type: 'int' })
    age?: number

  @attribute({ type: 'date' })
    date?: Date

  @attribute({ type: 'datetime' })
    datetime?: Date

  @attribute({ type: 'relation', nullable: true })
    belongsTo?: Sample2
}
