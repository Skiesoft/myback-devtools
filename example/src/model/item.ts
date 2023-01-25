import { List } from './list'
import { Model, attribute } from '@myback/sdk'

export class Item extends Model {
  protected static tableName: string = 'items'

  @attribute({ primary: true })
    id?: number

  @attribute()
    name?: string

  @attribute()
    checked: boolean = false

  @attribute()
    list?: List
}
