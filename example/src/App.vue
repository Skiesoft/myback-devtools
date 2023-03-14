<script lang="ts">
import { defineComponent } from 'vue'
import { Database } from '@myback/sdk'
import ListView from './components/List.vue'
import { List } from './model/list'

export default defineComponent({
  data() {
    const lists: Array<List> = [];
    return {
      lists
    }
  },
  async mounted() {
      const db = new Database()
      this.lists = await db.all(List)
  },
  components: {
    ListView
  }
})
</script>

<template>
  <main class="container p-5">
    <h1>Simple Todo List</h1>
    <div v-for="list in lists">
      <ListView :list="list"></ListView>
    </div>
  </main>
</template>
