
export class Config {
  public static get (key: string): string {
    return (window as any).MYBACK_MODULE_CONFIGS[key]
  }
}
