<script lang="ts">
import { Database } from '@myback/sdk'
import { Item } from '../model/item'

export default {
  emits: ['submitted'],
  data() {
    return {
      itemName: ''
    }
  },
  methods: {
    async addItem() {
      const item = new Item()
      item.name = this.itemName
      
      const db = new Database()
      await db.save(Item, item)
      this.itemName = ''
      this.$emit('submitted')
    },
  }
}
</script>

<template>
  <form class="px-5" @submit.prevent="addItem">
    <div class="mb-3">
      <label for="nameInput" class="form-label">Task name</label>
      <input type="text" class="form-control" id="nameInput" v-model="itemName">
    </div>
    <button type="submit" class="btn btn-primary">Add</button>
  </form>
</template>
