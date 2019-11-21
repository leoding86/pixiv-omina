<template>
  <div class="app-download-list">
    <div class="download-list-item"
      v-for="download in downloads"
      :key=download.id
    >
      <span>{{ download.id }} - {{ download.title }} - {{download.type}} - {{ download.state }} - {{ download.progress }} - {{ download.speed }} - {{ download.statusMessage }}</span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    downloads: {
      required: true,
      type: Array,
      default: []
    }
  }
}
</script>
