import { reactive } from "@vue/reactivity";
import { computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import restService from "@/services/api/RestService";
import CurrencyUtil from "@/services/utils/CurrencyUtil";
import DateUtil from "@/services/dates/DateUtil";
import RestService from "@/services/api/RestService";
import { useToast } from "primevue/usetoast";
import rechtenService from "@/services/rechten/rechtenService";

export default {
  aanwezighedenSpace() {
    const toast = useToast();
    const route = useRoute();
    const state = reactive({
      columns: [
        { field: "voornaam", header: "Voornaam" },
        { field: "naam", header: "Achternaam" },
        { field: "prijs", header: "Prijs" },
        { field: "aantaldagen", header: "Aantal dagen" },
        { field: "dagprijs", header: "Dagprijs" },
      ],
      home: { icon: "pi pi-home", to: "/dashboard" },
      breadcrumbItems: [
        {
          label: "activiteiten",
          to: "/activiteiten",
        },
        {
          label: "aanwezigheden",
        },
      ],
      dialogMessage: "",
      dialogHeader: "",
      isLoadingAanwezigheden: false,
      messageDialog: false,
      aanwezigeLeden: [],
      teVerwijderenActiviteitId: null,
      selectedAanwezigheid: {},
      activiteit: {},
      leden: [],
      magActivteitBeheren: false,
    });

    const bewerkCell = (value) => {
      if (value.field === "prijs" || value.field === "aantaldagen") {
        let index = state.leden.indexOf(value.data);
        let update = false;

        if (value.field === "prijs") {
          if (state.leden[index].prijs != value.newValue) {
            state.leden[index].prijs = value.newValue;
            update = true;
          }
        } else if (value.field === "aantaldagen") {
          if (state.leden[index].aantaldagen != value.newValue) {
            state.leden[index].aantaldagen = value.newValue;
            update = true;
          }
        }

        if (update) {
          RestService.aanwezigheidAanpassen(state.leden[index])
            .then(() => {
              toast.add({
                severity: "success",
                summary: "Aanwezigheid aanpassen",
                detail:
                  "Aanwezigheid " +
                  state.leden[index].voornaam +
                  " " +
                  state.leden[index].naam +
                  " aangepast.",
                life: 2000,
              });
            })
            .finally(() => {
              state.messageDialog = false;
            });
          berekenDagprijs();
        }
      }
    };

    const sorteerLeden = computed(() => {
      state.leden = state.leden.sort(function (a, b) {
        if (a.voornaam < b.voornaam) {
          return -1;
        }
        if (a.voornaam > b.voornaam) {
          return 1;
        }
        return 0;
      });
      return state.leden;
    });

    const formatteerBedrag = (value) => {
      return CurrencyUtil.formateerBedrag(value);
    };

    const formatteerDatum = (value) => {
      return DateUtil.formatteerDatum(value);
    };

    const getActiviteit = () => {
      state.isLoadingAanwezigheden = true;
      restService
        .getActiviteit(route.params.activiteit)
        .then((res) => {
          state.activiteit = res.data;
          getAlleInAanmerkingKomendeLeden(res.data.id);
          berekenMagActivteitBeheren(res.data.groep);
        })
        .catch(() => {
          state.isLoadingAanwezigheden = false;
        });
    };

    const berekenDagprijs = () => {
      state.leden.forEach((lid) => {
        lid.dagprijs = formatteerBedrag(lid.prijs / lid.aantaldagen);
      });
    };

    const getAlleInAanmerkingKomendeLeden = (activiteitId) => {
      restService
        .getAlleInAanmerkingKomendeLeden(activiteitId)
        .then((res) => {
          state.leden = res.data.aanwezigen;
          berekenDagprijs();
        })
        .finally(() => {
          state.isLoadingAanwezigheden = false;
        });
    };

    const verwijderAanwezigheid = (aanwezigheidId) => {
      state.messageDialog = true;
      state.dialogMessage =
        "Je staat op het punt om deze aanwezige te verwijderen. </br> Dit kan niet ongedaan worden gemaakt. Ben je zeker?";
      state.dialogHeader = "Aanwezige verwijderen?";
      state.teVerwijderenAanwezigheidId = aanwezigheidId;
    };

    const bevestigVerwijderen = () => {
      state.isLoadingAanwezigheden = true;

      RestService.verwijderAanwezigheid(state.teVerwijderenAanwezigheidId)
        .then(() => {
          state.leden.forEach((aanwezigheid) => {
            if (aanwezigheid.id === state.teVerwijderenAanwezigheidId) {
              state.leden.splice(state.leden.indexOf(aanwezigheid), 1);
            }
          });
          state.isLoadingAanwezigheden = true;
          toast.add({
            severity: "success",
            summary: "Verwijderen aanwezigheid",
            detail: "Aanwezigheid verwijderd",
            life: 2000,
          });
        })
        .finally(() => {
          state.messageDialog = false;
          state.isLoadingAanwezigheden = false;
        });
    };

    const annuleerVerwijderen = () => {
      state.teVerwijderenAanwezigheidId = null;
      state.messageDialog = false;
    };

    const berekenMagActivteitBeheren = (groep) => {
      restService.getGroepOpNummer(groep).then((res) => {
        state.magActivteitBeheren = rechtenService.kanWijzigen(res.data);
      });
    };

    watch(
      () => route.params.aanwezigheid,
      () => {
        getActiviteit();
      }
    );

    onMounted(() => {
      getActiviteit();
    });

    return {
      state,
      bewerkCell,
      formatteerBedrag,
      formatteerDatum,
      sorteerLeden,
      verwijderAanwezigheid,
      bevestigVerwijderen,
      annuleerVerwijderen,
    };
  },
};
