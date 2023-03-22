interface ConfigableInterface {
  key: string
  userspace?: boolean
  description?: string
}

interface StringConfigable extends ConfigableInterface {
  type: 'string'
  default?: string
}

interface NumberConfigable extends ConfigableInterface {
  type: 'integer' | 'float'
  default?: number
}

interface BooleanConfigable extends ConfigableInterface {
  type: 'boolean'
  default?: boolean
}

type ScalarConfigable = StringConfigable | NumberConfigable | BooleanConfigable

interface OptionConfigable extends ConfigableInterface {
  type: 'options'
  multipleChoice?: boolean
  options: string[]
  default?: string
}

interface ListConfigable extends ConfigableInterface {
  type: 'list'
  columns: Array<ScalarConfigable | OptionConfigable>
  default?: any[]
}

export type Configable = ScalarConfigable | OptionConfigable | ListConfigable

export interface ModuleConfig {
  name: string
  description?: string
  models?: any[]
  configables?: Configable[]
}
