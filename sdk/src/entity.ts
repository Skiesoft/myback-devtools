export class Entity {
  public static _tableName: string = ''
  private readonly _attributes: string[] = []
  private _oldProperties: object = {}

  public constructor (props: any) {
    for (const attr of this._attributes) {
      this[attr as keyof typeof this] = props[attr]
    }
    this.updateOldProperties()
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
      props[attr] = this[attr as keyof typeof this]
    }
    return props
  }
}
