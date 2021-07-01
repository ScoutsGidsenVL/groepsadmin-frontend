<template>
  <div class="vld-parent">
    <loading :active="isLoading"
             :is-full-page="fullPage"
             :color="color"
             :loader="loader"
             :background-color="bgColor"
             :height="height"
             :width="width"
             transition="fade"
    >
    </loading>
  </div>
</template>

<script>
import 'vue3-loading-overlay/dist/vue3-loading-overlay.css';
import Loading from 'vue3-loading-overlay';


export default {
  components: {
    Loading
  },
  name: "Indicator",
  props: {
    isLoading: {
      type: Boolean,
      default: false
    },
    fullPage: {
      type: Boolean,
      default: true
    },
    canCancel: {
      type: Boolean,
      default: false
    },
    useSlot: {
      type: Boolean,
      default: false
    },
    loader: {
      type: String,
      default: "spinner",
    },
    color: {
      type: String,
      default: "#7b8f1c",
    },
    bgColor: {
      type: String,
      default: "#ffffff",
    },
    height: {
      type: Number,
      default: 128,
    },
    width: {
      type: Number,
      default: 128,
    }
  }
}
</script>

<style scoped>

</style>