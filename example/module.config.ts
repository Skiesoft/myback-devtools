import { List } from './src/model/list'
import { Item } from './src/model/item'

module.exports = {
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
