<template>
  <div class="col-lg-2 mt-2" v-click-outside="close">
    <div @click="toggleMenu = !toggleMenu" class="clickable col-12 type-select-button kolom-select">
      <div class="row mt--05">
        <div class="col-10">
          <div class="text-align-left d-flex">
            <div>
              Kolommen:
            </div>
            <div class="row">
              <label class="subtitle clickable text-align-left criteria-label cut-off-text">{{
                  actieveKolomNamen
                }}</label>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-show="toggleMenu" class="position-absolute z999 bg-white col-2 filter-border text-align-left mt-1 lg:overflow-y-scroll h-50">
      <draggable :list="actieveKolommen"
                 @start="drag=true"
                 @end="drag=false"
                 item-key="id"
                 handle=".handle"
      >
        <template #item="{ element }">
          <div class="handle">
            <checkbox
              :id="element.id"
              class="ml-1"
              :modelValue="checkKolom(element)"
              :binary="true"
              @change="
                $event.stopPropagation();
                voegKolomToe(element);"
            />
            <label :for="element.id" class="ml-2">{{ element.label }}</label>
            <i class="far fa-arrows-alt-v top-6 float-end mt-1"></i>
          </div>
        </template>
      </draggable>
      <div>
        <div v-for="(groepering, index) in groepering" :key="index" class="mt-3">
          <div class="select-kolom-header mb-2">{{ groepering.toUpperCase() }}</div>
          <div v-for="(item, key) in gefilterdeNonActieve(groepering)" :key="key">
            <checkbox
              :id="key"
              class="ml-1"
              :modelValue="checkKolom(item)"
              :binary="true"
              @change="voegKolomToe(item)"
            />
            <label :for="key" class="ml-2 clickable">{{ item.label }}</label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>


import ledenlijstService from "@/services/leden/ledenlijstService";
import Draggable from 'vuedraggable'

export default {
  name: "KolommenSelect",
  props: {
    actieveKolommen: {
      type: Array
    },
    nonActieveKolommen: {
      type: Array
    }
  },
  components: {
    Draggable,
  },
  data() {
    return {
      toggleMenu: false,
      drag: false,
    }
  },

  computed: {
    actieveKolomNamen() {
      let kolomnamen = "";
      this.actieveKolommen.forEach(kolom => {
        kolomnamen.length > 0 ? kolomnamen += ", " : kolomnamen += " ";
        kolomnamen += kolom.label;
      })
      return kolomnamen;
    },
    groepering() {
      return ledenlijstService.getGroepering(this.nonActieveKolommen);
    },
  },

  mounted() {

  },

  methods: {
    voegKolomToe(kolom) {
      if (kolom.activated) {
        kolom.activated = false;
        kolom.groepering = kolom.groeperingOrig;
        kolom.kolomIndex = kolom.kolomIndexOrig;
        this.$emit('setActieveKolom');
        this.emitter.emit('setActieveKolom', {'kolom': kolom})


      } else {
        kolom.activated = true;
        kolom.groeperingOrig = kolom.groepering;
        kolom.groepering = undefined;
        this.$emit('setNonActieveKolom');
      }
    },

    gefilterdeNonActieve(groepering) {
      return ledenlijstService.groeperingGefilterdeKolommen(this.nonActieveKolommen, groepering);
    },

    close() {
      this.toggleMenu = false;
    },

    checkKolom(huidigekolom) {
      let result = false;
      this.actieveKolommen.forEach(kolom => {
        if (kolom.id === huidigekolom.id) {
          result = true;
        }
      })
      return result;
    }
  }
}
</script>

<style scoped>

</style>
