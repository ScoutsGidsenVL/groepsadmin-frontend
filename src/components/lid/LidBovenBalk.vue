<template>
  <div class="bovenbalk" :class="!nieuwLid ? 'mt--1' : 'mb-4'">
    <div class="row">
      <div class="col-md-8">
        <div class="d-flex justify-content-between">
          <div class="lg:ml-4" v-if="!nieuwLid">
            <h4 class="mt-4 lg:ml-0">{{ volledigeNaam }}</h4>
          </div>
        </div>
        <div class="d-flex justify-content-start mt--05" v-if="!nieuwLid">
          <h6 class="mt-2 lg:ml-4">Lidnr.: {{ lid.verbondsgegevens.lidnummer }}</h6>
        </div>
      </div>
      <div class="col-md-4">
        <div class="row mt-4">
          <div class="col-6 col-md-12">
            <div class="d-flex sm:justify-content-start md:justify-content-end">
              <div class="mr-7" v-if="kanOpslaan || kanNieuwLidAanmaken">
                <opslaan class="md:ml-2" :disabled="!changes" @click="opslaan"></opslaan>
              </div>
              <div class="mb-6 relative d-flex justify-content-end align-content-center mt--15">
                <Button type="button" icon="pi pi-bars" @click="toggle" aria-haspopup="true"
                        aria-controls="overlay_menu"
                        class="sub-menu-button menu-button p-button-rounded"/>
                <Menu id="overlay_menu" ref="menu" :model="filteredMenuItems" :popup="true" class="sub-menu-items p-4">
                  <template #item="{item}">
                    <div @click="gaNaar(item.link)" v-if="heeftToegang(item.label)">
                      <i :class="item.icon" class="lid-menu-item mr-2"><label
                        class="cursor-pointer lid-menu-item font ml-2">{{ item.label }}</label></i>
                    </div>
                  </template>
                </Menu>
              </div>
            </div>
          </div>
          <div class="col-6 col-md-12 mt--05" v-if="!nieuwLid">
            <div class="d-flex justify-content-end">

              <div class="navigate-buttons mt-2">
                <Button type="button" icon="pi pi-step-backward-alt" @click="vorigLid" title="vorig lid"
                        class="opslaan-button" v-if="legeLedenLijst"/>
                <Button type="button" icon="pi pi-step-forward-alt" @click="volgendLid" class="ml-2 opslaan-button"
                        title="volgend lid" v-if="legeLedenLijst"/>
              </div>
            </div>
          </div>
        </div>
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
      filteredMenuItems: [],
      menuItems: [
        {
          label: "Communicatievoorkeuren",
          condition: this.eigenProfiel && !this.nieuwLid,
          icon: "fal fa-satellite-dish",
          link: "Communicatievoorkeuren",
        },
        {
          label: "Individuele steekkaart",
          condition: rechtenService.heeftSteekkaartLeesrecht(this.lid, "steekkaart") || this.eigenProfiel && !this.nieuwLid,
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
          condition: !this.eigenProfiel,
          icon: "far fa-envelope",
          link: "Mail",
        },
        {
          label: "Stop alle functies",
          condition: this.magFunctiesVanLidStoppen || this.eigenProfiel,
          icon: "far fa-times",
          link: "stopAlleFuncties",
        },
      ],
    };
  },

  created() {
    this.filterMenuItems();
  },

  updated() {
    this.filterMenuItems();
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

    legeLedenLijst() {
      return this.$store.getters.leden.length !== 0
    },

    kanOpslaan() {
      return rechtenService.kanOpslaan(this.lid);
    },

    kanNieuwLidAanmaken() {
      return rechtenService.hasAccess("nieuw lid")
    }
  },
  methods: {
    gaNaar(link) {
      if (link === 'profiel') {
        this.$router.push({name: 'Profiel', params: {id: "profiel"}})
      } else if (link === 'stopAlleFuncties') {
        this.$emit('stopAlleFuncties');
      } else if (link === 'broerZusToevoegen') {
        this.broerZusToevoegen();
      } else {
        this.$router.push({name: link})
      }
    },

    vorigLid() {
      let index = this.$store.getters.leden.indexOf(this.lid.id);
      if (index === 0) {
        index = this.$store.getters.leden.length - 1;
      } else {
        index--;
      }
      this.$emit('disableWatchable');
      this.$router.push({name: "Lid", params: {id: this.$store.getters.leden[index]}})
    },

    volgendLid() {
      let index = this.$store.getters.leden.indexOf(this.lid.id);
      if (index === this.$store.getters.leden.length - 1) {
        index = 0;
      } else {
        index++;
      }
      this.$emit('disableWatchable');
      this.$router.push({name: "Lid", params: {id: this.$store.getters.leden[index]}})
    },

    heeftToegang(label) {
      switch(label) {
        case "Communicatievoorkeuren":
          return this.eigenProfiel && !this.nieuwLid;
        case "Individuele steekkaart":
          return rechtenService.heeftSteekkaartLeesrecht(this.lid, "steekkaart") || this.eigenProfiel && !this.nieuwLid;
        case "Nieuw Lid":
          return rechtenService.hasAccess("nieuw lid");
        case "Broer/Zus toevoegen":
          return rechtenService.hasAccess("nieuw lid");
        case "Mail lid":
          return !this.eigenProfiel;
        case "Stop alle functies":
          return rechtenService.magAlleFunctiesStoppen(this.lid) || this.eigenProfiel;
        default:
          return false;
      }
    },

    opslaan() {
      this.$emit('opslaan');
    },

    toggle(event) {
      this.$refs.menu.toggle(event);
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
    },

    filterMenuItems() {
      this.filteredMenuItems = [];
      this.menuItems.forEach(item => {
        if (this.heeftToegang(item.label)) {
          this.filteredMenuItems.push(item);
        }
      })
    },


  },
};
</script>

<style scoped></style>
