import type { Item } from './item'
import { attribute, Model } from '@myback/sdk'

export class List extends Model {
  protected static tableName: string = 'lists'

  @attribute({ primary: true })
    id?: number

  @attribute()
    name?: string

  @attribute()
    items?: Item[]
}
