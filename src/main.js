import {createApp} from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import PrimeVue from "primevue/config";
import Dialog from "primevue/dialog";
import Card from "primevue/card";
import Checkbox from "primevue/checkbox";
import Button from "primevue/button";
import Toast from "primevue/toast";
import Dropdown from "primevue/dropdown";
import Accordion from "primevue/accordion";
import AccordionTab from "primevue/accordiontab";
import ConfirmPopup from "primevue/confirmpopup";
import ConfirmDialog from 'primevue/confirmdialog';
import ConfirmationService from 'primevue/confirmationservice';
import InputText from "primevue/inputtext";
import Keycloak from "keycloak-js";
import getClient from "./services/keycloak/keycloak-config";
import {library} from "@fortawesome/fontawesome-svg-core";
import {fas, faUser} from "@fortawesome/free-solid-svg-icons";
import mitt from 'mitt';
import VueGoogleMaps from '@fawmi/vue-google-maps'

import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import "primevue/resources/themes/saga-blue/theme.css"; //theme
import "primevue/resources/primevue.min.css"; //core css
import "primeicons/primeicons.css"; //icons
import "primeflex/primeflex.css";
import "./assets/global.scss";
import "./assets/fonts/Museo Sans/stylesheet.css";
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import ToastService from "primevue/toastservice";
import GoogleMaps from "@/services/google/GoogleMaps";


library.add(fas, faUser);

// add primevue components
const app = createApp(App);
app.use(store);
app.use(Dropdown)
app.use(ConfirmPopup)
app.use(ConfirmDialog)
app.use(ConfirmationService)
app.use(Toast)
app.use(Accordion)
app.use(AccordionTab)
app.use(router);
app.use(VueGoogleMaps, {load: {
    key: GoogleMaps.getKey()
    }});
app.use(PrimeVue, {
    locale: {
        accept: 'Ja',
        reject: 'Nee',
        dayNames: [
            "Zondag",
            "Maandag",
            "Dinsdag",
            "Woensdag",
            "Donderdag",
            "Vrijdag",
            "Zaterdag",
        ],
        dayNamesShort: ["Zon", "Maa", "Din", "Woe", "Don", "Vri", "Zat"],
        dayNamesMin: ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"],
        monthNames: [
            "Januari",
            "Februari",
            "Maart",
            "April",
            "Mei",
            "Juni",
            "Juli",
            "Augustus",
            "September",
            "Oktober",
            "November",
            "December",
        ],
        monthNamesShort: [
            "Jan",
            "Feb",
            "Maa",
            "Apr",
            "Mei",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Okt",
            "Nov",
            "Dec",
        ],
    },
});
app.use(Dialog);
app.use(InputText);
app.use(Card);
app.use(Button);
app.use(Checkbox);
app.use(fas);
app.use(library);
app.use(Toast);
app.use(ToastService);

app.component("icon", FontAwesomeIcon);
app.component("card", Card);
app.component("Button", Button);
app.component("toast", Toast);
app.component("inputText", InputText);
app.component("checkbox", Checkbox);
app.component("dropdown", Dropdown);
app.component("accordion", Accordion);
app.component("accordionTab", AccordionTab);
app.component("confirmPopup", ConfirmPopup);
app.component("confirmDialog", ConfirmDialog);
app.component("toast", Toast);

const emitter = mitt();
app.config.globalProperties.emitter = emitter;

let initOptions = getClient();
const keycloak = Keycloak(initOptions);

keycloak.init({onLoad: initOptions.onLoad}).then((auth) => {
    if (!auth) {
        window.location.reload();
    } else {
        store.commit("setToken", keycloak.token)
        store.commit("setNaam", keycloak.idTokenParsed.name);
        store.commit("setGebruikersnaam", keycloak.idTokenParsed.preferred_username);
        store.dispatch("getGroepen");
        store.dispatch("getFuncties");
        store.dispatch("getKolommen");
        app.mount("#app")
    }

    //Token Refresh
    setInterval(() => {
        keycloak.updateToken(70).then((refreshed) => {
            if (refreshed) {
                store.commit("setToken", keycloak.token)
            }
        }).catch(() => {
            console.log('Failed to refresh token');
        });
    }, 6000)

});
