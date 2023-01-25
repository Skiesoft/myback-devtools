export class Model {
  protected static tableName: string = ''
  private _oldProperties: object = {}
  private _new: boolean = true

  private get _attributes (): string[] {
    return Reflect.getMetadata('attributes', this)
  }

  public constructor (props: any = {}, isNew: boolean = true) {
    Object.assign(this, props)
    if (!isNew) {
      this._new = false
      this.updateOldProperties()
    }
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
