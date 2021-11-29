<template>
  <accordion :activeIndex="1" >
    <accordionTab header="Filter instellingen">
        <KolommenSelect :actieveKolommen="actieveKolommen"></KolommenSelect>
    </accordionTab>
  </accordion>
</template>

<script>
import KolommenSelect from "@/components/filter/KolommenSelect";
export default {
  name: "LedenlijstFilterblok",
  components: {KolommenSelect},
  props: {
    actieveKolommen: {
      type: Array
    }
  }
}
</script>

<style scoped>

</style>