import {reactive} from "@vue/reactivity";
import DateUtil from "@/services/dates/DateUtil";
import {onMounted} from "vue";
import {useStore} from "vuex";
import rechtenService from "@/services/rechten/rechtenService";
import useEmitter from "@/services/utils/useEmitter";
import RestService from "@/services/api/RestService";
import {useToast} from "primevue/usetoast";
import {useRouter} from "vue-router";

export default {

    activiteitenSpace() {
        const store = useStore();
        const emitter = useEmitter();
        const toast = useToast();
        const router = useRouter();

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
            teBewerkenActiviteit: null,
            home: {icon: 'pi pi-home', to: '/dashboard'},
            breadcrumbItems: [
                {
                    label: 'activiteiten'
                },
            ],

        })

        const registreerAanwezigheden = (activiteitId) => {
            router.push({name: "Aanwezigheden", params: {activiteit: activiteitId}});
        }

        const bevestigVerwijderen = () => {
            state.isLoadingActiviteiten = true;

            RestService.verwijderActiviteit(state.teVerwijderenActiviteitId).then(() => {
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
            state.teBewerkenActiviteit = activiteit;
            state.activiteitDialog = true;
        }

        const close = () => {
            state.teBewerkenActiviteit = null;
            state.activiteitDialog = false;
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
                        if (functie.groeperingen[0].naam !== "Leiding" && functie.groeperingen[0].naam !== "Anderen") {
                            state.functies.push(functie);
                        }
                    });
                }
            });
        }

        const getActiviteiten = () => {
            state.isLoadingActiviteiten = true
            RestService.getActiviteiten(state.selectedGroep.groepsnummer).then(res => {
                if (res.status === 200) {
                    state.activiteiten = res.data.activiteiten;
                }
            }).finally(() => {
                state.isLoadingActiviteiten = false
            })
        }

        const formatteerPeriode = (activiteit) => {
            return DateUtil.formatteerDatum(activiteit.van) + " - " + DateUtil.formatteerDatum(activiteit.tot);
        }

        const formatteerFunctieOmschrijving = (functies) => {
            let functiesString = '';
            functies.forEach((functie) => {
                functiesString = functiesString + functie.beschrijving
                if (functies.indexOf(functie) < functies.length - 1) {
                    functiesString = functiesString + ", "
                }
            })
            return functiesString;
        }

        onMounted(() => {
            functiesEnGroepen();
            state.selectedGroep = store.getters.groepen[0];
            store.getters.groepen.forEach((groep) => {
                state.groepenArray.push({
                    label: groep.naam + " - " + groep.id,
                    value: groep,
                });
            });
            emitter.on("activiteitenOphalen", () => {
                getActiviteiten();
                state.activiteitDialog = false
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
            formatteerPeriode,
            formatteerFunctieOmschrijving,
            close
        }
    }
}
