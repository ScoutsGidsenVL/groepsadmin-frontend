import {reactive} from "@vue/reactivity";
import {computed, onMounted} from "vue";
import RestService from "@/services/api/RestService";
import rechtenService from "@/services/rechten/rechtenService";
import {useStore} from "vuex";
import {useRouter} from "vue-router";

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
                    label: "Mijn individuele steekkaart",
                    condition: true,
                    icon: "far fa-notes-medical",
                    link: "IndividueleSteekkaart",
                    internal: true,
                },
                {
                    label: "Mijn communicatievoorkeuren",
                    condition: true,
                    icon: "far fa-satellite-dish",
                    link: "Communicatievoorkeuren",
                    internal: true,
                },
                {
                    label: "Ledenlijst",
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
                return obj.condition === true || rechtenService.hasPermission(obj.condition) || rechtenService.hasAccess(obj.condition);
            });
        })

        const naam = computed(() => {
            if (store.getters.profiel) {
                return store.getters.profiel.vgagegevens.voornaam;
            } else {
                return "";
            }
        })


        return {
            state,
            dashboardItems,
            naam
        }
    },

    dashBoardBlockSpace(props) {

        const router = useRouter();
        const store = useStore();

        const goto = (link) => {
            top.window.onbeforeunload = null;
            if (!props.internal) {
                window.location.href = link;
            } else {
                if (link === "Profiel") {
                    router.push({name: "Lid", params: {id: "profiel"}});
                } else if (link === "IndividueleSteekkaart") {
                    router.push({name: link, params: {id: store.getters.profiel.id }});
                } else {
                    router.push({name: link});
                }
            }
        }

        return {
            goto
        }
    }
}
