<template>
  <div class="d-flex justify-content-center md:w-90">
    <div v-if="!groep && !loading">
      <span style="font-size: 100px">&#128532;</span>
      <p>Deze groep bestaat niet.</p>
      <a href="mailto:groepsadministratie@scoutsengidsenvlaanderen.be"
        >Klik hier </a
      ><span> om contact op te nemen met Scouts en Gidsen Vlaanderen</span>
    </div>
    <Loader :showLoader="loading"></Loader>
    <toast position="bottom-right" />
    <confirmDialog />
    <div class="lg:ml-2 mt-4 p-3 md:p-0" v-if="groep">
      <div class="text-left ml-3 lg:ml-8">
        <h2 class="lg:ml-2">Lid worden van {{ groep.naam }}</h2>
        <p class="lg:ml-2">
          Word jij ons nieuwste lid? Vul dan onderstaand formulier in om een
          aanvraag te verzenden naar {{ groep.naam }} ({{ groep.id }}).
        </p>
      </div>
      <form @submit.prevent="opslaan" autocomplete="off">
        <div class="row lg:ml-8">
          <div class="col-12 col-lg-4">
            <persoonlijk
              :model-value="lid"
              :nieuw-lid="true"
              :inschrijving="true"
            ></persoonlijk>
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
                  <AdresVelden v-model="lid.adres" />
                </template>
              </card>
            </div>
            <groepseigen-gegevens
              v-if="heeftZichtbareGroepseigenVelden"
              v-model="groepseigenVelden"
              :title="'Groepseigen gegevens'"
              :groepsnummer="groepsnummer"
            ></groepseigen-gegevens>
          </div>
          <div class="col-12 col-lg-4">
            <contacten v-model="lid" :title="'Contacten'"></contacten>
            <div class="d-flex justify-content-end">
              <lid-worden
                :disabled="!changes || loading"
                @opslaan="opslaan"
              ></lid-worden>
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
import AdresVelden from "@/components/adres/AdresVelden";
import { toRefs } from "@vue/reactivity";
import InschrijvingsService from "@/services/inschrijvingsFormulier/InschrijvingsService";

export default {
  name: "InschrijvingsFormulier",

  components: {
    Persoonlijk,
    Loader,
    LidWorden,
    Contacten,
    GroepseigenGegevens,
    AdresVelden,
  },

  setup() {
    const {
      state,
      v,
      opslaan,
      heeftZichtbareGroepseigenVelden,
    } = InschrijvingsService.inschrijvingsSpace();
    return {
      ...toRefs(state),
      v,
      opslaan,
      heeftZichtbareGroepseigenVelden,
    };
  },
};
</script>

<style scoped></style>
