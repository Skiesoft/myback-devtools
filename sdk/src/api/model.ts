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
    const props: any = {}
    for (const attr of this._attributes) {
      props[attr] = this[attr as keyof typeof this] ?? null
    }
    return props
  }
}
