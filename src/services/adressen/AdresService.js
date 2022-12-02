import {reactive} from "@vue/reactivity";
import {useConfirm} from "primevue/useconfirm";
import rechtenService from "@/services/rechten/rechtenService";
import {onUpdated} from "@vue/runtime-core";

export default {
    adresSpace(props) {
        const confirm = useConfirm();
        const state = reactive({
            adressen: props.modelValue.adressen,
            invalid: false,
            landen: [
                {label: "België", value: "BE"},
                {label: "Duitsland", value: "DE"},
                {label: "Frankrijk", value: "FR"},
                {label: "Groot-Brittannië", value: "GB"},
                {label: "Luxemburg", value: "LU"},
                {label: "Nederland", value: "NL"},
                {label: "Canada", value: "CA"},
            ],
        })

        onUpdated(() => {
            state.adressen = props.modelValue.adressen;
        })

        const remove = (index) => {
            confirm.require({
                message: "Ben je zeker dat je dit adres wil verwijderen?",
                header: "Adres verwijderen",
                icon: "pi pi-exclamation-triangle",
                accept: () => {
                    state.adressen.splice(index, 1);
                },
                reject: () => {
                    confirm.close();
                },
            });
        }

        const zetPostadres = (index) => {
            for (const adres of state.adressen) {
                adres.postadres = false;
            }
            state.adressen[index].postadres = true;
        }

        const veranderLand = (index) => {
            state.adressen[index].postcode = "";
            state.adressen[index].gemeente = "";
            state.adressen[index].straat = "";
            state.adressen[index].nummer = "";
            state.adressen[index].bus = "";
        }

        const setHeader = (adres) => {
            return adres.gemeente
                ? adres.straat + " " + adres.nummer + ", " + adres.gemeente
                : "Nieuw adres";
        }

        const heeftToegang = (sectie) => {
            return rechtenService.canBeShowed(props.modelValue, sectie);
        }

        const voegAdresToe = () => {
            let nieuwAdres = {
                land: "BE",
                postadres: false,
                omschrijving: "",
                id: "tempadres" + Date.now(),
                bus: "",
                gemeente: "",
                postcode: "",
            };

            if (state.adressen) {
                let bestaandPostadres = false;
                for (const adres of state.adressen) {
                    if (adres.postadres) {
                        bestaandPostadres = true;
                    }
                }

                if (!bestaandPostadres) {
                    nieuwAdres.postadres = true;
                }
            } else {
                nieuwAdres.postadres = true;
                state.adressen = [];
            }
            state.adressen.push(nieuwAdres);
        }

        if (state.adressen && state.adressen.length === 0) {
            voegAdresToe();
        }

        return {
            state,
            remove,
            voegAdresToe,
            setHeader,
            veranderLand,
            zetPostadres,
            heeftToegang
        }
    }
}
