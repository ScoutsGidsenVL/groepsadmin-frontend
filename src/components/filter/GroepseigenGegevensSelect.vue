<template>
  <div v-if="criteria && criteria.activated">
    <div class="col-12 type-select-button kolom-select" @click="toggleMenu = !toggleMenu">
      <div class="row mt--05">
        <div class="col-10 ">
          <div class="text-align-left d-flex">
            <div>
              <label class="text-nowrap">{{ criteria.title }}</label>
            </div>
          </div>
        </div>
        <div class="col-2">
          <verwijder-criteria :criteria="criteria"/>
        </div>
      </div>
    </div>
    <div class="position-absolute z999 bg-white col-11 col-sm-6 col-md-4 col-lg-3 col-xl-2 filter-border filter-height-select" v-if="toggleMenu">
      <div v-if="geenGroepseigenGegevens()">
        <label class="text-align-left">Geen groepseigengegevens</label>
      </div>
      <div v-for="(geg, index) in gesorteerdeGroepseigenGegevens()" :key="index">
        <div v-if="geg.items && geg.items.length > 0">
          <div class="select-kolom-header mb-1 full-width d-flex align-content-start">{{ geg.label }}</div>
          <div v-for="(item, index) in geg.items" :key="index">
            <div class="d-flex align-content-start">
              <checkbox :binary="true" id="item.veld" class="mr-2" v-model="item.activated"
                        @change="activeerGroepseigenGegeven(item)"></checkbox>
              <label class="text-align-left" :for="item.veld">{{ item.label }}</label>
              <div v-if="item.vinkje" class="full-width d-flex justify-content-end">
                <checkbox :binary="true" class="ml-4" v-model="item.waarde"
                          @change="selecteerGroepseigenGegeven(item.veld, item.waarde, 'equals')">Ja
                </checkbox>
                <label class="ml-2">Ja</label>
              </div>
            </div>
            <div v-if="!item.vinkje">
              <div class="d-flex justify-content-start margin-left-27px">
                <dropdown
                  :options="item.operatorValues"
                  option-label="label"
                  optionValue="value"
                  :class="['dropdown-height', 'mb-1']"
                  v-model="item.operator"
                  @change="selecteerGroepseigenGegeven(item.veld, item.waarde, item.operator)"
                />
              </div>
              <div class="d-flex justify-content-start margin-left-27px" v-if="item.keuze">
                <dropdown
                  v-if="item.keuze"
                  :options="item.keuzes"
                  :class="['dropdown-height', 'mb-1']"
                  v-model="item.waarde"
                  @change="selecteerGroepseigenGegeven(item.veld, item.waarde, item.operator)"
                />
              </div>
              <div class="d-flex justify-content-start margin-left-27px" v-if="!item.keuze">
                <input-text
                  v-model="item.waarde"
                  class="dropdown-height mb-1"
                  @change="selecteerGroepseigenGegeven(item.veld, item.waarde, item.operator)"
                  @focusout="selecteerGroepseigenGegeven(item.veld, item.waarde, item.operator)"
                ></input-text>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import VerwijderCriteria from "@/components/buttons/VerwijderCriteria";

export default {
  name: "GroepseigenGegevensSelect",
  components: {
    VerwijderCriteria
  },
  data() {
    return {
      toggleMenu: false,
      selectedOption: [],
    }
  },
  props: {
    criteria: {
      type: Array
    },
  },
  computed: {
    ongesorteerdeGroepseigenGegevens() {
      return this.criteria;
    }
  },
  methods: {
    close() {
      this.toggleMenu = false;
    },
    gesorteerdeGroepseigenGegevens() {
      return this.ongesorteerdeGroepseigenGegevens.itemgroups.sort((a, b) => {
        if (a.value < b.value) {
          return -1;
        }
        if (a.value > b.value) {
          return 1;
        }
        return 0
      });
    },

    geenGroepseigenGegevens() {
      let result = true;
      this.gesorteerdeGroepseigenGegevens().forEach(geg =>{
        if (geg.items && geg.items.length > 0) {
          result = false;
        }
      })
      return result;
    },

    activeerGroepseigenGegeven(item) {
      if (!item.activated) {
        this.emitter.emit('deactiveerGroepseigenGegeven', { 'criteria': this.criteria, 'veld': item.veld })
      } else if (item.waarde) {
        this.selecteerGroepseigenGegeven(item.veld, item.waarde, item.operator);
      }
    },

    selecteerGroepseigenGegeven(veld, waarde, operator) {
      this.emitter.emit('changeGegKeuzeCriterium', { 'criteria': this.criteria, 'veld': veld, 'waarde': waarde, 'operator': operator })
    },

    veld(geg) {
      if (geg.vinkje) {
        return {
          type: 'vinkje',
          label: geg.label
        }
      }
    },
  },
}
</script>

<style scoped>

</style>
