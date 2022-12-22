<template>
  <div class="functies-card mb-4">
    <card>
      <template #title>
        <div class="d-flex col-12 justify-content-between">
          <span> Functies </span>
        </div>
        <div class="d-flex col-12">
          <InputSwitch v-model="historiek"/>
          <span class="ml-2 text-sm">Historiek weergeven</span>
        </div>
        <div :class="laden ? 'functies-loader' : ''">
          <Indicator :is-loading="laden" :full-page="false" :height=55 :width=55></Indicator>
        </div>
      </template>
      <template #content>
        <accordion :multiple="true" v-if="!laden">
          <accordionTab v-for="(functies, nummer) in actieveGroepen" :key="nummer" :header="groepsNaam(nummer)">
            <div v-for="(functie, index) in functies" :key="index">
              <div v-if="functie.actief" class="functie-wrapper">
                <div class="flex-row">
                  <div class="justify-content-between">
                    <label>van {{ formatteerDatum(functie.begin) }}</label>
                    <Button
                      v-if="lidMagFunctieStoppen('functies.' + nummer) && !functie.specialeFunctie"
                      icon="pi pi-trash"
                      class="p-button-rounded p-button-outlined p-button-danger remove-button mr-1 mt-2"
                      @click="
                        $event.stopPropagation();
                        stopFunctie(functie, nummer);
                      "
                      title="Stop functie"
                    />
                  </div>
                </div>
                <div class="flex-row">
                  <div class="justify-content-start">
                    <label class="ml-4 font-bold">{{ functie.naam }}</label>
                  </div>
                </div>
                <div class="border mt-3"></div>
              </div>
            </div>
            <div v-for="(functie, index) in functies" :key="index">
              <div v-show="!functie.actief && historiek" class="functie-wrapper"
                   :class="!functie.actief ? 'inactive-function' : ''">
                <div class="flex-row">
                  <div class="justify-content-between">
                    <label>van {{ formatteerDatum(functie.begin) }}&nbsp;</label>
                    <label> tot {{ formatteerDatum(functie.einde) }}</label>
                  </div>
                </div>
                <div class="flex-row">
                  <div class="justify-content-start">
                    <label class="ml-4 font-bold overflow-wrap-text">{{
                        functie.naam
                      }}</label>
                  </div>
                </div>
                <div class="border mt-3"></div>
              </div>
            </div>
          </accordionTab>
        </accordion>
        <div v-if="historiek && !laden">
          <accordion :multiple="true">
            <accordionTab v-for="(functies, index) in nietActieveGroepen" :key="index" :header="inactieveGroepsNaam(index)">
              <div v-for="(functie, index) in functies" :key="index" class="inactive-function">
                <div class="flex-row">
                  <div class="justify-content-between">
                    <label>van {{ formatteerDatum(functie.begin) }}&nbsp;</label>
                    <label> tot {{ formatteerDatum(functie.einde) }}</label>
                  </div>
                </div>
                <div class="flex-row">
                  <div class="justify-content-start">
                    <label class="ml-4 font-bold overflow-wrap-text">{{
                        functie.naam
                      }}</label>
                  </div>
                </div>
                <div class="border mt-3"></div>
              </div>
            </accordionTab>
          </accordion>
        </div>
      </template>
    </card>
  </div>
</template>

<script>
import Indicator from "@/components/global/Indicator";
import FunctieService from "@/services/functies/FunctieService";
import {toRefs} from "@vue/reactivity";

export default {
  name: "Functies",
  components: {Indicator},
  props: {
    modelValue: {
      type: Object, Array
    },
    lid: {
      type: Object
    }
  },
  setup(props) {
    const {
      state,
      groepsNaam,
      inactieveGroepsNaam,
      lidMagFunctieStoppen,
      formatteerDatum,
      stopFunctie,
      actieveGroepen,
      nietActieveGroepen,
      laden
    } = FunctieService.functieSpace(props);

    return {
      ...toRefs(state),
      groepsNaam,
      inactieveGroepsNaam,
      lidMagFunctieStoppen,
      formatteerDatum,
      stopFunctie,
      actieveGroepen,
      nietActieveGroepen,
      laden
      }
    }
  }
</script>
