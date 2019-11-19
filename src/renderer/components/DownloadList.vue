<template>
  <div class="app-download-list"></div>
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
