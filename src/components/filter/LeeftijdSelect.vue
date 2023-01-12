<template>
  <div v-if="criteria && criteria.activated">
    <div class="col-12 type-select-button kolom-select" @click="toggleMenu = !toggleMenu">
      <div class="row mt--05">
        <div class="col-10 ">
          <div class="text-align-left d-flex">
            <div>
              <label>{{ criteria.title }}: </label>
            </div>
            <div class="row">
              <label class="subtitle cursor-pointer text-align-left criteria-label cut-off-text-filter">{{ label }}</label>
            </div>
          </div>
        </div>
        <div class="col-2">
          <verwijder-criteria :criteria="criteria" />
        </div>
      </div>
    </div>
    <div class="position-absolute z999 bg-white col-12 col-sm-6 col-lg-3 col-xl-2 filter-border" v-if="toggleMenu">
      <div class="d-flex align-content-start">
        <dropdown
          class="w-100"
          :options="leeftijdOpDatumOptions"
          v-model="leeftijdOpDatum"
          optionLabel="label"
          optionValue="value"
          @change="change"
        />
      </div>
      <div class="d-flex justify-content-between ml-1">
        <label class="mt-2">Ouder dan</label>
          <dropdown
            class="width-50"
            :options="ouderDanOptions"
            v-model="ouderDan"
            optionLabel="label"
            optionValue="value"
            @change="change"
          />
      </div>
      <div class="d-flex justify-content-between ml-1">
        <label class="mt-2">Jonger dan</label>
        <dropdown
          class="width-50"
          :options="jongerDanOptions"
          v-model="jongerDan"
          optionLabel="label"
          optionValue="value"
          @change="change;"
        />
      </div>
    </div>
  </div>
</template>

<script>
import VerwijderCriteria from "@/components/buttons/VerwijderCriteria";

export default {
  name: "LeeftijdSelect",
  components: {
    VerwijderCriteria
  },
  data() {
    return {
      toggleMenu: false,
      selectedOption: [],
      leeftijdOpDatum: true,
      leeftijdOpDatumOptions: [],
      jongerDanOptions: [],
      ouderDanOptions: [],
      jongerDan: 49,
      ouderDan: 5

    }
  },
  props: {
    criteria: {
      type: Array
    },
    value: {
      type: Object
    }
  },
  methods: {
    deactivateCriterium(criteria) {
      this.$emit('deactivateCriterium', criteria);
    },
    close() {
      this.toggleMenu = false;
    },
    change() {
      this.emitter.emit('changeLeeftijd', {'criteria': this.criteria, 'leeftijdOpDatum': this.leeftijdOpDatum, 'ouderDan': this.ouderDan, 'jongerDan': this.jongerDan})
    },
  },
  mounted() {
    this.criteria.leeftijdOpDatum.values.forEach((value) => {
      this.leeftijdOpDatumOptions.push({label: value[0], value: value[1]})
    })
    this.criteria.jongerDan.values.forEach((value) => {
      this.jongerDanOptions.push({label: value[0], value: value[1]})
    })
    this.criteria.ouderDan.values.forEach((value) => {
      this.ouderDanOptions.push({label: value[0], value: value[1]})
    })
    if (this.value) {
      this.leeftijdOpDatum = this.value.op31december;
      this.jongerDan = this.value.jongerdan;
      this.ouderDan = this.value.ouderdan;
    }
    this.change();
  },

  computed: {
    label() {
      let leeftijdOpDatumKeuze = this.leeftijdOpDatum ? "Was op 31 december" : "is nu";
      return leeftijdOpDatumKeuze + " > " + this.ouderDan + " jaar en < " + this.jongerDan
        + " jaar";
    }
  }
}
</script>

<style scoped>

</style>
