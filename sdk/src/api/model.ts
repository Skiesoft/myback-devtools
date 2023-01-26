import { AttributeProperty } from './decorator'

export class Model implements Record<string, any> {
  protected static tableName: string = ''
  private _oldProperties: object = {}
  private _new: boolean = true

  private get _attributes (): string[] {
    return Reflect.getMetadata('attributes', this)
  }

  /**
   * Create a object and load old properties.
   *
   * @param CustomeEntity
   * @param props
   * @returns
   */
  public static loadOldObject (CustomeEntity: typeof Model, props: any = {}): any {
    const obj = new CustomeEntity()
    Object.assign(obj, props)
    obj.updateOldProperties()
    return obj
  }

  public static getTableName (): string {
    return this.tableName
  }

  public getOldProperties (): object | null {
    if (this._new) return null
    else return this._oldProperties
  }

  public updateOldProperties (): void {
    this._new = false
    this._oldProperties = this.getProperties()
  }

  public getProperties (): any {
    const res: any = {}
    for (const attr of this._attributes) {
      res[attr] = this[attr as keyof typeof this]
      const prop: AttributeProperty = Reflect.getMetadata('property', this, attr)
      if (res[attr] === undefined && prop.nullable === true) {
        res[attr] = null
      }
    }
    return res
  }
}
