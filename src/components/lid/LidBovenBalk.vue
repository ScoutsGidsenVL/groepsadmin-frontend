<template>
  <div class="bovenbalk mb-4">
    <div class="d-flex justify-content-between">
      <div>
        <h4 class="mt-2 lg:ml-4">{{ volledigeNaam }}</h4>
      </div>
      <!-- aanpassen naar hamburger menu     -->
      <div class="justify-content-end">
        <steekkaart @click="gaNaarIndividueleSteekkaart" v-if="eigenProfiel && !nieuwLid"></steekkaart>
        <communicatie class="ml-2" v-if="eigenProfiel && !nieuwLid" @click="gaNaarCommunicatieVoorkeuren"></communicatie>
        <nieuw-lid class="ml-2" v-if="kanNieuwLidAanmaken && !nieuwLid" @click="nieuwLidToevoegen"/>
        <broer-zus class="ml-2" v-if="kanNieuwLidAanmaken && !nieuwLid" @click="broerZusToevoegen"/>
        <email class="ml-2" v-if="!eigenProfiel || !nieuwLid" :lid="lid"/>
        <opslaan class="ml-2" :disabled="!changes" @click="opslaan"></opslaan>
      </div>
    </div>
    <div class="d-flex justify-content-start mt--1">
      <h6 class="mt-2 lg:ml-4">Lidnr.: {{ lid.verbondsgegevens.lidnummer }}</h6>
    </div>
  </div>
</template>

<script>

import Opslaan from "@/components/buttons/Opslaan";
import Steekkaart from "@/components/buttons/Steekkaart";
import NieuwLid from "@/components/buttons/NieuwLid";
import Communicatie from "@/components/buttons/Communicatie";
import BroerZus from "@/components/buttons/BroerZus";
import Email from "@/components/buttons/Email";
import rechtenService from '@/services/rechten/rechtenService';

export default {
  name: "LidBovenBalk",
  props: {
    lid: {
      type: Object,
    },
    id: {
      type: String,
    },
    eigenProfiel: {
      type: Boolean
    },
    changes: {
      type: Boolean
    },
    nieuwLid: {
      type: Boolean,
      default: false
    }
  },
  components: {
    BroerZus,
    Opslaan,
    Steekkaart,
    NieuwLid,
    Communicatie,
    Email
  },
  data() {
    return {
      items: [
        {
          label: "Communicatievoorkeuren",
          icon: "fas fa-satellite-dish",
          command: () => {
            this.$toast.add({
              severity: "success",
              summary: "Communicatievoorkeuren",
              detail: "We gaan naar communicatievoorkeuren",
              life: 3000,
            });
          },
        },
        {
          label: "Nieuw lid",
          icon: "fas fa-user-plus",
          command: () => {
            this.$toast.add({
              severity: "success",
              summary: "Nieuw",
              detail: "Nieuw lid toevoegen",
              life: 3000,
            });
          },
        },
      ],
    };
  },
  methods: {
    gaNaarIndividueleSteekkaart() {
      this.$router.push({
        name: "IndividueleSteekkaart",
        params: { id: this.lid.id },
      });
    },
    gaNaarCommunicatieVoorkeuren() {
      this.$router.push({
        name: "Communicatievoorkeuren",
        params: { id: this.lid.id },
      });
    },
    opslaan() {
      this.$emit('opslaan');
    },
    kanNieuwLidAanmaken() {
      return rechtenService.hasAccess("nieuw lid");
    },
    nieuwLidToevoegen() {
      this.$router.push({
        name: "lidToevoegen",
      });
    },
    broerZusToevoegen() {
      let defaultLid = {
        vgagegevens: {
          achternaam: this.lid.vgagegevens.achternaam
        },
        persoonsgegevens: {
          verminderdlidgeld: false,
          beperking: false,
          geslacht: 'vrouw',
          gsm: this.lid.persoonsgegevens.gsm
        },
        verbondsgegevens: {
          lidgeldbetaald:	false
        },
        email: this.lid.email,
        adressen: this.lid.adressen,
        contacten: this.lid.contacten,
        functies: []
      }
      this.$store.commit('setBroerZusLid', defaultLid);
      this.$router.push({
        name: "lidToevoegen",
      });
    }
  },
  computed: {
    volledigeNaam() {
      if (this.lid.vgagegevens.voornaam && this.lid.vgagegevens.achternaam) {
        return (
          this.lid.vgagegevens.voornaam + " " + this.lid.vgagegevens.achternaam
        );
      } else {
        return " ";
      }
    },
  },
};
</script>

<style scoped></style>
