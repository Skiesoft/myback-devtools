import type { Item } from "./item";
import { attribute, Model } from '@feline-studio/myback-sdk';

export class List extends Model {
    @attribute()
    id: number = 0;
    
    @attribute()
    name: string = '';

    @attribute()
    items: Item[] = [];
}
