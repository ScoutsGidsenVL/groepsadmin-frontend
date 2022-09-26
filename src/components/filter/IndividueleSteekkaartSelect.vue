<template>
  <div v-if="criteria && criteria.activated">
    <div class="col-12 type-select-button kolom-select" @click="toggleMenu = !toggleMenu">
      <div class="row mt--05">
        <div class="col-10 ">
          <div class="text-align-left d-flex">
            <div>
              <label class="label-width">{{ criteria.title }} </label>
            </div>
          </div>
        </div>
        <div class="col-2">
          <verwijder-criteria :criteria="criteria" />
        </div>
      </div>
    </div>
    <div class="position-absolute z999 bg-white col-2 filter-border" v-if="toggleMenu">
      <div class="d-flex justify-content-between ml-2 mr-7px">
        <label class="mt-2">Aangepast</label>
        <dropdown
          class="width-50"
          :options="aangepastOptions"
          v-model="aangepast"
          optionLabel="label"
          optionValue="value"
          @change="change"
        />
      </div>
      <div class="d-flex justify-content-evenly">
        <Calendar
          autocomplete="off"
          id="icon"
          :showIcon="true"
          dateFormat="dd/mm/yy"
          placeholder="../../...."
          :monthNavigator="true"
          :yearNavigator="true"
          :manualInput="true"
          v-model="datum"
          @date-select="change"
        >
        </Calendar>
      </div>
    </div>
  </div>
</template>

<script>
import Calendar from "primevue/calendar";
import DateUtil from "@/services/dates/DateUtil";
import VerwijderCriteria from "@/components/buttons/VerwijderCriteria";

export default {
  name: "IndividueleSteekkaartSelect",
  components: {
    Calendar,
    VerwijderCriteria
  },
  data() {
    return {
      toggleMenu: false,
      selectedOption: [],
      aangepastOptions: [],
      aangepast: "jonger",
      datum: new Date(),
    }
  },
  props: {
    criteria: {
      type: Array
    },
  },
  methods: {
    close() {
      this.toggleMenu = false;
    },
    change() {
      this.emitter.emit('changeSteekkaartCriterium', { 'criteria': this.criteria, 'aangepast': this.aangepast, 'datum': this.datum })
    }
  },
  mounted() {
    this.criteria.operator.values.forEach((value) => {
      this.aangepastOptions.push({label: value[0], value: value[1]})
    })
    this.aangepast = this.criteria.value.operator;
    this.change();
  },
  computed: {
    label() {
      return "Aangepast " + (this.aangepast === "ouder" ? "voor " : "na ") + DateUtil.formatteerDatum(this.datum);
    }
  }
}
</script>

<style scoped>

</style>
