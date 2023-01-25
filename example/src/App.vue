<script lang="ts">
import { Database } from '@myback/sdk'
import { Item } from './model/item'
import Form from './components/Form.vue'

export default {
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
      this.items = await db.all(Item)
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
}
</script>

<template>
  <main class="container p-5">
    <h1>Simple Todo List</h1>
    <div class="d-flex justify-content-center">
      <ul class="list-group">
        <li class="list-group-item" v-for="item in items" style="width: 25rem;">
          <div class="ms-2 me-auto">
            <span class="">{{ item.checked }}</span>
            {{ item.name }}
          </div>
          <span><button class="btn btn-danger" @click="remove(item)">Delete</button></span>
        </li>
      </ul>
    </div>
    <Form @submitted="updateList"></Form>
  </main>
</template>
