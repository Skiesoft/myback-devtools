import type { List } from "./list";
import { Model, attribute } from '@feline-studio/myback-sdk';

export class Item extends Model {
    @attribute()
    id: number = 0;
    
    @attribute()
    name: string = '';

    @attribute()
    check: boolean = false;

    @attribute()
    list?: List
}
