import {reactive} from "@vue/reactivity";
import DateUtil from "@/services/dates/DateUtil";
import {computed, onMounted, watch} from "vue";
import {useStore} from "vuex";
import rechtenService from "@/services/rechten/rechtenService";
import useEmitter from "@/services/utils/useEmitter";
import RestService from "@/services/api/RestService";
import {useToast} from "primevue/usetoast";
import {useRouter} from "vue-router";
import {helpers, minValue, required} from "@vuelidate/validators";
import {useVuelidate} from "@vuelidate/core";

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
    },

    activiteitenDialogSpace(props) {
        const toast = useToast();
        const emitter = useEmitter();

        const state = reactive({
            geselecteerdeFuncties: [],
            activiteit: {
                van: new Date(),
                tot: new Date(),
                omschrijving: "",
                prijs: 0,
                functies: [],
                groep: props.groep
            },
            defaultActiviteit: {
                van: new Date(),
                tot: new Date(),
                omschrijving: "",
                prijs: 0,
                functies: [],
                groep: props.groep
            },

            activiteitOpslaan: false
        });

        const rules = {
            activiteit: {
                van: {
                    required: helpers.withMessage('Startdatum is verplicht', required)
                },
                tot: {
                    required: helpers.withMessage('Einddatum is verplicht', required)
                },
                prijs: {
                    required: helpers.withMessage('Prijs is verplicht', required),
                    minValue: helpers.withMessage('Prijs mag niet 0 zijn', minValue(1))
                },
            },
        }

        const openDialog = computed(
            () => {
                return props.dialogVisible;
            },
        )

        watch(
            () => props.dialogVisible,
            () => {
                if (props.teBewerkenActiviteit) {
                    state.activiteit = Object.assign({}, props.teBewerkenActiviteit);
                    state.activiteit.functies = [];
                    props.teBewerkenActiviteit.functies.forEach(activiteitsFunctie => {
                        props.functies.forEach(functie => {
                            if (activiteitsFunctie.id === functie.id) {
                                state.activiteit.functies.push(functie);
                            }
                        })
                    })
                    state.activiteit.van = new Date(props.teBewerkenActiviteit.van);
                    state.activiteit.tot = new Date(props.teBewerkenActiviteit.tot);
                } else {
                    state.activiteit = Object.assign({}, state.defaultActiviteit);
                }
            },
            {deep: true}
        )

        const formatteerDatum = (datum) => {
            return DateUtil.formatteerDatum(datum);
        }

        const opslaan = () => {
            v.value.$touch();
            if (v.value.$invalid) {
                state.loading = false;
                toast.add({
                    severity: "warn",
                    summary: "Wijzigingen",
                    detail: "Kan nog niet opslaan. Er zijn nog fouten vastgesteld in het formulier.",
                    life: 3000,
                });
                return;
            }

            state.isLoadingActiviteiten = true;
            state.activiteit.van = DateUtil.formatteerDatumVoorApi(state.activiteit.van);
            state.activiteit.tot = DateUtil.formatteerDatumVoorApi(state.activiteit.tot);
            state.activiteit.groep = props.groep;

            if (state.activiteit.id) {
                activiteitAanpassen();
            } else {
                activiteitOpslaan();
            }

            setTimeout(() => {
                state.activiteit = Object.assign({}, state.defaultActiviteit);
            }, 1000)
        }

        const activiteitOpslaan = () => {
            state.activiteitOpslaan = true;
            state.activiteit.van = new Date(state.activiteit.van);
            state.activiteit.tot = new Date(state.activiteit.tot);
            RestService.activiteitOpslaan(state.activiteit).then(res => {
                if (res.status === 200) {
                    toast.add({
                        severity: "success",
                        summary: "Nieuwe activiteit",
                        detail: "Nieuwe activiteit opgeslagen",
                        life: 2000,
                    });
                }
            }).finally(() => {
                state.activiteitOpslaan = false;
                emitter.emit('activiteitenOphalen')
            })
        }

        const activiteitAanpassen = () => {
            state.activiteitOpslaan = true;
            state.activiteit.van = new Date(state.activiteit.van);
            state.activiteit.tot = new Date(state.activiteit.tot);
            RestService.activiteitAanpassen(state.activiteit).then(res => {
                if (res.status === 200) {
                    toast.add({
                        severity: "success",
                        summary: "Wijzigingen",
                        detail: "Wijzigingen activiteit opgeslagen",
                        life: 2000,
                    });
                }
            }).finally(() => {
                state.activiteitOpslaan = false;
                emitter.emit('activiteitenOphalen')
            })
        }

        const v = useVuelidate(rules, state);

        const gesorteerdeFuncties = () => {
            props.functies.sort(function (a, b) {
                if (a.beschrijving < b.beschrijving) {
                    return -1;
                }
                if (a.beschrijving > b.beschrijving) {
                    return 1;
                }
                return 0;
            })
            return props.functies;
        }


        return {
            state,
            v,
            openDialog,
            formatteerDatum,
            opslaan,
            gesorteerdeFuncties
        }
    }
}
