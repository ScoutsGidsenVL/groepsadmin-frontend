import {reactive} from "@vue/reactivity";
import DateUtil from "@/services/dates/DateUtil";
import {onMounted} from "vue";
import {useStore} from "vuex";
import rechtenService from "@/services/rechten/rechtenService";
import useEmitter from "@/services/utils/useEmitter";
import RestService from "@/services/api/RestService";
import restService from "@/services/api/RestService";
import {useToast} from "primevue/usetoast";

export default {

    activiteitenSpace() {
        const store = useStore();
        const emitter = useEmitter();
        const toast = useToast();

        const state = reactive({
            groepEnfuncties: [],
            functies: [],
            dialogMessage: "",
            dialogHeader: "",
            isLoadingActiviteiten: false,
            activiteitDialog: false,
            messageDialog: false,
            selectedGroep: {},
            groepenArray: [],
            contactenLaden: false,
            activiteiten: [],
            teVerwijderenActiviteitId: null,
            home: {icon: 'pi pi-home', to: '/dashboard'},
            breadcrumbItems: [
                {
                    label: 'activiteiten'
                },
            ],

        })

        const registreerAanwezigheden = (activiteitId) => {
            console.log(activiteitId)
        }

        const bevestigVerwijderen = () => {
            state.isLoadingActiviteiten = true;

            restService.verwijderActiviteit(state.teVerwijderenActiviteitId).then(() => {
                state.activiteiten.forEach((activiteit) => {
                    if (activiteit.id === state.teVerwijderenActiviteitId) {
                        state.activiteiten.splice(state.activiteiten.indexOf(activiteit), 1);
                    }
                })
                state.isLoadingActiviteiten = true
                toast.add({
                    severity: "success",
                    summary: "Verwijderen activiteit",
                    detail: "Activiteit verwijderd",
                    life: 2000,
                });
            }).finally(() => {
                state.messageDialog = false;
                state.isLoadingActiviteiten = false
            })
        }

        const annuleerVerwijderen = () => {
            state.teVerwijderenActiviteitId = null;
            state.messageDialog = false;
        }

        const wijzigActiviteit = (activiteit) => {
            console.log(activiteit)
        }

        const verwijderActiviteit = (activiteitId) => {
            state.messageDialog = true;
            state.dialogMessage = "Je staat op het punt om deze activiteit te verwijderen. </br> Dit kan niet ongedaan worden gemaakt. Ben je zeker?"
            state.dialogHeader = "Activiteit verwijderen?"
            state.teVerwijderenActiviteitId = activiteitId;
        }


        const veranderGroep = (groep) => {
            state.selectedGroep = groep;
            getActiviteiten();
        }

        const functiesEnGroepen = () => {
            state.groepEnfuncties = [];
            store.getters.groepen.forEach(groep => {
                if (rechtenService.hasPermission('functies.' + groep.groepsnummer)) {
                    store.getters.functies.forEach(functie => {
                        if (functie.type === 'verbond' && (functie.groeperingen[0].naam !== "Leiding" && functie.groeperingen[0].naam !== "Anderen")) {
                            state.functies.push(functie);
                        }
                    });
                }
            });
        }

        const getActiviteiten = () => {
            state.isLoadingActiviteiten = true
            restService.getActiviteiten(state.selectedGroep.groepsnummer).then(res => {
                if (res.status === 200) {
                    state.activiteiten = res.data.activiteiten;
                }
            }).finally(() => {
                state.isLoadingActiviteiten = false
            })
        }

        const activiteitOpslaan = (activiteit) => {
            RestService.activiteitOpslaan(activiteit).then(res => {
                if (res.status === 200) {
                    state.isLoadingActiviteiten = true;
                    state.activiteitDialog = false;
                    toast.add({
                        severity: "success",
                        summary: "Nieuwe activiteit",
                        detail: "Nieuwe activiteit opgeslagen",
                        life: 2000,
                    });
                    state.activiteiten.push(res.data);
                }
            }).finally(() => {
                state.isLoadingActiviteiten = false;
            })
        }

        const formatteerPeriode = (activiteit) => {
            return DateUtil.formatteerDatum(activiteit.van) + " - " + DateUtil.formatteerDatum(activiteit.tot);
        }

        const activiteitAanpassen = (activiteit) => {
            RestService.activiteitAanpassen(activiteit).then(res => {
                if (res.status === 200) {
                    state.isLoadingActiviteiten = true;
                    state.activiteitDialog = false;
                    toast.add({
                        severity: "success",
                        summary: "Wijzigingen",
                        detail: "Wijzigingen activiteit opgeslagen",
                        life: 2000,
                    });
                }
            }).finally(() => {
                state.isLoadingActiviteiten = false;
            })
        }

        onMounted(() => {
            emitter.on("activiteitOpslaan", (event) => {
                state.isLoadingActiviteiten = true;
                event.activiteit.van = DateUtil.formatteerDatumVoorApi(event.activiteit.van);
                event.activiteit.tot = DateUtil.formatteerDatumVoorApi(event.activiteit.tot);
                event.activiteit.groep = state.selectedGroep;

                if (event.activiteit.id) {
                    activiteitAanpassen(event.activiteit);
                } else {
                    activiteitOpslaan(event.activiteit);
                }
            })

            functiesEnGroepen();
            state.selectedGroep = store.getters.groepen[0];
            store.getters.groepen.forEach((groep) => {
                state.groepenArray.push({
                    label: groep.naam + " - " + groep.id,
                    value: groep,
                });
            });

            getActiviteiten();
        })

        return {
            state,
            registreerAanwezigheden,
            wijzigActiviteit,
            verwijderActiviteit,
            veranderGroep,
            bevestigVerwijderen,
            annuleerVerwijderen,
            formatteerPeriode
        }
    }
}
