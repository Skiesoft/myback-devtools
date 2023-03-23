import { List } from './src/model/list'
import { Item } from './src/model/item'
import { ModuleConfig } from '@myback/sdk'

const config: ModuleConfig = {
  name: 'Simple Todo List',
  description: 'Example module of a simple todo list.',
  models: [List, Item],
  configables: [
    {
      key: 'todo-lists',
      type: 'list',
      userspace: false,
      columns: [
        {
          key: 'name',
          type: 'string',
        }
      ],
      default: [
        {
          name: 'First todo list',
        },
      ]
    }
  ]
}

module.exports = config
