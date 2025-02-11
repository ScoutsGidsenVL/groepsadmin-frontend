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
            attestDialog: false,
            messageDialog: false,
            geenActiviteitenDialog: false,
            selectedGroep: {},
            groepenArray: [],
            contactenLaden: false,
            activiteiten: [],
            teVerwijderenActiviteitId: null,
            teBewerkenActiviteit: null,
            geselecteerdeActiviteiten: [],
            home: {icon: 'pi pi-home', to: '/dashboard'},
            breadcrumbItems: [
                {
                    label: 'activiteiten'
                },
            ],

        })

        const isWaardeTrue = (value) => {
            return value === '<input type="checkbox" disabled checked/>';
        }

        const isWaardeFalse = (value) => {
            return value === '<input type="checkbox" disabled/>';
        }

        const voegLedenToe = (leden) => {
            if (state.geselecteerdeActiviteiten.length > 0) {
                state.geselecteerdeActiviteiten.forEach((activiteit) => {
                    leden.forEach((lid) => {

                        const aanwezigheid = {
                            activiteitid: activiteit.id,
                            lidid: lid.id,
                            voornaam: lid.voornaam,
                            naam: lid.achternaam,
                            prijs: activiteit.prijs
                        };

                        RestService.voegLidToeAanActiviteit(activiteit.id, aanwezigheid).then(() => {
                            toast.add({
                                severity: "success",
                                summary: "Toegevoegd aan activiteit",
                                detail: "Lid " + lid.voornaam + " " + lid.achternaam + " toegevoegd aan " + activiteit.omschrijving,
                                life: 2000,
                            });
                        }).finally(() => {
                            state.messageDialog = false;
                            state.isLoadingActiviteiten = false
                        })
                    })
                  })
            } else {
                state.dialogMessage = "Gelieve eerst activiteiten te selecteren";
                state.dialogHeader = "Geen activiteit geselecteerd";
                state.geenActiviteitenDialog = true;
            }
            return;
        }

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
            state.geenActiviteitenDialog = false;
            state.attestDialog = false;
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
                    state.activiteiten.forEach(activiteit => {
                        activiteit.werkjaar = activiteit.werkjaar + "-" + (activiteit.werkjaar+1);
                        activiteit.prijs = Number.parseFloat(activiteit.prijs).toFixed(2);
                        const aantalDagen = Math.round(
                            ((new Date(activiteit.tot).getTime() - new Date(activiteit.van).getTime())
                            / (1000 * 3600 * 24)) + 1);
                        const dagprijs = activiteit.prijs / aantalDagen;
                        activiteit.dagprijs = Number.parseFloat(dagprijs).toFixed(2);
                    });
                }
            }).finally(() => {
                state.isLoadingActiviteiten = false
            })
        }

        const formatteerPeriode = (activiteit) => {
            return DateUtil.formatteerDatum(activiteit.van) + " - " + DateUtil.formatteerDatum(activiteit.tot);
        }

        onMounted(() => {
            functiesEnGroepen();
            store.getters.groepen.forEach((groep) => {
                if (groep.verantwoordelijkheden && groep.verantwoordelijkheden.includes('leiding')) {
                    state.groepenArray.push({
                        label: groep.naam + " - " + groep.id,
                        value: groep,
                    });
                    if (!state.selectedGroep.naam) {
                        state.selectedGroep = groep;
                        getActiviteiten();
                    }
                }
            });
            emitter.on("activiteitenOphalen", () => {
                getActiviteiten();
                state.activiteitDialog = false
            });
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
            isWaardeTrue,
            isWaardeFalse,
            voegLedenToe,
            close
        }
    },

    activiteitenDialogSpace(props) {
        const toast = useToast();
        const emitter = useEmitter();

        const state = reactive({
            activiteit: {
                van: new Date(),
                tot: new Date(),
                omschrijving: "",
                prijs: 0,
                groep: props.groep
            },
            defaultActiviteit: {
                van: new Date(),
                tot: new Date(),
                omschrijving: "",
                prijs: 0,
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
                    minValue: helpers.withMessage('Prijs mag niet 0 zijn', minValue(0.01))
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
            delete state.activiteit.werkjaar;
            state.activiteit.van = DateUtil.formatteerDatumVoorApi(state.activiteit.van);
            state.activiteit.tot = DateUtil.formatteerDatumVoorApi(state.activiteit.tot);
            state.activiteit.groep = props.groep.groepsnummer;

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

        return {
            state,
            v,
            openDialog,
            formatteerDatum,
            opslaan
        }
    },

    attestenDialogSpace(props) {
        const toast = useToast();
        const emitter = useEmitter();

        const state = reactive({
            groep: props.groep,
            attest: {
                kbo: "",
                certnaam: "",
                certadres: "",
                certpostcode: "",
                certgemeente: "",
                certkbo: ""
            }
        });

        const rules = {
            attest: {
                kbo: {
                    required: helpers.withMessage('Pseudeo-KBO-nummer is verplicht', required)
                },
                certnaam: {
                    required: helpers.withMessage('Naam certificerende instantie is verplicht', required)
                },
                certadres: {
                    required: helpers.withMessage('Adres certificerende instantie is verplicht', required),
                },
                certpostcode: {
                    required: helpers.withMessage('Postcode certificerende instantie is verplicht', required),
                },
                certgemeente: {
                    required: helpers.withMessage('Gemeente certificerende instantie is verplicht', required),
                },
                certkbo: {},
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
                state.group = props.groep;
            },
            {deep: true}
        )

        const genereerAttest = () => {
            console.log("genereerAttest");
            v.value.$touch();
            if (v.value.$invalid) {
                state.loading = false;
                toast.add({
                    severity: "warn",
                    summary: "Wijzigingen",
                    detail: "Kan nog niet indienen. Er zijn nog fouten vastgesteld in het formulier.",
                    life: 3000,
                });
                return;
            } else {
                const attestParams = new URLSearchParams(state.attest).toString();
                RestService.getFiscaalAttest(props.groep.groepsnummer, attestParams).then((res) => {
                    if (res.data) {
                        const contentDisposition = res.headers['content-disposition'];
                        let fileName = 'fiscaalattest.zip';
                        if (contentDisposition) {
                            const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
                            if (fileNameMatch.length === 2)
                                fileName = fileNameMatch[1];
                        }
                        let obj = {};
                        let blob = new Blob([res.data], { type: "application/zip" });
                        obj.fileUrl = window.URL.createObjectURL(blob);
                        obj.title = fileName;
                        downloadFile(obj);
                    }
                }).catch((error) => {
                    console.log(error);
                }).finally(() => {
                    emitter.emit('close')
                })
            } 
        }

        const downloadFile = (obj) => {
            let a = document.createElement("a");
            a.href = obj.fileUrl;
            a.download = obj.title;
            document.body.appendChild(a);
            a.click();
        }

        const v = useVuelidate(rules, state);

        return {
            state,
            v,
            openDialog,
            genereerAttest
        }
    }
}
