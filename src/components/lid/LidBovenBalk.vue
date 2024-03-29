<template>
  <div class="bovenbalk mb-8 mt--1">
    <div class="d-flex justify-content-between">
      <div class="lg:ml-4">
        <h4 class="mt-4 sm:ml-4 lg:ml-0">{{ volledigeNaam }}</h4>
      </div>
    </div>
    <div class="d-flex justify-content-start mt--05">
      <h6 class="mt-2 lg:ml-4">Lidnr.: {{ lid.verbondsgegevens.lidnummer }}</h6>
    </div>
    <div class="d-flex justify-content-end">
      <div class="d-flex justify-content-evenly mr-7">
        <opslaan class="ml-2" :disabled="!changes" @click="opslaan"></opslaan>
      </div>
      <div class="top-menu d-flex justify-content-end align-content-center mt--15">
        <Button type="button" icon="pi pi-bars" @click="toggle" aria-haspopup="true" aria-controls="overlay_menu"
                class="sub-menu-button menu-button p-button-rounded"/>
        <Menu id="overlay_menu" ref="menu" :model="filteredMenuItems" :popup="true" class="sub-menu-items p-4">
          <template #item="{item}">
            <div @click="gaNaar(item.link)">
              <i :class="item.icon" class="lid-menu-item mr-2"><label
                class="clickable lid-menu-item font ml-2">{{ item.label }}</label></i>
            </div>
          </template>
        </Menu>
      </div>
    </div>
  </div>
</template>

<script>

import rechtenService from '@/services/rechten/rechtenService';
import Opslaan from "@/components/buttons/Opslaan";

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
  components: {Opslaan},
  data() {
    return {
      menuItems: [
        {
          label: "Communicatievoorkeuren",
          condition: this.eigenProfiel && !this.nieuwLid,
          icon: "fal fa-satellite-dish",
          link: "Communicatievoorkeuren",
        },
        {
          label: "Individuele steekkaart",
          condition: this.heeftSteekkaartleesRecht,
          icon: "fal fa-notes-medical",
          link: "IndividueleSteekkaart",
        },
        {
          label: "Nieuw Lid",
          condition: rechtenService.hasAccess("nieuw lid"),
          icon: "far fa-user-plus",
          link: "lidToevoegen",
        },
        {
          label: "Broer/Zus toevoegen",
          condition: rechtenService.hasAccess("nieuw lid"),
          icon: "far fa-user-friends",
          link: "broerZusToevoegen",
        },
        {
          label: "Mail lid",
          condition: rechtenService.hasAccess("aanvragen"),
          icon: "far fa-envelope",
          link: "Mail",
        },
        {
          label: "Stop alle functies",
          condition: this.kanAlleFunctiesStoppen || this.eigenProfiel,
          icon: "far fa-times",
          link: "stopAlleFuncties",
        },
      ],
    };
  },
  methods: {
    gaNaar(link) {
      if (link === 'profiel') {
        this.$router.push({name: 'Profiel', params: {id: "profiel"}})
      } else if (link === 'stopAlleFuncties') {
        this.$emit('stopAlleFuncties');
      } else if (link === 'lidToevoegen') {
        this.nieuwLidToevoegen();
      } else if (link === 'broerZusToevoegen') {
        this.broerZusToevoegen();
      } else {
        this.$router.push({name: link})
      }
    },

    opslaan() {
      this.$emit('opslaan');
    },

    toggle(event) {
      this.$refs.menu.toggle(event);
    },

    nieuwLidToevoegen() {
      this.$router.push({
        name: "lidToevoegen",
      });
    },

    heeftSteekkaartleesRecht() {
      if (this.eigenProfiel && !this.nieuwLid) {
        return true
      }
      setTimeout(() => {
        return rechtenService.heeftSteekkaartLeesrecht(this.lid, 'steekkaart')
      }, 2000);
    },

    kanAlleFunctiesStoppen() {
      setTimeout(() => {
        return rechtenService.kanSchrappen(this.lid)
      }, 2000);
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
          lidgeldbetaald: false
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
    filteredMenuItems() {
      return this.menuItems.filter(obj => {
        return obj.condition;
      });
    },

  },
};
</script>

<style scoped></style>
