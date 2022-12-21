import {reactive} from "@vue/reactivity";
import {onMounted, watch} from "vue";
import RestService from "@/services/api/RestService";
import {onBeforeRouteLeave, useRoute, useRouter} from "vue-router";
import {useStore} from "vuex";
import {useToast} from "primevue/usetoast";
import Telefoonnummer from "@/services/google/Telefoonnummer";
import {useConfirm} from "primevue/useconfirm";

export default {

    steekkaartSpace() {
        const route = useRoute();
        const store = useStore();
        const toast = useToast();
        const router = useRouter();
        const confirm = useConfirm();

        const state = reactive({
            id: "",
            eigenProfiel: false,
            isLoadingGegevens: false,
            error: false,
            steekkaart: null,
            activeIndex: [0],
            lid: {
                voornaam: "",
                achternaam: "",
                email: "",
                gebruikersnaam: "",
                links: [],
                persoonsgegevens: {},
                vgagegevens: {},
                verbondsgegevens: {},
            },
            steekkaartWaarden: null,
            layout: null,
            layoutGroepen: [],
            changes: false,
            errors: {},
        })

        onMounted(() => {
            state.id = route.params.id;
            state.isLoadingGegevens = true;
            RestService.getIndividueleSteekkaart(state.id)
                .then((response) => {
                    state.steekkaartWaarden = response.data.gegevens.waarden;
                    state.layout = response.data.gegevens.schema;
                    if (state.id === store.getters.profiel.id || state.id === "profiel" ) {
                        state.eigenProfiel = true;
                    }
                    sorteer();
                    groepeer();
                    setActiveIndexen();
                    state.changes = false;
                    checkForm();
                    state.isLoadingGegevens = false;
                })
                .catch(error => {
                    if (error.response.status === 403) {
                        toast.add({
                            severity: "error",
                            summary: error.response.data.titel,
                            detail: error.response.data.beschrijving,
                            life: 8000,
                        });
                        router.push({name: "Dashboard"});
                    }
                });

            RestService.getLid(state.id).then((response) => {
                state.lid = response.data;
            });
        })

        watch(
            () => state.steekkaartWaarden,
                (oldValue, newValue) => {
                    if (newValue) {
                        state.changes = true;
                        checkForm();
                    }
                }, { deep: true })

        const sorteer = () => {
            state.layout.sort(function (a, b) {
                if (a.sort < b.sort) return -1;
                if (a.sort > b.sort) return 1;
                return 0;
            });
        }

        const setHeader = (groep) => {
            return groep.label;
        }

        const changeValue = (veld, waarde) => {
            state.changes = true;
            state.steekkaartWaarden[veld] = waarde;
            checkForm();
        }

        const groepeer = () => {
            let tempGroup = [];
            state.layoutGroepen = [];

            state.layout.forEach((value, index) => {
                if (value.type === "groep") {
                    if (tempGroup.length === 0) {
                        tempGroup.push(value);
                    } else {
                        state.layoutGroepen.push(tempGroup);
                        tempGroup = [];
                        tempGroup.push(value);
                    }
                } else {
                    tempGroup.push(value);
                    if (index === state.layout.length - 1) {
                        state.layoutGroepen.push(tempGroup);
                    }
                }
            });
        }

        const setActiveIndexen = () => {
            state.layoutGroepen.forEach((groep, index) => {
                state.activeIndex.push(index);
            });
        }

        const save = () => {
            let data = {
                gegevens: {},
            };
            checkForm();
            if (Object.keys(state.errors).length === 0) {
                state.isLoadingGegevens = true;
                data.gegevens.waarden = state.steekkaartWaarden;
                RestService.saveIndividueleSteekkaart(state.id, data)
                    .then((response) => {
                        state.steekkaartWaarden = response.data.gegevens.waarden;
                        state.layout = response.data.gegevens.schema;
                        if (state.id === store.getters.profiel.id) {
                            state.eigenProfiel = true;
                        }
                        sorteer();
                        groepeer();
                        setActiveIndexen();
                        toast.add({
                            severity: "success",
                            summary: "Wijzigingen",
                            detail: "Wijzigingen opgeslagen",
                            life: 3000,
                        });
                        state.isLoadingGegevens = false;
                    })
                    .catch(() => {
                        state.isLoadingGegevens = false;
                        toast.add({
                            severity: "error",
                            summary: "Wijzigingen",
                            detail: "Er is iets misgegaan bij het opslaan",
                            life: 8000,
                        });
                    })
                    .finally(() => {
                        state.isLoadingGegevens = false;
                    });
            } else {
                toast.add({
                    severity: "warn",
                    summary: "Wijzigingen",
                    detail: "Er zijn nog fouten vastgesteld in het formulier",
                    life: 8000,
                });
            }
        }

        const checkForm = () => {
            state.errors = {};
            state.layout.forEach((veld) => {
                if (veld.verplicht) {
                    if (!state.steekkaartWaarden[veld.id]) {
                        state.errors[veld.id] = {
                            invalid: true,
                            message: "Dit veld is verplicht"
                        };
                    }
                }
                if (veld.label === "Telefoon/gsm:" && state.steekkaartWaarden[veld.id]) {
                    let reformattedNumber = Telefoonnummer.formatNumber(state.steekkaartWaarden[veld.id]);
                    let valid =  Telefoonnummer.validateNumber(reformattedNumber);
                    if (!valid) {
                        state.errors[veld.id] = {
                            invalid: true,
                            message: "Geen geldig telefoonnummer"
                        };
                    }
                }
            });
        }

        onBeforeRouteLeave((to, from, next) => {
            if (state.changes) {
                confirm.require({
                    message:
                        "Je hebt niet opgeslagen wijzigingen. Ben je zeker dat je wil doorgaan?",
                    header: "Wijzigingen",
                    icon: "pi pi-exclamation-triangle",
                    accept: () => {
                        next();
                    },
                    reject: () => {
                        next(false);
                    },
                });
            } else {
                next();
            }
        })

        return {
            state,
            save,
            changeValue,
            setHeader,
        }
    }

}
