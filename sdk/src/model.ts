export class Model {
  protected static tableName: string = ''
  private _oldProperties: object = {}

  private get _attributes (): string[] {
    return Reflect.getMetadata('attributes', this)
  }

  public constructor (props: any = {}) {
    for (const attr of this._attributes) {
      this[attr as keyof typeof this] = props[attr]
    }
    this.updateOldProperties()
  }

  public static getTableName (): string {
    return this.tableName
  }

  public getOldProperties (): object {
    return this._oldProperties
  }

  public updateOldProperties (): void {
    this._oldProperties = this.getProperties()
  }

  public getProperties (): object {
    const props: any = {}
    for (const attr of this._attributes) {
      props[attr] = this[attr as keyof typeof this] ?? null
    }
    return props
  }
}
