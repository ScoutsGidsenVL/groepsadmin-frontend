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
import ConfirmDialog from "primevue/confirmdialog";
import ConfirmationService from "primevue/confirmationservice";
import InputText from "primevue/inputtext";
import Keycloak from "keycloak-js";
import getClient from "./services/keycloak/keycloak-config";
import {library} from "@fortawesome/fontawesome-svg-core";
import {fas, faUser} from "@fortawesome/free-solid-svg-icons";
import mitt from "mitt";
import VueGoogleMaps from "@fawmi/vue-google-maps";
import "vue3-loading-overlay/dist/vue3-loading-overlay.css";
import Loading from "vue3-loading-overlay";
import Column from "primevue/column";
import ColumnGroup from "primevue/columngroup";
import VueRouter from 'vue-router';
import Breadcrumb from "primevue/breadcrumb";
import "./assets/fonts/Museo Sans/stylesheet.css";
import Menu from "primevue/menu";


import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import "primevue/resources/themes/saga-blue/theme.css"; //theme
import "primevue/resources/primevue.min.css"; //core css
import "primeicons/primeicons.css"; //icons
import "primeflex/primeflex.css";
import "./assets/global.scss";
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import ToastService from "primevue/toastservice";
import GoogleMaps from "@/services/google/GoogleMaps";
import DataTable from "primevue/datatable";
import ProgressSpinner from "primevue/progressspinner";
import InputSwitch from 'primevue/inputswitch';
import RadioButton from "primevue/radiobutton";
import VueClickOutsideElement from 'vue-click-outside-element'


library.add(fas, faUser);

// add primevue components
const app = createApp(App);
app.use(VueRouter);
app.use(fas);
app.use(library);
app.use(ToastService);
app.use(store);
app.use(ConfirmationService);
app.use(Loading);
app.use(router);
app.use(VueClickOutsideElement);
app.use(VueGoogleMaps, {
    load: {
        key: GoogleMaps.getKey(),
    },
});
app.use(PrimeVue, {
    locale: {
        accept: "Ja",
        reject: "Nee",
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
app.component("dataTable", DataTable);
app.component("column", Column);
app.component("ColumnGroup", ColumnGroup);
app.component("Spinner", ProgressSpinner);
app.component("Dialog", Dialog);
app.component("Breadcrumb", Breadcrumb);
app.component("Menu", Menu);
app.component("InputSwitch", InputSwitch);
app.component("RadioButton", RadioButton);

app.directive('click-outside', {
    mounted(el, binding) {
        el.clickOutsideEvent = function(event) {
            if (!(el === event.target || el.contains(event.target))) {
                binding.value(event, el);
            }
        };
        document.body.addEventListener('click', el.clickOutsideEvent);
    },
    unmounted(el) {
        document.body.removeEventListener('click', el.clickOutsideEvent);
    }
});

const emitter = mitt();
app.config.globalProperties.emitter = emitter;

// In het geval van het publiek formulier gaan we keycloak overslaan
if (window.location.pathname.startsWith("/groepsadmin/frontend/formulier/")) {
  app.mount("#app");
} else {
    let initOptions = getClient();
    const keycloak = Keycloak(initOptions);

    keycloak.init({onLoad: initOptions.onLoad}).then((auth) => {
        if (!auth) {
            window.location.reload();
        } else {
            store.commit("setToken", keycloak.token);
            store.commit("setNaam", keycloak.idTokenParsed.name);
            store.commit(
                "setGebruikersnaam",
                keycloak.idTokenParsed.preferred_username
            );
            store.dispatch("getProfiel");
            store.dispatch("getGroepen");
            store.dispatch("getFuncties");
            store.dispatch("getKolommen");
            store.dispatch("getLinks");
            app.mount("#app");
        }

        //Token Refresh
        setInterval(() => {
            keycloak
                .updateToken(70)
                .then((refreshed) => {
                    if (refreshed) {
                        store.commit("setToken", keycloak.token);
                    }
                })
                .catch(() => {
                    console.log("Failed to refresh token");
                });
        }, 6000);
    });
}
