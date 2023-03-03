import {reactive} from "@vue/reactivity";
import rechtenService from "@/services/rechten/rechtenService";
import {computed, onBeforeUpdate, onMounted, ref} from "vue";
import {useRouter} from "vue-router";
import {useStore} from "vuex";
import useEmitter from "@/services/utils/useEmitter";

export default {
    lidBovenBalkSpace(props) {
        const router = useRouter();
        const store = useStore();
        const emitter = useEmitter();
        const menu = ref(null);

        const state = reactive({
            lid: props.modelValue,
            eigenProfiel: props.eigenProfiel,
            changes: props.changes,
            nieuwLid: props.nieuwLid,
            filteredMenuItems: [],
            menuItems: [
                {
                    label: "Communicatievoorkeuren",
                    icon: "fal fa-satellite-dish",
                    link: "Communicatievoorkeuren",
                },
                {
                    label: "Individuele steekkaart",
                    icon: "fal fa-notes-medical",
                    link: "IndividueleSteekkaart",
                },
                {
                    label: "Nieuw Lid",
                    icon: "far fa-user-plus",
                    link: "lidToevoegen",
                },
                {
                    label: "Broer/Zus toevoegen",
                    icon: "far fa-user-friends",
                    link: "broerZusToevoegen",
                },
                {
                    label: "Mail lid",
                    icon: "far fa-envelope",
                    link: "Mail",
                },
                {
                    label: "Stop alle functies",
                    icon: "far fa-times",
                    link: "stopAlleFuncties",
                },
            ],
        })

        const heeftToegang = (label) => {
            switch (label) {
                case "Communicatievoorkeuren":
                    return state.eigenProfiel && !state.nieuwLid;
                case "Individuele steekkaart":
                    return rechtenService.heeftSteekkaartLeesrecht(state.lid, "steekkaart") || state.eigenProfiel && !state.nieuwLid;
                case "Nieuw Lid":
                    return rechtenService.hasAccess("nieuw lid");
                case "Broer/Zus toevoegen":
                    return rechtenService.hasAccess("nieuw lid");
                case "Mail lid":
                    return !state.eigenProfiel;
                case "Stop alle functies":
                    return rechtenService.magAlleFunctiesStoppen(state.lid) || state.eigenProfiel;
                default:
                    return false;
            }
        }

        const toggle = (event) => {
            menu.value.toggle(event);
        }

        const filterMenuItems = () => {
            state.filteredMenuItems = [];
            state.menuItems.forEach(item => {
                if (heeftToegang(item.label)) {
                    state.filteredMenuItems.push(item);
                }
            })
        }

        const broerZusToevoegen = () => {
            let defaultLid = {
                vgagegevens: {
                    achternaam: state.lid.vgagegevens.achternaam
                },
                persoonsgegevens: {
                    verminderdlidgeld: false,
                    beperking: false,
                    geslacht: 'vrouw',
                    gsm: state.lid.persoonsgegevens.gsm
                },
                verbondsgegevens: {
                    lidgeldbetaald: false
                },
                email: state.lid.email,
                adressen: state.lid.adressen,
                contacten: state.lid.contacten,
                functies: []
            }
            store.commit('setBroerZusLid', defaultLid);
            router.push({
                name: "lidToevoegen",
            });
        }

        const gaNaar = (link) => {
            if (link === 'profiel') {
                router.push({name: 'Profiel', params: {id: "profiel"}})
            } else if (link === 'stopAlleFuncties') {
                emitter.emit('stopAlleFuncties');
            } else if (link === 'broerZusToevoegen') {
                broerZusToevoegen();
            } else {
                router.push({name: link})
            }
        }

        const vorigLid = () => {
            let index = store.getters.leden.indexOf(state.lid.id);
            if (index === 0) {
                index = store.getters.leden.length - 1;
            } else {
                index--;
            }
            router.push({name: "Lid", params: {id: store.getters.leden[index]}})
        }

        const volgendLid = () => {
            let index = store.getters.leden.indexOf(state.lid.id);
            if (index === store.getters.leden.length - 1) {
                index = 0;
            } else {
                index++;
            }
            router.push({name: "Lid", params: {id: store.getters.leden[index]}})
        }

        const volledigeNaam = computed({
            get() {
                if (state.lid.vgagegevens.voornaam && state.lid.vgagegevens.achternaam) {
                    return (
                        state.lid.vgagegevens.voornaam + " " + state.lid.vgagegevens.achternaam
                    );
                } else {
                    return ""
                }
            }
        })

        const legeLedenLijst = computed({
            get() {
                return store.getters.leden.length !== 0
            }
        })

        const kanOpslaan = computed({
            get() {
                return rechtenService.kanOpslaan(state.lid);
            }
        })

        const kanNieuwLidAanmaken = computed({
            get() {
                return rechtenService.hasAccess("nieuw lid")
            }
        })

        onMounted(() => {
            state.lid = props.modelValue;
            filterMenuItems();
        })

        onBeforeUpdate(() => {
            if (!props.nieuwLid) {
                state.lid = props.modelValue;
                filterMenuItems();
            }
        })

        return {
            state,
            volledigeNaam,
            menu,
            toggle,
            gaNaar,
            legeLedenLijst,
            kanOpslaan,
            kanNieuwLidAanmaken,
            volgendLid,
            vorigLid
        }

    }
}
