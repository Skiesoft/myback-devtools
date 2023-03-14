import { Config, Database } from '@myback/sdk'
import { List } from './model/list'

/**
 * Function to bootstrap database for the module.
 */
export default async function bootstrap () {
    const todoLists: Array<any> = Config.get('todo-lists')
    const db = new Database()
    const lists = await db.all(List)

    // create new list if not exist
    for( const todoList of todoLists ) {
        if( lists.filter(v => v.name === todoList.name).length == 0 ) {
            const list = new List()
            list.name = todoList.name
            await db.save(List, list)
        }
    }

    // Remove surplus list
    for( const list of lists ) {
        if( todoLists.filter(v => v.name === list.name).length == 0 ) {
            await db.destroy(List, list)
        }
    }
}
