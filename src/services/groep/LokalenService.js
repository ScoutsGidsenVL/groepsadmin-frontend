import {reactive} from "@vue/reactivity";
import {computed} from "vue";
import rechtenService from "@/services/rechten/rechtenService";

export default {

    lokalenSpace(props) {
        const state = reactive({
            zichtbareMarker: "",
        })

        const toonMarker = (index) => {
            state.zichtbareMarker = index;
        }

        const geselecteerdeGroep = computed(() =>  {
            return props.groep;
        })

        const heeftToegang = (sectie) => {
            return rechtenService.hasPermission(sectie);
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

            if (props.groep.adressen) {
                let bestaandPostadres = false;
                for (const adres of props.groep.adressen) {
                    if (adres.postadres) {
                        bestaandPostadres = true;
                    }
                }

                if (!bestaandPostadres) {
                    nieuwAdres.postadres = true;
                }
            } else {
                nieuwAdres.postadres = true;
                props.groep.adressen = [];
            }
            props.groep.adressen.push(nieuwAdres);
        }

        return {
            state,
            toonMarker,
            geselecteerdeGroep,
            heeftToegang,
            voegAdresToe
        }
    }


}
