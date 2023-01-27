import { attribute, Model } from '@myback/sdk'

export class List extends Model {
  protected static tableName: string = 'lists'

  @attribute({ type: 'int', primary: true, autoIndex: true })
    id?: number

  @attribute({ type: 'string' })
    name?: string
}
