<template>
  <div>
    <div class="container-fluid md:w-90 min-height-67vh mt-7em lg:mt-0">
      <div class="hidden lg:block md:ml-8 w-25">
        <Breadcrumb
          :home="home"
          :model="breadcrumbItems"
          class="ml-4 mt-4 md:ml-6"
        />
      </div>
      <slot />
    </div>
    <Footer />
  </div>
</template>

<script>
import Footer from "@/components/global/Footer";

export default {
  name: "PageLayout",
  components: { Footer },
  props: {
    breadcrumbItems: {
      type: Array,
      default: () => [],
    },
    home: {
      type: Object,
      default: () => ({ icon: "pi pi-home", to: "/dashboard" }),
    },
  },
};
</script>
