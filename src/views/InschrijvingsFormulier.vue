<template>
  <div class="d-flex justify-content-center md:w-90">
    <div v-if="!groep && !loading">
      <span style='font-size:100px;'>&#128532;</span>
      <p>Deze groep bestaat niet.</p>
      <a href="mailto:groepsadministratie@scoutsengidsenvlaanderen.be">Klik hier </a><span> om contact op te nemen met Scouts en Gidsen Vlaanderen</span>
    </div>
    <Loader
      :showLoader="loading"
    ></Loader>
    <toast position="bottom-right"/>
    <confirmDialog/>
    <div class="lg:ml-2 mt-4 p-3 md:p-0" v-if="groep">
      <div class="text-left ml-3 lg:ml-8">
        <h2 class="lg:ml-2">Lid worden van {{ groep.naam }}</h2>
        <p class="lg:ml-2">Word jij ons nieuwste lid? Vul dan onderstaand formulier in om een aanvraag te verzenden naar
          {{ groep.naam }} ({{ groep.id }}).</p>
      </div>
      <form @submit.prevent="opslaan" autocomplete="off">
        <div class="row lg:ml-8">
          <div class="col-12 col-lg-4">
            <persoonlijk :model-value="lid" :nieuw-lid="true" :inschrijving="true"></persoonlijk>
          </div>
          <div class="col-12 col-lg-4">
            <div class="adressen-card mb-4">
              <card>
                <template #title>
                  <div class="d-flex col-12 justify-content-between">
                    <span> Adres </span>
                  </div>
                </template>
                <template #content>
                  <base-dropdown
                    :options="landen"
                    label="Land"
                    v-model="lid.adres.land"
                    @changeValue="veranderLand()"
                  />
                  <gemeente-zoek-auto-complete
                    label="Woonplaats"
                    v-model="lid.adres"
                    v-if="lid.adres.land === 'BE'"
                    @clearInvalidForm="clearInvalidForm('gemeente')"
                    :invalidForm="v.lid.adres.$dirty && v.lid.adres.gemeente.$invalid"
                    :error-message="v.lid.adres.gemeente.required.$message"
                  />
                  <straat-zoek-auto-complete
                    :disabled="!lid.adres.postcode && !lid.adres.gemeente"
                    label="Straat"
                    v-model="lid.adres"
                    :value="lid.adres.straat"
                    v-if="lid.adres.land === 'BE'"
                    @clearInvalidForm="clearInvalidForm('straat')"
                    :invalidForm="v.lid.adres.$dirty && v.lid.adres.straat.$invalid"
                    :error-message="v.lid.adres.straat.required.$message"
                  />
                  <BaseInput
                    v-if="lid.adres && lid.adres.land !== 'BE'"
                    label="Postcode"
                    v-model="lid.adres.postcode"
                    type="text"
                    :invalid="v.lid.adres.$dirty && v.lid.adres.postcode.$invalid"
                    :error-message="v.lid.adres.postcode.required.$message"
                  />
                  <BaseInput
                    v-if="lid.adres && lid.adres.land !== 'BE'"
                    label="Gemeente"
                    v-model="lid.adres.gemeente"
                    :invalid="v.lid.adres.gemeente.$dirty && v.lid.adres.gemeente.$invalid"
                    :error-message="v.lid.adres.gemeente.required.$message"
                  />
                  <BaseInput
                    v-if="lid.adres && lid.adres.land !== 'BE'"
                    label="Straat"
                    v-model="lid.adres.straat"
                    type="text"
                    :invalid="v.lid.adres.straat.$dirty && v.lid.adres.straat.$invalid"
                    :error-message="v.lid.adres.straat.required.$message"
                  />
                  <BaseInput
                    label="Nummer"
                    placeholder="Nummer"
                    v-model="lid.adres.nummer"
                    :disabled="!lid.adres.straat"
                    type="text"
                    :invalid="v.lid.adres.nummer.$dirty && v.lid.adres.nummer.$invalid"
                    :error-message="v.lid.adres.nummer.required.$message"
                  />
                  <BaseInput
                    label="Bus"
                    placeholder="Bus"
                    v-model="lid.adres.bus"
                    :disabled="!lid.adres.straat"
                    type="text"
                  />
                </template>
              </card>
            </div>
            <groepseigen-gegevens
              v-if="groepseigenVelden && Object.keys(groepseigenVelden).length > 0"
              v-model="groepseigenVelden"
              :title="'Groepseigen gegevens'"
              :groepsnummer="groepsnummer"
            ></groepseigen-gegevens>
          </div>
          <div class="col-12 col-lg-4">
            <contacten v-model="lid" :title="'Contacten'"></contacten>
            <div class="d-flex justify-content-end">
              <lid-worden :disabled="!changes" @opslaan="opslaan"></lid-worden>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import Persoonlijk from "@/components/lid/Persoonlijk";
import GroepseigenGegevens from "@/components/aanvraag/GroepseigenGegevens";
import Contacten from "@/components/aanvraag/Contacten";
import Loader from "@/components/global/Loader";
import LidWorden from "@/components/buttons/LidWorden";
import BaseInput from "@/components/input/BaseInput";
import GemeenteZoekAutoComplete from "@/components/aanvraag/GemeenteZoekAutoComplete";
import BaseDropdown from "@/components/input/BaseDropdown";
import StraatZoekAutoComplete from "@/components/aanvraag/StraatZoekAutoComplete";
import {toRefs} from "@vue/reactivity";
import InschrijvingsService from "@/services/inschrijvingsFormulier/InschrijvingsService";


export default {
  name: "InschrijvingsFormulier",

  components: {
    Persoonlijk,
    Loader,
    LidWorden,
    Contacten,
    GroepseigenGegevens,
    BaseInput,
    BaseDropdown,
    GemeenteZoekAutoComplete,
    StraatZoekAutoComplete
  },

  setup() {
    const {
      state,
      v,
      opslaan,
      veranderLand,
      clearInvalidForm,
    } = InschrijvingsService.inschrijvingsSpace();
    return {
      ...toRefs(state),
      v,
      opslaan,
      veranderLand,
      clearInvalidForm,
    };
  },

};
</script>

<style scoped>
</style>
