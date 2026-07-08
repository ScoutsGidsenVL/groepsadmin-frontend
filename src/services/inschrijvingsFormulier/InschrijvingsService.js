import { reactive } from "@vue/reactivity";
import useVuelidate from "@vuelidate/core";
import { nextTick, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import RestService from "@/services/api/RestService";
import { useToast } from "primevue/usetoast";
import { useStore } from "vuex";
import DateUtil from "@/services/dates/DateUtil";
import moment from "moment";

export default {
  inschrijvingsSpace() {
    const route = useRoute();
    const toast = useToast();
    const store = useStore();
    const router = useRouter();

    const state = reactive({
      aanvraag: {
        vgagegevens: {},
        persoonsgegevens: {},
      },
      groepseigenVelden: {},
      groep: null,
      groepsnummer: null,
      loading: false,
      watchable: false,
      changes: false,
      lid: {
        adres: {
          land: "BE",
        },
        email: "",
        gebruikersnaam: "",
        links: [],
        contacten: [],
        persoonsgegevens: {
          geslacht: "man",
          beperking: false,
        },
        vgagegevens: {
          voornaam: "",
          achternaam: "",
        },
      },
    });

    const rules = {};

    const opslaan = () => {
      state.loading = true;
      v.value.$touch();
      if (v.value.$invalid) {
        state.loading = false;
        toast.add({
          severity: "warn",
          summary: "Wijzigingen",
          detail:
            "Kan nog niet opslaan. Er zijn nog fouten vastgesteld in het formulier.",
          life: 3000,
        });
      } else {
        state.aanvraag.groepsEigenGegevens = state.groepseigenVelden;
        state.aanvraag.groepsnummer = state.groepsnummer;
        state.aanvraag.verminderdlidgeld =
          state.lid.vgagegevens.verminderdlidgeld;
        state.aanvraag.persoonsgegevens.geslacht =
          state.lid.persoonsgegevens.geslacht;
        state.aanvraag.beperking = state.lid.vgagegevens.beperking;

        var geboortedatum = new Date(state.lid.vgagegevens.geboortedatum);
        if (isNaN(geboortedatum)) {
          geboortedatum = moment(
            state.lid.vgagegevens.geboortedatum,
            "DD/MM/YYYY"
          ).toDate();
        }
        geboortedatum.setHours(2);
        state.aanvraag.geboortedatum = geboortedatum.toISOString();

        RestService.saveAanvraag(state.aanvraag)
          .then((res) => {
            if (res.status === 204) {
              store.commit("setNaamKandidaatLid", state.aanvraag.voornaam);
              router.push({
                name: "LidWordenVerstuurd",
                params: { groep: state.groepsnummer },
              });
            }
          })
          .catch((error) => {
            if (error && error.response && error.response.data) {
              toast.add({
                severity: "warn",
                summary: error.response.data.titel,
                detail: error.response.data.beschrijving,
                life: 3000,
              });
            } else {
              toast.add({
                severity: "error",
                summary: "Onverwachte fout",
                detail:
                  "Probeer het later opnieuw of contacteer groepsadmin@scoutsengidsenvlaanderen.be",
                life: 30000,
              });
            }
          })
          .finally(() => {
            state.loading = false;
          });
      }
    };

    const getGroepData = () => {
      RestService.getGroepOpNummer(state.groepsnummer)
        .then((res) => {
          if (res.data["publiek-inschrijven"] && !res.data["beeindigd"]) {
            state.groep = res.data;
          }
          state.groepseigenVelden = res.data.groepseigenGegevens;
          if (state.groep) {
            return RestService.getGroepseigenGegevens(state.groepsnummer).then(
              (res) => {
                state.groepseigenVelden = res.data;
              }
            );
          }
        })
        .catch((error) => {
          const data = error && error.response && error.response.data;
          toast.add({
            severity: "warn",
            summary: (data && data.titel) || "Fout",
            detail:
              (data && data.beschrijving) ||
              "Kon de groepsgegevens niet laden.",
            life: 3000,
          });
        })
        .finally(() => {
          state.loading = false;
        });
    };

    watch(
      () => state.lid.persoonsgegevens,
      () => {
        if (state.watchable) {
          state.aanvraag.persoonsgegevens = state.lid.persoonsgegevens;
          state.changes = true;
        }
      },
      { deep: true }
    );

    watch(
      () => state.lid.adres,
      () => {
        if (state.watchable) {
          state.aanvraag.adres = state.lid.adres;
          state.changes = true;
        }
      },
      { deep: true }
    );

    watch(
      () => state.lid.vgagegevens,
      () => {
        if (state.watchable) {
          state.aanvraag.voornaam = state.lid.vgagegevens.voornaam;
          state.aanvraag.achternaam = state.lid.vgagegevens.achternaam;
          if (!state.lid.vgagegevens.geboortedatum) {
            state.lid.vgagegevens.geboortedatum = new Date(
              new Date().setFullYear(new Date().getFullYear() - 5)
            );
          }
          state.aanvraag.geboortedatum = DateUtil.formatteerDatumVoorApi(
            state.lid.vgagegevens.geboortedatum
          );
          state.changes = true;
        }
      },
      { deep: true }
    );

    watch(
      () => state.lid.contacten,
      () => {
        if (state.watchable) {
          state.aanvraag.contacten = state.lid.contacten;
          state.changes = true;
        }
      },
      { deep: true }
    );

    watch(
      () => state.lid.email,
      () => {
        if (state.watchable) {
          state.aanvraag.email = state.lid.email;
          state.changes = true;
        }
      },
      { deep: true }
    );

    watch(
      () => state.lid.opmerkingen,
      () => {
        if (state.watchable) {
          state.aanvraag.opmerkingen = state.lid.opmerkingen;
          state.changes = true;
        }
      },
      { deep: true }
    );

    onMounted(() => {
      state.loading = true;
      state.groepsnummer = route.params.groep;
      state.aanvraag.geboortedatum = new Date(
        new Date().setFullYear(new Date().getFullYear() - 5)
      );
      state.lid.vgagegevens.geboortedatum = new Date(
        new Date().setFullYear(new Date().getFullYear() - 5)
      );

      if (state.groepsnummer) {
        getGroepData();
      }

      nextTick(() => {
        state.watchable = true;
      });
    });

    const v = useVuelidate(rules, state);

    return {
      state,
      v,
      opslaan,
    };
  },
};
