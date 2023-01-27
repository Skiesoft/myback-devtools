import { List } from './list'
import { Model, attribute } from '@myback/sdk'

export class Item extends Model {
  protected static tableName: string = 'items'

  @attribute({ type: 'int', primary: true, autoIndex: true })
    id?: number

  @attribute({ type: 'string' })
    name?: string

  @attribute({ type: 'boolean' })
    checked: boolean = false

  @attribute({ type: 'relation', nullable: true })
    list?: List
}
