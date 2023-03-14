<script lang="ts">
import { defineComponent } from 'vue'
import { Database, QueryBuilder } from '@myback/sdk'
import { Item } from '../model/item'
import Form from './Form.vue'

export default defineComponent({
  props: ['list'],
  data() {
    const items: Array<Item> = [];
    return {
      items
    }
  },
  mounted() {
    this.updateList()
  },
  methods: {
    async updateList() {
      const db = new Database()
      const query = QueryBuilder.equal('list', this.list.id)
      this.items = await db.find(Item, query)
    },
    async remove(item: Item) {
      const db = new Database()
      await db.destroy(Item, item)
      this.updateList()
    }
  },
  components: {
    Form
  }
})
</script>

<template>
  <div class="card mb-3">
    <h2 class="card-header">{{ list.name }}</h2>
    <div class="card-body">
      <ul class="list-group">
        <li class="list-group-item" v-for="item in items" style="width: 25rem;">
          <div class="ms-2 me-auto">
            <span class="">{{ item.checked }}</span>
            {{ item.name }}
          </div>
          <span><button class="btn btn-danger" @click="remove(item as Item)">Delete</button></span>
        </li>
      </ul>
    </div>
    <div class="card-footer">
      <Form :list=list @submitted="updateList"></Form>
    </div>
  </div>
</template>
