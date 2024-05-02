import {reactive} from "@vue/reactivity";
import {onMounted, watch} from "vue";
import {useVuelidate} from "@vuelidate/core";
import {onBeforeRouteLeave, useRoute, useRouter} from "vue-router";
import useEmitter from "@/services/utils/useEmitter";
import {useToast} from "primevue/usetoast";
import {useStore} from "vuex";
import rechtenService from "@/services/rechten/rechtenService";
import RestService from "@/services/api/RestService";
import DateUtil from "@/services/dates/DateUtil";

let _ = require('lodash');


export default {
    lidToevoegenSpace() {
        const rules = {}
        const emitter = useEmitter();
        const toast = useToast();
        const store = useStore();
        const router = useRouter();
        const route = useRoute();

        const setGeboorteDatum = () => {
            if (state.lid && state.lid.vgagegevens)
                state.lid.vgagegevens.geboortedatum = new Date(state.lid.vgagegevens.geboortedatum);
        }

        const state = reactive({
            home: {icon: 'pi pi-home', to: '/dashboard'},
            breadcrumbItems: [
                {
                    label: 'lid'
                },
                {
                    label: 'Nieuw lid'
                },
            ],
            watchable: false,
            changes: false,
            eigenProfiel: false,
            type: "",
            id: "",

            changed: true,
            loadingLid: false,
            lid: {
                email: null,
                links: [],
                adressen: [],
                functies: [],
                persoonsgegevens: {
                    geslacht: "vrouw"
                },
                vgagegevens: {
                    voornaam: null,
                    achternaam: null,
                },
                verbondsgegevens: {},
            },
            gesorteerdeFuncties: {},
            groepseigenVelden: {}
        })

        watch(
            () => route.params,
            () => {
                store.commit('setGoedTeKeurenLid', null)
                store.commit('setBroerZusLid', null)
                state.lid = {
                    email: null,
                    links: [],
                    adressen: [],
                    functies: [],
                    persoonsgegevens: {
                        geslacht: "vrouw"
                    },
                    vgagegevens: {
                        voornaam: null,
                        achternaam: null,
                    },
                    verbondsgegevens: {},
                }
            }
        )

        watch(
            () => state.lid,
            () => {
                if (state.watchable && state.lid) {
                    state.changes = true;
                }
            },
            {deep: true}
        )

        onMounted(() => {
            emitter.on('veranderFunctie', (event) => {
                state.lid.functies = event.functies;
                state.changes = true;
            })

            if (store.getters.goedTeKeurenLid) {
                state.lid = store.getters.goedTeKeurenLid;
                state.groepsnummer = store.getters.goedTeKeurenLid.groepsnummer;
            } else if (store.getters.broerZusLid && Object.keys(store.getters.broerZusLid).length !== 0) {
                state.lid = store.getters.broerZusLid;
                state.groepsnummer = store.getters.broerZusLid.groepsnummer;
            }

            if (state.lid.adressen.length > 0) {
                state.lid.adressen[0].postadres = true;
            }

            if (!state.lid.vgagegevens.geboortedatum) {
                state.lid.vgagegevens.geboortedatum = new Date(new Date().setFullYear(new Date().getFullYear() - 8));
            }

            setGeboorteDatum();

            setTimeout(() => {
                state.watchable = true;
            }, 1500);
        })

        const magFunctiesToevoegen = () => {
            return rechtenService.canBeShowed(store.getters.profiel, 'functies.')
        }

        const v = useVuelidate(rules, state);

        onBeforeRouteLeave((to, from, next) => {
            store.commit('setGoedTeKeurenLid', null)
            store.commit('setBroerZusLid', null)
            next();
        })

        // const filterGroepsEigenVelden = () => {
        //     state.groepseigenVelden = Object.fromEntries(Object.entries(state.lid.groepseigenVelden).filter(([key]) => state.lid.groepseigenVelden[key].schema.length > 0));
        // }

        const opslaan = () => {
            state.loadingLid = true;

            let counter = 0;
            _.forEach(state.lid.adressen, function (adres) {
                counter++;
                _.forEach(state.lid.contacten, function (contact) {
                    if (adres.straat === contact.adres.straat &&
                        adres.nummer === contact.adres.nummer &&
                        adres.postcode === contact.adres.postcode &&
                        adres.gemeente === contact.adres.gemeente) {
                        adres.id = 'tempadres_' + counter;
                        contact.adres = adres.id;
                        contact.id = 'tempcontact_' + counter
                    } else if (adres.id === contact.adres) {
                        adres.id = 'tempadres_' + counter;
                        contact.adres = adres.id;
                    }
                })
            })

            _.forEach(state.lid.adressen, function (adres) {
                if (adres.id.length > 28) {
                    adres.id = 'tempadres';
                }
            })

            _.forEach(state.lid.contacten, function (contact) {
                if (contact.id.length > 28) {
                    contact.id = 'tempcontact';
                    contact.adressen = null;
                }
            })

            state.lid.verbondsgegevens = null;

            v.value.$touch();

            if (v.value.$invalid) {
                state.changes = false;
                toast.add({
                    severity: "warn",
                    summary: "Wijzigingen",
                    detail: "Kan nog niet opslaan. Er zijn nog fouten vastgesteld in het formulier.",
                    life: 3000,
                });
                state.loadingLid = false;
                return;
            }

            if (!state.lid.functies || (state.lid.functies && state.lid.functies.length === 0)) {
                toast.add({
                    severity: "warn",
                    summary: "Wijzigingen",
                    detail: "Kan nog niet opslaan. Je moet een functie toekennen.",
                    life: 3000,
                });
                state.loadingLid = false;
                return;
            }

            if (state.lid.vgagegevens.geboortedatum) {
                let geboortedatum = new Date(state.lid.vgagegevens.geboortedatum);
                geboortedatum.setHours(2);
                state.lid.vgagegevens.geboortedatum = DateUtil.formatteerDatumVoorApi(geboortedatum);
                console.log(state.lid.vgagegevens.geboortedatum)
            }

            if (!state.lid.vgagegevens.beperking) {
                state.lid.vgagegevens.beperking = false;
            }

            if (!state.lid.vgagegevens.verminderdlidgeld) {
                state.lid.vgagegevens.verminderdlidgeld = false;
            }

            RestService.saveNieuwLid(state.lid).then(res => {
                if (res.status === 201) {
                    toast.add({
                        severity: "success",
                        summary: "Nieuw lid",
                        detail: "Nieuw lid opgeslagen",
                        life: 3000,
                    });
                    state.changes = false;
                    if (state.lid.id) {
                        RestService.verwijderAanvraag(state.lid.id).then(result => {
                            if (result.status === 200) {
                                router.push({name: "Lid", params: {id: res.data.id}});
                            }
                        }).finally(() => {
                            store.commit('setGoedTeKeurenLid', null)
                            store.commit('setBroerZusLid', null)
                            router.push({name: "Lid", params: {id: res.data.id}});
                        });
                    } else {
                        store.commit('setGoedTeKeurenLid', null)
                        store.commit('setBroerZusLid', null)
                        router.push({name: "Lid", params: {id: res.data.id}});
                    }
                }
            }).catch(error => {
                toast.add({
                    severity: "warn",
                    summary: error.response.data.titel,
                    detail: error.response.data.beschrijving,
                    life: 3000,
                });
            }).finally(() => {
                state.changes = false;
                state.loadingLid = false;
                store.commit('setGoedTeKeurenLid', null)
                store.commit('setBroerZusLid', null)
            })

        }

        const voegFunctieToe = (obj) => {
            let bestaandeFunctie = false;

            if (state.lid && !state.lid.functies) {
                state.lid.functies = [];
            }

            for (let [index, val] of state.lid.functies.entries()) {
                if (val.functie === obj.functie.functie && val.groep === obj.groepsnummer && !val.einde) {
                    bestaandeFunctie = true;
                    state.lid.functies.splice(index, 1);
                }
            }

            if (!bestaandeFunctie) {
                state.lid.functies.push(obj.functie);
            }
        }

        // const updateFuncties = ({functie, groepsnummer}) =>  {
        //     let groep = store.getters.groepByNummer(groepsnummer);
        //     let lid = {
        //         functies: [
        //             {
        //                 functie: functie.id,
        //                 groep: groep.id,
        //                 einde: new Date().toISOString().slice(0, 10),
        //                 begin: functie.begin
        //             }
        //         ]
        //     };
        //     RestService.updateLid(state.lid.id, state.lid).then(res => {
        //         if (res.status === 200) {
        //             toast.add({
        //                 severity: "success",
        //                 summary: "Wijzigingen",
        //                 detail: "Functie is gestopt",
        //             });
        //             state.lid = res.data;
        //             sorteerFuncties();
        //         }
        //     });
        // }

        return {
            state,
            v,
            magFunctiesToevoegen,
            voegFunctieToe,
            opslaan,
        }
    }
}
