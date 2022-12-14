import {reactive} from "@vue/reactivity";
import {computed, onMounted} from "vue";
import RestService from "@/services/api/RestService";
import rechtenService from "@/services/rechten/rechtenService";
import {useStore} from "vuex";

export default {

    dashboardSpace() {
        const store = useStore();
        const state = reactive({
            showLoader: false,
            gebruiker: null,
            snelNaarItems: [],
            menuItems: [
                {
                    label: "Mijn gegevens",
                    condition: true,
                    icon: "far fa-user",
                    link: "Profiel",
                    internal: true,
                },
                {
                    label: "Individuele steekkaart",
                    condition: true,
                    icon: "far fa-notes-medical",
                    link: "IndividueleSteekkaart",
                    internal: true,
                },
                {
                    label: "Communicatievoorkeuren",
                    condition: true,
                    icon: "far fa-satellite-dish",
                    link: "Communicatievoorkeuren",
                    internal: true,
                },
                {
                    label: "Leden",
                    condition: "ledenlijst",
                    icon: "far fa-users",
                    link: "Ledenlijst",
                    internal: true,
                },
                {
                    label: "Ledenaantallen",
                    condition: "groepen",
                    icon: "far fa-chart-area",
                    link: "Ledenaantallen",
                    internal: true,
                },
                {
                    label: "Groep",
                    condition: "groepen",
                    icon: "far fa-cogs",
                    link: "Groepsinstellingen",
                    internal: true,
                },
                {
                    label: "Lidaanvragen",
                    condition: "aanvragen",
                    icon: "far fa-address-book",
                    link: "Aanvragen",
                    internal: true,
                },
                // {
                //   label: "Verzekeringen",
                //   condition: true,
                //   icon: "far fa-umbrella",
                //   link: "https://vz.scoutsengidsenvlaanderen.be",
                //   internal: false,
                // },
            ],
        })

        onMounted(() => {
            RestService.getWebsites()
                .then(res => {
                    state.snelNaarItems = res.data.websites;
                }).catch(error => {
                console.log(error);
                console.log('geen websites kunnen ophalen')
            })
        })

        const dashboardItems = computed(() => {
            return state.menuItems.filter(obj => {
                if (obj.condition === "groepen") {
                    return rechtenService.hasAccessToGroepen();
                }
                return obj.condition === true || rechtenService.hasPermission(obj.condition);
            });
        })

        const naam = computed(() => {
            return store.getters.profiel.vgagegevens.voornaam;
        })


        return {
            state,
            dashboardItems,
            naam
        }
    }

}
