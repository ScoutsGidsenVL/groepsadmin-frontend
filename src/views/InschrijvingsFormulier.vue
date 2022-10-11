<template>
  <div class="d-flex justify-content-center md:w-90">
    <div v-if="!groep && !loading">
      <span style='font-size:100px;'>&#128532;</span>
      <p>Deze groep bestaat niet.</p>
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
            <persoonlijk :model-value="lid" :nieuw-lid="true" ref="pers" :inschrijving="true"></persoonlijk>
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
                    :invalidForm="invalidGemeente"
                    error-message="Gelieve een gemeente in te vullen"
                  />
                  <straat-zoek-auto-complete
                    :disabled="!lid.adres.postcode && !lid.adres.gemeente"
                    label="Straat"
                    v-model="lid.adres"
                    :value="lid.adres.straat"
                    v-if="lid.adres.land === 'BE'"
                    @clearInvalidForm="clearInvalidForm('straat')"
                    :invalidForm="invalidStraat"
                    error-message="Gelieve een straat in te vullen"
                  />
                  <BaseInput
                    v-if="lid.adres && lid.adres.land !== 'BE'"
                    label="Postcode"
                    v-model="lid.adres.postcode"
                    type="text"
                    @blur="checkPostcode"
                    :invalid="invalidPostcode"
                    error-message="Gelieve een postcode in te vullen"
                  />
                  <BaseInput
                    v-if="lid.adres && lid.adres.land !== 'BE'"
                    label="Gemeente"
                    v-model="lid.adres.gemeente"
                    type="text"
                    @blur="checkGemeente"
                    :invalid="invalidGemeente"
                    error-message="Gelieve een gemeente in te vullen"
                  />
                  <BaseInput
                    v-if="lid.adres && lid.adres.land !== 'BE'"
                    label="Straat"
                    v-model="lid.adres.straat"
                    type="text"
                    @blur="checkStraat"
                    :invalid="invalidStraat"
                    error-message="Gelieve een straat in te vullen"
                  />
                  <BaseInput
                    label="Nummer"
                    placeholder="Nummer"
                    v-model="lid.adres.nummer"
                    :disabled="!lid.adres.straat"
                    type="text"
                    @blur="checkNummer"
                    :invalid="invalidNummer"
                    error-message="Gelieve een nummer in te vullen"
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
            <contacten v-model="lid" :title="'Contacten'" @checkValidVelden="check"></contacten>
            <div class="d-flex justify-content-end">
              <lid-worden :disabled="!changes || (invalidData || !isAdresValid)" @opslaan="opslaan"></lid-worden>
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
import RestService from "@/services/api/RestService";
import LidWorden from "@/components/buttons/LidWorden";
import useVuelidate from "@vuelidate/core";
import BaseInput from "@/components/input/BaseInput";
import GemeenteZoekAutoComplete from "@/components/aanvraag/GemeenteZoekAutoComplete";
import BaseDropdown from "@/components/input/BaseDropdown";
import StraatZoekAutoComplete from "@/components/aanvraag/StraatZoekAutoComplete";
import {computed, reactive, toRefs} from "@vue/reactivity";
import {required} from "@vuelidate/validators";


export default {
  name: "InschrijvingsFormulier",
  setup() {
    const state = reactive({
      lid: {
        adres: {
          land: "BE",
        },
        email: "",
        gebruikersnaam: "",
        links: [],
        persoonsgegevens: {
          geslacht: "man"
        },
        vgagegevens: {},
      },
    });
    const rules = computed(() => {
      return {
          adres: {
            gemeente: {
              required,
            },
            straat: {
              required
            },
            postcode: {
              required
            },
            nummer: {
              required
            }
          }
        }
    })
    const v$ = useVuelidate(rules, state, {$rewardEarly: true});
    return {...toRefs(state), v$};

  },
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
  computed: {
    invalidData() {
      return this.v$.$invalid || this.$refs.pers.v$.$invalid
    }
  },
  data() {
    return {
      aanvraag: {
        vgagegevens: {},
        persoonsgegevens: {},
      },
      defaultLid: {
        adres: {
          land: "BE",
        },
        email: "",
        gebruikersnaam: "",
        links: [],
        contacten: [],
        persoonsgegevens: {
          geslacht: "man"
        },
        vgagegevens: {
          voornaam: "",
          achternaam: "",
        },
      },
      groepseigenVelden: {},
      groep: null,
      groepsnummer: null,
      loading: false,
      invalidGemeente: false,
      invalidStraat: false,
      invalidNummer: false,
      invalidPostcode: false,
      watchable: false,
      changes: false,
      landen: [
        {label: "België", value: "BE"},
        {label: "Duitsland", value: "DE"},
        {label: "Frankrijk", value: "FR"},
        {label: "Groot-Brittannië", value: "GB"},
        {label: "Luxemburg", value: "LU"},
        {label: "Nederland", value: "NL"},
        {label: "Canada", value: "CA"},
      ],
    }
  },

  watch: {
    "lid.persoonsgegevens": {
      handler() {
        if (this.watchable) {
          this.aanvraag.persoonsgegevens = this.lid.persoonsgegevens;
          this.changes = true;
        }
      },
      deep: true,
    },
    "lid.vgagegevens": {
      handler() {
        if (this.watchable) {
          this.aanvraag.voornaam = this.lid.vgagegevens.voornaam;
          this.aanvraag.achternaam = this.lid.vgagegevens.achternaam;
          this.changes = true;
        }
      },
      deep: true,
    },
    "lid.adres": {
      handler: function () {
        if (this.watchable) {
          this.aanvraag.adres = this.lid.adres;
          this.changes = true;
        }
      },
      deep: true,
    },
    "lid.contacten": {
      handler: function () {
        if (this.watchable) {
          this.aanvraag.contacten = this.lid.contacten;
          this.changes = true;
        }
      },
      deep: true,
    },
    "lid.email": {
      handler: function () {
        if (this.watchable) {
          this.aanvraag.email = this.lid.email;
          this.changes = true;
        }
      }
    },
    "lid.opmerkingen": {
      handler: function () {
        if (this.watchable) {
          this.aanvraag.opmerkingen = this.lid.opmerkingen;
          this.changes = true;
        }
      }
    },
  },

  mounted() {
    this.loading = true;
    this.groepsnummer = this.$route.params.groep;
    this.aanvraag.geboortedatum = new Date(2010, 10, 10);

    if (this.groepsnummer) {
      this.getGroepData();
    }

    setTimeout(() => {
      this.lid = Object.assign({}, this.defaultLid);
      this.voegAdresToe();
    }, 1000);

    setTimeout(() => {
      this.watchable = true;
      this.loading = false;
    }, 2000);

  },

  methods: {
    check() {
      this.$refs.pers.v$.$commit();
      this.v$.$touch();
    },

    opslaan() {
      this.$refs.pers.v$.$commit();

      this.checkStraat();
      this.checkGemeente();
      this.checkPostcode();
      this.checkNummer();

      this.v$.$touch();
      if (this.v$.$invalid || this.$refs.pers.v$.$invalid || !this.isAdresValid()) {
        this.$toast.add({
          severity: "warn",
          summary: "Wijzigingen",
          detail: "Kan nog niet opslaan. Er zijn nog fouten vastgesteld in het formulier.",
          life: 3000,
        });
        return;
      }

      this.aanvraag.groepsEigenGegevens = this.groepseigenVelden;
      this.aanvraag.groepsnummer = this.groepsnummer;
      this.aanvraag.geboortedatum = new Date(this.aanvraag.geboortedatum).toISOString().slice(0, 10);
      this.aanvraag.verminderdlidgeld = this.lid.vgagegevens.verminderdlidgeld;
      this.aanvraag.persoonsgegevens.geslacht = this.lid.persoonsgegevens.geslacht;

      console.log(this.aanvraag);

      RestService.saveAanvraag(this.aanvraag)
        .then(res => {
          if (res.status === 204) {
            this.$store.commit('setNaamKandidaatLid', this.aanvraag.voornaam)
            this.$router.push({name: 'LidWordenVerstuurd', params: { groep: this.groepsnummer } })
          }
        })
    },

    veranderLand() {
      this.lid.adres.postcode = "";
      this.lid.adres.gemeente = "";
      this.lid.adres.straat = "";
      this.lid.adres.nummer = "";
      this.lid.adres.bus = "";
    },

    voegAdresToe() {
      this.lid.adres = {
        land: "BE",
      };
    },

    checkGemeente() {
      this.invalidGemeente = !this.lid.adres.gemeente;
    },

    checkStraat() {
      this.invalidStraat = !this.lid.adres.straat;
    },

    checkPostcode() {
      this.invalidPostcode = !this.lid.adres.postcode;
    },

    checkNummer() {
      this.invalidNummer = !this.lid.adres.nummer;
    },

    isAdresValid() {
      return !this.invalidGemeente && !this.invalidStraat && !this.invalidNummer && !this.invalidPostcode
    },

    clearInvalidForm(type) {
      if (type === 'gemeente') {
        this.invalidGemeente = false;
      } else {
        this.invalidStraat = false;
      }
    },

    getGroepData() {
      RestService.getGroepOpNummer(this.groepsnummer)
        .then(res => {
          this.groep = res.data;
          if (this.groep) {
            RestService.getGroepseigenGegevens(this.groepsnummer)
              .then(res => {
                this.groepseigenVelden = res.data;
              }).catch(error => {
              this.loading = false;
              console.log(error);
            })
          }
          this.groepseigenVelden = res.data.groepseigenGegevens
          this.loading = false;
        }).catch(error => {
        console.log(error);
        this.loading = false;
      })
    }
  },
};
</script>

<style scoped>
</style>
