<template>
  <accordion :activeIndex="1">
    <accordionTab header="Filter instellingen">
        <div class="d-flex justify-content-start">
          <dropdown @change="veranderFilter" :options="filters" option-label="label" option-group-label="label"
                    option-group-children="items" placeholder="Huidige">
            <template #optiongroup="slotProps">
              <div class="flex align-items-center filter-item">
                <div><strong>{{ slotProps.option.label }}</strong></div>
              </div>
            </template>
          </dropdown>
          <input-text v-model="nieuweFilternaam" placeholder="Filternaam" v-if="filterOpslaanMode" class="ml-2"></input-text>
          <Opslaan title="Filter opslaan" @opslaan="filterOpslaan" v-if="filterOpslaanMode" class="ml-2"></Opslaan>
          <Button :label="filterOpslaanMode ? 'Annuleren' : 'Filter opslaan'"
                  :icon="filterOpslaanMode ? 'fas fa-ban' : 'fas fa-plus'" class="ml-2 opslaan-button"
                  @click="filterOpslaanMode = !filterOpslaanMode"></Button>
        </div>
      <KolommenSelect :actieveKolommen="actieveKolommen"></KolommenSelect>
    </accordionTab>
  </accordion>
</template>

<script>
import KolommenSelect from "@/components/filter/KolommenSelect";
import Opslaan from "@/components/buttons/Opslaan";

export default {
  name: "LedenlijstFilterblok",
  components: {
    KolommenSelect,
    Opslaan
  },
  props: {
    actieveKolommen: {
      type: Array
    },
    filters: {
      type: Array
    }
  },
  data() {
    return {
      filterOpslaanMode: false,
      nieuweFilternaam: '',
    }
  },
  methods: {
    veranderFilter(event) {
      this.$emit('veranderFilter', event.value.value);
    },
    filterOpslaan() {
      return false;
    }
  }
}
</script>

<style scoped>

</style>