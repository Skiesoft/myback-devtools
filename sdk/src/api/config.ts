
export class Config {
  public static get (key: string): any {
    return (window as any).MYBACK_MODULE_CONFIGS[key]
  }
}
