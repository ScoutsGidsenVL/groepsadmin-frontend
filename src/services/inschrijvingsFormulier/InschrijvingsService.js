import {computed, reactive} from "@vue/reactivity";
import useVuelidate from "@vuelidate/core";
import {helpers, required} from "@vuelidate/validators";
import {onMounted, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import RestService from "@/services/api/RestService";
import {useToast} from "primevue/usetoast";
import {useStore} from "vuex";

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

        })

        const rules = computed(() => {
            return {
                lid: {
                    adres: {
                        gemeente: {
                            required: helpers.withMessage("Gemeente is verplicht", required)
                        },
                        straat: {
                            required: helpers.withMessage("Straat is verplicht", required)
                        },
                        postcode: {
                            required: helpers.withMessage("Postcode is verplicht", required)
                        },
                        nummer: {
                            required: helpers.withMessage("Nummer is verplicht", required)
                        }
                    }
                }
            }
        })

        const opslaan = () => {
            state.loading = true;
            v.value.$touch();
            if (v.value.$invalid) {
                state.loading = false;
                toast.add({
                    severity: "warn",
                    summary: "Wijzigingen",
                    detail: "Kan nog niet opslaan. Er zijn nog fouten vastgesteld in het formulier.",
                    life: 3000,
                });
            } else {
                state.aanvraag.groepsEigenGegevens = state.groepseigenVelden;
                state.aanvraag.groepsnummer = state.groepsnummer;
                state.aanvraag.verminderdlidgeld = state.lid.vgagegevens.verminderdlidgeld;
                state.aanvraag.persoonsgegevens.geslacht = state.lid.persoonsgegevens.geslacht;
                state.aanvraag.geboortedatum = new Date(state.lid.vgagegevens.geboortedatum).toISOString().slice(0, 10);



                RestService.saveAanvraag(state.aanvraag)
                    .then(res => {
                        if (res.status === 204) {
                            state.loading = false;
                            store.commit('setNaamKandidaatLid', state.aanvraag.voornaam)
                            router.push({name: 'LidWordenVerstuurd', params: {groep: state.groepsnummer}})
                        }
                    }).catch((error) => {
                    toast.add({
                        severity: "warn",
                        summary: error.response.data.titel,
                        detail: error.response.data.beschrijving,
                        life: 3000,
                    });
                }).finally(() => {
                    state.loading = false;
                })
            }
        }

        const veranderLand = () => {
            state.lid.adres.postcode = "";
            state.lid.adres.gemeente = "";
            state.lid.adres.straat = "";
            state.lid.adres.nummer = "";
            state.lid.adres.bus = "";
        }

        const voegAdresToe = () => {
            state.lid.adres = {
                land: "BE",
            };
        }

        const clearInvalidForm = (type) => {
            if (type === 'gemeente') {
                state.invalidGemeente = false;
            } else {
                state.invalidStraat = false;
            }
        }

        const getGroepData = () => {
            RestService.getGroepOpNummer(state.groepsnummer)
                .then(res => {
                    state.groep = res.data;
                    if (state.groep) {
                        RestService.getGroepseigenGegevens(state.groepsnummer)
                            .then(res => {
                                state.groepseigenVelden = res.data;
                            }).catch(error => {
                            state.loading = false;
                            console.log(error);
                        })
                    }
                    state.groepseigenVelden = res.data.groepseigenGegevens
                    state.loading = false;
                }).catch(error => {
                toast.add({
                    severity: "warn",
                    summary: error.response.data.titel,
                    detail: error.response.data.beschrijving,
                    life: 3000,
                });
                state.loading = false;
            })
        }

        watch(
            () => state.lid.persoonsgegevens,
            () => {
                if (state.watchable) {
                    state.aanvraag.persoonsgegevens = state.lid.persoonsgegevens;
                    state.changes = true;
                }
            }, {deep: true})

        watch(
            () => state.lid.adres,
            () => {
                if (state.watchable) {
                    state.aanvraag.adres = state.lid.adres;
                    if (state.aanvraag.adres.bus) {
                        state.aanvraag.adres.bus = state.aanvraag.adres.bus.toUpperCase();
                    }
                    state.changes = true;
                }
            }, {deep: true})

        watch(
            () => state.lid.vgagegevens,
            () => {
                if (state.watchable) {
                    state.aanvraag.voornaam = state.lid.vgagegevens.voornaam;
                    state.aanvraag.achternaam = state.lid.vgagegevens.achternaam;
                    if (!state.lid.vgagegevens.geboortedatum) {
                        state.lid.vgagegevens.geboortedatum = new Date(new Date().setFullYear(new Date().getFullYear() - 5))
                    }
                    state.aanvraag.geboortedatum = new Date(state.lid.vgagegevens.geboortedatum).toISOString().slice(0, 10);
                    state.changes = true;
                }
            }, {deep: true})

        watch(
            () => state.lid.contacten,
            () => {
                if (state.watchable) {
                    state.aanvraag.contacten = state.lid.contacten;
                    state.changes = true;
                }
            }, {deep: true})

        watch(
            () => state.lid.email,
            () => {
                if (state.watchable) {
                    state.aanvraag.email = state.lid.email;
                    state.changes = true;
                }
            }, {deep: true})

        watch(
            () => state.lid.opmerkingen,
            () => {
                if (state.watchable) {
                    state.aanvraag.opmerkingen = state.lid.opmerkingen;
                    state.changes = true;
                }
            }, {deep: true})

        onMounted(() => {
            state.loading = true;
            state.groepsnummer = route.params.groep;
            state.aanvraag.geboortedatum = new Date(new Date().setFullYear(new Date().getFullYear() - 5));
            state.lid.vgagegevens.geboortedatum = new Date(new Date().setFullYear(new Date().getFullYear() - 5));

            if (state.groepsnummer) {
                getGroepData();
            }

            setTimeout(() => {
                state.lid = Object.assign({}, state.defaultLid);
                voegAdresToe();
            }, 1000);

            setTimeout(() => {
                state.watchable = true;
                state.loading = false;
            }, 2000);
        })


        const v = useVuelidate(rules, state);


        return {
            state,
            v,
            opslaan,
            veranderLand,
            clearInvalidForm,

        }
    }
}
