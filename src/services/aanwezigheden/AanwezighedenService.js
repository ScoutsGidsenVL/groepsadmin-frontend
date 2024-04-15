import {reactive} from "@vue/reactivity";
import {computed, onMounted, watch} from "vue";
import {useRoute} from "vue-router";
import restService from "@/services/api/RestService";
import CurrencyUtil from "@/services/utils/CurrencyUtil";
import DateUtil from "@/services/dates/DateUtil";

export default {

    aanwezighedenSpace() {
        const route = useRoute();
        const state = reactive({
            columns: [
                { field: 'voornaam', header: 'Voornaam' },
                { field: 'naam', header: 'Achternaam' },
                { field: 'prijs', header: 'Prijs' },
                { field: 'aantal', header: 'Aantal dagen' },
                { field: 'betaald', header: 'Volledig betaald' }
            ],
            home: {icon: 'pi pi-home', to: '/dashboard'},
            breadcrumbItems: [
                {
                    label: 'activiteiten',
                    to: '/activiteiten'
                },
                {
                    label: 'aanwezigheden'
                },
            ],
            isLoadingAanwezigheden:  false,
            aanwezigeLeden: [],
            selectedAanwezigheid: {},
            activiteit: {},
            leden: [
                {
                    id: 1,
                    voornaam: 'John',
                    naam: 'Doe',
                    functie: {
                        omschrijving: 'Kapoenen',
                    },
                    aantal: 10,
                    prijs: 25
                },
                {
                    id: 2,
                    voornaam: 'Jane',
                    naam: 'Smith',
                    functie: {
                        omschrijving: 'Kapoenen',
                    },
                    aantal: 9,
                    prijs: 25
                },
                {
                    id: 1,
                    voornaam: 'John',
                    naam: 'Doe',
                    functie: {
                        omschrijving: 'Jin',
                    },
                    aantal: 10,
                    prijs: 25
                },
                {
                    id: 4,
                    voornaam: 'Jane',
                    naam: 'Smith',
                    functie: {
                        omschrijving: 'Jin',
                    },
                    aantal: 9,
                    prijs: 25
                },
            ],
        })

        const bewerkCell = (value) => {
            if (value.field === "prijs") {
                let index = state.leden.indexOf(value.data);
                state.leden[index].prijs = value.newValue;
            }
            if (value.field === "aantal") {
                let index = state.leden.indexOf(value.data);
                state.leden[index].aantal = value.newValue;
            }
        }

        const sorteerLeden = computed (() => {
            state.leden = state.leden.sort(function (a, b) {
                if (a.voornaam < b.voornaam) {
                    return -1;
                }
                if (a.voornaam > b.voornaam) {
                    return 1;
                }
                return 0;
            })
            return state.leden;
        })

        const formatteerBedrag = (value) => {
            return CurrencyUtil.formateerBedrag(value);
        };

        const formatteerDatum = value => {
            return DateUtil.formatteerDatum(value);
        }

        const getActiviteit = () => {
            restService.getActiviteit(route.params.activiteit)
                .then((res) => {
                    state.activiteit = res.data;
                    getAlleInAanmerkingKomendeLeden(res.data.id);
                })
        };

        const getAlleInAanmerkingKomendeLeden = (activiteitId) => {
            restService.getAlleInAanmerkingKomendeLeden(activiteitId)
                .then(res => {
                    console.log(res);
                })
        }

        watch(
            () =>  route.params.activiteit,
            () => {
                getActiviteit();
            }
        )

        onMounted(() => {
            getActiviteit();
        })

        return {
            state,
            bewerkCell,
            formatteerBedrag,
            formatteerDatum,
            sorteerLeden
        }
    }
}
